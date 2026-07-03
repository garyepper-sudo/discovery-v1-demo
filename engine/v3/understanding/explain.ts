import {
  CompressedUnderstanding,
  PrioritizedUnderstanding,
  UnderstandingExplanation,
} from "./types";

export function explainUnderstanding(
  prioritized: PrioritizedUnderstanding,
  compressed: CompressedUnderstanding
): UnderstandingExplanation {
  const confidenceLabel = confidenceToLabel(compressed.confidence);

  return {
    confidenceLabel,
    whyWeBelieveIt: buildWhyWeBelieveIt(prioritized),
    uncertainty: buildUncertainty(prioritized),
  };
}

function buildWhyWeBelieveIt(prioritized: PrioritizedUnderstanding): string {
  const theme = prioritized.primaryTheme;
  const evidence = prioritized.strongestEvidence;

  if (theme && evidence) {
    return `Discovery sees repeated evidence around ${cleanThemeName(
      theme.title
    ).toLowerCase()}, with the strongest signal coming from: ${evidence.text}`;
  }

  if (theme) {
    return `Discovery sees a recurring signal around ${cleanThemeName(
      theme.title
    ).toLowerCase()}.`;
  }

  return "Discovery sees enough signal to form an early working view.";
}

function buildUncertainty(prioritized: PrioritizedUnderstanding): string {
  const contradiction = prioritized.primaryContradiction;

  if (contradiction?.unresolvedQuestion) {
    return contradiction.unresolvedQuestion;
  }

  if (contradiction) {
    return contradiction.title;
  }

  return "No major unresolved tension is visible yet, but Discovery should continue looking for disconfirming evidence.";
}

function confidenceToLabel(
  confidence: number
): UnderstandingExplanation["confidenceLabel"] {
  if (confidence >= 0.78) return "strong";
  if (confidence >= 0.58) return "moderate";
  return "early";
}

function cleanThemeName(title?: string): string {
  if (!title) return "";

  return title
    .replace(/\bPattern\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}