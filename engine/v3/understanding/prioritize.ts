import { UnderstandingEngineInput, PrioritizedUnderstanding } from "./types";

export function prioritizeUnderstanding(
  input: UnderstandingEngineInput
): PrioritizedUnderstanding {
  const primaryBelief = [...input.beliefs].sort((a, b) => {
    const utilityDelta = (b.utility ?? 0) - (a.utility ?? 0);
    if (utilityDelta !== 0) return utilityDelta;

    const stabilityDelta = (b.stability ?? 0) - (a.stability ?? 0);
    if (stabilityDelta !== 0) return stabilityDelta;

    return b.confidence - a.confidence;
  })[0];

  const primaryTheme = [...input.themes].sort((a, b) => {
    const stabilityDelta = (b.stability ?? 0) - (a.stability ?? 0);
    if (stabilityDelta !== 0) return stabilityDelta;

    return b.confidence - a.confidence;
  })[0];

  const primaryContradiction = [...input.contradictions].sort(
    (a, b) => b.confidence - a.confidence
  )[0];

  const strongestEvidence = [...input.evidence].sort((a, b) => {
    const strengthDelta = strengthRank(b.strength) - strengthRank(a.strength);
    if (strengthDelta !== 0) return strengthDelta;

    return b.confidence - a.confidence;
  })[0];

  return {
    primaryBelief,
    primaryTheme,
    primaryContradiction,
    strongestEvidence,
    confidence: input.understanding.confidence,
  };
}

function strengthRank(strength?: "weak" | "moderate" | "strong"): number {
  if (strength === "strong") return 3;
  if (strength === "moderate") return 2;
  if (strength === "weak") return 1;
  return 0;
}