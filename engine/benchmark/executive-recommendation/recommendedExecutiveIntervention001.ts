import {
  buildRecommendedExecutiveIntervention,
} from "../../v3/model/recommendation/buildRecommendedExecutiveIntervention";

import type {
  ExecutiveAssessmentWithPrimaryJudgment,
} from "../../v3/model/judgment/buildExecutiveAssessment";

import type {
  OrganizationalCondition,
} from "../../v3/model/state/inferOrganizationalConditions";

import type {
  RecommendedExecutiveObjective,
} from "../../v3/model/recommendation/recommendedExecutiveObjectiveTypes";

import type {
  RecommendedExecutiveStrategy,
} from "../../v3/model/recommendation/recommendedExecutiveStrategyTypes";

type Check = {
  label:
    string;

  passed:
    boolean;
};

function assertChecks(
  checks:
    Check[],
): void {
  const failed =
    checks.filter(
      (check) =>
        !check.passed,
    );

  for (
    const check of
    checks
  ) {
    console.log(
      `${check.passed ? "PASS" : "FAIL"}  ${check.label}`,
    );
  }

  if (
    failed.length >
    0
  ) {
    throw new Error(
      `Recommended Executive Intervention benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
    );
  }
}

const objective =
  {
    id:
      "recommended-objective-condition-executioncapacity",

    headline:
      "Increase Execution Capacity.",

    executiveObjective:
      "Leadership should improve Execution Capacity so the organization can convert strategic intent into reliable execution.",

    objectiveType:
      "increase",

    targetConditionId:
      "condition-executioncapacity",

    targetConditionName:
      "Execution Capacity",

    rationale:
      "Execution Capacity is the primary organizational constraint.",

    supportingAssessmentId:
      "executiveAssessment-1",

    supportingPrimaryJudgmentId:
      "executive-primary-judgment-1",

    supportingConditionIds:
      [
        "condition-executioncapacity",
        "condition-decisionflow",
        "condition-coordination",
      ],

    confidence:
      0.597,

    uncertaintySummary:
      "Longitudinal evidence is still limited.",

    boundaries: {
      doesNotRecommendStrategy:
        true,

      doesNotRecommendIntervention:
        true,

      doesNotOptimize:
        true,

      doesNotSimulate:
        true,
    },

    createdAt:
      "2026-07-17T18:00:00.000Z",
  } as
    RecommendedExecutiveObjective;

const strategy =
  {
    id:
      "recommended-strategy-recommended-objective-condition-executioncapacity",

    headline:
      "Pursue Execution Capacity through a focused operating strategy.",

    executiveStrategy:
      "Reduce competing work. Clarify decision rights. Strengthen cross-functional coordination.",

    objective,

    strategies: [
      {
        id:
          "strategy-condition-executioncapacity-reduce-competing-work",

        theme:
          "reduce_competing_work",

        headline:
          "Reduce competing work.",

        strategicDirection:
          "Concentrate organizational capacity on fewer concurrent priorities.",

        rationale:
          "Execution Capacity improves when work in progress is reduced.",

        supportingConditionIds:
          [
            "condition-executioncapacity",
          ],

        priority:
          "primary",

        confidence:
          0.58,
      },

      {
        id:
          "strategy-condition-decisionflow-clarify-decision-rights",

        theme:
          "clarify_decision_rights",

        headline:
          "Clarify decision rights.",

        strategicDirection:
          "Distribute clear authority for routine decisions.",

        rationale:
          "Decision Flow improves when teams know which decisions they own.",

        supportingConditionIds:
          [
            "condition-decisionflow",
          ],

        priority:
          "supporting",

        confidence:
          0.61,
      },
    ],

    supportingAssessmentId:
      "executiveAssessment-1",

    supportingObjectiveId:
      objective.id,

    confidence:
      0.59,

    uncertaintySummary:
      "Longitudinal evidence is still limited.",

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
      "2026-07-17T18:15:00.000Z",
  } as
    RecommendedExecutiveStrategy;

const assessment =
  {
    id:
      "executiveAssessment-1",

    summary:
      "Execution Capacity is the organization's primary constraint.",

    confidence:
      0.616,
  } as unknown as
    ExecutiveAssessmentWithPrimaryJudgment;

const conditions =
  [
    {
      id:
        "condition-executioncapacity",

      name:
        "Execution Capacity",

      confidence:
        0.58,

      summary:
        "Execution demand exceeds available capacity and focus.",
    },

    {
      id:
        "condition-decisionflow",

      name:
        "Decision Flow",

      confidence:
        0.61,
    },
  ] as unknown as
    OrganizationalCondition[];

const intervention =
  buildRecommendedExecutiveIntervention({
    executiveAssessment:
      assessment,

    objective,

    strategy,

    organizationalConditions:
      conditions,

    now:
      "2026-07-17T18:30:00.000Z",
  });

console.log("");
console.log("==========================================");
console.log("RECOMMENDED EXECUTIVE INTERVENTION 001");
console.log("==========================================");
console.log("");

console.log(
  intervention.headline,
);

console.log("");
console.log(
  intervention.executiveIntervention,
);

console.log("");
console.log(
  `Intervention type: ${intervention.interventionType}`,
);

console.log(
  `Target: ${intervention.targetConditionName}`,
);

console.log(
  `Confidence: ${intervention.confidence.toFixed(3)}`,
);

console.log(
  `Uncertainty: ${intervention.uncertaintySummary}`,
);

console.log("");
console.log("Checks");
console.log("------------------------------------------");

assertChecks(
  [
    {
      label:
        "Intervention reduces active work in progress",

      passed:
        intervention.interventionType ===
          "work_portfolio_reduction" &&
        intervention.headline ===
          "Reduce active work in progress.",
    },

    {
      label:
        "Intervention targets the objective condition",

      passed:
        intervention.targetConditionId ===
        objective.targetConditionId,
    },

    {
      label:
        "Intervention preserves objective ancestry",

      passed:
        intervention.supportingObjectiveId ===
        objective.id,
    },

    {
      label:
        "Intervention preserves strategy ancestry",

      passed:
        intervention.supportingStrategyId ===
        strategy.id,
    },

    {
      label:
        "Intervention is concrete",

      passed:
        intervention.executiveIntervention.includes(
          "reduce the number of concurrently active priorities",
        ),
    },

    {
      label:
        "Intervention does not optimize",

      passed:
        intervention.boundaries
          .doesNotOptimize ===
        true,
    },

    {
      label:
        "Intervention does not simulate",

      passed:
        intervention.boundaries
          .doesNotSimulate ===
        true,
    },

    {
      label:
        "Intervention avoids detailed implementation planning",

      passed:
        intervention.boundaries
          .doesNotSpecifyDetailedImplementationPlan ===
        true,
    },

    {
      label:
        "Confidence is bounded",

      passed:
        intervention.confidence >=
          0 &&
        intervention.confidence <=
          1,
    },

    {
      label:
        "Uncertainty is explicit",

      passed:
        intervention
          .uncertaintySummary
          .trim()
          .length >
        0,
    },
  ],
);

console.log("");
console.log("==========================================");
console.log("VALIDATION RESULT");
console.log("==========================================");
console.log("");
console.log("PASS");
console.log("");
