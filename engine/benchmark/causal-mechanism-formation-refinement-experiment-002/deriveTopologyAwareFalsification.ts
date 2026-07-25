import type { TopologyCandidate } from "./types";

export function deriveTopologyAwareFalsification(candidate: TopologyCandidate) {
  return candidate.implications.map((implication) => ({
    criterion: `${implication.predictedOutcome} does not change when ${implication.trigger}`,
    affectedBranchOrPathIds: implication.affectedBranchOrPathIds,
    artifactIds: implication.artifactIds,
    evidenceIds: implication.evidenceIds,
  }));
}
