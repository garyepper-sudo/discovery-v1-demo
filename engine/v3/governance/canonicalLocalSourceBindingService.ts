import { createHash } from "node:crypto";

import { RuntimeStorageConflictError, type OrganizationRuntimeRepository, type RuntimeStorageOperationMetadata } from "../runtime/organizationRuntimeRepository";
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
const assertionRef=(value:SourceScopeAssertion)=>`scope-assertion:${digest(value)}`;
const sameScope=(a:SourceScopeAssertion,b:SourceScopeAssertion)=>stable(a)===stable(b);
const records=(events:unknown[]):OperationRecord[]=>events.filter((item):item is OperationRecord=>Boolean(item&&typeof item==="object"&&(item as OperationRecord).kind==="canonical-local-source-binding-operation"));

export type CanonicalSourceBindingOperation = "REGISTER" | "REVISE_AVAILABILITY" | "RESOLVE_CURRENT";
export type CanonicalSourceBindingErrorCode = "SOURCE_BINDING_ACCESS_DENIED" | "SOURCE_BINDING_DUPLICATE_CONFLICT" | "SOURCE_BINDING_CURRENT_REVISION_CONFLICT" | "SOURCE_BINDING_INVALID_SOURCE_IDENTITY" | "SOURCE_BINDING_NOT_FOUND" | "SOURCE_BINDING_PERSISTENCE_FAILED" | "SOURCE_BINDING_UNKNOWN";
export class CanonicalSourceBindingFailure extends Error {
  constructor(readonly operation: CanonicalSourceBindingOperation, readonly errorCode: CanonicalSourceBindingErrorCode, readonly resolutionFallbackAllowed:boolean, readonly durableWriteOccurred: boolean | "unknown" = false) { super("Canonical local Source Binding operation failed."); this.name="CanonicalSourceBindingFailure"; }
}
const sourceBindingFailure=(operation:CanonicalSourceBindingOperation,errorCode:CanonicalSourceBindingErrorCode,resolutionFallbackAllowed=false,durableWriteOccurred:boolean|"unknown"=false):never=>{throw new CanonicalSourceBindingFailure(operation,errorCode,resolutionFallbackAllowed,durableWriteOccurred);};
function unknownSourceBindingFailure(error: unknown, operation: CanonicalSourceBindingOperation): CanonicalSourceBindingFailure {
  if (error instanceof CanonicalSourceBindingFailure) return error;
  return new CanonicalSourceBindingFailure(operation,"SOURCE_BINDING_UNKNOWN",false,"unknown");
}

export class CanonicalLocalSourceBindingService {
  constructor(private readonly runtimeRepository:Pick<OrganizationRuntimeRepository,"read"|"replace">,private readonly clock:{now():string}){}

  private authorize(request:CommonRequest,operation:ScopedGovernanceOperation,at:string,actor:string, failureOperation:CanonicalSourceBindingOperation):void{
    const context=request.authorization;
    if(context.disposition!=="authorized"||context.organizationId!==request.organizationId||context.subjectId!==actor||context.operation!==operation||context.purpose!==request.purposeRef||context.sensitivity!==request.sensitivity||context.evaluatedAt!==at||context.temporal.mode!=="current"||context.requestedScope.organizationId!==request.organizationId||!sameScope(request.requestedScopeAssertions[0]!,{relationship:"applies-to",scope:context.requestedScope}))sourceBindingFailure(failureOperation,"SOURCE_BINDING_ACCESS_DENIED");
  }
  private validateCommon(request:CommonRequest, failureOperation:CanonicalSourceBindingOperation):void{
    const allowed=new Set(["contractVersion","organizationId","productQuestionId","sourceType","purposeRef","normalizedContentDigest","requestedScopeAssertions","sensitivity","authorization","recordedAt","recordedByActorRef","idempotencyKey","expectedRuntimeRevision","operation","resolvedAt","availability"]);
    if(Object.keys(request).some(key=>!allowed.has(key))||request.contractVersion!=="1"||!exact(request.organizationId)||!exact(request.productQuestionId)||!supportedTypes.has(request.sourceType)||request.purposeRef!=="leadership-conversation-capture"||!/^[a-f0-9]{64}$/.test(request.normalizedContentDigest)||request.sensitivity!=="standard"||request.requestedScopeAssertions.length!==1||request.requestedScopeAssertions[0]?.relationship!=="applies-to")sourceBindingFailure(failureOperation,"SOURCE_BINDING_INVALID_SOURCE_IDENTITY");
  }
  private source(request:CommonRequest, failureOperation:CanonicalSourceBindingOperation):ReturnType<typeof createCanonicalLocalSourceVersionRef>{try{return createCanonicalLocalSourceVersionRef({organizationId:request.organizationId,sourceType:request.sourceType,purposeRef:request.purposeRef,normalizedContentDigest:request.normalizedContentDigest,assertions:request.requestedScopeAssertions});}catch{return sourceBindingFailure(failureOperation,"SOURCE_BINDING_INVALID_SOURCE_IDENTITY");}}
  private current(request:CommonRequest,index:{sourceBindings:CanonicalSourceScopeBinding[]},at:string, failureOperation:CanonicalSourceBindingOperation){
    const source=this.source(request,failureOperation);const revisions=index.sourceBindings.filter(item=>item.organizationId===request.organizationId&&item.source.sourceId===source.sourceId);
    let current:CanonicalSourceScopeBinding|undefined;try{current=resolveCurrentSourceScopeBinding(revisions,at);}catch{sourceBindingFailure(failureOperation,"SOURCE_BINDING_UNKNOWN");}
    if(!current||current.source.normalizedContentDigest!==request.normalizedContentDigest||current.sourceType!==request.sourceType||current.purposeRef!==request.purposeRef||current.assertions.length!==request.requestedScopeAssertions.length||current.assertions.some((item,i)=>!sameScope(item,request.requestedScopeAssertions[i]!)))sourceBindingFailure(failureOperation,"SOURCE_BINDING_NOT_FOUND");
    return current;
  }
  private hasEquivalentCurrentBinding(request:CommonRequest,index:{sourceBindings:CanonicalSourceScopeBinding[]},at:string):boolean{
    try{const source=createCanonicalLocalSourceVersionRef({organizationId:request.organizationId,sourceType:request.sourceType,purposeRef:request.purposeRef,normalizedContentDigest:request.normalizedContentDigest,assertions:request.requestedScopeAssertions}),current=resolveCurrentSourceScopeBinding(index.sourceBindings.filter(item=>item.organizationId===request.organizationId&&item.source.sourceId===source.sourceId),at);return Boolean(current&&current.availability==="available"&&current.source.normalizedContentDigest===request.normalizedContentDigest&&current.sourceType===request.sourceType&&current.purposeRef===request.purposeRef&&current.assertions.length===request.requestedScopeAssertions.length&&!current.assertions.some((item,i)=>!sameScope(item,request.requestedScopeAssertions[i]!)));}catch{return false;}
  }
  private async reconciliationAvailable(request:CommonRequest,at:string):Promise<boolean>{
    try{const loaded=await this.runtimeRepository.read(request.organizationId),index=loaded?.runtime.memory.canonicalScopeLineageIndex;return Boolean(loaded&&loaded.runtime.metadata.organizationId===request.organizationId&&index&&this.hasEquivalentCurrentBinding(request,index,at));}catch{return false;}
  }
  private receipt(input:{request:RegisterCanonicalLocalSourceBindingRequestV1|ReviseCanonicalSourceBindingAvailabilityRequestV1;binding:CanonicalSourceScopeBinding;before:string;disposition:CanonicalLocalSourceBindingMutationReceiptV1["disposition"];keyDigest:string;fingerprint:string;indexDigest:string}):CanonicalLocalSourceBindingMutationReceiptV1{
    const operationId=`canonical-local-source-binding-operation:v1:${digest([input.request.organizationId,input.keyDigest,input.fingerprint])}`;
    const base={contractVersion:"1" as const,operationId,organizationId:input.request.organizationId,sourceBindingId:input.binding.bindingId,bindingRevisionId:input.binding.bindingId,bindingDigest:input.binding.digest,bindingVersion:input.binding.bindingVersion,predecessorRevisionId:input.binding.supersedesBindingId,sourceType:input.request.sourceType,purposeRef:input.request.purposeRef,availability:input.binding.availability!,normalizedContentDigest:input.binding.source.normalizedContentDigest,topologyId:input.binding.topologyId,scopeAssertionRefs:input.binding.assertions.map(assertionRef).sort(),runtimeRevisionBefore:input.before,runtimeMutationDigestAfter:`runtime-source-lineage:v1:${digest([input.before,input.indexDigest,operationId])}`,disposition:input.disposition,recordedAt:input.request.recordedAt,recordedByActorRef:input.request.recordedByActorRef,idempotencyKeyDigest:input.keyDigest,requestFingerprint:input.fingerprint};
    const resultDigest=digest({...base,resultDigest:undefined});return{...base,resultDigest,receiptDigest:digest({...base,resultDigest})};
  }
  private async mutate(request:RegisterCanonicalLocalSourceBindingRequestV1|ReviseCanonicalSourceBindingAvailabilityRequestV1,mode:"register"|"revise"):Promise<CanonicalLocalSourceBindingMutationReceiptV1>{
    const failureOperation:CanonicalSourceBindingOperation=mode==="register"?"REGISTER":"REVISE_AVAILABILITY";
    this.validateCommon(request,failureOperation);if(!timestamp(request.recordedAt)||request.recordedAt!==this.clock.now()||!exact(request.recordedByActorRef)||!exact(request.idempotencyKey)||!exact(request.expectedRuntimeRevision))sourceBindingFailure(failureOperation,"SOURCE_BINDING_INVALID_SOURCE_IDENTITY");
    this.authorize(request,mode==="register"?"source-binding:register-local":"source-binding:revise-availability",request.recordedAt,request.recordedByActorRef,failureOperation);
    let loaded:Awaited<ReturnType<OrganizationRuntimeRepository["read"]>>|undefined;try{loaded=await this.runtimeRepository.read(request.organizationId);}catch{sourceBindingFailure(failureOperation,"SOURCE_BINDING_PERSISTENCE_FAILED",false,"unknown");}if(!loaded||loaded.runtime.metadata.organizationId!==request.organizationId)sourceBindingFailure(failureOperation,"SOURCE_BINDING_NOT_FOUND");const stored=loaded!;
    const loadedIndex=stored.runtime.memory.canonicalScopeLineageIndex;if(!loadedIndex)sourceBindingFailure(failureOperation,"SOURCE_BINDING_UNKNOWN");const index=loadedIndex!;let topology:CanonicalScopeTopology|undefined;try{topology=readCanonicalScopeLineageTopology(index);}catch{sourceBindingFailure(failureOperation,"SOURCE_BINDING_UNKNOWN");}if(!topology)sourceBindingFailure(failureOperation,"SOURCE_BINDING_UNKNOWN");const canonicalTopology=topology!;
    const keyDigest=digest(["canonical-local-source-binding-idempotency",request.idempotencyKey]);
    const fingerprint=digest({mode,contractVersion:request.contractVersion,organizationId:request.organizationId,productQuestionId:request.productQuestionId,sourceType:request.sourceType,purposeRef:request.purposeRef,normalizedContentDigest:request.normalizedContentDigest,requestedScopeAssertions:request.requestedScopeAssertions,sensitivity:request.sensitivity,...(mode==="revise"?{availability:(request as ReviseCanonicalSourceBindingAvailabilityRequestV1).availability}:{}) ,recordedAt:request.recordedAt,recordedByActorRef:request.recordedByActorRef});
    const prior=records(stored.runtime.memory.events).find(item=>item.idempotencyKeyDigest===keyDigest);if(prior){const {recordDigest,...recordUnsigned}=prior;const {receiptDigest,...receiptUnsigned}=prior.receipt;const persistedBinding=index.sourceBindings.find(item=>item.bindingId===prior.receipt.sourceBindingId);if(recordDigest!==digest(recordUnsigned)||receiptDigest!==digest(receiptUnsigned)||prior.receipt.resultDigest!==digest({...receiptUnsigned,resultDigest:undefined})||prior.organizationId!==request.organizationId||!persistedBinding||persistedBinding.digest!==prior.receipt.bindingDigest)sourceBindingFailure(failureOperation,"SOURCE_BINDING_UNKNOWN");if(prior.requestFingerprint!==fingerprint)sourceBindingFailure(failureOperation,"SOURCE_BINDING_DUPLICATE_CONFLICT");return structuredClone(prior.receipt);}if(stored.revision!==request.expectedRuntimeRevision)sourceBindingFailure(failureOperation,"SOURCE_BINDING_CURRENT_REVISION_CONFLICT",this.hasEquivalentCurrentBinding(request,index,request.recordedAt));
    const source=this.source(request,failureOperation);const revisions=index.sourceBindings.filter(item=>item.source.sourceId===source.sourceId);let current:CanonicalSourceScopeBinding|undefined;
    if(revisions.length)current=this.current(request,index,request.recordedAt,failureOperation);
    let binding!:CanonicalSourceScopeBinding;let disposition:CanonicalLocalSourceBindingMutationReceiptV1["disposition"];
    if(mode==="register"){
      if(current){if(current.availability!=="available")sourceBindingFailure(failureOperation,"SOURCE_BINDING_DUPLICATE_CONFLICT");binding=current;disposition="current-binding-reused";}
      else{try{binding=createCanonicalSourceScopeBinding({organizationId:request.organizationId,bindingVersion:1,source,topology:canonicalTopology,assertions:request.requestedScopeAssertions,basisRefs:[`product-question:${request.productQuestionId}`,`purpose:${request.purposeRef}`],effectiveAt:request.recordedAt,sourceType:request.sourceType,purposeRef:request.purposeRef,availability:"available"});}catch{sourceBindingFailure(failureOperation,"SOURCE_BINDING_INVALID_SOURCE_IDENTITY");}disposition="registered";}
    }else{
      if(!current)sourceBindingFailure(failureOperation,"SOURCE_BINDING_NOT_FOUND");const priorCurrent=current!;const availability=(request as ReviseCanonicalSourceBindingAvailabilityRequestV1).availability;if(!["available","revoked"].includes(availability)||availability===priorCurrent.availability)sourceBindingFailure(failureOperation,"SOURCE_BINDING_INVALID_SOURCE_IDENTITY");try{binding=createCanonicalSourceScopeBinding({organizationId:request.organizationId,bindingVersion:priorCurrent.bindingVersion+1,source:priorCurrent.source,topology:canonicalTopology,assertions:priorCurrent.assertions,basisRefs:priorCurrent.basisRefs,effectiveAt:request.recordedAt,supersedesBindingId:priorCurrent.bindingId,sourceType:priorCurrent.sourceType!,purposeRef:priorCurrent.purposeRef!,availability});}catch{sourceBindingFailure(failureOperation,"SOURCE_BINDING_UNKNOWN");}disposition="availability-revised";
    }
    const sourceBindings=[...index.sourceBindings,...(index.sourceBindings.some(item=>item.bindingId===binding.bindingId)?[]:[binding])];
    let nextIndex!:ReturnType<typeof createCanonicalScopeLineageIndex>;try{nextIndex=createCanonicalScopeLineageIndex({organizationId:request.organizationId,topology:canonicalTopology,sourceBindings,evidenceAttributions:index.evidenceAttributions,derivedLineages:index.derivedLineages});}catch{sourceBindingFailure(failureOperation,"SOURCE_BINDING_UNKNOWN");}
    const receipt=this.receipt({request,binding,before:stored.revision,disposition,keyDigest,fingerprint,indexDigest:nextIndex.digest});
    const recordBase={kind:"canonical-local-source-binding-operation" as const,contractVersion:"1" as const,organizationId:request.organizationId,idempotencyKeyDigest:keyDigest,requestFingerprint:fingerprint,receipt};const record={...recordBase,recordDigest:digest(recordBase)};
    const runtime={...stored.runtime,memory:{...stored.runtime.memory,canonicalScopeLineageIndex:nextIndex,events:[...stored.runtime.memory.events,record]}};
    let persisted!:Awaited<ReturnType<OrganizationRuntimeRepository["replace"]>>;try{persisted=await this.runtimeRepository.replace(request.organizationId,new TextEncoder().encode(JSON.stringify(runtime,null,2)),stored.revision,request.operation);}catch(error){if(error instanceof RuntimeStorageConflictError)sourceBindingFailure(failureOperation,"SOURCE_BINDING_CURRENT_REVISION_CONFLICT",await this.reconciliationAvailable(request,request.recordedAt));sourceBindingFailure(failureOperation,"SOURCE_BINDING_PERSISTENCE_FAILED",false,"unknown");}
    const persistedRecord=records(persisted.runtime.memory.events).find(item=>item.receipt.operationId===receipt.operationId);if(!persistedRecord||persistedRecord.recordDigest!==record.recordDigest||persisted.runtime.memory.canonicalScopeLineageIndex?.digest!==nextIndex.digest)sourceBindingFailure(failureOperation,"SOURCE_BINDING_UNKNOWN",false,"unknown");
    return structuredClone(receipt);
  }
  async registerCanonicalLocalSourceBinding(request:RegisterCanonicalLocalSourceBindingRequestV1){try{return await this.mutate(request,"register");}catch(error){throw unknownSourceBindingFailure(error,"REGISTER");}}
  async reviseCanonicalSourceBindingAvailability(request:ReviseCanonicalSourceBindingAvailabilityRequestV1){try{return await this.mutate(request,"revise");}catch(error){throw unknownSourceBindingFailure(error,"REVISE_AVAILABILITY");}}
  async resolveCanonicalCurrentSourceBinding(request:ResolveCanonicalSourceBindingRequestV1):Promise<ResolveCanonicalSourceBindingResultV1>{
    try {
    this.validateCommon(request,"RESOLVE_CURRENT");if(!timestamp(request.resolvedAt)||request.resolvedAt!==this.clock.now())sourceBindingFailure("RESOLVE_CURRENT","SOURCE_BINDING_INVALID_SOURCE_IDENTITY");this.authorize(request,"source-binding:resolve-current",request.resolvedAt,request.authorization.subjectId,"RESOLVE_CURRENT");
    let loaded:Awaited<ReturnType<OrganizationRuntimeRepository["read"]>>|undefined;try{loaded=await this.runtimeRepository.read(request.organizationId);}catch{sourceBindingFailure("RESOLVE_CURRENT","SOURCE_BINDING_PERSISTENCE_FAILED",false,"unknown");}if(!loaded||loaded.runtime.metadata.organizationId!==request.organizationId)sourceBindingFailure("RESOLVE_CURRENT","SOURCE_BINDING_NOT_FOUND");const stored=loaded!;const loadedIndex=stored.runtime.memory.canonicalScopeLineageIndex;if(!loadedIndex)sourceBindingFailure("RESOLVE_CURRENT","SOURCE_BINDING_UNKNOWN");const index=loadedIndex!;let topology:CanonicalScopeTopology|undefined;try{topology=readCanonicalScopeLineageTopology(index);}catch{sourceBindingFailure("RESOLVE_CURRENT","SOURCE_BINDING_UNKNOWN");}if(!topology)sourceBindingFailure("RESOLVE_CURRENT","SOURCE_BINDING_UNKNOWN");const current=this.current(request,index,request.resolvedAt,"RESOLVE_CURRENT")!;if(current.availability!=="available")sourceBindingFailure("RESOLVE_CURRENT","SOURCE_BINDING_NOT_FOUND");const binding=current;const base={contractVersion:"1" as const,organizationId:request.organizationId,binding:structuredClone(binding),topology:topology!,runtimeRevision:stored.revision};return{...base,resultDigest:digest(base)};
    } catch(error) { throw unknownSourceBindingFailure(error,"RESOLVE_CURRENT"); }
  }
}
