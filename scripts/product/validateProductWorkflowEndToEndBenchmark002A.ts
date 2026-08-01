import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { replacementScenario, runReplacementScenario002A } from "../../engine/benchmark/product-workflow-end-to-end-benchmark-002a";
import { replacementExpectation } from "../../engine/benchmark/product-workflow-end-to-end-benchmark-002a/replacementExpectation";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const artifactDir = path.join(root, "engine/benchmark/product-workflow-end-to-end-benchmark-002a");
const sha = async (relative: string): Promise<string> => createHash("sha256").update(await readFile(path.join(root, relative))).digest("hex");
const selectedId = (selection: Awaited<ReturnType<typeof runReplacementScenario002A>>["baseline"]["selection"]): string | null => selection.kind === "selected-action" ? selection.selected.candidateId : null;
const frozenSources = {
  "product/acquisition/shadow/selectMaterialInformationAcquisition.ts": "b3b188e3babfaba189b75401804b98017f64671d920d71f042533061a428e25b",
  "product/improvements/candidateEnvelope.ts": "7de708140a9401e47d6b94ea5029f30340852b58b1dd2951bc515ef3728bcc6d",
  "product/objectives/resolveObjectiveContext.ts": "5790b454d15c40f91a1c1b98758fcbcf018a077e4e76830bad2ab675f28976a0",
  "engine/benchmark/product-workflow-end-to-end-benchmark-001/runBenchmark.ts": "a562ddd8f19f5a5614af841b244d8efdc90a998eb7a94f1aa0c569fbdc066c03",
  "engine/benchmark/product-workflow-end-to-end-benchmark-001/communication.ts": "7ae93a008d3bb1034d5b1b4bfe78b3ecf04d8aaf26b10af7c086218c5a9e02d1",
  "product/integration/canonicalProductWorkspaceAdapter.ts": "ddbe50ae23c22947b0a279ed3af0bbdd1bcca362560a134961459b29cf4308a9"
} as const;

function preregistration(): string {
  return `# Benchmark 002A Replacement Preregistration\n\n- Baseline: \`e6dc115\` (Phase A failed-run canonization)\n- Scenario: \`${replacementScenario.id}\`\n- Classification before execution: \`${replacementScenario.status}\`\n- Prior exposure count: ${replacementScenario.priorExposureCount}\n- Scenario hash: \`${replacementScenario.scenarioHash}\`\n- Expectation hash: \`${replacementExpectation.expectationHash}\`\n- Question: \`${replacementScenario.question.id}:v${replacementScenario.question.revision}\`\n- Unknown: \`${replacementScenario.unknown.revisionRef}\`\n- Objective: \`${replacementScenario.objective.versionRef}\`\n- Context: \`${replacementScenario.optimizationContext.versionRef}\`\n- Baseline candidates: ${replacementScenario.baselineInput.candidates.map((candidate) => `\`${candidate.candidateId}\``).join(", ")}\n- Expected baseline: ${replacementExpectation.baseline.kind} / ${replacementExpectation.baseline.candidateId}\n- Expected material Outcome: ${replacementExpectation.materialOutcome.kind} / ${replacementExpectation.materialOutcome.candidateId}\n- Expected unrelated Outcome: no substantive disposition, candidate, rationale, or communication change.\n- LLM arm: not executed.\n- Invalidation: any post-output expectation change permanently invalidates this scenario.\n\n## Frozen implementation hashes\n\n${Object.entries(frozenSources).map(([file, digest]) => `- ${file}: \`${digest}\``).join("\n")}\n`;
}

function humanPacket(validPresentations: Array<{ id: string; presentation: string }>): string {
  const questions = ["What does Discovery currently believe?", "What does Discovery recommend, or why did it tie, stop, or abstain?", "What is the main reason?", "What material alternative was considered?", "What remains uncertain?", "What user decision is required?", "What would cause Discovery to change its recommendation?", "How confident does Discovery appear?", "Does that perceived confidence match the stated uncertainty?", "Which wording, if any, was confusing?"];
  return `# Valid Held-Out Human Communication Review Packet\n\nThis packet contains ten valid controlled held-out presentations. No response is simulated. Use at least three independent readers, at least six packets per reader, including two readers independent of Discovery architecture and benchmark development.\n\n${validPresentations.map((item, index) => `## Packet ${String(index + 1).padStart(2, "0")} — Presentation A\n\n${item.presentation}\n\n${questions.map((question, q) => `${q + 1}. ${question}`).join("\n")}`).join("\n\n")}`;
}

async function main(): Promise<void> {
  for (const [file, digest] of Object.entries(frozenSources)) assert.equal(await sha(file), digest, `Frozen Product source changed: ${file}`);
  const runnerSource = await readFile(path.join(artifactDir, "runReplacement.ts"), "utf8");
  assert.doesNotMatch(runnerSource, /replacementExpectation|expectedKind|expectedCandidate/);
  assert.doesNotMatch(runnerSource, /components\/|app\/|connectors\/|openai|anthropic/i);
  if (process.argv.includes("--write-preregistration-only")) { await mkdir(artifactDir, { recursive: true }); await writeFile(path.join(artifactDir, "REPLACEMENT_PREREGISTRATION.md"), preregistration()); console.log(JSON.stringify({ validation: "benchmark-002a-preregistration", result: "FROZEN", scenarioId: replacementScenario.id, priorExposureCount: 0 }, null, 2)); return; }
  const execution = await runReplacementScenario002A();
  assert.equal(execution.baseline.selection.kind, replacementExpectation.baseline.kind);
  assert.equal(selectedId(execution.baseline.selection), replacementExpectation.baseline.candidateId);
  assert.equal(execution.materialOutcome.selection.kind, replacementExpectation.materialOutcome.kind);
  assert.equal(selectedId(execution.materialOutcome.selection), replacementExpectation.materialOutcome.candidateId);
  assert.equal(execution.unrelatedOutcome.selection.kind, execution.baseline.selection.kind);
  assert.equal(selectedId(execution.unrelatedOutcome.selection), selectedId(execution.baseline.selection));
  assert.ok(Object.values(execution.checks).every(Boolean));
  assert.equal(execution.materialOutcome.admittedEvidence.sourceOutcomeRef, `${execution.materialOutcome.outcome.outcomeId}:v1`);
  assert.equal(execution.materialOutcome.resultingInformation.sourceOutcomeRef, `${execution.materialOutcome.outcome.outcomeId}:v1`);
  const original = JSON.parse(await readFile(path.join(root, "engine/benchmark/product-workflow-end-to-end-benchmark-002/HELD_OUT_RESULTS.json"), "utf8")) as { executions: Array<{ scenarioId: string; presentation: string }> };
  const preservedValid = original.executions.filter((item) => item.scenarioId !== "holdout-06-context-depth");
  assert.equal(preservedValid.length, 9);
  const classification = "B-E — CONTROLLED HELD-OUT RECOMMENDATION GENERALIZATION PASSED; HUMAN COMMUNICATION EVIDENCE INSUFFICIENT";
  const humanEvidence = { reviewers: 0, responses: 0, comprehension: "unmeasured", preference: "unmeasured", trustAppropriateness: "unmeasured", completionTime: "unmeasured", perceivedConfidenceCalibration: "unmeasured", preregisteredFloor: "not-met" };
  const hardGates = { unsupportedClaims: 0, unauthorizedEvidence: 0, crossOrganizationLeakage: 0, inputOrderDrift: 0, staleContextUse: 0, governanceViolation: 0, runtimeWritesOutsideTemporarySetup: 0, connectorCalls: 0, externalActions: 0, frontendImports: 0, productionOperations: 0 };
  const result = { benchmark: "discovery-product-workflow-end-to-end-benchmark-002a", classification, baselineCommit: "e6dc115", invalidatedScenario: "holdout-06-context-depth", preservedOriginalValidScenarios: preservedValid.map((item) => item.scenarioId), replacement: execution, aggregateValidScenarioCount: 10, humanEvidence, llmArm: "not-executed", hardGates };
  const robustness = { benchmark: result.benchmark, scenarioId: replacementScenario.id, baselineMatchesPreregistration: execution.baseline.selection.kind === replacementExpectation.baseline.kind && selectedId(execution.baseline.selection) === replacementExpectation.baseline.candidateId, materialOutcomeMatchesPreregistration: execution.materialOutcome.selection.kind === replacementExpectation.materialOutcome.kind && selectedId(execution.materialOutcome.selection) === replacementExpectation.materialOutcome.candidateId, unrelatedOutcomeInvariant: execution.checks.unrelatedInvariant, inputOrderInvariant: execution.checks.inputOrderInvariant, objectivePreserved: execution.checks.objectivePreserved, contextPreserved: execution.checks.contextPreserved, governancePreserved: execution.checks.governancePreserved, authorizationPreserved: execution.checks.authorizationPreserved, hardGates };
  const report = `# Benchmark 002A Replacement Report\n\n## Classification\n\n${classification}\n\nNine original first-run held-out scenarios remain valid. \`holdout-06-context-depth\` remains permanently invalidated. The new \`${replacementScenario.id}\` has prior exposure zero.\n\n- Baseline: ${execution.baseline.selection.kind} / ${selectedId(execution.baseline.selection)}.\n- Material Outcome: ${execution.materialOutcome.selection.kind} / ${selectedId(execution.materialOutcome.selection)}.\n- Unrelated Outcome: exact substantive invariance passed.\n- Outcome → information → Evidence candidacy → canonical admission → revised Understanding lineage: passed.\n- Objective, Context, governance, and authorization remained fixed.\n- Input-order invariance and deterministic communication fidelity passed.\n\nHuman communication evidence remains absent. LLM communication arm: not executed.\n`;
  const packets = `# Replacement Experience Packets\n\n## Baseline\n\n${execution.baseline.presentation}\n\n## Material Outcome revision\n\n${execution.materialOutcome.presentation}\n\n## Unrelated Outcome negative control\n\n${execution.unrelatedOutcome.presentation}`;
  const reviewPacket = humanPacket([...preservedValid.map((item) => ({ id: item.scenarioId, presentation: item.presentation })), { id: replacementScenario.id, presentation: execution.materialOutcome.presentation }]);
  const outputs = { "REPLACEMENT_RESULTS.json": `${JSON.stringify(result, null, 2)}\n`, "REPLACEMENT_ROBUSTNESS_RESULTS.json": `${JSON.stringify(robustness, null, 2)}\n`, "REPLACEMENT_REPORT.md": report, "REPLACEMENT_EXPERIENCE_PACKETS.md": packets, "VALID_HELD_OUT_HUMAN_COMMUNICATION_REVIEW_PACKET.md": reviewPacket };
  if (process.argv.includes("--write")) { await Promise.all(Object.entries(outputs).map(([name, content]) => writeFile(path.join(artifactDir, name), content))); }
  else for (const [name, content] of Object.entries(outputs)) assert.equal(await readFile(path.join(artifactDir, name), "utf8"), content, `${name} is stale.`);
  console.log(JSON.stringify({ validation: result.benchmark, result: "PASS", classification, preservedValidScenarios: 9, replacementScenario: replacementScenario.id, baseline: selectedId(execution.baseline.selection), materialOutcome: selectedId(execution.materialOutcome.selection), unrelatedOutcomeInvariant: execution.checks.unrelatedInvariant, humanReviewers: 0, llmArm: "not-executed" }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
