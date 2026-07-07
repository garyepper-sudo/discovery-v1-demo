export type ExecutiveMetricTrend = "up" | "down" | "stable" | "unknown";

export type ExecutiveMetricCard = {
  label: string;
  current: number;
  previous?: number;
  delta?: number;
  unit?: "%" | "score" | "count";
  trend: ExecutiveMetricTrend;
  summary: string;
};

export type ExecutiveUnderstandingItem = {
  title: string;
  summary: string;
  confidence?: number;
};

export type ExecutiveChangeItem = {
  title: string;
  summary: string;
  reason: string;
  confidence?: number;
};

export type ExecutiveAttentionPriority =
  | "highest"
  | "high"
  | "medium"
  | "watch";

export type ExecutiveAttentionSource =
  | "theory"
  | "belief"
  | "learning-event"
  | "change-summary";

export type ExecutiveAttentionItem = {
  title: string;
  priority: ExecutiveAttentionPriority;
  reason: string;
  source: ExecutiveAttentionSource;
  confidence?: number;
};

export type ExecutiveRecommendedAction = {
  title: string;
  reason: string;
  expectedUnderstandingGain?: "high" | "medium" | "low";
};

export type ExecutiveTimelineEntry = {
  timestamp: string;
  title: string;
  summary: string;
  understanding?: number;
  confidence?: number;
};

export type ExecutiveState = {
  generatedAt: string;

  /**
   * Executive headline shown at the top of the dashboard.
   */
  headline: string;

  /**
   * One-paragraph executive summary.
   */
  summary: string;

  /**
   * Overall confidence Discovery has in its current
   * organizational understanding.
   */
  organizationConfidence?: number;

  /**
   * Overall health/status label.
   */
  status?: "improving" | "stable" | "watch" | "critical";

  /**
   * Optional identifier or timestamp of the most recent
   * investigation incorporated into this state.
   */
  lastInvestigation?: string;

  /**
   * Executive KPI cards.
   */
  metrics: ExecutiveMetricCard[];

  /**
   * What Discovery currently understands.
   */
  currentUnderstanding: ExecutiveUnderstandingItem[];

  /**
   * What changed since the previous investigation.
   */
  whatChanged: ExecutiveChangeItem[];

  /**
   * Highest priority leadership focus areas.
   */
  leadershipAttention: ExecutiveAttentionItem[];

  /**
   * Organizational learning over time.
   */
  learningTimeline: ExecutiveTimelineEntry[];

  /**
   * Highest-value next action.
   */
  nextRecommendedAction?: ExecutiveRecommendedAction;

  /**
   * Progressive disclosure.
   * These are passed directly from the cognitive engine
   * and are rendered only when expanded.
   */
  expandable: {
    theories: unknown[];
    beliefs: unknown[];
    mechanisms: unknown[];
    workspace: unknown[];
    evidence: unknown[];
  };
};