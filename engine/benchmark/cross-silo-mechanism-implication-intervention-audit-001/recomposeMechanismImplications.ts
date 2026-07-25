import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { AuditedCausalChain } from "./types";

export function recomposeMechanismImplications(
  cognition: GeneratedCognition,
  chain: AuditedCausalChain,
) {
  const predictionPossible = Boolean(
    chain.downstreamOutcome &&
      chain.predictionHorizon &&
      (chain.activatingConditions.length ||
        chain.persistenceConditions.length),
  );
  const recommendation = cognition.executiveRecommendation as
    | { intervention?: Record<string, unknown> }
    | null;
  const action =
    recommendation?.intervention?.executiveIntervention ??
    recommendation?.intervention?.headline;
  const interventionPossible = Boolean(
    action && chain.mediatingLinks.length && chain.downstreamOutcome,
  );
  return {
    mechanismId: chain.mechanismId,
    prediction: predictionPossible
      ? {
          condition:
            chain.activatingConditions[0] ??
            chain.persistenceConditions[0],
          expectedOutcome: chain.downstreamOutcome,
          horizon: chain.predictionHorizon,
        }
      : null,
    intervention: interventionPossible
      ? {
          causalLink: chain.mediatingLinks[0],
          action,
          expectedEffect: chain.downstreamOutcome,
          successSignal: null,
        }
      : null,
    missingForPrediction: [
      !chain.activatingConditions.length &&
      !chain.persistenceConditions.length
        ? "condition"
        : null,
      !chain.predictionHorizon ? "horizon" : null,
      !chain.downstreamOutcome ? "outcome" : null,
    ].filter(Boolean),
    missingForIntervention: [
      !chain.mediatingLinks.length ? "causal link" : null,
      !action ? "generated action" : null,
      !chain.downstreamOutcome ? "expected effect" : null,
      "observable success signal",
    ].filter(Boolean),
    addedSemanticFacts: false,
  };
}
