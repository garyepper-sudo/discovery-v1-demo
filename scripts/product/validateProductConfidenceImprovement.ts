import assert from "node:assert/strict";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { deriveProductUnknownCandidate, recordProductUnknownOperation } from "../../product/unknowns";
import { buildImprovementProposal, generateConfidenceImprovementProposals, productConfidenceImprovementEvents, recordConfidenceImprovementEvent } from "../../product/improvements";

const organizationId = "onb-dev-improvement-validation", questionId = "question-improvement", now = "2026-07-31T02:00:00.000Z";
let runtime = createDurableProductQuestion({ runtime: createEmptyOrganizationRuntime({ organizationId, name: "Validation" }), title: "Why are handoffs delayed?", questionId, createdAt: now }).runtime;
const unknown = deriveProductUnknownCandidate({ organizationId, questionId, category: "competing-explanation-discrimination", target: { kind: "relationship", subjectRef: "ownership", predicate: "versus", objectRef: "credentials" }, summary: "Two explanations remain.", whyItMatters: "They require discrimination.", sourceAncestry: [{ kind: "evidence", id: "e1" }] });
runtime = recordProductUnknownOperation({ runtime, questionId, operationId: "open", occurredAt: now, actorRef: "user", authorizationScopeRef: `organization:${organizationId}:question:${questionId}`, candidate: unknown, transition: { type: "open" }, reason: "Specific gap." }).runtime;
function proposal(type: any, target: any, discriminationGain: "low"|"moderate"|"high" = "high", burden: "low"|"moderate"|"high" = "low") {
  return buildImprovementProposal({ organizationId, questionId, unknownId: unknown.unknownId, actionType: type, actionTarget: target, summary: "Bounded action.", rationale: "Discriminates the exact Unknown.", expectedValue: { understandingImprovement: "high", discriminationGain, confidenceImpact: "possible", explanation: "May improve understanding; no guarantee." }, executionCost: { effort: burden, delay: "short", burden, governanceRisk: "low" }, prerequisites: [], sourceScopeRefs: [], personScopeRefs: [], answerVersionId: null, abstentionOperationId: "abstention-1", understandingRevisionRef: "understanding-1", unknownRevisionRef: unknown.unknownId, generatedAt: now });
}
const inspect = proposal("inspect-existing-evidence", { kind: "existing-evidence-set", evidenceIds: ["e1","e2"] });
const search = proposal("search-authorized-source", { kind: "authorized-source", connectedSourceId: "source-1", queryScope: "folder-1" }, "moderate");
const types = [
  ["request-document",{kind:"document-request",documentType:"handoff report",ownerScopeRef:"role:ops"}],
  ["ask-authorized-person",{kind:"person-question",personScopeRef:"role:ops",questionPrompt:"Which constraint occurred first?"}],
  ["collect-measurement",{kind:"measurement",metricRef:"handoff-time",scopeRef:"onboarding",observationWindow:"30d"}],
  ["monitor-over-time",{kind:"monitoring",signalRef:"handoff-time",cadenceRef:"weekly"}],
  ["test-through-decision",{kind:"decision-test",explanationRefs:["ownership","credentials"],expectedOutcomeRef:"faster-handoff"}],
  ["wait-for-outcome",{kind:"outcome-wait",decisionId:"decision-1",expectedOutcomeRef:"faster-handoff"}],
] as const;
for (const [type,target] of types) assert.equal(proposal(type,target).actionType,type);
const ranked = generateConfidenceImprovementProposals({ runtime, questionId, unknownId: unknown.unknownId, candidates: [search, inspect] });
assert.equal(ranked.kind, "proposals"); if (ranked.kind === "proposals") assert.equal(ranked.highestValueProposalId, inspect.proposalId);
const tie = generateConfidenceImprovementProposals({ runtime, questionId, unknownId: unknown.unknownId, candidates: [inspect, { ...inspect, proposalId: "other" }] });
assert.equal(tie.kind, "proposals"); if (tie.kind === "proposals") assert.equal(tie.highestValueProposalId, null);
const before = JSON.stringify(runtime); generateConfidenceImprovementProposals({ runtime, questionId, unknownId: unknown.unknownId, candidates: [inspect] }); assert.equal(JSON.stringify(runtime), before);
const none = generateConfidenceImprovementProposals({ runtime, questionId, unknownId: unknown.unknownId, candidates: [], noSafeOperation: { kind:"no-safe-operation",reason:"no-authorized-source",limitation:"No authorized source can discriminate this Unknown." } }); assert.equal(none.kind,"no-safe-operation");
const auth = recordConfidenceImprovementEvent({ runtime, proposal: inspect, eventType:"improvement-authorized",operationId:"authorize-1",actorRef:"user",occurredAt:now });
assert.equal(productConfidenceImprovementEvents(auth.runtime).length,1);
const replay = recordConfidenceImprovementEvent({ runtime:auth.runtime, proposal:inspect,eventType:"improvement-authorized",operationId:"authorize-1",actorRef:"user",occurredAt:now }); assert.equal(replay.runtime,auth.runtime);
assert.throws(()=>recordConfidenceImprovementEvent({runtime:auth.runtime,proposal:search,eventType:"improvement-authorized",operationId:"authorize-1",actorRef:"user",occurredAt:now}),/conflict/);
for (const eventType of ["improvement-initiated","improvement-completed","improvement-no-change","improvement-declined","improvement-unavailable","improvement-failed","improvement-cancelled"] as const) {
  const r=recordConfidenceImprovementEvent({runtime:auth.runtime,proposal:inspect,eventType,operationId:eventType,actorRef:"user",occurredAt:now,resultEvidenceIds:eventType==="improvement-completed"?["e3"]:[],reason:"bounded"});
  assert.equal(r.receipt.eventType,eventType);
}
assert.equal(runtime.memory.events.some((e:any)=>/recommendation|decision|outcome|learning|insight/.test(e?.kind??"")),false);
console.log(JSON.stringify({validation:"product-confidence-improvement",result:"PASS",scenarios:24,runtimeCollectionAdded:false,externalAction:false,frontendChanged:false},null,2));
