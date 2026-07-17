import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  runExecutiveDecisionCycle,
} from "../../v3/decisions/runExecutiveDecisionCycle";

import {
  recordExecutiveDecision,
} from "../../v3/decisions/recordExecutiveDecision";

import {
  saveExecutiveDecisionRecord,
} from "../../v3/decisions/saveExecutiveDecisionRecord";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import type {
  OrganizationalUncertainty,
} from "../../v3/model/epistemic/organizationalUncertainty";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const NOW =
  "2026-07-16T20:00:00.000Z";

const REVIEW_AT =
  "2026-10-16T20:00:00.000Z";

type Check = {
  name: string;
  passed: boolean;
  detail: string;
};

console.log("");
console.log("==========================================");
console.log("DISCOVERY EXECUTIVE DECISION RECORDING");
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

    /**
     * Backward-compatible normalization for persisted benchmark
     * runtimes created before Executive Decision Recording existed.
     */
    executiveDecisionRecords:
      runtime.memory
        .executiveDecisionRecords ??
      [],
  },
};

const executiveDecision: ExecutiveDecision = {
  id:
    "executive-decision-recording-demo",

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

const cycle =
  runExecutiveDecisionCycle({
    executiveDecision,

    runtime:
      benchmarkRuntime,

    completedAt:
      NOW,
  });

const recommendedOptionId =
  cycle.recommendation
    .recommendedInterventionId;

if (!recommendedOptionId) {
  throw new Error(
    "Executive Decision Recording Experiment requires a recommended intervention option.",
  );
}

const recommendedEvaluation =
  cycle.evaluatedOptions.find(
    (evaluation) =>
      evaluation.intervention.id ===
      recommendedOptionId,
  );

if (!recommendedEvaluation) {
  throw new Error(
    "The recommended intervention was not found in the evaluated options.",
  );
}

const selectedOption =
  recommendedEvaluation.option;

const selectedOptionId =
  selectedOption.id;

const runtimeSnapshotBeforeSave =
  JSON.stringify(
    benchmarkRuntime,
  );

const record =
  recordExecutiveDecision({
    decisionCycle:
      cycle,

      submissionId:
       "executive-decision-recording-experiment-001",

    selectedOptionId,

    disposition:
      "accepted-recommendation",

    decision:
      `Authorize ${selectedOption.title}.`,

    rationale:
      "The selected strategy produced the strongest simulated organizational outcome while satisfying all required executive constraints.",

    acceptedAssumptions:
      selectedOption.assumptions,

    acceptedRisks:
      selectedOption.risks,

    executiveConfidenceAtDecision:
      0.86,

    owner:
      "Chief Operating Officer",

    decisionMaker:
      "Executive Leadership Team",

    reviewAt:
      REVIEW_AT,

    decidedAt:
      NOW,
  });

const updatedRuntime =
  saveExecutiveDecisionRecord({
    runtime:
      benchmarkRuntime,

    record,
  });

const runtimeSnapshotAfterSave =
  JSON.stringify(
    benchmarkRuntime,
  );

const persistedRecord =
  updatedRuntime.memory
    .executiveDecisionRecords
    .find(
      (candidate) =>
        candidate.id ===
        record.id,
    );

const checks: Check[] = [
  {
    name:
      "Executive Decision Cycle completed",

    passed:
      cycle.recommendation
        .recommendedInterventionId ===
      recommendedOptionId,

    detail:
      recommendedOptionId,
  },

  {
    name:
      "Selected option exists in the cycle",

    passed:
      cycle.generatedOptions.some(
        (option) =>
          option.id ===
          record.selectedOptionId,
      ),

    detail:
      record.selectedOptionId ??
      "none",
  },

  {
    name:
      "Discovery recommendation preserved",

    passed:
      record.recommendedOptionId ===
      selectedOptionId,

    detail:
      record.recommendedOptionId ??
      "none",
  },

  {
    name:
      "Executive accepted the recommendation",

    passed:
      record.disposition ===
      "accepted-recommendation",

    detail:
      record.disposition,
  },

  {
    name:
      "Selected strategy matches recommendation",

    passed:
      record.selectedOptionId ===
      record.recommendedOptionId,

    detail:
      record.selectedOptionId ??
      "none",
  },

  {
    name:
      "Decision status recorded",

    passed:
      record.status ===
      "decided",

    detail:
      record.status,
  },

  {
    name:
      "Executive confidence preserved",

    passed:
      record
        .executiveConfidenceAtDecision ===
      0.86,

    detail:
      `${Math.round(
        (
          record
            .executiveConfidenceAtDecision ??
          0
        ) * 100,
      )}%`,
  },

  {
    name:
      "Discovery confidence preserved",

    passed:
      record
        .discoveryConfidenceAtDecision ===
      cycle.confidenceCalibration
        .calibratedConfidence,

    detail:
      `${Math.round(
        (
          record
            .discoveryConfidenceAtDecision ??
          0
        ) * 100,
      )}%`,
  },

  {
    name:
      "Expected outcomes populated",

    passed:
      record.expectedOutcomes.length >
      0,

    detail:
      `${record.expectedOutcomes.length} expected outcome(s)`,
  },

  {
    name:
      "Success criteria populated",

    passed:
      record.successCriteria.length >
      0,

    detail:
      `${record.successCriteria.length} success criterion or criteria`,
  },

  {
    name:
      "Decision review date recorded",

    passed:
      record.reviewAt ===
      REVIEW_AT,

    detail:
      record.reviewAt ??
      "none",
  },

  {
    name:
      "Original runtime remained unchanged",

    passed:
      runtimeSnapshotBeforeSave ===
      runtimeSnapshotAfterSave,

    detail:
      runtimeSnapshotBeforeSave ===
      runtimeSnapshotAfterSave
        ? "Runtime not mutated."
        : "Runtime changed.",
  },

  {
    name:
      "Updated runtime is a new object",

    passed:
      updatedRuntime !==
      benchmarkRuntime,

    detail:
      updatedRuntime !==
      benchmarkRuntime
        ? "A new runtime object was returned."
        : "The original runtime object was reused.",
  },

  {
    name:
      "Decision record persisted",

    passed:
      Boolean(
        persistedRecord,
      ),

    detail:
      persistedRecord?.id ??
      "Record not found.",
  },

  {
    name:
      "Exactly one decision record added",

    passed:
      updatedRuntime.memory
        .executiveDecisionRecords
        .length ===
      benchmarkRuntime.memory
        .executiveDecisionRecords
        .length +
        1,

    detail:
      `${benchmarkRuntime.memory.executiveDecisionRecords.length} → ${updatedRuntime.memory.executiveDecisionRecords.length}`,
  },

  {
    name:
      "Persisted record matches produced record",

    passed:
      JSON.stringify(
        persistedRecord,
      ) ===
      JSON.stringify(
        record,
      ),

    detail:
      persistedRecord?.id ??
      "Record not found.",
  },

  {
    name:
      "Runtime organization remains consistent",

    passed:
      updatedRuntime.metadata
        .organizationId ===
      record.organizationId,

    detail:
      updatedRuntime.metadata
        .organizationId,
  },

  {
    name:
      "Runtime update timestamp advanced",

    passed:
      updatedRuntime.metadata
        .updatedAt ===
      record.updatedAt,

    detail:
      updatedRuntime.metadata
        .updatedAt,
  },

  {
    name:
      "Decision remains unreviewed",

    passed:
      record.outcomeStatus ===
      "not-reviewed",

    detail:
      record.outcomeStatus,
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

console.log("Decision");
console.log("------------------------------");
console.log(
  `Recommendation: ${selectedOption.title}`,
);
console.log(
  `Disposition: ${record.disposition}`,
);
console.log(
  `Decision: ${record.decision}`,
);
console.log(
  `Review At: ${record.reviewAt}`,
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
