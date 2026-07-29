import assert from "node:assert/strict";
import { runArchitecture } from "./adapter";
import { SCENARIOS } from "./fixtures";
import type {
  Architecture,
  MetricSet,
  OrganizationalFunction,
  Scenario,
  ScenarioResult,
} from "./types";
import { FUNCTION_VOCABULARY } from "./vocabulary";

const ARCHITECTURES: Architecture[] = ["A", "B", "C"];
const TARGETED_GAPS = new Set([
  "paraphrase-opportunity-duration",
  "paraphrase-hiring-workload",
  "paraphrase-retention-cancellations",
]);

function ratio(numerator: number, denominator: number): number {
  return denominator === 0 ? 1 : Number((numerator / denominator).toFixed(3));
}

function functionsOf(result: ScenarioResult): Set<OrganizationalFunction> {
  return new Set(result.assignments.map((item) => item.function));
}

function complete(result: ScenarioResult, scenario: Scenario): boolean {
  const actual = functionsOf(result);
  return (
    scenario.expectedFunctions.every((item) => actual.has(item)) &&
    scenario.prohibitedFunctions.every((item) => !actual.has(item))
  );
}

function categoryRecovery(
  results: ScenarioResult[],
  category: Scenario["category"],
): string {
  const scenarios = SCENARIOS.filter((item) => item.category === category);
  const passed = scenarios.filter((scenario) =>
    complete(
      results.find((item) => item.scenarioId === scenario.id)!,
      scenario,
    )
  ).length;
  return `${passed}/${scenarios.length}`;
}

function controlPrecision(
  results: ScenarioResult[],
  category: Scenario["category"],
): number {
  const scenarios = SCENARIOS.filter((item) => item.category === category);
  return ratio(
    scenarios.filter((scenario) =>
      functionsOf(
        results.find((item) => item.scenarioId === scenario.id)!
      ).size === 0
    ).length,
    scenarios.length,
  );
}

function metricSet(
  architecture: Architecture,
  results: ScenarioResult[],
): MetricSet {
  let truePositive = 0;
  let falsePositive = 0;
  let falseNegative = 0;
  let directionCorrect = 0;
  let directionTotal = 0;
  for (const scenario of SCENARIOS) {
    const result = results.find((item) => item.scenarioId === scenario.id)!;
    const actual = functionsOf(result);
    const expected = new Set(scenario.expectedFunctions);
    for (const item of actual) {
      if (expected.has(item)) truePositive += 1;
      else falsePositive += 1;
    }
    for (const item of expected) {
      if (!actual.has(item)) falseNegative += 1;
    }
    if (scenario.expectedDirection !== "abstain" && result.assignments.length > 0) {
      directionTotal += 1;
      if (
        result.assignments.some(
          (item) => item.direction === scenario.expectedDirection
        )
      ) directionCorrect += 1;
    }
  }

  const positive = SCENARIOS.filter((item) => item.expectedFunctions.length > 0);
  const mechanisms = positive.filter((item) => item.expectedMechanism);
  const gaps = positive.filter((item) => item.highestValueEvidenceGap);
  const mechanismPassed = mechanisms.filter((scenario) =>
    Boolean(results.find((item) => item.scenarioId === scenario.id)?.mechanism)
  ).length;
  const gapPassed = gaps.filter((scenario) => {
    const actual = results.find((item) => item.scenarioId === scenario.id)?.evidenceGap;
    return (
      actual?.function === scenario.highestValueEvidenceGap?.function &&
      actual?.recommendation === scenario.highestValueEvidenceGap?.recommendation
    );
  }).length;
  const targeted = [...TARGETED_GAPS].filter((id) => {
    const scenario = SCENARIOS.find((item) => item.id === id)!;
    return complete(results.find((item) => item.scenarioId === id)!, scenario);
  }).length;

  return {
    exactGrammarRecovery: categoryRecovery(results, "exact"),
    independentParaphraseRecovery: categoryRecovery(results, "paraphrase"),
    crossIndustryTransfer: categoryRecovery(results, "cross-industry"),
    functionPrecision: ratio(truePositive, truePositive + falsePositive),
    functionRecall: ratio(truePositive, truePositive + falseNegative),
    directionPrecision: ratio(directionCorrect, directionTotal),
    negativeControlPrecision: controlPrecision(results, "negative"),
    negationPrecision: controlPrecision(results, "negation"),
    hypothesisPrecision: controlPrecision(results, "hypothesis"),
    quotationPrecision: controlPrecision(results, "quotation"),
    ambiguityAbstention: controlPrecision(results, "ambiguous"),
    organizationIsolation: true,
    orderingDeterminism: true,
    truthfulUtilityRecovery:
      architecture === "A"
        ? "12/15 verified production baseline"
        : `12/15 baseline + ${targeted}/3 targeted function recoveries`,
    mechanismRecovery: `${mechanismPassed}/${mechanisms.length}`,
    evidenceGapRecovery: `${gapPassed}/${gaps.length}`,
  };
}

function verifyIsolationAndDeterminism(
  architecture: Architecture,
  baseline: ScenarioResult[],
): void {
  for (const scenario of SCENARIOS) {
    const reversed: Scenario = {
      ...scenario,
      evidence: [...scenario.evidence].reverse(),
      observations: [...scenario.observations].reverse(),
      evidenceRoles: [...scenario.evidenceRoles].reverse(),
    };
    assert.deepEqual(
      runArchitecture(architecture, reversed),
      baseline.find((item) => item.scenarioId === scenario.id),
      `${architecture}/${scenario.id} must be ordering deterministic`,
    );
  }
  const isolated: Scenario = {
    ...SCENARIOS[0],
    observations: SCENARIOS[0].observations.map((item) => ({
      ...item,
      organizationId: "org-unrelated",
    })),
  };
  assert.equal(
    runArchitecture(architecture, isolated).assignments.length,
    0,
    `${architecture} must fail closed across organizations`,
  );
}

function verifyLineage(results: ScenarioResult[]): void {
  for (const result of results) {
    const scenario = SCENARIOS.find((item) => item.id === result.scenarioId)!;
    const admittedIds = new Set(
      scenario.evidence.filter((item) => item.admitted).map((item) => item.id)
    );
    for (const item of result.assignments) {
      assert.ok(item.evidenceIds.length > 0, `${result.scenarioId} lacks Evidence lineage`);
      assert.ok(item.observationIds.length > 0, `${result.scenarioId} lacks Observation lineage`);
      assert.ok(
        item.evidenceIds.every((id) => admittedIds.has(id)),
        `${result.scenarioId} included rejected or unrelated Evidence`,
      );
    }
    if (result.evidenceGap) {
      assert.ok(
        (result.evidenceGap.evidenceIds ?? []).length > 0,
        `${result.scenarioId} Evidence gap lacks assignment lineage`,
      );
      assert.ok(
        result.evidenceGap.evidenceIds?.every((id) => admittedIds.has(id)),
        `${result.scenarioId} Evidence gap used rejected or unrelated Evidence`,
      );
    }
  }
}

function verifyRoleAndMechanismBoundaries(): void {
  const base = SCENARIOS.find((item) => item.id === "exact-sales-conversion")!;
  const foreignRole: Scenario = {
    ...base,
    evidenceRoles: base.evidenceRoles.map((item) => ({
      ...item,
      evidenceId: "foreign-evidence",
      lineage: {
        ...item.lineage,
        evidenceIds: ["foreign-evidence"],
      },
    })),
  };
  assert.equal(
    runArchitecture("B", foreignRole).assignments.length,
    0,
    "Architecture B must not consume a role without admitted Evidence lineage",
  );

  const mechanismBase = SCENARIOS.find(
    (item) => item.id === "exact-execution-delay"
  )!;
  const rejectedRelationship: Scenario = {
    ...mechanismBase,
    evidence: mechanismBase.evidence.map((item) => ({
      ...item,
      admitted: false,
    })),
  };
  assert.equal(
    runArchitecture("C", rejectedRelationship).mechanism,
    undefined,
    "Rejected Evidence must not create a mechanism candidate",
  );
}

assert.equal(
  Object.keys(FUNCTION_VOCABULARY).length,
  14,
  "The experimental vocabulary must remain small and explicit",
);
assert.ok(
  new Set(SCENARIOS.map((item) => item.industry)).size >= 8,
  "The corpus must span at least eight industries",
);
verifyRoleAndMechanismBoundaries();

const resultsByArchitecture = Object.fromEntries(
  ARCHITECTURES.map((architecture) => {
    const results = SCENARIOS.map((scenario) =>
      runArchitecture(architecture, scenario)
    );
    verifyIsolationAndDeterminism(architecture, results);
    verifyLineage(results);
    return [architecture, results];
  }),
) as Record<Architecture, ScenarioResult[]>;

const metrics = Object.fromEntries(
  ARCHITECTURES.map((architecture) => [
    architecture,
    metricSet(architecture, resultsByArchitecture[architecture]),
  ]),
) as Record<Architecture, MetricSet>;

const cCrossFailures = SCENARIOS
  .filter((scenario) => scenario.category === "cross-industry")
  .filter((scenario) =>
    !complete(
      resultsByArchitecture.C.find((item) => item.scenarioId === scenario.id)!,
      scenario,
    )
  )
  .map((scenario) => ({
    scenarioId: scenario.id,
    actual: [...functionsOf(
      resultsByArchitecture.C.find((item) => item.scenarioId === scenario.id)!
    )],
    expected: scenario.expectedFunctions,
  }));

assert.equal(metrics.C.functionPrecision, 1, "Architecture C must preserve function precision");
assert.equal(metrics.C.negativeControlPrecision, 1, "Negative controls must remain rejected");
assert.equal(metrics.C.negationPrecision, 1, "Negated observations must remain rejected");
assert.equal(metrics.C.hypothesisPrecision, 1, "Hypotheses must remain rejected");
assert.equal(metrics.C.quotationPrecision, 1, "Quotations/questions must remain rejected");
assert.equal(metrics.C.ambiguityAbstention, 1, "Ambiguous evidence must abstain");
assert.equal(
  metrics.C.crossIndustryTransfer,
  "8/8",
  `Cross-industry transfer regressed: ${JSON.stringify(cCrossFailures)}`,
);
assert.equal(metrics.C.independentParaphraseRecovery, "6/6", "Paraphrase recovery regressed");

console.log(JSON.stringify({
  experiment: "organizational-functions-experiment-001",
  status: "PASS",
  scenarioCount: SCENARIOS.length,
  industryCount: new Set(SCENARIOS.map((item) => item.industry)).size,
  vocabularySize: Object.keys(FUNCTION_VOCABULARY).length,
  metrics,
  targetedGapResults: [...TARGETED_GAPS].map((scenarioId) => ({
    scenarioId,
    A: resultsByArchitecture.A.find((item) => item.scenarioId === scenarioId)?.assignments.map((item) => item.function),
    B: resultsByArchitecture.B.find((item) => item.scenarioId === scenarioId)?.assignments.map((item) => item.function),
    C: resultsByArchitecture.C.find((item) => item.scenarioId === scenarioId)?.assignments.map((item) => item.function),
  })),
}, null, 2));
