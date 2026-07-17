export type ExecutiveDecisionRecordStatus =
  | "draft"
  | "decided"
  | "in-progress"
  | "completed"
  | "cancelled";

export type ExecutiveDecisionDisposition =
  | "accepted-recommendation"
  | "modified-recommendation"
  | "selected-alternative"
  | "deferred"
  | "rejected";

export type ExecutiveDecisionOutcomeStatus =
  | "not-reviewed"
  | "successful"
  | "partially-successful"
  | "unsuccessful"
  | "inconclusive";

export type ExecutiveDecisionSuccessCriterion = {
  /**
   * Stable identifier for the criterion.
   */
  id: string;

  /**
   * Executive-readable description of the desired result.
   */
  name: string;

  /**
   * Organizational condition or metric being evaluated.
   */
  conditionId?: string;

  /**
   * Value observed when the decision was recorded.
   */
  baseline?: number;

  /**
   * Desired value following implementation.
   */
  target?: number;

  /**
   * Optional unit for the baseline and target.
   */
  unit?: string;

  /**
   * Why this criterion determines whether the decision worked.
   */
  rationale?: string;
};

export type ExecutiveDecisionExpectedOutcome = {
  /**
   * Stable identifier for the expected outcome.
   */
  id: string;

  /**
   * Executive-readable expected organizational result.
   */
  description: string;

  /**
   * Organizational conditions expected to change.
   */
  conditionIds: string[];

  /**
   * When the outcome should reasonably be observable.
   */
  timeHorizon?: string;

  /**
   * Discovery's confidence that this outcome will occur.
   */
  confidence?: number;
};

export type ExecutiveDecisionRecord = {
  /**
   * Stable identifier for the recorded executive decision.
   */
  id: string;

  /**
   * Client-generated identifier for one executive submission.
   *
   * Reusing the same submissionId for the same organization and
   * Executive Decision makes retries idempotent.
   */
  submissionId: string;

  /**
   * Organization that owns the decision.
   */
  organizationId: string;

  /**
   * Executive Decision object that initiated the analysis.
   */
  executiveDecisionId: string;

  /**
   * Optional identifier for the completed Executive Decision Cycle.
   */
  decisionCycleId?: string;

  /**
   * Current lifecycle status of the recorded decision.
   */
  status: ExecutiveDecisionRecordStatus;

  /**
   * How the executive responded to Discovery's recommendation.
   */
  disposition: ExecutiveDecisionDisposition;

  /**
   * Strategy selected by the executive.
   *
   * Undefined when the decision was deferred or rejected.
   */
  selectedOptionId?: string;

  /**
   * Scenario associated with the selected strategy.
   */
  selectedScenarioId?: string;

  /**
   * Recommendation produced by Discovery at decision time.
   */
  recommendedOptionId?: string;

  /**
   * Executive-readable title for the selected decision.
   */
  title: string;

  /**
   * The final action authorized by the executive.
   */
  decision: string;

  /**
   * Why the executive made this decision.
   */
  rationale: string;

  /**
   * Assumptions explicitly accepted by the executive.
   */
  acceptedAssumptions: string[];

  /**
   * Known risks accepted as part of the decision.
   */
  acceptedRisks: string[];

  /**
   * Discovery's calibrated confidence when the recommendation was made.
   */
  discoveryConfidenceAtDecision?: number;

  /**
   * Executive's own confidence when recording the decision.
   */
  executiveConfidenceAtDecision?: number;

  /**
   * Outcomes expected from the selected intervention.
   */
  expectedOutcomes: ExecutiveDecisionExpectedOutcome[];

  /**
   * Criteria that will later be used to evaluate the decision.
   */
  successCriteria: ExecutiveDecisionSuccessCriterion[];

  /**
   * Person accountable for executing the decision.
   */
  owner?: string;

  /**
   * Person who authorized the decision.
   */
  decisionMaker?: string;

  /**
   * ISO timestamp when the decision was recorded.
   */
  decidedAt?: string;

  /**
   * ISO timestamp when the decision should be reviewed.
   */
  reviewAt?: string;

  /**
   * ISO timestamp when the record was created.
   */
  createdAt: string;

  /**
   * ISO timestamp when the record was last updated.
   */
  updatedAt: string;

  /**
   * Outcome state remains unreviewed until a later decision review.
   */
  outcomeStatus: ExecutiveDecisionOutcomeStatus;
};
