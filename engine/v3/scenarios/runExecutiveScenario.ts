import type {
  OrganizationalAssessment,
  OrganizationalJudgment,
} from "../model/judgment/organizationalJudgment";

import type {
  OrganizationalMechanism,
} from "../model/judgment/organizationalMechanism";

import type {
  ConceptCandidate,
} from "../concepts/conceptCandidateTypes";

import {
  synthesizeOrganizationalState,
  type OrganizationalState,
} from "../model/state/inferOrganizationalConditions";

import {
  buildSimulationScenario,
  type SimulationScenario,
} from "../model/simulate/buildSimulationScenario";

import {
  compareSimulationScenario,
  type SimulationScenarioComparison,
} from "../model/simulate/compareSimulationScenario";

import {
  simulateOrganization,
  type SimulatedOrganizationState,
} from "../model/simulate/simulateOrganization";

import type {
  OrganizationalIntervention,
} from "../model/simulate/organizationalIntervention";

type SimulateOrganizationInput =
  Parameters<
    typeof simulateOrganization
  >[0];

type BuildSimulationScenarioInput =
  Parameters<
    typeof buildSimulationScenario
  >[0];

export type ExecutiveScenarioResult = {
  /**
   * Intervention evaluated by this scenario.
   */
  intervention:
    OrganizationalIntervention;

  /**
   * Future organizational state created by causal simulation.
   *
   * This may contain:
   *
   * - one backward-compatible influence propagation result, or
   * - multiple direct changes, propagation results, and aggregated influence
   *   for a multi-target intervention.
   */
  simulatedOrganizationState:
    SimulatedOrganizationState;

  /**
   * Canonical executive cognition generated from the simulated state.
   */
  scenario:
    SimulationScenario;

  /**
   * Deterministic comparison between current and projected cognition.
   */
  comparison:
    SimulationScenarioComparison;
};

export type RunExecutiveScenarioInput = {
  /**
   * Current organization and simulation inputs.
   *
   * The intervention is supplied separately so scenario identity remains
   * explicit and cannot disagree with the simulation request.
   *
   * For multi-target interventions, callers should supply:
   *
   * simulation.directChanges
   *
   * using the canonical output from:
   *
   * mapInterventionToCausalChanges()
   *
   * The existing changedEntityId and interventionDelta fields remain
   * supported for backward-compatible single-target scenarios.
   */
  simulation: Omit<
    SimulateOrganizationInput,
    "intervention"
  >;

  intervention:
    OrganizationalIntervention;

  /**
   * Current canonical Executive Assessment used as the comparison baseline.
   */
  currentExecutiveAssessment:
    OrganizationalAssessment;

  /**
   * Current canonical organization-level state used as longitudinal context
   * when synthesizing the projected organizational state.
   */
  currentOrganizationalState:
    OrganizationalState;

  /**
   * Current canonical judgment and reasoning products reused when evaluating
   * the simulated future.
   */
  judgments:
    OrganizationalJudgment[];

  mechanisms?:
    OrganizationalMechanism[];

  conceptCandidates?:
    ConceptCandidate[];

  conceptualUnderstanding?:
    BuildSimulationScenarioInput["conceptualUnderstanding"];

  organizationalBeliefs?:
    BuildSimulationScenarioInput["organizationalBeliefs"];

  investigationOpportunities?:
    BuildSimulationScenarioInput["investigationOpportunities"];

  theories?:
    BuildSimulationScenarioInput["theories"];
};

/**
 * Runs a complete executive decision scenario outside the live Organization
 * Runtime.
 *
 * This orchestrator performs no independent organizational reasoning.
 *
 * It:
 *
 * 1. simulates one intervention,
 * 2. supports either single-target or aggregated multi-target influence,
 * 3. synthesizes the projected Organizational State through the canonical
 *    organizational-state producer,
 * 4. routes the simulated state through canonical executive cognition,
 * 5. compares current and projected cognition,
 * 6. and returns one complete Executive Scenario Result.
 *
 * The live Organization Runtime is not mutated.
 */
export function runExecutiveScenario({
  simulation,
  intervention,
  currentExecutiveAssessment,
  currentOrganizationalState,
  judgments,
  mechanisms = [],
  conceptCandidates = [],
  conceptualUnderstanding = [],
  organizationalBeliefs,
  investigationOpportunities = [],
  theories = [],
}: RunExecutiveScenarioInput): ExecutiveScenarioResult {
  /**
   * simulation.directChanges is forwarded automatically when supplied.
   *
   * simulateOrganization() gives canonical multi-target direct changes
   * precedence over the backward-compatible changedEntityId and
   * interventionDelta fields.
   */
  const simulatedOrganizationState =
    simulateOrganization({
      ...simulation,
      intervention,
    });

  const projectedOrganizationalState =
    synthesizeOrganizationalState({
      conditions:
        simulatedOrganizationState
          .projectedConditions,

      memoryMaturity:
        simulation.learningProfile,

      previousState:
        currentOrganizationalState,

      now:
        simulatedOrganizationState
          .simulatedAt,
    });

  const scenario =
    buildSimulationScenario({
      intervention,

      simulatedOrganizationState,

      projectedOrganizationalState,

      judgments,

      mechanisms,

      conceptCandidates,

      conceptualUnderstanding,

      organizationalBeliefs:
        organizationalBeliefs ??
        simulatedOrganizationState
          .projectedBeliefs,

      investigationOpportunities,

      theories,
    });

  const comparison =
    compareSimulationScenario({
      currentConditions:
        simulation.conditions,

      currentPredictions:
        simulation.predictions,

      currentExecutiveAssessment,

      projectedScenario:
        scenario,
    });

  return {
    intervention,
    simulatedOrganizationState,
    scenario,
    comparison,
  };
}