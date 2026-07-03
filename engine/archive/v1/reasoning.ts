import {
  CausalChain,
  CompetingExplanation,
  ReasoningPattern,
  Workspace,
} from "../../types";

export function detectReasoningPatterns(workspace: Workspace): ReasoningPattern[] {
  return workspace.contradictions.map((contradiction, index) => ({
    id: `pattern-${index + 1}`,
    title: contradiction.title,
    description: contradiction.tension,
    evidenceIds: [],
    relatedClusters: workspace.clusters.map((cluster) => cluster.id),
    confidence: Math.min(90, 55 + workspace.contradictions.length * 15),
  }));
}

export function buildCausalChains(workspace: Workspace): CausalChain[] {
  const chains: CausalChain[] = [];

  const customer = workspace.clusters.find((cluster) => cluster.title === "Customer Experience");
  const growth = workspace.clusters.find((cluster) => cluster.title === "Growth Uncertainty");
  const strategicBets = workspace.clusters.find((cluster) => cluster.title === "Strategic Bets");

  if (customer && growth) {
    chains.push({
      id: "causal-chain-1",
      cause: "Customer friction",
      mechanism: "Pricing, content fatigue, or plan confusion may reduce perceived value.",
      effect: "Subscriber growth becomes inconsistent.",
      evidenceIds: [...customer.evidenceIds, ...growth.evidenceIds],
      confidence: 68,
    });
  }

  if (strategicBets && growth) {
    chains.push({
      id: "causal-chain-2",
      cause: "Scattered strategic bets",
      mechanism: "Ads, games, and live events may not yet be clearly connected to retention.",
      effect: "Growth strategy remains hard to validate.",
      evidenceIds: [...strategicBets.evidenceIds, ...growth.evidenceIds],
      confidence: 62,
    });
  }

  return chains;
}

export function generateCompetingExplanations(
  workspace: Workspace,
  causalChains: CausalChain[]
): CompetingExplanation[] {
  const explanations: CompetingExplanation[] = [];

  if (causalChains.length > 0) {
    explanations.push({
      id: "explanation-1",
      title: "Customer friction is slowing growth",
      explanation:
        "Subscriber growth may be slowing because customer-facing friction is increasing faster than perceived value.",
      supportingEvidence: causalChains.flatMap((chain) => chain.evidenceIds),
      weakeningEvidence: [],
      confidence: 67,
    });
  }

  if (workspace.clusters.some((cluster) => cluster.title === "Strategic Bets")) {
    explanations.push({
      id: "explanation-2",
      title: "Strategic bets have not yet translated into retention",
      explanation:
        "Growth may be inconsistent because new initiatives are being pursued before their retention impact is clear.",
      supportingEvidence: workspace.clusters
        .filter((cluster) => cluster.title === "Strategic Bets")
        .flatMap((cluster) => cluster.evidenceIds),
      weakeningEvidence: [],
      confidence: 61,
    });
  }

  return explanations;
}