import type { ReturnTypeOfEvaluation } from "./internalTypes";
export function analyzeWritingStyles(evaluation: ReturnTypeOfEvaluation) {
  return Object.fromEntries([...new Set(evaluation.cases.map((item) => item.style))].sort()
    .map((style) => {
      const cases = evaluation.cases.filter((item) => item.style === style && item.expectedQualification);
      return [style, {
        cases: cases.length,
        qualified: cases.filter((item) => item.qualified).length,
        recoveryRate: cases.length
          ? cases.filter((item) => item.qualified).length / cases.length : 0,
      }];
    }));
}
