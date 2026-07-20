import {
  buildExecutiveProjection,
} from "../../../components/executive-v2/projection/buildExecutiveProjection";

import type {
  ExecutiveCommunication,
} from "../../v3/communication/executiveCommunication";

import type {
  OrganizationRuntime,
} from "../../v3/runtime/organizationRuntime";

import type {
  DiscoveryV3Result,
} from "../../v3/types";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const GENERATED_AT =
  "2026-07-20T02:30:00.000Z";

type Check = {
  name: string;

  passed: boolean;

  detail: string;
};

const executiveCommunication = {
  id:
    `executive-communication-${ORGANIZATION_ID}-${GENERATED_AT}`,

  organizationId:
    ORGANIZATION_ID,

  generatedAt:
    GENERATED_AT,

  headline:
    "Strategic Alignment is the primary executive constraint.",

  executiveSummary:
    "Strategic Alignment is the primary executive constraint. Misaligned priorities are increasing escalation, rework, and execution drift. Discovery compared three viable strategies. Clarify decision ownership is recommended because it produces the greatest expected organizational improvement under current constraints.",

  confidence: {
    value:
      0.8,

    label:
      "high",

    limiters: [
      "Current decision authority has not yet been fully mapped.",
    ],
  },

  supportingSignals: [
    {
      id:
        "signal-priority-conflict",

      statement:
        "Competing priorities are diluting organizational focus.",

      implication:
        "Teams are making inconsistent operating tradeoffs.",

      supportingConditionIds: [
        "condition-strategicalignment",
      ],

      supportingBeliefIds: [],

      supportingMechanismIds: [
        "mechanism:priorityConflict",
      ],

      supportingTheoryIds: [],

      supportingEvidenceIds: [],
    },

    {
      id:
        "signal-decision-latency",

      statement:
        "Important decisions are taking longer to resolve.",

      implication:
        "Execution is becoming more dependent on escalation.",

      supportingConditionIds: [
        "condition-strategicalignment",
        "condition-decisionflow",
      ],

      supportingBeliefIds: [],

      supportingMechanismIds: [
        "mechanism:decisionLatency",
      ],

      supportingTheoryIds: [],

      supportingEvidenceIds: [],
    },
  ],

  meaningfulChanges: [
    {
      entityId:
        "condition-strategicalignment",

      label:
        "Strategic Alignment",

      direction:
        "worsening",

      statement:
        "Strategic Alignment is deteriorating.",

      confidence:
        0.8,
    },
  ],

  forecast: {
    headline:
      "Clearer decision ownership is expected to improve Strategic Alignment and Execution Capacity.",

    confidence:
      0.8,

    timeHorizon:
      "near-term",

    explanation:
      "The selected intervention is expected to reduce escalation and improve operating decisions.",

    affectedConditionIds: [
      "condition-strategicalignment",
      "condition-decisionflow",
      "condition-executioncapacity",
    ],

    falsifyingSignals: [
      "Decision ownership becomes clearer without any measurable improvement in escalation, decision latency, or execution capacity.",
    ],
  },

  recommendation: {
    headline:
      "Clarify decision ownership",

    actions: [
      "Map recurring operating decisions to accountable owners.",
      "Define when executive escalation is required.",
    ],

    rationale:
      "Clarifying decision ownership ranked ahead of the alternatives because it most directly addresses Strategic Alignment.",

    tradeOffs: [
      "Decision boundaries may initially require leadership negotiation.",
    ],

    assumptions: [
      "Decision owners can be given sufficient authority to act.",
    ],

    evidenceThatCouldChangeRecommendation: [
      "Evidence that decision ownership is already clear and consistently followed.",
    ],

    decisionHref:
      "/executive-decision",
  },

  uncertainty: {
    question:
      "Which recurring decisions generate the most avoidable escalation and waiting?",

    implication:
      "Incomplete decision-authority evidence limits recommendation confidence.",

    recommendedInvestigation:
      "Map recurring operating decisions and escalation paths.",

    expectedConfidenceGain:
      14,
  },

  evidenceSections: [
    {
      id:
        "judgment",

      title:
        "Why Discovery believes this",

      summary:
        "Priority conflict and decision latency support the current judgment.",

      content:
        "Teams are operating from inconsistent priorities and relying on repeated escalation.",
    },

    {
      id:
        "recommendation",

      title:
        "Strategies considered",

      summary:
        "Discovery compared three viable strategies.",

      content:
        "Clarify decision ownership ranked first, followed by reducing concurrent work and removing one approval layer.",
    },
  ],
} as ExecutiveCommunication;

const result = {
  contradictions:
    [],

  signals:
    [],

  themes:
    [],

  emergenceEvents:
    [],

  beliefs:
    [],

  understanding:
    [],

  executiveUnderstanding: {
    headline:
      "Fallback understanding",

    explanation:
      "Fallback explanation",

    confidence:
      0.5,

    openQuestions:
      [],

    nextMoves:
      [],
  },

  organismState: {
    maturity:
      0.7,

    coherence:
      0.74,

    uncertainty:
      0.25,
  },
} as unknown as DiscoveryV3Result;

const runtime = {
  organizationId:
    ORGANIZATION_ID,

  memory: {
    executiveCommunication,

    organizationalUnderstandingState: {
      currentUnderstandings:
        [],

      health: {
        maturity:
          0.7,

        coherence:
          0.74,

        uncertainty:
          0.25,
      },
    },
  },
} as unknown as OrganizationRuntime;

const runtimeSnapshotBefore =
  JSON.stringify(runtime);

const firstProjection =
  buildExecutiveProjection({
    result,
    runtime,
  });

const secondProjection =
  buildExecutiveProjection({
    result,
    runtime,
  });

const runtimeSnapshotAfter =
  JSON.stringify(runtime);

const projectedCommunication =
  firstProjection
    .executiveCommunication;

const checks: Check[] = [
  {
    name:
      "Executive Communication projected",

    passed:
      projectedCommunication !==
      undefined,

    detail:
      projectedCommunication?.id ??
      "No Executive Communication.",
  },

  {
    name:
      "Organization identity preserved",

    passed:
      projectedCommunication
        ?.organizationId ===
      ORGANIZATION_ID,

    detail:
      projectedCommunication
        ?.organizationId ??
      "none",
  },

  {
    name:
      "Communication identity preserved",

    passed:
      projectedCommunication
        ?.id ===
      executiveCommunication.id,

    detail:
      projectedCommunication?.id ??
      "none",
  },

  {
    name:
      "Headline preserved",

    passed:
      projectedCommunication
        ?.headline ===
      executiveCommunication.headline,

    detail:
      projectedCommunication
        ?.headline ??
      "none",
  },

  {
    name:
      "Executive summary preserved",

    passed:
      projectedCommunication
        ?.executiveSummary ===
      executiveCommunication
        .executiveSummary,

    detail:
      `${
        projectedCommunication
          ?.executiveSummary
          .split(/\s+/)
          .length ?? 0
      } word(s)`,
  },

  {
    name:
      "Recommendation preserved",

    passed:
      projectedCommunication
        ?.recommendation
        .headline ===
      executiveCommunication
        .recommendation
        .headline,

    detail:
      projectedCommunication
        ?.recommendation
        .headline ??
      "none",
  },

  {
    name:
      "Recommendation actions preserved",

    passed:
      JSON.stringify(
        projectedCommunication
          ?.recommendation
          .actions,
      ) ===
      JSON.stringify(
        executiveCommunication
          .recommendation
          .actions,
      ),

    detail:
      `${
        projectedCommunication
          ?.recommendation
          .actions.length ?? 0
      } action(s)`,
  },

  {
    name:
      "Confidence preserved",

    passed:
      projectedCommunication
        ?.confidence
        .value ===
      executiveCommunication
        .confidence
        .value,

    detail:
      `${
        projectedCommunication
          ?.confidence.value ??
        0
      }`,
  },

  {
    name:
      "Forecast preserved",

    passed:
      projectedCommunication
        ?.forecast
        .headline ===
      executiveCommunication
        .forecast
        .headline,

    detail:
      projectedCommunication
        ?.forecast
        .headline ??
      "none",
  },

  {
    name:
      "Uncertainty preserved",

    passed:
      projectedCommunication
        ?.uncertainty
        ?.question ===
      executiveCommunication
        .uncertainty
        ?.question,

    detail:
      projectedCommunication
        ?.uncertainty
        ?.question ??
      "none",
  },

  {
    name:
      "Evidence sections preserved",

    passed:
      JSON.stringify(
        projectedCommunication
          ?.evidenceSections,
      ) ===
      JSON.stringify(
        executiveCommunication
          .evidenceSections,
      ),

    detail:
      `${
        projectedCommunication
          ?.evidenceSections
          .length ?? 0
      } section(s)`,
  },

  {
    name:
      "Flattened understanding derives from communication",

    passed:
      firstProjection
        .currentUnderstanding
        .belief ===
      executiveCommunication
        .headline,

    detail:
      firstProjection
        .currentUnderstanding
        .belief,
  },

  {
    name:
      "Flattened explanation derives from communication",

    passed:
      firstProjection
        .explanation
        .why ===
      executiveCommunication
        .executiveSummary,

    detail:
      firstProjection
        .explanation
        .why,
  },

  {
    name:
      "Projection deterministic",

    passed:
      JSON.stringify(
        firstProjection,
      ) ===
      JSON.stringify(
        secondProjection,
      ),

    detail:
      "Repeated projection produced identical output.",
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
  "DISCOVERY EXECUTIVE PROJECTION",
);
console.log(
  "Experiment 001",
);
console.log(
  "Executive Communication Integration",
);
console.log(
  "==========================================",
);
console.log("");

console.log(
  "Projected Executive Communication",
);
console.log(
  "------------------------------",
);
console.log(
  projectedCommunication
    ?.headline ??
  "No communication projected.",
);
console.log("");
console.log(
  projectedCommunication
    ?.executiveSummary ??
  "",
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
    `${
      check.passed
        ? "PASS"
        : "FAIL"
    }  ${check.name}`,
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
