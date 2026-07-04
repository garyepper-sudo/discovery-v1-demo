import { UnderstandingComparison } from "../comparison/comparisonEngine";

export type DetectedPattern = {
  id: string;
  statement: string;
  observationIds: string[];
  beliefIds: string[];
  strength: number;
  confidence: number;
  reason: string;
};

export type PatternDetectionResult = {
  detectedPatterns: DetectedPattern[];
};

function createPatternId(seed: string): string {
  return `pattern_${seed
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 48)}`;
}

export function detectPatternsFromComparison(
  comparison: UnderstandingComparison
): PatternDetectionResult {
  const detectedPatterns: DetectedPattern[] = [];

  comparison.reinforcingObservations.forEach((item) => {
    const supportCount =
      item.relatedObservationIds.length + item.relatedBeliefIds.length;

    if (supportCount < 2) return;

    detectedPatterns.push({
      id: createPatternId(item.statement),
      statement: `A recurring pattern may be forming around: ${item.statement}`,
      observationIds: [item.observationId, ...item.relatedObservationIds],
      beliefIds: item.relatedBeliefIds,
      strength: Math.min(1, supportCount / 5),
      confidence: Math.min(0.92, item.confidence + supportCount * 0.08),
      reason:
        "This signal is appearing across multiple observations or beliefs, suggesting it may be more than an isolated event.",
    });
  });

  return {
    detectedPatterns,
  };
}