import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  ExecutivePrimaryConstraint,
} from "../model/judgment/buildPrimaryExecutiveConstraint";

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

  /**
   * Discovery's canonical synthesis of the single highest-leverage
   * organizational constraint.
   *
   * This remains optional for backward compatibility with runtimes
   * and benchmarks created before Primary Executive Constraint
   * synthesis was introduced.
   */
  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;

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
    (
      constraint,
      sourceConstraintIndex,
    ) => ({
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

function resolvePrimaryConstraintCondition(params: {
  conditions:
    OrganizationalCondition[];

  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;
}): OrganizationalCondition | undefined {
  const primaryConstraint =
    params.primaryExecutiveConstraint;

  if (!primaryConstraint) {
    return undefined;
  }

  return params.conditions.find(
    (condition) =>
      condition.id ===
      primaryConstraint.conditionId,
  );
}

/**
 * Variable selection remains owned by CAP-OPT-001.
 *
 * This producer does not recreate variable-selection logic.
 * It supplies the canonical primary constraint first so the existing
 * selector evaluates it before lower-leverage conditions.
 */
function orderConditionsForOptimization(params: {
  conditions:
    OrganizationalCondition[];

  primaryConstraintCondition?:
    OrganizationalCondition;
}): OrganizationalCondition[] {
  const primaryConstraintCondition =
    params.primaryConstraintCondition;

  if (!primaryConstraintCondition) {
    return [...params.conditions];
  }

  return [
    primaryConstraintCondition,

    ...params.conditions.filter(
      (condition) =>
        condition.id !==
        primaryConstraintCondition.id,
    ),
  ];
}

function buildConfidenceLimiters(params: {
  executiveDecision:
    ExecutiveDecision;

  variables:
    ExecutiveOptimizationObjective["variables"];

  successTargets:
    ExecutiveOptimizationSuccessTarget[];

  constraints:
    ExecutiveOptimizationConstraint[];

  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;

  primaryConstraintCondition?:
    OrganizationalCondition;
}): string[] {
  const limiters: string[] = [];

  const unlinkedSuccessMetricCount =
    params.executiveDecision
      .successMetrics.length -
    params.successTargets.length;

  if (unlinkedSuccessMetricCount > 0) {
    limiters.push(
      `${unlinkedSuccessMetricCount} success metric(s) are not linked to canonical organizational conditions.`,
    );
  }

  if (params.variables.length === 0) {
    limiters.push(
      "No organizational variables could be selected for optimization.",
    );
  }

  const interpretedConstraintCount =
    params.constraints.filter(
      (constraint) =>
        constraint.translationStatus !==
        "structured",
    ).length;

  if (interpretedConstraintCount > 0) {
    limiters.push(
      `${interpretedConstraintCount} constraint(s) still require interpretation before they can be evaluated deterministically.`,
    );
  }

  if (
    params.primaryExecutiveConstraint &&
    !params.primaryConstraintCondition
  ) {
    limiters.push(
      `The primary executive constraint "${params.primaryExecutiveConstraint.conditionId}" does not resolve to a canonical organizational condition.`,
    );
  }

  if (
    !params.primaryExecutiveConstraint
  ) {
    limiters.push(
      "No primary executive constraint was supplied, so the optimization objective could not be explicitly anchored to the organization's highest-leverage constraint.",
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

  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;

  primaryConstraintCondition?:
    OrganizationalCondition;
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

  const primaryConstraintConfidence =
    params.primaryConstraintCondition &&
    params.primaryExecutiveConstraint
      ? (
          params.primaryConstraintCondition
            .confidence +
          params.primaryExecutiveConstraint
            .confidence
        ) / 2
      : undefined;

  const confidenceInputs = [
    params.executiveDecision.confidence,
    variableConfidence,
  ];

  if (
    primaryConstraintConfidence !==
    undefined
  ) {
    confidenceInputs.push(
      primaryConstraintConfidence,
    );
  }

  const baseConfidence =
    confidenceInputs.reduce(
      (sum, confidence) =>
        sum + confidence,
      0,
    ) /
    confidenceInputs.length;

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

  primaryExecutiveConstraint?:
    ExecutivePrimaryConstraint | null;

  primaryConstraintCondition?:
    OrganizationalCondition;
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

  const primaryConstraintSentence =
    params.primaryExecutiveConstraint &&
    params.primaryConstraintCondition
      ? [
          `The objective is anchored to the primary executive constraint "${params.primaryExecutiveConstraint.title}".`,
          params.primaryExecutiveConstraint
            .expectedExecutiveImpact,
        ].join(" ")
      : "No canonical primary executive constraint was available, so Discovery optimized against the broader organizational condition set.";

  const sentences = [
    `Discovery translated the executive objective "${params.executiveDecision.objective}" into an organizational optimization problem.`,

    primaryConstraintSentence,

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
  primaryExecutiveConstraint,
  generatedAt =
    new Date().toISOString(),
}: SynthesizeExecutiveOptimizationObjectiveInput): ExecutiveOptimizationObjective {
  const primaryConstraintCondition =
    resolvePrimaryConstraintCondition({
      conditions,
      primaryExecutiveConstraint,
    });

  const orderedConditions =
    orderConditionsForOptimization({
      conditions,
      primaryConstraintCondition,
    });

  const variables =
    selectOptimizationVariables({
      executiveDecision,

      conditions:
        orderedConditions,
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
    buildConfidenceLimiters({
      executiveDecision,
      variables,
      successTargets,
      constraints,
      primaryExecutiveConstraint,
      primaryConstraintCondition,
    });

  const confidence =
    calculateConfidence({
      executiveDecision,
      variables,
      confidenceLimiters,
      primaryExecutiveConstraint,
      primaryConstraintCondition,
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
        primaryExecutiveConstraint,
        primaryConstraintCondition,
      }),

    generatedAt,
  };
}