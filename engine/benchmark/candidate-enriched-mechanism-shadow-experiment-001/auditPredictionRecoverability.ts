import type { CandidateEnrichedMechanism } from "./types";

export function auditPredictionRecoverability(
  candidates: CandidateEnrichedMechanism[],
) {
  return candidates.map((item) => {
    const outcome = item.downstreamOutcomes[0];
    const condition =
      item.activatingConditions[0] ?? item.persistenceConditions[0];
    const implication = item.implications[0];
    return {
      candidateId: item.id,
      classification:
        outcome && condition && implication
          ? "fully recoverable"
          : outcome
            ? "partially recoverable"
            : "unavailable",
      outcomeCorrectnessSupport: Boolean(outcome),
      triggerSupport: Boolean(condition),
      horizonSupport: Boolean(
        implication && /\b(day|week|month|term|horizon)\b/i.test(implication.statement),
      ),
      causalChainPreserved:
        item.mediatingRelationships.length > 0,
      falsifiability: item.falsificationCriteria.length > 0,
      addedFacts: false,
    };
  });
}
