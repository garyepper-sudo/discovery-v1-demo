import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { EvidenceConfiguration } from "./types";

const summarize = (items: unknown[]) =>
  items.map((item) => {
    const value = item as Record<string, unknown>;
    return {
      id: value.id,
      confidence: value.confidence,
      evidenceIds:
        value.evidenceIds ??
        value.sourceEvidenceIds ??
        value.supportingEvidenceIds ??
        [],
      summary:
        value.summary ??
        value.description ??
        value.statement ??
        value.label ??
        "",
    };
  });

export function traceProducerStages(
  configuration: EvidenceConfiguration,
  cognition: GeneratedCognition,
) {
  return {
    configurationId: configuration.id,
    stages: {
      evidence: cognition.rawEvidence,
      observations: summarize(cognition.observations),
      signals: summarize(cognition.signals),
      themes: summarize(cognition.themes),
      phenomena: summarize(cognition.phenomena),
      mechanisms: cognition.mechanisms,
    },
    firstQualifyingStage: cognition.mechanisms.some(
      (item) => item.crossSilo && !item.explicitInSingleSource,
    )
      ? "Mechanism"
      : null,
  };
}
