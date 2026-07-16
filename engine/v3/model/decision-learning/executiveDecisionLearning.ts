export type ExecutiveDecisionLearningType =
  | "intervention-effectiveness"
  | "constraint-validity"
  | "prediction-quality"
  | "assumption-quality"
  | "mechanism-validity"
  | "theory-validity"
  | "decision-pattern"
  | "other";

export type ExecutiveDecisionLearning = {
  /**
   * Stable identity for this learning object.
   */
  id: string;

  /**
   * Organization whose decision history produced the learning.
   */
  organizationId: string;

  /**
   * Reflection that produced this learning.
   */
  executiveDecisionReflectionId: string;

  /**
   * Executive Decision that ultimately produced this learning.
   */
  executiveDecisionId: string;

  /**
   * Broad category of learning.
   */
  type:
    ExecutiveDecisionLearningType;

  /**
   * Concise reusable lesson.
   */
  statement: string;

  /**
   * Why this lesson should influence future decisions.
   */
  rationale: string;

  /**
   * Intervention categories to which this learning applies.
   */
  applicableInterventionTypes: string[];

  /**
   * Organizational conditions to which this learning applies.
   */
  applicableConditionIds: string[];

  /**
   * Constraints whose interpretation should change.
   */
  applicableConstraintTypes: string[];

  /**
   * Organizational mechanisms reinforced by this learning.
   */
  reinforcedMechanismIds: string[];

  /**
   * Organizational mechanisms weakened by this learning.
   */
  weakenedMechanismIds: string[];

  /**
   * Organizational theories reinforced by this learning.
   */
  reinforcedTheoryIds: string[];

  /**
   * Organizational theories weakened by this learning.
   */
  weakenedTheoryIds: string[];

  /**
   * Expected effect on future recommendation confidence.
   */
  confidenceAdjustment: number;

  /**
   * Confidence in the learning itself.
   */
  confidence: number;

  /**
   * Number of decision outcomes currently supporting this learning.
   */
  supportCount: number;

  /**
   * Whether the lesson is still provisional or ready for reuse.
   */
  status:
    | "provisional"
    | "supported"
    | "canonical"
    | "weakened"
    | "retired";

  createdAt: string;

  updatedAt: string;
};