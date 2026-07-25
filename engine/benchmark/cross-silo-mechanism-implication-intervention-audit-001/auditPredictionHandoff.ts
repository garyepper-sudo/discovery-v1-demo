import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { AuditedCausalChain } from "./types";

export function auditPredictionHandoff(
  cognition: GeneratedCognition,
  chains: AuditedCausalChain[],
) {
  return cognition.predictions.map((prediction) => {
    const value = prediction as Record<string, unknown>;
    const text = JSON.stringify(prediction).toLowerCase();
    const chain = chains.find(
      (item) =>
        item.downstreamOutcome &&
        text.includes(item.downstreamOutcome.toLowerCase()),
    );
    return {
      predictionId: value.id ?? null,
      linkedMechanismId: chain?.mechanismId ?? null,
      upstreamDriverPreserved: Boolean(
        chain?.upstreamDriver &&
          text.includes(chain.upstreamDriver.toLowerCase()),
      ),
      mediatingLinksPreserved:
        Boolean(chain) &&
        chain!.mediatingLinks.some((item) =>
          text.includes(item.toLowerCase()),
        ),
      downstreamOutcomePreserved: Boolean(chain),
      activatingConditionPreserved:
        Boolean(chain) &&
        chain!.activatingConditions.some((item) =>
          text.includes(item.toLowerCase()),
        ),
      horizonPresent: Boolean(value.timeHorizon),
      confidence: value.confidence ?? null,
      falsificationPresent:
        Array.isArray(value.falsifyingEvidence) &&
        value.falsifyingEvidence.length > 0,
      genericStateDerivable:
        !chain &&
        Boolean(
          value.sourceConditionIds ||
            value.sourceConceptIds ||
            value.sourceTheoryIds,
        ),
      text: value.statement ?? value.summary ?? null,
    };
  });
}
