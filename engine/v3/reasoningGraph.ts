import {
  V3Belief,
  V3CausalChain,
  V3Contradiction,
  V3Evidence,
  V3ExecutiveUnderstanding,
  V3Explanation,
  V3ReasoningEdge,
  V3ReasoningGraph,
  V3ReasoningNode,
  V3Signal,
  V3Theme,
  V3Understanding,
} from "./types";

type BuildReasoningGraphInput = {
  evidence: V3Evidence[];
  signals: V3Signal[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  causalChains: V3CausalChain[];
  explanations: V3Explanation[];
  understanding: V3Understanding[];
  beliefs: V3Belief[];
  executiveUnderstanding: V3ExecutiveUnderstanding;
};

export function buildReasoningGraph({
  evidence,
  signals,
  themes,
  contradictions,
  causalChains,
  explanations,
  understanding,
  beliefs,
  executiveUnderstanding,
}: BuildReasoningGraphInput): V3ReasoningGraph {
  const nodes: V3ReasoningNode[] = [];
  const edges: V3ReasoningEdge[] = [];

  evidence.forEach((item) => {
    nodes.push({
      id: item.id,
      type: "evidence",
      label: item.source || item.text.slice(0, 42),
      description: item.text,
      confidence: item.confidence,
      sourceId: item.id,
    });
  });

  signals.forEach((signal) => {
    nodes.push({
      id: signal.id,
      type: "signal",
      label: signal.title,
      description: signal.description,
      confidence: signal.confidence,
      sourceId: signal.id,
    });

    signal.evidenceIds.slice(0, 4).forEach((evidenceId, index) => {
      edges.push({
        id: `edge-${evidenceId}-${signal.id}`,
        from: evidenceId,
        to: signal.id,
        type: "supports",
        weight: index === 0 ? 0.9 : 0.65,
        primary: index === 0,
        explanation: "This evidence contributes to the signal.",
      });
    });
  });

  themes.forEach((theme) => {
    nodes.push({
      id: theme.id,
      type: "theme",
      label: theme.title,
      description: theme.description,
      confidence: theme.confidence,
      sourceId: theme.id,
    });

    theme.signalIds?.slice(0, 3).forEach((signalId, index) => {
      edges.push({
        id: `edge-${signalId}-${theme.id}`,
        from: signalId,
        to: theme.id,
        type: "forms",
        weight: index === 0 ? 0.9 : 0.7,
        primary: index === 0,
        explanation: "This signal helps form the theme.",
      });
    });

    theme.evidenceIds.slice(0, theme.signalIds?.length ? 2 : 4).forEach(
      (evidenceId, index) => {
        edges.push({
          id: `edge-${evidenceId}-${theme.id}`,
          from: evidenceId,
          to: theme.id,
          type: "supports",
          weight: index === 0 ? 0.85 : 0.55,
          primary: index === 0,
          explanation: "This evidence supports the theme.",
        });
      }
    );
  });

  contradictions.forEach((contradiction) => {
    nodes.push({
      id: contradiction.id,
      type: "contradiction",
      label: contradiction.title,
      description: contradiction.explanation,
      confidence: contradiction.confidence,
      sourceId: contradiction.id,
    });

    contradiction.evidenceIds.slice(0, 3).forEach((evidenceId, index) => {
      edges.push({
        id: `edge-${evidenceId}-${contradiction.id}`,
        from: evidenceId,
        to: contradiction.id,
        type: "complicates",
        weight: index === 0 ? 0.85 : 0.6,
        primary: index === 0,
        explanation: "This evidence creates or supports the contradiction.",
      });
    });
  });

  causalChains.forEach((chain) => {
    nodes.push({
      id: chain.id,
      type: "causal",
      label: `${chain.cause} → ${chain.effect}`,
      description: chain.mechanism,
      confidence: chain.confidence,
      sourceId: chain.id,
    });

    chain.themeIds.slice(0, 3).forEach((themeId, index) => {
      edges.push({
        id: `edge-${themeId}-${chain.id}`,
        from: themeId,
        to: chain.id,
        type: "causes",
        weight: index === 0 ? 0.9 : 0.65,
        primary: index === 0,
        explanation: "This theme participates in the causal chain.",
      });
    });

    chain.evidenceIds.slice(0, 3).forEach((evidenceId, index) => {
      edges.push({
        id: `edge-${evidenceId}-${chain.id}`,
        from: evidenceId,
        to: chain.id,
        type: "supports",
        weight: index === 0 ? 0.75 : 0.55,
        primary: index === 0,
        explanation: "This evidence supports the causal chain.",
      });
    });
  });

  explanations.forEach((explanation) => {
    nodes.push({
      id: explanation.id,
      type: "explanation",
      label: explanation.title,
      description: explanation.explanation,
      confidence: explanation.confidence,
      sourceId: explanation.id,
    });

    explanation.supportingEvidenceIds.slice(0, 3).forEach((evidenceId, index) => {
      edges.push({
        id: `edge-${evidenceId}-${explanation.id}`,
        from: evidenceId,
        to: explanation.id,
        type: "explains",
        weight: index === 0 ? 0.85 : 0.6,
        primary: index === 0,
        explanation: "This evidence supports the explanation.",
      });
    });

    explanation.weakeningEvidenceIds.slice(0, 2).forEach((evidenceId, index) => {
      edges.push({
        id: `edge-${evidenceId}-${explanation.id}-weakens`,
        from: evidenceId,
        to: explanation.id,
        type: "contradicts",
        weight: index === 0 ? 0.8 : 0.55,
        primary: index === 0,
        explanation: "This evidence weakens or complicates the explanation.",
      });
    });
  });

  understanding.forEach((item) => {
    nodes.push({
      id: item.id,
      type: "understanding",
      label: item.title,
      description: item.summary,
      confidence: item.confidence,
      sourceId: item.id,
    });

    item.explanationIds.slice(0, 2).forEach((explanationId, index) => {
      edges.push({
        id: `edge-${explanationId}-${item.id}`,
        from: explanationId,
        to: item.id,
        type: "forms",
        weight: index === 0 ? 0.95 : 0.7,
        primary: index === 0,
        explanation: "This explanation forms the understanding.",
      });
    });

    item.themeIds.slice(0, 3).forEach((themeId, index) => {
      edges.push({
        id: `edge-${themeId}-${item.id}`,
        from: themeId,
        to: item.id,
        type: "supports",
        weight: index === 0 ? 0.85 : 0.6,
        primary: index === 0,
        explanation: "This theme supports the understanding.",
      });
    });
  });

  beliefs.forEach((belief) => {
    nodes.push({
      id: belief.id,
      type: "belief",
      label: belief.headline,
      description: belief.explanation,
      confidence: belief.confidence,
      sourceId: belief.id,
    });

    if (belief.understandingId) {
      edges.push({
        id: `edge-${belief.understandingId}-${belief.id}`,
        from: belief.understandingId,
        to: belief.id,
        type: "forms",
        weight: 0.95,
        primary: true,
        explanation: "This understanding stabilizes into a belief.",
      });
    }

    belief.themeIds?.slice(0, 2).forEach((themeId, index) => {
      edges.push({
        id: `edge-${themeId}-${belief.id}`,
        from: themeId,
        to: belief.id,
        type: "supports",
        weight: index === 0 ? 0.8 : 0.6,
        primary: false,
        explanation: "This theme supports the belief.",
      });
    });

    belief.contradictingEvidenceIds.slice(0, 2).forEach((evidenceId, index) => {
      edges.push({
        id: `edge-${evidenceId}-${belief.id}-contradicts`,
        from: evidenceId,
        to: belief.id,
        type: "contradicts",
        weight: index === 0 ? 0.75 : 0.55,
        primary: false,
        explanation: "This evidence complicates the belief.",
      });
    });
  });

  const executiveNodeId = "EXECUTIVE_UNDERSTANDING";

  nodes.push({
    id: executiveNodeId,
    type: "executive",
    label: executiveUnderstanding.headline,
    description: executiveUnderstanding.explanation,
    confidence: executiveUnderstanding.confidence,
    sourceId: executiveNodeId,
  });

  beliefs.slice(0, 3).forEach((belief, index) => {
    edges.push({
      id: `edge-${belief.id}-${executiveNodeId}`,
      from: belief.id,
      to: executiveNodeId,
      type: "summarizes",
      weight: index === 0 ? 1 : 0.7,
      primary: index === 0,
      explanation: "This belief contributes to the executive understanding.",
    });
  });

  return {
    nodes: dedupeNodes(nodes),
    edges: dedupeEdges(edges),
    executiveNodeId,
  };
}

function dedupeNodes(nodes: V3ReasoningNode[]): V3ReasoningNode[] {
  const seen = new Set<string>();

  return nodes.filter((node) => {
    if (seen.has(node.id)) return false;
    seen.add(node.id);
    return true;
  });
}

function dedupeEdges(edges: V3ReasoningEdge[]): V3ReasoningEdge[] {
  const seen = new Set<string>();

  return edges.filter((edge) => {
    const key = `${edge.from}-${edge.to}-${edge.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}