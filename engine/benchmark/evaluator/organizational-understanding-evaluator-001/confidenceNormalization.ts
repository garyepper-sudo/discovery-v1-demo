import type { ConfidenceRange, ConfidenceRepresentation } from "./contracts";
import { qualitativeConfidenceRanges } from "./frozenSemantics";

export const CONFIDENCE_NORMALIZATION_VERSION = "confidence-normalization/v1" as const;

export type CanonicalConfidenceInterval = { minimum: number; maximum: number; representation: "numeric" | "percentage" | "qualitative" | "interval" | "absent" };
const bounded = (value: number) => Number.isFinite(value) && value >= 0 && value <= 1;

export function normalizeConfidence(input: ConfidenceRepresentation): CanonicalConfidenceInterval | null {
  if (input.kind === "absent") return null;
  if (input.kind === "numeric") {
    if (!bounded(input.value)) throw new Error("Invalid numeric confidence.");
    return { minimum: input.value, maximum: input.value, representation: "numeric" };
  }
  if (input.kind === "percentage") {
    if (!Number.isFinite(input.value) || input.value < 0 || input.value > 100) throw new Error("Invalid percentage confidence.");
    const value = input.value / 100;
    return { minimum: value, maximum: value, representation: "percentage" };
  }
  if (input.kind === "interval") {
    if (!bounded(input.minimum) || !bounded(input.maximum) || input.minimum > input.maximum) throw new Error("Invalid confidence interval.");
    return { minimum: input.minimum, maximum: input.maximum, representation: "interval" };
  }
  const range = qualitativeConfidenceRanges[input.label.trim().toLowerCase() as keyof typeof qualitativeConfidenceRanges];
  if (!range) throw new Error("Unknown qualitative confidence.");
  return { minimum: range.minimum, maximum: range.maximum, representation: "qualitative" };
}

export function compareConfidence(actual: CanonicalConfidenceInterval | null, expected: ConfidenceRange | undefined) {
  if (!actual || !expected) return { applicable: false, overlap: 0, directionallyCorrect: false, minimumDistance: null, overconfident: false, underconfident: false, exactNumericError: null };
  const expectedMinimum = expected.minimum, expectedMaximum = expected.maximum;
  if (!bounded(expectedMinimum) || !bounded(expectedMaximum) || expectedMinimum > expectedMaximum) throw new Error("Invalid expected confidence range.");
  const intersection = Math.max(0, Math.min(actual.maximum, expectedMaximum) - Math.max(actual.minimum, expectedMinimum));
  const union = Math.max(actual.maximum, expectedMaximum) - Math.min(actual.minimum, expectedMinimum);
  const bothPoints = actual.minimum === actual.maximum && expectedMinimum === expectedMaximum;
  const overlap = bothPoints ? (actual.minimum === expectedMinimum ? 1 : 0) : union === 0 ? 1 : intersection / union;
  const minimumDistance = actual.maximum < expectedMinimum ? expectedMinimum - actual.maximum : actual.minimum > expectedMaximum ? actual.minimum - expectedMaximum : 0;
  return { applicable: true, overlap, directionallyCorrect: minimumDistance === 0, minimumDistance, overconfident: actual.minimum > expectedMaximum, underconfident: actual.maximum < expectedMinimum, exactNumericError: bothPoints ? Math.abs(actual.minimum - expectedMinimum) : null };
}
