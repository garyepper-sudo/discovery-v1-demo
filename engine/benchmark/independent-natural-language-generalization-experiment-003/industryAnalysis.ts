import type { ReturnTypeOfEvaluation } from "./internalTypes";
export function analyzeIndustries(evaluation: ReturnTypeOfEvaluation) {
  return Object.fromEntries([...new Set(evaluation.cases.map((item) => item.industry))].sort()
    .map((industry) => {
      const cases = evaluation.cases.filter((item) => item.industry === industry && item.expectedQualification);
      return [industry, {
        cases: cases.length,
        qualified: cases.filter((item) => item.qualified).length,
        recoveryRate: cases.length
          ? cases.filter((item) => item.qualified).length / cases.length : 0,
      }];
    }));
}
