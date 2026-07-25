import type { ArchitectureOutput, CognitiveInput, CognitiveTransition } from "./types";

export function applyOutcomeDrivenRevision(
  input: CognitiveInput,
  mechanismStatus: ArchitectureOutput["mechanismStatus"],
  leading: ArchitectureOutput["leadingExplanation"],
) {
  const transitions: CognitiveTransition[] = [];
  let status = mechanismStatus;
  let explanation = leading;
  if (!input.predictionRegistered || input.outcomeDiscrimination < 0.6)
    return { status, explanation, transitions };
  const add = (kind: CognitiveTransition["kind"], reason: string) =>
    transitions.push({
      kind, reason, lineageIds: input.lineageIds,
      reversibleBy: "A later preregistered prediction with a discriminating contrary outcome.",
    });
  if (input.outcomeTarget === "leading") add("confirm", "Observed outcome discriminated in favor of the registered leading prediction.");
  if (input.outcomeTarget === "alternative") {
    status = "hypothesis"; explanation = "alternative";
    add("weaken", "Outcome contradicted the leading prediction.");
    add("promote-alternative", "Outcome discriminated in favor of the registered alternative.");
  }
  if (input.outcomeTarget === "neither") {
    status = "retired"; explanation = "unresolved";
    add("retire", "Outcome falsified both registered explanations.");
  }
  return { status, explanation, transitions };
}
