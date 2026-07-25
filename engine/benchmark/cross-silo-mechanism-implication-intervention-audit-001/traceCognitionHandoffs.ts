import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";

const fields = (item: unknown) => {
  const value = item as Record<string, unknown>;
  return {
    id: value.id ?? null,
    sourceSiloIds: value.sourceSiloIds ?? [],
    supportingEvidenceIds:
      value.evidenceIds ??
      value.sourceEvidenceIds ??
      value.supportingEvidenceIds ??
      [],
    text:
      value.text ??
      value.summary ??
      value.description ??
      value.statement ??
      value.label ??
      null,
    entities: value.entities ?? value.relatedEntityIds ?? [],
    relationships: value.relationships ?? [],
    inferredDirection: value.direction ?? null,
    upstreamDriver: value.cause ?? null,
    intermediateEffect: value.mechanism ?? null,
    downstreamOutcome: value.effect ?? null,
    activatingCondition: value.activatingCondition ?? null,
    persistenceCondition: value.persistenceCondition ?? null,
    temporalHorizon: value.timeHorizon ?? null,
    confidence: value.confidence ?? null,
    contradictions:
      value.contradictions ?? value.contradictoryEvidenceIds ?? [],
    alternativeExplanations: value.alternativeExplanations ?? [],
    falsificationCriteria:
      value.falsifyingEvidence ?? value.falsificationCriteria ?? [],
  };
};

export function traceCognitionHandoffs(cognition: GeneratedCognition) {
  const recommendation = cognition.executiveRecommendation as
    | { intervention?: unknown }
    | null;
  return {
    evidence: cognition.rawEvidence.map(fields),
    observations: cognition.observations.map(fields),
    signals: cognition.signals.map(fields),
    themes: cognition.themes.map(fields),
    phenomena: cognition.phenomena.map(fields),
    mechanisms: cognition.mechanisms.map(fields),
    predictions: cognition.predictions.map(fields),
    interventions: recommendation?.intervention
      ? [fields(recommendation.intervention)]
      : [],
  };
}
