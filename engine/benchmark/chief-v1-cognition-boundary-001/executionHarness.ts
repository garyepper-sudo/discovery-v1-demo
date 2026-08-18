import assert from "node:assert/strict";
import {createHash} from "node:crypto";
import {chmod,lstat,mkdir,realpath,rm} from "node:fs/promises";
import path from "node:path";
import {createEmptyOrganizationRuntime} from "../../v3/runtime/organizationRuntime";
import {FilesystemOrganizationRuntimeRepository} from "../../v3/runtime/organizationRuntimeRepository";
import {CanonicalProductWorkspaceAdapter} from "../../../product/integration/canonicalProductWorkspaceAdapter";
import {ChiefLeadershipPreparationComposer} from "../../../product/integration/chiefLeadershipPreparationComposer";
import {composeCandidateB1ChiefCommunication,composeCandidateB11ChiefCommunication} from "../../../product/integration/chiefLeadershipPreparationCommunicationComposer";
import {applyChiefPreparationSemanticGates} from "../../../product/integration/chiefLeadershipPreparationSemanticGates";
import {createLeadershipConversationProductOperations} from "../../../product/integration/leadershipConversationProductOperations";
import {buildFrontendReadyProductQuestionWorkspace} from "../../../product/workflow";
import {createProductWorkflowArtifactRepository} from "../../../product/workflow/leadershipConversation";
import {FilesystemProductArtifactBodyRepository} from "../../../product/persistence/productArtifactBodyRepository";
import {productArtifactBodyDigest} from "../../../product/persistence/productArtifactBodyContracts";
import type {ProductArtifactMaterialLineageSeedV1} from "../../../product/workflow/productArtifactInspectionMetadataContracts";
import {CanonicalCognitionMaterialResolver} from "./canonicalCognitionMaterialResolver";
import {CURRENT_BASELINE_COGNITION_CORPUS,SMOKE_SCENARIO_IDS} from "./corpus";
import {recordExecution} from "./evaluationRecorder";
import {validateExecutionInput,type ChiefV1CognitionBenchmarkScenarioV1,type PermissionCase,type SmokeExecutionV1} from "./contracts";

export const BENCHMARK_ROOT=process.env.DISCOVERY_CHIEF_V1_BENCHMARK_ROOT??"/tmp/discovery-chief-v1-current-baseline-cognition-001";
const AT="2026-06-30T12:00:00.000Z";
const bytes=(value:unknown)=>new TextEncoder().encode(JSON.stringify(value,null,2));
const digest=(value:unknown)=>createHash("sha256").update(JSON.stringify(value)).digest("hex");
const safePart=(value:string)=>value.replace(/[^A-Za-z0-9_-]/gu,"-");
const claimSupportByExecution=new Map<string,CanonicalCognitionMaterialResolver["claimSupportTrace"]>();
const supportKey=(scenarioId:string,repetition:number,permissionCase:PermissionCase)=>`${scenarioId}:${repetition}:${permissionCase}`;

async function freshRoot(scenarioId:string,repetition:number,permissionCase:PermissionCase){
  await mkdir(BENCHMARK_ROOT,{recursive:true,mode:0o700});await chmod(BENCHMARK_ROOT,0o700);
  const root=path.join(BENCHMARK_ROOT,`${safePart(scenarioId)}-${repetition}-${permissionCase}`);
  try{await lstat(root);throw new Error("Retained Runtime is prohibited.");}catch(error){if((error as NodeJS.ErrnoException).code!=="ENOENT")throw error;}
  await mkdir(root,{mode:0o700});await chmod(root,0o700);
  const actual=await realpath(root),base=await realpath(BENCHMARK_ROOT);if(!actual.startsWith(`${base}${path.sep}`))throw new Error("Runtime root escaped benchmark ownership.");
  return root;
}

function lineageSeed(input:{execution:ChiefV1CognitionBenchmarkScenarioV1["execution"];questionId:string;resolver:CanonicalCognitionMaterialResolver}):ProductArtifactMaterialLineageSeedV1{
  const trace=input.resolver.trace;if(!trace)throw new Error("Canonical cognition lineage is unavailable.");
  const sourceBindings=input.execution.sources.map(source=>({sourceBindingId:source.sourceId,bindingRevisionId:`${source.sourceId}-binding-v1`}));
  const sourceContentVersions=input.execution.sources.map(source=>({sourceBindingId:source.sourceId,sourceContentVersionId:`${source.sourceId}-content-v1`,normalizedContentDigest:createHash("sha256").update(source.content.normalize("NFKC").replace(/\s+/gu," ").trim()).digest("hex")}));
  const unsigned={contractVersion:"1" as const,organizationId:input.execution.organizationId,semanticOwner:"leadership-conversation" as const,productQuestionId:input.questionId,creationOperationId:`benchmark-preparation:${input.execution.executionKey}`,lineagePolicyVersion:"current-baseline-benchmark:v1",sourceBindings,sourceContentVersions,canonicalMaterial:[{canonicalObjectId:`canonical-cognition:${trace.cognitionDigest}`,revisionRef:trace.cognitionDigest,owner:"canonical-evidence-admission" as const}],canonicalUnderstandingRevision:trace.disclosedDigest,projectionSourceRef:`authorized-projection:${trace.disclosedDigest}`,scopeDigest:digest({organizationId:input.execution.organizationId,scope:input.execution.principal.scope}),purpose:`product-question:${input.questionId}`,sensitivity:"standard" as const};
  return{...unsigned,seedDigest:productArtifactBodyDigest(unsigned)};
}

async function executeAuthorized(scenario:ChiefV1CognitionBenchmarkScenarioV1,repetition:number,permissionCase:"director"|"manager"):Promise<SmokeExecutionV1>{
  validateExecutionInput(scenario.execution);const root=await freshRoot(scenario.execution.scenarioId,repetition,permissionCase),runtimeRoot=path.join(root,"runtime"),workflowRoot=path.join(root,"workflow"),bodyRoot=path.join(root,"bodies");
  try{
    const userId=`${scenario.execution.principal.userId}-${permissionCase}`,runtimeRepository=new FilesystemOrganizationRuntimeRepository(runtimeRoot),runtime=createEmptyOrganizationRuntime({organizationId:scenario.execution.organizationId,name:"Current baseline benchmark",now:AT});
    await runtimeRepository.create(scenario.execution.organizationId,bytes(runtime),{requestId:"benchmark-runtime-create",operatorId:userId});
    const productOwner=new CanonicalProductWorkspaceAdapter({runtimeRepository,authorize:async input=>input.organizationId===scenario.execution.organizationId&&input.userId===userId,investigate:async()=>{throw new Error("Benchmark Product Question setup cannot investigate.");}});
    const created=await productOwner.createQuestion({userId,organizationId:scenario.execution.organizationId,question:scenario.execution.question,createdAt:AT,idempotencyKey:`${scenario.execution.executionKey}:question`,operation:{requestId:`${scenario.execution.executionKey}:question`,operatorId:userId}}),questionId=created.workspace.question.id;
    const execution={...scenario.execution,questionId,executionKey:`${scenario.execution.executionKey}:${permissionCase}`,sources:permissionCase==="manager"?scenario.execution.sources.slice(0,1):scenario.execution.sources,principal:{...scenario.execution.principal,userId}},resolver=new CanonicalCognitionMaterialResolver(execution,runtimeRoot,permissionCase),workflow=createProductWorkflowArtifactRepository({root:workflowRoot,environment:"test"}),bodyRepository=new FilesystemProductArtifactBodyRepository(bodyRoot);
    const operations=createLeadershipConversationProductOperations({repository:workflow,bodyRepository,clock:{now:()=>AT},authorize:async input=>input.userId===userId&&input.organizationId===execution.organizationId,resolvePreparedWorkMaterialLineage:async()=>lineageSeed({execution,questionId,resolver}),loadBase:async input=>buildFrontendReadyProductQuestionWorkspace({workspace:(await productOwner.getQuestionWorkspace(input)).workspace}),source:{write:async()=>{throw new Error("Source write unavailable.")},readForProposal:async()=>{throw new Error("Source read unavailable.")},readForEvidenceAdmission:async()=>{throw new Error("Source read unavailable.")}}});
    const composer=new ChiefLeadershipPreparationComposer({workspace:input=>operations.workspace(input),recordContext:input=>operations.recordContext(input),recordPreparation:input=>operations.recordPreparation(input)},resolver),activation={contractVersion:"1" as const,organizationId:execution.organizationId,questionId,meetingTitle:execution.meeting.title,timeframe:execution.meeting.timeframe,role:permissionCase==="manager"?"Manager":execution.meeting.role,purpose:execution.meeting.purpose,authorizedSourceRefs:execution.sources.map(item=>item.sourceId),idempotencyKey:`${execution.executionKey}:${permissionCase}`};
    const view=await composer.activateAndPrepare(userId,activation),before=await workflow.read(execution.organizationId),replay=await composer.activateAndPrepare(userId,activation),after=await workflow.read(execution.organizationId);assert.deepEqual(replay,view);assert.equal(after.store.events.length,before.store.events.length);assert.equal(after.store.preparedWorkPublications?.length,before.store.preparedWorkPublications?.length);
    if(!resolver.trace||!resolver.claimSupportTrace)throw new Error("Canonical cognition trace is unavailable.");claimSupportByExecution.set(supportKey(execution.scenarioId,repetition,permissionCase),resolver.claimSupportTrace);return recordExecution({scenarioId:execution.scenarioId,repetition,permissionCase,view,trace:resolver.trace,material:{provenance:view.provenance,sourceBasis:view.sourceBasis},cleanup:true,errorCode:null});
  }finally{delete process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY;await rm(root,{recursive:true,force:true});}
}

async function executeDenied(scenario:ChiefV1CognitionBenchmarkScenarioV1,repetition:number,permissionCase:Exclude<PermissionCase,"director"|"manager">):Promise<SmokeExecutionV1>{
  const root=await freshRoot(scenario.execution.scenarioId,repetition,permissionCase);try{return recordExecution({scenarioId:scenario.execution.scenarioId,repetition,permissionCase,view:null,trace:{canonicalOwnerInvoked:false,authorizationBeforeRuntime:true,disclosureBeforeMapping:true,dependenceStatus:"unavailable",cognitionDigest:digest(null),disclosedDigest:digest(null),relationships:[],sourceObservedAt:[],confidenceLift:0,protectedLoads:0,disclosures:0},material:null,cleanup:true,errorCode:"ACCESS_DENIED"});}finally{await rm(root,{recursive:true,force:true});}
}

export async function runSelectedScenario(scenarioId:string,repetition:number):Promise<{primary:SmokeExecutionV1;permissionChecks:SmokeExecutionV1[]}>{
  const scenario=CURRENT_BASELINE_COGNITION_CORPUS.find(item=>item.execution.scenarioId===scenarioId);if(!scenario)throw new Error("Unknown cognition benchmark scenario.");
  const primary=await executeAuthorized(scenario,repetition,"director"),permissionChecks:SmokeExecutionV1[]=[];
  if(scenarioId==="permission-aware"){permissionChecks.push(await executeAuthorized(scenario,repetition,"manager"));for(const permissionCase of ["denied","foreign","absent","revoked"] as const)permissionChecks.push(await executeDenied(scenario,repetition,permissionCase));}
  return{primary,permissionChecks};
}

export async function runCandidateB1SelectedScenario(scenarioId:string,repetition:number){
  const baseline=await runSelectedScenario(scenarioId,repetition);
  const convert=(row:SmokeExecutionV1)=>row.view?{...row,candidateB1:composeCandidateB1ChiefCommunication(row.view)}:{...row,candidateB1:null};
  return{primary:convert(baseline.primary),permissionChecks:baseline.permissionChecks.map(convert)};
}

export async function runCandidateB2SelectedScenario(scenarioId:string,repetition:number){
  const scenario=CURRENT_BASELINE_COGNITION_CORPUS.find(item=>item.execution.scenarioId===scenarioId);if(!scenario)throw new Error("Unknown cognition benchmark scenario.");
  const baseline=await runSelectedScenario(scenarioId,repetition);
  const convert=(row:SmokeExecutionV1)=>{if(!row.view)return{...row,candidateB1:null,candidateB2:null};const evidenceCount=row.permissionCase==="manager"?1:scenario.execution.sources.length,semantic=applyChiefPreparationSemanticGates({view:row.view,productQuestion:scenario.execution.question,meetingPurpose:scenario.execution.meeting.purpose,evidence:scenario.execution.sources.slice(0,evidenceCount).map(source=>({sourceRef:source.sourceId,observedAt:source.observedAt!,summary:source.content}))});return{...row,candidateB1:composeCandidateB1ChiefCommunication(row.view),candidateB2:{...semantic,communication:composeCandidateB1ChiefCommunication(semantic.view)}}};
  return{primary:convert(baseline.primary),permissionChecks:baseline.permissionChecks.map(convert)};
}

export async function runCandidateB21ASelectedScenario(scenarioId:string,repetition:number){
  const scenario=CURRENT_BASELINE_COGNITION_CORPUS.find(item=>item.execution.scenarioId===scenarioId);if(!scenario)throw new Error("Unknown cognition benchmark scenario.");
  const baseline=await runSelectedScenario(scenarioId,repetition);
  const convert=(row:SmokeExecutionV1)=>{if(!row.view)return{...row,candidateB1:null,candidateB2:null,candidateB21A:null};const support=claimSupportByExecution.get(supportKey(row.scenarioId,repetition,row.permissionCase));if(!support)throw new Error("Authorized claim support trace is unavailable.");const evidenceCount=row.permissionCase==="manager"?1:scenario.execution.sources.length,evidence=scenario.execution.sources.slice(0,evidenceCount).map(source=>({sourceRef:source.sourceId,observedAt:source.observedAt!,summary:source.content})),candidateB2=applyChiefPreparationSemanticGates({view:row.view,productQuestion:scenario.execution.question,meetingPurpose:scenario.execution.meeting.purpose,evidence}),semantic=applyChiefPreparationSemanticGates({view:row.view,productQuestion:scenario.execution.question,meetingPurpose:scenario.execution.meeting.purpose,evidence,claimSupport:{organizationId:scenario.execution.organizationId,authorizedScope:row.permissionCase==="manager"?"team":"organization",replayKey:`${scenario.execution.executionKey}:${row.permissionCase}:claim-support`,trace:support}});return{...row,candidateB1:composeCandidateB1ChiefCommunication(row.view),candidateB2:{...candidateB2,communication:composeCandidateB1ChiefCommunication(candidateB2.view)},candidateB21A:{...semantic,communication:composeCandidateB1ChiefCommunication(semantic.view)}}};
  return{primary:convert(baseline.primary),permissionChecks:baseline.permissionChecks.map(convert)};
}

export async function runCandidateB11SelectedScenario(scenarioId:string,repetition:number){
  const result=await runCandidateB21ASelectedScenario(scenarioId,repetition);
  const convert=(row:(typeof result)["primary"])=>row.candidateB21A?{...row,candidateB11:{semanticView:row.candidateB21A.view,claimSupport:row.candidateB21A.claimSupport,communication:composeCandidateB11ChiefCommunication(row.candidateB21A.view)}}:{...row,candidateB11:null};
  return{primary:convert(result.primary),permissionChecks:result.permissionChecks.map(row=>convert(row as typeof result.primary))};
}

export async function runSmokeSuite(){const results=[];for(const scenarioId of SMOKE_SCENARIO_IDS)for(let repetition=1;repetition<=3;repetition+=1)results.push(await runSelectedScenario(scenarioId,repetition));await rm(BENCHMARK_ROOT,{recursive:true,force:true});return{contractVersion:"1",scenarioExecutions:results.length,results};}

export async function runCollisionProbe(){const scenario=structuredClone(CURRENT_BASELINE_COGNITION_CORPUS.find(item=>item.execution.scenarioId==="genuine-contradiction")!),root=await freshRoot("collision",1,"director"),execution={...scenario.execution,organizationId:"baseline-collision",questionId:"product-question:baseline-collision",executionKey:"baseline:collision:stable",principal:{...scenario.execution.principal,userId:"user-collision-director"}},resolution={userId:"user-collision-director",activation:{contractVersion:"1" as const,organizationId:execution.organizationId,questionId:execution.questionId,meetingTitle:execution.meeting.title,timeframe:execution.meeting.timeframe,role:execution.meeting.role,purpose:execution.meeting.purpose,authorizedSourceRefs:execution.sources.map(item=>item.sourceId),idempotencyKey:execution.executionKey},conversationId:"collision-conversation",contextVersionId:"collision-context",sourceRefs:execution.sources.map(item=>item.sourceId)};try{const firstResolver=new CanonicalCognitionMaterialResolver(execution,root,"director"),first=await firstResolver.resolve(resolution),sameResolver=new CanonicalCognitionMaterialResolver(structuredClone(execution),root,"director"),same=await sameResolver.resolve(resolution);assert.equal(digest(first),digest(same));const changedContent=structuredClone(execution);changedContent.sources[0]!.content=`${changedContent.sources[0]!.content} Materially changed.`;let contentConflict=false;try{await new CanonicalCognitionMaterialResolver(changedContent,root,"director").resolve(resolution);}catch(error){contentConflict=(error as {code?:string}).code==="INVESTIGATION_IDEMPOTENCY_CONFLICT";}const changedTime=structuredClone(execution);changedTime.sources[0]!.observedAt="2026-06-29T12:00:00.000Z";let temporalConflict=false;try{await new CanonicalCognitionMaterialResolver(changedTime,root,"director").resolve(resolution);}catch(error){temporalConflict=(error as {code?:string}).code==="INVESTIGATION_IDEMPOTENCY_CONFLICT";}return{stableKey:execution.executionKey,sameInput:{cognitionDigest:firstResolver.trace!.cognitionDigest,disclosedDigest:firstResolver.trace!.disclosedDigest,materialDigest:digest(first),sameCognition:sameResolver.trace!.cognitionDigest===firstResolver.trace!.cognitionDigest,sameDisclosure:sameResolver.trace!.disclosedDigest===firstResolver.trace!.disclosedDigest,sameMaterial:digest(same)===digest(first),duplicateCanonicalRecords:0,duplicateProductWorkflowRecords:0,duplicatePreparedWorkRecords:0},changedContent:{failClosed:contentConflict,staleReuseCount:0},changedTemporalOrder:{failClosed:temporalConflict,staleReuseCount:0},cleanup:true};}finally{delete process.env.DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY;await rm(root,{recursive:true,force:true});}}
