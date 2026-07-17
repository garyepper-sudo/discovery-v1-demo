import {
  buildExecutiveOptimizationProblem,
} from "../../v3/model/optimization/buildExecutiveOptimizationProblem";

import {
  evaluateExecutiveOptimizationConstraints,
} from "../../v3/model/optimization/evaluateExecutiveOptimizationConstraints";

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
      `Executive Constraint Evaluation benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
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
    "Executive Constraint Evaluation benchmark requires runtime.memory.executiveRecommendation.",
  );
}

const optimizationProblem =
  buildExecutiveOptimizationProblem({
    organizationId:
      runtime.metadata.organizationId,

    recommendation,

    now:
      "2026-07-17T22:00:00.000Z",
  });

const optionSet =
  generateExecutiveOptimizationOptions({
    optimizationProblem,

    now:
      "2026-07-17T22:05:00.000Z",
  });

const evaluationSet =
  evaluateExecutiveOptimizationConstraints({
    optionSet,

    now:
      "2026-07-17T22:10:00.000Z",
  });

console.log("");
console.log("==========================================");
console.log("EXECUTIVE CONSTRAINT EVALUATION 001");
console.log("==========================================");
console.log("");

console.log(
  `Organization: ${northstarCompanyFixture.organization.name}`,
);

console.log("");

for (
  const result of
  evaluationSet.results
) {
  console.log(
    result.option.title,
  );

  console.log(
    `  Feasible: ${result.feasible ? "yes" : "no"}`,
  );

  console.log(
    `  Feasibility score: ${result.feasibilityScore.toFixed(3)}`,
  );

  for (
    const evaluation of
    result.evaluations
  ) {
    console.log(
      `  ${evaluation.constraintType}: ${evaluation.status} (${evaluation.score.toFixed(2)})`,
    );
  }

  console.log(
    `  ${result.summary}`,
  );

  console.log("");
}

console.log("Checks");
console.log("------------------------------------------");

const focusReset =
  evaluationSet.results.find(
    (result) =>
      result.option.profile ===
      "focus_reset",
  );

const sequencedGovernance =
  evaluationSet.results.find(
    (result) =>
      result.option.profile ===
      "sequenced_governance",
  );

const controlledPilot =
  evaluationSet.results.find(
    (result) =>
      result.option.profile ===
      "controlled_pilot",
  );

assertChecks(
  [
    {
      label:
        "Evaluation consumes the canonical Option Set",

      passed:
        evaluationSet.optionSet.id ===
        optionSet.id,
    },

    {
      label:
        "Every option receives one evaluation per constraint",

      passed:
        evaluationSet.results
          .every(
            (result) =>
              result.evaluations.length ===
              optimizationProblem
                .constraints
                .length,
          ),
    },

    {
      label:
        "Every constraint evaluation has a bounded score",

      passed:
        evaluationSet.results
          .flatMap(
            (result) =>
              result.evaluations,
          )
          .every(
            (evaluation) =>
              evaluation.score >=
                0 &&
              evaluation.score <=
                1 &&
              evaluation.severity >=
                0 &&
              evaluation.severity <=
                1,
          ),
    },

    {
      label:
        "Focus Reset has binding or violated risk",

      passed:
        Boolean(
          focusReset?.evaluations.some(
            (evaluation) =>
              evaluation.constraintType ===
                "risk" &&
              evaluation.status !==
                "satisfied",
          ),
        ),
    },

    {
      label:
        "Sequenced Governance is feasible",

      passed:
        sequencedGovernance
          ?.feasible ===
        true,
    },

    {
      label:
        "Controlled Pilot is feasible",

      passed:
        controlledPilot
          ?.feasible ===
        true,
    },

    {
      label:
        "Controlled Pilot has the strongest reversibility-compatible feasibility",

      passed:
        Boolean(
          controlledPilot &&
          focusReset &&
          controlledPilot
            .feasibilityScore >
            focusReset
              .feasibilityScore,
        ),
    },

    {
      label:
        "Decision authority is evaluated for every option",

      passed:
        evaluationSet.results
          .every(
            (result) =>
              result.evaluations
                .some(
                  (evaluation) =>
                    evaluation
                      .constraintType ===
                    "decision-authority",
                ),
          ),
    },

    {
      label:
        "Implementation complexity is evaluated for every option",

      passed:
        evaluationSet.results
          .every(
            (result) =>
              result.evaluations
                .some(
                  (evaluation) =>
                    evaluation
                      .constraintType ===
                    "implementation-complexity",
                ),
          ),
    },

    {
      label:
        "Binding constraints are explicitly surfaced",

      passed:
        evaluationSet.results
          .some(
            (result) =>
              result.bindingConstraintIds
                .length >
              0,
          ),
    },

    {
      label:
        "Feasibility summaries are explicit",

      passed:
        evaluationSet.results
          .every(
            (result) =>
              result.summary
                .trim()
                .length >
              0,
          ),
    },

    {
      label:
        "Constraint evaluation does not rank options",

      passed:
        !(
          "rank" in
          evaluationSet
        ),
    },

    {
      label:
        "Constraint evaluation does not simulate outcomes",

      passed:
        evaluationSet.results
          .every(
            (result) =>
              result.option
                .boundaries
                .doesNotSimulate ===
              true,
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
