import assert from "node:assert/strict";

import { evaluateOperatingModelEvolution } from "./evaluateOperatingModelEvolution";
import {
  applyEvolutionMetamorphicTransformation,
  supportedEvolutionMetamorphicRelations,
} from "./metamorphic";
import { operatingModelEvolutionStressScenarios } from "./stressScenarios";

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;
const checks: string[] = [];
const check = (name: string, assertion: () => void) => {
  assertion();
  checks.push(name);
};
const evaluations = operatingModelEvolutionStressScenarios.map(evaluateOperatingModelEvolution);

check("four longitudinal stress scenarios are defined", () => assert.equal(operatingModelEvolutionStressScenarios.length, 4));
check("every scenario evolves one stable organization identity", () => {
  for (const scenario of operatingModelEvolutionStressScenarios) {
    assert.equal(scenario.organizationId, "synthetic-evolution-organization");
    assert.ok(scenario.steps.length >= 4);
  }
});
check("stress evaluation is deterministic", () => {
  assert.deepEqual(evaluations, operatingModelEvolutionStressScenarios.map(evaluateOperatingModelEvolution));
});
check("all declared stress expectations are measurable", () => {
  for (const evaluation of evaluations) {
    assert.ok(evaluation.expectationResults.length > 0);
    assert.ok(evaluation.expectationResults.every((result) => result.passed));
  }
});
check("contradictory evidence exercises revision, history, and recommendation continuity", () => {
  const result = evaluations[0];
  assert.equal(result.scorecard.learning.score, 5);
  assert.equal(result.scorecard.historicalTruth.score, 5);
  assert.equal(result.scorecard.recommendationContinuity.score, 5);
});
check("reorganization preserves identity through rename and redistribution", () => {
  assert.equal(evaluations[1].scorecard.identityContinuity.score, 5);
  assert.equal(evaluations[1].scorecard.scopePreservation.score, 5);
});
check("decision outcome records learning and evolves later understanding", () => {
  assert.equal(evaluations[2].scorecard.decisionLearning.score, 5);
  assert.equal(evaluations[2].scorecard.learning.score, 5);
});
check("localized growth does not broaden localized truth", () => {
  assert.equal(evaluations[3].scorecard.scopePreservation.score, 5);
  const finalConditions = operatingModelEvolutionStressScenarios[3].steps.at(-1)!.snapshot.conditions;
  assert.equal(finalConditions.find((item) => item.id === "condition-local-onboarding")?.scope, "team");
  assert.equal(finalConditions.find((item) => item.id === "condition-enterprise-capacity")?.scope, "organization");
});
check("all ten metamorphic transformations are deterministic and non-mutating", () => {
  const source = operatingModelEvolutionStressScenarios[0];
  const serialized = JSON.stringify(source);
  for (const relation of supportedEvolutionMetamorphicRelations) {
    assert.deepEqual(applyEvolutionMetamorphicTransformation(source, relation), applyEvolutionMetamorphicTransformation(source, relation));
    assert.equal(JSON.stringify(source), serialized);
  }
});
check("failure records identify boundary, event, objects, severity, and reason", () => {
  const broken = clone(operatingModelEvolutionStressScenarios[0]);
  for (const step of broken.steps) step.snapshot.historicalTruths = [];
  const failures = evaluateOperatingModelEvolution(broken).failures.filter((failure) => failure.type !== "none");
  assert.ok(failures.some((failure) => failure.type === "historical-overwrite"));
  for (const failure of failures) {
    assert.ok(failure.producerBoundary);
    assert.ok(failure.eventId);
    assert.ok(failure.objectIds.length > 0);
    assert.ok(failure.severity);
    assert.ok(failure.description);
  }
});
check("synthetic stress fixtures expose no unearned production claim", () => {
  assert.ok(evaluations.every((evaluation) => evaluation.failures.every((failure) => failure.type === "none")));
});

console.log("\nOPERATING MODEL EVOLUTION LAB — STRESS PILOT");
for (const evaluation of evaluations) {
  console.log(`\n${evaluation.timelineId}`);
  for (const [dimension, result] of Object.entries(evaluation.scorecard)) console.log(`${dimension}: ${result.score}/${result.maxScore}`);
  console.log(`Failures: ${evaluation.failures.map((failure) => failure.type).join(", ")}`);
}
console.log("\nMetamorphic transformations");
for (const relation of supportedEvolutionMetamorphicRelations) console.log(`PASS  ${relation}`);
console.log(`\nPassed: ${checks.length}`);
console.log("Failed: 0");

