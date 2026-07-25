import type { ArchitectureOutput } from "./types";
export function analyzeInterpretability(outputs: ArchitectureOutput[]) {
  const transitions = outputs.flatMap((output) => output.transitions);
  return {
    lineageCompleteness: transitions.length
      ? transitions.filter((item) => item.lineageIds.length > 0).length / transitions.length : 1,
    explicitReasonRate: transitions.length
      ? transitions.filter((item) => item.reason.length > 0).length / transitions.length : 1,
    reversalCriterionRate: transitions.length
      ? transitions.filter((item) => item.reversibleBy.length > 0).length / transitions.length : 1,
    causalChainPreserved: outputs.every((output) => output.lineageIds.length > 0),
  };
}
