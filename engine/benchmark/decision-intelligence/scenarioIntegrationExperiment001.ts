import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  buildOrganizationalIntervention,
} from "../../v3/model/simulate/buildOrganizationalIntervention";

import {
  buildExecutiveDecisionContext,
} from "../../v3/scenarios/buildExecutiveDecisionContext";

import {
  runExecutiveScenario,
} from "../../v3/scenarios/runExecutiveScenario";

import {
  buildExecutiveScenarioProjection,
} from "../../../components/executive-v2/projection/buildExecutiveScenarioProjection";

import type {
  OrganizationRuntime,
} from "../../v3/runtime/organizationRuntime";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

type ExperimentCheck = {
  name: string;
  passed: boolean;
  detail: string;
};

type ScenarioRuntimeMemory =
  OrganizationRuntime["memory"] & {
    organizationalConditions?: Array<{
      id: string;
      name?: string;
    }>;

    executiveAssessment?: unknown;
    organizationalState?: unknown;
    organizationalCausalModel?: unknown;
    organizationalLearningProfile?: unknown;
  };

function stableSnapshot(
  value: unknown,
): string {
  return JSON.stringify(value);
}

console.log("");
console.log("==========================================");
console.log("DISCOVERY SCENARIO INTEGRATION");
console.log("Experiment 001");
console.log("==========================================");
console.log("");

console.log(
  `Loading persisted runtime: ${ORGANIZATION_ID}`,
);
console.log("");

const runtimeBefore =
  loadOrganizationRuntimeState(
    ORGANIZATION_ID,
  );

const memory =
  runtimeBefore.memory as ScenarioRuntimeMemory;

const conditions =
  Array.isArray(
    memory.organizationalConditions,
  )
    ? memory.organizationalConditions
    : [];

const targetCondition =
  conditions.find(
    (condition) =>
      condition.id ===
      "condition-decisionflow",
  ) ??
  conditions[0];

if (!targetCondition) {
  throw new Error(
    "Scenario Integration Experiment requires at least one persisted organizational condition. Run Atlas first.",
  );
}

const now =
  new Date().toISOString();

const intervention =
  buildOrganizationalIntervention({
    organizationId:
      ORGANIZATION_ID,

    type:
      "governance",

    title:
      "Clarify Decision Rights",

    description:
      "Reduce approval bottlenecks by clarifying decision authority.",

    rationale:
      "Evaluate whether reducing governance friction improves organizational execution.",

    scope:
      "organization",

    timeHorizon:
      "near-term",

    status:
      "hypothetical",

    affectedConditionIds: [
      targetCondition.id,
    ],

    expectedMechanismIds: [
      "governance-friction",
    ],

    assumptions: [
      "Leadership can clarify decision authority without adding coordination overhead.",
      "Teams will consistently use the clarified decision rights.",
    ],

    confidence:
      0.8,

    createdAt:
      now,
  });

const runtimeSnapshotBefore =
  stableSnapshot(runtimeBefore);

console.log("Building Executive Decision Context");
console.log("-----------------------------------");

const decisionContext =
  buildExecutiveDecisionContext(
    runtimeBefore,
    {
      changedEntityId:
        targetCondition.id,

      interventionDelta:
        0.25,

      timeHorizon:
        intervention.timeHorizon,

      simulatedAt:
        now,
    },
  );

console.log("Context created.");
console.log("");

console.log("Running Executive Scenario");
console.log("--------------------------");

const scenarioResult =
  runExecutiveScenario({
    ...decisionContext,
    intervention,
  });

console.log("Scenario completed.");
console.log("");

console.log("Building Executive Scenario Projection");
console.log("--------------------------------------");

const scenarioProjection =
  buildExecutiveScenarioProjection(
    ORGANIZATION_ID,
    scenarioResult,
  );

console.log("Projection created.");
console.log("");

const runtimeAfter =
  loadOrganizationRuntimeState(
    ORGANIZATION_ID,
  );

const runtimeSnapshotAfter =
  stableSnapshot(runtimeAfter);

const projectedConditions =
  scenarioResult.simulatedOrganizationState
    .projectedConditions;

const projectedPredictions =
  scenarioResult.simulatedOrganizationState
    .projectedPredictions;

const projectedAssessment =
  scenarioResult.scenario
    .projectedExecutiveAssessment;

const projectedUnderstandingCandidates =
  scenarioResult.scenario
    .projectedUnderstandingCandidates;

const comparison =
  scenarioResult.comparison;

const checks: ExperimentCheck[] = [
  {
    name:
      "Runtime loaded",

    passed:
      Boolean(runtimeBefore),

    detail:
      `Loaded ${ORGANIZATION_ID}`,
  },

  {
    name:
      "Required baseline cognition exists",

    passed:
      Boolean(
        memory.executiveAssessment &&
        memory.organizationalState &&
        memory.organizationalCausalModel &&
        memory.organizationalLearningProfile,
      ),

    detail:
      "Executive Assessment, Organizational State, Causal Model, and Learning Profile are required.",
  },

  {
    name:
      "Decision context created",

    passed:
      Boolean(
        decisionContext.currentExecutiveAssessment &&
        decisionContext.currentOrganizationalState &&
        decisionContext.simulation.causalModel,
      ),

    detail:
      "Runtime cognition was adapted into scenario input.",
  },

  {
    name:
      "Intervention identity preserved",

    passed:
      scenarioResult.intervention.id ===
        intervention.id &&
      scenarioProjection.intervention.id ===
        intervention.id,

    detail:
      `Intervention: ${intervention.title}`,
  },

  {
    name:
      "Simulation completed",

    passed:
      Boolean(
        scenarioResult
          .simulatedOrganizationState,
      ),

    detail:
      `Simulated at ${scenarioResult.simulatedOrganizationState.simulatedAt}`,
  },

  {
    name:
      "Projected conditions created",

    passed:
      Array.isArray(
        projectedConditions,
      ) &&
      projectedConditions.length > 0,

    detail:
      `${projectedConditions.length} projected condition(s)`,
  },

  {
    name:
      "Projected predictions created",

    passed:
      Array.isArray(
        projectedPredictions,
      ) &&
      projectedPredictions.length > 0,

    detail:
      `${projectedPredictions.length} projected prediction(s)`,
  },

  {
    name:
      "Prediction reflection regenerated",

    passed:
      Boolean(
        scenarioResult.scenario
          .projectedPredictionReflection,
      ),

    detail:
      "Projected predictions were evaluated through the canonical reflection producer.",
  },

  {
    name:
      "Executive Assessment regenerated",

    passed:
      Boolean(
        projectedAssessment,
      ),

    detail:
      "The projected future was routed through buildExecutiveAssessment().",
  },

  {
    name:
      "Executive Understanding regenerated",

    passed:
      Array.isArray(
        projectedUnderstandingCandidates,
      ) &&
      projectedUnderstandingCandidates.length >
        0,

    detail:
      `${projectedUnderstandingCandidates.length} projected understanding candidate(s)`,
  },

  {
    name:
      "Scenario comparison produced",

    passed:
      Boolean(comparison),

    detail:
      "Current and projected cognition were compared.",
  },

  {
    name:
      "Executive projection produced",

    passed:
      Boolean(
        scenarioProjection
          .projectedFuture
          .executiveAssessment &&
        scenarioProjection.comparison,
      ),

    detail:
      "The scenario result was converted into the executive-facing contract.",
  },

  {
    name:
      "Organization ID preserved",

    passed:
      scenarioProjection.organizationId ===
      ORGANIZATION_ID,

    detail:
      scenarioProjection.organizationId,
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
        ? "Scenario execution did not mutate or persist the runtime."
        : "The persisted runtime changed during scenario execution.",
  },
];

const passedChecks =
  checks.filter(
    (check) => check.passed,
  ).length;

const failedChecks =
  checks.length -
  passedChecks;

console.log("Experiment Assertions");
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
  `Passed Checks: ${passedChecks}`,
);
console.log(
  `Failed Checks: ${failedChecks}`,
);
console.log("");

console.log("Scenario Summary");
console.log("------------------------------");

console.dir(
  {
    intervention:
      scenarioProjection.summary,

    targetCondition:
      targetCondition.name ??
      targetCondition.id,

    projectedConditionCount:
      projectedConditions.length,

    projectedPredictionCount:
      projectedPredictions.length,

    projectedUnderstandingCount:
      projectedUnderstandingCandidates.length,

    comparison:
      scenarioProjection.comparison,
  },
  {
    depth: null,
  },
);

console.log("");

if (failedChecks > 0) {
  process.exitCode = 1;
}

console.log("Experiment Complete");
console.log("");