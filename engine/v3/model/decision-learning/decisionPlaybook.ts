export type DecisionPlaybookEntryStatus =
  | "provisional"
  | "supported"
  | "canonical"
  | "retired";

export type DecisionPlaybookEntry = {
  /**
   * Stable identity for this reusable decision pattern.
   */
  id: string;

  /**
   * Organization whose decision history produced this entry.
   */
  organizationId: string;

  /**
   * Concise executive-facing name for the pattern.
   */
  title: string;

  /**
   * Decision types for which this guidance is relevant.
   */
  applicableDecisionTypes: string[];

  /**
   * Organizational conditions under which this guidance applies.
   */
  applicableConditionIds: string[];

  /**
   * Intervention categories supported by this pattern.
   */
  recommendedInterventionTypes: string[];

  /**
   * Intervention categories that should be avoided or treated cautiously.
   */
  discouragedInterventionTypes: string[];

  /**
   * Reusable executive guidance.
   */
  guidance: string;

  /**
   * Why Discovery believes this guidance is reusable.
   */
  rationale: string;

  /**
   * Constraints that commonly affect this pattern.
   */
  commonConstraintTypes: string[];

  /**
   * Assumptions that should be validated before applying the pattern.
   */
  requiredAssumptions: string[];

  /**
   * Evidence that would weaken or invalidate the pattern.
   */
  falsifyingEvidence: string[];

  /**
   * Decision-learning objects supporting this playbook entry.
   */
  supportingLearningIds: string[];

  /**
   * Decision outcomes supporting this playbook entry.
   */
  supportingOutcomeIds: string[];

  /**
   * Number of decision outcomes currently supporting the pattern.
   */
  supportCount: number;

  /**
   * Confidence that the pattern should influence future decisions.
   */
  confidence: number;

  /**
   * Whether the pattern is ready for reuse.
   */
  status:
    DecisionPlaybookEntryStatus;

  createdAt: string;

  updatedAt: string;
};

export type DecisionPlaybook = {
  /**
   * Organization whose reusable decision patterns are represented.
   */
  organizationId: string;

  /**
   * Reusable decision patterns synthesized from decision learning.
   */
  entries:
    DecisionPlaybookEntry[];

  /**
   * Human-readable summary of the current playbook.
   */
  summary: string;

  /**
   * Confidence in the playbook as a whole.
   */
  confidence: number;

  updatedAt: string;
};