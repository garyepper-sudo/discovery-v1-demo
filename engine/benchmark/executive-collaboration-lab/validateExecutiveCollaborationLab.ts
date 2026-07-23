import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { executiveConversationScenarios } from "./executiveConversationScenarios";
import { runExecutiveCollaborationLab } from "./runExecutiveCollaborationLab";

const runtimeDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../.discovery-runtime/organizations");
const snapshot = () => fs.existsSync(runtimeDirectory) ? Object.fromEntries(fs.readdirSync(runtimeDirectory).sort().map((name) => [name, fs.readFileSync(path.join(runtimeDirectory,name),"utf8")])) : {};
const before = snapshot();
const baseline = runExecutiveCollaborationLab();
const repeated = runExecutiveCollaborationLab();
const reversed = runExecutiveCollaborationLab([...executiveConversationScenarios].reverse());

assert.equal(executiveConversationScenarios.length, 6);
assert.deepEqual(repeated, baseline);
assert.deepEqual(reversed.results.map((item)=>item.scenario.id).sort(), baseline.results.map((item)=>item.scenario.id).sort());
for (const item of baseline.results) {
  const reversedItem = reversed.results.find((candidate)=>candidate.scenario.id===item.scenario.id);
  assert.deepEqual(reversedItem?.run, item.run, `${item.scenario.id} run changed with scenario order`);
  assert.deepEqual(reversedItem?.score, item.score, `${item.scenario.id} score changed with scenario order`);
  assert.equal(item.run.organizationId, item.scenario.organizationId);
  assert.equal(item.run.finalRuntime.metadata.organizationId, item.scenario.organizationId);
}
assert.deepEqual(snapshot(), before);
assert.equal(baseline.criticalFailures.length, 0);
assert.equal(baseline.results.find((item)=>item.scenario.id==="conversation-002")?.run.runtimeDiff.investigationDelta, 0);
assert.equal(baseline.results.find((item)=>item.scenario.id==="conversation-006")?.run.runtimeDiff.decisionDelta, 1);
assert.equal(baseline.results.find((item)=>item.scenario.id==="conversation-006")?.run.sessionImpact.durable.length, 1);

console.log("\nEXECUTIVE COLLABORATION LAB — BASELINE");
for (const item of baseline.results) console.log(`${item.scenario.id}  ${item.score.score.toFixed(2)}  ${item.scenario.name}`);
console.log(`\nOverall: ${baseline.overallScore.toFixed(2)} / 100`);
console.log("\nDimensions");
for (const [dimension, score] of Object.entries(baseline.dimensions)) console.log(`${dimension}: ${score}`);
console.log(`\nCritical failures: ${baseline.criticalFailures.length}`);
console.log(`Warnings: ${baseline.warnings.length}`);
console.log("\nDeterminism: PASS");
console.log("Scenario order independence: PASS");
console.log("Organization isolation: PASS");
console.log("Runtime artifact restoration: PASS");
