import {
  loadOrganizationRuntimeState,
} from "../../v3/runtime";

import {
  runExecutiveDecisionCycle,
} from "../../v3/decisions/runExecutiveDecisionCycle";

import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import type {
  OrganizationalUncertainty,
} from "../../v3/model/epistemic/organizationalUncertainty";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const NOW =
  "2026-07-18T12:00:00.000Z";

type Check = {
  name: string;
  passed: boolean;
  detail: string;
};

console.log("");
console.log("==========================================");
console.log("DISCOVERY EXECUTIVE DECISION JUSTIFICATION");
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

const executiveDecision: ExecutiveDecision = {
  id:
    "executive-decision-justification-demo",

  organizationId:
    ORGANIZATION_ID,

  type:
    "execution",

  title:
    "Improve Organizational Execution",

  objective:
    "Increase execution throughput and decision flow without increasing organizational risk.",

  rationale:
    "Leadership wants to compare structural interventions that improve execution quality, decision speed, and organizational coordination without adding headcount.",

  status:
    "ready",

  timeHorizon:
    "near-term",

  targetConditionIds: [
    "condition-executioncapacity",
    "condition-decisionflow",
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

    {
      name:
        "Decision Flow",

      baseline:
        0.44,

      target:
        0.6,

      unit:
        "score",

      rationale:
        "Decision flow must improve enough to reduce operating delay and approval friction.",
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

const runtimeSnapshotBefore =
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

const runtimeSnapshotAfter =
  JSON.stringify(
    benchmarkRuntime,
  );

const viableOptionCount =
  cycle.viabilityEvaluations.filter(
    (evaluation) =>
      evaluation.status !==
      "disqualified",
  ).length;

const checks: Check[] = [
  {
    name:
      "Executive Decision accepted",

    passed:
      cycle.executiveDecision.id ===
      executiveDecision.id,

    detail:
      cycle.executiveDecision.title,
  },

  {
    name:
      "Multiple intervention options generated",

    passed:
      cycle.generatedOptions.length >=
      2,

    detail:
      `${cycle.generatedOptions.length} option(s)`,
  },

  {
    name:
      "Every generated option received a viability evaluation",

    passed:
      cycle.generatedOptions.length ===
      cycle.viabilityEvaluations.length,

    detail:
      `${cycle.viabilityEvaluations.length}/${cycle.generatedOptions.length}`,
  },

  {
    name:
      "Multiple viable options evaluated",

    passed:
      viableOptionCount >= 2 &&
      viableOptionCount ===
        cycle.evaluatedOptions.length,

    detail:
      `${cycle.evaluatedOptions.length}/${viableOptionCount}`,
  },

  {
    name:
      "Every evaluated option simulated",

    passed:
      cycle.evaluatedOptions.length ===
      cycle.scenarios.length,

    detail:
      `${cycle.scenarios.length}/${cycle.evaluatedOptions.length}`,
  },

  {
    name:
      "Multiple scenarios compared",

    passed:
      cycle.comparisonSet
        .scenarioComparisons.length >=
        2 &&
      cycle.comparisonSet
        .scenarioComparisons.length ===
        cycle.scenarios.length,

    detail:
      `${cycle.comparisonSet.scenarioComparisons.length} comparison(s)`,
  },

  {
    name:
      "Multiple scenarios ranked",

    passed:
      cycle.rankedScenarios.length >=
        2 &&
      cycle.rankedScenarios.length ===
        cycle.scenarios.length,

    detail:
      `${cycle.rankedScenarios.length} ranked scenario(s)`,
  },

  {
    name:
      "Decision justification produced",

    passed:
      Boolean(
        cycle.decisionJustification,
      ),

    detail:
      cycle.decisionJustification
        .recommendedTitle,
  },

  {
    name:
      "Decision justification matches top-ranked option",

    passed:
      cycle.decisionJustification
        .recommendedOptionId ===
      cycle.rankedScenarios[0]
        ?.optionId,

    detail:
      cycle.decisionJustification
        .recommendedOptionId,
  },

  {
    name:
      "Decision justification evaluates every alternative",

    passed:
      cycle.decisionJustification
        .alternatives.length ===
      cycle.rankedScenarios.length -
        1,

    detail:
      `${cycle.decisionJustification.alternatives.length} alternative(s)`,
  },

  {
    name:
      "Every alternative explains why it ranked lower",

    passed:
      cycle.decisionJustification
        .alternatives.every(
          (alternative) =>
            alternative
              .reasonsRankedLower
              .length > 0,
        ),

    detail:
      `${cycle.decisionJustification.alternatives.filter(
        (alternative) =>
          alternative
            .reasonsRankedLower
            .length > 0,
      ).length}/${cycle.decisionJustification.alternatives.length}`,
  },

  {
    name:
      "Every alternative preserves comparative score difference",

    passed:
      cycle.decisionJustification
        .alternatives.every(
          (alternative) =>
            alternative
              .scoreDifference >= 0,
        ),

    detail:
      cycle.decisionJustification
        .alternatives
        .map(
          (alternative) =>
            `${alternative.title}: ${Math.round(
              alternative.scoreDifference *
                100,
            )}%`,
        )
        .join(" | "),
  },

  {
    name:
      "Decisive advantages identified",

    passed:
      cycle.decisionJustification
        .decisiveAdvantages.length >
      0,

    detail:
      `${cycle.decisionJustification.decisiveAdvantages.length} advantage(s)`,
  },

  {
    name:
      "Decision confidence calibrated",

    passed:
      cycle.confidenceCalibration
        .calibratedConfidence >= 0 &&
      cycle.confidenceCalibration
        .calibratedConfidence <= 1,

    detail:
      `${Math.round(
        cycle.confidenceCalibration
          .calibratedConfidence *
          100,
      )}% calibrated confidence`,
  },

  {
    name:
      "Executive recommendation created",

    passed:
      Boolean(
        cycle.recommendation
          .recommendedInterventionId,
      ),

    detail:
      cycle.recommendation.status,
  },

  {
    name:
      "Top-ranked option recommended",

    passed:
      cycle.rankedScenarios[0]
        ?.interventionId ===
      cycle.recommendation
        .recommendedInterventionId,

    detail:
      cycle.recommendation
        .recommendedInterventionId ??
      "none",
  },

  {
    name:
      "Runtime remained unchanged",

    passed:
      runtimeSnapshotBefore ===
      runtimeSnapshotAfter,

    detail:
      runtimeSnapshotBefore ===
      runtimeSnapshotAfter
        ? "Runtime not mutated."
        : "Runtime changed.",
  },
];

const passed =
  checks.filter(
    (check) => check.passed,
  ).length;

const failed =
  checks.length -
  passed;

console.log("Decision");
console.log("------------------------------");
console.log(
  `Recommendation: ${cycle.decisionJustification.recommendedTitle}`,
);
console.log(
  `Alternatives: ${cycle.decisionJustification.alternatives.length}`,
);
console.log(
  `Decisive Advantages: ${cycle.decisionJustification.decisiveAdvantages.length}`,
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
