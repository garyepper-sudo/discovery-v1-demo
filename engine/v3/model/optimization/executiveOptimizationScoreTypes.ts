import type {
  ExecutiveOptimizationConstraintEvaluationSet,
  ExecutiveOptimizationOptionConstraintResult,
} from "./executiveConstraintEvaluationTypes";

import type {
  ExecutiveOptimizationPreference,
} from "./executiveOptimizationTypes";

export type ExecutiveOptimizationScoreComponent = {
  id: string;

  label: string;

  rawValue:
    number;

  weight:
    number;

  weightedValue:
    number;

  rationale:
    string;
};

export type ExecutiveOptimizationOptionScore = {
  id: string;

  optionConstraintResult:
    ExecutiveOptimizationOptionConstraintResult;

  components:
    ExecutiveOptimizationScoreComponent[];

  baseScore:
    number;

  confidenceAdjustment:
    number;

  uncertaintyPenalty:
    number;

  infeasibilityPenalty:
    number;

  finalScore:
    number;

  feasible:
    boolean;

  summary:
    string;
};

export type ExecutiveOptimizationScoreSet = {
  id: string;

  constraintEvaluationSet:
    ExecutiveOptimizationConstraintEvaluationSet;

  preferences:
    ExecutiveOptimizationPreference[];

  scores:
    ExecutiveOptimizationOptionScore[];

  createdAt:
    string;
};
