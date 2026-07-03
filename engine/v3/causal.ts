import {
  V3CausalChain,
  V3Evidence,
  V3SignalStrength,
  V3Theme,
} from "./types";

export function buildCausalChains(
  evidence: V3Evidence[],
  themes: V3Theme[]
): V3CausalChain[] {
  const chains: V3CausalChain[] = [];

  themes.slice(0, 5).forEach((theme, index) => {
    const relatedEvidence = evidence.filter((item) =>
      theme.evidenceIds.includes(item.id)
    );

    const primaryEvidence = choosePrimaryEvidence(relatedEvidence);

    if (!primaryEvidence) return;

    chains.push({
      id: `CC${index + 1}`,
      cause: buildCause(theme, relatedEvidence),
      mechanism: buildMechanism(theme, primaryEvidence, relatedEvidence),
      effect: buildEffect(theme, relatedEvidence),
      evidenceIds: theme.evidenceIds,
      themeIds: [theme.id],
      confidence: calculateCausalConfidence(theme, relatedEvidence),
      strength: theme.strength ?? strongestSignal(relatedEvidence),
      assumptions: buildAssumptions(theme, relatedEvidence),
      risks: buildRisks(theme, relatedEvidence),
    });
  });

  return chains
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 5);
}

function choosePrimaryEvidence(evidence: V3Evidence[]): V3Evidence | undefined {
  return [...evidence].sort((a, b) => {
    const strengthDelta = strengthRank(b.strength) - strengthRank(a.strength);
    if (strengthDelta !== 0) return strengthDelta;

    return b.confidence - a.confidence;
  })[0];
}

function buildCause(theme: V3Theme, evidence: V3Evidence[]): string {
  const hasNegative = evidence.some((item) => item.polarity === "negative");
  const hasPositive = evidence.some((item) => item.polarity === "positive");

  if (hasNegative && hasPositive) {
    return `${theme.title} is producing mixed strategic signals`;
  }

  if (hasNegative) {
    return `${theme.title} is creating strategic pressure`;
  }

  if (hasPositive) {
    return `${theme.title} is creating strategic momentum`;
  }

  return theme.title;
}

function buildMechanism(
  theme: V3Theme,
  primaryEvidence: V3Evidence,
  relatedEvidence: V3Evidence[]
): string {
  const signal = strongestSignal(relatedEvidence);
  const evidenceCount = relatedEvidence.length;

  return `${theme.title} appears to matter because ${evidenceCount} evidence object${
    evidenceCount === 1 ? "" : "s"
  } point to a ${signal} signal. The clearest evidence says: ${primaryEvidence.text}`;
}

function buildEffect(theme: V3Theme, evidence: V3Evidence[]): string {
  const negative = evidence.filter((item) => item.polarity === "negative").length;
  const positive = evidence.filter((item) => item.polarity === "positive").length;

  if (negative > positive) {
    return `${theme.title} may weaken confidence, slow momentum, or create execution risk unless the underlying causes are resolved.`;
  }

  if (positive > negative) {
    return `${theme.title} may strengthen momentum or create a clearer path for strategic execution if supported by more evidence.`;
  }

  return `${theme.title} may be shaping the strategic outcome and should be tested against additional evidence.`;
}

function calculateCausalConfidence(
  theme: V3Theme,
  evidence: V3Evidence[]
): number {
  if (evidence.length === 0) return theme.confidence;

  const avgEvidenceConfidence =
    evidence.reduce((sum, item) => sum + item.confidence, 0) / evidence.length;

  const supportBonus = Math.min(0.12, evidence.length * 0.03);
  const strongSignalBonus = evidence.some((item) => item.strength === "strong")
    ? 0.06
    : 0;

  return Number(
    Math.min(
      0.96,
      theme.confidence * 0.45 +
        avgEvidenceConfidence * 0.4 +
        supportBonus +
        strongSignalBonus
    ).toFixed(2)
  );
}

function buildAssumptions(theme: V3Theme, evidence: V3Evidence[]): string[] {
  const assumptions = [
    `The evidence connected to ${theme.title} is representative of the broader situation.`,
  ];

  if (evidence.some((item) => item.type === "claim")) {
    assumptions.push(
      "At least some supporting evidence is claim-based and should be validated."
    );
  }

  if (evidence.some((item) => item.type === "question")) {
    assumptions.push(
      "Open questions do not materially overturn the causal relationship."
    );
  }

  return assumptions.slice(0, 3);
}

function buildRisks(theme: V3Theme, evidence: V3Evidence[]): string[] {
  const risks: string[] = [];

  if (evidence.some((item) => item.polarity === "negative")) {
    risks.push(`${theme.title} may create downside risk if left unresolved.`);
  }

  if (evidence.some((item) => item.confidence < 0.65)) {
    risks.push(
      "Some supporting evidence has lower confidence and may need validation."
    );
  }

  if (evidence.length < 2) {
    risks.push("The causal path may be thin because it rests on limited evidence.");
  }

  return risks.slice(0, 3);
}

function strongestSignal(evidence: V3Evidence[]): V3SignalStrength {
  if (evidence.some((item) => item.strength === "strong")) return "strong";
  if (evidence.some((item) => item.strength === "moderate")) return "moderate";
  return "weak";
}

function strengthRank(strength?: V3SignalStrength): number {
  if (strength === "strong") return 3;
  if (strength === "moderate") return 2;
  if (strength === "weak") return 1;
  return 0;
}