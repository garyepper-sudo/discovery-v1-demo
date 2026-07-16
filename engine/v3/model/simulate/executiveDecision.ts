import type {
  OrganizationalInterventionType,
} from "./organizationalIntervention";

export type ExecutiveDecisionType =
  | "growth"
  | "cost"
  | "execution"
  | "organization-design"
  | "governance"
  | "risk"
  | "market"
  | "product"
  | "technology"
  | "people"
  | "custom";

export type ExecutiveDecisionStatus =
  | "exploring"
  | "under-review"
  | "ready"
  | "approved"
  | "decided"
  | "implemented"
  | "cancelled";

export type ExecutiveDecisionTimeHorizon =
  | "immediate"
  | "near-term"
  | "medium-term"
  | "long-term";

export type ExecutiveDecisionSuccessMetric = {
  /**
   * Executive-facing measure used to judge whether
   * the decision produced the desired outcome.
   */
  name: string;

  /**
   * Canonical organizational condition measured by this
   * success criterion.
   *
   * This creates a stable machine-readable link between
   * the executive metric and simulated condition movement.
   */
  targetConditionId?: string;

  /**
   * Optional current or baseline value.
   */
  baseline?: number;

  /**
   * Optional desired future value.
   */
  target?: number;

  /**
   * Optional unit such as percent, days, dollars, or score.
   */
  unit?: string;

  /**
   * Why this metric matters to the decision.
   */
  rationale?: string;
};

export type ExecutiveDecisionConstraint = {
  /**
   * Constraint category.
   */
  type:
    | "budget"
    | "time"
    | "capacity"
    | "risk"
    | "regulatory"
    | "people"
    | "technology"
    | "strategic"
    | "custom";

  /**
   * Human-readable constraint.
   */
  description: string;

  /**
   * Whether the constraint is mandatory.
   */
  required: boolean;
};

export type ExecutiveDecision = {
  /**
   * Stable identity for this executive decision.
   */
  id: string;

  /**
   * Organization making the decision.
   */
  organizationId: string;

  /**
   * Broad executive decision category.
   */
  type: ExecutiveDecisionType;

  /**
   * Concise executive-facing decision name.
   */
  title: string;

  /**
   * The outcome leadership wants to achieve.
   */
  objective: string;

  /**
   * Why this decision matters now.
   */
  rationale: string;

  /**
   * Current decision lifecycle status.
   */
  status: ExecutiveDecisionStatus;

  /**
   * Period over which the desired outcome should be evaluated.
   */
  timeHorizon: ExecutiveDecisionTimeHorizon;

  /**
   * Conditions leadership wants to improve, preserve, or avoid worsening.
   */
  targetConditionIds: string[];

  /**
   * Criteria used to determine whether the decision succeeds.
   */
  successMetrics:
    ExecutiveDecisionSuccessMetric[];

  /**
   * Constraints that candidate interventions must respect.
   */
  constraints:
    ExecutiveDecisionConstraint[];

  /**
   * Intervention categories Discovery should consider.
   */
  allowedInterventionTypes:
    OrganizationalInterventionType[];

  /**
   * Assumptions underlying the decision.
   */
  assumptions: string[];

  /**
   * Executive questions that remain unresolved.
   */
  openQuestions: string[];

  /**
   * Discovery's confidence that it understands the
   * decision objective and constraints correctly.
   *
   * This is not confidence in any simulated outcome.
   */
  confidence: number;

  createdAt: string;

  updatedAt: string;
};
