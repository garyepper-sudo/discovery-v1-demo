import type { OrganizationalBelief } from "../beliefs/organizationalBeliefs";
import type {
  OrganizationalCausalModel,
} from "../causal/organizationalCausalModel";
import {
  propagateOrganizationalInfluence,
  type OrganizationalInfluencePropagationResult,
} from "../causal/propagateOrganizationalInfluence";
import type { OrganizationalLearningProfile } from "../learning/computeOrganizationalLearningProfile";
import type { PredictionEvaluation } from "../predictions/evaluatePredictionOutcomes";
import type { OrganizationalPrediction } from "../predictions/organizationalPrediction";
import type { OrganizationalCondition } from "../state/inferOrganizationalConditions";
import type { OrganizationalIntervention } from "./organizationalIntervention";

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
   * Intentional organizational change applied to this simulation.
   */
  intervention?: OrganizationalIntervention;

  /**
   * Explainable causal effects produced by applying the
   * intervention to the current organizational causal model.
   *
   * Version 2 preserves these effects without yet mutating the
   * projected condition, belief, or prediction objects.
   */
  influencePropagation?: OrganizationalInfluencePropagationResult;

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

  intervention?: OrganizationalIntervention;

  /**
   * Current causal model used to propagate an intervention.
   */
  causalModel?: OrganizationalCausalModel | null;

  /**
   * Organizational entity directly changed by the intervention.
   */
  changedEntityId?: string;

  /**
   * Signed normalized change between -1 and 1.
   *
   * Positive means improvement or increase.
   * Negative means deterioration or decrease.
   */
  interventionDelta?: number;

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

function buildInfluencePropagation(
  input: SimulateOrganizationInput,
): OrganizationalInfluencePropagationResult | undefined {
  if (
    !input.causalModel ||
    !input.changedEntityId ||
    input.interventionDelta === undefined
  ) {
    return undefined;
  }

  return propagateOrganizationalInfluence({
    causalModel: input.causalModel,
    changedEntityId: input.changedEntityId,
    delta: input.interventionDelta,
  });
}

export function simulateOrganization(
  input: SimulateOrganizationInput,
): SimulatedOrganizationState {
  const simulatedAt =
    input.simulatedAt ??
    new Date().toISOString();

  const timeHorizon =
    input.intervention?.timeHorizon ??
    input.timeHorizon ??
    "near-term";

  /**
   * Version 2:
   *
   * Preserve the current organizational state while:
   *
   * - calibrating confidence using historical prediction performance,
   * - applying an optional intervention to the causal model,
   * - and preserving the resulting direct and indirect effects.
   *
   * A later version will use those propagated effects to evolve
   * conditions, beliefs, and predictions into a changed future state.
   */
  const influencePropagation =
    buildInfluencePropagation(input);

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

    intervention:
      input.intervention,

    influencePropagation,

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
      influencePropagation
        ? `Discovery simulated a direct change to "${input.changedEntityId}" and propagated its effects across ${influencePropagation.traversedRelationshipIds.length} causal relationship${influencePropagation.traversedRelationshipIds.length === 1 ? "" : "s"}. Version 2 preserves those effects without yet mutating the projected organizational state.`
        : input.intervention
          ? `Discovery simulated the intervention "${input.intervention.title}" against the current organizational state. No causal propagation was performed because a target entity, intervention delta, or causal model was not supplied.`
          : "Discovery projected the current organizational state forward while calibrating confidence using historical prediction accuracy. No intervention was applied.",
  };
}