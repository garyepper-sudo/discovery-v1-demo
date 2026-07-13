import type { OrganizationalLearningEvent } from "./computeOrganizationalLearningProfile";

export type ConfidenceCalibrationTrend =
  | "improving"
  | "stable"
  | "declining";

export type PredictionLearningSummary = {
  predictionsEvaluated: number;

  confirmed: number;
  partiallyConfirmed: number;
  notConfirmed: number;
  inconclusive: number;

  averagePredictionAccuracy: number;
  averageCalibrationDelta: number;
  forecastReliability: number;

  confidenceCalibrationTrend:
    ConfidenceCalibrationTrend;

  summary: string;
};

export type BuildPredictionLearningSummaryInput = {
  learningEvents:
    OrganizationalLearningEvent[];
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;

  return Math.max(
    0,
    Math.min(1, value),
  );
}

function percent(value: number): number {
  return Math.round(
    clamp01(value) * 100,
  );
}

function average(values: number[]): number {
  const validValues =
    values.filter(Number.isFinite);

  if (validValues.length === 0) {
    return 0;
  }

  return (
    validValues.reduce(
      (sum, value) => sum + value,
      0,
    ) / validValues.length
  );
}

function outcomeStatusFromChangeType(
  changeType: string,
):
  | "confirmed"
  | "partially-confirmed"
  | "not-confirmed"
  | "inconclusive" {
  switch (changeType) {
    case "strengthened":
    case "strengthening":
      return "confirmed";

    case "stable":
    case "stabilized":
      return "partially-confirmed";

    case "weakened":
    case "weakening":
    case "contradicted":
      return "not-confirmed";

    case "unchanged":
    default:
      return "inconclusive";
  }
}

function deriveCalibrationTrend(
  events:
    OrganizationalLearningEvent[],
): ConfidenceCalibrationTrend {
  const confidenceDeltas =
    events
      .map(
        (event) =>
          event.confidenceDelta,
      )
      .filter(
        (
          value,
        ): value is number =>
          typeof value === "number" &&
          Number.isFinite(value),
      );

  if (
    confidenceDeltas.length === 0
  ) {
    return "stable";
  }

  const averageDelta =
    average(confidenceDeltas);

  if (averageDelta > 0.02) {
    return "improving";
  }

  if (averageDelta < -0.02) {
    return "declining";
  }

  return "stable";
}

function deriveAccuracy(
  event:
    OrganizationalLearningEvent,
): number {
  const outcomeStatus =
    outcomeStatusFromChangeType(
      event.changeType,
    );

  switch (outcomeStatus) {
    case "confirmed":
      return 1;

    case "partially-confirmed":
      return 0.5;

    case "not-confirmed":
      return 0;

    case "inconclusive":
    default:
      return 0;
  }
}

function buildSummary(params: {
  predictionsEvaluated: number;
  confirmed: number;
  partiallyConfirmed: number;
  notConfirmed: number;
  inconclusive: number;
  forecastReliability: number;
  confidenceCalibrationTrend:
    ConfidenceCalibrationTrend;
}): string {
  if (
    params.predictionsEvaluated === 0
  ) {
    return "Discovery has not yet evaluated enough prior predictions to measure forecast reliability.";
  }

  return [
    `Discovery evaluated ${params.predictionsEvaluated} prediction(s).`,
    `${params.confirmed} were confirmed, ${params.partiallyConfirmed} were partially confirmed, ${params.notConfirmed} were not confirmed, and ${params.inconclusive} remain inconclusive.`,
    `Forecast reliability is ${params.forecastReliability}%.`,
    `Confidence calibration is ${params.confidenceCalibrationTrend}.`,
  ].join(" ");
}

export function buildPredictionLearningSummary({
  learningEvents,
}: BuildPredictionLearningSummaryInput): PredictionLearningSummary {
  const predictionEvents =
    learningEvents.filter(
      (event) =>
        event.objectType ===
        "prediction",
    );

  const outcomes =
    predictionEvents.map(
      (event) => ({
        event,
        outcomeStatus:
          outcomeStatusFromChangeType(
            event.changeType,
          ),
      }),
    );

  const confirmed =
    outcomes.filter(
      ({ outcomeStatus }) =>
        outcomeStatus ===
        "confirmed",
    ).length;

  const partiallyConfirmed =
    outcomes.filter(
      ({ outcomeStatus }) =>
        outcomeStatus ===
        "partially-confirmed",
    ).length;

  const notConfirmed =
    outcomes.filter(
      ({ outcomeStatus }) =>
        outcomeStatus ===
        "not-confirmed",
    ).length;

  const inconclusive =
    outcomes.filter(
      ({ outcomeStatus }) =>
        outcomeStatus ===
        "inconclusive",
    ).length;

  const conclusiveEvents =
    outcomes.filter(
      ({ outcomeStatus }) =>
        outcomeStatus !==
        "inconclusive",
    );

  const averagePredictionAccuracy =
    percent(
      average(
        conclusiveEvents.map(
          ({ event }) =>
            deriveAccuracy(event),
        ),
      ),
    );

  const averageCalibrationDelta =
    Math.round(
      average(
        predictionEvents
          .map(
            (event) =>
              event.confidenceDelta,
          )
          .filter(
            (
              value,
            ): value is number =>
              typeof value ===
                "number" &&
              Number.isFinite(value),
          ),
      ) * 100,
    );

  const forecastReliability =
    percent(
      conclusiveEvents.length === 0
        ? 0
        : (
            confirmed +
            partiallyConfirmed *
              0.5
          ) /
            conclusiveEvents.length,
    );

  const confidenceCalibrationTrend =
    deriveCalibrationTrend(
      predictionEvents,
    );

  return {
    predictionsEvaluated:
      predictionEvents.length,

    confirmed,
    partiallyConfirmed,
    notConfirmed,
    inconclusive,

    averagePredictionAccuracy,
    averageCalibrationDelta,
    forecastReliability,

    confidenceCalibrationTrend,

    summary:
      buildSummary({
        predictionsEvaluated:
          predictionEvents.length,
        confirmed,
        partiallyConfirmed,
        notConfirmed,
        inconclusive,
        forecastReliability,
        confidenceCalibrationTrend,
      }),
  };
}