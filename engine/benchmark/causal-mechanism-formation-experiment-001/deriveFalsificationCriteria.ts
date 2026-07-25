import type { CandidateCausalMechanism } from "./types";

export function deriveFalsificationCriteria(
  candidate: CandidateCausalMechanism,
): CandidateCausalMechanism["falsificationCriteria"] {
  const mediator = candidate.mediatingRelationships[0]?.to;
  const outcome = candidate.downstreamOutcomes[0]?.statement;
  if (!mediator || !outcome) return [];
  return [{
    criterion: `${outcome} improves while ${mediator} remains unchanged`,
    artifactIds: candidate.supportingArtifactIds,
    evidenceIds: candidate.supportingEvidenceIds,
  }, {
    criterion: `${mediator} changes without changing ${outcome}`,
    artifactIds: candidate.supportingArtifactIds,
    evidenceIds: candidate.supportingEvidenceIds,
  }];
}
