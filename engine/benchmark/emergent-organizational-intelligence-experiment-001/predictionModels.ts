import { inferEmergentUnderstanding } from "./inferEmergentUnderstanding";
import { interventionForMechanism } from "./interventionModels";
import type {
  InferenceScenario,
  ModelId,
  RegisteredDecision,
  SiloEvidence,
} from "./types";

function decision(input: {
  modelId: ModelId;
  scenario: InferenceScenario;
  mechanismId?: string;
  explanation: string;
  predictedOutcome?: string;
  evidenceIds: string[];
  confidence: number;
  falsification?: string;
}): RegisteredDecision {
  return {
    modelId: input.modelId,
    scenarioId: input.scenario.id,
    mechanismId: input.mechanismId,
    explanation: input.explanation,
    predictedOutcome: input.predictedOutcome,
    recommendedIntervention: interventionForMechanism(input.mechanismId),
    supportingEvidenceIds: [...input.evidenceIds].sort(),
    confidence: input.confidence,
    falsificationCondition: input.falsification ?? "",
    abstained: !input.mechanismId,
  };
}

function strongestSiloEvidence(
  scenario: InferenceScenario,
): SiloEvidence | undefined {
  const groups = new Map<string, SiloEvidence[]>();
  for (const item of scenario.evidence) {
    groups.set(item.silo, [...(groups.get(item.silo) ?? []), item]);
  }
  return [...groups.values()]
    .sort(
      (a, b) =>
        b.length - a.length ||
        a[0].silo.localeCompare(b[0].silo),
    )[0]?.[0];
}

export function predictBestSilo(
  scenario: InferenceScenario,
): RegisteredDecision {
  const strongest = strongestSiloEvidence(scenario);
  return decision({
    modelId: "best-silo",
    scenario,
    explanation: strongest?.localInterpretation ?? "Insufficient local evidence.",
    predictedOutcome: strongest?.observation,
    evidenceIds: strongest ? [strongest.id] : [],
    confidence: strongest ? 0.56 : 0.3,
  });
}

export function predictMajority(
  scenario: InferenceScenario,
): RegisteredDecision {
  const interpretations = [...scenario.evidence]
    .map((item) => item.localInterpretation)
    .sort();
  return decision({
    modelId: "majority",
    scenario,
    explanation:
      interpretations[0] ?? "No majority interpretation is available.",
    predictedOutcome: interpretations[0],
    evidenceIds: scenario.evidence.map((item) => item.id),
    confidence: interpretations.length >= 3 ? 0.58 : 0.38,
  });
}

export function predictSummary(
  scenario: InferenceScenario,
): RegisteredDecision {
  const evidence = [...scenario.evidence].sort((a, b) =>
    a.id.localeCompare(b.id),
  );
  return decision({
    modelId: "summary",
    scenario,
    explanation: evidence.map((item) => `${item.silo}: ${item.observation}`).join(" "),
    predictedOutcome: evidence.at(-1)?.observation,
    evidenceIds: evidence.map((item) => item.id),
    confidence: evidence.length >= 3 ? 0.62 : 0.4,
    falsification: "A listed observation is shown to be inaccurate.",
  });
}

export function predictState(
  scenario: InferenceScenario,
): RegisteredDecision {
  return decision({
    modelId: "state",
    scenario,
    explanation: scenario.artifacts.state.summary,
    predictedOutcome: scenario.artifacts.state.summary,
    evidenceIds: [],
    confidence: scenario.artifacts.state.confidence,
    falsification: "A different Organizational Condition becomes dominant.",
  });
}

export function predictCanonicalCombined(
  scenario: InferenceScenario,
): RegisteredDecision {
  const understanding = inferEmergentUnderstanding(scenario);
  return decision({
    modelId: "canonical-combined",
    scenario,
    mechanismId: understanding?.mechanismId,
    explanation:
      understanding?.explanation ??
      "Canonical artifacts do not support one integrated explanation.",
    predictedOutcome: understanding?.predictedOutcomes[0],
    evidenceIds: understanding?.supportingEvidenceIds ?? [],
    confidence: understanding?.confidence ?? 0.35,
    falsification: understanding?.falsificationCriteria[0],
  });
}

export function predictEmergent(
  scenario: InferenceScenario,
): RegisteredDecision {
  const understanding = inferEmergentUnderstanding(scenario);
  return decision({
    modelId: "emergent",
    scenario,
    mechanismId: understanding?.mechanismId,
    explanation:
      understanding?.explanation ??
      "No non-local, grounded organizational explanation is supported.",
    predictedOutcome: understanding?.predictedOutcomes[0],
    evidenceIds: understanding?.supportingEvidenceIds ?? [],
    confidence: understanding?.confidence ?? 0.35,
    falsification: understanding?.falsificationCriteria[0],
  });
}
