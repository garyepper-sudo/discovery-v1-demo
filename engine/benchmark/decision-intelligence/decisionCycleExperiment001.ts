import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  runExecutiveDecisionCycle,
} from "../../v3/decisions/runExecutiveDecisionCycle";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

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
    },
  ],

  constraints: [
    {
      type:
        "risk",

      description:
        "Avoid increasing organizational risk.",

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
  JSON.stringify(runtime);

const cycle =
  runExecutiveDecisionCycle({
    executiveDecision,
    runtime,
    completedAt:
      NOW,
  });

const runtimeSnapshotAfter =
  JSON.stringify(runtime);

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
      "Every option evaluated",

    passed:
      cycle.generatedOptions.length ===
      cycle.evaluatedOptions.length,

    detail:
      `${cycle.evaluatedOptions.length}/${cycle.generatedOptions.length}`,
  },

  {
    name:
      "Every option simulated",

    passed:
      cycle.generatedOptions.length ===
      cycle.scenarios.length,

    detail:
      `${cycle.scenarios.length}/${cycle.generatedOptions.length}`,
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