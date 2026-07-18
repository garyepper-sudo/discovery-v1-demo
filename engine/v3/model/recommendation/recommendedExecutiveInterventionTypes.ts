import type {
  RecommendedExecutiveObjective,
} from "./recommendedExecutiveObjectiveTypes";

import type {
  RecommendedExecutiveStrategy,
} from "./recommendedExecutiveStrategyTypes";

export type RecommendedExecutiveInterventionType =
  | "work_portfolio_reduction"
  | "decision_authority_delegation"
  | "cross_functional_ownership_definition"
  | "knowledge_operating_system"
  | "priority_alignment_reset"
  | "operating_model_clarification";

export type RecommendedExecutiveIntervention = {
  id: string;

  headline: string;

  /**
   * The primary executive action selected from the primary strategy.
   */
  executiveIntervention: string;

  /**
   * Coordinated actions derived from supporting strategy items.
   *
   * These actions complement the primary intervention without creating
   * separate competing recommendations.
   */
  supportingActions: string[];

  interventionType:
    RecommendedExecutiveInterventionType;

  targetConditionId: string;

  targetConditionName: string;

  rationale: string;

  supportingObjectiveId: string;

  supportingStrategyId: string;

  supportingStrategyItemIds: string[];

  supportingConditionIds: string[];

  confidence: number;

  uncertaintySummary: string;

  boundaries: {
    doesNotOptimize: true;
    doesNotSimulate: true;
    doesNotSpecifyDetailedImplementationPlan: true;
  };

  objective:
    RecommendedExecutiveObjective;

  strategy:
    RecommendedExecutiveStrategy;

  createdAt: string;
};