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
  rankExecutiveOptimizationOptions,
} from "../../v3/model/optimization/rankExecutiveOptimizationOptions";

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
      `Executive Option Ranking benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
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
    "Executive Option Ranking benchmark requires runtime.memory.executiveRecommendation.",
  );
}

const optimizationProblem =
  buildExecutiveOptimizationProblem({
    organizationId:
      runtime.metadata.organizationId,

    recommendation,

    now:
      "2026-07-17T23:00:00.000Z",
  });

const optionSet =
  generateExecutiveOptimizationOptions({
    optimizationProblem,

    now:
      "2026-07-17T23:05:00.000Z",
  });

const constraintEvaluationSet =
  evaluateExecutiveOptimizationConstraints({
    optionSet,

    now:
      "2026-07-17T23:10:00.000Z",
  });

const scoreSet =
  scoreExecutiveOptimizationOptions({
    constraintEvaluationSet,

    now:
      "2026-07-17T23:15:00.000Z",
  });

const ranking =
  rankExecutiveOptimizationOptions({
    scoreSet,

    now:
      "2026-07-17T23:20:00.000Z",
  });

console.log("");
console.log("==========================================");
console.log("EXECUTIVE OPTION RANKING 001");
console.log("==========================================");
console.log("");

console.log(
  `Organization: ${northstarCompanyFixture.organization.name}`,
);

console.log("");

for (
  const rankedOption of
  ranking.rankedOptions
) {
  const option =
    rankedOption
      .score
      .optionConstraintResult
      .option;

  console.log(
    `${rankedOption.rank}. ${option.title}`,
  );

  console.log(
    `  Feasible: ${rankedOption.feasible ? "yes" : "no"}`,
  );

  console.log(
    `  Final score: ${rankedOption.score.finalScore.toFixed(3)}`,
  );

  console.log(
    `  ${rankedOption.reason}`,
  );

  console.log("");
}

console.log(
  `Preferred option: ${ranking.preferredOption?.score.optionConstraintResult.option.title ?? "none"}`,
);

console.log(
  `Rationale: ${ranking.rationale}`,
);

console.log("");
console.log("Checks");
console.log("------------------------------------------");

const first =
  ranking.rankedOptions[0];

const second =
  ranking.rankedOptions[1];

const last =
  ranking.rankedOptions[
    ranking.rankedOptions.length -
    1
  ];

assertChecks(
  [
    {
      label:
        "Ranking consumes the canonical Score Set",

      passed:
        ranking.scoreSet.id ===
        scoreSet.id,
    },

    {
      label:
        "Every scored option receives exactly one rank",

      passed:
        ranking.rankedOptions.length ===
        scoreSet.scores.length,
    },

    {
      label:
        "Ranks are sequential and unique",

      passed:
        ranking.rankedOptions
          .every(
            (
              rankedOption,
              index,
            ) =>
              rankedOption.rank ===
              index + 1,
          ),
    },

    {
      label:
        "Feasible options rank above infeasible options",

      passed:
        Boolean(
          first &&
          second &&
          last &&
          first.feasible &&
          second.feasible &&
          !last.feasible,
        ),
    },

    {
      label:
        "Controlled Pilot ranks first under current preferences",

      passed:
        first
          ?.score
          .optionConstraintResult
          .option
          .profile ===
        "controlled_pilot",
    },

    {
      label:
        "Sequenced Governance ranks second",

      passed:
        second
          ?.score
          .optionConstraintResult
          .option
          .profile ===
        "sequenced_governance",
    },

    {
      label:
        "Focus Reset ranks last because it is infeasible",

      passed:
        last
          ?.score
          .optionConstraintResult
          .option
          .profile ===
          "focus_reset" &&
        last.feasible ===
          false,
    },

    {
      label:
        "Preferred option is the highest-ranked feasible option",

      passed:
        ranking.preferredOption
          ?.rank ===
          1 &&
        ranking.preferredOption
          .feasible ===
          true,
    },

    {
      label:
        "Every ranked option explains its position",

      passed:
        ranking.rankedOptions
          .every(
            (rankedOption) =>
              rankedOption.reason
                .trim()
                .length >
              0,
          ),
    },

    {
      label:
        "Pairwise outranking ancestry is explicit",

      passed:
        ranking.rankedOptions
          .every(
            (
              rankedOption,
              index,
            ) =>
              rankedOption
                .outranksOptionIds
                .length ===
              ranking.rankedOptions
                .length -
              index -
              1,
          ),
    },

    {
      label:
        "Ranking rationale is explicit",

      passed:
        ranking.rationale
          .trim()
          .length >
        0,
    },

    {
      label:
        "Ranking does not record an executive decision",

      passed:
        ranking.boundaries
          .doesNotRecordExecutiveDecision ===
        true,
    },

    {
      label:
        "Ranking remains distinct from Simulation",

      passed:
        ranking.boundaries
          .doesNotSimulate ===
        true,
    },

    {
      label:
        "Ranking does not execute the intervention",

      passed:
        ranking.boundaries
          .doesNotExecuteIntervention ===
        true,
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
