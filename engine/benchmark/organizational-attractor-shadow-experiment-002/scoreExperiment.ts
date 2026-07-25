import type {
  FutureOutcome,
  ModelScore,
  RegisteredPrediction,
  ScoringTruth,
} from "./types";

const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;
const average = (values: number[]) =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;

export function scorePredictions(
  predictions: RegisteredPrediction[],
  futures: FutureOutcome[],
  truth: ScoringTruth[],
): Record<RegisteredPrediction["modelId"], ModelScore> {
  const futureById = new Map(futures.map((item) => [item.scenarioId, item]));
  const truthById = new Map(truth.map((item) => [item.scenarioId, item]));
  const modelIds: RegisteredPrediction["modelId"][] = [
    "state",
    "mechanisms",
    "combined",
    "attractor",
  ];

  return Object.fromEntries(
    modelIds.map((modelId) => {
      const selected = predictions.filter((item) => item.modelId === modelId);
      const rows = selected.map((item) => {
        const expected = truthById.get(item.scenarioId)!;
        const future = futureById.get(item.scenarioId)!;
        const correct = expected.shouldAbstain
          ? item.abstained
          : !item.abstained &&
            item.predictedConditionId === expected.expectedConditionId &&
            future.realizedConditionIds.includes(item.predictedConditionId!);
        const confidenceForCalibration = item.abstained
          ? 1 - item.confidence
          : item.confidence;
        return {
          correct: correct ? 1 : 0,
          trigger: item.abstained
            ? expected.shouldAbstain
              ? 1
              : 0
            : item.triggeringCondition.length > 15 && future.triggerObserved
              ? 1
              : 0,
          conditional:
            item.abstained || item.triggeringCondition.includes(" AND ") ? 1 : 0.5,
          restoration:
            expected.family !== "temporary-change" ||
            item.predictedConditionId === expected.expectedConditionId
              ? 1
              : 0,
          mechanism:
            item.abstained ||
            item.supportingArtifactIds.some(
              (id) =>
                !id.startsWith("state-") && !id.startsWith("condition-"),
            )
              ? 1
              : 0,
          temporal:
            item.abstained ||
            item.supportingArtifactIds.filter((id) => id.startsWith("state-"))
              .length >= 2
              ? 1
              : 0,
          falsifiable:
            item.abstained || item.falsificationCondition.length > 20 ? 1 : 0,
          counterevidence:
            item.confidence <= 0.9 ? 1 : 0,
          abstention:
            expected.shouldAbstain === item.abstained ? 1 : 0,
          calibration: Math.abs(confidenceForCalibration - (correct ? 1 : 0)),
        };
      });
      const score: ModelScore = {
        accuracy: round(average(rows.map((row) => row.correct))),
        triggerAccuracy: round(average(rows.map((row) => row.trigger))),
        conditionalSpecificity: round(
          average(rows.map((row) => row.conditional)),
        ),
        restorationDetection: round(
          average(rows.map((row) => row.restoration)),
        ),
        mechanisticGrounding: round(
          average(rows.map((row) => row.mechanism)),
        ),
        temporalGrounding: round(average(rows.map((row) => row.temporal))),
        falsifiability: round(
          average(rows.map((row) => row.falsifiable)),
        ),
        counterevidenceIntegration: round(
          average(rows.map((row) => row.counterevidence)),
        ),
        abstentionQuality: round(
          average(rows.map((row) => row.abstention)),
        ),
        calibrationError: round(
          average(rows.map((row) => row.calibration)),
        ),
        total: 0,
      };
      score.total = round(
        score.accuracy * 25 +
          score.triggerAccuracy * 10 +
          score.conditionalSpecificity * 10 +
          score.restorationDetection * 10 +
          score.mechanisticGrounding * 10 +
          score.temporalGrounding * 10 +
          score.falsifiability * 8 +
          score.counterevidenceIntegration * 5 +
          score.abstentionQuality * 10 +
          (1 - score.calibrationError) * 2,
      );
      return [modelId, score];
    }),
  ) as Record<RegisteredPrediction["modelId"], ModelScore>;
}
