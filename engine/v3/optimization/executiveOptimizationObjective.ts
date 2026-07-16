import type {
  ExecutiveDecisionConstraint,
  ExecutiveDecisionTimeHorizon,
} from "../model/simulate/executiveDecision";

import type {
  OptimizationVariable,
} from "./optimizationVariable";

export type ExecutiveOptimizationSuccessTarget = {
  /**
   * Executive-facing success metric.
   */
  name: string;

  /**
   * Canonical condition measured by this target.
   */
  conditionId: string;

  baseline?: number;

  target?: number;

  unit?: string;

  rationale?: string;
};

export type ExecutiveOptimizationConstraint = {
  /**
   * Stable position of the source constraint on the Executive Decision.
   */
  sourceConstraintIndex: number;

  type:
    ExecutiveDecisionConstraint["type"];

  description: string;

  required: boolean;

  /**
   * Translation status records whether the constraint is currently
   * machine-evaluable.
   */
  translationStatus:
    | "structured"
    | "requires-interpretation"
    | "unsupported";
};

export type ExecutiveOptimizationPreference = {
  type:
    | "speed"
    | "confidence"
    | "risk"
    | "disruption"
    | "effort";

  direction:
    | "maximize"
    | "minimize";

  weight: number;

  rationale: string;
};

export type ExecutiveOptimizationTradeoffStrategy =
  | "balanced"
  | "maximize-objective-attainment"
  | "minimize-risk"
  | "maximize-confidence";

export type ExecutiveOptimizationObjective = {
  /**
   * Stable optimization-object identity.
   */
  id: string;

  /**
   * Executive Decision translated by this objective.
   */
  executiveDecisionId: string;

  organizationId: string;

  /**
   * Executive-facing statement of the desired outcome.
   */
  objective: string;

  /**
   * Period over which projected outcomes are evaluated.
   */
  timeHorizon:
    ExecutiveDecisionTimeHorizon;

  /**
   * Canonical organizational variables included in optimization.
   *
   * Variable selection, role, weighting, confidence, and network
   * relationships are produced by selectOptimizationVariables().
   */
  variables:
    OptimizationVariable[];

  /**
   * Measurable success criteria linked to organizational variables.
   */
  successTargets:
    ExecutiveOptimizationSuccessTarget[];

  /**
   * Constraints translated from the Executive Decision.
   */
  constraints:
    ExecutiveOptimizationConstraint[];

  /**
   * Soft preferences used to differentiate otherwise viable strategies.
   */
  preferences:
    ExecutiveOptimizationPreference[];

  tradeoffStrategy:
    ExecutiveOptimizationTradeoffStrategy;

  /**
   * Discovery's confidence that it translated the business problem
   * into the correct optimization problem.
   */
  confidence: number;

  /**
   * Important reasons the objective may be incomplete.
   */
  confidenceLimiters: string[];

  /**
   * Human-readable explanation of the optimization problem.
   */
  explanation: string;

  generatedAt: string;
};
