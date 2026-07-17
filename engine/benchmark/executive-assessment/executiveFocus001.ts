import {
  buildExecutiveFocus,
} from "../../v3/model/judgment/buildExecutiveFocus";

const NOW =
  "2026-07-17T17:00:00.000Z";

const focus =
  buildExecutiveFocus({
    primaryConditionId:
      "condition-executioncapacity",

    conditions: [
      {
        id:
          "condition-executioncapacity",
        name:
          "Execution Capacity",
        status:
          "constrained",
        priority:
          "high",
        confidence:
          0.62,
        strength:
          0.68,
        whyItMatters:
          "Execution capacity determines whether strategic intent becomes completed work.",
        recommendedExecutiveAction:
          "Reduce concurrent work and protect the highest-leverage priorities.",
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
        status:
          "constrained",
        priority:
          "high",
        confidence:
          0.61,
        strength:
          0.62,
        whyItMatters:
          "Decision flow determines how quickly ambiguity is resolved.",
        supportingMechanismIds: [
          "mechanism:decisionLatency",
        ],
      },
      {
        id:
          "condition-coordination",
        name:
          "Coordination System",
        status:
          "constrained",
        priority:
          "medium",
        confidence:
          0.58,
        strength:
          0.56,
        whyItMatters:
          "Coordination determines whether shared intent becomes synchronized execution.",
        supportingMechanismIds: [
          "mechanism:coordinationBreakdown",
        ],
      },
    ],

    dominantCausalChain: {
      dominantConditionId:
        "condition-executioncapacity",
      rootMechanismIds: [
        "mechanism:resourceConstraint",
        "mechanism:executionDrag",
        "mechanism:priorityConflict",
      ],
      supportingConditionIds: [
        "condition-decisionflow",
        "condition-coordination",
      ],
      confidence:
        0.61,
      uncertaintySummary:
        "Longitudinal evidence remains limited.",
    },

    now:
      NOW,
  });

const checks = [
  {
    name:
      "Primary condition is preserved",
    pass:
      focus.primaryConditionId ===
      "condition-executioncapacity",
  },
  {
    name:
      "Primary focus is immediate",
    pass:
      focus.focusAreas[0]?.priority ===
      "immediate",
  },
  {
    name:
      "Executive direction uses canonical action",
    pass:
      focus.executiveDirection.includes(
        "Reduce concurrent work",
      ),
  },
  {
    name:
      "Supporting conditions are included",
    pass:
      focus.focusAreas.some(
        (area) =>
          area.conditionId ===
          "condition-decisionflow",
      ) &&
      focus.focusAreas.some(
        (area) =>
          area.conditionId ===
          "condition-coordination",
      ),
  },
  {
    name:
      "Recommendation boundary is preserved",
    pass:
      focus.boundaries.some(
        (boundary) =>
          boundary.includes(
            "Recommendation evaluates alternatives",
          ),
      ),
  },
  {
    name:
      "Confidence is bounded",
    pass:
      focus.confidence >= 0 &&
      focus.confidence <= 1,
  },
  {
    name:
      "Uncertainty is explicit",
    pass:
      focus.uncertaintySummary.length >
      0,
  },
];

console.log("");
console.log(
  "==========================================",
);
console.log(
  "EXECUTIVE FOCUS 001",
);
console.log(
  "==========================================",
);
console.log("");
console.log(
  focus.headline,
);
console.log("");
console.log(
  focus.executiveDirection,
);
console.log("");
console.log(
  "Focus areas",
);
console.log(
  "------------------------------------------",
);

for (const area of focus.focusAreas) {
  console.log(
    `${area.priority.toUpperCase()}  ${area.label}`,
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
