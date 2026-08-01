import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runHeldOutBenchmark002 } from "../../engine/benchmark/product-workflow-end-to-end-benchmark-002";
import { heldOutExpectations } from "../../engine/benchmark/product-workflow-end-to-end-benchmark-002/heldOutExpectations";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const artifactDir = path.join(root, "engine/benchmark/product-workflow-end-to-end-benchmark-002");
const hashes = {
  "HELD_OUT_PREREGISTRATION.md": "edd731eb409f1d27df630dfab528fca284d4bfa7dde2f820cf2dff5d9f04dd14",
  "HELD_OUT_RESULTS.json": "97f69183afde491e06155e9a6cce0bc6a2b29c3f642576217b19c05670b9752a",
  "HELD_OUT_ROBUSTNESS_MATRIX.json": "affa02b81c2478823dc3bf364011cc2fff679771cb204d1b0256ff87aff97b65",
  "HELD_OUT_REPORT.md": "7c37fdc9e436596a27d17510cd55f58ad865d7f13ee987ba3686e73f898aa984",
  "HELD_OUT_EXPERIENCE_PACKETS.md": "cce16182a81e629f06b79a570c0ac0bb941077c43b29726d1abf3a66ed743306",
  "heldOutInputs.ts": "e87b89cd08687b6e488f4958e60c066a8fcb03d7d40e7bec32e304f65ad54722",
  "heldOutExpectations.ts": "c697bc1c0fe6746f7812f112d58139f4a719c65e069fbe1cd7160e50935be7fb",
  "runHeldOutBenchmark.ts": "53cfac12dbe19cd662b7450210ac8c822179bfc5dc150f7bb7dc609a30e242b5",
} as const;

async function main(): Promise<void> {
  for (const [name, expected] of Object.entries(hashes)) {
    const actual = createHash("sha256").update(await readFile(path.join(artifactDir, name))).digest("hex");
    assert.equal(actual, expected, `Original failed-run artifact changed: ${name}`);
  }
  const runner = await readFile(path.join(artifactDir, "runHeldOutBenchmark.ts"), "utf8");
  assert.doesNotMatch(runner, /heldOutExpectations|expectedKind|expectedCandidateId/);
  const results = await runHeldOutBenchmark002();
  const expected = new Map(heldOutExpectations.map((item) => [item.scenarioId, item]));
  const comparisons = results.map((result) => {
    const frozen = expected.get(result.scenarioId)!;
    const candidate = result.selection.kind === "selected-action" ? result.selection.selected.candidateId : null;
    return result.selection.kind === frozen.expectedKind && candidate === frozen.expectedCandidateId;
  });
  const invariance = results.flatMap((result) => result.invariance);
  const sensitivity = results.flatMap((result) => result.sensitivity);
  const failed = results.flatMap((result) => result.sensitivity.filter((test) => !test.passed).map((test) => ({ scenarioId: result.scenarioId, ...test })));
  assert.deepEqual(comparisons, Array(10).fill(true));
  assert.equal(invariance.filter((test) => test.passed).length, 60);
  assert.equal(sensitivity.filter((test) => test.passed).length, 39);
  assert.deepEqual(failed, [{ scenarioId: "holdout-06-context-depth", name: "contradictory-outcome", baseline: "abstain:none:support-account,support-routing", changed: "abstain:none:support-account,support-routing", passed: false }]);
  const original = JSON.parse(await readFile(path.join(artifactDir, "HELD_OUT_RESULTS.json"), "utf8")) as { hardGates: Record<string, number>; humanEvidence: { genuineResponses: number }; llmArm: { status: string } };
  assert.ok(Object.values(original.hardGates).every((count) => count === 0));
  assert.equal(original.humanEvidence.genuineResponses, 0);
  assert.equal(original.llmArm.status, "not-executed");
  console.log(JSON.stringify({ validation: "product-workflow-end-to-end-benchmark-002-failed-run", result: "PASS", classification: "B-R — HELD-OUT PROMOTION INCOMPLETE; ONE SENSITIVITY TEST INVALIDATED BY PERTURBATION DESIGN", comparisons: "10/10", invariance: "60/60", sensitivity: "39/40", invalidatedScenario: "holdout-06-context-depth", productDefect: false }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
