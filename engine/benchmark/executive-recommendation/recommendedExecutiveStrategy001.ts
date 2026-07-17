import {
  buildRecommendedExecutiveStrategy,
} from "../../v3/model/recommendation/buildRecommendedExecutiveStrategy";

import type {
  ExecutiveAssessmentWithPrimaryJudgment,
} from "../../v3/model/judgment/buildExecutiveAssessment";

import type {
  OrganizationalCondition,
} from "../../v3/model/state/inferOrganizationalConditions";

import type {
  RecommendedExecutiveObjective,
} from "../../v3/model/recommendation/recommendedExecutiveObjectiveTypes";

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
      `Recommended Executive Strategy benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
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

const assessment =
  {
    id:
      "executiveAssessment-1",

    summary:
      "Execution Capacity is the organization's primary constraint.",

    confidence:
      0.616,

    primaryJudgment: {
      id:
        "executive-primary-judgment-1",

      headline:
        "Execution Capacity is the organization's primary constraint.",

      supportingConditionIds:
        [
          "condition-decisionflow",
          "condition-coordination",
        ],
    },
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

      summary:
        "Decisions depend on unclear authority and approval loops.",
    },

    {
      id:
        "condition-coordination",

      name:
        "Coordination System",

      confidence:
        0.61,

      summary:
        "Cross-functional handoffs remain unclear.",
    },
  ] as unknown as
    OrganizationalCondition[];

const strategy =
  buildRecommendedExecutiveStrategy({
    executiveAssessment:
      assessment,

    objective,

    organizationalConditions:
      conditions,

    now:
      "2026-07-17T18:15:00.000Z",
  });

console.log("");
console.log("==========================================");
console.log("RECOMMENDED EXECUTIVE STRATEGY 001");
console.log("==========================================");
console.log("");

console.log(
  strategy.headline,
);

console.log("");
console.log(
  strategy.executiveStrategy,
);

console.log("");
console.log("Strategies");
console.log("------------------------------------------");

for (
  const item of
  strategy.strategies
) {
  console.log(
    `${item.priority.toUpperCase()}  ${item.headline}`,
  );

  console.log(
    `  ${item.strategicDirection}`,
  );
}

console.log("");
console.log("Checks");
console.log("------------------------------------------");

assertChecks(
  [
    {
      label:
        "Primary strategy reduces competing work",

      passed:
        strategy.strategies[
          0
        ]
          ?.theme ===
        "reduce_competing_work",
    },

    {
      label:
        "Decision rights remain in the strategy",

      passed:
        strategy.strategies
          .some(
            (item) =>
              item.theme ===
              "clarify_decision_rights",
          ),
    },

    {
      label:
        "Coordination remains in the strategy",

      passed:
        strategy.strategies
          .some(
            (item) =>
              item.theme ===
              "strengthen_coordination",
          ),
    },

    {
      label:
        "Strategy preserves the objective",

      passed:
        strategy.supportingObjectiveId ===
        objective.id,
    },

    {
      label:
        "Strategy does not select intervention",

      passed:
        strategy.boundaries
          .doesNotSelectIntervention ===
        true,
    },

    {
      label:
        "Strategy does not specify implementation",

      passed:
        strategy.boundaries
          .doesNotSpecifyImplementation ===
        true,
    },

    {
      label:
        "Strategy does not optimize",

      passed:
        strategy.boundaries
          .doesNotOptimize ===
        true,
    },

    {
      label:
        "Strategy does not simulate",

      passed:
        strategy.boundaries
          .doesNotSimulate ===
        true,
    },

    {
      label:
        "Confidence is bounded",

      passed:
        strategy.confidence >=
          0 &&
        strategy.confidence <=
          1,
    },

    {
      label:
        "Uncertainty is explicit",

      passed:
        strategy
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
