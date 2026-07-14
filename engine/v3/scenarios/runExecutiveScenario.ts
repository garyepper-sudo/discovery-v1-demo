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
  Parameters<typeof simulateOrganization>[0];

type BuildSimulationScenarioInput =
  Parameters<typeof buildSimulationScenario>[0];

export type ExecutiveScenarioResult = {
  /**
   * Intervention evaluated by this scenario.
   */
  intervention: OrganizationalIntervention;

  /**
   * Future organizational state created by causal simulation.
   */
  simulatedOrganizationState: SimulatedOrganizationState;

  /**
   * Canonical executive cognition generated from the simulated state.
   */
  scenario: SimulationScenario;

  /**
   * Deterministic comparison between current and projected cognition.
   */
  comparison: SimulationScenarioComparison;
};

export type RunExecutiveScenarioInput = {
  /**
   * Current organization and simulation inputs.
   *
   * The intervention is supplied separately so the scenario identity remains
   * explicit and cannot disagree with the simulation request.
   */
  simulation: Omit<
    SimulateOrganizationInput,
    "intervention"
  >;

  intervention: OrganizationalIntervention;

  /**
   * Current canonical Executive Assessment used as the comparison baseline.
   */
  currentExecutiveAssessment: OrganizationalAssessment;

  /**
   * Current canonical organization-level state used as longitudinal context
   * when synthesizing the projected organizational state.
   */
  currentOrganizationalState: OrganizationalState;

  /**
   * Current canonical judgment and reasoning products reused when evaluating
   * the simulated future.
   */
  judgments: OrganizationalJudgment[];

  mechanisms?: OrganizationalMechanism[];

  conceptCandidates?: ConceptCandidate[];

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
 * Runs a complete executive decision scenario outside the live organization
 * runtime.
 *
 * This orchestrator performs no independent organizational reasoning. It:
 *
 * 1. simulates the intervention,
 * 2. synthesizes the projected organizational state through the canonical
 *    organizational-state producer,
 * 3. routes the simulated state through canonical executive cognition,
 * 4. compares current and projected cognition,
 * 5. returns one executive scenario result.
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
  const simulatedOrganizationState =
    simulateOrganization({
      ...simulation,
      intervention,
    });

  const projectedOrganizationalState =
    synthesizeOrganizationalState({
      conditions:
        simulatedOrganizationState.projectedConditions,

      memoryMaturity:
        simulation.learningProfile,

      previousState:
        currentOrganizationalState,

      now:
        simulatedOrganizationState.simulatedAt,
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
        simulatedOrganizationState.projectedBeliefs,
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
