import type {
  ExecutiveScenarioComparisonSet,
} from "./compareExecutiveScenarios";

import type {
  RankedExecutiveScenario,
} from "./rankExecutiveScenarios";

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

  calibratedConfidence:
    number;

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

export function buildExecutiveDecisionRecommendation({
  comparisonSet,
  rankedScenarios,
  calibratedConfidence,
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

  const expectedBenefits =
    comparison.improvedConditionIds.map(
      (conditionId) =>
        `Expected improvement: ${conditionId}`,
    );

  const tradeOffs =
    comparison.worsenedConditionIds.map(
      (conditionId) =>
        `Potential deterioration: ${conditionId}`,
    );

  const risks =
    comparison.worsenedConditionIds.length >
    0
      ? comparison.worsenedConditionIds.map(
          (conditionId) =>
            `Monitor ${conditionId} during implementation.`,
        )
      : [
          "No major organizational deterioration is currently projected.",
        ];

  const summary =
    comparison.executiveRecommendation ===
    "proceed"
      ? "Discovery recommends proceeding with the highest-ranked intervention because projected organizational benefits outweigh identified risks."
      : comparison.executiveRecommendation ===
          "do-not-proceed"
        ? "Discovery recommends not proceeding because projected organizational deterioration outweighs expected benefits."
        : "Discovery recommends further investigation before committing to an intervention.";

  return {
    recommendedInterventionId:
      winner.interventionId,

    nextBestInterventionId:
      runnerUp?.interventionId,

    status:
      comparison.executiveRecommendation,

    confidence:
      clamp01(
        calibratedConfidence,
      ),

    summary,

    whyRecommended:
      winner.reasonsForRank,

    expectedBenefits,

    tradeOffs,

    risks,

    assumptions:
      comparison.assumptions,

    evidenceThatCouldChangeRecommendation:
      [
        "New organizational evidence that materially changes projected condition evolution.",
        "Observed outcomes inconsistent with the current causal model.",
        "New executive constraints or strategic priorities.",
      ],

    generatedAt,
  };
}
