import type { OrganizationalCondition } from "../state/inferOrganizationalConditions";
import type { OrganizationalBelief } from "../beliefs/organizationalBeliefs";
import type { OrganizationalPrediction } from "../predictions/organizationalPrediction";
import type { PredictionEvaluation } from "../predictions/evaluatePredictionOutcomes";
import type { OrganizationalLearningProfile } from "../learning/computeOrganizationalLearningProfile";

export type SimulatedOrganizationState = {
  /**
   * Stable identity for this simulated future.
   */
  id: string;

  /**
   * Source organization being simulated.
   */
  organizationId: string;

  /**
   * Simulation timestamp.
   */
  simulatedAt: string;

  /**
   * Relative future horizon.
   */
  timeHorizon:
    | "immediate"
    | "near-term"
    | "medium-term"
    | "long-term";

  /**
   * Projected organizational conditions.
   */
  projectedConditions: OrganizationalCondition[];

  /**
   * Projected organizational beliefs.
   */
  projectedBeliefs: OrganizationalBelief[];

  /**
   * Predictions that remain active in this future.
   */
  projectedPredictions: OrganizationalPrediction[];

  /**
   * Confidence Discovery assigns to the simulated future.
   */
  confidence: number;

  /**
   * Executive explanation of why this future was projected.
   */
  explanation: string;
};

export type SimulateOrganizationInput = {
  organizationId: string;

  conditions: OrganizationalCondition[];

  beliefs: OrganizationalBelief[];

  predictions: OrganizationalPrediction[];

  predictionEvaluations: PredictionEvaluation[];

  learningProfile?: OrganizationalLearningProfile | null;

  simulatedAt?: string;

  timeHorizon?: SimulatedOrganizationState["timeHorizon"];
};

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function averagePredictionAccuracy(
  evaluations: PredictionEvaluation[],
): number {
  if (evaluations.length === 0) {
    return 0.5;
  }

  return (
    evaluations.reduce(
      (sum, evaluation) =>
        sum + evaluation.accuracyScore,
      0,
    ) / evaluations.length
  );
}

export function simulateOrganization(
  input: SimulateOrganizationInput,
): SimulatedOrganizationState {
  const simulatedAt =
    input.simulatedAt ??
    new Date().toISOString();

  const timeHorizon =
    input.timeHorizon ??
    "near-term";

  /**
   * Version 1:
   *
   * Preserve the current organizational state while
   * weighting confidence using historical prediction
   * performance.
   *
   * Later versions will evolve conditions and beliefs.
   */
  const simulationConfidence =
    clamp01(
      averagePredictionAccuracy(
        input.predictionEvaluations,
      ),
    );

  return {
    id:
      `simulation-${input.organizationId}-${simulatedAt}`,

    organizationId:
      input.organizationId,

    simulatedAt,

    timeHorizon,

    projectedConditions:
      input.conditions,

    projectedBeliefs:
      input.beliefs,

    projectedPredictions:
      input.predictions,

    confidence:
      simulationConfidence,

    explanation:
      "Version 1 projects the current organizational state forward while calibrating confidence using historical prediction accuracy. Future versions will evolve conditions, beliefs, and predictions over simulated time.",
  };
}