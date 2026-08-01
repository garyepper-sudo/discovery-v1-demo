import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { readFrontendReadyProductQuestionWorkspace, workflowReadinessFixtureAdapter } from "../../product/frontend";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import { createDurableProductQuestion } from "../../product/questions";
import { serializeProductQuestionWorkspaceV2 } from "../../product/workflow";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outputDir = path.join(root, "product/frontend-readiness");
const at = "2026-08-01T18:00:00.000Z";
const organizationId = "onb-dev-frontend-readiness-001";
const userId = "development-user:frontend-readiness";
const sha = async (file: string) => createHash("sha256").update(await readFile(path.join(root, file))).digest("hex");

async function main() {
  const directory = await mkdtemp(path.join(tmpdir(), "discovery-frontend-readiness-"));
  try {
    const repository = new FilesystemOrganizationRuntimeRepository(directory);
    const empty = createEmptyOrganizationRuntime({ organizationId, name: "Frontend Readiness", industry: "Controlled development" });
    const created = createDurableProductQuestion({ runtime: empty, title: "Why is bounded operational review delayed?", createdAt: at, questionId: "frontend-readiness-question" });
    await repository.create(organizationId, new TextEncoder().encode(JSON.stringify(created.runtime)), { requestId: "frontend-readiness-seed", operatorId: userId });
    let reads = 0;
    const countedRepository = { read: async (id: string) => { reads += 1; return repository.read(id); }, replace: repository.replace.bind(repository) };
    const adapter = new CanonicalProductWorkspaceAdapter({ runtimeRepository: countedRepository, authorize: async ({ userId: candidate, organizationId: org }) => candidate === userId && org === organizationId, investigate: async ({ runtime }) => ({ runtime, evidenceAccepted: false }) });
    const result = await readFrontendReadyProductQuestionWorkspace({ adapter, userId, organizationId, questionId: created.question.id });
    assert.equal(result.workspace.contractVersion, "2"); assert.equal(result.authorizationChecks, 1); assert.equal(result.repositoryReads, 1); assert.equal(reads, 1); assert.equal(result.workspace.organizationId, organizationId); assert.ok(result.payloadBytes > 0);
    const serialized = serializeProductQuestionWorkspaceV2(result.workspace);
    assert.doesNotMatch(serialized, /\"memory\"|\"runtime\"|\"cognition\"/i);
    const beforeDenied = reads;
    await assert.rejects(() => readFrontendReadyProductQuestionWorkspace({ adapter, userId: "unauthorized", organizationId, questionId: created.question.id }), /access denied/);
    assert.equal(reads, beforeDenied, "Unauthorized workspace read reached Runtime.");
    await assert.rejects(() => readFrontendReadyProductQuestionWorkspace({ adapter, userId, organizationId: "onb-dev-other-organization", questionId: created.question.id }), /access denied/);
    assert.equal(reads, beforeDenied, "Cross-organization read reached Runtime.");
    const fixtures = workflowReadinessFixtureAdapter.list();
    assert.equal(fixtures.length, 24); assert.equal(new Set(fixtures.map((fixture) => fixture.id)).size, 24);
    for (const fixture of fixtures) {
      assert.equal(fixture.workspace.contractVersion, "2"); assert.equal(fixture.organizationId, fixture.workspace.organizationId); assert.equal(fixture.expectedStage, fixture.workspace.orientation.currentStage); assert.equal(fixture.workspaceDigest, workflowReadinessFixtureAdapter.read(fixture.id).workspaceDigest);
      const reset = workflowReadinessFixtureAdapter.reset(fixture.id); assert.equal(reset.seedHash, fixture.seedHash); assert.equal(reset.workspaceDigest, fixture.workspaceDigest); assert.equal(JSON.stringify(reset), JSON.stringify(fixture)); assert.doesNotMatch(JSON.stringify(fixture), /credential|customer|production|benchmark expected/i);
    }
    const actionIds = result.workspace.actions.map((action) => action.id); assert.equal(actionIds.length, new Set(actionIds).size); assert.ok(result.workspace.actions.find((action) => action.id === "execute-existing-local-read-only-operation" && !action.enabled && action.blockedReason === "operation-owner-unimplemented" && action.writesRuntime && !action.mayAccessExternalSystem));
    assert.throws(() => serializeProductQuestionWorkspaceV2({ ...result.workspace, organizationId: Number.NaN as unknown as string }), /non-finite/);
    const executorSearch = await Promise.all(["product", "engine/v3"].map(async (directoryName) => {
      const files = (await readdir(path.join(root, directoryName), { recursive: true })).filter((file) => typeof file === "string" && file.endsWith(".ts"));
      return Promise.all(files.map(async (file) => ({
        file: path.join(directoryName, file),
        source: await readFile(path.join(root, directoryName, file), "utf8"),
      })));
    }));
    const canonicalExecutorDeclaration = /export\s+function\s+executeLocalInformationOperation/;
    const executorDeclarations = executorSearch.flat().filter(({ source }) => canonicalExecutorDeclaration.test(source));
    assert.deepEqual(executorDeclarations.map(({ file }) => file), ["product/improvements/localInformationOperation.ts"]);
    const candidateTypesAreNotExecutors = true;
    const hashes = { selector: await sha("product/acquisition/shadow/selectMaterialInformationAcquisition.ts"), candidateEnvelope: await sha("product/improvements/candidateEnvelope.ts"), confidenceImprovement: await sha("product/improvements/improvementLifecycle.ts"), objectiveResolution: await sha("product/objectives/resolveObjectiveContext.ts"), benchmark001: await sha("engine/benchmark/product-workflow-end-to-end-benchmark-001/RESULTS.json"), benchmark002a: await sha("engine/benchmark/product-workflow-end-to-end-benchmark-002a/REPLACEMENT_RESULTS.json") };
    const classification = "A — PRODUCT WORKFLOW FRONTEND READINESS VALIDATED";
    const replay = { classification, organizationId, questionCreated: true, independentlyReloaded: true, authorizedWorkspaceRead: true, operationRan: false, blocker: "This boundary-only replay contains no governed human choice; real operation acceptance is owned by validate:gap-a-005-local-operation-executor-001.", informationProduced: false, evidenceAdmitted: false, unknownChanged: false, answerChanged: false, understandingChanged: false, learningRecorded: false, connectorCalls: 0, externalActions: 0, productionOperations: 0, temporaryRuntimeRemoved: true };
    const output = { validation: "product-workflow-frontend-readiness-001", result: "PASS", classification, contractVersion: "2", fixtures: fixtures.length, authorizationChecks: 1, repositoryReads: 1, payloadBytes: result.payloadBytes, disclosedObjectCounts: { stages: result.workspace.stages.length, actions: result.workspace.actions.length }, unavailableCount: result.workspace.unavailableFields.length, withheldCount: result.workspace.withheldFields.length, deterministicSerializationDigest: createHash("sha256").update(serialized).digest("hex"), exactReset: true, unsupportedSerializationRejected: true, candidateTypesAreNotExecutors, executorFilesInspected: executorSearch.flat().length, replay, hashes };
    const report = `# Product Workflow Frontend Readiness 001\n\n**Classification:** ${classification}\n\nThe version-2 frontend boundary, deterministic orientation, semantic action surface, 24-state fixture pack, one-read authorization behavior, and exact reset are validated. The canonical local operation is validated separately by \`validate:gap-a-005-local-operation-executor-001\`; candidate presence alone still grants no execution authority.\n\n- Authorization checks: 1\n- Runtime repository reads: 1\n- Payload bytes: ${result.payloadBytes}\n- Fixture states: ${fixtures.length}\n- Connector calls: 0\n- External actions: 0\n- Production operations: 0\n`;
    const gapReport = `# GAP-A-005 Workflow Acceptance Replay\n\n**Classification:** ${classification}\n\nThis artifact preserves the boundary-only replay for temporary organization \`${organizationId}\`. Real operation, Outcome, and truthful no-change Learning acceptance are owned by \`validate:gap-a-005-local-operation-executor-001\`. Candidate semantics are not treated as executable authority.\n`;
    if (process.argv.includes("--write")) { await mkdir(outputDir, { recursive: true }); await Promise.all([writeFile(path.join(outputDir, "FRONTEND_READINESS_RESULTS.json"), `${JSON.stringify(output, null, 2)}\n`), writeFile(path.join(outputDir, "FRONTEND_READINESS_REPORT.md"), report), writeFile(path.join(outputDir, "GAP_A_005_WORKFLOW_ACCEPTANCE_RESULTS.json"), `${JSON.stringify(replay, null, 2)}\n`), writeFile(path.join(outputDir, "GAP_A_005_WORKFLOW_ACCEPTANCE_REPORT.md"), gapReport)]); }
    else { assert.equal(await readFile(path.join(outputDir, "FRONTEND_READINESS_RESULTS.json"), "utf8"), `${JSON.stringify(output, null, 2)}\n`); assert.equal(await readFile(path.join(outputDir, "FRONTEND_READINESS_REPORT.md"), "utf8"), report); assert.equal(await readFile(path.join(outputDir, "GAP_A_005_WORKFLOW_ACCEPTANCE_RESULTS.json"), "utf8"), `${JSON.stringify(replay, null, 2)}\n`); assert.equal(await readFile(path.join(outputDir, "GAP_A_005_WORKFLOW_ACCEPTANCE_REPORT.md"), "utf8"), gapReport); }
    console.log(JSON.stringify({ validation: output.validation, result: output.result, classification, fixtures: fixtures.length, repositoryReads: reads, operationRan: false }, null, 2));
  } finally { await rm(directory, { recursive: true, force: true }); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
