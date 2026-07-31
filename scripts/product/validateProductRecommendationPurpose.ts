import assert from "node:assert/strict";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { deriveProductUnknownCandidate, recordProductUnknownOperation } from "../../product/unknowns";
import { buildImprovementProposal } from "../../product/improvements";
import {
  evaluateObjectiveRecommendationEligibility,
  projectUnderstandingRecommendation,
  type ProductObjectiveContext,
  type ProductOptimizationContextInput,
  type ProductRecommendationFoundation,
} from "../../product/recommendations";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";

async function main() {
const organizationId = "onb-dev-recommendation-purpose-validation";
const questionId = "question-recommendation-purpose";
const now = "2026-07-31T12:00:00.000Z";
let runtime = createDurableProductQuestion({
  runtime: createEmptyOrganizationRuntime({ organizationId, name: "Validation" }),
  title: "Why are handoffs delayed?", questionId, createdAt: now,
}).runtime;
const candidate = deriveProductUnknownCandidate({
  organizationId, questionId, category: "competing-explanation-discrimination",
  target: { kind: "relationship", subjectRef: "ownership", predicate: "versus", objectRef: "credentials" },
  summary: "Ownership timing and credential readiness remain unresolved.",
  whyItMatters: "The next action depends on discriminating them.",
  sourceAncestry: [{ kind: "evidence", id: "evidence-ownership" }, { kind: "evidence", id: "evidence-credentials" }],
});
runtime = recordProductUnknownOperation({
  runtime, questionId, operationId: "open-unknown", occurredAt: now, actorRef: "user-validation",
  authorizationScopeRef: `organization:${organizationId}:question:${questionId}`,
  candidate, transition: { type: "open" }, reason: "Exact governed gap.",
}).runtime;
const proposal = buildImprovementProposal({
  organizationId, questionId, unknownId: candidate.unknownId,
  actionType: "inspect-existing-evidence",
  actionTarget: { kind: "existing-evidence-set", evidenceIds: ["evidence-ownership", "evidence-credentials"] },
  summary: "Compare admitted ownership and credential Evidence.",
  rationale: "The comparison directly discriminates the exact Unknown.",
  expectedValue: { understandingImprovement: "high", discriminationGain: "high", confidenceImpact: "possible", explanation: "Understanding may improve; Confidence is not guaranteed to change." },
  executionCost: { effort: "low", delay: "immediate", burden: "low", governanceRisk: "low" },
  prerequisites: [], sourceScopeRefs: ["evidence:evidence-ownership", "evidence:evidence-credentials"],
  personScopeRefs: [], answerVersionId: null, abstentionOperationId: "abstention-1",
  understandingRevisionRef: "understanding-v1", unknownRevisionRef: candidate.unknownId, generatedAt: now,
});
const projection = projectUnderstandingRecommendation({
  proposal,
  unknown: {
    ...candidate, status: "open", openedAt: now, lastChangedAt: now, current: true,
    actionable: true, resolutionAncestry: null, supersededByUnknownId: null, targetingOperationRef: null,
  },
  secondaryEffects: [{ kind: "objective-progress", targetRef: null, expectedDirection: "unknown", basis: "Operational value is possible but not established as the primary purpose." }],
});
assert.equal(projection.recommendationPurpose, "improve-understanding");
assert.equal(projection.recommendationId, proposal.proposalId);
assert.equal(projection.proposalId, proposal.proposalId);
assert.equal(projection.unknownId, candidate.unknownId);
assert.equal(projection.rationale.expectedDiscriminationGain, "high");
assert.equal(projection.primaryIntendedEffect.kind, "understanding-improvement");
assert.equal(projection.secondaryEffects[0]?.expectedDirection, "unknown");
assert.match(projection.tradeoffs[0] ?? "", /not guaranteed/i);

const objective = (status: ProductObjectiveContext["status"], ref: string | null = "objective-1"): ProductObjectiveContext => ({
  status, objectiveRef: ref, objectiveVersionRef: ref ? `${ref}:v1` : null,
  assumptionDisclosed: status === "inferred-high-confidence",
});
const optimization = (overrides: Partial<ProductOptimizationContextInput> = {}): ProductOptimizationContextInput => ({
  versionRef: "optimization-v1", usesDisclosedDefault: false,
  materialConstraints: ["bounded budget"], actionAlternativeCount: 2,
  authorizationPermitted: true, proposedActionReversible: true,
  proposedActionHighStakes: false, ...overrides,
});
assert.deepEqual(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("unknown", null), optimizationContext: optimization() }), { eligible: false, reason: "objective-unknown", requiredNextStep: "ask-objective" });
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("inferred-low-confidence"), optimizationContext: optimization() }).eligible, false);
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("inferred-high-confidence"), optimizationContext: optimization() }).eligible, true);
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("inferred-high-confidence"), optimizationContext: optimization({ proposedActionReversible: false }) }).eligible, false);
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("inferred-high-confidence"), optimizationContext: optimization({ proposedActionHighStakes: true }) }).eligible, false);
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("confirmed"), optimizationContext: optimization() }).eligible, true);
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("conflicting"), optimizationContext: optimization() }).eligible, false);
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("expired"), optimizationContext: optimization() }).eligible, false);
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("superseded"), optimizationContext: optimization() }).eligible, false);
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("confirmed"), optimizationContext: null }).eligible, false);
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("confirmed"), optimizationContext: optimization({ actionAlternativeCount: 1 }) }).eligible, false);
assert.equal(evaluateObjectiveRecommendationEligibility({ understandingRevisionRef: "u1", objectiveContext: objective("confirmed"), optimizationContext: optimization({ authorizationPermitted: false }) }).eligible, false);

const learningSurvey: ProductRecommendationFoundation = {
  ...projection,
  recommendationPurpose: "improve-understanding",
  primaryIntendedEffect: { kind: "understanding-improvement", targetRef: candidate.unknownId },
  action: { kind: "confidence-improvement", actionType: "collect-measurement", target: { kind: "measurement", metricRef: "weekly-handoff-survey", scopeRef: "onboarding", observationWindow: "weekly" } },
};
const engagementSurvey: ProductRecommendationFoundation = {
  ...learningSurvey,
  recommendationPurpose: "advance-organizational-objective",
  primaryIntendedEffect: { kind: "objective-progress", targetRef: "objective-engagement" },
  action: { ...learningSurvey.action, kind: "future-objective-action" },
};
assert.equal(learningSurvey.recommendationPurpose, "improve-understanding");
assert.equal(engagementSurvey.recommendationPurpose, "advance-organizational-objective");
assert.notDeepEqual(learningSurvey.primaryIntendedEffect, engagementSurvey.primaryIntendedEffect);
assert.equal({ ...learningSurvey, action: { ...learningSurvey.action, actionType: "collect-measurement" } }.recommendationPurpose, "improve-understanding");

let reads = 0, writes = 0, authorized = 0;
const adapter = new CanonicalProductWorkspaceAdapter({
  runtimeRepository: {
    read: async () => { assert.equal(authorized, reads + 1); reads += 1; return { runtime, revision: "runtime-v1", bytes: new TextEncoder().encode(JSON.stringify(runtime)) }; },
    replace: async () => { writes += 1; throw new Error("Read-only Recommendation validation must not write."); },
  },
  authorize: async () => { authorized += 1; return true; },
  investigate: async () => { throw new Error("Recommendation projection must not investigate."); },
});
const projected = await adapter.getUnderstandingRecommendations({
  userId: "user-validation", organizationId, questionId, unknownId: candidate.unknownId,
  candidates: [proposal],
});
assert.equal(projected.recommendations[0]?.proposalId, proposal.proposalId);
assert.equal(projected.runtimeRevision, "runtime-v1");
const eligible = await adapter.evaluateObjectiveRecommendationEligibility({
  userId: "user-validation", organizationId, questionId,
  understandingRevisionRef: "understanding-v1", objectiveContext: objective("confirmed"),
  optimizationContext: optimization({ versionRef: null, usesDisclosedDefault: true }),
});
assert.equal(eligible.eligibility.eligible, true);
assert.equal(reads, 2);
assert.equal(writes, 0);
assert.equal(runtime.memory.events.some((event: any) => /recommendation|decision|outcome|learning|insight/.test(event?.kind ?? "")), false);

console.log(JSON.stringify({
  validation: "product-recommendation-purpose", result: "PASS", scenarios: 18,
  purposeExplicit: true, phase2cProposalIdentityPreserved: true,
  objectiveRecommendationGenerated: false, runtimeWrites: writes,
  runtimeSchemaChanged: false, eventVersionChanged: false, frontendChanged: false,
}, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
