import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { FormationInput } from "./types";

const flatten = (value: unknown): string =>
  typeof value === "string" ? value
    : Array.isArray(value) ? value.map(flatten).join(" ")
      : value && typeof value === "object"
        ? Object.values(value as Record<string, unknown>).map(flatten).join(" ")
        : "";

export function collectCanonicalInputs(cognition: GeneratedCognition): FormationInput {
  const stages = [
    cognition.observations, cognition.signals, cognition.contradictions,
    cognition.themes, cognition.phenomena, cognition.beliefs, cognition.concepts,
    cognition.theories, cognition.conditions,
  ];
  const generatedArtifacts = stages.flatMap((items, stage) =>
    (items as unknown[]).map((item, index) => ({
      id: `artifact-${stage}-${index}`,
      text: flatten(item),
      evidenceIds: cognition.rawEvidence
        .filter((evidence) => flatten(item).includes(evidence.text))
        .map((evidence) => evidence.id),
    })));
  const evidenceArtifacts = cognition.rawEvidence.map((evidence) => ({
    id: `raw-${evidence.id}`,
    text: evidence.text,
    evidenceIds: [evidence.id],
  }));
  return {
    scenarioId: cognition.scenarioId,
    rawEvidence: cognition.rawEvidence,
    artifacts: [...evidenceArtifacts, ...generatedArtifacts],
    productionMechanisms: cognition.mechanisms,
  };
}
