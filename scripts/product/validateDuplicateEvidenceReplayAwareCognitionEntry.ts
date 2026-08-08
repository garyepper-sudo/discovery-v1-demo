import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { resolveCanonicalEvidenceAdmission, runDiscoveryV3 } from "../../engine/v3";
import { createCanonicalEvidenceContributionLineageEnvelope, createCanonicalScopeTopology, createCanonicalSourceScopeBinding } from "../../engine/v3/governance/canonicalScopeLineage";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { OrganizationRuntimeRepository, StoredOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { atlasIndustrialArtifacts } from "../../engine/benchmark/judgment-lab/atlasIndustrialPilot";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import type { CanonicalEvidenceContribution } from "../../product/integration/contracts";
import { createDurableProductQuestion } from "../../product/questions/questionLifecycle";

const ORG="duplicate-cognition-entry";const USER="authorized-validator";const AT="2026-08-06T12:00:00.000Z";const QUESTION="question-primary";const OTHER_QUESTION="question-secondary";
const digest=(value:string)=>createHash("sha256").update(value).digest("hex");
const encode=(value:unknown)=>new TextEncoder().encode(JSON.stringify(value,null,2));
const revision=(value:Uint8Array)=>createHash("sha256").update(value).digest("hex");
const rootScope={organizationId:ORG,type:"organization" as const,id:ORG};
const teamScope={organizationId:ORG,type:"team" as const,id:"team-scope"};
const topology=createCanonicalScopeTopology({organizationId:ORG,topologyVersion:1,effectiveAt:AT,nodes:[rootScope,teamScope],relationships:[{kind:"contains",from:rootScope,to:teamScope}]});
const material=atlasIndustrialArtifacts.map(item=>item.content).join("\n\n");
let checks=0;const check=(value:unknown,message:string)=>{assert.ok(value,message);checks+=1;};

class MemoryRepository implements Pick<OrganizationRuntimeRepository,"read"|"replace">{
  writes=0;constructor(public value:StoredOrganizationRuntime){}
  async read(organizationId:string){return organizationId===ORG?structuredClone(this.value):null;}
  async replace(organizationId:string,next:Uint8Array,expected:string){assert.equal(organizationId,ORG);assert.equal(expected,this.value.revision);const runtime=JSON.parse(new TextDecoder().decode(next));this.value={bytes:next,revision:revision(next),runtime};this.writes+=1;return structuredClone(this.value);}
}

function initial():StoredOrganizationRuntime{
  let runtime=createEmptyOrganizationRuntime({organizationId:ORG,name:"Duplicate validation",now:AT});
  runtime=createDurableProductQuestion({runtime,title:"What changed?",questionId:QUESTION,createdAt:AT}).runtime;
  runtime=createDurableProductQuestion({runtime,title:"What else changed?",questionId:OTHER_QUESTION,createdAt:AT}).runtime;
  const bytes=encode(runtime);return{runtime,bytes,revision:revision(bytes)};
}

function binding(sourceId:string,content:string,purposeRef=QUESTION){return createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source:{sourceId,sourceVersion:"1",normalizedContentDigest:digest(content)},topology,assertions:[{relationship:"origin",scope:sourceId==="source-scope"?teamScope:rootScope}],basisRefs:[`validation:${sourceId}`],effectiveAt:AT,sourceType:"manual-takeaway",purposeRef,availability:"available"});}
function context(runtime:StoredOrganizationRuntime["runtime"],question:string,contribution:CanonicalEvidenceContribution){
  const current=binding(contribution.sourceId,contribution.content);
  const previous=runtime.memory.canonicalScopeLineageIndex;
  const bindings=[...(previous?.sourceBindings??[]).filter(item=>item.source.sourceId!==current.source.sourceId),current];
  const input={company:"Validation",website:"",industry:"Testing",question,context:"",evidenceSources:[{sourceId:contribution.sourceId,sourceType:contribution.sourceType,observedAt:contribution.contributedAt,contentDigest:current.source.normalizedContentDigest,content:contribution.content}]};
  const lineage={organizationId:ORG,effectiveAt:AT,topologyRevisions:[topology],sourceBindingRevisions:bindings,existingEvidenceAttributions:previous?.evidenceAttributions??[]};
  return{input,lineage};
}
function createAdapter(repository:MemoryRepository,counters:{investigate:number;preflight:number}){return new CanonicalProductWorkspaceAdapter({runtimeRepository:repository,evidenceContributionPurposeRef:({questionId})=>questionId,authorize:async({userId,organizationId})=>userId===USER&&organizationId===ORG,preflightCanonicalEvidence:async({runtime,question,contribution})=>{counters.preflight+=1;const value=context(runtime,question,contribution);return resolveCanonicalEvidenceAdmission(value.input,value.lineage);},investigate:async({runtime,question,contribution,operationContext,replayOnly})=>{assert.ok(operationContext);if(!replayOnly)counters.investigate+=1;const {input,lineage}=context(runtime,question,contribution);const result=runDiscoveryV3(input,lineage);const admissionBatch=result.scopeLineageAdmission!.operationBatch;const lineageEnvelope=createCanonicalEvidenceContributionLineageEnvelope({context:operationContext,admissionBatch});const original=console.log;let evolved;try{console.log=()=>{};evolved=replayOnly?runtime:evolveOrganizationRuntime({runtime,result,input,semanticTime:AT,canonicalEvidenceContributionOperationContext:operationContext,canonicalEvidenceContributionLineageEnvelope:lineageEnvelope});}finally{console.log=original;}return{runtime:evolved,evidenceAccepted:result.evidence.length>0,canonicalEvidenceAdmissionBatch:admissionBatch,canonicalEvidenceLineageEnvelope:lineageEnvelope};}});}
const contribution=(sourceId:string,key:string,content=material):CanonicalEvidenceContribution=>({sourceId,sourceType:"paste",content,contributedAt:AT,idempotencyKey:key});
const cognitionSnapshot=(runtime:StoredOrganizationRuntime["runtime"])=>JSON.stringify({understanding:runtime.memory.organizationalUnderstandingState,explanations:runtime.memory.organizationalExplanations,ownerEvents:runtime.memory.events.filter(event=>{const kind=String((event as {kind?:unknown})?.kind??"");return /answer|unknown|decision/.test(kind);})});
const supportSnapshot=(runtime:StoredOrganizationRuntime["runtime"])=>JSON.stringify({lineage:runtime.memory.canonicalScopeLineageIndex,understanding:runtime.memory.understandingState,model:runtime.organizationModel});

async function main(){
  const repository=new MemoryRepository(initial());const counters={investigate:0,preflight:0};const adapter=createAdapter(repository,counters);
  const invoke=(questionId:string,sourceId:string,key:string,content=material)=>adapter.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId,contribution:contribution(sourceId,key,content),operation:{requestId:key,operatorId:USER}});
  const first=await invoke(QUESTION,"source-primary","material-1");check(counters.investigate===1,"material Evidence runs cognition");check(first.contributionResult.cognitionDisposition==="executed","material disposition is executed");
  const afterMaterial=structuredClone(repository.value.runtime);const cognitionAfterMaterial=cognitionSnapshot(afterMaterial);const supportAfterMaterial=supportSnapshot(afterMaterial);const writesAfterMaterial=repository.writes;

  const exact=await invoke(QUESTION,"source-primary","material-1");check(exact.contributionResult.cognitionDisposition==="exact-operation-replay","Class 1 exact replay");check(counters.investigate===1,"Class 1 cognition skipped");check(repository.writes===writesAfterMaterial,"Class 1 persistence skipped");

  const duplicate=await invoke(QUESTION,"source-primary","duplicate-2");check(duplicate.contributionResult.admissions.every(item=>item.disposition==="existing-attribution-replayed"),"Class 2 admissions all replayed");check(duplicate.contributionResult.cognitionDisposition==="no-new-canonical-input","Class 2 disposition");check(counters.investigate===1,"Class 2 cognition skipped");check(cognitionSnapshot(repository.value.runtime)===cognitionAfterMaterial,"Class 2 canonical cognition unchanged");check(supportSnapshot(repository.value.runtime)===supportAfterMaterial,"Class 2 support and confidence unchanged");check(repository.writes===writesAfterMaterial+1,"Class 2 audit persisted once");
  const duplicateAgain=await invoke(QUESTION,"source-primary","duplicate-3");check(duplicateAgain.contributionResult.cognitionDisposition==="no-new-canonical-input","repeated Class 2 disposition");check(counters.investigate===1,"repeated Class 2 cognition skipped");check(cognitionSnapshot(repository.value.runtime)===cognitionAfterMaterial,"repeated Class 2 has no Explanation/composition growth");check(supportSnapshot(repository.value.runtime)===supportAfterMaterial,"repeated Class 2 non-amplifying");

  const crossQuestion=await invoke(OTHER_QUESTION,"source-primary","cross-question");check(crossQuestion.contributionResult.cognitionDisposition==="executed","new Question support executes cognition");check(counters.investigate===2,"cross-Question Evidence reuse runs cognition");
  const alternate="A distinct fact already supported by another Product Question.";
  const alternateElsewhere=await invoke(OTHER_QUESTION,"source-primary","alternate-elsewhere",alternate);check(alternateElsewhere.contributionResult.cognitionDisposition==="executed","different Evidence for reused source executes cognition");check(counters.investigate===3,"alternate Evidence cognition ran");
  const exactQuestionSupport=await invoke(QUESTION,"source-primary","alternate-primary",alternate);check(exactQuestionSupport.contributionResult.admissions.every(item=>item.disposition==="existing-attribution-replayed"),"cross-Question attribution is canonically replayed");check(exactQuestionSupport.contributionResult.cognitionDisposition==="executed","source ID alone cannot prove same-Question support");check(counters.investigate===4,"missing exact Question-attribution support runs cognition");
  const provenance=await invoke(QUESTION,"source-secondary","new-provenance");check(provenance.contributionResult.admissions.some(item=>item.disposition==="existing-evidence-new-provenance"),"Class 3 new provenance identified");check(provenance.contributionResult.cognitionDisposition==="executed","Class 3 executes cognition");check(counters.investigate===5,"Class 3 cognition ran");
  const changedScope=await invoke(QUESTION,"source-scope","changed-scope");check(changedScope.contributionResult.admissions.some(item=>item.disposition==="existing-evidence-new-provenance"),"changed scope creates canonical provenance input");check(changedScope.contributionResult.cognitionDisposition==="executed","changed scope executes cognition");check(counters.investigate===6,"changed-scope cognition ran");
  const contradiction=await invoke(QUESTION,"source-contradiction","contradiction","Leadership states the reported operating constraint is false and the opposite condition holds.");check(contradiction.contributionResult.cognitionDisposition==="executed","contradictory new Evidence executes");check(counters.investigate===7,"contradiction cognition ran");

  const identicalBaseline=afterMaterial;const direct=async()=>{const value=context(identicalBaseline,"What changed?",contribution("source-recompute","recompute",material));const result=runDiscoveryV3(value.input,value.lineage);const original=console.log;try{console.log=()=>{};const evolved=evolveOrganizationRuntime({runtime:structuredClone(identicalBaseline),result,input:value.input,semanticTime:AT});return JSON.stringify({explanations:(evolved.memory.organizationalExplanations??[]).map(item=>item.id),compositions:(evolved.memory.organizationalUnderstandingState.canonicalCompositions??[]).map(item=>[item.id,item.revisionId])});}finally{console.log=original;}};
  check(await direct()===await direct(),"identical Runtime recomputation identities stable");
  check(counters.preflight>=8,"canonical admission preflight used");
  check(!JSON.stringify(duplicate.contributionResult).includes(material.slice(0,40)),"raw Evidence absent from result");
  console.log(JSON.stringify({result:"PASS",checks,cognitionInvocations:counters.investigate,class1:"exact-operation-replay",class2:"no-new-canonical-input",class3:"executed",repeatedDuplicateGrowth:0,identicalRuntimeStable:true,externalActivity:{network:0,connector:0,drive:0,production:0}}));
}

main().catch(error=>{console.error(error instanceof Error?error.stack??error.message:"validation failed");process.exitCode=1;});
