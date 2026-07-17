import type {
  ExecutiveOptimizationConstraint,
  ExecutiveOptimizationProblem,
} from "./executiveOptimizationTypes";

import type {
  ExecutiveOptimizationOption,
  ExecutiveOptimizationOptionSet,
} from "./executiveOptimizationOptionTypes";

export type ExecutiveConstraintEvaluationStatus =
  | "satisfied"
  | "binding"
  | "violated";

export type ExecutiveConstraintEvaluation = {
  id: string;

  optionId:
    string;

  constraintId:
    string;

  constraintType:
    ExecutiveOptimizationConstraint["type"];

  status:
    ExecutiveConstraintEvaluationStatus;

  severity:
    number;

  score:
    number;

  rationale:
    string;

  requiredAssumptions:
    string[];
};

export type ExecutiveOptimizationOptionConstraintResult = {
  option:
    ExecutiveOptimizationOption;

  evaluations:
    ExecutiveConstraintEvaluation[];

  feasible:
    boolean;

  bindingConstraintIds:
    string[];

  violatedConstraintIds:
    string[];

  feasibilityScore:
    number;

  summary:
    string;
};

export type ExecutiveOptimizationConstraintEvaluationSet = {
  id: string;

  optimizationProblem:
    ExecutiveOptimizationProblem;

  optionSet:
    ExecutiveOptimizationOptionSet;

  results:
    ExecutiveOptimizationOptionConstraintResult[];

  createdAt:
    string;
};
