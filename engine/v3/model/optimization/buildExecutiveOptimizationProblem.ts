import type {
  ExecutiveRecommendation,
} from "../recommendation/executiveRecommendationTypes";

import type {
  ExecutiveOptimizationConstraint,
  ExecutiveOptimizationPreference,
  ExecutiveOptimizationProblem,
  ExecutiveOptimizationVariable,
} from "./executiveOptimizationTypes";

export type BuildExecutiveOptimizationProblemInput = {
  organizationId:
    string;

  recommendation:
    ExecutiveRecommendation;

  additionalConstraints?:
    ExecutiveOptimizationConstraint[];

  executivePreferences?:
    ExecutiveOptimizationPreference[];

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

function buildDefaultVariables(
  recommendation:
    ExecutiveRecommendation,
): ExecutiveOptimizationVariable[] {
  return [
    {
      id:
        `optimization-variable-${recommendation.id}-scope`,

      type:
        "scope",

      label:
        "Intervention scope",

      description:
        "Adjust how broadly the intervention is applied across the organization.",

      currentValue:
        recommendation.intervention
          .headline,

      direction:
        "decrease",

      bounded:
        true,
    },

    {
      id:
        `optimization-variable-${recommendation.id}-sequence`,

      type:
        "sequence",

      label:
        "Implementation sequence",

      description:
        "Determine the order in which the primary and supporting strategies should be applied.",

      currentValue:
        recommendation.strategy
          .strategies
          .map(
            (strategy) =>
              strategy.headline,
          )
          .join(
            " → ",
          ),

      direction:
        "sequence",

      bounded:
        true,
    },

    {
      id:
        `optimization-variable-${recommendation.id}-timing`,

      type:
        "timing",

      label:
        "Intervention timing",

      description:
        "Adjust the timing and pace of intervention while preserving the recommendation's objective.",

      currentValue:
        "Not yet optimized",

      direction:
        "clarify",

      bounded:
        true,
    },

    {
      id:
        `optimization-variable-${recommendation.id}-resource-allocation`,

      type:
        "resource-allocation",

      label:
        "Resource allocation",

      description:
        "Reallocate scarce organizational capacity toward the highest-leverage work.",

      currentValue:
        "Capacity remains distributed across competing priorities.",

      direction:
        "increase",

      bounded:
        true,
    },

    {
      id:
        `optimization-variable-${recommendation.id}-decision-rights`,

      type:
        "decision-rights",

      label:
        "Decision-rights clarity",

      description:
        "Adjust authority distribution to reduce avoidable approval dependency.",

      currentValue:
        "Decision authority requires clarification.",

      direction:
        "clarify",

      bounded:
        true,
    },

    {
      id:
        `optimization-variable-${recommendation.id}-coordination-load`,

      type:
        "coordination-load",

      label:
        "Coordination load",

      description:
        "Reduce avoidable cross-functional coordination overhead while preserving necessary alignment.",

      currentValue:
        "Cross-functional coordination remains constrained.",

      direction:
        "decrease",

      bounded:
        true,
    },

    {
      id:
        `optimization-variable-${recommendation.id}-implementation-intensity`,

      type:
        "implementation-intensity",

      label:
        "Implementation intensity",

      description:
        "Balance expected organizational value against disruption and implementation complexity.",

      currentValue:
        "Not yet optimized",

      direction:
        "clarify",

      bounded:
        true,
    },
  ];
}

function buildDefaultConstraints(
  recommendation:
    ExecutiveRecommendation,
): ExecutiveOptimizationConstraint[] {
  return [
    {
      id:
        `optimization-constraint-${recommendation.id}-time`,

      type:
        "time",

      label:
        "Time",

      description:
        "The intervention must produce meaningful progress within an executive-relevant time horizon.",

      required:
        true,

      source:
        "default",

      confidence:
        1,
    },

    {
      id:
        `optimization-constraint-${recommendation.id}-capacity`,

      type:
        "capacity",

      label:
        "Organizational capacity",

      description:
        "The intervention cannot require more execution capacity than the organization can reliably supply.",

      required:
        true,

      source:
        "recommendation",

      confidence:
        recommendation.confidence,
    },

    {
      id:
        `optimization-constraint-${recommendation.id}-risk`,

      type:
        "risk",

      label:
        "Organizational risk",

      description:
        "Expected value must justify execution risk, disruption, and uncertainty.",

      required:
        true,

      source:
        "default",

      confidence:
        recommendation.confidence,
    },

    {
      id:
        `optimization-constraint-${recommendation.id}-decision-authority`,

      type:
        "decision-authority",

      label:
        "Decision authority",

      description:
        "The intervention must be executable within available or explicitly reassigned decision authority.",

      required:
        true,

      source:
        "recommendation",

      confidence:
        recommendation.confidence,
    },

    {
      id:
        `optimization-constraint-${recommendation.id}-implementation-complexity`,

      type:
        "implementation-complexity",

      label:
        "Implementation complexity",

      description:
        "The intervention should avoid unnecessary implementation burden relative to expected value.",

      required:
        true,

      source:
        "default",

      confidence:
        recommendation.confidence,
    },
  ];
}

function buildDefaultPreferences(
  recommendation:
    ExecutiveRecommendation,
): ExecutiveOptimizationPreference[] {
  return [
    {
      id:
        `optimization-preference-${recommendation.id}-expected-value`,

      label:
        "Expected organizational value",

      description:
        "Prefer the option with the highest expected improvement in the target organizational condition.",

      weight:
        1,
    },

    {
      id:
        `optimization-preference-${recommendation.id}-speed`,

      label:
        "Speed to impact",

      description:
        "Prefer interventions that create meaningful progress sooner when expected value is otherwise similar.",

      weight:
        0.75,
    },

    {
      id:
        `optimization-preference-${recommendation.id}-lower-risk`,

      label:
        "Lower execution risk",

      description:
        "Prefer lower-risk interventions when expected value is otherwise similar.",

      weight:
        0.8,
    },

    {
      id:
        `optimization-preference-${recommendation.id}-reversibility`,

      label:
        "Reversibility",

      description:
        "Prefer interventions that can be adjusted or reversed as new evidence emerges.",

      weight:
        0.65,
    },
  ];
}

function mergeById<T extends {
  id:
    string;
}>(
  defaults:
    T[],

  additions:
    T[] = [],
): T[] {
  return Array.from(
    new Map(
      [
        ...defaults,
        ...additions,
      ].map(
        (item) => [
          item.id,
          item,
        ],
      ),
    ).values(),
  );
}

export function buildExecutiveOptimizationProblem(
  input:
    BuildExecutiveOptimizationProblemInput,
): ExecutiveOptimizationProblem {
  const now =
    input.now ??
    new Date()
      .toISOString();

  const recommendation =
    input.recommendation;

  const variables =
    buildDefaultVariables(
      recommendation,
    );

  const constraints =
    mergeById(
      buildDefaultConstraints(
        recommendation,
      ),
      input.additionalConstraints,
    );

  const preferences =
    mergeById(
      buildDefaultPreferences(
        recommendation,
      ),
      input.executivePreferences,
    );

  const targetConditionLabel =
    recommendation.objective.headline
      .replace(
        /^Increase\s+/i,
        "",
      )
      .replace(
        /^Improve\s+/i,
        "",
      )
      .replace(
        /\.$/,
        "",
      );

  return {
    id:
      `executive-optimization-problem-${recommendation.id}`,

    organizationId:
      input.organizationId,

    recommendationId:
      recommendation.id,

    recommendation,

    objective: {
      statement:
        `Maximize expected organizational value by increasing ${targetConditionLabel}, subject to constraints and uncertainty.`,

      northStar:
        "maximize_expected_organizational_value",

      targetConditionId:
        recommendation.objective
          .targetConditionId,
    },

    variables,

    constraints,

    preferences,

    uncertaintySummary:
      recommendation
        .uncertaintySummary,

    confidence:
      clamp01(
        recommendation.confidence,
      ),

    boundaries: {
      doesNotReplaceRecommendation:
        true,

      doesNotSimulate:
        true,

      doesNotSelectFinalDecision:
        true,
    },

    createdAt:
      now,
  };
}
