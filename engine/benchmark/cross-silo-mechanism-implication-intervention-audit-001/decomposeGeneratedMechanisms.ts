import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { AuditedCausalChain } from "./types";

export function decomposeGeneratedMechanisms(
  cognition: GeneratedCognition,
): AuditedCausalChain[] {
  return cognition.mechanisms.map((mechanism) => {
    const mechanismText = mechanism.mechanism.trim();
    const conditional = /\b(if|when|while|under|unless|continues?)\b/i.test(
      `${mechanism.cause} ${mechanismText} ${mechanism.effect}`,
    );
    return {
      mechanismId: mechanism.id,
      upstreamDriver: mechanism.cause || undefined,
      mediatingLinks:
        mechanismText &&
        !/^discovery sees (one condition|a possible|competing signals)/i.test(
          mechanismText,
        )
          ? [mechanismText]
          : [],
      downstreamOutcome: mechanism.effect || undefined,
      activatingConditions: conditional ? [mechanism.cause] : [],
      persistenceConditions: [],
      predictionHorizon: undefined,
      supportingSilos: mechanism.silos,
      supportingEvidenceIds: mechanism.evidenceIds,
      opposingEvidenceIds: [],
      competingExplanations: [],
      falsificationCriteria: [],
      confidence: mechanism.confidence,
      lineageComplete:
        mechanism.evidenceIds.length > 0 &&
        mechanism.sourceIds.length > 0 &&
        mechanism.silos.length > 0,
    };
  });
}
