import { deriveCanonicalForecast } from "./inferCandidateAttractor";
import type {
  CandidateOrganizationalAttractor,
  InferenceScenario,
  RegisteredPrediction,
} from "./types";

const prediction = (
  modelId: RegisteredPrediction["modelId"],
  scenarioId: string,
  conditionId: string | undefined,
  confidence: number,
  trigger: string,
  artifacts: string[],
  falsification: string,
  reason?: string,
): RegisteredPrediction => ({
  modelId,
  scenarioId,
  predictionId: `${modelId}:${scenarioId}`,
  triggeringCondition: trigger,
  predictedOutcome: conditionId ?? reason ?? "abstain",
  predictedConditionId: conditionId,
  confidence,
  supportingArtifactIds: [...artifacts].sort(),
  falsificationCondition: falsification,
  abstained: conditionId === undefined,
});

export function predictState(
  scenario: InferenceScenario,
): RegisteredPrediction {
  const latest = [...scenario.inferenceWindow].sort((a, b) =>
    a.recordedAt.localeCompare(b.recordedAt),
  ).at(-1)!;
  const conditionId =
    latest.state.dominantConditions.length === 1
      ? latest.state.dominantConditions[0]
      : undefined;
  return prediction(
    "state",
    scenario.id,
    conditionId,
    latest.state.confidence,
    "latest Organizational State persists",
    [latest.state.id],
    "A different Organizational Condition becomes dominant.",
    "Latest state is unresolved.",
  );
}

export function predictMechanisms(
  scenario: InferenceScenario,
): RegisteredPrediction {
  const latest = [...scenario.inferenceWindow].sort((a, b) =>
    a.recordedAt.localeCompare(b.recordedAt),
  ).at(-1)!;
  const effects = new Map<string, { score: number; ids: string[]; causes: string[] }>();
  for (const mechanism of latest.mechanisms) {
    const conditionId = latest.conditions.find((condition) =>
      condition.supportingMechanismIds.includes(mechanism.id),
    )?.id;
    if (!conditionId) continue;
    const current = effects.get(conditionId) ?? { score: 0, ids: [], causes: [] };
    current.score += mechanism.confidence * mechanism.stability;
    current.ids.push(mechanism.id);
    current.causes.push(mechanism.cause);
    effects.set(conditionId, current);
  }
  const ranked = [...effects.entries()].sort(
    (a, b) => b[1].score - a[1].score || a[0].localeCompare(b[0]),
  );
  const leader = ranked[0];
  if (!leader || (ranked[1] && leader[1].score - ranked[1][1].score < 0.2)) {
    return prediction(
      "mechanisms",
      scenario.id,
      undefined,
      0.4,
      "",
      latest.mechanisms.map((item) => item.id),
      "",
      "Current mechanisms do not identify one direction.",
    );
  }
  return prediction(
    "mechanisms",
    scenario.id,
    leader[0],
    Math.min(0.85, 0.5 + leader[1].score / 10),
    leader[1].causes.sort().join(" AND "),
    leader[1].ids,
    "The active mechanisms cease or produce a different condition.",
  );
}

export function predictCombined(
  scenario: InferenceScenario,
): RegisteredPrediction {
  const result = deriveCanonicalForecast(scenario);
  return prediction(
    "combined",
    scenario.id,
    result.conditionId,
    result.confidence,
    result.trigger,
    result.supportingArtifactIds,
    result.falsificationCondition,
    result.abstentionReason,
  );
}

export function predictAttractor(
  scenario: InferenceScenario,
  candidate: CandidateOrganizationalAttractor | null,
): RegisteredPrediction {
  const implication = candidate?.implications[0];
  return prediction(
    "attractor",
    scenario.id,
    candidate?.targetState.conditionIds[0],
    candidate?.persistenceConfidence ?? 0.35,
    implication?.triggeringCondition ?? "",
    candidate?.supportingArtifactIds ?? [],
    candidate?.falsificationCriteria[0] ?? "",
    "No supported Candidate Attractor.",
  );
}
