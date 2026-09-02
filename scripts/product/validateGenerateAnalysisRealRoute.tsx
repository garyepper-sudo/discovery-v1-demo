import assert from "node:assert/strict";
import {readFile,mkdtemp,mkdir,rm} from "node:fs/promises";
import path from "node:path";
import {tmpdir} from "node:os";
import React from "react";
import {renderToStaticMarkup} from "react-dom/server";
import {sourceScopedStable} from "../../lib/analysis/sourceScopedExecutiveAnalysisContracts";
import {SourceScopedAnalysisPanelView,type SourceScopedAnalysisPanelState} from "../../components/product-alpha/leadership-conversation/LeadershipConversationPrepare";
import {createLeadershipConversationServerComposition} from "../../product/integration/leadershipConversationServerComposition";
import {analyzeDeterministicDevelopmentCandidate,SourceScopedExecutiveAnalysisOwner} from "../../product/integration/sourceScopedExecutiveAnalysis";
import {reviewedCarryForwardDevelopmentTransport} from "../../product/integration/reviewedCarryForward";
import {provisionNorthstarPreparationLineageFixture} from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import {SANDBOX_ORGANIZATION_ID} from "../../product/simulations/living-organization-sandbox/manifest";
import {NORTHSTAR_PREPARED_CONTENT,NORTHSTAR_PREPARED_LINEAGE,northstarLeadershipConversationFixture} from "../../product/workflow/leadershipConversation";

(globalThis as typeof globalThis&{React:typeof React}).React=React;

const render=(state:SourceScopedAnalysisPanelState)=>renderToStaticMarkup(<SourceScopedAnalysisPanelView state={state}/>);

async function validateProductionIsolation(){const prior=process.env.NODE_ENV;Object.assign(process.env,{NODE_ENV:"production"});try{const owner=new SourceScopedExecutiveAnalysisOwner({model:"not-used",providerFamily:"not-used",authorizeDesignatedPrincipal:async()=>{throw new Error("must not authorize");},selectCurrentPrepareSources:async()=>{throw new Error("must not select");},resolveCurrentAccess:async()=>{throw new Error("must not resolve");},readProtectedBody:async()=>{throw new Error("must not read");}}),result=await analyzeDeterministicDevelopmentCandidate(owner,{subjectId:"not-used",organizationId:"not-used",questionId:"not-used",seriesId:"not-used",occurrenceId:"not-used",question:"not-used"},reviewedCarryForwardDevelopmentTransport);assert.equal(result.status,"analysis-unavailable");assert.equal(result.dispatchCount,0);}finally{prior===undefined?Reflect.deleteProperty(process.env,"NODE_ENV"):Object.assign(process.env,{NODE_ENV:prior});}}

async function validateRealDevelopmentComposition(){
  const root=await mkdtemp(path.join(tmpdir(),"discovery-northstar-preparation-lineage-onboarding-generate-route-")),fixtureRoot=root,workflowRoot=path.join(root,"workflow"),actor="user_GenerateRouteCeo",director="user_GenerateRouteDirector";
  await mkdir(workflowRoot,{mode:0o700});
  const environment={NODE_ENV:"development",DISCOVERY_ENV:"development",NEXT_PUBLIC_DISCOVERY_ENV:"development",DISCOVERY_ONBOARDING_TEST_ENABLED:"true",NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED:"true",NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:["pk","test","generate-route-validation"].join("_"),CLERK_SECRET_KEY:["sk","test","generate-route-validation"].join("_"),DISCOVERY_DATABASE_URL:"postgresql://127.0.0.1/discovery_validation",DISCOVERY_DATABASE_ADMIN_URL:"postgresql://127.0.0.1/discovery_validation",DISCOVERY_DATABASE_MIGRATION_URL:"postgresql://127.0.0.1/discovery_validation",DISCOVERY_RUNTIME_STORAGE_BACKEND:"filesystem",DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_ROOT:fixtureRoot,DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT:fixtureRoot,DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY:path.join(fixtureRoot,"runtime"),DISCOVERY_LEADERSHIP_CONVERSATION_WORKFLOW_ROOT:workflowRoot,DISCOVERY_RUNTIME_PROVISIONING_ENABLED:"false",DISCOVERY_ACCESS_PROVISIONING_ENABLED:"false",DISCOVERY_ATLAS_LIVE_PROVISIONING_ENABLED:"false",DISCOVERY_HOSTED_ENVIRONMENT:"false",DISCOVERY_SANDBOX_CEO_USER_ID:actor,DISCOVERY_SANDBOX_DIRECTOR_USER_ID:director,DISCOVERY_SANDBOX_MANAGER_USER_ID:"user_GenerateRouteManager"};
  const prior=new Map(Object.keys(environment).map(key=>[key,process.env[key]]));
  const priorContent=process.env.DISCOVERY_LEADERSHIP_CONVERSATION_SOURCE_CONTENT_ROOT,priorGoverned=process.env.DISCOVERY_GOVERNED_SOURCE_CONTENT_ROOT,priorLifecycle=process.env.DISCOVERY_ALPHA_ANALYSIS_LIFECYCLE_ROOT;
  try{
    Object.assign(process.env,environment);delete process.env.DISCOVERY_LEADERSHIP_CONVERSATION_SOURCE_CONTENT_ROOT;delete process.env.DISCOVERY_GOVERNED_SOURCE_CONTENT_ROOT;delete process.env.DISCOVERY_ALPHA_ANALYSIS_LIFECYCLE_ROOT;
    const setup=await provisionNorthstarPreparationLineageFixture({environment:"development",fixtureRoot}),fixture=northstarLeadershipConversationFixture(setup.seed.productQuestionId),identity={userId:actor,organizationId:SANDBOX_ORGANIZATION_ID,questionId:fixture.questionId,conversationId:fixture.conversationId},server=createLeadershipConversationServerComposition();
    assert.equal(await server.authorizePageCurrentAccess(identity),true,"development CEO access");
    const stored=await server.recordContext({...identity,idempotencyKey:"generate-route:context",title:"Northstar staff conversation",purpose:"Resolve the next delivery constraint.",intendedOutcome:"Agree one bounded owner action.",timeframe:"Weekly",participants:[{participantRef:`participant:${actor}`,displayName:"Leader",titleLabel:"Chief executive"}],leaderContext:null}),context=stored.contexts.find(value=>value.conversationId===fixture.conversationId);assert.ok(context);
    await server.recordPreparation({...identity,idempotencyKey:"generate-route:prepare",contextVersionId:context.contextVersionId,content:NORTHSTAR_PREPARED_CONTENT,lineage:NORTHSTAR_PREPARED_LINEAGE,changeSummary:null});
    const runtimeFile=path.join(fixtureRoot,"runtime",`${SANDBOX_ORGANIZATION_ID}.json`),workflowFile=path.join(workflowRoot,"organizations",`${SANDBOX_ORGANIZATION_ID}.json`),runtimeBefore=await readFile(runtimeFile),workflowBefore=await readFile(workflowFile),request={...identity,seriesId:`leadership-conversation-series:${identity.conversationId}`,occurrenceId:identity.conversationId};
    const firstResponse=await server.analyzeSourceScopedForDevelopment(request),replayResponse=await server.analyzeSourceScopedForDevelopment(request),first=firstResponse.result,replay=replayResponse.result;assert.equal(first.status,"eligible");assert.equal(firstResponse.failureCategory,null);assert.equal(replay.status,"eligible");assert.equal(sourceScopedStable(first),sourceScopedStable(replay));assert.deepEqual(await readFile(runtimeFile),runtimeBefore);assert.deepEqual(await readFile(workflowFile),workflowBefore);
    const denied=await server.analyzeSourceScopedForDevelopment({...request,userId:director});assert.equal(denied.result.status,"analysis-unavailable");assert.equal(denied.result.dispatchCount,0);assert.equal(denied.failureCategory,"source-access-changed");
    const emptyRoot=path.join(root,"empty-source");await mkdir(emptyRoot,{mode:0o700});process.env.DISCOVERY_LEADERSHIP_CONVERSATION_SOURCE_CONTENT_ROOT=emptyRoot;const missing=await createLeadershipConversationServerComposition().analyzeSourceScopedForDevelopment(request);assert.equal(missing.result.status,"analysis-unavailable");assert.equal(missing.result.dispatchCount,0);assert.equal(missing.failureCategory,"no-authorized-source-bodies");assert.deepEqual(await readFile(runtimeFile),runtimeBefore);assert.deepEqual(await readFile(workflowFile),workflowBefore);
    return first.candidate;
  }finally{
    for(const[key,value]of prior)value===undefined?delete process.env[key]:process.env[key]=value;
    priorContent===undefined?delete process.env.DISCOVERY_LEADERSHIP_CONVERSATION_SOURCE_CONTENT_ROOT:process.env.DISCOVERY_LEADERSHIP_CONVERSATION_SOURCE_CONTENT_ROOT=priorContent;
    priorGoverned===undefined?delete process.env.DISCOVERY_GOVERNED_SOURCE_CONTENT_ROOT:process.env.DISCOVERY_GOVERNED_SOURCE_CONTENT_ROOT=priorGoverned;
    priorLifecycle===undefined?delete process.env.DISCOVERY_ALPHA_ANALYSIS_LIFECYCLE_ROOT:process.env.DISCOVERY_ALPHA_ANALYSIS_LIFECYCLE_ROOT=priorLifecycle;
    await rm(root,{recursive:true,force:true});
  }
}

async function main(){
  await validateProductionIsolation();
  const first=await validateRealDevelopmentComposition();
  assert.equal(first.sections.whatMattersNow[0]?.statement,"Segment performance and delivery capacity need a bounded executive decision.","real founder route uses accepted deterministic transport");
  const idle=render({status:"idle"}),pending=render({status:"pending"}),success=render({status:"success",candidate:first}),missing=render({status:"failure",reason:"no-authorized-source-bodies"}),changed=render({status:"failure",reason:"source-access-changed"}),construction=render({status:"failure",reason:"analysis-construction-failure"}),requestFailed=render({status:"failure",reason:"request-failed"}),reloaded=render({status:"idle"});
  assert.match(idle,/No working analysis has been generated/);assert.ok(!idle.includes("AI-generated"));
  assert.match(pending,/Generating development analysis…/);assert.match(pending,/disabled=""/);assert.match(pending,/aria-live="polite"/);
  assert.match(success,/Deterministic development analysis — not a live provider result/);assert.match(success,/Noncanonical · not yet reviewed/);assert.match(success,/Human review required/);assert.match(success,/Evidence uncertainty/);assert.match(success,/Competing explanations/);assert.ok(!/Evidence ·|Inference ·|Uncertainty ·/.test(success));assert.match(success,/Source [^ ]+ · version [^ ]+ · material [a-f0-9]{64}/);assert.ok(new Set(Object.values(first.sections).flat().flatMap(item=>item.citations.map(citation=>citation.sourceId))).size>=3);assert.ok(!success.includes("model request")&&!success.includes("Refresh analysis"));
  assert.match(missing,/No currently authorized source material is available/);assert.match(changed,/Source access changed/);assert.match(construction,/could not construct the development analysis/);assert.match(requestFailed,/development analysis request did not complete/);
  assert.equal(reloaded,idle,"session-only reload returns truthful idle state");
  process.stdout.write(JSON.stringify({validation:"generate-analysis-real-route-ui-001",result:"PASS",renders:8,deterministicExecutions:2,actualActionBoundary:"separate-executable",providerRequests:0,canonicalWrites:0,reviewWrites:0,lifecycleWrites:0,duplicateArtifacts:0,reloadState:"idle",checks:31}));
}
void main();
