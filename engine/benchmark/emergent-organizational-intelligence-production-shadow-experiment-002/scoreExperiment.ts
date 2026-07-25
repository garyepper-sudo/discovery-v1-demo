import type {
  HeldOutFuture,
  ModelId,
  ModelScore,
  RegisteredOrganizationalPrediction,
  ScoringTruth,
} from "./types";

const normalize = (value: string) => value.toLowerCase();
const containsTerms = (value: string, terms: string[]) =>
  terms.length > 0 && terms.every((term) => normalize(value).includes(term));
const average = (values: number[]) =>
  values.length
    ? values.reduce((sum, value) => sum + value, 0) / values.length
    : 0;
const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

type Row = {
  mechanism: number;
  prediction: number;
  intervention: number;
  abstention: number;
  lineage: number;
  calibration: number;
};

function row(
  item: RegisteredOrganizationalPrediction,
  truth: ScoringTruth,
  future: HeldOutFuture,
): Row {
  if (!truth.emergentExpected) {
    return {
      mechanism: item.abstained ? 1 : 0,
      prediction: item.abstained ? 1 : 0,
      intervention: item.abstained ? 1 : 0,
      abstention: item.abstained ? 1 : 0,
      lineage: item.abstained ? 1 : 0,
      calibration: Math.abs((1 - item.confidence) - (item.abstained ? 1 : 0)),
    };
  }
  const explanation = `${item.explanation} ${item.predictedOutcome}`;
  const mechanism = containsTerms(
    explanation,
    truth.expectedMechanismTerms,
  );
  const prediction =
    containsTerms(item.predictedOutcome, truth.expectedOutcomeTerms) &&
    future.outcomeTerms.some((term) =>
      normalize(item.predictedOutcome).includes(term),
    );
  const intervention =
    containsTerms(
      item.recommendedIntervention,
      truth.expectedInterventionTerms,
    ) &&
    future.effectiveInterventionTerms.some((term) =>
      normalize(item.recommendedIntervention).includes(term),
    );
  return {
    mechanism: mechanism ? 1 : 0,
    prediction: prediction ? 1 : 0,
    intervention: intervention ? 1 : 0,
    abstention: item.abstained ? 0 : 1,
    lineage:
      item.supportingEvidenceIds.length > 0 &&
      item.supportingCognitionArtifactIds.length > 0
        ? 1
        : 0,
    calibration: Math.abs(item.confidence - (mechanism ? 1 : 0)),
  };
}

export function scoreExperiment(
  predictions: RegisteredOrganizationalPrediction[],
  truth: ScoringTruth[],
  futures: HeldOutFuture[],
): Record<ModelId, ModelScore> {
  const truthById = new Map(truth.map((item) => [item.scenarioId, item]));
  const futureById = new Map(futures.map((item) => [item.scenarioId, item]));
  const models: ModelId[] = [
    "best-silo",
    "local-aggregation",
    "generic-summary",
    "production-state",
    "production-combined",
    "verbal-projection",
  ];
  return Object.fromEntries(
    models.map((modelId) => {
      const byScenario = new Map<string, Row[]>();
      for (const item of predictions.filter(
        (prediction) => prediction.modelId === modelId,
      )) {
        const score = row(
          item,
          truthById.get(item.scenarioId)!,
          futureById.get(item.scenarioId)!,
        );
        byScenario.set(item.scenarioId, [
          ...(byScenario.get(item.scenarioId) ?? []),
          score,
        ]);
      }
      const rows = [...byScenario.values()].map((variants) =>
        variants.sort(
          (a, b) =>
            b.mechanism +
              b.prediction +
              b.intervention +
              b.abstention -
            (a.mechanism +
              a.prediction +
              a.intervention +
              a.abstention),
        )[0],
      );
      const result: ModelScore = {
        mechanismCorrectness: round(average(rows.map((item) => item.mechanism))),
        predictionAccuracy: round(average(rows.map((item) => item.prediction))),
        interventionAccuracy: round(
          average(rows.map((item) => item.intervention)),
        ),
        abstentionQuality: round(
          average(rows.map((item) => item.abstention)),
        ),
        lineage: round(average(rows.map((item) => item.lineage))),
        calibrationError: round(
          average(rows.map((item) => item.calibration)),
        ),
        total: 0,
      };
      result.total = round(
        result.mechanismCorrectness * 25 +
          result.predictionAccuracy * 25 +
          result.interventionAccuracy * 20 +
          result.abstentionQuality * 15 +
          result.lineage * 10 +
          (1 - result.calibrationError) * 5,
      );
      return [modelId, result];
    }),
  ) as Record<ModelId, ModelScore>;
}
