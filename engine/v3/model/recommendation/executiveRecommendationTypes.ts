import type {
  RecommendedExecutiveObjective,
} from "./recommendedExecutiveObjectiveTypes";

import type {
  RecommendedExecutiveStrategy,
} from "./recommendedExecutiveStrategyTypes";

import type {
  RecommendedExecutiveIntervention,
} from "./recommendedExecutiveInterventionTypes";

export type ExecutiveRecommendation = {
  id: string;

  headline: string;

  executiveRecommendation: string;

  objective:
    RecommendedExecutiveObjective;

  strategy:
    RecommendedExecutiveStrategy;

  intervention:
    RecommendedExecutiveIntervention;

  rationale: string;

  supportingAssessmentId: string;

  supportingConditionIds: string[];

  confidence: number;

  uncertaintySummary: string;

  boundaries: {
    doesNotOptimize: true;
    doesNotSimulate: true;
    doesNotProduceImplementationPlan: true;
  };

  createdAt: string;
};
