import { createHash } from "node:crypto";

import { DISCOVERY_INTELLIGENCE_CORPUS } from "../../engine/evaluation/discovery-intelligence/corpus";
import {
  createDiscoveryIntelligenceReport,
  evaluateDiscoveryIntelligence,
  toTrendPoint,
} from "../../engine/evaluation/discovery-intelligence/evaluate";
import {
  DISCOVERY_INTELLIGENCE_HUMAN_RUBRIC,
  HUMAN_RUBRIC_MAXIMUM,
  validateHumanRubricScores,
} from "../../engine/evaluation/discovery-intelligence/humanRubric";
import { DISCOVERY_INTELLIGENCE_SCORECARD } from "../../engine/evaluation/discovery-intelligence/scorecard";
import type {
  MetricObservation,
  ScenarioEvaluationInput,
} from "../../engine/evaluation/discovery-intelligence/types";

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(value: unknown): string {
  return createHash("sha256").update(stable(value)).digest("hex");
}

function buildObservations(value = 9): MetricObservation[] {
  return DISCOVERY_INTELLIGENCE_SCORECARD.flatMap((dimension) =>
    dimension.metrics
      .filter((metric) => metric.kind !== "human_only")
      .map((metric) => ({
        metricId: metric.id,
        value,
        kind: metric.kind,
        evidenceRefs: ["e1"],
      })),
  );
}

const optimizationTargets = DISCOVERY_INTELLIGENCE_SCORECARD.filter(
  (dimension) => dimension.role === "optimization_target",
);
assert(
  optimizationTargets.length === 1 &&
    optimizationTargets[0].id === "organizational_understanding",
  "Organizational Understanding must be the single optimization target.",
);
assert(
  DISCOVERY_INTELLIGENCE_SCORECARD.filter(
    (dimension) => dimension.role === "hard_constraint",
  )
    .map((dimension) => dimension.id)
    .join("|") === "truthfulness|model_stewardship",
  "Truthfulness and Model Stewardship must remain hard constraints.",
);
assert(
  DISCOVERY_INTELLIGENCE_SCORECARD.filter(
    (dimension) => dimension.role === "supporting_capability",
  ).length === 5,
  "The scorecard must contain five supporting capabilities.",
);
assert(
  new Set(
    DISCOVERY_INTELLIGENCE_SCORECARD.flatMap((dimension) =>
      dimension.metrics.map((metric) => metric.id),
    ),
  ).size ===
    DISCOVERY_INTELLIGENCE_SCORECARD.flatMap((dimension) => dimension.metrics)
      .length,
  "Metric IDs must be globally unique.",
);

assert(
  DISCOVERY_INTELLIGENCE_CORPUS.length >= 100,
  "The corpus must contain at least 100 scenarios.",
);
assert(
  new Set(DISCOVERY_INTELLIGENCE_CORPUS.map((scenario) => scenario.domain))
    .size === 16,
  "The corpus must cover all 16 required domains.",
);
assert(
  new Set(DISCOVERY_INTELLIGENCE_CORPUS.map((scenario) => scenario.id)).size ===
    DISCOVERY_INTELLIGENCE_CORPUS.length,
  "Scenario IDs must be unique.",
);
assert(
  new Set(
    DISCOVERY_INTELLIGENCE_CORPUS.map((scenario) => scenario.organizationId),
  ).size === DISCOVERY_INTELLIGENCE_CORPUS.length,
  "Every scenario must use an isolated organization.",
);
for (const scenario of DISCOVERY_INTELLIGENCE_CORPUS) {
  assert(scenario.question.length > 0, `${scenario.id} requires a question.`);
  assert(scenario.evidence.length > 0, `${scenario.id} requires evidence.`);
  assert(
    scenario.competingExplanations.length >= 2,
    `${scenario.id} requires competing explanations.`,
  );
  assert(
    scenario.expectedUncertainty.length > 0,
    `${scenario.id} requires expected uncertainty.`,
  );
  assert(
    scenario.highestValueNextEvidence.length > 0,
    `${scenario.id} requires highest-value next evidence.`,
  );
}

const firstScenario = DISCOVERY_INTELLIGENCE_CORPUS[0];
const input: ScenarioEvaluationInput = {
  scenarioId: firstScenario.id,
  organizationId: firstScenario.organizationId,
  observations: buildObservations(),
};
const first = evaluateDiscoveryIntelligence(input);
const second = evaluateDiscoveryIntelligence(input);
assert(
  digest(first) === digest(second),
  "Identical evaluation input must produce identical output.",
);
assert(first.overallScore === 9, "Uniform metric scores must remain stable.");
assert(first.recommendation === "promote", "Strong complete evidence should promote.");
assert(
  first.overallScore ===
    first.dimensions.find(
      (dimension) => dimension.id === "organizational_understanding",
    )?.score,
  "Overall fitness must equal Organizational Understanding, not a peer aggregate.",
);

let isolationRejected = false;
try {
  evaluateDiscoveryIntelligence({
    ...input,
    organizationId: "evaluation-unrelated-organization",
  });
} catch {
  isolationRejected = true;
}
assert(isolationRejected, "Cross-organization evaluation must fail closed.");

const blocked = evaluateDiscoveryIntelligence({
  ...input,
  observations: buildObservations().map((observation) =>
    [
      "grounding",
      "lineage",
      "confidence_calibration",
      "causal_restraint",
      "hallucination_avoidance",
      "negative_controls",
      "abstention_quality",
    ].includes(observation.metricId)
      ? { ...observation, value: 7 }
      : observation,
  ),
});
assert(
  blocked.recommendation === "block",
  "Truthfulness below the gate must block promotion.",
);

const nondeterministic = evaluateDiscoveryIntelligence({
  ...input,
  observations: buildObservations().map((observation) =>
    observation.metricId === "determinism"
      ? { ...observation, value: 0 }
      : observation,
  ),
});
assert(
  nondeterministic.recommendation === "block",
  "A failed stewardship constraint must block promotion.",
);

const baseline = {
  ...first,
  overallScore: 9.5,
  dimensions: first.dimensions.map((dimension) => ({
    ...dimension,
    score:
      dimension.id === "communication_quality"
        ? 9.5
        : dimension.score,
  })),
};
const report = createDiscoveryIntelligenceReport({
  current: first,
  historicalTrend: [toTrendPoint("baseline", baseline)],
  benchmarkTrend: [toTrendPoint("current", first)],
  architectureChanges: [],
});
assert(
  report.regressions.includes("communication_quality"),
  "Reports must identify dimension regressions.",
);
assert(
  report.recommendation === "hold",
  "A regression must prevent automatic promotion.",
);

assert(
  DISCOVERY_INTELLIGENCE_HUMAN_RUBRIC.length === 6 &&
    HUMAN_RUBRIC_MAXIMUM === 60,
  "Human rubric must contain six ten-point criteria.",
);
assert(
  validateHumanRubricScores({
    understanding: 10,
    truthfulness: 10,
    utility: 10,
    communication: 10,
    evidence_recommendations: 10,
    uncertainty_handling: 10,
  }) === 60,
  "Human rubric total must be deterministic.",
);

const corpusHash = digest(DISCOVERY_INTELLIGENCE_CORPUS);
assert(
  corpusHash ===
    "bbcb1afc64533e4a32f21b31cd304196bc4c52ca24ca9975b567b50e262943b1",
  "Corpus digest changed; review and intentionally update the pinned digest.",
);
assert(
  DISCOVERY_INTELLIGENCE_CORPUS.map((scenario) => scenario.id).join("|") ===
    DISCOVERY_INTELLIGENCE_CORPUS.map((scenario) => scenario.id)
      .sort()
      .join("|"),
  "Corpus ordering must remain deterministic.",
);

console.log("Discovery Intelligence Evaluation validation: PASS");
console.log(`Scenarios: ${DISCOVERY_INTELLIGENCE_CORPUS.length}`);
console.log("Domains: 16");
console.log(`Dimensions: ${DISCOVERY_INTELLIGENCE_SCORECARD.length}`);
console.log(`Corpus SHA-256: ${corpusHash}`);
