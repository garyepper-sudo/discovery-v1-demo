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

export type ExecutiveNarrativeMomentum =
  | "improving"
  | "stable"
  | "declining";

export type ExecutiveNarrativeLifecycle =
  | "emerging"
  | "active"
  | "strengthening"
  | "stable"
  | "weakening"
  | "resolved";

export type ExecutiveNarrativeContinuityStatus =
  | "new"
  | "continuing"
  | "changed"
  | "stable"
  | "resolved";

export type ExecutiveNarrativeRevision = {
  investigationId?: string;
  timestamp: string;
  headline: string;
  confidence?: number;
  momentum?: ExecutiveNarrativeMomentum;
  summary: string;
};

export type ExecutiveNarrativeContinuity = {
  status: ExecutiveNarrativeContinuityStatus;
  lifecycle: ExecutiveNarrativeLifecycle;
  previousHeadline?: string;
  previousConfidence?: number;
  confidenceDelta?: number;
  whatChanged: string[];
  whyChanged: string[];
  history: ExecutiveNarrativeRevision[];
};

/**
 * Sprint 51
 *
 * Describes how Discovery's explanation of the organization evolved.
 * This does not create new cognition. It interprets existing executive
 * understanding through a mental-model-evolution lens.
 */
export type ExecutiveMentalModelEvolution = {
  currentExplanation: string;
  explanationChanged: string;
  confidenceChanged: string;
  weakenedExplanations: string[];
  remainingUncertainty: string;
  whatCouldChangeDiscoverysMind: string;
};

export type ExecutiveNarrative = {
  id: string;
  headline: string;
  observation: string;
  businessImpact: string;
  executiveConversation: string;
  supportingReasoning?: string;
  evidence?: unknown[];
  priority?: ExecutiveAttentionPriority;
  confidence?: number;
  momentum?: ExecutiveNarrativeMomentum;

  /**
   * Sprint 47
   */
  continuity?: ExecutiveNarrativeContinuity;

  /**
   * Sprint 51
   *
   * Explains how Discovery's internal explanation evolved rather than
   * simply reporting what Discovery observed.
   */
  mentalModelEvolution?: ExecutiveMentalModelEvolution;
};

export type ExecutiveState = {
  generatedAt: string;
  headline: string;
  summary: string;
  organizationConfidence?: number;
  status?: "improving" | "stable" | "watch" | "critical";
  lastInvestigation?: string;

  metrics: ExecutiveMetricCard[];
  executiveNarratives: ExecutiveNarrative[];

  currentUnderstanding: ExecutiveUnderstandingItem[];
  whatChanged: ExecutiveChangeItem[];
  leadershipAttention: ExecutiveAttentionItem[];
  learningTimeline: ExecutiveTimelineEntry[];
  nextRecommendedAction?: ExecutiveRecommendedAction;

  expandable: {
    theories: unknown[];
    beliefs: unknown[];
    mechanisms: unknown[];
    workspace: unknown[];
    evidence: unknown[];
  };
};