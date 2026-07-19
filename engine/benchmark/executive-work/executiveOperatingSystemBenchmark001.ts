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
  "2026-07-19T18:00:00.000Z";

const REVIEW_AT =
  "2026-10-19T18:00:00.000Z";

const SUBMISSION_ID =
  "executive-operating-system-benchmark-001";

type LifecycleStatus =
  | "PASS"
  | "PARTIAL"
  | "MISSING";

type LifecycleStage =
  | "Idea"
  | "Understand"
  | "Recommend"
  | "Challenge"
  | "Simulate"
  | "Commit"
  | "Track"
  | "Review"
  | "Learn"
  | "Operating Model Improves";

type LifecycleCheck = {
  stage: LifecycleStage;
  status: LifecycleStatus;
  detail: string;
  evidence: string[];
};

type Assertion = {
  name: string;
  passed: boolean;
  detail: string;
};

function requireValue<T>(
  value: T | null | undefined,
  message: string,
): T {
  if (value === null || value === undefined) {
    throw new Error(message);
  }

  return value;
}

function countStatus(
  checks: LifecycleCheck[],
  status: LifecycleStatus,
): number {
  return checks.filter(
    (check) => check.status === status,
  ).length;
}

function statusScore(
  status: LifecycleStatus,
): number {
  switch (status) {
    case "PASS":
      return 1;

    case "PARTIAL":
      return 0.5;

    case "MISSING":
      return 0;
  }
}

function findFirstUnsupportedStage(
  checks: LifecycleCheck[],
): LifecycleCheck | null {
  return (
    checks.find(
      (check) => check.status !== "PASS",
    ) ?? null
  );
}


function findFirstDifference(
  left: unknown,
  right: unknown,
  path = "cycle",
): string | null {
  if (Object.is(left, right)) return null;

  if (
    typeof left !== "object" ||
    left === null ||
    typeof right !== "object" ||
    right === null
  ) {
    return `${path}: ${JSON.stringify(left)} !== ${JSON.stringify(right)}`;
  }

  if (Array.isArray(left) !== Array.isArray(right)) {
    return `${path}: value types differ`;
  }

  if (Array.isArray(left) && Array.isArray(right)) {
    if (left.length !== right.length) {
      return `${path}.length: ${left.length} !== ${right.length}`;
    }

    for (let i = 0; i < left.length; i += 1) {
      const d = findFirstDifference(left[i], right[i], `${path}[${i}]`);
      if (d) return d;
    }

    return null;
  }

  const l = left as Record<string, unknown>;
  const r = right as Record<string, unknown>;
  const keys = Array.from(new Set([...Object.keys(l), ...Object.keys(r)])).sort();

  for (const key of keys) {
    if (!(key in l)) return `${path}.${key}: missing from first cycle`;
    if (!(key in r)) return `${path}.${key}: missing from second cycle`;

    const d = findFirstDifference(l[key], r[key], `${path}.${key}`);
    if (d) return d;
  }

  return null;
}

function printRule(
  character = "-",
  length = 52,
): void {
  console.log(
    character.repeat(length),
  );
}

function printLifecycleCheck(
  check: LifecycleCheck,
): void {
  const label =
    check.stage.padEnd(27, ".");

  console.log(
    `${label} ${check.status}`,
  );

  console.log(
    `  ${check.detail}`,
  );

  for (const evidence of check.evidence) {
    console.log(
      `  - ${evidence}`,
    );
  }

  console.log("");
}

console.log("");
printRule("=");
console.log(
  "DISCOVERY EXECUTIVE OPERATING SYSTEM BENCHMARK",
);
console.log("Benchmark 001");
printRule("=");
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
      "Evidence confirming whether structural interventions can improve execution capacity without increasing organizational risk.",
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
      "executive-operating-system-benchmark-001-decision",

    organizationId:
      ORGANIZATION_ID,

    type:
      "execution",

    title:
      "Improve Organizational Execution",

    objective:
      "Increase execution throughput without increasing organizational risk.",

    rationale:
      "Leadership wants to improve execution quality through structural intervention rather than additional staffing.",

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
          "Execution capacity must improve enough to create a material operating benefit.",
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

    openQuestions: [
      "Can execution improve without creating additional coordination burden?",
    ],

    confidence:
      0.8,

    createdAt:
      NOW,

    updatedAt:
      NOW,
  };

const runtimeSnapshotBeforeCycle =
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

const runtimeSnapshotAfterCycle =
  JSON.stringify(
    benchmarkRuntime,
  );

const deterministicCycle =
  runExecutiveDecisionCycle({
    executiveDecision,

    runtime:
      benchmarkRuntime,

    completedAt:
      NOW,
  });


const deterministicDifference =
  findFirstDifference(
    cycle,
    deterministicCycle,
  );

const recommendedOptionId =
  requireValue(
    cycle.recommendation
      .recommendedInterventionId,

    "Executive Operating System Benchmark requires a recommended intervention.",
  );

const recommendedEvaluation =
  requireValue(
    cycle.evaluatedOptions.find(
      (evaluation) =>
        evaluation.intervention.id ===
        recommendedOptionId,
    ),

    "The recommended intervention was not found in the evaluated options.",
  );

const selectedOption =
  recommendedEvaluation.option;

const record =
  recordExecutiveDecision({
    decisionCycle:
      cycle,

    submissionId:
      SUBMISSION_ID,

    selectedOptionId:
      selectedOption.id,

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

const runtimeSnapshotBeforeSave =
  JSON.stringify(
    benchmarkRuntime,
  );

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

const hasUnderstanding =
  benchmarkRuntime.memory
    .organizationalConditions
    .length > 0 &&
  benchmarkRuntime.memory
    .organizationalState !==
    null;

const hasRecommendation =
  Boolean(
    cycle.recommendation
      .recommendedInterventionId,
  ) &&
  cycle.rankedScenarios.length > 0;

const hasChallenge =
  cycle.decisionJustification
    .whyRecommended
    .length > 0 &&
  cycle.decisionJustification
    .decisiveAdvantages
    .length > 0 &&
  cycle.decisionJustification
    .evidenceThatCouldChangePreference
    .length > 0;

const hasSimulation =
  cycle.scenarios.length > 0 &&
  Boolean(
    cycle.executiveSimulation,
  ) &&
  Boolean(
    cycle.executiveSimulation
      .recommendedScenario,
  );

const hasCommitment =
  record.status === "decided" &&
  record.disposition ===
    "accepted-recommendation" &&
  Boolean(persistedRecord);

const hasTrackingFoundation =
  record.expectedOutcomes.length >
    0 &&
  record.successCriteria.length >
    0 &&
  Boolean(record.owner) &&
  Boolean(record.reviewAt);

const hasActiveExecutionTracking =
  record.status ===
    "in-progress" ||
  record.status ===
    "completed";

const hasReviewFoundation =
  Boolean(record.reviewAt) &&
  record.outcomeStatus ===
    "not-reviewed";

const hasCompletedReview =
  record.outcomeStatus !==
    "not-reviewed";

const hasLearningFoundation =
  updatedRuntime.memory
    .predictionEvaluations
    .length > 0 ||
  updatedRuntime.memory
    .organizationalUnderstandingState !==
    undefined;

const hasDecisionOutcomeLearning =
  hasCompletedReview &&
  updatedRuntime.memory
    .predictionEvaluations
    .length > 0;

const operatingModelChanged =
  JSON.stringify(
    updatedRuntime.organizationModel,
  ) !==
  JSON.stringify(
    benchmarkRuntime.organizationModel,
  );

const organizationalMemoryChanged =
  JSON.stringify(
    updatedRuntime.memory
      .organizationalMemory,
  ) !==
  JSON.stringify(
    benchmarkRuntime.memory
      .organizationalMemory,
  );

const lifecycleChecks:
  LifecycleCheck[] = [
    {
      stage:
        "Idea",

      status:
        executiveDecision.status ===
        "ready"
          ? "PASS"
          : "MISSING",

      detail:
        "An explicit Executive Decision provides the initial Executive Work item.",

      evidence: [
        `Decision ID: ${executiveDecision.id}`,
        `Objective: ${executiveDecision.objective}`,
        `${executiveDecision.constraints.length} executive constraint(s)`,
      ],
    },

    {
      stage:
        "Understand",

      status:
        hasUnderstanding
          ? "PASS"
          : "MISSING",

      detail:
        hasUnderstanding
          ? "The decision cycle consulted persisted organizational conditions and synthesized organizational state."
          : "The benchmark runtime did not contain the organizational cognition required for understanding.",

      evidence: [
        `${benchmarkRuntime.memory.organizationalConditions.length} organizational condition(s)`,
        benchmarkRuntime.memory
          .organizationalState
          ? "Organizational state available"
          : "Organizational state missing",
        benchmarkRuntime.memory
          .organizationalCausalModel
          ? "Organizational causal model available"
          : "Organizational causal model missing",
      ],
    },

    {
      stage:
        "Recommend",

      status:
        hasRecommendation
          ? "PASS"
          : "MISSING",

      detail:
        hasRecommendation
          ? "Discovery produced and ranked viable strategic options and selected one canonical recommendation."
          : "Discovery did not produce a canonical recommendation.",

      evidence: [
        `${cycle.generatedOptions.length} generated option(s)`,
        `${cycle.rankedScenarios.length} ranked scenario(s)`,
        `Recommended option: ${selectedOption.title}`,
      ],
    },

    {
      stage:
        "Challenge",

      status:
        hasChallenge
          ? "PASS"
          : "PARTIAL",

      detail:
        hasChallenge
          ? "Discovery explains why the recommendation won and exposes evidence that could change the conclusion."
          : "Some challenge and justification data exists, but the complete challenge contract was not satisfied.",

      evidence: [
        `${cycle.decisionJustification.whyRecommended.length} recommendation reason(s)`,
        `${cycle.decisionJustification.decisiveAdvantages.length} decisive advantage(s)`,
        `${cycle.decisionJustification.alternatives.length} alternative evaluation(s)`,
        `${cycle.decisionJustification.evidenceThatCouldChangePreference.length} change condition(s)`,
      ],
    },

    {
      stage:
        "Simulate",

      status:
        hasSimulation
          ? "PASS"
          : "MISSING",

      detail:
        hasSimulation
          ? "Every viable option was simulated and synthesized into the canonical Executive Simulation."
          : "The Executive Simulation was not completed.",

      evidence: [
        `${cycle.scenarios.length} completed scenario(s)`,
        `${cycle.comparisonSet.scenarioComparisons.length} comparison entry or entries`,
        `${
  1 +
  cycle.executiveSimulation
    .alternativeScenarios.length
} synthesized executive scenario(s)`,
      ],
    },

    {
      stage:
        "Commit",

      status:
        hasCommitment
          ? "PASS"
          : "MISSING",

      detail:
        hasCommitment
          ? "The executive accepted the recommendation and Discovery persisted the decision as durable organizational memory."
          : "The executive decision was not successfully persisted.",

      evidence: [
        `Disposition: ${record.disposition}`,
        `Decision status: ${record.status}`,
        `Decision owner: ${record.owner ?? "none"}`,
        `Persisted record: ${persistedRecord?.id ?? "not found"}`,
      ],
    },

    {
      stage:
        "Track",

      status:
        hasActiveExecutionTracking
          ? "PASS"
          : hasTrackingFoundation
            ? "PARTIAL"
            : "MISSING",

      detail:
        hasActiveExecutionTracking
          ? "The committed Executive Work item is actively tracking execution."
          : hasTrackingFoundation
            ? "The decision record contains expected outcomes, success criteria, ownership, and review timing, but no active execution-tracking update occurred."
            : "The decision record lacks the minimum data required for execution tracking.",

      evidence: [
        `${record.expectedOutcomes.length} expected outcome(s)`,
        `${record.successCriteria.length} success criterion or criteria`,
        `Lifecycle status: ${record.status}`,
        `Review date: ${record.reviewAt ?? "none"}`,
      ],
    },

    {
      stage:
        "Review",

      status:
        hasCompletedReview
          ? "PASS"
          : hasReviewFoundation
            ? "PARTIAL"
            : "MISSING",

      detail:
        hasCompletedReview
          ? "Observed outcomes were reviewed against the original decision."
          : hasReviewFoundation
            ? "A review is scheduled, but no observed outcome evaluation has occurred."
            : "No review lifecycle is available.",

      evidence: [
        `Review date: ${record.reviewAt ?? "none"}`,
        `Outcome status: ${record.outcomeStatus}`,
      ],
    },

    {
      stage:
        "Learn",

      status:
        hasDecisionOutcomeLearning
          ? "PASS"
          : hasLearningFoundation
            ? "PARTIAL"
            : "MISSING",

      detail:
        hasDecisionOutcomeLearning
          ? "Observed outcomes produced explicit learning that can influence future judgment."
          : hasLearningFoundation
            ? "Discovery has organizational learning infrastructure, but this decision has not yet produced outcome-based learning."
            : "No usable organizational learning pathway was detected.",

      evidence: [
        `${updatedRuntime.memory.predictionEvaluations.length} prediction evaluation(s)`,
        hasCompletedReview
          ? "Decision review completed"
          : "Decision review not completed",
        updatedRuntime.memory
          .organizationalUnderstandingState
          ? "Persistent organizational understanding available"
          : "Persistent organizational understanding missing",
      ],
    },

    {
      stage:
        "Operating Model Improves",

      status:
        operatingModelChanged ||
        organizationalMemoryChanged
          ? "PASS"
          : hasLearningFoundation
            ? "PARTIAL"
            : "MISSING",

      detail:
        operatingModelChanged ||
        organizationalMemoryChanged
          ? "The completed lifecycle changed persistent organizational cognition."
          : hasLearningFoundation
            ? "Discovery has persistent cognition capable of improvement, but this benchmark stops before reviewed outcomes update the Operating Model."
            : "No Operating Model improvement pathway was detected.",

      evidence: [
        operatingModelChanged
          ? "Organization Model changed"
          : "Organization Model unchanged",
        organizationalMemoryChanged
          ? "Organizational Memory changed"
          : "Organizational Memory unchanged",
        "Decision recording alone does not alter organizational cognition.",
      ],
    },
  ];

const assertions:
  Assertion[] = [
    {
      name:
        "Executive Decision Cycle is deterministic",

      passed:
        deterministicDifference === null,

      detail:
        deterministicDifference === null
          ? "Repeated runs produced identical decision cycles."
          : deterministicDifference,
    },

    {
      name:
        "Decision cycle does not mutate Runtime",

      passed:
        runtimeSnapshotBeforeCycle ===
        runtimeSnapshotAfterCycle,

      detail:
        runtimeSnapshotBeforeCycle ===
        runtimeSnapshotAfterCycle
          ? "Runtime remained unchanged."
          : "Runtime changed during decision-cycle execution.",
    },

    {
      name:
        "Decision save does not mutate original Runtime",

      passed:
        runtimeSnapshotBeforeSave ===
        runtimeSnapshotAfterSave,

      detail:
        runtimeSnapshotBeforeSave ===
        runtimeSnapshotAfterSave
          ? "Original Runtime remained unchanged."
          : "Original Runtime changed during decision persistence.",
    },

    {
      name:
        "Saved Runtime is a new object",

      passed:
        updatedRuntime !==
        benchmarkRuntime,

      detail:
        updatedRuntime !==
        benchmarkRuntime
          ? "A new Runtime object was returned."
          : "The original Runtime object was reused.",
    },

    {
      name:
        "Decision record persisted exactly once",

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
        JSON.stringify(record),

      detail:
        persistedRecord?.id ??
        "Record not found.",
    },

    {
      name:
        "Lifecycle preserves organization identity",

      passed:
        executiveDecision.organizationId ===
          cycle.executiveDecision
            .organizationId &&
        record.organizationId ===
          ORGANIZATION_ID &&
        updatedRuntime.metadata
          .organizationId ===
          ORGANIZATION_ID,

      detail:
        ORGANIZATION_ID,
    },

    {
      name:
        "Recommendation ancestry preserved through commitment",

      passed:
        record.recommendedOptionId ===
          selectedOption.id &&
        record.selectedOptionId ===
          selectedOption.id &&
        cycle.decisionJustification
          .recommendedOptionId ===
          selectedOption.id,

      detail:
        selectedOption.id,
    },

    {
      name:
        "Commitment preserves review foundation",

      passed:
        record.expectedOutcomes.length >
          0 &&
        record.successCriteria.length >
          0 &&
        record.reviewAt ===
          REVIEW_AT &&
        record.outcomeStatus ===
          "not-reviewed",

      detail:
        `${record.expectedOutcomes.length} expected outcome(s), ${record.successCriteria.length} success criterion or criteria, review ${record.reviewAt}`,
    },
  ];

const passedAssertions =
  assertions.filter(
    (assertion) =>
      assertion.passed,
  ).length;

const failedAssertions =
  assertions.length -
  passedAssertions;

const passedStages =
  countStatus(
    lifecycleChecks,
    "PASS",
  );

const partialStages =
  countStatus(
    lifecycleChecks,
    "PARTIAL",
  );

const missingStages =
  countStatus(
    lifecycleChecks,
    "MISSING",
  );

const weightedScore =
  lifecycleChecks.reduce(
    (total, check) =>
      total +
      statusScore(
        check.status,
      ),
    0,
  );

const completionPercentage =
  Math.round(
    (weightedScore /
      lifecycleChecks.length) *
      100,
  );

const firstUnsupportedStage =
  findFirstUnsupportedStage(
    lifecycleChecks,
  );

console.log(
  "Executive Work",
);
printRule();

console.log(
  `Title: ${executiveDecision.title}`,
);

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

console.log(
  "Lifecycle Scorecard",
);
printRule();

for (
  const lifecycleCheck of
  lifecycleChecks
) {
  printLifecycleCheck(
    lifecycleCheck,
  );
}

console.log(
  "Lifecycle Summary",
);
printRule();

console.log(
  `PASS stages ................. ${passedStages}`,
);

console.log(
  `PARTIAL stages .............. ${partialStages}`,
);

console.log(
  `MISSING stages .............. ${missingStages}`,
);

console.log(
  `Weighted completion ......... ${completionPercentage}%`,
);

console.log(
  `First unsupported stage ..... ${
    firstUnsupportedStage
      ?.stage ?? "None"
  }`,
);

console.log("");

console.log(
  "Benchmark Assertions",
);
printRule();

for (const assertion of assertions) {
  console.log(
    `${
      assertion.passed
        ? "PASS"
        : "FAIL"
    }  ${assertion.name}`,
  );

  console.log(
    `      ${assertion.detail}`,
  );
}

console.log("");

console.log(
  `Assertions passed: ${passedAssertions}`,
);

console.log(
  `Assertions failed: ${failedAssertions}`,
);

console.log("");

console.log(
  "Benchmark Conclusion",
);
printRule();

if (
  firstUnsupportedStage
) {
  console.log(
    `Discovery completes the Executive Work lifecycle through the stage immediately before ${firstUnsupportedStage.stage}.`,
  );

  console.log("");

  console.log(
    `The first incomplete stage is ${firstUnsupportedStage.stage}: ${firstUnsupportedStage.detail}`,
  );
} else {
  console.log(
    "Discovery completed the full Executive Work lifecycle.",
  );
}

console.log("");

console.log(
  "Recommended Next Product Work",
);
printRule();

console.log(
  "1. Preserve the existing canonical reasoning and commitment pipeline.",
);

console.log(
  "2. Extend the persisted Executive Decision Record into active execution tracking.",
);

console.log(
  "3. Compare expected outcomes with observed outcomes during executive review.",
);

console.log(
  "4. Convert reviewed outcomes into explicit organizational learning.",
);

console.log(
  "5. Apply that learning back to the Operating Model.",
);

console.log("");

if (failedAssertions > 0) {
  process.exitCode = 1;
}

console.log(
  "Benchmark Complete",
);

console.log("");
