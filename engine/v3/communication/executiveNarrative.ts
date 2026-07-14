export type ExecutiveNarrativeSignal = {
  id: string;

  /**
   * Executive-facing statement of the supporting signal.
   */
  statement: string;

  /**
   * Optional explanation available through progressive disclosure.
   */
  explanation?: string;
};

export type ExecutiveNarrativeChange = {
  id: string;

  label: string;

  direction:
    | "improving"
    | "worsening"
    | "stable";

  summary: string;
};

export type ExecutiveNarrativeForecast = {
  /**
   * The single most important future-state conclusion.
   */
  headline: string;

  confidence: number;

  timeHorizon?: string;

  /**
   * Concise explanation of why Discovery expects this outcome.
   */
  explanation?: string;
};

export type ExecutiveNarrativeRecommendation = {
  /**
   * The single highest-priority action leadership should take.
   */
  headline: string;

  /**
   * Supporting actions that make the recommendation operational.
   */
  actions: string[];

  /**
   * Why this is the recommended course of action.
   */
  rationale?: string;

  /**
   * Highest-value investigation that could improve or change the advice.
   */
  recommendedInvestigation?: string;

  decisionHref?: string;
};

export type ExecutiveNarrativeEvidenceSection = {
  id:
    | "judgment"
    | "organizational-state"
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

export type ExecutiveNarrative = {
  /**
   * One executive conclusion describing what is happening and why it matters.
   *
   * This should be written in natural executive language rather than using
   * internal cognitive object names.
   */
  headline: string;

  /**
   * One short paragraph expanding the headline.
   */
  executiveSummary: string;

  /**
   * Confidence in the current executive judgment.
   */
  confidence: number;

  /**
   * Three or fewer concise signals explaining the judgment.
   */
  why: ExecutiveNarrativeSignal[];

  /**
   * Highest-priority organizational changes.
   */
  changes: ExecutiveNarrativeChange[];

  /**
   * Most important future outlook.
   */
  forecast: ExecutiveNarrativeForecast;

  /**
   * Highest-priority recommended action.
   */
  recommendation: ExecutiveNarrativeRecommendation;

  /**
   * Detailed cognition retained for progressive disclosure.
   */
  evidenceSections: ExecutiveNarrativeEvidenceSection[];
};