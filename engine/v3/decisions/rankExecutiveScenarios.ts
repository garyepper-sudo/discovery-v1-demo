import type {
  ExecutiveScenarioComparisonEntry,
  ExecutiveScenarioComparisonSet,
} from "./compareExecutiveScenarios";

export type RankedExecutiveScenario = {
  rank: number;

  interventionId: string;

  scenarioId: string;

  score: number;

  organizationalBenefitScore: number;

  organizationalRiskScore: number;

  confidenceScore: number;

  recommendationScore: number;

  reasonsForRank: string[];
};

export type RankExecutiveScenariosInput = {
  comparisonSet:
    ExecutiveScenarioComparisonSet;
};

function clamp01(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(1, value),
  );
}

function recommendationScore(
  recommendation:
    ExecutiveScenarioComparisonEntry["executiveRecommendation"],
): number {
  switch (recommendation) {
    case "proceed":
      return 1;

    case "investigate-further":
      return 0.5;

    case "do-not-proceed":
      return 0;
  }
}

function buildReasons(
  entry:
    ExecutiveScenarioComparisonEntry,
): string[] {
  const reasons: string[] = [];

  if (
    entry.improvedConditionIds.length >
    0
  ) {
    reasons.push(
      `${entry.improvedConditionIds.length} organizational condition(s) improve.`,
    );
  }

  if (
    entry.worsenedConditionIds.length >
    0
  ) {
    reasons.push(
      `${entry.worsenedConditionIds.length} organizational condition(s) worsen.`,
    );
  }

  if (
    entry.executiveRecommendation ===
    "proceed"
  ) {
    reasons.push(
      "The scenario-level recommendation is to proceed.",
    );
  }

  if (
    entry.executiveRecommendation ===
    "investigate-further"
  ) {
    reasons.push(
      "The projected effects require additional investigation.",
    );
  }

  if (
    entry.executiveRecommendation ===
    "do-not-proceed"
  ) {
    reasons.push(
      "The scenario-level recommendation is not to proceed.",
    );
  }

  reasons.push(
    `Scenario confidence is ${Math.round(
      entry.scenarioConfidence * 100,
    )}%.`,
  );

  return reasons;
}

function scoreScenario(
  entry:
    ExecutiveScenarioComparisonEntry,
): Omit<
  RankedExecutiveScenario,
  "rank"
> {
  const changedConditionCount =
    entry.improvedConditionIds.length +
    entry.worsenedConditionIds.length;

  const organizationalBenefitScore =
    changedConditionCount === 0
      ? 0.5
      : clamp01(
          entry.improvedConditionIds
            .length /
            changedConditionCount,
        );

  const organizationalRiskScore =
    changedConditionCount === 0
      ? 0
      : clamp01(
          entry.worsenedConditionIds
            .length /
            changedConditionCount,
        );

  const confidenceScore =
    clamp01(
      (
        entry.scenarioConfidence +
        entry.interventionConfidence
      ) / 2,
    );

  const normalizedRecommendationScore =
    recommendationScore(
      entry.executiveRecommendation,
    );

  const score =
    clamp01(
      organizationalBenefitScore *
        0.4 +
        confidenceScore *
          0.25 +
        normalizedRecommendationScore *
          0.25 +
        (1 -
          organizationalRiskScore) *
          0.1,
    );

  return {
    interventionId:
      entry.interventionId,

    scenarioId:
      entry.scenarioId,

    score,

    organizationalBenefitScore,

    organizationalRiskScore,

    confidenceScore,

    recommendationScore:
      normalizedRecommendationScore,

    reasonsForRank:
      buildReasons(entry),
  };
}

/**
 * Ranks completed executive scenarios without synthesizing a final
 * recommendation.
 *
 * Version 1 uses deterministic scoring across organizational benefit,
 * organizational risk, confidence, and the existing scenario-level
 * recommendation.
 */
export function rankExecutiveScenarios({
  comparisonSet,
}: RankExecutiveScenariosInput): RankedExecutiveScenario[] {
  return comparisonSet
    .scenarioComparisons
    .map(scoreScenario)
    .sort((left, right) => {
      if (
        right.score !== left.score
      ) {
        return (
          right.score -
          left.score
        );
      }

      return left.interventionId.localeCompare(
        right.interventionId,
      );
    })
    .map(
      (scenario, index) => ({
        ...scenario,
        rank:
          index + 1,
      }),
    );
}