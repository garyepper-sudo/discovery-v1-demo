import type {
  ExecutiveScenarioComparisonSet,
} from "./compareExecutiveScenarios";

import type {
  RankedExecutiveScenario,
} from "./rankExecutiveScenarios";

import type {
  DecisionConfidenceCalibration,
} from "./calibrateDecisionConfidence";

import type {
  InterventionViabilityEvaluation,
} from "./evaluateInterventionViability";

export type ExecutiveDecisionRecommendation = {
  recommendedInterventionId?: string;

  nextBestInterventionId?: string;

  status:
    | "proceed"
    | "do-not-proceed"
    | "investigate-further";

  confidence: number;

  summary: string;

  whyRecommended: string[];

  expectedBenefits: string[];

  tradeOffs: string[];

  risks: string[];

  assumptions: string[];

  evidenceThatCouldChangeRecommendation: string[];

  generatedAt: string;
};

export type BuildExecutiveDecisionRecommendationInput = {
  comparisonSet:
    ExecutiveScenarioComparisonSet;

  rankedScenarios:
    RankedExecutiveScenario[];

  confidenceCalibration:
    DecisionConfidenceCalibration;

  viabilityEvaluations:
    InterventionViabilityEvaluation[];

  generatedAt?: string;
};

function clamp01(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(1, value),
  );
}

function unique(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value) =>
          value.trim().length > 0,
      ),
    ),
  );
}

export function buildExecutiveDecisionRecommendation({
  comparisonSet,
  rankedScenarios,
  confidenceCalibration,
  viabilityEvaluations,
  generatedAt =
    new Date().toISOString(),
}: BuildExecutiveDecisionRecommendationInput): ExecutiveDecisionRecommendation {
  if (rankedScenarios.length === 0) {
    throw new Error(
      "At least one ranked scenario is required.",
    );
  }

  const winner =
    rankedScenarios[0];

  const runnerUp =
    rankedScenarios[1];

  const comparison =
    comparisonSet.scenarioComparisons.find(
      (scenario) =>
        scenario.interventionId ===
        winner.interventionId,
    );

  if (!comparison) {
    throw new Error(
      "Winning scenario comparison could not be found.",
    );
  }

const viability =
  viabilityEvaluations.find(
    (evaluation) =>
      evaluation.optionId ===
      winner.optionId,
  );

  if (!viability) {
    throw new Error(
      "Winning intervention viability evaluation could not be found.",
    );
  }

  if (
    viability.status ===
    "disqualified"
  ) {
    throw new Error(
      "A disqualified intervention cannot become the executive recommendation.",
    );
  }

  const hasUnresolvedRequiredConstraints =
    viability
      .unresolvedRequiredConstraints
      .length > 0;

  const expectedBenefits =
    comparison.improvedConditionIds.map(
      (conditionId) =>
        `Expected improvement: ${conditionId}`,
    );

  const conditionTradeOffs =
    comparison.worsenedConditionIds.map(
      (conditionId) =>
        `Potential deterioration: ${conditionId}`,
    );

  const unresolvedConstraintTradeOffs =
    viability
      .unresolvedRequiredConstraints
      .map(
        (issue) =>
          `Required ${issue.constraintType} constraint remains unresolved: ${issue.description}`,
      );

  const optionalConstraintTradeOffs =
    viability.optionalIssues.map(
      (issue) =>
        `Optional ${issue.constraintType} constraint requires attention: ${issue.description}`,
    );

  const tradeOffs =
    unique([
      ...conditionTradeOffs,
      ...unresolvedConstraintTradeOffs,
      ...optionalConstraintTradeOffs,
    ]);

  const confidenceRisks =
    confidenceCalibration
      .confidenceLimiters
      .map(
        (limiter) =>
          `Confidence limitation: ${limiter}`,
      );

  const conditionRisks =
    comparison.worsenedConditionIds.length >
    0
      ? comparison.worsenedConditionIds.map(
          (conditionId) =>
            `Monitor ${conditionId} during implementation.`,
        )
      : [];

  const constraintRisks =
    viability
      .unresolvedRequiredConstraints
      .map(
        (issue) =>
          `Resolve the ${issue.constraintType} constraint before full commitment: ${issue.explanation}`,
      );

  const risks =
    unique([
      ...conditionRisks,
      ...constraintRisks,
      ...confidenceRisks,
    ]);

  const status =
    comparison.executiveRecommendation ===
      "proceed" &&
    hasUnresolvedRequiredConstraints
      ? "investigate-further"
      : comparison.executiveRecommendation;

  const summary =
    status ===
    "proceed"
      ? "Discovery recommends proceeding with the highest-ranked intervention because projected organizational benefits outweigh identified risks and required constraints are sufficiently resolved."
      : status ===
          "do-not-proceed"
        ? "Discovery recommends not proceeding because projected organizational deterioration outweighs expected benefits."
        : hasUnresolvedRequiredConstraints
          ? "Discovery recommends resolving the remaining required executive constraints before committing to the highest-ranked intervention."
          : "Discovery recommends further investigation before committing to an intervention.";

  const evidenceThatCouldChangeRecommendation =
    unique([
      "New organizational evidence that materially changes projected condition evolution.",
      "Observed outcomes inconsistent with the current causal model.",
      "New executive constraints or strategic priorities.",
      ...viability
        .unresolvedRequiredConstraints
        .map(
          (issue) =>
            `Evidence resolving the ${issue.constraintType} constraint: ${issue.description}`,
        ),
      ...confidenceCalibration
        .confidenceLimiters,
    ]);

  return {
    recommendedInterventionId:
      winner.interventionId,

    nextBestInterventionId:
      runnerUp?.interventionId,

    status,

    confidence:
      clamp01(
        confidenceCalibration
          .calibratedConfidence,
      ),

    summary,

    whyRecommended:
      winner.reasonsForRank,

    expectedBenefits,

    tradeOffs,

    risks:
      risks.length > 0
        ? risks
        : [
            "No major organizational deterioration or unresolved constraint risk is currently projected.",
          ],

    assumptions:
      comparison.assumptions,

    evidenceThatCouldChangeRecommendation,

    generatedAt,
  };
}
