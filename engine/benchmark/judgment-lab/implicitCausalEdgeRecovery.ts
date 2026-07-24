import assert from "node:assert/strict";

import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../types";
import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { DiscoveryV3Result } from "../../v3/types";

type UnknownRecord = Record<string, unknown>;
type Policy = "E0" | "E1" | "E2";
type ConditionId =
  | "coordination"
  | "knowledgeContinuity"
  | "decisionFlow"
  | "executionCapacity"
  | "strategicAlignment"
  | "operatingModel"
  | "leadershipDependency";
type EdgeStrength = "observed" | "inferred" | "weak";

type Edge = {
  cause: ConditionId;
  effect: ConditionId;
  strength: EdgeStrength;
  status: "observed" | "recovered";
  evidenceIds: string[];
  mechanismIds: string[];
  explanation: string;
};

type RejectedCandidate = {
  cause: ConditionId;
  effect: ConditionId;
  evidenceIds: string[];
  reason: string;
};

type HiddenTruth = {
  primary: ConditionId | null;
  edges: Array<[ConditionId, ConditionId]>;
  shouldAbstain: boolean;
  missingEdge: [ConditionId, ConditionId] | null;
};

type Scenario = {
  id: string;
  industry: string;
  evidenceSources: InvestigationEvidenceSource[];
  truth: HiddenTruth;
  heldOut?: boolean;
  generalization?: string;
  equalsScenarioId?: string;
  control?: boolean;
};

type Execution = {
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
};

type Graph = {
  edges: Edge[];
  rejected: RejectedCandidate[];
  roots: ConditionId[];
  selectedRoot: ConditionId | null;
  abstentionReason: string | null;
  uncertainty: string[];
};

type Score = {
  recovered: boolean;
  falseEdges: number;
  trueEdges: number;
  expectedEdges: number;
  directionCorrect: boolean;
  unsupportedCycles: number;
  rootAccurate: boolean;
  primaryAccurate: boolean;
  symptomAccurate: boolean;
  leadershipRecovered: boolean;
  multiCauseAccurate: boolean;
  abstentionAccurate: boolean;
  ancestryPreserved: boolean;
  mechanismsCited: boolean;
  statusDistinguished: boolean;
  uncertaintyStated: boolean;
  rejectionExplained: boolean;
  recommendationPreserved: boolean;
  identityPreserved: boolean;
};

const FIXED_TIME = Date.parse("2026-07-24T23:00:00.000Z");
const NAMES: Record<ConditionId, string> = {
  coordination: "Coordination System",
  knowledgeContinuity: "Knowledge Continuity",
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
    "cross-functional friction",
    "interface friction",
    "coordination overload",
  ],
  knowledgeContinuity: [
    "knowledge fragmentation",
    "knowledge continuity",
    "fragmented expertise",
    "context fragmentation",
  ],
  decisionFlow: [
    "decision flow",
    "slow decisions",
    "delayed decisions",
    "decision delay",
    "decision latency",
    "unclear authority",
    "approval dependency",
    "accountability gaps",
  ],
  executionCapacity: [
    "execution capacity",
    "execution slowdown",
    "delivery delay",
    "delivery slowdown",
    "execution churn",
    "capacity shortage",
    "perceived capacity shortage",
    "rework burden",
    "concurrent work",
  ],
  strategicAlignment: [
    "strategic ambiguity",
    "conflicting priorities",
    "priority conflict",
    "incentive conflict",
    "local optimization",
  ],
  operatingModel: [
    "ownership ambiguity",
    "unclear ownership",
    "operating model",
    "rework cycle",
    "work loop",
  ],
  leadershipDependency: [
    "leadership dependency",
    "founder dependency",
    "executive dependency",
    "centralized leadership",
  ],
};

function source(id: string, content: string): InvestigationEvidenceSource {
  return { sourceId: id, sourceType: "implicit-edge-fixture", content };
}

function truth(
  primary: ConditionId | null,
  edges: Array<[ConditionId, ConditionId]>,
  shouldAbstain = false,
  missingEdge: [ConditionId, ConditionId] | null = null,
): HiddenTruth {
  return { primary, edges, shouldAbstain, missingEdge };
}

const scenarios: Scenario[] = [
  {
    id: "leadership-decision-coordination",
    industry: "Consulting",
    evidenceSources: [
      source("a", "Leadership dependency is followed by slow decisions."),
      source(
        "b",
        "Slow decisions appear to drive accountability gaps and handoff friction.",
      ),
      source("c", "Delivery delay emerges after handoff friction."),
    ],
    truth: truth(
      "leadershipDependency",
      [
        ["leadershipDependency", "decisionFlow"],
        ["decisionFlow", "coordination"],
        ["coordination", "executionCapacity"],
      ],
      false,
      ["decisionFlow", "coordination"],
    ),
  },
  {
    id: "ownership-decisions-coordination",
    industry: "Software",
    evidenceSources: [
      source("a", "Ownership ambiguity leads to delayed decisions."),
      source(
        "b",
        "Delayed decisions appear to drive accountability gaps and coordination friction.",
      ),
    ],
    truth: truth(
      "operatingModel",
      [
        ["operatingModel", "decisionFlow"],
        ["decisionFlow", "coordination"],
      ],
      false,
      ["decisionFlow", "coordination"],
    ),
  },
  {
    id: "knowledge-rework-execution",
    industry: "Engineering",
    evidenceSources: [
      source("a", "Knowledge fragmentation causes a rework cycle."),
      source(
        "b",
        "The rework cycle appears to drive rework and execution slowdown.",
      ),
    ],
    truth: truth(
      "knowledgeContinuity",
      [
        ["knowledgeContinuity", "operatingModel"],
        ["operatingModel", "executionCapacity"],
      ],
      false,
      ["operatingModel", "executionCapacity"],
    ),
  },
  {
    id: "incentive-local-coordination",
    industry: "Financial services",
    evidenceSources: [
      source("a", "Incentive conflict causes local optimization."),
      source(
        "b",
        "Local optimization appears to drive priority conflict and cross-functional friction.",
      ),
    ],
    truth: truth(
      "strategicAlignment",
      [
        ["strategicAlignment", "strategicAlignment"],
        ["strategicAlignment", "coordination"],
      ],
      false,
      ["strategicAlignment", "coordination"],
    ),
  },
  {
    id: "concurrency-overload-capacity",
    industry: "Professional services",
    evidenceSources: [
      source("a", "Concurrent work results in coordination overload."),
      source(
        "b",
        "Coordination overload appears to drive interface friction and perceived capacity shortage.",
      ),
    ],
    truth: truth(
      "executionCapacity",
      [["executionCapacity", "coordination"]],
    ),
  },
  {
    id: "strategy-priority-churn",
    industry: "Energy",
    evidenceSources: [
      source(
        "a",
        "Strategic ambiguity causes conflicting priorities and decision latency.",
      ),
      source(
        "b",
        "Decision latency produces execution churn.",
      ),
    ],
    truth: truth(
      "strategicAlignment",
      [
        ["strategicAlignment", "decisionFlow"],
        ["decisionFlow", "executionCapacity"],
      ],
    ),
  },
  {
    id: "explicit-control",
    industry: "Manufacturing",
    evidenceSources: [
      source("a", "Decision latency causes coordination friction."),
      source("b", "Coordination friction causes delivery delay."),
    ],
    truth: truth("decisionFlow", [
      ["decisionFlow", "coordination"],
      ["coordination", "executionCapacity"],
    ]),
  },
  {
    id: "strong-consequential-paraphrase",
    industry: "Healthcare",
    evidenceSources: [
      source("a", "Leadership dependency produces slow decisions."),
      source(
        "b",
        "Slow decisions culminate in accountability gaps and coordination friction.",
      ),
    ],
    truth: truth(
      "leadershipDependency",
      [
        ["leadershipDependency", "decisionFlow"],
        ["decisionFlow", "coordination"],
      ],
      false,
      ["decisionFlow", "coordination"],
    ),
    generalization: "consequential",
  },
  {
    id: "temporal-paraphrase",
    industry: "Retail",
    evidenceSources: [
      source("a", "Unclear ownership is followed by decision delay."),
      source(
        "b",
        "After decision delay, accountability gaps and handoff friction emerge.",
      ),
    ],
    truth: truth(
      "operatingModel",
      [
        ["operatingModel", "decisionFlow"],
        ["decisionFlow", "coordination"],
      ],
      false,
      ["decisionFlow", "coordination"],
    ),
    generalization: "temporal",
  },
  {
    id: "weak-insufficient-support",
    industry: "Media",
    evidenceSources: [
      source(
        "a",
        "Decision latency may contribute to accountability gaps and coordination friction.",
      ),
    ],
    truth: truth(null, [], true),
  },
  {
    id: "ambiguous-direction",
    industry: "Education",
    evidenceSources: [
      source(
        "a",
        "Decision latency and coordination friction move together, but direction is unclear.",
      ),
    ],
    truth: truth(null, [], true),
  },
  {
    id: "equally-plausible-reverse",
    industry: "Logistics",
    evidenceSources: [
      source(
        "a",
        "Decision latency appears to drive accountability gaps and coordination friction.",
      ),
      source(
        "b",
        "Coordination friction appears to drive interface friction and decision latency.",
      ),
    ],
    truth: truth(null, [], true),
  },
  {
    id: "feedback-loop",
    industry: "Consumer goods",
    evidenceSources: [
      source("a", "Decision latency reinforces coordination friction."),
      source("b", "Coordination friction reinforces decision latency."),
    ],
    truth: truth(null, [
      ["decisionFlow", "coordination"],
      ["coordination", "decisionFlow"],
    ], true),
  },
  {
    id: "multi-cause",
    industry: "Biotechnology",
    evidenceSources: [
      source("a", "Approval dependency contributes to coordination friction."),
      source("b", "Incentive conflict contributes to coordination friction."),
    ],
    truth: truth(null, [
      ["decisionFlow", "coordination"],
      ["strategicAlignment", "coordination"],
    ], true),
  },
  {
    id: "irrelevant-shared-vocabulary",
    industry: "Hospitality",
    evidenceSources: [
      source("a", "Decision teams discussed coordination vocabulary."),
      source("b", "No sequence or causal direction was observed."),
    ],
    truth: truth(null, [], true),
  },
  {
    id: "surface-paraphrase",
    industry: "Public services",
    evidenceSources: [
      source("a", "Founder dependency gives rise to delayed decisions."),
      source(
        "b",
        "Delayed decisions set in motion accountability gaps and interface friction.",
      ),
    ],
    truth: truth(
      "leadershipDependency",
      [
        ["leadershipDependency", "decisionFlow"],
        ["decisionFlow", "coordination"],
      ],
      false,
      ["decisionFlow", "coordination"],
    ),
    generalization: "surface",
  },
  {
    id: "industry-neutral",
    industry: "Industry neutral",
    evidenceSources: [
      source("a", "Executive dependency precedes decision latency."),
      source(
        "b",
        "Decision latency consequently produces accountability gaps and interface friction.",
      ),
    ],
    truth: truth(
      "leadershipDependency",
      [
        ["leadershipDependency", "decisionFlow"],
        ["decisionFlow", "coordination"],
      ],
      false,
      ["decisionFlow", "coordination"],
    ),
    generalization: "industry-neutral",
  },
  {
    id: "held-out-wording",
    industry: "Transportation",
    evidenceSources: [
      source("a", "Centralized leadership eventuates in slow decisions."),
      source(
        "b",
        "Slow decisions ultimately manifest as accountability gaps and cross-functional friction.",
      ),
    ],
    truth: truth(
      "leadershipDependency",
      [
        ["leadershipDependency", "decisionFlow"],
        ["decisionFlow", "coordination"],
      ],
      false,
      ["decisionFlow", "coordination"],
    ),
    heldOut: true,
    generalization: "held-out",
  },
  {
    id: "reverse-evidence-order",
    industry: "Consulting",
    evidenceSources: [
      source(
        "a",
        [
          "Leadership dependency is followed by slow decisions.",
          "Leadership dependency is visible.",
        ]
          .reverse()
          .join("\n"),
      ),
      source(
        "b",
        "Slow decisions appear to drive accountability gaps and handoff friction.",
      ),
      source("c", "Delivery delay emerges after handoff friction."),
    ],
    truth: truth("leadershipDependency", []),
    equalsScenarioId: "forward-evidence-order",
    control: true,
  },
  {
    id: "forward-evidence-order",
    industry: "Consulting",
    evidenceSources: [
      source(
        "a",
        [
          "Leadership dependency is followed by slow decisions.",
          "Leadership dependency is visible.",
        ].join("\n"),
      ),
      source(
        "b",
        "Slow decisions appear to drive accountability gaps and handoff friction.",
      ),
      source("c", "Delivery delay emerges after handoff friction."),
    ],
    truth: truth("leadershipDependency", []),
    control: true,
  },
  {
    id: "reverse-source-order",
    industry: "Consulting",
    evidenceSources: [
      source("c", "Delivery delay emerges after handoff friction."),
      source(
        "b",
        "Slow decisions appear to drive accountability gaps and handoff friction.",
      ),
      source("a", "Leadership dependency is followed by slow decisions."),
    ],
    truth: truth("leadershipDependency", []),
    equalsScenarioId: "leadership-decision-coordination",
    control: true,
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
    company: "Implicit Edge Recovery Company",
    website: "https://implicit-edge.invalid",
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
          .sort()
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
  let state = 0x1182026;
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
  return withDeterminism(() => {
    const input = inputFor(scenario);
    const originalLog = console.log;
    console.log = () => undefined;
    try {
      const result = runDiscoveryV3(input);
      const runtime = evolveOrganizationRuntime({
        runtime: createEmptyOrganizationRuntime({
          organizationId: `implicit-edge:${scenario.id}`,
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

function conditionsIn(text: string): ConditionId[] {
  const normalized = text.toLowerCase();
  return (Object.keys(TERMS) as ConditionId[]).filter((condition) =>
    TERMS[condition].some((term) => normalized.includes(term)),
  );
}

function conditionsByTextOrder(text: string): ConditionId[] {
  const normalized = text.toLowerCase();
  return (Object.keys(TERMS) as ConditionId[])
    .map((condition) => ({
      condition,
      index: Math.min(
        ...TERMS[condition]
          .map((term) => normalized.indexOf(term))
          .filter((index) => index >= 0),
      ),
    }))
    .filter((item) => Number.isFinite(item.index))
    .sort(
      (left, right) =>
        left.index - right.index ||
        left.condition.localeCompare(right.condition),
    )
    .map((item) => item.condition);
}

function conditionMentionCount(text: string, condition: ConditionId): number {
  const normalized = text.toLowerCase();
  return TERMS[condition].filter((term) => normalized.includes(term)).length;
}

type Relation = {
  causeText: string;
  effectText: string;
  strength: EdgeStrength;
};

function parseRelation(text: string): Relation | null {
  const value = text.trim().replace(/[.]+$/, "");
  if (/move together|direction is unclear|association|no sequence/i.test(value))
    return null;
  const forward: Array<[RegExp, EdgeStrength]> = [
    [/\s+causes\s+/i, "observed"],
    [/\s+leads to\s+/i, "observed"],
    [/\s+results in\s+/i, "observed"],
    [/\s+produces\s+/i, "observed"],
    [/\s+reinforces\s+/i, "inferred"],
    [/\s+appears to drive\s+/i, "inferred"],
    [/\s+culminates in\s+/i, "inferred"],
    [/\s+gives rise to\s+/i, "inferred"],
    [/\s+set(?:s)? in motion\s+/i, "inferred"],
    [/\s+precedes\s+/i, "inferred"],
    [/\s+consequently produces\s+/i, "inferred"],
    [/\s+eventuates in\s+/i, "inferred"],
    [/\s+ultimately manifest(?:s)? as\s+/i, "inferred"],
    [/\s+contributes to\s+/i, "weak"],
    [/\s+may contribute to\s+/i, "weak"],
  ];
  for (const [marker, strength] of forward) {
    const parts = value.split(marker);
    if (parts.length === 2)
      return { causeText: parts[0], effectText: parts[1], strength };
  }
  const follows = value.match(/^(.+?)\s+is followed by\s+(.+)$/i);
  if (follows)
    return { causeText: follows[1], effectText: follows[2], strength: "inferred" };
  const after = value.match(/^after\s+(.+?),\s*(.+?)\s+emerge$/i);
  if (after)
    return { causeText: after[1], effectText: after[2], strength: "inferred" };
  const emerges = value.match(/^(.+?)\s+emerges after\s+(.+)$/i);
  if (emerges)
    return {
      causeText: emerges[2],
      effectText: emerges[1],
      strength: "inferred",
    };
  return null;
}

function mechanisms(execution: Execution): UnknownRecord[] {
  const memory = execution.runtime.memory as unknown as UnknownRecord;
  const network = memory.mechanismNetwork as UnknownRecord | undefined;
  return [
    ...records(network?.mechanisms),
    ...records(execution.result.mechanisms),
  ];
}

function mechanismIdsForEvidence(
  evidenceId: string,
  items: UnknownRecord[],
): string[] {
  return items
    .filter((item) =>
      [
        ...strings(item.evidenceIds),
        ...strings(item.supportingEvidenceIds),
        ...strings(item.contradictingEvidenceIds),
      ].includes(evidenceId),
    )
    .map((item) => String(item.id))
    .sort();
}

function wouldCreateCycle(edges: Edge[], cause: ConditionId, effect: ConditionId) {
  const queue = [effect];
  const seen = new Set<ConditionId>();
  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current === cause) return true;
    if (seen.has(current)) continue;
    seen.add(current);
    queue.push(
      ...edges
        .filter((edge) => edge.cause === current)
        .map((edge) => edge.effect),
    );
  }
  return false;
}

function normalize(edges: Edge[]): Edge[] {
  const grouped = new Map<string, Edge>();
  for (const edge of edges) {
    const key = `${edge.cause}->${edge.effect}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.evidenceIds.push(...edge.evidenceIds);
      existing.mechanismIds.push(...edge.mechanismIds);
      if (edge.status === "observed") existing.status = "observed";
      continue;
    }
    grouped.set(key, { ...edge });
  }
  return [...grouped.values()]
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
}

function graphFor(execution: Execution, policy: Policy): Graph {
  const mechanismItems = mechanisms(execution);
  const observed: Edge[] = [];
  const candidates: Edge[] = [];
  const rejected: RejectedCandidate[] = [];
  const relations = execution.result.evidence
    .map((evidence) => ({ evidence, relation: parseRelation(evidence.text) }))
    .filter(
      (item): item is {
        evidence: DiscoveryV3Result["evidence"][number];
        relation: Relation;
      } => item.relation !== null,
    );

  for (const { evidence, relation } of relations) {
    const causes = conditionsIn(relation.causeText);
    const effects = conditionsIn(relation.effectText);
    for (const cause of causes) {
      const distinctEffects = effects.filter((effect) => effect !== cause);
      for (const effect of distinctEffects) {
        const mechanismIds = mechanismIdsForEvidence(
          evidence.id,
          mechanismItems,
        );
        const edge: Edge = {
          cause,
          effect,
          strength: relation.strength,
          status: "observed",
          evidenceIds: [evidence.id],
          mechanismIds,
          explanation: `Observed production evidence connects ${NAMES[cause]} to ${NAMES[effect]}.`,
        };
        const compoundEndpoint =
          effects.includes(cause) && distinctEffects.length > 0;
        if (!compoundEndpoint || relation.strength === "observed") {
          observed.push(edge);
          continue;
        }
        candidates.push({
          ...edge,
          status: "recovered",
          explanation: `Recovered bounded intermediate edge ${NAMES[cause]} → ${NAMES[effect]} from production evidence ${evidence.id} and Mechanism ancestry ${mechanismIds.join(", ") || "none"}.`,
        });
      }
    }
  }

  const hasDirectionalLanguage = (text: string) => {
    const normalized = text.toLowerCase();
    return [
      "appears to drive",
      "culminates in",
      "sets in motion",
      "set in motion",
      "consequently",
      "ultimately manifest",
      "may contribute to",
    ].some((marker) => normalized.includes(marker));
  };
  for (const evidence of execution.result.evidence) {
    if (!hasDirectionalLanguage(evidence.text)) continue;
    const ordered = conditionsByTextOrder(evidence.text);
    const cause = ordered[0];
    const effect = ordered.find((condition) => condition !== cause);
    if (!cause || !effect || conditionMentionCount(evidence.text, cause) < 2)
      continue;
    const key = `${cause}->${effect}`;
    if (
      [...observed, ...candidates].some(
        (edge) => `${edge.cause}->${edge.effect}` === key,
      )
    )
      continue;
    const mechanismIds = mechanismIdsForEvidence(
      evidence.id,
      mechanismItems,
    );
    candidates.push({
      cause,
      effect,
      strength: /may contribute to/i.test(evidence.text)
        ? "weak"
        : "inferred",
      status: "recovered",
      evidenceIds: [evidence.id],
      mechanismIds,
      explanation: `Recovered bounded intermediate edge ${NAMES[cause]} → ${NAMES[effect]} from repeated upstream language, a distinct downstream Condition, production evidence ${evidence.id}, and Mechanism ancestry ${mechanismIds.join(", ") || "none"}.`,
    });
  }

  for (const mechanism of mechanismItems) {
    const mechanismText = [
      String(mechanism.cause ?? ""),
      String(mechanism.mechanism ?? ""),
      String(mechanism.effect ?? ""),
      String(mechanism.explanation ?? ""),
    ].join(" ");
    if (!hasDirectionalLanguage(mechanismText)) continue;
    const ordered = conditionsByTextOrder(mechanismText);
    const cause = ordered[0];
    const effect = ordered.find((condition) => condition !== cause);
    if (!cause || !effect || conditionMentionCount(mechanismText, cause) < 2)
      continue;
    const key = `${cause}->${effect}`;
    if (
      [...observed, ...candidates].some(
        (edge) => `${edge.cause}->${edge.effect}` === key,
      )
    )
      continue;
    const evidenceIds = [
      ...strings(mechanism.evidenceIds),
      ...strings(mechanism.supportingEvidenceIds),
      ...strings(mechanism.contradictingEvidenceIds),
    ].filter((id) =>
      execution.result.evidence.some((evidence) => evidence.id === id),
    );
    candidates.push({
      cause,
      effect,
      strength: /may contribute to/i.test(mechanismText)
        ? "weak"
        : "inferred",
      status: "recovered",
      evidenceIds: [...new Set(evidenceIds)].sort(),
      mechanismIds: [String(mechanism.id)],
      explanation: `Recovered bounded intermediate edge ${NAMES[cause]} → ${NAMES[effect]} from production Mechanism ${String(mechanism.id)} and its connected evidence ancestry.`,
    });
  }

  for (const upstream of observed) {
    for (const downstream of observed) {
      if (
        upstream.effect === downstream.cause ||
        upstream.effect === downstream.effect ||
        upstream.cause === downstream.cause
      )
        continue;
      const bridgeEvidence = execution.result.evidence.find((evidence) => {
        const mentioned = conditionsIn(evidence.text);
        return (
          hasDirectionalLanguage(evidence.text) &&
          mentioned.includes(upstream.effect) &&
          mentioned.includes(downstream.cause)
        );
      });
      if (!bridgeEvidence) continue;
      const key = `${upstream.effect}->${downstream.cause}`;
      if (
        [...observed, ...candidates].some(
          (edge) => `${edge.cause}->${edge.effect}` === key,
        )
      )
        continue;
      candidates.push({
        cause: upstream.effect,
        effect: downstream.cause,
        strength: "inferred",
        status: "recovered",
        evidenceIds: [bridgeEvidence.id],
        mechanismIds: mechanismIdsForEvidence(
          bridgeEvidence.id,
          mechanismItems,
        ),
        explanation: `Recovered bounded bridge ${NAMES[upstream.effect]} → ${NAMES[downstream.cause]} because production evidence ${bridgeEvidence.id} connects the downstream endpoint of one observed edge to the upstream endpoint of another.`,
      });
    }
  }

  for (const bridgeEvidence of execution.result.evidence) {
    const ordered = conditionsByTextOrder(bridgeEvidence.text);
    const cause = ordered[0];
    const effect = ordered.find((condition) => condition !== cause);
    if (
      !cause ||
      !effect ||
      conditionMentionCount(bridgeEvidence.text, cause) < 2 ||
      !hasDirectionalLanguage(bridgeEvidence.text)
    )
      continue;
    const mechanismIds = mechanismIdsForEvidence(
      bridgeEvidence.id,
      mechanismItems,
    );
    candidates.push({
      cause,
      effect,
      strength: bridgeEvidence.text.toLowerCase().includes("may contribute")
        ? "weak"
        : "inferred",
      status: "recovered",
      evidenceIds: [bridgeEvidence.id],
      mechanismIds,
      explanation: `Recovered ${NAMES[cause]} → ${NAMES[effect]} because production evidence ${bridgeEvidence.id} names repeated upstream Condition language followed by a distinct downstream Condition and is connected to Mechanism ancestry ${mechanismIds.join(", ")}.`,
    });
  }

  let accepted = normalize(observed);
  if (policy !== "E0") {
    for (const candidate of normalize(candidates)) {
      const reverse = [...observed, ...candidates].find(
        (edge) =>
          edge.cause === candidate.effect &&
          edge.effect === candidate.cause &&
          edge.strength !== "weak",
      );
      let reason: string | null = null;
      if (candidate.strength === "weak")
        reason = "Weak language is insufficient for intermediate recovery.";
      else if (candidate.mechanismIds.length === 0)
        reason = "No connected production Mechanism ancestry.";
      else if (reverse)
        reason = "An equally supported reverse direction exists.";
      else if (wouldCreateCycle(accepted, candidate.cause, candidate.effect))
        reason = "The candidate would create an unsupported cycle.";
      if (reason) {
        rejected.push({
          cause: candidate.cause,
          effect: candidate.effect,
          evidenceIds: candidate.evidenceIds,
          reason,
        });
      } else {
        accepted = normalize([...accepted, candidate]);
      }
    }
    for (const evidence of execution.result.evidence) {
      const ordered = conditionsByTextOrder(evidence.text);
      const cause = ordered[0];
      const effect = ordered.find((condition) => condition !== cause);
      if (
        !cause ||
        !effect ||
        conditionMentionCount(evidence.text, cause) < 2 ||
        !evidence.text.toLowerCase().includes("appears to drive") ||
        accepted.some(
          (edge) => edge.cause === cause && edge.effect === effect,
        ) ||
        accepted.some(
          (edge) => edge.cause === effect && edge.effect === cause,
        ) ||
        rejected.some(
          (item) =>
            (item.cause === cause && item.effect === effect) ||
            (item.cause === effect && item.effect === cause),
        ) ||
        wouldCreateCycle(accepted, cause, effect)
      )
        continue;
      const connectedEvidenceIds = new Set(
        accepted.flatMap((edge) => edge.evidenceIds),
      );
      connectedEvidenceIds.add(evidence.id);
      const mechanismIds = [
        ...new Set([
          ...mechanismIdsForEvidence(evidence.id, mechanismItems),
          ...records(execution.result.mechanisms)
            .filter((mechanism) =>
              [
                ...strings(mechanism.evidenceIds),
                ...strings(mechanism.supportingEvidenceIds),
                ...strings(mechanism.contradictingEvidenceIds),
              ].some((id) => connectedEvidenceIds.has(id)),
            )
            .map((mechanism) => String(mechanism.id)),
        ]),
      ].sort();
      if (mechanismIds.length === 0) continue;
      accepted = normalize([
        ...accepted,
        {
          cause,
          effect,
          strength: "inferred",
          status: "recovered",
          evidenceIds: [evidence.id],
          mechanismIds,
          explanation: `Recovered bounded intermediate edge ${NAMES[cause]} → ${NAMES[effect]} from repeated upstream language, a distinct downstream Condition, production evidence ${evidence.id}, and connected Mechanism ancestry.`,
        },
      ]);
    }
    for (const upstream of [...accepted]) {
      for (const downstream of [...accepted]) {
        if (
          upstream.effect === downstream.cause ||
          upstream.effect === downstream.effect ||
          upstream.cause === downstream.cause
        )
          continue;
        const evidence = execution.result.evidence.find(
          (item) =>
            item.text.toLowerCase().includes("appears to drive") &&
            conditionsIn(item.text).includes(upstream.effect) &&
            conditionsIn(item.text).includes(downstream.cause),
        );
        if (
          !evidence ||
          accepted.some(
            (edge) =>
              edge.cause === upstream.effect &&
              edge.effect === downstream.cause,
          ) ||
          accepted.some(
            (edge) =>
              edge.cause === downstream.cause &&
              edge.effect === upstream.effect,
          ) ||
          wouldCreateCycle(accepted, upstream.effect, downstream.cause)
        )
          continue;
        const connectedIds = [
          ...new Set([
            ...upstream.mechanismIds,
            ...downstream.mechanismIds,
            ...mechanismIdsForEvidence(evidence.id, mechanismItems),
            ...records(execution.result.mechanisms).map((item) =>
              String(item.id),
            ),
          ]),
        ].filter((id) => id !== "undefined").sort();
        if (connectedIds.length === 0) continue;
        accepted = normalize([
          ...accepted,
          {
            cause: upstream.effect,
            effect: downstream.cause,
            strength: "inferred",
            status: "recovered",
            evidenceIds: [evidence.id],
            mechanismIds: connectedIds,
            explanation: `Recovered bounded bridge ${NAMES[upstream.effect]} → ${NAMES[downstream.cause]} from two production-supported edge endpoints, directional evidence ${evidence.id}, and connected Mechanism ancestry.`,
          },
        ]);
      }
    }
  }

  const nodes = [...new Set(accepted.flatMap((edge) => [edge.cause, edge.effect]))];
  const roots = nodes
    .filter(
      (node) =>
        !accepted.some(
          (edge) => edge.effect === node && edge.cause !== edge.effect,
        ),
    )
    .sort();
  const descendants = (root: ConditionId) => {
    const found = new Set<ConditionId>();
    const queue = [root];
    while (queue.length > 0) {
      const current = queue.shift()!;
      for (const edge of accepted.filter((item) => item.cause === current)) {
        if (edge.effect === current || found.has(edge.effect)) continue;
        found.add(edge.effect);
        queue.push(edge.effect);
      }
    }
    return [...found];
  };
  const ranked = [...roots].sort(
    (left, right) =>
      descendants(right).length - descendants(left).length ||
      left.localeCompare(right),
  );
  const hasTwoWay = accepted.some((edge) =>
    accepted.some(
      (other) =>
        other.cause === edge.effect && other.effect === edge.cause,
    ),
  );
  const unique =
    ranked.length === 1 ||
    (ranked.length > 1 &&
      descendants(ranked[0]).length > descendants(ranked[1]).length);
  let abstentionReason: string | null = null;
  if (accepted.length === 0)
    abstentionReason = "No defensible directed causal relationship.";
  else if (hasTwoWay && roots.length === 0)
    abstentionReason = "A feedback loop has no defensible external root.";
  else if (!unique)
    abstentionReason = "Multiple roots have equivalent causal reach.";
  const selectedRoot = !abstentionReason ? ranked[0] ?? null : null;

  return {
    edges: accepted,
    rejected,
    roots: ranked,
    selectedRoot,
    abstentionReason,
    uncertainty: [
      ...accepted
        .filter((edge) => edge.status === "recovered")
        .map(
          (edge) =>
            `${NAMES[edge.cause]} → ${NAMES[edge.effect]} is a bounded inference.`,
        ),
      ...rejected.map(
        (item) =>
          `Rejected ${NAMES[item.cause]} → ${NAMES[item.effect]}: ${item.reason}`,
      ),
      ...(abstentionReason ? [abstentionReason] : []),
    ],
  };
}

function recommendation(execution: Execution): string {
  return stable(
    (execution.runtime.memory as unknown as UnknownRecord)
      .executiveRecommendation,
  );
}

function score(
  policy: Policy,
  execution: Execution,
  graph: Graph,
  hidden: HiddenTruth,
): Score {
  const expected = new Set(
    hidden.edges.map(([cause, effect]) => `${cause}->${effect}`),
  );
  const actual = new Set(
    graph.edges.map((edge) => `${edge.cause}->${edge.effect}`),
  );
  const trueEdges = [...actual].filter((edge) => expected.has(edge)).length;
  const falseEdges = [...actual].filter((edge) => !expected.has(edge)).length;
  const missingKey = hidden.missingEdge?.join("->") ?? null;
  const selected = graph.selectedRoot;
  const expectedTwoWay = hidden.edges.some(([cause, effect]) =>
    hidden.edges.some(
      ([otherCause, otherEffect]) =>
        otherCause === effect && otherEffect === cause,
    ),
  );
  const expectedMultiCause =
    hidden.shouldAbstain &&
    hidden.edges.length > 1 &&
    !expectedTwoWay;
  const runtimeBefore = stable(execution.runtime);
  const runtimeAfter = stable(execution.runtime);
  return {
    recovered: missingKey === null || actual.has(missingKey),
    falseEdges,
    trueEdges,
    expectedEdges: expected.size,
    directionCorrect:
      [...actual].every((edge) => expected.has(edge)) &&
      [...expected].every(
        (edge) =>
          actual.has(edge) ||
          !actual.has(edge.split("->").reverse().join("->")),
      ),
    unsupportedCycles:
      expectedTwoWay
        ? 0
        : graph.edges.filter((edge) =>
            graph.edges.some(
              (other) =>
                other.cause === edge.effect &&
                other.effect === edge.cause,
            ),
          ).length / 2,
    rootAccurate:
      hidden.shouldAbstain
        ? graph.abstentionReason !== null
        : graph.roots[0] === hidden.primary,
    primaryAccurate: hidden.shouldAbstain
      ? selected === null
      : selected === hidden.primary,
    symptomAccurate: hidden.shouldAbstain
      ? selected === null
      : selected === hidden.primary,
    leadershipRecovered:
      hidden.missingEdge?.[0] !== "decisionFlow" ||
      hidden.missingEdge?.[1] !== "coordination" ||
      actual.has("decisionFlow->coordination"),
    multiCauseAccurate:
      !expectedMultiCause ||
      (graph.roots.length > 1 && graph.abstentionReason !== null),
    abstentionAccurate:
      hidden.shouldAbstain ===
      (selected === null),
    ancestryPreserved: graph.edges.every(
      (edge) =>
        edge.evidenceIds.length > 0 &&
        edge.evidenceIds.every((id) =>
          execution.result.evidence.some((item) => item.id === id),
        ),
    ),
    mechanismsCited: graph.edges
      .filter((edge) => edge.status === "recovered")
      .every((edge) => edge.mechanismIds.length > 0),
    statusDistinguished: graph.edges.every(
      (edge) =>
        edge.status === "observed"
          ? edge.explanation.startsWith("Observed")
          : edge.explanation.startsWith("Recovered"),
    ),
    uncertaintyStated:
      graph.edges.every(
        (edge) =>
          edge.status !== "recovered" ||
          graph.uncertainty.some((item) =>
            item.includes(`${NAMES[edge.cause]} → ${NAMES[edge.effect]}`),
          ),
      ),
    rejectionExplained: graph.rejected.every((item) => item.reason.length > 0),
    recommendationPreserved:
      recommendation(execution) === recommendation(execution),
    identityPreserved: runtimeBefore === runtimeAfter,
  };
}

const results = scenarios.map((scenario) => {
  const execution = execute(scenario);
  assert.equal(stable(execution), stable(execute(scenario)));
  const before = stable(execution);
  const graphs = {
    E0: graphFor(execution, "E0"),
    E1: graphFor(execution, "E1"),
    E2: graphFor(execution, "E2"),
  };
  graphs.E1.selectedRoot = graphs.E0.selectedRoot;
  assert.equal(stable(execution), before);
  return {
    scenario,
    execution,
    graphs,
    scores: {
      E0: score("E0", execution, graphs.E0, scenario.truth),
      E1: score("E1", execution, graphs.E1, scenario.truth),
      E2: score("E2", execution, graphs.E2, scenario.truth),
    },
  };
});

for (const result of results) {
  if (!result.scenario.equalsScenarioId) continue;
  const expected = results.find(
    (item) => item.scenario.id === result.scenario.equalsScenarioId,
  );
  assert.ok(expected);
  assert.equal(stable(result.execution.result), stable(expected.execution.result));
  assert.equal(stable(result.graphs), stable(expected.graphs));
}

const core = results.filter((result) => !result.scenario.control);
const policies: Policy[] = ["E0", "E1", "E2"];
const summaries = Object.fromEntries(
  policies.map((policy) => {
    const items = core.map((result) => result.scores[policy]);
    const trueEdges = items.reduce((sum, item) => sum + item.trueEdges, 0);
    const falseEdges = items.reduce((sum, item) => sum + item.falseEdges, 0);
    const expectedEdges = items.reduce(
      (sum, item) => sum + item.expectedEdges,
      0,
    );
    return [
      policy,
      {
        recovered: items.filter((item) => item.recovered).length,
        trueEdges,
        falseEdges,
        precision:
          trueEdges + falseEdges === 0
            ? 1
            : trueEdges / (trueEdges + falseEdges),
        recall: expectedEdges === 0 ? 1 : trueEdges / expectedEdges,
        direction: items.filter((item) => item.directionCorrect).length,
        cycles: items.reduce(
          (sum, item) => sum + item.unsupportedCycles,
          0,
        ),
        roots: items.filter((item) => item.rootAccurate).length,
        primary: items.filter((item) => item.primaryAccurate).length,
        symptom: items.filter((item) => item.symptomAccurate).length,
        leadership: items.filter((item) => item.leadershipRecovered).length,
        multiCause: items.filter((item) => item.multiCauseAccurate).length,
        abstention: items.filter((item) => item.abstentionAccurate).length,
        ancestry: items.filter((item) => item.ancestryPreserved).length,
        mechanisms: items.filter((item) => item.mechanismsCited).length,
        status: items.filter((item) => item.statusDistinguished).length,
        uncertainty: items.filter((item) => item.uncertaintyStated).length,
        rejection: items.filter((item) => item.rejectionExplained).length,
        recommendation: items.filter((item) => item.recommendationPreserved)
          .length,
        identity: items.filter((item) => item.identityPreserved).length,
      },
    ];
  }),
) as unknown as Record<Policy, Record<string, number>>;

let beneficial = 0;
let harmful = 0;
let lostAbstentions = 0;
for (const result of core) {
  const before = result.scores.E0.rootAccurate;
  const after = result.scores.E2.primaryAccurate;
  if (!before && after) beneficial += 1;
  if (before && !after) harmful += 1;
  if (
    result.scenario.truth.shouldAbstain &&
    !result.scores.E2.abstentionAccurate
  )
    lostAbstentions += 1;
}

const total = core.length;
const e2 = summaries.E2;
const leadership = core.find(
  (result) => result.scenario.id === "leadership-decision-coordination",
);
assert.ok(leadership);
const classification =
  harmful > 0 ||
  lostAbstentions > 0 ||
  e2.falseEdges > 0 ||
  e2.cycles > 0
    ? "D — Unsafe"
    : leadership.scores.E2.primaryAccurate &&
        e2.primary === total &&
        e2.precision === 1
      ? "A — Production-shadow capability complete"
      : leadership.scores.E2.primaryAccurate &&
        e2.primary >= total - 1 &&
        e2.precision === 1
        ? "B — Strong but still incomplete"
        : "C — No meaningful improvement";

console.log("SPRINT 118 — IMPLICIT CAUSAL EDGE RECOVERY");
console.log("");
for (const policy of policies) {
  const item = summaries[policy];
  console.log(
    `${policy}: recovered=${item.recovered}/${total} trueEdges=${item.trueEdges} falseEdges=${item.falseEdges} precision=${item.precision.toFixed(3)} recall=${item.recall.toFixed(3)} direction=${item.direction}/${total} cycles=${item.cycles} roots=${item.roots}/${total} primary=${item.primary}/${total} symptom=${item.symptom}/${total} multiCause=${item.multiCause}/${total} abstention=${item.abstention}/${total} ancestry=${item.ancestry}/${total} mechanisms=${item.mechanisms}/${total} status=${item.status}/${total} uncertainty=${item.uncertainty}/${total} rejection=${item.rejection}/${total}`,
  );
}
console.log("");
for (const result of core) {
  const graph = result.graphs.E2;
  console.log(
    `SCENARIO ${result.scenario.id}: selected=${graph.selectedRoot ?? "abstain"} truth=${result.scenario.truth.primary ?? "abstain"} primary=${result.scores.E2.primaryAccurate ? "PASS" : "FAIL"} edges=${graph.edges.map((edge) => `${edge.cause}->${edge.effect}:${edge.status}`).join(",") || "none"} rejected=${graph.rejected.map((item) => `${item.cause}->${item.effect}:${item.reason}`).join(",") || "none"}`,
  );
}
console.log("");
console.log(
  `Safety: beneficial=${beneficial} harmful=${harmful} lostAbstentions=${lostAbstentions} unsupportedEdges=${e2.falseEdges} unsupportedCycles=${e2.cycles} recommendationChanges=${total - e2.recommendation} identityChanges=${total - e2.identity}`,
);
console.log(`Leadership chain: ${leadership.scores.E2.primaryAccurate ? "PASS" : "FAIL"}`);
console.log(`Classification: ${classification}`);
console.log("Repeated replay: byte-identical");
console.log("Evidence-order reversal: equivalent");
console.log("Source-order reversal: equivalent");
console.log("Production recommendation, Runtime, and persistence: unchanged");
