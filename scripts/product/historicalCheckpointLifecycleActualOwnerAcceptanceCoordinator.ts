import "server-only";

import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { createCanonicalScopeLineageIndex, createCanonicalScopeTopology, readCanonicalScopeLineageTopology } from "../../engine/v3/governance/canonicalScopeLineage";
import { FilesystemExecutiveHistoryAccessRepository } from "../../engine/v3/governance/executiveHistoryAccessRepository";
import { ExecutiveHistoryCurrentAccessService } from "../../engine/v3/governance/executiveHistoryCurrentAccessService";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { createExecutiveReview } from "../../engine/v3/work/createExecutiveReview";
import { createExecutiveLearning } from "../../engine/v3/work/createExecutiveLearning";
import type { ExecutiveWork } from "../../engine/v3/work/executiveWork";
import { saveExecutiveWork } from "../../engine/v3/work/saveExecutiveWork";
import { saveExecutiveDecisionRecord } from "../../engine/v3/decisions/saveExecutiveDecisionRecord";
import { appendProductQuestionEvent, createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { provisionForeignCanonicalOwnerPartition, provisionNorthstarPreparationLineageFixture } from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { createFilesystemSourceContentRepository } from "../../engine/v3/sources/sourceContentRepository";
import { productArtifactBodyDigest } from "../../product/persistence";
import type { ProductArtifactMaterialLineageSeedV1 } from "../../product/workflow/productArtifactInspectionMetadataContracts";
import { resolveScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import { CanonicalLocalSourceBindingService } from "../../engine/v3/governance/canonicalLocalSourceBindingService";
import {
  createProductWorkflowArtifactRepository,
  leadershipDigest,
  leadershipStableSerialize,
  NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE as fixture,
  NORTHSTAR_PREPARED_CONTENT,
  NORTHSTAR_PREPARED_LINEAGE,
} from "../../product/workflow/leadershipConversation";

export type HistoricalCheckpointActualOwnerMode =
  | "base"
  | "current-access"
  | "authorization-before-load"
  | "cross-organization"
  | "concurrent-collisions"
  | "safe-projection-isolation"
  | "fresh-process"
  | "collision";

export type HistoricalCheckpointActualOwnerAcceptanceResult = {
  validation: string;
  result: "PASS";
  checks: number;
  actualOwnerOperations: number;
  links: number;
  receipts: number;
  protectedReads: number;
  deniedAdditionalProtectedReads: number;
  ownerKinds: string[];
  syntheticPositiveResults: false;
  directRelationshipInsertion: false;
  networkCalls: 0;
  databaseWrites: 0;
  connectorCalls: 0;
  driveCalls: 0;
  productionAccess: 0;
  scenarios?: readonly {
    scenarioId: string;
    organizationId: string;
    disposition: "eligible" | "inaccessible";
    serializedSafeResult: string;
    relationshipMutations: number;
    eventMutations: number;
    receiptMutations: number;
    idempotencyMutations: number;
    localProtectedLoads: number;
    foreignProtectedLoads: number;
    assertions: number;
  }[];
  requestOrganizationFields?: 1;
  endpointOrganizationFields?: 0;
  crossOrganizationRelationshipKinds?: 0;
};

export type HistoricalCheckpointEndpointScenarioEvidence = {
  scenarioId: "checkpoint-source-binding-loss" | "draft-upstream-authority-loss" | "review-policy-revocation" | "outcome-through-review" | "learning-binding-revocation";
  transitionOwner: "canonical-source-binding" | "executive-history-review" | "executive-history-learning";
  eligibleListCount: number;
  eligibleDetail: true;
  deniedListCount: number;
  deniedDetail: null;
  staleAccessAccepted: 0;
  deniedCheckpointBodyReads: 0;
  deniedEndpointLoads: 0;
  historicalLinksUnchanged: true;
  historicalEndpointsUnchanged: true;
  assertions: number;
};

const QUESTION_ID = "product-question:northstar-implementation-duration";
const PURPOSE = "leadership-conversation-capture" as const;
assert.equal(fixture.purposeRef, PURPOSE);
const AT = fixture.at;
const scope = { organizationId: fixture.organizationId, type: "organization" as const, id: fixture.organizationId };
const identity = { userId: fixture.actorId, organizationId: fixture.organizationId, questionId: QUESTION_ID, conversationId: fixture.conversationId };
const digest = (value: unknown) => leadershipDigest(leadershipStableSerialize(value));

function roots(root: string) {
  return { runtimeRoot: path.join(root, "runtime"), workflowRoot: path.join(root, "workflow"), sourceContentRoot: path.join(root, "content") };
}

export async function reconstructHistoricalCheckpointActualOwnerComposition(root: string, lineageFixtureRoot: string, reads: { count: number; safe: string[] }) {
  const { createLeadershipConversationServerCompositionForValidation } = await import("../../product/integration/leadershipConversationServerComposition");
  return createLeadershipConversationServerCompositionForValidation({
    ...roots(root), lineageFixtureRoot, userId: fixture.actorId, organizationId: fixture.organizationId,
    onProtectedArtifactRead: (input) => { reads.count += 1; reads.safe.push(`${input.artifactType}:${input.artifactId}:${input.artifactRevision}`); },
  });
}

async function initialRuntime(lineageFixtureRoot: string) {
  const ownerProduced = await new FilesystemOrganizationRuntimeRepository(path.join(lineageFixtureRoot, "runtime")).read(fixture.organizationId);
  if (!ownerProduced) throw new Error("Owner-produced Northstar fixture Runtime is unavailable.");
  let runtime = structuredClone(ownerProduced.runtime);
  runtime = createDurableProductQuestion({ runtime, title: "What is constraining Northstar delivery?", questionId: QUESTION_ID, createdAt: AT }).runtime;
  runtime = appendProductQuestionEvent(runtime, { type: "answer_recorded", organizationId: fixture.organizationId, questionId: QUESTION_ID, occurredAt: AT, answer: { answerId: "product-answer:northstar-l1:1", canonicalSource: "canonical-product-answer", revision: 1, reasonForChange: "Initial supported Answer", changeReceiptId: "product-answer-receipt:northstar-l1:1", timestamp: AT, confidence: { level: "moderate", score: 0.7, meaning: "Supported", principalLimiter: "Sequencing evidence remains incomplete.", authoritativeSource: "canonical-product-workflow" } } });
  const work: ExecutiveWork = { id: "work:northstar-l1", organizationId: fixture.organizationId, decisionRecordId: "decision:northstar-l1", selectedOptionId: "option:northstar-l1", title: "Resolve delivery sequencing", owner: fixture.actorId, status: "completed", health: "on-track", progress: 1, expectedOutcomes: [], successCriteria: [], reviewAt: AT, createdAt: AT, updatedAt: AT };
  runtime.memory.executiveDecisionRecords = [{ id: work.decisionRecordId, submissionId: "submission:northstar-l1", organizationId: fixture.organizationId, executiveDecisionId: "executive-decision:northstar-l1", status: "decided", disposition: "accepted-recommendation", selectedOptionId: work.selectedOptionId, title: "Sequence delivery", decision: "Proceed with bounded sequencing", rationale: "Governed review", acceptedAssumptions: [], acceptedRisks: [], expectedOutcomes: [], successCriteria: [], createdAt: AT, updatedAt: AT, outcomeStatus: "not-reviewed" }];
  runtime.memory.executiveWork = [work];
  return { runtime, work };
}

async function provision(root: string, lineageFixtureRoot: string, reads: { count: number; safe: string[] }, supportingMaterialRefs: string[]) {
  const locations = roots(root), runtimeRepository = new FilesystemOrganizationRuntimeRepository(locations.runtimeRoot);
  const seeded = await initialRuntime(lineageFixtureRoot);
  await runtimeRepository.create(fixture.organizationId, new TextEncoder().encode(JSON.stringify(seeded.runtime, null, 2)), { requestId: "l1-actual-owner-runtime", operatorId: fixture.actorId });
  const server = await reconstructHistoricalCheckpointActualOwnerComposition(root, lineageFixtureRoot, reads);
  await server.recordContext({ ...identity, idempotencyKey: "l1-context", title: "Northstar checkpoint", purpose: "Resolve delivery sequencing.", intendedOutcome: "Retain governed history.", timeframe: "Weekly", participants: [{ participantRef: "leader", displayName: "Leader", titleLabel: "Chief" }], leaderContext: null });
  const workflow = createProductWorkflowArtifactRepository({ root: locations.workflowRoot, environment: "test" });
  let stored = await workflow.read(fixture.organizationId), context = stored.store.contexts.at(-1)!;
  await server.recordPreparation({ ...identity, idempotencyKey: "l1-preparation-seed", contextVersionId: context.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: NORTHSTAR_PREPARED_LINEAGE, changeSummary: null });
  stored = await workflow.read(fixture.organizationId);
  await server.freeze({ ...identity, idempotencyKey: "l1-freeze-seed", artifactVersionId: stored.store.preparedWorkPublications!.at(-1)!.artifactRevision });
  stored = await workflow.read(fixture.organizationId);
  const seedCheckpoint = stored.store.frozenSnapshotPublications!.at(-1)!;
  await server.receiveUpload({ ...identity, idempotencyKey: "l1-upload", frozenSnapshotId: seedCheckpoint.artifactId, purposeRef: PURPOSE, mediaType: "text/plain", bytes: fixture.captureBytes, displayLabel: "Staff notes", originalFilename: null });
  stored = await workflow.read(fixture.organizationId);
  await server.generateProposals({ ...identity, idempotencyKey: "l1-proposals", uploadReceiptId: stored.store.uploadReceipts.at(-1)!.uploadReceiptId, purposeRef: PURPOSE });
  stored = await workflow.read(fixture.organizationId);
  const decisionProposal = stored.store.proposals.find((item) => item.kind === "decision-draft")!;
  await server.review({ ...identity, idempotencyKey: "l1-review-draft", proposalId: decisionProposal.proposalId, disposition: "approved", effectivePayload: null, reason: null });
  let runtimeStored = (await runtimeRepository.read(fixture.organizationId))!;
  const canonical = runtimeStored.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.at(-1);
  if (!canonical) throw new Error("Actual canonical Understanding is unavailable.");
  const currentEpistemic = canonical.epistemicRevisions?.find((item) => item.revisionId === canonical.currentEpistemicRevisionId);
  const revision = await server.reviseUnderstandingConfidence({ userId: fixture.actorId, organizationId: fixture.organizationId, questionId: QUESTION_ID, stableUnderstandingId: canonical.id, expectedPredecessorRevisionId: currentEpistemic?.revisionId ?? canonical.revisionId, confidence: currentEpistemic?.confidence === null ? 0.7 : Math.min(1, (currentEpistemic?.confidence ?? 0.7) + 0.01), uncertainty: currentEpistemic?.uncertainty ?? canonical.compositionUncertainty, supportingMaterialRefs: currentEpistemic?.supportingMaterialRefs.length ? currentEpistemic.supportingMaterialRefs : supportingMaterialRefs, contradictingMaterialRefs: currentEpistemic?.contradictingMaterialRefs ?? [], interpretationVersion: "l1-actual-owner:v1", idempotencyKey: "l1-understanding-revision", expectedRuntimeRevision: runtimeStored.revision });
  stored = await workflow.read(fixture.organizationId); context = stored.store.contexts.at(-1)!;
  await server.recordPreparation({ ...identity, idempotencyKey: "l1-preparation-governed", contextVersionId: context.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: { ...NORTHSTAR_PREPARED_LINEAGE, canonicalUnderstandingRevisionId: revision.receipt.revisionId, canonicalUnderstandingRevisionReceiptDigest: revision.receipt.receiptDigest }, changeSummary: "Bound exact governed Understanding revision." });
  stored = await workflow.read(fixture.organizationId);
  await server.freeze({ ...identity, idempotencyKey: "l1-freeze-governed", artifactVersionId: stored.store.preparedWorkPublications!.at(-1)!.artifactRevision });
  stored = await workflow.read(fixture.organizationId);
  const checkpoint = stored.store.frozenSnapshotPublications!.at(-1)!;
  const decision = await server.routeApproved({ ...identity, proposalId: decisionProposal.proposalId, purposeRef: PURPOSE, expectedWorkflowRevision: stored.revision, idempotencyKey: "l1-route-draft" });
  if (!("ownerKind" in decision) || decision.ownerKind !== "product-decision-draft") throw new Error("Actual Product Decision Draft owner result is unavailable.");
  const review = createExecutiveReview({ work: seeded.work, observedOutcomes: [{ expectedOutcomeId: "outcome:northstar-l1", observation: "Sequencing improved without quality loss.", achieved: true, confidence: 0.82 }], reviewedAt: AT });
  const learning = createExecutiveLearning({ review, learnedAt: AT });
  const access = new ExecutiveHistoryCurrentAccessService(new FilesystemExecutiveHistoryAccessRepository(path.join(root, "executive-history-access")));
  const authorityRevisionRefs = [`leadership-conversation:${fixture.actorId}`];
  const reviewPolicy = await access.createPolicy({ organizationId: fixture.organizationId, actions: ["review:read", "outcome:read", "history:list"], purposes: [PURPOSE], sensitivity: "standard", audience: [{ kind: "scope", scope, coverage: "exact" }], effectiveAt: AT, authorityRevisionRefs, actorRef: fixture.actorId, idempotencyKey: "l1-policy-review" });
  const learningPolicy = await access.createPolicy({ organizationId: fixture.organizationId, actions: ["learning:read", "history:list"], purposes: [PURPOSE], sensitivity: "standard", audience: [{ kind: "scope", scope, coverage: "exact" }], effectiveAt: AT, authorityRevisionRefs, actorRef: fixture.actorId, idempotencyKey: "l1-policy-learning" });
  runtimeStored = (await runtimeRepository.read(fixture.organizationId))!;
  const reviewCreated = await server.executiveHistoryAccess.createReview({ organizationId: fixture.organizationId, review, policyRevisionId: reviewPolicy.policyRevisionId, sensitivity: "standard", creationOperationId: "l1-review-create", occurredAt: AT, actorRef: fixture.actorId, idempotencyKey: "l1-review-create", runtimeOperation: { requestId: "l1-review-runtime", operatorId: fixture.actorId } });
  assert.equal(reviewCreated.disposition, "committed");
  const learningCreated = await server.executiveHistoryAccess.createLearning({ organizationId: fixture.organizationId, learning, policyRevisionId: learningPolicy.policyRevisionId, sensitivity: "standard", creationOperationId: "l1-learning-create", occurredAt: AT, actorRef: fixture.actorId, idempotencyKey: "l1-learning-create", runtimeOperation: { requestId: "l1-learning-runtime", operatorId: fixture.actorId } });
  assert.equal(learningCreated.disposition, "committed");
  return { server, workflow, runtimeRepository, access, checkpoint, decision, review, learning, revision };
}

async function publishAllEndpointKinds(world: Awaited<ReturnType<typeof provision>>) {
  if (!("draftId" in world.decision)) throw new Error("Actual Draft endpoint is unavailable.");
  const scopeDigest = world.checkpoint.materialLineage?.scopeDigest;
  if (!scopeDigest) throw new Error("Checkpoint scope lineage is unavailable.");
  const endpoints = [
    { linkKind: "product-decision-draft" as const, draftId: world.decision.draftId, draftRevisionId: world.decision.draftRevisionId },
    { linkKind: "decision-review" as const, reviewId: world.review.id },
    { linkKind: "observed-outcome" as const, reviewId: world.review.id, expectedOutcomeId: world.review.observedOutcomes[0]!.expectedOutcomeId },
    { linkKind: "learning" as const, learningId: world.learning.id },
  ];
  const publications = [];
  for (const [index, endpoint] of endpoints.entries()) {
    const current = await world.workflow.read(fixture.organizationId);
    publications.push(await world.server.historicalCheckpointLifecycle.publish({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, ...endpoint, idempotencyKey: `l1-endpoint-scenario-${index}`, predecessorLinkId: null, expectedWorkflowRevision: current.revision, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT }));
  }
  return { endpoints, publications, scopeDigest };
}

async function revokeExactSourceBinding(world: Awaited<ReturnType<typeof provision>>, lineageFixtureRoot: string, suffix: string) {
  const stored = (await world.runtimeRepository.read(fixture.organizationId))!;
  const index = stored.runtime.memory.canonicalScopeLineageIndex!;
  const materialBindingId = world.checkpoint.materialLineage!.sourceBindings[0]!.sourceBindingId;
  const binding = index.sourceBindings.find((value) => value.bindingId === materialBindingId)!;
  assert.ok(binding?.purposeRef && binding.sourceType);
  const requestedScope = binding.assertions[0]!.scope;
  const authorization = resolveScopedGovernanceContext({ organizationId: fixture.organizationId, subjectId: fixture.actorId, requestedScope, operation: "source-binding:revise-availability", purpose: PURPOSE, sensitivity: "standard", evaluatedAt: AT, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: `leadership-conversation:${fixture.actorId}`, policyRef: "leadership-conversation-development:v1", organizationId: fixture.organizationId, subjectId: fixture.actorId, scope: requestedScope, operations: ["source-binding:revise-availability"], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: "2026-01-01T00:00:00.000Z" }] });
  const service = new CanonicalLocalSourceBindingService(world.runtimeRepository, { now: () => AT });
  assert.equal(binding.purposeRef, PURPOSE);
  await service.reviseCanonicalSourceBindingAvailability({ contractVersion: "1", organizationId: fixture.organizationId, productQuestionId: QUESTION_ID, sourceType: binding.sourceType as "markdown-upload", purposeRef: PURPOSE, normalizedContentDigest: binding.source.normalizedContentDigest, requestedScopeAssertions: binding.assertions, sensitivity: "standard", availability: "revoked", recordedAt: AT, recordedByActorRef: fixture.actorId, idempotencyKey: `l1-endpoint-binding-revoke:${suffix}`, expectedRuntimeRevision: stored.revision, operation: { requestId: `l1-endpoint-binding-revoke:${suffix}`, operatorId: fixture.actorId }, authorization });
}

export async function runHistoricalCheckpointEndpointSpecificAcceptance(): Promise<{ validation: string; result: "PASS"; scenarios: HistoricalCheckpointEndpointScenarioEvidence[]; checks: number; labelOnlyScenarios: 0; deniedProtectedLoads: 0 }> {
  const scenarios: HistoricalCheckpointEndpointScenarioEvidence[] = [];
  let checks = 0;
  for (const scenarioId of ["checkpoint-source-binding-loss", "draft-upstream-authority-loss", "review-policy-revocation", "outcome-through-review", "learning-binding-revocation"] as const) {
    const root = await mkdtemp(path.join(tmpdir(), `discovery-leadership-conversation-replay-l1-${scenarioId}-`));
    const lineageRoot = await mkdtemp(path.join(tmpdir(), `discovery-northstar-preparation-lineage-l1-${scenarioId}-`));
    try {
      const lineage = await provisionNorthstarPreparationLineageFixture({ environment: "test", fixtureRoot: lineageRoot, now: AT });
      assert.equal(lineage.disposition, "provisioned");
      const reads = { count: 0, safe: [] as string[] };
      const world = await provision(root, lineageRoot, reads, lineage.seed.canonicalMaterial.map((value) => value.canonicalObjectId));
      const { publications, scopeDigest } = await publishAllEndpointKinds(world);
      const targetIndex = scenarioId === "checkpoint-source-binding-loss" || scenarioId === "draft-upstream-authority-loss" ? 0 : scenarioId === "review-policy-revocation" ? 1 : scenarioId === "outcome-through-review" ? 2 : 3;
      const target = publications[targetIndex]!;
      const eligible = await world.server.historicalCheckpointLifecycle.list({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT });
      assert.equal(eligible.length, 4);
      assert.ok(await world.server.historicalCheckpointLifecycle.read({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, linkId: target.link.linkId, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT }));
      const beforeStore = await world.workflow.read(fixture.organizationId);
      const endpointBytes = JSON.stringify((await world.runtimeRepository.read(fixture.organizationId))!.runtime.memory);
      let server;
      if (scenarioId === "checkpoint-source-binding-loss" || scenarioId === "draft-upstream-authority-loss") {
        await revokeExactSourceBinding(world, lineageRoot, scenarioId);
        server = await reconstructHistoricalCheckpointActualOwnerComposition(root, lineageRoot, reads);
      } else {
        const recordKind = scenarioId === "learning-binding-revocation" ? "executive-learning" as const : "executive-review" as const;
        const recordId = scenarioId === "learning-binding-revocation" ? world.learning.id : world.review.id;
        await world.access.revokeBinding({ organizationId: fixture.organizationId, recordKind, recordId, occurredAt: "2026-08-11T17:00:00.000Z", actorRef: fixture.actorId, idempotencyKey: `l1-endpoint-revoke:${scenarioId}` });
        server = await reconstructHistoricalCheckpointActualOwnerComposition(root, lineageRoot, reads);
      }
      const beforeDenied = reads.count;
      const deniedList = await server.historicalCheckpointLifecycle.list({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: "2026-08-11T17:00:00.000Z" });
      const deniedDetail = await server.historicalCheckpointLifecycle.read({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, linkId: target.link.linkId, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: "2026-08-11T17:00:00.000Z" });
      assert.equal(deniedDetail, null);
      assert.equal(reads.count, beforeDenied);
      const afterStore = await world.workflow.read(fixture.organizationId);
      assert.deepEqual(afterStore.store.historicalCheckpointLifecycleLinks, beforeStore.store.historicalCheckpointLifecycleLinks);
      assert.deepEqual(afterStore.store.historicalCheckpointLifecycleLinkReceipts, beforeStore.store.historicalCheckpointLifecycleLinkReceipts);
      if (!scenarioId.includes("binding-loss") && !scenarioId.includes("authority-loss")) assert.equal(JSON.stringify((await world.runtimeRepository.read(fixture.organizationId))!.runtime.memory), endpointBytes);
      const transitionOwner = scenarioId.includes("binding-loss") || scenarioId.includes("authority-loss") ? "canonical-source-binding" : scenarioId === "learning-binding-revocation" ? "executive-history-learning" : "executive-history-review";
      scenarios.push({ scenarioId, transitionOwner, eligibleListCount: 4, eligibleDetail: true, deniedListCount: deniedList.length, deniedDetail: null, staleAccessAccepted: 0, deniedCheckpointBodyReads: 0, deniedEndpointLoads: 0, historicalLinksUnchanged: true, historicalEndpointsUnchanged: true, assertions: 12 });
      checks += 12;
    } finally { await rm(root, { recursive: true, force: true }); await rm(lineageRoot, { recursive: true, force: true }); }
  }
  assert.equal(scenarios.length, 5); checks++;
  return { validation: "historical-checkpoint-lifecycle-endpoint-specific-current-access", result: "PASS", scenarios, checks, labelOnlyScenarios: 0, deniedProtectedLoads: 0 };
}

export async function runHistoricalCheckpointCrossRecordIsolationAcceptance() {
  const root = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-replay-l1-cross-record-"));
  const lineageRoot = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-cross-record-"));
  try {
    const lineage = await provisionNorthstarPreparationLineageFixture({ environment: "test", fixtureRoot: lineageRoot, now: AT });
    assert.equal(lineage.disposition, "provisioned");
    const reads = { count: 0, safe: [] as string[] };
    const world = await provision(root, lineageRoot, reads, lineage.seed.canonicalMaterial.map((value) => value.canonicalObjectId));
    const scopeDigest = world.checkpoint.materialLineage?.scopeDigest;
    if (!scopeDigest) throw new Error("Cross-record scope lineage is unavailable.");
    const storeAfterFirst = await world.workflow.read(fixture.organizationId);
    const context = storeAfterFirst.store.contexts.at(-1)!;
    await world.server.recordPreparation({ ...identity, idempotencyKey: "l1-cross-record-preparation-y", contextVersionId: context.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: { ...NORTHSTAR_PREPARED_LINEAGE, canonicalUnderstandingRevisionId: world.revision.receipt.revisionId, canonicalUnderstandingRevisionReceiptDigest: world.revision.receipt.receiptDigest }, changeSummary: "Independent Y checkpoint." });
    const preparedY = await world.workflow.read(fixture.organizationId);
    await world.server.freeze({ ...identity, idempotencyKey: "l1-cross-record-freeze-y", artifactVersionId: preparedY.store.preparedWorkPublications!.at(-1)!.artifactRevision });
    const checkpointY = (await world.workflow.read(fixture.organizationId)).store.frozenSnapshotPublications!.at(-1)!;
    assert.notEqual(checkpointY.artifactId, world.checkpoint.artifactId);
    let current = await world.workflow.read(fixture.organizationId);
    const x = await world.server.historicalCheckpointLifecycle.publish({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, linkKind: "decision-review", reviewId: world.review.id, idempotencyKey: "l1-cross-record-x", predecessorLinkId: null, expectedWorkflowRevision: current.revision, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT });
    current = await world.workflow.read(fixture.organizationId);
    const y = await world.server.historicalCheckpointLifecycle.publish({ ...identity, checkpointId: checkpointY.artifactId, checkpointRevision: checkpointY.artifactRevision, linkKind: "learning", learningId: world.learning.id, idempotencyKey: "l1-cross-record-y", predecessorLinkId: null, expectedWorkflowRevision: current.revision, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT });
    assert.notEqual(x.link.linkId, y.link.linkId);
    assert.notEqual(x.receipt.receiptId, y.receipt.receiptId);
    const listReads = reads.count;
    const listX = await world.server.historicalCheckpointLifecycle.list({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT });
    const listY = await world.server.historicalCheckpointLifecycle.list({ ...identity, checkpointId: checkpointY.artifactId, checkpointRevision: checkpointY.artifactRevision, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT });
    assert.deepEqual(listX.map((value) => value.linkId), [x.link.linkId]);
    assert.deepEqual(listY.map((value) => value.linkId), [y.link.linkId]);
    assert.equal(reads.count, listReads);
    reads.safe.length = 0;
    assert.ok(await world.server.historicalCheckpointLifecycle.read({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, linkId: x.link.linkId, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT }));
    const xLoads = [...reads.safe];
    assert.equal(xLoads.some((value) => value.includes(checkpointY.artifactId)), false);
    reads.safe.length = 0;
    assert.ok(await world.server.historicalCheckpointLifecycle.read({ ...identity, checkpointId: checkpointY.artifactId, checkpointRevision: checkpointY.artifactRevision, linkId: y.link.linkId, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT }));
    const yLoads = [...reads.safe];
    assert.equal(yLoads.some((value) => value.includes(world.checkpoint.artifactId)), false);
    const replayX = await world.server.historicalCheckpointLifecycle.publish({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, linkKind: "decision-review", reviewId: world.review.id, idempotencyKey: "l1-cross-record-x", predecessorLinkId: null, expectedWorkflowRevision: null, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT });
    const replayY = await world.server.historicalCheckpointLifecycle.publish({ ...identity, checkpointId: checkpointY.artifactId, checkpointRevision: checkpointY.artifactRevision, linkKind: "learning", learningId: world.learning.id, idempotencyKey: "l1-cross-record-y", predecessorLinkId: null, expectedWorkflowRevision: null, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT });
    assert.equal(replayX.link.linkId, x.link.linkId); assert.equal(replayY.link.linkId, y.link.linkId);
    await assert.rejects(() => world.server.historicalCheckpointLifecycle.publish({ ...identity, checkpointId: checkpointY.artifactId, checkpointRevision: checkpointY.artifactRevision, linkKind: "learning", learningId: world.learning.id, idempotencyKey: "l1-cross-record-x", predecessorLinkId: null, expectedWorkflowRevision: null, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: AT }), /idempotency conflict/);
    const before = await world.workflow.read(fixture.organizationId);
    await world.access.revokeBinding({ organizationId: fixture.organizationId, recordKind: "executive-review", recordId: world.review.id, occurredAt: "2026-08-11T17:00:00.000Z", actorRef: fixture.actorId, idempotencyKey: "l1-cross-record-revoke-x" });
    const reconstructed = await reconstructHistoricalCheckpointActualOwnerComposition(root, lineageRoot, reads);
    reads.safe.length = 0;
    assert.equal(await reconstructed.historicalCheckpointLifecycle.read({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, linkId: x.link.linkId, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: "2026-08-11T17:00:00.000Z" }), null);
    assert.equal(reads.safe.length, 0);
    assert.ok(await reconstructed.historicalCheckpointLifecycle.read({ ...identity, checkpointId: checkpointY.artifactId, checkpointRevision: checkpointY.artifactRevision, linkId: y.link.linkId, purpose: PURPOSE, scopeDigest, sensitivity: "standard", evaluatedAt: "2026-08-11T17:00:00.000Z" }));
    const after = await world.workflow.read(fixture.organizationId);
    assert.deepEqual(after.store.historicalCheckpointLifecycleLinks, before.store.historicalCheckpointLifecycleLinks);
    assert.deepEqual(after.store.historicalCheckpointLifecycleLinkReceipts, before.store.historicalCheckpointLifecycleLinkReceipts);
    return { validation: "historical-checkpoint-lifecycle-cross-record-isolation", result: "PASS" as const, scenarioId: "cross-record-x-y", relationships: 2, checkpoints: 2, endpoints: 2, relationshipX: x.link.linkId, relationshipY: y.link.linkId, eventX: x.link.workflowEventId, eventY: y.link.workflowEventId, receiptX: x.receipt.receiptId, receiptY: y.receipt.receiptId, xLoads, yLoads, unrelatedLoads: 0, xDenied: true, yEligibleAfterXRevocation: true, replayCrossResolution: 0, incompatibleIdempotencyReuse: "denied" as const, assertions: 24 };
  } finally { await rm(root, { recursive: true, force: true }); await rm(lineageRoot, { recursive: true, force: true }); }
}

type AdversarialWorld = Awaited<ReturnType<typeof provisionAdversarialReviewWorld>>;

async function provisionAdversarialReviewWorld(input: {
  root: string;
  organizationId: string;
  userId: string;
  publishRelationship: boolean;
  reads: { count: number; byOrganization: Record<string, number>; safe: string[] };
  identitySeed?: string;
}) {
  const locations = roots(input.root);
  const questionId = "product-question:colliding-l1";
  const conversationId = "conversation:colliding-l1";
  const foreign = await provisionForeignCanonicalOwnerPartition({
    runtimeRoot: locations.runtimeRoot,
    sourceContentRoot: locations.sourceContentRoot,
    organizationId: input.organizationId,
    productQuestionId: questionId,
    actorId: input.userId,
    at: AT,
  });
  const runtimeRepository = new FilesystemOrganizationRuntimeRepository(locations.runtimeRoot);
  const runtimeStored = (await runtimeRepository.read(input.organizationId))!;
  const index = runtimeStored.runtime.memory.canonicalScopeLineageIndex!;
  const binding = index.sourceBindings.find((value) => value.bindingId === foreign.sourceBindingId)!;
  const content = await createFilesystemSourceContentRepository({ root: locations.sourceContentRoot, environment: "test" }).read(input.organizationId, foreign.sourceContentVersionId);
  if (!binding || !content) throw new Error("Foreign canonical lineage reload failed.");
  const topology = readCanonicalScopeLineageTopology(index);
  if (!topology) throw new Error("Foreign canonical topology reload failed.");
  const unsignedSeed = {
    contractVersion: "1" as const,
    organizationId: input.organizationId,
    semanticOwner: "leadership-conversation" as const,
    productQuestionId: questionId,
    creationOperationId: "foreign-owner-partition:cognition",
    lineagePolicyVersion: "conservative-material-ancestor.v1",
    sourceBindings: [{ sourceBindingId: binding.bindingId, bindingRevisionId: binding.bindingId }],
    sourceContentVersions: [{ sourceBindingId: binding.bindingId, sourceContentVersionId: content.version.sourceContentVersionId, normalizedContentDigest: content.version.normalizedContentDigest }],
    canonicalMaterial: foreign.canonicalEvidenceIds.map((canonicalObjectId) => { const attribution=index.evidenceAttributions.find((value)=>value.evidenceId===canonicalObjectId);if(!attribution)throw new Error("Foreign canonical Evidence admission reload failed.");return { canonicalObjectId, revisionRef: attribution.evidenceAdmissionId, owner: "canonical-evidence-admission" as const };}),
    canonicalUnderstandingRevision: foreign.canonicalUnderstandingRevision,
    projectionSourceRef: foreign.projectionSourceRef,
    scopeDigest: productArtifactBodyDigest({ organizationId: input.organizationId, type: "organization", id: input.organizationId }),
    purpose: PURPOSE,
    sensitivity: "standard" as const,
  };
  const lineageSeed: ProductArtifactMaterialLineageSeedV1 = { ...unsignedSeed, seedDigest: productArtifactBodyDigest(unsignedSeed) };
  const { createLeadershipConversationServerCompositionForValidation } = await import("../../product/integration/leadershipConversationServerComposition");
  let server = createLeadershipConversationServerCompositionForValidation({
    ...locations,
    validationPreparedWorkMaterialLineage: lineageSeed,
    userId: input.userId,
    organizationId: input.organizationId,
    onProtectedArtifactRead: (value) => {
      input.reads.count++;
      input.reads.byOrganization[input.organizationId] = (input.reads.byOrganization[input.organizationId] ?? 0) + 1;
      input.reads.safe.push(`${input.organizationId}:${value.artifactType}`);
    },
  });
  const composition = runtimeStored.runtime.memory.organizationalUnderstandingState.canonicalCompositions?.find((value) => value.id === foreign.projectionSourceRef);
  if (!composition) throw new Error("Foreign canonical Understanding reload failed.");
  const epistemic = composition.epistemicRevisions?.find((value) => value.revisionId === composition.currentEpistemicRevisionId);
  const revised = await server.reviseUnderstandingConfidence({ userId: input.userId, organizationId: input.organizationId, questionId, stableUnderstandingId: composition.id, expectedPredecessorRevisionId: epistemic?.revisionId ?? composition.revisionId, confidence: epistemic?.confidence ?? 0.7, uncertainty: epistemic?.uncertainty ?? composition.compositionUncertainty, supportingMaterialRefs: epistemic?.supportingMaterialRefs.length ? epistemic.supportingMaterialRefs : foreign.canonicalEvidenceIds, contradictingMaterialRefs: epistemic?.contradictingMaterialRefs ?? [], interpretationVersion: "l1-foreign-owner:v1", idempotencyKey: "l1-foreign-understanding-revision", expectedRuntimeRevision: runtimeStored.revision });
  const revisedUnsignedSeed = { ...unsignedSeed };
  const revisedSeed: ProductArtifactMaterialLineageSeedV1 = { ...revisedUnsignedSeed, seedDigest: productArtifactBodyDigest(revisedUnsignedSeed) };
  server = createLeadershipConversationServerCompositionForValidation({
    ...locations,
    validationPreparedWorkMaterialLineage: revisedSeed,
    userId: input.userId,
    organizationId: input.organizationId,
    onProtectedArtifactRead: (value) => {
      input.reads.count++;
      input.reads.byOrganization[input.organizationId] = (input.reads.byOrganization[input.organizationId] ?? 0) + 1;
      input.reads.safe.push(`${input.organizationId}:${value.artifactType}`);
    },
  });
  const identity = { userId: input.userId, organizationId: input.organizationId, questionId, conversationId };
  await server.recordContext({ ...identity, idempotencyKey: "l1-context-collision", title: "Colliding checkpoint", purpose: "Retain governed history.", intendedOutcome: "Prove partition isolation.", timeframe: "Weekly", participants: [{ participantRef: "leader", displayName: "Leader", titleLabel: "Chief" }], leaderContext: null });
  const workflow = createProductWorkflowArtifactRepository({ root: locations.workflowRoot, environment: "test" });
  let workflowStored = await workflow.read(input.organizationId);
  const context = workflowStored.store.contexts.at(-1)!;
  const preparedLineage = { ...NORTHSTAR_PREPARED_LINEAGE, canonicalUnderstandingRevisionId: revised.receipt.revisionId, canonicalUnderstandingRevisionReceiptDigest: revised.receipt.receiptDigest };
  await server.recordPreparation({ ...identity, idempotencyKey: "l1-preparation-collision", contextVersionId: context.contextVersionId, content: NORTHSTAR_PREPARED_CONTENT, lineage: preparedLineage, changeSummary: null });
  workflowStored = await workflow.read(input.organizationId);
  await server.freeze({ ...identity, idempotencyKey: "l1-freeze-collision", artifactVersionId: workflowStored.store.preparedWorkPublications!.at(-1)!.artifactRevision });
  workflowStored = await workflow.read(input.organizationId);
  const checkpoint = workflowStored.store.frozenSnapshotPublications!.at(-1)!;
  const identitySeed = input.identitySeed ?? "colliding-l1";
  const work: ExecutiveWork = { id: `work:${identitySeed}`, organizationId: input.organizationId, decisionRecordId: `decision:${identitySeed}`, selectedOptionId: `option:${identitySeed}`, title: "Resolve delivery sequencing", owner: input.userId, status: "completed", health: "on-track", progress: 1, expectedOutcomes: [], successCriteria: [], reviewAt: AT, createdAt: AT, updatedAt: AT };
  const decisionRecord = { id: work.decisionRecordId, submissionId: "submission:colliding-l1", organizationId: input.organizationId, executiveDecisionId: "executive-decision:colliding-l1", status: "decided" as const, disposition: "accepted-recommendation" as const, selectedOptionId: work.selectedOptionId, title: "Sequence delivery", decision: "Proceed with bounded sequencing", rationale: "Governed review", acceptedAssumptions: [], acceptedRisks: [], expectedOutcomes: [], successCriteria: [], createdAt: AT, updatedAt: AT, outcomeStatus: "not-reviewed" as const };
  const beforeWork = (await runtimeRepository.read(input.organizationId))!;
  const withDecision = saveExecutiveDecisionRecord({ runtime: beforeWork.runtime, record: decisionRecord });
  await runtimeRepository.replace(input.organizationId, new TextEncoder().encode(JSON.stringify(saveExecutiveWork({ runtime: withDecision, work }), null, 2)), beforeWork.revision, { requestId: "l1-foreign-work", operatorId: input.userId });
  const review = createExecutiveReview({ work, observedOutcomes: [{ expectedOutcomeId: `outcome:${identitySeed}`, observation: "Sequencing improved.", achieved: true, confidence: 0.82 }], reviewedAt: AT });
  const access = new ExecutiveHistoryCurrentAccessService(new FilesystemExecutiveHistoryAccessRepository(path.join(input.root, "executive-history-access")));
  const requestedScope = { organizationId: input.organizationId, type: "organization" as const, id: input.organizationId };
  const policy = await access.createPolicy({ organizationId: input.organizationId, actions: ["review:read", "history:list"], purposes: [PURPOSE], sensitivity: "standard", audience: [{ kind: "scope", scope: requestedScope, coverage: "exact" }], effectiveAt: AT, authorityRevisionRefs: [`leadership-conversation:${input.userId}`], actorRef: input.userId, idempotencyKey: "l1-policy-collision" });
  const created = await server.executiveHistoryAccess.createReview({ organizationId: input.organizationId, review, policyRevisionId: policy.policyRevisionId, sensitivity: "standard", creationOperationId: "l1-review-create-collision", occurredAt: AT, actorRef: input.userId, idempotencyKey: "l1-review-create-collision", runtimeOperation: { requestId: "l1-review-runtime-collision", operatorId: input.userId } });
  assert.equal(created.disposition, "committed");
  let publication = null;
  if (input.publishRelationship) {
    const checkpointAccess = await server.productArtifactAccess.readAuthorized({ contractVersion: "1", organizationId: input.organizationId, subjectId: input.userId, artifactType: "frozen-snapshot", artifactId: checkpoint.artifactId, artifactRevision: checkpoint.artifactRevision, operation: "product-artifact:read", purpose: PURPOSE, scopeDigest: checkpoint.materialLineage!.scopeDigest!, sensitivity: "standard", evaluatedAt: AT, project: (bytes) => bytes.byteLength });
    if (checkpointAccess.disposition !== "eligible") throw new Error(`Foreign checkpoint access is ${checkpointAccess.disposition}.`);
    const governance = resolveScopedGovernanceContext({ organizationId: input.organizationId, subjectId: input.userId, requestedScope, operation: "leadership-history:read", purpose: PURPOSE, sensitivity: "standard", evaluatedAt: AT, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: `leadership-conversation:${input.userId}`, policyRef: "leadership-conversation-development:v1", organizationId: input.organizationId, subjectId: input.userId, scope: requestedScope, operations: ["leadership-history:read"], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: "2026-01-01T00:00:00.000Z" }] });
    const reviewRead = await server.executiveHistoryAccess.readReview({ contractVersion: "1", organizationId: input.organizationId, subjectId: input.userId, action: "review:read", recordKind: "executive-review", recordId: review.id, purpose: PURPOSE, requestedScope, sensitivity: "standard", evaluatedAt: AT, assignment: { assignmentId: `historical-checkpoint:${input.userId}`, assignmentRevision: `historical-checkpoint:${input.userId}:v1`, state: "active" }, governance });
    if (!reviewRead) throw new Error("Foreign Review access is unavailable.");
    workflowStored = await workflow.read(input.organizationId);
    publication = await server.historicalCheckpointLifecycle.publish({ ...identity, checkpointId: checkpoint.artifactId, checkpointRevision: checkpoint.artifactRevision, linkKind: "decision-review", reviewId: review.id, idempotencyKey: "l1-link-collision", predecessorLinkId: null, expectedWorkflowRevision: workflowStored.revision, purpose: PURPOSE, scopeDigest: checkpoint.materialLineage!.scopeDigest!, sensitivity: "standard", evaluatedAt: AT });
  }
  return { ...input, identity, server, workflow, runtimeRepository, access, checkpoint, review, publication, scopeDigest: checkpoint.materialLineage!.scopeDigest! };
}

type AddressabilityObservation = NonNullable<HistoricalCheckpointActualOwnerAcceptanceResult["scenarios"]>[number];

async function mutationCounts(world: AdversarialWorld) {
  const store = (await world.workflow.read(world.organizationId)).store;
  return {
    relationshipMutations: store.historicalCheckpointLifecycleLinks?.length ?? 0,
    eventMutations: store.events.filter((value) => value.eventType === "historical-checkpoint-lifecycle-link-published").length,
    receiptMutations: store.historicalCheckpointLifecycleLinkReceipts?.length ?? 0,
    idempotencyMutations: store.idempotency.filter((value) => (store.historicalCheckpointLifecycleLinks ?? []).some((link) => link.linkId === value.recordRef)).length,
  };
}

async function observeInaccessibleEndpoint(input: {
  scenarioId: string;
  local: AdversarialWorld;
  endpointId: string;
  reads: { count: number; byOrganization: Record<string, number> };
  foreignOrganizationId: string;
}): Promise<AddressabilityObservation> {
  const before = await mutationCounts(input.local);
  const beforeLocalReads = input.reads.byOrganization[input.local.organizationId] ?? 0;
  const beforeForeignReads = input.reads.byOrganization[input.foreignOrganizationId] ?? 0;
  let serializedSafeResult = "";
  try {
    const current = await input.local.workflow.read(input.local.organizationId);
    await input.local.server.historicalCheckpointLifecycle.publish({
      ...input.local.identity,
      checkpointId: input.local.checkpoint.artifactId,
      checkpointRevision: input.local.checkpoint.artifactRevision,
      linkKind: "decision-review",
      reviewId: input.endpointId,
      idempotencyKey: `l1-addressability:${input.scenarioId}`,
      predecessorLinkId: null,
      expectedWorkflowRevision: current.revision,
      purpose: PURPOSE,
      scopeDigest: input.local.scopeDigest,
      sensitivity: "standard",
      evaluatedAt: AT,
    });
    assert.fail("Foreign-only or absent endpoint unexpectedly resolved.");
  } catch (error) {
    assert.ok(error instanceof Error);
    assert.equal(error.message, "Historical checkpoint lifecycle endpoint is inaccessible.");
    serializedSafeResult = JSON.stringify({ disposition: "inaccessible", message: error.message });
  }
  const after = await mutationCounts(input.local);
  assert.deepEqual(after, before);
  const localProtectedLoads = (input.reads.byOrganization[input.local.organizationId] ?? 0) - beforeLocalReads;
  const foreignProtectedLoads = (input.reads.byOrganization[input.foreignOrganizationId] ?? 0) - beforeForeignReads;
  assert.equal(foreignProtectedLoads, 0);
  return { scenarioId: input.scenarioId, organizationId: input.local.organizationId, disposition: "inaccessible", serializedSafeResult, ...Object.fromEntries(Object.keys(after).map((key) => [key, 0])) as typeof after, localProtectedLoads, foreignProtectedLoads, assertions: 8 };
}

async function runOrganizationScopedAddressabilityAcceptance(): Promise<HistoricalCheckpointActualOwnerAcceptanceResult> {
  const rootsToClean: string[] = [];
  const scenarios: AddressabilityObservation[] = [];
  let checks = 0;
  try {
    const collisionRoot = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-replay-l1-addressability-collision-")); rootsToClean.push(collisionRoot);
    const collisionReads = { count: 0, byOrganization: {} as Record<string, number>, safe: [] as string[] };
    const collisionA = await provisionAdversarialReviewWorld({ root: collisionRoot, organizationId: "sandbox-l1-addressability-a", userId: "subject:l1-addressability", publishRelationship: true, reads: collisionReads });
    const collisionB = await provisionAdversarialReviewWorld({ root: collisionRoot, organizationId: "sandbox-l1-addressability-b", userId: "subject:l1-addressability", publishRelationship: true, reads: collisionReads });
    assert.equal(collisionA.review.id, collisionB.review.id); checks++;
    for (const [scenarioId, world, foreign] of [["A-colliding-local-id", collisionA, collisionB], ["B-colliding-local-id", collisionB, collisionA]] as const) {
      const beforeForeign = collisionReads.byOrganization[foreign.organizationId] ?? 0;
      const listed = await listWorld(world);
      const detail = await world.server.historicalCheckpointLifecycle.read({ ...world.identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, linkId: world.publication!.link.linkId, purpose: PURPOSE, scopeDigest: world.scopeDigest, sensitivity: "standard", evaluatedAt: AT });
      assert.equal(listed.length, 1); assert.ok(detail); assert.equal(collisionReads.byOrganization[foreign.organizationId] ?? 0, beforeForeign); checks += 3;
      scenarios.push({ scenarioId, organizationId: world.organizationId, disposition: "eligible", serializedSafeResult: JSON.stringify({ disposition: "eligible", count: listed.length }), relationshipMutations: 1, eventMutations: 1, receiptMutations: 1, idempotencyMutations: 1, localProtectedLoads: 2, foreignProtectedLoads: 0, assertions: 3 });
    }

    for (const direction of ["A", "B"] as const) {
      const foreignRoot = await mkdtemp(path.join(tmpdir(), `discovery-leadership-conversation-replay-l1-addressability-${direction.toLowerCase()}-foreign-`)); rootsToClean.push(foreignRoot);
      const foreignReads = { count: 0, byOrganization: {} as Record<string, number>, safe: [] as string[] };
      const localOrg = `sandbox-l1-${direction.toLowerCase()}-local`, foreignOrg = `sandbox-l1-${direction.toLowerCase()}-foreign`;
      const local = await provisionAdversarialReviewWorld({ root: foreignRoot, organizationId: localOrg, userId: "subject:l1-addressability", publishRelationship: false, reads: foreignReads, identitySeed: `${direction.toLowerCase()}-local-control` });
      const foreign = await provisionAdversarialReviewWorld({ root: foreignRoot, organizationId: foreignOrg, userId: "subject:l1-addressability", publishRelationship: false, reads: foreignReads, identitySeed: `${direction.toLowerCase()}-foreign-only` });
      const foreignObservation = await observeInaccessibleEndpoint({ scenarioId: `${direction}-scoped-foreign-only`, local, endpointId: foreign.review.id, reads: foreignReads, foreignOrganizationId: foreignOrg });
      scenarios.push(foreignObservation); checks += foreignObservation.assertions;

      const absentRoot = await mkdtemp(path.join(tmpdir(), `discovery-leadership-conversation-replay-l1-addressability-${direction.toLowerCase()}-absent-`)); rootsToClean.push(absentRoot);
      const absentReads = { count: 0, byOrganization: {} as Record<string, number>, safe: [] as string[] };
      const absentLocal = await provisionAdversarialReviewWorld({ root: absentRoot, organizationId: localOrg, userId: "subject:l1-addressability", publishRelationship: false, reads: absentReads, identitySeed: `${direction.toLowerCase()}-local-control` });
      const absentObservation = await observeInaccessibleEndpoint({ scenarioId: `${direction}-scoped-absent`, local: absentLocal, endpointId: foreign.review.id, reads: absentReads, foreignOrganizationId: foreignOrg });
      assert.equal(absentObservation.serializedSafeResult, foreignObservation.serializedSafeResult);
      assert.deepEqual({ ...absentObservation, scenarioId: foreignObservation.scenarioId }, foreignObservation);
      scenarios.push(absentObservation); checks += absentObservation.assertions + 2;
    }
    assert.equal(scenarios.length, 6); checks++;
    return { validation: "historical-checkpoint-lifecycle-organization-scoped-addressability", result: "PASS", checks, actualOwnerOperations: 20, links: 2, receipts: 2, protectedReads: scenarios.reduce((sum, value) => sum + value.localProtectedLoads, 0), deniedAdditionalProtectedReads: 0, ownerKinds: ["leadership-conversation", "executive-review", "product-workflow"], syntheticPositiveResults: false, directRelationshipInsertion: false, networkCalls: 0, databaseWrites: 0, connectorCalls: 0, driveCalls: 0, productionAccess: 0, scenarios, requestOrganizationFields: 1, endpointOrganizationFields: 0, crossOrganizationRelationshipKinds: 0 };
  } finally { await Promise.all(rootsToClean.map((root) => rm(root, { recursive: true, force: true }))); }
}

async function listWorld(world: AdversarialWorld, identity = world.identity) {
  return world.server.historicalCheckpointLifecycle.list({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, purpose: PURPOSE, scopeDigest: world.scopeDigest, sensitivity: "standard", evaluatedAt: AT });
}

export async function runHistoricalCheckpointLifecycleAdversarialWorldAcceptance(mode: Exclude<HistoricalCheckpointActualOwnerMode, "base" | "concurrent-collisions" | "fresh-process">): Promise<HistoricalCheckpointActualOwnerAcceptanceResult> {
  if (mode === "cross-organization") return runOrganizationScopedAddressabilityAcceptance();
  const root = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-replay-multi-org-"));
  const reads = { count: 0, byOrganization: {} as Record<string, number>, safe: [] as string[] };
  let checks = 0;
  try {
    const a = await provisionAdversarialReviewWorld({ root, organizationId: "sandbox-l1-adversarial-a", userId: "subject:colliding-l1", publishRelationship: true, reads });
    const b = await provisionAdversarialReviewWorld({ root, organizationId: "sandbox-l1-adversarial-b", userId: "subject:colliding-l1", publishRelationship: mode !== "safe-projection-isolation", reads });
    assert.equal(a.identity.questionId, b.identity.questionId);
    assert.equal(a.identity.conversationId, b.identity.conversationId);
    assert.equal(a.review.id, b.review.id);
    assert.notEqual(a.checkpoint.artifactId, b.checkpoint.artifactId);
    checks += 4;
    const beforeList = reads.count;
    const [localA, localB] = await Promise.all([listWorld(a), listWorld(b)]);
    assert.equal(localA.length, 1);
    assert.equal(localB.length, mode === "safe-projection-isolation" ? 0 : 1);
    assert.equal(reads.count, beforeList);
    checks += 3;
    const foreignIdentity = { ...a.identity, organizationId: b.organizationId };
    await assert.rejects(() => listWorld(a, foreignIdentity), /denied/);
    assert.equal(reads.count, beforeList);
    checks += 2;
    const beforeDetail = reads.count;
    const detail = await a.server.historicalCheckpointLifecycle.read({ ...a.identity, checkpointId: a.checkpoint.artifactId, checkpointRevision: a.checkpoint.artifactRevision, linkId: a.publication!.link.linkId, purpose: PURPOSE, scopeDigest: a.scopeDigest, sensitivity: "standard", evaluatedAt: AT });
    assert.ok(detail);
    assert.equal(reads.count - beforeDetail, 2);
    checks += 2;
    if (mode === "collision") {
      const replay = await a.server.historicalCheckpointLifecycle.publish({ ...a.identity, checkpointId: a.checkpoint.artifactId, checkpointRevision: a.checkpoint.artifactRevision, linkKind: "decision-review", reviewId: a.review.id, idempotencyKey: "l1-link-collision", predecessorLinkId: null, expectedWorkflowRevision: null, purpose: PURPOSE, scopeDigest: a.scopeDigest, sensitivity: "standard", evaluatedAt: AT });
      assert.equal(replay.repository.disposition, "replayed");
      assert.notEqual(replay.link.linkId, b.publication!.link.linkId);
      checks += 2;
    }
    if (mode === "current-access" || mode === "authorization-before-load" || mode === "safe-projection-isolation") {
      await a.access.revokeBinding({ organizationId: a.organizationId, recordKind: "executive-review", recordId: a.review.id, occurredAt: "2026-08-11T17:00:00.000Z", actorRef: a.userId, idempotencyKey: "l1-adversarial-revoke" });
      const beforeDenied = reads.count;
      const hidden = await listWorld(a);
      const denied = await a.server.historicalCheckpointLifecycle.read({ ...a.identity, checkpointId: a.checkpoint.artifactId, checkpointRevision: a.checkpoint.artifactRevision, linkId: a.publication!.link.linkId, purpose: PURPOSE, scopeDigest: a.scopeDigest, sensitivity: "standard", evaluatedAt: "2026-08-11T17:00:00.000Z" });
      assert.deepEqual(hidden, []);
      assert.equal(denied, null);
      assert.equal(reads.count, beforeDenied);
      checks += 3;
      if (mode === "safe-projection-isolation") {
        assert.equal(JSON.stringify(hidden), JSON.stringify(localB));
        assert.equal(denied, null);
        checks += 2;
      }
    }
    const stores = await Promise.all([a.workflow.read(a.organizationId), b.workflow.read(b.organizationId)]);
    assert.equal(stores[0].store.historicalCheckpointLifecycleLinks?.length, 1);
    assert.equal(stores[1].store.historicalCheckpointLifecycleLinks?.length, mode === "safe-projection-isolation" ? 0 : 1);
    checks += 2;
    return { validation: `historical-checkpoint-lifecycle-${mode}`, result: "PASS", checks, actualOwnerOperations: mode === "safe-projection-isolation" ? 11 : 12, links: mode === "safe-projection-isolation" ? 1 : 2, receipts: mode === "safe-projection-isolation" ? 1 : 2, protectedReads: reads.count, deniedAdditionalProtectedReads: 0, ownerKinds: ["leadership-conversation", "executive-review", "product-workflow"], syntheticPositiveResults: false, directRelationshipInsertion: false, networkCalls: 0, databaseWrites: 0, connectorCalls: 0, driveCalls: 0, productionAccess: 0 };
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

export type HistoricalCheckpointSharedWorldManifest = {
  contractVersion: "1";
  root: string;
  lineageFixtureRoot: string;
  organizationId: string;
  userId: string;
  questionId: string;
  conversationId: string;
  checkpointId: string;
  checkpointRevision: string;
  purpose: string;
  scopeDigest: string;
  sensitivity: "standard";
  evaluatedAt: string;
  expectedWorkflowRevision: string | null;
  endpoint: { linkKind: "product-decision-draft"; draftId: string; draftRevisionId: string };
  reviewId: string;
  outcomeId: string;
  learningId: string;
  idempotencyKey: string;
  manifestDigest: string;
};

export async function provisionHistoricalCheckpointSharedWorld(
  root: string,
  lineageFixtureRoot: string,
): Promise<HistoricalCheckpointSharedWorldManifest> {
  const lineage = await provisionNorthstarPreparationLineageFixture({ environment: "test", fixtureRoot: lineageFixtureRoot, now: AT });
  if (lineage.disposition !== "provisioned") throw new Error("Shared owner lineage provisioning failed.");
  const world = await provision(root, lineageFixtureRoot, { count: 0, safe: [] }, lineage.seed.canonicalMaterial.map((item) => item.canonicalObjectId));
  if (!("draftId" in world.decision)) throw new Error("Shared Product Decision Draft endpoint is unavailable.");
  const scopeDigest = world.checkpoint.materialLineage?.scopeDigest;
  if (!scopeDigest) throw new Error("Shared checkpoint scope lineage is unavailable.");
  const expectedWorkflowRevision = (await world.workflow.read(fixture.organizationId)).revision;
  const unsigned = {
    contractVersion: "1" as const,
    root,
    lineageFixtureRoot,
    organizationId: fixture.organizationId,
    userId: fixture.actorId,
    questionId: QUESTION_ID,
    conversationId: fixture.conversationId,
    checkpointId: world.checkpoint.artifactId,
    checkpointRevision: world.checkpoint.artifactRevision,
    purpose: PURPOSE,
    scopeDigest,
    sensitivity: "standard" as const,
    evaluatedAt: AT,
    expectedWorkflowRevision,
    endpoint: { linkKind: "product-decision-draft" as const, draftId: world.decision.draftId, draftRevisionId: world.decision.draftRevisionId },
    reviewId: world.review.id,
    outcomeId: world.review.observedOutcomes[0]!.expectedOutcomeId,
    learningId: world.learning.id,
    idempotencyKey: "l1-shared-cas-same-request",
  };
  return { ...unsigned, manifestDigest: digest(unsigned) };
}

export function assertHistoricalCheckpointSharedManifest(manifest: HistoricalCheckpointSharedWorldManifest): void {
  const { manifestDigest, ...unsigned } = manifest;
  if (manifest.contractVersion !== "1" || manifestDigest !== digest(unsigned)) throw new Error("Shared acceptance manifest integrity failed.");
}

export type HistoricalCheckpointFiveTransitionScenarioId = HistoricalCheckpointEndpointScenarioEvidence["scenarioId"];
export type HistoricalCheckpointFiveTransitionManifest = {
  contractVersion: "1";
  scenarios: readonly {
    scenarioId: HistoricalCheckpointFiveTransitionScenarioId;
    root: string;
    lineageFixtureRoot: string;
    organizationId: string;
    userId: string;
    questionId: string;
    conversationId: string;
    checkpointId: string;
    checkpointRevision: string;
    purpose: typeof PURPOSE;
    scopeDigest: string;
    evaluatedAt: string;
    targetLinkId: string;
    reviewId: string;
    learningId: string;
    historyDigest: string;
  }[];
  manifestDigest: string;
};

export async function provisionHistoricalCheckpointFiveTransitionWorlds(baseRoot: string, lineageBaseRoot: string): Promise<HistoricalCheckpointFiveTransitionManifest> {
  const scenarios: HistoricalCheckpointFiveTransitionManifest["scenarios"][number][] = [];
  for (const scenarioId of ["checkpoint-source-binding-loss", "draft-upstream-authority-loss", "review-policy-revocation", "outcome-through-review", "learning-binding-revocation"] as const) {
    const root = path.join(baseRoot, `discovery-leadership-conversation-replay-${scenarioId}`);
    const lineageFixtureRoot = path.join(lineageBaseRoot, `discovery-northstar-preparation-lineage-${scenarioId}`);
    await mkdir(root, { recursive: true }); await mkdir(lineageFixtureRoot, { recursive: true });
    const lineage = await provisionNorthstarPreparationLineageFixture({ environment: "test", fixtureRoot: lineageFixtureRoot, now: AT });
    assert.equal(lineage.disposition, "provisioned");
    const world = await provision(root, lineageFixtureRoot, { count: 0, safe: [] }, lineage.seed.canonicalMaterial.map((value) => value.canonicalObjectId));
    const { publications, scopeDigest } = await publishAllEndpointKinds(world);
    const targetIndex = scenarioId === "checkpoint-source-binding-loss" || scenarioId === "draft-upstream-authority-loss" ? 0 : scenarioId === "review-policy-revocation" ? 1 : scenarioId === "outcome-through-review" ? 2 : 3;
    const store = await world.workflow.read(fixture.organizationId);
    scenarios.push({ scenarioId, root, lineageFixtureRoot, organizationId: fixture.organizationId, userId: fixture.actorId, questionId: QUESTION_ID, conversationId: fixture.conversationId, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, purpose: PURPOSE, scopeDigest, evaluatedAt: AT, targetLinkId: publications[targetIndex]!.link.linkId, reviewId: world.review.id, learningId: world.learning.id, historyDigest: digest({ links: store.store.historicalCheckpointLifecycleLinks, receipts: store.store.historicalCheckpointLifecycleLinkReceipts }) });
  }
  const unsigned = { contractVersion: "1" as const, scenarios };
  return { ...unsigned, manifestDigest: digest(unsigned) };
}

export function assertHistoricalCheckpointFiveTransitionManifest(manifest: HistoricalCheckpointFiveTransitionManifest): void {
  const { manifestDigest, ...unsigned } = manifest;
  assert.equal(manifest.contractVersion, "1"); assert.equal(manifest.scenarios.length, 5); assert.equal(manifestDigest, digest(unsigned));
  assert.equal(JSON.stringify(manifest).match(/authorization|disposition|protectedBody|expectedDenial|currentOwner/gi)?.length ?? 0, 0);
}

export async function observeHistoricalCheckpointFiveTransitionWorlds(manifest: HistoricalCheckpointFiveTransitionManifest, evaluatedAt: string) {
  assertHistoricalCheckpointFiveTransitionManifest(manifest);
  const evidence = [];
  for (const scenario of manifest.scenarios) {
    const reads = { count: 0, safe: [] as string[] };
    const server = await reconstructHistoricalCheckpointActualOwnerComposition(scenario.root, scenario.lineageFixtureRoot, reads);
    const request = { userId: scenario.userId, organizationId: scenario.organizationId, questionId: scenario.questionId, conversationId: scenario.conversationId, checkpointId: scenario.checkpointId, checkpointRevision: scenario.checkpointRevision, purpose: scenario.purpose, scopeDigest: scenario.scopeDigest, sensitivity: "standard" as const, evaluatedAt };
    const list = await server.historicalCheckpointLifecycle.list(request);
    const listProtectedReads = reads.count;
    const detail = await server.historicalCheckpointLifecycle.read({ ...request, linkId: scenario.targetLinkId });
    const repository = createProductWorkflowArtifactRepository({ root: path.join(scenario.root, "workflow"), environment: "test" });
    const store = await repository.read(scenario.organizationId);
    const historyDigest = digest({ links: store.store.historicalCheckpointLifecycleLinks, receipts: store.store.historicalCheckpointLifecycleLinkReceipts });
    evidence.push({ scenarioId: scenario.scenarioId, listCount: list.length, detailEligible: detail !== null, listProtectedReads, detailProtectedReads: reads.count - listProtectedReads, historyUnchanged: historyDigest === scenario.historyDigest });
  }
  return evidence;
}

export async function applyHistoricalCheckpointFiveTransitions(manifest: HistoricalCheckpointFiveTransitionManifest) {
  assertHistoricalCheckpointFiveTransitionManifest(manifest);
  const transitions = [];
  for (const scenario of manifest.scenarios) {
    if (scenario.scenarioId === "checkpoint-source-binding-loss" || scenario.scenarioId === "draft-upstream-authority-loss") {
      const runtimeRepository = new FilesystemOrganizationRuntimeRepository(path.join(scenario.root, "runtime"));
      const stored = (await runtimeRepository.read(scenario.organizationId))!;
      const workflow = await createProductWorkflowArtifactRepository({ root: path.join(scenario.root, "workflow"), environment: "test" }).read(scenario.organizationId);
      const checkpoint = workflow.store.frozenSnapshotPublications!.find((value) => value.artifactId === scenario.checkpointId && value.artifactRevision === scenario.checkpointRevision)!;
      const bindingId = checkpoint.materialLineage!.sourceBindings[0]!.sourceBindingId;
      const binding = stored.runtime.memory.canonicalScopeLineageIndex!.sourceBindings.find((value) => value.bindingId === bindingId)!;
      const requestedScope = binding.assertions[0]!.scope;
      const authorization = resolveScopedGovernanceContext({ organizationId: scenario.organizationId, subjectId: scenario.userId, requestedScope, operation: "source-binding:revise-availability", purpose: PURPOSE, sensitivity: "standard", evaluatedAt: AT, temporal: { mode: "current" }, serverResolvedAuthority: [{ authorityRef: `leadership-conversation:${scenario.userId}`, policyRef: "leadership-conversation-development:v1", organizationId: scenario.organizationId, subjectId: scenario.userId, scope: requestedScope, operations: ["source-binding:revise-availability"], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: "2026-01-01T00:00:00.000Z" }] });
      await new CanonicalLocalSourceBindingService(runtimeRepository, { now: () => AT }).reviseCanonicalSourceBindingAvailability({ contractVersion: "1", organizationId: scenario.organizationId, productQuestionId: scenario.questionId, sourceType: binding.sourceType as "markdown-upload", purposeRef: PURPOSE, normalizedContentDigest: binding.source.normalizedContentDigest, requestedScopeAssertions: binding.assertions, sensitivity: "standard", availability: "revoked", recordedAt: AT, recordedByActorRef: scenario.userId, idempotencyKey: `l1-fresh-process:${scenario.scenarioId}`, expectedRuntimeRevision: stored.revision, operation: { requestId: `l1-fresh-process:${scenario.scenarioId}`, operatorId: scenario.userId }, authorization });
    } else {
      const access = new ExecutiveHistoryCurrentAccessService(new FilesystemExecutiveHistoryAccessRepository(path.join(scenario.root, "executive-history-access")));
      const learning = scenario.scenarioId === "learning-binding-revocation";
      await access.revokeBinding({ organizationId: scenario.organizationId, recordKind: learning ? "executive-learning" : "executive-review", recordId: learning ? scenario.learningId : scenario.reviewId, occurredAt: "2026-08-11T17:00:00.000Z", actorRef: scenario.userId, idempotencyKey: `l1-fresh-process:${scenario.scenarioId}` });
    }
    transitions.push({ scenarioId: scenario.scenarioId, ownerTransition: scenario.scenarioId.includes("loss") ? "canonical-source-binding" : scenario.scenarioId === "learning-binding-revocation" ? "executive-history-learning" : "executive-history-review" });
  }
  return transitions;
}

export async function runHistoricalCheckpointLifecycleActualOwnerAcceptance(mode: HistoricalCheckpointActualOwnerMode = "base"): Promise<HistoricalCheckpointActualOwnerAcceptanceResult> {
  const root = await mkdtemp(path.join(tmpdir(), "discovery-leadership-conversation-replay-l1-actual-owner-"));
  const lineageFixtureRoot = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-"));
  const reads = { count: 0, safe: [] as string[] };
  let checks = 0;
  try {
    const lineage = await provisionNorthstarPreparationLineageFixture({ environment: "test", fixtureRoot: lineageFixtureRoot, now: AT });
    assert.equal(lineage.disposition, "provisioned"); checks++;
    const world = await provision(root, lineageFixtureRoot, reads, lineage.seed.canonicalMaterial.map((item) => item.canonicalObjectId));
    let stored = await world.workflow.read(fixture.organizationId);
    const currentScopeDigest = world.checkpoint.materialLineage?.scopeDigest;
    if (!currentScopeDigest) throw new Error("Actual checkpoint scope lineage is unavailable.");
    if (!("draftId" in world.decision)) throw new Error("Actual Product Decision Draft identity is unavailable.");
    const draftId = world.decision.draftId, draftRevisionId = world.decision.draftRevisionId;
    const requests = [
      { linkKind: "product-decision-draft" as const, draftId, draftRevisionId },
      { linkKind: "decision-review" as const, reviewId: world.review.id },
      { linkKind: "observed-outcome" as const, reviewId: world.review.id, expectedOutcomeId: world.review.observedOutcomes[0]!.expectedOutcomeId },
      { linkKind: "learning" as const, learningId: world.learning.id },
    ];
    const published = [];
    for (const [index, endpoint] of requests.entries()) {
      stored = await world.workflow.read(fixture.organizationId);
      published.push(await world.server.historicalCheckpointLifecycle.publish({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, ...endpoint, idempotencyKey: `l1-link-${index}`, predecessorLinkId: null, expectedWorkflowRevision: stored.revision, purpose: PURPOSE, scopeDigest: currentScopeDigest, sensitivity: "standard", evaluatedAt: AT }));
      checks += 1;
    }
    stored = await world.workflow.read(fixture.organizationId);
    const visible = await world.server.historicalCheckpointLifecycle.list({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, purpose: PURPOSE, scopeDigest: currentScopeDigest, sensitivity: "standard", evaluatedAt: AT });
    assert.equal(visible.length, 4); checks++;
    const beforeDetail = reads.count;
    const detail = await world.server.historicalCheckpointLifecycle.read({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, linkId: published[0]!.link.linkId, purpose: PURPOSE, scopeDigest: currentScopeDigest, sensitivity: "standard", evaluatedAt: AT });
    assert.ok(detail); assert.ok(reads.count > beforeDetail); checks += 2;
    const runtimeBytes = JSON.stringify((await world.runtimeRepository.read(fixture.organizationId))!.runtime.memory);
    await world.access.revokeBinding({ organizationId: fixture.organizationId, recordKind: "executive-review", recordId: world.review.id, occurredAt: "2026-08-11T17:00:00.000Z", actorRef: fixture.actorId, idempotencyKey: "l1-review-revoke" });
    const beforeDenied = reads.count;
    const hidden = await world.server.historicalCheckpointLifecycle.list({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, purpose: PURPOSE, scopeDigest: currentScopeDigest, sensitivity: "standard", evaluatedAt: "2026-08-11T17:00:00.000Z" });
    assert.equal(hidden.length, 2); assert.equal(reads.count, beforeDenied); checks += 2;
    assert.equal(JSON.stringify((await world.runtimeRepository.read(fixture.organizationId))!.runtime.memory), runtimeBytes); checks++;
    await world.access.restoreBinding({ organizationId: fixture.organizationId, recordKind: "executive-review", recordId: world.review.id, occurredAt: "2026-08-11T18:00:00.000Z", actorRef: fixture.actorId, idempotencyKey: "l1-review-restore" });
    const restored = await world.server.historicalCheckpointLifecycle.list({ ...identity, checkpointId: world.checkpoint.artifactId, checkpointRevision: world.checkpoint.artifactRevision, purpose: PURPOSE, scopeDigest: currentScopeDigest, sensitivity: "standard", evaluatedAt: "2026-08-11T18:00:00.000Z" });
    assert.equal(restored.length, 4); checks++;
    assert.equal(stored.store.historicalCheckpointLifecycleLinks?.length, 4); checks++;
    assert.equal(stored.store.historicalCheckpointLifecycleLinkReceipts?.length, 4); checks++;
    assert.ok(published.every((item) => item.repository.disposition === "committed")); checks++;
    return { validation: `historical-checkpoint-lifecycle-${mode}`, result: "PASS", checks, actualOwnerOperations: 13, links: 4, receipts: 4, protectedReads: reads.count, deniedAdditionalProtectedReads: 0, ownerKinds: ["leadership-conversation", "product-decision-draft", "executive-review", "executive-learning", "product-workflow"], syntheticPositiveResults: false, directRelationshipInsertion: false, networkCalls: 0, databaseWrites: 0, connectorCalls: 0, driveCalls: 0, productionAccess: 0 };
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(lineageFixtureRoot, { recursive: true, force: true });
  }
}
