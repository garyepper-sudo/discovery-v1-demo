export type ExecutiveLearning = {
  /**
   * Canonical learning identity.
   */
  id: string;

  /**
   * Organization that owns this learning.
   */
  organizationId: string;

  /**
   * Review that produced this learning.
   */
  executiveReviewId: string;

  /**
   * Executive Work item reviewed.
   */
  executiveWorkId: string;

  /**
   * Original committed decision.
   */
  decisionRecordId: string;

  /**
   * Strategy whose observed outcomes produced this learning.
   *
   * This ancestry allows future Executive Decision cycles to determine
   * whether they are evaluating a strategy that has previously succeeded
   * or failed.
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
   * Executive summary of what Discovery learned.
   */
  summary: string;

  /**
   * Adjustment to Discovery's confidence.
   *
   * Range: -1 to 1.
   */
  confidenceAdjustment: number;

  /**
   * Durable organizational knowledge produced by the review.
   */
  organizationalKnowledge: string[];

  /**
   * Changes that should influence future recommendations.
   */
  futureRecommendationChanges: string[];

  /**
   * Canonical learning timestamp.
   */
  learnedAt: string;
};