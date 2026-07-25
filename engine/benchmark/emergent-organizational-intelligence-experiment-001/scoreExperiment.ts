import type {
  FutureOutcome,
  ModelId,
  ModelScore,
  RegisteredDecision,
  ScoringTruth,
} from "./types";

const average = (values: number[]) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

export function scoreExperiment(
  predictions: RegisteredDecision[],
  truth: ScoringTruth[],
  futures: FutureOutcome[],
): Record<ModelId, ModelScore> {
  const truthById = new Map(truth.map((item) => [item.scenarioId, item]));
  const futureById = new Map(futures.map((item) => [item.scenarioId, item]));
  const models: ModelId[] = [
    "best-silo",
    "majority",
    "summary",
    "state",
    "canonical-combined",
    "emergent",
  ];
  return Object.fromEntries(
    models.map((modelId) => {
      const rows = predictions
        .filter((item) => item.modelId === modelId)
        .map((item) => {
          const expected = truthById.get(item.scenarioId)!;
          const future = futureById.get(item.scenarioId)!;
          const explanationCorrect = expected.shouldAbstain
            ? item.abstained
            : item.mechanismId === expected.expectedMechanismId;
          const predictionCorrect = expected.shouldAbstain
            ? item.abstained
            : item.predictedOutcome === expected.expectedOutcome &&
              future.observedOutcome === expected.expectedOutcome;
          const interventionCorrect = expected.shouldAbstain
            ? item.abstained
            : item.recommendedIntervention === expected.effectiveIntervention &&
              future.effectiveIntervention === expected.effectiveIntervention;
          const actual = explanationCorrect ? 1 : 0;
          const calibratedConfidence = item.abstained
            ? 1 - item.confidence
            : item.confidence;
          return {
            explanation: explanationCorrect ? 1 : 0,
            prediction: predictionCorrect ? 1 : 0,
            intervention: interventionCorrect ? 1 : 0,
            crossSilo:
              item.abstained ||
              expected.requiredSilos.length < 2 ||
              item.supportingEvidenceIds.length >= expected.requiredSilos.length
                ? 1
                : 0,
            individual:
              expected.requiredSilos.length > 1 && item.mechanismId
                ? 1
                : expected.shouldAbstain
                  ? 1
                  : 0,
            mechanism: item.abstained || Boolean(item.mechanismId) ? 1 : 0,
            novelty:
              item.abstained ||
              !item.supportingEvidenceIds.some((id) =>
                item.explanation.includes(id),
              )
                ? 1
                : 0,
            lineage:
              item.abstained || item.supportingEvidenceIds.length > 0 ? 1 : 0,
            counterevidence: item.confidence <= 0.9 ? 1 : 0,
            abstention: expected.shouldAbstain === item.abstained ? 1 : 0,
            calibration: Math.abs(calibratedConfidence - actual),
          };
        });
      const score: ModelScore = {
        explanationAccuracy: round(average(rows.map((row) => row.explanation))),
        predictionAccuracy: round(average(rows.map((row) => row.prediction))),
        interventionQuality: round(average(rows.map((row) => row.intervention))),
        crossSiloNecessity: round(average(rows.map((row) => row.crossSilo))),
        individualRecoverability: round(average(rows.map((row) => row.individual))),
        mechanisticGrounding: round(average(rows.map((row) => row.mechanism))),
        relationalNovelty: round(average(rows.map((row) => row.novelty))),
        lineage: round(average(rows.map((row) => row.lineage))),
        counterevidence: round(average(rows.map((row) => row.counterevidence))),
        abstention: round(average(rows.map((row) => row.abstention))),
        calibrationError: round(average(rows.map((row) => row.calibration))),
        total: 0,
      };
      score.total = round(
        score.explanationAccuracy * 16 +
          score.predictionAccuracy * 18 +
          score.interventionQuality * 16 +
          score.crossSiloNecessity * 8 +
          score.individualRecoverability * 7 +
          score.mechanisticGrounding * 8 +
          score.relationalNovelty * 7 +
          score.lineage * 7 +
          score.counterevidence * 4 +
          score.abstention * 7 +
          (1 - score.calibrationError) * 2,
      );
      return [modelId, score];
    }),
  ) as Record<ModelId, ModelScore>;
}
