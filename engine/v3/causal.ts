import { V3CausalChain, V3Evidence, V3Theme } from "./types";

export function buildCausalChains(
  evidence: V3Evidence[],
  themes: V3Theme[]
): V3CausalChain[] {
  const chains: V3CausalChain[] = [];

  themes.slice(0, 4).forEach((theme, index) => {
    const relatedEvidence = evidence.filter((item) =>
      theme.evidenceIds.includes(item.id)
    );

    const primaryEvidence = relatedEvidence[0];

    if (!primaryEvidence) return;

    chains.push({
      id: `CC${index + 1}`,
      cause: theme.title,
      mechanism: buildMechanism(theme, primaryEvidence),
      effect: buildEffect(theme),
      evidenceIds: theme.evidenceIds,
      themeIds: [theme.id],
      confidence: theme.confidence,
    });
  });

  return chains.sort((a, b) => b.confidence - a.confidence);
}

function buildMechanism(theme: V3Theme, evidence: V3Evidence): string {
  return `${theme.title} appears to matter because the evidence says: ${evidence.text}`;
}

function buildEffect(theme: V3Theme): string {
  return `${theme.title} may be shaping the strategic outcome and should be tested against additional evidence.`;
}