import {
  buildPrimaryExecutiveJudgment,
} from "../../v3/model/judgment/buildPrimaryExecutiveJudgment";

import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../../v3/model/state/inferOrganizationalConditions";

const NOW =
  "2026-07-17T16:00:00.000Z";

const conditions:
  OrganizationalCondition[] = [
    {
      id:
        "condition-executioncapacity",
      name:
        "Execution Capacity",
      domain:
        "executionCapacity",
      status:
        "constrained",
      priority:
        "high",
      confidence:
        0.62,
      strength:
        0.68,
      trend:
        "strengthening",
      summary:
        "Execution demand exceeds available focus and throughput.",
      whyItMatters:
        "Execution capacity determines whether strategic intent becomes completed work.",
      supportingConceptIds: [
        "concept-cross-functional-execution-friction",
      ],
      supportingBeliefIds: [
        "belief-resource-allocation",
      ],
      supportingMechanismIds: [
        "mechanism:resourceConstraint",
        "mechanism:executionDrag",
        "mechanism:priorityConflict",
      ],
      supportingTheoryIds: [
        "theory:cross-functional-execution-friction",
      ],
      recommendedExecutiveAction:
        "Reduce concurrent work and protect the highest-leverage priorities.",
      uncertaintySummary:
        "Workload and prioritization evidence is strong, but longitudinal evidence remains limited.",
      confidenceLimiters: [
        "Longitudinal evidence remains limited.",
      ],
      missingEvidence: [
        "Repeated workload and delivery measurements.",
      ],
      upstreamConditionIds: [
        "condition-decisionflow",
        "condition-coordination",
      ],
      downstreamConditionIds: [],
      lastUpdatedAt:
        NOW,
    },
    {
      id:
        "condition-decisionflow",
      name:
        "Decision Flow",
      domain:
        "decisionFlow",
      status:
        "constrained",
      priority:
        "high",
      confidence:
        0.61,
      strength:
        0.62,
      trend:
        "stable",
      summary:
        "Decision flow is constrained by approval dependency.",
      whyItMatters:
        "Decision flow determines how quickly ambiguity is resolved.",
      supportingConceptIds: [],
      supportingBeliefIds: [],
      supportingMechanismIds: [],
      supportingTheoryIds: [],
      recommendedExecutiveAction:
        "Clarify decision rights.",
      uncertaintySummary:
        "Approval-path evidence remains incomplete.",
      confidenceLimiters: [],
      missingEvidence: [],
      upstreamConditionIds: [],
      downstreamConditionIds: [
        "condition-executioncapacity",
      ],
      lastUpdatedAt:
        NOW,
    },
    {
      id:
        "condition-coordination",
      name:
        "Coordination System",
      domain:
        "coordination",
      status:
        "constrained",
      priority:
        "medium",
      confidence:
        0.58,
      strength:
        0.56,
      trend:
        "stable",
      summary:
        "Cross-functional work requires repeated manual coordination.",
      whyItMatters:
        "Coordination determines whether shared intent becomes synchronized execution.",
      supportingConceptIds: [],
      supportingBeliefIds: [],
      supportingMechanismIds: [],
      supportingTheoryIds: [],
      recommendedExecutiveAction:
        "Clarify ownership and handoffs.",
      uncertaintySummary:
        "Handoff evidence remains incomplete.",
      confidenceLimiters: [],
      missingEvidence: [],
      upstreamConditionIds: [
        "condition-decisionflow",
      ],
      downstreamConditionIds: [
        "condition-executioncapacity",
      ],
      lastUpdatedAt:
        NOW,
    },
  ];

const state:
  OrganizationalState = {
    id:
      "organizational-state-current",
    summary:
      "The organization is strained.",
    status:
      "strained",
    confidence:
      0.63,
    dominantConditions: [
      "condition-executioncapacity",
      "condition-decisionflow",
      "condition-coordination",
    ],
    improvingConditions: [],
    deterioratingConditions: [
      "condition-executioncapacity",
      "condition-decisionflow",
    ],
    unresolvedTensions: [],
    executiveImplication:
      "Leadership should focus on execution capacity.",
    recommendedFocus: [
      "Execution Capacity",
      "Decision Flow",
    ],
    lastUpdatedAt:
      NOW,
  };

const judgment =
  buildPrimaryExecutiveJudgment({
    organizationalState:
      state,
    organizationalConditions:
      conditions,
    now:
      NOW,
  });

const checks = [
  {
    name:
      "Dominant condition is preserved",
    pass:
      judgment.dominantConditionId ===
      "condition-executioncapacity",
  },
  {
    name:
      "Headline names the primary constraint",
    pass:
      judgment.headline.includes(
        "Execution Capacity",
      ) &&
      judgment.headline.includes(
        "primary constraint",
      ),
  },
  {
    name:
      "Supporting conditions are preserved",
    pass:
      judgment.supportingConditionIds.includes(
        "condition-decisionflow",
      ) &&
      judgment.supportingConditionIds.includes(
        "condition-coordination",
      ),
  },
  {
    name:
      "Cognitive ancestry is preserved",
    pass:
      judgment.supportingMechanismIds.includes(
        "mechanism:resourceConstraint",
      ) &&
      judgment.supportingConceptIds.includes(
        "concept-cross-functional-execution-friction",
      ) &&
      judgment.supportingTheoryIds.includes(
        "theory:cross-functional-execution-friction",
      ),
  },
  {
    name:
      "Confidence is bounded",
    pass:
      judgment.confidence >= 0 &&
      judgment.confidence <= 1,
  },
  {
    name:
      "Uncertainty is explicit",
    pass:
      judgment.uncertaintySummary.length >
      0,
  },
];

console.log("");
console.log(
  "==========================================",
);
console.log(
  "EXECUTIVE PRIMARY JUDGMENT 001",
);
console.log(
  "==========================================",
);
console.log("");
console.log(
  judgment.headline,
);
console.log("");
console.log(
  judgment.executiveJudgment,
);
console.log("");
console.log(
  `Confidence: ${judgment.confidence.toFixed(
    3,
  )} (${judgment.confidenceLevel})`,
);
console.log("");
console.log(
  "Checks",
);
console.log(
  "------------------------------------------",
);

for (const check of checks) {
  console.log(
    `${check.pass ? "PASS" : "FAIL"}  ${check.name}`,
  );
}

const failed =
  checks.filter(
    (check) => !check.pass,
  );

console.log("");
console.log(
  "==========================================",
);
console.log(
  "VALIDATION RESULT",
);
console.log(
  "==========================================",
);
console.log("");
console.log(
  failed.length === 0
    ? "PASS"
    : `FAIL (${failed.length} check(s))`,
);
console.log("");

if (failed.length > 0) {
  process.exitCode = 1;
}
