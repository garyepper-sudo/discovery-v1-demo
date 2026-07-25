import type { ReturnTypeOfEvaluation } from "./internalTypes";
export function analyzeTerminology(evaluation: ReturnTypeOfEvaluation) {
  const positive = evaluation.cases.filter((item) => item.expectedQualification);
  return {
    terminologySets: positive.length,
    invariantRecoveries: positive.filter((item) => item.qualified).length,
    invarianceRate: positive.length
      ? positive.filter((item) => item.qualified).length / positive.length : 0,
    conclusion:
      "Failure across distinct terminology sets indicates exact benchmark grammar, not organizational vocabulary, controls recovery.",
  };
}
