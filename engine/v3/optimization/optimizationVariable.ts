export type OptimizationVariableRole =
  | "primary"
  | "secondary"
  | "protected";

export type OptimizationVariableObjective =
  | "improve"
  | "preserve"
  | "reduce";

export type OptimizationVariable = {
  /**
   * Canonical Organizational Condition identity.
   */
  conditionId: string;

  /**
   * Executive-facing variable name.
   */
  name: string;

  /**
   * Role the variable plays in the optimization problem.
   */
  role:
    OptimizationVariableRole;

  /**
   * Desired direction of movement.
   */
  objective:
    OptimizationVariableObjective;

  /**
   * Normalized importance between 0 and 1.
   */
  weight: number;

  /**
   * How much of the weight came from explicit executive intent.
   */
  executivePriorityScore: number;

  /**
   * Importance inferred from the condition’s canonical priority.
   */
  conditionPriorityScore: number;

  /**
   * Importance inferred from the condition’s position in the
   * organizational system.
   */
  networkInfluenceScore: number;

  /**
   * Confidence that this condition belongs in the optimization problem.
   */
  selectionConfidence: number;

  /**
   * Why Discovery selected and weighted this variable.
   */
  rationale: string;

  /**
   * Canonical relationships retained for downstream optimization.
   */
  upstreamConditionIds: string[];

  downstreamConditionIds: string[];
};