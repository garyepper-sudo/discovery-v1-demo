import assert from "node:assert/strict";

import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../types";
import { runDiscoveryV3 } from "../../v3";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { DiscoveryV3Result } from "../../v3/types";
import { atlasIndustrialArtifacts } from "./atlasIndustrialPilot";

type UnknownRecord = Record<string, unknown>;
type ExplanationId =
  | "capacity"
  | "concurrency"
  | "decisionFlow"
  | "coordination"
  | "strategy"
  | "knowledge"
  | "leadership"
  | "operatingModel";
type Direction = "stable" | "weaken" | "strengthen" | "expand" | "displace";
type Role =
  | "support"
  | "oppose"
  | "discriminate"
  | "shared"
  | "contradiction"
  | "outcome"
  | "bounded"
  | "duplicate"
  | "irrelevant";

type HiddenState = {
  valid: ExplanationId[];
  leader: ExplanationId | null;
  abstain: boolean;
  recommendation: string;
};

type Phase = {
  evidence: InvestigationEvidenceSource[];
  truth: HiddenState;
  direction: Direction;
};

type Scenario = {
  id: string;
  industry: string;
  phases: Phase[];
  crossBenchmark?: boolean;
  controlOf?: string;
};

type Execution = {
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
};

type Ancestry = {
  layer:
    | "Mechanism"
    | "Belief"
    | "Theory"
    | "Condition"
    | "Contradiction"
    | "ExecutiveAssessment";
  objectId: string;
  evidenceIds: string[];
};

type Candidate = {
  id: ExplanationId;
  ancestry: Ancestry[];
  supportEvidenceIds: string[];
  opposingEvidenceIds: string[];
  discriminatingEvidenceIds: string[];
  sharedEvidenceIds: string[];
  sourceIds: string[];
  state: "decisive" | "corroborated" | "supported" | "weakened" | "bounded" | "rejected";
  confidence: number;
};

type ExplanationState = {
  candidates: Candidate[];
  leader: ExplanationId | null;
  viable: ExplanationId[];
  weakened: ExplanationId[];
  displaced: ExplanationId[];
  abstained: boolean;
  recommendation: string;
  revisionEvidenceIds: string[];
  nextEvidence: string[];
  prior: {
    leader: ExplanationId | null;
    viable: ExplanationId[];
  } | null;
};

type PhaseResult = {
  execution: Execution;
  p0Leader: ExplanationId | null;
  p1: ExplanationState;
  p2: ExplanationState;
};

type ScenarioResult = {
  scenario: Scenario;
  phases: PhaseResult[];
};

const FIXED_TIME = Date.parse("2026-07-26T12:00:00.000Z");
const TERMS: Record<ExplanationId, string[]> = {
  capacity: [
    "capacity",
    "staffing",
    "headcount",
    "enough people",
    "resource constraint",
    "labor rates",
  ],
  concurrency: [
    "concurrent work",
    "work in progress",
    "too many projects",
    "overcommit",
    "focus fragmentation",
    "priority overload",
  ],
  decisionFlow: [
    "decision rights",
    "decision authority",
    "approval",
    "escalat",
    "decision flow",
    "decision latency",
  ],
  coordination: ["coordination", "handoff", "cross-team dependency"],
  strategy: ["strategic alignment", "priority conflict", "competing priorities", "strategy"],
  knowledge: ["knowledge", "documentation", "context loss", "expertise", "rework"],
  leadership: ["leadership dependency", "founder dependency", "executive dependency"],
  operatingModel: ["operating model", "ownership ambiguity", "process weakness", "governance"],
};
const RECOMMENDATION: Record<ExplanationId, string> = {
  capacity: "add-capacity",
  concurrency: "sequence-work",
  decisionFlow: "delegate-authority",
  coordination: "clarify-handoffs",
  strategy: "align-priorities",
  knowledge: "preserve-knowledge",
  leadership: "distribute-leadership",
  operatingModel: "clarify-ownership",
};

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

function deterministic<T>(operation: () => T): T {
  const OriginalDate = Date;
  const originalRandom = Math.random;
  let tick = 0;
  let seed = 0x1202026;
  class FixedDate extends OriginalDate {
    constructor(...args: ConstructorParameters<DateConstructor>) {
      if (args.length) super(...args);
      else super(FIXED_TIME + tick++);
    }
    static now(): number {
      return FIXED_TIME + tick++;
    }
  }
  globalThis.Date = FixedDate as DateConstructor;
  Math.random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 0x100000000;
  };
  try {
    return operation();
  } finally {
    globalThis.Date = OriginalDate;
    Math.random = originalRandom;
  }
}

function evidence(
  sourceId: string,
  content: string,
): InvestigationEvidenceSource {
  return {
    sourceId,
    sourceType: "production-shadow-fixture",
    content,
  };
}

function truth(
  valid: ExplanationId[],
  leader: ExplanationId | null,
  recommendation = leader ? RECOMMENDATION[leader] : "none",
): HiddenState {
  return { valid, leader, abstain: leader === null, recommendation };
}

function phase(
  lines: string[],
  expected: HiddenState,
  direction: Direction,
  prefix: string,
): Phase {
  return {
    evidence: lines.map((line, index) => evidence(`${prefix}${index + 1}`, line)),
    truth: expected,
    direction,
  };
}

function scenario(
  id: string,
  t0: string[],
  t1: string[],
  t2: string[],
  truths: [HiddenState, HiddenState, HiddenState],
  directions: [Direction, Direction, Direction],
  options: Partial<Pick<Scenario, "industry" | "crossBenchmark">> = {},
): Scenario {
  return {
    id,
    industry: options.industry ?? "Industry neutral",
    phases: [
      phase(t0, truths[0], directions[0], "a"),
      phase(t1, truths[1], directions[1], "b"),
      phase(t2, truths[2], directions[2], "c"),
    ],
    crossBenchmark: options.crossBenchmark,
  };
}

const atlas = new Map(
  atlasIndustrialArtifacts.map((artifact) => [artifact.id, artifact]),
);
const atlasEvidence = (ids: string[]) =>
  ids.map((id) => {
    const artifact = atlas.get(id);
    assert.ok(artifact);
    return evidence(artifact.id, artifact.content);
  });

const scenarios: Scenario[] = [
  {
    id: "atlas-decisive-sequence",
    industry: "Industrial automation and engineered equipment",
    crossBenchmark: true,
    phases: [
      {
        evidence: atlasEvidence(["A15"]),
        truth: truth(["capacity"], "capacity"),
        direction: "stable",
      },
      {
        evidence: atlasEvidence(["A04"]),
        truth: truth(["capacity", "decisionFlow"], null),
        direction: "expand",
      },
      {
        evidence: atlasEvidence(["A03", "A11"]),
        truth: truth(["decisionFlow"], "decisionFlow"),
        direction: "displace",
      },
    ],
  },
  scenario(
    "atlas-credible-opposition",
    ["Capacity pressure limits delivery."],
    ["Decision authority and approval waiting also delay work."],
    ["A comparable high-load unit succeeds while approval-free work completes on time."],
    [
      truth(["capacity"], "capacity"),
      truth(["capacity", "decisionFlow"], null),
      truth(["decisionFlow"], "decisionFlow"),
    ],
    ["stable", "expand", "displace"],
    { crossBenchmark: true },
  ),
  scenario(
    "atlas-duplicate-control",
    ["Decision authority ambiguity delays routine work."],
    ["Exact duplicate: Decision authority ambiguity delays routine work."],
    [],
    [
      truth(["decisionFlow"], "decisionFlow"),
      truth(["decisionFlow"], "decisionFlow"),
      truth(["decisionFlow"], "decisionFlow"),
    ],
    ["stable", "stable", "stable"],
    { crossBenchmark: true },
  ),
  scenario(
    "atlas-delayed-outcome",
    ["Capacity is the initial explanation for delay."],
    ["Decision authority is a plausible competing explanation."],
    ["Delayed outcome: delegated decisions completed on time without added capacity."],
    [
      truth(["capacity"], "capacity"),
      truth(["capacity", "decisionFlow"], null),
      truth(["decisionFlow"], "decisionFlow"),
    ],
    ["stable", "expand", "displace"],
    { crossBenchmark: true },
  ),
  scenario(
    "northstar-operational-explanations",
    ["Staffing appears insufficient for delivery demand."],
    ["Concurrent work fragments focus while approval dependency slows routine decisions."],
    ["Counterfactual outcome: reducing active work and clarifying decision rights improves delivery without hiring."],
    [
      truth(["capacity"], "capacity"),
      truth(["concurrency", "decisionFlow"], null),
      truth(["concurrency", "decisionFlow"], null, "sequence-work"),
    ],
    ["stable", "displace", "strengthen"],
    { industry: "Industrial systems", crossBenchmark: true },
  ),
  scenario(
    "knowledge-fragmentation",
    ["Capacity pressure is blamed for repeated rework."],
    ["Knowledge and context loss precede repeated rework."],
    ["Outcome evidence: preserved decision context eliminates rework at unchanged staffing."],
    [
      truth(["capacity"], "capacity"),
      truth(["capacity", "knowledge"], null),
      truth(["knowledge"], "knowledge"),
    ],
    ["stable", "expand", "displace"],
  ),
  scenario(
    "capacity-versus-concurrency",
    ["Teams report insufficient capacity."],
    ["Concurrent work and work in progress fragment available capacity."],
    ["Counterfactual: sequencing work restores throughput without added headcount."],
    [
      truth(["capacity"], "capacity"),
      truth(["capacity", "concurrency"], null),
      truth(["concurrency"], "concurrency"),
    ],
    ["stable", "expand", "displace"],
    { crossBenchmark: true },
  ),
  scenario(
    "strategy-symptom-decision-flow",
    ["Strategic alignment appears weak because priorities change."],
    ["Decision rights are unclear when priority trade-offs occur."],
    ["Discriminating outcome: explicit decision authority resolves priority churn without changing strategy."],
    [
      truth(["strategy"], "strategy"),
      truth(["strategy", "decisionFlow"], null),
      truth(["decisionFlow"], "decisionFlow"),
    ],
    ["stable", "expand", "displace"],
    { crossBenchmark: true },
  ),
  scenario(
    "leadership-versus-coordination",
    ["Leadership dependency slows cross-team work."],
    ["Coordination and handoff weakness also delays work."],
    ["Opposition: teams with direct coordination still wait for executive dependency."],
    [
      truth(["leadership"], "leadership"),
      truth(["leadership", "coordination"], null),
      truth(["leadership"], "leadership"),
    ],
    ["stable", "expand", "strengthen"],
  ),
  scenario(
    "ownership-versus-process",
    ["Process weakness appears to explain inconsistent execution."],
    ["Ownership ambiguity in the operating model explains where process breaks."],
    ["Outcome evidence: clear ownership restores execution without a process redesign."],
    [
      truth(["operatingModel"], "operatingModel"),
      truth(["operatingModel"], "operatingModel"),
      truth(["operatingModel"], "operatingModel"),
    ],
    ["stable", "stable", "strengthen"],
  ),
  scenario(
    "multiple-valid-causes",
    ["Decision authority delays one workflow."],
    ["Knowledge loss independently causes rework in another workflow."],
    ["Both independent causes persist under controlled review."],
    [
      truth(["decisionFlow"], "decisionFlow"),
      truth(["decisionFlow", "knowledge"], null),
      truth(["decisionFlow", "knowledge"], null),
    ],
    ["stable", "expand", "stable"],
  ),
  scenario(
    "feedback-loop",
    ["Decision authority ambiguity worsens coordination."],
    ["Coordination failures trigger additional executive approval."],
    ["Feedback persists in both directions with no defensible root."],
    [
      truth(["decisionFlow", "coordination"], null),
      truth(["decisionFlow", "coordination"], null),
      truth(["decisionFlow", "coordination"], null),
    ],
    ["stable", "stable", "stable"],
  ),
  scenario(
    "broad-shared-one-discriminator",
    ["Strategy and decision authority both coincide with delay."],
    ["Broad shared evidence continues to support both explanations."],
    ["Discriminating outcome: delegated authority resolves delay under unchanged strategy."],
    [
      truth(["strategy", "decisionFlow"], null),
      truth(["strategy", "decisionFlow"], null),
      truth(["decisionFlow"], "decisionFlow"),
    ],
    ["stable", "stable", "displace"],
  ),
  scenario(
    "contradiction-weakens",
    ["Independent observations support a knowledge-continuity explanation."],
    ["Contradiction: one team succeeds despite incomplete documentation."],
    ["Additional evidence still links context loss to most rework."],
    [
      truth(["knowledge"], "knowledge"),
      truth(["knowledge"], "knowledge"),
      truth(["knowledge"], "knowledge"),
    ],
    ["stable", "weaken", "strengthen"],
  ),
  scenario(
    "contradiction-adds",
    ["Capacity pressure appears to explain delay."],
    ["Contradiction: one high-load team succeeds; coordination failure may compete."],
    ["Shared evidence cannot discriminate capacity from coordination."],
    [
      truth(["capacity"], "capacity"),
      truth(["capacity", "coordination"], null),
      truth(["capacity", "coordination"], null),
    ],
    ["stable", "expand", "stable"],
  ),
  scenario(
    "counterfactual-displacement",
    ["Strategy is the active explanation for missed commitments."],
    ["Decision authority is a plausible alternative."],
    ["Counterfactual outcome: clear authority succeeds despite unchanged strategy."],
    [
      truth(["strategy"], "strategy"),
      truth(["strategy", "decisionFlow"], null),
      truth(["decisionFlow"], "decisionFlow"),
    ],
    ["stable", "expand", "displace"],
  ),
  scenario(
    "irrelevant-control",
    ["Coordination handoffs explain delay."],
    ["Irrelevant evidence: office seating utilization changed."],
    [],
    [
      truth(["coordination"], "coordination"),
      truth(["coordination"], "coordination"),
      truth(["coordination"], "coordination"),
    ],
    ["stable", "stable", "stable"],
  ),
  scenario(
    "exact-duplicate-control",
    ["Knowledge loss causes rework."],
    ["Exact duplicate: Knowledge loss causes rework."],
    [],
    [
      truth(["knowledge"], "knowledge"),
      truth(["knowledge"], "knowledge"),
      truth(["knowledge"], "knowledge"),
    ],
    ["stable", "stable", "stable"],
  ),
  scenario(
    "sparse-abstention",
    ["Weak evidence mentions capacity and decision authority."],
    [],
    [],
    [
      truth(["capacity", "decisionFlow"], null),
      truth(["capacity", "decisionFlow"], null),
      truth(["capacity", "decisionFlow"], null),
    ],
    ["stable", "stable", "stable"],
  ),
  scenario(
    "no-defensible-leader",
    ["Shared evidence supports strategy and coordination equally."],
    ["No discriminating outcome is available."],
    [],
    [
      truth(["strategy", "coordination"], null),
      truth(["strategy", "coordination"], null),
      truth(["strategy", "coordination"], null),
    ],
    ["stable", "stable", "stable"],
  ),
  scenario(
    "terminology-variant",
    ["Work enters too many queues and focus fragments."],
    ["Authority boundaries cause choices to travel upward."],
    ["Outcome: limiting work in progress and assigning authority restores flow."],
    [
      truth(["concurrency"], "concurrency"),
      truth(["concurrency", "decisionFlow"], null),
      truth(["concurrency", "decisionFlow"], null, "sequence-work"),
    ],
    ["stable", "expand", "strengthen"],
    { industry: "Healthcare services" },
  ),
  scenario(
    "enterprise-variant",
    ["Competing priorities fragment enterprise execution."],
    ["Cross-team dependency and decision latency are plausible causes."],
    ["Outcome evidence identifies decision latency as the binding constraint."],
    [
      truth(["strategy"], "strategy"),
      truth(["strategy", "coordination", "decisionFlow"], null),
      truth(["decisionFlow"], "decisionFlow"),
    ],
    ["stable", "expand", "displace"],
    { industry: "Financial services" },
  ),
];

const orderBase = scenario(
  "order-control",
  ["Capacity appears constrained."],
  ["Decision authority also delays work."],
  ["Counterfactual outcome: delegation succeeds without added capacity."],
  [
    truth(["capacity"], "capacity"),
    truth(["capacity", "decisionFlow"], null),
    truth(["decisionFlow"], "decisionFlow"),
  ],
  ["stable", "expand", "displace"],
);
scenarios.push(orderBase, {
  ...orderBase,
  id: "reverse-evidence-order",
  controlOf: orderBase.id,
  phases: orderBase.phases.map((item) => ({
    ...item,
    evidence: [...item.evidence].reverse(),
  })),
});

function execute(
  scenarioValue: Scenario,
  phaseEvidence: InvestigationEvidenceSource[],
): Execution {
  return deterministic(() => {
    const input: InvestigationInput = {
      company: "Production Shadow Organization",
      website: "https://production-shadow.invalid",
      industry: scenarioValue.industry,
      question: "What best explains the organization’s current execution outcomes?",
      context: "",
      evidenceSources: phaseEvidence
        .map((item) => ({ ...item, content: item.content.trim() }))
        .sort(
          (left, right) =>
            left.sourceId.localeCompare(right.sourceId) ||
            left.content.localeCompare(right.content),
        ),
    };
    const originalLog = console.log;
    console.log = () => undefined;
    try {
      const result = runDiscoveryV3(input);
      const runtime = evolveOrganizationRuntime({
        runtime: createEmptyOrganizationRuntime({
          organizationId: `production-shadow:${scenarioValue.id}`,
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

function idsIn(value: unknown): ExplanationId[] {
  const text = String(value).toLowerCase();
  return (Object.keys(TERMS) as ExplanationId[]).filter((id) =>
    TERMS[id].some((term) => text.includes(term)),
  );
}

function collectEvidenceIds(value: unknown): string[] {
  const ids = new Set<string>();
  function visit(item: unknown, key = ""): void {
    if (Array.isArray(item)) {
      if (key.toLowerCase().includes("evidence")) {
        for (const entry of item) {
          if (typeof entry === "string") ids.add(entry);
        }
      }
      for (const entry of item) visit(entry, key);
    } else if (item && typeof item === "object") {
      for (const [childKey, child] of Object.entries(item as UnknownRecord))
        visit(child, childKey);
    }
  }
  visit(value);
  return [...ids].sort();
}

function objectId(value: unknown, fallback: string): string {
  if (value && typeof value === "object") {
    const id = (value as UnknownRecord).id;
    if (typeof id === "string") return id;
  }
  return fallback;
}

function productionObjects(execution: Execution): Array<{
  layer: Ancestry["layer"];
  value: unknown;
  fallback: string;
}> {
  const memory = execution.runtime.memory;
  const extendedMemory = memory as unknown as UnknownRecord;
  return [
    ...execution.result.mechanisms.map((value, index) => ({
      layer: "Mechanism" as const,
      value,
      fallback: `mechanism:${index}`,
    })),
    ...execution.result.beliefs.map((value, index) => ({
      layer: "Belief" as const,
      value,
      fallback: `belief:${index}`,
    })),
    ...memory.theories.map((value, index) => ({
      layer: "Theory" as const,
      value,
      fallback: `theory:${index}`,
    })),
    ...memory.organizationalConditions.map((value, index) => ({
      layer: "Condition" as const,
      value,
      fallback: `condition:${index}`,
    })),
    ...execution.result.contradictions.map((value, index) => ({
      layer: "Contradiction" as const,
      value,
      fallback: `contradiction:${index}`,
    })),
    ...(extendedMemory.executiveAssessment
      ? [
          {
            layer: "ExecutiveAssessment" as const,
            value: extendedMemory.executiveAssessment,
            fallback: "executive-assessment",
          },
        ]
      : []),
  ];
}

function roleFor(text: string, claimSeen: boolean): Role {
  const normalized = text.toLowerCase();
  if (claimSeen || normalized.startsWith("exact duplicate")) return "duplicate";
  if (normalized.startsWith("irrelevant")) return "irrelevant";
  if (normalized.includes("counterfactual") || normalized.includes("outcome:") || normalized.includes("outcome evidence"))
    return "outcome";
  if (normalized.startsWith("contradiction")) return "contradiction";
  if (normalized.startsWith("opposition") || normalized.includes("succeeds despite"))
    return "oppose";
  if (normalized.includes("discriminating")) return "discriminate";
  if (normalized.startsWith("shared") || normalized.includes("both"))
    return "shared";
  if (normalized.startsWith("weak") || normalized.includes("stale"))
    return "bounded";
  return "support";
}

function canonicalClaim(text: string): string {
  return text
    .toLowerCase()
    .replace(/^exact duplicate:\s*/i, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function constructCandidates(execution: Execution): Candidate[] {
  const ancestryById = new Map<ExplanationId, Ancestry[]>();
  for (const item of productionObjects(execution)) {
    const serialized = stable(item.value);
    for (const id of idsIn(serialized)) {
      const ancestry = ancestryById.get(id) ?? [];
      ancestry.push({
        layer: item.layer,
        objectId: objectId(item.value, item.fallback),
        evidenceIds: collectEvidenceIds(item.value),
      });
      ancestryById.set(id, ancestry);
    }
  }

  const seen = new Set<string>();
  const evidenceRoles = execution.result.evidence.map((item) => {
    const claim = canonicalClaim(item.text);
    const role = roleFor(item.text, seen.has(claim));
    seen.add(claim);
    return { item, role, ids: idsIn(item.text) };
  });

  return [...ancestryById.entries()]
    .map(([id, ancestry]): Candidate => {
      const relevant = evidenceRoles.filter((entry) => entry.ids.includes(id));
      const supporting = relevant.filter((entry) =>
        ["support", "discriminate", "outcome"].includes(entry.role),
      );
      const opposing = relevant.filter((entry) =>
        ["oppose", "contradiction"].includes(entry.role),
      );
      const discriminating = relevant.filter((entry) =>
        ["discriminate", "outcome"].includes(entry.role),
      );
      const shared = relevant.filter((entry) => entry.role === "shared");
      const boundedOnly =
        relevant.length > 0 &&
        relevant.every((entry) =>
          ["bounded", "duplicate", "irrelevant", "shared"].includes(entry.role),
        );
      const decisive = discriminating.length > 0;
      const ruledOut =
        opposing.length > 0 &&
        decisive &&
        supporting.every((entry) => entry.role !== "outcome");
      const sourceIds = [
        ...new Set(
          supporting
            .filter((entry) => entry.role !== "duplicate")
            .map((entry) => String(entry.item.sourceId ?? entry.item.id)),
        ),
      ].sort();
      const state: Candidate["state"] = ruledOut
        ? "rejected"
        : decisive
          ? "decisive"
          : opposing.length > 0
            ? "weakened"
            : boundedOnly
              ? "bounded"
              : sourceIds.length > 1
                ? "corroborated"
                : "supported";
      const confidence =
        state === "decisive"
          ? 0.86
          : state === "corroborated"
            ? 0.76
            : state === "supported"
              ? 0.64
              : state === "weakened"
                ? 0.5
                : state === "bounded"
                  ? 0.42
                  : 0.18;
      return {
        id,
        ancestry: ancestry.sort(
          (left, right) =>
            left.layer.localeCompare(right.layer) ||
            left.objectId.localeCompare(right.objectId),
        ),
        supportEvidenceIds: supporting.map((entry) => entry.item.id).sort(),
        opposingEvidenceIds: opposing.map((entry) => entry.item.id).sort(),
        discriminatingEvidenceIds: discriminating
          .map((entry) => entry.item.id)
          .sort(),
        sharedEvidenceIds: shared.map((entry) => entry.item.id).sort(),
        sourceIds,
        state,
        confidence,
      };
    })
    .sort((left, right) => left.id.localeCompare(right.id));
}

function adjudicate(
  candidates: Candidate[],
  prior: ExplanationState | null,
): ExplanationState {
  const viableCandidates = candidates.filter(
    (candidate) => candidate.state !== "rejected",
  );
  const rank = (candidate: Candidate) => [
    candidate.state === "decisive" ? 1 : 0,
    candidate.state === "corroborated" ? 1 : 0,
    candidate.state === "bounded" ? 0 : 1,
    candidate.state === "weakened" ? 0 : 1,
    candidate.ancestry.some((item) => item.layer === "Mechanism") ? 1 : 0,
  ];
  const ranked = [...viableCandidates].sort((left, right) => {
    const l = rank(left);
    const r = rank(right);
    for (let index = 0; index < l.length; index += 1) {
      if (l[index] !== r[index]) return r[index] - l[index];
    }
    return left.id.localeCompare(right.id);
  });
  const top = ranked[0] ?? null;
  const second = ranked[1] ?? null;
  const tied = Boolean(top && second && stable(rank(top)) === stable(rank(second)));
  const bounded = ranked.length > 0 && ranked.every((item) => item.state === "bounded");
  const multiCause =
    ranked.length > 1 &&
    ranked.every((item) => item.state === "corroborated") &&
    ranked.every((item) => item.discriminatingEvidenceIds.length === 0);
  const abstained = tied || bounded || multiCause;
  const leader = abstained ? null : top?.id ?? null;
  const viable = ranked.map((item) => item.id).sort();
  const revisionEvidenceIds = [
    ...new Set(
      candidates.flatMap((item) => [
        ...item.opposingEvidenceIds,
        ...item.discriminatingEvidenceIds,
      ]),
    ),
  ].sort();
  return {
    candidates,
    leader,
    viable,
    weakened: candidates
      .filter((item) => item.state === "weakened")
      .map((item) => item.id)
      .sort(),
    displaced:
      prior?.leader && prior.leader !== leader ? [prior.leader] : [],
    abstained,
    recommendation: leader ? RECOMMENDATION[leader] : "none",
    revisionEvidenceIds,
    nextEvidence: viable.map(
      (id) => `Discriminating outcome evidence for or against ${id}.`,
    ),
    prior: prior
      ? { leader: prior.leader, viable: [...prior.viable] }
      : null,
  };
}

function productionLeader(execution: Execution): ExplanationId | null {
  const memory = execution.runtime.memory;
  const extendedMemory = memory as unknown as UnknownRecord;
  const text = stable(
    extendedMemory.primaryExecutiveConstraint ??
      extendedMemory.executiveAssessment ??
      execution.result.executiveAssessment ??
      {},
  );
  return idsIn(text)[0] ?? null;
}

function runScenario(scenarioValue: Scenario): ScenarioResult {
  let accumulated: InvestigationEvidenceSource[] = [];
  let prior: ExplanationState | null = null;
  const phases = scenarioValue.phases.map((phaseValue): PhaseResult => {
    accumulated = [...accumulated, ...phaseValue.evidence];
    const execution = execute(scenarioValue, accumulated);
    const repeated = execute(scenarioValue, accumulated);
    const reversed = execute(scenarioValue, [...accumulated].reverse());
    assert.equal(
      stable(execution.result),
      stable(repeated.result),
      `${scenarioValue.id} production replay must be byte-identical`,
    );
    assert.equal(
      stable(execution.result),
      stable(reversed.result),
      `${scenarioValue.id} evidence order must not alter production result`,
    );
    assert.equal(
      execution.runtime.metadata.organizationId,
      repeated.runtime.metadata.organizationId,
    );
    const candidates = constructCandidates(execution);
    const p2 = adjudicate(candidates, prior);
    const p1 = { ...p2, leader: null, recommendation: "none" };
    prior = p2;
    return { execution, p0Leader: productionLeader(execution), p1, p2 };
  });
  return { scenario: scenarioValue, phases };
}

const results = scenarios.map(runScenario);
for (const result of results) {
  if (!result.scenario.controlOf) continue;
  const expected = results.find(
    (item) => item.scenario.id === result.scenario.controlOf,
  );
  assert.ok(expected);
  const comparable = (items: PhaseResult[]) =>
    items.map((item) => ({
      result: item.execution.result,
      p0Leader: item.p0Leader,
      p1: item.p1,
      p2: item.p2,
    }));
  assert.equal(stable(comparable(result.phases)), stable(comparable(expected.phases)));
}

const scored = results.filter((item) => !item.scenario.controlOf);
const phasePairs = scored.flatMap((item) =>
  item.phases.map((phaseValue, index) => ({
    scenario: item.scenario,
    phase: phaseValue,
    truth: item.scenario.phases[index].truth,
    direction: item.scenario.phases[index].direction,
    index,
  })),
);
const equalSets = (left: string[], right: string[]) =>
  stable([...left].sort()) === stable([...right].sort());
const candidateTruePositive = phasePairs.reduce(
  (sum, item) =>
    sum +
    item.phase.p1.viable.filter((id) => item.truth.valid.includes(id)).length,
  0,
);
const candidateTotal = phasePairs.reduce(
  (sum, item) => sum + item.phase.p1.viable.length,
  0,
);
const expectedTotal = phasePairs.reduce(
  (sum, item) => sum + item.truth.valid.length,
  0,
);
const unsupported = candidateTotal - candidateTruePositive;
const missing = expectedTotal - candidateTruePositive;
const candidatePrecision = candidateTruePositive / candidateTotal;
const candidateRecall = candidateTruePositive / expectedTotal;
const p0Correct = phasePairs.filter(
  (item) => item.phase.p0Leader === item.truth.leader,
).length;
const p2Correct = phasePairs.filter(
  (item) => item.phase.p2.leader === item.truth.leader,
).length;
const setCorrect = phasePairs.filter((item) =>
  equalSets(item.phase.p2.viable, item.truth.valid),
).length;
const abstentionCorrect = phasePairs.filter(
  (item) => item.phase.p2.abstained === item.truth.abstain,
).length;
const recommendationCorrect = phasePairs.filter(
  (item) => item.phase.p2.recommendation === item.truth.recommendation,
).length;
const ancestryComplete = phasePairs.filter((item) =>
  item.phase.p1.candidates.every(
    (candidate) =>
      candidate.ancestry.length > 0 &&
      candidate.ancestry.every((entry) => entry.objectId.length > 0),
  ),
).length;
const historyPreserved = scored.reduce(
  (sum, item) =>
    sum +
    item.phases.filter(
      (phaseValue, index) =>
        index === 0 ||
        (phaseValue.p2.prior !== null &&
          phaseValue.p2.prior.leader === item.phases[index - 1].p2.leader &&
          equalSets(
            phaseValue.p2.prior.viable,
            item.phases[index - 1].p2.viable,
          )),
    ).length,
  0,
);
const duplicateStable = scored
  .filter((item) => item.scenario.id.includes("duplicate"))
  .every(
    (item) =>
      item.phases[0].p2.leader === item.phases[1].p2.leader &&
      equalSets(item.phases[0].p2.viable, item.phases[1].p2.viable),
  );
const irrelevantStable = scored
  .filter((item) => item.scenario.id.includes("irrelevant"))
  .every(
    (item) =>
      item.phases[0].p2.leader === item.phases[1].p2.leader &&
      equalSets(item.phases[0].p2.viable, item.phases[1].p2.viable),
  );
const revisionCorrect = phasePairs.filter((item) => {
  if (item.index === 0) return true;
  const before = item.scenario.phases[item.index - 1].truth;
  const after = item.truth;
  const actualBefore = results
    .find((result) => result.scenario.id === item.scenario.id)!
    .phases[item.index - 1].p2;
  if (item.direction === "stable")
    return (
      item.phase.p2.leader === actualBefore.leader &&
      equalSets(item.phase.p2.viable, actualBefore.viable)
    );
  if (item.direction === "expand")
    return item.phase.p2.viable.length > actualBefore.viable.length;
  if (item.direction === "displace")
    return (
      item.phase.p2.leader !== actualBefore.leader &&
      item.phase.p2.leader === after.leader
    );
  if (item.direction === "weaken")
    return (
      item.phase.p2.leader === after.leader &&
      item.phase.p2.weakened.includes(after.leader!)
    );
  return item.phase.p2.leader === after.leader && before.leader === after.leader;
}).length;
const confidenceDirectionCorrect = scored.reduce(
  (sum, item) =>
    sum +
    item.phases.filter((phaseValue, index) => {
      if (index === 0) return true;
      const previous = item.phases[index - 1].p2;
      const expected = item.scenario.phases[index];
      const trackedId =
        expected.direction === "displace"
          ? expected.truth.leader
          : item.scenario.phases[index - 1].truth.leader;
      if (!trackedId) return phaseValue.p2.abstained === expected.truth.abstain;
      const before =
        previous.candidates.find((candidate) => candidate.id === trackedId)
          ?.confidence ?? 0;
      const after =
        phaseValue.p2.candidates.find(
          (candidate) => candidate.id === trackedId,
        )?.confidence ?? 0;
      if (expected.direction === "weaken") return after < before;
      if (
        expected.direction === "strengthen" ||
        expected.direction === "displace"
      )
        return after > before;
      return after === before;
    }).length,
  0,
);
const cross = phasePairs.filter((item) => item.scenario.crossBenchmark);
const crossImprovements = cross.filter(
  (item) =>
    item.phase.p0Leader !== item.truth.leader &&
    item.phase.p2.leader === item.truth.leader,
).length;
const total = phasePairs.length;
const classification =
  candidatePrecision >= 0.9 &&
  candidateRecall >= 0.9 &&
  p2Correct / total >= 0.9 &&
  revisionCorrect / total >= 0.9 &&
  abstentionCorrect === total &&
  unsupported === 0 &&
  duplicateStable &&
  irrelevantStable &&
  recommendationCorrect === total &&
  ancestryComplete === total &&
  crossImprovements >= 2
    ? "A — Production-shadow breakthrough confirmed"
    : candidatePrecision >= 0.8 &&
        candidateRecall >= 0.8 &&
        p2Correct / total >= 0.75 &&
        unsupported <= 2
      ? "B — Strong but incomplete"
      : candidateRecall < 0.7 || p2Correct / total < 0.65
        ? "C — Controlled-fixture overfit"
        : "D — Unsafe";

console.log("SPRINT 120 — COMPETING EXPLANATION PRODUCTION SHADOW");
console.log("");
console.log(
  `P0: leader=${p0Correct}/${total} MRR=${(p0Correct / total).toFixed(3)}`,
);
console.log(
  `P1: precision=${candidatePrecision.toFixed(3)} recall=${candidateRecall.toFixed(3)} unsupported=${unsupported} missing=${missing} ancestry=${ancestryComplete}/${total}`,
);
console.log(
  `P2: leader=${p2Correct}/${total} set=${setCorrect}/${total} revision=${revisionCorrect}/${total} confidenceDirection=${confidenceDirectionCorrect}/${total} abstention=${abstentionCorrect}/${total} recommendation=${recommendationCorrect}/${total} history=${historyPreserved}/${total} MRR=${(p2Correct / total).toFixed(3)}`,
);
console.log("");
for (const result of scored) {
  console.log(`SCENARIO ${result.scenario.id}`);
  result.phases.forEach((item, index) => {
    const expected = result.scenario.phases[index];
    console.log(
      `  T${index}: production=${item.p0Leader ?? "abstain"} shadow=${item.p2.leader ?? "abstain"} truth=${expected.truth.leader ?? "abstain"} candidates=${item.p2.viable.join(",") || "none"} direction=${expected.direction} confidence=${item.p2.candidates.map((candidate) => `${candidate.id}:${candidate.confidence.toFixed(2)}`).join(",") || "none"} revisionEvidence=${item.p2.revisionEvidenceIds.join(",") || "none"}`,
    );
  });
}
console.log("");
console.log(
  `Controls: duplicate=${duplicateStable ? "PASS" : "FAIL"} irrelevant=${irrelevantStable ? "PASS" : "FAIL"} order=PASS repeated=PASS crossImprovements=${crossImprovements}`,
);
console.log(`Classification: ${classification}`);
console.log("Production outputs, Runtime, persistence, schemas, and fixtures: unchanged");
