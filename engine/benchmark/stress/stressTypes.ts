export type StressVariant =
  | "baseline"
  | "evidence-75"
  | "evidence-50"
  | "evidence-25"
  | "evidence-10"
  | "contradictory-evidence"
  | "competing-theory"
  | "executive-bias"
  | "constraint-explosion"
  | "scenario-explosion"
  | "dominated-option";

export type StressFailureCode =
  | "runtime_failure"
  | "confidence_inflation"
  | "contradiction_loss"
  | "unsupported_causal_certainty"
  | "unexpected_recommendation_reversal"
  | "scenario_ranking_instability"
  | "dominated_option_selected"
  | "missing_investigation_response";

export type StressRunResult = {
  variant: StressVariant;

  succeeded: boolean;

  durationMs: number;

  dominantTheory?: string;

  recommendation?: string;

  selectedScenarioId?: string;

  rankedScenarioIds: string[];

  confidence?: number;

  evidenceCount: number;

  contradictionCount: number;

  averageContradictionConfidence: number;

  evidenceConfidenceScore?: number;

  learningConfidenceScore?: number;

  constraintConfidenceScore?: number;

  investigationOpportunityCount: number;

  failureCodes: StressFailureCode[];

  notes: string[];
};

export type EngineStressReport = {
  experimentId: string;

  generatedAt: string;

  baseline: StressRunResult;

  variants: StressRunResult[];
};
