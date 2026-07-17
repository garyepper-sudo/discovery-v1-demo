import type {
  ExecutiveRecommendation,
} from "../recommendation/executiveRecommendationTypes";

export type ExecutiveOptimizationConstraintType =
  | "time"
  | "budget"
  | "capacity"
  | "risk"
  | "decision-authority"
  | "implementation-complexity";

export type ExecutiveOptimizationConstraint = {
  id: string;

  type:
    ExecutiveOptimizationConstraintType;

  label: string;

  description: string;

  required:
    boolean;

  source:
    | "default"
    | "recommendation"
    | "executive-preference"
    | "organizational-state";

  confidence:
    number;
};

export type ExecutiveOptimizationVariableType =
  | "scope"
  | "sequence"
  | "timing"
  | "resource-allocation"
  | "decision-rights"
  | "coordination-load"
  | "implementation-intensity";

export type ExecutiveOptimizationVariable = {
  id: string;

  type:
    ExecutiveOptimizationVariableType;

  label: string;

  description: string;

  currentValue:
    string;

  direction:
    | "increase"
    | "decrease"
    | "clarify"
    | "sequence"
    | "hold";

  bounded:
    boolean;
};

export type ExecutiveOptimizationPreference = {
  id: string;

  label: string;

  description: string;

  weight:
    number;
};

export type ExecutiveOptimizationProblem = {
  id: string;

  organizationId:
    string;

  recommendationId:
    string;

  recommendation:
    ExecutiveRecommendation;

  objective: {
    statement:
      string;

    northStar:
      "maximize_expected_organizational_value";

    targetConditionId:
      string;
  };

  variables:
    ExecutiveOptimizationVariable[];

  constraints:
    ExecutiveOptimizationConstraint[];

  preferences:
    ExecutiveOptimizationPreference[];

  uncertaintySummary:
    string;

  confidence:
    number;

  boundaries: {
    doesNotReplaceRecommendation:
      true;

    doesNotSimulate:
      true;

    doesNotSelectFinalDecision:
      true;
  };

  createdAt:
    string;
};
