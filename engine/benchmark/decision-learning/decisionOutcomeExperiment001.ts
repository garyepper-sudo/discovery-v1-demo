import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  runExecutiveDecisionCycle,
} from "../../v3/decisions/runExecutiveDecisionCycle";

import {
  buildExecutiveDecisionOutcome,
} from "../../v3/decision-learning/buildExecutiveDecisionOutcome";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import {
  synthesizeOrganizationalState,
  type OrganizationalCondition,
} from "../../v3/model/state/inferOrganizationalConditions";

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
console.log("DISCOVERY DECISION OUTCOME");
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
      "executive-decision-outcome-001",

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

const inputSnapshotBefore =
  JSON.stringify({
    executiveDecision,
    intervention,
    expectedScenario,
    observedOrganizationalState,
    observedConditions,
    observedPredictions,
  });

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

const inputSnapshotAfter =
  JSON.stringify({
    executiveDecision,
    intervention,
    expectedScenario,
    observedOrganizationalState,
    observedConditions,
    observedPredictions,
  });

const checks: Check[] = [
  {
    name:
      "Outcome links to Executive Decision",

    passed:
      outcome
        .executiveDecisionId ===
      executiveDecision.id,

    detail:
      outcome
        .executiveDecisionId,
  },

  {
    name:
      "Outcome links to implemented intervention",

    passed:
      outcome.interventionId ===
      intervention.id,

    detail:
      outcome.interventionId,
  },

  {
    name:
      "Execution recorded as completed",

    passed:
      outcome.executionStatus ===
      "completed",

    detail:
      outcome.executionStatus,
  },

  {
    name:
      "Observed condition movement classified",

    passed:
      outcome
        .improvedConditionIds
        .length > 0 &&
      outcome
        .worsenedConditionIds
        .length === 0,

    detail:
      `${outcome.improvedConditionIds.length} improved, ${outcome.worsenedConditionIds.length} worsened, ${outcome.unchangedConditionIds.length} unchanged`,
  },

  {
    name:
      "Target condition improved",

    passed:
      outcome
        .improvedConditionIds
        .includes(
          "condition-executioncapacity",
        ),

    detail:
      outcome
        .improvedConditionIds
        .join(", ") ||
      "none",
  },

  {
    name:
      "Success metric achieved",

    passed:
      outcome
        .achievedSuccessMetrics
        .includes(
          "Execution Capacity",
        ) &&
      outcome
        .missedSuccessMetrics
        .length === 0,

    detail:
      `${outcome.achievedSuccessMetrics.length} achieved, ${outcome.missedSuccessMetrics.length} missed`,
  },

  {
    name:
      "Projected predictions validated",

    passed:
      outcome
        .validatedPredictionIds
        .length ===
      observedPredictions.length &&
      outcome
        .invalidatedPredictionIds
        .length === 0,

    detail:
      `${outcome.validatedPredictionIds.length} validated, ${outcome.invalidatedPredictionIds.length} invalidated`,
  },

  {
    name:
      "Executive assumption validated",

    passed:
      outcome
        .validatedAssumptions
        .includes(
          "Reducing concurrent work will improve execution capacity.",
        ) &&
      outcome
        .invalidatedAssumptions
        .length === 0,

    detail:
      `${outcome.validatedAssumptions.length} validated, ${outcome.invalidatedAssumptions.length} invalidated`,
  },

  {
    name:
      "Overall outcome synthesized",

    passed:
      outcome.outcome ===
      "successful",

    detail:
      outcome.outcome,
  },

  {
    name:
      "Outcome confidence bounded",

    passed:
      Number.isFinite(
        outcome.confidence,
      ) &&
      outcome.confidence >= 0 &&
      outcome.confidence <= 1,

    detail:
      percent(
        outcome.confidence,
      ),
  },

  {
    name:
      "Executive summary generated",

    passed:
      outcome.summary
        .trim()
        .length >= 80,

    detail:
      `${outcome.summary.length} characters`,
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

console.log("Observed Outcome");
console.log("------------------------------");
console.log(
  `Intervention: ${intervention.title}`,
);
console.log(
  `Outcome: ${outcome.outcome}`,
);
console.log(
  `Confidence: ${percent(
    outcome.confidence,
  )}`,
);
console.log(
  `Summary: ${outcome.summary}`,
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
