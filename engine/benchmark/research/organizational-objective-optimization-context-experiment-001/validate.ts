import assert from "node:assert/strict";
import { architectures, scenarios } from "./fixtures";
import { runObjectiveOptimizationExperiment } from "./evaluator";

const result = runObjectiveOptimizationExperiment();
assert.equal(result.scenarioCount >= 35, true);
assert.equal(result.negativeControlCount >= 3, true);
assert.deepEqual(architectures.map((item) => item.id), ["current-phase2c2", "A", "B", "C", "D", "E", "F", "G"]);
assert.equal(result.conclusions.threeInputModelSufficient, true);
assert.equal(result.conclusions.separateOperatingContextIncrementalAccuracy, 0);
assert.equal(result.conclusions.separateOperatingContextJustified, false);
assert.equal(result.conclusions.understandingMutationRate, 0);
assert.equal(result.conclusions.recommendationGenerationCount, 0);
assert.equal(result.conclusions.runtimeWrites, 0);
assert.equal(scenarios.some((item) => item.id === "goodhart-proxy-gaming" && item.negativeControl), true);
assert.equal(scenarios.some((item) => item.id === "authorization-restricted-objective" && item.negativeControl), true);
assert.equal(scenarios.some((item) => item.wordingVariantOf), true);
const c = result.architectureMetrics.find((item) => item.architectureId === "C")!;
const d = result.architectureMetrics.find((item) => item.architectureId === "D")!;
const baseline = result.architectureMetrics.find((item) => item.architectureId === "current-phase2c2")!;
assert.equal(c.correctDispositionRate, 1);
assert.equal(c.overallScore > baseline.overallScore, true);
assert.equal(d.overallScore < c.overallScore, true);
const adaptive = result.elicitationMetrics.find((item) => item.strategy === "adaptive-value-of-information")!;
const form = result.elicitationMetrics.find((item) => item.strategy === "full-form")!;
assert.equal(adaptive.correctDispositionRate, 1);
assert.equal(adaptive.averageQuestions < form.averageQuestions, true);

console.log(JSON.stringify({
  validation: result.experiment,
  result: "PASS",
  scenarios: result.scenarioCount,
  architectures: result.architectureMetrics.length,
  classification: result.classification,
  threeInputModelSufficient: result.conclusions.threeInputModelSufficient,
  operatingContextObjectJustified: result.conclusions.separateOperatingContextJustified,
  recommendationGenerationCount: 0,
  runtimeWrites: 0,
}, null, 2));
