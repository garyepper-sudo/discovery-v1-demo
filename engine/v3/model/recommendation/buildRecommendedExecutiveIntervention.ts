import type {
  ExecutiveAssessmentWithPrimaryJudgment,
} from "../judgment/buildExecutiveAssessment";

import type {
  OrganizationalCondition,
} from "../state/inferOrganizationalConditions";

import type {
  RecommendedExecutiveObjective,
} from "./recommendedExecutiveObjectiveTypes";

import type {
  RecommendedExecutiveStrategy,
  RecommendedExecutiveStrategyItem,
} from "./recommendedExecutiveStrategyTypes";

import type {
  RecommendedExecutiveIntervention,
  RecommendedExecutiveInterventionType,
} from "./recommendedExecutiveInterventionTypes";

type BuildRecommendedExecutiveInterventionInput = {
  executiveAssessment:
    ExecutiveAssessmentWithPrimaryJudgment;

  objective:
    RecommendedExecutiveObjective;

  strategy:
    RecommendedExecutiveStrategy;

  organizationalConditions:
    OrganizationalCondition[];

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

function normalizeConfidence(
  value:
    unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0.5;
  }

  return clamp01(
    value >
      1
      ? value /
        100
      : value,
  );
}

function findCondition(
  conditions:
    OrganizationalCondition[],

  conditionId:
    string,
): OrganizationalCondition | null {
  return (
    conditions.find(
      (condition) =>
        condition.id ===
        conditionId,
    ) ??
    null
  );
}

function selectPrimaryStrategyItem(
  strategy:
    RecommendedExecutiveStrategy,
): RecommendedExecutiveStrategyItem {
  const primary =
    strategy.strategies.find(
      (item) =>
        item.priority ===
        "primary",
    );

  if (
    primary
  ) {
    return primary;
  }

  const first =
    strategy.strategies[
      0
    ];

  if (
    !first
  ) {
    throw new Error(
      "Recommended Executive Intervention requires at least one strategy item.",
    );
  }

  return first;
}

function inferInterventionType(
  strategyItem:
    RecommendedExecutiveStrategyItem,
): RecommendedExecutiveInterventionType {
  switch (
    strategyItem.theme
  ) {
    case "reduce_competing_work":
      return "work_portfolio_reduction";

    case "clarify_decision_rights":
      return "decision_authority_delegation";

    case "strengthen_coordination":
      return "cross_functional_ownership_definition";

    case "preserve_knowledge":
      return "knowledge_operating_system";

    case "align_priorities":
      return "priority_alignment_reset";

    case "stabilize_operating_model":
      return "operating_model_clarification";

    case "protect_execution_focus":
      return "work_portfolio_reduction";
  }
}

function buildInterventionLanguage(
  interventionType:
    RecommendedExecutiveInterventionType,

  targetConditionName:
    string,
): {
  headline:
    string;

  executiveIntervention:
    string;

  rationale:
    string;
} {
  switch (
    interventionType
  ) {
    case "work_portfolio_reduction":
      return {
        headline:
          "Reduce active work in progress.",

        executiveIntervention:
          "Leadership should reduce the number of concurrently active priorities and explicitly protect the highest-leverage work from new demand.",

        rationale:
          `This intervention directly addresses ${targetConditionName} by lowering execution demand, reducing priority conflict, and restoring focused operating capacity.`,
      };

    case "decision_authority_delegation":
      return {
        headline:
          "Delegate routine decision authority.",

        executiveIntervention:
          "Leadership should assign clear decision ownership for routine operating decisions and reserve escalation for defined exceptions.",

        rationale:
          `This intervention improves ${targetConditionName} by reducing approval dependency and increasing decision throughput.`,
      };

    case "cross_functional_ownership_definition":
      return {
        headline:
          "Define cross-functional ownership.",

        executiveIntervention:
          "Leadership should establish explicit ownership and handoff accountability for the highest-friction cross-functional workflows.",

        rationale:
          `This intervention improves ${targetConditionName} by reducing coordination ambiguity and repeated management intervention.`,
      };

    case "knowledge_operating_system":
      return {
        headline:
          "Create a reusable operating knowledge system.",

        executiveIntervention:
          "Leadership should establish a canonical mechanism for capturing, maintaining, and reusing critical operating knowledge.",

        rationale:
          `This intervention improves ${targetConditionName} by reducing repeated rediscovery and dependency on informal context transfer.`,
      };

    case "priority_alignment_reset":
      return {
        headline:
          "Reset enterprise priorities.",

        executiveIntervention:
          "Leadership should establish a single current priority hierarchy and make the required tradeoffs explicit across teams.",

        rationale:
          `This intervention improves ${targetConditionName} by reducing conflicting interpretations and inconsistent local tradeoffs.`,
      };

    case "operating_model_clarification":
      return {
        headline:
          "Clarify the operating model.",

        executiveIntervention:
          "Leadership should define the essential roles, workflows, decision rights, and escalation expectations required for consistent execution.",

        rationale:
          `This intervention improves ${targetConditionName} by replacing implicit operating assumptions with explicit organizational expectations.`,
      };
  }
}

function unique(
  values:
    string[],
): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value) =>
          value.trim().length >
          0,
      ),
    ),
  );
}

export function buildRecommendedExecutiveIntervention(
  input:
    BuildRecommendedExecutiveInterventionInput,
): RecommendedExecutiveIntervention {
  const primaryStrategyItem =
    selectPrimaryStrategyItem(
      input.strategy,
    );

  const targetCondition =
    findCondition(
      input.organizationalConditions,
      input.objective
        .targetConditionId,
    );

  if (
    !targetCondition
  ) {
    throw new Error(
      "Recommended Executive Intervention requires the objective's target condition.",
    );
  }

  const interventionType =
    inferInterventionType(
      primaryStrategyItem,
    );

  const language =
    buildInterventionLanguage(
      interventionType,
      input.objective
        .targetConditionName,
    );

  const supportingStrategyItemIds =
    unique(
      input.strategy
        .strategies
        .map(
          (item) =>
            item.id,
        ),
    );

  const supportingConditionIds =
    unique(
      [
        targetCondition.id,
        ...primaryStrategyItem
          .supportingConditionIds,
        ...input.objective
          .supportingConditionIds,
      ],
    );

  const confidence =
    clamp01(
      (
        normalizeConfidence(
          input.objective
            .confidence,
        ) +
        normalizeConfidence(
          input.strategy
            .confidence,
        ) +
        normalizeConfidence(
          primaryStrategyItem
            .confidence,
        ) +
        normalizeConfidence(
          targetCondition
            .confidence,
        )
      ) /
        4,
    );

  const uncertaintySummary =
    input.strategy
      .uncertaintySummary ||
    input.objective
      .uncertaintySummary ||
    "Additional implementation evidence would increase confidence that this is the highest-leverage intervention.";

  return {
    id:
      `recommended-intervention-${interventionType}`,

    headline:
      language.headline,

    executiveIntervention:
      language.executiveIntervention,

    interventionType,

    targetConditionId:
      targetCondition.id,

    targetConditionName:
      targetCondition.name,

    rationale:
      language.rationale,

    supportingObjectiveId:
      input.objective.id,

    supportingStrategyId:
      input.strategy.id,

    supportingStrategyItemIds,

    supportingConditionIds,

    confidence,

    uncertaintySummary,

    boundaries: {
      doesNotOptimize:
        true,

      doesNotSimulate:
        true,

      doesNotSpecifyDetailedImplementationPlan:
        true,
    },

    objective:
      input.objective,

    strategy:
      input.strategy,

    createdAt:
      input.now ??
      new Date()
        .toISOString(),
  };
}

export type {
  BuildRecommendedExecutiveInterventionInput,
};
