import assert from "node:assert/strict";
import { access, mkdtemp, mkdir, rename, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { createHash } from "node:crypto";
import { provisionNorthstarPreparationLineageFixture } from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { createLeadershipConversationServerComposition } from "../../product/integration/leadershipConversationServerComposition";
import { createProductWorkflowArtifactRepository } from "../../product/workflow/leadershipConversation";
import { completeRegisteredMeetingPreparationScopeV1 } from "../../product/workflow/leadershipConversation/contracts";
import { leadershipDigest } from "../../product/workflow/leadershipConversation/determinism";
import { northstarLeadershipConversationFixture, NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE, NORTHSTAR_PREPARED_CONTENT, NORTHSTAR_PREPARED_LINEAGE } from "../../product/workflow/leadershipConversation";
import { SANDBOX_ORGANIZATION_ID } from "../../lib/access/sandboxMultiUserAccess";
import { createParticipantReferenceMeetingCurrentAccessFromEnvironment } from "../../lib/alpha-activation/participantReferenceMeetingAccessServer";

const actor = "user_devCaptureCEO";
const at = NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE.at;
const seriesAddress = (organizationId: string, seriesId: string) => createHash("sha256").update(`meeting-series-address:v1:${organizationId}:${seriesId}`).digest("base64url").slice(0, 24);
// Action run: AR6_RUN_ACTION=1 AR6_REGRESSION_AUTH_USER_ID=user_devCaptureCEO node --import /private/tmp/ar6-capture-action-auth-loader.mjs --import tsx scripts/product/validateDevelopmentCaptureAuthorizationBoundary.ts
// The loader supplies a synthetic Clerk-shaped identity only; it does not mock Product authorization or persistence.

async function main() {
  Object.assign(process.env, { NODE_ENV: "development", DISCOVERY_ENV: "development", NEXT_PUBLIC_DISCOVERY_ENV: "development", DISCOVERY_ONBOARDING_TEST_ENABLED: "true", NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true", NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_validation", CLERK_SECRET_KEY: "sk_test_validation", DISCOVERY_DATABASE_URL: "postgresql://localhost/validation", DISCOVERY_DATABASE_ADMIN_URL: "postgresql://localhost/validation_admin", DISCOVERY_DATABASE_MIGRATION_URL: "postgresql://localhost/validation_migration", DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem", DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: path.join(tmpdir(), "discovery-onboarding-validation"), DISCOVERY_SANDBOX_CEO_USER_ID: actor, DISCOVERY_SANDBOX_DIRECTOR_USER_ID: "user_devCaptureDirector", DISCOVERY_SANDBOX_MANAGER_USER_ID: "user_devCaptureManager" });
  const root = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-ar6-"));
  try {
    const provisioned = await provisionNorthstarPreparationLineageFixture({ environment: "development", fixtureRoot: root, now: at });
    const seed = provisioned.seed;
    const workflowRoot = path.join(root, "workflow"); await mkdir(workflowRoot, { mode: 0o700 });
    const runtimeRoot = path.join(root, "discovery-onboarding-validation-runtime"); await rename(path.join(root, "runtime"), runtimeRoot);
    Object.assign(process.env, { DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT: root, DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: runtimeRoot, DISCOVERY_LEADERSHIP_CONVERSATION_WORKFLOW_ROOT: workflowRoot, DISCOVERY_LEADERSHIP_CONVERSATION_SOURCE_CONTENT_ROOT: path.join(root, "discovery-governed-source-content-northstar-preparation") });
    const server = createLeadershipConversationServerComposition();
    const fixture = northstarLeadershipConversationFixture(seed.productQuestionId);
    const identity = { userId: actor, organizationId: SANDBOX_ORGANIZATION_ID, questionId: seed.productQuestionId, conversationId: fixture.conversationId };
    const seriesId = `leadership-conversation-series:${identity.conversationId}`;
    await server.recordContext({ ...identity, idempotencyKey: "ar6-dev-context", title: "Capture authorization", purpose: "Validate current authorization", intendedOutcome: "Validate carry-forward", timeframe: "Weekly", participants: [{ participantRef: `participant:${actor}`, displayName: "CEO", titleLabel: "CEO" }], leaderContext: null });
    const repository = createProductWorkflowArtifactRepository({ root: workflowRoot, environment: "development" });
    let state = await repository.read(identity.organizationId);
    await server.recordPreparation({ ...identity, idempotencyKey: "ar6-dev-prepare", contextVersionId: state.store.contexts.at(-1)!.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: NORTHSTAR_PREPARED_LINEAGE, changeSummary: null });
    state = await repository.read(identity.organizationId); const prepared = state.store.preparedWorkPublications!.at(-1)!;
    await server.freeze({ ...identity, idempotencyKey: "ar6-dev-freeze", artifactVersionId: prepared.artifactRevision, privateWorkingContribution: { seriesId, occurrenceId: identity.conversationId, authorizationRevision: "ar6-dev", provenanceDigest: "ar6-dev-private", selectedContent: [] } });
    const frozen = (await repository.read(identity.organizationId)).store.frozenSnapshotPublications!.at(-1)!;
    if (process.env.AR6_RUN_ACTION === "1") {
      const accessProbe = await createParticipantReferenceMeetingCurrentAccessFromEnvironment().authorize({ userId: actor, organizationId: identity.organizationId, seriesId });
      assert.ok(["unavailable", "denied", "authorized"].includes(accessProbe), "action regression must observe a canonical participant-access decision");
      const stateBeforeScope = await repository.read(identity.organizationId);
      const scope = completeRegisteredMeetingPreparationScopeV1({ contractVersion: "1", scopeId: "ar6-dev-action-scope", organizationId: identity.organizationId, questionId: identity.questionId, conversationId: identity.conversationId, seriesId, sourceVersions: seed.sourceContentVersions, createdAt: at, createdByUserId: actor, idempotencyKeyDigest: leadershipDigest("ar6-dev-action-scope"), requestFingerprint: leadershipDigest("ar6-dev-action-scope") });
      await repository.registerMeetingPreparationScope({ ...scope, expectedRevision: stateBeforeScope.revision });
      const { captureOccurrence1Action } = await import("../../app/product-alpha/leadership-conversation/actions");
      const negativeInputs: Array<{ label: string; input: { meetingNotes: string; seriesAddress?: string } }> = [
        { label: "omitted-address", input: { meetingNotes: "Development composition Capture regression." } },
        { label: "malformed-address", input: { meetingNotes: "Development composition Capture regression.", seriesAddress: "malformed" } },
        { label: "wrong-series", input: { meetingNotes: "Development composition Capture regression.", seriesAddress: seriesAddress(identity.organizationId, `${seriesId}-wrong`) } },
        { label: "foreign-organization", input: { meetingNotes: "Development composition Capture regression.", seriesAddress: seriesAddress("foreign-organization", seriesId) } },
        { label: "stale-revoked", input: { meetingNotes: "Development composition Capture regression.", seriesAddress: seriesAddress(identity.organizationId, `${seriesId}-revoked`) } },
        { label: "unmapped-series", input: { meetingNotes: "Development composition Capture regression.", seriesAddress: seriesAddress(identity.organizationId, "leadership-conversation-series:unmapped") } },
        { label: "source-unauthorized", input: { meetingNotes: "Development composition Capture regression.", seriesAddress: seriesAddress(identity.organizationId, `${seriesId}-source-unauthorized`) } },
      ];
      const beforeAction = await repository.read(identity.organizationId);
      const beforeCounts = { uploadReceipts: beforeAction.store.uploadReceipts.length, privateWorkingContributionCaptures: (beforeAction.store.privateWorkingContributionCaptures ?? []).length, proposals: beforeAction.store.proposals.length, canonicalRoutingReceipts: beforeAction.store.canonicalRoutingReceipts.length };
      const outcomes: Array<{ label: string; outcome: "rejected" | "succeeded" }> = [];
      for (const negative of [...negativeInputs, ...negativeInputs]) {
        let outcome: "rejected" | "succeeded" = "rejected";
        try { await captureOccurrence1Action(negative.input); outcome = "succeeded"; } catch { /* observed below */ }
        outcomes.push({ label: negative.label, outcome });
      }
      const afterAction = await repository.read(identity.organizationId);
      const safeCounts = { uploadReceipts: afterAction.store.uploadReceipts.length, privateWorkingContributionCaptures: (afterAction.store.privateWorkingContributionCaptures ?? []).length, proposals: afterAction.store.proposals.length, canonicalRoutingReceipts: afterAction.store.canonicalRoutingReceipts.length };
      const negativePass = outcomes.every(value => value.outcome === "rejected") && JSON.stringify(beforeCounts) === JSON.stringify(safeCounts);
      let positiveControl: { result: string; replay: string; proposalCount?: number } = { result: "not-run", replay: "not-run" };
      if (accessProbe === "authorized") {
        const first = await captureOccurrence1Action({ meetingNotes: "Lawful participant-authorized Capture control." });
        const afterFirst = await repository.read(identity.organizationId);
        const second = await captureOccurrence1Action({ meetingNotes: "Lawful participant-authorized Capture control." });
        const afterReplay = await repository.read(identity.organizationId);
        assert.deepEqual(afterReplay, afterFirst, "lawful Capture replay must be idempotent");
        assert.ok(first.proposals.length > 0 && second.proposals.length === first.proposals.length, "lawful Capture must produce stable proposals");
        assert.ok(first.proposals.every(proposal => proposal.contractVersion === "3" && proposal.admissionBasis.meetingPackArtifactId.length > 0 && proposal.admissionBasis.candidateDigest.length > 0), "lawful Capture must admit proposals from the durable Meeting Pack basis");
        positiveControl = { result: "PASS", replay: "stable", proposalCount: first.proposals.length };
      }
      assert.equal(accessProbe, "authorized", "authenticated Capture regression requires the canonical participant-access bridge");
      console.log(JSON.stringify({ validation: "development-capture-authorization-boundary", result: negativePass ? "PASS" : "SECURITY_NEGATIVE_FAIL", actualCaptureAction: outcomes, accessProbe, beforeCounts, afterCounts: safeCounts, positiveControl }));
      assert.ok(outcomes.every(value => value.outcome === "rejected"), "every unauthorised Capture input must reject");
      assert.deepEqual(safeCounts, beforeCounts, "denied Capture must not persist partial records");
      return;
    }
    await server.captureFrozenPrivateWorkingContribution({ ...identity, snapshotId: frozen.artifactId, idempotencyKey: "ar6-dev-capture" });
    const upload = await server.receiveUpload({ ...identity, frozenSnapshotId: frozen.artifactId, purposeRef: fixture.purposeRef, mediaType: "text/plain", bytes: fixture.captureBytes, displayLabel: "Current meeting notes", originalFilename: null, idempotencyKey: "ar6-dev-upload" });
    const uploadReceiptId = upload.uploadReceipts.at(-1)!.uploadReceiptId;
    await assert.rejects(() => server.beginReviewedCarryForward({ ...identity, uploadReceiptId, idempotencyKey: "ar6-dev-missing-scope" }), /unavailable/);
    state = await repository.read(identity.organizationId);
    const scope = completeRegisteredMeetingPreparationScopeV1({ contractVersion: "1", scopeId: "ar6-dev-scope", organizationId: identity.organizationId, questionId: identity.questionId, conversationId: identity.conversationId, seriesId, sourceVersions: seed.sourceContentVersions, createdAt: at, createdByUserId: actor, idempotencyKeyDigest: leadershipDigest("ar6-dev-scope"), requestFingerprint: leadershipDigest("ar6-dev-scope") });
    await repository.registerMeetingPreparationScope({ ...scope, expectedRevision: state.revision });
    const result = await server.beginReviewedCarryForward({ ...identity, uploadReceiptId, idempotencyKey: "ar6-dev-registered-scope" });
    assert.ok(result.proposalCount >= 3 && result.proposalCount <= 7);
    const replay = await server.beginReviewedCarryForward({ ...identity, uploadReceiptId, idempotencyKey: "ar6-dev-registered-scope" });
    assert.equal(replay.proposalCount, result.proposalCount);
    console.log(JSON.stringify({ validation: "development-capture-authorization-boundary", result: "PASS", missingScope: "denied", registeredScope: "eligible", proposalCount: result.proposalCount, replay: "stable", actualCaptureAction: "PENDING_ACTION_LOADER" }));
  } finally { await rm(root, { recursive: true, force: true }); let rootAbsent = false; try { await access(root); } catch { rootAbsent = true; } console.error(JSON.stringify({ validation: "development-capture-authorization-boundary-cleanup", rootAbsent })); }
}
void main();
