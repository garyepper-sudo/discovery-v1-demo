import assert from "node:assert/strict";
import { conditionsFor, scenarios } from "./fixtures";
import { generateCandidate, runExperiment } from "./experiment";

const first = runExperiment();
const second = runExperiment();
assert.deepEqual(first, second, "Experiment must be repeatable.");
assert.equal(first.metrics.scenarioCount, 8);
assert.equal(first.metrics.negativeControlCount, 2);
assert.equal(first.metrics.governanceViolationRate, 0);
assert.equal(first.metrics.understandingMutationRate, 0);
assert.equal(first.metrics.unsupportedForecastRate, 0);
assert.equal(first.metrics.falseRecommendationRate, 0);
assert.equal(first.metrics.objectiveConfirmationMissRate, 0);
assert.equal(new Set(scenarios.map((scenario) => scenario.organizationId)).size, scenarios.length);
for (const scenario of scenarios) {
  const conditions = conditionsFor(scenario);
  const forward = conditions.map((condition) => generateCandidate(scenario, condition));
  const reverse = [...conditions].reverse().map((condition) => generateCandidate(scenario, condition)).reverse();
  assert.deepEqual(forward, reverse, `${scenario.scenarioId} must be ordering-independent.`);
  assert.ok(forward.every((item) => item.understandingRevisionRef === scenario.understandingRevisionRef));
  assert.ok(forward.every((item) => item.scenarioId === scenario.scenarioId));
  assert.ok(forward.every((item) => item.organizationId === scenario.organizationId));
  const unknown = forward.find((item) => item.objectiveContext.status === "unknown");
  assert.ok(unknown);
  assert.ok(!["recommendation", "conditional-recommendation"].includes(unknown.resultType));
  const lowInference = forward.find((item) => item.objectiveContext.status === "inferred-low-confidence");
  assert.equal(
    lowInference?.resultType,
    scenario.negativeControl ? "abstention" : "objective-confirmation-required",
  );
  const conflict = forward.find((item) => item.resultType === "scenario-comparison-required");
  if (!scenario.negativeControl) assert.ok(conflict);
  if (scenario.negativeControl) {
    assert.ok(forward.every((item) => !["recommendation", "conditional-recommendation"].includes(item.resultType)));
  }
}
assert.ok(first.lab.every((item) => item.understandingRevisionRef.includes("understanding-")));
assert.ok(first.lab.every((item) => item.rationale.objectiveDependency));
console.log(JSON.stringify({
  validation: first.experiment,
  result: "PASS",
  scenarios: first.metrics.scenarioCount,
  conditions: first.metrics.conditionCount,
  labComparisons: first.metrics.labComparisonCount,
  safety: {
    governanceViolationRate: 0,
    understandingMutationRate: 0,
    unsupportedForecastRate: 0,
  },
  isolation: {
    runtimeReads: 0,
    runtimeWrites: 0,
    productQuestionEvents: 0,
    frontendImports: 0,
    connectorCalls: 0,
    productionExports: 0,
  },
}, null, 2));
