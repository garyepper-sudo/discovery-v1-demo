import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  OrganizationalCondition,
} from "../model/state/inferOrganizationalConditions";

import {
  selectOptimizationVariables,
} from "./selectOptimizationVariables";

import type {
  ExecutiveOptimizationConstraint,
  ExecutiveOptimizationObjective,
  ExecutiveOptimizationPreference,
  ExecutiveOptimizationSuccessTarget,
} from "./executiveOptimizationObjective";

export type SynthesizeExecutiveOptimizationObjectiveInput = {
  executiveDecision:
    ExecutiveDecision;

  conditions:
    OrganizationalCondition[];

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

function createObjectiveId(
  executiveDecisionId: string,
): string {
  return [
    "executive-optimization-objective",
    executiveDecisionId,
  ].join("-");
}

function translateSuccessTargets(
  executiveDecision:
    ExecutiveDecision,
): ExecutiveOptimizationSuccessTarget[] {
  return executiveDecision.successMetrics
    .filter(
      (metric) =>
        typeof metric.targetConditionId ===
          "string" &&
        metric.targetConditionId.length > 0,
    )
    .map((metric) => ({
      name:
        metric.name,

      conditionId:
        metric.targetConditionId as string,

      baseline:
        metric.baseline,

      target:
        metric.target,

      unit:
        metric.unit,

      rationale:
        metric.rationale,
    }));
}

function constraintTranslationStatus(
  type:
    ExecutiveDecision["constraints"][number]["type"],
): ExecutiveOptimizationConstraint["translationStatus"] {
  switch (type) {
    case "time":
      return "structured";

    case "budget":
    case "capacity":
    case "risk":
    case "regulatory":
    case "people":
    case "technology":
    case "strategic":
    case "custom":
      return "requires-interpretation";
  }
}

function translateConstraints(
  executiveDecision:
    ExecutiveDecision,
): ExecutiveOptimizationConstraint[] {
  return executiveDecision.constraints.map(
    (constraint, sourceConstraintIndex) => ({
      sourceConstraintIndex,

      type:
        constraint.type,

      description:
        constraint.description,

      required:
        constraint.required,

      translationStatus:
        constraintTranslationStatus(
          constraint.type,
        ),
    }),
  );
}

function defaultPreferences():
  ExecutiveOptimizationPreference[] {
  return [
    {
      type:
        "confidence",

      direction:
        "maximize",

      weight:
        0.5,

      rationale:
        "Prefer strategies supported by stronger intervention and simulation confidence.",
    },

    {
      type:
        "risk",

      direction:
        "minimize",

      weight:
        0.5,

      rationale:
        "Prefer strategies that avoid deterioration in organizational variables.",
    },
  ];
}

function buildConfidenceLimiters(
  executiveDecision:
    ExecutiveDecision,

  variables:
    ExecutiveOptimizationObjective["variables"],

  successTargets:
    ExecutiveOptimizationSuccessTarget[],

  constraints:
    ExecutiveOptimizationConstraint[],
): string[] {
  const limiters: string[] = [];

  const unlinkedSuccessMetricCount =
    executiveDecision.successMetrics.length -
    successTargets.length;

  if (unlinkedSuccessMetricCount > 0) {
    limiters.push(
      `${unlinkedSuccessMetricCount} success metric(s) are not linked to canonical organizational conditions.`,
    );
  }

  if (variables.length === 0) {
    limiters.push(
      "No organizational variables could be selected for optimization.",
    );
  }

  const interpretedConstraintCount =
    constraints.filter(
      (constraint) =>
        constraint.translationStatus !==
        "structured",
    ).length;

  if (interpretedConstraintCount > 0) {
    limiters.push(
      `${interpretedConstraintCount} constraint(s) still require interpretation before they can be evaluated deterministically.`,
    );
  }

  return limiters;
}

function calculateConfidence(params: {
  executiveDecision:
    ExecutiveDecision;

  variables:
    ExecutiveOptimizationObjective["variables"];

  confidenceLimiters:
    string[];
}): number {
  const variableConfidence =
    params.variables.length > 0
      ? params.variables.reduce(
          (sum, variable) =>
            sum +
            variable.selectionConfidence,
          0,
        ) /
        params.variables.length
      : 0;

  const baseConfidence =
    (
      params.executiveDecision.confidence +
      variableConfidence
    ) / 2;

  const limiterPenalty =
    Math.min(
      0.3,
      params.confidenceLimiters.length *
        0.08,
    );

  return clamp01(
    baseConfidence -
    limiterPenalty,
  );
}

function buildExplanation(params: {
  executiveDecision:
    ExecutiveDecision;

  variables:
    ExecutiveOptimizationObjective["variables"];

  successTargets:
    ExecutiveOptimizationSuccessTarget[];

  constraints:
    ExecutiveOptimizationConstraint[];
}): string {
  const primaryVariables =
    params.variables
      .filter(
        (variable) =>
          variable.role ===
          "primary",
      )
      .map(
        (variable) =>
          variable.name,
      );

  const protectedVariables =
    params.variables
      .filter(
        (variable) =>
          variable.role ===
          "protected",
      )
      .map(
        (variable) =>
          variable.name,
      );

  const sentences = [
    `Discovery translated the executive objective "${params.executiveDecision.objective}" into an organizational optimization problem.`,
    primaryVariables.length > 0
      ? `Primary optimization variables are ${primaryVariables.join(", ")}.`
      : "No primary optimization variables were resolved.",
    protectedVariables.length > 0
      ? `The optimization should protect ${protectedVariables.join(", ")} from deterioration.`
      : "No additional protected variables were selected.",
    `${params.successTargets.length} success target(s) and ${params.constraints.length} constraint(s) were translated.`,
  ];

  return sentences.join(" ");
}

export function synthesizeExecutiveOptimizationObjective({
  executiveDecision,
  conditions,
  generatedAt =
    new Date().toISOString(),
}: SynthesizeExecutiveOptimizationObjectiveInput): ExecutiveOptimizationObjective {
  const variables =
    selectOptimizationVariables({
      executiveDecision,
      conditions,
    });

  const successTargets =
    translateSuccessTargets(
      executiveDecision,
    );

  const constraints =
    translateConstraints(
      executiveDecision,
    );

  const preferences =
    defaultPreferences();

  const confidenceLimiters =
    buildConfidenceLimiters(
      executiveDecision,
      variables,
      successTargets,
      constraints,
    );

  const confidence =
    calculateConfidence({
      executiveDecision,
      variables,
      confidenceLimiters,
    });

  return {
    id:
      createObjectiveId(
        executiveDecision.id,
      ),

    executiveDecisionId:
      executiveDecision.id,

    organizationId:
      executiveDecision.organizationId,

    objective:
      executiveDecision.objective,

    timeHorizon:
      executiveDecision.timeHorizon,

    variables,

    successTargets,

    constraints,

    preferences,

    tradeoffStrategy:
      "balanced",

    confidence,

    confidenceLimiters,

    explanation:
      buildExplanation({
        executiveDecision,
        variables,
        successTargets,
        constraints,
      }),

    generatedAt,
  };
}