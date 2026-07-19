/**
 * Executive Learning Calibration Benchmark 001
 *
 * Validates that Discovery learns appropriately from successful,
 * unsuccessful, partially successful, and inconclusive executive work.
 *
 * This benchmark evaluates learning calibration rather than lifecycle
 * completeness.
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

import {
  runExecutiveLearningScenario,
} from "./runExecutiveLearningScenario";

import type {
  ExecutiveLearningScenarioResult,
} from "./runExecutiveLearningScenario";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const NOW =
  "2026-07-19T18:00:00.000Z";

const REVIEW_AT =
  "2026-10-19T18:00:00.000Z";

const SUBMISSION_ID =
  "executive-learning-calibration-benchmark-001";

type Assertion = {
  name: string;
  passed: boolean;
  detail: string;
};

type ScenarioScore = {
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
  length = 60,
): void {
  console.log(
    character.repeat(
      length,
    ),
  );
}

function printScenario(
  result:
    ExecutiveLearningScenarioResult,
): void {
  console.log(
    result.name,
  );

  console.log(
    `  Review status .............. ${result.review.status}`,
  );

  console.log(
    `  Confidence adjustment ...... ${result.learning.confidenceAdjustment}`,
  );

  console.log(
    `  Durable knowledge items .... ${result.learning.organizationalKnowledge.length}`,
  );

  console.log(
    `  Recommendation changes ..... ${result.learning.futureRecommendationChanges.length}`,
  );

  console.log(
    `  Typed belief updates ....... ${result.improvement.beliefUpdates.length}`,
  );

  console.log(
    `  Improvement applied ........ ${result.improvementApplied}`,
  );

  console.log(
    `  Canonical beliefs .......... ${result.canonicalBeliefCountBefore} → ${result.canonicalBeliefCountAfter}`,
  );

  console.log("");
}

console.log("");
printRule("=");
console.log(
  "DISCOVERY EXECUTIVE LEARNING CALIBRATION BENCHMARK",
);
console.log(
  "Benchmark 001",
);
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

    executiveWork:
      runtime.memory
        .executiveWork ??
      [],

    executiveReviews:
      runtime.memory
        .executiveReviews ??
      [],

    executiveLearning:
      runtime.memory
        .executiveLearning ??
      [],

    operatingModelImprovements:
      runtime.memory
        .operatingModelImprovements ??
      [],
  },
};

if (
  !benchmarkRuntime.memory
    .organizationalMemory
) {
  throw new Error(
    "Executive Learning Calibration Benchmark requires initialized canonical Organizational Memory.",
  );
}

const executiveDecision:
  ExecutiveDecision = {
    id:
      "executive-learning-calibration-benchmark-001-decision",

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

const cycle =
  runExecutiveDecisionCycle({
    executiveDecision,

    runtime:
      benchmarkRuntime,

    completedAt:
      NOW,
  });

const recommendedOptionId =
  requireValue(
    cycle.recommendation
      .recommendedInterventionId,

    "Executive Learning Calibration Benchmark requires a recommended intervention.",
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

const decisionRuntime =
  saveExecutiveDecisionRecord({
    runtime:
      benchmarkRuntime,

    record,
  });

const executiveWork =
  createExecutiveWork({
    decisionRecord:
      record,

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
    "Executive Learning Calibration Benchmark requires at least one expected outcome.",
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

const inconclusivePattern =
  Array<boolean | null>(
    outcomeCount,
  ).fill(
    null,
  );

const partiallySuccessfulPattern:
  Array<boolean | null> =
    Array.from(
      {
        length:
          outcomeCount,
      },
      (
        _,
        index,
      ) => {
        if (
          index ===
          outcomeCount -
            1
        ) {
          return null;
        }

        return index %
          2 ===
          0;
      },
    );

const successful =
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
      REVIEW_AT,
  });

const unsuccessful =
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
      REVIEW_AT,
  });

const partiallySuccessful =
  runExecutiveLearningScenario({
    name:
      "partially-successful",

    runtime:
      workRuntime,

    work:
      executiveWork,

    achievedPattern:
      partiallySuccessfulPattern,

    reviewedAt:
      REVIEW_AT,
  });

const inconclusive =
  runExecutiveLearningScenario({
    name:
      "inconclusive",

    runtime:
      workRuntime,

    work:
      executiveWork,

    achievedPattern:
      inconclusivePattern,

    reviewedAt:
      REVIEW_AT,
  });

const resolvedPartialOutcomeCount =
  partiallySuccessful
    .observedOutcomes
    .filter(
      (outcome) =>
        outcome.achieved !==
        null,
    )
    .length;

const successfulBeliefsAdded =
  successful
    .canonicalBeliefCountAfter -
  successful
    .canonicalBeliefCountBefore;

const unsuccessfulBeliefsAdded =
  unsuccessful
    .canonicalBeliefCountAfter -
  unsuccessful
    .canonicalBeliefCountBefore;

const partialBeliefsAdded =
  partiallySuccessful
    .canonicalBeliefCountAfter -
  partiallySuccessful
    .canonicalBeliefCountBefore;

const inconclusiveBeliefsAdded =
  inconclusive
    .canonicalBeliefCountAfter -
  inconclusive
    .canonicalBeliefCountBefore;

const assertions:
  Assertion[] = [
    {
      name:
        "Successful review resolves correctly",

      passed:
        successful.review.status ===
        "successful",

      detail:
        successful.review.status,
    },

    {
      name:
        "Successful review strengthens confidence",

      passed:
        successful.learning
          .confidenceAdjustment >
        0,

      detail:
        `${successful.learning.confidenceAdjustment}`,
    },

    {
      name:
        "Successful review creates durable knowledge",

      passed:
        successful.learning
          .organizationalKnowledge
          .length ===
        outcomeCount,

      detail:
        `${successful.learning.organizationalKnowledge.length} of ${outcomeCount} outcome(s) became durable knowledge`,
    },

    {
      name:
        "Successful review creates and applies typed beliefs",

      passed:
        successful.improvement
          .beliefUpdates
          .length ===
          outcomeCount &&
        successfulBeliefsAdded ===
          outcomeCount &&
        successful.improvementApplied,

      detail:
        `${successful.improvement.beliefUpdates.length} update(s), ${successfulBeliefsAdded} belief(s) added`,
    },

    {
      name:
        "Unsuccessful review resolves correctly",

      passed:
        unsuccessful.review.status ===
        "unsuccessful",

      detail:
        unsuccessful.review.status,
    },

    {
      name:
        "Unsuccessful review weakens confidence",

      passed:
        unsuccessful.learning
          .confidenceAdjustment <
        0,

      detail:
        `${unsuccessful.learning.confidenceAdjustment}`,
    },

    {
      name:
        "Unsuccessful review creates cautionary knowledge",

      passed:
        unsuccessful.learning
          .organizationalKnowledge
          .length ===
          outcomeCount &&
        unsuccessful.learning
          .organizationalKnowledge
          .every(
            (knowledge) =>
              knowledge.includes(
                "was not achieved",
              ),
          ),

      detail:
        `${unsuccessful.learning.organizationalKnowledge.length} cautionary knowledge item(s)`,
    },

    {
      name:
        "Unsuccessful review creates and applies typed beliefs",

      passed:
        unsuccessful.improvement
          .beliefUpdates
          .length ===
          outcomeCount &&
        unsuccessfulBeliefsAdded ===
          outcomeCount &&
        unsuccessful.improvementApplied,

      detail:
        `${unsuccessful.improvement.beliefUpdates.length} update(s), ${unsuccessfulBeliefsAdded} belief(s) added`,
    },

    {
      name:
        "Partially successful review resolves correctly",

      passed:
        partiallySuccessful.review
          .status ===
        "partially-successful",

      detail:
        partiallySuccessful.review
          .status,
    },

    {
      name:
        "Partially successful review creates knowledge only from resolved outcomes",

      passed:
        partiallySuccessful.learning
          .organizationalKnowledge
          .length ===
        resolvedPartialOutcomeCount,

      detail:
        `${partiallySuccessful.learning.organizationalKnowledge.length} durable knowledge item(s) from ${resolvedPartialOutcomeCount} resolved outcome(s)`,
    },

    {
      name:
        "Partially successful review creates mixed recommendation changes",

      passed:
        partiallySuccessful.learning
          .futureRecommendationChanges
          .some(
            (change) =>
              change.includes(
                "increase confidence",
              ),
          ) &&
        partiallySuccessful.learning
          .futureRecommendationChanges
          .some(
            (change) =>
              change.includes(
                "reduce confidence",
              ),
          ) &&
        partiallySuccessful.learning
          .futureRecommendationChanges
          .some(
            (change) =>
              change.includes(
                "additional evidence",
              ),
          ),

      detail:
        `${partiallySuccessful.learning.futureRecommendationChanges.length} mixed recommendation change(s)`,
    },

    {
      name:
        "Partially successful review applies only resolved beliefs",

      passed:
        partiallySuccessful
          .improvement
          .beliefUpdates
          .length ===
          resolvedPartialOutcomeCount &&
        partialBeliefsAdded ===
          resolvedPartialOutcomeCount &&
        partiallySuccessful
          .improvementApplied,

      detail:
        `${partiallySuccessful.improvement.beliefUpdates.length} update(s), ${partialBeliefsAdded} belief(s) added`,
    },

    {
      name:
        "Inconclusive review resolves correctly",

      passed:
        inconclusive.review.status ===
        "inconclusive",

      detail:
        inconclusive.review.status,
    },

    {
      name:
        "Inconclusive review preserves neutral confidence",

      passed:
        inconclusive.learning
          .confidenceAdjustment ===
        0,

      detail:
        `${inconclusive.learning.confidenceAdjustment}`,
    },

    {
      name:
        "Inconclusive review creates no durable knowledge",

      passed:
        inconclusive.learning
          .organizationalKnowledge
          .length ===
        0,

      detail:
        `${inconclusive.learning.organizationalKnowledge.length} durable knowledge item(s)`,
    },

    {
      name:
        "Inconclusive review creates no typed belief updates",

      passed:
        inconclusive.improvement
          .beliefUpdates
          .length ===
          0 &&
        inconclusiveBeliefsAdded ===
          0 &&
        !inconclusive
          .improvementApplied,

      detail:
        `${inconclusive.improvement.beliefUpdates.length} update(s), ${inconclusiveBeliefsAdded} belief(s) added`,
    },

    {
      name:
        "Inconclusive review requests additional evidence",

      passed:
        inconclusive.learning
          .futureRecommendationChanges
          .some(
            (change) =>
              change.includes(
                "additional evidence",
              ),
          ),

      detail:
        inconclusive.learning
          .futureRecommendationChanges
          .join(
            " | ",
          ),
    },

    {
      name:
        "Inconclusive improvement remains proposed",

      passed:
        inconclusive.improvement
          .status ===
          "proposed" &&
        inconclusive.finalRuntime
          .memory
          .operatingModelImprovements
          .find(
            (candidate) =>
              candidate.id ===
              inconclusive
                .improvement
                .id,
          )
          ?.status ===
          "proposed",

      detail:
        `Applied: ${inconclusive.improvementApplied}`,
    },

    {
      name:
        "Belief updates equal durable knowledge count in every scenario",

      passed:
        [
          successful,
          unsuccessful,
          partiallySuccessful,
          inconclusive,
        ].every(
          (scenario) =>
            scenario.improvement
              .beliefUpdates
              .length ===
            scenario.learning
              .organizationalKnowledge
              .length,
        ),

      detail:
        [
          successful,
          unsuccessful,
          partiallySuccessful,
          inconclusive,
        ]
          .map(
            (scenario) =>
              `${scenario.name}: ${scenario.improvement.beliefUpdates.length}/${scenario.learning.organizationalKnowledge.length}`,
          )
          .join(
            ", ",
          ),
    },

    {
      name:
        "Lifecycle ancestry is preserved in every typed belief update",

      passed:
        [
          successful,
          unsuccessful,
          partiallySuccessful,
          inconclusive,
        ].every(
          (scenario) =>
            scenario.improvement
              .beliefUpdates
              .every(
                (update) =>
                  update
                    .executiveLearningId ===
                    scenario.learning.id &&
                  update
                    .executiveReviewId ===
                    scenario.review.id &&
                  update
                    .executiveWorkId ===
                    scenario.completedWork.id &&
                  update
                    .decisionRecordId ===
                    record.id,
              ),
        ),

      detail:
        "Decision → Work → Review → Learning → Belief ancestry checked for all scenarios.",
    },

    {
      name:
        "Every applied typed belief reaches canonical Organizational Memory",

      passed:
        [
          successful,
          unsuccessful,
          partiallySuccessful,
        ].every(
          (scenario) =>
            scenario.improvement
              .beliefUpdates
              .every(
                (update) =>
                  scenario.finalRuntime
                    .memory
                    .organizationalMemory
                    ?.beliefs
                    .some(
                      (belief) =>
                        belief.id ===
                        update.beliefId,
                    ) ??
                  false,
              ),
        ),

      detail:
        `${successfulBeliefsAdded + unsuccessfulBeliefsAdded + partialBeliefsAdded} applied belief(s) validated`,
    },
  ];

const scenarioScores:
  ScenarioScore[] = [
    {
      name:
        "Successful",

      passed:
        assertions
          .slice(
            0,
            4,
          )
          .every(
            (assertion) =>
              assertion.passed,
          ),

      detail:
        "Positive outcomes strengthen confidence and create typed beliefs.",
    },

    {
      name:
        "Unsuccessful",

      passed:
        assertions
          .slice(
            4,
            8,
          )
          .every(
            (assertion) =>
              assertion.passed,
          ),

      detail:
        "Failed outcomes weaken confidence and create cautionary beliefs.",
    },

    {
      name:
        "Partially Successful",

      passed:
        assertions
          .slice(
            8,
            12,
          )
          .every(
            (assertion) =>
              assertion.passed,
          ),

      detail:
        "Mixed outcomes create only resolved knowledge and mixed recommendation changes.",
    },

    {
      name:
        "Inconclusive",

      passed:
        assertions
          .slice(
            12,
            18,
          )
          .every(
            (assertion) =>
              assertion.passed,
          ),

      detail:
        "Unresolved outcomes preserve uncertainty and create no durable beliefs.",
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

const passedScenarios =
  scenarioScores.filter(
    (scenario) =>
      scenario.passed,
  ).length;

const calibrationScore =
  Math.round(
    (
      passedScenarios /
      scenarioScores.length
    ) *
      100,
  );

console.log(
  "Scenario Results",
);
printRule();

printScenario(
  successful,
);

printScenario(
  unsuccessful,
);

printScenario(
  partiallySuccessful,
);

printScenario(
  inconclusive,
);

console.log(
  "Calibration Scorecard",
);
printRule();

for (
  const scenario of
  scenarioScores
) {
  console.log(
    `${scenario.name.padEnd(27, ".")} ${
      scenario.passed
        ? "PASS"
        : "FAIL"
    }`,
  );

  console.log(
    `  ${scenario.detail}`,
  );
}

console.log("");

console.log(
  "Calibration Assertions",
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
  "Calibration Summary",
);
printRule();

console.log(
  `Scenarios passed ............. ${passedScenarios} / ${scenarioScores.length}`,
);

console.log(
  `Calibration score ............ ${calibrationScore}%`,
);

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
    "Discovery calibrated Executive Learning correctly across successful, unsuccessful, partially successful, and inconclusive outcomes.",
  );
} else {
  console.log(
    "Discovery did not calibrate Executive Learning correctly across every tested outcome pattern.",
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
