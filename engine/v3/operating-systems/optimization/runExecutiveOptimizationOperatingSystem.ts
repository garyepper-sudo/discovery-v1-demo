import {
  buildExecutiveOptimizationProblem,
} from "../../model/optimization/buildExecutiveOptimizationProblem";

import {
  buildOptimizedExecutiveRecommendation,
} from "../../model/optimization/buildOptimizedExecutiveRecommendation";

import {
  evaluateExecutiveOptimizationConstraints,
} from "../../model/optimization/evaluateExecutiveOptimizationConstraints";

import {
  generateExecutiveOptimizationOptions,
} from "../../model/optimization/generateExecutiveOptimizationOptions";

import {
  rankExecutiveOptimizationOptions,
} from "../../model/optimization/rankExecutiveOptimizationOptions";

import {
  scoreExecutiveOptimizationOptions,
} from "../../model/optimization/scoreExecutiveOptimizationOptions";

import type {
  OptimizedExecutiveRecommendation,
} from "../../model/optimization/optimizedExecutiveRecommendationTypes";

import type {
  ExecutiveRecommendation,
} from "../../model/recommendation/executiveRecommendationTypes";

import type {
  OrganizationRuntime,
} from "../../runtime/organizationRuntime";

export type ExecutiveOptimizationRuntimeMemory = {
  executiveRecommendation?:
    ExecutiveRecommendation;

  optimizedExecutiveRecommendation?:
    OptimizedExecutiveRecommendation;
};

export type RunExecutiveOptimizationOperatingSystemInput = {
  runtime:
    OrganizationRuntime;

  now?:
    string;
};

export type RunExecutiveOptimizationOperatingSystemResult = {
  runtime:
    OrganizationRuntime;

  optimizedExecutiveRecommendation:
    OptimizedExecutiveRecommendation;
};

/**
 * Canonical Executive Optimization Operating System.
 *
 * Responsibilities:
 *
 * Executive Recommendation
 * → Executive Optimization Problem
 * → Optimization Options
 * → Constraint Evaluation
 * → Option Scoring
 * → Option Ranking
 * → Optimized Executive Recommendation
 * → Runtime Memory
 *
 * This operating system does not:
 *
 * - replace the original Executive Recommendation,
 * - record an executive decision,
 * - execute an intervention,
 * - or run organizational simulation.
 *
 * Persistence remains owned by organizationStateStore.
 */
export function runExecutiveOptimizationOperatingSystem(
  input:
    RunExecutiveOptimizationOperatingSystemInput,
): RunExecutiveOptimizationOperatingSystemResult {
  const memory =
    input.runtime.memory as
      typeof input.runtime.memory &
      ExecutiveOptimizationRuntimeMemory;

  const executiveRecommendation =
    memory.executiveRecommendation;

  if (
    !executiveRecommendation
  ) {
    throw new Error(
      "Executive Optimization Operating System requires runtime.memory.executiveRecommendation.",
    );
  }

  const now =
    input.now ??
    new Date()
      .toISOString();

  const optimizationProblem =
    buildExecutiveOptimizationProblem({
      organizationId:
        input.runtime.metadata.organizationId,

      recommendation:
        executiveRecommendation,

      now,
    });

  const optionSet =
    generateExecutiveOptimizationOptions({
      optimizationProblem,

      now,
    });

  const constraintEvaluationSet =
    evaluateExecutiveOptimizationConstraints({
      optionSet,

      now,
    });

  const scoreSet =
    scoreExecutiveOptimizationOptions({
      constraintEvaluationSet,

      now,
    });

  const ranking =
    rankExecutiveOptimizationOptions({
      scoreSet,

      now,
    });

  const optimizedExecutiveRecommendation =
    buildOptimizedExecutiveRecommendation({
      organizationId:
        input.runtime.metadata.organizationId,

      ranking,

      now,
    });

  const updatedRuntime:
    OrganizationRuntime = {
    ...input.runtime,

    metadata: {
      ...input.runtime.metadata,

      updatedAt:
        optimizedExecutiveRecommendation
          .createdAt,
    },

    memory: {
      ...input.runtime.memory,

      optimizedExecutiveRecommendation,
    },
  };

  return {
    runtime:
      updatedRuntime,

    optimizedExecutiveRecommendation,
  };
}
