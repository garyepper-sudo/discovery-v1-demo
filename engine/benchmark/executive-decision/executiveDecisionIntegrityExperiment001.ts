import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  runExecutiveDecisionCycle,
  type ExecutiveDecisionCycle,
} from "../../v3/decisions/runExecutiveDecisionCycle";

import {
  buildExecutiveDecisionCycleIntegrityKey,
} from "../../v3/decisions/buildExecutiveDecisionCycleIntegrityKey";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import type {
  OrganizationalUncertainty,
} from "../../v3/model/epistemic/organizationalUncertainty";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const NOW =
  "2026-07-17T18:00:00.000Z";

type Check = {
  name: string;
  passed: boolean;
  detail: string;
};

function cloneCycle(
  cycle: ExecutiveDecisionCycle,
): ExecutiveDecisionCycle {
  return JSON.parse(
    JSON.stringify(
      cycle,
    ),
  ) as ExecutiveDecisionCycle;
}

function reverseObjectKeyOrder(
  value: unknown,
): unknown {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map(
      (item) =>
        reverseObjectKeyOrder(
          item,
        ),
    );
  }

  const source =
    value as
      Record<string, unknown>;

  return Object.keys(
    source,
  )
    .reverse()
    .reduce<
      Record<string, unknown>
    >(
      (
        reordered,
        key,
      ) => {
        reordered[key] =
          reverseObjectKeyOrder(
            source[key],
          );

        return reordered;
      },
      {},
    );
}

function assertHashChanged(
  checks: Check[],
  name: string,
  originalHash: string,
  changedCycle: ExecutiveDecisionCycle,
): void {
  const changedHash =
    buildExecutiveDecisionCycleIntegrityKey(
      changedCycle,
    );

  checks.push({
    name,

    passed:
      changedHash !==
      originalHash,

    detail:
      `${originalHash.slice(0, 12)} → ${changedHash.slice(0, 12)}`,
  });
}

console.log("");
console.log("==========================================");
console.log("DISCOVERY DECISION CYCLE INTEGRITY");
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
      "Validate whether structural interventions improve execution without increasing risk.",
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

    executiveDecisionRecords:
      runtime.memory
        .executiveDecisionRecords ??
      [],
  },
};

const executiveDecision:
  ExecutiveDecision = {
    id:
      "executive-decision-integrity-experiment-001",

    organizationId:
      ORGANIZATION_ID,

    type:
      "execution",

    title:
      "Improve Organizational Execution",

    objective:
      "Increase execution throughput without increasing organizational risk.",

    rationale:
      "Leadership wants to improve execution through structural interventions.",

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
          "Execution capacity must improve materially.",
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

const decisionCycle =
  runExecutiveDecisionCycle({
    executiveDecision,
    runtime:
      benchmarkRuntime,
    completedAt:
      NOW,
  });

const checks: Check[] = [];

const beforeSnapshot =
  JSON.stringify(
    decisionCycle,
  );

const originalHash =
  buildExecutiveDecisionCycleIntegrityKey(
    decisionCycle,
  );

const repeatedHash =
  buildExecutiveDecisionCycleIntegrityKey(
    decisionCycle,
  );

checks.push({
  name:
    "Repeated hashing is deterministic",

  passed:
    originalHash ===
    repeatedHash,

  detail:
    originalHash,
});

checks.push({
  name:
    "Integrity key is a SHA-256 hex digest",

  passed:
    /^[a-f0-9]{64}$/.test(
      originalHash,
    ),

  detail:
    `${originalHash.length} hexadecimal characters`,
});

const organizationChanged =
  cloneCycle(
    decisionCycle,
  );

organizationChanged
  .executiveDecision
  .organizationId =
  "different-organization";

assertHashChanged(
  checks,
  "Organization changes alter the key",
  originalHash,
  organizationChanged,
);

const constraintChanged =
  cloneCycle(
    decisionCycle,
  );

constraintChanged
  .executiveDecision
  .constraints
  .push({
    type:
      "time",

    description:
      "Complete implementation immediately.",

    required:
      true,
  });

assertHashChanged(
  checks,
  "Constraint changes alter the key",
  originalHash,
  constraintChanged,
);

const assumptionChanged =
  cloneCycle(
    decisionCycle,
  );

assumptionChanged
  .executiveDecision
  .assumptions
  .push(
    "A new executive assumption has been introduced.",
  );

assertHashChanged(
  checks,
  "Assumption changes alter the key",
  originalHash,
  assumptionChanged,
);

const optionChanged =
  cloneCycle(
    decisionCycle,
  );

const firstOption =
  optionChanged
    .generatedOptions[0];

if (!firstOption) {
  throw new Error(
    "Integrity benchmark requires at least one generated option.",
  );
}

firstOption.title =
  `${firstOption.title} — modified`;

assertHashChanged(
  checks,
  "Generated option changes alter the key",
  originalHash,
  optionChanged,
);

const recommendationChanged =
  cloneCycle(
    decisionCycle,
  );

recommendationChanged
  .recommendation
  .status =
  recommendationChanged
    .recommendation
    .status ===
    "proceed"
    ? "investigate-further"
    : "proceed";

assertHashChanged(
  checks,
  "Recommendation changes alter the key",
  originalHash,
  recommendationChanged,
);

const confidenceChanged =
  cloneCycle(
    decisionCycle,
  );

confidenceChanged
  .confidenceCalibration
  .calibratedConfidence =
  Math.max(
    0,
    Math.min(
      1,
      confidenceChanged
        .confidenceCalibration
        .calibratedConfidence -
        0.1,
    ),
  );

assertHashChanged(
  checks,
  "Confidence changes alter the key",
  originalHash,
  confidenceChanged,
);

const timestampChanged =
  cloneCycle(
    decisionCycle,
  );

timestampChanged.completedAt =
  "2026-07-17T18:00:01.000Z";

assertHashChanged(
  checks,
  "Completion timestamp changes alter the key",
  originalHash,
  timestampChanged,
);

const reorderedCycle =
  reverseObjectKeyOrder(
    decisionCycle,
  ) as ExecutiveDecisionCycle;

const reorderedHash =
  buildExecutiveDecisionCycleIntegrityKey(
    reorderedCycle,
  );

checks.push({
  name:
    "Object property order does not alter the key",

  passed:
    reorderedHash ===
    originalHash,

  detail:
    `${originalHash.slice(0, 12)} = ${reorderedHash.slice(0, 12)}`,
});

const rankingChanged =
  cloneCycle(
    decisionCycle,
  );

rankingChanged.rankedScenarios =
  [
    ...rankingChanged
      .rankedScenarios,
  ].reverse();

const rankingHash =
  buildExecutiveDecisionCycleIntegrityKey(
    rankingChanged,
  );

const hasMultipleRankedScenarios =
  decisionCycle
    .rankedScenarios
    .length >
  1;

checks.push({
  name:
    "Semantically meaningful array order alters the key",

  passed:
    hasMultipleRankedScenarios
      ? rankingHash !==
        originalHash
      : true,

  detail:
    hasMultipleRankedScenarios
      ? `${originalHash.slice(0, 12)} → ${rankingHash.slice(0, 12)}`
      : "Skipped: only one ranked scenario was produced.",
});

const afterSnapshot =
  JSON.stringify(
    decisionCycle,
  );

checks.push({
  name:
    "Integrity-key generation does not mutate the cycle",

  passed:
    beforeSnapshot ===
    afterSnapshot,

  detail:
    beforeSnapshot ===
      afterSnapshot
      ? "Decision cycle unchanged."
      : "Decision cycle was mutated.",
});

const passed =
  checks.filter(
    (check) =>
      check.passed,
  ).length;

const failed =
  checks.length -
  passed;

console.log("Assertions");
console.log("------------------------------------------");

for (const check of checks) {
  console.log(
    `${check.passed ? "PASS" : "FAIL"}  ${check.name}`,
  );

  console.log(
    `      ${check.detail}`,
  );
}

console.log("");
console.log("------------------------------------------");
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
