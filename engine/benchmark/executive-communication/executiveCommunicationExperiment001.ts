import type {
  ExecutiveProjection,
} from "../../../components/executive-v2/projection/ExecutiveProjection";

import {
  synthesizeExecutiveCommunication,
} from "../../v3/communication/synthesizeExecutiveCommunication";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const GENERATED_AT =
  "2026-07-14T12:00:00.000Z";

type Check = {
  name: string;

  passed: boolean;

  detail: string;
};

const ENGINE_LANGUAGE_PATTERNS = [
  /reasoning paths?/i,
  /capability signals?/i,
  /causal relationships?/i,
  /propagated effects?/i,
  /canonical producer/i,
  /organizational causal model/i,
  /supported by \d+ phenomena?/i,
  /supported by \d+ explanations?/i,
];

function containsEngineLanguage(
  values: string[],
): string | undefined {
  for (const value of values) {
    const matchingPattern =
      ENGINE_LANGUAGE_PATTERNS.find(
        (pattern) =>
          pattern.test(value),
      );

    if (matchingPattern) {
      return value;
    }
  }

  return undefined;
}

function collectCommunicationText(
  communication: ReturnType<
    typeof synthesizeExecutiveCommunication
  >,
): string[] {
  return [
    communication.headline,
    communication.executiveSummary,

    ...communication.supportingSignals.flatMap(
      (signal) => [
        signal.statement,
        signal.implication ?? "",
      ],
    ),

    ...communication.meaningfulChanges.flatMap(
      (change) => [
        change.label,
        change.statement,
      ],
    ),

    communication.forecast.headline,
    communication.forecast.explanation,

    communication.recommendation.headline,
    communication.recommendation.rationale,

    ...communication.recommendation.actions,

    ...communication.recommendation.tradeOffs,

    ...communication.recommendation.assumptions,

    ...communication.recommendation
      .evidenceThatCouldChangeRecommendation,

    communication.uncertainty?.question ?? "",
    communication.uncertainty?.implication ?? "",
    communication.uncertainty
      ?.recommendedInvestigation ?? "",

    ...communication.evidenceSections.flatMap(
      (section) => [
        section.title,
        section.summary,
        section.content,
        ...(section.metrics ?? []).flatMap(
          (metric) => [
            metric.label,
            metric.value,
          ],
        ),
      ],
    ),
  ].filter(
    (value) =>
      value.trim().length > 0,
  );
}

const projection:
  ExecutiveProjection = {
    workspace: {
      title:
        "Current Understanding",

      status:
        "Active",

      updatedLabel:
        null,
    },

    currentUnderstanding: {
      belief:
        "Coordination System is currently constraining organizational performance through Governance Friction, Decision Latency, and Accountability Gap.",

      mindStatus:
        "Developing",

      confidence:
        94,

      organizationalCoherence:
        76,
    },

    explanation: {
      why:
        "Governance Friction is supported by 1 phenomenon, 8 explanations, 28 reasoning paths, and 4 capability signals.",

      whatCouldChangeThis:
        "The assessment would change if approval latency fell and cross-functional handoffs became more reliable.",

      nextMove:
        "Clarify cross-functional ownership and reduce unnecessary approval dependency.",
    },

    executiveAttention: {
      title:
        "Coordination pressure is increasing",

      summary:
        "Cross-functional work continues to depend on informal escalation and repeated leadership intervention.",

      severity:
        "high",
    },

    executiveAssessment: {
      summary:
        "Coordination System is getting worse.",

      executiveNarrative:
        "Governance Friction is supported by 1 phenomenon, 8 explanations, 28 reasoning paths, and 4 capability signals. Decision latency and accountability gaps continue to constrain execution.",

      confidence:
        94,

      recommendedFocus: [
        "decision ownership",
        "cross-functional handoffs",
        "approval layers",
      ],

      theoryValidation: {
        dominantTheory:
          "Coordination System",

        whyDiscoveryBelievesIt:
          "Governance and decision patterns consistently explain the observed execution constraint.",

        supportingMechanisms: [
          {
            label:
              "Governance Friction",

            rationale:
              "Routine decisions continue to require avoidable approval and escalation.",

            confidence:
              0.92,
          },

          {
            label:
              "Decision Latency",

            rationale:
              "Important operating decisions are taking longer to resolve.",

            confidence:
              0.89,
          },

          {
            label:
              "Accountability Gap",

            rationale:
              "Ownership for shared outcomes remains unclear across teams.",

            confidence:
              0.86,
          },
        ],

        supportingOrganizationalBeliefs:
          [],

        competingTheoriesConsidered:
          [],

        contradictoryOrWeakeningEvidence:
          [],

        calibratedConfidenceExplanation:
          "Confidence remains high because several independent organizational signals support the same conclusion.",

        additionalEvidenceThatWouldIncreaseConfidence: [
          "Decision latency by approval stage",
        ],

        evidenceThatWouldFalsifyTheory: [
          "Sustained improvement in handoff quality without changes to ownership or governance",
        ],

        executiveRecommendation:
          "Clarify decision ownership and standardize cross-functional handoffs.",
      },
    },

    organizationalState: {
      status:
        "strained",

      summary:
        "The organization remains operational, but coordination constraints are reducing execution reliability.",

      confidence:
        91,

      executiveImplication:
        "Without intervention, leadership dependency and operating delay are likely to increase.",

      recommendedFocus: [
        "decision ownership",
        "handoff reliability",
      ],
    },

    organizationalConditions: [
      {
        name:
          "Coordination System",

        status:
          "deteriorating",

        confidence:
          94,

        summary:
          "Cross-functional coordination is becoming less reliable.",

        whyItMatters:
          "Teams are relying too heavily on informal handoffs, repeated escalation, and unclear ownership.",

        recommendedExecutiveAction:
          "Clarify decision ownership and standardize cross-functional handoffs.",
      },

      {
        name:
          "Knowledge Continuity",

        status:
          "deteriorating",

        confidence:
          84,

        summary:
          "Critical knowledge is becoming less reusable across teams.",

        whyItMatters:
          "Teams are becoming more dependent on individual knowledge holders.",

        recommendedExecutiveAction:
          "Create repeatable operating records for important decisions and handoffs.",
      },

      {
        name:
          "Organizational Learning",

        status:
          "deteriorating",

        confidence:
          79,

        summary:
          "Recurring problems are not consistently becoming operating improvements.",

        whyItMatters:
          "The organization is paying repeatedly for issues it has already encountered.",

        recommendedExecutiveAction:
          "Assign owners to convert recurring lessons into process changes.",
      },
    ],

    organizationalBeliefs: [
      {
        statement:
          "Routine decisions remain overly dependent on leadership escalation.",

        confidence:
          92,

        trend:
          "strengthening",

        supportingMechanisms: [
          "Governance Friction",
          "Decision Latency",
        ],

        supportingConcepts:
          [],
      },
    ],

    investigationOpportunities: [
      {
        topic:
          "Decision ownership",

        reason:
          "Clarifying ownership would determine whether delay is structural or primarily behavioral.",

        suggestedExecutiveQuestion:
          "Which recurring decisions generate the most avoidable escalation and waiting?",

        expectedConfidenceGain:
          12,
      },
    ],

    organizationalLearningProfile: {
      understandingGrowth:
        0.14,

      memoryGrowth:
        0.18,

      learningVelocity:
        "moderate",

      learningVelocityScore:
        68,

      beliefStability:
        82,

      theoryStability:
        79,

      knowledgeRetention:
        71,

      summary:
        "Discovery's understanding is becoming more stable, but several operating uncertainties remain.",
    },

    simulation: {
      simulatedAt:
        GENERATED_AT,

      timeHorizon:
        "near-term",

      confidence:
        82,

      explanation:
        "Discovery simulated the current organizational state forward through 6 causal relationships. The propagated effects were applied to projected organizational conditions.",

      projectedConditions: [
        "Coordination System",
        "Execution Capacity",
      ],

      projectedBeliefs: [
        "Leadership dependency will continue to constrain routine execution.",
      ],

      projectedPredictions: [
        "Execution capacity is likely to deteriorate if coordination and decision ownership remain unchanged.",
      ],
    },

    evolution: {
      milestones: [
        {
          id:
            "current-understanding",

          label:
            "Today",

          description:
            "94% confidence · Developing",

          isCurrent:
            true,
        },
      ],
    },
  };

const projectionSnapshotBefore =
  JSON.stringify(projection);

const communication =
  synthesizeExecutiveCommunication({
    projection,
    organizationId:
      ORGANIZATION_ID,
    generatedAt:
      GENERATED_AT,
  });

const repeatedCommunication =
  synthesizeExecutiveCommunication({
    projection,
    organizationId:
      ORGANIZATION_ID,
    generatedAt:
      GENERATED_AT,
  });

const projectionSnapshotAfter =
  JSON.stringify(projection);

const communicationText =
  collectCommunicationText(
    communication,
  );

const engineLanguageExample =
  containsEngineLanguage(
    communicationText,
  );

const checks: Check[] = [
  {
    name:
      "Executive communication created",

    passed:
      communication.id.length > 0 &&
      communication.organizationId ===
        ORGANIZATION_ID,

    detail:
      communication.id,
  },

  {
    name:
      "Executive headline created",

    passed:
      communication.headline.trim().length >
        0,

    detail:
      communication.headline,
  },

  {
    name:
      "Executive summary created",

    passed:
      communication.executiveSummary
        .trim().length > 0,

    detail:
      communication.executiveSummary,
  },

  {
    name:
      "Engine language suppressed",

    passed:
      engineLanguageExample ===
      undefined,

    detail:
      engineLanguageExample
        ? `Engine language remained in: ${engineLanguageExample}`
        : "No prohibited engine-language patterns detected.",
  },

  {
    name:
      "Confidence normalized",

    passed:
      communication.confidence.value >=
        0 &&
      communication.confidence.value <=
        1 &&
      communication.forecast.confidence >=
        0 &&
      communication.forecast.confidence <=
        1,

    detail:
      `Judgment ${communication.confidence.value}; forecast ${communication.forecast.confidence}.`,
  },

  {
    name:
      "Supporting signals created",

    passed:
      communication.supportingSignals
        .length > 0 &&
      communication.supportingSignals
        .length <= 3,

    detail:
      `${communication.supportingSignals.length} supporting signal(s).`,
  },

  {
    name:
      "Meaningful changes created",

    passed:
      communication.meaningfulChanges
        .length > 0,

    detail:
      `${communication.meaningfulChanges.length} meaningful change(s).`,
  },

  {
    name:
      "Executive forecast created",

    passed:
      communication.forecast.headline
        .trim().length > 0 &&
      communication.forecast.explanation
        .trim().length > 0,

    detail:
      communication.forecast.headline,
  },

  {
    name:
      "Executive recommendation created",

    passed:
      communication.recommendation
        .headline.trim().length > 0 &&
      communication.recommendation
        .actions.length > 0,

    detail:
      `${communication.recommendation.headline} ${communication.recommendation.actions.length} action(s).`,
  },

  {
    name:
      "Uncertainty communicated",

    passed:
      communication.uncertainty !==
        undefined &&
      communication.uncertainty.question
        .trim().length > 0,

    detail:
      communication.uncertainty
        ?.question ??
      "No uncertainty produced.",
  },

  {
    name:
      "Evidence sections retained",

    passed:
      communication.evidenceSections
        .length > 0,

    detail:
      `${communication.evidenceSections.length} evidence section(s).`,
  },

  {
    name:
      "Communication deterministic",

    passed:
      JSON.stringify(
        communication,
      ) ===
      JSON.stringify(
        repeatedCommunication,
      ),

    detail:
      "Repeated synthesis with the same input and timestamp produced an identical result.",
  },

  {
    name:
      "Executive Projection unchanged",

    passed:
      projectionSnapshotBefore ===
      projectionSnapshotAfter,

    detail:
      projectionSnapshotBefore ===
      projectionSnapshotAfter
        ? "Input projection was not mutated."
        : "Input projection changed.",
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

console.log("");
console.log(
  "==========================================",
);
console.log(
  "DISCOVERY EXECUTIVE COMMUNICATION",
);
console.log(
  "Experiment 001",
);
console.log(
  "==========================================",
);
console.log("");

console.log(
  "Executive Communication",
);
console.log(
  "------------------------------",
);
console.log(
  communication.headline,
);
console.log("");
console.log(
  communication.executiveSummary,
);
console.log("");

console.log(
  "Assertions",
);
console.log(
  "------------------------------",
);

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

console.log(
  "Experiment Complete",
);
console.log("");