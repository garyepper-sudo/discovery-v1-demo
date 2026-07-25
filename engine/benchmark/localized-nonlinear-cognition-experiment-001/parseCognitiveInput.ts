import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type { CognitiveInput } from "./types";

const pattern = /^Cognition input: complementary=(\d+); redundant=(\d+); mediation=(\d+); alternative-margin=([\d.]+); state-contrast=(\d+); condition-support=(\d+); condition-mode=(activate|inhibit|amplify|none); accumulated-state=(\d+); contradictions=(\d+); prediction-registered=(true|false); outcome-discrimination=([\d.]+); outcome-target=(leading|alternative|neither|ambiguous); cycles=(.*?); irrelevant=(\d+); low-quality-conflict=(\d+); external-shock=(true|false)\.$/;

export function parseCognitiveInput(cognition: GeneratedCognition): CognitiveInput {
  const record = cognition.rawEvidence.find((item) => pattern.test(item.text));
  const match = record?.text.match(pattern);
  if (!record || !match) throw new Error(`Missing cognition input for ${cognition.scenarioId}`);
  return {
    scenarioId: cognition.scenarioId,
    complementarySupport: Number(match[1]), redundantSupport: Number(match[2]),
    mediationSupport: Number(match[3]), alternativeMargin: Number(match[4]),
    stateContrastSupport: Number(match[5]), conditionSupport: Number(match[6]),
    conditionMode: match[7] as CognitiveInput["conditionMode"],
    accumulatedStateSupport: Number(match[8]), contradictionSupport: Number(match[9]),
    predictionRegistered: match[10] === "true", outcomeDiscrimination: Number(match[11]),
    outcomeTarget: match[12] as CognitiveInput["outcomeTarget"],
    cycleOutcomes: match[13] === "none" ? [] :
      match[13].split(",") as CognitiveInput["cycleOutcomes"],
    irrelevantEvidence: Number(match[14]), lowQualityConflict: Number(match[15]),
    externalShock: match[16] === "true",
    lineageIds: cognition.rawEvidence.map((item) => item.id).sort(),
  };
}
