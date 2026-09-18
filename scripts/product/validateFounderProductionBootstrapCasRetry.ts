import assert from "node:assert/strict";

import { CanonicalSourceBindingFailure } from "../../engine/v3/governance/canonicalLocalSourceBindingService";
import { registerProductionSourceBindingWithOneCasRefresh } from "../../product/integration/productionDesignPartnerBootstrap";

const ORG="organization-cas-retry",AT="2026-09-18T04:00:00.000Z",DIGEST="a".repeat(64);
const registration={contractVersion:"1" as const,organizationId:ORG,productQuestionId:"product-question-cas-retry",sourceType:"plain-text-upload" as const,purposeRef:"leadership-conversation-capture" as const,normalizedContentDigest:DIGEST,requestedScopeAssertions:[{relationship:"applies-to" as const,scope:{organizationId:ORG,type:"organization" as const,id:ORG}}],sensitivity:"standard" as const,authorization:{} as never,recordedAt:AT,recordedByActorRef:"participant:cas-retry",idempotencyKey:"bootstrap:source:one:binding",operation:{requestId:"bootstrap:source:one:binding",operatorId:"participant:cas-retry"}};
const resolution={contractVersion:"1" as const,organizationId:ORG,productQuestionId:registration.productQuestionId,sourceType:registration.sourceType,purposeRef:registration.purposeRef,normalizedContentDigest:DIGEST,requestedScopeAssertions:registration.requestedScopeAssertions,sensitivity:"standard" as const,authorization:{} as never,resolvedAt:AT};
const failure=(code:ConstructorParameters<typeof CanonicalSourceBindingFailure>[1],fallback=false)=>new CanonicalSourceBindingFailure("REGISTER",code,fallback,false);

type Trace = { reads: number; resolves: number; requests: Record<string, unknown>[] };

async function run(
  outcomes: ("success" | CanonicalSourceBindingFailure)[],
  revisions: string[] = ["runtime:N", "runtime:N+1"],
  trace: Trace = { reads: 0, resolves: 0, requests: [] },
) {
  const bindings = {
    registerCanonicalLocalSourceBinding: async (request: unknown) => {
      trace.requests.push(structuredClone(request) as Record<string, unknown>);
      const outcome = outcomes.shift()!;
      if (outcome !== "success") throw outcome;
      return { sourceBindingId: "source-binding:exact", receiptDigest: "receipt" };
    },
    resolveCanonicalCurrentSourceBinding: async () => {
      trace.resolves++;
      return { binding: { bindingId: "source-binding:exact" } };
    },
  };
  const runtime = {
    read: async () => ({ revision: revisions[Math.min(trace.reads++, revisions.length - 1)] }),
  };
  const result = await registerProductionSourceBindingWithOneCasRefresh({ bindings: bindings as never, runtime: runtime as never, registration, resolution });
  return { result, ...trace };
}

async function main(){
  let checks=0;
  const success=await run([failure("SOURCE_BINDING_CURRENT_REVISION_CONFLICT"),"success"]);
  assert.equal(success.result.sourceBindingId,"source-binding:exact");assert.equal(success.reads,2);assert.equal(success.resolves,0);assert.equal(success.requests.length,2);assert.equal(success.requests[0].expectedRuntimeRevision,"runtime:N");assert.equal(success.requests[1].expectedRuntimeRevision,"runtime:N+1");const {expectedRuntimeRevision:_,...first}=success.requests[0],{expectedRuntimeRevision:__,...second}=success.requests[1];assert.deepEqual(second,first);checks+=7;
  const secondConflictTrace: Trace = { reads: 0, resolves: 0, requests: [] };
  await assert.rejects(()=>run([failure("SOURCE_BINDING_CURRENT_REVISION_CONFLICT"),failure("SOURCE_BINDING_CURRENT_REVISION_CONFLICT")],undefined,secondConflictTrace),error=>error instanceof CanonicalSourceBindingFailure&&error.errorCode==="SOURCE_BINDING_CURRENT_REVISION_CONFLICT"&&!error.resolutionFallbackAllowed);assert.equal(secondConflictTrace.reads,2);assert.equal(secondConflictTrace.requests.length,2);assert.equal(secondConflictTrace.resolves,0);checks+=4;
  for(const code of ["SOURCE_BINDING_PERSISTENCE_FAILED","SOURCE_BINDING_ACCESS_DENIED","SOURCE_BINDING_UNKNOWN"] as const){const trace: Trace={reads:0,resolves:0,requests:[]};await assert.rejects(()=>run([failure(code)],undefined,trace),error=>error instanceof CanonicalSourceBindingFailure&&error.errorCode===code);assert.equal(trace.reads,1,`${code} has no retry`);assert.equal(trace.requests.length,1,`${code} has no retry`);assert.equal(trace.resolves,0,`${code} has no fallback`);checks+=4;}
  const fallback=await run([failure("SOURCE_BINDING_CURRENT_REVISION_CONFLICT",true)]);assert.equal(fallback.reads,1);assert.equal(fallback.resolves,1);assert.equal(fallback.requests.length,1);checks+=3;
  const normal=await run(["success"]);assert.equal(normal.reads,1);assert.equal(normal.resolves,0);assert.equal(normal.requests.length,1);checks+=3;
  console.log(JSON.stringify({validation:"founder-production-bootstrap-cas-retry-001",result:"PASS",checks,exactRevisionRefreshOnly:true,noGenericRetries:true,networkCalls:0,productionAccess:0,deploymentOperations:0}));
}
void main();
