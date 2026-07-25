import type { ArchitectureOutput, CognitiveInput, CognitiveTransition } from "./types";

export function runPervasiveNonlinearCognition(input: CognitiveInput): ArchitectureOutput {
  const promotedSupport = input.complementarySupport + input.redundantSupport +
    Math.ceil(input.irrelevantEvidence / 2);
  const transitions: CognitiveTransition[] = [];
  const add = (kind: CognitiveTransition["kind"], reason: string) =>
    transitions.push({
      kind, reason, lineageIds: input.lineageIds,
      reversibleBy: "A later threshold crossing.",
    });
  let mechanismStatus: ArchitectureOutput["mechanismStatus"] =
    promotedSupport >= 2 ? "qualified" : "fragment";
  if (mechanismStatus === "qualified") {
    add("fragment-to-hypothesis", "Lower-level promotions crossed a broad support threshold.");
    add("hypothesis-to-qualified", "Recursive support crossed a broad qualification threshold.");
  }
  let activationStatus: ArchitectureOutput["activationStatus"] = "static";
  if (input.conditionSupport >= 2) {
    activationStatus = input.conditionMode === "inhibit" ? "inhibited"
      : input.conditionMode === "amplify" ? "amplified" : "active";
    add(activationStatus === "inhibited" ? "active-to-inhibited"
      : activationStatus === "amplified" ? "active-to-amplified"
        : "inactive-to-active", "Broad condition threshold changed activation.");
  }
  let organizationalState: ArchitectureOutput["organizationalState"] =
    input.accumulatedStateSupport >= 3 ? "transitioned" : "stable";
  if (organizationalState === "transitioned")
    add("state-transition", "Accumulated state score crossed a broad threshold.");
  let leading: ArchitectureOutput["leadingExplanation"] =
    mechanismStatus === "qualified" ? "leading" : "unresolved";
  if (input.outcomeDiscrimination >= 0.5) {
    if (input.outcomeTarget === "alternative") {
      leading = "alternative"; add("promote-alternative", "Feedback favored the alternative.");
    }
    if (input.outcomeTarget === "neither") {
      mechanismStatus = "retired"; leading = "unresolved"; add("retire", "Feedback crossed retirement threshold.");
    }
    if (input.outcomeTarget === "leading") add("confirm", "Feedback reinforced the current conclusion.");
  }
  let confidence = 0.4 + promotedSupport * 0.08;
  const history = [confidence];
  for (const outcome of input.cycleOutcomes) {
    confidence = outcome === "leading" ? confidence * 1.25
      : outcome === "alternative" ? confidence * 0.65 : confidence;
    confidence = Math.max(0.05, Math.min(0.99, confidence));
    history.push(Number(confidence.toFixed(3)));
  }
  const prediction = activationStatus === "amplified" ? 0.95
    : activationStatus === "inhibited" ? 0.2
      : organizationalState === "transitioned" ? 0.85
        : mechanismStatus === "qualified" ? 0.75 : 0.3;
  return {
    architecture: "pervasive-nonlinear", scenarioId: input.scenarioId,
    mechanismStatus, mechanismConfidence: confidence, activationStatus,
    organizationalState, leadingExplanation: leading, prediction,
    interventionTarget: leading === "alternative" ? "alternative"
      : mechanismStatus === "qualified" ? "condition" : "none",
    transitions, confidenceHistory: history, lineageIds: input.lineageIds,
    interpretation: transitions.map((item) => item.reason),
  };
}
