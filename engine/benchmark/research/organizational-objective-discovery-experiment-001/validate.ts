import assert from "node:assert/strict";
import { objectiveDiscoveryScenarios } from "./fixtures";
import { discoveryArchitectures, evaluateScenario, runObjectiveDiscoveryExperiment } from "./evaluator";

const first = runObjectiveDiscoveryExperiment();
const second = runObjectiveDiscoveryExperiment();

assert.deepEqual(first, second, "experiment must be deterministic");
assert.ok(first.scenarioCount >= 40, "benchmark must cover at least forty scenarios");
assert.equal(first.winner, "G", "governed hybrid adaptive discovery must win the bounded benchmark");

const g = first.architectures.find((architecture) => architecture.architectureId === "G")!;
const f = first.architectures.find((architecture) => architecture.architectureId === "F")!;
assert.equal(g.falseGovernanceRate, 0, "hybrid discovery must never govern an unauthorized or ambiguous objective");
assert.equal(g.objectiveCorrectness, 1, "hybrid discovery must preserve all material hypotheses");
assert.equal(g.authorityCorrectness, 1, "hybrid discovery must preserve authority semantics");
assert.ok(g.overallScore > f.overallScore, "authority-aware hybrid must outperform hypothesis-only discovery");

const hybrid = discoveryArchitectures.find((architecture) => architecture.id === "G")!;
for (const scenario of objectiveDiscoveryScenarios.filter((candidate) => candidate.negativeControl)) {
  const evaluation = evaluateScenario(scenario, hybrid);
  assert.equal(evaluation.falseGovernance, false, `${scenario.id} must fail closed`);
}

const adaptive = first.interviewStrategies.find((strategy) => strategy.strategy === "hybrid-adaptive")!;
const full = first.interviewStrategies.find((strategy) => strategy.strategy === "full-questionnaire")!;
assert.ok(adaptive.averageQuestions < full.averageQuestions, "adaptive discovery must ask fewer questions than a full questionnaire");
assert.equal(adaptive.objectiveCorrectness, full.objectiveCorrectness, "question reduction must not reduce correctness");
assert.equal(adaptive.authorityCorrectness, full.authorityCorrectness, "question reduction must not weaken authority correctness");

console.log(`PASS organizational objective discovery experiment (${first.scenarioCount} scenarios, winner ${first.winner})`);
