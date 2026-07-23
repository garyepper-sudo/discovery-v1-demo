import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { executiveConversationScenarios } from "./executiveConversationScenarios";
import { runExecutiveCollaborationLab } from "./runExecutiveCollaborationLab";
import { MockConversationInterpreter } from "../../conversation";

const runtimeDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../.discovery-runtime/organizations");
const snapshot = () => fs.existsSync(runtimeDirectory) ? Object.fromEntries(fs.readdirSync(runtimeDirectory).sort().map((name) => [name, fs.readFileSync(path.join(runtimeDirectory,name),"utf8")])) : {};
const before = snapshot();
const mockInterpreter = new MockConversationInterpreter();
const runtimeOnly = runExecutiveCollaborationLab();
const runtimeOnlyRepeated = runExecutiveCollaborationLab();
const runtimeOnlyReversed = runExecutiveCollaborationLab([...executiveConversationScenarios].reverse());
const controlledMock = runExecutiveCollaborationLab(executiveConversationScenarios, mockInterpreter);
const controlledMockRepeated = runExecutiveCollaborationLab(executiveConversationScenarios, mockInterpreter);
const controlledMockReversed = runExecutiveCollaborationLab([...executiveConversationScenarios].reverse(), mockInterpreter);

assert.equal(executiveConversationScenarios.length, 6);
assert.deepEqual(runtimeOnlyRepeated, runtimeOnly);
assert.deepEqual(controlledMockRepeated, controlledMock);
assert.equal(runtimeOnly.overallScore, 65.21);
assert.equal(controlledMock.overallScore, 90.36);
for (const [mode, baseline, reversed] of [["none", runtimeOnly, runtimeOnlyReversed], ["mock", controlledMock, controlledMockReversed]] as const) {
  assert.deepEqual(reversed.results.map((item)=>item.scenario.id).sort(), baseline.results.map((item)=>item.scenario.id).sort());
  for (const item of baseline.results) {
    const reversedItem = reversed.results.find((candidate)=>candidate.scenario.id===item.scenario.id);
    assert.deepEqual(reversedItem?.run, item.run, `${mode}:${item.scenario.id} run changed with scenario order`);
    assert.deepEqual(reversedItem?.score, item.score, `${mode}:${item.scenario.id} score changed with scenario order`);
    assert.equal(item.run.organizationId, item.scenario.organizationId);
    assert.equal(item.run.finalRuntime.metadata.organizationId, item.scenario.organizationId);
    assert.ok(item.run.trace.every((turn) => mode === "mock" ? turn.interpretation !== null : turn.interpretation === null));
  }
}
assert.deepEqual(snapshot(), before);
assert.equal(runtimeOnly.criticalFailures.length, 0);
assert.equal(controlledMock.criticalFailures.length, 0);
assert.equal(controlledMock.results.find((item)=>item.scenario.id==="conversation-002")?.run.runtimeDiff.investigationDelta, 0);
assert.equal(controlledMock.results.find((item)=>item.scenario.id==="conversation-006")?.run.runtimeDiff.decisionDelta, 1);
assert.equal(controlledMock.results.find((item)=>item.scenario.id==="conversation-006")?.run.sessionImpact.durable.length, 1);

for (const [label, baseline] of [["RUNTIME-ONLY BASELINE", runtimeOnly], ["CONTROLLED MOCK BASELINE", controlledMock]] as const) {
  console.log(`\nEXECUTIVE COLLABORATION LAB — ${label}`);
  for (const item of baseline.results) console.log(`${item.scenario.id}  ${item.score.score.toFixed(2)}  ${item.scenario.name}`);
  console.log(`\nOverall: ${baseline.overallScore.toFixed(2)} / 100`);
  console.log("\nDimensions");
  for (const [dimension, score] of Object.entries(baseline.dimensions)) console.log(`${dimension}: ${score}`);
  console.log(`\nCritical failures: ${baseline.criticalFailures.length}`);
  console.log(`Warnings: ${baseline.warnings.length}`);
}
console.log("\nDeterminism: PASS");
console.log("Scenario order independence: PASS");
console.log("Organization isolation: PASS");
console.log("Runtime artifact restoration: PASS");
console.log("Interpretation trace separation: PASS");
