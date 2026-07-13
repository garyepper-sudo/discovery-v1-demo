import type { OrganizationalCondition } from "../state/inferOrganizationalConditions";
import type { PredictionReflection } from "./buildPredictionReflection";
import {
  comparePredictionOutcome,
  type PredictionOutcomeComparison,
} from "./comparePredictionOutcome";
import type { OrganizationalPrediction } from "./organizationalPrediction";

export type PredictionOutcomeStatus =
  | "confirmed"
  | "partially-confirmed"
  | "not-confirmed"
  | "inconclusive";

export type PredictionEvaluation = {
  id: string;
  predictionId: string;
  evaluatedAt: string;

  outcomeStatus: PredictionOutcomeStatus;

  /**
   * Normalized prediction accuracy.
   *
   * 0 = incorrect
   * 1 = perfectly correct
   */
  accuracyScore: number;

  /**
   * Difference between observed prediction accuracy
   * and Discovery's original prediction confidence.
   *
   * Positive values indicate that Discovery was
   * underconfident.
   *
   * Negative values indicate that Discovery was
   * overconfident.
   */
  calibrationDelta: number;

  /**
   * Immediate confidence adjustment recommendation.
   *
   * This is intentionally smaller than the full
   * calibration delta so one evaluation does not
   * overcorrect future confidence.
   */
  confidenceAdjustment: number;

  /**
   * Recommended confidence after applying the
   * immediate confidence adjustment.
   */
  recommendedConfidence: number;

  outcomeSummary: string;
  evaluationExplanation: string;
  learningSignal: string;

  supportingEvidenceIds: string[];
};

export type EvaluatePredictionOutcomesInput = {
  /**
   * Predictions created during an earlier investigation.
   */
  predictions: OrganizationalPrediction[];

  /**
   * Current organizational conditions produced by the
   * later investigation.
   */
  observedConditions: OrganizationalCondition[];

  /**
   * Optional reflection associated with the previous
   * prediction set.
   *
   * The current evaluator preserves this input for
   * future assumption, falsification, and competing-
   * prediction analysis.
   */
  predictionReflection?: PredictionReflection;

  /**
   * Optional later executive summary of what occurred.
   *
   * Structured condition comparison remains canonical.
   * This summary supplements the generated explanation.
   */
  observedOutcomeSummary?: string;

  supportingEvidenceIds?: string[];

  evaluatedAt?: string;
};

function clamp01(value: number): number {
  return Math.max(
    0,
    Math.min(1, value),
  );
}

function clampAdjustment(value: number): number {
  return Math.max(
    -0.25,
    Math.min(0.25, value),
  );
}

/**
 * Calibration compares the prediction's original confidence
 * with its observed accuracy.
 *
 * Example:
 *
 * original confidence = 0.80
 * observed accuracy = 0.50
 * calibration delta = -0.30
 *
 * Discovery was overconfident by 30 percentage points.
 */
function deriveCalibrationDelta({
  prediction,
  comparison,
}: {
  prediction: OrganizationalPrediction;
  comparison: PredictionOutcomeComparison;
}): number {
  if (
    comparison.outcomeStatus ===
    "inconclusive"
  ) {
    return 0;
  }

  return clampAdjustment(
    comparison.accuracyScore -
      clamp01(prediction.confidence),
  );
}

/**
 * Discovery should learn from prediction performance without
 * fully replacing its prior confidence after one observation.
 *
 * Only half of the measured calibration delta is applied as
 * the immediate confidence adjustment.
 */
function deriveConfidenceAdjustment(
  calibrationDelta: number,
): number {
  return clampAdjustment(
    calibrationDelta * 0.5,
  );
}

function deriveRecommendedConfidence({
  prediction,
  confidenceAdjustment,
  outcomeStatus,
}: {
  prediction: OrganizationalPrediction;
  confidenceAdjustment: number;
  outcomeStatus: PredictionOutcomeStatus;
}): number {
  if (
    outcomeStatus ===
    "inconclusive"
  ) {
    return clamp01(
      prediction.confidence,
    );
  }

  return clamp01(
    prediction.confidence +
      confidenceAdjustment,
  );
}

function deriveLearningSignal({
  outcomeStatus,
  calibrationDelta,
}: {
  outcomeStatus: PredictionOutcomeStatus;
  calibrationDelta: number;
}): string {
  switch (outcomeStatus) {
    case "confirmed": {
      if (calibrationDelta > 0.05) {
        return "The prediction was confirmed and Discovery appears to have been underconfident. Increase confidence cautiously in similar prediction patterns.";
      }

      if (calibrationDelta < -0.05) {
        return "The prediction was confirmed, but the original confidence still exceeded observed accuracy. Preserve the reasoning pattern while improving calibration.";
      }

      return "The prediction was confirmed and confidence was reasonably calibrated. Preserve similar prediction patterns.";
    }

    case "partially-confirmed": {
      if (calibrationDelta < -0.05) {
        return "The prediction was only partially confirmed and Discovery was overconfident. Reduce confidence and improve prediction specificity.";
      }

      return "The prediction was partially confirmed. Refine the expected condition changes and gather more discriminating evidence.";
    }

    case "not-confirmed":
      return "The prediction was not confirmed. Revisit the supporting mechanisms, beliefs, theories, assumptions, and causal path before making similar predictions.";

    case "inconclusive":
    default:
      return "Preserve the prediction until sufficient later organizational evidence becomes available.";
  }
}

function buildEvaluationExplanation({
  prediction,
  comparison,
  calibrationDelta,
  confidenceAdjustment,
  observedOutcomeSummary,
}: {
  prediction: OrganizationalPrediction;
  comparison: PredictionOutcomeComparison;
  calibrationDelta: number;
  confidenceAdjustment: number;
  observedOutcomeSummary?: string;
}): string {
  const comparisonExplanation =
    comparison.explanation;

  const calibrationExplanation =
    comparison.outcomeStatus ===
    "inconclusive"
      ? "Confidence was not adjusted because the available later conditions were insufficient for a conclusive evaluation."
      : (
          `Observed accuracy was ${Math.round(
            comparison.accuracyScore * 100,
          )}% compared with the original confidence of ${Math.round(
            prediction.confidence * 100,
          )}%. ` +
          `The calibration delta was ${Math.round(
            calibrationDelta * 100,
          )} percentage point(s), producing an immediate confidence adjustment of ${Math.round(
            confidenceAdjustment * 100,
          )} percentage point(s).`
        );

  const executiveOutcome =
    observedOutcomeSummary?.trim()
      ? ` Later executive outcome summary: ${observedOutcomeSummary.trim()}`
      : "";

  return [
    comparisonExplanation,
    calibrationExplanation,
    executiveOutcome,
  ]
    .filter(Boolean)
    .join(" ");
}

function evaluatePrediction({
  prediction,
  input,
  evaluatedAt,
}: {
  prediction: OrganizationalPrediction;
  input: EvaluatePredictionOutcomesInput;
  evaluatedAt: string;
}): PredictionEvaluation {
  const comparison =
    comparePredictionOutcome({
      prediction,

      observedConditions:
        input.observedConditions,

      comparedAt:
        evaluatedAt,

      supportingEvidenceIds:
        input.supportingEvidenceIds,
    });

  const outcomeStatus:
    PredictionOutcomeStatus =
      comparison.outcomeStatus;

  const calibrationDelta =
    deriveCalibrationDelta({
      prediction,
      comparison,
    });

  const confidenceAdjustment =
    deriveConfidenceAdjustment(
      calibrationDelta,
    );

  const recommendedConfidence =
    deriveRecommendedConfidence({
      prediction,
      confidenceAdjustment,
      outcomeStatus,
    });

  return {
    id:
      `prediction-evaluation-${prediction.id}-${evaluatedAt}`,

    predictionId:
      prediction.id,

    evaluatedAt,

    outcomeStatus,

    accuracyScore:
      comparison.accuracyScore,

    calibrationDelta,

    confidenceAdjustment,

    recommendedConfidence,

    outcomeSummary:
      comparison.outcomeSummary,

    evaluationExplanation:
      buildEvaluationExplanation({
        prediction,
        comparison,
        calibrationDelta,
        confidenceAdjustment,
        observedOutcomeSummary:
          input.observedOutcomeSummary,
      }),

    learningSignal:
      deriveLearningSignal({
        outcomeStatus,
        calibrationDelta,
      }),

    supportingEvidenceIds:
      comparison.supportingEvidenceIds,
  };
}

export function evaluatePredictionOutcomes(
  input: EvaluatePredictionOutcomesInput,
): PredictionEvaluation[] {
  const evaluatedAt =
    input.evaluatedAt ??
    new Date().toISOString();

  if (
    input.predictions.length === 0
  ) {
    return [];
  }

  return input.predictions.map(
    (prediction) =>
      evaluatePrediction({
        prediction,
        input,
        evaluatedAt,
      }),
  );
}