export type ExecutiveRiskSeverity =
  | "critical"
  | "high"
  | "moderate"
  | "watch";

export type ExecutiveRiskHorizon =
  | "immediate"
  | "near_term"
  | "longer_term";

export type ExecutiveRiskItem = {
  id: string;
  conditionId: string;
  label: string;
  severity: ExecutiveRiskSeverity;
  horizon: ExecutiveRiskHorizon;
  statement: string;
  rationale: string;
  supportingConditionIds: string[];
  supportingMechanismIds: string[];
  confidence: number;
};

export type ExecutiveRisks = {
  id: string;
  generatedAt: string;

  primaryConditionId: string;
  risks: ExecutiveRiskItem[];

  headline: string;
  executiveRiskSummary: string;
  boundaries: string[];

  confidence: number;
  uncertaintySummary: string;
};

export type ExecutiveRiskConditionLike = {
  id: string;
  name: string;
  status?: string;
  priority?: string;
  trend?: string;
  confidence?: number;
  strength?: number;
  summary?: string;
  whyItMatters?: string;
  riskIfIgnored?: string;
  supportingMechanismIds?: string[];
  upstreamConditionIds?: string[];
  downstreamConditionIds?: string[];
  uncertaintySummary?: string;
};

export type ExecutiveRiskCausalChainLike = {
  dominantConditionId: string;
  rootMechanismIds: string[];
  supportingConditionIds: string[];
  confidence: number;
  uncertaintySummary?: string;
};

export type BuildExecutiveRisksInput = {
  primaryConditionId: string;
  conditions: ExecutiveRiskConditionLike[];
  dominantCausalChain?: ExecutiveRiskCausalChainLike;
  now?: string;
};
