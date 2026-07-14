import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  InterventionOption,
} from "../model/simulate/interventionOption";

import {
  generateInterventionOptions,
} from "../reasoning/generateInterventionOptions";

import {
  evaluateInterventionOption,
  type EvaluatedInterventionOption,
} from "../reasoning/evaluateInterventionOption";

import {
  buildExecutiveDecisionContext,
} from "../scenarios/buildExecutiveDecisionContext";

import {
  runExecutiveScenario,
  type ExecutiveScenarioResult,
} from "../scenarios/runExecutiveScenario";

import {
  compareExecutiveScenarios,
  type ExecutiveScenarioComparisonSet,
} from "./compareExecutiveScenarios";

import {
  rankExecutiveScenarios,
  type RankedExecutiveScenario,
} from "./rankExecutiveScenarios";

import {
  buildExecutiveDecisionRecommendation,
  type ExecutiveDecisionRecommendation,
} from "./buildExecutiveDecisionRecommendation";

export type ExecutiveDecisionCycle = {
  /**
   * Executive objective, metrics, constraints, assumptions, and questions
   * that initiated this decision cycle.
   */
  executiveDecision:
    ExecutiveDecision;

  /**
   * Candidate interventions generated for the executive objective.
   */
  generatedOptions:
    InterventionOption[];

  /**
   * Causal evaluation of every generated intervention option.
   */
  evaluatedOptions:
    EvaluatedInterventionOption[];

  /**
   * Complete simulated organizational future for every viable option.
   */
  scenarios:
    ExecutiveScenarioResult[];

  /**
   * Structured comparison across all completed scenarios.
   */
  comparisonSet:
    ExecutiveScenarioComparisonSet;

  /**
   * Deterministically ordered scenario results.
   */
  rankedScenarios:
    RankedExecutiveScenario[];

  /**
   * Final executive recommendation synthesized from the ranking.
   */
  recommendation:
    ExecutiveDecisionRecommendation;

  /**
   * Stable completion timestamp for the cycle.
   */
  completedAt: string;
};

export type RunExecutiveDecisionCycleInput = {
  /**
   * Canonical executive objective being evaluated.
   */
  executiveDecision:
    ExecutiveDecision;

  /**
   * Current persisted organization used as the unchanged scenario baseline.
   */
  runtime:
    OrganizationRuntime;

  /**
   * Optional deterministic timestamp used across option generation,
   * simulation, comparison, ranking, and recommendation.
   */
  completedAt?: string;
};

function requireMatchingOrganization(
  executiveDecision:
    ExecutiveDecision,

  runtime:
    OrganizationRuntime,
): void {
  if (
    executiveDecision.organizationId !==
    runtime.metadata.organizationId
  ) {
    throw new Error(
      "The Executive Decision and Organization Runtime must reference the same organization.",
    );
  }
}

function evaluateOptions(
  options:
    InterventionOption[],

  runtime:
    OrganizationRuntime,
): EvaluatedInterventionOption[] {
  const causalModel =
    runtime.memory
      .organizationalCausalModel;

  if (!causalModel) {
    throw new Error(
      "Executive Decision Cycle requires a persisted Organizational Causal Model.",
    );
  }

  type DecisionRuntimeMemory =
    OrganizationRuntime["memory"] & {
      organizationalConditions?: Parameters<
        typeof evaluateInterventionOption
      >[0]["conditions"];
    };

  const memory =
    runtime.memory as DecisionRuntimeMemory;

  const conditions =
    memory.organizationalConditions;

  if (
    !Array.isArray(conditions) ||
    conditions.length === 0
  ) {
    throw new Error(
      "Executive Decision Cycle requires persisted organizational conditions.",
    );
  }

  return options.map((option) =>
    evaluateInterventionOption({
      option,
      causalModel,
      conditions,
    }),
  );
}

function runOptionScenarios(
  evaluatedOptions:
    EvaluatedInterventionOption[],

  runtime:
    OrganizationRuntime,

  simulatedAt:
    string,
): ExecutiveScenarioResult[] {
  return evaluatedOptions.map(
    (evaluatedOption) => {
      const primaryChange =
        evaluatedOption.mappedChanges[0];

      if (!primaryChange) {
        throw new Error(
          `Intervention option "${evaluatedOption.option.title}" could not be mapped to any organizational condition.`,
        );
      }

      /**
       * buildExecutiveDecisionContext() currently retains the original
       * single-source parameters for backward compatibility.
       *
       * The complete mappedChanges collection is then supplied through
       * simulation.directChanges. simulateOrganization() gives those
       * canonical multi-target changes precedence over the legacy fields.
       */
      const decisionContext =
        buildExecutiveDecisionContext(
          runtime,
          {
            changedEntityId:
              primaryChange.entityId,

            interventionDelta:
              primaryChange.delta,

            timeHorizon:
              evaluatedOption
                .intervention
                .timeHorizon,

            simulatedAt,
          },
        );

      return runExecutiveScenario({
        ...decisionContext,

        simulation: {
          ...decisionContext.simulation,

          directChanges:
            evaluatedOption
              .mappedChanges,
        },

        intervention:
          evaluatedOption.intervention,
      });
    },
  );
}

/**
 * Runs Discovery's complete multi-option Executive Decision Operating System.
 *
 * The cycle:
 *
 * 1. validates that the decision and runtime refer to the same organization,
 * 2. generates viable intervention options,
 * 3. evaluates each option through canonical causal reasoning,
 * 4. simulates every option from the same organizational baseline,
 * 5. compares all projected futures,
 * 6. ranks the scenarios deterministically,
 * 7. synthesizes the final executive recommendation,
 * 8. and returns the complete non-mutating decision cycle.
 *
 * This orchestrator performs no independent organizational reasoning.
 */
export function runExecutiveDecisionCycle({
  executiveDecision,
  runtime,
  completedAt =
    new Date().toISOString(),
}: RunExecutiveDecisionCycleInput): ExecutiveDecisionCycle {
  requireMatchingOrganization(
    executiveDecision,
    runtime,
  );

  const generatedOptions =
    generateInterventionOptions({
      executiveDecision,
      generatedAt:
        completedAt,
    });

  if (generatedOptions.length === 0) {
    throw new Error(
      "Executive Decision Cycle did not generate any viable intervention options.",
    );
  }

  const evaluatedOptions =
    evaluateOptions(
      generatedOptions,
      runtime,
    );

  const scenarios =
    runOptionScenarios(
      evaluatedOptions,
      runtime,
      completedAt,
    );

  const comparisonSet =
    compareExecutiveScenarios({
      scenarios,
      generatedAt:
        completedAt,
    });

  const rankedScenarios =
    rankExecutiveScenarios({
      comparisonSet,
    });

  const recommendation =
    buildExecutiveDecisionRecommendation({
      comparisonSet,
      rankedScenarios,
      generatedAt:
        completedAt,
    });

  return {
    executiveDecision,
    generatedOptions,
    evaluatedOptions,
    scenarios,
    comparisonSet,
    rankedScenarios,
    recommendation,
    completedAt,
  };
}