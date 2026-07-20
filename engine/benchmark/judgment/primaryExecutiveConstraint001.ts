import {
  buildPrimaryExecutiveConstraint,
  type ExecutivePrimaryConstraint,
} from "../../v3/model/judgment/buildPrimaryExecutiveConstraint";
import type { OrganizationalCondition } from "../../v3/model/state/inferOrganizationalConditions";

const NOW =
  "2026-07-20T12:00:00.000Z";

type AssertionResult = {
  name: string;

  passed: boolean;

  detail?: string;
};

function createCondition(
  overrides: Partial<OrganizationalCondition> & {
    id: string;
    name: string;
  },
): OrganizationalCondition {
  return {
    domain:
      overrides.domain ??
      "execution",

    status:
      overrides.status ??
      ("constrained" as OrganizationalCondition["status"]),

    priority:
      overrides.priority ??
      "medium",

    confidence:
      overrides.confidence ??
      0.75,

    strength:
      overrides.strength ??
      0.7,

    trend:
      overrides.trend ??
      "stable",

    summary:
      overrides.summary ??
      `${overrides.name} is affecting organizational performance.`,

    whyItMatters:
      overrides.whyItMatters ??
      `${overrides.name} limits the organization's ability to execute effectively.`,

    supportingConceptIds:
      overrides.supportingConceptIds ??
      [],

    supportingBeliefIds:
      overrides.supportingBeliefIds ??
      [],

    supportingMechanismIds:
      overrides.supportingMechanismIds ??
      [],

    supportingTheoryIds:
      overrides.supportingTheoryIds ??
      [],

    upstreamConditionIds:
      overrides.upstreamConditionIds ??
      [],

    downstreamConditionIds:
      overrides.downstreamConditionIds ??
      [],

    lastUpdatedAt:
      overrides.lastUpdatedAt ??
      NOW,

    ...overrides,

    id: overrides.id,

    name: overrides.name,
  } as OrganizationalCondition;
}

function assert(
  name: string,
  condition: boolean,
  detail?: string,
): AssertionResult {
  return {
    name,
    passed: condition,
    detail,
  };
}

function stableSerialize(
  value: unknown,
): string {
  return JSON.stringify(
    value,
    Object.keys(
      value as Record<
        string,
        unknown
      >,
    ).sort(),
  );
}

function preserveFullSerialization(
  value: unknown,
): string {
  return JSON.stringify(value);
}

function runPrimaryExecutiveConstraintBenchmark(): void {
  const decisionOwnership =
    createCondition({
      id: "condition-decision-ownership",

      name: "Decision ownership ambiguity",

      priority: "critical",

      confidence: 0.91,

      strength: 0.94,

      trend: "weakening",

      summary:
        "Decision ownership is unclear across product and engineering.",

      whyItMatters:
        "Ambiguous ownership delays decisions, creates rework, and reduces execution throughput.",

      supportingMechanismIds: [
        "mechanism-approval-delay",
        "mechanism-accountability-diffusion",
      ],

      supportingBeliefIds: [
        "belief-ownership-limits-throughput",
      ],

      supportingConceptIds: [
        "concept-decision-latency",
      ],

      supportingTheoryIds: [
        "theory-governance-friction",
      ],

      downstreamConditionIds: [
        "condition-approval-bottleneck",
        "condition-delivery-delay",
      ],
    });

  const approvalBottleneck =
    createCondition({
      id: "condition-approval-bottleneck",

      name: "Approval bottleneck",

      priority: "high",

      confidence: 0.86,

      strength: 0.82,

      trend: "stable",

      summary:
        "Too many approvals are slowing execution.",

      whyItMatters:
        "Approval layers increase cycle time and reduce local decision speed.",

      supportingMechanismIds: [
        "mechanism-approval-delay",
      ],

      supportingBeliefIds: [
        "belief-approval-layers-slow-work",
      ],

      supportingConceptIds: [
        "concept-decision-latency",
      ],

      supportingTheoryIds: [
        "theory-governance-friction",
      ],

      upstreamConditionIds: [
        "condition-decision-ownership",
      ],

      downstreamConditionIds: [
        "condition-delivery-delay",
      ],
    });

  const knowledgeFragmentation =
    createCondition({
      id: "condition-knowledge-fragmentation",

      name: "Knowledge fragmentation",

      priority: "medium",

      confidence: 0.79,

      strength: 0.73,

      trend: "new",

      summary:
        "Critical organizational knowledge is distributed across disconnected sources.",

      whyItMatters:
        "Fragmented knowledge slows coordination and weakens decision quality.",

      supportingMechanismIds: [
        "mechanism-information-fragmentation",
      ],

      supportingBeliefIds: [
        "belief-fragmentation-reduces-coordination",
      ],

      supportingConceptIds: [
        "concept-organizational-memory",
      ],

      supportingTheoryIds: [
        "theory-coordination-friction",
      ],
    });

  const deliveryDelay =
    createCondition({
      id: "condition-delivery-delay",

      name: "Delivery delay",

      priority: "high",

      confidence: 0.83,

      strength: 0.76,

      trend: "weakening",

      summary:
        "Delivery timelines are becoming less predictable.",

      whyItMatters:
        "Unpredictable delivery weakens customer confidence and strategic execution.",

      supportingMechanismIds: [
        "mechanism-delivery-variance",
      ],

      supportingBeliefIds: [
        "belief-delays-reduce-confidence",
      ],

      supportingConceptIds: [
        "concept-execution-reliability",
      ],

      supportingTheoryIds: [
        "theory-execution-friction",
      ],

      upstreamConditionIds: [
        "condition-decision-ownership",
        "condition-approval-bottleneck",
      ],
    });

  const organizationalConditions = [
    knowledgeFragmentation,
    approvalBottleneck,
    deliveryDelay,
    decisionOwnership,
  ];

  const firstResult =
    buildPrimaryExecutiveConstraint({
      organizationalConditions,
      now: NOW,
    });

  const secondResult =
    buildPrimaryExecutiveConstraint({
      organizationalConditions,
      now: NOW,
    });

  const reorderedResult =
    buildPrimaryExecutiveConstraint({
      organizationalConditions: [
        decisionOwnership,
        deliveryDelay,
        approvalBottleneck,
        knowledgeFragmentation,
      ],
      now: NOW,
    });

  const selectedCondition =
    firstResult
      ? organizationalConditions.find(
          (condition) =>
            condition.id ===
            firstResult.conditionId,
        )
      : undefined;

  const emptyResult =
    buildPrimaryExecutiveConstraint({
      organizationalConditions: [],
      now: NOW,
    });

  const assertions: AssertionResult[] = [
    assert(
      "returns exactly one primary constraint",
      firstResult !== null,
      firstResult
        ? `Selected ${firstResult.conditionId}`
        : "No constraint was produced.",
    ),

    assert(
      "selects the expected dominant condition",
      firstResult?.conditionId ===
        decisionOwnership.id,
      firstResult
        ? `Selected ${firstResult.conditionId}`
        : "No constraint was produced.",
    ),

    assert(
      "references an existing OrganizationalCondition",
      selectedCondition !== undefined,
      firstResult
        ? `Referenced ${firstResult.conditionId}`
        : "No condition reference was produced.",
    ),

    assert(
      "preserves selected condition confidence",
      firstResult?.confidence ===
        decisionOwnership.confidence,
      firstResult
        ? `Expected ${decisionOwnership.confidence}; received ${firstResult.confidence}`
        : "No confidence was produced.",
    ),

    assert(
      "produces a normalized leverage score",
      typeof firstResult?.leverageScore ===
        "number" &&
        firstResult.leverageScore >= 0 &&
        firstResult.leverageScore <= 1,
      firstResult
        ? `Leverage score ${firstResult.leverageScore}`
        : "No leverage score was produced.",
    ),

    assert(
      "produces executive-facing summary text",
      Boolean(
        firstResult?.executiveSummary
          .trim()
          .length,
      ),
      firstResult?.executiveSummary,
    ),

    assert(
      "produces why-now reasoning",
      Boolean(
        firstResult?.whyNow
          .trim()
          .length,
      ),
      firstResult?.whyNow,
    ),

    assert(
      "produces expected executive impact",
      Boolean(
        firstResult
          ?.expectedExecutiveImpact
          .trim()
          .length,
      ),
      firstResult?.expectedExecutiveImpact,
    ),

    assert(
      "preserves supporting mechanism ancestry",
      firstResult?.supportingMechanismIds.includes(
        "mechanism-approval-delay",
      ) === true &&
        firstResult.supportingMechanismIds.includes(
          "mechanism-accountability-diffusion",
        ),
      firstResult
        ? firstResult.supportingMechanismIds.join(
            ", ",
          )
        : "No supporting mechanisms were produced.",
    ),

    assert(
      "preserves supporting belief ancestry",
      firstResult?.supportingBeliefIds.includes(
        "belief-ownership-limits-throughput",
      ) === true,
      firstResult
        ? firstResult.supportingBeliefIds.join(
            ", ",
          )
        : "No supporting beliefs were produced.",
    ),

    assert(
      "preserves supporting concept ancestry",
      firstResult?.supportingConceptIds.includes(
        "concept-decision-latency",
      ) === true,
      firstResult
        ? firstResult.supportingConceptIds.join(
            ", ",
          )
        : "No supporting concepts were produced.",
    ),

    assert(
      "preserves supporting theory ancestry",
      firstResult?.supportingTheoryIds.includes(
        "theory-governance-friction",
      ) === true,
      firstResult
        ? firstResult.supportingTheoryIds.join(
            ", ",
          )
        : "No supporting theories were produced.",
    ),

    assert(
      "preserves downstream condition relationships",
      firstResult?.downstreamConditionIds.includes(
        "condition-approval-bottleneck",
      ) === true &&
        firstResult.downstreamConditionIds.includes(
          "condition-delivery-delay",
        ),
      firstResult
        ? firstResult.downstreamConditionIds.join(
            ", ",
          )
        : "No downstream conditions were produced.",
    ),

    assert(
      "produces deterministic output",
      preserveFullSerialization(
        firstResult,
      ) ===
        preserveFullSerialization(
          secondResult,
        ),
      stableSerialize({
        firstResult,
        secondResult,
      }),
    ),

    assert(
      "selection is stable across input order",
      preserveFullSerialization(
        firstResult,
      ) ===
        preserveFullSerialization(
          reorderedResult,
        ),
      stableSerialize({
        firstResult,
        reorderedResult,
      }),
    ),

    assert(
      "uses the supplied deterministic timestamp",
      firstResult?.generatedAt ===
        NOW,
      firstResult?.generatedAt,
    ),

    assert(
      "returns null when no conditions exist",
      emptyResult === null,
      emptyResult === null
        ? "Returned null."
        : "Unexpected constraint produced.",
    ),
  ];

  const passedAssertions =
    assertions.filter(
      (result) => result.passed,
    ).length;

  const failedAssertions =
    assertions.filter(
      (result) => !result.passed,
    );

  console.log("");
  console.log(
    "=========================================",
  );
  console.log(
    "PRIMARY EXECUTIVE CONSTRAINT BENCHMARK 001",
  );
  console.log(
    "=========================================",
  );
  console.log("");

  console.log(
    `Organization conditions: ${organizationalConditions.length}`,
  );

  console.log(
    `Selected constraint: ${
      firstResult?.conditionId ??
      "none"
    }`,
  );

  console.log(
    `Leverage score: ${
      firstResult?.leverageScore ??
      "none"
    }`,
  );

  console.log(
    `Confidence: ${
      firstResult?.confidence ??
      "none"
    }`,
  );

  console.log("");

  for (const result of assertions) {
    console.log(
      `${
        result.passed ? "PASS" : "FAIL"
      } — ${result.name}`,
    );

    if (
      !result.passed &&
      result.detail
    ) {
      console.log(
        `       ${result.detail}`,
      );
    }
  }

  console.log("");
  console.log(
    `Assertions: ${passedAssertions}/${assertions.length} PASS`,
  );

  console.log("");

  if (firstResult) {
    printConstraint(firstResult);
  }

  if (failedAssertions.length > 0) {
    console.log(
      "=========================================",
    );
    console.log(
      "Benchmark status: ❌ FAIL",
    );
    console.log(
      "=========================================",
    );
    console.log("");

    process.exitCode = 1;

    return;
  }

  console.log(
    "=========================================",
  );
  console.log(
    "Benchmark status: ✅ PASS",
  );
  console.log(
    "=========================================",
  );
  console.log("");
}

function printConstraint(
  constraint: ExecutivePrimaryConstraint,
): void {
  console.log(
    "PRIMARY EXECUTIVE CONSTRAINT",
  );
  console.log("");

  console.log(
    constraint.title,
  );

  console.log("");

  console.log(
    constraint.executiveSummary,
  );

  console.log("");

  console.log("Why now");

  console.log(
    constraint.whyNow,
  );

  console.log("");

  console.log(
    "Expected executive impact",
  );

  console.log(
    constraint.expectedExecutiveImpact,
  );

  console.log("");

  console.log(
    `Urgency: ${constraint.urgency}`,
  );

  console.log(
    `Confidence: ${constraint.confidence}`,
  );

  console.log(
    `Leverage: ${constraint.leverageScore}`,
  );

  console.log("");
}

runPrimaryExecutiveConstraintBenchmark();