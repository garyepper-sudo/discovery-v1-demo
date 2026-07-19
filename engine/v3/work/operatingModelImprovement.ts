export type OperatingModelImprovementStatus =
  | "proposed"
  | "applied";

export type OperatingModelBeliefUpdate = {
  /**
   * Stable identifier of the belief being created or updated.
   */
  beliefId: string;

  /**
   * Whether this operation creates a new belief or updates an existing
   * belief in canonical Organizational Memory.
   */
  operation:
    | "create"
    | "update";

  /**
   * Canonical statement of the organizational belief.
   */
  statement: string;

  /**
   * Explanation for why this belief should be created or changed.
   */
  rationale: string;

  /**
   * Signed confidence adjustment produced by Executive Learning.
   *
   * Range: -1 to 1.
   */
  confidenceAdjustment: number;

  /**
   * Lifecycle ancestry supporting this belief update.
   */
  executiveLearningId: string;

  executiveReviewId: string;

  executiveWorkId: string;

  decisionRecordId: string;

  /**
   * Strategy whose observed outcomes produced this belief.
   *
   * Future Executive Decision cycles use this ancestry to determine
   * whether prior outcome learning applies to the strategy currently
   * being evaluated.
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
};

export type OperatingModelKnowledgeUpdate = {
  /**
   * Durable organizational knowledge produced by Executive Learning.
   */
  knowledge: string;

  /**
   * Whether this knowledge strengthens, weakens, or extends the
   * current Operating Model.
   */
  effect:
    | "strengthen"
    | "weaken"
    | "extend";

  /**
   * Explanation of how the knowledge should influence future
   * organizational cognition.
   */
  rationale: string;
};

export type OperatingModelRecommendationUpdate = {
  /**
   * Change that should influence future executive recommendations.
   */
  change: string;

  /**
   * Explanation of why the recommendation policy should change.
   */
  rationale: string;
};

export type OperatingModelImprovement = {
  /**
   * Canonical improvement identity.
   */
  id: string;

  /**
   * Organization whose Operating Model is being improved.
   */
  organizationId: string;

  /**
   * Executive Learning object that produced this improvement.
   */
  executiveLearningId: string;

  /**
   * Executive Review ancestry.
   */
  executiveReviewId: string;

  /**
   * Executive Work ancestry.
   */
  executiveWorkId: string;

  /**
   * Executive Decision ancestry.
   */
  decisionRecordId: string;

  /**
   * Executive summary of the proposed Operating Model improvement.
   */
  summary: string;

  /**
   * Durable knowledge changes proposed for organizational memory.
   */
  knowledgeUpdates: OperatingModelKnowledgeUpdate[];

  /**
   * Typed belief changes proposed for canonical Organizational Memory.
   */
  beliefUpdates: OperatingModelBeliefUpdate[];

  /**
   * Changes that should influence future recommendations.
   */
  recommendationUpdates: OperatingModelRecommendationUpdate[];

  /**
   * Whether the improvement is merely proposed or has been applied.
   */
  status: OperatingModelImprovementStatus;

  /**
   * Canonical time at which this improvement was created.
   */
  createdAt: string;

  /**
   * Canonical time at which this improvement was applied.
   */
  appliedAt?: string;
};