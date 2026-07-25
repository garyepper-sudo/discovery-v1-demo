import type { SupportStatus } from "./types";

export function classifySupportStatus(
  evidenceIds: string[],
  derived: boolean,
): SupportStatus {
  if (evidenceIds.length === 0) return "unavailable";
  return derived ? "deterministically-derived" : "explicit";
}
