import type {
  GeneratedCognition,
  InferenceScenario,
  ModelId,
  RegisteredOrganizationalPrediction,
} from "./types";

const text = (value: unknown) =>
  typeof value === "string" ? value : JSON.stringify(value ?? "");

function output(input: {
  scenarioId: string;
  modelId: ModelId;
  variantId?: string;
  explanation: string;
  mechanismId?: string;
  predictedOutcome?: string;
  intervention?: string;
  evidenceIds?: string[];
  artifactIds?: string[];
  confidence: number;
  trigger?: string[];
  falsification?: string[];
}): RegisteredOrganizationalPrediction {
  return {
    scenarioId: input.scenarioId,
    modelId: input.modelId,
    variantId: input.variantId,
    explanation: input.explanation,
    mechanismId: input.mechanismId,
    predictedOutcome: input.predictedOutcome ?? "",
    triggeringConditions: input.trigger ?? [],
    predictionHorizon: "next observed organizational transition",
    confidence: input.confidence,
    recommendedIntervention: input.intervention ?? "",
    expectedInterventionEffect: input.predictedOutcome ?? "",
    supportingEvidenceIds: [...(input.evidenceIds ?? [])].sort(),
    supportingCognitionArtifactIds: [...(input.artifactIds ?? [])].sort(),
    falsificationCriteria: input.falsification ?? [],
    abstained: !input.mechanismId,
  };
}

function recommendationText(cognition: GeneratedCognition): string {
  const recommendation = cognition.executiveRecommendation as
    | {
        executiveRecommendation?: string;
        intervention?: {
          executiveIntervention?: string;
          headline?: string;
        };
        headline?: string;
      }
    | null
    | undefined;
  return (
    recommendation?.intervention?.executiveIntervention ??
    recommendation?.executiveRecommendation ??
    recommendation?.intervention?.headline ??
    recommendation?.headline ??
    text(cognition.executiveRecommendation)
  );
}

export function predictFromIndividualSilo(input: {
  scenario: InferenceScenario;
  silo: string;
  cognition: GeneratedCognition;
}): RegisteredOrganizationalPrediction {
  const mechanism = input.cognition.mechanisms[0];
  return output({
    scenarioId: input.scenario.id,
    modelId: "best-silo",
    variantId: input.silo,
    explanation: mechanism
      ? `${mechanism.cause}; ${mechanism.mechanism}; ${mechanism.effect}`
      : `The ${input.silo} evidence does not produce a supported mechanism.`,
    mechanismId: mechanism?.id,
    predictedOutcome: mechanism?.effect,
    intervention: recommendationText(input.cognition),
    evidenceIds: mechanism?.evidenceIds,
    artifactIds: mechanism ? [mechanism.id] : [],
    confidence: mechanism?.confidence ?? 0.3,
    trigger: mechanism ? [mechanism.cause] : [],
    falsification: mechanism
      ? [`The predicted effect does not follow ${mechanism.cause}.`]
      : [],
  });
}

export function predictLocalAggregation(input: {
  scenario: InferenceScenario;
  siloPredictions: RegisteredOrganizationalPrediction[];
}): RegisteredOrganizationalPrediction {
  const ranked = [...input.siloPredictions].sort(
    (a, b) =>
      b.confidence - a.confidence ||
      (a.variantId ?? "").localeCompare(b.variantId ?? ""),
  );
  const leader = ranked[0];
  return output({
    scenarioId: input.scenario.id,
    modelId: "local-aggregation",
    explanation: ranked.map((item) => item.explanation).join(" "),
    predictedOutcome: leader?.predictedOutcome,
    intervention: leader?.recommendedIntervention,
    evidenceIds: ranked.flatMap((item) => item.supportingEvidenceIds),
    artifactIds: ranked.flatMap((item) => item.supportingCognitionArtifactIds),
    confidence: leader?.confidence ?? 0.3,
  });
}

export function predictGenericSummary(
  scenario: InferenceScenario,
): RegisteredOrganizationalPrediction {
  const ordered = [...scenario.evidence].sort((a, b) =>
    a.sourceId.localeCompare(b.sourceId),
  );
  const explanation = ordered
    .map((item) => `${item.silo}: ${item.content}`)
    .join(" ");
  return output({
    scenarioId: scenario.id,
    modelId: "generic-summary",
    explanation,
    predictedOutcome: ordered.at(-1)?.content,
    evidenceIds: ordered.map((item) => item.sourceId),
    confidence: ordered.length >= 3 ? 0.6 : 0.4,
    falsification: ["One or more summarized observations do not persist."],
  });
}

export function predictProductionState(input: {
  scenario: InferenceScenario;
  cognition: GeneratedCognition;
}): RegisteredOrganizationalPrediction {
  const state = input.cognition.organizationalState as
    | { id?: string; summary?: string; confidence?: number }
    | null
    | undefined;
  return output({
    scenarioId: input.scenario.id,
    modelId: "production-state",
    explanation: state?.summary ?? "Production did not generate Organizational State.",
    predictedOutcome: state?.summary,
    artifactIds: state?.id ? [state.id] : [],
    confidence: state?.confidence ?? 0.3,
    falsification: ["A different Organizational State becomes dominant."],
  });
}

export function predictProductionCombined(input: {
  scenario: InferenceScenario;
  cognition: GeneratedCognition;
}): RegisteredOrganizationalPrediction {
  const mechanism = input.cognition.mechanisms.find(
    (item) => item.crossSilo && !item.explicitInSingleSource,
  );
  return output({
    scenarioId: input.scenario.id,
    modelId: "production-combined",
    explanation: mechanism
      ? `${mechanism.cause}; ${mechanism.mechanism}; ${mechanism.effect}`
      : "Production cognition did not generate a qualifying cross-silo mechanism.",
    mechanismId: mechanism?.id,
    predictedOutcome: mechanism?.effect,
    intervention: recommendationText(input.cognition),
    evidenceIds: mechanism?.evidenceIds,
    artifactIds: mechanism ? [mechanism.id] : [],
    confidence: mechanism?.confidence ?? 0.3,
    trigger: mechanism ? [mechanism.cause] : [],
    falsification: mechanism
      ? [
          `The predicted effect does not follow ${mechanism.cause}.`,
          "Removing a required silo leaves the mechanism unchanged.",
        ]
      : [],
  });
}
