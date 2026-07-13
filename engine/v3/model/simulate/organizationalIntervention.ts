export type OrganizationalInterventionType =
  | "hiring"
  | "layoff"
  | "reorganization"
  | "governance"
  | "strategy"
  | "budget"
  | "technology"
  | "policy"
  | "market"
  | "customer"
  | "custom";

export type OrganizationalInterventionScope =
  | "team"
  | "department"
  | "organization";

export type OrganizationalInterventionTimeHorizon =
  | "immediate"
  | "near-term"
  | "medium-term"
  | "long-term";

export type OrganizationalInterventionStatus =
  | "hypothetical"
  | "under-consideration"
  | "approved"
  | "committed"
  | "implemented"
  | "cancelled";

export type OrganizationalIntervention = {
  /**
   * Stable identity for the intervention.
   */
  id: string;

  /**
   * Organization whose future is being changed.
   */
  organizationId: string;

  /**
   * Broad intervention category.
   */
  type: OrganizationalInterventionType;

  /**
   * Concise executive-facing name.
   */
  title: string;

  /**
   * Description of the intentional organizational change.
   */
  description: string;

  /**
   * Why leadership is considering or taking this action.
   */
  rationale: string;

  /**
   * Organizational scope affected by the intervention.
   */
  scope: OrganizationalInterventionScope;

  /**
   * Relative time horizon over which effects should be evaluated.
   */
  timeHorizon: OrganizationalInterventionTimeHorizon;

  /**
   * Whether this is exploratory, approved, committed, or implemented.
   */
  status: OrganizationalInterventionStatus;

  /**
   * Current organizational conditions directly targeted.
   */
  affectedConditionIds: string[];

  /**
   * Organizational beliefs that may be directly challenged or reinforced.
   */
  affectedBeliefIds: string[];

  /**
   * Mechanisms expected to activate, weaken, or change.
   */
  expectedMechanismIds: string[];

  /**
   * Assumptions required for the scenario to hold.
   */
  assumptions: string[];

  /**
   * Discovery's confidence that the intervention is represented accurately.
   *
   * This is not confidence in the simulated outcome.
   */
  confidence: number;

  /**
   * When the intervention object was created.
   */
  createdAt: string;

  /**
   * When the intervention was most recently updated.
   */
  updatedAt: string;
};