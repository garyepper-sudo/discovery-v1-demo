import type { ArchitectureOutput, CognitiveInput } from "./types";

export function runStableLinearBaseline(input: CognitiveInput): ArchitectureOutput {
  const structural = input.complementarySupport + input.mediationSupport +
    input.alternativeMargin;
  const confidence = Math.min(0.85, 0.25 + structural * 0.08);
  const mechanismStatus = input.complementarySupport >= 2 ? "hypothesis" : "fragment";
  const outcomeAdjustment = input.predictionRegistered
    ? (input.outcomeTarget === "leading" ? 0.08 :
      input.outcomeTarget === "alternative" || input.outcomeTarget === "neither" ? -0.08 : 0)
    : 0;
  const finalConfidence = Math.max(0.1, Math.min(0.9, confidence + outcomeAdjustment));
  return {
    architecture: "stable-linear", scenarioId: input.scenarioId,
    mechanismStatus, mechanismConfidence: finalConfidence,
    activationStatus: "static", organizationalState: "stable",
    leadingExplanation: input.alternativeMargin >= 0.2 ? "leading" : "unresolved",
    prediction: mechanismStatus === "hypothesis" ? 0.45 : 0.3,
    interventionTarget: mechanismStatus === "hypothesis" ? "mechanism" : "none",
    transitions: [], confidenceHistory: [confidence, finalConfidence],
    lineageIds: input.lineageIds,
    interpretation: ["Support changed gradually; no structural transition was authorized."],
  };
}
