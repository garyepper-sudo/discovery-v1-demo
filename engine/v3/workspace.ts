import {
  DiscoveryV3Result,
  V3Belief,
  V3CausalChain,
  V3Contradiction,
  V3EmergenceEvent,
  V3Evidence,
  V3EvidenceNetwork,
  V3EvidenceRelationship,
  V3ExecutiveUnderstanding,
  V3Explanation,
  V3Hypothesis,
  V3Mechanism,
  V3OrganismState,
  V3ReasoningGraph,
  V3Signal,
  V3Theme,
  V3Understanding,
  V3UnderstandingDelta,
} from "./types";

export type InvestigationWorkspace = {
  rawText: string;

  evidence: V3Evidence[];
  evidenceRelationships: V3EvidenceRelationship[];
  evidenceNetwork?: V3EvidenceNetwork;
  mechanisms: V3Mechanism[];
  hypotheses: V3Hypothesis[];

  signals: V3Signal[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  causalChains: V3CausalChain[];
  explanations: V3Explanation[];
  understanding: V3Understanding[];
  beliefs: V3Belief[];
  emergenceEvents: V3EmergenceEvent[];
  executiveUnderstanding?: V3ExecutiveUnderstanding;
  reasoningGraph?: V3ReasoningGraph;
  organismState?: V3OrganismState;
  delta?: V3UnderstandingDelta;

  metadata: {
    createdAt: string;
    stage: string;
    warnings: string[];
  };
};

export function createInvestigationWorkspace(
  rawText: string
): InvestigationWorkspace {
  return {
    rawText,

    evidence: [],
    evidenceRelationships: [],
    evidenceNetwork: undefined,
    mechanisms: [],
    hypotheses: [],

    signals: [],
    themes: [],
    contradictions: [],
    causalChains: [],
    explanations: [],
    understanding: [],
    beliefs: [],
    emergenceEvents: [],

    executiveUnderstanding: undefined,
    reasoningGraph: undefined,
    organismState: undefined,
    delta: undefined,

    metadata: {
      createdAt: new Date().toISOString(),
      stage: "created",
      warnings: [],
    },
  };
}

export function workspaceToResult(
  workspace: InvestigationWorkspace
): DiscoveryV3Result {
  return {
    evidence: workspace.evidence,
    evidenceRelationships: workspace.evidenceRelationships,
    evidenceNetwork: workspace.evidenceNetwork,
    mechanisms: workspace.mechanisms,
    hypotheses: workspace.hypotheses,

    signals: workspace.signals,
    themes: workspace.themes,
    contradictions: workspace.contradictions,
    causalChains: workspace.causalChains,
    explanations: workspace.explanations,
    understanding: workspace.understanding,
    beliefs: workspace.beliefs,
    emergenceEvents: workspace.emergenceEvents,

    executiveUnderstanding:
      workspace.executiveUnderstanding ??
      buildFallbackExecutiveUnderstanding(workspace),

    delta: workspace.delta,

    reasoningGraph: workspace.reasoningGraph,
    organismState: workspace.organismState,
  };
}

function buildFallbackExecutiveUnderstanding(
  workspace: InvestigationWorkspace
): V3ExecutiveUnderstanding {
  return {
    headline: "Discovery is still forming an executive understanding.",
    explanation:
      "The investigation has evidence, but the executive understanding layer has not been finalized yet.",
    confidence: 0.45,
    evidenceSummary: workspace.evidence.slice(0, 3).map((item) => item.text),
    contradictions: workspace.contradictions.map((item) => item.title),
    openQuestions: workspace.evidence
      .filter((item) => item.type === "question")
      .slice(0, 3)
      .map((item) => item.text),
    nextMoves: [
      "Review the strongest evidence.",
      "Look for missing context.",
      "Resolve open contradictions.",
    ],
  };
}