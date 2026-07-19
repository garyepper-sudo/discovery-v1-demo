export type ExecutiveReviewStatus =
  | "successful"
  | "partially-successful"
  | "unsuccessful"
  | "inconclusive";

export type ExecutiveObservedOutcome = {
  expectedOutcomeId: string;

  observation: string;

  achieved: boolean | null;

  confidence: number;
};

export type ExecutiveReview = {
  /**
   * Canonical Executive Review identity.
   */
  id: string;

  /**
   * Organization that owns this review.
   */
  organizationId: string;

  /**
   * Executive Work that was reviewed.
   */
  executiveWorkId: string;

  /**
   * Executive Decision Record that originated the work.
   */
  decisionRecordId: string;

  /**
   * Strategy actually selected by the executive.
   *
   * This ancestry allows longitudinal learning to determine whether
   * future decisions are evaluating the same strategy.
   */
  selectedOptionId: string;

  /**
   * Scenario associated with the selected strategy.
   */
  selectedScenarioId?: string;

  /**
   * Strategy originally recommended by Discovery.
   */
  recommendedOptionId?: string;

  /**
   * Canonical review outcome.
   */
  status: ExecutiveReviewStatus;

  /**
   * Observed organizational outcomes compared against the expected
   * outcomes established when the work was committed.
   */
  observedOutcomes:
    ExecutiveObservedOutcome[];

  /**
   * Executive-readable summary of the review.
   */
  summary: string;

  /**
   * Canonical review timestamp.
   */
  reviewedAt: string;
};