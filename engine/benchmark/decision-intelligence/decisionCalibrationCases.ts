export type DecisionCalibrationCase = {
  id: string;

  title: string;

  organizationId: string;

  intervention: {
    type:
      | "governance"
      | "policy"
      | "reorganization"
      | "strategy";

    title: string;

    description: string;

    rationale: string;

    scope:
      | "team"
      | "department"
      | "organization";

    timeHorizon:
      | "immediate"
      | "near-term"
      | "medium-term"
      | "long-term";

    affectedConditionIds: string[];

    expectedMechanismIds: string[];

    assumptions: string[];

    confidence: number;
  };

  changedEntityId: string;

  /**
   * Positive = improve the condition
   * Negative = worsen the condition
   */
  interventionDelta: number;

  expected: {
    conditionDirections: Record<
      string,
      "improved" | "worsened" | "unchanged"
    >;

    recommendation:
      | "proceed"
      | "do-not-proceed"
      | "investigate-further";
  };
};

export const decisionCalibrationCases: DecisionCalibrationCase[] = [
  {
    id:
      "decision-calibration-001",

    title:
      "Clarify Decision Rights",

    organizationId:
      "atlas-manufacturing-simulation",

    intervention: {
      type:
        "governance",

      title:
        "Clarify Decision Rights",

      description:
        "Reduce approval bottlenecks by clarifying decision authority.",

      rationale:
        "Evaluate whether reducing governance friction improves organizational execution.",

      scope:
        "organization",

      timeHorizon:
        "near-term",

      affectedConditionIds: [
        "condition-decisionflow",
      ],

      expectedMechanismIds: [
        "mechanism:governanceFriction",
        "mechanism:decisionLatency",
      ],

      assumptions: [
        "Leadership can clarify decision authority without adding coordination overhead.",
        "Teams will consistently use the clarified decision rights.",
      ],

      confidence:
        0.8,
    },

    changedEntityId:
      "condition-decisionflow",

    interventionDelta:
      0.25,

    expected: {
      conditionDirections: {
        "condition-decisionflow":
          "improved",

        "condition-coordination":
          "improved",

        "condition-executioncapacity":
          "improved",
      },

      recommendation:
        "proceed",
    },
  },

  {
    id:
      "decision-calibration-002",

    title:
      "Increase Approval Layers",

    organizationId:
      "atlas-manufacturing-simulation",

    intervention: {
      type:
        "governance",

      title:
        "Increase Approval Layers",

      description:
        "Require additional leadership approval before operational decisions can be made.",

      rationale:
        "Validate that additional governance friction degrades organizational execution.",

      scope:
        "organization",

      timeHorizon:
        "near-term",

      affectedConditionIds: [
        "condition-decisionflow",
      ],

      expectedMechanismIds: [
        "mechanism:governanceFriction",
        "mechanism:decisionLatency",
      ],

      assumptions: [
        "Additional approvals introduce more waiting.",
        "No compensating delegation is introduced.",
      ],

      confidence:
        0.8,
    },

    changedEntityId:
      "condition-decisionflow",

    interventionDelta:
      -0.25,

    expected: {
      conditionDirections: {
        "condition-decisionflow":
          "worsened",

        "condition-coordination":
          "worsened",

        "condition-executioncapacity":
          "worsened",
      },

      recommendation:
        "do-not-proceed",
    },
  },
  {
  id:
    "decision-calibration-003",

  title:
    "Standardize Knowledge Transfer",

  organizationId:
    "atlas-manufacturing-simulation",

  intervention: {
    type:
      "policy",

    title:
      "Standardize Knowledge Transfer",

    description:
      "Introduce a consistent process for documenting, transferring, and retrieving implementation knowledge across teams.",

    rationale:
      "Validate whether stronger organizational knowledge continuity improves coordination, learning, and execution reliability.",

    scope:
      "organization",

    timeHorizon:
      "near-term",

    affectedConditionIds: [
      "condition-knowledgecontinuity",
    ],

    expectedMechanismIds: [
      "mechanism:knowledgeTransferFailure",
      "mechanism:coordinationBreakdown",
    ],

    assumptions: [
      "Teams adopt the knowledge-transfer process consistently.",
      "Documentation remains accessible and is used during onboarding and implementation.",
    ],

    confidence:
      0.8,
  },

  changedEntityId:
    "condition-knowledgecontinuity",

  interventionDelta:
    0.25,

  expected: {
    conditionDirections: {
      "condition-knowledgecontinuity":
        "improved",

      "condition-coordination":
        "improved",

      "condition-executioncapacity":
        "improved",
    },

    recommendation:
      "proceed",
  },
},
{
  id:
    "decision-calibration-004",

  title:
    "Clarify Strategic Priorities",

  organizationId:
    "atlas-manufacturing-simulation",

  intervention: {
    type:
      "strategy",

    title:
      "Clarify Strategic Priorities",

    description:
      "Reduce competing priorities by defining a smaller set of explicit organizational objectives and decision rules.",

    rationale:
      "Validate whether stronger strategic alignment improves downstream decision flow, coordination, and execution.",

    scope:
      "organization",

    timeHorizon:
      "near-term",

    affectedConditionIds: [
      "condition-strategicalignment",
    ],

    expectedMechanismIds: [
      "mechanism:priorityConflict",
      "mechanism:capabilityConstraint",
    ],

    assumptions: [
      "Leadership consistently reinforces the clarified priorities.",
      "Teams use the priorities when making tradeoffs and allocating resources.",
    ],

    confidence:
      0.8,
  },

  changedEntityId:
    "condition-strategicalignment",

  interventionDelta:
    0.25,

  expected: {
    conditionDirections: {
      "condition-strategicalignment":
        "improved",

      "condition-decisionflow":
        "improved",

      "condition-coordination":
        "improved",
    },

    recommendation:
      "proceed",
  },
},
];