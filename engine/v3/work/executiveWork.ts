import type {
  ExecutiveDecisionExpectedOutcome,
  ExecutiveDecisionSuccessCriterion,
} from "../decisions/executiveDecisionRecord";

export type ExecutiveWorkStatus =
  | "not-started"
  | "in-progress"
  | "blocked"
  | "completed"
  | "cancelled";

export type ExecutiveWorkHealth =
  | "unknown"
  | "on-track"
  | "at-risk"
  | "off-track";

export type ExecutiveWork = {
  /**
   * Canonical Executive Work identity.
   */
  id: string;

  /**
   * Organization that owns this work item.
   */
  organizationId: string;

  /**
   * Decision from which this work item originated.
   */
  decisionRecordId: string;

  /**
   * Strategy selected by the executive when the decision was committed.
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
   * Human-readable work title.
   */
  title: string;

  /**
   * Executive owner responsible for execution.
   */
  owner: string;

  /**
   * Current execution status.
   */
  status: ExecutiveWorkStatus;

  /**
   * Executive assessment of execution health.
   */
  health: ExecutiveWorkHealth;

  /**
   * Completion percentage.
   *
   * Range: 0–1.
   */
  progress: number;

  /**
   * Expected outcomes established when the decision was committed.
   * These remain canonical and are later compared against observed
   * outcomes during Executive Review.
   */
  expectedOutcomes:
    ExecutiveDecisionExpectedOutcome[];

  /**
   * Canonical success criteria inherited from the decision record.
   */
  successCriteria:
    ExecutiveDecisionSuccessCriterion[];

  /**
   * Scheduled review date.
   */
  reviewAt: string;

  /**
   * Creation timestamp.
   */
  createdAt: string;

  /**
   * Last execution update.
   */
  updatedAt: string;
};