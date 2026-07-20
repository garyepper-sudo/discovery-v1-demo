export type ExecutiveStoryStrategy = {
  /**
   * Stable identifier for the strategy when available.
   */
  id?: string;

  /**
   * Executive-facing strategy title.
   */
  title: string;

  /**
   * Deterministic scenario rank.
   */
  rank: number;

  /**
   * Whether this strategy became the canonical recommendation.
   */
  selected: boolean;

  /**
   * Concise explanation of the strategy's comparative position.
   */
  rationale: string;
};

export type ExecutiveStoryRecommendation = {
  /**
   * Stable identifier for the selected strategy when available.
   */
  id?: string;

  /**
   * Executive-facing recommendation title.
   */
  title: string;

  /**
   * Primary reason this strategy was selected.
   */
  rationale: string;

  /**
   * Why this strategy outperformed the alternatives.
   */
  comparativeAdvantage?: string;

  /**
   * Concrete executive actions supporting the recommendation.
   */
  actions: string[];
};

export type ExecutiveStoryConfidence = {
  /**
   * Normalized confidence percentage from 0 to 100.
   */
  score: number;

  /**
   * Plain-language interpretation of the confidence score.
   */
  level:
    | "low"
    | "moderate"
    | "high";

  /**
   * One concise explanation of why Discovery has this confidence.
   */
  summary: string;

  /**
   * Strongest reasons supporting confidence.
   */
  strengths: string[];

  /**
   * Most material confidence limitations.
   */
  limitations: string[];
};

export type ExecutiveStoryNextEvidence = {
  /**
   * Highest-value evidence request or executive question.
   */
  question: string;

  /**
   * Expected confidence improvement, expressed as percentage points.
   */
  expectedConfidenceGain?: number;

  /**
   * Organizational conditions expected to benefit from the evidence.
   */
  affectedConditions?: string[];
};

export type ExecutiveStoryOptimizationObjective = {
  /**
   * Stable identifier when available.
   */
  id?: string;

  /**
   * Executive-facing optimization objective.
   */
  summary: string;
};

export type ExecutiveStoryPrimaryConstraint = {
  /**
   * Stable identifier when available.
   */
  id?: string;

  /**
   * Executive-facing constraint title.
   */
  title: string;

  /**
   * Concise description of the constraint.
   */
  summary: string;

  /**
   * Why this constraint deserves immediate executive attention.
   */
  whyNow?: string;
};

export type ExecutiveStory = {
  /**
   * Highest-leverage organizational constraint.
   */
  primaryConstraint:
    ExecutiveStoryPrimaryConstraint;

  /**
   * Why this constraint deserves executive attention.
   */
  whyItMatters: string;

  /**
   * One concise causal explanation connecting the constraint,
   * mechanisms, organizational effects, and executive consequence.
   */
  causalStory: string;

  /**
   * Executive optimization objective used to compare strategies.
   */
  optimizationObjective?:
    ExecutiveStoryOptimizationObjective;

  /**
   * Strategies evaluated by the decision cycle.
   *
   * These remain deterministically ordered.
   */
  strategies:
    ExecutiveStoryStrategy[];

  /**
   * Canonical winning strategy.
   */
  recommendation:
    ExecutiveStoryRecommendation;

  /**
   * Concise description of the expected organizational improvement.
   */
  expectedOutcome: string;

  /**
   * Human-readable confidence interpretation.
   */
  confidence:
    ExecutiveStoryConfidence;

  /**
   * Highest-value evidence to collect next.
   */
  nextEvidence?:
    ExecutiveStoryNextEvidence;

  /**
   * Compact board-ready story shown by default before
   * progressive disclosure.
   */
  narrative: string;
};