import type { PropositionModality, PropositionPolarity, RecoveredProposition, TemporalState } from "./contracts";

export const polarityRelation = (expected: PropositionPolarity, actual: PropositionPolarity): "exact" | "conflict" | "partial" => expected === actual ? "exact" : (expected === "affirmed" && actual === "denied") || (expected === "denied" && actual === "affirmed") ? "conflict" : "partial";
export const modalityRelation = (expected: PropositionModality, actual: PropositionModality): "exact" | "conflict" => expected === actual ? "exact" : "conflict";
export const temporalRelation = (expected: { state: TemporalState; validFrom?: string; validUntil?: string } | undefined, actual: RecoveredProposition["temporality"]): "exact" | "partial" | "conflict" => {
  if (!expected) return actual.state === "unknown" ? "partial" : "exact";
  if (expected.state !== actual.state) return "conflict";
  const leftStart = expected.validFrom ? Date.parse(expected.validFrom) : Number.NEGATIVE_INFINITY;
  const leftEnd = expected.validUntil ? Date.parse(expected.validUntil) : Number.POSITIVE_INFINITY;
  const rightStart = actual.validFrom ? Date.parse(actual.validFrom) : Number.NEGATIVE_INFINITY;
  const rightEnd = actual.validUntil ? Date.parse(actual.validUntil) : Number.POSITIVE_INFINITY;
  if ([leftStart, leftEnd, rightStart, rightEnd].some((value) => Number.isNaN(value))) return "conflict";
  return Math.max(leftStart, rightStart) <= Math.min(leftEnd, rightEnd) ? "exact" : "conflict";
};
