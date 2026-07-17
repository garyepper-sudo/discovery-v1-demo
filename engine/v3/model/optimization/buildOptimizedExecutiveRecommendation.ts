import type {
  OptimizedExecutiveRecommendation,
} from "./optimizedExecutiveRecommendationTypes";

import type {
  ExecutiveOptimizationRanking,
  ExecutiveOptimizationRankedOption,
} from "./executiveOptimizationRankingTypes";

export type BuildOptimizedExecutiveRecommendationInput = {
  organizationId:
    string;

  ranking:
    ExecutiveOptimizationRanking;

  now?:
    string;
};

function clamp01(
  value:
    number,
): number {
  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function requirePreferredOption(
  ranking:
    ExecutiveOptimizationRanking,
): ExecutiveOptimizationRankedOption {
  if (
    !ranking.preferredOption
  ) {
    throw new Error(
      "Optimized Executive Recommendation requires a preferred feasible option.",
    );
  }

  return ranking.preferredOption;
}

function getAdjustment(
  preferred:
    ExecutiveOptimizationRankedOption,

  type:
    | "scope"
    | "sequence"
    | "timing"
    | "resource-allocation"
    | "decision-rights"
    | "coordination-load"
    | "implementation-intensity",
): string {
  const adjustment =
    preferred
      .score
      .optionConstraintResult
      .option
      .variableAdjustments
      .find(
        (item) =>
          item.variableType ===
          type,
      );

  if (
    !adjustment
  ) {
    throw new Error(
      `Optimized Executive Recommendation requires adjustment: ${type}.`,
    );
  }

  return adjustment.proposedValue;
}

function buildTradeoffs(
  preferred:
    ExecutiveOptimizationRankedOption,
): string[] {
  const option =
    preferred
      .score
      .optionConstraintResult
      .option;

  const tradeoffs:
    string[] = [];

  if (
    option.speedToImpact <
    0.7
  ) {
    tradeoffs.push(
      "The preferred option sacrifices speed to impact in exchange for stronger feasibility and lower execution risk.",
    );
  }

  if (
    option.expectedValue <
    0.75
  ) {
    tradeoffs.push(
      "The preferred option offers lower immediate expected value than more aggressive alternatives.",
    );
  }

  if (
    option.reversibility >=
    0.8
  ) {
    tradeoffs.push(
      "The preferred option prioritizes reversibility and evidence generation before broader organizational commitment.",
    );
  }

  if (
    option.implementationRisk <=
    0.35
  ) {
    tradeoffs.push(
      "The preferred option reduces implementation risk by narrowing scope and limiting disruption.",
    );
  }

  if (
    tradeoffs.length ===
    0
  ) {
    tradeoffs.push(
      "The preferred option balances expected value, feasibility, speed, risk, and reversibility without a dominant tradeoff.",
    );
  }

  return tradeoffs;
}

export function buildOptimizedExecutiveRecommendation(
  input:
    BuildOptimizedExecutiveRecommendationInput,
): OptimizedExecutiveRecommendation {
  const now =
    input.now ??
    new Date()
      .toISOString();

  const ranking =
    input.ranking;

  const preferred =
    requirePreferredOption(
      ranking,
    );

  const score =
    preferred.score;

  const result =
    score
      .optionConstraintResult;

  const option =
    result.option;

  const originalRecommendation =
    ranking
      .scoreSet
      .constraintEvaluationSet
      .optimizationProblem
      .recommendation;

  const confidence =
    clamp01(
      (
        originalRecommendation
          .confidence +
        option.confidence +
        result.feasibilityScore +
        score.finalScore
      ) /
        4,
    );

  return {
    id:
      `optimized-executive-recommendation-${ranking.id}`,

    organizationId:
      input.organizationId,

    sourceRecommendationId:
      originalRecommendation.id,

    sourceRankingId:
      ranking.id,

    originalRecommendation,

    optimizationRanking:
      ranking,

    headline:
      `${option.title}: ${originalRecommendation.headline}`,

    executiveRecommendation:
      `${originalRecommendation.executiveRecommendation} Optimize execution through ${option.title}: ${option.summary}`,

    preferredOptionId:
      option.id,

    preferredProfile:
      option.profile,

    objective: {
      headline:
        originalRecommendation
          .objective
          .headline,

      targetConditionId:
        originalRecommendation
          .objective
          .targetConditionId,
    },

    optimizedPlan: {
      scope:
        getAdjustment(
          preferred,
          "scope",
        ),

      sequence:
        getAdjustment(
          preferred,
          "sequence",
        ),

      timing:
        getAdjustment(
          preferred,
          "timing",
        ),

      resourceAllocation:
        getAdjustment(
          preferred,
          "resource-allocation",
        ),

      decisionRights:
        getAdjustment(
          preferred,
          "decision-rights",
        ),

      coordinationLoad:
        getAdjustment(
          preferred,
          "coordination-load",
        ),

      implementationIntensity:
        getAdjustment(
          preferred,
          "implementation-intensity",
        ),
    },

    whyPreferred:
      ranking.rationale,

    bindingConstraintIds:
      result
        .bindingConstraintIds,

    violatedConstraintIds:
      result
        .violatedConstraintIds,

    expectedTradeoffs:
      buildTradeoffs(
        preferred,
      ),

    expectedValue:
      option.expectedValue,

    feasibilityScore:
      result.feasibilityScore,

    finalScore:
      score.finalScore,

    confidence,

    uncertaintySummary:
      option
        .uncertaintySummary,

    boundaries: {
      preservesOriginalRecommendation:
        true,

      doesNotRecordExecutiveDecision:
        true,

      doesNotSimulate:
        true,

      doesNotExecuteIntervention:
        true,
    },

    createdAt:
      now,
  };
}
