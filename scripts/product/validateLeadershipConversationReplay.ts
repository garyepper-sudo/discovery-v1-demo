import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import { createCanonicalScopeLineageIndex, createCanonicalScopeTopology } from "../../engine/v3/governance/canonicalScopeLineage";
import { appendProductQuestionEvent, createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { createFilesystemSourceContentRepository } from "../../engine/v3/sources";
import {
  createProductWorkflowArtifactRepository,
  leadershipDigest,
  leadershipStableSerialize,
  NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE as fixture,
  NORTHSTAR_PREPARED_CONTENT,
  NORTHSTAR_PREPARED_LINEAGE,
} from "../../product/workflow/leadershipConversation";
import {
  provisionNorthstarPreparationLineageFixture,
  readNorthstarPreparationLineageSeed,
} from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { SANDBOX_ORGANIZATION_ID } from "../../product/simulations/living-organization-sandbox/manifest";

const runFile = promisify(execFile);
const NORTHSTAR_LINEAGE_QUESTION_ID = "product-question:northstar-implementation-duration";
const scope = { organizationId: fixture.organizationId, type: "organization" as const, id: fixture.organizationId };
const digest = (value: unknown) => leadershipDigest(leadershipStableSerialize(value));
const handoff = <T extends object>(value: T) => ({ ...value, handoffDigest: digest(value) });
const roots = (root: string) => ({ runtimeRoot: path.join(root, "runtime"), workflowRoot: path.join(root, "workflow"), sourceContentRoot: path.join(root, "content") });
const identity = { userId: fixture.actorId, organizationId: fixture.organizationId, questionId: NORTHSTAR_LINEAGE_QUESTION_ID, conversationId: fixture.conversationId };

async function validationComposition(locations: ReturnType<typeof roots>, lineageFixtureRoot?: string) {
  const { createLeadershipConversationServerCompositionForValidation } = await import("../../product/integration/leadershipConversationServerComposition");
  return createLeadershipConversationServerCompositionForValidation({ ...locations, lineageFixtureRoot, userId: fixture.actorId, organizationId: fixture.organizationId });
}

type SafeHandoff = Record<string, unknown> & { handoffDigest: string };
type WorkerResult = { role: string; handoff: SafeHandoff; assertions: string[] };

function parseHandoff(value: string): SafeHandoff {
  const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as SafeHandoff;
  const { handoffDigest, ...unsigned } = parsed;
  assert.equal(handoffDigest, digest(unsigned), "handoff digest mismatch");
  return parsed;
}

async function processA(root: string,lineageFixtureRoot?:string): Promise<WorkerResult> {
  const locations = roots(root);
  const runtimeRepository = new FilesystemOrganizationRuntimeRepository(locations.runtimeRoot);
  const topology = createCanonicalScopeTopology({ organizationId: fixture.organizationId, topologyVersion: 1, effectiveAt: fixture.at, nodes: [scope], relationships: [] });
  let runtime = createEmptyOrganizationRuntime({ organizationId: fixture.organizationId, name: "Northstar", now: fixture.at });
  runtime.memory.organizationalUnderstandingState.canonicalCompositions = [];
  runtime.memory.canonicalScopeLineageIndex = createCanonicalScopeLineageIndex({ organizationId: fixture.organizationId, topology });
  runtime = createDurableProductQuestion({ runtime, title: "What is constraining Northstar delivery?", questionId: NORTHSTAR_LINEAGE_QUESTION_ID, createdAt: fixture.at }).runtime;
  runtime = appendProductQuestionEvent(runtime, { type: "answer_recorded", organizationId: fixture.organizationId, questionId: NORTHSTAR_LINEAGE_QUESTION_ID, occurredAt: fixture.at, answer: { answerId: "product-answer:northstar-leadership:1", canonicalSource: "canonical-product-answer", revision: 1, reasonForChange: "Initial supported Answer", changeReceiptId: "product-answer-receipt:northstar-leadership:1", timestamp: fixture.at, confidence: { level: "moderate", score: 0.7, meaning: "Supported", principalLimiter: "Additional sequencing evidence is required.", authoritativeSource: "canonical-product-workflow" } } });
  await runtimeRepository.create(fixture.organizationId, new TextEncoder().encode(JSON.stringify(runtime, null, 2)), { requestId: "process-a-runtime", operatorId: fixture.actorId });
  const composition = await validationComposition(locations,lineageFixtureRoot);
  await composition.recordContext({ ...identity, idempotencyKey: "process-a-context", title: "Northstar staff conversation", purpose: "Resolve the next delivery constraint.", intendedOutcome: "Agree one bounded owner action.", timeframe: "Weekly", participants: [{ participantRef: "leader", displayName: "Leader", titleLabel: "Director" }], leaderContext: null });
  const workflow = createProductWorkflowArtifactRepository({ root: locations.workflowRoot, environment: "test" });
  let stored = await workflow.read(fixture.organizationId);
  const context = stored.store.contexts.at(-1)!;
  await composition.recordPreparation({ ...identity, idempotencyKey: "process-a-preparation-1", contextVersionId: context.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: NORTHSTAR_PREPARED_LINEAGE, changeSummary: null });
  stored = await workflow.read(fixture.organizationId);
  await composition.recordPreparation({ ...identity, idempotencyKey: "process-a-preparation-2", contextVersionId: context.contextVersionId, content: { ...NORTHSTAR_PREPARED_CONTENT, headline: "Resolve sequencing ownership before the next delivery window." }, lineage: NORTHSTAR_PREPARED_LINEAGE, changeSummary: "Leader clarified sequencing ownership." });
  stored = await workflow.read(fixture.organizationId);
  const prepared = stored.store.preparedWorkPublications!.at(-1)!;
  await composition.freeze({ ...identity, idempotencyKey: "process-a-freeze", artifactVersionId: prepared.artifactRevision });
  stored = await workflow.read(fixture.organizationId);
  const frozen = stored.store.frozenSnapshotPublications!.at(-1)!;
  assert.equal(stored.store.preparedWorkProducts.length,0);assert.equal(stored.store.frozenSnapshots.length,0);
  const manifest = handoff({ organizationId: fixture.organizationId, questionId: NORTHSTAR_LINEAGE_QUESTION_ID, conversationId: fixture.conversationId, contextVersionId: context.contextVersionId, preparedWorkProductVersionId: prepared.artifactRevision, frozenSnapshotId: frozen.artifactId, frozenSnapshotDigest: frozen.snapshotDigest, productWorkflowRepositoryRevision: stored.revision, eventCount: stored.store.events.length });
  return { role: "prepare-and-freeze", handoff: manifest, assertions: ["context-persisted", "preparation-v1-persisted", "preparation-v2-persisted", "frozen-snapshot-persisted"] };
}

async function processB(root: string, encodedA: string): Promise<WorkerResult> {
  const a = parseHandoff(encodedA);
  const locations = roots(root);
  const workflow = createProductWorkflowArtifactRepository({ root: locations.workflowRoot, environment: "test" });
  let stored = await workflow.read(fixture.organizationId);
  assert.equal(stored.revision, a.productWorkflowRepositoryRevision);
  assert.equal(stored.store.frozenSnapshotPublications!.at(-1)?.artifactId, a.frozenSnapshotId);
  assert.equal(stored.store.frozenSnapshotPublications!.at(-1)?.snapshotDigest, a.frozenSnapshotDigest);
  const composition = await validationComposition(locations);
  await composition.receiveUpload({ ...identity, idempotencyKey: "process-b-upload", frozenSnapshotId: String(a.frozenSnapshotId), purposeRef: fixture.purposeRef, mediaType: "text/plain", bytes: fixture.captureBytes, displayLabel: "Staff notes", originalFilename: null });
  stored = await workflow.read(fixture.organizationId);
  const upload = stored.store.uploadReceipts.at(-1)!;
  await composition.generateProposals({ ...identity, idempotencyKey: "process-b-proposals", uploadReceiptId: upload.uploadReceiptId, purposeRef: fixture.purposeRef });
  stored = await workflow.read(fixture.organizationId);
  const evidence = stored.store.proposals.find(item => item.kind === "evidence-candidate")!;
  const decision = stored.store.proposals.find(item => item.kind === "decision-draft")!;
  const unknown = stored.store.proposals.find(item => item.kind === "unknown")!;
  const commitment = stored.store.proposals.find(item => item.kind === "commitment")!;
  await composition.review({ ...identity, idempotencyKey: "process-b-review-evidence", proposalId: evidence.proposalId, disposition: "approved", effectivePayload: null, reason: null });
  await composition.review({ ...identity, idempotencyKey: "process-b-review-decision", proposalId: decision.proposalId, disposition: "approved-with-edit", effectivePayload: { summary: "Draft the governed sequencing review decision.", targetRef: null }, reason: "Clarified scope." });
  await composition.review({ ...identity, idempotencyKey: "process-b-review-unknown", proposalId: unknown.proposalId, disposition: "approved", effectivePayload: null, reason: null });
  await composition.review({ ...identity, idempotencyKey: "process-b-review-rejected", proposalId: commitment.proposalId, disposition: "rejected", effectivePayload: null, reason: "Not yet authorized." });
  await composition.review({ ...identity, idempotencyKey: "process-b-review-deferred", proposalId: commitment.proposalId, disposition: "deferred", effectivePayload: null, reason: "Retain for audit." });
  stored = await workflow.read(fixture.organizationId);
  const runtime = await new FilesystemOrganizationRuntimeRepository(locations.runtimeRoot).read(fixture.organizationId);
  assert.ok(runtime);
  const binding = runtime.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.find(item => item.bindingId === upload.sourceBindingId);
  assert.ok(binding);
  const sourceRevision = await createFilesystemSourceContentRepository({ root: locations.sourceContentRoot, environment: "test" }).inspectRevision(fixture.organizationId);
  const proposals = stored.store.proposals.map(item => ({ proposalId: item.proposalId, kind: item.kind, payloadDigest: item.payloadDigest }));
  const dispositions = stored.store.dispositions.map(item => ({ dispositionReceiptId: item.dispositionReceiptId, proposalId: item.proposalId, disposition: item.disposition, digest: digest(item) }));
  const manifest = handoff({ processAHandoffDigest: a.handoffDigest, organizationId: fixture.organizationId, questionId: NORTHSTAR_LINEAGE_QUESTION_ID, conversationId: fixture.conversationId, frozenSnapshotId: a.frozenSnapshotId, sourceBindingId: upload.sourceBindingId, sourceBindingVersion: binding.bindingVersion, sourceBindingReceiptDigest: upload.sourceBindingMutationReceiptDigest, sourceContentVersionId: upload.sourceContentVersionId, exactContentDigest: upload.exactContentDigest, normalizedContentDigest: upload.normalizedContentDigest, uploadReceiptId: upload.uploadReceiptId, uploadReceiptDigest: digest(upload), proposals, dispositions, productWorkflowRepositoryRevision: stored.revision, runtimeRepositoryRevision: runtime.revision, sourceContentRepositoryRevision: sourceRevision });
  return { role: "capture-and-review", handoff: manifest, assertions: ["process-a-verified", "binding-persisted", "content-persisted", "upload-receipt-persisted", "proposals-persisted", "dispositions-persisted"] };
}

async function processC(root: string, lineageFixtureRoot: string, expectedSeedDigest: string, encodedA: string, encodedB: string): Promise<WorkerResult> {
  const a = parseHandoff(encodedA), b = parseHandoff(encodedB);
  assert.equal(b.processAHandoffDigest, a.handoffDigest);
  assert.equal(a.organizationId, fixture.organizationId); assert.equal(b.organizationId, fixture.organizationId);
  assert.equal(a.questionId, NORTHSTAR_LINEAGE_QUESTION_ID); assert.equal(b.questionId, NORTHSTAR_LINEAGE_QUESTION_ID);
  assert.equal(a.conversationId, fixture.conversationId); assert.equal(b.conversationId, fixture.conversationId);
  assert.equal(fixture.organizationId, SANDBOX_ORGANIZATION_ID);
  const seed = await readNorthstarPreparationLineageSeed({ fixtureRoot: lineageFixtureRoot, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: "northstar-preparation-lineage-fixture-v1", provisioningKey: "northstar-preparation-lineage:v1", expectedSeedDigest });
  assert.equal(seed.organizationId, fixture.organizationId);
  assert.equal(seed.productQuestionId, NORTHSTAR_LINEAGE_QUESTION_ID);
  assert.equal(seed.seedDigest, expectedSeedDigest);
  assert.ok(seed.sourceBindings.length > 0 && seed.sourceContentVersions.length > 0 && seed.canonicalMaterial.length > 0);
  const locations = roots(root);
  const workflow = createProductWorkflowArtifactRepository({ root: locations.workflowRoot, environment: "test" });
  let stored = await workflow.read(fixture.organizationId);
  assert.equal(stored.revision, b.productWorkflowRepositoryRevision);
  assert.equal(stored.store.frozenSnapshotPublications!.find(item => item.artifactId === a.frozenSnapshotId)?.snapshotDigest, a.frozenSnapshotDigest);
  const upload = stored.store.uploadReceipts.find(item => item.uploadReceiptId === b.uploadReceiptId)!;
  assert.equal(digest(upload), b.uploadReceiptDigest);
  assert.equal(upload.exactContentDigest, b.exactContentDigest);
  assert.equal(upload.normalizedContentDigest, b.normalizedContentDigest);
  assert.deepEqual(stored.store.proposals.map(item => ({ proposalId: item.proposalId, kind: item.kind, payloadDigest: item.payloadDigest })), b.proposals);
  assert.deepEqual(stored.store.dispositions.map(item => ({ dispositionReceiptId: item.dispositionReceiptId, proposalId: item.proposalId, disposition: item.disposition, digest: digest(item) })), b.dispositions);
  const runtimeRepository = new FilesystemOrganizationRuntimeRepository(locations.runtimeRoot);
  let runtime = await runtimeRepository.read(fixture.organizationId);
  assert.ok(runtime);
  assert.equal(runtime.revision, b.runtimeRepositoryRevision);
  const binding = runtime.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.find(item => item.bindingId === b.sourceBindingId);
  assert.equal(binding?.bindingVersion, b.sourceBindingVersion);
  assert.equal(binding?.source.normalizedContentDigest, b.normalizedContentDigest);
  const sourceRepository = createFilesystemSourceContentRepository({ root: locations.sourceContentRoot, environment: "test" });
  assert.equal(await sourceRepository.inspectRevision(fixture.organizationId), b.sourceContentRepositoryRevision);
  const composition = await validationComposition(locations, lineageFixtureRoot);
  const proposal = (kind: string) => stored.store.proposals.find(item => item.kind === kind)!;
  const route = async (kind: string, key: string) => { stored = await workflow.read(fixture.organizationId); const item = proposal(kind); return composition.routeApproved({ ...identity, proposalId: item.proposalId, purposeRef: fixture.purposeRef, expectedWorkflowRevision: stored.revision, idempotencyKey: key }); };
  const material = await route("evidence-candidate", "process-c-route-evidence-material");
  assert.ok("stage" in material);
  if (!("stage" in material)) throw new Error("staged canonical routing result unavailable");
  assert.equal(material.stage, "canonical-committed-product-materialized");
  assert.match(material.productMaterializationReceiptDigest!, /^[a-f0-9]{64}$/);
  stored = await workflow.read(fixture.organizationId);
  const evidence = proposal("evidence-candidate");
  await composition.review({ ...identity, idempotencyKey: "process-c-review-evidence-duplicate", proposalId: evidence.proposalId, disposition: "approved", effectivePayload: null, reason: "Replay-aware duplicate control." });
  const duplicate = await route("evidence-candidate", "process-c-route-evidence-duplicate");
  assert.ok("stage" in duplicate);
  if (!("stage" in duplicate)) throw new Error("staged duplicate routing result unavailable");
  assert.equal(duplicate.stage, "canonical-committed-product-materialized");
  assert.match(duplicate.productMaterializationReceiptDigest!, /^[a-f0-9]{64}$/);
  const decision = await route("decision-draft", "process-c-route-decision");
  if (!("ownerKind" in decision)) throw new Error("decision owner receipt unavailable");
  assert.equal(decision.ownerKind, "product-decision-draft");
  const unknown = await route("unknown", "process-c-route-unknown");
  if (!("ownerKind" in unknown)) throw new Error("unknown owner receipt unavailable");
  assert.equal(unknown.ownerKind, "unknown");
  stored = await workflow.read(fixture.organizationId);
  const context = stored.store.contexts.at(-1)!;
  if (!("integrationReceiptId" in decision) || !("integrationReceiptId" in unknown)) throw new Error("actual owner receipt unavailable");
  await composition.recordPreparation({ ...identity, idempotencyKey: "process-c-next-preparation", contextVersionId: context.contextVersionId, content: { ...NORTHSTAR_PREPARED_CONTENT, whatChanged: ["Canonical owner results were recorded."] }, lineage: { ...NORTHSTAR_PREPARED_LINEAGE, previousFrozenSnapshotId: String(a.frozenSnapshotId), canonicalChangeReceiptReferences: [material.productMaterializationReceiptDigest!, duplicate.productMaterializationReceiptDigest!, decision.integrationReceiptId, unknown.integrationReceiptId] }, changeSummary: "Prepared from actual canonical owner receipts." });
  stored = await workflow.read(fixture.organizationId);
  const next = stored.store.preparedWorkPublications!.at(-1)!;
  await composition.prepareAgain({ ...identity, idempotencyKey: "process-c-future-preparation", nextConversationId: `${fixture.conversationId}:next`, nextContextVersionId: context.contextVersionId, nextPreparedWorkProductVersionId: next.artifactRevision });
  stored = await workflow.read(fixture.organizationId);
  const beforeReplay = { revision: stored.revision, routes: stored.store.canonicalRoutingReceipts.length, future: stored.store.futurePreparationLinks.length, preparations: stored.store.preparedWorkPublications!.length };
  for (const [kind, key] of [["evidence-candidate", "process-c-route-evidence-duplicate"], ["decision-draft", "process-c-route-decision"], ["unknown", "process-c-route-unknown"]] as const) await route(kind, key);
  await composition.prepareAgain({ ...identity, idempotencyKey: "process-c-future-preparation", nextConversationId: `${fixture.conversationId}:next`, nextContextVersionId: context.contextVersionId, nextPreparedWorkProductVersionId: next.artifactRevision });
  stored = await workflow.read(fixture.organizationId);
  assert.deepEqual({ revision: stored.revision, routes: stored.store.canonicalRoutingReceipts.length, future: stored.store.futurePreparationLinks.length, preparations: stored.store.preparedWorkPublications!.length }, beforeReplay);
  await assert.rejects(() => composition.routeApproved({ ...identity, proposalId: proposal("decision-draft").proposalId, purposeRef: "different-purpose", expectedWorkflowRevision: stored.revision, idempotencyKey: "process-c-route-decision" }), /conflict/);
  runtime = await runtimeRepository.read(fixture.organizationId); assert.ok(runtime);
  if (!("receiptDigest" in decision) || !("receiptDigest" in unknown)) throw new Error("actual owner receipt unavailable");
  const manifest = handoff({ processAHandoffDigest: a.handoffDigest, processBHandoffDigest: b.handoffDigest, organizationId: fixture.organizationId, questionId: NORTHSTAR_LINEAGE_QUESTION_ID, conversationId: fixture.conversationId, materialEvidenceReceiptDigest: material.productMaterializationReceiptDigest!, duplicateEvidenceReceiptDigest: duplicate.productMaterializationReceiptDigest!, decisionDraftReceiptDigest: decision.receiptDigest, unknownReceiptDigest: unknown.receiptDigest, futurePreparationLinkId: stored.store.futurePreparationLinks.at(-1)!.futurePreparationLinkId, productWorkflowRepositoryRevision: stored.revision, runtimeRepositoryRevision: runtime.revision, sourceContentRepositoryRevision: await sourceRepository.inspectRevision(fixture.organizationId), routingReceiptCount: stored.store.canonicalRoutingReceipts.length, idempotentReentry: true });
  return { role: "route-actual-owners-and-prepare-again", handoff: manifest, assertions: ["handoffs-verified", "northstar-seed-reloaded", "northstar-source-binding-lineage-verified", "northstar-material-lineage-verified", "material-evidence-actual", "canonical-change-owner-result", "duplicate-evidence-class-2", "duplicate-understanding-unchanged", "decision-draft-actual", "unknown-actual", "future-preparation-persisted", "idempotent-reentry"] };
}

async function worker(role: string, root: string, lineageFixtureRoot: string, expectedSeedDigest: string, encodedA?: string, encodedB?: string): Promise<WorkerResult> {
  assert.ok(path.basename(root).startsWith("discovery-leadership-conversation-replay-"));
  if (role === "prepare-and-freeze") return processA(root,lineageFixtureRoot);
  if (role === "capture-and-review") return processB(root, encodedA!);
  if (role === "route-actual-owners-and-prepare-again") return processC(root, lineageFixtureRoot, expectedSeedDigest, encodedA!, encodedB!);
  throw new Error("unknown process role");
}

async function execute(root: string, role: string, lineageFixtureRoot: string | null, expectedSeedDigest: string | null, ...handoffs: SafeHandoff[]): Promise<WorkerResult> {
  const args = ["--conditions=react-server", ...process.execArgv.filter(argument => argument !== "--conditions=react-server"), import.meta.filename, "--worker", role, root, lineageFixtureRoot ?? "-", expectedSeedDigest ?? "-", ...handoffs.map(item => Buffer.from(JSON.stringify(item)).toString("base64url"))];
  const { stdout, stderr } = await runFile(process.execPath, args, { cwd: process.cwd(), env: { PATH: process.env.PATH ?? "", NODE_PATH: process.env.NODE_PATH ?? "", NODE_ENV: "test", TZ: "UTC", LANG: "C", TMPDIR: tmpdir() }, timeout: 30_000, maxBuffer: 128 * 1024, shell: false });
  assert.equal(stderr, "");
  const parsed = JSON.parse(stdout) as WorkerResult;
  assert.deepEqual(Object.keys(parsed).sort(), ["assertions", "handoff", "role"]);
  assert.ok(Array.isArray(parsed.assertions) && parsed.assertions.every(item => typeof item === "string"));
  assert.equal(parsed.handoff.handoffDigest, digest(Object.fromEntries(Object.entries(parsed.handoff).filter(([key]) => key !== "handoffDigest"))));
  return parsed;
}

async function main(): Promise<void> {
  if (process.argv.includes("--worker")) {
    const index = process.argv.indexOf("--worker");
    const originalInfo = console.info, originalLog = console.log;
    console.info = () => {}; console.log = () => {};
    try { process.stdout.write(JSON.stringify(await worker(process.argv[index + 1]!, process.argv[index + 2]!, process.argv[index + 3]!, process.argv[index + 4]!, process.argv[index + 5], process.argv[index + 6]))); }
    finally { console.info = originalInfo; console.log = originalLog; }
    return;
  }
  let checks = 0;
  const root = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-replay-"));
  const lineageFixtureRoot = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-"));
  try {
    const provisioned = await provisionNorthstarPreparationLineageFixture({ environment: "test", fixtureRoot: lineageFixtureRoot, now: fixture.at });
    assert.equal(provisioned.disposition, "provisioned"); checks++;
    assert.ok(provisioned.counts.sources > 0 && provisioned.counts.material > 0 && provisioned.counts.understandings > 0); checks++;
    const a = await execute(root, "prepare-and-freeze", lineageFixtureRoot, provisioned.seed.seedDigest); checks += a.assertions.length;
    const b = await execute(root, "capture-and-review", null, null, a.handoff); checks += b.assertions.length;
    const resign = (value: SafeHandoff, changes: Record<string, unknown>): SafeHandoff => { const { handoffDigest: _old, ...unsigned } = { ...value, ...changes }; return { ...unsigned, handoffDigest: digest(unsigned) }; };
    const reject = async (attempt: () => Promise<unknown>) => { await assert.rejects(attempt); checks += 1; };
    const cArgs = [lineageFixtureRoot, provisioned.seed.seedDigest] as const;
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, { ...a.handoff, handoffDigest: "0".repeat(64) }, b.handoff));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { productWorkflowRepositoryRevision: "stale" })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { runtimeRepositoryRevision: "stale" })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { sourceContentRepositoryRevision: "stale" })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, resign(a.handoff, { frozenSnapshotDigest: "0".repeat(64) }), b.handoff));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { sourceBindingVersion: 999 })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { exactContentDigest: "0".repeat(64) })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { proposals: [{ proposalId: "wrong", kind: "evidence-candidate", payloadDigest: "0".repeat(64) }] })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, resign(b.handoff, { dispositions: [] })));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, resign(a.handoff, { organizationId: "cross-organization" }), b.handoff));
    await reject(() => execute(root, "route-actual-owners-and-prepare-again", ...cArgs, resign(a.handoff, { questionId: "wrong-question" }), b.handoff));
    const wrongRoot = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-replay-"));
    try { await reject(() => execute(wrongRoot, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, b.handoff)); }
    finally { await rm(wrongRoot, { recursive: true, force: true }); }
    const missingLineageRoot = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-"));
    try { await reject(() => execute(root, "route-actual-owners-and-prepare-again", missingLineageRoot, provisioned.seed.seedDigest, a.handoff, b.handoff)); }
    finally { await rm(missingLineageRoot, { recursive: true, force: true }); }
    const c = await execute(root, "route-actual-owners-and-prepare-again", ...cArgs, a.handoff, b.handoff); checks += c.assertions.length;
    assert.equal(c.handoff.processAHandoffDigest, a.handoff.handoffDigest); checks++;
    assert.equal(c.handoff.processBHandoffDigest, b.handoff.handoffDigest); checks++;
    console.log(JSON.stringify({ validation: "leadership-conversation-replay-001", result: "PASS", checks, freshProcesses: 16, processA: "persisted", processB: "loaded-a-and-persisted-capture-review", processC: "loaded-a-b-and-executed-actual-owners", northstarFixtureProvisionerInvocations: 1, processCSeedIntegrityReloads: 1, processCHiddenProvisioningInvocations: 0, missingLineageFailsClosed: true, materialEvidence: "actual-path", duplicateEvidence: "actual-class-2", productDecisionDraft: "actual-service", additionalOwner: "actual-unknown", futurePreparation: "persisted", idempotentReentry: "passed", negativeBindingControls: 13, handoffDigestsVerified: true, canonicalComposition: true, stubbedPositiveOwners: false, boundedEnvironment: true, shell: false, timeoutMilliseconds: 30000, networkCalls: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0, productionAccess: 0, deployments: 0 }));
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(lineageFixtureRoot, { recursive: true, force: true });
    await assert.rejects(() => import("node:fs/promises").then(fs => fs.lstat(root)));
    await assert.rejects(() => import("node:fs/promises").then(fs => fs.lstat(lineageFixtureRoot)));
  }
}

void main();
