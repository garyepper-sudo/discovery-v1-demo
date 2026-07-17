import {
  buildExecutiveOptimizationProblem,
} from "../../v3/model/optimization/buildExecutiveOptimizationProblem";

import {
  buildOptimizedExecutiveRecommendation,
} from "../../v3/model/optimization/buildOptimizedExecutiveRecommendation";

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
      `Optimized Executive Recommendation benchmark failed: ${failed.map((check) => check.label).join(", ")}`,
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
    "Optimized Executive Recommendation benchmark requires runtime.memory.executiveRecommendation.",
  );
}

const optimizationProblem =
  buildExecutiveOptimizationProblem({
    organizationId:
      runtime.metadata.organizationId,

    recommendation,

    now:
      "2026-07-17T23:30:00.000Z",
  });

const optionSet =
  generateExecutiveOptimizationOptions({
    optimizationProblem,

    now:
      "2026-07-17T23:35:00.000Z",
  });

const constraintEvaluationSet =
  evaluateExecutiveOptimizationConstraints({
    optionSet,

    now:
      "2026-07-17T23:40:00.000Z",
  });

const scoreSet =
  scoreExecutiveOptimizationOptions({
    constraintEvaluationSet,

    now:
      "2026-07-17T23:45:00.000Z",
  });

const ranking =
  rankExecutiveOptimizationOptions({
    scoreSet,

    now:
      "2026-07-17T23:50:00.000Z",
  });

const optimizedRecommendation =
  buildOptimizedExecutiveRecommendation({
    organizationId:
      runtime.metadata.organizationId,

    ranking,

    now:
      "2026-07-17T23:55:00.000Z",
  });

console.log("");
console.log("==========================================");
console.log("OPTIMIZED EXECUTIVE RECOMMENDATION 001");
console.log("==========================================");
console.log("");

console.log(
  `Organization: ${northstarCompanyFixture.organization.name}`,
);

console.log(
  `Original recommendation: ${recommendation.headline}`,
);

console.log(
  `Preferred profile: ${optimizedRecommendation.preferredProfile}`,
);

console.log("");
console.log(
  optimizedRecommendation.headline,
);

console.log("");
console.log(
  optimizedRecommendation.executiveRecommendation,
);

console.log("");
console.log("Optimized plan");
console.log("------------------------------------------");

console.log(
  `Scope: ${optimizedRecommendation.optimizedPlan.scope}`,
);

console.log(
  `Sequence: ${optimizedRecommendation.optimizedPlan.sequence}`,
);

console.log(
  `Timing: ${optimizedRecommendation.optimizedPlan.timing}`,
);

console.log(
  `Resource allocation: ${optimizedRecommendation.optimizedPlan.resourceAllocation}`,
);

console.log(
  `Decision rights: ${optimizedRecommendation.optimizedPlan.decisionRights}`,
);

console.log(
  `Coordination load: ${optimizedRecommendation.optimizedPlan.coordinationLoad}`,
);

console.log(
  `Implementation intensity: ${optimizedRecommendation.optimizedPlan.implementationIntensity}`,
);

console.log("");
console.log(
  `Expected value: ${optimizedRecommendation.expectedValue.toFixed(3)}`,
);

console.log(
  `Feasibility score: ${optimizedRecommendation.feasibilityScore.toFixed(3)}`,
);

console.log(
  `Final score: ${optimizedRecommendation.finalScore.toFixed(3)}`,
);

console.log(
  `Confidence: ${optimizedRecommendation.confidence.toFixed(3)}`,
);

console.log("");
console.log("Tradeoffs");
console.log("------------------------------------------");

for (
  const tradeoff of
  optimizedRecommendation.expectedTradeoffs
) {
  console.log(
    `- ${tradeoff}`,
  );
}

console.log("");
console.log("Checks");
console.log("------------------------------------------");

assertChecks(
  [
    {
      label:
        "Optimized Recommendation consumes the canonical Ranking",

      passed:
        optimizedRecommendation
          .sourceRankingId ===
        ranking.id,
    },

    {
      label:
        "Original Recommendation ancestry is preserved",

      passed:
        optimizedRecommendation
          .sourceRecommendationId ===
        recommendation.id,
    },

    {
      label:
        "Preferred option is preserved",

      passed:
        optimizedRecommendation
          .preferredOptionId ===
        ranking
          .preferredOption
          ?.score
          .optionConstraintResult
          .option
          .id,
    },

    {
      label:
        "Controlled Pilot is the optimized Northstar profile",

      passed:
        optimizedRecommendation
          .preferredProfile ===
        "controlled_pilot",
    },

    {
      label:
        "Original executive objective is preserved",

      passed:
        optimizedRecommendation
          .objective
          .targetConditionId ===
        recommendation
          .objective
          .targetConditionId,
    },

    {
      label:
        "Scope is explicit",

      passed:
        optimizedRecommendation
          .optimizedPlan
          .scope
          .trim()
          .length >
        0,
    },

    {
      label:
        "Sequence is explicit",

      passed:
        optimizedRecommendation
          .optimizedPlan
          .sequence
          .trim()
          .length >
        0,
    },

    {
      label:
        "Timing is explicit",

      passed:
        optimizedRecommendation
          .optimizedPlan
          .timing
          .trim()
          .length >
        0,
    },

    {
      label:
        "Decision rights are explicit",

      passed:
        optimizedRecommendation
          .optimizedPlan
          .decisionRights
          .trim()
          .length >
        0,
    },

    {
      label:
        "Binding constraints are preserved",

      passed:
        optimizedRecommendation
          .bindingConstraintIds
          .length ===
        ranking
          .preferredOption
          ?.score
          .optionConstraintResult
          .bindingConstraintIds
          .length,
    },

    {
      label:
        "Preferred optimized option has no violated constraints",

      passed:
        optimizedRecommendation
          .violatedConstraintIds
          .length ===
        0,
    },

    {
      label:
        "Tradeoffs are explicit",

      passed:
        optimizedRecommendation
          .expectedTradeoffs
          .length >
        0,
    },

    {
      label:
        "Scores remain bounded",

      passed:
        [
          optimizedRecommendation.expectedValue,
          optimizedRecommendation.feasibilityScore,
          optimizedRecommendation.finalScore,
          optimizedRecommendation.confidence,
        ].every(
          (value) =>
            value >=
              0 &&
            value <=
              1,
        ),
    },

    {
      label:
        "Uncertainty is preserved",

      passed:
        optimizedRecommendation
          .uncertaintySummary ===
        recommendation
          .uncertaintySummary,
    },

    {
      label:
        "Optimized Recommendation preserves the original Recommendation",

      passed:
        optimizedRecommendation
          .boundaries
          .preservesOriginalRecommendation ===
        true,
    },

    {
      label:
        "Optimized Recommendation does not record the executive decision",

      passed:
        optimizedRecommendation
          .boundaries
          .doesNotRecordExecutiveDecision ===
        true,
    },

    {
      label:
        "Optimized Recommendation remains distinct from Simulation",

      passed:
        optimizedRecommendation
          .boundaries
          .doesNotSimulate ===
        true,
    },

    {
      label:
        "Optimized Recommendation does not execute the intervention",

      passed:
        optimizedRecommendation
          .boundaries
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
