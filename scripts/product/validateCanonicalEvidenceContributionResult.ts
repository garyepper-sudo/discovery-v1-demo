import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { resolveCanonicalEvidenceAdmission, runDiscoveryV3 } from "../../engine/v3";
import {
  admitCanonicalEvidenceScopeLineage,
  canonicalScopeLineageDigest,
  createCanonicalScopeTopology,
  createCanonicalSourceScopeBinding,
  type CanonicalEvidenceAdmissionOperationBatchV1,
  type CanonicalSourceScopeBinding,
} from "../../engine/v3/governance/canonicalScopeLineage";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { RuntimeStorageConflictError, type OrganizationRuntimeRepository, type StoredOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import type { CanonicalEvidenceContribution } from "../../product/integration/contracts";
import { createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { atlasIndustrialArtifacts } from "../../engine/benchmark/judgment-lab/atlasIndustrialPilot";

const ORG="operation-result-validation";const USER="authorized-user";const AT="2026-08-06T12:00:00.000Z";const QUESTION_ID="product-question-operation-result";
const GOVERNED_CONTENT=atlasIndustrialArtifacts.map(item=>item.content).join("\n\n");
const FIRST_GOVERNED_EVIDENCE=GOVERNED_CONTENT.split("\n").map(value=>value.trim()).find(Boolean)!;
const sha=(value:string)=>createHash("sha256").update(value).digest("hex");
const bytes=(value:unknown)=>new TextEncoder().encode(JSON.stringify(value,null,2));
const revision=(value:Uint8Array)=>createHash("sha256").update(value).digest("hex");
let checks=0;const check=(condition:unknown,message:string)=>{assert.ok(condition,message);checks+=1;};
const root={organizationId:ORG,type:"organization" as const,id:ORG};
const topology=createCanonicalScopeTopology({organizationId:ORG,topologyVersion:1,effectiveAt:AT,nodes:[root],relationships:[]});

class MemoryRepository implements Pick<OrganizationRuntimeRepository,"read"|"replace">{
  reads=0;writes=0;fail=false;
  constructor(public value:StoredOrganizationRuntime){}
  async read(organizationId:string){this.reads+=1;return organizationId===ORG?structuredClone(this.value):null;}
  async replace(organizationId:string,next:Uint8Array,expected:string){if(this.fail||organizationId!==ORG||expected!==this.value.revision)throw new RuntimeStorageConflictError("Runtime revision changed");const runtime=JSON.parse(Buffer.from(next).toString("utf8"));this.value={bytes:next,revision:revision(next),runtime};this.writes+=1;return structuredClone(this.value);}
}

function storedInitial():StoredOrganizationRuntime{
  const empty=createEmptyOrganizationRuntime({organizationId:ORG,name:"Validation"});
  const runtime=createDurableProductQuestion({runtime:empty,title:"What changed?",createdAt:AT,questionId:QUESTION_ID}).runtime;
  const encoded=bytes(runtime);return{bytes:encoded,revision:revision(encoded),runtime};
}

function binding(sourceId:string,content:string):CanonicalSourceScopeBinding{
  const digest=sha(content);return createCanonicalSourceScopeBinding({organizationId:ORG,bindingVersion:1,source:{sourceId,sourceVersion:"1",normalizedContentDigest:digest},topology,assertions:[{relationship:"origin",scope:root}],basisRefs:[`validation:${sourceId}`],effectiveAt:AT,sourceType:"manual-takeaway",purposeRef:QUESTION_ID,availability:"available"});
}

function investigationContext(runtime:StoredOrganizationRuntime["runtime"],question:string,contribution:CanonicalEvidenceContribution){
  const current=binding(contribution.sourceId,contribution.content);const previous=runtime.memory.canonicalScopeLineageIndex;
  const allBindings=[...(previous?.sourceBindings??[]).filter(item=>item.source.sourceId!==current.source.sourceId),current];
  const input={company:"Validation",website:"",industry:"Testing",question,context:"",evidenceSources:[{sourceId:contribution.sourceId,sourceType:contribution.sourceType,observedAt:contribution.contributedAt,contentDigest:current.source.normalizedContentDigest,content:contribution.content}]};
  const lineage={organizationId:ORG,effectiveAt:contribution.contributedAt,topologyRevisions:[topology],sourceBindingRevisions:allBindings,existingEvidenceAttributions:previous?.evidenceAttributions??[]};
  return{input,lineage};
}
function preflight(){return async ({runtime,question,contribution}:{runtime:StoredOrganizationRuntime["runtime"];question:string;contribution:CanonicalEvidenceContribution})=>{const context=investigationContext(runtime,question,contribution);return resolveCanonicalEvidenceAdmission(context.input,context.lineage);};}
function investigate(){return async ({runtime,question,contribution}:{runtime:StoredOrganizationRuntime["runtime"];question:string;contribution:CanonicalEvidenceContribution})=>{
  const {input,lineage}=investigationContext(runtime,question,contribution);
  const result=runDiscoveryV3(input,lineage);
  const canonicalEvidenceAdmissionBatch=result.scopeLineageAdmission!.operationBatch;
  const originalLog=console.log;let evolved;try{console.log=()=>{};evolved=evolveOrganizationRuntime({runtime,result,input,semanticTime:contribution.contributedAt});}finally{console.log=originalLog;}
  return{runtime:evolved,evidenceAccepted:result.evidence.length>0,canonicalEvidenceAdmissionBatch};
};}

const contribution=(sourceId:string,key:string,content:string):CanonicalEvidenceContribution=>({sourceId,sourceType:"paste",content,contributedAt:AT,idempotencyKey:key});

async function main(){
  const orderingBinding=binding("source-ordering","Order fact.");
  const orderingAdmission=admitCanonicalEvidenceScopeLineage({lineage:{organizationId:ORG,effectiveAt:AT,topologyRevisions:[topology],sourceBindingRevisions:[orderingBinding]},evidence:[{evidenceId:"E10",evidenceText:"Order fact.",sourceId:"source-ordering",contentDigest:orderingBinding.source.normalizedContentDigest},{evidenceId:"E2",evidenceText:"Order fact.",sourceId:"source-ordering",contentDigest:orderingBinding.source.normalizedContentDigest}]});
  check(orderingAdmission.operationBatch.admissions[0]!.investigationEvidenceIds.join(",")==="E2,E10","local Evidence IDs use parsed ordinal ordering");
  assert.throws(()=>admitCanonicalEvidenceScopeLineage({lineage:{organizationId:ORG,effectiveAt:AT,topologyRevisions:[topology],sourceBindingRevisions:[orderingBinding]},evidence:[{evidenceId:"E1",evidenceText:"Order fact.",sourceId:"source-ordering",contentDigest:orderingBinding.source.normalizedContentDigest},{evidenceId:"E1",evidenceText:"Order fact.",sourceId:"source-ordering",contentDigest:orderingBinding.source.normalizedContentDigest}]}));checks+=1;
  const repository=new MemoryRepository(storedInitial());const adapter=new CanonicalProductWorkspaceAdapter({runtimeRepository:repository,authorize:async({userId,organizationId})=>userId===USER&&organizationId===ORG,preflightCanonicalEvidence:preflight(),investigate:investigate()});
  const first=await adapter.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:QUESTION_ID,contribution:contribution("source-one","key-one",GOVERNED_CONTENT),operation:{requestId:"request-one",operatorId:USER}});
  check(first.contributionResult.admissions.length===16,"all sixteen governed Evidence admissions retained");
  check(first.contributionResult.operationDisposition==="admitted","all eligible governed Evidence is fully admitted");
  check(first.contributionResult.admissions.every(item=>item.disposition==="new-canonical-evidence"),"new Evidence disposition");
  check(new Set(first.contributionResult.admissions.map(item=>item.canonicalEvidenceId)).size===16,"all Evidence identities distinct");
  check(new Set(first.contributionResult.admissions.map(item=>item.canonicalAdmissionId)).size===16,"all admission identities distinct");
  check(first.contributionResult.admissions.every(item=>item.sourceBindings.length===1),"exact source bindings returned");
  check(first.contributionResult.admissions.map(item=>item.investigationEvidenceIds[0]).join(",")==Array.from({length:16},(_,index)=>`E${index+6}`).join(","),"local operation order retained without framing IDs");
  check(first.contributionResult.admissions.flatMap(item=>item.investigationEvidenceIds).every(id=>!["E1","E2","E3","E4","E5"].includes(id)),"framing local IDs are absent from the governed result");
  check(!JSON.stringify(first.contributionResult).includes(FIRST_GOVERNED_EVIDENCE),"Evidence body absent");
  check(first.contributionResult.evidenceAccepted,"evidenceAccepted compatibility");
  check(repository.writes===1,"one atomic write");
  const eventCount=repository.value.runtime.memory.events.filter(item=>(item as {kind?:string})?.kind==="canonical-evidence-contribution-operation").length;
  check(eventCount===1,"one operation record persisted");
  const writesBeforeReplay=repository.writes;
  const replay=await adapter.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:QUESTION_ID,contribution:contribution("source-one","key-one",GOVERNED_CONTENT),operation:{requestId:"request-replay",operatorId:USER}});
  check(replay.contributionResult.operationDisposition==="idempotent-replay","replay distinguished");
  check(replay.contributionResult.contributionOperationId===first.contributionResult.contributionOperationId,"operation identity stable");
  check(replay.contributionResult.canonicalResultDigest===first.contributionResult.canonicalResultDigest,"result digest stable");
  check(JSON.stringify(replay.contributionResult.admissions)===JSON.stringify(first.contributionResult.admissions),"ordered batch stable");
  check(repository.writes===writesBeforeReplay,"replay writes zero");
  await assert.rejects(()=>adapter.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:QUESTION_ID,contribution:contribution("source-one","key-one","Changed request."),operation:{requestId:"conflict",operatorId:USER}}));checks+=1;
  check(repository.writes===writesBeforeReplay,"conflicting replay writes zero");
  const provenance=await adapter.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:QUESTION_ID,contribution:contribution("source-two","key-two",FIRST_GOVERNED_EVIDENCE),operation:{requestId:"request-two",operatorId:USER}});
  check(provenance.contributionResult.admissions.length===1,"single admission supported");
  check(provenance.contributionResult.admissions[0]!.disposition==="existing-evidence-new-provenance","new provenance distinguished");
  check(provenance.contributionResult.admissions[0]!.canonicalEvidenceId===first.contributionResult.admissions[0]!.canonicalEvidenceId,"canonical Evidence reused");
  check(provenance.contributionResult.admissions[0]!.canonicalAdmissionId===first.contributionResult.admissions[0]!.canonicalAdmissionId,"admission identity preserved");
  check(provenance.contributionResult.admissions[0]!.sourceBindings.length===2,"multiple Source Bindings retained");
  check(["admitted","partially-admitted","not-admitted"].includes(first.contributionResult.operationDisposition),"partial disposition remains contractually supported but has no truthful source-bound rejection fixture");
  const emptyUnsigned={contractVersion:"1" as const,organizationId:ORG,admissions:[],admissionDisposition:"not-admitted" as const};const emptyBatch:CanonicalEvidenceAdmissionOperationBatchV1={...emptyUnsigned,batchDigest:canonicalScopeLineageDigest(emptyUnsigned)};
  const emptyAdapter=new CanonicalProductWorkspaceAdapter({runtimeRepository:repository,authorize:async()=>true,preflightCanonicalEvidence:async()=>({organizationId:ORG,topology,sourceBindings:[],evidenceAttributions:[],operationBatch:emptyBatch,digest:canonicalScopeLineageDigest({organizationId:ORG,topologyId:topology.topologyId,sourceBindingIds:[],evidenceAttributionIds:[]})}),investigate:async({runtime})=>({runtime,evidenceAccepted:false,canonicalEvidenceAdmissionBatch:emptyBatch})});
  const empty=await emptyAdapter.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:QUESTION_ID,contribution:contribution("unsupported-source","key-zero","Unsupported"),operation:{requestId:"request-zero",operatorId:USER}});
  check(empty.contributionResult.admissions.length===0,"zero admissions supported");
  check(empty.contributionResult.operationDisposition==="not-admitted","zero admission truthful");
  check(!empty.contributionResult.evidenceAccepted,"zero admission compatibility preserved");
  const deniedReads=repository.reads;const denied=new CanonicalProductWorkspaceAdapter({runtimeRepository:repository,authorize:async()=>false,preflightCanonicalEvidence:preflight(),investigate:investigate()});
  await assert.rejects(()=>denied.contributeEvidenceWithCanonicalResult({userId:"denied",organizationId:ORG,questionId:QUESTION_ID,contribution:contribution("source-denied","key-denied","Denied"),operation:{requestId:"denied",operatorId:"denied"}}));checks+=1;
  check(repository.reads===deniedReads,"authorization precedes Runtime read");
  await assert.rejects(()=>adapter.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:"wrong-question",contribution:contribution("source-x","key-x","Wrong"),operation:{requestId:"wrong",operatorId:USER}}));checks+=1;
  const noBatch=new CanonicalProductWorkspaceAdapter({runtimeRepository:repository,authorize:async()=>true,preflightCanonicalEvidence:preflight(),investigate:async({runtime})=>({runtime,evidenceAccepted:true})});
  await assert.rejects(()=>noBatch.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:QUESTION_ID,contribution:contribution("source-missing","key-missing","Missing"),operation:{requestId:"missing",operatorId:USER}}));checks+=1;
  const rejectTampered=async(transform:(batch:CanonicalEvidenceAdmissionOperationBatchV1)=>void,key:string)=>{const isolated=new MemoryRepository(storedInitial());const canonical=investigate();const service=new CanonicalProductWorkspaceAdapter({runtimeRepository:isolated,authorize:async()=>true,preflightCanonicalEvidence:preflight(),investigate:async(input)=>{const result=await canonical(input);const batch=structuredClone(result.canonicalEvidenceAdmissionBatch!);transform(batch);return{...result,canonicalEvidenceAdmissionBatch:batch};}});await assert.rejects(()=>service.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:QUESTION_ID,contribution:contribution(`source-${key}`,`key-${key}`,"Tamper fact."),operation:{requestId:key,operatorId:USER}}));checks+=1;check(isolated.writes===0,`${key} persisted no mutation`);};
  const resign=(batch:CanonicalEvidenceAdmissionOperationBatchV1)=>{const {batchDigest:_,...unsigned}=batch;batch.batchDigest=canonicalScopeLineageDigest(unsigned);};
  await rejectTampered(batch=>{batch.admissions[0]!.canonicalEvidenceId="canonical-evidence:v2:fabricated";resign(batch);},"fabricated-evidence");
  await rejectTampered(batch=>{batch.admissions[0]!.canonicalAdmissionId="evidence-admission:v2:fabricated";resign(batch);},"fabricated-admission");
  await rejectTampered(batch=>{batch.admissions.push(structuredClone(batch.admissions[0]!));resign(batch);},"duplicate-item");
  await rejectTampered(batch=>{batch.admissions[0]!.disposition="existing-attribution-replayed";resign(batch);},"false-replay-disposition");
  await rejectTampered(batch=>{batch.admissions[0]!.sourceBindings=[];resign(batch);},"missing-source-lineage");
  await rejectTampered(batch=>{batch.admissions[0]!.sourceBindings[0]!.sourceBindingId="source-scope-binding:fabricated";resign(batch);},"wrong-binding");
  await rejectTampered(batch=>{batch.admissions[0]!.attributionDigest="0".repeat(64);resign(batch);},"wrong-attribution-digest");
  await rejectTampered(batch=>{batch.batchDigest="0".repeat(64);},"wrong-batch-digest");
  const beforeConflictEvents=repository.value.runtime.memory.events.length;repository.fail=true;
  await assert.rejects(()=>adapter.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:QUESTION_ID,contribution:contribution("source-stale","key-stale","Stale"),operation:{requestId:"stale",operatorId:USER}}),RuntimeStorageConflictError);checks+=1;repository.fail=false;
  check(repository.value.runtime.memory.events.length===beforeConflictEvents,"failed persistence retains no result");
  const retained=repository.value.runtime.memory.canonicalScopeLineageIndex!;
  check(retained.evidenceAttributions.every(item=>item.evidenceId.startsWith("canonical-evidence:v2:")),"Evidence identity unchanged");
  check(retained.evidenceAttributions.every(item=>item.evidenceAdmissionId.startsWith("evidence-admission:v2:")),"admission identity unchanged");
  check(!JSON.stringify(repository.value.runtime.memory.understandingState).includes("canonical-evidence-contribution-operation"),"operation record excluded from cognition result");
  check(!JSON.stringify(repository.value.runtime.memory.canonicalScopeLineageIndex).includes("contributionOperationId"),"operation identity excluded from lineage identity");
  check(first.contributionResult.runtimeRevisionBefore!==first.contributionResult.runtimeRevisionAfter,"successful mutation revisions exact");
  check(replay.contributionResult.runtimeRevisionBefore===replay.contributionResult.runtimeRevisionAfter,"replay is no-write revision envelope");
  const recordIndex=repository.value.runtime.memory.events.findIndex(item=>(item as {kind?:string})?.kind==="canonical-evidence-contribution-operation");const originalRecord=structuredClone(repository.value.runtime.memory.events[recordIndex]);
  (repository.value.runtime.memory.events[recordIndex] as {recordDigest:string}).recordDigest="0".repeat(64);
  await assert.rejects(()=>adapter.contributeEvidenceWithCanonicalResult({userId:USER,organizationId:ORG,questionId:QUESTION_ID,contribution:contribution("source-one","key-one",GOVERNED_CONTENT),operation:{requestId:"tampered-record",operatorId:USER}}));checks+=1;
  repository.value.runtime.memory.events[recordIndex]=originalRecord;
  const serialized=JSON.stringify(first.contributionResult);
  check(!serialized.includes("key-one")&&!serialized.includes(USER),"raw key and authorization data absent");
  console.log(JSON.stringify({result:"PASS",checks,governedEvidenceCount:16,framingEvidenceCount:0,fullAdmission:true,partialDisposition:"contract-supported-unexercised",admissions:{zero:true,one:true,many:true},replay:true,externalActivity:{network:0,connector:0,drive:0,production:0}}));
}

main().catch(error=>{console.error(error instanceof Error?error.stack??error.message:"validation failed");process.exitCode=1;});
