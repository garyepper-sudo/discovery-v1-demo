import type {
  GeneratedCognition,
  InferenceScenario,
  RegisteredOrganizationalPrediction,
  VerbalEmergentUnderstanding,
} from "./types";

export function verbalizeEmergentUnderstanding(input: {
  scenario: InferenceScenario;
  cognition: GeneratedCognition;
  canonical: RegisteredOrganizationalPrediction;
}): VerbalEmergentUnderstanding | null {
  if (input.canonical.abstained) return null;
  const mechanism = input.cognition.mechanisms.find(
    (item) => item.id === input.canonical.mechanismId,
  );
  if (!mechanism) return null;
  const evidenceBySource = new Map(
    input.scenario.evidence.map((item) => [item.sourceId, item]),
  );
  const evidenceChain = mechanism.sourceIds
    .map((sourceId) => evidenceBySource.get(sourceId))
    .filter(Boolean)
    .map((item) => `${item!.silo}: ${item!.content}`);
  return {
    whatDiscoverySees: `${mechanism.effect} is not explained by one local issue. Production connected ${mechanism.cause.toLowerCase()} through ${mechanism.mechanism.toLowerCase()}.`,
    whyThisWasHardToSee: `${mechanism.silos.join(
      ", ",
    )} each observe a different part of the pattern. The relationship appears only when their Evidence is connected.`,
    evidenceChain,
    whatThisExplains: mechanism.effect,
    whatDiscoveryPredicts: `If ${mechanism.cause.toLowerCase()} continues, ${mechanism.effect.toLowerCase()} is likely to continue.`,
    whatWouldChangeTheConclusion:
      input.canonical.falsificationCriteria.join(" "),
    whatToDoNext:
      input.canonical.recommendedIntervention ||
      "Run the smallest investigation that distinguishes this mechanism from the strongest alternative.",
  };
}

export function projectVerbalPrediction(input: {
  scenario: InferenceScenario;
  cognition: GeneratedCognition;
  canonical: RegisteredOrganizationalPrediction;
}): RegisteredOrganizationalPrediction {
  const verbal = verbalizeEmergentUnderstanding(input);
  return {
    ...input.canonical,
    modelId: "verbal-projection",
    explanation: verbal
      ? [
          verbal.whatDiscoverySees,
          verbal.whyThisWasHardToSee,
          verbal.whatThisExplains,
        ].join(" ")
      : "No grounded cross-silo understanding is available to communicate.",
  };
}
