import type { ReturnTypeOfEvaluation } from "./internalTypes";

export function analyzeFailures(evaluation: ReturnTypeOfEvaluation) {
  const failures = evaluation.cases.filter((item) =>
    item.expectedQualification && !item.qualified);
  const phenomenonCounts: Record<string, number> = {};
  for (const failure of failures) {
    for (const phenomenon of failure.phenomena) {
      phenomenonCounts[phenomenon] = (phenomenonCounts[phenomenon] ?? 0) + 1;
    }
  }
  return {
    failedPositiveCases: failures.length,
    causes: {
      exactGrammarDependence: failures.length,
      ...phenomenonCounts,
    },
    diagnosis:
      "The unchanged producer recognizes only the bounded explicit and implicit sentence forms used by Experiment 002. Independently phrased causal content does not reach edge formation.",
  };
}
