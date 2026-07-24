import { spawnSync } from "node:child_process";

import { buildCausalChains } from "../../../v3/causal";
import { generateExplanations } from "../../../v3/explanations";
import type {
  DiscoveryV3Result,
  V3CausalChain,
  V3Evidence,
  V3EvidenceRelationship,
  V3Explanation,
  V3Signal,
  V3Theme,
} from "../../../v3/types";
import type { OrganizationRuntime } from "../../../v3/runtime/organizationRuntime";
import { runCanonicalNorthstarGroundTruthReplay } from "./runCanonicalNorthstarGroundTruthReplay";

const FIXED_TIME = "2026-07-22T20:00:00.000Z";
const LIMIT = 5;

type PolicyId = "A" | "B" | "C" | "D" | "E" | "F";
type Candidate = V3Signal | V3Theme;
type SelectionContext = {
  evidenceRelationships: V3EvidenceRelationship[];
};
type Policy = {
  id: PolicyId;
  name: string;
  diagnosticOnly?: boolean;
  selectSignals: (
    signals: V3Signal[],
    context: SelectionContext,
  ) => V3Signal[];
  selectThemes: (
    themes: V3Theme[],
    context: SelectionContext,
  ) => V3Theme[];
};

const EXPLANATION_PARTS = [
  {
    id: "pressure",
    phrases: ["execution capacity is under pressure", "capacity pressure"],
  },
  {
    id: "causal-driver",
    phrases: ["concurrent work", "reprioritization", "effective capacity"],
  },
  {
    id: "rejected-alternative",
    phrases: [
      "staffing may not be the primary root cause",
      "staffing is not the primary",
      "not a staffing",
    ],
  },
  {
    id: "counterfactual",
    phrases: [
      "staffing may support planned throughput if",
      "staffing is sufficient",
      "without adding headcount",
      "if concurrent work is reduced",
    ],
  },
  {
    id: "consequence",
    phrases: [
      "reducing active work may improve throughput",
      "reduce active work",
      "sequencing",
      "protecting active work",
    ],
  },
] as const;

const STOP_WORDS = new Set([
  "and",
  "are",
  "for",
  "from",
  "indicates",
  "into",
  "may",
  "more",
  "that",
  "the",
  "this",
  "through",
  "with",
]);

function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function candidateText(candidate: Candidate): string {
  return `${candidate.title} ${candidate.description}`;
}

function tokens(candidate: Candidate): Set<string> {
  return new Set(
    normalize(candidateText(candidate))
      .split(" ")
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token)),
  );
}

function similarity(left: Candidate, right: Candidate): number {
  const leftTokens = tokens(left);
  const rightTokens = tokens(right);
  const intersection = [...leftTokens].filter((token) =>
    rightTokens.has(token),
  ).length;
  const union = new Set([...leftTokens, ...rightTokens]).size;
  return union === 0 ? 0 : intersection / union;
}

function evidenceIds(candidate: Candidate): string[] {
  return Array.from(new Set(candidate.evidenceIds));
}

function candidateScope(candidate: Candidate): string {
  const value = candidate as Candidate & { scope?: unknown };
  return typeof value.scope === "string" ? value.scope : "unspecified";
}

function candidatePolarity(candidate: Candidate): string {
  return candidate.polarity ?? "unknown";
}

function contradictionIds(candidate: Candidate): string[] {
  const value = candidate as Candidate & {
    contradictionIds?: unknown;
  };
  return Array.isArray(value.contradictionIds)
    ? value.contradictionIds.filter(
        (item): item is string => typeof item === "string",
      )
    : [];
}

function stableOrder<T extends Candidate>(items: T[]): T[] {
  return [...items].sort(
    (left, right) =>
      right.confidence - left.confidence ||
      evidenceIds(right).length - evidenceIds(left).length ||
      left.title.localeCompare(right.title) ||
      left.id.localeCompare(right.id),
  );
}

function structuredRank<T extends Candidate>(items: T[]): T[] {
  return [...items]
    .sort((left, right) => {
      const leftScore =
        left.confidence +
        Math.min(0.12, evidenceIds(left).length * 0.02) +
        (contradictionIds(left).length > 0 ? 0.04 : 0);
      const rightScore =
        right.confidence +
        Math.min(0.12, evidenceIds(right).length * 0.02) +
        (contradictionIds(right).length > 0 ? 0.04 : 0);
      return (
        rightScore - leftScore ||
        left.title.localeCompare(right.title) ||
        left.id.localeCompare(right.id)
      );
    })
    .slice(0, LIMIT);
}

function coverageSelection<T extends Candidate>(items: T[]): T[] {
  const candidates = stableOrder(items);
  const selected: T[] = [];
  const representedEvidence = new Set<string>();
  const representedScopes = new Set<string>();
  const representedPolarities = new Set<string>();
  const representedContradictions = new Set<string>();

  while (selected.length < LIMIT && selected.length < candidates.length) {
    const remaining = candidates.filter(
      (candidate) => !selected.some((item) => item.id === candidate.id),
    );
    const next = [...remaining].sort((left, right) => {
      const score = (candidate: T) => {
        const newEvidence = evidenceIds(candidate).filter(
          (id) => !representedEvidence.has(id),
        ).length;
        const newScope = representedScopes.has(candidateScope(candidate))
          ? 0
          : 1;
        const newPolarity = representedPolarities.has(
          candidatePolarity(candidate),
        )
          ? 0
          : 1;
        const newContradictions = contradictionIds(candidate).filter(
          (id) => !representedContradictions.has(id),
        ).length;
        const redundancy = Math.max(
          0,
          ...selected.map((item) => similarity(candidate, item)),
        );
        return (
          candidate.confidence * 0.35 +
          Math.min(0.3, newEvidence * 0.04) +
          newScope * 0.05 +
          newPolarity * 0.12 +
          Math.min(0.12, newContradictions * 0.06) -
          redundancy * 0.25
        );
      };
      return (
        score(right) - score(left) ||
        left.title.localeCompare(right.title) ||
        left.id.localeCompare(right.id)
      );
    })[0];
    if (!next) break;
    selected.push(next);
    evidenceIds(next).forEach((id) => representedEvidence.add(id));
    representedScopes.add(candidateScope(next));
    representedPolarities.add(candidatePolarity(next));
    contradictionIds(next).forEach((id) =>
      representedContradictions.add(id),
    );
  }
  return selected;
}

function connectedSelection<T extends Candidate>(
  items: T[],
  relationships: V3EvidenceRelationship[],
): T[] {
  const connectedEvidence = new Set(
    relationships.flatMap((relationship) => [
      relationship.sourceEvidenceId,
      relationship.targetEvidenceId,
    ]),
  );
  return [...items]
    .sort((left, right) => {
      const connectivity = (candidate: T) =>
        evidenceIds(candidate).filter((id) => connectedEvidence.has(id)).length;
      return (
        connectivity(right) - connectivity(left) ||
        right.confidence - left.confidence ||
        left.title.localeCompare(right.title) ||
        left.id.localeCompare(right.id)
      );
    })
    .slice(0, LIMIT);
}

const POLICIES: Policy[] = [
  {
    id: "A",
    name: "canonical dual first-five control",
    selectSignals: (signals) => signals.slice(0, LIMIT),
    selectThemes: (themes) => themes.slice(0, LIMIT),
  },
  {
    id: "B",
    name: "unbounded diagnostic",
    diagnosticOnly: true,
    selectSignals: stableOrder,
    selectThemes: stableOrder,
  },
  {
    id: "C",
    name: "independent structured bounded ranking",
    selectSignals: structuredRank,
    selectThemes: structuredRank,
  },
  {
    id: "D",
    name: "shared coverage state",
    selectSignals: coverageSelection,
    selectThemes: coverageSelection,
  },
  {
    id: "E",
    name: "lineage-coverage selection",
    selectSignals: coverageSelection,
    selectThemes: coverageSelection,
  },
  {
    id: "F",
    name: "causal-connectivity selection",
    selectSignals: (signals, context) =>
      connectedSelection(signals, context.evidenceRelationships),
    selectThemes: (themes, context) =>
      connectedSelection(themes, context.evidenceRelationships),
  },
];

function themeFromSignal(
  signal: V3Signal,
  evidenceById: Map<string, V3Evidence>,
  index: number,
): V3Theme {
  const evidence = evidenceIds(signal)
    .map((id) => evidenceById.get(id))
    .filter((item): item is V3Evidence => Boolean(item));
  return {
    id: `JOINT-ST${index + 1}`,
    title: signal.title,
    description: signal.description,
    evidenceIds: evidenceIds(signal),
    signalIds: [signal.id],
    confidence: signal.confidence,
    keywords: Array.from(
      new Set(evidence.flatMap((item) => item.keywords ?? [])),
    ).slice(0, 14),
    entities: Array.from(
      new Set(evidence.flatMap((item) => item.entities ?? [])),
    ).slice(0, 10),
    polarity: signal.polarity,
    strength: evidence.some((item) => item.strength === "strong")
      ? "strong"
      : evidence.some((item) => item.strength === "moderate")
        ? "moderate"
        : "weak",
    stability: signal.confidence,
  };
}

function allCausalChains(
  evidence: V3Evidence[],
  themes: V3Theme[],
): V3CausalChain[] {
  return themes.flatMap((theme, index) =>
    buildCausalChains(evidence, [theme]).map((chain) => ({
      ...chain,
      id: `JOINT-CC${index + 1}`,
      themeIds: [theme.id],
    })),
  );
}

function explanationParts(value: unknown): string[] {
  const text = normalize(JSON.stringify(value));
  return EXPLANATION_PARTS.filter((part) =>
    part.phrases.some((phrase) => text.includes(normalize(phrase))),
  ).map((part) => part.id);
}

function averageRedundancy(items: Candidate[]): number {
  const values: number[] = [];
  items.forEach((left, index) => {
    items.slice(index + 1).forEach((right) => {
      values.push(similarity(left, right));
    });
  });
  return values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function evaluate(
  policy: Policy,
  state: DiscoveryV3Result,
  signalInput = state.signals,
  themeOrder: "selected" | "reversed" = "selected",
) {
  const evidenceById = new Map(state.evidence.map((item) => [item.id, item]));
  const context: SelectionContext = {
    evidenceRelationships: state.evidenceRelationships,
  };
  const selectedSignals = policy.selectSignals(signalInput, context);
  const candidateThemes = selectedSignals.map((signal, index) =>
    themeFromSignal(signal, evidenceById, index),
  );
  const orderedThemeCandidates =
    themeOrder === "reversed"
      ? [...candidateThemes].reverse()
      : candidateThemes;
  const selectedThemes = policy.selectThemes(orderedThemeCandidates, context);
  const causalChains =
    policy.id === "B"
      ? allCausalChains(state.evidence, selectedThemes)
      : buildCausalChains(state.evidence, selectedThemes);
  const explanations = generateExplanations(
    selectedThemes,
    state.contradictions,
    causalChains,
  );
  const availableEvidence = new Set(
    signalInput.flatMap((signal) => evidenceIds(signal)),
  );
  const coveredEvidence = new Set(
    selectedThemes.flatMap((theme) => evidenceIds(theme)),
  );
  const unsupportedThemes = selectedThemes.filter((theme) =>
    evidenceIds(theme).some((id) => !evidenceById.has(id)),
  );
  const unsupportedChains = causalChains.filter((chain) =>
    chain.evidenceIds.some((id) => !evidenceById.has(id)),
  );

  return {
    policy: policy.id,
    name: policy.name,
    diagnosticOnly: policy.diagnosticOnly ?? false,
    selectedSignals: selectedSignals.map(traceCandidate),
    selectedThemes: selectedThemes.map(traceCandidate),
    causalChains: causalChains.map((chain) => ({
      id: chain.id,
      cause: chain.cause,
      mechanism: chain.mechanism,
      effect: chain.effect,
      confidence: chain.confidence,
      evidenceIds: chain.evidenceIds,
      themeIds: chain.themeIds,
    })),
    explanations: explanations.map((explanation) =>
      traceExplanation(explanation),
    ),
    retainedParts: {
      signals: explanationParts(selectedSignals),
      themes: explanationParts(selectedThemes),
      causalChains: explanationParts(causalChains),
      explanations: explanationParts(explanations),
    },
    completeExplanation:
      explanationParts(explanations).length === EXPLANATION_PARTS.length,
    evidenceCoverage:
      availableEvidence.size === 0
        ? 1
        : coveredEvidence.size / availableEvidence.size,
    lineageCompleteness:
      selectedThemes.length === 0
        ? 1
        : selectedThemes.filter(
            (theme) =>
              (theme.signalIds?.length ?? 0) === 1 &&
              theme.evidenceIds.length > 0,
          ).length / selectedThemes.length,
    scopeCoverage: new Set(selectedThemes.map(candidateScope)).size,
    contradictionCoverage: new Set(
      selectedThemes.flatMap(contradictionIds),
    ).size,
    semanticRedundancy: averageRedundancy(selectedThemes),
    unsupportedThemeRate:
      selectedThemes.length === 0
        ? 0
        : unsupportedThemes.length / selectedThemes.length,
    unsupportedCausalChainRate:
      causalChains.length === 0
        ? 0
        : unsupportedChains.length / causalChains.length,
    themeCount: selectedThemes.length,
    causalChainCount: causalChains.length,
    averageCausalConfidence:
      causalChains.length === 0
        ? 0
        : causalChains.reduce((sum, chain) => sum + chain.confidence, 0) /
          causalChains.length,
    computationalCost: {
      signalCandidates: signalInput.length,
      themeCandidates: candidateThemes.length,
      maximumPairwiseComparisons:
        ["D", "E"].includes(policy.id)
          ? (signalInput.length * (signalInput.length - 1)) / 2 +
            (candidateThemes.length * (candidateThemes.length - 1)) / 2
          : 0,
    },
  };
}

function traceCandidate(candidate: Candidate) {
  return {
    id: candidate.id,
    title: candidate.title,
    description: candidate.description,
    confidence: candidate.confidence,
    polarity: candidatePolarity(candidate),
    scope: candidateScope(candidate),
    evidenceIds: evidenceIds(candidate),
    contradictionIds: contradictionIds(candidate),
    signalIds:
      "signalIds" in candidate ? candidate.signalIds ?? [] : [],
  };
}

function traceExplanation(explanation: V3Explanation) {
  return {
    id: explanation.id,
    title: explanation.title,
    explanation: explanation.explanation,
    confidence: explanation.confidence,
    supportingEvidenceIds: explanation.supportingEvidenceIds,
    weakeningEvidenceIds: explanation.weakeningEvidenceIds,
  };
}

function understandingState(runtime: OrganizationRuntime): DiscoveryV3Result {
  const state = runtime.memory.understandingState as
    | DiscoveryV3Result
    | undefined;
  if (!state) throw new Error("Fixture has no understanding state.");
  return state;
}

function loadCommittedRuntime(path: string): OrganizationRuntime {
  const result = spawnSync("git", ["show", `HEAD:${path}`], {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error(`Unable to load ${path}`);
  return JSON.parse(result.stdout) as OrganizationRuntime;
}

function evaluateFixture(state: DiscoveryV3Result) {
  return POLICIES.map((policy) => evaluate(policy, state));
}

function robustness(policy: Policy, state: DiscoveryV3Result) {
  const noise: V3Signal = {
    id: "S-NOISE",
    title: "Administrative cadence is visible",
    description:
      "A reporting cadence exists without a demonstrated causal relationship.",
    confidence: 0.31,
    polarity: "neutral",
    evidenceIds: state.evidence[0] ? [state.evidence[0].id] : [],
  };
  const contradiction: V3Signal = {
    id: "S-STAFFING-CONTRADICTION",
    title: "Additional staffing may relieve delivery pressure",
    description:
      "A competing assertion attributes delivery pressure to insufficient staffing.",
    confidence: 0.6,
    polarity: "positive",
    evidenceIds: state.evidence[0] ? [state.evidence[0].id] : [],
  };
  const redundant = state.signals.slice(0, 3).map((signal, index) => ({
    ...signal,
    id: `${signal.id}-REDUNDANT-${index}`,
  }));
  const staffingRemoved = state.signals.filter(
    (signal) => signal.id !== "S6",
  );
  const actionRemoved = state.signals.filter((signal) => signal.id !== "S9");
  const firstEvidenceId = state.signals[0]?.evidenceIds[0];
  const oneSupportRemoved = firstEvidenceId
    ? {
        ...state,
        evidence: state.evidence.filter((item) => item.id !== firstEvidenceId),
      }
    : state;

  return [
    ["repeat", state.signals, state, "selected"],
    ["reversed-signals", [...state.signals].reverse(), state, "selected"],
    ["reversed-themes", state.signals, state, "reversed"],
    ["irrelevant-addition", [...state.signals, noise], state, "selected"],
    [
      "contradiction-pressure",
      [...state.signals, contradiction],
      state,
      "selected",
    ],
    [
      "duplicated-evidence",
      state.signals.map((signal, index) =>
        index === 0
          ? {
              ...signal,
              evidenceIds: [...signal.evidenceIds, ...signal.evidenceIds],
            }
          : signal,
      ),
      state,
      "selected",
    ],
    [
      "redundant-high-confidence",
      [...state.signals, ...redundant],
      state,
      "selected",
    ],
    ["one-support-removed", state.signals, oneSupportRemoved, "selected"],
    ["staffing-claim-removed", staffingRemoved, state, "selected"],
    ["concurrency-action-removed", actionRemoved, state, "selected"],
  ].map(([id, signals, scenarioState, order]) => {
    const result = evaluate(
      policy,
      scenarioState as DiscoveryV3Result,
      signals as V3Signal[],
      order as "selected" | "reversed",
    );
    return {
      id,
      selectedSignalIds: result.selectedSignals.map((item) => item.id),
      selectedThemeTitles: result.selectedThemes.map((item) => item.title),
      causalCauses: result.causalChains.map((item) => item.cause),
      retainedExplanationParts: result.retainedParts.explanations,
      completeExplanation: result.completeExplanation,
      evidenceCoverage: result.evidenceCoverage,
      unsupportedThemeRate: result.unsupportedThemeRate,
      unsupportedCausalChainRate: result.unsupportedCausalChainRate,
    };
  });
}

const canonicalRuntime = runCanonicalNorthstarGroundTruthReplay();
const canonicalState = understandingState(canonicalRuntime);
const atlasState = understandingState(
  loadCommittedRuntime(
    ".discovery-runtime/organizations/atlas-manufacturing-simulation.json",
  ),
);
const knowledgeState = understandingState(
  loadCommittedRuntime(
    ".discovery-runtime/organizations/benchmark-knowledge-fragmentation.json",
  ),
);

const report = {
  generatedAt: FIXED_TIME,
  productionUnchanged: true,
  minimumCompleteExplanation: EXPLANATION_PARTS.map((part) => part.id),
  orderedCanonicalInputs: {
    signals: canonicalState.signals.map((signal, index) => ({
      incomingOrder: index + 1,
      ...traceCandidate(signal),
      selectedByProductionSignalThemeBoundary: index < LIMIT,
    })),
    themes: canonicalState.themes.map((theme, index) => ({
      incomingOrder: index + 1,
      ...traceCandidate(theme),
      selectedByProductionCausalBoundary: index < LIMIT,
    })),
    causalChains: canonicalState.causalChains,
    explanations: canonicalState.explanations,
    mechanisms: canonicalState.mechanisms,
  },
  metadataSufficiencyAudit: {
    centralPressure: "derivable from free text; confidence/polarity are insufficient",
    causalContributor:
      "derivable only from free text or generic evidence-network adjacency",
    rejectedExplanation:
      "unavailable structurally on Signal and Theme; contradiction IDs are absent",
    counterfactual:
      "derivable only from free text; no antecedent/consequent structure",
    consequence:
      "derivable only from free text; positive polarity is not sufficient",
    actionImplication:
      "derivable only from free text; no action-role field",
    scopeTransition:
      "scope field is absent or unspecified on canonical target objects",
    temporalPrecedence:
      "evidence dates exist upstream but no causal temporal relation is carried",
    independentCorroboration:
      "derivable from distinct evidence IDs, but source independence is not explicit",
    semanticRedundancy:
      "derivable approximately from free-text token overlap",
    evidenceConnectivity:
      "canonically available through generic evidence relationships; causal direction is unreliable",
  },
  policies: POLICIES.map(({ id, name, diagnosticOnly }) => ({
    id,
    name,
    diagnosticOnly: diagnosticOnly ?? false,
  })),
  northstar: evaluateFixture(canonicalState),
  crossBenchmark: {
    atlasCanonical: evaluateFixture(atlasState),
    executiveDecisionFixture: evaluateFixture(atlasState),
    operatingModelKnowledgeContinuity: evaluateFixture(knowledgeState),
    firstFiveSufficient: POLICIES.map((policy) =>
      evaluate(policy, {
        ...canonicalState,
        signals: canonicalState.signals.slice(0, LIMIT),
      }),
    ),
  },
  robustness: Object.fromEntries(
    POLICIES.map((policy) => [
      policy.id,
      robustness(policy, canonicalState),
    ]),
  ),
  limitations: [
    "Hidden explanatory labels are used only for post-selection evaluation.",
    "No policy uses Northstar-specific lexical selection rules.",
    "Experimental mechanisms, conditions, recommendations, and confidence are not persisted or substituted into canonical Runtime.",
    "Canonical validators, rather than experimental wrappers, determine production regression status.",
  ],
};

process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
