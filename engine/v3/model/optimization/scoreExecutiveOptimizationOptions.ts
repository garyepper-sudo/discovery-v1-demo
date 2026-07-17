import type {
  ExecutiveOptimizationConstraintEvaluationSet,
  ExecutiveOptimizationOptionConstraintResult,
} from "./executiveConstraintEvaluationTypes";

import type {
  ExecutiveOptimizationOptionScore,
  ExecutiveOptimizationScoreComponent,
  ExecutiveOptimizationScoreSet,
} from "./executiveOptimizationScoreTypes";

import type {
  ExecutiveOptimizationPreference,
} from "./executiveOptimizationTypes";

export type ScoreExecutiveOptimizationOptionsInput = {
  constraintEvaluationSet:
    ExecutiveOptimizationConstraintEvaluationSet;

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

function getPreferenceWeight(
  preferences:
    ExecutiveOptimizationPreference[],

  label:
    string,

  fallback:
    number,
): number {
  const preference =
    preferences.find(
      (item) =>
        item.label ===
        label,
    );

  return clamp01(
    preference?.weight ??
    fallback,
  );
}

function buildComponents(
  result:
    ExecutiveOptimizationOptionConstraintResult,

  preferences:
    ExecutiveOptimizationPreference[],
): ExecutiveOptimizationScoreComponent[] {
  const option =
    result.option;

  const expectedValueWeight =
    getPreferenceWeight(
      preferences,
      "Expected organizational value",
      1,
    );

  const speedWeight =
    getPreferenceWeight(
      preferences,
      "Speed to impact",
      0.75,
    );

  const lowerRiskWeight =
    getPreferenceWeight(
      preferences,
      "Lower execution risk",
      0.8,
    );

  const reversibilityWeight =
    getPreferenceWeight(
      preferences,
      "Reversibility",
      0.65,
    );

  const feasibilityWeight =
    1;

  const lowerRiskValue =
    clamp01(
      1 -
      option.implementationRisk,
    );

  return [
    {
      id:
        `score-component-${option.id}-expected-value`,

      label:
        "Expected organizational value",

      rawValue:
        option.expectedValue,

      weight:
        expectedValueWeight,

      weightedValue:
        option.expectedValue *
        expectedValueWeight,

      rationale:
        "Measures the option's expected improvement in the target organizational condition.",
    },

    {
      id:
        `score-component-${option.id}-feasibility`,

      label:
        "Constraint feasibility",

      rawValue:
        result.feasibilityScore,

      weight:
        feasibilityWeight,

      weightedValue:
        result.feasibilityScore *
        feasibilityWeight,

      rationale:
        "Measures how well the option satisfies current organizational constraints.",
    },

    {
      id:
        `score-component-${option.id}-speed`,

      label:
        "Speed to impact",

      rawValue:
        option.speedToImpact,

      weight:
        speedWeight,

      weightedValue:
        option.speedToImpact *
        speedWeight,

      rationale:
        "Measures how quickly the option is expected to create meaningful executive impact.",
    },

    {
      id:
        `score-component-${option.id}-lower-risk`,

      label:
        "Lower execution risk",

      rawValue:
        lowerRiskValue,

      weight:
        lowerRiskWeight,

      weightedValue:
        lowerRiskValue *
        lowerRiskWeight,

      rationale:
        "Rewards options with lower implementation and organizational disruption risk.",
    },

    {
      id:
        `score-component-${option.id}-reversibility`,

      label:
        "Reversibility",

      rawValue:
        option.reversibility,

      weight:
        reversibilityWeight,

      weightedValue:
        option.reversibility *
        reversibilityWeight,

      rationale:
        "Rewards options that can be adjusted or reversed as new evidence emerges.",
    },
  ];
}

function buildSummary(
  result:
    ExecutiveOptimizationOptionConstraintResult,

  finalScore:
    number,
): string {
  if (
    !result.feasible
  ) {
    return `${result.option.title} receives a constrained score of ${finalScore.toFixed(3)} because required constraints are violated.`;
  }

  return `${result.option.title} receives a transparent optimization score of ${finalScore.toFixed(3)} based on value, feasibility, speed, risk, reversibility, confidence, and uncertainty.`;
}

export function scoreExecutiveOptimizationOptions(
  input:
    ScoreExecutiveOptimizationOptionsInput,
): ExecutiveOptimizationScoreSet {
  const now =
    input.now ??
    new Date()
      .toISOString();

  const constraintEvaluationSet =
    input.constraintEvaluationSet;

  const preferences =
    constraintEvaluationSet
      .optimizationProblem
      .preferences;

  const scores:
    ExecutiveOptimizationOptionScore[] =
    constraintEvaluationSet
      .results
      .map(
        (result) => {
          const components =
            buildComponents(
              result,
              preferences,
            );

          const totalWeight =
            components.reduce(
              (
                total,
                component,
              ) =>
                total +
                component.weight,
              0,
            );

          const baseScore =
            clamp01(
              components.reduce(
                (
                  total,
                  component,
                ) =>
                  total +
                  component.weightedValue,
                0,
              ) /
                Math.max(
                  totalWeight,
                  1,
                ),
            );

          const confidenceAdjustment =
            clamp01(
              result.option.confidence,
            );

          const uncertaintyPenalty =
            clamp01(
              (
                1 -
                result.option.confidence
              ) *
              0.12,
            );

          const infeasibilityPenalty =
            result.feasible
              ? 0
              : clamp01(
                  0.25 +
                  (
                    result
                      .violatedConstraintIds
                      .length *
                    0.08
                  ),
                );

          const finalScore =
            clamp01(
              (
                baseScore *
                (
                  0.75 +
                  (
                    0.25 *
                    confidenceAdjustment
                  )
                )
              ) -
              uncertaintyPenalty -
              infeasibilityPenalty,
            );

          return {
            id:
              `executive-optimization-score-${result.option.id}`,

            optionConstraintResult:
              result,

            components,

            baseScore,

            confidenceAdjustment,

            uncertaintyPenalty,

            infeasibilityPenalty,

            finalScore,

            feasible:
              result.feasible,

            summary:
              buildSummary(
                result,
                finalScore,
              ),
          };
        },
      );

  return {
    id:
      `executive-optimization-score-set-${constraintEvaluationSet.id}`,

    constraintEvaluationSet,

    preferences,

    scores,

    createdAt:
      now,
  };
}
