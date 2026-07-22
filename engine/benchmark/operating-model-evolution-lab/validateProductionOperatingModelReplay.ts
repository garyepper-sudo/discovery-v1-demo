import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { evaluateOperatingModelEvolution } from "./evaluateOperatingModelEvolution";
import { runProductionOperatingModelReplay } from "./productionReplay";

const runtimeDirectory = path.join(process.cwd(), ".discovery-runtime", "organizations");
const files = () => fs.existsSync(runtimeDirectory) ? fs.readdirSync(runtimeDirectory).sort() : [];
const before = files();
const first = runProductionOperatingModelReplay();
const second = runProductionOperatingModelReplay();
const evaluation = evaluateOperatingModelEvolution(first);

assert.deepEqual(first, second, "Production replay snapshots must be deterministic.");
assert.deepEqual(files(), before, "Production replay must not write Runtime files.");
assert.equal(first.steps.length, 3);
assert.ok(first.steps.every((step) => step.snapshot.conditions.length > 0));
assert.ok(first.steps.every((step) => step.snapshot.mechanisms.length > 0));

console.log("\nPRODUCTION OPERATING MODEL REPLAY 001");
for (const step of first.steps) {
  console.log(`\n${step.event.id}`);
  console.log(`Entities: ${step.snapshot.entities.length}`);
  console.log(`Beliefs: ${step.snapshot.beliefs.length}`);
  console.log(`Mechanisms: ${step.snapshot.mechanisms.length}`);
  console.log(`Conditions: ${step.snapshot.conditions.length}`);
  console.log(`Concepts: ${step.snapshot.concepts.length}`);
  console.log(`Historical truths: ${step.snapshot.historicalTruths.length}`);
  console.log(`Recommendation: ${step.snapshot.recommendation?.strategy ?? "none"}`);
}
console.log("\nExpectation results");
for (const result of evaluation.expectationResults) console.log(`${result.passed ? "PASS" : "FAIL"}  ${result.explanation} @ ${result.eventId}`);
console.log("\nFailures");
for (const failure of evaluation.failures) console.log(`${failure.type}: ${failure.producerBoundary} @ ${failure.eventId}`);
console.log(`\nDeterministic signature: ${evaluation.deterministicSignature}`);

