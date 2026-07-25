import type { CandidateEnrichedMechanism } from "./types";

export const SHARED_CONFIDENCE_THRESHOLD = 0.7;

export function evaluateQualificationContracts(
  candidates: CandidateEnrichedMechanism[],
) {
  const conservative = candidates.filter(
    (item) => item.strategy === "conservative",
  );
  const has = (test: (item: CandidateEnrichedMechanism) => boolean) =>
    conservative.some(test);
  return {
    currentProduction: candidates.some(
      (item) =>
        item.strategy === "current" && item.supportingSiloIds.length >= 3,
    ),
    structuralMinimum: has(
      (item) =>
        Boolean(item.upstreamDriver) &&
        item.downstreamOutcomes.length > 0 &&
        item.supportingSiloIds.length >= 2 &&
        item.supportingEvidenceIds.length > 0,
    ),
    mediatedHypothesis: has(
      (item) =>
        Boolean(item.upstreamDriver) &&
        item.mediatingRelationships.length > 0 &&
        item.downstreamOutcomes.length > 0 &&
        item.supportingSiloIds.length >= 2,
    ),
    qualifiedCausalMechanism: candidates
      .filter((item) => item.strategy === "full-context")
      .some(
        (item) =>
          item.mediatingRelationships.length > 0 &&
          (item.activatingConditions.length > 0 ||
            item.persistenceConditions.length > 0) &&
          item.competingExplanations.length > 0 &&
          item.implications.length > 0 &&
          item.falsificationCriteria.length > 0 &&
          item.confidence >= SHARED_CONFIDENCE_THRESHOLD,
      ),
    conservativeQualifiedMechanism: has(
      (item) =>
        item.mediatingRelationships.length > 0 &&
        (item.activatingConditions.length > 0 ||
          item.persistenceConditions.length > 0) &&
        item.competingExplanations.length > 0 &&
        item.implications.length > 0 &&
        item.falsificationCriteria.length > 0 &&
        item.confidence >= SHARED_CONFIDENCE_THRESHOLD,
    ),
  };
}
