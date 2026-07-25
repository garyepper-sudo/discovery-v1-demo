import type { CandidateEnrichedMechanism } from "./types";

export function auditInterventionTargetRecoverability(
  candidates: CandidateEnrichedMechanism[],
) {
  return candidates.map((item) => ({
    candidateId: item.id,
    classification:
      item.mediatingRelationships.length > 0 &&
      item.downstreamOutcomes.length > 0
        ? "partially recoverable"
        : "unavailable",
    causalLinkExplicit: item.mediatingRelationships.length > 0,
    interventionClassSupported: false,
    expectedEffectSupported: item.downstreamOutcomes.length > 0,
    observableSuccessSignalSupported: false,
    falsificationSignalSupported: item.falsificationCriteria.length > 0,
    addedFacts: false,
  }));
}
