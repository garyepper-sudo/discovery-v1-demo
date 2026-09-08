import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { provisionOrganizationRuntime, provisionOrganizationUnderstandingBootstrap } from "../../lib/alpha-provisioning/provisionDesignPartner";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { issueInitialUnderstandingQuestionIdentity } from "../../product/questions/initialUnderstandingQuestion";
import { GeneralRecurringMeetingProvisioner } from "../../product/integration/generalRecurringMeetingProvisioner";

const at = "2026-09-08T00:00:00.000Z";
async function main() {
  const root = await mkdtemp(path.join(tmpdir(), "discovery-bootstrap-"));
  try {
    const runtime = new FilesystemOrganizationRuntimeRepository(path.join(root, "runtime"));
    const base = { organizationId: "bootstrap-org", organizationName: "Bootstrap Organization", purpose: "Establish a first understanding", primaryQuestion: "What should we understand first?", meetingExternalKey: "weekly-review", bootstrapOperationId: "bootstrap-op", actor: "server-bootstrap", createdAt: at, repository: runtime };
    const created = await provisionOrganizationUnderstandingBootstrap(base);
    assert.equal(created.result, "BOOTSTRAP_CREATED");
    const stored = await runtime.read(base.organizationId);
    assert.ok(stored);
    assert.equal(stored.runtime.metadata.investigationCount, 0);
    assert.equal(stored.runtime.memory.organizationalExplanations.length, 0);
    assert.equal(stored.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.length ?? 0, 0);
    assert.equal(stored.runtime.memory.initialUnderstandingBootstrap?.status, "awaiting-initial-understanding");
    assert.equal(created.productQuestionId, stored.runtime.memory.initialUnderstandingBootstrap?.initialProductQuestionId);
    assert.equal((await provisionOrganizationUnderstandingBootstrap(base)).result, "BOOTSTRAP_REPLAYED");
    await assert.rejects(() => provisionOrganizationUnderstandingBootstrap({ ...base, purpose: "Changed purpose" }), /conflict/);
    await assert.rejects(() => provisionOrganizationRuntime({ organizationId: base.organizationId, actor: base.actor, idempotencyKey: "completed-runtime", expectedRuntimeSha256: "0".repeat(64), runtimeBytes: new TextEncoder().encode(JSON.stringify(stored.runtime)), repository: runtime }), /mismatch|investigation|composition|explanation/i);
    const identity = issueInitialUnderstandingQuestionIdentity({ contractVersion: "1", organizationId: base.organizationId, activationOperationId: base.bootstrapOperationId, meetingExternalKey: base.meetingExternalKey, primaryQuestion: base.primaryQuestion, purpose: base.purpose });
    assert.deepEqual(identity, issueInitialUnderstandingQuestionIdentity({ contractVersion: "1", organizationId: base.organizationId, activationOperationId: base.bootstrapOperationId, meetingExternalKey: base.meetingExternalKey, primaryQuestion: base.primaryQuestion, purpose: base.purpose }));
    assert.notEqual(identity.questionId, issueInitialUnderstandingQuestionIdentity({ contractVersion: "1", organizationId: base.organizationId, activationOperationId: base.bootstrapOperationId, meetingExternalKey: base.meetingExternalKey, primaryQuestion: "Changed question", purpose: base.purpose }).questionId);
    const advanced = await runtime.read(base.organizationId);
    assert.ok(advanced);
    await runtime.replace(base.organizationId, new TextEncoder().encode(JSON.stringify({ ...advanced.runtime, metadata: { ...advanced.runtime.metadata, investigationCount: 1 } })), advanced.revision, { requestId: "synthetic-completed", operatorId: "validator" });
    await assert.rejects(() => provisionOrganizationUnderstandingBootstrap(base), /not ready/);
    const provisioner = new GeneralRecurringMeetingProvisioner({
      resolveOrganization: async ({ organizationExternalKey }) => { assert.equal(organizationExternalKey, "bootstrap-org-key"); return { organizationId: base.organizationId }; },
      resolvePersistedPreparationScope: async () => ({ scopeExternalKey: "scope-1", persistedAt: at, sourceVersions: [{ sourceBindingId: "binding-a", sourceContentVersionId: "source-a", normalizedContentDigest: "a".repeat(64) }, { sourceBindingId: "binding-b", sourceContentVersionId: "source-b", normalizedContentDigest: "b".repeat(64) }] }),
      createQuestion: async ({ idempotencyKey }) => { assert.equal(idempotencyKey, identity.idempotencyKey); return { workspace: { question: { id: identity.questionId } } }; },
      workflow: { read: async () => ({ revision: null }), registerMeetingPreparationScope: async (value) => ({ scope: value, committed: true }) },
      activateAndPrepare: async (value) => ({ contractVersion: "1", organizationId: value.organizationId, questionId: value.questionId, seriesId: value.identity.seriesId, conversationId: value.identity.conversationId, meeting: { title: value.meetingTitle, timeframe: value.timeframe, role: value.role, purpose: value.purpose }, whatChanged: [], whatMattersNow: [], hiddenTension: [], possibleSurprise: [], questions: [], priorCycle: { status: "none", message: "None" }, sourceBasis: [], uncertainty: [], reasoning: [], competingExplanations: [], provenance: { contextVersionId: "context", preparedWorkProductVersionId: "prepared", authorizedProjectionRevision: "revision", authorizedProjectionDigest: "digest", sourceRevisionReferences: ["source-a", "source-b"] }, status: "non-authoritative", currentStep: "prepare" }),
    });
    const result = await provisioner.provisionInitialUnderstanding({ contractVersion: "1", userId: "participant:synthetic", organizationExternalKey: "bootstrap-org-key", activationOperationId: base.bootstrapOperationId, meetingExternalKey: base.meetingExternalKey, productQuestion: base.primaryQuestion, title: "Weekly Review", purpose: base.purpose, cadenceLabel: "Weekly", preparationScopeExternalKey: "scope-1" });
    assert.equal(result.productQuestionId, identity.questionId);
    console.log("RESULT PASS initial-understanding-bootstrap checks=14");
  } finally { await rm(root, { recursive: true, force: true }); }
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
