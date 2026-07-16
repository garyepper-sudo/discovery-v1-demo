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
  buildExecutiveDecisionLearning,
} from "../../v3/decision-learning/buildExecutiveDecisionLearning";

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

const LEARNED_AT =
  "2026-08-13T12:10:00.000Z";

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
console.log("DISCOVERY DECISION LEARNING");
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
      "executive-decision-learning-001",

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

const reflection =
  buildExecutiveDecisionReflection({
    outcome,

    expectedScenario,

    createdAt:
      REFLECTED_AT,
  });

const inputSnapshotBefore =
  JSON.stringify({
    executiveDecision,
    intervention,
    reflection,
  });

const learning =
  buildExecutiveDecisionLearning({
    executiveDecision,

    intervention,

    reflection,

    existingSupportCount:
      0,

    createdAt:
      LEARNED_AT,
  });

const inputSnapshotAfter =
  JSON.stringify({
    executiveDecision,
    intervention,
    reflection,
  });

const expectedConditionIds =
  Array.from(
    new Set([
      ...executiveDecision
        .targetConditionIds,

      ...intervention
        .affectedConditionIds,
    ]),
  );

const expectedConstraintTypes =
  Array.from(
    new Set(
      executiveDecision
        .constraints
        .map(
          (constraint) =>
            constraint.type,
        ),
    ),
  );

const checks: Check[] = [
  {
    name:
      "Learning links to Decision Reflection",

    passed:
      learning
        .executiveDecisionReflectionId ===
      reflection.id,

    detail:
      learning
        .executiveDecisionReflectionId,
  },

  {
    name:
      "Learning links to Executive Decision",

    passed:
      learning
        .executiveDecisionId ===
      executiveDecision.id,

    detail:
      learning
        .executiveDecisionId,
  },

  {
    name:
      "Learning belongs to the correct organization",

    passed:
      learning.organizationId ===
      ORGANIZATION_ID,

    detail:
      learning.organizationId,
  },

  {
    name:
      "Validated reflection produces mechanism learning",

    passed:
      learning.type ===
      "mechanism-validity",

    detail:
      learning.type,
  },

  {
    name:
      "Intervention applicability preserved",

    passed:
      learning
        .applicableInterventionTypes
        .length === 1 &&
      learning
        .applicableInterventionTypes
        .includes(
          intervention.type,
        ),

    detail:
      learning
        .applicableInterventionTypes
        .join(", "),
  },

  {
    name:
      "Condition applicability preserved",

    passed:
      expectedConditionIds.every(
        (conditionId) =>
          learning
            .applicableConditionIds
            .includes(
              conditionId,
            ),
      ),

    detail:
      `${learning.applicableConditionIds.length}/${expectedConditionIds.length} condition(s) represented`,
  },

  {
    name:
      "Constraint applicability preserved",

    passed:
      expectedConstraintTypes.every(
        (constraintType) =>
          learning
            .applicableConstraintTypes
            .includes(
              constraintType,
            ),
      ),

    detail:
      `${learning.applicableConstraintTypes.length}/${expectedConstraintTypes.length} constraint type(s) represented`,
  },

  {
    name:
      "Reinforced mechanisms carried forward",

    passed:
      reflection
        .reinforcedMechanismIds
        .every(
          (mechanismId) =>
            learning
              .reinforcedMechanismIds
              .includes(
                mechanismId,
              ),
        ) &&
      learning
        .weakenedMechanismIds
        .length === 0,

    detail:
      `${learning.reinforcedMechanismIds.length} reinforced, ${learning.weakenedMechanismIds.length} weakened`,
  },

  {
    name:
      "Reinforced theories carried forward",

    passed:
      reflection
        .reinforcedTheoryIds
        .every(
          (theoryId) =>
            learning
              .reinforcedTheoryIds
              .includes(
                theoryId,
              ),
        ) &&
      learning
        .weakenedTheoryIds
        .length === 0,

    detail:
      `${learning.reinforcedTheoryIds.length} reinforced, ${learning.weakenedTheoryIds.length} weakened`,
  },

  {
    name:
      "Validated reflection increases future confidence",

    passed:
      learning
        .confidenceAdjustment >
      0,

    detail:
      `${Math.round(
        learning
          .confidenceAdjustment *
          100,
      )} percentage-point adjustment`,
  },

  {
    name:
      "First observation starts with support count one",

    passed:
      learning.supportCount ===
      1,

    detail:
      `${learning.supportCount}`,
  },

  {
    name:
      "First observation remains provisional",

    passed:
      learning.status ===
      "provisional",

    detail:
      learning.status,
  },

  {
    name:
      "Reusable learning statement generated",

    passed:
      learning.statement
        .trim()
        .length >= 100,

    detail:
      `${learning.statement.length} characters`,
  },

  {
    name:
      "Learning rationale is substantive",

    passed:
      learning.rationale
        .trim()
        .length >= 200,

    detail:
      `${learning.rationale.length} characters`,
  },

  {
    name:
      "Learning confidence bounded",

    passed:
      Number.isFinite(
        learning.confidence,
      ) &&
      learning.confidence >= 0 &&
      learning.confidence <= 1,

    detail:
      percent(
        learning.confidence,
      ),
  },

  {
    name:
      "Learning timestamps preserved",

    passed:
      learning.createdAt ===
        LEARNED_AT &&
      learning.updatedAt ===
        LEARNED_AT,

    detail:
      `${learning.createdAt} / ${learning.updatedAt}`,
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

console.log("Decision Learning");
console.log("------------------------------");
console.log(
  `Type: ${learning.type}`,
);
console.log(
  `Status: ${learning.status}`,
);
console.log(
  `Confidence: ${percent(
    learning.confidence,
  )}`,
);
console.log(
  `Confidence Adjustment: ${Math.round(
    learning.confidenceAdjustment *
      100,
  )} percentage points`,
);
console.log(
  `Statement: ${learning.statement}`,
);
console.log(
  `Rationale: ${learning.rationale}`,
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
