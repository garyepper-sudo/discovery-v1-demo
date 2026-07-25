import type {
  AuditedCausalChain,
  ContractId,
} from "./types";

export const STRICT_CONFIDENCE_THRESHOLD = 0.7;

export function evaluateEligibilityContracts(
  chains: AuditedCausalChain[],
): Record<ContractId, boolean> {
  const current = chains.some((item) => item.supportingSilos.length >= 3);
  const minimal = chains.some(
    (item) =>
      item.upstreamDriver &&
      item.downstreamOutcome &&
      item.supportingSilos.length >= 2 &&
      item.lineageComplete,
  );
  const full = chains.some(
    (item) =>
      item.upstreamDriver &&
      item.mediatingLinks.length > 0 &&
      item.downstreamOutcome &&
      (item.activatingConditions.length > 0 ||
        item.persistenceConditions.length > 0) &&
      item.supportingSilos.length >= 2 &&
      item.lineageComplete,
  );
  const strict = chains.some(
    (item) =>
      item.upstreamDriver &&
      item.mediatingLinks.length > 0 &&
      item.downstreamOutcome &&
      (item.activatingConditions.length > 0 ||
        item.persistenceConditions.length > 0) &&
      item.supportingSilos.length >= 2 &&
      item.lineageComplete &&
      item.competingExplanations.length > 0 &&
      item.falsificationCriteria.length > 0 &&
      (item.confidence ?? 0) >= STRICT_CONFIDENCE_THRESHOLD,
  );
  return {
    "current-production": current,
    "minimal-completeness": minimal,
    "full-causal-implication": full,
    "adversarially-strict": strict,
  };
}
