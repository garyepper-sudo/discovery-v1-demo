import assert from "node:assert/strict";

import { DISCRIMINATION_SCENARIOS } from "./fixtures";
import {
  scoreEvidenceCandidate,
  selectEvidenceCandidate,
} from "./strategies";
import type {
  AcquisitionStrategy,
  DiscriminationScenario,
  EvidenceCandidate,
  ExperimentReport,
  ExplanationId,
  StrategyMetrics,
  StrategyScenarioResult,
} from "./types";

const STRATEGIES: AcquisitionStrategy[] = [
  "highest-confidence-gain",
  "highest-understanding-gain",
  "highest-explanation-discrimination",
];

function round(value: number): number {
  return Number(value.toFixed(3));
}

function ambiguity(
  viable: ExplanationId[],
  correct: ExplanationId[],
  initialCount: number,
): number {
  const removable = initialCount - correct.length;
  if (removable <= 0) return 0;
  return round(Math.max(0, viable.length - correct.length) / removable);
}

function sameSet(left: ExplanationId[], right: ExplanationId[]): boolean {
  return (
    [...left].sort().join("|") === [...right].sort().join("|")
  );
}

function applyEvidence(
  viable: ExplanationId[],
  candidate: EvidenceCandidate,
): ExplanationId[] {
  return viable.filter((explanation) => {
    const effect = candidate.observedEffects[explanation];
    if (effect !== "rule-out") return true;
    return candidate.causalStrength !== "counterfactual";
  });
}

export function runStrategy(
  scenario: DiscriminationScenario,
  strategy: AcquisitionStrategy,
  organizationId = scenario.organizationId,
): StrategyScenarioResult {
  if (organizationId !== scenario.organizationId) {
    throw new Error("Experiment organization scope mismatch.");
  }
  let viable = [...scenario.initialExplanations].sort();
  const acquired = new Set<string>();
  const steps: StrategyScenarioResult["steps"] = [];
  let effort = 0;
  let utilityTotal = 0;

  while (!sameSet(viable, scenario.correctExplanations)) {
    const selected = selectEvidenceCandidate(
      strategy,
      scenario,
      viable,
      acquired,
    );
    if (!selected) break;
    acquired.add(selected.candidate.id);
    effort += selected.candidate.effort;
    utilityTotal += selected.candidate.decisionRelevance;
    const before = [...viable];
    const after = applyEvidence(viable, selected.candidate).sort();
    const falseEliminations = before.filter(
      (item) =>
        !after.includes(item) && scenario.correctExplanations.includes(item),
    );
    steps.push({
      evidenceId: selected.candidate.id,
      strategyScore: round(selected.score),
      viableBefore: before,
      viableAfter: after,
      ambiguityBefore: ambiguity(
        before,
        scenario.correctExplanations,
        scenario.initialExplanations.length,
      ),
      ambiguityAfter: ambiguity(
        after,
        scenario.correctExplanations,
        scenario.initialExplanations.length,
      ),
      falseEliminations,
    });
    viable = after;
  }

  const reached = sameSet(viable, scenario.correctExplanations);
  const eliminated =
    scenario.initialExplanations.length - viable.length;
  const falseEliminations = steps.reduce(
    (sum, step) => sum + step.falseEliminations.length,
    0,
  );
  const acquiredCandidates = steps.map((step) =>
    scenario.evidenceCandidates.find(
      (candidate) => candidate.id === step.evidenceId,
    )!,
  );
  const causalRestraint =
    acquiredCandidates.every(
      (candidate) =>
        !Object.values(candidate.observedEffects).includes("rule-out") ||
        candidate.causalStrength === "counterfactual",
    )
      ? 1
      : 0;
  const truthfulness =
    falseEliminations === 0 &&
    acquiredCandidates.every((candidate) => candidate.admissible)
      ? 1
      : 0;

  return {
    strategy,
    scenarioId: scenario.id,
    sourceBenchmark: scenario.sourceBenchmark,
    sourceScenarioId: scenario.sourceScenarioId,
    reachedCorrectUnderstanding: reached,
    evidenceItemsUsed: steps.length,
    totalEffort: effort,
    ambiguityReduction: round(
      1 -
        ambiguity(
          viable,
          scenario.correctExplanations,
          scenario.initialExplanations.length,
        ),
    ),
    explanationsEliminated: eliminated,
    falseEliminations,
    falseEliminationRate: eliminated === 0 ? 0 : round(falseEliminations / eliminated),
    truthfulness,
    causalRestraint,
    utility:
      acquiredCandidates.length === 0
        ? 0
        : round(utilityTotal / acquiredCandidates.length),
    finalViableExplanations: viable,
    steps,
  };
}

function aggregate(
  strategy: AcquisitionStrategy,
  results: StrategyScenarioResult[],
): StrategyMetrics {
  const average = (values: number[]) =>
    round(values.reduce((sum, value) => sum + value, 0) / values.length);
  const successful = results.filter(
    (result) => result.reachedCorrectUnderstanding,
  );
  const evidenceItems = results.reduce(
    (sum, result) => sum + result.evidenceItemsUsed,
    0,
  );
  const totalEffort = results.reduce(
    (sum, result) => sum + result.totalEffort,
    0,
  );
  return {
    strategy,
    scenarios: results.length,
    correctSupportedUnderstanding: successful.length,
    meanEvidenceItems: average(results.map((result) => result.evidenceItemsUsed)),
    meanEffort: average(results.map((result) => result.totalEffort)),
    meanAmbiguityReduction: average(
      results.map((result) => result.ambiguityReduction),
    ),
    evidenceEfficiency: round(
      successful.length / Math.max(1, evidenceItems + totalEffort),
    ),
    competingExplanationsEliminated: results.reduce(
      (sum, result) => sum + result.explanationsEliminated,
      0,
    ),
    falseEliminationRate: average(
      results.map((result) => result.falseEliminationRate),
    ),
    truthfulness: average(results.map((result) => result.truthfulness)),
    causalRestraint: average(results.map((result) => result.causalRestraint)),
    utility: average(results.map((result) => result.utility)),
    deterministic: true,
  };
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

assert.equal(DISCRIMINATION_SCENARIOS.length, 12);
assert.equal(
  new Set(DISCRIMINATION_SCENARIOS.map((scenario) => scenario.organizationId))
    .size,
  DISCRIMINATION_SCENARIOS.length,
  "Every scenario must remain organization-isolated.",
);
for (const scenario of DISCRIMINATION_SCENARIOS) {
  assert.ok(
    scenario.correctExplanations.every((item) =>
      scenario.initialExplanations.includes(item),
    ),
    `${scenario.id} correct explanations must exist in the initial space.`,
  );
  assert.ok(
    scenario.evidenceCandidates.some(
      (candidate) =>
        candidate.causalStrength === "counterfactual" &&
        Object.values(candidate.observedEffects).includes("rule-out"),
    ),
    `${scenario.id} requires one admissible discriminating test.`,
  );
  for (const candidate of scenario.evidenceCandidates) {
    const baseline = scoreEvidenceCandidate(
      "highest-explanation-discrimination",
      candidate,
      scenario.initialExplanations,
    );
    const hiddenOutcomeChanged: EvidenceCandidate = {
      ...candidate,
      observedEffects: {},
    };
    assert.equal(
      scoreEvidenceCandidate(
        "highest-explanation-discrimination",
        hiddenOutcomeChanged,
        scenario.initialExplanations,
      ),
      baseline,
      `${scenario.id}/${candidate.id} selection must not consume observed outcomes.`,
    );
  }
}

const resultsByStrategy = Object.fromEntries(
  STRATEGIES.map((strategy) => [
    strategy,
    DISCRIMINATION_SCENARIOS.map((scenario) =>
      runStrategy(scenario, strategy),
    ),
  ]),
) as Record<AcquisitionStrategy, StrategyScenarioResult[]>;

for (const strategy of STRATEGIES) {
  for (const scenario of DISCRIMINATION_SCENARIOS) {
    const baseline = runStrategy(scenario, strategy);
    const reordered: DiscriminationScenario = {
      ...scenario,
      initialExplanations: [...scenario.initialExplanations].reverse(),
      evidenceCandidates: [...scenario.evidenceCandidates].reverse(),
    };
    assert.equal(
      stable(runStrategy(reordered, strategy)),
      stable(baseline),
      `${strategy}/${scenario.id} must be order deterministic.`,
    );
  }
}

assert.throws(
  () =>
    runStrategy(
      DISCRIMINATION_SCENARIOS[0],
      "highest-explanation-discrimination",
      "unrelated-organization",
    ),
  /scope mismatch/,
);

const strategyMetrics = STRATEGIES.map((strategy) =>
  aggregate(strategy, resultsByStrategy[strategy]),
);
const ranked = [...strategyMetrics].sort(
  (left, right) =>
    right.correctSupportedUnderstanding - left.correctSupportedUnderstanding ||
    left.meanEvidenceItems - right.meanEvidenceItems ||
    right.truthfulness - left.truthfulness ||
    left.strategy.localeCompare(right.strategy),
);
const bestStrategy =
  ranked.length > 1 &&
  ranked[0].correctSupportedUnderstanding ===
    ranked[1].correctSupportedUnderstanding &&
  ranked[0].meanEvidenceItems === ranked[1].meanEvidenceItems
    ? "inconclusive"
    : ranked[0].strategy;

const report: ExperimentReport = {
  experimentId: "expected-explanation-discrimination-001",
  status: "benchmark-only",
  scenarios: DISCRIMINATION_SCENARIOS.length,
  strategyMetrics,
  researchAnswers: {
    maintainsExplanationSpace: DISCRIMINATION_SCENARIOS.every(
      (scenario) => scenario.initialExplanations.length > 1,
    ),
    explicitCompetitionPreservesTruthfulness: strategyMetrics.every(
      (metrics) =>
        metrics.truthfulness === 1 &&
        metrics.causalRestraint === 1 &&
        metrics.falseEliminationRate === 0,
    ),
    evidenceCanBeScoredForDiscrimination: strategyMetrics.find(
      (metrics) => metrics.strategy === "highest-explanation-discrimination",
    )?.correctSupportedUnderstanding === DISCRIMINATION_SCENARIOS.length,
    bestStrategy,
    ownership:
      bestStrategy === "highest-explanation-discrimination"
        ? "interpretation-layer"
        : "inconclusive",
  },
};

console.log(JSON.stringify(report, null, 2));
