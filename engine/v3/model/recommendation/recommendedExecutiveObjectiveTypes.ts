export type RecommendedExecutiveObjectiveType =
  | "increase"
  | "reduce"
  | "stabilize"
  | "clarify"
  | "align"
  | "protect"
  | "preserve";

export type RecommendedExecutiveObjectiveBoundaries = {
  doesNotRecommendStrategy: true;
  doesNotRecommendIntervention: true;
  doesNotOptimize: true;
  doesNotSimulate: true;
};

export type RecommendedExecutiveObjective = {
  id: string;

  headline: string;

  executiveObjective: string;

  objectiveType:
    RecommendedExecutiveObjectiveType;

  targetConditionId: string;

  targetConditionName: string;

  rationale: string;

  supportingAssessmentId: string;

  supportingPrimaryJudgmentId: string | null;

  supportingConditionIds: string[];

  confidence: number;

  uncertaintySummary: string;

  boundaries:
    RecommendedExecutiveObjectiveBoundaries;

  createdAt: string;
};
