import { V3Evidence } from "./types";

export type V3EvidenceWeight = {
  evidenceId: string;
  total: number;
  sourceReliability: number;
  confidenceContribution: number;
  specificity: number;
  corroboration: number;
  contradictionPenalty: number;
  explanation: string[];
};

export function weightEvidence(evidence: V3Evidence[]): V3EvidenceWeight[] {
  return evidence.map((item) => {
    const sourceReliability = scoreSourceReliability(item);
    const confidenceContribution = clamp(item.confidence);
    const specificity = scoreSpecificity(item);
    const corroboration = scoreCorroboration(item, evidence);
    const contradictionPenalty = scoreContradictionPenalty(item, evidence);

    const total = clamp(
      sourceReliability * 0.3 +
        confidenceContribution * 0.3 +
        specificity * 0.2 +
        corroboration * 0.15 -
        contradictionPenalty * 0.15
    );

    return {
      evidenceId: item.id,
      total,
      sourceReliability,
      confidenceContribution,
      specificity,
      corroboration,
      contradictionPenalty,
      explanation: buildExplanation({
        sourceReliability,
        confidenceContribution,
        specificity,
        corroboration,
        contradictionPenalty,
      }),
    };
  });
}

function scoreSourceReliability(item: V3Evidence): number {
  const source = `${item.source ?? ""} ${item.text ?? ""}`.toLowerCase();

  if (
    source.includes("sec") ||
    source.includes("filing") ||
    source.includes("10-k") ||
    source.includes("10-q") ||
    source.includes("earnings")
  ) {
    return 0.95;
  }

  if (
    source.includes("financial") ||
    source.includes("metric") ||
    source.includes("revenue") ||
    source.includes("margin")
  ) {
    return 0.88;
  }

  if (
    source.includes("executive") ||
    source.includes("leadership") ||
    source.includes("interview")
  ) {
    return 0.84;
  }

  if (
    source.includes("customer") ||
    source.includes("review") ||
    source.includes("survey")
  ) {
    return 0.68;
  }

  if (
    source.includes("news") ||
    source.includes("article") ||
    source.includes("press")
  ) {
    return 0.56;
  }

  if (
    source.includes("social") ||
    source.includes("reddit") ||
    source.includes("twitter") ||
    source.includes("x.com")
  ) {
    return 0.32;
  }

  return 0.62;
}

function scoreSpecificity(item: V3Evidence): number {
  const text = item.text ?? "";
  let score = 0.35;

  if (/\d/.test(text)) score += 0.22;
  if (text.length > 80) score += 0.12;
  if (item.entities?.length > 0) score += 0.12;
  if (item.keywords?.length > 2) score += 0.1;

  if (
    text.toLowerCase().includes("may") ||
    text.toLowerCase().includes("could") ||
    text.toLowerCase().includes("possibly")
  ) {
    score -= 0.12;
  }

  return clamp(score);
}

function scoreCorroboration(item: V3Evidence, allEvidence: V3Evidence[]): number {
  const itemKeywords = new Set(item.keywords ?? []);
  const itemEntities = new Set(item.entities ?? []);

  const related = allEvidence.filter((other) => {
    if (other.id === item.id) return false;

    const sharedKeywords = (other.keywords ?? []).filter((keyword) =>
      itemKeywords.has(keyword)
    ).length;

    const sharedEntities = (other.entities ?? []).filter((entity) =>
      itemEntities.has(entity)
    ).length;

    return sharedKeywords >= 2 || sharedEntities >= 1;
  });

  return clamp(related.length * 0.14);
}

function scoreContradictionPenalty(
  item: V3Evidence,
  allEvidence: V3Evidence[]
): number {
  const itemKeywords = new Set(item.keywords ?? []);
  const itemPolarity = item.polarity ?? "unknown";

  if (itemPolarity === "unknown" || itemPolarity === "neutral") return 0;

  const opposingPolarity =
    itemPolarity === "positive"
      ? "negative"
      : itemPolarity === "negative"
        ? "positive"
        : null;

  if (!opposingPolarity) return 0;

  const opposingEvidence = allEvidence.filter((other) => {
    if (other.id === item.id) return false;
    if ((other.polarity ?? "unknown") !== opposingPolarity) return false;

    const sharedKeywords = (other.keywords ?? []).filter((keyword) =>
      itemKeywords.has(keyword)
    ).length;

    return sharedKeywords >= 2;
  });

  return clamp(opposingEvidence.length * 0.18);
}

function buildExplanation(scores: {
  sourceReliability: number;
  confidenceContribution: number;
  specificity: number;
  corroboration: number;
  contradictionPenalty: number;
}): string[] {
  const explanation: string[] = [];

  if (scores.sourceReliability >= 0.85) {
    explanation.push("Source appears highly reliable.");
  } else if (scores.sourceReliability <= 0.45) {
    explanation.push("Source reliability is limited.");
  }

  if (scores.specificity >= 0.7) {
    explanation.push("Evidence is specific and information-rich.");
  }

  if (scores.corroboration >= 0.35) {
    explanation.push("Evidence is corroborated by related evidence.");
  }

  if (scores.contradictionPenalty > 0) {
    explanation.push("Some related evidence points in the opposite direction.");
  }

  if (explanation.length === 0) {
    explanation.push("Evidence has moderate weight.");
  }

  return explanation;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}