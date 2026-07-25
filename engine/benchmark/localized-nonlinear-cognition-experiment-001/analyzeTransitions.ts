import type { ArchitectureOutput, ScenarioTruth } from "./types";

export function analyzeTransitions(outputs: ArchitectureOutput[], truth: ScenarioTruth[]) {
  let tp = 0, fp = 0, fn = 0;
  const cases = truth.map((expected) => {
    const output = outputs.find((item) => item.scenarioId === expected.scenarioId)!;
    const actual = new Set(output.transitions.map((item) => item.kind));
    const wanted = new Set(expected.expectedTransitions);
    tp += [...actual].filter((item) => wanted.has(item)).length;
    fp += [...actual].filter((item) => !wanted.has(item)).length;
    fn += [...wanted].filter((item) => !actual.has(item)).length;
    return {
      scenarioId: expected.scenarioId,
      expected: expected.expectedTransitions,
      actual: [...actual],
      falseTransitions: [...actual].filter((item) => !wanted.has(item)),
      missedTransitions: [...wanted].filter((item) => !actual.has(item)),
    };
  });
  return {
    precision: tp + fp ? tp / (tp + fp) : 0,
    recall: tp + fn ? tp / (tp + fn) : 0,
    correctTransitions: tp, falseTransitions: fp, missedTransitions: fn, cases,
  };
}
