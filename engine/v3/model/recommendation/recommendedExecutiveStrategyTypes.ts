import type {
  RecommendedExecutiveObjective,
} from "./recommendedExecutiveObjectiveTypes";

export type RecommendedExecutiveStrategyTheme =
  | "reduce_competing_work"
  | "clarify_decision_rights"
  | "protect_execution_focus"
  | "strengthen_coordination"
  | "preserve_knowledge"
  | "align_priorities"
  | "stabilize_operating_model";

export type RecommendedExecutiveStrategyItem = {
  id: string;

  theme:
    RecommendedExecutiveStrategyTheme;

  headline: string;

  strategicDirection: string;

  rationale: string;

  supportingConditionIds: string[];

  priority:
    "primary"
    | "supporting";

  confidence: number;
};

export type RecommendedExecutiveStrategyBoundaries = {
  doesNotSelectIntervention: true;
  doesNotSpecifyImplementation: true;
  doesNotOptimize: true;
  doesNotSimulate: true;
};

export type RecommendedExecutiveStrategy = {
  id: string;

  headline: string;

  executiveStrategy: string;

  objective:
    RecommendedExecutiveObjective;

  strategies:
    RecommendedExecutiveStrategyItem[];

  supportingAssessmentId: string;

  supportingObjectiveId: string;

  confidence: number;

  uncertaintySummary: string;

  boundaries:
    RecommendedExecutiveStrategyBoundaries;

  createdAt: string;
};
