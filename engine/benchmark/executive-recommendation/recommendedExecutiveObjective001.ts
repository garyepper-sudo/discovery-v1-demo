import {
  buildRecommendedExecutiveObjective,
} from "../../v3/model/recommendation/buildRecommendedExecutiveObjective";

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
      `Recommended Executive Objective benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
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

      whyItMatters:
        "Execution capacity determines whether strategic intent can become completed work.",

      uncertaintySummary:
        "Longitudinal evidence is still limited.",

      upstreamConditionIds:
        [
          "condition-decisionflow",
          "condition-coordination",
        ],

      downstreamConditionIds:
        [
          "condition-learning",
        ],
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

      primaryConditionId:
        "condition-executioncapacity",

      headline:
        "Execution Capacity is the organization's primary constraint.",

      executiveJudgment:
        "Execution Capacity currently carries the highest combined organizational risk.",

      rationale:
        "The judgment is supported by operating constraints and related conditions.",

      supportingConditionIds:
        [
          "condition-decisionflow",
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

const objective =
  buildRecommendedExecutiveObjective({
    executiveAssessment:
      assessment,

    organizationalState,

    organizationalConditions:
      conditions,

    now:
      "2026-07-17T18:00:00.000Z",
  });

console.log("");
console.log("==========================================");
console.log("RECOMMENDED EXECUTIVE OBJECTIVE 001");
console.log("==========================================");
console.log("");

console.log(
  objective.headline,
);

console.log("");
console.log(
  objective.executiveObjective,
);

console.log("");
console.log(
  `Objective type: ${objective.objectiveType}`,
);

console.log(
  `Target: ${objective.targetConditionName}`,
);

console.log(
  `Confidence: ${objective.confidence.toFixed(3)}`,
);

console.log(
  `Uncertainty: ${objective.uncertaintySummary}`,
);

console.log("");
console.log("Checks");
console.log("------------------------------------------");

assertChecks(
  [
    {
      label:
        "Primary objective is identified",

      passed:
        objective.headline ===
        "Increase Execution Capacity.",
    },

    {
      label:
        "Objective targets the primary condition",

      passed:
        objective.targetConditionId ===
        "condition-executioncapacity",
    },

    {
      label:
        "Objective remains outcome-oriented",

      passed:
        objective.executiveObjective.includes(
          "convert strategic intent into reliable execution",
        ),
    },

    {
      label:
        "Objective does not prescribe strategy",

      passed:
        objective.boundaries
          .doesNotRecommendStrategy ===
        true,
    },

    {
      label:
        "Objective does not prescribe intervention",

      passed:
        objective.boundaries
          .doesNotRecommendIntervention ===
        true,
    },

    {
      label:
        "Objective does not optimize",

      passed:
        objective.boundaries
          .doesNotOptimize ===
        true,
    },

    {
      label:
        "Objective does not simulate",

      passed:
        objective.boundaries
          .doesNotSimulate ===
        true,
    },

    {
      label:
        "Confidence is bounded",

      passed:
        objective.confidence >=
          0 &&
        objective.confidence <=
          1,
    },

    {
      label:
        "Uncertainty is explicit",

      passed:
        objective
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
