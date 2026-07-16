export type ExecutiveDecisionReflection = {
  /**
   * Stable identity for this reflection.
   */
  id: string;

  /**
   * Decision outcome being interpreted.
   */
  executiveDecisionOutcomeId: string;

  /**
   * Overall assessment of Discovery's decision quality.
   */
  assessment:
    | "validated"
    | "partially-validated"
    | "invalidated";

  /**
   * Why Discovery reached this assessment.
   */
  rationale: string;

  /**
   * Predictions that proved accurate.
   */
  validatedPredictions: string[];

  /**
   * Predictions that proved inaccurate.
   */
  invalidatedPredictions: string[];

  /**
   * Assumptions that proved correct.
   */
  validatedAssumptions: string[];

  /**
   * Assumptions that proved incorrect.
   */
  invalidatedAssumptions: string[];

  /**
   * Unexpected organizational behaviors that emerged.
   */
  unexpectedFindings: string[];

  /**
   * Organizational mechanisms Discovery now trusts more.
   */
  reinforcedMechanismIds: string[];

  /**
   * Organizational mechanisms whose confidence should decrease.
   */
  weakenedMechanismIds: string[];

  /**
   * Organizational theories strengthened by the outcome.
   */
  reinforcedTheoryIds: string[];

  /**
   * Organizational theories weakened by the outcome.
   */
  weakenedTheoryIds: string[];

  /**
   * Highest-value lesson from this decision.
   */
  keyLearning: string;

  /**
   * Recommendation for future executive decisions.
   */
  futureRecommendation: string;

  /**
   * Confidence in the reflection itself.
   */
  confidence: number;

  createdAt: string;
};