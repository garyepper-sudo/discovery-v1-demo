import { spawnSync } from "node:child_process";

import { buildCausalChains } from "../../../v3/causal";
import { generateExplanations } from "../../../v3/explanations";
import type {
  V3CausalChain,
  DiscoveryV3Result,
  V3Evidence,
  V3Explanation,
  V3Signal,
  V3Theme,
} from "../../../v3/types";
import type { OrganizationRuntime } from "../../../v3/runtime/organizationRuntime";
import { runCanonicalNorthstarGroundTruthReplay } from "./runCanonicalNorthstarGroundTruthReplay";

const FIXED_TIME = "2026-07-22T20:00:00.000Z";
const LIMIT = 5;

type PolicyId = "A" | "B" | "C" | "D" | "E";
type Policy = {
  id: PolicyId;
  name: string;
  select: (signals: V3Signal[]) => V3Signal[];
};

type TargetConcept = {
  id: string;
  phrases: string[];
};

const TARGET_CONCEPTS: TargetConcept[] = [
  {
    id: "staffing-counterfactual",
    phrases: [
      "staffing may not",
      "staffing is not",
      "not the primary root cause",
      "current staffing may support",
      "without adding headcount",
      "without additional headcount",
    ],
  },
  {
    id: "concurrency-cause",
    phrases: [
      "concurrent work",
      "work in progress",
      "reprioritization",
      "reducing effective organizational capacity",
    ],
  },
  {
    id: "reduce-work-consequence",
    phrases: [
      "reducing active work",
      "reduce active work",
      "sequencing",
      "protecting active work",
      "improve execution throughput",
    ],
  },
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "for",
  "from",
  "if",
  "in",
  "is",
  "it",
  "may",
  "of",
  "or",
  "that",
  "the",
  "this",
  "to",
  "with",
]);

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(signal: V3Signal): Set<string> {
  return new Set(
    normalize(`${signal.title} ${signal.description}`)
      .split(" ")
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
}

function similarity(left: V3Signal, right: V3Signal): number {
  const leftTokens = tokens(left);
  const rightTokens = tokens(right);
  const intersection = [...leftTokens].filter((token) =>
    rightTokens.has(token),
  ).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

function stableSignalOrder(signals: V3Signal[]): V3Signal[] {
  return [...signals].sort(
    (left, right) =>
      right.confidence - left.confidence ||
      right.evidenceIds.length - left.evidenceIds.length ||
      left.title.localeCompare(right.title) ||
      left.id.localeCompare(right.id),
  );
}

function supportRank(signal: V3Signal): number {
  const independentSupport = new Set(signal.evidenceIds).size;
  return signal.confidence + Math.min(0.12, independentSupport * 0.02);
}

function relevanceRanked(signals: V3Signal[]): V3Signal[] {
  return [...signals]
    .sort(
      (left, right) =>
        supportRank(right) - supportRank(left) ||
        left.title.localeCompare(right.title) ||
        left.id.localeCompare(right.id),
    )
    .slice(0, LIMIT);
}

function coverageConstrained(signals: V3Signal[]): V3Signal[] {
  const ordered = relevanceRanked(signals).concat(
    stableSignalOrder(signals).filter(
      (signal) => !relevanceRanked(signals).some((item) => item.id === signal.id),
    ),
  );
  const selected: V3Signal[] = [];

  (["negative", "neutral", "positive", "mixed", "unknown"] as const).forEach(
    (polarity) => {
      const candidate = ordered.find(
        (signal) =>
          signal.polarity === polarity &&
          !selected.some((item) => item.id === signal.id),
      );
      if (candidate && selected.length < LIMIT) selected.push(candidate);
    },
  );

  ordered.forEach((signal) => {
    if (
      selected.length < LIMIT &&
      !selected.some((item) => item.id === signal.id)
    ) {
      selected.push(signal);
    }
  });

  return selected;
}

function diversityAware(signals: V3Signal[]): V3Signal[] {
  const candidates = stableSignalOrder(signals);
  const selected: V3Signal[] = [];

  while (selected.length < LIMIT && selected.length < candidates.length) {
    const remaining = candidates.filter(
      (candidate) => !selected.some((item) => item.id === candidate.id),
    );
    const next = [...remaining].sort((left, right) => {
      const leftRedundancy = Math.max(
        0,
        ...selected.map((item) => similarity(left, item)),
      );
      const rightRedundancy = Math.max(
        0,
        ...selected.map((item) => similarity(right, item)),
      );
      const leftScore = supportRank(left) - leftRedundancy * 0.35;
      const rightScore = supportRank(right) - rightRedundancy * 0.35;
      return (
        rightScore - leftScore ||
        left.title.localeCompare(right.title) ||
        left.id.localeCompare(right.id)
      );
    })[0];
    if (!next) break;
    selected.push(next);
  }

  return selected;
}

const POLICIES: Policy[] = [
  {
    id: "A",
    name: "current first-five control",
    select: (signals) => signals.slice(0, LIMIT),
  },
  {
    id: "B",
    name: "all selected Signals",
    select: stableSignalOrder,
  },
  {
    id: "C",
    name: "support-ranked bounded selection",
    select: relevanceRanked,
  },
  {
    id: "D",
    name: "polarity-coverage bounded selection",
    select: coverageConstrained,
  },
  {
    id: "E",
    name: "diversity-aware bounded selection",
    select: diversityAware,
  },
];

function strongestEvidenceStrength(
  evidence: V3Evidence[],
): V3Theme["strength"] {
  if (evidence.some((item) => item.strength === "strong")) return "strong";
  if (evidence.some((item) => item.strength === "moderate")) return "moderate";
  return "weak";
}

function signalTheme(
  signal: V3Signal,
  evidenceById: Map<string, V3Evidence>,
  index: number,
): V3Theme {
  const evidence = signal.evidenceIds
    .map((id) => evidenceById.get(id))
    .filter((item): item is V3Evidence => Boolean(item));

  return {
    id: `POLICY-ST${index + 1}`,
    title: signal.title,
    description: signal.description,
    evidenceIds: signal.evidenceIds,
    signalIds: [signal.id],
    confidence: signal.confidence,
    keywords: Array.from(
      new Set(evidence.flatMap((item) => item.keywords ?? [])),
    ).slice(0, 14),
    entities: Array.from(
      new Set(evidence.flatMap((item) => item.entities ?? [])),
    ).slice(0, 10),
    polarity: signal.polarity,
    strength: strongestEvidenceStrength(evidence),
    stability: signal.confidence,
  };
}

function matchedConceptIds(value: unknown): string[] {
  const text = normalize(JSON.stringify(value));
  return TARGET_CONCEPTS.filter((concept) =>
    concept.phrases.some((phrase) => text.includes(normalize(phrase))),
  ).map((concept) => concept.id);
}

function averageSimilarity(signals: V3Signal[]): number {
  const pairs: number[] = [];
  signals.forEach((left, leftIndex) => {
    signals.slice(leftIndex + 1).forEach((right) => {
      pairs.push(similarity(left, right));
    });
  });
  return pairs.length === 0
    ? 0
    : pairs.reduce((sum, value) => sum + value, 0) / pairs.length;
}

function evaluatePolicy(
  policy: Policy,
  signals: V3Signal[],
  evidence: V3Evidence[],
) {
  const selected = policy.select(signals);
  const evidenceById = new Map(evidence.map((item) => [item.id, item]));
  const themes = selected.map((signal, index) =>
    signalTheme(signal, evidenceById, index),
  );
  const causalChains = buildCausalChains(evidence, themes);
  const explanations = generateExplanations(themes, [], causalChains);
  const selectedEvidenceIds = new Set(
    selected.flatMap((signal) => signal.evidenceIds),
  );
  const availableEvidenceIds = new Set(
    signals.flatMap((signal) => signal.evidenceIds),
  );
  const unsupportedThemes = themes.filter((theme) =>
    theme.evidenceIds.some((id) => !evidenceById.has(id)),
  );

  return {
    policy: policy.id,
    name: policy.name,
    selectedSignals: selected.map((signal) => ({
      id: signal.id,
      title: signal.title,
      confidence: signal.confidence,
      evidenceCount: new Set(signal.evidenceIds).size,
      polarity: signal.polarity,
    })),
    themeCount: themes.length,
    causalChainCount: causalChains.length,
    explanationCount: explanations.length,
    targetRetention: {
      selectedSignals: matchedConceptIds(selected),
      themes: matchedConceptIds(themes),
      causalChains: matchedConceptIds(causalChains),
      explanations: matchedConceptIds(explanations),
    },
    evidenceCoverage:
      availableEvidenceIds.size === 0
        ? 1
        : selectedEvidenceIds.size / availableEvidenceIds.size,
    lineageCompleteness:
      themes.length === 0
        ? 1
        : themes.filter(
            (theme) =>
              (theme.signalIds?.length ?? 0) === 1 &&
              theme.evidenceIds.length > 0,
          ).length / themes.length,
    unsupportedThemeRate:
      themes.length === 0 ? 0 : unsupportedThemes.length / themes.length,
    semanticRedundancy: averageSimilarity(selected),
    averageThemeConfidence:
      themes.length === 0
        ? 0
        : themes.reduce((sum, theme) => sum + theme.confidence, 0) /
          themes.length,
    computationalCost: {
      inputSignals: signals.length,
      selectedSignals: selected.length,
      maximumPairwiseComparisons:
        policy.id === "E" ? (signals.length * (signals.length - 1)) / 2 : 0,
    },
    generatedThemes: themes.map((theme) => ({
      id: theme.id,
      title: theme.title,
      confidence: theme.confidence,
      signalIds: theme.signalIds,
      evidenceIds: theme.evidenceIds,
    })),
    causalResults: summarizeCausalResults(causalChains, explanations),
  };
}

function summarizeCausalResults(
  chains: V3CausalChain[],
  explanations: V3Explanation[],
) {
  return {
    chains: chains.map((chain) => ({
      id: chain.id,
      cause: chain.cause,
      confidence: chain.confidence,
      themeIds: chain.themeIds,
      evidenceIds: chain.evidenceIds,
    })),
    explanations: explanations.map((explanation) => ({
      id: explanation.id,
      title: explanation.title,
      confidence: explanation.confidence,
      supportingEvidenceIds: explanation.supportingEvidenceIds,
    })),
  };
}

function understandingState(runtime: OrganizationRuntime): DiscoveryV3Result {
  const state = runtime.memory.understandingState as
    | DiscoveryV3Result
    | undefined;
  if (!state) throw new Error("Canonical replay has no understanding state.");
  return state;
}

function loadCommittedRuntime(repositoryPath: string): OrganizationRuntime {
  const result = spawnSync("git", ["show", `HEAD:${repositoryPath}`], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`Unable to load committed fixture: ${repositoryPath}`);
  }
  return JSON.parse(result.stdout) as OrganizationRuntime;
}

function evaluateRuntimeFixture(runtime: OrganizationRuntime) {
  const fixtureState = understandingState(runtime);
  return POLICIES.map((policy) =>
    evaluatePolicy(policy, fixtureState.signals, fixtureState.evidence),
  );
}

function robustnessRuns(
  policy: Policy,
  signals: V3Signal[],
  evidence: V3Evidence[],
) {
  const reverseSignals = [...signals].reverse();
  const duplicatedSupport = signals.map((signal, index) =>
    index === 0
      ? { ...signal, evidenceIds: [...signal.evidenceIds, ...signal.evidenceIds] }
      : signal,
  );
  const firstSupportedId = signals[0]?.evidenceIds[0];
  const removedSupport = firstSupportedId
    ? evidence.filter((item) => item.id !== firstSupportedId)
    : evidence;
  const lowConfidenceNoise: V3Signal = {
    id: "S-NOISE",
    title: "Administrative reporting cadence is visible",
    description:
      "Evidence suggests a reporting cadence exists, without a demonstrated causal relationship.",
    evidenceIds: evidence[0] ? [evidence[0].id] : [],
    confidence: 0.31,
    polarity: "neutral",
  };
  const contradictionPressure: V3Signal = {
    id: "S-CONTRADICTION",
    title: "Additional staffing may relieve delivery pressure",
    description:
      "A conflicting claim attributes delivery pressure to insufficient staffing.",
    evidenceIds: evidence[0] ? [evidence[0].id] : [],
    confidence: 0.6,
    polarity: "positive",
  };

  return [
    ["repeat", signals, evidence],
    ["reversed-signals", reverseSignals, evidence],
    ["irrelevant-signal", [...signals, lowConfidenceNoise], evidence],
    ["contradiction-pressure", [...signals, contradictionPressure], evidence],
    ["duplicated-support", duplicatedSupport, evidence],
    ["one-support-removed", signals, removedSupport],
  ].map(([id, scenarioSignals, scenarioEvidence]) => {
    const result = evaluatePolicy(
      policy,
      scenarioSignals as V3Signal[],
      scenarioEvidence as V3Evidence[],
    );
    return {
      id,
      selectedSignalTitles: result.selectedSignals.map((item) => item.title),
      targetRetention: result.targetRetention,
      unsupportedThemeRate: result.unsupportedThemeRate,
      evidenceCoverage: result.evidenceCoverage,
      semanticRedundancy: result.semanticRedundancy,
    };
  });
}

const runtime = runCanonicalNorthstarGroundTruthReplay();
const state = understandingState(runtime);
const signals = state.signals;
const evidence = state.evidence;
const canonicalOrder = signals.map((signal, index) => ({
  rank: index + 1,
  id: signal.id,
  title: signal.title,
  confidence: signal.confidence,
  evidenceCount: new Set(signal.evidenceIds).size,
  polarity: signal.polarity,
  orderingReason:
    "detectSignals() sorts descending confidence; ties retain deterministic producer order before IDs are reassigned.",
}));

const canonicalResults = POLICIES.map((policy) =>
  evaluatePolicy(policy, signals, evidence),
);
const atlasDecisionFixture = loadCommittedRuntime(
  ".discovery-runtime/organizations/atlas-manufacturing-simulation.json",
);
const knowledgeContinuityFixture = loadCommittedRuntime(
  ".discovery-runtime/organizations/benchmark-knowledge-fragmentation.json",
);
const report = {
  generatedAt: FIXED_TIME,
  objective:
    "Compare benchmark-local Signal-to-Theme eligibility policies without changing production cognition.",
  productionPolicyUnchanged: true,
  canonicalSignalCount: signals.length,
  canonicalSignalOrder: canonicalOrder,
  currentFirstFive: signals.slice(0, LIMIT).map((signal) => signal.id),
  excludedByCurrentFirstFive: signals
    .slice(LIMIT)
    .map((signal) => ({ id: signal.id, title: signal.title })),
  policies: POLICIES.map(({ id, name }) => ({ id, name })),
  canonicalResults,
  scenarios: {
    firstFiveAlreadySufficient: POLICIES.map((policy) =>
      evaluatePolicy(policy, signals.slice(0, LIMIT), evidence),
    ),
    noisyMoreThanFive: canonicalResults,
    contradictionHeavy: POLICIES.map((policy) =>
      robustnessRuns(policy, signals, evidence).find(
        (item) => item.id === "contradiction-pressure",
      ),
    ),
  },
  crossBenchmarkPolicyApplication: {
    atlasSimulationFixture: evaluateRuntimeFixture(atlasDecisionFixture),
    executiveDecisionFixture: evaluateRuntimeFixture(atlasDecisionFixture),
    operatingModelKnowledgeContinuityFixture:
      evaluateRuntimeFixture(knowledgeContinuityFixture),
  },
  robustness: Object.fromEntries(
    POLICIES.map((policy) => [
      policy.id,
      robustnessRuns(policy, signals, evidence),
    ]),
  ),
  limitations: [
    "Policies are benchmark-local eligibility adapters; they are not platform capabilities.",
    "Causal evaluation uses canonical buildCausalChains() and generateExplanations().",
    "Organizational mechanisms, conditions, recommendations, and confidence are not recomputed from experimental outputs; canonical cross-benchmark validators establish that production remains unchanged.",
    "Ground Truth vocabulary is used only by post-policy evaluation, never by selection.",
  ],
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
