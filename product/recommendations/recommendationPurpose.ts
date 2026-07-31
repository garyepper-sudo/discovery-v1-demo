import type { ProductConfidenceImprovementProposal } from "../improvements/contracts";
import type { ProductUnknownProjection } from "../unknowns/contracts";
import type {
  ProductObjectiveContext,
  ProductObjectiveRecommendationEligibility,
  ProductOptimizationContextInput,
  ProductRecommendationSecondaryEffect,
  ProductUnderstandingRecommendation,
} from "./contracts";

export function projectUnderstandingRecommendation(input: {
  proposal: ProductConfidenceImprovementProposal;
  unknown: ProductUnknownProjection;
  secondaryEffects?: ProductRecommendationSecondaryEffect[];
}): ProductUnderstandingRecommendation {
  if (input.proposal.organizationId !== input.unknown.organizationId
    || input.proposal.questionId !== input.unknown.questionId
    || input.proposal.unknownId !== input.unknown.unknownId) {
    throw new Error("Understanding Recommendation scope mismatch.");
  }
  if (!input.unknown.actionable) throw new Error("Understanding Recommendation requires an actionable Unknown.");
  const effects = [...(input.secondaryEffects ?? [])];
  return {
    recommendationPurpose: "improve-understanding",
    recommendationId: input.proposal.proposalId,
    proposalId: input.proposal.proposalId,
    organizationId: input.proposal.organizationId,
    questionId: input.proposal.questionId,
    unknownId: input.proposal.unknownId,
    understandingRevisionRef: input.proposal.understandingRevisionRef,
    primaryIntendedEffect: { kind: "understanding-improvement", targetRef: input.unknown.unknownId },
    action: { kind: "confidence-improvement", actionType: input.proposal.actionType, target: input.proposal.actionTarget },
    statement: input.proposal.summary,
    rationale: {
      whyThis: input.proposal.rationale,
      whyNow: `The current Unknown remains ${input.unknown.status} and actionable.`,
      whyNotAlternatives: "The existing governed ranking preserves ties and selects no winner when value is materially equivalent.",
      understandingGap: input.unknown.summary,
      whyThisAction: input.proposal.rationale,
      expectedDiscriminationGain: input.proposal.expectedValue.discriminationGain,
      expectedUnderstandingImprovement: input.proposal.expectedValue.understandingImprovement,
    },
    evidenceRefs: input.proposal.sourceScopeRefs.filter((ref) => ref.startsWith("evidence:")),
    assumptions: [],
    tradeoffs: [input.proposal.expectedValue.explanation],
    constraints: [
      { kind: "effort", value: input.proposal.executionCost.effort, required: true },
      { kind: "delay", value: input.proposal.executionCost.delay, required: true },
      { kind: "burden", value: input.proposal.executionCost.burden, required: true },
      { kind: "governance", value: input.proposal.executionCost.governanceRisk, required: true },
    ],
    costAndConstraints: { ...input.proposal.executionCost },
    learningValue: input.proposal.expectedValue.understandingImprovement,
    secondaryEffects: effects,
    authorizationRequired: true,
    requiresAuthorization: true,
  };
}

export function evaluateObjectiveRecommendationEligibility(input: {
  understandingRevisionRef: string;
  objectiveContext: ProductObjectiveContext;
  optimizationContext: ProductOptimizationContextInput | null;
}): ProductObjectiveRecommendationEligibility {
  if (!input.understandingRevisionRef.trim()) return { eligible: false, reason: "authorization-limited", requiredNextStep: "abstain" };
  const objective = input.objectiveContext;
  if (objective.status === "unknown" || !objective.objectiveRef || !objective.objectiveVersionRef) {
    return { eligible: false, reason: "objective-unknown", requiredNextStep: "ask-objective" };
  }
  if (objective.status === "inferred-low-confidence") {
    return { eligible: false, reason: "objective-inference-low-confidence", requiredNextStep: "confirm-objective" };
  }
  if (objective.status === "conflicting") {
    return { eligible: false, reason: "objectives-conflict", requiredNextStep: "prioritize-objectives" };
  }
  if (objective.status === "expired" || objective.status === "superseded") {
    return { eligible: false, reason: "objective-version-inactive", requiredNextStep: "ask-objective" };
  }
  const optimization = input.optimizationContext;
  if (!optimization || (!optimization.versionRef && !optimization.usesDisclosedDefault)) {
    return { eligible: false, reason: "optimization-context-missing", requiredNextStep: "provide-optimization-context" };
  }
  if (!optimization.authorizationPermitted) {
    return { eligible: false, reason: "authorization-limited", requiredNextStep: "abstain" };
  }
  if (optimization.actionAlternativeCount < 2) {
    return { eligible: false, reason: "action-alternatives-insufficient", requiredNextStep: "improve-understanding" };
  }
  if (objective.status === "inferred-high-confidence") {
    if (!objective.assumptionDisclosed || optimization.proposedActionHighStakes || !optimization.proposedActionReversible) {
      return { eligible: false, reason: "high-stakes-objective-unconfirmed", requiredNextStep: "confirm-objective" };
    }
    return {
      eligible: true,
      qualification: "high-confidence-inferred-objective-conditional",
      objectiveRef: objective.objectiveRef,
      objectiveStatus: objective.status,
      limitations: ["The objective is inferred, disclosed, and must be confirmed before high-stakes or irreversible action."],
    };
  }
  return {
    eligible: true,
    qualification: "confirmed-objective",
    objectiveRef: objective.objectiveRef,
    objectiveStatus: "confirmed",
    limitations: optimization.materialConstraints.map((constraint) => `Respect material constraint: ${constraint}`),
  };
}
