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
  scoreExecutiveOptimizationOptions,
} from "../../v3/model/optimization/scoreExecutiveOptimizationOptions";

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
      `Executive Option Scoring benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
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
    "Executive Option Scoring benchmark requires runtime.memory.executiveRecommendation.",
  );
}

const optimizationProblem =
  buildExecutiveOptimizationProblem({
    organizationId:
      runtime.metadata.organizationId,

    recommendation,

    now:
      "2026-07-17T22:30:00.000Z",
  });

const optionSet =
  generateExecutiveOptimizationOptions({
    optimizationProblem,

    now:
      "2026-07-17T22:35:00.000Z",
  });

const constraintEvaluationSet =
  evaluateExecutiveOptimizationConstraints({
    optionSet,

    now:
      "2026-07-17T22:40:00.000Z",
  });

const scoreSet =
  scoreExecutiveOptimizationOptions({
    constraintEvaluationSet,

    now:
      "2026-07-17T22:45:00.000Z",
  });

console.log("");
console.log("==========================================");
console.log("EXECUTIVE OPTION SCORING 001");
console.log("==========================================");
console.log("");

console.log(
  `Organization: ${northstarCompanyFixture.organization.name}`,
);

console.log("");

for (
  const score of
  scoreSet.scores
) {
  console.log(
    score
      .optionConstraintResult
      .option
      .title,
  );

  console.log(
    `  Feasible: ${score.feasible ? "yes" : "no"}`,
  );

  console.log(
    `  Base score: ${score.baseScore.toFixed(3)}`,
  );

  console.log(
    `  Confidence adjustment: ${score.confidenceAdjustment.toFixed(3)}`,
  );

  console.log(
    `  Uncertainty penalty: ${score.uncertaintyPenalty.toFixed(3)}`,
  );

  console.log(
    `  Infeasibility penalty: ${score.infeasibilityPenalty.toFixed(3)}`,
  );

  console.log(
    `  Final score: ${score.finalScore.toFixed(3)}`,
  );

  for (
    const component of
    score.components
  ) {
    console.log(
      `  ${component.label}: ${component.rawValue.toFixed(2)} × ${component.weight.toFixed(2)} = ${component.weightedValue.toFixed(3)}`,
    );
  }

  console.log("");
}

console.log("Checks");
console.log("------------------------------------------");

const focusReset =
  scoreSet.scores.find(
    (score) =>
      score.optionConstraintResult
        .option
        .profile ===
      "focus_reset",
  );

const sequencedGovernance =
  scoreSet.scores.find(
    (score) =>
      score.optionConstraintResult
        .option
        .profile ===
      "sequenced_governance",
  );

const controlledPilot =
  scoreSet.scores.find(
    (score) =>
      score.optionConstraintResult
        .option
        .profile ===
      "controlled_pilot",
  );

assertChecks(
  [
    {
      label:
        "Scoring consumes canonical Constraint Evaluation",

      passed:
        scoreSet
          .constraintEvaluationSet
          .id ===
        constraintEvaluationSet.id,
    },

    {
      label:
        "Every option receives a score",

      passed:
        scoreSet.scores.length ===
        optionSet.options.length,
    },

    {
      label:
        "Every score contains all transparent components",

      passed:
        scoreSet.scores
          .every(
            (score) =>
              score.components.length ===
              5,
          ),
    },

    {
      label:
        "All component values and weights are bounded",

      passed:
        scoreSet.scores
          .flatMap(
            (score) =>
              score.components,
          )
          .every(
            (component) =>
              component.rawValue >=
                0 &&
              component.rawValue <=
                1 &&
              component.weight >=
                0 &&
              component.weight <=
                1 &&
              component.weightedValue >=
                0 &&
              component.weightedValue <=
                1,
          ),
    },

    {
      label:
        "All option scores are bounded",

      passed:
        scoreSet.scores
          .every(
            (score) =>
              score.baseScore >=
                0 &&
              score.baseScore <=
                1 &&
              score.finalScore >=
                0 &&
              score.finalScore <=
                1,
          ),
    },

    {
      label:
        "Infeasible options receive an explicit penalty",

      passed:
        Boolean(
          focusReset &&
          !focusReset.feasible &&
          focusReset.infeasibilityPenalty >
          0,
        ),
    },

    {
      label:
        "Feasible options do not receive infeasibility penalties",

      passed:
        Boolean(
          sequencedGovernance &&
          controlledPilot &&
          sequencedGovernance
            .infeasibilityPenalty ===
            0 &&
          controlledPilot
            .infeasibilityPenalty ===
            0,
        ),
    },

    {
      label:
        "Confidence adjustment is explicit",

      passed:
        scoreSet.scores
          .every(
            (score) =>
              score.confidenceAdjustment ===
              score
                .optionConstraintResult
                .option
                .confidence,
          ),
    },

    {
      label:
        "Uncertainty penalty is explicit",

      passed:
        scoreSet.scores
          .every(
            (score) =>
              score.uncertaintyPenalty >=
              0,
          ),
    },

    {
      label:
        "Feasible options outscore the infeasible Focus Reset",

      passed:
        Boolean(
          focusReset &&
          sequencedGovernance &&
          controlledPilot &&
          sequencedGovernance.finalScore >
            focusReset.finalScore &&
          controlledPilot.finalScore >
            focusReset.finalScore,
        ),
    },

    {
      label:
        "Scoring preserves option ancestry",

      passed:
        scoreSet.scores
          .every(
            (score) =>
              score
                .optionConstraintResult
                .option
                .optimizationProblemId ===
              optimizationProblem.id,
          ),
    },

    {
      label:
        "Scoring does not rank options",

      passed:
        !(
          "ranking" in
          scoreSet
        ),
    },

    {
      label:
        "Scoring does not select a final decision",

      passed:
        scoreSet.scores
          .every(
            (score) =>
              score
                .optionConstraintResult
                .option
                .boundaries
                .doesNotSelectFinalDecision ===
              true,
          ),
    },

    {
      label:
        "Scoring does not simulate outcomes",

      passed:
        scoreSet.scores
          .every(
            (score) =>
              score
                .optionConstraintResult
                .option
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
