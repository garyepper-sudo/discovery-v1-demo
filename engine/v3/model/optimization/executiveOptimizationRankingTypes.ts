import type {
  ExecutiveOptimizationOptionScore,
  ExecutiveOptimizationScoreSet,
} from "./executiveOptimizationScoreTypes";

export type ExecutiveOptimizationRankedOption = {
  rank: number;

  score:
    ExecutiveOptimizationOptionScore;

  feasible:
    boolean;

  reason:
    string;

  outranksOptionIds:
    string[];
};

export type ExecutiveOptimizationRanking = {
  id: string;

  scoreSet:
    ExecutiveOptimizationScoreSet;

  rankedOptions:
    ExecutiveOptimizationRankedOption[];

  preferredOption:
    ExecutiveOptimizationRankedOption | null;

  rationale:
    string;

  boundaries: {
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
