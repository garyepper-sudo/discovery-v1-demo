import {
  buildExecutiveOptimizationProblem,
} from "../../v3/model/optimization/buildExecutiveOptimizationProblem";

import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime/organizationStateStore";

import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "../high-volume/northstar/northstarCompanyFixture";

import type {
  ExecutiveRecommendation,
} from "../../v3/model/recommendation/executiveRecommendationTypes";

type OptimizationRuntimeMemory = {
  executiveRecommendation?:
    ExecutiveRecommendation;
};

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
      `Executive Optimization Problem benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
    );
  }
}

const runtime =
  loadOrganizationRuntimeState(
    NORTHSTAR_ORGANIZATION_ID,
  );

const memory =
  runtime.memory as
    typeof runtime.memory &
    OptimizationRuntimeMemory;

const recommendation =
  memory.executiveRecommendation;

if (
  !recommendation
) {
  throw new Error(
    "Executive Optimization Problem benchmark requires runtime.memory.executiveRecommendation.",
  );
}

const optimizationProblem =
  buildExecutiveOptimizationProblem({
    organizationId:
      runtime.metadata.organizationId,

    recommendation,

    now:
      "2026-07-17T21:00:00.000Z",
  });

console.log("");
console.log("==========================================");
console.log("EXECUTIVE OPTIMIZATION PROBLEM 001");
console.log("==========================================");
console.log("");

console.log(
  `Organization: ${northstarCompanyFixture.organization.name}`,
);

console.log(
  `Recommendation: ${recommendation.headline}`,
);

console.log("");
console.log("Objective");
console.log("------------------------------------------");
console.log(
  optimizationProblem.objective.statement,
);

console.log("");
console.log("Variables");
console.log("------------------------------------------");

for (
  const variable of
  optimizationProblem.variables
) {
  console.log(
    `${variable.type}: ${variable.direction}`,
  );
}

console.log("");
console.log("Constraints");
console.log("------------------------------------------");

for (
  const constraint of
  optimizationProblem.constraints
) {
  console.log(
    `${constraint.required ? "REQUIRED" : "OPTIONAL"}  ${constraint.label}`,
  );
}

console.log("");
console.log("Preferences");
console.log("------------------------------------------");

for (
  const preference of
  optimizationProblem.preferences
) {
  console.log(
    `${preference.label}: ${preference.weight.toFixed(2)}`,
  );
}

console.log("");
console.log("Checks");
console.log("------------------------------------------");

assertChecks(
  [
    {
      label:
        "Optimization consumes the persisted Executive Recommendation",

      passed:
        optimizationProblem
          .recommendationId ===
        recommendation.id,
    },

    {
      label:
        "North Star maximizes expected organizational value",

      passed:
        optimizationProblem
          .objective
          .northStar ===
        "maximize_expected_organizational_value",
    },

    {
      label:
        "Target condition is preserved",

      passed:
        optimizationProblem
          .objective
          .targetConditionId ===
        recommendation
          .objective
          .targetConditionId,
    },

    {
      label:
        "Time is always a required constraint",

      passed:
        optimizationProblem
          .constraints
          .some(
            (constraint) =>
              constraint.type ===
                "time" &&
              constraint.required,
          ),
    },

    {
      label:
        "Capacity is a required constraint",

      passed:
        optimizationProblem
          .constraints
          .some(
            (constraint) =>
              constraint.type ===
                "capacity" &&
              constraint.required,
          ),
    },

    {
      label:
        "Risk is a required constraint",

      passed:
        optimizationProblem
          .constraints
          .some(
            (constraint) =>
              constraint.type ===
                "risk" &&
              constraint.required,
          ),
    },

    {
      label:
        "Decision authority is modeled as a constraint",

      passed:
        optimizationProblem
          .constraints
          .some(
            (constraint) =>
              constraint.type ===
              "decision-authority",
          ),
    },

    {
      label:
        "Scope is an optimization variable",

      passed:
        optimizationProblem
          .variables
          .some(
            (variable) =>
              variable.type ===
              "scope",
          ),
    },

    {
      label:
        "Sequence is an optimization variable",

      passed:
        optimizationProblem
          .variables
          .some(
            (variable) =>
              variable.type ===
              "sequence",
          ),
    },

    {
      label:
        "Resource allocation is an optimization variable",

      passed:
        optimizationProblem
          .variables
          .some(
            (variable) =>
              variable.type ===
              "resource-allocation",
          ),
    },

    {
      label:
        "Optimization preserves Recommendation as the source object",

      passed:
        optimizationProblem
          .recommendation
          .id ===
        recommendation.id,
    },

    {
      label:
        "Optimization does not replace Recommendation",

      passed:
        optimizationProblem
          .boundaries
          .doesNotReplaceRecommendation ===
        true,
    },

    {
      label:
        "Optimization remains distinct from Simulation",

      passed:
        optimizationProblem
          .boundaries
          .doesNotSimulate ===
        true,
    },

    {
      label:
        "Optimization does not select the executive decision",

      passed:
        optimizationProblem
          .boundaries
          .doesNotSelectFinalDecision ===
        true,
    },

    {
      label:
        "Confidence is bounded",

      passed:
        optimizationProblem.confidence >=
          0 &&
        optimizationProblem.confidence <=
          1,
    },

    {
      label:
        "Uncertainty is preserved",

      passed:
        optimizationProblem
          .uncertaintySummary ===
        recommendation
          .uncertaintySummary,
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
