import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { evaluateOperatingModelEvolution } from "./evaluateOperatingModelEvolution";
import { supportedEvolutionMetamorphicRelations } from "./metamorphic";
import { operatingModelEvolutionPilot } from "./syntheticPilot";

const checks: string[] = [];
const check = (name: string, assertion: () => void) => {
  assertion();
  checks.push(name);
};
const evaluation = evaluateOperatingModelEvolution(operatingModelEvolutionPilot);
const repeated = evaluateOperatingModelEvolution(operatingModelEvolutionPilot);

check("timeline supports arbitrary ordered event sequences", () => {
  assert.deepEqual(operatingModelEvolutionPilot.steps.map((step) => step.event.eventType), ["evidence", "evidence", "decision", "intervention", "outcome"]);
});
check("every event declares stable and revised concepts", () => {
  for (const step of operatingModelEvolutionPilot.steps) {
    assert.ok(Array.isArray(step.event.expectedStableConceptIds));
    assert.ok(Array.isArray(step.event.expectedRevisedConceptIds));
    assert.ok(step.event.expectedOrganizationalChanges.length > 0);
  }
});
check("timestamps are deterministic and chronological", () => {
  const timestamps = operatingModelEvolutionPilot.steps.map((step) => step.event.timestamp);
  assert.deepEqual(timestamps, [...timestamps].sort());
});
check("all eight Operating Model dimensions are evaluated", () => {
  assert.deepEqual(Object.keys(evaluation.scorecard), ["learning", "stability", "coherence", "identityContinuity", "scopePreservation", "historicalTruth", "decisionLearning", "recommendationContinuity"]);
});
check("pilot satisfies every declared evolution expectation", () => {
  assert.ok(evaluation.expectationResults.length > 0);
  assert.ok(evaluation.expectationResults.every((result) => result.passed));
});
check("pilot preserves localized organizational scope", () => assert.equal(evaluation.scorecard.scopePreservation.score, 5));
check("pilot preserves superseded historical truth", () => assert.equal(evaluation.scorecard.historicalTruth.score, 5));
check("completed decision and outcome influence later understanding", () => assert.equal(evaluation.scorecard.decisionLearning.score, 5));
check("recommendation evolution remains event-explainable", () => assert.equal(evaluation.scorecard.recommendationContinuity.score, 5));
check("pilot has no scored evolution failure", () => assert.deepEqual(evaluation.failures.map((failure) => failure.type), ["none"]));
check("evaluation is deterministic", () => assert.deepEqual(evaluation, repeated));
check("all requested metamorphic extension hooks are declared", () => assert.equal(supportedEvolutionMetamorphicRelations.length, 10));
check("lab remains benchmark-only", () => assert.ok(__dirname.includes("engine/benchmark/operating-model-evolution-lab")));
check("lab does not import Runtime or production reasoning", () => {
  for (const name of ["contracts.ts", "evaluateOperatingModelEvolution.ts", "metamorphic.ts", "syntheticPilot.ts"]) {
    const source = fs.readFileSync(path.join(__dirname, name), "utf8");
    assert.doesNotMatch(source, /from ["'][^"']*(?:runtime|reasoning|recommendation)[^"']*["']/i);
  }
});

console.log("\nOPERATING MODEL EVOLUTION LAB — FOUNDATION");
for (const name of checks) console.log(`PASS  ${name}`);
console.log("\nScorecard");
for (const [name, result] of Object.entries(evaluation.scorecard)) console.log(`${name}: ${result.score}/${result.maxScore}`);
console.log(`\nPassed: ${checks.length}`);
console.log("Failed: 0");
