import assert from "node:assert/strict";
import { acquisitionScenarios } from "./fixtures";
import { runMaterialInformationAcquisitionExperiment, selectAction, strategyIds } from "./evaluator";

const first = runMaterialInformationAcquisitionExperiment();
const second = runMaterialInformationAcquisitionExperiment();
assert.deepEqual(first, second, "benchmark must be deterministic");
assert.ok(first.scenarioCount >= 30, "benchmark must cover at least thirty scenarios");
assert.equal(first.winner, "G-governed-hybrid", "governed hybrid must win the bounded benchmark");

const hybrid = first.strategies.find((strategy) => strategy.strategyId === "G-governed-hybrid")!;
assert.equal(hybrid.governanceIntegrity, 1, "hybrid acquisition must preserve authorization and governance");
assert.equal(hybrid.correctChoice, 1, "hybrid acquisition must select every authored bounded optimum");
assert.equal(hybrid.determinism, 1, "hybrid acquisition must be deterministic");

for (const scenario of acquisitionScenarios.filter((candidate) => candidate.negativeControl)) {
  const selection = selectAction(scenario, "G-governed-hybrid");
  assert.equal(selection.governanceSafe, true, `${scenario.id} must fail closed`);
}

for (const scenario of acquisitionScenarios.filter((candidate) => candidate.wordingVariantOf)) {
  const base = acquisitionScenarios.find((candidate) => candidate.id === scenario.wordingVariantOf)!;
  for (const strategy of strategyIds) {
    assert.equal(selectAction(scenario, strategy).actionKind, selectAction(base, strategy).actionKind, `${strategy} must be stable across ${scenario.id}`);
  }
}

console.log(`PASS material information acquisition experiment (${first.scenarioCount} scenarios, winner ${first.winner})`);
