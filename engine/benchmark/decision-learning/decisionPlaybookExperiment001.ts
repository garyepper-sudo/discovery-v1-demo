import {
  buildDecisionPlaybook,
} from "../../v3/decision-learning/buildDecisionPlaybook";

import {
  updateExecutiveDecisionMemory,
} from "../../v3/decision-learning/updateExecutiveDecisionMemory";

import type {
  ExecutiveDecisionLearning,
} from "../../v3/model/decision-learning/executiveDecisionLearning";

import type {
  ExecutiveDecisionMemory,
} from "../../v3/model/decision-learning/executiveDecisionMemory";

import type {
  ExecutiveDecisionOutcome,
} from "../../v3/model/decision-learning/executiveDecisionOutcome";

import type {
  ExecutiveDecisionReflection,
} from "../../v3/model/decision-learning/executiveDecisionReflection";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const UPDATED_AT =
  "2026-08-20T12:00:00.000Z";

type Check = {
  name: string;
  passed: boolean;
  detail: string;
};

function percent(
  value: number,
): string {
  return `${Math.round(
    value * 100,
  )}%`;
}

function buildOutcome(params: {
  index: number;
  decisionId: string;
  interventionId: string;
  evaluatedAt: string;
}): ExecutiveDecisionOutcome {
  return {
    id:
      `executive-decision-outcome-playbook-${params.index}`,

    executiveDecisionId:
      params.decisionId,

    organizationId:
      ORGANIZATION_ID,

    interventionId:
      params.interventionId,

    evaluatedAt:
      params.evaluatedAt,

    executionStatus:
      "completed",

    outcome:
      "successful",

    improvedConditionIds: [
      "condition-executioncapacity",
      "condition-decisionflow",
    ],

    worsenedConditionIds: [],

    unchangedConditionIds: [
      "condition-coordination",
    ],

    achievedSuccessMetrics: [
      "Execution Capacity",
    ],

    missedSuccessMetrics: [],

    validatedPredictionIds: [
      `prediction-playbook-${params.index}`,
    ],

    invalidatedPredictionIds: [],

    validatedAssumptions: [
      "Reducing concurrent work improves execution capacity.",
    ],

    invalidatedAssumptions: [],

    unexpectedEffects: [],

    confidence:
      0.88,

    summary:
      "The intervention completed successfully, improved execution capacity and decision flow, achieved its success metric, and validated the expected organizational direction.",
  };
}

function buildReflection(params: {
  index: number;
  outcome:
    ExecutiveDecisionOutcome;
  createdAt: string;
}): ExecutiveDecisionReflection {
  return {
    id:
      `executive-decision-reflection-playbook-${params.index}`,

    executiveDecisionOutcomeId:
      params.outcome.id,

    assessment:
      "validated",

    rationale:
      "The observed outcome matched the expected organizational direction, achieved the intended success metric, and validated the intervention assumptions and predictions.",

    validatedPredictions: [
      ...params.outcome
        .validatedPredictionIds,
    ],

    invalidatedPredictions: [],

    validatedAssumptions: [
      ...params.outcome
        .validatedAssumptions,
    ],

    invalidatedAssumptions: [],

    unexpectedFindings: [],

    reinforcedMechanismIds: [
      "mechanism:priorityConflict",
      "mechanism:coordinationBreakdown",
    ],

    weakenedMechanismIds: [],

    reinforcedTheoryIds: [
      "theory:execution-capacity-strain",
    ],

    weakenedTheoryIds: [],

    keyLearning:
      "Reducing concurrent work is a repeatable intervention pattern when execution capacity is constrained by excessive parallel priorities.",

    futureRecommendation:
      "Consider reducing concurrent work in future execution decisions when the organization shows similar capacity and prioritization constraints.",

    confidence:
      0.9,

    createdAt:
      params.createdAt,
  };
}

function buildLearning(params: {
  index: number;
  decisionId: string;
  reflection:
    ExecutiveDecisionReflection;
  createdAt: string;
}): ExecutiveDecisionLearning {
  return {
    id:
      `executive-decision-learning-playbook-${params.index}`,

    organizationId:
      ORGANIZATION_ID,

    executiveDecisionReflectionId:
      params.reflection.id,

    executiveDecisionId:
      params.decisionId,

    type:
      "mechanism-validity",

    statement:
      "Reducing concurrent work is a supported intervention pattern under organizational conditions where excessive parallel priorities constrain execution capacity.",

    rationale:
      "Observed decision outcomes repeatedly improved execution capacity and decision flow while reinforcing the mechanisms connecting priority conflict to execution strain.",

    applicableInterventionTypes: [
      "strategy",
    ],

    applicableConditionIds: [
      "condition-executioncapacity",
      "condition-decisionflow",
    ],

    applicableConstraintTypes: [
      "risk",
      "people",
      "budget",
    ],

    reinforcedMechanismIds: [
      "mechanism:priorityConflict",
      "mechanism:coordinationBreakdown",
    ],

    weakenedMechanismIds: [],

    reinforcedTheoryIds: [
      "theory:execution-capacity-strain",
    ],

    weakenedTheoryIds: [],

    confidenceAdjustment:
      0.18,

    confidence:
      0.9,

    supportCount:
      1,

    status:
      "provisional",

    createdAt:
      params.createdAt,

    updatedAt:
      params.createdAt,
  };
}

function addDecisionChain(params: {
  memory?:
    ExecutiveDecisionMemory;
  index: number;
}): ExecutiveDecisionMemory {
  const decisionId =
    `executive-decision-playbook-${params.index}`;

  const interventionId =
    `intervention-playbook-${params.index}`;

  const evaluatedAt =
    `2026-08-${String(
      10 + params.index,
    ).padStart(
      2,
      "0",
    )}T12:00:00.000Z`;

  const reflectedAt =
    `2026-08-${String(
      10 + params.index,
    ).padStart(
      2,
      "0",
    )}T12:05:00.000Z`;

  const learnedAt =
    `2026-08-${String(
      10 + params.index,
    ).padStart(
      2,
      "0",
    )}T12:10:00.000Z`;

  const outcome =
    buildOutcome({
      index:
        params.index,
      decisionId,
      interventionId,
      evaluatedAt,
    });

  const reflection =
    buildReflection({
      index:
        params.index,
      outcome,
      createdAt:
        reflectedAt,
    });

  const learning =
    buildLearning({
      index:
        params.index,
      decisionId,
      reflection,
      createdAt:
        learnedAt,
    });

  return updateExecutiveDecisionMemory({
    organizationId:
      ORGANIZATION_ID,

    existingMemory:
      params.memory,

    outcome,

    reflection,

    learning,

    updatedAt:
      learnedAt,
  });
}

console.log("");
console.log("==========================================");
console.log("DISCOVERY DECISION PLAYBOOK");
console.log("Experiment 001");
console.log("==========================================");
console.log("");

let memory:
  ExecutiveDecisionMemory | undefined;

memory =
  addDecisionChain({
    memory,
    index:
      1,
  });

memory =
  addDecisionChain({
    memory,
    index:
      2,
  });

memory =
  addDecisionChain({
    memory,
    index:
      3,
  });

const memorySnapshotBefore =
  JSON.stringify(
    memory,
  );

const playbook =
  buildDecisionPlaybook({
    memory,

    updatedAt:
      UPDATED_AT,
  });

const memorySnapshotAfter =
  JSON.stringify(
    memory,
  );

const entry =
  playbook.entries[0];

if (!entry) {
  throw new Error(
    "Decision Playbook did not produce an entry.",
  );
}

const checks: Check[] = [
  {
    name:
      "Playbook belongs to the correct organization",

    passed:
      playbook.organizationId ===
      ORGANIZATION_ID,

    detail:
      playbook.organizationId,
  },

  {
    name:
      "Compatible learnings grouped into one entry",

    passed:
      playbook.entries.length ===
      1,

    detail:
      `${playbook.entries.length} entry or entries`,
  },

  {
    name:
      "Support counts aggregated",

    passed:
      entry.supportCount ===
      3,

    detail:
      `${entry.supportCount} supporting outcome(s)`,
  },

  {
    name:
      "Repeated support promotes entry",

    passed:
      entry.status ===
      "supported",

    detail:
      entry.status,
  },

  {
    name:
      "Positive learning recommends intervention type",

    passed:
      entry
        .recommendedInterventionTypes
        .includes(
          "strategy",
        ) &&
      entry
        .discouragedInterventionTypes
        .length === 0,

    detail:
      `${entry.recommendedInterventionTypes.join(", ") || "none"} recommended; ${entry.discouragedInterventionTypes.length} discouraged`,
  },

  {
    name:
      "Applicable conditions preserved",

    passed:
      [
        "condition-executioncapacity",
        "condition-decisionflow",
      ].every(
        (conditionId) =>
          entry
            .applicableConditionIds
            .includes(
              conditionId,
            ),
      ),

    detail:
      entry
        .applicableConditionIds
        .join(", "),
  },

  {
    name:
      "Common constraints preserved",

    passed:
      [
        "risk",
        "people",
        "budget",
      ].every(
        (constraintType) =>
          entry
            .commonConstraintTypes
            .includes(
              constraintType,
            ),
      ),

    detail:
      entry
        .commonConstraintTypes
        .join(", "),
  },

  {
    name:
      "Supporting learning IDs preserved",

    passed:
      entry
        .supportingLearningIds
        .length === 3,

    detail:
      `${entry.supportingLearningIds.length} learning ID(s)`,
  },

  {
    name:
      "Supporting outcome IDs preserved",

    passed:
      entry
        .supportingOutcomeIds
        .length === 3,

    detail:
      `${entry.supportingOutcomeIds.length} outcome ID(s)`,
  },

  {
    name:
      "Entry confidence bounded and mature",

    passed:
      Number.isFinite(
        entry.confidence,
      ) &&
      entry.confidence >=
        0.65 &&
      entry.confidence <=
        1,

    detail:
      percent(
        entry.confidence,
      ),
  },

  {
    name:
      "Playbook confidence bounded",

    passed:
      Number.isFinite(
        playbook.confidence,
      ) &&
      playbook.confidence >=
        0 &&
      playbook.confidence <=
        1,

    detail:
      percent(
        playbook.confidence,
      ),
  },

  {
    name:
      "Guidance is substantive",

    passed:
      entry.guidance
        .trim()
        .length >= 150,

    detail:
      `${entry.guidance.length} characters`,
  },

  {
    name:
      "Rationale is substantive",

    passed:
      entry.rationale
        .trim()
        .length >= 120,

    detail:
      `${entry.rationale.length} characters`,
  },

  {
    name:
      "Falsifying evidence generated",

    passed:
      entry
        .falsifyingEvidence
        .length >= 2,

    detail:
      `${entry.falsifyingEvidence.length} falsifying evidence item(s)`,
  },

  {
    name:
      "Playbook summary generated",

    passed:
      playbook.summary
        .trim()
        .length >= 100,

    detail:
      `${playbook.summary.length} characters`,
  },

  {
    name:
      "Playbook timestamp preserved",

    passed:
      playbook.updatedAt ===
      UPDATED_AT,

    detail:
      playbook.updatedAt,
  },

  {
    name:
      "Input memory remained unchanged",

    passed:
      memorySnapshotBefore ===
      memorySnapshotAfter,

    detail:
      memorySnapshotBefore ===
      memorySnapshotAfter
        ? "Memory not mutated."
        : "Memory changed.",
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

console.log("Decision Playbook");
console.log("------------------------------");
console.log(
  `Entries: ${playbook.entries.length}`,
);
console.log(
  `Confidence: ${percent(
    playbook.confidence,
  )}`,
);
console.log(
  `Title: ${entry.title}`,
);
console.log(
  `Status: ${entry.status}`,
);
console.log(
  `Support Count: ${entry.supportCount}`,
);
console.log(
  `Guidance: ${entry.guidance}`,
);
console.log("");

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
