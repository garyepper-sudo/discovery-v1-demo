export type ExecutiveDecisionOutcome = {
  /**
   * Stable identity for this decision outcome.
   */
  id: string;

  /**
   * Executive Decision being evaluated.
   */
  executiveDecisionId: string;

  /**
   * Organization that executed the decision.
   */
  organizationId: string;

  /**
   * Intervention that was ultimately implemented.
   */
  interventionId: string;

  /**
   * Timestamp at which the outcome was evaluated.
   */
  evaluatedAt: string;

  /**
   * Whether the intervention was actually executed.
   */
  executionStatus:
    | "planned"
    | "partial"
    | "completed"
    | "abandoned";

  /**
   * Overall executive assessment.
   */
  outcome:
    | "successful"
    | "partially-successful"
    | "unsuccessful"
    | "unknown";

  /**
   * Organizational conditions that improved.
   */
  improvedConditionIds: string[];

  /**
   * Organizational conditions that worsened.
   */
  worsenedConditionIds: string[];

  /**
   * Organizational conditions that remained stable.
   */
  unchangedConditionIds: string[];

  /**
   * Which executive success metrics were achieved.
   */
  achievedSuccessMetrics: string[];

  /**
   * Success metrics that were missed.
   */
  missedSuccessMetrics: string[];

  /**
   * Predictions that proved correct.
   */
  validatedPredictionIds: string[];

  /**
   * Predictions that proved incorrect.
   */
  invalidatedPredictionIds: string[];

  /**
   * Executive assumptions that proved correct.
   */
  validatedAssumptions: string[];

  /**
   * Executive assumptions that proved incorrect.
   */
  invalidatedAssumptions: string[];

  /**
   * Important unexpected organizational effects.
   */
  unexpectedEffects: string[];

  /**
   * Overall confidence that Discovery has accurately
   * evaluated the outcome.
   */
  confidence: number;

  /**
   * Executive summary of what actually happened.
   */
  summary: string;
};