import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import {
  chmod,
  lstat,
  mkdtemp,
  readFile,
  readdir,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { CanonicalLocalSourceBindingService } from "../../engine/v3/governance/canonicalLocalSourceBindingService";
import { readCanonicalScopeLineageTopology, resolveCurrentSourceScopeBinding } from "../../engine/v3/governance/canonicalScopeLineage";
import { createFilesystemSourceContentRepository } from "../../engine/v3/sources/sourceContentRepository";
import { createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { buildDurableProductQuestion } from "../../product/questions/questionLifecycle";
import {
  resolveScopedGovernanceContext,
  type ScopedAuthorityGrant,
} from "../../engine/v3/governance/scopedGovernanceContext";
import {
  createProductArtifactBodyRepository,
  productArtifactBodyDigest,
  serializeProductArtifactBodyV1,
  type ProductArtifactBodyRepository,
} from "../../product/persistence";
import { CanonicalProductArtifactCurrentAccessComposition } from "../../product/integration/canonicalProductArtifactCurrentAccessComposition";
import { resolveProductArtifactCurrentAccessV1 } from "../../product/integration/productArtifactCurrentAccessResolver";
import {
  completeProductArtifactInspectionMetadataV1,
  validateProductArtifactInspectionMetadataV1,
} from "../../product/workflow/productArtifactInspectionMetadataContracts";
import type { ProductArtifactCurrentOwnerStateV1 } from "../../product/workflow/productArtifactCurrentAccessContracts";
import {
  buildCurrentAuthorizedProductQuestionWorkspaceV1,
  classifyFuturePreparationItemsV1,
  deriveCurrentAuthorizedLeadershipHistoryV1,
  LeadershipConversationProductOperations,
} from "../../product/workflow/leadershipConversation/operations";
import {
  completeLeadershipConversationPublicationReceiptV1,
  type LeadershipConversationArtifactStoreV1,
  type ProductWorkflowArtifactRepository,
} from "../../product/workflow/leadershipConversation";
import { leadershipId } from "../../product/workflow/leadershipConversation/determinism";
import {
  provisionNorthstarPreparationLineageFixture,
  provisionForeignCanonicalOwnerPartition,
  readNorthstarPreparationLineageSeed,
  resetNorthstarPreparationLineageFixture,
} from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import {
  createLeadershipConversationServerCompositionForValidation,
} from "../../product/integration/leadershipConversationServerComposition";
import { NORTHSTAR_SCOPES } from "../../product/simulations/living-organization-sandbox/sourceScopeBindings";
import { readLeadershipConversationFixture } from "../../product/frontend/leadershipConversationFixtureAdapter";
import type { CanonicalProductArtifactReadRequestV1 } from "../../product/integration/canonicalProductArtifactCurrentAccessComposition";
import {
  NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE,
  NORTHSTAR_PREPARED_CONTENT,
  NORTHSTAR_PREPARED_LINEAGE,
  createProductWorkflowArtifactRepository,
} from "../../product/workflow/leadershipConversation";

const NORTHSTAR_ORGANIZATION =
    "sandbox-northstar-implementation-services-001" as const,
  NORTHSTAR_FIXTURE = "northstar-preparation-lineage-fixture-v1" as const,
  NORTHSTAR_KEY = "northstar-preparation-lineage:v1" as const;
async function seedChild(
  root: string,
  expectedSeedDigest: string,
): Promise<void> {
  const seed = await readNorthstarPreparationLineageSeed({
    fixtureRoot: root,
    organizationId: NORTHSTAR_ORGANIZATION,
    fixtureId: NORTHSTAR_FIXTURE,
    provisioningKey: NORTHSTAR_KEY,
    expectedSeedDigest,
  });
  process.stdout.write(`${seed.seedDigest}\n`);
}
async function childDigest(root: string, expected: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        "--conditions=react-server",
        "--import",
        "tsx",
        process.argv[1]!,
        "--seed-child",
        root,
        expected,
      ],
      {
        cwd: process.cwd(),
        env: { ...process.env, NODE_ENV: "test" },
        stdio: ["ignore", "pipe", "pipe"],
      },
    );
    let output = "",
      error = "";
    child.stdout.on("data", (chunk) => (output += String(chunk)));
    child.stderr.on("data", (chunk) => (error += String(chunk)));
    child.on("exit", (code) =>
      code === 0
        ? resolve(output.trim())
        : reject(new Error(error || `seed child failed: ${code}`)),
    );
  });
}
type CurrentOwnerFreshManifest = {
  runtimeRoot: string; workflowRoot: string; sourceContentRoot: string; lineageFixtureRoot: string;
  organizationId: string; userId: string; purpose: string; evaluatedAt: string;
  prepared: { artifactType: "prepared-work"; artifactId: string; artifactRevision: string; scopeDigest: string };
  checkpoint: { artifactType: "frozen-snapshot"; artifactId: string; artifactRevision: string; scopeDigest: string };
  predecessorOccurrenceId: string;
  denialArtifact?: "prepared" | "checkpoint";
  foreign?: {
    organizationId: string; productQuestionId: string; sourceContentRoot: string;
    sourceBindingId: string; sourceContentVersionId: string;
    canonicalEvidenceIds: string[]; canonicalUnderstandingRevision: string;
    projectionSourceRef: string; projectionRevision: string;
  };
  manifestDigest: string;
};
type CurrentOwnerFreshManifestUnsigned = Omit<CurrentOwnerFreshManifest, "manifestDigest">;
function completeCurrentOwnerFreshManifest(value: CurrentOwnerFreshManifestUnsigned): CurrentOwnerFreshManifest {
  return { ...value, manifestDigest: productArtifactBodyDigest(value) };
}
async function currentOwnerFreshChild(manifestPath: string): Promise<void> {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8")) as CurrentOwnerFreshManifest;
  const { manifestDigest, ...unsignedManifest } = manifest;
  if (manifestDigest !== productArtifactBodyDigest(unsignedManifest)) throw new Error("Fresh-process manifest integrity failed.");
  if (manifest.foreign) {
    const foreignRuntime = await new FilesystemOrganizationRuntimeRepository(manifest.runtimeRoot).read(manifest.foreign.organizationId);
    if (!foreignRuntime || foreignRuntime.revision !== manifest.foreign.projectionRevision) throw new Error("Fresh foreign Runtime reconstruction failed.");
    if (buildDurableProductQuestion({ runtime: foreignRuntime.runtime, questionId: manifest.foreign.productQuestionId })?.id !== manifest.foreign.productQuestionId) throw new Error("Fresh foreign ProductQuestion reconstruction failed.");
    const index = foreignRuntime.runtime.memory.canonicalScopeLineageIndex;
    const binding = index?.sourceBindings.find((item) => item.bindingId === manifest.foreign!.sourceBindingId);
    const currentBinding = binding ? resolveCurrentSourceScopeBinding(index!.sourceBindings.filter((item) => item.source.sourceId === binding.source.sourceId), manifest.evaluatedAt) : undefined;
    if (!binding || currentBinding?.bindingId !== binding.bindingId || currentBinding.availability !== "available" || currentBinding.organizationId !== manifest.foreign.organizationId) throw new Error("Fresh foreign governance reconstruction failed.");
    const content = await createFilesystemSourceContentRepository({ root: manifest.foreign.sourceContentRoot, environment: "test" }).read(manifest.foreign.organizationId, manifest.foreign.sourceContentVersionId);
    if (!content || content.version.sourceBindingId !== binding.bindingId || content.version.normalizedContentDigest !== binding.source.normalizedContentDigest) throw new Error("Fresh foreign Source Content reconstruction failed.");
    const explanations = foreignRuntime.runtime.memory.organizationalExplanations.filter((item) => item.organizationId === manifest.foreign!.organizationId && item.canonicalGovernanceLineage);
    const evidenceIds = new Set(explanations.flatMap((item) => item.canonicalGovernanceLineage!.materialSupports.map((support) => support.canonicalEvidenceId)));
    if (!manifest.foreign.canonicalEvidenceIds.every((id) => evidenceIds.has(id))) throw new Error("Fresh foreign Evidence lineage reconstruction failed.");
    const composition = foreignRuntime.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.find((item) => item.id === manifest.foreign!.projectionSourceRef && item.revisionId === manifest.foreign!.canonicalUnderstandingRevision && item.organizationId === manifest.foreign!.organizationId);
    if (!composition) throw new Error("Fresh foreign projection-source reconstruction failed.");
    const foreignWorkflow = await createProductWorkflowArtifactRepository({ root: manifest.workflowRoot, environment: "test" }).read(manifest.foreign.organizationId);
    if (!foreignWorkflow.store.contexts.some((item) => item.questionId === manifest.foreign!.productQuestionId)) throw new Error("Fresh foreign Product Workflow reconstruction failed.");
  }
  const physical = createProductArtifactBodyRepository({ root: path.join(path.dirname(manifest.workflowRoot), "product-artifact-bodies") });
  const reads = { preparedWork: 0, checkpoint: 0 };
  const counted: ProductArtifactBodyRepository = { backend: "filesystem", stage: physical.stage.bind(physical), readStagedExact: async (body) => { if (body.artifactType === "prepared-work") reads.preparedWork++; else if (body.artifactType === "frozen-snapshot") reads.checkpoint++; return physical.readStagedExact(body); } };
  const composition = createLeadershipConversationServerCompositionForValidation({ runtimeRoot: manifest.runtimeRoot, workflowRoot: manifest.workflowRoot, sourceContentRoot: manifest.sourceContentRoot, lineageFixtureRoot: manifest.lineageFixtureRoot, userId: manifest.userId, organizationId: manifest.organizationId, bodyRepository: counted });
  const base = { contractVersion: "1" as const, organizationId: manifest.organizationId, subjectId: manifest.userId, operation: "product-artifact:read" as const, purpose: manifest.purpose, sensitivity: "standard" as const, evaluatedAt: manifest.evaluatedAt, project: (bytes: Uint8Array) => bytes.byteLength };
  if (manifest.denialArtifact) {
    const target = manifest.denialArtifact === "prepared" ? manifest.prepared : manifest.checkpoint;
    const denied = await composition.productArtifactAccess.readAuthorized({ ...base, ...target });
    if (denied.disposition !== "inaccessible" || reads.preparedWork !== 0 || reads.checkpoint !== 0) throw new Error("Fresh derived-state denial reconstruction failed.");
    process.stdout.write(JSON.stringify({ result: "PASS", denied: manifest.denialArtifact, reads }));
    return;
  }
  const prepared = await composition.productArtifactAccess.readAuthorized({ ...base, ...manifest.prepared });
  const checkpoint = await composition.productArtifactAccess.readAuthorized({ ...base, ...manifest.checkpoint });
  const denied = await composition.productArtifactAccess.readAuthorized({ ...base, ...manifest.prepared, subjectId: "fresh-denied-user" });
  const historical=await composition.productArtifactAccess.readHistoricalPredecessor({contractVersion:"2",organizationId:manifest.organizationId,predecessorArtifactOrganizationId:manifest.organizationId,productQuestionId:(await createProductWorkflowArtifactRepository({root:manifest.workflowRoot,environment:"test"}).read(manifest.organizationId)).store.contexts[0]!.questionId,meetingSeriesId:`leadership-conversation-series:${NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE.conversationId}`,predecessorOccurrenceId:manifest.predecessorOccurrenceId,predecessorConversationId:NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE.conversationId,predecessorCheckpointId:manifest.checkpoint.artifactId,subjectId:manifest.userId,artifactId:manifest.prepared.artifactId,artifactRevision:manifest.prepared.artifactRevision,headerDigest:(await createProductWorkflowArtifactRepository({root:manifest.workflowRoot,environment:"test"}).read(manifest.organizationId)).store.preparedWorkPublications![0]!.headerDigest,bodyRefDigest:(await createProductWorkflowArtifactRepository({root:manifest.workflowRoot,environment:"test"}).read(manifest.organizationId)).store.preparedWorkPublications![0]!.protectedBody.refDigest,purpose:manifest.purpose,scopeDigest:manifest.prepared.scopeDigest,sensitivity:"standard",evaluatedAt:manifest.evaluatedAt});
  if (prepared.disposition !== "eligible" || checkpoint.disposition !== "eligible" || denied.disposition !== "inaccessible" || historical.outcome!=="accessible" || reads.preparedWork !== 2 || reads.checkpoint !== 1) throw new Error("Fresh current-owner-state reconstruction failed.");
  process.stdout.write(JSON.stringify({ result: "PASS", prepared: prepared.disposition, checkpoint: checkpoint.disposition, denied: denied.disposition, historical:historical.outcome, reads }));
}
async function runFreshCurrentOwnerChild(manifestPath: string): Promise<string> {
  return new Promise((resolve, reject) => { const child = spawn(process.execPath, ["--conditions=react-server", "--import", "tsx", process.argv[1]!, "--current-owner-fresh-child", manifestPath], { cwd: process.cwd(), env: { ...process.env, NODE_ENV: "test" }, stdio: ["ignore", "pipe", "pipe"] }); let stdout = "", stderr = ""; child.stdout.on("data", (value) => { stdout += String(value); }); child.stderr.on("data", (value) => { stderr += String(value); }); child.on("error", reject); child.on("close", (code) => code === 0 ? resolve(stdout) : reject(new Error(stderr || `fresh child exited ${code}`))); });
}
async function validateSeedRecordScenario(): Promise<number> {
  const root = await mkdtemp(
    path.join(tmpdir(), "discovery-northstar-preparation-lineage-seed-record-"),
  );
  let checks = 0;
  try {
    await assert.rejects(
      () =>
        readNorthstarPreparationLineageSeed({
          fixtureRoot: root,
          organizationId: NORTHSTAR_ORGANIZATION,
          fixtureId: NORTHSTAR_FIXTURE,
          provisioningKey: NORTHSTAR_KEY,
        }),
      /unavailable/,
    );
    checks++;
    const first = await provisionNorthstarPreparationLineageFixture({
      environment: "test",
      fixtureRoot: root,
    });
    const loaded = await readNorthstarPreparationLineageSeed({
      fixtureRoot: root,
      organizationId: NORTHSTAR_ORGANIZATION,
      fixtureId: NORTHSTAR_FIXTURE,
      provisioningKey: NORTHSTAR_KEY,
      expectedSeedDigest: first.seed.seedDigest,
    });
    assert.deepEqual(loaded, first.seed);
    checks += 2;
    assert.equal(
      await childDigest(root, first.seed.seedDigest),
      first.seed.seedDigest,
    );
    checks++;
    const second = await provisionNorthstarPreparationLineageFixture({
      environment: "test",
      fixtureRoot: root,
    });
    assert.equal(second.disposition, "idempotent-replay");
    assert.deepEqual(second.seed, first.seed);
    checks += 2;
    await assert.rejects(
      () =>
        readNorthstarPreparationLineageSeed({
          fixtureRoot: root,
          organizationId: NORTHSTAR_ORGANIZATION,
          fixtureId: NORTHSTAR_FIXTURE,
          provisioningKey: NORTHSTAR_KEY,
          expectedSeedDigest: "0".repeat(64),
        }),
      /integrity/,
    );
    checks++;
    const recordDirectory = path.join(
        root,
        "preparation-lineage-seeds",
        NORTHSTAR_ORGANIZATION,
      ),
      recordName = (await readdir(recordDirectory)).find((name) =>
        name.endsWith(".json"),
      );
    assert.ok(recordName);
    const recordPath = path.join(recordDirectory, recordName),
      original = await readFile(recordPath),
      status = await lstat(recordPath);
    assert.equal(status.mode & 0o777, 0o600);
    checks++;
    const parsed = JSON.parse(original.toString("utf8"));
    parsed.seed.projectionSourceRef = "tampered";
    await writeFile(recordPath, `${JSON.stringify(parsed)}\n`, { mode: 0o600 });
    await assert.rejects(
      () =>
        readNorthstarPreparationLineageSeed({
          fixtureRoot: root,
          organizationId: NORTHSTAR_ORGANIZATION,
          fixtureId: NORTHSTAR_FIXTURE,
          provisioningKey: NORTHSTAR_KEY,
        }),
      /integrity/,
    );
    checks++;
    await writeFile(recordPath, original, { mode: 0o600 });
    const alias = `${root}-alias`;
    await symlink(root, alias);
    await assert.rejects(
      () =>
        readNorthstarPreparationLineageSeed({
          fixtureRoot: alias,
          organizationId: NORTHSTAR_ORGANIZATION,
          fixtureId: NORTHSTAR_FIXTURE,
          provisioningKey: NORTHSTAR_KEY,
        }),
      /unsafe/,
    );
    await rm(alias);
    checks++;
    await chmod(recordPath, 0o644);
    await assert.rejects(
      () =>
        readNorthstarPreparationLineageSeed({
          fixtureRoot: root,
          organizationId: NORTHSTAR_ORGANIZATION,
          fixtureId: NORTHSTAR_FIXTURE,
          provisioningKey: NORTHSTAR_KEY,
        }),
      /integrity/,
    );
    await chmod(recordPath, 0o600);
    checks++;
    await resetNorthstarPreparationLineageFixture({
      environment: "test",
      fixtureRoot: root,
    });
    await assert.rejects(() => lstat(root), /ENOENT/);
    checks++;
    await mkdirForReprovision(root);
    const reprovisioned = await provisionNorthstarPreparationLineageFixture({
      environment: "test",
      fixtureRoot: root,
    });
    assert.equal(reprovisioned.seed.seedDigest, first.seed.seedDigest);
    checks++;
    console.log(`northstar-seed-record: PASS (${checks} checks)`);
    return checks;
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
async function mkdirForReprovision(root: string): Promise<void> {
  const { mkdir } = await import("node:fs/promises");
  await mkdir(root, { mode: 0o700 });
}

async function validateCanonicalServerCurrentAccess(): Promise<number> {
  const replayRoot = await mkdtemp(
      path.join(tmpdir(), "discovery-leadership-conversation-replay-current-owner-"),
    ),
    lineageRoot = await mkdtemp(
      path.join(tmpdir(), "discovery-northstar-preparation-lineage-current-owner-"),
    );
  try {
    const fixture = NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE;
    const provisioned = await provisionNorthstarPreparationLineageFixture({
      environment: "test",
      fixtureRoot: lineageRoot,
    });
    const sourceRuntime = await new FilesystemOrganizationRuntimeRepository(
      path.join(lineageRoot, "runtime"),
    ).read(fixture.organizationId);
    assert.ok(sourceRuntime);
    const runtimeRoot = path.join(replayRoot, "runtime"),
      workflowRoot = path.join(replayRoot, "workflow"),
      sourceContentRoot = path.join(replayRoot, "content"),
      runtime = new FilesystemOrganizationRuntimeRepository(runtimeRoot);
    const withQuestion = createDurableProductQuestion({
      runtime: sourceRuntime.runtime,
      title: "What is constraining Northstar delivery?",
      questionId: provisioned.seed.productQuestionId,
      createdAt: fixture.at,
    }).runtime;
    await runtime.create(
      fixture.organizationId,
      new TextEncoder().encode(JSON.stringify(withQuestion, null, 2)),
      { requestId: "current-owner-state-runtime", operatorId: fixture.actorId },
    );
    const physical = createProductArtifactBodyRepository({
        root: path.join(replayRoot, "product-artifact-bodies"),
      }),
      readCounts = { preparedWork: 0, checkpoint: 0, unrelated: 0 },
      counted: ProductArtifactBodyRepository = {
        backend: "filesystem",
        stage: physical.stage.bind(physical),
        readStagedExact: async (body) => {
          if (body.artifactType === "prepared-work") readCounts.preparedWork++;
          else if (body.artifactType === "frozen-snapshot") readCounts.checkpoint++;
          else readCounts.unrelated++;
          return physical.readStagedExact(body);
        },
      };
    const composition = createLeadershipConversationServerCompositionForValidation({
      runtimeRoot,
      workflowRoot,
      sourceContentRoot,
      lineageFixtureRoot: lineageRoot,
      userId: fixture.actorId,
      organizationId: fixture.organizationId,
      bodyRepository: counted,
    });
    const questionId = provisioned.seed.productQuestionId;
    await composition.recordContext({
      userId: fixture.actorId,
      organizationId: fixture.organizationId,
      questionId,
      conversationId: fixture.conversationId,
      idempotencyKey: "current-owner-context",
      title: "Current owner state",
      purpose: fixture.purposeRef,
      intendedOutcome: "Prove canonical current access.",
      timeframe: "Current",
      participants: [],
      leaderContext: null,
    });
    const workflow = createProductWorkflowArtifactRepository({
      root: workflowRoot,
      environment: "test",
    });
    const context = (await workflow.read(fixture.organizationId)).store.contexts.at(-1)!;
    await composition.recordPreparation({
      userId: fixture.actorId,
      organizationId: fixture.organizationId,
      questionId,
      conversationId: fixture.conversationId,
      idempotencyKey: "current-owner-preparation",
      contextVersionId: context.contextVersionId,
      content: NORTHSTAR_PREPARED_CONTENT,
      lineage: NORTHSTAR_PREPARED_LINEAGE,
      changeSummary: null,
    });
    const prepared = (await workflow.read(fixture.organizationId)).store
      .preparedWorkPublications!.at(-1)!;
    assert.ok(prepared.materialLineage?.scopeDigest);
    const request = {
      contractVersion: "1" as const,
      organizationId: fixture.organizationId,
      subjectId: fixture.actorId,
      artifactType: prepared.artifactType,
      artifactId: prepared.artifactId,
      artifactRevision: prepared.artifactRevision,
      operation: "product-artifact:read" as const,
      purpose: fixture.purposeRef,
      scopeDigest: prepared.materialLineage.scopeDigest,
      sensitivity: "standard" as const,
      evaluatedAt: fixture.at,
      project: (bytes: Uint8Array) => bytes.byteLength,
    };
    assert.equal((await composition.productArtifactAccess.readAuthorized(request)).disposition, "eligible");
    assert.deepEqual(readCounts, { preparedWork: 1, checkpoint: 0, unrelated: 0 });
    await composition.freeze({
      userId: fixture.actorId,
      organizationId: fixture.organizationId,
      questionId,
      conversationId: fixture.conversationId,
      idempotencyKey: "current-owner-freeze",
      artifactVersionId: prepared.artifactRevision,
      privateWorkingContribution:{seriesId:`leadership-conversation-series:${fixture.conversationId}`,occurrenceId:fixture.conversationId,authorizationRevision:NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionRevision,provenanceDigest:NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionDigest,selectedContent:["Bounded predecessor validation contribution."]},
    });
    const frozen = (await workflow.read(fixture.organizationId)).store
      .frozenSnapshotPublications!.at(-1)!;
    assert.ok(frozen.materialLineage?.scopeDigest);
    await composition.captureFrozenPrivateWorkingContribution({userId:fixture.actorId,organizationId:fixture.organizationId,questionId,conversationId:fixture.conversationId,snapshotId:frozen.artifactId,idempotencyKey:"current-owner-contribution-capture"});
    const checkpointRequest = {
      ...request,
      artifactType: frozen.artifactType,
      artifactId: frozen.artifactId,
      artifactRevision: frozen.artifactRevision,
      scopeDigest: frozen.materialLineage.scopeDigest,
    };
    assert.equal(
      (await composition.productArtifactAccess.readAuthorized(checkpointRequest)).disposition,
      "eligible",
    );
    assert.deepEqual(readCounts, { preparedWork: 1, checkpoint: 1, unrelated: 1 });
    const beforeDenied = structuredClone(readCounts);

    const baselineWorkflow = await workflow.read(fixture.organizationId);
    const baselineRuntime = await runtime.read(fixture.organizationId);
    if (!baselineRuntime) throw new Error("Canonical matrix Runtime is unavailable.");
    const foreignOrganizationId = "foreign-canonical-owner-partition",
      foreignQuestionId = "product-question:foreign-canonical-owner-partition",
      foreignPartition = await provisionForeignCanonicalOwnerPartition({ runtimeRoot, sourceContentRoot: path.join(replayRoot,"foreign-source-content"), organizationId: foreignOrganizationId, productQuestionId: foreignQuestionId, actorId: fixture.actorId, at: fixture.at });
    const foreignRuntime = await runtime.read(foreignOrganizationId);
    assert.ok(foreignRuntime);
    assert.equal(buildDurableProductQuestion({ runtime: foreignRuntime.runtime, questionId: foreignQuestionId })?.id, foreignQuestionId);
    assert.ok((foreignRuntime.runtime.memory.organizationalUnderstandingState.canonicalCompositions??[]).some((item) => item.id === foreignPartition.projectionSourceRef && item.revisionId === foreignPartition.canonicalUnderstandingRevision));
    assert.equal(foreignPartition.projectionRevision,foreignPartition.runtimeRevision);
    assert.ok(foreignPartition.sourceBindingId&&foreignPartition.sourceContentVersionId&&foreignPartition.canonicalEvidenceIds.length);
    const foreignWorkflow = createProductWorkflowArtifactRepository({ root: workflowRoot, environment: "test" });
    const foreignConversationId="conversation:foreign-canonical-owner-partition",foreignWorkspace=structuredClone(readLeadershipConversationFixture(foreignQuestionId).base);foreignWorkspace.organizationId=foreignOrganizationId;foreignWorkspace.questionId=foreignQuestionId;
    const foreignOperations=new LeadershipConversationProductOperations({repository:foreignWorkflow,clock:{now:()=>fixture.at},authorize:async({userId,organizationId})=>userId===fixture.actorId&&organizationId===foreignOrganizationId,loadBase:async()=>foreignWorkspace,source:{write:async()=>{throw new Error("Foreign Product Workflow source write is unavailable.");},readForProposal:async()=>{throw new Error("Foreign Product Workflow source read is unavailable.");},readForEvidenceAdmission:async()=>{throw new Error("Foreign Product Workflow Evidence read is unavailable.");}}});
    await foreignOperations.recordContext({userId:fixture.actorId,organizationId:foreignOrganizationId,questionId:foreignQuestionId,conversationId:foreignConversationId,idempotencyKey:"foreign-owner-partition:workflow",title:"Foreign canonical owner partition",purpose:fixture.purposeRef,intendedOutcome:"Prove a genuine foreign owner boundary.",timeframe:"Current",participants:[],leaderContext:null});
    assert.equal((await foreignWorkflow.read(foreignOrganizationId)).store.contexts[0]?.questionId, foreignQuestionId);
    type MatrixArtifact = "prepared-work" | "frozen-snapshot";
    type MatrixCase = {
      classId: number;
      label: string;
      applies: readonly MatrixArtifact[];
      request?: (
        value: CanonicalProductArtifactReadRequestV1 & { project(bytes: Uint8Array): number },
      ) => CanonicalProductArtifactReadRequestV1 & { project(bytes: Uint8Array): number };
      grants?: (value: readonly ScopedAuthorityGrant[]) => readonly ScopedAuthorityGrant[];
      workflow?: (store: LeadershipConversationArtifactStoreV1, kind: MatrixArtifact) => void;
      runtime?: (value: OrganizationRuntime) => void;
    };
    const activeGrant: ScopedAuthorityGrant = {
      authorityRef: `leadership-conversation:${fixture.actorId}`,
      policyRef: "leadership-conversation-development:v1",
      organizationId: fixture.organizationId,
      subjectId: fixture.actorId,
      scope: { organizationId: fixture.organizationId, type: "organization", id: fixture.organizationId },
      operations: ["product-artifact:read"],
      sensitivity: ["standard"],
      relationship: "direct",
      status: "active",
      validFrom: "2026-01-01T00:00:00.000Z",
    };
    const artifacts = {
      "prepared-work": prepared,
      "frozen-snapshot": frozen,
    } as const;
    const requests = {
      "prepared-work": request,
      "frozen-snapshot": checkpointRequest,
    } as const;
    const both = ["prepared-work", "frozen-snapshot"] as const;
    const publicationFor = (store: LeadershipConversationArtifactStoreV1, kind: MatrixArtifact) =>
      kind === "prepared-work"
        ? store.preparedWorkPublications!.find((item) => item.artifactId === prepared.artifactId)!
        : store.frozenSnapshotPublications!.find((item) => item.artifactId === frozen.artifactId)!;
    const receiptFor = (store: LeadershipConversationArtifactStoreV1, kind: MatrixArtifact) =>
      store.publicationReceipts!.find((item) => item.artifactId === artifacts[kind].artifactId)!;
    const mutateReceipt = (store: LeadershipConversationArtifactStoreV1, kind: MatrixArtifact, changes: Record<string, unknown>, resign = true) => {
      const receipt = receiptFor(store, kind);
      const changed = { ...receipt, ...changes };
      const next = resign
        ? completeLeadershipConversationPublicationReceiptV1((({ receiptDigest: _ignored, ...unsigned }) => unsigned)(changed))
        : changed;
      store.publicationReceipts = store.publicationReceipts!.map((item) => item.artifactId === receipt.artifactId ? next as typeof item : item);
    };
    const retargetLineage = (store: LeadershipConversationArtifactStoreV1, kind: MatrixArtifact, changes: Record<string, unknown>) => {
      const publication = publicationFor(store, kind);
      const lineage = { ...publication.materialLineage!, ...changes };
      const { envelopeDigest: _envelope, ...lineageUnsigned } = lineage;
      const nextLineage = { ...lineageUnsigned, envelopeDigest: productArtifactBodyDigest(lineageUnsigned) };
      const { contractVersion: _version, headerDigest: _header, ...metadataInput } = publication;
      const completed = completeProductArtifactInspectionMetadataV1({ ...metadataInput, materialLineage: nextLineage });
      Object.assign(publication, completed);
      mutateReceipt(store, kind, { headerDigest: completed.headerDigest, materialLineageDigest: completed.materialLineage!.envelopeDigest });
    };
    const exactBinding = baselineRuntime.runtime.memory.canonicalScopeLineageIndex!.sourceBindings.find(
      (item) => item.availability === "available" && item.assertions.length === 1 && item.assertions[0]?.relationship === "applies-to",
    );
    assert.ok(exactBinding?.purposeRef && exactBinding.sourceType);
    const bindingAuthorization = (operation: "source-binding:revise-availability") =>
      resolveScopedGovernanceContext({
        organizationId: fixture.organizationId,
        subjectId: fixture.actorId,
        requestedScope: exactBinding.assertions[0]!.scope,
        operation,
        purpose: fixture.purposeRef,
        sensitivity: "standard",
        evaluatedAt: fixture.at,
        temporal: { mode: "current" },
        serverResolvedAuthority: [{ ...activeGrant, scope: exactBinding.assertions[0]!.scope, operations: [operation] }],
      });
    const exactRequest = (kind: MatrixArtifact): CanonicalProductArtifactReadRequestV1 & { project(bytes: Uint8Array): number } => ({ ...requests[kind] });
    const cases: MatrixCase[] = [
      { classId: 1, label: "wrong-signed-in-subject", applies: both, request: (value) => ({ ...value, subjectId: "verified-foreign-subject" }) },
      { classId: 2, label: "wrong-organization", applies: both, request: (value) => ({ ...value, organizationId: "foreign-organization" }) },
      { classId: 3, label: "wrong-product-question", applies: both, workflow: (store, kind) => { const item = publicationFor(store, kind); Object.assign(item, completeProductArtifactInspectionMetadataV1({ ...item, productQuestionId: "foreign-question" })); } },
      { classId: 4, label: "wrong-product-workflow", applies: both, workflow: (store, kind) => { const item = publicationFor(store, kind); Object.assign(item, completeProductArtifactInspectionMetadataV1({ ...item, productWorkflowId: "foreign-workflow" })); } },
      { classId: 5, label: "withheld-scope", applies: both, grants: () => [{ ...activeGrant, scope: { ...activeGrant.scope, id: "other-scope" } }] },
      { classId: 6, label: "missing-scope-lineage", applies: both, runtime: (value) => { delete value.memory.canonicalScopeLineageIndex; } },
      { classId: 7, label: "malformed-scope-lineage", applies: both, runtime: (value) => { value.memory.canonicalScopeLineageIndex!.organizationId = "foreign-organization"; } },
      { classId: 8, label: "exact-scope-source-binding-revocation-propagation", applies: both },
      { classId: 9, label: "containment-ancestry-does-not-broaden-access", applies: both },
      { classId: 10, label: "source-binding-missing", applies: both, runtime: (value) => { value.memory.canonicalScopeLineageIndex!.sourceBindings = []; } },
      { classId: 12, label: "source-binding-availability-lifecycle", applies: both },
      { classId: 14, label: "source-purpose-mismatch", applies: both, runtime: (value) => { value.memory.canonicalScopeLineageIndex!.sourceBindings.forEach((item) => { item.purposeRef = "foreign-purpose"; }); } },
      { classId: 15, label: "sensitivity-mismatch", applies: both, request: (value) => ({ ...value, sensitivity: "restricted" }) },
      { classId: 16, label: "unresolved-current-eligibility", applies: both, runtime: (value) => { value.memory.organizationalExplanations.forEach((item) => { delete item.canonicalGovernanceLineage; }); } },
      { classId: 19, label: "missing-authorized-projection-basis", applies: both, workflow: (store, kind) => retargetLineage(store, kind, { projectionSourceRef: "missing-composition" }) },
      { classId: 21, label: "foreign-canonical-owner-partition", applies: both, workflow: (store, kind) => retargetLineage(store, kind, { projectionSourceRef: foreignPartition.projectionSourceRef, canonicalUnderstandingRevision: foreignPartition.canonicalUnderstandingRevision }) },
      { classId: 22, label: "missing-corrected-publication-event", applies: both, workflow: (store, kind) => { const receipt = receiptFor(store, kind); store.events = store.events.filter((item) => item.eventId !== receipt.eventId); } },
      { classId: 23, label: "missing-corrected-semantic-receipt", applies: both, workflow: (store, kind) => { store.publicationReceipts = store.publicationReceipts!.filter((item) => item.artifactId !== artifacts[kind].artifactId); } },
      { classId: 24, label: "malformed-receipt", applies: both, workflow: (store, kind) => mutateReceipt(store, kind, { contractVersion: "2" }) },
      { classId: 25, label: "wrong-receipt-kind", applies: both, workflow: (store, kind) => mutateReceipt(store, kind, { receiptKind: kind === "prepared-work" ? "frozen-checkpoint-publication" : "prepared-work-publication" }) },
      { classId: 26, label: "wrong-artifact-identity", applies: both, workflow: (store, kind) => mutateReceipt(store, kind, { artifactId: "foreign-artifact" }) },
      { classId: 27, label: "wrong-artifact-revision", applies: both, workflow: (store, kind) => mutateReceipt(store, kind, { artifactRevision: "foreign-revision" }) },
      { classId: 28, label: "wrong-parent-prepared-work", applies: ["frozen-snapshot"], workflow: (store) => mutateReceipt(store, "frozen-snapshot", { sourceArtifactRevision: "foreign-parent-revision" }) },
      { classId: 29, label: "wrong-body-reference-digest", applies: both, workflow: (store, kind) => mutateReceipt(store, kind, { bodyRefDigest: "0".repeat(64) }) },
      { classId: 30, label: "wrong-material-lineage-digest", applies: both, workflow: (store, kind) => mutateReceipt(store, kind, { materialLineageDigest: "0".repeat(64) }) },
      { classId: 31, label: "wrong-event-reference", applies: both, workflow: (store, kind) => mutateReceipt(store, kind, { eventId: "foreign-event" }) },
      { classId: 32, label: "wrong-request-fingerprint", applies: both, workflow: (store, kind) => mutateReceipt(store, kind, { requestFingerprint: "foreign-fingerprint" }) },
      { classId: 33, label: "tampered-receipt-identity", applies: both, workflow: (store, kind) => mutateReceipt(store, kind, { receiptId: "foreign-receipt" }) },
      { classId: 34, label: "tampered-receipt-integrity-digest", applies: both, workflow: (store, kind) => mutateReceipt(store, kind, { receiptDigest: "0".repeat(64) }, false) },
      { classId: 35, label: "generic-unresolved-current-owner-state", applies: both, runtime: (value) => { value.memory.organizationalUnderstandingState.canonicalCompositions = []; } },
    ];
    assert.equal(cases.length, 30);
    assert.equal(cases.reduce((total, item) => total + item.applies.length, 0), 59);
    let matrixCells = 0;
    for (const matrixCase of cases) {
      for (const kind of matrixCase.applies) {
        let workflowState = await workflow.read(fixture.organizationId);
        await workflow.replace(fixture.organizationId, structuredClone(baselineWorkflow.store), workflowState.revision);
        let runtimeState = await runtime.read(fixture.organizationId);
        assert.ok(runtimeState);
        await runtime.replace(fixture.organizationId, baselineRuntime.bytes, runtimeState.revision, { requestId: `matrix:${matrixCase.classId}:${kind}:restore`, operatorId: "derived-state-matrix" });
        let requestedScope = NORTHSTAR_SCOPES.organization;
        let caseGrants: readonly ScopedAuthorityGrant[] | undefined;
        if (matrixCase.classId === 8 || matrixCase.classId === 12) {
          runtimeState = await runtime.read(fixture.organizationId);
          assert.ok(runtimeState);
          const service = new CanonicalLocalSourceBindingService(runtime, { now: () => fixture.at });
          const revokeRequest: Parameters<CanonicalLocalSourceBindingService["reviseCanonicalSourceBindingAvailability"]>[0] = {
            contractVersion: "1" as const,
            organizationId: fixture.organizationId,
            productQuestionId: provisioned.seed.productQuestionId,
            sourceType: exactBinding.sourceType as "markdown-upload",
            purposeRef: "leadership-conversation-capture",
            normalizedContentDigest: exactBinding.source.normalizedContentDigest,
            requestedScopeAssertions: exactBinding.assertions,
            sensitivity: "standard" as const,
            availability: "revoked" as const,
            recordedAt: fixture.at,
            recordedByActorRef: fixture.actorId,
            idempotencyKey: `matrix:source-binding-revoke:${matrixCase.classId}:${kind}`,
            expectedRuntimeRevision: runtimeState.revision,
            operation: { requestId: `matrix:source-binding-revoke:${matrixCase.classId}:${kind}`, operatorId: fixture.actorId },
            authorization: bindingAuthorization("source-binding:revise-availability"),
          };
          const receipt = await service.reviseCanonicalSourceBindingAvailability(revokeRequest);
          assert.equal(receipt.disposition, "availability-revised");
          assert.equal(receipt.predecessorRevisionId, exactBinding.bindingId);
          if (matrixCase.classId === 12) {
            assert.deepEqual(await service.reviseCanonicalSourceBindingAvailability(revokeRequest), receipt);
            await assert.rejects(() => service.reviseCanonicalSourceBindingAvailability({ ...revokeRequest, idempotencyKey: `${revokeRequest.idempotencyKey}:collision`, expectedRuntimeRevision: "stale" }), /denied/);
            const reloaded = await runtime.read(fixture.organizationId);
            assert.ok(reloaded?.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.some((item) => item.bindingId === receipt.sourceBindingId && item.supersedesBindingId === exactBinding.bindingId));
          }
        }
        if (matrixCase.classId === 9) {
          requestedScope = NORTHSTAR_SCOPES.engineering;
          caseGrants = [{ ...activeGrant, scope: NORTHSTAR_SCOPES.engineering }];
          workflowState = await workflow.read(fixture.organizationId);
          const changed = structuredClone(workflowState.store);
          retargetLineage(changed, kind, { scopeDigest: productArtifactBodyDigest(NORTHSTAR_SCOPES.engineering) });
          await workflow.replace(fixture.organizationId, changed, workflowState.revision);
          const topology = readCanonicalScopeLineageTopology(baselineRuntime.runtime.memory.canonicalScopeLineageIndex!);
          assert.ok(topology?.relationships.some((edge) => edge.kind === "contains" && edge.from.id === fixture.organizationId && edge.to.id === NORTHSTAR_SCOPES.engineering.id));
          assert.ok(exactBinding.assertions.some((assertion) => assertion.scope.id === fixture.organizationId));
        }
        if (matrixCase.workflow) {
          workflowState = await workflow.read(fixture.organizationId);
          const changed = structuredClone(workflowState.store);
          matrixCase.workflow(changed, kind);
          await workflow.replace(fixture.organizationId, changed, workflowState.revision);
        }
        if (matrixCase.runtime) {
          runtimeState = await runtime.read(fixture.organizationId);
          assert.ok(runtimeState);
          const changed = structuredClone(runtimeState.runtime);
          matrixCase.runtime(changed);
          await runtime.replace(fixture.organizationId, new TextEncoder().encode(JSON.stringify(changed)), runtimeState.revision, { requestId: `matrix:${matrixCase.classId}:${kind}:mutate`, operatorId: "derived-state-matrix" });
        }
        const grants = caseGrants ?? matrixCase.grants?.([activeGrant]);
        const matrixComposition = createLeadershipConversationServerCompositionForValidation({ runtimeRoot, workflowRoot, sourceContentRoot, lineageFixtureRoot: lineageRoot, userId: fixture.actorId, organizationId: fixture.organizationId, bodyRepository: counted, productArtifactRequestedScope: requestedScope, ...(grants ? { authorityGrants: grants } : {}) });
        const candidate = matrixCase.request ? matrixCase.request(exactRequest(kind)) : exactRequest(kind);
        const readsBefore = structuredClone(readCounts);
        const result = await matrixComposition.productArtifactAccess.readAuthorized(candidate);
        assert.equal(result.disposition, "inaccessible", `class ${matrixCase.classId} ${matrixCase.label} ${kind}`);
        assert.deepEqual(readCounts, readsBefore, `class ${matrixCase.classId} read oracle ${kind}`);
        if (kind === "prepared-work" && [8, 9, 16, 21].includes(matrixCase.classId)) {
          const freshManifestPath = path.join(replayRoot, `matrix-fresh-${matrixCase.classId}.json`);
          await writeFile(freshManifestPath, JSON.stringify(completeCurrentOwnerFreshManifest({
            runtimeRoot,
            workflowRoot,
            sourceContentRoot,
            lineageFixtureRoot: lineageRoot,
            organizationId: fixture.organizationId,
            userId: fixture.actorId,
            purpose: fixture.purposeRef,
            evaluatedAt: fixture.at,
            prepared: { artifactType: "prepared-work", artifactId: prepared.artifactId, artifactRevision: prepared.artifactRevision, scopeDigest: prepared.materialLineage.scopeDigest },
            checkpoint: { artifactType: "frozen-snapshot", artifactId: frozen.artifactId, artifactRevision: frozen.artifactRevision, scopeDigest: frozen.materialLineage.scopeDigest },
            predecessorOccurrenceId:fixture.conversationId,
            denialArtifact: "prepared",
            ...(matrixCase.classId === 21 ? { foreign: { ...foreignPartition, sourceContentRoot: path.join(replayRoot, "foreign-source-content") } } : {}),
          } satisfies CurrentOwnerFreshManifestUnsigned)), { mode: 0o600 });
          const freshDenied = JSON.parse(await runFreshCurrentOwnerChild(freshManifestPath)) as { result: string; denied: string; reads: { preparedWork: number; checkpoint: number } };
          assert.deepEqual(freshDenied, { result: "PASS", denied: "prepared", reads: { preparedWork: 0, checkpoint: 0 } });
        }
        matrixCells++;
      }
    }
    assert.equal(matrixCells, 59);
    let workflowState = await workflow.read(fixture.organizationId);
    await workflow.replace(fixture.organizationId, structuredClone(baselineWorkflow.store), workflowState.revision);
    let runtimeState = await runtime.read(fixture.organizationId);
    assert.ok(runtimeState);
    await runtime.replace(fixture.organizationId, baselineRuntime.bytes, runtimeState.revision, { requestId: "matrix:restore-final", operatorId: "derived-state-matrix" });
    console.log("canonical-derived-state-matrix: PASS (30 classes; prepared=29; checkpoint=30; cells=59; denied-reads=0; fresh-denial-processes=4; invariant-gaps=0)");
    assert.equal(
      (await composition.productArtifactAccess.readAuthorized({ ...request, subjectId: "denied-user" }))
        .disposition,
      "inaccessible",
    );
    assert.equal(
      (await composition.productArtifactAccess.readAuthorized({ ...checkpointRequest, subjectId: "denied-user" }))
        .disposition,
      "inaccessible",
    );
    assert.deepEqual(readCounts, beforeDenied);
    const manifestPath = path.join(replayRoot, "current-owner-safe-manifest.json");
    const manifest: CurrentOwnerFreshManifest = completeCurrentOwnerFreshManifest({ runtimeRoot, workflowRoot, sourceContentRoot, lineageFixtureRoot: lineageRoot, organizationId: fixture.organizationId, userId: fixture.actorId, purpose: fixture.purposeRef, evaluatedAt: fixture.at, prepared: { artifactType: "prepared-work", artifactId: prepared.artifactId, artifactRevision: prepared.artifactRevision, scopeDigest: prepared.materialLineage.scopeDigest }, checkpoint: { artifactType: "frozen-snapshot", artifactId: frozen.artifactId, artifactRevision: frozen.artifactRevision, scopeDigest: frozen.materialLineage.scopeDigest },predecessorOccurrenceId:fixture.conversationId });
    await writeFile(manifestPath, JSON.stringify(manifest), { mode: 0o600 });
    const fresh = JSON.parse(await runFreshCurrentOwnerChild(manifestPath)) as { result: string; prepared: string; checkpoint: string; denied: string; historical:string; reads: typeof readCounts };
    assert.deepEqual(fresh, { result: "PASS", prepared: "eligible", checkpoint: "eligible", denied: "inaccessible", historical:"accessible", reads: { preparedWork: 2, checkpoint: 1 } });
    assert.equal(
      (await composition.productArtifactAccess.readAuthorized({ ...request, purpose: "wrong-purpose" }))
        .disposition,
      "inaccessible",
    );
    assert.equal(
      (await composition.productArtifactAccess.readAuthorized({ ...checkpointRequest, sensitivity: "restricted" }))
        .disposition,
      "inaccessible",
    );
    assert.deepEqual(readCounts, beforeDenied);
    const predecessorRequest={contractVersion:"2" as const,organizationId:fixture.organizationId,predecessorArtifactOrganizationId:fixture.organizationId,productQuestionId:provisioned.seed.productQuestionId,meetingSeriesId:`leadership-conversation-series:${fixture.conversationId}`,predecessorOccurrenceId:fixture.conversationId,predecessorConversationId:fixture.conversationId,predecessorCheckpointId:frozen.artifactId,subjectId:fixture.actorId,artifactId:prepared.artifactId,artifactRevision:prepared.artifactRevision,headerDigest:prepared.headerDigest,bodyRefDigest:prepared.protectedBody.refDigest,purpose:fixture.purposeRef,scopeDigest:prepared.materialLineage.scopeDigest,sensitivity:"standard" as const,evaluatedAt:fixture.at};
    const predecessor=await composition.productArtifactAccess.readHistoricalPredecessor(predecessorRequest);
    assert.equal(predecessor.outcome,"accessible");
    assert.equal(predecessor.projection?.productQuestionId,provisioned.seed.productQuestionId);
    assert.equal(predecessor.projection?.predecessorOccurrenceId,fixture.conversationId);
    assert.equal(predecessor.projection?.predecessorCheckpointId,frozen.artifactId);
    assert.deepEqual(predecessor.projection?.content.whatMattersNow,[NORTHSTAR_PREPARED_CONTENT.situationSummary,...NORTHSTAR_PREPARED_CONTENT.decisionsRequiringAttention]);
    const beforeHistoricalDenied=structuredClone(readCounts),historicalDenied=await composition.productArtifactAccess.readHistoricalPredecessor({...predecessorRequest,subjectId:"denied-user"});
    assert.equal(historicalDenied.outcome,"withheld");
    assert.equal(historicalDenied.projection,null);
    assert.deepEqual(readCounts,beforeHistoricalDenied);
    assert.equal((await composition.productArtifactAccess.readHistoricalPredecessor({...predecessorRequest,bodyRefDigest:"malformed"})).outcome,"malformed");
    assert.equal((await composition.productArtifactAccess.readHistoricalPredecessor({...predecessorRequest,predecessorOccurrenceId:"stale-occurrence"})).outcome,"stale");
    assert.equal((await composition.productArtifactAccess.readHistoricalPredecessor({...predecessorRequest,predecessorArtifactOrganizationId:"foreign-organization"})).outcome,"foreign");
    assert.equal((await composition.productArtifactAccess.readHistoricalPredecessor({...predecessorRequest,artifactId:"absent-artifact"})).outcome,"absent");
    const beforeAmbiguous=await workflow.read(fixture.organizationId),ambiguousStore=structuredClone(beforeAmbiguous.store);ambiguousStore.preparedWorkPublications!.push(structuredClone(prepared));await workflow.replace(fixture.organizationId,ambiguousStore,beforeAmbiguous.revision);
    assert.equal((await composition.productArtifactAccess.readHistoricalPredecessor(predecessorRequest)).outcome,"ambiguous");
    const afterAmbiguous=await workflow.read(fixture.organizationId);await workflow.replace(fixture.organizationId,structuredClone(beforeAmbiguous.store),afterAmbiguous.revision);
    const transitionRuntime=await runtime.read(fixture.organizationId);assert.ok(transitionRuntime);const transitionComposition=transitionRuntime.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.find(value=>value.id===prepared.materialLineage!.projectionSourceRef&&value.revisionId===prepared.materialLineage!.canonicalUnderstandingRevision);assert.ok(transitionComposition);const transitionEpistemic=transitionComposition.epistemicRevisions?.at(-1);await composition.reviseUnderstandingConfidence({userId:fixture.actorId,organizationId:fixture.organizationId,questionId:questionId,stableUnderstandingId:transitionComposition.id,expectedPredecessorRevisionId:transitionEpistemic?.revisionId??transitionComposition.revisionId,confidence:transitionEpistemic?.confidence??0.7,uncertainty:transitionEpistemic?.uncertainty??transitionComposition.compositionUncertainty,supportingMaterialRefs:transitionEpistemic?.supportingMaterialRefs.length?transitionEpistemic.supportingMaterialRefs:prepared.materialLineage!.canonicalMaterial.map(value=>value.canonicalObjectId),contradictingMaterialRefs:transitionEpistemic?.contradictingMaterialRefs??[],interpretationVersion:"historical-predecessor-transition:v1",idempotencyKey:"historical-predecessor:valid-successor-revision",expectedRuntimeRevision:transitionRuntime.revision});
    const freshAfterTransition=createLeadershipConversationServerCompositionForValidation({runtimeRoot,workflowRoot,sourceContentRoot,lineageFixtureRoot:lineageRoot,userId:fixture.actorId,organizationId:fixture.organizationId,bodyRepository:counted}),beforeTransitionReads=structuredClone(readCounts);assert.equal((await freshAfterTransition.productArtifactAccess.readAuthorized(request)).disposition,"inaccessible");assert.deepEqual(readCounts,beforeTransitionReads);const transitioned=await freshAfterTransition.productArtifactAccess.readHistoricalPredecessor(predecessorRequest);assert.equal(transitioned.outcome,"accessible");assert.equal(readCounts.preparedWork,beforeTransitionReads.preparedWork+1);assert.equal(readCounts.checkpoint,beforeTransitionReads.checkpoint);assert.equal(readCounts.unrelated,beforeTransitionReads.unrelated);
    const beforeRevocation=await runtime.read(fixture.organizationId);assert.ok(beforeRevocation);const revocationService=new CanonicalLocalSourceBindingService(runtime,{now:()=>fixture.at});await revocationService.reviseCanonicalSourceBindingAvailability({contractVersion:"1",organizationId:fixture.organizationId,productQuestionId:provisioned.seed.productQuestionId,sourceType:exactBinding.sourceType as "markdown-upload",purposeRef:"leadership-conversation-capture",normalizedContentDigest:exactBinding.source.normalizedContentDigest,requestedScopeAssertions:exactBinding.assertions,sensitivity:"standard",availability:"revoked",recordedAt:fixture.at,recordedByActorRef:fixture.actorId,idempotencyKey:"historical-predecessor:revoke-current-binding",expectedRuntimeRevision:beforeRevocation.revision,operation:{requestId:"historical-predecessor:revoke-current-binding",operatorId:fixture.actorId},authorization:bindingAuthorization("source-binding:revise-availability")});
    const beforeRevokedRead=structuredClone(readCounts),revoked=await freshAfterTransition.productArtifactAccess.readHistoricalPredecessor(predecessorRequest);assert.equal(revoked.outcome,"revoked");assert.equal(revoked.projection,null);assert.deepEqual(readCounts,beforeRevokedRead);
    const revokedRuntime=await runtime.read(fixture.organizationId);assert.ok(revokedRuntime);await runtime.replace(fixture.organizationId,baselineRuntime.bytes,revokedRuntime.revision,{requestId:"historical-predecessor:restore-after-revocation",operatorId:"historical-predecessor-validator"});
    console.log(`canonical-server-current-owner-state: PASS (13 checks; prepared=${readCounts.preparedWork}; checkpoint=${readCounts.checkpoint}; denied=0; fresh-process=PASS)`);
    console.log("historical-predecessor-current-access-v2: PASS (9 checks; authorization-before-body=PASS; aggregate-projection=PASS)");
    return 22;
  } finally {
    await rm(replayRoot, { recursive: true, force: true });
    await rm(lineageRoot, { recursive: true, force: true });
  }
}

async function validatePersistedLegacyCompatibility(
  kind: "prepared-work" | "frozen-snapshot",
): Promise<number> {
  const root = await mkdtemp(path.join(tmpdir(), `discovery-leadership-conversation-replay-legacy-${kind}-`)),
    lineageRoot = await mkdtemp(path.join(tmpdir(), `discovery-northstar-preparation-lineage-legacy-${kind}-`));
  try {
    const fixture = NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE,
      provisioned = await provisionNorthstarPreparationLineageFixture({ environment: "test", fixtureRoot: lineageRoot }),
      sourceRuntime = await new FilesystemOrganizationRuntimeRepository(path.join(lineageRoot, "runtime")).read(fixture.organizationId);
    assert.ok(sourceRuntime);
    const runtimeRoot = path.join(root, "runtime"), workflowRoot = path.join(root, "workflow"), sourceContentRoot = path.join(root, "content"), runtime = new FilesystemOrganizationRuntimeRepository(runtimeRoot);
    await runtime.create(fixture.organizationId, new TextEncoder().encode(JSON.stringify(createDurableProductQuestion({ runtime: sourceRuntime.runtime, title: "Legacy compatibility", questionId: provisioned.seed.productQuestionId, createdAt: fixture.at }).runtime, null, 2)), { requestId: `legacy-${kind}`, operatorId: fixture.actorId });
    const physical = createProductArtifactBodyRepository({ root: path.join(root, "product-artifact-bodies") }), reads = { preparedWork: 0, checkpoint: 0 };
    const counted: ProductArtifactBodyRepository = { backend: "filesystem", stage: physical.stage.bind(physical), readStagedExact: async (body) => { if (body.artifactType === "prepared-work") reads.preparedWork++; else if (body.artifactType === "frozen-snapshot") reads.checkpoint++; return physical.readStagedExact(body); } };
    const composition = createLeadershipConversationServerCompositionForValidation({ runtimeRoot, workflowRoot, sourceContentRoot, lineageFixtureRoot: lineageRoot, userId: fixture.actorId, organizationId: fixture.organizationId, bodyRepository: counted }), questionId = provisioned.seed.productQuestionId;
    await composition.recordContext({ userId: fixture.actorId, organizationId: fixture.organizationId, questionId, conversationId: fixture.conversationId, idempotencyKey: `legacy-${kind}-context`, title: "Legacy", purpose: fixture.purposeRef, intendedOutcome: "Compatibility", timeframe: "Current", participants: [], leaderContext: null });
    const workflow = createProductWorkflowArtifactRepository({ root: workflowRoot, environment: "test" }), context = (await workflow.read(fixture.organizationId)).store.contexts.at(-1)!;
    await composition.recordPreparation({ userId: fixture.actorId, organizationId: fixture.organizationId, questionId, conversationId: fixture.conversationId, idempotencyKey: `legacy-${kind}-prepare`, contextVersionId: context.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: NORTHSTAR_PREPARED_LINEAGE, changeSummary: null });
    let snapshot = await workflow.read(fixture.organizationId);
    if (kind === "frozen-snapshot") { const prepared = snapshot.store.preparedWorkPublications!.at(-1)!; await composition.freeze({ userId: fixture.actorId, organizationId: fixture.organizationId, questionId, conversationId: fixture.conversationId, idempotencyKey: "legacy-checkpoint-freeze", artifactVersionId: prepared.artifactRevision }); snapshot = await workflow.read(fixture.organizationId); }
    const select = (store: LeadershipConversationArtifactStoreV1) => kind === "prepared-work" ? store.preparedWorkPublications!.at(-1)! : store.frozenSnapshotPublications!.at(-1)!;
    const corrected = structuredClone(select(snapshot.store));
    const correctedReceipt = structuredClone(
      (snapshot.store.publicationReceipts ?? []).find(
        (item) => item.artifactId === corrected.artifactId,
      )!,
    );
    assert.ok(correctedReceipt);
    const legacyStore = structuredClone(snapshot.store), legacy = select(legacyStore);
    const { headerDigest: _headerDigest, publicationProofVersion: _proof, ...legacyUnsigned } = legacy;
    delete (legacy as { publicationProofVersion?: string }).publicationProofVersion;
    Object.assign(legacy, completeProductArtifactInspectionMetadataV1(legacyUnsigned));
    snapshot = await workflow.replace(fixture.organizationId, legacyStore, snapshot.revision);
    const requestFor = (artifact: typeof corrected) => ({ contractVersion: "1" as const, organizationId: fixture.organizationId, subjectId: fixture.actorId, artifactType: artifact.artifactType, artifactId: artifact.artifactId, artifactRevision: artifact.artifactRevision, operation: "product-artifact:read" as const, purpose: fixture.purposeRef, scopeDigest: artifact.materialLineage!.scopeDigest!, sensitivity: "standard" as const, evaluatedAt: fixture.at, project: (bytes: Uint8Array) => bytes.byteLength });
    assert.equal((await composition.productArtifactAccess.readAuthorized(requestFor(legacy as typeof corrected))).disposition, "eligible");
    assert.equal(kind === "prepared-work" ? reads.preparedWork : reads.checkpoint, 1);
    const incompleteStore = structuredClone(snapshot.store), incomplete = select(incompleteStore); delete (incomplete as { materialLineage?: unknown }).materialLineage;
    snapshot = await workflow.replace(fixture.organizationId, incompleteStore, snapshot.revision); const before = structuredClone(reads);
    assert.equal((await composition.productArtifactAccess.readAuthorized(requestFor(corrected))).disposition, "inaccessible"); assert.deepEqual(reads, before);
    const missingStore = structuredClone(snapshot.store), missing = select(missingStore); Object.assign(missing, corrected); missingStore.publicationReceipts = (missingStore.publicationReceipts ?? []).filter((item) => item.artifactId !== corrected.artifactId);
    snapshot = await workflow.replace(fixture.organizationId, missingStore, snapshot.revision);
    assert.equal((await composition.productArtifactAccess.readAuthorized(requestFor(corrected))).disposition, "inaccessible"); assert.deepEqual(reads, before);
    const invalidStore = structuredClone(snapshot.store), invalid = select(invalidStore);
    Object.assign(invalid, corrected);
    invalidStore.publicationReceipts = [{ ...correctedReceipt, receiptDigest: "0".repeat(64) }];
    await workflow.replace(fixture.organizationId, invalidStore, snapshot.revision);
    assert.equal((await composition.productArtifactAccess.readAuthorized(requestFor(corrected))).disposition, "inaccessible"); assert.deepEqual(reads, before);
    console.log(`legacy-${kind}: PASS (8 checks; contract=legacy-no-proof-v1; eligible-reads=1; denied-reads=0)`);
    return 8;
  } finally { await rm(root, { recursive: true, force: true }); await rm(lineageRoot, { recursive: true, force: true }); }
}

export async function validateCurrentAccessScenario(
  label = "authorization-before-body-read",
): Promise<number> {
  const root = await mkdtemp(path.join(tmpdir(), "discovery-current-access-"));
  let checks = 0;
  try {
    const repository = createProductArtifactBodyRepository({ root });
    const at = "2026-08-10T12:00:00.000Z",
      organizationId = "org-test",
      questionId = "question-1",
      subjectId = "subject-1",
      scope = {
        organizationId,
        type: "organization" as const,
        id: organizationId,
      };
    const grant: ScopedAuthorityGrant = {
      authorityRef: "authority:v1",
      policyRef: "policy:v1",
      organizationId,
      subjectId,
      scope,
      operations: ["product-artifact:read"],
      sensitivity: ["standard"],
      relationship: "direct",
      status: "active",
      validFrom: "2026-01-01T00:00:00.000Z",
    };
    let active = false,
      reads = 0;
    const candidates = [];
    for (const artifactType of [
      "prepared-work",
      "frozen-snapshot",
      "what-changed",
      "product-decision-draft",
    ] as const) {
      const before = reads,
        artifactId = `${artifactType}:1`,
        artifactRevision = `${artifactType}:revision:1`;
      const staged = await repository.stage({
        contractVersion: "1",
        organizationId,
        semanticOwner:
          artifactType === "product-decision-draft"
            ? "product-decision-draft"
            : "leadership-conversation",
        artifactType,
        artifactId,
        artifactRevision,
        schemaRef: `${artifactType}:v1`,
        bytes: serializeProductArtifactBodyV1({
          contractVersion: "1",
          title: `${artifactType} title`,
          summary: "safe",
        }),
      });
      const seed = {
        contractVersion: "1" as const,
        organizationId,
        semanticOwner:
          artifactType === "product-decision-draft"
            ? ("product-decision-draft" as const)
            : ("leadership-conversation" as const),
        productQuestionId: questionId,
        creationOperationId: "operation:1",
        lineagePolicyVersion: "conservative-material-ancestor.v1",
        sourceBindings: [
          {
            sourceBindingId: "binding:1",
            bindingRevisionId: "binding-revision:1",
          },
        ],
        sourceContentVersions: [
          {
            sourceBindingId: "binding:1",
            sourceContentVersionId: "content:1",
            normalizedContentDigest: "a".repeat(64),
          },
        ],
        canonicalMaterial: [
          {
            canonicalObjectId: "evidence:1",
            revisionRef: "admission:1",
            owner: "canonical-evidence-admission" as const,
          },
        ],
        canonicalUnderstandingRevision: "understanding:1",
        projectionSourceRef: "projection-source:1",
        scopeDigest: "scope-1",
        purpose: "current-product-delivery",
        sensitivity: "standard" as const,
        seedDigest: "b".repeat(64),
        productWorkflowId: "workflow:1",
        artifactType,
        artifactId,
        artifactRevision,
        envelopeDigest: "",
      };
      const metadata = completeProductArtifactInspectionMetadataV1({
        organizationId,
        semanticOwner: seed.semanticOwner,
        artifactType,
        artifactId,
        artifactRevision,
        productQuestionId: questionId,
        productWorkflowId: "workflow:1",
        creationEnvelopeDigest: "creation",
        materialReferencesDigest: "material",
        protectedBody: staged.body,
        ownerStageReceiptDigest: staged.receiptDigest,
        materialLineage: seed,
        ...(artifactType === "prepared-work" ||
        artifactType === "frozen-snapshot"
          ? { publicationProofVersion: "1" as const }
          : {}),
      });
      const invalidLineages = [
        {
          ...seed,
          sourceContentVersions: [
            { ...seed.sourceContentVersions[0]!, sourceBindingId: "" },
          ],
        },
        {
          ...seed,
          sourceContentVersions: [
            {
              ...seed.sourceContentVersions[0]!,
              sourceBindingId: "binding:unknown",
            },
          ],
        },
        {
          ...seed,
          sourceContentVersions: [
            seed.sourceContentVersions[0]!,
            {
              ...seed.sourceContentVersions[0]!,
              sourceBindingId: "binding:other",
            },
          ],
          sourceBindings: [
            ...seed.sourceBindings,
            {
              sourceBindingId: "binding:other",
              bindingRevisionId: "binding-revision:other",
            },
          ],
        },
      ];
      const {
        contractVersion: _contractVersion,
        headerDigest: _headerDigest,
        ...metadataInput
      } = metadata;
      for (const materialLineage of invalidLineages) {
        const invalid = completeProductArtifactInspectionMetadataV1({
          ...metadataInput,
          materialLineage,
        });
        assert.throws(
          () => validateProductArtifactInspectionMetadataV1(invalid),
          /material lineage/,
        );
        assert.equal(reads, before);
        checks += 2;
      }
      const counted = {
        ...repository,
        backend: repository.backend,
        stage: repository.stage.bind(repository),
        readStagedExact: async (ref: typeof staged.body) => {
          reads++;
          return repository.readStagedExact(ref);
        },
      };
      const current: ProductArtifactCurrentOwnerStateV1 = {
        contractVersion: "1",
        organizationId,
        productQuestionId: questionId,
        sourceGovernanceDigest: "source-current",
        eligibilityDigest: "eligibility-current",
        eligibilityDisposition: "eligible",
        projectionRevision: "projection-1",
        projectionDigest: "projection-digest",
        canonicalUnderstandingRevision: "understanding-1",
        canonicalChangeResultDigest: "not-applicable",
        lineagePolicyVersion: "conservative-material-ancestor.v1",
      };
      const publication =
        artifactType === "prepared-work"
          ? {
              ...metadata,
              semanticOwner: "leadership-conversation" as const,
              artifactType: "prepared-work" as const,
              productWorkflowId: "workflow:1",
              contextVersionId: "context:1",
              artifactVersion: 1,
              predecessorArtifactVersionId: null,
              basedOnFrozenSnapshotId: null,
              publicationProofVersion: "1" as const,
              idempotencyKeyDigest: "key-digest",
              requestFingerprint: "request-fingerprint",
            }
          : artifactType === "frozen-snapshot"
            ? {
                ...metadata,
                semanticOwner: "leadership-conversation" as const,
                artifactType: "frozen-snapshot" as const,
                productWorkflowId: "workflow:1",
                contextVersionId: "context:1",
                preparedWorkProductVersionId: "prepared:revision:1",
                publicationProofVersion: "1" as const,
                idempotencyKeyDigest: "key-digest",
                requestFingerprint: "request-fingerprint",
                snapshotDigest: "snapshot-digest",
              }
            : null;
      const event = publication
        ? {
            contractVersion: "1" as const,
            organizationId,
            questionId,
            conversationId: "conversation:1",
            eventId: `event:${artifactType}`,
            eventSequence: 1,
            previousEventId: null,
            eventType:
              artifactType === "prepared-work"
                ? ("prepared-work-product-version-recorded" as const)
                : ("prepared-work-product-frozen" as const),
            recordRef:
              artifactType === "prepared-work" ? artifactRevision : artifactId,
            recordDigest: "record-digest",
            occurredAt: at,
            actorType: "user" as const,
            actorRef: subjectId,
            idempotencyKeyDigest: "key-digest",
            requestFingerprint: "request-fingerprint",
          }
        : null;
      const sourcePublication =
        artifactType === "frozen-snapshot"
          ? {
              ...metadata,
              semanticOwner: "leadership-conversation" as const,
              artifactType: "prepared-work" as const,
              artifactId: "prepared:1",
              artifactRevision: "prepared:revision:1",
              productWorkflowId: "workflow:1",
              contextVersionId: "context:1",
              artifactVersion: 1,
              predecessorArtifactVersionId: null,
              basedOnFrozenSnapshotId: null,
              publicationProofVersion: "1" as const,
              idempotencyKeyDigest: "source-key",
              requestFingerprint: "source-fingerprint",
            }
          : null;
      const receiptKind =
          artifactType === "prepared-work"
            ? ("prepared-work-publication" as const)
            : ("frozen-checkpoint-publication" as const),
        recordRef =
          artifactType === "prepared-work" ? artifactRevision : artifactId;
      const receipt =
        publication && event
          ? completeLeadershipConversationPublicationReceiptV1({
              contractVersion: "1",
              receiptKind,
              receiptId: leadershipId(
                "leadership-publication-receipt",
                receiptKind,
                recordRef,
                event.eventId,
              ),
              organizationId,
              productQuestionId: questionId,
              productWorkflowId: "workflow:1",
              artifactType: artifactType as "prepared-work" | "frozen-snapshot",
              artifactId,
              artifactRevision,
              sourceArtifactId: sourcePublication?.artifactId ?? null,
              sourceArtifactRevision:
                sourcePublication?.artifactRevision ?? null,
              headerDigest: metadata.headerDigest,
              bodyRefDigest: staged.body.refDigest,
              materialLineageDigest: metadata.materialLineage!.envelopeDigest,
              eventId: event.eventId,
              idempotencyKeyDigest: "key-digest",
              requestFingerprint: "request-fingerprint",
              occurredAt: at,
              actorRef: subjectId,
            })
          : null;
      const emptyStore: LeadershipConversationArtifactStoreV1 = {
        contractVersion: "1",
        organizationId,
        contexts: [],
        preparedWorkProducts: [],
        frozenSnapshots: [],
        preparedWorkPublications: sourcePublication
          ? [sourcePublication]
          : publication?.artifactType === "prepared-work"
            ? [publication]
            : [],
        frozenSnapshotPublications:
          publication?.artifactType === "frozen-snapshot" ? [publication] : [],
        publicationReceipts: receipt ? [receipt] : [],
        whatChangedPublications: [],
        uploadReceipts: [],
        proposals: [],
        dispositions: [],
        canonicalRoutingReceipts: [],
        routingLinks: [],
        changeLinks: [],
        futurePreparationLinks: [],
        productMaterializations: [],
        productMaterializationReceipts: [],
        events: event ? [event] : [],
        idempotency: [],
        storeDigest: "",
      };
      let proofStore = emptyStore;
      const productWorkflowRepository: ProductWorkflowArtifactRepository = {
        read: async () => ({
          store: structuredClone(proofStore),
          revision: "revision",
        }),
        replace: async () => {
          throw new Error("unused");
        },
        resetDevelopmentFixture: async () => false,
      };
      const governance = () =>
        resolveScopedGovernanceContext({
          organizationId,
          subjectId,
          requestedScope: scope,
          operation: "product-artifact:read",
          purpose: "current-product-delivery",
          sensitivity: "standard",
          evaluatedAt: at,
          temporal: { mode: "current" },
          serverResolvedAuthority: active ? [grant] : [],
        });
      const composition = new CanonicalProductArtifactCurrentAccessComposition({
        metadataOwners: [
          {
            inspect: async (input) =>
              input.artifactId === artifactId ? metadata : null,
          },
        ],
        bodyRepository: counted,
        productWorkflowRepository,
        preauthorize: async () => active,
        resolveGovernance: async () => governance(),
        resolveCurrentOwnerState: async () => current,
      });
      const request = {
        contractVersion: "1" as const,
        organizationId,
        subjectId,
        artifactType,
        artifactId,
        artifactRevision,
        operation: "product-artifact:read" as const,
        purpose: "current-product-delivery",
        scopeDigest: "scope-1",
        sensitivity: "standard" as const,
        evaluatedAt: at,
        project: () => ({
          contractVersion: "1" as const,
          artifactType,
          artifactId,
          artifactRevision,
          title: `${artifactType} title`,
          summary: "safe",
          accessResultDigest: "pending",
        }),
      };
      assert.equal(
        (await composition.readAuthorized(request)).disposition,
        "inaccessible",
      );
      assert.equal(reads, before);
      active = true;
      if (receipt) {
        const mutateReceipt = (
          changes: Partial<typeof receipt>,
          recompute = true,
        ) => {
          const changed = { ...receipt, ...changes };
          if (!recompute) return changed;
          const { receiptDigest: _, ...unsigned } = changed;
          return completeLeadershipConversationPublicationReceiptV1(unsigned);
        };
        const mutations = [
          mutateReceipt({ contractVersion: "2" as never }),
          mutateReceipt({
            receiptKind:
              receipt.receiptKind === "prepared-work-publication"
                ? "frozen-checkpoint-publication"
                : "prepared-work-publication",
          }),
          mutateReceipt({ organizationId: "foreign" }),
          mutateReceipt({ productQuestionId: "foreign" }),
          mutateReceipt({ productWorkflowId: "foreign" }),
          mutateReceipt({ artifactId: "foreign" }),
          mutateReceipt({ artifactRevision: "foreign" }),
          ...(artifactType === "frozen-snapshot"
            ? [
                mutateReceipt({ sourceArtifactId: "foreign" }),
                mutateReceipt({ sourceArtifactRevision: "foreign" }),
              ]
            : []),
          mutateReceipt({ headerDigest: "0".repeat(64) }),
          mutateReceipt({ bodyRefDigest: "0".repeat(64) }),
          mutateReceipt({ materialLineageDigest: "0".repeat(64) }),
          mutateReceipt({ eventId: "foreign" }),
          mutateReceipt({ idempotencyKeyDigest: "foreign" }),
          mutateReceipt({ requestFingerprint: "foreign" }),
          mutateReceipt({ occurredAt: "2020-01-01T00:00:00.000Z" }),
          mutateReceipt({ actorRef: "foreign" }),
          mutateReceipt({ receiptId: "foreign" }),
          mutateReceipt({ receiptDigest: "0".repeat(64) }, false),
        ];
        for (const invalidReceipt of mutations) {
          proofStore = { ...emptyStore, publicationReceipts: [invalidReceipt] };
          assert.equal(
            (await composition.readAuthorized(request)).disposition,
            "inaccessible",
          );
          assert.equal(reads, before);
          checks += 2;
        }
        proofStore = emptyStore;
      }
      const eligible = await composition.readAuthorized(request);
      assert.equal(eligible.disposition, "eligible");
      assert.equal(reads, before + 1);
      assert.equal(
        (await composition.readAuthorized({ ...request, artifactId: "wrong" }))
          .disposition,
        "inaccessible",
      );
      assert.equal(reads, before + 1);
      checks += 6;
      const access = resolveProductArtifactCurrentAccessV1(
        {
          contractVersion: "1",
          organizationId,
          subjectId,
          operation: "product-artifact:read",
          purpose: request.purpose,
          scopeDigest: "scope-1",
          sensitivity: "standard",
          evaluatedAt: at,
          metadata,
          governance: governance(),
        },
        current,
      );
      const value = (
        eligible as {
          disposition: "eligible";
          value: {
            contractVersion: "1";
            artifactType: typeof artifactType;
            artifactId: string;
            artifactRevision: string;
            title: string;
            summary: string;
            accessResultDigest: string;
          };
        }
      ).value;
      candidates.push({
        access,
        safeProjection: { ...value, accessResultDigest: access.resultDigest },
        occurredAt: at,
        ownerState:
          artifactType === "what-changed"
            ? ("changed" as const)
            : ("unchanged" as const),
      });
      active = false;
    }
    assert.equal(
      deriveCurrentAuthorizedLeadershipHistoryV1(candidates).entries.length,
      4,
    );
    assert.equal(
      buildCurrentAuthorizedProductQuestionWorkspaceV1({
        organizationId,
        questionId,
        subjectId,
        purpose: "current-product-delivery",
        scopeDigest: "scope-1",
        sensitivity: "standard",
        evaluatedAt: at,
        candidates,
      }).artifacts.length,
      4,
    );
    assert.equal(
      classifyFuturePreparationItemsV1(candidates).every(
        (x) => x.semanticInfluence,
      ),
      true,
    );
    checks += 3;
    const denied = candidates.map((x) => {
      const unsigned = { ...x.access, disposition: "withheld" as const };
      const { resultDigest: _, ...body } = unsigned;
      return {
        ...x,
        access: { ...body, resultDigest: productArtifactBodyDigest(body) },
        safeProjection: null,
      };
    });
    assert.equal(
      deriveCurrentAuthorizedLeadershipHistoryV1(denied).entries.length,
      0,
    );
    assert.equal(
      classifyFuturePreparationItemsV1(denied).every(
        (x) => !x.semanticInfluence,
      ),
      true,
    );
    checks += 2;
    console.log(`${label}: PASS (${checks} checks)`);
    return checks;
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}
if (process.argv[2] === "--current-owner-fresh-child")
  currentOwnerFreshChild(process.argv[3]!).catch((e) => { console.error(e); process.exitCode = 1; });
else if (process.argv[2] === "--seed-child")
  seedChild(process.argv[3]!, process.argv[4]!).catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
else if (
  process.argv[1]?.endsWith(
    "validateProductArtifactAuthorizationBeforeBodyRead.ts",
  )
)
  Promise.all([
    validateSeedRecordScenario(),
    validateCurrentAccessScenario(),
    validateCanonicalServerCurrentAccess(),
    validatePersistedLegacyCompatibility("prepared-work"),
    validatePersistedLegacyCompatibility("frozen-snapshot"),
  ]).catch((e) => {
    console.error(e);
    process.exitCode = 1;
  });
