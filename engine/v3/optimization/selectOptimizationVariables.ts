import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  OrganizationalCondition,
} from "../model/state/inferOrganizationalConditions";

import type {
  OptimizationVariable,
  OptimizationVariableObjective,
  OptimizationVariableRole,
} from "./optimizationVariable";

export type SelectOptimizationVariablesInput = {
  executiveDecision:
    ExecutiveDecision;

  conditions:
    OrganizationalCondition[];
};

function clamp01(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(1, value),
  );
}

function conditionPriorityScore(
  condition:
    OrganizationalCondition,
): number {
  switch (condition.priority) {
    case "critical":
      return 1;

    case "high":
      return 0.8;

    case "medium":
      return 0.5;

    case "low":
      return 0.25;
  }
}

function networkInfluenceScore(
  condition:
    OrganizationalCondition,

  conditionCount:
    number,
): number {
  if (conditionCount <= 1) {
    return 0;
  }

  const connectedConditionIds =
    new Set([
      ...condition.upstreamConditionIds,
      ...condition.downstreamConditionIds,
    ]);

  return clamp01(
    connectedConditionIds.size /
      (conditionCount - 1),
  );
}

function determineRole(params: {
  condition:
    OrganizationalCondition;

  executiveDecision:
    ExecutiveDecision;

  successMetricConditionIds:
    Set<string>;

  connectedToPrimary:
    boolean;
}): OptimizationVariableRole | null {
  const {
    condition,
    executiveDecision,
    successMetricConditionIds,
    connectedToPrimary,
  } = params;

  if (
    executiveDecision.targetConditionIds.includes(
      condition.id,
    ) ||
    successMetricConditionIds.has(
      condition.id,
    )
  ) {
    return "primary";
  }

  if (
    connectedToPrimary
  ) {
    return "secondary";
  }

  if (
    (
      condition.priority === "critical" ||
      condition.priority === "high"
    ) &&
    (
      condition.status === "deteriorating" ||
      condition.status === "constrained" ||
      condition.status === "weak"
    )
  ) {
    return "protected";
  }

  return null;
}

function determineObjective(
  role:
    OptimizationVariableRole,
): OptimizationVariableObjective {
  switch (role) {
    case "primary":
      return "improve";

    case "secondary":
      return "improve";

    case "protected":
      return "preserve";
  }
}

function executivePriorityScore(
  role:
    OptimizationVariableRole,
): number {
  switch (role) {
    case "primary":
      return 1;

    case "secondary":
      return 0.5;

    case "protected":
      return 0.35;
  }
}

function buildRationale(params: {
  condition:
    OrganizationalCondition;

  role:
    OptimizationVariableRole;

  executivePriority:
    number;

  conditionPriority:
    number;

  networkInfluence:
    number;
}): string {
  const {
    condition,
    role,
    executivePriority,
    conditionPriority,
    networkInfluence,
  } = params;

  const roleExplanation =
    role === "primary"
      ? "Leadership explicitly identified this condition as a decision target or success metric."
      : role === "secondary"
        ? "This condition is directly connected to a primary optimization variable."
        : "This high-priority condition should be protected from deterioration while the primary objective is pursued.";

  return [
    roleExplanation,
    `${condition.name} has ${condition.priority} organizational priority.`,
    `Its executive-priority contribution is ${Math.round(
      executivePriority * 100,
    )}%.`,
    `Its condition-priority contribution is ${Math.round(
      conditionPriority * 100,
    )}%.`,
    `Its network-influence contribution is ${Math.round(
      networkInfluence * 100,
    )}%.`,
  ].join(" ");
}

/**
 * Selects the canonical organizational variables that belong in an
 * Executive Decision optimization problem.
 *
 * Version 1 uses deterministic, explainable weighting:
 *
 * - 50% executive priority
 * - 30% condition priority
 * - 20% network influence
 *
 * This capability performs no simulation, constraint evaluation,
 * scenario ranking, or recommendation synthesis.
 */
export function selectOptimizationVariables({
  executiveDecision,
  conditions,
}: SelectOptimizationVariablesInput): OptimizationVariable[] {
  const conditionById =
    new Map(
      conditions.map(
        (condition) => [
          condition.id,
          condition,
        ],
      ),
    );

  const successMetricConditionIds =
    new Set(
      executiveDecision.successMetrics
        .map(
          (metric) =>
            metric.targetConditionId,
        )
        .filter(
          (
            conditionId,
          ): conditionId is string =>
            typeof conditionId ===
              "string" &&
            conditionId.length > 0,
        ),
    );

  const primaryConditionIds =
    new Set([
      ...executiveDecision
        .targetConditionIds,
      ...successMetricConditionIds,
    ]);

  const connectedConditionIds =
    new Set<string>();

  primaryConditionIds.forEach(
    (conditionId) => {
      const condition =
        conditionById.get(
          conditionId,
        );

      if (!condition) {
        return;
      }

      condition.upstreamConditionIds.forEach(
        (connectedId) => {
          connectedConditionIds.add(
            connectedId,
          );
        },
      );

      condition.downstreamConditionIds.forEach(
        (connectedId) => {
          connectedConditionIds.add(
            connectedId,
          );
        },
      );
    },
  );

  return conditions
    .map((condition) => {
      const role =
        determineRole({
          condition,
          executiveDecision,
          successMetricConditionIds,
          connectedToPrimary:
            connectedConditionIds.has(
              condition.id,
            ),
        });

      if (!role) {
        return undefined;
      }

      const executivePriority =
        executivePriorityScore(
          role,
        );

      const priorityScore =
        conditionPriorityScore(
          condition,
        );

      const influenceScore =
        networkInfluenceScore(
          condition,
          conditions.length,
        );

      const weight =
        clamp01(
          executivePriority *
            0.5 +
          priorityScore *
            0.3 +
          influenceScore *
            0.2,
        );

      return {
        conditionId:
          condition.id,

        name:
          condition.name,

        role,

        objective:
          determineObjective(
            role,
          ),

        weight,

        executivePriorityScore:
          executivePriority,

        conditionPriorityScore:
          priorityScore,

        networkInfluenceScore:
          influenceScore,

        selectionConfidence:
          clamp01(
            (
              executiveDecision
                .confidence +
              condition.confidence
            ) / 2,
          ),

        rationale:
          buildRationale({
            condition,
            role,
            executivePriority,
            conditionPriority:
              priorityScore,
            networkInfluence:
              influenceScore,
          }),

        upstreamConditionIds: [
          ...condition
            .upstreamConditionIds,
        ],

        downstreamConditionIds: [
          ...condition
            .downstreamConditionIds,
        ],
      } satisfies OptimizationVariable;
    })
    .filter(
      (
        variable,
      ): variable is OptimizationVariable =>
        Boolean(variable),
    )
    .sort(
      (left, right) => {
        if (
          right.weight !==
          left.weight
        ) {
          return (
            right.weight -
            left.weight
          );
        }

        return left.conditionId.localeCompare(
          right.conditionId,
        );
      },
    );
}