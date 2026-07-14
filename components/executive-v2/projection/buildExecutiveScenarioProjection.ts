import type {
  ExecutiveScenarioResult,
} from "../../../engine/v3/scenarios/runExecutiveScenario";

import type {
  ExecutiveScenarioProjection,
} from "./ExecutiveScenarioProjection";

/**
 * Converts canonical scenario cognition into a stable executive-facing
 * contract.
 *
 * This function performs no new organizational reasoning and does not alter
 * the scenario result.
 */
export function buildExecutiveScenarioProjection(
  organizationId: string,
  result: ExecutiveScenarioResult,
): ExecutiveScenarioProjection {
  return {
    generatedAt:
      result.simulatedOrganizationState
        .simulatedAt,

    organizationId,

    intervention:
      result.intervention,

    summary: {
      title:
        result.intervention.title,

      description:
        result.intervention.description,

      rationale:
        result.intervention.rationale,

      confidence:
        result.intervention.confidence,

      timeHorizon:
        result.intervention.timeHorizon,
    },

    projectedFuture: {
      simulatedOrganizationState:
        result.simulatedOrganizationState,

      predictionReflection:
        result.scenario
          .projectedPredictionReflection,

      executiveAssessment:
        result.scenario
          .projectedExecutiveAssessment,

      understandingCandidates:
        result.scenario
          .projectedUnderstandingCandidates,
    },

    comparison:
      result.comparison,
  };
}