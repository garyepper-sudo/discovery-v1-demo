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
  RecommendedExecutiveStrategyTheme,
} from "./recommendedExecutiveStrategyTypes";

type BuildRecommendedExecutiveStrategyInput = {
  executiveAssessment:
    ExecutiveAssessmentWithPrimaryJudgment;

  objective:
    RecommendedExecutiveObjective;

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

function inferTheme(
  condition:
    OrganizationalCondition,
): RecommendedExecutiveStrategyTheme {
  const normalized =
    `${condition.name} ${condition.summary ?? ""} ${condition.whyItMatters ?? ""}`
      .toLowerCase();

  if (
    normalized.includes(
      "decision",
    ) ||
    normalized.includes(
      "authority",
    ) ||
    normalized.includes(
      "approval",
    )
  ) {
    return "clarify_decision_rights";
  }

  if (
    normalized.includes(
      "coordination",
    ) ||
    normalized.includes(
      "handoff",
    )
  ) {
    return "strengthen_coordination";
  }

  if (
    normalized.includes(
      "knowledge",
    ) ||
    normalized.includes(
      "continuity",
    )
  ) {
    return "preserve_knowledge";
  }

  if (
    normalized.includes(
      "alignment",
    ) ||
    normalized.includes(
      "priority",
    )
  ) {
    return "align_priorities";
  }

  if (
    normalized.includes(
      "operating model",
    ) ||
    normalized.includes(
      "roles",
    ) ||
    normalized.includes(
      "workflow",
    )
  ) {
    return "stabilize_operating_model";
  }

  return "protect_execution_focus";
}

function buildStrategyItem(
  theme:
    RecommendedExecutiveStrategyTheme,

  condition:
    OrganizationalCondition,

  priority:
    "primary"
    | "supporting",
): RecommendedExecutiveStrategyItem {
  const confidence =
    normalizeConfidence(
      condition.confidence,
    );

  switch (
    theme
  ) {
    case "reduce_competing_work":
      return {
        id:
          `strategy-${condition.id}-reduce-competing-work`,

        theme,

        headline:
          "Reduce competing work.",

        strategicDirection:
          "Concentrate organizational capacity on fewer concurrent priorities so execution demand remains within the system's ability to deliver.",

        rationale:
          "Execution Capacity improves when priority load, work in progress, and attention fragmentation are reduced.",

        supportingConditionIds:
          [
            condition.id,
          ],

        priority,

        confidence,
      };

    case "clarify_decision_rights":
      return {
        id:
          `strategy-${condition.id}-clarify-decision-rights`,

        theme,

        headline:
          "Clarify decision rights.",

        strategicDirection:
          "Distribute clear authority for routine decisions and reduce avoidable approval dependency.",

        rationale:
          "Decision Flow improves when teams know which decisions they own and when escalation is genuinely required.",

        supportingConditionIds:
          [
            condition.id,
          ],

        priority,

        confidence,
      };

    case "protect_execution_focus":
      return {
        id:
          `strategy-${condition.id}-protect-execution-focus`,

        theme,

        headline:
          "Protect execution focus.",

        strategicDirection:
          "Shield the highest-leverage work from avoidable interruptions, priority churn, and coordination drag.",

        rationale:
          "Execution Capacity strengthens when critical work receives stable attention and protected operating bandwidth.",

        supportingConditionIds:
          [
            condition.id,
          ],

        priority,

        confidence,
      };

    case "strengthen_coordination":
      return {
        id:
          `strategy-${condition.id}-strengthen-coordination`,

        theme,

        headline:
          "Strengthen cross-functional coordination.",

        strategicDirection:
          "Create clearer ownership and handoff expectations across teams without prescribing a specific operating intervention.",

        rationale:
          "Coordination System constraints reinforce execution pressure when work must be repeatedly re-coordinated.",

        supportingConditionIds:
          [
            condition.id,
          ],

        priority,

        confidence,
      };

    case "preserve_knowledge":
      return {
        id:
          `strategy-${condition.id}-preserve-knowledge`,

        theme,

        headline:
          "Preserve reusable operating knowledge.",

        strategicDirection:
          "Reduce dependence on informal context transfer by strengthening organizational knowledge continuity.",

        rationale:
          "Knowledge Continuity supports execution by preventing repeated rediscovery and dependency on a small number of people.",

        supportingConditionIds:
          [
            condition.id,
          ],

        priority,

        confidence,
      };

    case "align_priorities":
      return {
        id:
          `strategy-${condition.id}-align-priorities`,

        theme,

        headline:
          "Align priorities and tradeoffs.",

        strategicDirection:
          "Create a shared interpretation of what matters most so teams make consistent tradeoffs.",

        rationale:
          "Strategic Alignment reduces priority conflict and prevents local decisions from increasing execution drag.",

        supportingConditionIds:
          [
            condition.id,
          ],

        priority,

        confidence,
      };

    case "stabilize_operating_model":
      return {
        id:
          `strategy-${condition.id}-stabilize-operating-model`,

        theme,

        headline:
          "Stabilize the operating model.",

        strategicDirection:
          "Make roles, workflows, and decision expectations explicit enough to support consistent execution.",

        rationale:
          "A clearer Operating Model reduces ambiguity and supports more reliable coordination and decision flow.",

        supportingConditionIds:
          [
            condition.id,
          ],

        priority,

        confidence,
      };
  }
}

function buildPrimaryStrategy(
  objective:
    RecommendedExecutiveObjective,

  primaryCondition:
    OrganizationalCondition,
): RecommendedExecutiveStrategyItem {
  if (
    objective.objectiveType ===
      "increase" &&
    primaryCondition.name
      .toLowerCase()
      .includes(
        "capacity",
      )
  ) {
    return buildStrategyItem(
      "reduce_competing_work",
      primaryCondition,
      "primary",
    );
  }

  return buildStrategyItem(
    inferTheme(
      primaryCondition,
    ),
    primaryCondition,
    "primary",
  );
}

export function buildRecommendedExecutiveStrategy(
  input:
    BuildRecommendedExecutiveStrategyInput,
): RecommendedExecutiveStrategy {
  const primaryCondition =
    findCondition(
      input.organizationalConditions,
      input.objective
        .targetConditionId,
    );

  if (
    !primaryCondition
  ) {
    throw new Error(
      "Recommended Executive Strategy requires the objective's target condition.",
    );
  }

  const primaryStrategy =
    buildPrimaryStrategy(
      input.objective,
      primaryCondition,
    );

  const relatedConditionIds =
    unique(
      [
        ...input.objective
          .supportingConditionIds,

        ...(
          input.executiveAssessment
            .primaryJudgment
            ?.supportingConditionIds ??
          []
        ),
      ],
    )
      .filter(
        (conditionId) =>
          conditionId !==
          primaryCondition.id,
      );

  const supportingStrategies =
    relatedConditionIds
      .map(
        (conditionId) =>
          findCondition(
            input.organizationalConditions,
            conditionId,
          ),
      )
      .filter(
        (
          condition,
        ): condition is OrganizationalCondition =>
          Boolean(
            condition,
          ),
      )
      .map(
        (condition) =>
          buildStrategyItem(
            inferTheme(
              condition,
            ),
            condition,
            "supporting",
          ),
      )
      .filter(
        (
          strategy,
          index,
          strategies,
        ) =>
          strategies.findIndex(
            (candidate) =>
              candidate.theme ===
              strategy.theme,
          ) ===
          index,
      )
      .slice(
        0,
        2,
      );

  const strategies =
    [
      primaryStrategy,
      ...supportingStrategies,
    ];

  const confidence =
    clamp01(
      (
        normalizeConfidence(
          input.objective
            .confidence,
        ) +
        strategies.reduce(
          (
            total,
            strategy,
          ) =>
            total +
            strategy.confidence,
          0,
        ) /
          strategies.length
      ) /
        2,
    );

  const supportingAssessmentId =
    (
      input.executiveAssessment as
        ExecutiveAssessmentWithPrimaryJudgment & {
          id?:
            string;
        }
    )
      .id ??
    "executiveAssessment-1";

  const strategyHeadlines =
    strategies.map(
      (strategy) =>
        strategy.headline,
    );

  return {
    id:
      `recommended-strategy-${input.objective.id}`,

    headline:
      `Pursue ${input.objective.targetConditionName} through a focused operating strategy.`,

    executiveStrategy:
      strategyHeadlines.join(
        " ",
      ),

    objective:
      input.objective,

    strategies,

    supportingAssessmentId,

    supportingObjectiveId:
      input.objective.id,

    confidence,

    uncertaintySummary:
      input.objective
        .uncertaintySummary,

    boundaries: {
      doesNotSelectIntervention:
        true,

      doesNotSpecifyImplementation:
        true,

      doesNotOptimize:
        true,

      doesNotSimulate:
        true,
    },

    createdAt:
      input.now ??
      new Date()
        .toISOString(),
  };
}

export type {
  BuildRecommendedExecutiveStrategyInput,
};
