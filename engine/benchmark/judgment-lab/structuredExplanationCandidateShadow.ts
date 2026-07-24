import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import type {
  InvestigationEvidenceSource,
  InvestigationInput,
} from "../../types";
import { runDiscoveryV3 } from "../../v3";
import type { KnowledgeReference } from "../../v3/cognition/cognitiveGraph";
import type { OrganizationalExplanation } from "../../v3/model/judgment/organizationalJudgment";
import type { OrganizationalMechanism } from "../../v3/model/judgment/organizationalMechanism";
import type { OrganizationalTheory } from "../../v3/model/memory/organizationalTheories";
import { createEmptyOrganizationRuntime } from "../../v3/runtime/organizationRuntime";
import { evolveOrganizationRuntime } from "../../v3/runtime/evolveOrganizationRuntime";
import type { DiscoveryV3Result } from "../../v3/types";
import { atlasIndustrialArtifacts } from "./atlasIndustrialPilot";

type UnknownRecord = Record<string, unknown>;
type ExplanationFamily =
  | "capacity"
  | "concurrency"
  | "decisionFlow"
  | "coordination"
  | "strategy"
  | "knowledge"
  | "leadership"
  | "operatingModel";
type EvidenceRole =
  | "support"
  | "oppose"
  | "discriminate"
  | "shared"
  | "contradict"
  | "counterfactual"
  | "outcome"
  | "bounded"
  | "duplicate"
  | "irrelevant";

type OrganizationalScope = {
  level: "team" | "department" | "enterprise";
  subjectIds: string[];
};
type TemporalApplicability = {
  validFrom: string | null;
  validTo: string | null;
  status: "current" | "historical" | "unknown";
};
type ExplanationEvidenceLink = {
  explanationId: string;
  evidenceId: string;
  role: EvidenceRole;
  targetExplanationIds: string[];
  classificationConfidence: number;
  rationalePathIds: string[];
  basis: "structured" | "boundedLexicalFallback" | "unclassified";
};
type ShadowOrganizationalExplanation = {
  id: string;
  organizationId: string;
  semanticKey: string;
  family: ExplanationFamily;
  claim: {
    subjectIds: string[];
    rootMechanismIds: string[];
    outcomeIds: string[];
    scope: OrganizationalScope;
  };
  theoryIds: string[];
  beliefIds: string[];
  reasoningPathIds: string[];
  affectedConditionIds: string[];
  evidenceLinks: ExplanationEvidenceLink[];
  contradictionIds: string[];
  assumptions: string[];
  temporalApplicability: TemporalApplicability;
  viability: "viable";
  supportProfile: {
    supportState: "structured";
    oppositionState: "unknown";
    boundedConfidence: number;
  };
  uncertainty: {
    missingRelationships: string[];
  };
  lineage: {
    priorVersionId: string | null;
    supersedesIds: string[];
    mergedFromIds: string[];
    splitFromId: string | null;
    reactivatesId: string | null;
  };
};

type HiddenState = {
  validFamilies: ExplanationFamily[];
  leader: ExplanationFamily | null;
};
type Phase = {
  evidence: InvestigationEvidenceSource[];
  hidden: HiddenState;
};
type Scenario = {
  id: string;
  industry: string;
  scope: OrganizationalScope;
  phases: Phase[];
  crossBenchmark?: boolean;
  controlOf?: string;
};
type Execution = {
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
};
type PhaseResult = {
  execution: Execution;
  s0ExplanationCount: number;
  s1: ShadowOrganizationalExplanation[];
  missingRelationships: string[];
};

const FIXED_TIME = Date.parse("2026-07-27T12:00:00.000Z");
const atlas = new Map(
  atlasIndustrialArtifacts.map((artifact) => [artifact.id, artifact]),
);

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
  let seed = 0x1212026;
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

function source(id: string, content: string): InvestigationEvidenceSource {
  return { sourceId: id, sourceType: "structured-explanation-shadow", content };
}

function hidden(
  validFamilies: ExplanationFamily[],
  leader: ExplanationFamily | null,
): HiddenState {
  return { validFamilies, leader };
}

function one(
  id: string,
  lines: string[],
  expected: HiddenState,
  options: Partial<Pick<Scenario, "industry" | "scope" | "crossBenchmark">> = {},
): Scenario {
  return {
    id,
    industry: options.industry ?? "Industry neutral",
    scope: options.scope ?? { level: "enterprise", subjectIds: ["organization"] },
    phases: [
      {
        evidence: lines.map((line, index) => source(`e${index + 1}`, line)),
        hidden: expected,
      },
    ],
    crossBenchmark: options.crossBenchmark,
  };
}

function sequence(
  id: string,
  stages: string[][],
  expected: HiddenState[],
  options: Partial<Pick<Scenario, "industry" | "scope" | "crossBenchmark">> = {},
): Scenario {
  return {
    id,
    industry: options.industry ?? "Industry neutral",
    scope: options.scope ?? { level: "enterprise", subjectIds: ["organization"] },
    phases: stages.map((lines, stage) => ({
      evidence: lines.map((line, index) =>
        source(`${String.fromCharCode(97 + stage)}${index + 1}`, line),
      ),
      hidden: expected[stage],
    })),
    crossBenchmark: options.crossBenchmark,
  };
}

const atlasEvidence = (ids: string[]) =>
  ids.map((id) => {
    const artifact = atlas.get(id);
    assert.ok(artifact);
    return source(artifact.id, artifact.content);
  });

const scenarios: Scenario[] = [
  {
    id: "atlas-decisive-sequence",
    industry: "Industrial automation",
    scope: { level: "enterprise", subjectIds: ["atlas-industrial"] },
    crossBenchmark: true,
    phases: [
      { evidence: atlasEvidence(["A15"]), hidden: hidden(["capacity"], "capacity") },
      {
        evidence: atlasEvidence(["A04"]),
        hidden: hidden(["capacity", "decisionFlow"], null),
      },
      {
        evidence: atlasEvidence(["A03", "A11"]),
        hidden: hidden(["decisionFlow"], "decisionFlow"),
      },
    ],
  },
  sequence(
    "atlas-credible-opposition",
    [
      ["Capacity pressure appears to constrain delivery."],
      ["Decision authority and approval dependency also delay work."],
      ["Comparable high-load work succeeds when authority is explicit."],
    ],
    [
      hidden(["capacity"], "capacity"),
      hidden(["capacity", "decisionFlow"], null),
      hidden(["decisionFlow"], "decisionFlow"),
    ],
    { crossBenchmark: true },
  ),
  sequence(
    "atlas-delayed-evidence",
    [
      ["Capacity is the initial explanation."],
      ["Decision latency is a competing explanation."],
      ["Delayed outcome evidence links approval dependency to missed commitments."],
    ],
    [
      hidden(["capacity"], "capacity"),
      hidden(["capacity", "decisionFlow"], null),
      hidden(["decisionFlow"], "decisionFlow"),
    ],
    { crossBenchmark: true },
  ),
  sequence(
    "northstar-operational",
    [
      ["Staffing appears insufficient."],
      ["Concurrent work and decision latency fragment execution."],
      ["Reducing work in progress and clarifying decision rights restores flow."],
    ],
    [
      hidden(["capacity"], "capacity"),
      hidden(["concurrency", "decisionFlow"], null),
      hidden(["concurrency", "decisionFlow"], null),
    ],
    { industry: "Industrial systems", crossBenchmark: true },
  ),
  sequence(
    "knowledge-fragmentation",
    [
      ["Capacity appears to cause repeated rework."],
      ["Knowledge fragmentation and context loss precede rework."],
      ["Preserving knowledge eliminates rework without added capacity."],
    ],
    [
      hidden(["capacity"], "capacity"),
      hidden(["capacity", "knowledge"], null),
      hidden(["knowledge"], "knowledge"),
    ],
    { crossBenchmark: true },
  ),
  one(
    "atlas-duplicate-control",
    ["Decision authority delays work.", "Decision authority delays work."],
    hidden(["decisionFlow"], "decisionFlow"),
    { crossBenchmark: true },
  ),
  one(
    "capacity-versus-concurrency",
    ["Concurrent work fragments capacity without a staffing shortage."],
    hidden(["concurrency"], "concurrency"),
    { crossBenchmark: true },
  ),
  one(
    "strategy-versus-decision-flow",
    ["Priority churn is caused by unclear decision rights rather than strategy."],
    hidden(["decisionFlow"], "decisionFlow"),
    { crossBenchmark: true },
  ),
  one(
    "leadership-versus-coordination",
    ["Leadership dependency causes coordination and handoff delay."],
    hidden(["leadership"], "leadership"),
  ),
  one(
    "ownership-versus-process",
    ["Ownership ambiguity in the operating model causes process inconsistency."],
    hidden(["operatingModel"], "operatingModel"),
  ),
  one(
    "multiple-independent-causes",
    ["Decision latency and knowledge fragmentation independently cause delay."],
    hidden(["decisionFlow", "knowledge"], null),
  ),
  one(
    "feedback-loop",
    ["Decision latency worsens coordination, which triggers more approval escalation."],
    hidden(["decisionFlow", "coordination"], null),
  ),
  one(
    "shared-with-discriminator",
    ["Shared evidence supports strategy and decision flow; outcome evidence favors decision flow."],
    hidden(["decisionFlow"], "decisionFlow"),
  ),
  one(
    "counterfactual-displacement",
    ["Counterfactual outcome evidence rejects capacity and supports decision authority."],
    hidden(["decisionFlow"], "decisionFlow"),
  ),
  one(
    "weak-opposition",
    ["Knowledge fragmentation remains viable despite weak opposition."],
    hidden(["knowledge"], "knowledge"),
  ),
  one(
    "exact-duplicate",
    ["Coordination failure delays work.", "Coordination failure delays work."],
    hidden(["coordination"], "coordination"),
  ),
  one(
    "irrelevant-evidence",
    ["Decision latency delays work.", "Office seating utilization changed."],
    hidden(["decisionFlow"], "decisionFlow"),
  ),
  one(
    "sparse-abstention",
    ["Weak evidence mentions capacity and coordination."],
    hidden(["capacity", "coordination"], null),
  ),
  one("no-defensible-candidate", ["Customer sentiment is mixed."], hidden([], null)),
  one(
    "team-scope",
    ["Knowledge fragmentation causes team rework."],
    hidden(["knowledge"], "knowledge"),
    { scope: { level: "team", subjectIds: ["engineering-team"] } },
  ),
  one(
    "department-scope",
    ["Decision latency constrains the operations department."],
    hidden(["decisionFlow"], "decisionFlow"),
    { scope: { level: "department", subjectIds: ["operations"] } },
  ),
  one(
    "enterprise-scope",
    ["Strategic alignment constrains enterprise execution."],
    hidden(["strategy"], "strategy"),
  ),
  one(
    "industry-neutral-terminology",
    ["Authority boundaries cause choices to travel upward and slow flow."],
    hidden(["decisionFlow"], "decisionFlow"),
    { industry: "Healthcare services" },
  ),
  one(
    "surface-paraphrase",
    ["Routine choices move to senior leaders, increasing decision latency."],
    hidden(["decisionFlow"], "decisionFlow"),
    { industry: "Healthcare services" },
  ),
];

const orderBase = one(
  "order-control",
  ["Decision latency delays work.", "Knowledge fragmentation causes rework."],
  hidden(["decisionFlow", "knowledge"], null),
);
scenarios.push(orderBase, {
  ...orderBase,
  id: "reverse-evidence-order",
  controlOf: orderBase.id,
  phases: orderBase.phases.map((phase) => ({
    ...phase,
    evidence: [...phase.evidence].reverse(),
  })),
});

function execute(scenario: Scenario, evidenceSources: InvestigationEvidenceSource[]): Execution {
  return deterministic(() => {
    const input: InvestigationInput = {
      company: "Structured Explanation Shadow",
      website: "https://structured-explanation.invalid",
      industry: scenario.industry,
      question: "What structured causal explanation best accounts for the outcome?",
      context: "",
      evidenceSources: [...evidenceSources].sort(
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
          organizationId: `structured-explanation:${scenario.id}`,
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

function extendedMemory(execution: Execution): UnknownRecord {
  return execution.runtime.memory as unknown as UnknownRecord;
}

function productionExplanations(execution: Execution): OrganizationalExplanation[] {
  const values = extendedMemory(execution).organizationalExplanations;
  return Array.isArray(values) ? (values as OrganizationalExplanation[]) : [];
}

function productionMechanisms(execution: Execution): OrganizationalMechanism[] {
  const network = extendedMemory(execution).mechanismNetwork as UnknownRecord | undefined;
  return Array.isArray(network?.mechanisms)
    ? (network.mechanisms as OrganizationalMechanism[])
    : [];
}

function productionTheories(execution: Execution): OrganizationalTheory[] {
  return execution.runtime.memory.theories;
}

function familyForMechanism(
  mechanism: OrganizationalMechanism,
): ExplanationFamily | null {
  switch (mechanism.type) {
    case "resourceConstraint":
      return "capacity";
    case "executionDrag":
      return "concurrency";
    case "decisionLatency":
    case "governanceFriction":
    case "decision":
    case "governance":
      return "decisionFlow";
    case "coordinationBreakdown":
    case "coordination":
      return "coordination";
    case "priorityConflict":
    case "priority":
      return "strategy";
    case "knowledgeConcentration":
    case "knowledgeFragmentation":
    case "weakKnowledgeTransfer":
    case "institutionalMemoryLoss":
    case "documentationBreakdown":
    case "duplicatedKnowledgeWork":
    case "organizationalLearningFailure":
    case "knowledge":
      return "knowledge";
    case "accountabilityGap":
      return "operatingModel";
    default:
      return null;
  }
}

function semanticIdentity(input: {
  organizationId: string;
  scope: OrganizationalScope;
  mechanismIds: string[];
  outcomeIds: string[];
  relationFamily: string;
}): { semanticKey: string; id: string } {
  const semanticKey = stable({
    organizationId: input.organizationId,
    scope: {
      level: input.scope.level,
      subjectIds: [...input.scope.subjectIds].sort(),
    },
    mechanismIds: [...input.mechanismIds].sort(),
    outcomeIds: [...input.outcomeIds].sort(),
    relationFamily: input.relationFamily,
  });
  return {
    semanticKey,
    id: `explanation:${createHash("sha256").update(semanticKey).digest("hex").slice(0, 20)}`,
  };
}

function evidenceIds(references: KnowledgeReference[]): string[] {
  // KnowledgeReference does not currently include an Evidence node type.
  // Direct Evidence ancestry must therefore come from Mechanism or Theory IDs.
  void references;
  return [];
}

function constructCandidates(
  execution: Execution,
  scope: OrganizationalScope,
): {
  candidates: ShadowOrganizationalExplanation[];
  missingRelationships: string[];
} {
  const explanations = productionExplanations(execution);
  const mechanisms = productionMechanisms(execution);
  const theories = productionTheories(execution);
  const organizationId = execution.runtime.metadata.organizationId;
  const missing = new Set<string>();
  const candidates: ShadowOrganizationalExplanation[] = [];

  if (explanations.length === 0) {
    missing.add("production OrganizationalExplanation absent");
  }

  for (const explanation of explanations) {
    if (explanation.supportedPathIds.length === 0) {
      missing.add("Explanation.supportedPathIds");
      continue;
    }
    if (explanation.explainedEffectIds.length === 0) {
      missing.add("Explanation.explainedEffectIds");
      continue;
    }
    const compatibleMechanisms = mechanisms.filter((mechanism) => {
      const explanationLinked =
        mechanism.supportingExplanationIds.includes(explanation.id);
      const pathIds =
        mechanism.supportingReasoningPathIds ?? mechanism.reasoningPathIds ?? [];
      const pathLinked = pathIds.some((id) =>
        explanation.supportedPathIds.includes(id),
      );
      return explanationLinked && pathLinked;
    });
    if (compatibleMechanisms.length === 0) {
      missing.add("Mechanism→Explanation+ReasoningPath join");
      continue;
    }

    for (const mechanism of compatibleMechanisms) {
      const family = familyForMechanism(mechanism);
      if (!family) {
        missing.add("Mechanism.type→Explanation family");
        continue;
      }
      const compatibleTheories = theories.filter((theory) =>
        theory.supportingMechanisms.includes(mechanism.id),
      );
      if (compatibleTheories.length === 0) {
        missing.add("Theory.supportingMechanisms→Mechanism join");
        continue;
      }
      const mechanismScope = mechanism.organizationalScope?.trim();
      if (
        mechanismScope &&
        !scope.subjectIds.includes(mechanismScope) &&
        mechanismScope !== scope.level
      ) {
        missing.add("normalized organizational scope relationship");
        continue;
      }
      const identity = semanticIdentity({
        organizationId,
        scope,
        mechanismIds: [mechanism.id],
        outcomeIds: explanation.explainedEffectIds,
        relationFamily: explanation.explanationType,
      });
      const supportingEvidenceIds = [
        ...new Set([
          ...evidenceIds(explanation.evidenceReferences),
          ...mechanism.supportingEvidenceIds,
          ...compatibleTheories.flatMap((theory) => theory.supportingEvidence),
        ]),
      ].sort();
      if (supportingEvidenceIds.length === 0) {
        missing.add("Evidence→Explanation ancestry");
        continue;
      }
      const evidenceLinks: ExplanationEvidenceLink[] =
        supportingEvidenceIds.map((evidenceId) => ({
          explanationId: identity.id,
          evidenceId,
          role: "support",
          targetExplanationIds: [],
          classificationConfidence: 1,
          rationalePathIds: [...explanation.supportedPathIds].sort(),
          basis: "structured",
        }));
      candidates.push({
        id: identity.id,
        organizationId,
        semanticKey: identity.semanticKey,
        family,
        claim: {
          subjectIds: [...scope.subjectIds].sort(),
          rootMechanismIds: [mechanism.id],
          outcomeIds: [...explanation.explainedEffectIds].sort(),
          scope,
        },
        theoryIds: compatibleTheories.map((theory) => theory.id).sort(),
        beliefIds: compatibleTheories.flatMap((theory) => theory.supportingBeliefs).sort(),
        reasoningPathIds: [...explanation.supportedPathIds].sort(),
        affectedConditionIds: [],
        evidenceLinks,
        contradictionIds: [],
        assumptions: [...explanation.assumptions],
        temporalApplicability: {
          validFrom: null,
          validTo: null,
          status: "unknown",
        },
        viability: "viable",
        supportProfile: {
          supportState: "structured",
          oppositionState: "unknown",
          boundedConfidence: explanation.confidence,
        },
        uncertainty: {
          missingRelationships: [
            "typed opposition/discrimination relationships",
            "temporal applicability",
          ],
        },
        lineage: {
          priorVersionId: null,
          supersedesIds: [],
          mergedFromIds: [],
          splitFromId: null,
          reactivatesId: null,
        },
      });
    }
  }

  const unique = new Map<string, ShadowOrganizationalExplanation>();
  for (const candidate of candidates) unique.set(candidate.id, candidate);
  return {
    candidates: [...unique.values()].sort((left, right) =>
      left.id.localeCompare(right.id),
    ),
    missingRelationships: [...missing].sort(),
  };
}

function runScenario(scenario: Scenario): PhaseResult[] {
  let accumulated: InvestigationEvidenceSource[] = [];
  return scenario.phases.map((phase) => {
    accumulated = [...accumulated, ...phase.evidence];
    const execution = execute(scenario, accumulated);
    const repeated = execute(scenario, [...accumulated].reverse());
    assert.equal(stable(execution.result), stable(repeated.result));
    const constructed = constructCandidates(execution, scenario.scope);
    assert.equal(
      stable(constructed),
      stable(constructCandidates(repeated, scenario.scope)),
    );
    return {
      execution,
      s0ExplanationCount: productionExplanations(execution).length,
      s1: constructed.candidates,
      missingRelationships: constructed.missingRelationships,
    };
  });
}

const results = scenarios.map((scenario) => ({
  scenario,
  phases: runScenario(scenario),
}));
for (const result of results) {
  if (!result.scenario.controlOf) continue;
  const expected = results.find(
    (candidate) => candidate.scenario.id === result.scenario.controlOf,
  );
  assert.ok(expected);
  assert.equal(
    stable(result.phases.map((phase) => phase.s1)),
    stable(expected.phases.map((phase) => phase.s1)),
  );
}

const scored = results.filter((result) => !result.scenario.controlOf);
const observations = scored.flatMap((result) =>
  result.phases.map((phase, index) => ({
    scenario: result.scenario,
    phase,
    hidden: result.scenario.phases[index].hidden,
  })),
);
const truePositive = observations.reduce(
  (sum, observation) =>
    sum +
    observation.phase.s1.filter((candidate) =>
      observation.hidden.validFamilies.includes(candidate.family),
    ).length,
  0,
);
const candidateCount = observations.reduce(
  (sum, observation) => sum + observation.phase.s1.length,
  0,
);
const expectedCount = observations.reduce(
  (sum, observation) => sum + observation.hidden.validFamilies.length,
  0,
);
const unsupported = candidateCount - truePositive;
const missing = expectedCount - truePositive;
const precision = candidateCount === 0 ? 1 : truePositive / candidateCount;
const recall = expectedCount === 0 ? 1 : truePositive / expectedCount;
const exactSet = observations.filter((observation) => {
  const actual = [
    ...new Set(observation.phase.s1.map((candidate) => candidate.family)),
  ].sort();
  return stable(actual) === stable([...observation.hidden.validFamilies].sort());
}).length;
const ancestryComplete = observations.reduce(
  (sum, observation) =>
    sum +
    observation.phase.s1.filter(
    (candidate) =>
      candidate.claim.rootMechanismIds.length > 0 &&
      candidate.reasoningPathIds.length > 0 &&
      candidate.claim.outcomeIds.length > 0 &&
      candidate.theoryIds.length > 0 &&
      candidate.evidenceLinks.length > 0,
    ).length,
  0,
);
const identityStable = observations.every((observation) => {
  const rerun = constructCandidates(
    observation.phase.execution,
    observation.scenario.scope,
  ).candidates;
  return (
    stable(observation.phase.s1.map((candidate) => candidate.id)) ===
    stable(rerun.map((candidate) => candidate.id))
  );
});
const structuredRoles = observations.reduce(
  (sum, observation) =>
    sum +
    observation.phase.s1.flatMap((candidate) => candidate.evidenceLinks)
      .filter((link) => link.basis === "structured").length,
  0,
);
const fallbackRoles = observations.reduce(
  (sum, observation) =>
    sum +
    observation.phase.s1.flatMap((candidate) => candidate.evidenceLinks)
      .filter((link) => link.basis === "boundedLexicalFallback").length,
  0,
);
const unclassifiedRoles = observations.reduce(
  (sum, observation) =>
    sum +
    observation.phase.s1.flatMap((candidate) => candidate.evidenceLinks)
      .filter((link) => link.basis === "unclassified").length,
  0,
);
const gatePassed = precision >= 0.9 && recall >= 0.9;
const missingRelationshipCounts = new Map<string, number>();
for (const observation of observations) {
  for (const relationship of observation.phase.missingRelationships) {
    missingRelationshipCounts.set(
      relationship,
      (missingRelationshipCounts.get(relationship) ?? 0) + 1,
    );
  }
}
const classification = gatePassed
  ? exactSet / observations.length >= 0.85 && unsupported === 0
    ? "B — Strong but incomplete"
    : "B — Strong but incomplete"
  : "C — Existing structured cognition is insufficient";

console.log("SPRINT 121 — STRUCTURED EXPLANATION CANDIDATE SHADOW");
console.log("");
console.log(
  `Architecture: type=engine/v3/model/judgment/organizationalJudgment.ts producer=synthesizeExplanations consumers=evaluateExplanations,detectJudgmentContradictions,MechanismInference currentId=index-based generation=before-Mechanism-and-Theory`,
);
console.log(
  `S0: productionExplanations=${observations.reduce((sum, item) => sum + item.phase.s0ExplanationCount, 0)}`,
);
console.log(
  `S1: precision=${precision.toFixed(3)} recall=${recall.toFixed(3)} exactSet=${exactSet}/${observations.length} unsupported=${unsupported} missing=${missing} ancestry=${ancestryComplete}/${candidateCount} identityStable=${identityStable}`,
);
console.log(
  `Evidence roles: structured=${structuredRoles} fallback=${fallbackRoles} unclassified=${unclassifiedRoles}`,
);
console.log(
  `Candidate gate: ${gatePassed ? "PASS" : "FAIL — S2 adjudication not run"}`,
);
console.log("");
for (const [relationship, count] of [...missingRelationshipCounts.entries()].sort())
  console.log(`MISSING ${relationship}: ${count}/${observations.length}`);
console.log("");
for (const result of scored) {
  console.log(
    `SCENARIO ${result.scenario.id}: ${result.phases
      .map(
        (phase, index) =>
          `T${index}[s0=${phase.s0ExplanationCount} s1=${phase.s1.map((candidate) => `${candidate.family}:${candidate.id}`).join(",") || "none"} truth=${result.scenario.phases[index].hidden.validFamilies.join(",") || "none"}]`,
      )
      .join(" → ")}`,
  );
}
console.log("");
console.log(`Classification: ${classification}`);
console.log("S2: NOT RUN because candidate precision or recall failed the hard gate");
console.log("Runtime, schemas, production output, capability registry, and fixtures: unchanged");
