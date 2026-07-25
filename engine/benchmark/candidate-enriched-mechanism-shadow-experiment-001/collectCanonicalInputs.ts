import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";

export function collectCanonicalInputs(cognition: GeneratedCognition) {
  return {
    observations: cognition.observations,
    signals: cognition.signals,
    themes: cognition.themes,
    phenomena: cognition.phenomena,
    contradictions: cognition.contradictions,
    mechanisms: cognition.mechanisms,
    beliefs: cognition.beliefs,
    concepts: cognition.concepts,
    theories: cognition.theories,
    conditions: cognition.conditions,
    organizationalState: cognition.organizationalState,
    predictions: cognition.predictions,
    rawEvidence: cognition.rawEvidence,
  };
}
