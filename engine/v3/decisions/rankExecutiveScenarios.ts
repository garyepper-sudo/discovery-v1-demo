import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  ExecutiveScenarioComparisonEntry,
  ExecutiveScenarioComparisonSet,
} from "./compareExecutiveScenarios";

export type RankedExecutiveScenario = {
  rank: number;

  /**
   * Originating Intervention Option identity.
   */
  optionId: string;

  interventionId: string;

  scenarioId: string;

  score: number;

  objectiveAlignmentScore: number;

  organizationalBenefitScore: number;

  organizationalRiskScore: number;

  confidenceScore: number;

  recommendationScore: number;

  reasonsForRank: string[];
};

export type RankExecutiveScenariosInput = {
  executiveDecision:
    ExecutiveDecision;

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

function conditionOutcomeScore(
  change:
    ExecutiveScenarioComparisonEntry["targetConditionChanges"][number],
): number {
  switch (change.change) {
    case "improved":
      return 1;

    case "unchanged":
      return 0.5;

    case "worsened":
      return 0;
  }
}

function objectiveAlignmentScore(
  executiveDecision:
    ExecutiveDecision,

  entry:
    ExecutiveScenarioComparisonEntry,
): number {
  if (
    executiveDecision.targetConditionIds
      .length === 0
  ) {
    return 0.5;
  }

  const changesByConditionId =
    new Map(
      entry.targetConditionChanges.map(
        (change) => [
          change.conditionId,
          change,
        ],
      ),
    );

  const targetScores =
    executiveDecision.targetConditionIds.map(
      (conditionId) => {
        const change =
          changesByConditionId.get(
            conditionId,
          );

        return change
          ? conditionOutcomeScore(
              change,
            )
          : 0.5;
      },
    );

  return clamp01(
    targetScores.reduce(
      (sum, score) =>
        sum + score,
      0,
    ) /
      targetScores.length,
  );
}

function buildReasons(
  executiveDecision:
    ExecutiveDecision,

  entry:
    ExecutiveScenarioComparisonEntry,

  targetScore:
    number,
): string[] {
  const reasons: string[] = [];

  const improvedTargets =
    entry.targetConditionChanges
      .filter(
        (change) =>
          executiveDecision
            .targetConditionIds
            .includes(
              change.conditionId,
            ) &&
          change.change ===
            "improved",
      );

  const worsenedTargets =
    entry.targetConditionChanges
      .filter(
        (change) =>
          executiveDecision
            .targetConditionIds
            .includes(
              change.conditionId,
            ) &&
          change.change ===
            "worsened",
      );

  if (improvedTargets.length > 0) {
    reasons.push(
      `${improvedTargets.length} executive target condition(s) improve.`,
    );
  }

  if (worsenedTargets.length > 0) {
    reasons.push(
      `${worsenedTargets.length} executive target condition(s) worsen.`,
    );
  }

  reasons.push(
    `Objective alignment is ${Math.round(
      targetScore * 100,
    )}%.`,
  );

  if (
    entry.improvedConditionIds.length >
    0
  ) {
    reasons.push(
      `${entry.improvedConditionIds.length} organizational condition(s) improve overall.`,
    );
  }

  if (
    entry.worsenedConditionIds.length >
    0
  ) {
    reasons.push(
      `${entry.worsenedConditionIds.length} organizational condition(s) worsen overall.`,
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
  executiveDecision:
    ExecutiveDecision,

  entry:
    ExecutiveScenarioComparisonEntry,
): Omit<
  RankedExecutiveScenario,
  "rank"
> {
  const changedConditionCount =
    entry.improvedConditionIds.length +
    entry.worsenedConditionIds.length;

  const targetScore =
    objectiveAlignmentScore(
      executiveDecision,
      entry,
    );

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
      targetScore *
        0.45 +
        organizationalBenefitScore *
          0.2 +
        confidenceScore *
          0.15 +
        normalizedRecommendationScore *
          0.15 +
        (1 -
          organizationalRiskScore) *
          0.05,
    );

  return {
    optionId:
      entry.optionId,

    interventionId:
      entry.interventionId,

    scenarioId:
      entry.scenarioId,

    score,

    objectiveAlignmentScore:
      targetScore,

    organizationalBenefitScore,

    organizationalRiskScore,

    confidenceScore,

    recommendationScore:
      normalizedRecommendationScore,

    reasonsForRank:
      buildReasons(
        executiveDecision,
        entry,
        targetScore,
      ),
  };
}

export function rankExecutiveScenarios({
  executiveDecision,
  comparisonSet,
}: RankExecutiveScenariosInput): RankedExecutiveScenario[] {
  return comparisonSet
    .scenarioComparisons
    .map((entry) =>
      scoreScenario(
        executiveDecision,
        entry,
      ),
    )
    .sort((left, right) => {
      if (
        right.score !== left.score
      ) {
        return (
          right.score -
          left.score
        );
      }

      if (
        right.objectiveAlignmentScore !==
        left.objectiveAlignmentScore
      ) {
        return (
          right.objectiveAlignmentScore -
          left.objectiveAlignmentScore
        );
      }

      if (
        right.confidenceScore !==
        left.confidenceScore
      ) {
        return (
          right.confidenceScore -
          left.confidenceScore
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
