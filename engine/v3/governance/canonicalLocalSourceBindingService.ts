import { createHash } from "node:crypto";

import type { OrganizationRuntimeRepository, RuntimeStorageOperationMetadata } from "../runtime/organizationRuntimeRepository";
import {
  createCanonicalLocalSourceVersionRef,
  createCanonicalScopeLineageIndex,
  createCanonicalSourceScopeBinding,
  readCanonicalScopeLineageTopology,
  resolveCurrentSourceScopeBinding,
  type CanonicalScopeTopology,
  type CanonicalSourceAvailability,
  type CanonicalSourceScopeBinding,
  type CanonicalSourceType,
  type SourceScopeAssertion,
} from "./canonicalScopeLineage";
import type { GovernedSensitivity, ScopedGovernanceContext, ScopedGovernanceOperation } from "./scopedGovernanceContext";

export const CANONICAL_LOCAL_SOURCE_BINDING_OPERATION_VERSION = "1" as const;
export type CanonicalLocalSourceTypeV1 = Exclude<CanonicalSourceType, "authorized-record">;
type CommonRequest = {
  contractVersion:"1"; organizationId:string; productQuestionId:string;
  sourceType:CanonicalLocalSourceTypeV1; purposeRef:"leadership-conversation-capture";
  normalizedContentDigest:string; requestedScopeAssertions:SourceScopeAssertion[];
  sensitivity:GovernedSensitivity; authorization:ScopedGovernanceContext;
};
export type RegisterCanonicalLocalSourceBindingRequestV1 = CommonRequest & {
  recordedAt:string; recordedByActorRef:string; idempotencyKey:string;
  expectedRuntimeRevision:string; operation:RuntimeStorageOperationMetadata;
};
export type ResolveCanonicalSourceBindingRequestV1 = CommonRequest & { resolvedAt:string };
export type ReviseCanonicalSourceBindingAvailabilityRequestV1 = CommonRequest & {
  availability:CanonicalSourceAvailability; recordedAt:string; recordedByActorRef:string;
  idempotencyKey:string; expectedRuntimeRevision:string; operation:RuntimeStorageOperationMetadata;
};
export type CanonicalLocalSourceBindingMutationReceiptV1 = {
  contractVersion:"1"; operationId:string; organizationId:string;
  sourceBindingId:string; bindingRevisionId:string; bindingDigest:string; bindingVersion:number;
  predecessorRevisionId:string|null; sourceType:CanonicalLocalSourceTypeV1;
  purposeRef:"leadership-conversation-capture"; availability:CanonicalSourceAvailability;
  normalizedContentDigest:string; topologyId:string; scopeAssertionRefs:string[];
  runtimeRevisionBefore:string; runtimeMutationDigestAfter:string;
  disposition:"registered"|"current-binding-reused"|"availability-revised";
  recordedAt:string; recordedByActorRef:string; idempotencyKeyDigest:string;
  requestFingerprint:string; resultDigest:string; receiptDigest:string;
};
export type ResolveCanonicalSourceBindingResultV1 = {
  contractVersion:"1"; organizationId:string; binding:CanonicalSourceScopeBinding;
  topology:CanonicalScopeTopology; runtimeRevision:string; resultDigest:string;
};
type OperationRecord={kind:"canonical-local-source-binding-operation";contractVersion:"1";organizationId:string;idempotencyKeyDigest:string;requestFingerprint:string;receipt:CanonicalLocalSourceBindingMutationReceiptV1;recordDigest:string};

const supportedTypes=new Set<CanonicalLocalSourceTypeV1>(["pasted-text","plain-text-upload","markdown-upload","manual-takeaway"]);
const stable=(value:unknown):string=>Array.isArray(value)?`[${value.map(stable).join(",")}]`:value&&typeof value==="object"?`{${Object.entries(value as Record<string,unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>`${JSON.stringify(key)}:${stable(item)}`).join(",")}}`:JSON.stringify(value);
const digest=(value:unknown):string=>createHash("sha256").update(stable(value)).digest("hex");
const exact=(value:string)=>value.trim()===value&&value.length>0&&value!=="*";
const timestamp=(value:string)=>exact(value)&&Number.isFinite(Date.parse(value));
const deny=():never=>{throw new Error("Canonical local Source Binding operation denied.");};
const assertionRef=(value:SourceScopeAssertion)=>`scope-assertion:${digest(value)}`;
const sameScope=(a:SourceScopeAssertion,b:SourceScopeAssertion)=>stable(a)===stable(b);
const records=(events:unknown[]):OperationRecord[]=>events.filter((item):item is OperationRecord=>Boolean(item&&typeof item==="object"&&(item as OperationRecord).kind==="canonical-local-source-binding-operation"));

export class CanonicalLocalSourceBindingService {
  constructor(private readonly runtimeRepository:Pick<OrganizationRuntimeRepository,"read"|"replace">,private readonly clock:{now():string}){}

  private authorize(request:CommonRequest,operation:ScopedGovernanceOperation,at:string,actor:string):void{
    const context=request.authorization;
    if(context.disposition!=="authorized"||context.organizationId!==request.organizationId||context.subjectId!==actor||context.operation!==operation||context.purpose!==request.purposeRef||context.sensitivity!==request.sensitivity||context.evaluatedAt!==at||context.temporal.mode!=="current"||context.requestedScope.organizationId!==request.organizationId||request.requestedScopeAssertions.length!==1||request.requestedScopeAssertions[0]!.relationship!=="applies-to"||!sameScope(request.requestedScopeAssertions[0]!,{relationship:"applies-to",scope:context.requestedScope}))deny();
  }
  private validateCommon(request:CommonRequest):void{
    const allowed=new Set(["contractVersion","organizationId","productQuestionId","sourceType","purposeRef","normalizedContentDigest","requestedScopeAssertions","sensitivity","authorization","recordedAt","recordedByActorRef","idempotencyKey","expectedRuntimeRevision","operation","resolvedAt","availability"]);
    if(Object.keys(request).some(key=>!allowed.has(key))||request.contractVersion!=="1"||!exact(request.organizationId)||!exact(request.productQuestionId)||!supportedTypes.has(request.sourceType)||request.purposeRef!=="leadership-conversation-capture"||!/^[a-f0-9]{64}$/.test(request.normalizedContentDigest)||request.sensitivity!=="standard")deny();
  }
  private source(request:CommonRequest){return createCanonicalLocalSourceVersionRef({organizationId:request.organizationId,sourceType:request.sourceType,purposeRef:request.purposeRef,normalizedContentDigest:request.normalizedContentDigest,assertions:request.requestedScopeAssertions});}
  private current(request:CommonRequest,index:{sourceBindings:CanonicalSourceScopeBinding[]},at:string){
    const source=this.source(request);const revisions=index.sourceBindings.filter(item=>item.organizationId===request.organizationId&&item.source.sourceId===source.sourceId);
    const current=resolveCurrentSourceScopeBinding(revisions,at);
    if(!current||current.source.normalizedContentDigest!==request.normalizedContentDigest||current.sourceType!==request.sourceType||current.purposeRef!==request.purposeRef||current.assertions.length!==request.requestedScopeAssertions.length||current.assertions.some((item,i)=>!sameScope(item,request.requestedScopeAssertions[i]!)))deny();
    return current;
  }
  private receipt(input:{request:RegisterCanonicalLocalSourceBindingRequestV1|ReviseCanonicalSourceBindingAvailabilityRequestV1;binding:CanonicalSourceScopeBinding;before:string;disposition:CanonicalLocalSourceBindingMutationReceiptV1["disposition"];keyDigest:string;fingerprint:string;indexDigest:string}):CanonicalLocalSourceBindingMutationReceiptV1{
    const operationId=`canonical-local-source-binding-operation:v1:${digest([input.request.organizationId,input.keyDigest,input.fingerprint])}`;
    const base={contractVersion:"1" as const,operationId,organizationId:input.request.organizationId,sourceBindingId:input.binding.bindingId,bindingRevisionId:input.binding.bindingId,bindingDigest:input.binding.digest,bindingVersion:input.binding.bindingVersion,predecessorRevisionId:input.binding.supersedesBindingId,sourceType:input.request.sourceType,purposeRef:input.request.purposeRef,availability:input.binding.availability!,normalizedContentDigest:input.binding.source.normalizedContentDigest,topologyId:input.binding.topologyId,scopeAssertionRefs:input.binding.assertions.map(assertionRef).sort(),runtimeRevisionBefore:input.before,runtimeMutationDigestAfter:`runtime-source-lineage:v1:${digest([input.before,input.indexDigest,operationId])}`,disposition:input.disposition,recordedAt:input.request.recordedAt,recordedByActorRef:input.request.recordedByActorRef,idempotencyKeyDigest:input.keyDigest,requestFingerprint:input.fingerprint};
    const resultDigest=digest({...base,resultDigest:undefined});return{...base,resultDigest,receiptDigest:digest({...base,resultDigest})};
  }
  private async mutate(request:RegisterCanonicalLocalSourceBindingRequestV1|ReviseCanonicalSourceBindingAvailabilityRequestV1,mode:"register"|"revise"):Promise<CanonicalLocalSourceBindingMutationReceiptV1>{
    this.validateCommon(request);if(!timestamp(request.recordedAt)||request.recordedAt!==this.clock.now()||!exact(request.recordedByActorRef)||!exact(request.idempotencyKey)||!exact(request.expectedRuntimeRevision))deny();
    this.authorize(request,mode==="register"?"source-binding:register-local":"source-binding:revise-availability",request.recordedAt,request.recordedByActorRef);
    const loaded=await this.runtimeRepository.read(request.organizationId);if(!loaded||loaded.runtime.metadata.organizationId!==request.organizationId)deny();const stored=loaded!;
    const loadedIndex=stored.runtime.memory.canonicalScopeLineageIndex;if(!loadedIndex)deny();const index=loadedIndex!;const topology=(()=>{try{return readCanonicalScopeLineageTopology(index)??deny();}catch{return deny();}})();
    const keyDigest=digest(["canonical-local-source-binding-idempotency",request.idempotencyKey]);
    const fingerprint=digest({mode,contractVersion:request.contractVersion,organizationId:request.organizationId,productQuestionId:request.productQuestionId,sourceType:request.sourceType,purposeRef:request.purposeRef,normalizedContentDigest:request.normalizedContentDigest,requestedScopeAssertions:request.requestedScopeAssertions,sensitivity:request.sensitivity,...(mode==="revise"?{availability:(request as ReviseCanonicalSourceBindingAvailabilityRequestV1).availability}:{}) ,recordedAt:request.recordedAt,recordedByActorRef:request.recordedByActorRef});
    const prior=records(stored.runtime.memory.events).find(item=>item.idempotencyKeyDigest===keyDigest);if(prior){const {recordDigest,...recordUnsigned}=prior;const {receiptDigest,...receiptUnsigned}=prior.receipt;const persistedBinding=index.sourceBindings.find(item=>item.bindingId===prior.receipt.sourceBindingId);if(recordDigest!==digest(recordUnsigned)||receiptDigest!==digest(receiptUnsigned)||prior.receipt.resultDigest!==digest({...receiptUnsigned,resultDigest:undefined})||prior.organizationId!==request.organizationId||prior.requestFingerprint!==fingerprint||!persistedBinding||persistedBinding.digest!==prior.receipt.bindingDigest)deny();return structuredClone(prior.receipt);}if(stored.revision!==request.expectedRuntimeRevision)deny();
    const source=this.source(request);const revisions=index.sourceBindings.filter(item=>item.source.sourceId===source.sourceId);let current:CanonicalSourceScopeBinding|undefined;
    if(revisions.length)current=this.current(request,index,request.recordedAt);
    let binding:CanonicalSourceScopeBinding;let disposition:CanonicalLocalSourceBindingMutationReceiptV1["disposition"];
    if(mode==="register"){
      if(current){if(current.availability!=="available")deny();binding=current;disposition="current-binding-reused";}
      else{binding=createCanonicalSourceScopeBinding({organizationId:request.organizationId,bindingVersion:1,source,topology,assertions:request.requestedScopeAssertions,basisRefs:[`product-question:${request.productQuestionId}`,`purpose:${request.purposeRef}`],effectiveAt:request.recordedAt,sourceType:request.sourceType,purposeRef:request.purposeRef,availability:"available"});disposition="registered";}
    }else{
      if(!current)deny();const priorCurrent=current!;const availability=(request as ReviseCanonicalSourceBindingAvailabilityRequestV1).availability;if(!["available","revoked"].includes(availability)||availability===priorCurrent.availability)deny();binding=createCanonicalSourceScopeBinding({organizationId:request.organizationId,bindingVersion:priorCurrent.bindingVersion+1,source:priorCurrent.source,topology,assertions:priorCurrent.assertions,basisRefs:priorCurrent.basisRefs,effectiveAt:request.recordedAt,supersedesBindingId:priorCurrent.bindingId,sourceType:priorCurrent.sourceType!,purposeRef:priorCurrent.purposeRef!,availability});disposition="availability-revised";
    }
    const sourceBindings=[...index.sourceBindings,...(index.sourceBindings.some(item=>item.bindingId===binding.bindingId)?[]:[binding])];
    const nextIndex=createCanonicalScopeLineageIndex({organizationId:request.organizationId,topology,sourceBindings,evidenceAttributions:index.evidenceAttributions,derivedLineages:index.derivedLineages});
    const receipt=this.receipt({request,binding,before:stored.revision,disposition,keyDigest,fingerprint,indexDigest:nextIndex.digest});
    const recordBase={kind:"canonical-local-source-binding-operation" as const,contractVersion:"1" as const,organizationId:request.organizationId,idempotencyKeyDigest:keyDigest,requestFingerprint:fingerprint,receipt};const record={...recordBase,recordDigest:digest(recordBase)};
    const runtime={...stored.runtime,memory:{...stored.runtime.memory,canonicalScopeLineageIndex:nextIndex,events:[...stored.runtime.memory.events,record]}};
    let persisted:Awaited<ReturnType<OrganizationRuntimeRepository["replace"]>>;try{persisted=await this.runtimeRepository.replace(request.organizationId,new TextEncoder().encode(JSON.stringify(runtime,null,2)),stored.revision,request.operation);}catch{return deny();}
    const persistedRecord=records(persisted.runtime.memory.events).find(item=>item.receipt.operationId===receipt.operationId);if(!persistedRecord||persistedRecord.recordDigest!==record.recordDigest||persisted.runtime.memory.canonicalScopeLineageIndex?.digest!==nextIndex.digest)deny();
    return structuredClone(receipt);
  }
  registerCanonicalLocalSourceBinding(request:RegisterCanonicalLocalSourceBindingRequestV1){return this.mutate(request,"register");}
  reviseCanonicalSourceBindingAvailability(request:ReviseCanonicalSourceBindingAvailabilityRequestV1){return this.mutate(request,"revise");}
  async resolveCanonicalCurrentSourceBinding(request:ResolveCanonicalSourceBindingRequestV1):Promise<ResolveCanonicalSourceBindingResultV1>{
    this.validateCommon(request);if(!timestamp(request.resolvedAt)||request.resolvedAt!==this.clock.now())deny();this.authorize(request,"source-binding:resolve-current",request.resolvedAt,request.authorization.subjectId);
    const loaded=await this.runtimeRepository.read(request.organizationId);if(!loaded||loaded.runtime.metadata.organizationId!==request.organizationId)deny();const stored=loaded!;const loadedIndex=stored.runtime.memory.canonicalScopeLineageIndex;if(!loadedIndex)deny();const index=loadedIndex!;const topology=(()=>{try{return readCanonicalScopeLineageTopology(index)??deny();}catch{return deny();}})();const current=this.current(request,index,request.resolvedAt);if(!current||current.availability!=="available")deny();const binding=current!;const base={contractVersion:"1" as const,organizationId:request.organizationId,binding:structuredClone(binding),topology,runtimeRevision:stored.revision};return{...base,resultDigest:digest(base)};
  }
}
