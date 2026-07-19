/**
 * Executive Judgment Longitudinal Benchmark 001
 *
 * Validates that prior reviewed executive outcomes influence confidence
 * in a later decision involving the same strategy.
 *
 * Canonical path under test:
 *
 * Executive Decision
 * → Executive Work
 * → Executive Review
 * → Executive Learning
 * → Operating Model Improvement
 * → Persistent Belief
 * → Future Decision Confidence Calibration
 */

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

import {
  calibrateDecisionConfidence,
} from "../../v3/decisions/calibrateDecisionConfidence";

import {
  createExecutiveWork,
} from "../../v3/work/createExecutiveWork";

import {
  saveExecutiveWork,
} from "../../v3/work/saveExecutiveWork";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import type {
  OrganizationalUncertainty,
} from "../../v3/model/epistemic/organizationalUncertainty";

import type {
  OrganizationRuntime,
} from "../../v3/runtime/organizationRuntime";

import type {
  PersistentBelief,
} from "../../v3/understanding/types";

import type {
  RankedExecutiveScenario,
} from "../../v3/decisions/rankExecutiveScenarios";

import {
  runExecutiveLearningScenario,
} from "../executive-work/runExecutiveLearningScenario";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const NOW =
  "2026-07-19T18:00:00.000Z";

const SUCCESS_REVIEW_AT_1 =
  "2026-10-19T18:00:00.000Z";

const SUCCESS_REVIEW_AT_2 =
  "2027-01-19T18:00:00.000Z";

const FAILURE_REVIEW_AT =
  "2027-04-19T18:00:00.000Z";

const SUBMISSION_ID =
  "executive-judgment-longitudinal-benchmark-001";

const NEGATIVE_LIMITER =
  "Prior reviewed outcomes reduced confidence in the selected strategy.";

type Assertion = {
  name: string;
  passed: boolean;
  detail: string;
};

function requireValue<T>(
  value: T | null | undefined,
  message: string,
): T {
  if (
    value === null ||
    value === undefined
  ) {
    throw new Error(
      message,
    );
  }

  return value;
}

function printRule(
  character = "-",
  length = 68,
): void {
  console.log(
    character.repeat(
      length,
    ),
  );
}

function approximatelyEqual(
  left: number,
  right: number,
  tolerance = 0.000000001,
): boolean {
  return (
    Math.abs(
      left -
        right,
    ) <=
    tolerance
  );
}

function getCanonicalBeliefs(
  runtime: OrganizationRuntime,
): PersistentBelief[] {
  const organizationalMemory =
    runtime.memory
      .organizationalMemory;

  if (!organizationalMemory) {
    throw new Error(
      "Executive Judgment Longitudinal Benchmark requires initialized canonical Organizational Memory.",
    );
  }

  return organizationalMemory
    .beliefs;
}

function getNewBeliefs(
  before:
    OrganizationRuntime,

  after:
    OrganizationRuntime,
): PersistentBelief[] {
  const existingIds =
    new Set(
      getCanonicalBeliefs(
        before,
      ).map(
        (belief) =>
          belief.id,
      ),
    );

  return getCanonicalBeliefs(
    after,
  ).filter(
    (belief) =>
      !existingIds.has(
        belief.id,
      ),
  );
}

function withCanonicalBeliefs(
  runtime:
    OrganizationRuntime,

  beliefs:
    PersistentBelief[],
): OrganizationRuntime {
  const organizationalMemory =
    runtime.memory
      .organizationalMemory;

  if (!organizationalMemory) {
    throw new Error(
      "Cannot construct benchmark Runtime without canonical Organizational Memory.",
    );
  }

  return {
    ...runtime,

    memory: {
      ...runtime.memory,

      organizationalMemory: {
        ...organizationalMemory,

        beliefs: [
          ...organizationalMemory
            .beliefs,
          ...beliefs,
        ],
      },
    },
  };
}

console.log("");
printRule("=");
console.log(
  "DISCOVERY EXECUTIVE JUDGMENT LONGITUDINAL BENCHMARK",
);
console.log(
  "Benchmark 001",
);
printRule("=");
console.log("");

const loadedRuntime =
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

const benchmarkRuntime:
  OrganizationRuntime = {
    ...loadedRuntime,

    memory: {
      ...loadedRuntime.memory,

      organizationalUncertainty,

      executiveDecisionRecords:
        loadedRuntime.memory
          .executiveDecisionRecords ??
        [],

      executiveWork:
        loadedRuntime.memory
          .executiveWork ??
        [],

      executiveReviews:
        loadedRuntime.memory
          .executiveReviews ??
        [],

      executiveLearning:
        loadedRuntime.memory
          .executiveLearning ??
        [],

      operatingModelImprovements:
        loadedRuntime.memory
          .operatingModelImprovements ??
        [],
    },
  };

if (
  !benchmarkRuntime.memory
    .organizationalMemory
) {
  throw new Error(
    "Executive Judgment Longitudinal Benchmark requires initialized canonical Organizational Memory.",
  );
}

const executiveDecision:
  ExecutiveDecision = {
    id:
      "executive-judgment-longitudinal-benchmark-001-decision",

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

const decisionCycle =
  runExecutiveDecisionCycle({
    executiveDecision,

    runtime:
      benchmarkRuntime,

    completedAt:
      NOW,
  });

const winner =
  requireValue(
    decisionCycle
      .rankedScenarios[0],

    "Executive Judgment Longitudinal Benchmark requires a winning scenario.",
  );

const recommendedOptionId =
  requireValue(
    decisionCycle
      .recommendation
      .recommendedInterventionId,

    "Executive Judgment Longitudinal Benchmark requires a recommended intervention.",
  );

const recommendedEvaluation =
  requireValue(
    decisionCycle
      .evaluatedOptions
      .find(
        (evaluation) =>
          evaluation.intervention.id ===
          recommendedOptionId,
      ),

    "The recommended intervention was not found in the evaluated options.",
  );

const selectedOption =
  recommendedEvaluation.option;

if (
  winner.optionId !==
  selectedOption.id
) {
  throw new Error(
    `Benchmark setup mismatch: winning option ${winner.optionId} does not match selected option ${selectedOption.id}.`,
  );
}

const decisionRecord =
  recordExecutiveDecision({
    decisionCycle,

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
      SUCCESS_REVIEW_AT_1,

    decidedAt:
      NOW,
  });

const decisionRuntime =
  saveExecutiveDecisionRecord({
    runtime:
      benchmarkRuntime,

    record:
      decisionRecord,
  });

const executiveWork =
  createExecutiveWork({
    decisionRecord,

    createdAt:
      NOW,
  });

const workRuntime =
  saveExecutiveWork({
    runtime:
      decisionRuntime,

    work:
      executiveWork,
  });

const outcomeCount =
  executiveWork
    .expectedOutcomes
    .length;

if (
  outcomeCount ===
  0
) {
  throw new Error(
    "Executive Judgment Longitudinal Benchmark requires at least one expected outcome.",
  );
}

const successfulPattern =
  Array<boolean | null>(
    outcomeCount,
  ).fill(
    true,
  );

const unsuccessfulPattern =
  Array<boolean | null>(
    outcomeCount,
  ).fill(
    false,
  );

/**
 * Each lifecycle run uses the canonical producer chain.
 *
 * Different review timestamps create distinct Executive Review,
 * Executive Learning, Operating Model Improvement, and belief ancestry.
 */
const successfulLearning1 =
  runExecutiveLearningScenario({
    name:
      "successful",

    runtime:
      workRuntime,

    work:
      executiveWork,

    achievedPattern:
      successfulPattern,

    reviewedAt:
      SUCCESS_REVIEW_AT_1,
  });

const successfulLearning2 =
  runExecutiveLearningScenario({
    name:
      "successful",

    runtime:
      workRuntime,

    work:
      executiveWork,

    achievedPattern:
      successfulPattern,

    reviewedAt:
      SUCCESS_REVIEW_AT_2,
  });

const unsuccessfulLearning =
  runExecutiveLearningScenario({
    name:
      "unsuccessful",

    runtime:
      workRuntime,

    work:
      executiveWork,

    achievedPattern:
      unsuccessfulPattern,

    reviewedAt:
      FAILURE_REVIEW_AT,
  });

const successfulBeliefs1 =
  getNewBeliefs(
    workRuntime,
    successfulLearning1
      .finalRuntime,
  );

const successfulBeliefs2 =
  getNewBeliefs(
    workRuntime,
    successfulLearning2
      .finalRuntime,
  );

const unsuccessfulBeliefs =
  getNewBeliefs(
    workRuntime,
    unsuccessfulLearning
      .finalRuntime,
  );

const noHistoryCalibration =
  calibrateDecisionConfidence({
    winner,

    runtime:
      workRuntime,

    viabilityEvaluations:
      decisionCycle
        .viabilityEvaluations,
  });

const oneSuccessfulRuntime =
  withCanonicalBeliefs(
    workRuntime,
    successfulBeliefs1,
  );

const oneSuccessfulCalibration =
  calibrateDecisionConfidence({
    winner,

    runtime:
      oneSuccessfulRuntime,

    viabilityEvaluations:
      decisionCycle
        .viabilityEvaluations,
  });

const twoSuccessfulRuntime =
  withCanonicalBeliefs(
    workRuntime,
    [
      ...successfulBeliefs1,
      ...successfulBeliefs2,
    ],
  );

const twoSuccessfulCalibration =
  calibrateDecisionConfidence({
    winner,

    runtime:
      twoSuccessfulRuntime,

    viabilityEvaluations:
      decisionCycle
        .viabilityEvaluations,
  });

const unsuccessfulRuntime =
  withCanonicalBeliefs(
    workRuntime,
    unsuccessfulBeliefs,
  );

const unsuccessfulCalibration =
  calibrateDecisionConfidence({
    winner,

    runtime:
      unsuccessfulRuntime,

    viabilityEvaluations:
      decisionCycle
        .viabilityEvaluations,
  });

const mixedRuntime =
  withCanonicalBeliefs(
    workRuntime,
    [
      ...successfulBeliefs1,
      ...successfulBeliefs2,
      ...unsuccessfulBeliefs,
    ],
  );

const mixedCalibration =
  calibrateDecisionConfidence({
    winner,

    runtime:
      mixedRuntime,

    viabilityEvaluations:
      decisionCycle
        .viabilityEvaluations,
  });

const unrelatedWinner:
  RankedExecutiveScenario = {
    ...winner,

    optionId:
      "unrelated-strategy-option",
  };

const unrelatedCalibration =
  calibrateDecisionConfidence({
    winner:
      unrelatedWinner,

    runtime:
      mixedRuntime,

    viabilityEvaluations:
      decisionCycle
        .viabilityEvaluations,
  });

const repeatedMixedCalibration =
  calibrateDecisionConfidence({
    winner,

    runtime:
      mixedRuntime,

    viabilityEvaluations:
      decisionCycle
        .viabilityEvaluations,
  });

const expectedMixedAdjustment =
  (
    successfulLearning1
      .learning
      .confidenceAdjustment +
    successfulLearning2
      .learning
      .confidenceAdjustment +
    unsuccessfulLearning
      .learning
      .confidenceAdjustment
  ) /
  3 *
  0.05;

const clampedExpectedMixedAdjustment =
  Math.max(
    -0.05,
    Math.min(
      0.05,
      expectedMixedAdjustment,
    ),
  );

const assertions:
  Assertion[] = [
    {
      name:
        "No prior strategy history produces no longitudinal adjustment",

      passed:
        noHistoryCalibration
          .longitudinalStrategyAdjustment ===
          0 &&
        noHistoryCalibration
          .matchedExecutiveLearningCount ===
          0,

      detail:
        `adjustment=${noHistoryCalibration.longitudinalStrategyAdjustment}, matched learning=${noHistoryCalibration.matchedExecutiveLearningCount}`,
    },

    {
      name:
        "Successful prior strategy increases future confidence",

      passed:
        oneSuccessfulCalibration
          .longitudinalStrategyAdjustment >
          0 &&
        oneSuccessfulCalibration
          .calibratedConfidence >
          noHistoryCalibration
            .calibratedConfidence,

      detail:
        `base=${noHistoryCalibration.calibratedConfidence}, learned=${oneSuccessfulCalibration.calibratedConfidence}, adjustment=${oneSuccessfulCalibration.longitudinalStrategyAdjustment}`,
    },

    {
      name:
        "Multiple beliefs from one learning event are counted once",

      passed:
        successfulBeliefs1.length >
          1 &&
        oneSuccessfulCalibration
          .matchedExecutiveLearningCount ===
          1,

      detail:
        `${successfulBeliefs1.length} belief(s), ${oneSuccessfulCalibration.matchedExecutiveLearningCount} learning event counted`,
    },

    {
      name:
        "Two successful learning events are counted independently",

      passed:
        twoSuccessfulCalibration
          .matchedExecutiveLearningCount ===
          2,

      detail:
        `${twoSuccessfulCalibration.matchedExecutiveLearningCount} distinct learning event(s) counted`,
    },

    {
      name:
        "Equivalent successful outcomes average deterministically",

      passed:
        approximatelyEqual(
          twoSuccessfulCalibration
            .longitudinalStrategyAdjustment,
          oneSuccessfulCalibration
            .longitudinalStrategyAdjustment,
        ),

      detail:
        `one event=${oneSuccessfulCalibration.longitudinalStrategyAdjustment}, two equivalent events=${twoSuccessfulCalibration.longitudinalStrategyAdjustment}`,
    },

    {
      name:
        "Unsuccessful prior strategy decreases future confidence",

      passed:
        unsuccessfulCalibration
          .longitudinalStrategyAdjustment <
          0 &&
        unsuccessfulCalibration
          .calibratedConfidence <
          noHistoryCalibration
            .calibratedConfidence,

      detail:
        `base=${noHistoryCalibration.calibratedConfidence}, learned=${unsuccessfulCalibration.calibratedConfidence}, adjustment=${unsuccessfulCalibration.longitudinalStrategyAdjustment}`,
    },

    {
      name:
        "Negative prior outcomes add an explicit confidence limiter",

      passed:
        unsuccessfulCalibration
          .confidenceLimiters
          .includes(
            NEGATIVE_LIMITER,
          ),

      detail:
        unsuccessfulCalibration
          .confidenceLimiters
          .join(
            " | ",
          ),
    },

    {
      name:
        "Positive prior outcomes do not add the negative-history limiter",

      passed:
        !oneSuccessfulCalibration
          .confidenceLimiters
          .includes(
            NEGATIVE_LIMITER,
          ),

      detail:
        oneSuccessfulCalibration
          .confidenceLimiters
          .join(
            " | ",
          ),
    },

    {
      name:
        "Mixed strategy history averages distinct learning events",

      passed:
        mixedCalibration
          .matchedExecutiveLearningCount ===
          3 &&
        approximatelyEqual(
          mixedCalibration
            .longitudinalStrategyAdjustment,
          clampedExpectedMixedAdjustment,
        ),

      detail:
        `actual=${mixedCalibration.longitudinalStrategyAdjustment}, expected=${clampedExpectedMixedAdjustment}, learning events=${mixedCalibration.matchedExecutiveLearningCount}`,
    },

    {
      name:
        "Unrelated strategy history is ignored",

      passed:
        unrelatedCalibration
          .longitudinalStrategyAdjustment ===
          0 &&
        unrelatedCalibration
          .matchedExecutiveLearningCount ===
          0,

      detail:
        `adjustment=${unrelatedCalibration.longitudinalStrategyAdjustment}, matched learning=${unrelatedCalibration.matchedExecutiveLearningCount}`,
    },

    {
      name:
        "Longitudinal adjustment never exceeds the canonical cap",

      passed:
        Math.abs(
          oneSuccessfulCalibration
            .longitudinalStrategyAdjustment,
        ) <=
          0.05 &&
        Math.abs(
          twoSuccessfulCalibration
            .longitudinalStrategyAdjustment,
        ) <=
          0.05 &&
        Math.abs(
          unsuccessfulCalibration
            .longitudinalStrategyAdjustment,
        ) <=
          0.05 &&
        Math.abs(
          mixedCalibration
            .longitudinalStrategyAdjustment,
        ) <=
          0.05,

      detail:
        `positive=${oneSuccessfulCalibration.longitudinalStrategyAdjustment}, negative=${unsuccessfulCalibration.longitudinalStrategyAdjustment}, mixed=${mixedCalibration.longitudinalStrategyAdjustment}`,
    },

    {
      name:
        "Longitudinal confidence calibration is deterministic",

      passed:
        JSON.stringify(
          mixedCalibration,
        ) ===
        JSON.stringify(
          repeatedMixedCalibration,
        ),

      detail:
        "Repeated calibration against identical Runtime memory produced an identical result.",
    },

    {
      name:
        "Persistent beliefs preserve selected strategy ancestry",

      passed:
        [
          ...successfulBeliefs1,
          ...successfulBeliefs2,
          ...unsuccessfulBeliefs,
        ].every(
          (belief) =>
            belief.selectedOptionId ===
              winner.optionId &&
            typeof belief
              .executiveLearningId ===
              "string" &&
            typeof belief
              .executiveOutcomeConfidenceAdjustment ===
              "number",
        ),

      detail:
        `${successfulBeliefs1.length + successfulBeliefs2.length + unsuccessfulBeliefs.length} review-derived belief(s) preserve typed strategy ancestry`,
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

console.log(
  "Longitudinal Calibration Summary",
);
printRule();

console.log(
  `Selected strategy ............ ${winner.optionId}`,
);

console.log(
  `Baseline confidence .......... ${noHistoryCalibration.calibratedConfidence}`,
);

console.log(
  `Successful adjustment ........ ${oneSuccessfulCalibration.longitudinalStrategyAdjustment}`,
);

console.log(
  `Unsuccessful adjustment ...... ${unsuccessfulCalibration.longitudinalStrategyAdjustment}`,
);

console.log(
  `Mixed-history adjustment ..... ${mixedCalibration.longitudinalStrategyAdjustment}`,
);

console.log(
  `Matched mixed events ......... ${mixedCalibration.matchedExecutiveLearningCount}`,
);

console.log("");

console.log(
  "Benchmark Assertions",
);
printRule();

for (
  const assertion of
  assertions
) {
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
  `Assertions passed ............ ${passedAssertions}`,
);

console.log(
  `Assertions failed ............ ${failedAssertions}`,
);

console.log("");

console.log(
  "Benchmark Conclusion",
);
printRule();

if (
  failedAssertions ===
  0
) {
  console.log(
    "Discovery uses reviewed executive outcomes to calibrate confidence in future decisions involving the same strategy.",
  );
} else {
  console.log(
    "Discovery's longitudinal executive-judgment loop did not satisfy every required benchmark assertion.",
  );
}

console.log("");

if (
  failedAssertions >
  0
) {
  process.exitCode =
    1;
}

console.log(
  "Benchmark Complete",
);

console.log("");