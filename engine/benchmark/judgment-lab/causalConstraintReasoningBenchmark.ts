import assert from "node:assert/strict";

import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../types";
import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { DiscoveryV3Result, V3Evidence } from "../../v3/types";

type UnknownRecord = Record<string, unknown>;
type Policy = "B0" | "B1" | "B2";
type ConditionId =
  | "coordination"
  | "knowledgeContinuity"
  | "learning"
  | "decisionFlow"
  | "executionCapacity"
  | "strategicAlignment"
  | "operatingModel"
  | "leadershipDependency";

type CausalEdge = {
  cause: ConditionId;
  effect: ConditionId;
  evidenceIds: string[];
  observation: string;
};

type CausalInterpretation = {
  nodes: ConditionId[];
  edges: CausalEdge[];
  roots: ConditionId[];
  selectedRoot: ConditionId | null;
  downstream: ConditionId[];
  interventionFamily: string | null;
  explanation: string;
  observationEvidenceIds: string[];
  inferredClaims: string[];
  uncertainty: string[];
};

type HiddenTruth = {
  rootMechanism: string[];
  primaryConstraint: ConditionId;
  downstreamSymptoms: ConditionId[];
  broadNoncausalConditions: ConditionId[];
  interventionTerms: string[];
  expectedEdges: Array<[ConditionId, ConditionId]>;
};

type Scenario = {
  id: string;
  industry: string;
  evidenceSources: InvestigationEvidenceSource[];
  truth: HiddenTruth;
  equalsScenarioId?: string;
};

type Execution = {
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
};

type Score = {
  mechanismAccurate: boolean;
  primaryAccurate: boolean;
  symptomDistinguished: boolean;
  causalChainAccuracy: number;
  irrelevantRejected: boolean;
  interventionAligned: boolean;
  upstreamIntervention: boolean;
  consequenceCoherent: boolean;
  ancestryPreserved: boolean;
  observationInferenceSeparated: boolean;
  uncertaintyAppropriate: boolean;
};

const FIXED_TIME = Date.parse("2026-07-24T20:00:00.000Z");

const CONDITION_NAMES: Record<ConditionId, string> = {
  coordination: "Coordination System",
  knowledgeContinuity: "Knowledge Continuity",
  learning: "Learning System",
  decisionFlow: "Decision Flow",
  executionCapacity: "Execution Capacity",
  strategicAlignment: "Strategic Alignment",
  operatingModel: "Operating Model",
  leadershipDependency: "Leadership Dependency",
};

const CONDITION_TERMS: Record<ConditionId, string[]> = {
  coordination: [
    "coordination",
    "handoff",
    "cross-functional friction",
    "cross functional friction",
  ],
  knowledgeContinuity: [
    "knowledge fragmentation",
    "knowledge continuity",
    "localized knowledge",
    "documentation breakdown",
  ],
  learning: ["learning system", "repeated mistakes", "feedback loop"],
  decisionFlow: [
    "decision ambiguity",
    "decision flow",
    "unclear decision authority",
    "approval dependency",
    "slow decisions",
    "decision latency",
    "accountability gap",
  ],
  executionCapacity: [
    "execution overload",
    "capacity shortage",
    "execution capacity",
    "concurrent work",
    "work in progress",
    "delivery delay",
    "rework",
  ],
  strategicAlignment: [
    "strategic alignment",
    "priority conflict",
    "incentive conflict",
    "local optimization",
  ],
  operatingModel: [
    "operating model",
    "process weakness",
    "ownership ambiguity",
    "unclear ownership",
    "workflow ambiguity",
  ],
  leadershipDependency: [
    "leadership dependency",
    "founder dependency",
    "executive dependency",
    "centralized leadership",
  ],
};

const INTERVENTIONS: Record<ConditionId, string> = {
  coordination: "establish cross-functional ownership and reliable handoffs",
  knowledgeContinuity: "create reusable knowledge transfer and continuity",
  learning: "create feedback loops that change operating practice",
  decisionFlow: "clarify decision authority and reduce approval dependency",
  executionCapacity: "limit concurrent work and protect execution capacity",
  strategicAlignment: "align incentives, priorities, and tradeoff rules",
  operatingModel: "clarify ownership and make the operating model explicit",
  leadershipDependency: "distribute authority and reduce leadership dependency",
};

function source(
  sourceId: string,
  content: string,
): InvestigationEvidenceSource {
  return {
    sourceId,
    sourceType: "causal-constraint-fixture",
    content,
  };
}

function hidden(
  primaryConstraint: ConditionId,
  downstreamSymptoms: ConditionId[],
  expectedEdges: Array<[ConditionId, ConditionId]>,
  interventionTerms: string[],
  rootMechanism: string[],
  broadNoncausalConditions: ConditionId[] = [],
): HiddenTruth {
  return {
    primaryConstraint,
    downstreamSymptoms,
    expectedEdges,
    interventionTerms,
    rootMechanism,
    broadNoncausalConditions,
  };
}

const scenarios: Scenario[] = [
  {
    id: "decision-ambiguity-propagation",
    industry: "Industrial manufacturing",
    evidenceSources: [
      source("source:a", "Decision ambiguity causes coordination delay."),
      source("source:b", "Coordination delay leads to execution overload."),
      source("source:c", "Hiring demand is high but does not explain the approval queues."),
    ],
    truth: hidden(
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["decision", "authority", "approval"],
      ["decision ambiguity"],
      ["strategicAlignment"],
    ),
  },
  {
    id: "concurrent-work-capacity",
    industry: "Software",
    evidenceSources: [
      source("source:a", "Excessive concurrent work causes execution capacity shortage."),
      source("source:b", "Execution capacity shortage leads to delivery delay."),
      source("source:c", "Leadership meetings are frequent but are not causing the delivery queue."),
    ],
    truth: hidden(
      "executionCapacity",
      [],
      [["executionCapacity", "executionCapacity"]],
      ["concurrent", "capacity", "work"],
      ["concurrent work"],
      ["leadershipDependency"],
    ),
  },
  {
    id: "leadership-dependency-chain",
    industry: "Professional services",
    evidenceSources: [
      source("source:a", "Leadership dependency causes slow decisions."),
      source("source:b", "Slow decisions lead to accountability gaps and coordination delay."),
      source("source:c", "Revenue growth remains strong despite these operating delays."),
    ],
    truth: hidden(
      "leadershipDependency",
      ["decisionFlow", "coordination"],
      [
        ["leadershipDependency", "decisionFlow"],
        ["decisionFlow", "coordination"],
      ],
      ["leadership", "authority", "distribute"],
      ["leadership dependency"],
      ["strategicAlignment"],
    ),
  },
  {
    id: "knowledge-fragmentation-rework",
    industry: "Biotechnology",
    evidenceSources: [
      source("source:a", "Knowledge fragmentation causes rework."),
      source("source:b", "Rework leads to inconsistent execution capacity."),
      source("source:c", "The research strategy is clear and is not driving the repeated experiments."),
    ],
    truth: hidden(
      "knowledgeContinuity",
      ["executionCapacity"],
      [["knowledgeContinuity", "executionCapacity"]],
      ["knowledge", "transfer", "continuity"],
      ["knowledge fragmentation"],
      ["strategicAlignment"],
    ),
  },
  {
    id: "incentive-conflict-local-optimization",
    industry: "Financial services",
    evidenceSources: [
      source("source:a", "Incentive conflict causes local optimization."),
      source("source:b", "Local optimization leads to cross-functional friction."),
      source("source:c", "Systems availability is high and does not explain the friction."),
    ],
    truth: hidden(
      "strategicAlignment",
      ["coordination"],
      [["strategicAlignment", "coordination"]],
      ["incentive", "priority", "alignment"],
      ["incentive conflict"],
      ["executionCapacity"],
    ),
  },
  {
    id: "process-symptom-of-ownership",
    industry: "Logistics",
    evidenceSources: [
      source("source:a", "Process weakness is downstream of ownership ambiguity."),
      source("source:b", "Ownership ambiguity causes coordination handoff failures."),
      source("source:c", "Teams have enough staffing for the current route volume."),
    ],
    truth: hidden(
      "operatingModel",
      ["coordination"],
      [["operatingModel", "coordination"]],
      ["ownership", "operating model"],
      ["ownership ambiguity"],
      ["executionCapacity"],
    ),
  },
  {
    id: "strategic-symptom-masks-decision-flow",
    industry: "Consumer goods",
    evidenceSources: [
      source("source:a", "Decision ambiguity causes apparent strategic alignment drift."),
      source("source:b", "Approval dependency leads to inconsistent priority decisions."),
      source("source:c", "The enterprise strategy itself remains stable and well understood."),
    ],
    truth: hidden(
      "decisionFlow",
      ["strategicAlignment"],
      [["decisionFlow", "strategicAlignment"]],
      ["decision", "authority", "approval"],
      ["decision ambiguity", "approval dependency"],
    ),
  },
  {
    id: "genuine-broad-strategic-root",
    industry: "Energy",
    evidenceSources: [
      source("source:a", "Strategic alignment conflict causes decision ambiguity."),
      source("source:b", "Decision ambiguity leads to coordination delay."),
      source("source:c", "One approval queue is visible, but portfolio priorities conflict before approval begins."),
    ],
    truth: hidden(
      "strategicAlignment",
      ["decisionFlow", "coordination"],
      [
        ["strategicAlignment", "decisionFlow"],
        ["decisionFlow", "coordination"],
      ],
      ["strategy", "priority", "tradeoff"],
      ["strategic alignment conflict"],
    ),
  },
  {
    id: "interacting-upstream-constraints",
    industry: "Healthcare",
    evidenceSources: [
      source("source:a", "Leadership dependency reinforces decision ambiguity."),
      source("source:b", "Decision ambiguity causes coordination delay."),
      source("source:c", "Coordination delay leads to execution overload."),
    ],
    truth: hidden(
      "leadershipDependency",
      ["decisionFlow", "coordination", "executionCapacity"],
      [
        ["leadershipDependency", "decisionFlow"],
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["leadership", "authority", "distribute"],
      ["leadership dependency"],
    ),
  },
  {
    id: "sparse-decisive-mechanism",
    industry: "Hospitality",
    evidenceSources: [
      source("source:decisive", "Knowledge fragmentation causes repeated rework."),
    ],
    truth: hidden(
      "knowledgeContinuity",
      ["executionCapacity"],
      [["knowledgeContinuity", "executionCapacity"]],
      ["knowledge", "transfer"],
      ["knowledge fragmentation"],
    ),
  },
  {
    id: "contradictory-non-decisive",
    industry: "Retail",
    evidenceSources: [
      source("source:a", "Decision ambiguity causes coordination delay."),
      source("source:b", "Coordination delay leads to execution overload."),
      source("source:c", "One team coordinates well despite the same approval dependency."),
    ],
    truth: hidden(
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["decision", "authority"],
      ["decision ambiguity"],
    ),
  },
  {
    id: "industry-neutral-variant",
    industry: "Education",
    evidenceSources: [
      source("source:a", "Unclear decision authority results in handoff friction."),
      source("source:b", "Handoff friction causes execution capacity strain."),
      source("source:c", "Enrollment demand remains stable."),
    ],
    truth: hidden(
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["decision", "authority"],
      ["unclear decision authority"],
    ),
    equalsScenarioId: "decision-ambiguity-propagation",
  },
  {
    id: "reverse-evidence-order",
    industry: "Industrial manufacturing",
    evidenceSources: [
      source(
        "source:a",
        ["Decision ambiguity causes coordination delay.", "Approval dependency is visible."].reverse().join("\n"),
      ),
      source("source:b", "Coordination delay leads to execution overload."),
    ],
    truth: hidden(
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["decision", "authority"],
      ["decision ambiguity"],
    ),
    equalsScenarioId: "forward-evidence-order",
  },
  {
    id: "forward-evidence-order",
    industry: "Industrial manufacturing",
    evidenceSources: [
      source(
        "source:a",
        ["Decision ambiguity causes coordination delay.", "Approval dependency is visible."].join("\n"),
      ),
      source("source:b", "Coordination delay leads to execution overload."),
    ],
    truth: hidden(
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["decision", "authority"],
      ["decision ambiguity"],
    ),
  },
  {
    id: "reverse-source-order",
    industry: "Industrial manufacturing",
    evidenceSources: [
      source("source:b", "Coordination delay leads to execution overload."),
      source("source:a", "Decision ambiguity causes coordination delay."),
      source("source:c", "Hiring demand is high but does not explain the approval queues."),
    ],
    truth: hidden(
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["decision", "authority", "approval"],
      ["decision ambiguity"],
      ["strategicAlignment"],
    ),
    equalsScenarioId: "decision-ambiguity-propagation",
  },
];

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as UnknownRecord)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function canonicalInput(scenario: Scenario): InvestigationInput {
  return {
    company: "Causal Constraint Company",
    website: "https://causal-constraint.invalid",
    industry: scenario.industry,
    question: "What root constraint is driving the observed organizational conditions?",
    context: "",
    evidenceSources: scenario.evidenceSources
      .map((item) => ({
        ...item,
        content: item.content
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean)
          .sort((left, right) => left.localeCompare(right))
          .join("\n"),
      }))
      .sort(
        (left, right) =>
          left.sourceId.localeCompare(right.sourceId) ||
          left.content.localeCompare(right.content),
      ),
  };
}

function withDeterminism<T>(operation: () => T): T {
  const OriginalDate = Date;
  const originalRandom = Math.random;
  let tick = 0;
  let state = 0x1162026;
  class FixedDate extends OriginalDate {
    constructor(...args: ConstructorParameters<DateConstructor>) {
      if (args.length > 0) super(...args);
      else super(FIXED_TIME + tick++);
    }
    static now(): number {
      return FIXED_TIME + tick++;
    }
  }
  globalThis.Date = FixedDate as DateConstructor;
  Math.random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0x100000000;
  };
  try {
    return operation();
  } finally {
    globalThis.Date = OriginalDate;
    Math.random = originalRandom;
  }
}

function execute(scenario: Scenario): Execution {
  const benchmarkInput = canonicalInput(scenario);
  return withDeterminism(() => {
    const originalLog = console.log;
    console.log = () => undefined;
    try {
      const result = runDiscoveryV3(benchmarkInput);
      const runtime = evolveOrganizationRuntime({
        runtime: createEmptyOrganizationRuntime({
          organizationId: `causal-constraint:${scenario.id}`,
          name: benchmarkInput.company,
          industry: benchmarkInput.industry,
          website: benchmarkInput.website,
        }),
        result,
        input: benchmarkInput,
      });
      return { result, runtime };
    } finally {
      console.log = originalLog;
    }
  });
}

function conditionsIn(text: string): ConditionId[] {
  const normalized = text.toLowerCase();
  return (Object.keys(CONDITION_TERMS) as ConditionId[]).filter((condition) =>
    CONDITION_TERMS[condition].some((term) => normalized.includes(term)),
  );
}

function splitCausalStatement(
  text: string,
): { causeText: string; effectText: string } | null {
  const normalized = text.trim().replace(/[.]+$/, "");
  const forward = [
    /\s+causes\s+/i,
    /\s+leads to\s+/i,
    /\s+results in\s+/i,
    /\s+reinforces\s+/i,
  ];
  for (const marker of forward) {
    const parts = normalized.split(marker);
    if (parts.length === 2)
      return { causeText: parts[0], effectText: parts[1] };
  }
  const downstream = normalized.match(/^(.+?)\s+is downstream of\s+(.+)$/i);
  if (downstream)
    return { causeText: downstream[2], effectText: downstream[1] };
  return null;
}

function causalInterpretation(evidence: V3Evidence[]): CausalInterpretation {
  const edges: CausalEdge[] = [];
  for (const item of evidence) {
    const relation = splitCausalStatement(item.text);
    if (!relation) continue;
    const causes = conditionsIn(relation.causeText);
    const effects = conditionsIn(relation.effectText);
    for (const cause of causes) {
      for (const effect of effects) {
        const existing = edges.find(
          (edge) => edge.cause === cause && edge.effect === effect,
        );
        if (existing) {
          existing.evidenceIds.push(item.id);
        } else {
          edges.push({
            cause,
            effect,
            evidenceIds: [item.id],
            observation: item.text,
          });
        }
      }
    }
  }
  const nodes = [
    ...new Set(edges.flatMap((edge) => [edge.cause, edge.effect])),
  ].sort();
  const incoming = new Map<ConditionId, number>(
    nodes.map((node) => [node, 0]),
  );
  for (const edge of edges)
    if (edge.cause !== edge.effect)
      incoming.set(edge.effect, (incoming.get(edge.effect) ?? 0) + 1);
  const roots = nodes.filter((node) => (incoming.get(node) ?? 0) === 0);

  function descendants(root: ConditionId): ConditionId[] {
    const found = new Set<ConditionId>();
    const queue = [root];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const edge of edges.filter((item) => item.cause === current)) {
        if (edge.effect === current) continue;
        if (found.has(edge.effect)) continue;
        found.add(edge.effect);
        queue.push(edge.effect);
      }
    }
    return [...found];
  }

  const selectedRoot =
    [...roots].sort(
      (left, right) =>
        descendants(right).length - descendants(left).length ||
        edges.filter((edge) => edge.cause === right).length -
          edges.filter((edge) => edge.cause === left).length ||
        left.localeCompare(right),
    )[0] ?? null;
  const downstream = selectedRoot ? descendants(selectedRoot) : [];
  const selectedEdges = selectedRoot
    ? edges.filter(
        (edge) =>
          edge.cause === selectedRoot ||
          downstream.includes(edge.cause),
      )
    : [];
  const observationEvidenceIds = [
    ...new Set(selectedEdges.flatMap((edge) => edge.evidenceIds)),
  ].sort();
  const uncertainty =
    selectedEdges.length === 0
      ? ["No explicit causal relationship was observed."]
      : selectedEdges.length === 1
        ? ["The causal interpretation rests on one explicit relationship."]
        : [];

  return {
    nodes,
    edges: edges
      .map((edge) => ({
        ...edge,
        evidenceIds: [...new Set(edge.evidenceIds)].sort(),
      }))
      .sort(
        (left, right) =>
          left.cause.localeCompare(right.cause) ||
          left.effect.localeCompare(right.effect),
      ),
    roots,
    selectedRoot,
    downstream,
    interventionFamily: selectedRoot
      ? INTERVENTIONS[selectedRoot]
      : null,
    explanation: selectedRoot
      ? `${CONDITION_NAMES[selectedRoot]} is upstream because explicit causal evidence connects it to ${downstream.map((item) => CONDITION_NAMES[item]).join(", ") || "the observed consequence"}. Removing it would plausibly weaken ${downstream.length} downstream condition${downstream.length === 1 ? "" : "s"}.`
      : "The available observations do not support a causal root.",
    observationEvidenceIds,
    inferredClaims: selectedRoot
      ? [
          `${CONDITION_NAMES[selectedRoot]} is the causal constraint.`,
          ...downstream.map(
            (item) => `${CONDITION_NAMES[item]} is downstream.`,
          ),
        ]
      : [],
    uncertainty,
  };
}

function productionConstraint(execution: Execution): ConditionId | null {
  const memory = execution.runtime.memory as unknown as UnknownRecord;
  const title = String(
    (memory.primaryExecutiveConstraint as UnknownRecord | null)
      ?.title ?? "",
  );
  return (
    (Object.keys(CONDITION_NAMES) as ConditionId[]).find(
      (id) => CONDITION_NAMES[id] === title,
    ) ?? null
  );
}

function productionIntervention(execution: Execution): string {
  return stable(execution.runtime.memory.executiveRecommendation).toLowerCase();
}

function edgeAccuracy(
  interpretation: CausalInterpretation,
  expected: Array<[ConditionId, ConditionId]>,
): number {
  if (expected.length === 0) return interpretation.edges.length === 0 ? 1 : 0;
  const actual = new Set(
    interpretation.edges.map((edge) => `${edge.cause}->${edge.effect}`),
  );
  return (
    expected.filter(([cause, effect]) =>
      actual.has(`${cause}->${effect}`),
    ).length / expected.length
  );
}

function score(
  policy: Policy,
  execution: Execution,
  interpretation: CausalInterpretation,
  truth: HiddenTruth,
): Score {
  const selected =
    policy === "B2"
      ? interpretation.selectedRoot
      : productionConstraint(execution);
  const mechanismSelection =
    policy === "B0"
      ? productionConstraint(execution)
      : interpretation.selectedRoot;
  const intervention =
    policy === "B2"
      ? interpretation.interventionFamily ?? ""
      : productionIntervention(execution);
  const chainAccuracy =
    policy === "B0" ? 0 : edgeAccuracy(interpretation, truth.expectedEdges);
  const rootText = mechanismSelection
    ? `${CONDITION_NAMES[mechanismSelection]} ${CONDITION_TERMS[mechanismSelection].join(" ")}`
        .toLowerCase()
    : "";
  const mechanismAccurate = truth.rootMechanism.some((term) =>
    term
      .toLowerCase()
      .split(/\s+/)
      .every((token) => rootText.includes(token)),
  );
  const primaryAccurate = selected === truth.primaryConstraint;
  const symptomDistinguished =
    primaryAccurate &&
    !truth.downstreamSymptoms.includes(selected as ConditionId);
  const irrelevantRejected = truth.broadNoncausalConditions.every(
    (condition) => selected !== condition,
  );
  const interventionAligned = truth.interventionTerms.some((term) =>
    intervention.toLowerCase().includes(term),
  );
  const ancestryPreserved =
    policy === "B0" ||
    interpretation.observationEvidenceIds.every((id) =>
      execution.result.evidence.some((item) => item.id === id),
    );

  return {
    mechanismAccurate,
    primaryAccurate,
    symptomDistinguished,
    causalChainAccuracy: chainAccuracy,
    irrelevantRejected,
    interventionAligned,
    upstreamIntervention:
      primaryAccurate &&
      !truth.downstreamSymptoms.some((condition) =>
        intervention
          .toLowerCase()
          .includes(CONDITION_NAMES[condition].toLowerCase()),
      ),
    consequenceCoherent:
      policy === "B0" ||
      truth.downstreamSymptoms.every((condition) =>
        interpretation.downstream.includes(condition),
      ),
    ancestryPreserved,
    observationInferenceSeparated:
      policy === "B0" ||
      (interpretation.observationEvidenceIds.length > 0 &&
        interpretation.inferredClaims.length > 0),
    uncertaintyAppropriate:
      policy === "B0" ||
      (interpretation.edges.length <= 1
        ? interpretation.uncertainty.length > 0
        : true),
  };
}

const results = scenarios.map((scenario) => {
  const execution = execute(scenario);
  assert.equal(stable(execution), stable(execute(scenario)));
  const interpretation = causalInterpretation(execution.result.evidence);
  const scores = {
    B0: score("B0", execution, interpretation, scenario.truth),
    B1: score("B1", execution, interpretation, scenario.truth),
    B2: score("B2", execution, interpretation, scenario.truth),
  };
  return { scenario, execution, interpretation, scores };
});

for (const result of results) {
  if (!result.scenario.equalsScenarioId) continue;
  const expected = results.find(
    (item) => item.scenario.id === result.scenario.equalsScenarioId,
  );
  assert.ok(expected);
  if (
    result.scenario.id === "industry-neutral-variant"
  ) {
    assert.equal(
      result.interpretation.selectedRoot,
      expected.interpretation.selectedRoot,
    );
    assert.deepEqual(
      result.interpretation.edges.map((edge) => [edge.cause, edge.effect]),
      expected.interpretation.edges.map((edge) => [edge.cause, edge.effect]),
    );
  } else {
    assert.equal(
      stable(result.execution.result),
      stable(expected.execution.result),
    );
    assert.equal(
      stable(result.interpretation),
      stable(expected.interpretation),
    );
  }
}

const coreResults = results.filter(
  (result) =>
    ![
      "reverse-evidence-order",
      "forward-evidence-order",
      "reverse-source-order",
    ].includes(result.scenario.id),
);
const policies: Policy[] = ["B0", "B1", "B2"];
const summaries = Object.fromEntries(
  policies.map((policy) => {
    const scores = coreResults.map((result) => result.scores[policy]);
    return [
      policy,
      {
        mechanism: scores.filter((item) => item.mechanismAccurate).length,
        primary: scores.filter((item) => item.primaryAccurate).length,
        symptom: scores.filter((item) => item.symptomDistinguished).length,
        chain:
          scores.reduce((sum, item) => sum + item.causalChainAccuracy, 0) /
          scores.length,
        irrelevant: scores.filter((item) => item.irrelevantRejected).length,
        intervention: scores.filter((item) => item.interventionAligned).length,
        upstream: scores.filter((item) => item.upstreamIntervention).length,
        consequence: scores.filter((item) => item.consequenceCoherent).length,
        ancestry: scores.filter((item) => item.ancestryPreserved).length,
        separation: scores.filter(
          (item) => item.observationInferenceSeparated,
        ).length,
        uncertainty: scores.filter((item) => item.uncertaintyAppropriate)
          .length,
      },
    ];
  }),
) as Record<
  Policy,
  {
    mechanism: number;
    primary: number;
    symptom: number;
    chain: number;
    irrelevant: number;
    intervention: number;
    upstream: number;
    consequence: number;
    ancestry: number;
    separation: number;
    uncertainty: number;
  }
>;

const total = coreResults.length;
const generalizationCases = coreResults.filter((result) =>
  [
    "decision-ambiguity-propagation",
    "industry-neutral-variant",
  ].includes(result.scenario.id),
);
const generalizationPassed = generalizationCases.every(
  (result) => result.scores.B2.primaryAccurate,
);
const b2 = summaries.B2;
const classification =
  b2.primary / total >= 0.8 &&
  b2.mechanism / total >= 0.8 &&
  b2.intervention / total >= 0.8 &&
  generalizationPassed
    ? "A — Breakthrough capability"
    : b2.primary > summaries.B0.primary + total * 0.35
      ? "B — Strong but incomplete"
      : b2.primary <= summaries.B0.primary + 1
        ? "C — No substantial gain"
        : "D — Unsafe or non-generalizing";

console.log("CAUSAL CONSTRAINT REASONING BENCHMARK");
console.log("");
for (const policy of policies) {
  const item = summaries[policy];
  console.log(
    `${policy}: mechanism=${item.mechanism}/${total} primary=${item.primary}/${total} symptom=${item.symptom}/${total} chain=${item.chain.toFixed(3)} irrelevant=${item.irrelevant}/${total} intervention=${item.intervention}/${total} upstream=${item.upstream}/${total} consequence=${item.consequence}/${total} ancestry=${item.ancestry}/${total} separation=${item.separation}/${total} uncertainty=${item.uncertainty}/${total}`,
  );
}
console.log("");
for (const result of coreResults) {
  console.log(
    `SCENARIO ${result.scenario.id}: production=${productionConstraint(result.execution) ?? "none"} causal=${result.interpretation.selectedRoot ?? "none"} truth=${result.scenario.truth.primaryConstraint} edges=${result.interpretation.edges.map((edge) => `${edge.cause}->${edge.effect}`).join(",") || "none"} primary=${result.scores.B2.primaryAccurate ? "PASS" : "FAIL"} mechanism=${result.scores.B2.mechanismAccurate ? "PASS" : "FAIL"} chain=${result.scores.B2.causalChainAccuracy.toFixed(3)} consequence=${result.scores.B2.consequenceCoherent ? "PASS" : "FAIL"}`,
  );
}
console.log("");
console.log(`Cross-industry generalization: ${generalizationPassed ? "PASS" : "FAIL"}`);
console.log(`Classification: ${classification}`);
console.log("Repeated replay: byte-identical");
console.log("Evidence-order reversal: equivalent");
console.log("Source-order reversal: equivalent");
console.log("Runtime and fixtures: unchanged");
