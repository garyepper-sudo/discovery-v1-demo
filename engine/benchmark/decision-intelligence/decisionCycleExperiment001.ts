import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  runExecutiveDecisionCycle,
} from "../../v3/decisions/runExecutiveDecisionCycle";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import type {
  OrganizationalUncertainty,
} from "../../v3/model/epistemic/organizationalUncertainty";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const NOW =
  "2026-07-13T12:00:00.000Z";

type Check = {
  name: string;
  passed: boolean;
  detail: string;
};

console.log("");
console.log("==========================================");
console.log("DISCOVERY EXECUTIVE DECISION CYCLE");
console.log("Experiment 001");
console.log("==========================================");
console.log("");

const runtime =
  loadOrganizationRuntimeState(
    ORGANIZATION_ID,
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
    "Increase execution throughput without increasing organizational risk.",

  rationale:
    "Leadership wants to improve execution quality using structural rather than staffing interventions.",

  status:
    "ready",

  timeHorizon:
    "near-term",

  targetConditionIds: [
    "condition-executioncapacity",
  ],

  successMetrics: [
    {
      name:
        "Execution Capacity",

      baseline:
        0.48,

      target:
        0.63,

      unit:
        "score",

      rationale:
        "Execution capacity must improve enough to produce a material operating benefit.",
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
  ],

  openQuestions: [],

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

const cycle =
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
  cycle.viabilityEvaluations.filter(
    (evaluation) =>
      evaluation.status !==
      "disqualified",
  ).length;

const checks: Check[] = [
  {
    name:
      "Executive Decision accepted",

    passed:
      cycle.executiveDecision.id ===
      executiveDecision.id,

    detail:
      cycle.executiveDecision.title,
  },

  {
    name:
      "Intervention options generated",

    passed:
      cycle.generatedOptions.length >
      0,

    detail:
      `${cycle.generatedOptions.length} option(s)`,
  },

  {
    name:
      "Every generated option received a viability evaluation",

    passed:
      cycle.generatedOptions.length ===
      cycle.viabilityEvaluations.length,

    detail:
      `${cycle.viabilityEvaluations.length}/${cycle.generatedOptions.length}`,
  },

  {
    name:
      "Every viable option evaluated",

    passed:
      viableOptionCount ===
      cycle.evaluatedOptions.length,

    detail:
      `${cycle.evaluatedOptions.length}/${viableOptionCount}`,
  },

  {
    name:
      "Every evaluated option simulated",

    passed:
      cycle.evaluatedOptions.length ===
      cycle.scenarios.length,

    detail:
      `${cycle.scenarios.length}/${cycle.evaluatedOptions.length}`,
  },

  {
    name:
      "Scenario comparison created",

    passed:
      cycle.comparisonSet
        .scenarioComparisons.length ===
      cycle.scenarios.length,

    detail:
      `${cycle.comparisonSet.scenarioComparisons.length} comparison(s)`,
  },

  {
    name:
      "Scenario ranking created",

    passed:
      cycle.rankedScenarios.length ===
      cycle.scenarios.length,

    detail:
      `${cycle.rankedScenarios.length} ranked scenario(s)`,
  },

  {
    name:
      "Decision confidence calibrated",

    passed:
      cycle.confidenceCalibration
        .calibratedConfidence >= 0 &&
      cycle.confidenceCalibration
        .calibratedConfidence <= 1,

    detail:
      `${Math.round(
        cycle.confidenceCalibration
          .calibratedConfidence *
          100,
      )}% calibrated confidence`,
  },

  {
    name:
      "Executive recommendation created",

    passed:
      Boolean(
        cycle.recommendation
          .recommendedInterventionId,
      ),

    detail:
      cycle.recommendation.status,
  },

  {
    name:
      "Top-ranked option recommended",

    passed:
      cycle.rankedScenarios[0]
        .interventionId ===
      cycle.recommendation
        .recommendedInterventionId,

    detail:
      cycle.recommendation
        .recommendedInterventionId ??
      "none",
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
    (check) => check.passed,
  ).length;

const failed =
  checks.length -
  passed;

console.log("Assertions");
console.log("------------------------------");

for (const check of checks) {
  console.log(
    `${check.passed ? "PASS" : "FAIL"}  ${check.name}`,
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

console.log("Experiment Complete");
console.log("");
