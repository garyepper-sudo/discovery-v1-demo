import type { CognitiveInput } from "./types";

export function runMultiCycleLearning(input: CognitiveInput, initial = 0.65) {
  let confidence = initial;
  let leading: "leading" | "alternative" = "leading";
  const history = [confidence];
  const revisions: string[] = [];
  for (const outcome of input.cycleOutcomes) {
    if (outcome === "leading") confidence = Math.min(0.9, confidence + 0.08);
    if (outcome === "alternative") {
      confidence = Math.max(0.35, confidence - 0.18);
      leading = "alternative";
      revisions.push("promote-alternative");
    }
    if (outcome === "neither") confidence = Math.max(0.2, confidence - 0.25);
    history.push(Number(confidence.toFixed(2)));
  }
  if (input.cycleOutcomes.at(-1) === "leading") leading = "leading";
  return { confidence, leading, history, revisions };
}
