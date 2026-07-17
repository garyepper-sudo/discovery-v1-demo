import type {
  ExecutiveOptimizationProblem,
  ExecutiveOptimizationVariable,
} from "./executiveOptimizationTypes";

export type ExecutiveOptimizationOptionProfile =
  | "focus_reset"
  | "sequenced_governance"
  | "controlled_pilot";

export type ExecutiveOptimizationOption = {
  id: string;

  optimizationProblemId:
    string;

  recommendationId:
    string;

  profile:
    ExecutiveOptimizationOptionProfile;

  title: string;

  summary: string;

  rationale: string;

  variableAdjustments: Array<{
    variableId:
      string;

    variableType:
      ExecutiveOptimizationVariable["type"];

    direction:
      ExecutiveOptimizationVariable["direction"];

    proposedValue:
      string;

    rationale:
      string;
  }>;

  expectedValue:
    number;

  implementationRisk:
    number;

  speedToImpact:
    number;

  reversibility:
    number;

  confidence:
    number;

  constraintAssumptions:
    string[];

  uncertaintySummary:
    string;

  boundaries: {
    preservesObjective:
      true;

    preservesRecommendation:
      true;

    doesNotSimulate:
      true;

    doesNotSelectFinalDecision:
      true;
  };

  createdAt:
    string;
};

export type ExecutiveOptimizationOptionSet = {
  id: string;

  optimizationProblem:
    ExecutiveOptimizationProblem;

  options:
    ExecutiveOptimizationOption[];

  createdAt:
    string;
};
