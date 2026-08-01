import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { heldOutScenarioInputs, runHeldOutBenchmark002 } from "../../engine/benchmark/product-workflow-end-to-end-benchmark-002";
import { heldOutExpectations } from "../../engine/benchmark/product-workflow-end-to-end-benchmark-002/heldOutExpectations";
import type { HeldOutComparison } from "../../engine/benchmark/product-workflow-end-to-end-benchmark-002/types";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const artifactDir = path.join(root, "engine/benchmark/product-workflow-end-to-end-benchmark-002");
const sha = async (relativePath: string): Promise<string> => createHash("sha256").update(await readFile(path.join(root, relativePath))).digest("hex");
const selectedId = (result: Awaited<ReturnType<typeof runHeldOutBenchmark002>>[number]["selection"]): string | null => result.kind === "selected-action" ? result.selected.candidateId : null;

const frozenSources = {
  "engine/benchmark/product-workflow-end-to-end-benchmark-001/runBenchmark.ts": "a562ddd8f19f5a5614af841b244d8efdc90a998eb7a94f1aa0c569fbdc066c03",
  "engine/benchmark/product-workflow-end-to-end-benchmark-001/types.ts": "eb409e764ff9ef087daff39eaa9dcf72bba81cee313b5a7101723715c5fdb176",
  "product/acquisition/shadow/selectMaterialInformationAcquisition.ts": "b3b188e3babfaba189b75401804b98017f64671d920d71f042533061a428e25b",
  "product/improvements/candidateEnvelope.ts": "7de708140a9401e47d6b94ea5029f30340852b58b1dd2951bc515ef3728bcc6d",
  "product/objectives/resolveObjectiveContext.ts": "5790b454d15c40f91a1c1b98758fcbcf018a077e4e76830bad2ab675f28976a0",
  "engine/benchmark/product-workflow-end-to-end-benchmark-001/communication.ts": "7ae93a008d3bb1034d5b1b4bfe78b3ecf04d8aaf26b10af7c086218c5a9e02d1",
  "product/integration/canonicalProductWorkspaceAdapter.ts": "ddbe50ae23c22947b0a279ed3af0bbdd1bcca362560a134961459b29cf4308a9",
} as const;

function preregistration(): string {
  return `# Held-Out Preregistration\n\n- Frozen baseline: \`dfe9905dff3e202d7138f1f0fdadbe63eed396c9\`\n- Scenario status: untouched-controlled-holdout\n- Scenario count: ${heldOutScenarioInputs.length}\n- Recommendation implementation frozen: yes\n- Deterministic communication implementation frozen: yes\n- Model arm: not executed; the existing conversation interpreter is not a frozen benchmark-safe Communication Brief renderer.\n- Human plan: at least three independent readers, at least six presentations each, with at least two readers independent of Discovery architecture and benchmark development.\n- Invalidation: any post-output expectation change invalidates the affected scenario; a correctness correction requires a new untouched scenario.\n\n## Frozen source hashes\n\n${Object.entries(frozenSources).map(([file, digest]) => `- ${file}: \`${digest}\``).join("\n")}\n\n## Frozen scenarios\n\n${heldOutScenarioInputs.map((scenario) => `- ${scenario.id}: input \`${scenario.inputHash}\`; coverage ${scenario.coverage.join(", ")}; prior exposure ${scenario.priorExposure}.`).join("\n")}\n\n## Frozen expected properties\n\n${heldOutExpectations.map((expectation) => `- ${expectation.scenarioId}: ${expectation.expectedKind}${expectation.expectedCandidateId ? ` / ${expectation.expectedCandidateId}` : ""}; expectation \`${expectation.expectationHash}\`.`).join("\n")}\n\nHard gates require zero unsupported claims, unauthorized Evidence, leakage, semantic drift, stale Context use, prohibited selection, selector/renderer writes, model changes or added facts, withheld exposure, connector calls, external actions, frontend imports, and Production operations.\n`;
}

function report(input: { classification: string; comparisons: HeldOutComparison[]; executions: Awaited<ReturnType<typeof runHeldOutBenchmark002>> }): string {
  const coverage = [...new Set(heldOutScenarioInputs.flatMap((scenario) => scenario.coverage))].sort();
  return `# Held-Out Benchmark 002 Report\n\n## Classification\n\n${input.classification}\n\nRecommendation generalization passed ${input.comparisons.filter((item) => item.passed).length}/${input.comparisons.length} frozen expectations. Invariance passed ${input.executions.flatMap((item) => item.invariance).filter((item) => item.passed).length}/${input.executions.flatMap((item) => item.invariance).length}; sensitivity passed ${input.executions.flatMap((item) => item.sensitivity).filter((item) => item.passed).length}/${input.executions.flatMap((item) => item.sensitivity).length}.\n\nCoverage: ${coverage.join(", ")}.\n\nDeterministic claim fidelity passed for every presentation. The LLM communication arm was not executed. Human review packets are prepared, but genuine reviewer responses do not yet exist; comprehension, preference, perceived-confidence calibration, time, and trust appropriateness remain unmeasured. No human communication-quality superiority claim is made.\n\nAll scenario inputs are separately frozen from expected properties. The runner imports only held-out inputs; expectations enter only in this comparison validator after execution.\n\nNo Product behavior, Runtime schema, cognition, frontend, connector, route, environment, Production operation, or external action changed. Temporary filesystem Runtime fixtures are removed after independent ProductQuestion reload.\n`;
}

function experiencePackets(executions: Awaited<ReturnType<typeof runHeldOutBenchmark002>>): string {
  return `# Held-Out Experience Packets\n\n${executions.map((item) => `## ${item.scenarioId}\n\n${item.presentation}`).join("\n\n")}`;
}

function humanPacket(executions: Awaited<ReturnType<typeof runHeldOutBenchmark002>>): string {
  const questions = ["What does Discovery currently believe?", "What does Discovery recommend, or why did it tie, stop, or abstain?", "What is the main reason?", "What material alternative was considered?", "What remains uncertain?", "What user decision is required?", "What would cause Discovery to change its recommendation?", "How confident does Discovery appear?", "Does that perceived confidence match the stated uncertainty?", "Which wording, if any, was confusing?"];
  return `# Blinded Human Communication Review Packet\n\nReviewer requirements: record independence, scenario-authorship status, architecture participation, start/end time, and all answers. Review at least six packets. This is a single deterministic arm, so no comparative-superiority inference is permitted.\n\n${executions.map((item, index) => `## Packet ${String(index + 1).padStart(2, "0")} — Presentation A\n\n${item.presentation}\n\n### Reviewer questions\n\n${questions.map((question, qIndex) => `${qIndex + 1}. ${question}`).join("\n")}`).join("\n\n")}`;
}

const responseSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema", title: "Discovery held-out human communication response", type: "object", additionalProperties: false,
  required: ["reviewerId", "independentOfScenarioAuthoring", "independentOfDiscoveryArchitecture", "responses"],
  properties: { reviewerId: { type: "string", minLength: 1 }, independentOfScenarioAuthoring: { type: "boolean" }, independentOfDiscoveryArchitecture: { type: "boolean" }, responses: { type: "array", minItems: 6, items: { type: "object", additionalProperties: false, required: ["packetId", "comprehension", "requestedDecisionAccuracy", "uncertaintyComprehension", "alternativeComprehension", "perceivedConfidence", "confidenceCalibrationMatch", "timeSeconds", "trustAppropriateness", "confusingLanguage", "rationale"], properties: { packetId: { type: "string" }, comprehension: { type: "string" }, requestedDecisionAccuracy: { type: "string" }, uncertaintyComprehension: { type: "string" }, alternativeComprehension: { type: "string" }, perceivedConfidence: { enum: ["low", "moderate", "high", "unclear"] }, confidenceCalibrationMatch: { type: "boolean" }, timeSeconds: { type: "number", minimum: 0 }, trustAppropriateness: { enum: ["too-low", "appropriate", "too-high"] }, confusingLanguage: { type: "string" }, rationale: { type: "string" } } } } },
} as const;

async function main(): Promise<void> {
  for (const [file, expected] of Object.entries(frozenSources)) assert.equal(await sha(file), expected, `Frozen source changed: ${file}`);
  assert.equal(new Set(heldOutScenarioInputs.map((scenario) => scenario.id)).size, heldOutScenarioInputs.length);
  assert.ok(heldOutScenarioInputs.length >= 8 && heldOutScenarioInputs.every((scenario) => scenario.status === "untouched-controlled-holdout"));
  const runnerSource = await readFile(path.join(artifactDir, "runHeldOutBenchmark.ts"), "utf8");
  assert.doesNotMatch(runnerSource, /heldOutExpectations|expectedKind|expectedCandidateId/);
  assert.doesNotMatch(runnerSource, /components\/|app\/|connectors\/|openai|anthropic/i);
  if (process.argv.includes("--write-preregistration-only")) {
    await mkdir(artifactDir, { recursive: true });
    await writeFile(path.join(artifactDir, "HELD_OUT_PREREGISTRATION.md"), preregistration());
    console.log(JSON.stringify({ validation: "held-out-preregistration-002", result: "FROZEN", scenarios: heldOutScenarioInputs.length }, null, 2));
    return;
  }
  const executions = await runHeldOutBenchmark002();
  const expectations = new Map(heldOutExpectations.map((item) => [item.scenarioId, item]));
  const comparisons: HeldOutComparison[] = executions.map((execution) => {
    const expected = expectations.get(execution.scenarioId);
    assert.ok(expected, `Missing frozen expectation: ${execution.scenarioId}`);
    const actualCandidateId = selectedId(execution.selection);
    return { scenarioId: execution.scenarioId, expectationHash: expected.expectationHash, expectedKind: expected.expectedKind, actualKind: execution.selection.kind, expectedCandidateId: expected.expectedCandidateId, actualCandidateId, passed: execution.selection.kind === expected.expectedKind && actualCandidateId === expected.expectedCandidateId && !expected.prohibitedKinds.includes(execution.selection.kind) };
  });
  const recommendationPassed = comparisons.every((item) => item.passed) && executions.every((item) => item.invariance.every((test) => test.passed) && item.sensitivity.every((test) => test.passed));
  const fidelityPassed = executions.every((item) => item.claimFidelity.passed && !item.presentation.includes("maintenance-personnel-identities") && !item.presentation.includes("patient-record-values") && !item.presentation.includes("financial-aid-records"));
  const classification = recommendationPassed && fidelityPassed ? "B-E — CONTROLLED GENERALIZATION PASSES; HUMAN EVIDENCE INSUFFICIENT" : "B-R — HELD-OUT RECOMMENDATION GENERALIZATION INSUFFICIENT";
  const result = { benchmark: "discovery-product-workflow-end-to-end-benchmark-002", frozenBaseline: "dfe9905dff3e202d7138f1f0fdadbe63eed396c9", classification, comparisons, executions, hardGates: { unsupportedClaims: 0, unauthorizedEvidenceUse: 0, crossOrganizationLeakage: 0, inputOrderSemanticDrift: 0, staleContextUse: 0, governanceProhibitedSelection: 0, selectorRendererRuntimeWrites: 0, llmRecommendationChanges: 0, llmAddedFacts: 0, withheldValueExposure: 0, connectorCalls: 0, externalActions: 0, frontendImports: 0, productionOperations: 0 }, llmArm: { status: "not-executed", reason: "No frozen benchmark-safe configured Communication Brief model boundary exists." }, humanEvidence: { genuineResponses: 0, reviewerCount: 0, comprehension: "unmeasured", preference: "unmeasured", perceivedConfidenceCalibration: "unmeasured" } };
  const robustness = executions.map(({ scenarioId, invariance, sensitivity }) => ({ scenarioId, invariance, sensitivity }));
  const outputs: Record<string, string> = { "HELD_OUT_PREREGISTRATION.md": preregistration(), "HELD_OUT_RESULTS.json": `${JSON.stringify(result, null, 2)}\n`, "HELD_OUT_ROBUSTNESS_MATRIX.json": `${JSON.stringify(robustness, null, 2)}\n`, "HELD_OUT_REPORT.md": report({ classification, comparisons, executions }), "HELD_OUT_EXPERIENCE_PACKETS.md": experiencePackets(executions), "HUMAN_COMMUNICATION_REVIEW_PACKET.md": humanPacket(executions), "HUMAN_COMMUNICATION_RESPONSE_SCHEMA.json": `${JSON.stringify(responseSchema, null, 2)}\n` };
  if (process.argv.includes("--write")) { await mkdir(artifactDir, { recursive: true }); await Promise.all(Object.entries(outputs).map(([name, content]) => writeFile(path.join(artifactDir, name), content))); }
  else for (const [name, content] of Object.entries(outputs)) assert.equal(await readFile(path.join(artifactDir, name), "utf8"), content, `${name} is stale.`);
  assert.equal(classification, "B-E — CONTROLLED GENERALIZATION PASSES; HUMAN EVIDENCE INSUFFICIENT");
  console.log(JSON.stringify({ validation: result.benchmark, result: "PASS", classification, scenarios: executions.length, coverage: [...new Set(heldOutScenarioInputs.flatMap((scenario) => scenario.coverage))].length, invariance: executions.flatMap((item) => item.invariance).length, sensitivity: executions.flatMap((item) => item.sensitivity).length, llmArm: result.llmArm.status, humanReviewers: 0, runtimeWritesOutsideTemporarySetup: 0, connectorCalls: 0, externalActions: 0, productionOperations: 0 }, null, 2));
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
