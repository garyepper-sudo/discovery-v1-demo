import assert from "node:assert/strict";
import {existsSync} from "node:fs";
import {mkdir,mkdtemp,readFile,rm} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";

import {resolvePersonaForSignedInUser} from "../../lib/access/sandboxMultiUserAccess";
import {sourceScopedDigest,sourceScopedStable,type SourceScopedResultV1} from "../../lib/analysis/sourceScopedExecutiveAnalysisContracts";
import {createLeadershipConversationServerComposition} from "../../product/integration/leadershipConversationServerComposition";
import {provisionNorthstarPreparationLineageFixture} from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import {SANDBOX_ORGANIZATION_ID} from "../../product/simulations/living-organization-sandbox/manifest";
import {NORTHSTAR_PREPARED_CONTENT,NORTHSTAR_PREPARED_LINEAGE,northstarLeadershipConversationFixture} from "../../product/workflow/leadershipConversation";

function assertCanonicalResultDigest(result:SourceScopedResultV1){
  const{resultDigest,...unsigned}=result;
  assert.equal(resultDigest,sourceScopedDigest(unsigned));
  assert.deepEqual(Object.keys(result).sort(),result.status==="eligible"
    ?["candidate","contractVersion","dispatchCount","resultDigest","status"].sort()
    :["contractVersion","dispatchCount","resultDigest","status"].sort());
}

async function main(){
  const root=await mkdtemp(path.join(tmpdir(),"discovery-northstar-preparation-lineage-onboarding-generate-action-boundary-")),workflowRoot=path.join(root,"workflow"),actor="user_GenerateRouteCeo";
  await mkdir(workflowRoot,{mode:0o700});
  const environment={NODE_ENV:"development",DISCOVERY_ENV:"development",NEXT_PUBLIC_DISCOVERY_ENV:"development",DISCOVERY_ONBOARDING_TEST_ENABLED:"true",NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED:"true",NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:["pk","test","generate-action-boundary"].join("_"),CLERK_SECRET_KEY:["sk","test","generate-action-boundary"].join("_"),DISCOVERY_DATABASE_URL:"postgresql://127.0.0.1/discovery_validation",DISCOVERY_DATABASE_ADMIN_URL:"postgresql://127.0.0.1/discovery_validation",DISCOVERY_DATABASE_MIGRATION_URL:"postgresql://127.0.0.1/discovery_validation",DISCOVERY_RUNTIME_STORAGE_BACKEND:"filesystem",DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_ROOT:root,DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT:root,DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY:path.join(root,"runtime"),DISCOVERY_LEADERSHIP_CONVERSATION_WORKFLOW_ROOT:workflowRoot,DISCOVERY_RUNTIME_PROVISIONING_ENABLED:"false",DISCOVERY_ACCESS_PROVISIONING_ENABLED:"false",DISCOVERY_ATLAS_LIVE_PROVISIONING_ENABLED:"false",DISCOVERY_HOSTED_ENVIRONMENT:"false",DISCOVERY_SANDBOX_CEO_USER_ID:actor,DISCOVERY_SANDBOX_DIRECTOR_USER_ID:"user_GenerateRouteDirector",DISCOVERY_SANDBOX_MANAGER_USER_ID:"user_GenerateRouteManager",DISCOVERY_GENERATE_ANALYSIS_TEST_USER_ID:actor};
  const prior=new Map(Object.keys(environment).map(key=>[key,process.env[key]])),unset=["DISCOVERY_LEADERSHIP_CONVERSATION_SOURCE_CONTENT_ROOT","DISCOVERY_GOVERNED_SOURCE_CONTENT_ROOT","DISCOVERY_ALPHA_ANALYSIS_LIFECYCLE_ROOT"],priorUnset=new Map(unset.map(key=>[key,process.env[key]])),priorTimeout=process.env.DISCOVERY_ALPHA_ANALYSIS_TIMEOUT_MS,priorFetch=globalThis.fetch;
  try{
    Object.assign(process.env,environment);for(const key of unset)delete process.env[key];
    assert.equal(resolvePersonaForSignedInUser(actor)?.userId,actor,"auth stub identity reconstructs the canonical persona");
    const setup=await provisionNorthstarPreparationLineageFixture({environment:"development",fixtureRoot:root}),fixture=northstarLeadershipConversationFixture(setup.seed.productQuestionId),identity={userId:actor,organizationId:SANDBOX_ORGANIZATION_ID,questionId:fixture.questionId,conversationId:fixture.conversationId},server=createLeadershipConversationServerComposition();
    assert.equal(await server.authorizePageCurrentAccess(identity),true,"development CEO access");
    const stored=await server.recordContext({...identity,idempotencyKey:"generate-action-boundary:context",title:"Northstar staff conversation",purpose:"Resolve the next delivery constraint.",intendedOutcome:"Agree one bounded owner action.",timeframe:"Weekly",participants:[{participantRef:`participant:${actor}`,displayName:"Leader",titleLabel:"Chief executive"}],leaderContext:null}),context=stored.contexts.find(value=>value.conversationId===fixture.conversationId);assert.ok(context);
    await server.recordPreparation({...identity,idempotencyKey:"generate-action-boundary:prepare",contextVersionId:context.contextVersionId,content:NORTHSTAR_PREPARED_CONTENT,lineage:NORTHSTAR_PREPARED_LINEAGE,changeSummary:null});
    const runtimeFile=path.join(root,"runtime",`${SANDBOX_ORGANIZATION_ID}.json`),workflowFile=path.join(workflowRoot,"organizations",`${SANDBOX_ORGANIZATION_ID}.json`),runtimeBefore=await readFile(runtimeFile),workflowBefore=await readFile(workflowFile);
    let providerRequests=0;globalThis.fetch=async()=>{providerRequests++;throw new Error("provider access is forbidden in deterministic development validation");};
    const{generateSourceScopedExecutiveAnalysisAction}=await import("../../app/product-alpha/leadership-conversation/actions");
    delete process.env.DISCOVERY_ALPHA_ANALYSIS_TIMEOUT_MS;const ordinary=await generateSourceScopedExecutiveAnalysisAction();process.env.DISCOVERY_ALPHA_ANALYSIS_TIMEOUT_MS="disabled";const stale=await generateSourceScopedExecutiveAnalysisAction(),replay=await generateSourceScopedExecutiveAnalysisAction();
    for(const response of [ordinary,stale,replay]){assert.equal(response.failureCategory,null);assert.equal(response.result.status,"eligible");assertCanonicalResultDigest(response.result);}
    if(ordinary.result.status!=="eligible"||stale.result.status!=="eligible"||replay.result.status!=="eligible")throw new Error("deterministic action result is unavailable");
    assert.equal(sourceScopedStable(ordinary.result),sourceScopedStable(stale.result));assert.equal(sourceScopedStable(stale.result),sourceScopedStable(replay.result));
    for(const key of ["candidateDigest","requestDigest","configurationDigest","sourcePacketDigest"] as const)assert.equal(ordinary.result.candidate[key],stale.result.candidate[key],`${key} ignores stale provider timeout`);
    assert.equal(ordinary.result.resultDigest,stale.result.resultDigest);assert.equal(sourceScopedStable(ordinary.result.candidate.sections),sourceScopedStable(stale.result.candidate.sections));assert.equal(sourceScopedStable(Object.values(ordinary.result.candidate.sections).flat().flatMap(item=>item.citations)),sourceScopedStable(Object.values(stale.result.candidate.sections).flat().flatMap(item=>item.citations)));assert.equal(providerRequests,0);
    assert.deepEqual(await readFile(runtimeFile),runtimeBefore);assert.deepEqual(await readFile(workflowFile),workflowBefore);assert.equal(existsSync(path.join(root,"lifecycle")),false);
    process.stdout.write(JSON.stringify({validation:"generate-analysis-actual-action-boundary-001",result:"PASS",actionCalls:3,authReconstruction:"actual",composition:"actual",ordinaryTimeout:"absent",staleTimeout:"disabled",providerRequests,runtimeWrites:0,workflowWrites:0,reviewWrites:0,closureWrites:0,successorWrites:0,lifecycleWrites:0,replayDuplicates:0,canonicalResultDigest:"PASS",candidateIdentity:"equal",requestIdentity:"equal",configurationIdentity:"equal",sourcePacketIdentity:"equal",citationIdentity:"equal",semanticIdentity:"equal",deterministicReplay:"PASS"}));
  }finally{
    for(const[key,value]of prior)value===undefined?delete process.env[key]:process.env[key]=value;
    for(const[key,value]of priorUnset)value===undefined?delete process.env[key]:process.env[key]=value;
    priorTimeout===undefined?delete process.env.DISCOVERY_ALPHA_ANALYSIS_TIMEOUT_MS:process.env.DISCOVERY_ALPHA_ANALYSIS_TIMEOUT_MS=priorTimeout;globalThis.fetch=priorFetch;
    await rm(root,{recursive:true,force:true});
  }
}
void main();
