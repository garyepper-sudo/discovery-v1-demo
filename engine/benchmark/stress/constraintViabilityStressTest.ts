import type {
  ExecutiveDecision,
} from "../../v3/model/simulate/executiveDecision";

import type {
  InterventionOption,
} from "../../v3/model/simulate/interventionOption";

import {
  evaluateInterventionConstraints,
} from "../../v3/decisions/evaluateInterventionConstraints";

import {
  evaluateInterventionViability,
} from "../../v3/decisions/evaluateInterventionViability";

const FIXED_TIME =
  "2026-07-16T04:00:00.000Z";

const executiveDecision: ExecutiveDecision = {
  id:
    "constraint-stress-decision-001",

  organizationId:
    "constraint-stress-organization",

  type:
    "governance",

  title:
    "Immediate governance change",

  objective:
    "Implement a governance change immediately.",

  rationale:
    "Current decision latency requires immediate action.",

  status:
    "under-review",

  timeHorizon:
    "immediate",

  targetConditionIds: [
    "condition-executioncapacity",
  ],

  successMetrics: [],

  constraints: [
    {
      type:
        "time",

      description:
        "The intervention must be completed immediately.",

      required:
        true,
    },
  ],

  allowedInterventionTypes: [
    "governance",
  ],

  assumptions: [],

  openQuestions: [],

  confidence:
    0.8,

  createdAt:
    FIXED_TIME,

  updatedAt:
    FIXED_TIME,
};

const optionWithoutEvaluations:
  InterventionOption = {
  id:
    "constraint-stress-option-001",

  executiveDecisionId:
    executiveDecision.id,

  organizationId:
    executiveDecision.organizationId,

  type:
    "governance",

  title:
    "Phased governance redesign",

  description:
    "Redesign governance through a medium-term phased implementation.",

  rationale:
    "A phased redesign may improve decision quality.",

  scope:
    "organization",

  timeHorizon:
    "medium-term",

  profile: {
    organizationalScope:
      "organization",

    implementationBurden:
      "high",

    organizationalDisruption:
      "high",

    reversibility:
      "moderate",

    leadershipAttentionRequired:
      "high",

    coordinationRequirement:
      "high",

    expectedTimeToImpact:
      "medium-term",

    implementationRisk:
      "high",

    preconditions: [],
  },

  targetConditionIds: [
    "condition-executioncapacity",
  ],

  expectedMechanismIds: [
    "governanceFriction",
  ],

  constraintEvaluations: [],

  assumptions: [],

  risks: [],

  missingEvidence: [],

  confidence:
    0.8,

  createdAt:
    FIXED_TIME,
};

const option: InterventionOption = {
  ...optionWithoutEvaluations,

  constraintEvaluations:
    evaluateInterventionConstraints({
      executiveDecision,
      option:
        optionWithoutEvaluations,
    }),
};

const viability =
  evaluateInterventionViability({
    executiveDecision,
    option,
  });

console.log("");
console.log(
  "=========================================",
);
console.log(
  "CONSTRAINT VIABILITY STRESS TEST",
);
console.log(
  "=========================================",
);

console.log(
  `Constraint status: ${
    option.constraintEvaluations[0]?.status ??
    "missing"
  }`,
);

console.log(
  `Viability status: ${viability.status}`,
);

console.log(
  `Required violations: ${viability.requiredViolations.length}`,
);

if (
  option.constraintEvaluations[0]?.status !==
    "violated" ||
  viability.status !==
    "disqualified" ||
  viability.requiredViolations.length !==
    1
) {
  console.error(
    "❌ Required constraint violation was not enforced.",
  );

  process.exitCode = 1;
} else {
  console.log(
    "✅ Required constraint violation disqualified the intervention.",
  );
}
