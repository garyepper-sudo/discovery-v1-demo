import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

import type {
  ExecutiveDecision,
} from "../model/simulate/executiveDecision";

import type {
  InterventionOption,
} from "../model/simulate/interventionOption";

import type {
  OrganizationalCondition,
} from "../model/state/inferOrganizationalConditions";

import type {
  OrganizationalMechanism,
} from "../model/judgment/organizationalMechanism";

import type {
  ExecutivePrimaryConstraint,
} from "../model/judgment/buildPrimaryExecutiveConstraint";

import {
  synthesizeExecutiveOptimizationObjective,
} from "../optimization/synthesizeExecutiveOptimizationObjective";

import type {
  ExecutiveOptimizationObjective,
} from "../optimization/executiveOptimizationObjective";

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
  buildExecutiveDecisionJustification,
  type ExecutiveDecisionJustification,
} from "./buildExecutiveDecisionJustification";

import {
  buildExecutiveDecisionRecommendation,
  type ExecutiveDecisionRecommendation,
} from "./buildExecutiveDecisionRecommendation";

import {
  evaluateInterventionViability,
  type InterventionViabilityEvaluation,
} from "./evaluateInterventionViability";

import {
  calibrateDecisionConfidence,
  type DecisionConfidenceCalibration,
} from "./calibrateDecisionConfidence";

import {
  buildExecutiveSimulation,
} from "../simulation/buildExecutiveSimulation";

import type {
  ExecutiveSimulation,
} from "../simulation/executiveSimulation";

export type ExecutiveDecisionCycle = {
  /**
   * Executive objective, metrics, constraints, assumptions, and questions
   * that initiated this decision cycle.
   */
  executiveDecision:
    ExecutiveDecision;

  /**
   * Canonical machine-readable optimization problem synthesized from
   * the Executive Decision and current organizational conditions.
   */
  optimizationObjective:
    ExecutiveOptimizationObjective;

  /**
   * Candidate interventions generated for the executive objective.
   */
  generatedOptions:
    InterventionOption[];

  /**
   * Constraint-based viability evaluation for every generated option.
   */
  viabilityEvaluations:
    InterventionViabilityEvaluation[];

  /**
   * Causal evaluation of every generated intervention option that was not
   * disqualified by a required executive constraint.
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
   * Canonical explanation of why the winning strategy is preferred
   * over the evaluated alternatives.
   */
  decisionJustification:
    ExecutiveDecisionJustification;

  /**
   * Epistemic calibration explaining how much Discovery should trust
   * the winning recommendation.
   */
  confidenceCalibration:
    DecisionConfidenceCalibration;

  /**
   * Final executive recommendation synthesized from the ranking.
   */
  recommendation:
    ExecutiveDecisionRecommendation;

  /**
   * Canonical executive-facing synthesis of the optimization objective,
   * completed scenarios, cross-scenario comparison, ranking, and final
   * recommendation.
   *
   * This object is ready for Runtime persistence, Executive Projection,
   * Executive Workspace, Executive Decision, and longitudinal learning.
   */
  executiveSimulation:
    ExecutiveSimulation;

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
   * Optional deterministic timestamp used across objective synthesis,
   * option generation, simulation, comparison, ranking, and recommendation.
   */
  completedAt?: string;
};

type DecisionRuntimeMemory =
  OrganizationRuntime["memory"] & {
    organizationalConditions?:
      OrganizationalCondition[];

    primaryExecutiveConstraint?:
      ExecutivePrimaryConstraint | null;

    mechanismNetwork?: {
      mechanisms?: OrganizationalMechanism[];
    };
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

function requireOrganizationalConditions(
  runtime:
    OrganizationRuntime,
): OrganizationalCondition[] {
  const memory =
    runtime.memory as
      DecisionRuntimeMemory;

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

  return conditions;
}

function getPrimaryExecutiveConstraint(
  runtime:
    OrganizationRuntime,
): ExecutivePrimaryConstraint | null {
  const memory =
    runtime.memory as
      DecisionRuntimeMemory;

  return (
    memory.primaryExecutiveConstraint ??
    null
  );
}

function evaluateOptionViability(
  options:
    InterventionOption[],

  executiveDecision:
    ExecutiveDecision,
): InterventionViabilityEvaluation[] {
  return options.map((option) =>
    evaluateInterventionViability({
      executiveDecision,
      option,
    }),
  );
}

function evaluateOptions(
  options:
    InterventionOption[],

  runtime:
    OrganizationRuntime,

  conditions:
    OrganizationalCondition[],
): EvaluatedInterventionOption[] {
  const causalModel =
    runtime.memory
      .organizationalCausalModel;

  if (!causalModel) {
    throw new Error(
      "Executive Decision Cycle requires a persisted Organizational Causal Model.",
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
  optionId:
    evaluatedOption.option.id,

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
 * 2. resolves the persisted organizational conditions,
 * 3. synthesizes the canonical Executive Optimization Objective,
 * 4. generates intervention options,
 * 5. evaluates every option against executive constraints,
 * 6. removes options that violate required constraints,
 * 7. evaluates remaining options through canonical causal reasoning,
 * 8. simulates every remaining option from the same organizational baseline,
 * 9. compares all projected futures,
 * 10. ranks the scenarios deterministically,
 * 11. synthesizes the Executive Decision Justification,
 * 12. calibrates confidence in the winning recommendation,
 * 13. synthesizes the final executive recommendation,
 * 14. synthesizes the canonical Executive Simulation,
 * 15. and returns the complete non-mutating decision cycle.
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

  const conditions =
    requireOrganizationalConditions(
      runtime,
    );

  const primaryExecutiveConstraint =
    getPrimaryExecutiveConstraint(
      runtime,
    );

  const optimizationObjective =
    synthesizeExecutiveOptimizationObjective({
      executiveDecision,
      conditions,
      primaryExecutiveConstraint,
      generatedAt:
        completedAt,
    });

  const generatedOptions =
    generateInterventionOptions({
      executiveDecision,
      organizationalConditions:
        conditions,
      organizationalMechanisms:
        (
          runtime.memory as
            DecisionRuntimeMemory
        ).mechanismNetwork
          ?.mechanisms ?? [],
      generatedAt:
        completedAt,
    });

  if (generatedOptions.length === 0) {
    throw new Error(
      "Executive Decision Cycle did not generate any intervention options.",
    );
  }

  const viabilityEvaluations =
    evaluateOptionViability(
      generatedOptions,
      executiveDecision,
    );

  const viableOptions =
    generatedOptions.filter(
      (option) =>
        viabilityEvaluations.find(
          (evaluation) =>
            evaluation.optionId === option.id,
        )?.status !== "disqualified",
    );

  if (viableOptions.length === 0) {
    throw new Error(
      "Executive Decision Cycle found no intervention options that satisfy the required executive constraints.",
    );
  }

  const evaluatedOptions =
    evaluateOptions(
      viableOptions,
      runtime,
      conditions,
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

  /**
   * Ranking still consumes ExecutiveDecision during the current migration.
   * The canonical Optimization Objective is now produced and returned by
   * the cycle; the next optimization increment will make ranking consume
   * optimizationObjective directly.
   */
  const rankedScenarios =
    rankExecutiveScenarios({
      executiveDecision,
      comparisonSet,
    });

  const winner =
    rankedScenarios[0];

  if (!winner) {
    throw new Error(
      "Executive Decision Cycle could not identify a winning scenario.",
    );
  }

  const decisionJustification =
    buildExecutiveDecisionJustification({
      generatedOptions,
      comparisonSet,
      rankedScenarios,
      viabilityEvaluations,
      generatedAt:
        completedAt,
    });

  const confidenceCalibration =
    calibrateDecisionConfidence({
      winner,
      runtime,
      viabilityEvaluations,
    });

  const recommendation =
    buildExecutiveDecisionRecommendation({
      comparisonSet,
      rankedScenarios,
      confidenceCalibration,
      viabilityEvaluations,
      generatedOptions,
      primaryExecutiveConstraint,
      optimizationObjective,
      generatedAt:
        completedAt,
    });

  const executiveSimulation =
    buildExecutiveSimulation({
      optimizationObjective,
      recommendation,
      comparisonSet,
      rankedScenarios,
      scenarios,
      generatedAt:
        completedAt,
    });

  return {
    executiveDecision,
    optimizationObjective,
    generatedOptions,
    viabilityEvaluations,
    evaluatedOptions,
    scenarios,
    comparisonSet,
    rankedScenarios,
    decisionJustification,
    confidenceCalibration,
    recommendation,
    executiveSimulation,
    completedAt,
  };
}
