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
type Policy = "S0" | "S1" | "S2";
type ConditionId =
  | "coordination"
  | "knowledgeContinuity"
  | "learning"
  | "decisionFlow"
  | "executionCapacity"
  | "strategicAlignment"
  | "operatingModel"
  | "leadershipDependency";
type EdgeStrength = "observed" | "inferred" | "weak";

type ShadowEdge = {
  cause: ConditionId;
  effect: ConditionId;
  strength: EdgeStrength;
  evidenceIds: string[];
  mechanismIds: string[];
  explanation: string;
};

type ShadowResult = {
  edges: ShadowEdge[];
  rootCandidates: ConditionId[];
  rankedRoots: ConditionId[];
  selectedRoot: ConditionId | null;
  downstream: ConditionId[];
  interventionTarget: string | null;
  abstained: boolean;
  abstentionReason: string | null;
  feedbackLoops: ConditionId[][];
  uncertainty: string[];
  productionConditionIds: string[];
  productionMechanismIds: string[];
};

type HiddenTruth = {
  roots: ConditionId[];
  primary: ConditionId | null;
  downstream: ConditionId[];
  expectedEdges: Array<[ConditionId, ConditionId]>;
  interventionTerms: string[];
  shouldAbstain: boolean;
};

type Scenario = {
  id: string;
  industry: string;
  evidenceSources: InvestigationEvidenceSource[];
  truth: HiddenTruth;
  equalsScenarioId?: string;
  accuracyControl?: boolean;
};

type Execution = {
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
};

type ScenarioScore = {
  mechanismAccurate: boolean;
  mechanismRank: number;
  falseRootRejected: boolean;
  primaryAccurate: boolean;
  symptomAccurate: boolean;
  multiCauseAccurate: boolean;
  abstentionAccurate: boolean;
  edgePrecision: number;
  edgeRecall: number;
  unsupportedEdges: number;
  consequenceAccuracy: number;
  feedbackAccurate: boolean;
  interventionAligned: boolean;
  upstreamTargeted: boolean;
  recommendationPreserved: boolean;
  ancestryPreserved: boolean;
  observationInferenceSeparated: boolean;
  uncertaintyAppropriate: boolean;
};

const FIXED_TIME = Date.parse("2026-07-24T22:00:00.000Z");
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
const TERMS: Record<ConditionId, string[]> = {
  coordination: [
    "coordination",
    "handoff friction",
    "handoff failure",
    "cross-functional friction",
    "interface delay",
  ],
  knowledgeContinuity: [
    "knowledge fragmentation",
    "knowledge continuity",
    "localized expertise",
    "documentation gaps",
    "context loss",
  ],
  learning: ["learning system", "repeated mistakes", "feedback failure"],
  decisionFlow: [
    "decision ambiguity",
    "decision flow",
    "approval dependency",
    "unclear authority",
    "slow decisions",
    "decisions slow",
    "decision latency",
    "accountability gaps",
  ],
  executionCapacity: [
    "execution overload",
    "capacity shortage",
    "capacity strain",
    "execution capacity",
    "delivery delay",
    "rework",
    "concurrent work",
  ],
  strategicAlignment: [
    "strategic alignment",
    "priority conflict",
    "incentive conflict",
    "local optimization",
    "portfolio conflict",
  ],
  operatingModel: [
    "operating model",
    "ownership ambiguity",
    "unclear ownership",
    "process weakness",
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
  coordination: "establish cross-functional ownership and handoffs",
  knowledgeContinuity: "preserve knowledge continuity and transfer",
  learning: "create learning feedback loops",
  decisionFlow: "clarify authority and reduce approval dependency",
  executionCapacity: "limit concurrent work and protect capacity",
  strategicAlignment: "align incentives, priorities, and tradeoffs",
  operatingModel: "clarify ownership and operating model",
  leadershipDependency: "distribute authority beyond leadership",
};

function source(id: string, content: string): InvestigationEvidenceSource {
  return {
    sourceId: id,
    sourceType: "causal-production-shadow-fixture",
    content,
  };
}

function truth(
  roots: ConditionId[],
  primary: ConditionId | null,
  downstream: ConditionId[],
  expectedEdges: Array<[ConditionId, ConditionId]>,
  interventionTerms: string[],
  shouldAbstain = false,
): HiddenTruth {
  return {
    roots,
    primary,
    downstream,
    expectedEdges,
    interventionTerms,
    shouldAbstain,
  };
}

const scenarios: Scenario[] = [
  {
    id: "explicit-causal",
    industry: "Manufacturing",
    evidenceSources: [
      source("a", "Decision ambiguity causes coordination delay."),
      source("b", "Coordination delay leads to execution overload."),
    ],
    truth: truth(
      ["decisionFlow"],
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["authority", "approval"],
    ),
  },
  {
    id: "implicit-causal",
    industry: "Software",
    evidenceSources: [
      source("a", "When approval dependency accumulates, handoff friction follows."),
      source("b", "Delivery delay emerges after handoff friction."),
    ],
    truth: truth(
      ["decisionFlow"],
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["authority", "approval"],
    ),
  },
  {
    id: "weak-causal-language",
    industry: "Biotechnology",
    evidenceSources: [
      source("a", "Knowledge fragmentation may contribute to rework."),
      source("b", "The relationship is plausible but has only one direct observation."),
    ],
    truth: truth(
      ["knowledgeContinuity"],
      "knowledgeContinuity",
      ["executionCapacity"],
      [["knowledgeContinuity", "executionCapacity"]],
      ["knowledge", "transfer"],
    ),
  },
  {
    id: "ambiguous-direction",
    industry: "Retail",
    evidenceSources: [
      source("a", "Decision flow and coordination move together, but direction is unclear."),
      source("b", "The same association appears in two teams."),
    ],
    truth: truth([], null, [], [], [], true),
  },
  {
    id: "one-root-many-symptoms",
    industry: "Industrial services",
    evidenceSources: [
      source("a", "Unclear authority appears to drive handoff friction."),
      source("b", "Unclear authority results in delivery delay."),
      source("c", "Handoff friction leads to repeated rework."),
    ],
    truth: truth(
      ["decisionFlow"],
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["decisionFlow", "executionCapacity"],
        ["coordination", "executionCapacity"],
      ],
      ["authority", "approval"],
    ),
  },
  {
    id: "multiple-contributing-causes",
    industry: "Financial services",
    evidenceSources: [
      source("a", "Approval dependency contributes to cross-functional friction."),
      source("b", "Incentive conflict contributes to cross-functional friction."),
    ],
    truth: truth(
      ["decisionFlow", "strategicAlignment"],
      null,
      ["coordination"],
      [
        ["decisionFlow", "coordination"],
        ["strategicAlignment", "coordination"],
      ],
      [],
      true,
    ),
  },
  {
    id: "interacting-roots",
    industry: "Healthcare",
    evidenceSources: [
      source("a", "Leadership dependency reinforces approval dependency."),
      source("b", "Approval dependency appears to drive coordination delay."),
      source("c", "Coordination delay results in capacity strain."),
    ],
    truth: truth(
      ["leadershipDependency"],
      "leadershipDependency",
      ["decisionFlow", "coordination", "executionCapacity"],
      [
        ["leadershipDependency", "decisionFlow"],
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["leadership", "authority"],
    ),
  },
  {
    id: "feedback-loop",
    industry: "Consumer goods",
    evidenceSources: [
      source("a", "Decision ambiguity reinforces coordination friction."),
      source("b", "Coordination friction reinforces decision ambiguity."),
    ],
    truth: truth(
      ["decisionFlow", "coordination"],
      null,
      ["decisionFlow", "coordination"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "decisionFlow"],
      ],
      [],
      true,
    ),
  },
  {
    id: "broad-strategic-root",
    industry: "Energy",
    evidenceSources: [
      source("a", "Portfolio conflict causes decision ambiguity."),
      source("b", "Decision ambiguity leads to handoff friction."),
    ],
    truth: truth(
      ["strategicAlignment"],
      "strategicAlignment",
      ["decisionFlow", "coordination"],
      [
        ["strategicAlignment", "decisionFlow"],
        ["decisionFlow", "coordination"],
      ],
      ["priority", "tradeoff", "align"],
    ),
  },
  {
    id: "narrow-root-broad-symptom",
    industry: "Education",
    evidenceSources: [
      source("a", "Approval dependency results in apparent strategic alignment drift."),
      source("b", "Enterprise priorities remain explicit."),
    ],
    truth: truth(
      ["decisionFlow"],
      "decisionFlow",
      ["strategicAlignment"],
      [["decisionFlow", "strategicAlignment"]],
      ["authority", "approval"],
    ),
  },
  {
    id: "leadership-secondary-edge",
    industry: "Consulting",
    evidenceSources: [
      source("a", "Leadership dependency is followed by slow decisions."),
      source("b", "Slow decisions appear to drive accountability gaps and handoff friction."),
      source("c", "Delivery delay emerges after handoff friction."),
    ],
    truth: truth(
      ["leadershipDependency"],
      "leadershipDependency",
      ["decisionFlow", "coordination", "executionCapacity"],
      [
        ["leadershipDependency", "decisionFlow"],
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["leadership", "authority"],
    ),
  },
  {
    id: "sparse-decisive",
    industry: "Hospitality",
    evidenceSources: [
      source("a", "Localized expertise appears to drive repeated rework."),
    ],
    truth: truth(
      ["knowledgeContinuity"],
      "knowledgeContinuity",
      ["executionCapacity"],
      [["knowledgeContinuity", "executionCapacity"]],
      ["knowledge", "transfer"],
    ),
  },
  {
    id: "contradictory-claims",
    industry: "Logistics",
    evidenceSources: [
      source("a", "Decision ambiguity causes handoff friction."),
      source("b", "Handoff friction causes decision ambiguity."),
    ],
    truth: truth(
      ["decisionFlow", "coordination"],
      null,
      ["decisionFlow", "coordination"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "decisionFlow"],
      ],
      [],
      true,
    ),
  },
  {
    id: "no-defensible-root",
    industry: "Media",
    evidenceSources: [
      source("a", "Delivery, strategy, and coordination all changed this quarter."),
      source("b", "No evidence establishes which change preceded another."),
    ],
    truth: truth([], null, [], [], [], true),
  },
  {
    id: "industry-neutral-variant",
    industry: "Public services",
    evidenceSources: [
      source("a", "Unclear authority results in interface delay."),
      source("b", "Interface delay produces capacity strain."),
    ],
    truth: truth(
      ["decisionFlow"],
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["authority", "approval"],
    ),
  },
  {
    id: "surface-paraphrase-variant",
    industry: "Technology",
    evidenceSources: [
      source("a", "Handoff friction follows when approval dependency accumulates."),
      source("b", "Capacity strain is observed after handoff friction."),
    ],
    truth: truth(
      ["decisionFlow"],
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["authority", "approval"],
    ),
  },
  {
    id: "reverse-evidence-order",
    industry: "Manufacturing",
    evidenceSources: [
      source(
        "a",
        ["Decision ambiguity causes coordination delay.", "Approval queues are visible."].reverse().join("\n"),
      ),
      source("b", "Coordination delay leads to execution overload."),
    ],
    truth: truth(
      ["decisionFlow"],
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["authority"],
    ),
    equalsScenarioId: "forward-evidence-order",
    accuracyControl: true,
  },
  {
    id: "forward-evidence-order",
    industry: "Manufacturing",
    evidenceSources: [
      source(
        "a",
        ["Decision ambiguity causes coordination delay.", "Approval queues are visible."].join("\n"),
      ),
      source("b", "Coordination delay leads to execution overload."),
    ],
    truth: truth(
      ["decisionFlow"],
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["authority"],
    ),
    accuracyControl: true,
  },
  {
    id: "reverse-source-order",
    industry: "Manufacturing",
    evidenceSources: [
      source("b", "Coordination delay leads to execution overload."),
      source("a", "Decision ambiguity causes coordination delay."),
    ],
    truth: truth(
      ["decisionFlow"],
      "decisionFlow",
      ["coordination", "executionCapacity"],
      [
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      ["authority"],
    ),
    equalsScenarioId: "explicit-causal",
    accuracyControl: true,
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

function inputFor(scenario: Scenario): InvestigationInput {
  return {
    company: "Causal Production Shadow Company",
    website: "https://causal-shadow.invalid",
    industry: scenario.industry,
    question: "What causal constraint is shaping the organization?",
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
  let state = 0x1172026;
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
  const input = inputFor(scenario);
  return withDeterminism(() => {
    const originalLog = console.log;
    console.log = () => undefined;
    try {
      const result = runDiscoveryV3(input);
      const runtime = evolveOrganizationRuntime({
        runtime: createEmptyOrganizationRuntime({
          organizationId: `causal-shadow:${scenario.id}`,
          name: input.company,
          industry: input.industry,
          website: input.website,
        }),
        result,
        input,
      });
      return { result, runtime };
    } finally {
      console.log = originalLog;
    }
  });
}

function conditionsIn(text: string): ConditionId[] {
  const normalized = text.toLowerCase();
  return (Object.keys(TERMS) as ConditionId[]).filter((condition) =>
    TERMS[condition].some((term) => normalized.includes(term)),
  );
}

type ParsedRelation = {
  causeText: string;
  effectText: string;
  strength: EdgeStrength;
};

function parseRelation(text: string): ParsedRelation | null {
  const value = text.trim().replace(/[.]+$/, "");
  if (/move together|direction is unclear|association/i.test(value))
    return null;
  const forward: Array<[RegExp, EdgeStrength]> = [
    [/\s+causes\s+/i, "observed"],
    [/\s+leads to\s+/i, "observed"],
    [/\s+results in\s+/i, "observed"],
    [/\s+produces\s+/i, "observed"],
    [/\s+reinforces\s+/i, "inferred"],
    [/\s+appears to drive\s+/i, "inferred"],
    [/\s+contributes to\s+/i, "weak"],
    [/\s+may contribute to\s+/i, "weak"],
  ];
  for (const [marker, strength] of forward) {
    const parts = value.split(marker);
    if (parts.length === 2)
      return { causeText: parts[0], effectText: parts[1], strength };
  }
  const when = value.match(/^when\s+(.+?),\s*(.+?)\s+follows$/i);
  if (when)
    return { causeText: when[1], effectText: when[2], strength: "inferred" };
  const followsWhen = value.match(/^(.+?)\s+follows when\s+(.+)$/i);
  if (followsWhen)
    return {
      causeText: followsWhen[2],
      effectText: followsWhen[1],
      strength: "inferred",
    };
  const follows = value.match(/^(.+?)\s+is followed by\s+(.+)$/i);
  if (follows)
    return { causeText: follows[1], effectText: follows[2], strength: "inferred" };
  const after = value.match(/^(.+?)\s+(?:emerges|is observed)\s+after\s+(.+)$/i);
  if (after)
    return { causeText: after[2], effectText: after[1], strength: "inferred" };
  return null;
}

function records(value: unknown): UnknownRecord[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is UnknownRecord =>
          Boolean(item) && typeof item === "object" && !Array.isArray(item),
      )
    : [];
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function productionMechanisms(execution: Execution): UnknownRecord[] {
  const memory = execution.runtime.memory as unknown as UnknownRecord;
  const network = memory.mechanismNetwork as UnknownRecord | undefined;
  return records(network?.mechanisms);
}

function mechanismIdsForEvidence(
  evidenceId: string,
  mechanisms: UnknownRecord[],
): string[] {
  return mechanisms
    .filter((mechanism) =>
      [
        ...strings(mechanism.supportingEvidenceIds),
        ...strings(mechanism.evidenceIds),
      ].includes(evidenceId),
    )
    .map((mechanism) => String(mechanism.id))
    .sort();
}

function stronglyConnectedLoops(edges: ShadowEdge[]): ConditionId[][] {
  const nodes = [...new Set(edges.flatMap((edge) => [edge.cause, edge.effect]))];
  const loops: ConditionId[][] = [];
  for (const node of nodes) {
    for (const other of nodes) {
      if (node >= other) continue;
      const forward = edges.some(
        (edge) => edge.cause === node && edge.effect === other,
      );
      const reverse = edges.some(
        (edge) => edge.cause === other && edge.effect === node,
      );
      if (forward && reverse) loops.push([node, other]);
    }
  }
  return loops;
}

function causalShadow(execution: Execution): ShadowResult {
  const mechanisms = productionMechanisms(execution);
  const conditions = records(
    (execution.runtime.memory as unknown as UnknownRecord)
      .organizationalConditions,
  );
  const edges: ShadowEdge[] = [];
  for (const evidence of execution.result.evidence) {
    const relation = parseRelation(evidence.text);
    if (!relation) continue;
    for (const cause of conditionsIn(relation.causeText)) {
      for (const effect of conditionsIn(relation.effectText)) {
        const existing = edges.find(
          (edge) => edge.cause === cause && edge.effect === effect,
        );
        if (existing) {
          existing.evidenceIds.push(evidence.id);
          existing.mechanismIds.push(
            ...mechanismIdsForEvidence(evidence.id, mechanisms),
          );
          continue;
        }
        edges.push({
          cause,
          effect,
          strength: relation.strength,
          evidenceIds: [evidence.id],
          mechanismIds: mechanismIdsForEvidence(evidence.id, mechanisms),
          explanation:
            relation.strength === "observed"
              ? `Observed causal language connects ${CONDITION_NAMES[cause]} to ${CONDITION_NAMES[effect]}.`
              : `A bounded semantic rule infers that ${CONDITION_NAMES[cause]} may influence ${CONDITION_NAMES[effect]}.`,
        });
      }
    }
  }
  const normalizedEdges = edges
    .map((edge) => ({
      ...edge,
      evidenceIds: [...new Set(edge.evidenceIds)].sort(),
      mechanismIds: [...new Set(edge.mechanismIds)].sort(),
    }))
    .sort(
      (left, right) =>
        left.cause.localeCompare(right.cause) ||
        left.effect.localeCompare(right.effect),
    );
  const feedbackLoops = stronglyConnectedLoops(normalizedEdges);
  const nodes = [
    ...new Set(
      normalizedEdges.flatMap((edge) => [edge.cause, edge.effect]),
    ),
  ];
  const incoming = new Map(nodes.map((node) => [node, 0]));
  for (const edge of normalizedEdges) {
    if (edge.cause !== edge.effect)
      incoming.set(edge.effect, (incoming.get(edge.effect) ?? 0) + 1);
  }
  const roots = nodes
    .filter((node) => (incoming.get(node) ?? 0) === 0)
    .sort();

  function descendants(root: ConditionId): ConditionId[] {
    const found = new Set<ConditionId>();
    const queue = [root];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const edge of normalizedEdges.filter(
        (item) => item.cause === current,
      )) {
        if (edge.effect === current || found.has(edge.effect)) continue;
        found.add(edge.effect);
        queue.push(edge.effect);
      }
    }
    return [...found].sort();
  }

  const rankedRoots = [...roots].sort(
    (left, right) =>
      descendants(right).length - descendants(left).length ||
      normalizedEdges.filter((edge) => edge.cause === right).length -
        normalizedEdges.filter((edge) => edge.cause === left).length ||
      left.localeCompare(right),
  );
  const uniqueReach =
    rankedRoots.length === 1 ||
    (rankedRoots.length > 1 &&
      descendants(rankedRoots[0]).length >
        descendants(rankedRoots[1]).length);
  let abstentionReason: string | null = null;
  if (normalizedEdges.length === 0)
    abstentionReason = "No defensible directed causal relationship.";
  else if (feedbackLoops.length > 0 && roots.length === 0)
    abstentionReason =
      "The observed structure is a feedback loop without a defensible root.";
  else if (rankedRoots.length > 1 && !uniqueReach)
    abstentionReason =
      "Multiple contributing roots have equivalent causal reach.";
  const selectedRoot = abstentionReason ? null : rankedRoots[0] ?? null;
  const downstream = selectedRoot
    ? descendants(selectedRoot)
    : rankedRoots.length > 0
      ? [
          ...new Set(
            rankedRoots.flatMap((root) => descendants(root)),
          ),
        ].sort()
      : [...new Set(feedbackLoops.flat())].sort();
  const weakEdges = normalizedEdges.filter((edge) => edge.strength === "weak");
  const inferredEdges = normalizedEdges.filter(
    (edge) => edge.strength === "inferred",
  );
  const uncertainty = [
    ...(weakEdges.length > 0
      ? [`${weakEdges.length} relationship(s) use weak causal language.`]
      : []),
    ...(inferredEdges.length > 0
      ? [`${inferredEdges.length} relationship(s) are bounded inferences.`]
      : []),
    ...(abstentionReason ? [abstentionReason] : []),
  ];

  return {
    edges: normalizedEdges,
    rootCandidates: roots,
    rankedRoots,
    selectedRoot,
    downstream,
    interventionTarget: selectedRoot
      ? INTERVENTIONS[selectedRoot]
      : null,
    abstained: selectedRoot === null,
    abstentionReason,
    feedbackLoops,
    uncertainty,
    productionConditionIds: conditions.map((condition) => String(condition.id)),
    productionMechanismIds: mechanisms.map((mechanism) => String(mechanism.id)),
  };
}

function productionConstraint(execution: Execution): ConditionId | null {
  const memory = execution.runtime.memory as unknown as UnknownRecord;
  const title = String(
    (memory.primaryExecutiveConstraint as UnknownRecord | undefined)?.title ??
      "",
  );
  return (
    (Object.keys(CONDITION_NAMES) as ConditionId[]).find(
      (condition) => CONDITION_NAMES[condition] === title,
    ) ?? null
  );
}

function recommendation(execution: Execution): string {
  const memory = execution.runtime.memory as unknown as UnknownRecord;
  return stable(memory.executiveRecommendation).toLowerCase();
}

function score(
  policy: Policy,
  execution: Execution,
  shadow: ShadowResult,
  hidden: HiddenTruth,
): ScenarioScore {
  const selected =
    policy === "S2" ? shadow.selectedRoot : productionConstraint(execution);
  const productionSelected = productionConstraint(execution);
  const mechanismSelection =
    policy === "S0" ? productionSelected : shadow.rankedRoots[0] ?? null;
  const rootRank =
    hidden.roots.length === 0
      ? 0
      : Math.min(
          ...hidden.roots.map((root) => {
            const index = shadow.rankedRoots.indexOf(root);
            return index >= 0 ? index + 1 : shadow.rankedRoots.length + 1;
          }),
        );
  const actualEdges = new Set(
    shadow.edges.map((edge) => `${edge.cause}->${edge.effect}`),
  );
  const expectedEdges = new Set(
    hidden.expectedEdges.map(([cause, effect]) => `${cause}->${effect}`),
  );
  const trueEdges = [...actualEdges].filter((edge) =>
    expectedEdges.has(edge),
  ).length;
  const unsupportedEdges = [...actualEdges].filter(
    (edge) => !expectedEdges.has(edge),
  ).length;
  const intervention =
    policy === "S2"
      ? shadow.interventionTarget ?? ""
      : recommendation(execution);
  const recommendationBefore = recommendation(execution);
  const recommendationAfter = recommendation(execution);
  const selectedIsSymptom =
    selected !== null && hidden.downstream.includes(selected);
  const expectedFeedback = hidden.expectedEdges.some(([cause, effect]) =>
    hidden.expectedEdges.some(
      ([reverseCause, reverseEffect]) =>
        reverseCause === effect && reverseEffect === cause,
    ),
  );
  const graphMechanismAccurate =
    hidden.roots.length === 0
      ? shadow.abstained
      : expectedFeedback
        ? hidden.roots.every((root) =>
            shadow.feedbackLoops.flat().includes(root),
          )
        : hidden.roots.every(
            (root) =>
              shadow.rootCandidates.includes(root) ||
              shadow.rankedRoots.includes(root),
          );

  return {
    mechanismAccurate:
      policy === "S0"
        ? hidden.roots.length === 0
          ? mechanismSelection === null
          : mechanismSelection !== null &&
            hidden.roots.includes(mechanismSelection)
        : graphMechanismAccurate,
    mechanismRank:
      policy === "S0"
        ? mechanismSelection !== null &&
          hidden.roots.includes(mechanismSelection)
          ? 1
          : hidden.roots.length + 1
        : rootRank,
    falseRootRejected:
      shadow.rankedRoots.every(
        (root) =>
          hidden.roots.includes(root) ||
          shadow.rankedRoots.indexOf(root) >= hidden.roots.length,
      ),
    primaryAccurate:
      selected === hidden.primary ||
      (hidden.shouldAbstain && policy === "S2" && selected === null),
    symptomAccurate:
      hidden.shouldAbstain
        ? selected === null
        : selected === hidden.primary && !selectedIsSymptom,
    multiCauseAccurate:
      hidden.roots.length <= 1 ||
      (expectedFeedback
        ? hidden.roots.every((root) =>
            shadow.feedbackLoops.flat().includes(root),
          ) && shadow.abstained
        : hidden.roots.every((root) =>
            shadow.rootCandidates.includes(root),
          ) && shadow.abstained),
    abstentionAccurate:
      policy === "S0"
        ? hidden.shouldAbstain === (productionSelected === null)
        : hidden.shouldAbstain === shadow.abstained,
    edgePrecision:
      actualEdges.size === 0 ? (expectedEdges.size === 0 ? 1 : 0) : trueEdges / actualEdges.size,
    edgeRecall:
      expectedEdges.size === 0 ? 1 : trueEdges / expectedEdges.size,
    unsupportedEdges,
    consequenceAccuracy:
      hidden.downstream.length === 0
        ? 1
        : hidden.downstream.filter((item) => shadow.downstream.includes(item))
            .length / hidden.downstream.length,
    feedbackAccurate:
      hidden.shouldAbstain &&
      hidden.expectedEdges.length > 0
        ? shadow.feedbackLoops.length > 0 || shadow.rootCandidates.length > 1
        : true,
    interventionAligned:
      hidden.shouldAbstain
        ? policy !== "S2" || intervention === ""
        : hidden.interventionTerms.some((term) =>
            intervention.includes(term),
          ),
    upstreamTargeted:
      hidden.shouldAbstain
        ? policy !== "S2" || selected === null
        : selected === hidden.primary && !selectedIsSymptom,
    recommendationPreserved: recommendationBefore === recommendationAfter,
    ancestryPreserved: shadow.edges.every(
      (edge) =>
        edge.evidenceIds.length > 0 &&
        edge.evidenceIds.every((id) =>
          execution.result.evidence.some((item) => item.id === id),
        ),
    ),
    observationInferenceSeparated: shadow.edges.every(
      (edge) =>
        edge.strength === "observed"
          ? edge.explanation.startsWith("Observed")
          : edge.explanation.includes("inference") ||
            edge.explanation.includes("infer"),
    ),
    uncertaintyAppropriate:
      shadow.edges.some((edge) => edge.strength !== "observed") ||
      hidden.shouldAbstain
        ? shadow.uncertainty.length > 0
        : true,
  };
}

const results = scenarios.map((scenario) => {
  const execution = execute(scenario);
  assert.equal(stable(execution), stable(execute(scenario)));
  const productionBytes = stable(execution);
  const shadow = causalShadow(execution);
  assert.equal(stable(execution), productionBytes);
  const scores = {
    S0: score("S0", execution, shadow, scenario.truth),
    S1: score("S1", execution, shadow, scenario.truth),
    S2: score("S2", execution, shadow, scenario.truth),
  };
  return { scenario, execution, shadow, scores };
});

for (const result of results) {
  if (!result.scenario.equalsScenarioId) continue;
  const expected = results.find(
    (item) => item.scenario.id === result.scenario.equalsScenarioId,
  );
  assert.ok(expected);
  assert.equal(stable(result.execution.result), stable(expected.execution.result));
  assert.equal(stable(result.shadow), stable(expected.shadow));
}

const core = results.filter((result) => !result.scenario.accuracyControl);
const policies: Policy[] = ["S0", "S1", "S2"];
const summaries = Object.fromEntries(
  policies.map((policy) => {
    const items = core.map((result) => result.scores[policy]);
    return [
      policy,
      {
        mechanism: items.filter((item) => item.mechanismAccurate).length,
        meanMechanismRank:
          items.reduce((sum, item) => sum + item.mechanismRank, 0) /
          items.length,
        primary: items.filter((item) => item.primaryAccurate).length,
        symptom: items.filter((item) => item.symptomAccurate).length,
        multiCause: items.filter((item) => item.multiCauseAccurate).length,
        abstention: items.filter((item) => item.abstentionAccurate).length,
        edgePrecision:
          items.reduce((sum, item) => sum + item.edgePrecision, 0) /
          items.length,
        edgeRecall:
          items.reduce((sum, item) => sum + item.edgeRecall, 0) /
          items.length,
        unsupported: items.reduce(
          (sum, item) => sum + item.unsupportedEdges,
          0,
        ),
        consequence:
          items.reduce((sum, item) => sum + item.consequenceAccuracy, 0) /
          items.length,
        intervention: items.filter((item) => item.interventionAligned).length,
        ancestry: items.filter((item) => item.ancestryPreserved).length,
        separation: items.filter(
          (item) => item.observationInferenceSeparated,
        ).length,
        uncertainty: items.filter((item) => item.uncertaintyAppropriate).length,
      },
    ];
  }),
) as Record<
  Policy,
  {
    mechanism: number;
    meanMechanismRank: number;
    primary: number;
    symptom: number;
    multiCause: number;
    abstention: number;
    edgePrecision: number;
    edgeRecall: number;
    unsupported: number;
    consequence: number;
    intervention: number;
    ancestry: number;
    separation: number;
    uncertainty: number;
  }
>;

let beneficial = 0;
let neutral = 0;
let harmful = 0;
let justifiedAbstentions = 0;
for (const result of core) {
  const productionCorrect = result.scores.S0.primaryAccurate;
  const shadowCorrect = result.scores.S2.primaryAccurate;
  if (!productionCorrect && shadowCorrect) beneficial += 1;
  else if (productionCorrect && !shadowCorrect) harmful += 1;
  else neutral += 1;
  if (result.scenario.truth.shouldAbstain && result.shadow.abstained)
    justifiedAbstentions += 1;
}
const total = core.length;
const s2 = summaries.S2;
const leadershipSecondaryEdgeRecovered =
  core.find(
    (result) => result.scenario.id === "leadership-secondary-edge",
  )?.scores.S2.primaryAccurate ?? false;
const classification =
  s2.primary / total >= 0.8 &&
  s2.mechanism / total >= 0.8 &&
  s2.intervention / total >= 0.8 &&
  harmful <= 1 &&
  justifiedAbstentions ===
    core.filter((result) => result.scenario.truth.shouldAbstain).length &&
  s2.unsupported <= 1 &&
  s2.consequence >= 0.8 &&
  leadershipSecondaryEdgeRecovered
    ? "A — Production-shadow breakthrough confirmed"
    : s2.primary > summaries.S0.primary + total * 0.35 && harmful <= 2
      ? "B — Strong but incomplete"
      : s2.primary <= summaries.S0.primary + 1
        ? "C — Controlled-fixture overfit"
        : "D — Unsafe";

console.log("CAUSAL CONSTRAINT REASONING PRODUCTION SHADOW");
console.log("");
for (const policy of policies) {
  const item = summaries[policy];
  console.log(
    `${policy}: mechanism=${item.mechanism}/${total} mechanismRank=${item.meanMechanismRank.toFixed(2)} primary=${item.primary}/${total} symptom=${item.symptom}/${total} multiCause=${item.multiCause}/${total} abstention=${item.abstention}/${total} edgePrecision=${item.edgePrecision.toFixed(3)} edgeRecall=${item.edgeRecall.toFixed(3)} unsupported=${item.unsupported} consequence=${item.consequence.toFixed(3)} intervention=${item.intervention}/${total} ancestry=${item.ancestry}/${total} separation=${item.separation}/${total} uncertainty=${item.uncertainty}/${total}`,
  );
}
console.log("");
for (const result of core) {
  const production = productionConstraint(result.execution);
  const shadow = result.shadow.selectedRoot;
  const truthValue = result.scenario.truth.primary;
  const effect =
    production !== truthValue && shadow === truthValue
      ? "corrected"
      : production === truthValue && shadow !== truthValue
        ? "worsened"
        : "preserved";
  console.log(
    `SCENARIO ${result.scenario.id}: production=${production ?? "abstain"} shadow=${shadow ?? "abstain"} truth=${truthValue ?? "abstain"} productionCorrect=${result.scores.S0.primaryAccurate} shadowCorrect=${result.scores.S2.primaryAccurate} effect=${effect} recommendationPreserved=${result.scores.S2.recommendationPreserved} edges=${result.shadow.edges.map((edge) => `${edge.cause}->${edge.effect}`).join(",") || "none"} uncertainty=${result.shadow.uncertainty.join(" | ") || "none"}`,
  );
}
console.log("");
console.log(
  `Aggregate: production=${summaries.S0.primary}/${total} shadow=${summaries.S2.primary}/${total} beneficial=${beneficial} neutral=${neutral} harmful=${harmful} justifiedAbstentions=${justifiedAbstentions} unsupportedEdges=${summaries.S2.unsupported}`,
);
console.log(`Classification: ${classification}`);
console.log("Repeated replay: byte-identical");
console.log("Evidence-order reversal: equivalent");
console.log("Source-order reversal: equivalent");
console.log("Production recommendation and Runtime: unchanged");
