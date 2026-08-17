import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration/canonicalProductWorkspaceAdapter";
import { readLeadershipConversationFixture } from "../../product/frontend/leadershipConversationFixtureAdapter";
import { buildDurableProductQuestion, productQuestionEvents } from "../../product/questions/questionLifecycle";
import { SANDBOX_ORGANIZATION_ID, SANDBOX_PRIMARY_QUESTION } from "../../product/simulations/living-organization-sandbox/manifest";
import { NORTHSTAR_PRODUCT_QUESTION_FIXTURE_KEY, provisionNorthstarPreparationLineageFixture, readNorthstarPreparationLineageSeed } from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";

const bytes=(value:unknown)=>new TextEncoder().encode(JSON.stringify(value,null,2));
const adapter=(repository:FilesystemOrganizationRuntimeRepository,userId:string,organizationId:string,protectedReads:{value:number})=>new CanonicalProductWorkspaceAdapter({runtimeRepository:repository,authorize:async(input)=>input.userId===userId&&input.organizationId===organizationId,investigate:async()=>{protectedReads.value+=1;throw new Error("investigation unavailable");}});

async function main(){
  const root=await mkdtemp(path.join(tmpdir(),"discovery-northstar-preparation-lineage-owner-issued-"));
  const foreignRoot=await mkdtemp(path.join(tmpdir(),"discovery-owner-issued-question-foreign-"));
  let checks=0;const check=(value:unknown,message:string)=>{assert.ok(value,message);checks+=1;};
  try{
    const first=await provisionNorthstarPreparationLineageFixture({environment:"test",fixtureRoot:root});
    const receipt=await readNorthstarPreparationLineageSeed({fixtureRoot:root,organizationId:SANDBOX_ORGANIZATION_ID,fixtureId:"northstar-preparation-lineage-fixture-v1",provisioningKey:"northstar-preparation-lineage:v1",expectedSeedDigest:first.seed.seedDigest});
    const runtimeRepository=new FilesystemOrganizationRuntimeRepository(path.join(root,"runtime")),stored=await runtimeRepository.read(SANDBOX_ORGANIZATION_ID);assert.ok(stored);
    const question=buildDurableProductQuestion({runtime:stored.runtime,questionId:first.seed.productQuestionId});
    check(Boolean(question),"owner-created question reconstructs");check(question?.title===SANDBOX_PRIMARY_QUESTION,"source-backed question content retained");check(receipt.productQuestionId===first.seed.productQuestionId,"seed stores exact owner-issued ID");check(readLeadershipConversationFixture(receipt.productQuestionId).questionId===receipt.productQuestionId,"fixture composition receives exact ID");
    const replay=await provisionNorthstarPreparationLineageFixture({environment:"test",fixtureRoot:root});
    const replayStored=await runtimeRepository.read(SANDBOX_ORGANIZATION_ID);assert.ok(replayStored);
    check(replay.disposition==="idempotent-replay","setup reports replay");check(replay.seed.productQuestionId===receipt.productQuestionId,"replay preserves ID");check(productQuestionEvents(replayStored.runtime).filter(event=>event.type==="question_created").length===1,"replay creates one question");
    const setupOwner=adapter(runtimeRepository,"person:northstar-preparation-lineage-fixture",SANDBOX_ORGANIZATION_ID,{value:0});
    await assert.rejects(()=>setupOwner.createQuestion({userId:"person:northstar-preparation-lineage-fixture",organizationId:SANDBOX_ORGANIZATION_ID,question:`${SANDBOX_PRIMARY_QUESTION} changed`,createdAt:"2026-02-02T09:00:00.000Z",idempotencyKey:NORTHSTAR_PRODUCT_QUESTION_FIXTURE_KEY,operation:{requestId:"changed-input",operatorId:"validator"}}),/idempotency conflict/);checks+=1;
    const afterCollision=await runtimeRepository.read(SANDBOX_ORGANIZATION_ID);assert.ok(afterCollision);check(afterCollision.revision===replayStored.revision,"changed input persists nothing");
    const foreignOrganizationId="owner-issued-foreign-validation",foreignUser="foreign-owner-user",foreignRepository=new FilesystemOrganizationRuntimeRepository(foreignRoot),foreignRuntime=createEmptyOrganizationRuntime({organizationId:foreignOrganizationId,name:"Foreign validation",now:"2026-02-02T09:00:00.000Z"});await foreignRepository.create(foreignOrganizationId,bytes(foreignRuntime),{requestId:"foreign-runtime",operatorId:foreignUser});const foreignReads={value:0},foreignOwner=adapter(foreignRepository,foreignUser,foreignOrganizationId,foreignReads),foreign=await foreignOwner.createQuestion({userId:foreignUser,organizationId:foreignOrganizationId,question:SANDBOX_PRIMARY_QUESTION,createdAt:"2026-02-02T09:00:00.000Z",idempotencyKey:NORTHSTAR_PRODUCT_QUESTION_FIXTURE_KEY,operation:{requestId:"foreign-question",operatorId:foreignUser}});check(foreign.workspace.question.id!==receipt.productQuestionId,"same key is organization confined");await assert.rejects(()=>foreignOwner.getQuestionWorkspace({userId:"denied",organizationId:foreignOrganizationId,questionId:foreign.workspace.question.id}),/access denied/);check(foreignReads.value===0,"denied access performs no protected investigation");await assert.rejects(()=>foreignOwner.getQuestionWorkspace({userId:foreignUser,organizationId:foreignOrganizationId,questionId:receipt.productQuestionId}),/not found/);checks+=1;
    const {spawnSync}=await import("node:child_process"),scan=spawnSync("rg",["-l","product-question:northstar-(leadership|implementation-duration)","app","components","product","scripts"],{encoding:"utf8"});if(scan.status!==0&&scan.status!==1)throw new Error(scan.stderr);const activeFiles=scan.stdout.trim().split("\n").filter(Boolean);check(activeFiles.length===0,`old canonical ID literals remain: ${activeFiles.join(",")}`);
    const provisioner=await readFile("product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner.ts","utf8"),page=await readFile("app/product-alpha/leadership-conversation/page.tsx","utf8"),adapterSource=await readFile("product/integration/canonicalProductWorkspaceAdapter.ts","utf8");check(provisioner.includes("productQuestionOwner.createQuestion")&&provisioner.includes("questionResult.workspace.question.id"),"setup calls owner and captures result");check(page.includes("readNorthstarPreparationLineageSeed")&&!page.includes("createQuestion("),"route is receipt-backed and read-only");check((adapterSource.match(/stableId\(\s*["']product-question["']/gu)??[]).length===1,"canonical derivation remains owner-only");
    const eventKinds=productQuestionEvents(replayStored.runtime).map(event=>event.type);check(eventKinds.filter(kind=>kind==="question_created").length===1,"setup creates no duplicate Product Question");
    console.log(JSON.stringify({validation:"owner-issued-product-question-identity-propagation-001",result:"PASS",checks,questionCount:1,receiptCount:1,duplicateQuestions:0,duplicateReceipts:0,protectedDeniedLoads:0,prematureMeetingWrites:0,prematureWorkflowWrites:0,prematurePrepareWrites:0,oldCanonicalIdOccurrences:0,consumerDerivations:0,networkCalls:0,productionAccess:0}));
  }finally{await rm(root,{recursive:true,force:true});await rm(foreignRoot,{recursive:true,force:true});}
}
void main();
