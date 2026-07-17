import {
  buildExecutiveOptimizationProblem,
} from "../../v3/model/optimization/buildExecutiveOptimizationProblem";

import {
  generateExecutiveOptimizationOptions,
} from "../../v3/model/optimization/generateExecutiveOptimizationOptions";

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
      `Executive Optimization Options benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
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
    "Executive Optimization Options benchmark requires runtime.memory.executiveRecommendation.",
  );
}

const optimizationProblem =
  buildExecutiveOptimizationProblem({
    organizationId:
      runtime.metadata.organizationId,

    recommendation,

    now:
      "2026-07-17T21:30:00.000Z",
  });

const optionSet =
  generateExecutiveOptimizationOptions({
    optimizationProblem,

    now:
      "2026-07-17T21:35:00.000Z",
  });

console.log("");
console.log("==========================================");
console.log("EXECUTIVE OPTIMIZATION OPTIONS 001");
console.log("==========================================");
console.log("");

console.log(
  `Organization: ${northstarCompanyFixture.organization.name}`,
);

console.log(
  `Objective: ${optimizationProblem.objective.statement}`,
);

console.log("");

for (
  const option of
  optionSet.options
) {
  console.log(
    option.title,
  );

  console.log(
    `  ${option.summary}`,
  );

  console.log(
    `  Expected value: ${option.expectedValue.toFixed(2)}`,
  );

  console.log(
    `  Risk: ${option.implementationRisk.toFixed(2)}`,
  );

  console.log(
    `  Speed: ${option.speedToImpact.toFixed(2)}`,
  );

  console.log(
    `  Reversibility: ${option.reversibility.toFixed(2)}`,
  );

  console.log("");
}

console.log("Checks");
console.log("------------------------------------------");

const profiles =
  new Set(
    optionSet.options.map(
      (option) =>
        option.profile,
    ),
  );

const summaries =
  new Set(
    optionSet.options.map(
      (option) =>
        option.summary,
    ),
  );

assertChecks(
  [
    {
      label:
        "Option set consumes the canonical Optimization Problem",

      passed:
        optionSet
          .optimizationProblem
          .id ===
        optimizationProblem.id,
    },

    {
      label:
        "Exactly three bounded options are generated",

      passed:
        optionSet.options.length ===
        3,
    },

    {
      label:
        "Options are materially different",

      passed:
        profiles.size ===
          3 &&
        summaries.size ===
          3,
    },

    {
      label:
        "Focus Reset option is generated",

      passed:
        optionSet.options
          .some(
            (option) =>
              option.profile ===
              "focus_reset",
          ),
    },

    {
      label:
        "Sequenced Governance option is generated",

      passed:
        optionSet.options
          .some(
            (option) =>
              option.profile ===
              "sequenced_governance",
          ),
    },

    {
      label:
        "Controlled Pilot option is generated",

      passed:
        optionSet.options
          .some(
            (option) =>
              option.profile ===
              "controlled_pilot",
          ),
    },

    {
      label:
        "Every option preserves recommendation ancestry",

      passed:
        optionSet.options
          .every(
            (option) =>
              option.recommendationId ===
              recommendation.id,
          ),
    },

    {
      label:
        "Every option preserves optimization-problem ancestry",

      passed:
        optionSet.options
          .every(
            (option) =>
              option.optimizationProblemId ===
              optimizationProblem.id,
          ),
    },

    {
      label:
        "Every option adjusts all canonical variables",

      passed:
        optionSet.options
          .every(
            (option) =>
              new Set(
                option.variableAdjustments.map(
                  (adjustment) =>
                    adjustment.variableType,
                ),
              ).size ===
              optimizationProblem.variables.length,
          ),
    },

    {
      label:
        "Focus Reset prioritizes speed over reversibility",

      passed:
        optionSet.options
          .some(
            (option) =>
              option.profile ===
                "focus_reset" &&
              option.speedToImpact >
                option.reversibility,
          ),
    },

    {
      label:
        "Controlled Pilot prioritizes reversibility over speed",

      passed:
        optionSet.options
          .some(
            (option) =>
              option.profile ===
                "controlled_pilot" &&
              option.reversibility >
                option.speedToImpact,
          ),
    },

    {
      label:
        "Sequenced Governance balances risk and expected value",

      passed:
        optionSet.options
          .some(
            (option) =>
              option.profile ===
                "sequenced_governance" &&
              option.expectedValue >=
                0.8 &&
              option.implementationRisk <=
                0.5,
          ),
    },

    {
      label:
        "All option metrics are bounded",

      passed:
        optionSet.options
          .every(
            (option) =>
              [
                option.expectedValue,
                option.implementationRisk,
                option.speedToImpact,
                option.reversibility,
                option.confidence,
              ].every(
                (value) =>
                  value >=
                    0 &&
                  value <=
                    1,
              ),
          ),
    },

    {
      label:
        "All options preserve the objective",

      passed:
        optionSet.options
          .every(
            (option) =>
              option.boundaries
                .preservesObjective ===
              true,
          ),
    },

    {
      label:
        "All options preserve the recommendation",

      passed:
        optionSet.options
          .every(
            (option) =>
              option.boundaries
                .preservesRecommendation ===
              true,
          ),
    },

    {
      label:
        "Option generation remains distinct from Simulation",

      passed:
        optionSet.options
          .every(
            (option) =>
              option.boundaries
                .doesNotSimulate ===
              true,
          ),
    },

    {
      label:
        "Option generation does not select the executive decision",

      passed:
        optionSet.options
          .every(
            (option) =>
              option.boundaries
                .doesNotSelectFinalDecision ===
              true,
          ),
    },

    {
      label:
        "Uncertainty is preserved across all options",

      passed:
        optionSet.options
          .every(
            (option) =>
              option.uncertaintySummary ===
              optimizationProblem
                .uncertaintySummary,
          ),
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
