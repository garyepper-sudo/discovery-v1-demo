import {
  buildExecutiveRecommendation,
} from "../../v3/model/recommendation/buildExecutiveRecommendation";

import type {
  ExecutiveAssessmentWithPrimaryJudgment,
} from "../../v3/model/judgment/buildExecutiveAssessment";

import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../../v3/model/state/inferOrganizationalConditions";

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
      `Executive Recommendation benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
    );
  }
}

const conditions =
  [
    {
      id:
        "condition-executioncapacity",

      name:
        "Execution Capacity",

      status:
        "constrained",

      confidence:
        0.58,

      strength:
        0.65,

      summary:
        "Execution demand exceeds available capacity and focus.",

      whyItMatters:
        "Execution capacity determines whether strategic intent can become completed work.",

      uncertaintySummary:
        "Longitudinal evidence is still limited.",
    },

    {
      id:
        "condition-decisionflow",

      name:
        "Decision Flow",

      status:
        "constrained",

      confidence:
        0.61,

      strength:
        0.61,

      summary:
        "Decisions depend on unclear authority and approval loops.",
    },

    {
      id:
        "condition-coordination",

      name:
        "Coordination System",

      status:
        "constrained",

      confidence:
        0.61,

      strength:
        0.56,

      summary:
        "Cross-functional handoffs remain unclear.",
    },
  ] as unknown as
    OrganizationalCondition[];

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

      executiveJudgment:
        "Execution Capacity currently carries the highest combined organizational risk.",

      rationale:
        "The judgment is supported by operating constraints and related conditions.",

      supportingConditionIds:
        [
          "condition-decisionflow",
          "condition-coordination",
        ],

      confidence:
        0.594,

      uncertaintySummary:
        "Longitudinal evidence is still limited.",
    },
  } as unknown as
    ExecutiveAssessmentWithPrimaryJudgment;

const organizationalState =
  {
    id:
      "organizational-state-current",

    status:
      "strained",

    primaryConditionId:
      "condition-executioncapacity",

    summary:
      "The organization is strained.",
  } as unknown as
    OrganizationalState;

const recommendation =
  buildExecutiveRecommendation({
    executiveAssessment:
      assessment,

    organizationalState,

    organizationalConditions:
      conditions,

    now:
      "2026-07-17T18:45:00.000Z",
  });

console.log("");
console.log("==========================================");
console.log("EXECUTIVE RECOMMENDATION 001");
console.log("==========================================");
console.log("");

console.log(
  recommendation.headline,
);

console.log("");
console.log(
  recommendation.executiveRecommendation,
);

console.log("");
console.log("Objective");
console.log("------------------------------------------");
console.log(
  recommendation.objective.headline,
);

console.log("");
console.log("Strategy");
console.log("------------------------------------------");

for (
  const strategy of
  recommendation.strategy.strategies
) {
  console.log(
    `${strategy.priority.toUpperCase()}  ${strategy.headline}`,
  );
}

console.log("");
console.log("Intervention");
console.log("------------------------------------------");
console.log(
  recommendation.intervention.headline,
);

console.log("");
console.log(
  `Confidence: ${recommendation.confidence.toFixed(3)}`,
);

console.log(
  `Uncertainty: ${recommendation.uncertaintySummary}`,
);

console.log("");
console.log("Checks");
console.log("------------------------------------------");

assertChecks(
  [
    {
      label:
        "Objective is preserved",

      passed:
        recommendation.objective.headline ===
        "Increase Execution Capacity.",
    },

    {
      label:
        "Strategy is preserved",

      passed:
        recommendation.strategy
          .strategies
          .some(
            (item) =>
              item.theme ===
              "reduce_competing_work",
          ),
    },

    {
      label:
        "Intervention is preserved",

      passed:
        recommendation.intervention
          .headline ===
        "Reduce active work in progress.",
    },

    {
      label:
        "Assessment ancestry is preserved",

      passed:
        recommendation.supportingAssessmentId ===
        "executiveAssessment-1",
    },

    {
      label:
        "Condition ancestry is preserved",

      passed:
        recommendation.supportingConditionIds
          .includes(
            "condition-executioncapacity",
          ),
    },

    {
      label:
        "Recommendation remains distinct from optimization",

      passed:
        recommendation.boundaries
          .doesNotOptimize ===
        true,
    },

    {
      label:
        "Recommendation remains distinct from simulation",

      passed:
        recommendation.boundaries
          .doesNotSimulate ===
        true,
    },

    {
      label:
        "Recommendation avoids implementation planning",

      passed:
        recommendation.boundaries
          .doesNotProduceImplementationPlan ===
        true,
    },

    {
      label:
        "Confidence is bounded",

      passed:
        recommendation.confidence >=
          0 &&
        recommendation.confidence <=
          1,
    },

    {
      label:
        "Uncertainty is explicit",

      passed:
        recommendation
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
