import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  runExecutiveDecisionCycle,
} from "../../v3/decisions/runExecutiveDecisionCycle";

import {
  buildPrimaryExecutiveConstraint,
} from "../../v3/model/judgment/buildPrimaryExecutiveConstraint";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import type {
  OrganizationalCondition,
} from "../../v3/model/state/inferOrganizationalConditions";

import type {
  OrganizationalUncertainty,
} from "../../v3/model/epistemic/organizationalUncertainty";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const NOW =
  "2026-07-13T12:00:00.000Z";

const MINIMUM_STRATEGY_COUNT = 3;

type Check = {
  name: string;

  passed: boolean;

  detail: string;
};

type BenchmarkRuntimeMemory = {
  organizationalConditions?:
    OrganizationalCondition[];

  organizationalUncertainty?:
    OrganizationalUncertainty;

  primaryExecutiveConstraint?:
    ReturnType<
      typeof buildPrimaryExecutiveConstraint
    >;
};

function requireConditions(
  runtimeMemory:
    BenchmarkRuntimeMemory,
): OrganizationalCondition[] {
  const conditions =
    runtimeMemory
      .organizationalConditions;

  if (
    !Array.isArray(conditions) ||
    conditions.length === 0
  ) {
    throw new Error(
      "Decision Cycle Experiment 001 requires persisted organizational conditions.",
    );
  }

  return conditions;
}

function chooseTargetConditionIds(
  conditions:
    OrganizationalCondition[],

  primaryConditionId:
    string,
): string[] {
  const additionalConditionIds =
    conditions
      .filter(
        (condition) =>
          condition.id !==
          primaryConditionId,
      )
      .sort((left, right) => {
        if (
          right.priority !==
          left.priority
        ) {
          const priorityScore = {
            critical: 4,
            high: 3,
            medium: 2,
            low: 1,
          };

          return (
            priorityScore[
              right.priority
            ] -
            priorityScore[
              left.priority
            ]
          );
        }

        if (
          right.confidence !==
          left.confidence
        ) {
          return (
            right.confidence -
            left.confidence
          );
        }

        return left.id.localeCompare(
          right.id,
        );
      })
      .slice(
        0,
        MINIMUM_STRATEGY_COUNT - 1,
      )
      .map(
        (condition) =>
          condition.id,
      );

  return [
    primaryConditionId,
    ...additionalConditionIds,
  ];
}

function serializeRanking(
  rankedScenarios:
    ReturnType<
      typeof runExecutiveDecisionCycle
    >["rankedScenarios"],
): string {
  return JSON.stringify(
    rankedScenarios.map(
      (scenario) => ({
        optionId:
          scenario.optionId,

        interventionId:
          scenario.interventionId,

        rank:
          scenario.rank,

        reasonsForRank:
          scenario.reasonsForRank,
      }),
    ),
  );
}

function recommendationAddressesConstraint(params: {
  recommendation:
    ReturnType<
      typeof runExecutiveDecisionCycle
    >["recommendation"];

  primaryConstraintId:
    string;

  primaryConstraintTitle:
    string;
}): boolean {
  const strategyTargetsConstraint =
    params.recommendation
      .recommendedStrategy
      ?.targetConditionIds
      .includes(
        params.primaryConstraintId,
      ) ?? false;

  const recommendationLanguage = [
    params.recommendation.summary,
    ...params.recommendation
      .whyRecommended,
    ...params.recommendation
      .expectedBenefits,
  ]
    .join(" ")
    .toLowerCase();

  const explainsIndirectAlignment =
    recommendationLanguage.includes(
      params.primaryConstraintTitle
        .toLowerCase(),
    ) ||
    recommendationLanguage.includes(
      params.primaryConstraintId
        .toLowerCase(),
    ) ||
    recommendationLanguage.includes(
      "primary executive constraint",
    );

  return (
    strategyTargetsConstraint ||
    explainsIndirectAlignment
  );
}

console.log("");
console.log(
  "==========================================",
);
console.log(
  "DISCOVERY EXECUTIVE DECISION CYCLE",
);
console.log("Experiment 001");
console.log(
  "Comparative Executive Judgment",
);
console.log(
  "==========================================",
);
console.log("");

const runtime =
  loadOrganizationRuntimeState(
    ORGANIZATION_ID,
  );

const runtimeMemory =
  runtime.memory as
    typeof runtime.memory &
    BenchmarkRuntimeMemory;

const organizationalConditions =
  requireConditions(
    runtimeMemory,
  );

const primaryExecutiveConstraint =
  buildPrimaryExecutiveConstraint({
    organizationalConditions,

    now:
      NOW,
  });

if (!primaryExecutiveConstraint) {
  throw new Error(
    "Decision Cycle Experiment 001 could not synthesize a primary executive constraint.",
  );
}

const targetConditionIds =
  chooseTargetConditionIds(
    organizationalConditions,
    primaryExecutiveConstraint
      .conditionId,
  );

const organizationalUncertainty:
  OrganizationalUncertainty = {
    organizationId:
      ORGANIZATION_ID,

    evidenceCompleteness:
      0.84,

    evidenceAgreement:
      0.82,

    contradictionDensity:
      0.08,

    contradictionConfidence:
      0.72,

    ambiguityScore:
      0.18,

    learningCertainty:
      0.76,

    predictionCertainty:
      0.74,

    investigationUrgency:
      0.24,

    unresolvedContradictionCount:
      1,

    unresolvedQuestionCount:
      1,

    competingExplanationCount:
      1,

    overallUncertainty:
      0.2,

    status:
      "moderate",

    drivers: [
      {
        type:
          "unresolved-question",

        description:
          "One executive assumption remains insufficiently validated.",

        weight:
          0.2,

        sourceObjectIds: [],
      },
    ],

    recommendedEvidenceAreas: [
      "Evidence confirming whether structural interventions can improve execution capacity without increasing risk.",
    ],

    confidenceLimiters: [
      "One executive assumption remains insufficiently validated.",
    ],

    summary:
      "Discovery has strong but incomplete evidence for the current organizational assessment.",

    assessedAt:
      NOW,
  };

const benchmarkRuntime = {
  ...runtime,

  memory: {
    ...runtime.memory,

    organizationalUncertainty,

    primaryExecutiveConstraint,
  },
};

const executiveDecision: ExecutiveDecision = {
  id:
    "executive-decision-demo",

  organizationId:
    ORGANIZATION_ID,

  type:
    "execution",

  title:
    "Improve Organizational Execution",

  objective:
    "Increase execution throughput by addressing the organization's highest-leverage constraint without increasing organizational risk.",

  rationale:
    "Leadership wants to improve execution quality using structural rather than staffing interventions.",

  status:
    "ready",

  timeHorizon:
    "near-term",

  targetConditionIds,

  successMetrics: [
    {
      name:
        "Primary Constraint Improvement",

      targetConditionId:
        primaryExecutiveConstraint
          .conditionId,

      baseline:
        0.48,

      target:
        0.63,

      unit:
        "score",

      rationale:
        "The highest-leverage organizational constraint must improve enough to produce a material operating benefit.",
    },
  ],

  constraints: [
    {
      type:
        "risk",

      description:
        "Do not increase organizational risk.",

      required:
        true,
    },

    {
      type:
        "people",

      description:
        "Do not increase headcount.",

      required:
        true,
    },

    {
      type:
        "budget",

      description:
        "Remain budget neutral.",

      required:
        true,
    },

    {
      type:
        "time",

      description:
        "Produce measurable improvement within the near term.",

      required:
        true,
    },
  ],

  allowedInterventionTypes: [
    "governance",
    "policy",
    "strategy",
  ],

  assumptions: [
    "The current organizational understanding is sufficiently accurate.",
    "Structural interventions can be implemented without increasing headcount.",
    "The primary executive constraint accurately represents the highest-leverage intervention point.",
  ],

  openQuestions: [
    "Which structural strategy produces the greatest improvement under the current constraints?",
  ],

  confidence:
    0.8,

  createdAt:
    NOW,

  updatedAt:
    NOW,
};

const runtimeSnapshotBefore =
  JSON.stringify(
    benchmarkRuntime,
  );

const firstCycle =
  runExecutiveDecisionCycle({
    executiveDecision,

    runtime:
      benchmarkRuntime,

    completedAt:
      NOW,
  });

const secondCycle =
  runExecutiveDecisionCycle({
    executiveDecision,

    runtime:
      benchmarkRuntime,

    completedAt:
      NOW,
  });

const runtimeSnapshotAfter =
  JSON.stringify(
    benchmarkRuntime,
  );

const viableOptionCount =
  firstCycle
    .viabilityEvaluations
    .filter(
      (evaluation) =>
        evaluation.status !==
        "disqualified",
    )
    .length;

const winner =
  firstCycle.rankedScenarios[0];

const runnerUp =
  firstCycle.rankedScenarios[1];

const recommendation =
  firstCycle.recommendation;

const rankingIsDeterministic =
  serializeRanking(
    firstCycle.rankedScenarios,
  ) ===
  serializeRanking(
    secondCycle.rankedScenarios,
  );

const recommendationIsDeterministic =
  JSON.stringify(
    firstCycle.recommendation,
  ) ===
  JSON.stringify(
    secondCycle.recommendation,
  );

const recommendationAddressesPrimaryConstraint =
  recommendationAddressesConstraint({
    recommendation,

    primaryConstraintId:
      primaryExecutiveConstraint
        .conditionId,

    primaryConstraintTitle:
      primaryExecutiveConstraint
        .title,
  });

const recommendationExplainsComparison =
  Boolean(runnerUp) &&
  (
    recommendation
      .whyRecommended
      .length > 0 ||
    winner
      ?.reasonsForRank
      .length > 0
  );

const checks: Check[] = [
  {
    name:
      "Executive Decision accepted",

    passed:
      firstCycle.executiveDecision
        .id ===
      executiveDecision.id,

    detail:
      firstCycle.executiveDecision
        .title,
  },

  {
    name:
      "Primary executive constraint supplied",

    passed:
      firstCycle.recommendation
        .primaryConstraintId ===
      primaryExecutiveConstraint
        .conditionId,

    detail:
      `${
        firstCycle.recommendation
          .primaryConstraintTitle ??
        "none"
      } · ${
        firstCycle.recommendation
          .primaryConstraintId ??
        "none"
      }`,
  },

  {
    name:
      "Optimization objective preserves primary constraint",

    passed:
      firstCycle
        .optimizationObjective
        .explanation
        .includes(
          primaryExecutiveConstraint
            .title,
        ),

    detail:
      firstCycle
        .optimizationObjective
        .explanation,
  },

  {
    name:
      "Recommendation preserves optimization objective",

    passed:
      firstCycle.recommendation
        .optimizationObjectiveId ===
      firstCycle
        .optimizationObjective.id,

    detail:
      firstCycle.recommendation
        .optimizationObjectiveId ??
      "none",
  },

  {
    name:
      "Multiple intervention strategies generated",

    passed:
      firstCycle
        .generatedOptions
        .length >=
      MINIMUM_STRATEGY_COUNT,

    detail:
      `${firstCycle.generatedOptions.length} option(s); minimum required ${MINIMUM_STRATEGY_COUNT}`,
  },

  {
    name:
      "Multiple viable alternatives preserved",

    passed:
      viableOptionCount >=
      MINIMUM_STRATEGY_COUNT,

    detail:
      `${viableOptionCount} viable option(s); minimum required ${MINIMUM_STRATEGY_COUNT}`,
  },

  {
    name:
      "Every generated option received a viability evaluation",

    passed:
      firstCycle
        .generatedOptions
        .length ===
      firstCycle
        .viabilityEvaluations
        .length,

    detail:
      `${firstCycle.viabilityEvaluations.length}/${firstCycle.generatedOptions.length}`,
  },

  {
    name:
      "Every viable option evaluated",

    passed:
      viableOptionCount ===
      firstCycle
        .evaluatedOptions
        .length,

    detail:
      `${firstCycle.evaluatedOptions.length}/${viableOptionCount}`,
  },

  {
    name:
      "Every evaluated option simulated",

    passed:
      firstCycle
        .evaluatedOptions
        .length ===
      firstCycle
        .scenarios
        .length,

    detail:
      `${firstCycle.scenarios.length}/${firstCycle.evaluatedOptions.length}`,
  },

  {
    name:
      "Scenario comparison covers every simulation",

    passed:
      firstCycle
        .comparisonSet
        .scenarioComparisons
        .length ===
      firstCycle.scenarios.length,

    detail:
      `${firstCycle.comparisonSet.scenarioComparisons.length} comparison(s)`,
  },

  {
    name:
      "Scenario ranking covers every simulation",

    passed:
      firstCycle
        .rankedScenarios
        .length ===
      firstCycle.scenarios.length,

    detail:
      `${firstCycle.rankedScenarios.length} ranked scenario(s)`,
  },

  {
    name:
      "Exactly one strategy wins",

    passed:
      Boolean(winner) &&
      firstCycle
        .rankedScenarios
        .filter(
          (scenario) =>
            scenario.rank === 1,
        )
        .length === 1,

    detail:
      winner
        ? `${winner.optionId} ranked first`
        : "No winner.",
  },

  {
    name:
      "At least one alternative remains",

    passed:
      Boolean(runnerUp),

    detail:
      runnerUp
        ? `${runnerUp.optionId} ranked second`
        : "No runner-up.",
  },

  {
    name:
      "Winner is deterministic",

    passed:
      rankingIsDeterministic,

    detail:
      rankingIsDeterministic
        ? winner?.optionId ??
          "No winner."
        : "Ranking changed between identical runs.",
  },

  {
    name:
      "Recommendation is deterministic",

    passed:
      recommendationIsDeterministic,

    detail:
      recommendationIsDeterministic
        ? recommendation
            .recommendedStrategy
            ?.title ??
          "No strategy."
        : "Recommendation changed between identical runs.",
  },

  {
    name:
      "Decision confidence calibrated",

    passed:
      firstCycle
        .confidenceCalibration
        .calibratedConfidence >= 0 &&
      firstCycle
        .confidenceCalibration
        .calibratedConfidence <= 1,

    detail:
      `${Math.round(
        firstCycle
          .confidenceCalibration
          .calibratedConfidence *
          100,
      )}% calibrated confidence`,
  },

  {
    name:
      "Executive recommendation created",

    passed:
      Boolean(
        recommendation
          .recommendedInterventionId,
      ),

    detail:
      recommendation.status,
  },

  {
    name:
      "Top-ranked option recommended",

    passed:
      winner?.interventionId ===
      recommendation
        .recommendedInterventionId,

    detail:
      recommendation
        .recommendedInterventionId ??
      "none",
  },

  {
    name:
      "Winning strategy addresses the primary constraint",

    passed:
      recommendationAddressesPrimaryConstraint,

    detail:
      recommendationAddressesPrimaryConstraint
        ? primaryExecutiveConstraint
            .title
        : `Recommended target conditions: ${
            recommendation
              .recommendedStrategy
              ?.targetConditionIds
              .join(", ") ??
            "none"
          }`,
  },

  {
    name:
      "Recommendation explains comparative advantage",

    passed:
      recommendationExplainsComparison,

    detail:
      `${recommendation.whyRecommended.length} recommendation reason(s); ${
        winner?.reasonsForRank
          .length ?? 0
      } ranking reason(s)`,
  },

  {
    name:
      "Recommendation evaluates alternatives",

    passed:
      firstCycle
        .rankedScenarios
        .length > 1,

    detail:
      `${Math.max(
        0,
        firstCycle
          .rankedScenarios
          .length - 1,
      )} alternative(s)`,
  },

  {
    name:
      "Runtime remained unchanged",

    passed:
      runtimeSnapshotBefore ===
      runtimeSnapshotAfter,

    detail:
      runtimeSnapshotBefore ===
      runtimeSnapshotAfter
        ? "Runtime not mutated."
        : "Runtime changed.",
  },
];

const passed =
  checks.filter(
    (check) =>
      check.passed,
  ).length;

const failed =
  checks.length -
  passed;

console.log(
  "Executive Judgment Context",
);
console.log(
  "------------------------------",
);
console.log(
  `Primary constraint: ${primaryExecutiveConstraint.title}`,
);
console.log(
  `Constraint ID: ${primaryExecutiveConstraint.conditionId}`,
);
console.log(
  `Target conditions: ${targetConditionIds.join(", ")}`,
);
console.log(
  `Generated strategies: ${firstCycle.generatedOptions.length}`,
);
console.log(
  `Viable strategies: ${viableOptionCount}`,
);
console.log("");

console.log("Assertions");
console.log(
  "------------------------------",
);

for (const check of checks) {
  console.log(
    `${
      check.passed
        ? "PASS"
        : "FAIL"
    }  ${check.name}`,
  );

  console.log(
    `      ${check.detail}`,
  );
}

console.log("");

console.log(
  `Passed: ${passed}`,
);

console.log(
  `Failed: ${failed}`,
);

console.log("");

if (failed > 0) {
  process.exitCode = 1;
}

console.log(
  "Experiment Complete",
);
console.log("");