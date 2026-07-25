import type { DiscoveryV3Result } from "../../v3/types";
import type { OrganizationRuntime } from "../../v3/runtime";

import type {
  GeneratedCognition,
  InferenceScenario,
} from "./types";

const asArray = (value: unknown): unknown[] =>
  Array.isArray(value) ? value : [];

export function extractGeneratedCognition(input: {
  scenario: InferenceScenario;
  result: DiscoveryV3Result;
  runtime: OrganizationRuntime;
}): GeneratedCognition {
  const siloBySource = new Map(
    input.scenario.evidence.map((item) => [item.sourceId, item.silo]),
  );
  const evidenceById = new Map(
    input.result.evidence.map((item) => [item.id, item]),
  );
  const mechanisms = [...input.result.mechanisms]
    .map((mechanism) => {
      const evidence = mechanism.evidenceIds
        .map((id) => evidenceById.get(id))
        .filter(Boolean);
      const sourceIds = [
        ...new Set(
          evidence
            .map((item) => item?.sourceId)
            .filter((id): id is string => Boolean(id)),
        ),
      ].sort();
      const silos = [
        ...new Set(
          sourceIds
            .map((id) => siloBySource.get(id))
            .filter((silo): silo is string => Boolean(silo)),
        ),
      ].sort();
      const combined = `${mechanism.cause} ${mechanism.mechanism} ${mechanism.effect}`.toLowerCase();
      const explicitInSingleSource = evidence.some((item) => {
        const words = combined
          .split(/\W+/)
          .filter((word) => word.length > 6);
        const text = (item?.text ?? "").toLowerCase();
        return words.length > 0 && words.every((word) => text.includes(word));
      });
      return {
        id: mechanism.id,
        cause: mechanism.cause,
        mechanism: mechanism.mechanism,
        effect: mechanism.effect,
        confidence: mechanism.confidence,
        evidenceIds: [...mechanism.evidenceIds].sort(),
        sourceIds,
        silos,
        crossSilo: silos.length >= 3,
        explicitInSingleSource,
      };
    })
    .sort(
      (a, b) =>
        Number(b.crossSilo) - Number(a.crossSilo) ||
        b.silos.length - a.silos.length ||
        b.confidence - a.confidence ||
        a.id.localeCompare(b.id),
    );
  const memory = input.runtime.memory as unknown as Record<string, unknown>;
  return {
    scenarioId: input.scenario.id,
    rawEvidence: input.result.evidence.map((item) => ({
      id: item.id,
      sourceId: item.sourceId,
      silo: item.sourceId ? siloBySource.get(item.sourceId) : undefined,
      text: item.text,
    })),
    observations: input.result.observations,
    signals: input.result.signals,
    contradictions: input.result.contradictions,
    themes: input.result.themes,
    mechanisms,
    beliefs: input.result.beliefs,
    hypotheses: input.result.hypotheses,
    causalChains: input.result.causalChains,
    explanations: input.result.explanations,
    understanding: input.result.understanding,
    phenomena: asArray(memory.organizationalPhenomena),
    concepts: asArray(memory.organizationalConcepts),
    theories: asArray(memory.theories),
    conditions: asArray(memory.organizationalConditions),
    organizationalState: memory.organizationalState,
    predictions: asArray(memory.organizationalPredictions),
    executiveAssessment: memory.executiveAssessment,
    executiveRecommendation: memory.executiveRecommendation,
    stagesExercised: [
      "Evidence",
      "Signals",
      "Themes",
      "Observations",
      "Contradictions",
      "Mechanisms",
      "Causal Chains",
      "Explanations",
      "Beliefs",
      "Hypotheses",
      "Understanding",
      "Phenomena",
      "Concepts",
      "Theories",
      "Conditions",
      "Organizational State",
      "Executive Assessment",
      "Predictions",
      "Executive Recommendation",
    ],
  };
}
