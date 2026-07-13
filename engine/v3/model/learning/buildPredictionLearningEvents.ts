import type { PredictionEvaluation } from "../predictions/evaluatePredictionOutcomes";
import type { OrganizationalLearningEvent } from "./computeOrganizationalLearningProfile";

export type BuildPredictionLearningEventsInput = {
  predictionEvaluations: PredictionEvaluation[];
  investigationId: string;
  timestamp?: string;
};

function deriveChangeType(
  outcomeStatus: PredictionEvaluation["outcomeStatus"],
): OrganizationalLearningEvent["changeType"] {
  switch (outcomeStatus) {
    case "confirmed":
      return "strengthened";

    case "partially-confirmed":
      return "stable";

    case "not-confirmed":
      return "weakened";

    case "inconclusive":
    default:
      return "unchanged";
  }
}

function deriveReason(
  evaluation: PredictionEvaluation,
): string {
  return [
    evaluation.learningSignal,
    evaluation.evaluationExplanation,
  ]
    .filter((value) => value.trim().length > 0)
    .join(" ");
}

export function buildPredictionLearningEvents({
  predictionEvaluations,
  investigationId,
  timestamp,
}: BuildPredictionLearningEventsInput): OrganizationalLearningEvent[] {
  const eventTimestamp =
    timestamp ?? new Date().toISOString();

  return predictionEvaluations.map(
    (evaluation): OrganizationalLearningEvent => ({
      id: `learning-${investigationId}-${evaluation.id}`,

      investigationId,

      timestamp:
        evaluation.evaluatedAt ??
        eventTimestamp,

      objectType: "prediction",

      objectId:
        evaluation.predictionId,

      changeType:
        deriveChangeType(
          evaluation.outcomeStatus,
        ),

      previousConfidence:
        evaluation.recommendedConfidence -
        evaluation.confidenceAdjustment,

      currentConfidence:
        evaluation.recommendedConfidence,

      confidenceDelta:
        evaluation.confidenceAdjustment,

      reason:
        deriveReason(evaluation),
    }),
  );
}