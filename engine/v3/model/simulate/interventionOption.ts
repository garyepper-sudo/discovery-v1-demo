import type {
  OrganizationalInterventionScope,
  OrganizationalInterventionTimeHorizon,
  OrganizationalInterventionType,
} from "./organizationalIntervention";

export type InterventionExecutionLevel =
  | "low"
  | "moderate"
  | "high";

/**
 * Intrinsic execution characteristics of an intervention option.
 *
 * The profile is independent of the organization evaluating the option.
 * Feasibility combines these stable characteristics with the current
 * Executive Decision constraints.
 */
export type InterventionProfile = {
  organizationalScope:
    OrganizationalInterventionScope;

  implementationBurden:
    InterventionExecutionLevel;

  organizationalDisruption:
    InterventionExecutionLevel;

  reversibility:
    InterventionExecutionLevel;

  leadershipAttentionRequired:
    InterventionExecutionLevel;

  coordinationRequirement:
    InterventionExecutionLevel;

  expectedTimeToImpact:
    OrganizationalInterventionTimeHorizon;

  implementationRisk:
    InterventionExecutionLevel;

  preconditions: string[];
};

export type InterventionConstraintEvaluation = {
  /**
   * Zero-based index of the corresponding constraint on
   * the Executive Decision.
   */
  constraintIndex: number;

  /**
   * Current evaluation state for this option.
   */
  status:
    | "satisfied"
    | "violated"
    | "requires-simulation"
    | "insufficient-evidence";

  /**
   * Human-readable explanation of why this status was assigned.
   */
  explanation: string;
};

export type InterventionOption = {
  /**
   * Stable identity for this intervention option.
   */
  id: string;

  /**
   * Executive decision this option is intended to address.
   */
  executiveDecisionId: string;

  /**
   * Organization considering the option.
   */
  organizationId: string;

  /**
   * Broad intervention category.
   */
  type: OrganizationalInterventionType;

  /**
   * Concise executive-facing option name.
   */
  title: string;

  /**
   * Description of the proposed organizational change.
   */
  description: string;

  /**
   * Why Discovery believes this option could help achieve
   * the executive decision objective.
   */
  rationale: string;

  /**
   * Organizational scope affected by the option.
   */
  scope: OrganizationalInterventionScope;

  /**
   * Period over which the option should be evaluated.
   */
  timeHorizon: OrganizationalInterventionTimeHorizon;

  /**
   * Stable execution characteristics used to evaluate this option against
   * the current decision constraints.
   */
  profile: InterventionProfile;

  /**
   * Conditions this option is expected to affect directly.
   */
  targetConditionIds: string[];

  /**
   * Mechanisms this option is expected to activate,
   * weaken, remove, or change.
   */
  expectedMechanismIds: string[];

  /**
   * Explicit evaluation of every Executive Decision constraint.
   *
   * This replaces the earlier satisfied/unresolved index collections so
   * Discovery can distinguish definite violations, simulation-dependent
   * constraints, and constraints that lack sufficient evidence.
   */
  constraintEvaluations:
    InterventionConstraintEvaluation[];

  /**
   * Assumptions required for this intervention option
   * to produce the intended effect.
   */
  assumptions: string[];

  /**
   * Risks created by this option before simulation.
   */
  risks: string[];

  /**
   * Evidence Discovery needs before this option can be
   * simulated or recommended reliably.
   */
  missingEvidence: string[];

  /**
   * Discovery's confidence that this is a relevant and
   * viable option for the executive decision.
   *
   * This is not confidence in the simulated outcome.
   */
  confidence: number;

  createdAt: string;
};
