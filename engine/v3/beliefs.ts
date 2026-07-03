import { V3Belief, V3Understanding } from "./types";

export function buildBeliefs(understanding: V3Understanding[]): V3Belief[] {
  return [...understanding]
    .sort((a, b) => scoreUnderstanding(b) - scoreUnderstanding(a))
    .map((item, index) => {
      const confidence = scoreUnderstanding(item);

      return {
        id: `B${index + 1}`,
        headline: item.title,
        confidence,
        explanation: buildBeliefExplanation(item, confidence),
        understandingId: item.id,
        supportingEvidenceIds: item.evidenceIds,
        contradictingEvidenceIds: collectContradictingEvidenceIds(item),
        supportingReasons: item.supportingReasons,
        concerns: buildConcerns(item),
        nextQuestions: buildNextQuestions(item),
        themeIds: item.themeIds,
        causalChainIds: item.causalChainIds,
        stability: calculateStability(item),
        utility: calculateUtility(item),
      };
    })
    .slice(0, 5);
}

function scoreUnderstanding(item: V3Understanding): number {
  const supportWeight = Math.min(item.supportScore * 0.08, 0.3);
  const contradictionPenalty = Math.min(item.contradictionScore * 0.08, 0.25);
  const causalBonus = item.causalChainIds.length > 0 ? 0.1 : 0;
  const noveltyBonus = item.noveltyScore * 0.1;
  const recommendationBonus = item.recommendations.length > 0 ? 0.05 : 0;

  const score =
    item.confidence +
    supportWeight +
    causalBonus +
    noveltyBonus +
    recommendationBonus -
    contradictionPenalty;

  return clamp(score);
}

function buildBeliefExplanation(
  item: V3Understanding,
  confidence: number
): string {
  const confidenceLanguage =
    confidence >= 0.78
      ? "strong belief"
      : confidence >= 0.58
        ? "working belief"
        : "early belief";

  return `Discovery treats this as a ${confidenceLanguage}: ${item.summary}`;
}

function collectContradictingEvidenceIds(item: V3Understanding): string[] {
  if (item.contradictionScore <= 0) return [];

  return item.evidenceIds.slice(
    0,
    Math.min(item.evidenceIds.length, Math.ceil(item.contradictionScore))
  );
}

function buildConcerns(item: V3Understanding): string[] {
  const concerns: string[] = [];

  if (item.contradictionScore > 0) {
    concerns.push(
      "Some evidence weakens or complicates this belief, so it should not be treated as fully settled."
    );
  }

  if (item.causalChainIds.length === 0) {
    concerns.push(
      "This belief does not yet have a clear causal mechanism attached to it."
    );
  }

  if (item.supportScore < 3) {
    concerns.push("This belief is supported by a limited amount of evidence.");
  }

  if (item.unknowns.length > 0) {
    concerns.push("There are still open questions attached to this belief.");
  }

  if (concerns.length === 0) {
    concerns.push(
      "No major concerns detected, but Discovery should still look for disconfirming evidence."
    );
  }

  return concerns.slice(0, 4);
}

function buildNextQuestions(item: V3Understanding): string[] {
  if (item.unknowns.length > 0) return item.unknowns.slice(0, 4);

  return [
    "What evidence would disconfirm this belief?",
    "Which assumption has the greatest impact on confidence?",
    "What would change this understanding over the next 30 days?",
  ];
}

function calculateStability(item: V3Understanding): number {
  const support = Math.min(0.45, item.supportScore * 0.08);
  const causal = item.causalChainIds.length > 0 ? 0.18 : 0;
  const contradictionPenalty = Math.min(0.3, item.contradictionScore * 0.08);

  return clamp(item.confidence * 0.5 + support + causal - contradictionPenalty);
}

function calculateUtility(item: V3Understanding): number {
  const implications = Math.min(0.25, item.implications.length * 0.06);
  const recommendations = Math.min(0.35, item.recommendations.length * 0.08);
  const causal = item.causalChainIds.length > 0 ? 0.15 : 0;

  return clamp(item.confidence * 0.35 + implications + recommendations + causal);
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}