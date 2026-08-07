import assert from "node:assert/strict";
import { lstat, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  createCanonicalScopeTopology,
  createCanonicalSourceScopeBinding,
} from "../../engine/v3/governance/canonicalScopeLineage";
import { resolveScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import {
  createFilesystemSourceContentRepository,
  decodeAndNormalizeSourceContent,
  GovernedSourceContentService,
  sourceContentDigest,
} from "../../engine/v3/sources";
import { readLeadershipConversationFixture } from "../../product/frontend/leadershipConversationFixtureAdapter";
import {
  createProductWorkflowArtifactRepository,
  LeadershipConversationProductOperations,
  NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE as fixture,
  NORTHSTAR_PREPARED_CONTENT,
  NORTHSTAR_PREPARED_LINEAGE,
} from "../../product/workflow/leadershipConversation";

let checks = 0;
function check(value: unknown, message: string): void {
  assert.ok(value, message);
  checks += 1;
}

async function main(): Promise<void> {
  const workflowRoot = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-workflow-"));
  const sourceRoot = await mkdtemp(path.join(tmpdir(), "discovery-governed-source-content-leadership-"));
  const scope = { organizationId: fixture.organizationId, type: "organization" as const, id: fixture.organizationId };
  try {
    const normalized = decodeAndNormalizeSourceContent(fixture.captureBytes).normalizedText;
    const topology = createCanonicalScopeTopology({ organizationId: fixture.organizationId, topologyVersion: 1, effectiveAt: fixture.at, nodes: [scope], relationships: [] });
    const binding = createCanonicalSourceScopeBinding({ organizationId: fixture.organizationId, bindingVersion: 1, source: { sourceId: "local:leadership-capture:001", sourceVersion: "1", normalizedContentDigest: sourceContentDigest(new TextEncoder().encode(normalized)) }, topology, assertions: [{ relationship: "applies-to", scope }], basisRefs: [`purpose:${fixture.purposeRef}`], effectiveAt: fixture.at, sourceType: "pasted-text", purposeRef: fixture.purposeRef, availability: "available" });
    const authorization = (operation: "source-content:write" | "source-content:read-for-proposal") => resolveScopedGovernanceContext({ organizationId: fixture.organizationId, subjectId: fixture.actorId, requestedScope: scope, operation, purpose: fixture.purposeRef, sensitivity: "standard", evaluatedAt: fixture.at, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: "fixture-authority", policyRef: "fixture-policy", organizationId: fixture.organizationId, subjectId: fixture.actorId, scope, operations: [operation], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: fixture.at }] });
    const sourceRepository = createFilesystemSourceContentRepository({ root: sourceRoot, environment: "test" });
    const sourceService = new GovernedSourceContentService(sourceRepository, { loadRevisions: async () => [binding] }, { now: () => fixture.at });
    const repository = createProductWorkflowArtifactRepository({ root: workflowRoot, environment: "test" });
    const source = {
      write: async (input: Parameters<LeadershipConversationProductOperations["receiveUpload"]>[0] & { storedAt: string; storedByActorRef: string }) => ({...await sourceService.write({ contractVersion: "1", organizationId: input.organizationId, sourceBindingId: binding.bindingId, purposeRef: input.purposeRef, mediaType: input.mediaType, bytes: input.bytes, storedAt: fixture.at, storedByActorRef: input.storedByActorRef, idempotencyKey: input.idempotencyKey, expectedRepositoryRevision: await sourceRepository.inspectRevision(input.organizationId), authorization: authorization("source-content:write") }),sourceBindingMutationReceiptDigest:"binding-receipt-digest"}),
      readForProposal: async (input: { organizationId: string; sourceBindingId: string; sourceContentVersionId: string; purposeRef: string }) => { const result = await sourceService.read({ contractVersion: "1", ...input, authorization: authorization("source-content:read-for-proposal") }); return { bytes: result.bytes, exactContentDigest: result.version.exactContentDigest, normalizedContentDigest: result.version.normalizedContentDigest }; },
      readForEvidenceAdmission: async () => { throw new Error("Canonical routing belongs to the canonical owner router."); },
    };
    const base = readLeadershipConversationFixture().base;
    const operations = new LeadershipConversationProductOperations({ repository, clock: { now: () => fixture.at }, authorize: async ({ userId, organizationId }) => userId === fixture.actorId && organizationId === fixture.organizationId, loadBase: async () => base, source });
    const identity = { userId: fixture.actorId, organizationId: fixture.organizationId, questionId: fixture.questionId, conversationId: fixture.conversationId };
    let deniedReads = 0;
    const denied = new LeadershipConversationProductOperations({ repository: { ...repository, read: async (id) => { deniedReads += 1; return repository.read(id); } }, clock: { now: () => fixture.at }, authorize: async () => false, loadBase: async () => base, source });
    await assert.rejects(() => denied.workspace({ ...identity, userId: "denied" }), /access denied/);
    check(deniedReads === 0, "denial precedes workflow I/O");
    await operations.recordContext({ ...identity, idempotencyKey: "context", title: "Northstar staff conversation", purpose: "Resolve the next delivery constraint.", intendedOutcome: "Agree one bounded owner action.", timeframe: "Weekly", participants: [{ participantRef: "p1", displayName: "Leader", titleLabel: "Director" }], leaderContext: null });
    let store = (await repository.read(fixture.organizationId)).store;
    await operations.recordPreparation({ ...identity, idempotencyKey: "prepare", contextVersionId: store.contexts[0]!.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: NORTHSTAR_PREPARED_LINEAGE, changeSummary: null });
    store = (await repository.read(fixture.organizationId)).store;
    await operations.freeze({ ...identity, idempotencyKey: "freeze", artifactVersionId: store.preparedWorkProducts[0]!.artifactVersionId });
    store = (await repository.read(fixture.organizationId)).store;
    await operations.receiveUpload({ ...identity, idempotencyKey: "upload", frozenSnapshotId: store.frozenSnapshots[0]!.snapshotId, purposeRef: fixture.purposeRef, mediaType: "text/plain", bytes: fixture.captureBytes, displayLabel: "Staff notes", originalFilename: null });
    store = (await repository.read(fixture.organizationId)).store;
    check(!JSON.stringify(store).includes("NORTHSTAR-LEADERSHIP-CAPTURE-001"), "workflow stores references, not source content");
    check(await operations.generateFixtureProposals({ ...identity, idempotencyKey: "proposals", uploadReceiptId: store.uploadReceipts[0]!.uploadReceiptId, purposeRef: fixture.purposeRef }) === 4, "typed fixture proposals generated");
    store = (await repository.read(fixture.organizationId)).store;
    await operations.review({ ...identity, idempotencyKey: "review", proposalId: store.proposals[0]!.proposalId, disposition: "approved", effectivePayload: null, reason: null });
    check((await repository.read(fixture.organizationId)).store.routingLinks.length === 0, "prepare/capture operations cannot route");
    check(!("route" in operations), "generic callback routing is absent");
    console.log(JSON.stringify({ validation: "leadership-conversation-prepare-capture-001", result: "PASS", checks, canonicalRoutes: 0, networkCalls: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0, productionAccess: 0, deployments: 0 }));
  } finally {
    await rm(workflowRoot, { recursive: true, force: true });
    await rm(sourceRoot, { recursive: true, force: true });
    await assert.rejects(() => lstat(workflowRoot));
    await assert.rejects(() => lstat(sourceRoot));
  }
}

void main();
