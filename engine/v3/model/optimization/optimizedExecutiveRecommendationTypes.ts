import type {
  ExecutiveRecommendation,
} from "../recommendation/executiveRecommendationTypes";

import type {
  ExecutiveOptimizationRanking,
} from "./executiveOptimizationRankingTypes";

export type OptimizedExecutiveRecommendation = {
  id: string;

  organizationId:
    string;

  sourceRecommendationId:
    string;

  sourceRankingId:
    string;

  originalRecommendation:
    ExecutiveRecommendation;

  optimizationRanking:
    ExecutiveOptimizationRanking;

  headline:
    string;

  executiveRecommendation:
    string;

  preferredOptionId:
    string;

  preferredProfile:
    string;

  objective: {
    headline:
      string;

    targetConditionId:
      string;
  };

  optimizedPlan: {
    scope:
      string;

    sequence:
      string;

    timing:
      string;

    resourceAllocation:
      string;

    decisionRights:
      string;

    coordinationLoad:
      string;

    implementationIntensity:
      string;
  };

  whyPreferred:
    string;

  bindingConstraintIds:
    string[];

  violatedConstraintIds:
    string[];

  expectedTradeoffs:
    string[];

  expectedValue:
    number;

  feasibilityScore:
    number;

  finalScore:
    number;

  confidence:
    number;

  uncertaintySummary:
    string;

  boundaries: {
    preservesOriginalRecommendation:
      true;

    doesNotRecordExecutiveDecision:
      true;

    doesNotSimulate:
      true;

    doesNotExecuteIntervention:
      true;
  };

  createdAt:
    string;
};
