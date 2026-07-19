import { buildExecutiveAssessment } from "../judgment/buildExecutiveAssessment";
import type {
  OrganizationalAssessment,
  OrganizationalJudgment,
} from "../judgment/organizationalJudgment";
import type { OrganizationalMechanism } from "../judgment/organizationalMechanism";
import {
  buildPredictionReflection,
  type PredictionReflection,
} from "../predictions/buildPredictionReflection";
import type { ConceptCandidate } from "../../concepts/conceptCandidateTypes";
import {
  buildExecutiveUnderstandingCandidates,
} from "../../understanding/buildExecutiveUnderstandingCandidates";
import type {
  UnderstandingCandidate,
} from "../../understanding/consolidateUnderstanding";
import type { OrganizationalIntervention } from "./organizationalIntervention";
import type {
  SimulatedOrganizationState,
} from "./simulateOrganization";

type ExecutiveAssessmentInput =
  Parameters<typeof buildExecutiveAssessment>[0];

type ExecutiveUnderstandingInput =
  Parameters<typeof buildExecutiveUnderstandingCandidates>[0];

export type SimulationScenario = {
  /**
   * Executive action being evaluated.
   */
  intervention: OrganizationalIntervention;

  /**
   * Simulated future organizational state produced by CAP-SIM-001.
   */
  simulatedOrganizationState: SimulatedOrganizationState;

  /**
   * Canonical reflection over predictions inferred from the simulated state.
   */
  projectedPredictionReflection: PredictionReflection;

  /**
   * Canonical Executive Assessment of the simulated future.
   */
  projectedExecutiveAssessment: OrganizationalAssessment;

  /**
   * Candidate executive understandings generated from the projected
   * assessment and simulated organizational state.
   */
  projectedUnderstandingCandidates: UnderstandingCandidate[];
};

export type BuildSimulationScenarioInput = {
  intervention: OrganizationalIntervention;

  simulatedOrganizationState: SimulatedOrganizationState;

  /**
   * Projected organization-level state corresponding to the simulated
   * conditions. Version 1 accepts this from the caller rather than
   * reconstructing organizational-state logic inside simulation.
   */
  projectedOrganizationalState:
    NonNullable<ExecutiveAssessmentInput["organizationalState"]>;

  judgments: OrganizationalJudgment[];

  mechanisms?: OrganizationalMechanism[];

  conceptCandidates?: ConceptCandidate[];

  conceptualUnderstanding?:
    ExecutiveAssessmentInput["conceptualUnderstanding"];

  /**
   * Beliefs are currently preserved by simulateOrganization().
   */
  organizationalBeliefs?:
    ExecutiveAssessmentInput["organizationalBeliefs"];

  investigationOpportunities?:
    ExecutiveAssessmentInput["investigationOpportunities"];

  /**
   * Optional theory objects used when generating projected understanding
   * candidates.
   */
  theories?: ExecutiveUnderstandingInput["theories"];
};

function conditionLabels(
  simulatedOrganizationState: SimulatedOrganizationState,
): Record<string, string> {
  return Object.fromEntries(
    simulatedOrganizationState.projectedConditions.map(
      (condition) => [
        condition.id,
        condition.name,
      ],
    ),
  );
}

/**
 * Builds the executive interpretation of a simulated organizational future.
 *
 * This function contains no independent reasoning algorithms. It composes
 * canonical producers for Prediction Reflection, Executive Assessment, and
 * Executive Understanding so improvements to those producers automatically
 * improve simulation scenarios.
 */
export function buildSimulationScenario({
  intervention,
  simulatedOrganizationState,
  projectedOrganizationalState,
  judgments,
  mechanisms = [],
  conceptCandidates = [],
  conceptualUnderstanding = [],
  organizationalBeliefs =
    simulatedOrganizationState.projectedBeliefs,
  investigationOpportunities = [],
  theories = [],
}: BuildSimulationScenarioInput): SimulationScenario {
  const projectedPredictionReflection =
    buildPredictionReflection({
      predictions:
        simulatedOrganizationState.projectedPredictions,

      priorityConditionIds:
        projectedOrganizationalState.dominantConditions,

      labels: {
        conditionLabels:
          conditionLabels(
            simulatedOrganizationState,
          ),
      },
    });

  const projectedExecutiveAssessment =
    buildExecutiveAssessment({
      judgments,
      mechanisms,
      conceptCandidates,
      conceptualUnderstanding,
      organizationalBeliefs,
      organizationalConditions:
        simulatedOrganizationState.projectedConditions,
      organizationalState:
        projectedOrganizationalState,
      investigationOpportunities,
      predictionReflection:
        projectedPredictionReflection,
      generatedAt:
        simulatedOrganizationState.simulatedAt,
    });

  const projectedUnderstandingCandidates =
    buildExecutiveUnderstandingCandidates({
      executiveAssessment:
        projectedExecutiveAssessment,

      organizationalState:
        projectedOrganizationalState,

      organizationalConditions:
        simulatedOrganizationState.projectedConditions,

      organizationalBeliefs:
        simulatedOrganizationState.projectedBeliefs,

      theories,

      mechanisms,
    });

  return {
    intervention,
    simulatedOrganizationState,
    projectedPredictionReflection,
    projectedExecutiveAssessment,
    projectedUnderstandingCandidates,
  };
}
