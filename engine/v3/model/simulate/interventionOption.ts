import type {
  OrganizationalInterventionScope,
  OrganizationalInterventionTimeHorizon,
  OrganizationalInterventionType,
} from "./organizationalIntervention";

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
   * Conditions this option is expected to affect directly.
   */
  targetConditionIds: string[];

  /**
   * Mechanisms this option is expected to activate,
   * weaken, remove, or change.
   */
  expectedMechanismIds: string[];

  /**
   * Executive decision constraints this option satisfies.
   */
  satisfiedConstraintIndexes: number[];

  /**
   * Executive decision constraints this option may violate
   * or require further evidence to evaluate.
   */
  unresolvedConstraintIndexes: number[];

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