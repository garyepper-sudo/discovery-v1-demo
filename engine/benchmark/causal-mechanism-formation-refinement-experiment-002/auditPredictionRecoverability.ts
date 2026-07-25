import type { TopologyCandidate } from "./types";
export function auditPredictionRecoverability(candidate: TopologyCandidate) {
  const required = candidate.topology === "branching" ? 2 : 1;
  return {
    classification: candidate.implications.length >= required
      ? "fully recoverable" : candidate.implications.length ? "partially recoverable" : "unavailable",
    pathSpecific: candidate.implications.length > 0,
    branchSpecific: candidate.topology === "branching" && candidate.implications.length >= 2,
    contributorSensitive: candidate.topology === "converging" && candidate.implications.length > 0,
  };
}
