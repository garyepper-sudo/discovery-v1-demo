import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import type {
  OrganizationalCondition,
} from "../../v3/model/state/inferOrganizationalConditions";

import {
  synthesizeExecutiveOptimizationObjective,
} from "../../v3/optimization/synthesizeExecutiveOptimizationObjective";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const NOW =
  "2026-07-16T12:00:00.000Z";

type Check = {
  name: string;
  passed: boolean;
  detail: string;
};

console.log("");
console.log("==========================================");
console.log("DISCOVERY OPTIMIZATION OBJECTIVE");
console.log("Experiment 001");
console.log("==========================================");
console.log("");

const runtime =
  loadOrganizationRuntimeState(
    ORGANIZATION_ID,
  );

type RuntimeMemoryWithConditions =
  typeof runtime.memory & {
    organizationalConditions?:
      OrganizationalCondition[];
  };

const memory =
  runtime.memory as
    RuntimeMemoryWithConditions;

const conditions =
  memory.organizationalConditions;

if (
  !Array.isArray(conditions) ||
  conditions.length === 0
) {
  throw new Error(
    "Optimization Objective Experiment requires persisted organizational conditions.",
  );
}

const executiveDecision:
  ExecutiveDecision = {
    id:
      "optimization-decision-improve-execution-001",

    organizationId:
      ORGANIZATION_ID,

    type:
      "execution",

    title:
      "Improve Organizational Execution",

    objective:
      "Increase execution capacity without increasing headcount or organizational risk.",

    rationale:
      "Leadership wants to improve throughput through structural and operating-model changes.",

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

        targetConditionId:
          "condition-executioncapacity",

        baseline:
          0.55,

        target:
          0.7,

        unit:
          "score",

        rationale:
          "Execution capacity must improve materially for the decision to succeed.",
      },
    ],

    constraints: [
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
          "risk",

        description:
          "Do not increase organizational risk.",

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
      0.86,

    createdAt:
      NOW,

    updatedAt:
      NOW,
  };

const decisionSnapshotBefore =
  JSON.stringify(
    executiveDecision,
  );

const conditionsSnapshotBefore =
  JSON.stringify(
    conditions,
  );

const firstObjective =
  synthesizeExecutiveOptimizationObjective({
    executiveDecision,
    conditions,
    generatedAt:
      NOW,
  });

const secondObjective =
  synthesizeExecutiveOptimizationObjective({
    executiveDecision,
    conditions,
    generatedAt:
      NOW,
  });

const decisionSnapshotAfter =
  JSON.stringify(
    executiveDecision,
  );

const conditionsSnapshotAfter =
  JSON.stringify(
    conditions,
  );

const executionCapacityVariable =
  firstObjective.variables.find(
    (variable) =>
      variable.conditionId ===
      "condition-executioncapacity",
  );

const secondaryVariables =
  firstObjective.variables.filter(
    (variable) =>
      variable.role ===
      "secondary",
  );

const protectedVariables =
  firstObjective.variables.filter(
    (variable) =>
      variable.role ===
      "protected",
  );

const executionCapacityTarget =
  firstObjective.successTargets.find(
    (target) =>
      target.conditionId ===
      "condition-executioncapacity",
  );

const checks: Check[] = [
  {
    name:
      "Optimization objective created",

    passed:
      firstObjective
        .executiveDecisionId ===
      executiveDecision.id,

    detail:
      firstObjective.id,
  },

  {
    name:
      "Execution Capacity selected as primary",

    passed:
      executionCapacityVariable
        ?.role ===
      "primary",

    detail:
      executionCapacityVariable
        ? `${executionCapacityVariable.name}: ${executionCapacityVariable.role}`
        : "Execution Capacity was not selected.",
  },

  {
    name:
      "Primary variable is optimized for improvement",

    passed:
      executionCapacityVariable
        ?.objective ===
      "improve",

    detail:
      executionCapacityVariable
        ?.objective ??
      "missing",
  },

  {
    name:
      "Primary variable receives strong weight",

    passed:
      Boolean(
        executionCapacityVariable &&
        executionCapacityVariable
          .weight >=
          0.7,
      ),

    detail:
      executionCapacityVariable
        ? `${Math.round(
            executionCapacityVariable
              .weight *
              100,
          )}%`
        : "missing",
  },

  {
    name:
      "Connected variables selected",

    passed:
      secondaryVariables.length >
      0,

    detail:
      `${secondaryVariables.length} secondary variable(s)`,
  },

  {
    name:
      "High-priority risks protected",

    passed:
      protectedVariables.length >
      0,

    detail:
      `${protectedVariables.length} protected variable(s)`,
  },

  {
    name:
      "Success metric linked to canonical condition",

    passed:
      Boolean(
        executionCapacityTarget,
      ),

    detail:
      executionCapacityTarget
        ? `${executionCapacityTarget.name}: ${executionCapacityTarget.baseline ?? "n/a"} → ${executionCapacityTarget.target ?? "n/a"}`
        : "Success target missing.",
  },

  {
    name:
      "Every constraint translated",

    passed:
      firstObjective.constraints
        .length ===
      executiveDecision.constraints
        .length,

    detail:
      `${firstObjective.constraints.length}/${executiveDecision.constraints.length}`,
  },

  {
    name:
      "Time constraint translated as structured",

    passed:
      firstObjective.constraints.some(
        (constraint) =>
          constraint.type ===
            "time" &&
          constraint.translationStatus ===
            "structured",
      ),

    detail:
      firstObjective.constraints
        .find(
          (constraint) =>
            constraint.type ===
            "time",
        )
        ?.translationStatus ??
      "missing",
  },

  {
    name:
      "Unstructured constraints remain explicit",

    passed:
      firstObjective.constraints
        .filter(
          (constraint) =>
            constraint.type ===
              "people" ||
            constraint.type ===
              "risk",
        )
        .every(
          (constraint) =>
            constraint.translationStatus ===
            "requires-interpretation",
        ),

    detail:
      "People and risk constraints are not falsely treated as structured.",
  },

  {
    name:
      "Translation confidence produced",

    passed:
      firstObjective.confidence >
        0 &&
      firstObjective.confidence <=
        1,

    detail:
      `${Math.round(
        firstObjective.confidence *
          100,
      )}%`,
  },

  {
    name:
      "Confidence limiters surfaced",

    passed:
      firstObjective
        .confidenceLimiters
        .length >
      0,

    detail:
      `${firstObjective.confidenceLimiters.length} limiter(s)`,
  },

  {
    name:
      "Optimization synthesis deterministic",

    passed:
      JSON.stringify(
        firstObjective,
      ) ===
      JSON.stringify(
        secondObjective,
      ),

    detail:
      "Repeated synthesis produced identical output.",
  },

  {
    name:
      "Executive Decision remained unchanged",

    passed:
      decisionSnapshotBefore ===
      decisionSnapshotAfter,

    detail:
      decisionSnapshotBefore ===
      decisionSnapshotAfter
        ? "Decision not mutated."
        : "Decision changed.",
  },

  {
    name:
      "Organizational conditions remained unchanged",

    passed:
      conditionsSnapshotBefore ===
      conditionsSnapshotAfter,

    detail:
      conditionsSnapshotBefore ===
      conditionsSnapshotAfter
        ? "Conditions not mutated."
        : "Conditions changed.",
  },
];

console.log(
  "Optimization Objective",
);
console.log(
  "------------------------------",
);

console.dir(
  firstObjective,
  {
    depth:
      null,
  },
);

console.log("");

console.log(
  "Experiment Assertions",
);
console.log(
  "------------------------------",
);

for (const check of checks) {
  console.log(
    `${check.passed ? "PASS" : "FAIL"}  ${check.name}`,
  );

  console.log(
    `      ${check.detail}`,
  );
}

const passed =
  checks.filter(
    (check) =>
      check.passed,
  ).length;

const failed =
  checks.length -
  passed;

console.log("");
console.log(
  `Passed Checks: ${passed}`,
);
console.log(
  `Failed Checks: ${failed}`,
);
console.log("");

if (failed > 0) {
  process.exitCode = 1;
}

console.log(
  "Experiment Complete",
);
console.log("");