import type { ArchitectureOutput } from "./types";

export function analyzeStability(outputs: ArchitectureOutput[]) {
  const cascades = outputs.filter((output) =>
    output.confidenceHistory.some((value) => value >= 0.98)).length;
  const oscillations = outputs.filter((output) => {
    const deltas = output.confidenceHistory.slice(1).map((value, index) =>
      Math.sign(value - output.confidenceHistory[index]));
    return deltas.filter((value, index) => index > 0 && value !== deltas[index - 1]).length >= 3;
  }).length;
  return {
    confidenceCascadeRate: outputs.length ? cascades / outputs.length : 0,
    oscillationRate: outputs.length ? oscillations / outputs.length : 0,
    irreversibleErrorRate: outputs.filter((output) =>
      output.organizationalState === "transitioned" &&
      output.transitions.some((item) => item.kind === "reverse-transition")).length / outputs.length,
  };
}
