import {
  PersistentPattern,
  UnderstandingState,
} from "../../understanding/types";

import { DetectedPattern } from "./patternDetectionEngine";

function toStability(status: PersistentPattern["status"]) {
  if (status === "stable") return "stable";
  if (status === "forming") return "forming";
  return "emerging";
}

function buildPatternLabel(statement: string): string {
  return statement
    .replace("A recurring pattern may be forming around: ", "")
    .slice(0, 72);
}

export function mergePatternsIntoState(params: {
  state: UnderstandingState;
  detectedPatterns: DetectedPattern[];
  now: string;
}): PersistentPattern[] {
  const existingPatterns = params.state.patterns ?? [];
  const mergedPatterns = [...existingPatterns];

  params.detectedPatterns.forEach((detectedPattern) => {
    const existingIndex = mergedPatterns.findIndex(
      (pattern) => pattern.id === detectedPattern.id
    );

    if (existingIndex >= 0) {
      const existing = mergedPatterns[existingIndex];
      const nextOccurrences = existing.occurrences + 1;
      const nextStatus: PersistentPattern["status"] =
        nextOccurrences >= 3 ? "stable" : "forming";

      mergedPatterns[existingIndex] = {
        ...existing,
        relatedObservationIds: Array.from(
          new Set([
            ...existing.relatedObservationIds,
            ...detectedPattern.observationIds,
          ])
        ),
        relatedBeliefIds: Array.from(
          new Set([
            ...existing.relatedBeliefIds,
            ...detectedPattern.beliefIds,
          ])
        ),
        strength: Math.min(
          1,
          Math.max(existing.strength, detectedPattern.strength)
        ),
        confidence: Math.min(
          0.98,
          Math.max(existing.confidence, detectedPattern.confidence)
        ),
        occurrences: nextOccurrences,
        lastSeenAt: params.now,
        status: nextStatus,
        stability: toStability(nextStatus),
        reason: detectedPattern.reason,
      };

      return;
    }

    const status: PersistentPattern["status"] = "forming";

    mergedPatterns.push({
      id: detectedPattern.id,
      label: buildPatternLabel(detectedPattern.statement),
      statement: detectedPattern.statement,
      description: detectedPattern.statement,
      confidence: detectedPattern.confidence,
      strength: detectedPattern.strength,
      stability: toStability(status),
      status,
      occurrences: 1,
      firstSeenAt: params.now,
      lastSeenAt: params.now,
      relatedObservationIds: detectedPattern.observationIds,
      relatedBeliefIds: detectedPattern.beliefIds,
      relatedThemeIds: [],
      reason: detectedPattern.reason,
    });
  });

  return mergedPatterns;
}