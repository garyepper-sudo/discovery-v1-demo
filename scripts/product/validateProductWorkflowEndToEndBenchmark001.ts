import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runProductWorkflowEndToEndBenchmark001 } from "../../engine/benchmark/product-workflow-end-to-end-benchmark-001";
import { benchmarkScenarios } from "../../engine/benchmark/product-workflow-end-to-end-benchmark-001/scenarios";

async function main(): Promise<void> {
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const artifactDir = path.join(root, "engine/benchmark/product-workflow-end-to-end-benchmark-001");
const result = await runProductWorkflowEndToEndBenchmark001();

assert.equal(result.classification, "A — END-TO-END WORKFLOW RECOMMENDATION AND COMMUNICATION SHADOW VALIDATED");
assert.equal(result.scenarios.length, 4);
assert.equal(result.scenarios.filter((item) => item.answerKind === "unknown").length, 1);
assert.equal(result.scenarios.find((item) => item.scenarioId === "scenario-b")!.selection.kind, "material-tie");
assert.notEqual(
  result.scenarios.find((item) => item.scenarioId === "scenario-c-margin")!.brief.recommendedOption,
  result.scenarios.find((item) => item.scenarioId === "scenario-c-growth")!.brief.recommendedOption,
);
const cMarginFixture = benchmarkScenarios.find((item) => item.id === "scenario-c-margin")!;
const cGrowthFixture = benchmarkScenarios.find((item) => item.id === "scenario-c-growth")!;
assert.deepEqual(
  { question: cMarginFixture.question, unknown: cMarginFixture.unknown, understanding: cMarginFixture.understanding, evidence: cMarginFixture.evidence, candidates: cMarginFixture.selectorInput.candidates },
  { question: cGrowthFixture.question, unknown: cGrowthFixture.unknown, understanding: cGrowthFixture.understanding, evidence: cGrowthFixture.evidence, candidates: cGrowthFixture.selectorInput.candidates },
  "Scenario C must vary only governed Objective/Context and their authorized budget envelope.",
);
assert.ok(result.scenarios.every((item) => item.invariance.every((test) => test.passed)));
assert.ok(result.scenarios.every((item) => item.sensitivity.every((test) => test.passed)));
assert.ok(result.scenarios.every((item) => item.claimFidelity.passed && item.workflowTurns.length === 10));
assert.ok(result.scenarios.every((item) => item.evidenceStatus === "development-case"));
assert.equal(result.controlledSetupRuntimeWrites, 4);
assert.ok(Object.values(result.hardGates).every((count) => count === 0));
assert.deepEqual({ runtime: result.temporaryRuntimeWrites, connectors: result.connectorCalls, external: result.externalActions, production: result.productionOperations }, { runtime: 0, connectors: 0, external: 0, production: 0 });

for (const [relativePath, expectedHash] of Object.entries(result.frozenBaseline.sourceHashes)) {
  const actualHash = createHash("sha256").update(await readFile(path.join(root, relativePath))).digest("hex");
  assert.equal(actualHash, expectedHash, `Frozen baseline drifted: ${relativePath}`);
}
assert.ok(result.scenarios.every((item) => item.brief.candidateMaterialFields.every((candidate) =>
  item.deterministicPresentation.includes(`burden=${candidate.burden}`)
  && item.deterministicPresentation.includes(`reliability=${candidate.reliability}`)
  && item.deterministicPresentation.includes(`stop=${candidate.stoppingCondition}`),
)));

const sources = await Promise.all(["types.ts", "scenarios.ts", "communication.ts", "runBenchmark.ts", "index.ts"].map((name) => readFile(path.join(artifactDir, name), "utf8")));
assert.doesNotMatch(sources.join("\n"), /from\s+["'][^"']*(?:components\/|app\/|connectors\/)|from\s+["'](?:next|react)|new\s+CanonicalProductWorkspaceAdapter|openai|anthropic/i);

function report(): string {
  const scenarioLines = result.scenarios.map((item) => `- ${item.scenarioId}: ${item.selection.kind}${item.brief.recommendedOption ? ` (${item.brief.recommendedOption})` : ""}; invariance ${item.invariance.filter((test) => test.passed).length}/${item.invariance.length}; sensitivity ${item.sensitivity.filter((test) => test.passed).length}/${item.sensitivity.length}; ${item.evidenceStatus}.`).join("\n");
  return `# Discovery Product Workflow End-to-End Benchmark 001\n\n## Classification\n\n${result.classification}\n\nThis is controlled benchmark evidence only. It does not authorize Production, frontend wiring, selector activation, external action, or autonomous behavior. All four scenarios are development cases shaped during implementation; they do not constitute untouched generalization evidence.\n\n## Recommendation-owner boundary\n\n- Investigation Opportunity: canonical cognition; information gap only.\n- Product Confidence Improvement: Product Workflow; governed information-improvement proposal and receipt owner.\n- Material Information Acquisition: Product Workflow read-only comparison; select, tie, stop, or abstain only.\n- Executive Recommendation: cognition/Executive projection; not merged into this benchmark path.\n- Objective Recommendation: generation remains blocked.\n- Decision: Executive Decision pipeline; not a recommendation substitute.\n- Product Communication: product-language authority; benchmark brief remains non-authoritative.\n\n## Scenarios\n\n${scenarioLines}\n\nScenario A distinguishes a dominant approval-queueing mechanism from stable engineering throughput. Scenario B preserves competing ownership-timing and credential-readiness explanations and returns a material tie. Scenario C holds facts constant while exact governed Objective and Context variants change the selected information action.\n\n## Communication\n\nThe deterministic one-page progressive renderer passed claim fidelity. The LLM communication arm was not executed because no configured frozen benchmark provider boundary was required or used. No A/B packet was created because only one genuine renderer arm exists.\n\n## Development-case disclosure\n\nThe base expectations remain explicit and are never supplied to the selector or communication renderer. Scenario C growth was tuned after a budget-envelope mismatch, and Scenario A's urgency expectation was corrected because its selected action was already immediate. A future untouched held-out scenario set is required before making a generalization claim.\n\n## Safety and limitations\n\nAll hard gates are zero. The four controlled setup Runtime writes occur only in temporary filesystem repositories that are removed after independent reload; selector and rendering writes remain zero. Estimates are controlled and synthetic, not outcome calibrated. Mechanism sophistication and decision relevance remain bounded because Objective Recommendation generation and committed Decision execution are outside this benchmark. No human communication-superiority evidence was collected.\n`;
}

function packets(): string {
  return `# Controlled Experience Packets\n\n${result.scenarios.map((item) => `## ${item.scenarioId}\n\n${item.deterministicPresentation}\n\n### Workflow challenge trace\n\n${item.workflowTurns.map((turn) => `- ${turn}`).join("\n")}`).join("\n\n")}`;
}

if (process.argv.includes("--write")) {
  await mkdir(artifactDir, { recursive: true });
  await writeFile(path.join(artifactDir, "RESULTS.json"), `${JSON.stringify(result, null, 2)}\n`);
  await writeFile(path.join(artifactDir, "ROBUSTNESS_MATRIX.json"), `${JSON.stringify(result.scenarios.map(({ scenarioId, invariance, sensitivity }) => ({ scenarioId, invariance, sensitivity })), null, 2)}\n`);
  await writeFile(path.join(artifactDir, "REPORT.md"), report());
  await writeFile(path.join(artifactDir, "EXPERIENCE_PACKETS.md"), packets());
} else {
  assert.equal(await readFile(path.join(artifactDir, "RESULTS.json"), "utf8"), `${JSON.stringify(result, null, 2)}\n`);
  assert.equal(await readFile(path.join(artifactDir, "ROBUSTNESS_MATRIX.json"), "utf8"), `${JSON.stringify(result.scenarios.map(({ scenarioId, invariance, sensitivity }) => ({ scenarioId, invariance, sensitivity })), null, 2)}\n`);
  assert.equal(await readFile(path.join(artifactDir, "REPORT.md"), "utf8"), report());
  assert.equal(await readFile(path.join(artifactDir, "EXPERIENCE_PACKETS.md"), "utf8"), packets());
}

console.log(JSON.stringify({ validation: result.benchmark, result: "PASS", classification: result.classification, scenarios: result.scenarios.length, invarianceChecks: result.scenarios.reduce((sum, item) => sum + item.invariance.length, 0), sensitivityChecks: result.scenarios.reduce((sum, item) => sum + item.sensitivity.length, 0), llmArm: result.communication.llmArm, runtimeWrites: 0, connectorCalls: 0, externalActions: 0, frontendImports: 0, productionOperations: 0 }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
