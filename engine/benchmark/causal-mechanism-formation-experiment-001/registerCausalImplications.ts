import type { CandidateCausalMechanism } from "./types";

export function registerCausalImplications(
  candidate: CandidateCausalMechanism,
): CandidateCausalMechanism["implications"] {
  const condition = candidate.activatingConditions[0]?.statement;
  const outcome = candidate.downstreamOutcomes[0]?.statement;
  if (!condition || !outcome || candidate.mediatingRelationships.length < 2) return [];
  return [{
    trigger: condition,
    predictedOutcome: outcome,
    horizon: "while the stated condition persists",
    confidence: candidate.confidence,
    artifactIds: candidate.supportingArtifactIds,
    evidenceIds: candidate.supportingEvidenceIds,
  }];
}
