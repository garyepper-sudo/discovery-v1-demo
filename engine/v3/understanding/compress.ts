import {
  CompressedUnderstanding,
  PrioritizedUnderstanding,
} from "./types";

export function compressUnderstanding(
  prioritized: PrioritizedUnderstanding
): CompressedUnderstanding {
  const themeName = cleanThemeName(prioritized.primaryTheme?.title);
  const confidence = prioritized.confidence;

  const headline = buildHeadline(prioritized, themeName);

  return {
    headline,
    coreClaim: buildCoreClaim(prioritized, themeName),
    strategicMeaning: buildStrategicMeaning(prioritized, themeName),
    confidence,
  };
}

function buildHeadline(
  prioritized: PrioritizedUnderstanding,
  themeName: string
): string {
  if (themeName && prioritized.primaryContradiction) {
    return `${themeName} is important, but not yet settled`;
  }

  if (themeName) {
    return `${themeName} is the clearest strategic signal`;
  }

  return cleanHeadline(
    prioritized.primaryBelief?.headline ??
      "Discovery is forming an early understanding"
  );
}

function buildCoreClaim(
  prioritized: PrioritizedUnderstanding,
  themeName: string
): string {
  if (themeName && prioritized.strongestEvidence) {
    return `${themeName} appears to be shaping the strategic picture. The strongest signal is: ${prioritized.strongestEvidence.text}`;
  }

  if (themeName) {
    return `${themeName} appears to be shaping the strategic picture.`;
  }

  return (
    prioritized.primaryBelief?.explanation ??
    "Discovery sees an emerging pattern, but needs more evidence before forming a stronger view."
  );
}

function buildStrategicMeaning(
  prioritized: PrioritizedUnderstanding,
  themeName: string
): string {
  if (themeName && prioritized.primaryContradiction) {
    return `Leadership should pay attention because this signal may affect momentum, but the unresolved tension could change the right interpretation.`;
  }

  if (themeName) {
    return `Leadership should pay attention because this signal appears to be the strongest area of strategic movement.`;
  }

  return "Leadership should treat this as an early signal and continue gathering evidence.";
}

function cleanThemeName(title?: string): string {
  if (!title) return "";

  return title
    .replace(/\bPattern\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanHeadline(headline: string): string {
  return headline
    .replace(/\bPattern\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}