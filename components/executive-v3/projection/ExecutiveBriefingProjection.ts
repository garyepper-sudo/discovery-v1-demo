export type ExecutiveBriefingChangeDirection =
  | "improving"
  | "worsening"
  | "stable";

export type ExecutiveBriefingChange = {
  id: string;
  label: string;
  direction: ExecutiveBriefingChangeDirection;
  status: string;
};

export type ExecutiveBriefingReason = {
  id: string;
  label: string;
  explanation?: string;
};

export type ExecutiveBriefingForecast = {
  headline: string;
  confidence: number;
  timeHorizon?: string;
  explanation?: string;
};

export type ExecutiveBriefingRecommendation = {
  headline: string;
  explanation?: string;
  recommendedInvestigation?: string;
  decisionHref?: string;
};

export type ExecutiveBriefingReasoningSection = {
  id:
    | "belief"
    | "state"
    | "conditions"
    | "learning"
    | "future";

  title: string;
  summary: string;
  content: string;

  metrics?: Array<{
    label: string;
    value: string;
  }>;
};

export type ExecutiveBriefingProjection = {
  /**
   * One executive conclusion for the first screen.
   */
  conclusion: string;

  /**
   * Confidence in the executive conclusion, expressed as a percentage.
   */
  confidence: number;

  /**
   * Concise reasons supporting the conclusion.
   */
  reasons: ExecutiveBriefingReason[];

  /**
   * Highest-priority changes since the previous organizational state.
   */
  changes: ExecutiveBriefingChange[];

  /**
   * Most important future-state prediction.
   */
  forecast: ExecutiveBriefingForecast;

  /**
   * Highest-priority recommended executive action.
   */
  recommendation: ExecutiveBriefingRecommendation;

  /**
   * Supporting cognition available through progressive disclosure.
   */
  reasoningSections: ExecutiveBriefingReasoningSection[];
};