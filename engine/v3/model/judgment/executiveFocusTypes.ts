export type ExecutiveFocusPriority =
  | "immediate"
  | "near_term"
  | "monitor";

export type ExecutiveFocusArea = {
  id: string;
  conditionId: string;
  label: string;
  priority: ExecutiveFocusPriority;
  rationale: string;
  supportingMechanismIds: string[];
};

export type ExecutiveFocus = {
  id: string;
  generatedAt: string;

  primaryConditionId: string;
  focusAreas: ExecutiveFocusArea[];

  headline: string;
  executiveDirection: string;
  boundaries: string[];

  confidence: number;
  uncertaintySummary: string;
};

export type ExecutiveFocusConditionLike = {
  id: string;
  name: string;
  status?: string;
  priority?: string;
  confidence?: number;
  strength?: number;
  summary?: string;
  whyItMatters?: string;
  recommendedExecutiveAction?: string;
  supportingMechanismIds?: string[];
  upstreamConditionIds?: string[];
  downstreamConditionIds?: string[];
  uncertaintySummary?: string;
};

export type ExecutiveFocusCausalChainLike = {
  dominantConditionId: string;
  rootMechanismIds: string[];
  supportingConditionIds: string[];
  confidence: number;
  uncertaintySummary?: string;
};

export type BuildExecutiveFocusInput = {
  primaryConditionId: string;
  conditions: ExecutiveFocusConditionLike[];
  dominantCausalChain?: ExecutiveFocusCausalChainLike;
  now?: string;
};
