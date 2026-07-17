import {
  buildExecutiveRisks,
} from "../../v3/model/judgment/buildExecutiveRisks";

const NOW =
  "2026-07-17T18:00:00.000Z";

const executiveRisks =
  buildExecutiveRisks({
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
        riskIfIgnored:
          "Priority work will continue to compete for limited capacity, reducing throughput and increasing delivery pressure.",
        supportingMechanismIds: [
          "mechanism:resourceConstraint",
          "mechanism:executionDrag",
          "mechanism:priorityConflict",
        ],
        upstreamConditionIds: [
          "condition-decisionflow",
          "condition-coordination",
        ],
        downstreamConditionIds: [
          "condition-learning",
        ],
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
        riskIfIgnored:
          "Decision queues and escalation dependency are likely to continue slowing execution.",
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
        riskIfIgnored:
          "Cross-functional handoffs are likely to remain fragile and consume additional management attention.",
        supportingMechanismIds: [
          "mechanism:coordinationBreakdown",
        ],
      },
      {
        id:
          "condition-learning",
        name:
          "Learning System",
        status:
          "constrained",
        priority:
          "medium",
        confidence:
          0.57,
        strength:
          0.51,
        whyItMatters:
          "Learning determines whether recurring execution problems become durable operating improvements.",
        riskIfIgnored:
          "Recurring execution failures may persist because lessons are not converted into operating changes.",
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
      executiveRisks.primaryConditionId ===
      "condition-executioncapacity",
  },
  {
    name:
      "Primary unresolved risk is included",
    pass:
      executiveRisks.risks.some(
        (risk) =>
          risk.conditionId ===
          "condition-executioncapacity",
      ),
  },
  {
    name:
      "Connected organizational risks are included",
    pass:
      executiveRisks.risks.some(
        (risk) =>
          risk.conditionId ===
          "condition-decisionflow",
      ) &&
      executiveRisks.risks.some(
        (risk) =>
          risk.conditionId ===
          "condition-coordination",
      ),
  },
  {
    name:
      "Risk consequences are explicit",
    pass:
      executiveRisks.risks.every(
        (risk) =>
          risk.statement.length > 0 &&
          risk.rationale.length > 0,
      ),
  },
  {
    name:
      "Simulation boundary is preserved",
    pass:
      executiveRisks.boundaries.some(
        (boundary) =>
          boundary.includes(
            "does not simulate",
          ),
      ),
  },
  {
    name:
      "Recommendation boundary is preserved",
    pass:
      executiveRisks.boundaries.some(
        (boundary) =>
          boundary.includes(
            "does not select an intervention",
          ),
      ),
  },
  {
    name:
      "Confidence is bounded",
    pass:
      executiveRisks.confidence >= 0 &&
      executiveRisks.confidence <= 1,
  },
  {
    name:
      "Uncertainty is explicit",
    pass:
      executiveRisks.uncertaintySummary.length > 0,
  },
];

console.log("");
console.log(
  "==========================================",
);
console.log(
  "EXECUTIVE RISKS 001",
);
console.log(
  "==========================================",
);
console.log("");
console.log(
  executiveRisks.headline,
);
console.log("");
console.log(
  executiveRisks.executiveRiskSummary,
);
console.log("");
console.log(
  "Risks",
);
console.log(
  "------------------------------------------",
);

for (const risk of executiveRisks.risks) {
  console.log(
    `${risk.severity.toUpperCase()}  ${risk.horizon.toUpperCase()}  ${risk.label}`,
  );
  console.log(
    `  ${risk.statement}`,
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
