import type {
  AuditedCausalChain,
  CompletenessAudit,
} from "./types";

export function auditMechanismCompleteness(
  chain: AuditedCausalChain,
): CompletenessAudit {
  const fields = {
    upstreamDriver: Boolean(chain.upstreamDriver),
    mediatingRelationship: chain.mediatingLinks.length > 0,
    downstreamOutcome: Boolean(chain.downstreamOutcome),
    activationOrPersistence:
      chain.activatingConditions.length > 0 ||
      chain.persistenceConditions.length > 0,
    crossSiloSupport: chain.supportingSilos.length >= 2,
    causalDirection:
      Boolean(chain.upstreamDriver) && Boolean(chain.downstreamOutcome),
    alternativeDiscrimination: chain.competingExplanations.length > 0,
    completeLineage: chain.lineageComplete,
    falsifiability: chain.falsificationCriteria.length > 0,
    downstreamImplication:
      Boolean(chain.downstreamOutcome) &&
      (chain.mediatingLinks.length > 0 ||
        chain.activatingConditions.length > 0),
  };
  const score = Object.values(fields).filter(Boolean).length;
  const classification = score >= 9
      ? "complete"
      : score >= 6
        ? "partially complete"
        : fields.crossSiloSupport
          ? "plausible but underdetermined"
          : "local fragment";
  return { fields, score, classification };
}
