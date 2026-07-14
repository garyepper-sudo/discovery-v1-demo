export type ExecutiveCommunicationConfidence = {
  /**
   * Confidence in the executive conclusion, normalized between 0 and 1.
   */
  value: number;

  /**
   * Executive-facing interpretation of the confidence level.
   */
  label:
    | "low"
    | "developing"
    | "moderate"
    | "high";

  /**
   * Most important reasons confidence is limited.
   */
  limiters: string[];
};

export type ExecutiveCommunicationSignal = {
  /**
   * Stable identity for this supporting signal.
   */
  id: string;

  /**
   * Concise executive-facing observation.
   *
   * Example:
   * "Routine decisions are taking longer to resolve."
   */
  statement: string;

  /**
   * Why the signal matters to the executive conclusion.
   */
  implication?: string;

  /**
   * Cognitive objects supporting the signal.
   */
  supportingConditionIds: string[];

  supportingBeliefIds: string[];

  supportingMechanismIds: string[];

  supportingTheoryIds: string[];

  supportingEvidenceIds: string[];
};

export type ExecutiveCommunicationChange = {
  /**
   * Organizational entity or condition that changed.
   */
  entityId: string;

  /**
   * Executive-facing name.
   */
  label: string;

  /**
   * Direction of meaningful change.
   */
  direction:
    | "improving"
    | "worsening"
    | "stable";

  /**
   * Concise explanation of the change.
   */
  statement: string;

  /**
   * Confidence in the change assessment, normalized between 0 and 1.
   */
  confidence: number;
};

export type ExecutiveCommunicationForecast = {
  /**
   * Single most important future-state conclusion.
   */
  headline: string;

  /**
   * Why this outcome is expected.
   */
  explanation: string;

  /**
   * Confidence in the forecast, normalized between 0 and 1.
   */
  confidence: number;

  /**
   * Relative future horizon.
   */
  timeHorizon:
    | "immediate"
    | "near-term"
    | "medium-term"
    | "long-term";

  /**
   * Organizational conditions most likely to be affected.
   */
  affectedConditionIds: string[];

  /**
   * Evidence or events that would invalidate the forecast.
   */
  falsifyingSignals: string[];
};

export type ExecutiveCommunicationRecommendation = {
  /**
   * Highest-priority executive action.
   */
  headline: string;

  /**
   * Supporting actions that make the recommendation operational.
   */
  actions: string[];

  /**
   * Why this course of action is preferred.
   */
  rationale: string;

  /**
   * Important risks or trade-offs leadership should monitor.
   */
  tradeOffs: string[];

  /**
   * Assumptions supporting the recommendation.
   */
  assumptions: string[];

  /**
   * Evidence or changing circumstances that could alter the recommendation.
   */
  evidenceThatCouldChangeRecommendation: string[];

  /**
   * Optional route into the canonical Executive Decision experience.
   */
  decisionHref?: string;
};

export type ExecutiveCommunicationUncertainty = {
  /**
   * Most important unresolved executive question.
   */
  question: string;

  /**
   * Why the uncertainty matters.
   */
  implication: string;

  /**
   * Highest-value investigation for reducing the uncertainty.
   */
  recommendedInvestigation?: string;

  /**
   * Estimated confidence improvement if the investigation succeeds.
   */
  expectedConfidenceGain?: number;
};

export type ExecutiveCommunicationEvidenceSection = {
  id:
    | "judgment"
    | "organizational-state"
    | "conditions"
    | "learning"
    | "forecast"
    | "recommendation";

  title: string;

  summary: string;

  content: string;

  metrics?: Array<{
    label: string;

    value: string;
  }>;
};

export type ExecutiveCommunication = {
  /**
   * Stable identity for this executive communication product.
   */
  id: string;

  /**
   * Organization being communicated about.
   */
  organizationId: string;

  /**
   * One executive conclusion describing what is happening and why it matters.
   *
   * This must use natural executive language rather than internal object names.
   */
  headline: string;

  /**
   * One short paragraph expanding the executive conclusion.
   */
  executiveSummary: string;

  /**
   * Confidence in the current executive conclusion.
   */
  confidence: ExecutiveCommunicationConfidence;

  /**
   * Three or fewer concise signals supporting the conclusion.
   */
  supportingSignals: ExecutiveCommunicationSignal[];

  /**
   * Highest-priority changes since the previous organizational state.
   */
  meaningfulChanges: ExecutiveCommunicationChange[];

  /**
   * Most important expected future outcome.
   */
  forecast: ExecutiveCommunicationForecast;

  /**
   * Highest-priority executive action.
   */
  recommendation: ExecutiveCommunicationRecommendation;

  /**
   * Most important unresolved uncertainty.
   */
  uncertainty?: ExecutiveCommunicationUncertainty;

  /**
   * Detailed cognition retained for progressive disclosure.
   */
  evidenceSections: ExecutiveCommunicationEvidenceSection[];

  /**
   * Timestamp at which the communication product was synthesized.
   */
  generatedAt: string;
};