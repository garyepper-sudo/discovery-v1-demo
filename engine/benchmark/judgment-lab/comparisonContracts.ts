import type { JudgmentLabOutput } from "./contracts";

export type ComparisonSystem = "discovery" | "baseline-llm" | "future-discovery";
export type BlindComparisonCriterion = "judgment-quality" | "causal-fidelity" | "evidence-grounding" | "uncertainty" | "executive-clarity";

export type BlindComparisonSubmission = {
  submissionId: string;
  comparisonId: string;
  anonymizedLabel: string;
  output: JudgmentLabOutput;
};

export type BlindComparisonManifest = {
  id: string;
  benchmarkCaseId: string;
  criteria: BlindComparisonCriterion[];
  submissions: BlindComparisonSubmission[];
  sealedSystemMapping: Record<string, ComparisonSystem>;
};

export type BlindExecutiveEvaluation = {
  comparisonId: string;
  evaluatorId: string;
  rankings: Array<{ criterion: BlindComparisonCriterion; orderedSubmissionIds: string[] }>;
  rationale?: string;
  evaluatedAt: string;
};
