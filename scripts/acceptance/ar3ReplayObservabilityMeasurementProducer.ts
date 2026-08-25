import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp,rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { acceptanceDigest,createAcceptanceMeasurementEnvelopeV1,type PhaseCategory,type ProducerCategory } from "./authenticatedAlphaAcceptanceContracts";
import { FilesystemOrganizationRuntimeRepository,RuntimeStorageConflictError } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";
import { recoverDevelopmentOrganizationRuntime,type DevelopmentRuntimeRecoveryLineage,type DevelopmentRuntimeRecoveryLineageRepository } from "../../lib/onboarding/testing/developmentRuntimeRecovery";
import { onboardingTestOrganizationId } from "../../lib/onboarding/testing/onboardingTestOrganization";
import { ALPHA_ALLOWLIST_POLICY_ID,ALPHA_ALLOWLIST_POLICY_VERSION,type AlphaOrganizationAccessRecord } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { createProductWorkflowArtifactRepository } from "../../product/workflow/leadershipConversation/productWorkflowArtifactRepository";
import { SANDBOX_ORGANIZATION_ID } from "../../product/simulations/living-organization-sandbox/manifest";

type Request={frameworkId:"authenticated-alpha-acceptance";frameworkVersion:"1";profileId:string;profileVersion:string;sourceDigest:string;taskDigest:string;runDigest:string;producer:ProducerCategory;phase:PhaseCategory};
let producerStage="initialize";
const request=():Request=>JSON.parse(Buffer.from(process.env.AR2_PRE_001B_MEASUREMENT_REQUEST??"","base64").toString("utf8"));
function replay(mode:string){const child=spawnSync(process.execPath,["--conditions=react-server","--import","tsx","scripts/product/validateLeadershipConversationReplay.ts"],{cwd:process.cwd(),encoding:"utf8",env:{...process.env,NODE_ENV:"test",AR3_OBSERVER_MODE:mode},timeout:180_000,maxBuffer:2_000_000});assert.equal(child.status,0);return JSON.parse(child.stdout.trim().split("\n").at(-1)??"{}") as any;}
async function typedRuntime(){
 producerStage="typed-recovery";
 const recovery=spawnSync(process.execPath,["--import","tsx","scripts/product/validateDevelopmentRuntimeRecovery.ts","all"],{cwd:process.cwd(),encoding:"utf8",timeout:180_000});
 assert.equal(recovery.status,0);
 producerStage="typed-cas";
 const root=await mkdtemp(path.join(tmpdir(),"discovery-ar2-pre-001b-runtime-"));
 try{
  const organizationId=onboardingTestOrganizationId({consumerId:"user_developmentRuntimeRecoveryValidation",requestId:"development-runtime-recovery-validation"}),repository=new FilesystemOrganizationRuntimeRepository(root),runtime=createEmptyOrganizationRuntime({organizationId,name:"Recovery Validation Organization"}),created=await repository.create(organizationId,new TextEncoder().encode(`${JSON.stringify(runtime,null,2)}\n`),{requestId:"ar2-pre-001b-cas-create",operatorId:"acceptance"});
  let cas=false;try{await repository.replace(organizationId,created.bytes,"stale-runtime-revision",{requestId:"ar2-pre-001b-cas",operatorId:"acceptance"});}catch(error){cas=error instanceof RuntimeStorageConflictError;}
  return{recovered:true,cas};
 }finally{await rm(root,{recursive:true,force:true});}
}
async function ownerInventory(){const root=process.env.AR2_PRE_001B_WORKFLOW_ROOT;if(!root)throw new Error("Current-build workflow inventory unavailable");const store=(await createProductWorkflowArtifactRepository({root,environment:"development"}).read(SANDBOX_ORGANIZATION_ID)).store,series=store.contexts,questionIds=new Set(series.map(value=>value.questionId)),conversationIds=new Set(series.map(value=>value.conversationId)),successor=store.futurePreparationLinks.at(-1)?.nextConversationId;return{sameQuestion:questionIds.size===1,distinct:conversationIds.size===2&&!!successor,duplicateZero:!!successor&&store.contexts.filter(value=>value.conversationId===successor).length===1&&store.preparedWorkPublications!.filter(value=>value.productWorkflowId===`leadership-conversation:${successor}`).length===1&&store.frozenSnapshotPublications!.filter(value=>value.productWorkflowId===`leadership-conversation:${successor}`).length===0};}
async function main(){
 const mode=process.argv[2],r=request();producerStage="replay-enabled";const enabled=replay("enabled");producerStage="replay-repeat";const repeat=replay("enabled");producerStage="replay-disabled";const disabled=replay("disabled");producerStage="replay-rejecting";const rejecting=replay("rejecting");producerStage="replay-throwing";const throwing=replay("throwing");producerStage="replay-compare";assert.deepEqual(enabled,repeat);
 producerStage="parity";const strip=(v:any)=>Object.fromEntries(Object.entries(v).filter(([key])=>key!=="observability")),parity=[disabled,rejecting,throwing].every(value=>JSON.stringify(strip(value))===JSON.stringify(strip(enabled))),observation=enabled.observability,segments=observation.segments as any[],events=segments.flatMap(value=>value.events);
 const eventOrdering=segments.every(segment=>segment.events.every((event:any,index:number)=>event.sequence===index+1&&event.correlation===segment.events[0]?.correlation)&&segment.events.every((event:any,index:number)=>event.transitionCategory!=="completed"||segment.events.slice(0,index).some((prior:any)=>prior.workflowStage===event.workflowStage&&prior.transitionCategory==="attempted"))&&segment.events.every((event:any,index:number)=>event.transitionCategory!=="attempted"||segment.events.slice(index+1).some((later:any)=>later.workflowStage===event.workflowStage&&later.transitionCategory!=="attempted")));
 producerStage="typed-runtime";const typed=await typedRuntime();producerStage="owner-inventory";const owner=mode==="replay-recovery"?await ownerInventory():null;
 const facts=mode==="replay-recovery"?[{factId:"exact-replay",state:enabled.idempotentReentry==="passed"?"observed":"not-observed"},{factId:"incompatible-replay",state:events.some((event:any)=>event.outcomeCategory==="incompatible-replay")?"observed":"not-observed"},{factId:"cas-conflict",state:typed.cas?"observed":"not-observed"},{factId:"recovered",state:typed.recovered?"observed":"not-observed"},{factId:"durable-state-parity",state:parity?"match":"mismatch"},{factId:"same-product-question",state:owner!.sameQuestion?"match":"mismatch"},{factId:"distinct-successor",state:owner!.distinct?"observed":"not-observed"},{factId:"successor-duplicate-zero",state:owner!.duplicateZero?"match":"mismatch"}]:[{factId:"event-ordering",state:eventOrdering?"observed":"not-observed"},{factId:"bounded-cardinality",state:segments.every(value=>value.events.length<=200)?"match":"mismatch"},{factId:"protected-load-pairing",state:events.filter((event:any)=>event.protectedLoadCategory==="attempted").length===events.filter((event:any)=>["authorized","unavailable"].includes(event.protectedLoadCategory)).length?"match":"mismatch"},{factId:"sink-parity",state:parity?"match":"mismatch"}];
 producerStage="measurement-envelope";const result=createAcceptanceMeasurementEnvelopeV1({framework:{id:r.frameworkId,version:r.frameworkVersion},profile:{id:r.profileId,version:r.profileVersion},producer:r.producer,phase:r.phase,sourceDigest:r.sourceDigest,taskDigest:r.taskDigest,measurementId:acceptanceDigest({mode,task:r.taskDigest,facts}),producerRunDigest:r.runDigest,sequence:mode==="replay-recovery"?2:3,observations:facts as any});process.stdout.write(`${JSON.stringify(result)}\n`);
}
void main().catch(()=>{process.stderr.write(`AR2_PRE001B_PRODUCER_FAILED:${producerStage}\n`);process.exitCode=1;});
