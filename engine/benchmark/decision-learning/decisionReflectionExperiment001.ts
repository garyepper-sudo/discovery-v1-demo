import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  runExecutiveDecisionCycle,
} from "../../v3/decisions/runExecutiveDecisionCycle";

import {
  buildExecutiveDecisionOutcome,
} from "../../v3/decision-learning/buildExecutiveDecisionOutcome";

import {
  buildExecutiveDecisionReflection,
} from "../../v3/decision-learning/buildExecutiveDecisionReflection";

import {
  synthesizeOrganizationalState,
  type OrganizationalCondition,
} from "../../v3/model/state/inferOrganizationalConditions";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import type {
  OrganizationalPrediction,
} from "../../v3/model/predictions/organizationalPrediction";

import type {
  OrganizationalUncertainty,
} from "../../v3/model/epistemic/organizationalUncertainty";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const NOW =
  "2026-07-13T12:00:00.000Z";

const EVALUATED_AT =
  "2026-08-13T12:00:00.000Z";

const REFLECTED_AT =
  "2026-08-13T12:05:00.000Z";

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

function cloneCondition(
  condition:
    OrganizationalCondition,
): OrganizationalCondition {
  return {
    ...condition,

    supportingConceptIds: [
      ...condition
        .supportingConceptIds,
    ],

    supportingBeliefIds: [
      ...condition
        .supportingBeliefIds,
    ],

    supportingMechanismIds: [
      ...condition
        .supportingMechanismIds,
    ],

    supportingTheoryIds: [
      ...condition
        .supportingTheoryIds,
    ],

    upstreamConditionIds: [
      ...condition
        .upstreamConditionIds,
    ],

    downstreamConditionIds: [
      ...condition
        .downstreamConditionIds,
    ],

    confidenceLimiters: [
      ...condition
        .confidenceLimiters,
    ],

    missingEvidence: [
      ...condition
        .missingEvidence,
    ],
  };
}

function clonePrediction(
  prediction:
    OrganizationalPrediction,
): OrganizationalPrediction {
  return {
    ...prediction,

    sourceConditionIds: [
      ...prediction
        .sourceConditionIds,
    ],

    sourceConceptIds: [
      ...prediction
        .sourceConceptIds,
    ],

    sourceTheoryIds: [
      ...prediction
        .sourceTheoryIds,
    ],

    sourceBeliefIds: [
      ...prediction
        .sourceBeliefIds,
    ],

    predictedConditionChanges:
      prediction
        .predictedConditionChanges
        .map(
          (change) => ({
            ...change,
          }),
        ),

    causalPath: [
      ...prediction.causalPath,
    ],

    assumptions: [
      ...prediction.assumptions,
    ],

    confidenceLimiters: [
      ...prediction
        .confidenceLimiters,
    ],

    falsifyingEvidence: [
      ...prediction
        .falsifyingEvidence,
    ],
  };
}

console.log("");
console.log("==========================================");
console.log("DISCOVERY DECISION REFLECTION");
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

const executiveDecision:
  ExecutiveDecision = {
    id:
      "executive-decision-reflection-001",

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
      "implemented",

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
          0.78,

        target:
          0.74,

        unit:
          "constraint score",

        rationale:
          "Execution capacity should become less constrained after the intervention.",
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
    ],

    allowedInterventionTypes: [
      "governance",
      "policy",
      "strategy",
    ],

    assumptions: [
      "Reducing concurrent work will improve execution capacity.",
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

const winningRank =
  cycle.rankedScenarios[0];

const expectedScenario =
  cycle.scenarios.find(
    (scenario) =>
      scenario.intervention.id ===
      winningRank.interventionId,
  );

if (!expectedScenario) {
  throw new Error(
    "Winning Executive Scenario could not be found.",
  );
}

const observedConditions =
  expectedScenario
    .simulatedOrganizationState
    .projectedConditions
    .map(
      cloneCondition,
    );

const observedPredictions =
  expectedScenario
    .simulatedOrganizationState
    .projectedPredictions
    .map(
      (prediction) => ({
        ...clonePrediction(
          prediction,
        ),

        status:
          "confirmed" as const,

        lastEvaluatedAt:
          EVALUATED_AT,
      }),
    );

const observedOrganizationalState =
  synthesizeOrganizationalState({
    conditions:
      observedConditions,

    now:
      EVALUATED_AT,
  });

const intervention =
  expectedScenario.intervention;

const outcome =
  buildExecutiveDecisionOutcome({
    executiveDecision,

    intervention,

    expectedScenario,

    observedOrganizationalState,

    observedConditions,

    observedPredictions,

    executionStatus:
      "completed",

    assumptionEvaluations: [
      {
        assumption:
          "Reducing concurrent work will improve execution capacity.",

        status:
          "validated",

        explanation:
          "Observed execution capacity moved in the intended direction after implementation.",
      },

      ...intervention
        .assumptions
        .filter(
          (assumption) =>
            assumption !==
            "Reducing concurrent work will improve execution capacity.",
        )
        .map(
          (assumption) => ({
            assumption,

            status:
              "validated" as const,

            explanation:
              "The controlled experiment treats this intervention assumption as satisfied.",
          }),
        ),
    ],

    unexpectedEffects: [],

    evaluatedAt:
      EVALUATED_AT,
  });

const inputSnapshotBefore =
  JSON.stringify({
    outcome,
    expectedScenario,
  });

const reflection =
  buildExecutiveDecisionReflection({
    outcome,

    expectedScenario,

    createdAt:
      REFLECTED_AT,
  });

const inputSnapshotAfter =
  JSON.stringify({
    outcome,
    expectedScenario,
  });

const expectedMechanismIds =
  Array.from(
    new Set(
      [
        ...expectedScenario
          .intervention
          .expectedMechanismIds,

        ...expectedScenario
          .scenario
          .projectedUnderstandingCandidates
          .flatMap(
            (candidate) =>
              candidate.mechanismIds,
          ),
      ].filter(
        (id): id is string =>
          typeof id ===
            "string" &&
          id.trim().length > 0,
      ),
    ),
  );

const expectedTheoryIds =
  Array.from(
    new Set(
      expectedScenario
        .scenario
        .projectedUnderstandingCandidates
        .flatMap(
          (candidate) =>
            candidate.themeIds,
        )
        .filter(
          (id): id is string =>
            typeof id ===
              "string" &&
            id.trim().length > 0,
        ),
    ),
  );

const checks: Check[] = [
  {
    name:
      "Reflection links to Decision Outcome",

    passed:
      reflection
        .executiveDecisionOutcomeId ===
      outcome.id,

    detail:
      reflection
        .executiveDecisionOutcomeId,
  },

  {
    name:
      "Successful outcome validates decision reasoning",

    passed:
      reflection.assessment ===
      "validated",

    detail:
      reflection.assessment,
  },

  {
    name:
      "Validated predictions preserved",

    passed:
      reflection
        .validatedPredictions
        .length ===
      outcome
        .validatedPredictionIds
        .length &&
      reflection
        .invalidatedPredictions
        .length === 0,

    detail:
      `${reflection.validatedPredictions.length} validated, ${reflection.invalidatedPredictions.length} invalidated`,
  },

  {
    name:
      "Validated assumptions preserved",

    passed:
      reflection
        .validatedAssumptions
        .length ===
      outcome
        .validatedAssumptions
        .length &&
      reflection
        .invalidatedAssumptions
        .length === 0,

    detail:
      `${reflection.validatedAssumptions.length} validated, ${reflection.invalidatedAssumptions.length} invalidated`,
  },

  {
    name:
      "Expected mechanisms reinforced",

    passed:
      expectedMechanismIds.every(
        (mechanismId) =>
          reflection
            .reinforcedMechanismIds
            .includes(
              mechanismId,
            ),
      ) &&
      reflection
        .weakenedMechanismIds
        .length === 0,

    detail:
      `${reflection.reinforcedMechanismIds.length}/${expectedMechanismIds.length} mechanism(s) reinforced`,
  },

  {
    name:
      "Expected theories reinforced",

    passed:
      expectedTheoryIds.every(
        (theoryId) =>
          reflection
            .reinforcedTheoryIds
            .includes(
              theoryId,
            ),
      ) &&
      reflection
        .weakenedTheoryIds
        .length === 0,

    detail:
      `${reflection.reinforcedTheoryIds.length}/${expectedTheoryIds.length} theory or theories reinforced`,
  },

  {
    name:
      "No unexpected findings invented",

    passed:
      reflection
        .unexpectedFindings
        .length === 0,

    detail:
      `${reflection.unexpectedFindings.length} unexpected finding(s)`,
  },

  {
    name:
      "Reflection rationale is substantive",

    passed:
      reflection.rationale
        .trim()
        .length >= 100,

    detail:
      `${reflection.rationale.length} characters`,
  },

  {
    name:
      "Key learning is reusable",

    passed:
      reflection.keyLearning
        .trim()
        .length >= 100,

    detail:
      `${reflection.keyLearning.length} characters`,
  },

  {
    name:
      "Future recommendation is substantive",

    passed:
      reflection
        .futureRecommendation
        .trim()
        .length >= 100,

    detail:
      `${reflection.futureRecommendation.length} characters`,
  },

  {
    name:
      "Reflection confidence bounded",

    passed:
      Number.isFinite(
        reflection.confidence,
      ) &&
      reflection.confidence >= 0 &&
      reflection.confidence <= 1,

    detail:
      percent(
        reflection.confidence,
      ),
  },

  {
    name:
      "Reflection timestamp preserved",

    passed:
      reflection.createdAt ===
      REFLECTED_AT,

    detail:
      reflection.createdAt,
  },

  {
    name:
      "Producer inputs remained unchanged",

    passed:
      inputSnapshotBefore ===
      inputSnapshotAfter,

    detail:
      inputSnapshotBefore ===
      inputSnapshotAfter
        ? "Inputs not mutated."
        : "At least one input changed.",
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

console.log("Decision Reflection");
console.log("------------------------------");
console.log(
  `Assessment: ${reflection.assessment}`,
);
console.log(
  `Confidence: ${percent(
    reflection.confidence,
  )}`,
);
console.log(
  `Key Learning: ${reflection.keyLearning}`,
);
console.log(
  `Future Recommendation: ${reflection.futureRecommendation}`,
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
