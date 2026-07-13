export type OrganizationalPredictionStatus =
  | "proposed"
  | "active"
  | "strengthening"
  | "weakening"
  | "confirmed"
  | "falsified"
  | "expired"
  | "retired";

export type OrganizationalPredictionType =
  | "continuation"
  | "deterioration"
  | "improvement"
  | "propagation";

export type OrganizationalPredictionTimeHorizon =
  | "immediate"
  | "near-term"
  | "medium-term"
  | "long-term"
  | "unknown";

export type OrganizationalPredictionSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type OrganizationalPredictionConditionChange = {
  /**
   * Condition expected to change.
   */
  conditionId: string;

  /**
   * Expected direction of change.
   */
  direction:
    | "improving"
    | "deteriorating"
    | "stable"
    | "constrained"
    | "uncertain";

  /**
   * Predicted future condition status when one can be inferred.
   */
  predictedStatus?:
    | "stable"
    | "emerging"
    | "improving"
    | "deteriorating"
    | "constrained"
    | "weak"
    | "unresolved";

  /**
   * Discovery's confidence in this specific projected change.
   */
  confidence: number;

  /**
   * Explanation of why this condition is expected to change.
   */
  explanation: string;
};

export type OrganizationalPrediction = {
  /**
   * Stable identity for the prediction across investigations.
   */
  id: string;

  /**
   * Concise future-state claim.
   */
  statement: string;

  /**
   * Executive-facing summary of the predicted outcome.
   */
  summary: string;

  /**
   * Kind of future-state reasoning represented by this prediction.
   */
  predictionType: OrganizationalPredictionType;

  /**
   * How strongly Discovery trusts the reasoning and evidence
   * behind the prediction.
   *
   * Stored as a normalized value from 0 to 1.
   */
  confidence: number;

  /**
   * How probable Discovery believes the predicted outcome is.
   *
   * Stored as a normalized value from 0 to 1.
   */
  likelihood: number;

  /**
   * Estimated seriousness of the predicted outcome.
   */
  severity: OrganizationalPredictionSeverity;

  /**
   * Qualitative future horizon.
   */
  timeHorizon: OrganizationalPredictionTimeHorizon;

  /**
   * Current lifecycle state.
   */
  status: OrganizationalPredictionStatus;

  /**
   * Conditions directly supporting the prediction.
   */
  sourceConditionIds: string[];

  /**
   * Concepts supporting the prediction.
   */
  sourceConceptIds: string[];

  /**
   * Theories supporting the prediction.
   */
  sourceTheoryIds: string[];

  /**
   * Beliefs supporting the prediction.
   */
  sourceBeliefIds: string[];

  /**
   * Expected changes to organizational conditions.
   */
  predictedConditionChanges: OrganizationalPredictionConditionChange[];

  /**
   * Ordered causal path from present state to predicted outcome.
   *
   * Each entry should be a stable cognitive object ID when possible.
   */
  causalPath: string[];

  /**
   * Assumptions that must remain true for the prediction to hold.
   */
  assumptions: string[];

  /**
   * Current limitations on prediction confidence.
   */
  confidenceLimiters: string[];

  /**
   * Evidence that would weaken or falsify the prediction.
   */
  falsifyingEvidence: string[];

  /**
   * Explanation of how Discovery formed the prediction.
   */
  explanation: string;

  /**
   * Timestamp when the prediction was first created.
   */
  createdAt: string;

  /**
   * Timestamp when the prediction was most recently evaluated.
   */
  lastEvaluatedAt: string;

  /**
   * Optional timestamp after which the prediction should be
   * reconsidered or treated as expired.
   */
  expiresAt?: string;
};