import { DISCOVERY_INTELLIGENCE_CORPUS } from "./corpus";
import { DISCOVERY_INTELLIGENCE_SCORECARD } from "./scorecard";
import type {
  DimensionScore,
  IntelligenceEvaluation,
  IntelligenceReport,
  IntelligenceTrendPoint,
  MetricObservation,
  ScenarioEvaluationInput,
} from "./types";

export const DISCOVERY_INTELLIGENCE_FRAMEWORK_VERSION = "1.0.0";

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function assertScore(value: number | null, metricId: string): void {
  if (value !== null && (!Number.isFinite(value) || value < 0 || value > 10)) {
    throw new Error(`${metricId} must be null or a finite score from 0 to 10.`);
  }
}

function buildDimensionScores(
  observations: MetricObservation[],
): DimensionScore[] {
  const byMetric = new Map(observations.map((item) => [item.metricId, item]));

  if (byMetric.size !== observations.length) {
    throw new Error("Metric observations must have unique metric IDs.");
  }

  const knownMetrics = new Set(
    DISCOVERY_INTELLIGENCE_SCORECARD.flatMap((dimension) =>
      dimension.metrics.map((metric) => metric.id),
    ),
  );
  for (const observation of observations) {
    if (!knownMetrics.has(observation.metricId)) {
      throw new Error(`Unknown intelligence metric: ${observation.metricId}`);
    }
    assertScore(observation.value, observation.metricId);
    if ([...observation.evidenceRefs].sort().join("|") !== observation.evidenceRefs.join("|")) {
      throw new Error(`${observation.metricId} evidence references must be sorted.`);
    }
  }

  return DISCOVERY_INTELLIGENCE_SCORECARD.map((dimension) => {
    const metrics = dimension.metrics.map((definition) => {
      const observation = byMetric.get(definition.id) ?? {
        metricId: definition.id,
        value: null,
        kind: definition.kind,
        evidenceRefs: [],
      };
      if (observation.kind !== definition.kind) {
        throw new Error(
          `${definition.id} must use ${definition.kind} measurement.`,
        );
      }
      return { ...observation, dimensionId: dimension.id };
    });
    const scored = metrics.filter(
      (item): item is typeof item & { value: number } => item.value !== null,
    );
    const score =
      scored.length === 0
        ? null
        : round(
            scored.reduce((sum, item) => sum + item.value, 0) / scored.length,
          );
    return {
      id: dimension.id,
      role: dimension.role,
      score,
      confidence: round(scored.length / dimension.metrics.length),
      metrics,
    };
  });
}

function deriveRecommendation(
  objectiveScore: number | null,
  dimensions: DimensionScore[],
  confidence: number,
): IntelligenceEvaluation["recommendation"] {
  const truthfulness = dimensions.find((item) => item.id === "truthfulness");
  const stewardship = dimensions.find((item) => item.id === "model_stewardship");
  if (
    (truthfulness?.score !== null && (truthfulness?.score ?? 10) < 8) ||
    (stewardship?.score !== null && (stewardship?.score ?? 10) < 9)
  ) {
    return "block";
  }
  if (confidence < 0.6) return "human_review_required";
  return objectiveScore !== null && objectiveScore >= 8 ? "promote" : "hold";
}

export function evaluateDiscoveryIntelligence(
  input: ScenarioEvaluationInput,
): IntelligenceEvaluation {
  const scenario = DISCOVERY_INTELLIGENCE_CORPUS.find(
    (item) => item.id === input.scenarioId,
  );
  if (!scenario) throw new Error(`Unknown scenario: ${input.scenarioId}`);
  if (scenario.organizationId !== input.organizationId) {
    throw new Error("Evaluation organization does not match scenario scope.");
  }

  const dimensions = buildDimensionScores(input.observations);
  const objective = dimensions.find(
    (item) => item.role === "optimization_target",
  );
  if (!objective) {
    throw new Error("The scorecard requires one optimization target.");
  }
  const totalMetrics = dimensions.reduce(
    (sum, item) => sum + item.metrics.length,
    0,
  );
  const scoredMetrics = dimensions.reduce(
    (sum, item) =>
      sum + item.metrics.filter((metric) => metric.value !== null).length,
    0,
  );
  const overallScore = objective.score;
  const confidence = round(
    totalMetrics === 0 ? 0 : scoredMetrics / totalMetrics,
  );
  const constraints = dimensions
    .filter((item) => item.role === "hard_constraint")
    .map((item) => {
      const threshold = item.id === "truthfulness" ? 8 : 9;
      return {
        id: item.id,
        score: item.score,
        threshold,
        passed: item.score !== null && item.score >= threshold,
      };
    });

  return {
    frameworkVersion: DISCOVERY_INTELLIGENCE_FRAMEWORK_VERSION,
    scenarioId: scenario.id,
    organizationId: scenario.organizationId,
    overallScore,
    confidence,
    dimensions,
    constraints,
    recommendation: deriveRecommendation(overallScore, dimensions, confidence),
    regressions: [],
  };
}

function dimensionMap(
  evaluation: IntelligenceEvaluation,
): Partial<Record<DimensionScore["id"], number>> {
  return Object.fromEntries(
    evaluation.dimensions
      .filter((item): item is DimensionScore & { score: number } => item.score !== null)
      .map((item) => [item.id, item.score]),
  );
}

export function toTrendPoint(
  label: string,
  evaluation: IntelligenceEvaluation,
): IntelligenceTrendPoint {
  return {
    label,
    frameworkVersion: evaluation.frameworkVersion,
    overallScore: evaluation.overallScore,
    dimensionScores: dimensionMap(evaluation),
  };
}

export function createDiscoveryIntelligenceReport(args: {
  current: IntelligenceEvaluation;
  historicalTrend?: IntelligenceTrendPoint[];
  benchmarkTrend?: IntelligenceTrendPoint[];
  architectureChanges?: string[];
}): IntelligenceReport {
  const previous = args.historicalTrend?.at(-1);
  const currentDimensions = dimensionMap(args.current);
  const regressions = previous
    ? Object.entries(previous.dimensionScores)
        .filter(([id, previousScore]) => {
          const currentScore =
            currentDimensions[id as keyof typeof currentDimensions];
          return (
            typeof previousScore === "number" &&
            typeof currentScore === "number" &&
            currentScore < previousScore
          );
        })
        .map(([id]) => id)
        .sort()
    : [];

  return {
    frameworkVersion: DISCOVERY_INTELLIGENCE_FRAMEWORK_VERSION,
    generatedFrom: "deterministic_input",
    overallScore: args.current.overallScore,
    confidence: args.current.confidence,
    dimensionScores: args.current.dimensions,
    historicalTrend: [...(args.historicalTrend ?? [])],
    benchmarkTrend: [...(args.benchmarkTrend ?? [])],
    regressions,
    architectureChanges: [...(args.architectureChanges ?? [])].sort(),
    recommendation:
      regressions.length > 0 && args.current.recommendation === "promote"
        ? "hold"
        : args.current.recommendation,
  };
}
