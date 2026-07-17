import {
  buildDominantCausalChain,
} from "../../v3/model/judgment/buildDominantCausalChain";

const NOW =
  "2026-07-17T16:30:00.000Z";

const causalChain =
  buildDominantCausalChain({
    dominantConditionId:
      "condition-executioncapacity",

    conditions: [
      {
        id:
          "condition-executioncapacity",
        name:
          "Execution Capacity",
        summary:
          "Execution demand exceeds available focus and throughput.",
        whyItMatters:
          "Execution capacity determines whether strategic intent becomes completed work.",
        confidence:
          0.62,
        strength:
          0.68,
        supportingMechanismIds: [
          "mechanism:resourceConstraint",
          "mechanism:executionDrag",
          "mechanism:priorityConflict",
        ],
        upstreamConditionIds: [
          "condition-decisionflow",
          "condition-coordination",
        ],
        downstreamConditionIds: [],
        uncertaintySummary:
          "Longitudinal evidence remains limited.",
      },
      {
        id:
          "condition-decisionflow",
        name:
          "Decision Flow",
        confidence:
          0.61,
        upstreamConditionIds: [],
        downstreamConditionIds: [
          "condition-executioncapacity",
        ],
      },
      {
        id:
          "condition-coordination",
        name:
          "Coordination System",
        confidence:
          0.58,
        upstreamConditionIds: [],
        downstreamConditionIds: [
          "condition-executioncapacity",
        ],
      },
    ],

    mechanisms: [
      {
        id:
          "mechanism:resourceConstraint",
        executiveName:
          "Resource Constraint",
        executiveSummary:
          "Available time, people, and attention are insufficient for current demand.",
        confidence:
          0.64,
      },
      {
        id:
          "mechanism:executionDrag",
        executiveName:
          "Execution Drag",
        executiveSummary:
          "High effort is not converting into proportional progress.",
        confidence:
          0.59,
      },
      {
        id:
          "mechanism:priorityConflict",
        executiveName:
          "Priority Conflict",
        executiveSummary:
          "Competing priorities fragment attention and sequencing.",
        confidence:
          0.57,
      },
    ],

    organizationalState: {
      id:
        "organizational-state-current",
      status:
        "strained",
      summary:
        "The organization is strained.",
      confidence:
        0.63,
      dominantConditions: [
        "condition-executioncapacity",
      ],
    },

    now:
      NOW,
  });

const checks = [
  {
    name:
      "Dominant condition is preserved",
    pass:
      causalChain.dominantConditionId ===
      "condition-executioncapacity",
  },
  {
    name:
      "Root mechanisms are preserved",
    pass:
      causalChain.rootMechanismIds.includes(
        "mechanism:resourceConstraint",
      ) &&
      causalChain.rootMechanismIds.includes(
        "mechanism:executionDrag",
      ),
  },
  {
    name:
      "Supporting conditions are preserved",
    pass:
      causalChain.supportingConditionIds.includes(
        "condition-decisionflow",
      ) &&
      causalChain.supportingConditionIds.includes(
        "condition-coordination",
      ),
  },
  {
    name:
      "Condition shapes organizational state",
    pass:
      causalChain.edges.some(
        (edge) =>
          edge.fromId ===
            "condition-executioncapacity" &&
          edge.toId ===
            "organizational-state-current" &&
          edge.relationship ===
            "shapes",
      ),
  },
  {
    name:
      "Mechanisms contribute to condition",
    pass:
      causalChain.edges.some(
        (edge) =>
          edge.fromId ===
            "mechanism:resourceConstraint" &&
          edge.toId ===
            "condition-executioncapacity" &&
          edge.relationship ===
            "contributes_to",
      ),
  },
  {
    name:
      "Confidence is bounded",
    pass:
      causalChain.confidence >= 0 &&
      causalChain.confidence <= 1,
  },
  {
    name:
      "Executive explanation is present",
    pass:
      causalChain.executiveExplanation.length >
      0,
  },
];

console.log("");
console.log(
  "==========================================",
);
console.log(
  "EXECUTIVE DOMINANT CAUSAL CHAIN 001",
);
console.log(
  "==========================================",
);
console.log("");
console.log(
  causalChain.headline,
);
console.log("");
console.log(
  causalChain.executiveExplanation,
);
console.log("");
console.log(
  "Chain",
);
console.log(
  "------------------------------------------",
);

for (const edge of causalChain.edges) {
  console.log(
    `${edge.fromId} --${edge.relationship}--> ${edge.toId}`,
  );
}

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
