import type { OrganizationalBelief } from "../beliefs/organizationalBeliefs";
import type {
  OrganizationalCausalModel,
} from "../causal/organizationalCausalModel";
import {
  propagateOrganizationalInfluence,
  type OrganizationalInfluencePropagationResult,
} from "../causal/propagateOrganizationalInfluence";
import type { OrganizationalLearningProfile } from "../learning/computeOrganizationalLearningProfile";
import { inferOrganizationalPredictions } from "../predictions/inferOrganizationalPredictions";
import type { PredictionEvaluation } from "../predictions/evaluatePredictionOutcomes";
import type { OrganizationalPrediction } from "../predictions/organizationalPrediction";
import type { OrganizationalCondition } from "../state/inferOrganizationalConditions";
import { evolveConditions } from "./evolveConditions";
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
   * Version 4:
   *
   * - calibrate confidence using historical prediction performance,
   * - apply an optional intervention to the causal model,
   * - preserve the resulting direct and indirect effects,
   * - evolve projected organizational conditions from those effects,
   * - and regenerate projected predictions through the canonical
   *   Organizational Prediction producer.
   *
   * Beliefs remain preserved until the canonical belief producer can
   * consume simulated future inputs without recreating belief logic.
   */

  const influencePropagation =
    buildInfluencePropagation(input);

  const projectedConditions =
    evolveConditions(
      input.conditions,
      influencePropagation,
      simulatedAt,
    );

    const projectedPredictionResult =
  inferOrganizationalPredictions({
    conditions: projectedConditions.map(
      (condition) => ({
        id: condition.id,
        name: condition.name,
        domain: condition.domain,

        status: condition.status,
        trend: condition.trend,
        priority: condition.priority,

        confidence: condition.confidence,
        strength: condition.strength,

        supportingConceptIds:
          condition.supportingConceptIds,
        supportingBeliefIds:
          condition.supportingBeliefIds,
        supportingTheoryIds:
          condition.supportingTheoryIds,

        upstreamConditionIds:
          condition.upstreamConditionIds,
        downstreamConditionIds:
          condition.downstreamConditionIds,

        missingEvidence:
          condition.missingEvidence,
        confidenceLimiters:
          condition.confidenceLimiters,
      }),
    ),

    learningProfile:
      input.learningProfile ?? undefined,

    previousPredictions:
      input.predictions,

    now:
      simulatedAt,
  });

const projectedPredictions =
  projectedPredictionResult.predictions;

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

    projectedConditions,

    projectedBeliefs:
      input.beliefs,

    projectedPredictions,

    confidence:
      simulationConfidence,

    explanation:
      influencePropagation
        ? `Discovery simulated a direct change to "${input.changedEntityId}" and propagated its effects across ${influencePropagation.traversedRelationshipIds.length} causal relationship${influencePropagation.traversedRelationshipIds.length === 1 ? "" : "s"}. The propagated effects were applied to the projected organizational conditions.`
        : input.intervention
          ? `Discovery simulated the intervention "${input.intervention.title}" against the current organizational state. No causal propagation was performed because a target entity, intervention delta, or causal model was not supplied.`
          : "Discovery projected the current organizational state forward while calibrating confidence using historical prediction accuracy. No intervention was applied.",
  };
}
