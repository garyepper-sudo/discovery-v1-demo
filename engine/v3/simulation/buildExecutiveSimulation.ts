import type {
  ExecutiveDecisionRecommendation,
} from "../decisions/buildExecutiveDecisionRecommendation";

import type {
  ExecutiveScenarioComparisonEntry,
  ExecutiveScenarioComparisonSet,
} from "../decisions/compareExecutiveScenarios";

import type {
  RankedExecutiveScenario,
} from "../decisions/rankExecutiveScenarios";

import type {
  ExecutiveOptimizationObjective,
} from "../optimization/executiveOptimizationObjective";

import type {
  ExecutiveScenarioResult,
} from "../scenarios/runExecutiveScenario";

import type {
  ExecutiveSimulation,
  ExecutiveSimulationScenario,
} from "./executiveSimulation";

export type BuildExecutiveSimulationInput = {
  /**
   * Canonical executive optimization problem used to evaluate
   * the available scenarios.
   */
  optimizationObjective:
    ExecutiveOptimizationObjective;

  /**
   * Canonical recommendation produced after scenario ranking,
   * viability evaluation, and confidence calibration.
   */
  recommendation:
    ExecutiveDecisionRecommendation;

  /**
   * Canonical comparison of all completed executive scenarios.
   */
  comparisonSet:
    ExecutiveScenarioComparisonSet;

  /**
   * Canonically ranked executive scenarios.
   */
  rankedScenarios:
    RankedExecutiveScenario[];

  /**
   * Complete scenario results containing the intervention,
   * organizational simulation, and scenario-level comparison.
   */
  scenarios:
    ExecutiveScenarioResult[];

  /**
   * Optional deterministic generation timestamp.
   */
  generatedAt?: string;
};

function createExecutiveSimulationId(
  organizationId: string,
  generatedAt: string,
): string {
  return [
    "executive-simulation",
    organizationId,
    generatedAt,
  ].join("-");
}

function unique(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value) =>
          value.trim().length > 0,
      ),
    ),
  );
}

function requireSingleOrganizationId(
  input:
    BuildExecutiveSimulationInput,
): string {
  const organizationIds =
    unique([
      input.optimizationObjective
        .organizationId,

      input.comparisonSet
        .baselineOrganizationId,

      ...input.scenarios.map(
        (scenario) =>
          scenario
            .simulatedOrganizationState
            .organizationId,
      ),
    ]);

  if (organizationIds.length === 0) {
    throw new Error(
      "Executive Simulation requires an organization identity.",
    );
  }

  if (organizationIds.length !== 1) {
    throw new Error(
      "Executive Simulation inputs must belong to the same organization.",
    );
  }

  return organizationIds[0];
}

function requireRecommendedInterventionId(
  recommendation:
    ExecutiveDecisionRecommendation,
): string {
  const recommendedInterventionId =
    recommendation
      .recommendedInterventionId;

  if (!recommendedInterventionId) {
    throw new Error(
      "Executive Simulation requires a recommended intervention.",
    );
  }

  return recommendedInterventionId;
}

function requireUniqueScenarioIds(
  scenarios:
    ExecutiveScenarioResult[],
): void {
  const scenarioIds =
    scenarios.map(
      (scenario) =>
        scenario
          .simulatedOrganizationState
          .id,
    );

  if (
    new Set(scenarioIds).size !==
    scenarioIds.length
  ) {
    throw new Error(
      "Executive Simulation received duplicate scenario identities.",
    );
  }
}

function requireUniqueInterventionIds(
  scenarios:
    ExecutiveScenarioResult[],
): void {
  const interventionIds =
    scenarios.map(
      (scenario) =>
        scenario.intervention.id,
    );

  if (
    new Set(interventionIds).size !==
    interventionIds.length
  ) {
    throw new Error(
      "Executive Simulation requires one completed scenario per intervention.",
    );
  }
}

function requireUniqueOptionIds(
  scenarios:
    ExecutiveScenarioResult[],
): void {
  const optionIds =
    scenarios.map(
      (scenario) =>
        scenario.optionId,
    );

  if (
    new Set(optionIds).size !==
    optionIds.length
  ) {
    throw new Error(
      "Executive Simulation requires one completed scenario per intervention option.",
    );
  }
}

function requireComparisonEntry(
  comparisonSet:
    ExecutiveScenarioComparisonSet,

  scenario:
    ExecutiveScenarioResult,
): ExecutiveScenarioComparisonEntry {
  const comparison =
    comparisonSet
      .scenarioComparisons
      .find(
        (entry) =>
          entry.optionId ===
            scenario.optionId &&
          entry.interventionId ===
            scenario.intervention.id &&
          entry.scenarioId ===
            scenario
              .simulatedOrganizationState
              .id,
      );

  if (!comparison) {
    throw new Error(
      `Scenario comparison could not be resolved for intervention "${scenario.intervention.id}".`,
    );
  }

  return comparison;
}

function requireRanking(
  rankedScenarios:
    RankedExecutiveScenario[],

  scenario:
    ExecutiveScenarioResult,
): RankedExecutiveScenario {
  const ranking =
    rankedScenarios.find(
      (entry) =>
        entry.optionId ===
          scenario.optionId &&
        entry.interventionId ===
          scenario.intervention.id &&
        entry.scenarioId ===
          scenario
            .simulatedOrganizationState
            .id,
    );

  if (!ranking) {
    throw new Error(
      `Scenario ranking could not be resolved for intervention "${scenario.intervention.id}".`,
    );
  }

  return ranking;
}

function buildExecutiveSimulationScenario(params: {
  scenario:
    ExecutiveScenarioResult;

  comparisonSet:
    ExecutiveScenarioComparisonSet;

  rankedScenarios:
    RankedExecutiveScenario[];
}): ExecutiveSimulationScenario {
  const comparison =
    requireComparisonEntry(
      params.comparisonSet,
      params.scenario,
    );

  const ranking =
    requireRanking(
      params.rankedScenarios,
      params.scenario,
    );

  return {
    optionId:
      params.scenario.optionId,

    interventionId:
      params.scenario
        .intervention.id,

    scenarioId:
      params.scenario
        .simulatedOrganizationState
        .id,

    scenario:
      params.scenario,

    comparison,

    ranking,
  };
}

function requireCompleteScenarioCoverage(params: {
  scenarios:
    ExecutiveScenarioResult[];

  comparisonSet:
    ExecutiveScenarioComparisonSet;

  rankedScenarios:
    RankedExecutiveScenario[];
}): void {
  if (
    params.scenarios.length !==
    params.comparisonSet
      .scenarioComparisons.length
  ) {
    throw new Error(
      "Executive Simulation requires complete comparison coverage for every scenario.",
    );
  }

  if (
    params.scenarios.length !==
    params.rankedScenarios.length
  ) {
    throw new Error(
      "Executive Simulation requires complete ranking coverage for every scenario.",
    );
  }
}

function sortSimulationScenarios(
  scenarios:
    ExecutiveSimulationScenario[],
): ExecutiveSimulationScenario[] {
  return [...scenarios].sort(
    (left, right) => {
      if (
        left.ranking.rank !==
        right.ranking.rank
      ) {
        return (
          left.ranking.rank -
          right.ranking.rank
        );
      }

      return left.interventionId
        .localeCompare(
          right.interventionId,
        );
    },
  );
}

/**
 * Synthesizes the completed executive simulation pipeline into one
 * canonical ExecutiveSimulation cognitive object.
 *
 * This producer performs no independent:
 *
 * - organizational simulation,
 * - scenario comparison,
 * - scenario ranking,
 * - optimization,
 * - recommendation generation,
 * - confidence calibration,
 * - or constraint reasoning.
 *
 * It validates and assembles cognition already produced by canonical
 * upstream capabilities for use by Runtime, Executive Projection,
 * Executive Workspace, Executive Decision, and Organizational Learning.
 */
export function buildExecutiveSimulation({
  optimizationObjective,
  recommendation,
  comparisonSet,
  rankedScenarios,
  scenarios,
  generatedAt =
    new Date().toISOString(),
}: BuildExecutiveSimulationInput): ExecutiveSimulation {
  if (scenarios.length === 0) {
    throw new Error(
      "At least one completed executive scenario is required.",
    );
  }

  if (rankedScenarios.length === 0) {
    throw new Error(
      "At least one ranked executive scenario is required.",
    );
  }

  requireUniqueScenarioIds(
    scenarios,
  );

  requireUniqueInterventionIds(
    scenarios,
  );

  requireUniqueOptionIds(
    scenarios,
  );

  requireCompleteScenarioCoverage({
    scenarios,
    comparisonSet,
    rankedScenarios,
  });

  const organizationId =
    requireSingleOrganizationId({
      optimizationObjective,
      recommendation,
      comparisonSet,
      rankedScenarios,
      scenarios,
      generatedAt,
    });

  const recommendedInterventionId =
    requireRecommendedInterventionId(
      recommendation,
    );

  const assembledScenarios =
    sortSimulationScenarios(
      scenarios.map(
        (scenario) =>
          buildExecutiveSimulationScenario({
            scenario,
            comparisonSet,
            rankedScenarios,
          }),
      ),
    );

  const recommendedScenario =
    assembledScenarios.find(
      (scenario) =>
        scenario.interventionId ===
        recommendedInterventionId,
    );

  if (!recommendedScenario) {
    throw new Error(
      `Recommended intervention "${recommendedInterventionId}" does not have a completed executive simulation scenario.`,
    );
  }

  if (
    recommendedScenario.ranking.rank !==
    1
  ) {
    throw new Error(
      "The recommended executive simulation scenario must be the highest-ranked scenario.",
    );
  }

  const alternativeScenarios =
    assembledScenarios.filter(
      (scenario) =>
        scenario.interventionId !==
        recommendedInterventionId,
    );

  return {
    id:
      createExecutiveSimulationId(
        organizationId,
        generatedAt,
      ),

    organizationId,

    generatedAt,

    optimizationObjective,

    recommendation,

    recommendedScenario,

    alternativeScenarios,

    comparisonSet,

    executiveConfidence:
      recommendation.confidence,

    executiveSummary:
      recommendation.summary,

    expectedBenefits:
      recommendation
        .expectedBenefits,

    tradeoffs:
      recommendation.tradeOffs,

    risks:
      recommendation.risks,

    assumptions:
      recommendation.assumptions,

    keyDrivers:
      recommendation
        .whyRecommended,

    evidenceThatCouldChangeRecommendation:
      recommendation
        .evidenceThatCouldChangeRecommendation,
  };
}