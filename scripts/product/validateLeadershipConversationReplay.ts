import assert from "node:assert/strict";
import { execFile, fork } from "node:child_process";
import {
  createHash,
  createPublicKey,
  generateKeyPairSync,
  randomBytes,
  sign,
  verify,
  type KeyObject,
} from "node:crypto";
import { constants } from "node:fs";
import {
  cp,
  lstat,
  mkdtemp,
  open,
  readFile,
  readdir,
  realpath,
  rm,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";

import {
  createCanonicalScopeLineageIndex,
  createCanonicalScopeTopology,
} from "../../engine/v3/governance/canonicalScopeLineage";
import { resolveScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import type { ScopedAuthorityGrant } from "../../engine/v3/governance/scopedGovernanceContext";
import {
  CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION,
  CANONICAL_UNDERSTANDING_REVISION_OPERATION,
} from "../../engine/v3/understanding/canonicalOrganizationalUnderstandingRevisionService";
import {
  appendProductQuestionEvent,
  createDurableProductQuestion,
} from "../../product/questions/questionLifecycle";
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
  ProductWorkflowIncompatibleIdempotencyReplayError,
  resolveCurrentOccurrenceCheckpointIdentityV1,
  resolveCurrentOccurrenceClosureMetadataV1,
} from "../../product/workflow/leadershipConversation";
import {
  provisionNorthstarPreparationLineageFixture,
  readNorthstarPreparationLineageSeed,
} from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { SANDBOX_ORGANIZATION_ID } from "../../product/simulations/living-organization-sandbox/manifest";
import { AlphaContentSafeObservabilityOwner } from "../../lib/observability/alphaContentSafeObservabilityOwner";
import type { AlphaContentSafeObservabilityEventV1 } from "../../lib/observability/alphaContentSafeObservabilityContracts";
import type { AcceptanceProfileRequirementsV1 } from "../acceptance/authenticatedAlphaAcceptanceContracts";
import {
  acceptanceTaskManifestDigest,
  createAcceptanceTaskManifest,
  createTaskSecret,
  writeProtectedManifest,
} from "../acceptance/authenticatedAlphaAcceptanceTaskManifest";
import { validateAuthenticatedAlphaTaskOwnershipV1 } from "../acceptance/validateAr3CurrentBuildConformance";
import { ar5bAuthenticatedRecoveryConformanceProfile } from "../acceptance/ar5bAuthenticatedRecoveryConformanceProfile";

type ReplayTaskAuthorityInputV1 = Readonly<{
  schemaVersion: "1";
  root: string;
  manifestPath: string;
  secretPath: string;
  joinedResultPath: string;
  sourceDigest: string;
  taskDigest: string;
  runDigest: string;
  framework: Readonly<{ id: "authenticated-alpha-acceptance"; version: "1" }>;
  profile: AcceptanceProfileRequirementsV1;
}>;
type ReplayExecutionAuthorityV1 = Readonly<{
  input: ReplayTaskAuthorityInputV1;
  taskAuthorityDigest: string;
  resourcePlanDigest: string;
  delegationPrivateKey: KeyObject;
  delegationPublicKey: string;
}>;
let activeReplayAuthority: ReplayExecutionAuthorityV1 | undefined;
let activeExecutionSegmentDigests: string[] = [];
const runFile = promisify(execFile);
const standaloneHistoricalCapability = Symbol(
  "standalone-historical-replay-validation",
);
let activeStandaloneCapability: symbol | undefined;
let questionId: string;
const scope = {
  organizationId: fixture.organizationId,
  type: "organization" as const,
  id: fixture.organizationId,
};
const digest = (value: unknown) =>
  leadershipDigest(leadershipStableSerialize(value));
const handoff = <T extends object>(value: T) => ({
  ...value,
  handoffDigest: digest(value),
});
const roots = (root: string) => ({
  runtimeRoot: path.join(root, "runtime"),
  workflowRoot: path.join(root, "workflow"),
  sourceContentRoot: path.join(root, "content"),
});
let identity: {
  userId: string;
  organizationId: string;
  questionId: string;
  conversationId: string;
};
const observedEvents: AlphaContentSafeObservabilityEventV1[] = [];
let activeObserver: AlphaContentSafeObservabilityOwner | undefined;
function bindOwnerIssuedQuestion(value: string) {
  questionId = value;
  identity = {
    userId: fixture.actorId,
    organizationId: fixture.organizationId,
    questionId,
    conversationId: fixture.conversationId,
  };
}

async function validationComposition(
  locations: ReturnType<typeof roots>,
  lineageFixtureRoot?: string,
  authorityGrants?: readonly ScopedAuthorityGrant[],
) {
  const { createLeadershipConversationServerCompositionForValidation } =
    await import(
      "../../product/integration/leadershipConversationServerComposition"
    );
  const mode = process.env.AR3_OBSERVER_MODE,
    observer =
      mode === "disabled"
        ? new AlphaContentSafeObservabilityOwner()
        : mode === "throwing"
          ? new AlphaContentSafeObservabilityOwner({
              emit() {
                throw new Error("contained observer failure");
              },
            })
          : mode === "rejecting" || mode === "malformed"
            ? { observe: async () => "rejected" as const }
            : new AlphaContentSafeObservabilityOwner({
                emit: (event) => {
                  observedEvents.push(event);
                },
              });
  activeObserver =
    observer instanceof AlphaContentSafeObservabilityOwner
      ? observer
      : undefined;
  return createLeadershipConversationServerCompositionForValidation({
    ...locations,
    lineageFixtureRoot,
    userId: fixture.actorId,
    organizationId: fixture.organizationId,
    observer,
    authorityGrants,
  });
}

type SafeHandoff = Record<string, unknown> & { handoffDigest: string };
type WorkerResult = {
  role: string;
  handoff: SafeHandoff;
  assertions: string[];
  observations?: AlphaContentSafeObservabilityEventV1[];
};

function parseHandoff(value: string): SafeHandoff {
  const parsed = JSON.parse(
    Buffer.from(value, "base64url").toString("utf8"),
  ) as SafeHandoff;
  const { handoffDigest, ...unsigned } = parsed;
  assert.equal(handoffDigest, digest(unsigned), "handoff digest mismatch");
  return parsed;
}

async function processA(
  root: string,
  lineageFixtureRoot?: string,
): Promise<WorkerResult> {
  const locations = roots(root);
  const runtimeRepository = new FilesystemOrganizationRuntimeRepository(
    locations.runtimeRoot,
  );
  assert.ok(lineageFixtureRoot);
  const provisionedRuntime = await runtimeRepository.read(fixture.organizationId);
  assert.ok(provisionedRuntime);
  assert.ok(provisionedRuntime.runtime.memory.events.some((event) => Boolean(event && typeof event === "object" && "questionId" in event && (event as { questionId?: unknown }).questionId === questionId)));
  const composition = await validationComposition(
    locations,
    lineageFixtureRoot,
  );
  await composition.recordContext({
    ...identity,
    idempotencyKey: "process-a-context",
    title: "Northstar staff conversation",
    purpose: "Resolve the next delivery constraint.",
    intendedOutcome: "Agree one bounded owner action.",
    timeframe: "Weekly",
    participants: [
      {
        participantRef: `participant:${fixture.actorId}`,
        displayName: "Leader",
        titleLabel: "Director",
      },
    ],
    leaderContext: null,
  });
  const workflow = createProductWorkflowArtifactRepository({
    root: locations.workflowRoot,
    environment: "test",
  });
  let stored = await workflow.read(fixture.organizationId);
  const context = stored.store.contexts.at(-1)!;
  await composition.recordPreparation({
    ...identity,
    idempotencyKey: "process-a-preparation-1",
    contextVersionId: context.contextVersionId,
    content: NORTHSTAR_PREPARED_CONTENT,
    lineage: NORTHSTAR_PREPARED_LINEAGE,
    changeSummary: null,
  });
  stored = await workflow.read(fixture.organizationId);
  await composition.recordPreparation({
    ...identity,
    idempotencyKey: "process-a-preparation-2",
    contextVersionId: context.contextVersionId,
    content: {
      ...NORTHSTAR_PREPARED_CONTENT,
      headline: "Resolve sequencing ownership before the next delivery window.",
    },
    lineage: NORTHSTAR_PREPARED_LINEAGE,
    changeSummary: "Leader clarified sequencing ownership.",
  });
  stored = await workflow.read(fixture.organizationId);
  const prepared = stored.store.preparedWorkPublications!.at(-1)!;
  await composition.freeze({
    ...identity,
    idempotencyKey: "process-a-freeze",
    artifactVersionId: prepared.artifactRevision,
    privateWorkingContribution: {
      seriesId: `leadership-conversation-series:${fixture.conversationId}`,
      occurrenceId: fixture.conversationId,
      authorizationRevision:
        NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionRevision,
      provenanceDigest: NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionDigest,
      selectedContent: [],
    },
  });
  stored = await workflow.read(fixture.organizationId);
  const frozen = stored.store.frozenSnapshotPublications!.at(-1)!;
  const occurrence = await workflow.readOccurrence!({
      ...identity,
      seriesId: `leadership-conversation-series:${fixture.conversationId}`,
    }),
    checkpoint = resolveCurrentOccurrenceCheckpointIdentityV1({
      store: occurrence.store,
      organizationId: identity.organizationId,
      questionId: identity.questionId,
      conversationId: identity.conversationId,
    });
  assert.equal(checkpoint.checkpointId, frozen.artifactId);
  assert.equal(checkpoint.contributionArtifactIds.length, 0);
  assert.equal(
    occurrence.store.publicationReceipts?.filter(
      (value) => value.receiptKind === "frozen-checkpoint-publication",
    ).length,
    1,
  );
  assert.equal(stored.store.preparedWorkProducts.length, 0);
  assert.equal(stored.store.frozenSnapshots.length, 0);
  const manifest = handoff({
    organizationId: fixture.organizationId,
    questionId: questionId,
    conversationId: fixture.conversationId,
    contextVersionId: context.contextVersionId,
    preparedWorkProductVersionId: prepared.artifactRevision,
    frozenSnapshotId: frozen.artifactId,
    frozenSnapshotDigest: frozen.snapshotDigest,
    productWorkflowRepositoryRevision: stored.revision,
    eventCount: stored.store.events.length,
  });
  return {
    role: "prepare-and-freeze",
    handoff: manifest,
    assertions: [
      "context-persisted",
      "preparation-v1-persisted",
      "preparation-v2-persisted",
      "explicit-empty-frozen-snapshot-persisted",
      "explicit-empty-occurrence-slice-proof-reconstructed",
    ],
  };
}

async function processB(root: string, lineageFixtureRoot: string, encodedA: string): Promise<WorkerResult> {
  const a = parseHandoff(encodedA);
  const locations = roots(root);
  const workflow = createProductWorkflowArtifactRepository({
    root: locations.workflowRoot,
    environment: "test",
  });
  const foreignOrganizationId = "ar5b-joined-inventory-foreign";
  const foreignRuntimeRepository = new FilesystemOrganizationRuntimeRepository(
    locations.runtimeRoot,
  );
  let foreignRuntime = await foreignRuntimeRepository.read(
    foreignOrganizationId,
  );
  if (!foreignRuntime) {
    const foreignBytes = new TextEncoder().encode(
      JSON.stringify(
        createEmptyOrganizationRuntime({
          organizationId: foreignOrganizationId,
          name: "Foreign preservation control",
          now: fixture.at,
        }),
      ),
    );
    foreignRuntime = await foreignRuntimeRepository.create(
      foreignOrganizationId,
      foreignBytes,
      {
        requestId: "foreign-preservation-seed",
        operatorId: "replay-validator",
      },
    );
  }
  const foreignWorkflowInitial = await workflow.read(foreignOrganizationId);
  const foreignWorkflow =
    foreignWorkflowInitial.revision === null
      ? await workflow.replace(
          foreignOrganizationId,
          foreignWorkflowInitial.store,
          null,
        )
      : foreignWorkflowInitial;
  const foreignRuntimeBeforeDigest = digest(foreignRuntime.bytes);
  const foreignWorkflowBeforeDigest = digest(
    leadershipStableSerialize(foreignWorkflow.store),
  );
  let stored = await workflow.read(fixture.organizationId);
  assert.equal(stored.revision, a.productWorkflowRepositoryRevision);
  assert.equal(
    stored.store.frozenSnapshotPublications!.at(-1)?.artifactId,
    a.frozenSnapshotId,
  );
  assert.equal(
    stored.store.frozenSnapshotPublications!.at(-1)?.snapshotDigest,
    a.frozenSnapshotDigest,
  );
  const composition = await validationComposition(locations, lineageFixtureRoot);
  await composition.readFrozenPrivateWorkingContribution({
    ...identity,
    snapshotId: String(a.frozenSnapshotId),
    artifactIds:
      stored.store
        .frozenSnapshotPublications!.at(-1)
        ?.privateWorkingContributionRefs?.map((value) => value.artifactId) ??
      [],
  });
  await composition.captureFrozenPrivateWorkingContribution({
    ...identity,
    idempotencyKey: "process-b-capture-contribution",
    snapshotId: String(a.frozenSnapshotId),
  });
  await composition.receiveUpload({
    ...identity,
    idempotencyKey: "process-b-upload",
    frozenSnapshotId: String(a.frozenSnapshotId),
    purposeRef: fixture.purposeRef,
    mediaType: "text/plain",
    bytes: fixture.captureBytes,
    displayLabel: "Staff notes",
    originalFilename: null,
  });
  stored = await workflow.read(fixture.organizationId);
  const upload = stored.store.uploadReceipts.at(-1)!;
  await composition.beginReviewedCarryForward({
    ...identity,
    idempotencyKey: "process-b-reviewed-carry-forward",
    uploadReceiptId: upload.uploadReceiptId,
  });
  stored = await workflow.read(fixture.organizationId);
  const decision = stored.store.proposals.find(
    (item) => item.kind === "decision-draft",
  )!;
  const unknown = stored.store.proposals.find(
    (item) => item.kind === "unknown",
  )!;
  const commitment = stored.store.proposals.find(
    (item) => item.kind === "commitment",
  )!;
  const assumption = stored.store.proposals.find(
    (item) => item.kind === "assumption-change",
  )!;
  const followup = stored.store.proposals.find(
    (item) => item.kind === "follow-up-question",
  )!;
  assert.deepEqual(
    stored.store.proposals.map((item) => item.kind).sort(),
    ["assumption-change", "commitment", "decision-draft", "follow-up-question", "unknown"],
  );
  await composition.review({
    ...identity,
    idempotencyKey: "process-b-review-decision",
    proposalId: decision.proposalId,
    disposition: "approved-with-edit",
    effectivePayload: {
      summary: "Draft the governed sequencing review decision.",
      targetRef: null,
    },
    reason: "Clarified scope.",
  });
  await composition.review({
    ...identity,
    idempotencyKey: "process-b-review-unknown",
    proposalId: unknown.proposalId,
    disposition: "deferred",
    effectivePayload: null,
    reason: "Missing information.",
  });
  await composition.review({
    ...identity,
    idempotencyKey: "process-b-review-commitment",
    proposalId: commitment.proposalId,
    disposition: "approved",
    effectivePayload: null,
    reason: null,
  });
  await composition.review({
    ...identity,
    idempotencyKey: "process-b-review-assumption",
    proposalId: assumption.proposalId,
    disposition: "approved-with-edit",
    effectivePayload: { summary: "Leadership will test coordination before changing staffing.", targetRef: assumption.payload.targetRef },
    reason: "Human correction.",
  });
  await composition.review({
    ...identity,
    idempotencyKey: "process-b-review-followup",
    proposalId: followup.proposalId,
    disposition: "approved",
    effectivePayload: null,
    reason: null,
  });
  stored = await workflow.read(fixture.organizationId);
  const runtime = await new FilesystemOrganizationRuntimeRepository(
    locations.runtimeRoot,
  ).read(fixture.organizationId);
  assert.ok(runtime);
  const binding =
    runtime.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.find(
      (item) => item.bindingId === upload.sourceBindingId,
    );
  assert.ok(binding);
  const sourceRevision = await createFilesystemSourceContentRepository({
    root: locations.sourceContentRoot,
    environment: "test",
  }).inspectRevision(fixture.organizationId);
  const proposals = stored.store.proposals.map((item) => ({
    proposalId: item.proposalId,
    kind: item.kind,
    payloadDigest: item.payloadDigest,
  }));
  const dispositions = stored.store.dispositions.map((item) => ({
    dispositionReceiptId: item.dispositionReceiptId,
    proposalId: item.proposalId,
    disposition: item.disposition,
    digest: digest(item),
  }));
  const manifest = handoff({
    processAHandoffDigest: a.handoffDigest,
    organizationId: fixture.organizationId,
    questionId: questionId,
    conversationId: fixture.conversationId,
    frozenSnapshotId: a.frozenSnapshotId,
    sourceBindingId: upload.sourceBindingId,
    sourceBindingVersion: binding.bindingVersion,
    sourceBindingReceiptDigest: upload.sourceBindingMutationReceiptDigest,
    sourceContentVersionId: upload.sourceContentVersionId,
    exactContentDigest: upload.exactContentDigest,
    normalizedContentDigest: upload.normalizedContentDigest,
    uploadReceiptId: upload.uploadReceiptId,
    uploadReceiptDigest: digest(upload),
    proposals,
    dispositions,
    productWorkflowRepositoryRevision: stored.revision,
    runtimeRepositoryRevision: runtime.revision,
    sourceContentRepositoryRevision: sourceRevision,
    foreignOrganizationId,
    foreignRuntimeDigest: foreignRuntimeBeforeDigest,
    foreignWorkflowDigest: foreignWorkflowBeforeDigest,
  });
  return {
    role: "capture-and-review",
    handoff: manifest,
    assertions: [
      "process-a-verified",
      "binding-persisted",
      "content-persisted",
      "upload-receipt-persisted",
      "proposals-persisted",
      "dispositions-persisted",
    ],
  };
}

async function processC(
  root: string,
  lineageFixtureRoot: string,
  expectedSeedDigest: string,
  encodedA: string,
  encodedB: string,
  ambiguousEvidence = false,
): Promise<WorkerResult> {
  const a = parseHandoff(encodedA),
    b = parseHandoff(encodedB);
  assert.equal(b.processAHandoffDigest, a.handoffDigest);
  assert.equal(a.organizationId, fixture.organizationId);
  assert.equal(b.organizationId, fixture.organizationId);
  assert.equal(a.questionId, questionId);
  assert.equal(b.questionId, questionId);
  assert.equal(a.conversationId, fixture.conversationId);
  assert.equal(b.conversationId, fixture.conversationId);
  assert.equal(fixture.organizationId, SANDBOX_ORGANIZATION_ID);
  const seed = await readNorthstarPreparationLineageSeed({
    fixtureRoot: lineageFixtureRoot,
    organizationId: SANDBOX_ORGANIZATION_ID,
    fixtureId: "northstar-preparation-lineage-fixture-v1",
    provisioningKey: "northstar-preparation-lineage:v1",
    expectedSeedDigest,
  });
  assert.equal(seed.organizationId, fixture.organizationId);
  assert.equal(seed.productQuestionId, questionId);
  assert.equal(seed.seedDigest, expectedSeedDigest);
  assert.ok(
    seed.sourceBindings.length > 0 &&
      seed.sourceContentVersions.length > 0 &&
      seed.canonicalMaterial.length > 0,
  );
  const locations = roots(root);
  const workflow = createProductWorkflowArtifactRepository({
    root: locations.workflowRoot,
    environment: "test",
  });
  let stored = await workflow.read(fixture.organizationId);
  assert.equal(stored.revision, b.productWorkflowRepositoryRevision);
  assert.equal(
    stored.store.frozenSnapshotPublications!.find(
      (item) => item.artifactId === a.frozenSnapshotId,
    )?.snapshotDigest,
    a.frozenSnapshotDigest,
  );
  const upload = stored.store.uploadReceipts.find(
    (item) => item.uploadReceiptId === b.uploadReceiptId,
  )!;
  assert.equal(digest(upload), b.uploadReceiptDigest);
  assert.equal(upload.exactContentDigest, b.exactContentDigest);
  assert.equal(upload.normalizedContentDigest, b.normalizedContentDigest);
  assert.deepEqual(
    stored.store.proposals.map((item) => ({
      proposalId: item.proposalId,
      kind: item.kind,
      payloadDigest: item.payloadDigest,
    })),
    b.proposals,
  );
  assert.deepEqual(
    stored.store.dispositions.map((item) => ({
      dispositionReceiptId: item.dispositionReceiptId,
      proposalId: item.proposalId,
      disposition: item.disposition,
      digest: digest(item),
    })),
    b.dispositions,
  );
  const runtimeRepository = new FilesystemOrganizationRuntimeRepository(
    locations.runtimeRoot,
  );
  let runtime = await runtimeRepository.read(fixture.organizationId);
  assert.ok(runtime);
  assert.equal(runtime.revision, b.runtimeRepositoryRevision);
  const binding =
    runtime.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.find(
      (item) => item.bindingId === b.sourceBindingId,
    );
  assert.equal(binding?.bindingVersion, b.sourceBindingVersion);
  assert.equal(
    binding?.source.normalizedContentDigest,
    b.normalizedContentDigest,
  );
  const sourceRepository = createFilesystemSourceContentRepository({
    root: locations.sourceContentRoot,
    environment: "test",
  });
  assert.equal(
    await sourceRepository.inspectRevision(fixture.organizationId),
    b.sourceContentRepositoryRevision,
  );
  const composition = await validationComposition(
    locations,
    lineageFixtureRoot,
  );
  {
    const routeReviewed = async (kind: string) => {
      const current = await composition.workspace(identity), item = current.proposals.find((value) => value.kind === kind)!;
      await composition.ensureReviewedCarryForwardRoute({
        ...identity,
        proposalId: item.proposalId,
        purposeRef: fixture.purposeRef,
        expectedWorkflowRevision: current.workflowRevision,
        idempotencyKey: `process-c-reviewed-route:${kind}`,
      });
    };
    for (const kind of ["decision-draft", "commitment", "assumption-change", "follow-up-question"]) await routeReviewed(kind);
    let current = await composition.workspace(identity);
    const workflowBeforeIncompleteClosure = await workflow.read(fixture.organizationId), closureMetadata = resolveCurrentOccurrenceClosureMetadataV1({ store: workflowBeforeIncompleteClosure.store, organizationId: fixture.organizationId, questionId, conversationId: identity.conversationId });
    const closureInput = {
      ...identity,
      seriesId: closureMetadata.seriesId,
      expectedWorkflowRevision: current.workflowRevision,
      authorizedProjectionDigest: closureMetadata.authorizedProjectionDigest,
      candidateAssessmentDigest: null,
      b11CommunicationDigest: null,
      personalRoomSheetDigest: closureMetadata.personalRoomSheetDigest,
      idempotencyKey: "process-c-closure",
    };
    await assert.rejects(() => composition.completeCycle1Closure(closureInput), /reviewed completion/);
    assert.equal((await workflow.read(fixture.organizationId)).store.cycle1ClosureCompletions?.length ?? 0, 0);
    const completion = await composition.completeReviewedCarryForward({ ...identity, expectedWorkflowRevision: current.workflowRevision, idempotencyKey: `reviewed-carry-forward-completion:${fixture.organizationId}:${questionId}:${identity.conversationId}` });
    const completionReplay = await composition.completeReviewedCarryForward({ ...identity, expectedWorkflowRevision: "stale-replay", idempotencyKey: `reviewed-carry-forward-completion:${fixture.organizationId}:${questionId}:${identity.conversationId}` });
    assert.equal(completionReplay.completionId, completion.completionId);
    current = await composition.workspace(identity);
    const lawfulClosureInput = { ...closureInput, expectedWorkflowRevision: current.workflowRevision };
    await composition.completeCycle1Closure(lawfulClosureInput);
    const closureReplayBefore = await workflow.read(fixture.organizationId);
    await composition.completeCycle1Closure(lawfulClosureInput);
    assert.deepEqual(await workflow.read(fixture.organizationId), closureReplayBefore);
    await assert.rejects(() => composition.prepareNextOccurrence(identity), /What Changed/);
    assert.equal((await workflow.read(fixture.organizationId)).store.futurePreparationLinks.length, 0);
    const changed = await composition.publishClosureWhatChanged(identity), changedReplayBefore = await workflow.read(fixture.organizationId);
    await composition.publishClosureWhatChanged(identity);
    assert.deepEqual(await workflow.read(fixture.organizationId), changedReplayBefore);
    assert.equal(changed.currentStep, "prepare-again");
    const preparedAgain = await composition.prepareNextOccurrence(identity), replayedAgain = await composition.prepareNextOccurrence(identity);
    assert.equal(replayedAgain.sourceWorkspace.futurePreparationLink?.futurePreparationLinkId, preparedAgain.sourceWorkspace.futurePreparationLink?.futurePreparationLinkId);
    assert.equal(replayedAgain.nextWorkspace.conversationId, preparedAgain.nextWorkspace.conversationId);
    stored = await workflow.read(fixture.organizationId);
    const runtimeAfter = await runtimeRepository.read(fixture.organizationId); assert.ok(runtimeAfter);
    const foreignOrganizationId = String(b.foreignOrganizationId), foreignRuntimeAfter = await runtimeRepository.read(foreignOrganizationId), foreignWorkflowAfter = await workflow.read(foreignOrganizationId); assert.ok(foreignRuntimeAfter);
    const foreignStatePreserved = digest(foreignRuntimeAfter.bytes) === b.foreignRuntimeDigest && digest(leadershipStableSerialize(foreignWorkflowAfter.store)) === b.foreignWorkflowDigest; assert.equal(foreignStatePreserved, true);
    const inventoryFamilies = {
      occurrences: stored.store.contexts.length,
      preparedPublications: (stored.store.preparedWorkPublications ?? []).length,
      frozenPublications: (stored.store.frozenSnapshotPublications ?? []).length,
      publicationReceipts: (stored.store.publicationReceipts ?? []).length,
      capturePublications: (stored.store.privateWorkingContributionCaptures ?? []).length,
      captureReceipts: (stored.store.privateWorkingContributionCaptureReceipts ?? []).length,
      whatChangedPublications: (stored.store.whatChangedPublications ?? []).length,
      futurePreparationLinks: stored.store.futurePreparationLinks.length,
      routingLinks: stored.store.routingLinks.length,
      idempotencyRecords: stored.store.idempotency.length,
      closures: (stored.store.cycle1ClosureCompletions ?? []).length,
      reviewedCompletions: (stored.store.reviewedCarryForwardCompletions ?? []).length,
      reviewedProposals: stored.store.proposals.filter((value) => value.reviewedCarryForward).length,
      events: stored.store.events.length,
      contributionPublications: (stored.store.privateWorkingContributionPublications ?? []).length,
      contributionReceipts: (stored.store.privateWorkingContributionReceipts ?? []).length,
    };
    const identities = [
      ...stored.store.contexts.map((value) => value.conversationId),
      ...(stored.store.whatChangedPublications ?? []).map((value) => value.artifactId),
      ...stored.store.futurePreparationLinks.map((value) => value.futurePreparationLinkId),
      ...(stored.store.cycle1ClosureCompletions ?? []).map((value) => value.closureId),
      ...(stored.store.reviewedCarryForwardCompletions ?? []).map((value) => value.completionId),
    ];
    const duplicateInventoryFindings = identities.length - new Set(identities).size;
    assert.equal(duplicateInventoryFindings, 0);
    const manifest = handoff({
      processAHandoffDigest: a.handoffDigest,
      processBHandoffDigest: b.handoffDigest,
      organizationId: fixture.organizationId,
      questionId,
      conversationId: fixture.conversationId,
      nextConversationId: preparedAgain.nextWorkspace.conversationId,
      futurePreparationLinkId: preparedAgain.sourceWorkspace.futurePreparationLink!.futurePreparationLinkId,
      productWorkflowRepositoryRevision: stored.revision,
      runtimeRepositoryRevision: runtimeAfter.revision,
      sourceContentRepositoryRevision: await sourceRepository.inspectRevision(fixture.organizationId),
      routingReceiptCount: stored.store.canonicalRoutingReceipts.length,
      idempotentReentry: true,
      neutralityCaseCount: 0,
      inventoryFamilies,
      duplicateInventoryFindings,
      foreignStatePreserved,
      foreignStateDigest: digest({ runtime: b.foreignRuntimeDigest, workflow: b.foreignWorkflowDigest }),
    });
    return { role: ambiguousEvidence ? "operation-linked-ambiguity" : "route-actual-owners-and-prepare-again", handoff: manifest, assertions: ["lawful-reviewed-completion", "closure-rejects-before-completion", "closure-exact-replay", "prepare-again-rejects-before-what-changed", "what-changed-exact-replay", "prepare-again-exact-replay", "successor-persisted"] };
  }
}

async function processLegacyEvidenceA(
  root: string,
  lineageFixtureRoot?: string,
): Promise<WorkerResult> {
  const locations = roots(root);
  const runtimeRepository = new FilesystemOrganizationRuntimeRepository(
    locations.runtimeRoot,
  );
  const topology = createCanonicalScopeTopology({
    organizationId: fixture.organizationId,
    topologyVersion: 1,
    effectiveAt: fixture.at,
    nodes: [scope],
    relationships: [],
  });
  let runtime = createEmptyOrganizationRuntime({
    organizationId: fixture.organizationId,
    name: "Northstar",
    now: fixture.at,
  });
  runtime.memory.organizationalUnderstandingState.canonicalCompositions = [];
  runtime.memory.canonicalScopeLineageIndex = createCanonicalScopeLineageIndex({
    organizationId: fixture.organizationId,
    topology,
  });
  runtime = createDurableProductQuestion({
    runtime,
    title: "What is constraining Northstar delivery?",
    questionId: questionId,
    createdAt: fixture.at,
  }).runtime;
  runtime = appendProductQuestionEvent(runtime, {
    type: "answer_recorded",
    organizationId: fixture.organizationId,
    questionId: questionId,
    occurredAt: fixture.at,
    answer: {
      answerId: "product-answer:northstar-leadership:1",
      canonicalSource: "canonical-product-answer",
      revision: 1,
      reasonForChange: "Initial supported Answer",
      changeReceiptId: "product-answer-receipt:northstar-leadership:1",
      timestamp: fixture.at,
      confidence: {
        level: "moderate",
        score: 0.7,
        meaning: "Supported",
        principalLimiter: "Additional sequencing evidence is required.",
        authoritativeSource: "canonical-product-workflow",
      },
    },
  });
  await runtimeRepository.create(
    fixture.organizationId,
    new TextEncoder().encode(JSON.stringify(runtime, null, 2)),
    { requestId: "process-a-runtime", operatorId: fixture.actorId },
  );
  const composition = await validationComposition(
    locations,
    lineageFixtureRoot,
  );
  await composition.recordContext({
    ...identity,
    idempotencyKey: "process-a-context",
    title: "Northstar staff conversation",
    purpose: "Resolve the next delivery constraint.",
    intendedOutcome: "Agree one bounded owner action.",
    timeframe: "Weekly",
    participants: [
      {
        participantRef: "leader",
        displayName: "Leader",
        titleLabel: "Director",
      },
    ],
    leaderContext: null,
  });
  const workflow = createProductWorkflowArtifactRepository({
    root: locations.workflowRoot,
    environment: "test",
  });
  let stored = await workflow.read(fixture.organizationId);
  const context = stored.store.contexts.at(-1)!;
  await composition.recordPreparation({
    ...identity,
    idempotencyKey: "process-a-preparation-1",
    contextVersionId: context.contextVersionId,
    content: NORTHSTAR_PREPARED_CONTENT,
    lineage: NORTHSTAR_PREPARED_LINEAGE,
    changeSummary: null,
  });
  stored = await workflow.read(fixture.organizationId);
  await composition.recordPreparation({
    ...identity,
    idempotencyKey: "process-a-preparation-2",
    contextVersionId: context.contextVersionId,
    content: {
      ...NORTHSTAR_PREPARED_CONTENT,
      headline: "Resolve sequencing ownership before the next delivery window.",
    },
    lineage: NORTHSTAR_PREPARED_LINEAGE,
    changeSummary: "Leader clarified sequencing ownership.",
  });
  stored = await workflow.read(fixture.organizationId);
  const prepared = stored.store.preparedWorkPublications!.at(-1)!;
  await composition.freeze({
    ...identity,
    idempotencyKey: "process-a-freeze",
    artifactVersionId: prepared.artifactRevision,
    privateWorkingContribution: {
      seriesId: `leadership-conversation-series:${fixture.conversationId}`,
      occurrenceId: fixture.conversationId,
      authorizationRevision:
        NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionRevision,
      provenanceDigest: NORTHSTAR_PREPARED_LINEAGE.authorizedProjectionDigest,
      selectedContent: [],
    },
  });
  stored = await workflow.read(fixture.organizationId);
  const frozen = stored.store.frozenSnapshotPublications!.at(-1)!;
  const occurrence = await workflow.readOccurrence!({
      ...identity,
      seriesId: `leadership-conversation-series:${fixture.conversationId}`,
    }),
    checkpoint = resolveCurrentOccurrenceCheckpointIdentityV1({
      store: occurrence.store,
      organizationId: identity.organizationId,
      questionId: identity.questionId,
      conversationId: identity.conversationId,
    });
  assert.equal(checkpoint.checkpointId, frozen.artifactId);
  assert.equal(checkpoint.contributionArtifactIds.length, 0);
  assert.equal(
    occurrence.store.publicationReceipts?.filter(
      (value) => value.receiptKind === "frozen-checkpoint-publication",
    ).length,
    1,
  );
  assert.equal(stored.store.preparedWorkProducts.length, 0);
  assert.equal(stored.store.frozenSnapshots.length, 0);
  const manifest = handoff({
    organizationId: fixture.organizationId,
    questionId: questionId,
    conversationId: fixture.conversationId,
    contextVersionId: context.contextVersionId,
    preparedWorkProductVersionId: prepared.artifactRevision,
    frozenSnapshotId: frozen.artifactId,
    frozenSnapshotDigest: frozen.snapshotDigest,
    productWorkflowRepositoryRevision: stored.revision,
    eventCount: stored.store.events.length,
  });
  return {
    role: "prepare-and-freeze",
    handoff: manifest,
    assertions: [
      "context-persisted",
      "preparation-v1-persisted",
      "preparation-v2-persisted",
      "explicit-empty-frozen-snapshot-persisted",
      "explicit-empty-occurrence-slice-proof-reconstructed",
    ],
  };
}

async function processLegacyEvidenceB(root: string, encodedA: string): Promise<WorkerResult> {
  const a = parseHandoff(encodedA);
  const locations = roots(root);
  const workflow = createProductWorkflowArtifactRepository({
    root: locations.workflowRoot,
    environment: "test",
  });
  const foreignOrganizationId = "ar5b-joined-inventory-foreign";
  const foreignRuntimeRepository = new FilesystemOrganizationRuntimeRepository(
    locations.runtimeRoot,
  );
  let foreignRuntime = await foreignRuntimeRepository.read(
    foreignOrganizationId,
  );
  if (!foreignRuntime) {
    const foreignBytes = new TextEncoder().encode(
      JSON.stringify(
        createEmptyOrganizationRuntime({
          organizationId: foreignOrganizationId,
          name: "Foreign preservation control",
          now: fixture.at,
        }),
      ),
    );
    foreignRuntime = await foreignRuntimeRepository.create(
      foreignOrganizationId,
      foreignBytes,
      {
        requestId: "foreign-preservation-seed",
        operatorId: "replay-validator",
      },
    );
  }
  const foreignWorkflowInitial = await workflow.read(foreignOrganizationId);
  const foreignWorkflow =
    foreignWorkflowInitial.revision === null
      ? await workflow.replace(
          foreignOrganizationId,
          foreignWorkflowInitial.store,
          null,
        )
      : foreignWorkflowInitial;
  const foreignRuntimeBeforeDigest = digest(foreignRuntime.bytes);
  const foreignWorkflowBeforeDigest = digest(
    leadershipStableSerialize(foreignWorkflow.store),
  );
  let stored = await workflow.read(fixture.organizationId);
  assert.equal(stored.revision, a.productWorkflowRepositoryRevision);
  assert.equal(
    stored.store.frozenSnapshotPublications!.at(-1)?.artifactId,
    a.frozenSnapshotId,
  );
  assert.equal(
    stored.store.frozenSnapshotPublications!.at(-1)?.snapshotDigest,
    a.frozenSnapshotDigest,
  );
  const composition = await validationComposition(locations);
  await composition.readFrozenPrivateWorkingContribution({
    ...identity,
    snapshotId: String(a.frozenSnapshotId),
    artifactIds:
      stored.store
        .frozenSnapshotPublications!.at(-1)
        ?.privateWorkingContributionRefs?.map((value) => value.artifactId) ??
      [],
  });
  await composition.captureFrozenPrivateWorkingContribution({
    ...identity,
    idempotencyKey: "process-b-capture-contribution",
    snapshotId: String(a.frozenSnapshotId),
  });
  await composition.receiveUpload({
    ...identity,
    idempotencyKey: "process-b-upload",
    frozenSnapshotId: String(a.frozenSnapshotId),
    purposeRef: fixture.purposeRef,
    mediaType: "text/plain",
    bytes: fixture.captureBytes,
    displayLabel: "Staff notes",
    originalFilename: null,
  });
  stored = await workflow.read(fixture.organizationId);
  const upload = stored.store.uploadReceipts.at(-1)!;
  await composition.generateProposals({
    ...identity,
    idempotencyKey: "process-b-proposals",
    uploadReceiptId: upload.uploadReceiptId,
    purposeRef: fixture.purposeRef,
  });
  stored = await workflow.read(fixture.organizationId);
  const evidence = stored.store.proposals.find(
    (item) => item.kind === "evidence-candidate",
  )!;
  const decision = stored.store.proposals.find(
    (item) => item.kind === "decision-draft",
  )!;
  const unknown = stored.store.proposals.find(
    (item) => item.kind === "unknown",
  )!;
  const commitment = stored.store.proposals.find(
    (item) => item.kind === "commitment",
  )!;
  await composition.review({
    ...identity,
    idempotencyKey: "process-b-review-evidence",
    proposalId: evidence.proposalId,
    disposition: "approved",
    effectivePayload: null,
    reason: null,
  });
  await composition.review({
    ...identity,
    idempotencyKey: "process-b-review-decision",
    proposalId: decision.proposalId,
    disposition: "approved-with-edit",
    effectivePayload: {
      summary: "Draft the governed sequencing review decision.",
      targetRef: null,
    },
    reason: "Clarified scope.",
  });
  await composition.review({
    ...identity,
    idempotencyKey: "process-b-review-unknown",
    proposalId: unknown.proposalId,
    disposition: "approved",
    effectivePayload: null,
    reason: null,
  });
  await composition.review({
    ...identity,
    idempotencyKey: "process-b-review-rejected",
    proposalId: commitment.proposalId,
    disposition: "rejected",
    effectivePayload: null,
    reason: "Not yet authorized.",
  });
  await composition.review({
    ...identity,
    idempotencyKey: "process-b-review-deferred",
    proposalId: commitment.proposalId,
    disposition: "deferred",
    effectivePayload: null,
    reason: "Retain for audit.",
  });
  stored = await workflow.read(fixture.organizationId);
  const runtime = await new FilesystemOrganizationRuntimeRepository(
    locations.runtimeRoot,
  ).read(fixture.organizationId);
  assert.ok(runtime);
  const binding =
    runtime.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.find(
      (item) => item.bindingId === upload.sourceBindingId,
    );
  assert.ok(binding);
  const sourceRevision = await createFilesystemSourceContentRepository({
    root: locations.sourceContentRoot,
    environment: "test",
  }).inspectRevision(fixture.organizationId);
  const proposals = stored.store.proposals.map((item) => ({
    proposalId: item.proposalId,
    kind: item.kind,
    payloadDigest: item.payloadDigest,
  }));
  const dispositions = stored.store.dispositions.map((item) => ({
    dispositionReceiptId: item.dispositionReceiptId,
    proposalId: item.proposalId,
    disposition: item.disposition,
    digest: digest(item),
  }));
  const manifest = handoff({
    processAHandoffDigest: a.handoffDigest,
    organizationId: fixture.organizationId,
    questionId: questionId,
    conversationId: fixture.conversationId,
    frozenSnapshotId: a.frozenSnapshotId,
    sourceBindingId: upload.sourceBindingId,
    sourceBindingVersion: binding.bindingVersion,
    sourceBindingReceiptDigest: upload.sourceBindingMutationReceiptDigest,
    sourceContentVersionId: upload.sourceContentVersionId,
    exactContentDigest: upload.exactContentDigest,
    normalizedContentDigest: upload.normalizedContentDigest,
    uploadReceiptId: upload.uploadReceiptId,
    uploadReceiptDigest: digest(upload),
    proposals,
    dispositions,
    productWorkflowRepositoryRevision: stored.revision,
    runtimeRepositoryRevision: runtime.revision,
    sourceContentRepositoryRevision: sourceRevision,
    foreignOrganizationId,
    foreignRuntimeDigest: foreignRuntimeBeforeDigest,
    foreignWorkflowDigest: foreignWorkflowBeforeDigest,
  });
  return {
    role: "capture-and-review",
    handoff: manifest,
    assertions: [
      "process-a-verified",
      "binding-persisted",
      "content-persisted",
      "upload-receipt-persisted",
      "proposals-persisted",
      "dispositions-persisted",
    ],
  };
}

async function processLegacyEvidenceC(
  root: string,
  lineageFixtureRoot: string,
  expectedSeedDigest: string,
  encodedA: string,
  encodedB: string,
  ambiguousEvidence = false,
): Promise<WorkerResult> {
  const a = parseHandoff(encodedA),
    b = parseHandoff(encodedB);
  assert.equal(b.processAHandoffDigest, a.handoffDigest);
  assert.equal(a.organizationId, fixture.organizationId);
  assert.equal(b.organizationId, fixture.organizationId);
  assert.equal(a.questionId, questionId);
  assert.equal(b.questionId, questionId);
  assert.equal(a.conversationId, fixture.conversationId);
  assert.equal(b.conversationId, fixture.conversationId);
  assert.equal(fixture.organizationId, SANDBOX_ORGANIZATION_ID);
  const seed = await readNorthstarPreparationLineageSeed({
    fixtureRoot: lineageFixtureRoot,
    organizationId: SANDBOX_ORGANIZATION_ID,
    fixtureId: "northstar-preparation-lineage-fixture-v1",
    provisioningKey: "northstar-preparation-lineage:v1",
    expectedSeedDigest,
  });
  assert.equal(seed.organizationId, fixture.organizationId);
  assert.equal(seed.productQuestionId, questionId);
  assert.equal(seed.seedDigest, expectedSeedDigest);
  assert.ok(
    seed.sourceBindings.length > 0 &&
      seed.sourceContentVersions.length > 0 &&
      seed.canonicalMaterial.length > 0,
  );
  const locations = roots(root);
  const workflow = createProductWorkflowArtifactRepository({
    root: locations.workflowRoot,
    environment: "test",
  });
  let stored = await workflow.read(fixture.organizationId);
  assert.equal(stored.revision, b.productWorkflowRepositoryRevision);
  assert.equal(
    stored.store.frozenSnapshotPublications!.find(
      (item) => item.artifactId === a.frozenSnapshotId,
    )?.snapshotDigest,
    a.frozenSnapshotDigest,
  );
  const upload = stored.store.uploadReceipts.find(
    (item) => item.uploadReceiptId === b.uploadReceiptId,
  )!;
  assert.equal(digest(upload), b.uploadReceiptDigest);
  assert.equal(upload.exactContentDigest, b.exactContentDigest);
  assert.equal(upload.normalizedContentDigest, b.normalizedContentDigest);
  assert.deepEqual(
    stored.store.proposals.map((item) => ({
      proposalId: item.proposalId,
      kind: item.kind,
      payloadDigest: item.payloadDigest,
    })),
    b.proposals,
  );
  assert.deepEqual(
    stored.store.dispositions.map((item) => ({
      dispositionReceiptId: item.dispositionReceiptId,
      proposalId: item.proposalId,
      disposition: item.disposition,
      digest: digest(item),
    })),
    b.dispositions,
  );
  const runtimeRepository = new FilesystemOrganizationRuntimeRepository(
    locations.runtimeRoot,
  );
  let runtime = await runtimeRepository.read(fixture.organizationId);
  assert.ok(runtime);
  assert.equal(runtime.revision, b.runtimeRepositoryRevision);
  const binding =
    runtime.runtime.memory.canonicalScopeLineageIndex?.sourceBindings.find(
      (item) => item.bindingId === b.sourceBindingId,
    );
  assert.equal(binding?.bindingVersion, b.sourceBindingVersion);
  assert.equal(
    binding?.source.normalizedContentDigest,
    b.normalizedContentDigest,
  );
  const sourceRepository = createFilesystemSourceContentRepository({
    root: locations.sourceContentRoot,
    environment: "test",
  });
  assert.equal(
    await sourceRepository.inspectRevision(fixture.organizationId),
    b.sourceContentRepositoryRevision,
  );
  const composition = await validationComposition(
    locations,
    lineageFixtureRoot,
  );
  const proposal = (kind: string) =>
    stored.store.proposals.find((item) => item.kind === kind)!;
  const route = async (kind: string, key: string) => {
    stored = await workflow.read(fixture.organizationId);
    const item = proposal(kind);
    return composition.routeApproved({
      ...identity,
      proposalId: item.proposalId,
      purposeRef: fixture.purposeRef,
      expectedWorkflowRevision: stored.revision,
      idempotencyKey: key,
    });
  };
  const material = await route(
    "evidence-candidate",
    "process-c-route-evidence-material",
  );
  if (!("ownerKind" in material) || material.ownerKind !== "evidence")
    throw new Error("persisted canonical Evidence routing receipt unavailable");
  assert.equal(
    material.dispositionReceiptId,
    stored.store.dispositions.find(
      (value) => value.proposalId === material.proposalId,
    )!.dispositionReceiptId,
  );
  assert.match(material.canonicalOperationResultDigest, /^[a-f0-9]{64}$/);
  assert.ok(material.contributionOperationId);
  runtime = await runtimeRepository.read(fixture.organizationId);
  assert.ok(runtime);
  assert.equal(
    runtime.runtime.memory.organizationalUnderstandingState
      .canonicalCompositionEvaluationOperations?.length ?? 0,
    0,
  );
  assert.equal(
    runtime.runtime.memory.organizationalUnderstandingState
      .canonicalCompositionEvaluationReceipts?.length ?? 0,
    0,
  );
  assert.equal(runtime.runtime.memory.organizationalExplanations.length, 0);
  stored = await workflow.read(fixture.organizationId);
  const persistedEvidenceRoute = stored.store.canonicalRoutingReceipts.filter(
    (value) =>
      value.proposalId === material.proposalId &&
      value.dispositionReceiptId === material.dispositionReceiptId,
  );
  assert.equal(persistedEvidenceRoute.length, 1);
  assert.equal(
    stored.store.routingLinks.filter(
      (value) => value.integrationReceiptId === material.integrationReceiptId,
    ).length,
    1,
  );
  assert.equal(
    (stored.store.productMaterializationReceipts ?? []).filter(
      (value) =>
        value.canonicalOperationId === material.contributionOperationId,
    ).length,
    1,
  );
  const evidenceMaterialization = (
    stored.store.productMaterializations ?? []
  ).find(
    (value) => value.canonicalOperationId === material.contributionOperationId,
  )!;
  assert.equal(
    (stored.store.whatChangedPublications ?? []).filter(
      (value) =>
        value.artifactId === evidenceMaterialization.whatChangedArtifactId,
    ).length,
    1,
  );
  if (ambiguousEvidence) {
    const evidence = proposal("evidence-candidate");
    await composition.review({
      ...identity,
      idempotencyKey: "process-c-review-evidence-ambiguous",
      proposalId: evidence.proposalId,
      disposition: "approved",
      effectivePayload: null,
      reason: "Operation-linked ambiguity control.",
    });
    await route("evidence-candidate", "process-c-route-evidence-ambiguous");
  }
  const duplicate = await route(
    "evidence-candidate",
    ambiguousEvidence
      ? "process-c-route-evidence-ambiguous"
      : "process-c-route-evidence-material",
  );
  if (!("ownerKind" in duplicate) || duplicate.ownerKind !== "evidence")
    throw new Error("persisted canonical Evidence replay receipt unavailable");
  if (!ambiguousEvidence) {
    assert.equal(duplicate.integrationReceiptId, material.integrationReceiptId);
    assert.equal(duplicate.receiptDigest, material.receiptDigest);
  }
  const decision = await route("decision-draft", "process-c-route-decision");
  if (!("ownerKind" in decision))
    throw new Error("decision owner receipt unavailable");
  assert.equal(decision.ownerKind, "product-decision-draft");
  const unknown = await route("unknown", "process-c-route-unknown");
  if (!("ownerKind" in unknown))
    throw new Error("unknown owner receipt unavailable");
  assert.equal(unknown.ownerKind, "unknown");
  stored = await workflow.read(fixture.organizationId);
  const commitment = proposal("commitment");
  await composition.review({
    ...identity,
    idempotencyKey: "process-c-review-commitment",
    proposalId: commitment.proposalId,
    disposition: "approved",
    effectivePayload: null,
    reason: "Prepare Again closure coverage.",
  });
  await route("commitment", "process-c-route-commitment");
  stored = await workflow.read(fixture.organizationId);
  if (
    !("integrationReceiptId" in decision) ||
    !("integrationReceiptId" in unknown)
  )
    throw new Error("actual owner receipt unavailable");
  for (const item of (await composition.workspace(identity)).proposals) {
    stored = await workflow.read(fixture.organizationId);
    const latest = stored.store.dispositions
      .filter((value) => value.proposalId === item.proposalId)
      .at(-1);
    if (latest?.disposition.startsWith("approved")) {
      assert.ok(
        stored.store.canonicalRoutingReceipts.some(
          (value) =>
            value.proposalId === item.proposalId &&
            value.dispositionReceiptId === latest.dispositionReceiptId,
        ),
        "approved proposals must retain an exact canonical route before closure",
      );
      continue;
    }
    if (latest && !latest.disposition.startsWith("approved")) continue;
    await composition.review({
      ...identity,
      idempotencyKey: `process-c-final-review:${item.proposalId}`,
      proposalId: item.proposalId,
      disposition: "deferred",
      effectivePayload: null,
      reason: "Preserved for the next governed review.",
    });
  }
  let sourceWorkspace = await composition.workspace(identity);
  assert.ok(
    sourceWorkspace.canonicalRoutingReceipts.some(
      (value) =>
        value.ownerKind === "evidence" &&
        value.proposalId === material.proposalId &&
        value.dispositionReceiptId === material.dispositionReceiptId,
    ),
  );
  stored = await workflow.read(fixture.organizationId);
  const beforeDifferentPurpose = await workflow.read(fixture.organizationId);
  await assert.rejects(
    () => composition.routeApproved({
      ...identity,
      proposalId: proposal("decision-draft").proposalId,
      purposeRef: "different-purpose",
      expectedWorkflowRevision: beforeDifferentPurpose.revision,
      idempotencyKey: "process-c-route-decision",
    }),
    /conflict/,
  );
  assert.deepEqual(await workflow.read(fixture.organizationId), beforeDifferentPurpose);
  runtime = await runtimeRepository.read(fixture.organizationId);
  assert.ok(runtime);
  const legacyPublicationBodies = [
      ...(stored.store.preparedWorkPublications ?? []).map((value) => value.protectedBody),
      ...(stored.store.frozenSnapshotPublications ?? []).map((value) => value.protectedBody),
      ...(stored.store.whatChangedPublications ?? []).flatMap((value) =>
        Array.isArray(value.protectedBody) ? value.protectedBody : [value.protectedBody],
      ),
    ],
    legacyRuntimeBodies: Array<Record<string, unknown> & { bodyId: string; exactBodyDigest: string }> = [],
    collectLegacyBodies = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) { value.forEach(collectLegacyBodies); return; }
      const record = value as Record<string, unknown>;
      if (typeof record.bodyId === "string" && typeof record.exactBodyDigest === "string")
        legacyRuntimeBodies.push(record as Record<string, unknown> & { bodyId: string; exactBodyDigest: string });
      Object.values(record).forEach(collectLegacyBodies);
    };
  collectLegacyBodies(runtime.runtime.memory.events);
  const legacyProtectedBodies = [...new Map([...legacyPublicationBodies, ...legacyRuntimeBodies].map((value) => [value.bodyId, value])).values()],
    legacyBodyRoot = path.join(root, "product-artifact-bodies"),
    legacyBodyFiles = (await readdir(legacyBodyRoot, { recursive: true })).map(String),
    legacyRefFiles = legacyBodyFiles.filter((value) => value.includes(`${path.sep}refs${path.sep}`) && value.endsWith(".json")),
    legacyBlobFiles = legacyBodyFiles.filter((value) => value.includes(`${path.sep}blobs${path.sep}`) && value.endsWith(".blob")),
    legacyRefs = await Promise.all(legacyRefFiles.map(async (value) => JSON.parse(await readFile(path.join(legacyBodyRoot, value), "utf8")) as { bodyId: string; exactBodyDigest: string }));
  assert.deepEqual(new Set(legacyRefs.map((value) => value.bodyId)), new Set(legacyProtectedBodies.map((value) => value.bodyId)));
  assert.deepEqual(new Set(legacyBlobFiles.map((value) => path.basename(value, ".blob"))), new Set(legacyProtectedBodies.map((value) => value.exactBodyDigest)));
  for (const [index, relative] of legacyRefFiles.entries()) {
    const status = await lstat(path.join(legacyBodyRoot, relative));
    assert.ok(status.isFile() && !status.isSymbolicLink() && (status.mode & 0o777) === 0o600);
    assert.deepEqual(legacyRefs[index], legacyProtectedBodies.find((value) => value.bodyId === legacyRefs[index]!.bodyId));
  }
  for (const relative of legacyBlobFiles) {
    const target = path.join(legacyBodyRoot, relative), status = await lstat(target), bytes = await readFile(target);
    assert.ok(status.isFile() && !status.isSymbolicLink() && (status.mode & 0o777) === 0o600);
    assert.equal(createHash("sha256").update(bytes).digest("hex"), path.basename(relative, ".blob"));
  }
  const legacyRuntimeOperations = runtime.runtime.memory.events.flatMap((value) =>
      value && typeof value === "object" && "contributionOperationId" in value ? [String((value as { contributionOperationId: unknown }).contributionOperationId)] : []),
    legacyRuntimeEvidence = runtime.runtime.memory.events.flatMap((value) => {
      if (!value || typeof value !== "object") return [];
      const admissions = (value as { canonicalAdmissionBatch?: { admissions?: Array<{ canonicalEvidenceId?: unknown; canonicalAdmissionId?: unknown }> } }).canonicalAdmissionBatch?.admissions ?? [];
      return admissions.flatMap((admission) => typeof admission.canonicalEvidenceId === "string" && typeof admission.canonicalAdmissionId === "string" ? [`${admission.canonicalEvidenceId}\0${admission.canonicalAdmissionId}`] : []);
    }),
    legacyEvidenceRoutes = stored.store.canonicalRoutingReceipts.filter((value) => value.ownerKind === "evidence"),
    legacyRoutedEvidence = legacyEvidenceRoutes.flatMap((value) => value.admissions.map((admission) => `${admission.canonicalEvidenceId}\0${admission.canonicalAdmissionId}`)),
    legacyRuntimeTerminals = (await readdir(path.join(locations.runtimeRoot, ".operations", fixture.organizationId)).catch(() => [])).filter((value) => value.endsWith(".json")),
    legacyWorkflowTerminals = (await readdir(path.join(locations.workflowRoot, "organizations", ".operations", fixture.organizationId)).catch(() => [])).filter((value) => value.endsWith(".json"));
  assert.deepEqual(new Set(legacyRuntimeEvidence), new Set(legacyRoutedEvidence));
  assert.ok(legacyEvidenceRoutes.every((value) => legacyRuntimeOperations.includes(value.contributionOperationId)));
  for (const [terminalRoot, files] of [[path.join(locations.runtimeRoot, ".operations", fixture.organizationId), legacyRuntimeTerminals], [path.join(locations.workflowRoot, "organizations", ".operations", fixture.organizationId), legacyWorkflowTerminals]] as const)
    for (const file of files) {
      const terminal = JSON.parse(await readFile(path.join(terminalRoot, file), "utf8")) as Record<string, unknown>;
      assert.match(String(terminal.requestFingerprint), /^[a-f0-9]{64}$/);
      assert.match(String(terminal.intendedDigest), /^[a-f0-9]{64}$/);
    }
  const legacyInventoryFamilies = {
    evidenceRoutes: legacyEvidenceRoutes.length,
    runtimeEvidence: legacyRuntimeEvidence.length,
    runtimeCanonicalOperations: legacyRuntimeOperations.length,
    runtimeTerminals: legacyRuntimeTerminals.length,
    workflowTerminals: legacyWorkflowTerminals.length,
    productMaterializations: (stored.store.productMaterializations ?? []).length,
    productMaterializationReceipts: (stored.store.productMaterializationReceipts ?? []).length,
    protectedBodyRefs: legacyProtectedBodies.length,
    physicalBodyRefs: legacyRefs.length,
    physicalBlobs: legacyBlobFiles.length,
    closures: (stored.store.cycle1ClosureCompletions ?? []).length,
    reviewedCompletions: (stored.store.reviewedCarryForwardCompletions ?? []).length,
    futurePreparationLinks: stored.store.futurePreparationLinks.length,
  };
  assert.ok(legacyInventoryFamilies.evidenceRoutes >= (ambiguousEvidence ? 2 : 1));
  assert.ok(legacyInventoryFamilies.productMaterializations >= (ambiguousEvidence ? 2 : 1));
  assert.equal(legacyInventoryFamilies.productMaterializations, legacyInventoryFamilies.productMaterializationReceipts);
  assert.ok(legacyInventoryFamilies.runtimeTerminals > 0 && legacyInventoryFamilies.workflowTerminals > 0);
  assert.equal(legacyInventoryFamilies.closures, 0);
  assert.equal(legacyInventoryFamilies.reviewedCompletions, 0);
  assert.equal(legacyInventoryFamilies.futurePreparationLinks, 0);
  const foreignRuntimeAfter = await runtimeRepository.read(String(b.foreignOrganizationId)), foreignWorkflowAfter = await workflow.read(String(b.foreignOrganizationId));
  assert.ok(foreignRuntimeAfter);
  const foreignStatePreserved = digest(foreignRuntimeAfter.bytes) === b.foreignRuntimeDigest && digest(leadershipStableSerialize(foreignWorkflowAfter.store)) === b.foreignWorkflowDigest;
  assert.equal(foreignStatePreserved, true);
  return {
    role: ambiguousEvidence ? "legacy-operation-linked-ambiguity" : "legacy-evidence-actual-owners",
    handoff: handoff({ processAHandoffDigest: a.handoffDigest, processBHandoffDigest: b.handoffDigest, organizationId: fixture.organizationId, questionId, conversationId: fixture.conversationId, materialEvidenceReceiptDigest: material.receiptDigest, duplicateEvidenceReceiptDigest: duplicate.receiptDigest, decisionDraftReceiptDigest: decision.receiptDigest, unknownReceiptDigest: unknown.receiptDigest, inventoryFamilies: legacyInventoryFamilies, foreignStatePreserved }),
    assertions: ["legacy-handoffs-verified","legacy-material-evidence-actual","legacy-operation-materialization-actual","legacy-duplicate-evidence-class-2","legacy-decision-draft-actual","legacy-unknown-actual","legacy-terminal-integrity","legacy-body-integrity","legacy-inventory-complete","legacy-no-reviewed-closure"],
  };
}

async function processD(
  root: string,
  lineageFixtureRoot: string,
  encodedC: string,
): Promise<WorkerResult> {
  const c = parseHandoff(encodedC),
    locations = roots(root),
    composition = await validationComposition(locations, lineageFixtureRoot),
    nextConversationId = String(c.nextConversationId),
    identity = {
      userId: fixture.actorId,
      organizationId: fixture.organizationId,
      questionId,
      conversationId: nextConversationId,
    };
  const source = await composition.workspace({
    ...identity,
    conversationId: fixture.conversationId,
  });
  assert.ok(source.closureCompletion);
  assert.equal(
    source.futurePreparationLink?.nextConversationId,
    nextConversationId,
  );
  const first = await composition.workspace(identity);
  assert.ok(first.currentPreparedWorkProduct);
  assert.equal(
    first.currentPreparedWorkProduct?.conversationId,
    nextConversationId,
  );
  const repository = createProductWorkflowArtifactRepository({
      root: locations.workflowRoot,
      environment: "test",
    }),
    before = (await repository.read(fixture.organizationId)).revision,
    second = await composition.workspace(identity),
    after = (await repository.read(fixture.organizationId)).revision;
  assert.equal(
    second.currentPreparedWorkProduct?.artifactVersionId,
    first.currentPreparedWorkProduct?.artifactVersionId,
  );
  assert.equal(after, before);
  return {
    role: "reload-reviewed-successor",
    handoff: handoff({
      organizationId: fixture.organizationId,
      questionId,
      nextConversationId,
      artifactVersionId: first.currentPreparedWorkProduct!.artifactVersionId,
      workflowRevision: after,
    }),
    assertions: [
      "fresh-process-successor-link-from-reviewed-predecessor",
      "fresh-process-successor-reload",
      "reviewed-successor-current-access",
      "reload-idempotent",
    ],
  };
}

async function worker(
  role: string,
  root: string,
  ownerIssuedQuestionId: string,
  lineageFixtureRoot: string,
  expectedSeedDigest: string,
  encodedA?: string,
  encodedB?: string,
): Promise<WorkerResult> {
  bindOwnerIssuedQuestion(ownerIssuedQuestionId);
  assert.ok(
    path.basename(root).startsWith("discovery-leadership-conversation-replay-"),
  );
  const result =
    role === "prepare-and-freeze"
      ? await processA(root, lineageFixtureRoot)
      : role === "legacy-prepare-and-freeze"
        ? await processLegacyEvidenceA(root, lineageFixtureRoot)
      : role === "capture-and-review"
        ? await processB(root, lineageFixtureRoot, encodedA!)
        : role === "legacy-capture-and-review"
          ? await processLegacyEvidenceB(root, encodedA!)
          : role === "legacy-route-actual-owners"
            ? await processLegacyEvidenceC(root, lineageFixtureRoot, expectedSeedDigest, encodedA!, encodedB!)
            : role === "legacy-operation-linked-ambiguity"
              ? await processLegacyEvidenceC(root, lineageFixtureRoot, expectedSeedDigest, encodedA!, encodedB!, true)
        : role === "route-actual-owners-and-prepare-again"
          ? await processC(
              root,
              lineageFixtureRoot,
              expectedSeedDigest,
              encodedA!,
              encodedB!,
            )
          : role === "operation-linked-ambiguity"
            ? await processC(
                root,
                lineageFixtureRoot,
                expectedSeedDigest,
                encodedA!,
                encodedB!,
                true,
              )
            : role === "reload-direct-evidence-successor"
              ? await processD(root, lineageFixtureRoot, encodedA!)
              : null;
  if (!result) throw new Error("unknown process role");
  return { ...result, observations: observedEvents };
}

async function readReplayTaskSecret(
  input: ReplayTaskAuthorityInputV1,
): Promise<Buffer> {
  const root = await realpath(input.root),
    secretPath = await realpath(input.secretPath);
  const relative = path.relative(root, secretPath);
  assert.ok(
    relative && relative !== ".." && !relative.startsWith(`..${path.sep}`),
  );
  const handle = await open(
    secretPath,
    constants.O_RDONLY | constants.O_NOFOLLOW,
  );
  try {
    const status = await handle.stat();
    assert.ok(status.isFile() && !status.isSymbolicLink());
    assert.equal(status.mode & 0o777, 0o600);
    const secret = await handle.readFile();
    assert.equal(secret.length, 32);
    return secret;
  } finally {
    await handle.close();
  }
}

async function validateReplayTaskAuthority(
  input: ReplayTaskAuthorityInputV1,
): Promise<ReplayExecutionAuthorityV1> {
  const secret = await readReplayTaskSecret(input);
  try {
    const validated = await validateAuthenticatedAlphaTaskOwnershipV1({
      schemaVersion: input.schemaVersion,
      root: input.root,
      manifestPath: input.manifestPath,
      secret,
      framework: input.framework,
      profile: input.profile,
      sourceDigest: input.sourceDigest,
      taskDigest: input.taskDigest,
      runDigest: input.runDigest,
    });
    assert.equal(
      validated.profile.profile.id,
      "ar5b-authenticated-recovery-conformance",
    );
    assert.equal(validated.profile.profile.version, "version-1");
    assert.ok(
      validated.manifest.resources.some((value) => value.kind === "task-root"),
    );
    assert.ok(
      validated.manifest.resources.filter(
        (value) => value.kind === "protected-file",
      ).length >= 2,
    );
    const root = await realpath(validated.root),
      secretPath = await realpath(input.secretPath),
      resultParent = await realpath(path.dirname(input.joinedResultPath));
    assert.notEqual(
      path.resolve(input.secretPath),
      path.resolve(input.joinedResultPath),
    );
    const secretRelative = path.relative(root, secretPath);
    assert.ok(
      secretRelative &&
        !secretRelative.startsWith(`..${path.sep}`) &&
        secretRelative !== "..",
    );
    assert.equal(resultParent, root);
    const taskAuthorityDigest = digest({
      manifestDigest: acceptanceTaskManifestDigest(validated.manifest),
      resourcePlanDigest: validated.resourcePlanDigest,
      sourceDigest: validated.sourceDigest,
      taskDigest: validated.taskDigest,
      runDigest: validated.runDigest,
      framework: validated.framework,
      profile: validated.profile.profile,
      recipe: "leadership-conversation-joined-replay-v1",
      processTopology: "existing-multiprocess-replay-topology-v1",
    });
    const delegation = generateKeyPairSync("ed25519");
    return Object.freeze({
      input,
      taskAuthorityDigest,
      resourcePlanDigest: validated.resourcePlanDigest,
      delegationPrivateKey: delegation.privateKey,
      delegationPublicKey: delegation.publicKey
        .export({ type: "spki", format: "der" })
        .toString("base64"),
    });
  } finally {
    secret.fill(0);
  }
}

async function publishJoinedReplayResult(
  file: string,
  value: unknown,
): Promise<void> {
  const candidate = `${file}.${randomBytes(16).toString("hex")}.candidate`,
    bytes = Buffer.from(JSON.stringify(value));
  const handle = await open(
    candidate,
    constants.O_CREAT |
      constants.O_EXCL |
      constants.O_WRONLY |
      constants.O_NOFOLLOW,
    0o600,
  );
  try {
    await handle.writeFile(bytes);
    await handle.sync();
  } finally {
    await handle.close();
  }
  await import("node:fs/promises").then((fs) => fs.rename(candidate, file));
  const directory = await open(path.dirname(file), "r");
  try {
    await directory.sync();
  } finally {
    await directory.close();
  }
  const verifyHandle = await open(
    file,
    constants.O_RDONLY | constants.O_NOFOLLOW,
  );
  try {
    const status = await verifyHandle.stat();
    assert.ok(status.isFile() && !status.isSymbolicLink());
    assert.equal(status.mode & 0o777, 0o600);
    assert.deepEqual(await verifyHandle.readFile(), bytes);
  } finally {
    await verifyHandle.close();
  }
}

async function executeStandaloneHistoricalWorker(
  root: string,
  role: string,
  lineageFixtureRoot: string | null,
  expectedSeedDigest: string | null,
  handoffs: SafeHandoff[],
): Promise<WorkerResult> {
  assert.equal(activeStandaloneCapability, standaloneHistoricalCapability);
  const args = [
      "--conditions=react-server",
      ...process.execArgv.filter(
        (argument) => argument !== "--conditions=react-server",
      ),
      import.meta.filename,
      "--worker",
      role,
      root,
      questionId,
      lineageFixtureRoot ?? "-",
      expectedSeedDigest ?? "-",
      ...handoffs.map((item) =>
        Buffer.from(JSON.stringify(item)).toString("base64url"),
      ),
    ],
    { stdout, stderr } = await runFile(process.execPath, args, {
      cwd: process.cwd(),
      env: {
        PATH: process.env.PATH ?? "",
        NODE_PATH: process.env.NODE_PATH ?? "",
        NODE_ENV: "test",
        TZ: "UTC",
        LANG: "C",
        TMPDIR: tmpdir(),
        AR3_OBSERVER_MODE: process.env.AR3_OBSERVER_MODE ?? "enabled",
        ...(process.env.DISCOVERY_ALPHA_TELEMETRY_ROOT
          ? {
              DISCOVERY_ALPHA_TELEMETRY_ROOT:
                process.env.DISCOVERY_ALPHA_TELEMETRY_ROOT,
            }
          : {}),
        ...(process.env.DISCOVERY_ALPHA_TELEMETRY_ACTIVE_KEY_VERSION
          ? {
              DISCOVERY_ALPHA_TELEMETRY_ACTIVE_KEY_VERSION:
                process.env.DISCOVERY_ALPHA_TELEMETRY_ACTIVE_KEY_VERSION,
            }
          : {}),
        ...(process.env.DISCOVERY_ALPHA_TELEMETRY_KEY_RING_JSON
          ? {
              DISCOVERY_ALPHA_TELEMETRY_KEY_RING_JSON:
                process.env.DISCOVERY_ALPHA_TELEMETRY_KEY_RING_JSON,
            }
          : {}),
        ...(process.env.DISCOVERY_ENV
          ? { DISCOVERY_ENV: process.env.DISCOVERY_ENV }
          : {}),
      },
      timeout: 30_000,
      maxBuffer: 128 * 1024,
      shell: false,
    });
  assert.equal(stderr, "");
  const parsed = JSON.parse(stdout) as WorkerResult;
  assert.equal(Object.hasOwn(parsed, "taskAuthorityDigest"), false);
  return parsed;
}

async function execute(
  root: string,
  role: string,
  lineageFixtureRoot: string | null,
  expectedSeedDigest: string | null,
  ...handoffs: SafeHandoff[]
): Promise<WorkerResult> {
  if (activeStandaloneCapability === standaloneHistoricalCapability)
    return executeStandaloneHistoricalWorker(
      root,
      role,
      lineageFixtureRoot,
      expectedSeedDigest,
      handoffs,
    );
  assert.ok(activeReplayAuthority);
  const challenge = randomBytes(32).toString("hex"),
    child = fork(import.meta.filename, ["--worker-ipc"], {
      cwd: process.cwd(),
      execArgv: ["--conditions=react-server", "--import", "tsx"],
      env: {
        PATH: process.env.PATH ?? "",
        NODE_PATH: process.env.NODE_PATH ?? "",
        NODE_ENV: "test",
        TZ: "UTC",
        LANG: "C",
        TMPDIR: tmpdir(),
        AR3_OBSERVER_MODE: process.env.AR3_OBSERVER_MODE ?? "enabled",
        ...(process.env.DISCOVERY_ALPHA_TELEMETRY_ROOT
          ? {
              DISCOVERY_ALPHA_TELEMETRY_ROOT:
                process.env.DISCOVERY_ALPHA_TELEMETRY_ROOT,
            }
          : {}),
        ...(process.env.DISCOVERY_ALPHA_TELEMETRY_ACTIVE_KEY_VERSION
          ? {
              DISCOVERY_ALPHA_TELEMETRY_ACTIVE_KEY_VERSION:
                process.env.DISCOVERY_ALPHA_TELEMETRY_ACTIVE_KEY_VERSION,
            }
          : {}),
        ...(process.env.DISCOVERY_ALPHA_TELEMETRY_KEY_RING_JSON
          ? {
              DISCOVERY_ALPHA_TELEMETRY_KEY_RING_JSON:
                process.env.DISCOVERY_ALPHA_TELEMETRY_KEY_RING_JSON,
            }
          : {}),
        ...(process.env.DISCOVERY_ENV
          ? { DISCOVERY_ENV: process.env.DISCOVERY_ENV }
          : {}),
      },
      stdio: ["ignore", "ignore", "ignore", "ipc"],
    });
  assert.ok(child.pid);
  const parsed = await new Promise<WorkerResult>((resolve, reject) => {
    const messages: unknown[] = [];
    const timer = setTimeout(() => {
      child.kill("SIGTERM");
      reject(new Error("Replay worker timed out"));
    }, 30_000);
    child.on("message", (message) => messages.push(message));
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      clearTimeout(timer);
      try {
        assert.equal(code, 0);
        assert.equal(signal, null);
        assert.equal(messages.length, 1);
        const frame = messages[0] as Record<string, unknown>;
        const succeeded = frame.kind === "leadership-replay-worker-result";
        assert.deepEqual(
          Object.keys(frame).sort(),
          (succeeded
            ? [
                "challenge",
                "executionNonce",
                "kind",
                "pid",
                "ppid",
                "result",
                "resultDigest",
                "role",
                "taskAuthorityDigest",
              ]
            : [
                "challenge",
                "executionNonce",
                "failureCategory",
                "kind",
                "pid",
                "ppid",
                "resultDigest",
                "role",
                "taskAuthorityDigest",
              ]
          ).sort(),
        );
        assert.ok(
          succeeded || frame.kind === "leadership-replay-worker-failure",
        );
        assert.equal(frame.pid, child.pid);
        assert.equal(frame.ppid, process.pid);
        assert.equal(frame.challenge, challenge);
        assert.equal(frame.role, role);
        assert.equal(
          frame.taskAuthorityDigest,
          activeReplayAuthority!.taskAuthorityDigest,
        );
        assert.match(String(frame.executionNonce), /^[a-f0-9]{64}$/);
        const { resultDigest, ...unsigned } = frame;
        assert.equal(resultDigest, digest(unsigned));
        activeExecutionSegmentDigests.push(
          digest({
            role,
            processBinding: digest({
              pid: frame.pid,
              ppid: frame.ppid,
              challenge: frame.challenge,
              executionNonce: frame.executionNonce,
            }),
            taskAuthorityDigest: frame.taskAuthorityDigest,
            resultDigest,
          }),
        );
        if (!succeeded) {
          assert.equal(frame.failureCategory, "owner-validation-rejected");
          throw new Error("Replay owner validation rejected the operation");
        }
        resolve(frame.result as WorkerResult);
      } catch (error) {
        reject(error);
      }
    });
    const delegationPayload = {
      challenge,
      role,
      root,
      lineageFixtureRoot: lineageFixtureRoot ?? "-",
      taskAuthorityDigest: activeReplayAuthority!.taskAuthorityDigest,
    };
    child.send({
      kind: "leadership-replay-worker-request",
      challenge,
      role,
      root,
      ownerIssuedQuestionId: questionId,
      lineageFixtureRoot: lineageFixtureRoot ?? "-",
      expectedSeedDigest: expectedSeedDigest ?? "-",
      handoffs,
      authorityRoot: activeReplayAuthority!.input.root,
      expectedTaskAuthorityDigest: activeReplayAuthority!.taskAuthorityDigest,
      delegationPublicKey: activeReplayAuthority!.delegationPublicKey,
      delegationSignature: sign(
        null,
        Buffer.from(digest(delegationPayload), "hex"),
        activeReplayAuthority!.delegationPrivateKey,
      ).toString("base64"),
    });
  });
  assert.deepEqual(Object.keys(parsed).sort(), [
    "assertions",
    "handoff",
    "observations",
    "role",
  ]);
  assert.ok(
    Array.isArray(parsed.assertions) &&
      parsed.assertions.every((item) => typeof item === "string"),
  );
  assert.equal(
    parsed.handoff.handoffDigest,
    digest(
      Object.fromEntries(
        Object.entries(parsed.handoff).filter(
          ([key]) => key !== "handoffDigest",
        ),
      ),
    ),
  );
  return parsed;
}

async function ipcWorker(): Promise<void> {
  process.once("message", async (raw) => {
    try {
      const request = raw as {
        kind: string;
        challenge: string;
        role: string;
        root: string;
        ownerIssuedQuestionId: string;
        lineageFixtureRoot: string;
        expectedSeedDigest: string;
        handoffs: SafeHandoff[];
        authorityRoot: string;
        expectedTaskAuthorityDigest: string;
        delegationPublicKey: string;
        delegationSignature: string;
      };
      assert.equal(request.kind, "leadership-replay-worker-request");
      assert.match(request.challenge, /^[a-f0-9]{64}$/);
      assert.match(request.expectedTaskAuthorityDigest, /^[a-f0-9]{64}$/);
      const delegationPayload = {
        challenge: request.challenge,
        role: request.role,
        root: request.root,
        lineageFixtureRoot: request.lineageFixtureRoot,
        taskAuthorityDigest: request.expectedTaskAuthorityDigest,
      };
      assert.equal(
        verify(
          null,
          Buffer.from(digest(delegationPayload), "hex"),
          createPublicKey({
            key: Buffer.from(request.delegationPublicKey, "base64"),
            type: "spki",
            format: "der",
          }),
          Buffer.from(request.delegationSignature, "base64"),
        ),
        true,
      );
      const authorityRoot = await realpath(request.authorityRoot),
        workerRoot = await realpath(request.root),
        workerRelative = path.relative(authorityRoot, workerRoot);
      assert.ok(
        workerRelative &&
          !workerRelative.startsWith(`..${path.sep}`) &&
          workerRelative !== "..",
      );
      if (request.lineageFixtureRoot !== "-") {
        const lineageRoot = await realpath(request.lineageFixtureRoot),
          lineageRelative = path.relative(authorityRoot, lineageRoot);
        assert.ok(
          lineageRelative &&
            !lineageRelative.startsWith(`..${path.sep}`) &&
            lineageRelative !== "..",
        );
      }
      const originalInfo = console.info,
        originalLog = console.log;
      console.info = () => {};
      console.log = () => {};
      let result: WorkerResult;
      try {
        result = await worker(
          request.role,
          request.root,
          request.ownerIssuedQuestionId,
          request.lineageFixtureRoot,
          request.expectedSeedDigest,
          request.handoffs[0]
            ? Buffer.from(JSON.stringify(request.handoffs[0])).toString(
                "base64url",
              )
            : undefined,
          request.handoffs[1]
            ? Buffer.from(JSON.stringify(request.handoffs[1])).toString(
                "base64url",
              )
            : undefined,
        );
      } catch {
        const failed = {
          kind: "leadership-replay-worker-failure" as const,
          pid: process.pid,
          ppid: process.ppid,
          challenge: request.challenge,
          role: request.role,
          executionNonce: randomBytes(32).toString("hex"),
          taskAuthorityDigest: request.expectedTaskAuthorityDigest,
          failureCategory: "owner-validation-rejected" as const,
        };
        process.send?.({ ...failed, resultDigest: digest(failed) }, () =>
          process.exit(0),
        );
        return;
      } finally {
        console.info = originalInfo;
        console.log = originalLog;
      }
      const unsigned = {
        kind: "leadership-replay-worker-result" as const,
        pid: process.pid,
        ppid: process.ppid,
        challenge: request.challenge,
        role: request.role,
        executionNonce: randomBytes(32).toString("hex"),
        taskAuthorityDigest: request.expectedTaskAuthorityDigest,
        result,
      };
      process.send?.({ ...unsigned, resultDigest: digest(unsigned) }, () =>
        process.exit(0),
      );
    } catch {
      process.exit(1);
    }
  });
}

async function main(forceValidation = false) {
  if (!forceValidation && process.argv.includes("--worker-ipc")) {
    await ipcWorker();
    return;
  }
  if (!forceValidation && process.argv.includes("--worker")) {
    const index = process.argv.indexOf("--worker");
    const originalInfo = console.info,
      originalLog = console.log;
    console.info = () => {};
    console.log = () => {};
    try {
      process.stdout.write(
        JSON.stringify(
          await worker(
            process.argv[index + 1]!,
            process.argv[index + 2]!,
            process.argv[index + 3]!,
            process.argv[index + 4]!,
            process.argv[index + 5]!,
            process.argv[index + 6],
            process.argv[index + 7],
          ),
        ),
      );
    } finally {
      console.info = originalInfo;
      console.log = originalLog;
    }
    return;
  }
  if (forceValidation) {
    assert.ok(activeReplayAuthority);
    activeStandaloneCapability = undefined;
  } else {
    assert.equal(activeReplayAuthority, undefined);
    activeStandaloneCapability = standaloneHistoricalCapability;
  }
  activeExecutionSegmentDigests = [];
  let checks = 0;
  const rootBase = activeReplayAuthority?.input.root ?? tmpdir();
  const root = await mkdtemp(
    path.join(rootBase, "discovery-leadership-conversation-replay-"),
  );
  const lineageFixtureRoot = await mkdtemp(
    path.join(rootBase, "discovery-northstar-preparation-lineage-"),
  );
  try {
    const evaluationScope = {
      organizationId: fixture.organizationId,
      type: "organization" as const,
      id: fixture.organizationId,
    };
    const evaluationContext = resolveScopedGovernanceContext({
      organizationId: fixture.organizationId,
      subjectId: fixture.actorId,
      requestedScope: evaluationScope,
      operation: CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION,
      purpose: fixture.purposeRef,
      sensitivity: "standard",
      evaluatedAt: fixture.at,
      temporal: { mode: "current" },
      serverResolvedAuthority: [
        {
          authorityRef: "authority:replay:evaluation",
          policyRef: "policy:replay:evaluation",
          organizationId: fixture.organizationId,
          subjectId: fixture.actorId,
          scope: evaluationScope,
          operations: [
            CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION,
          ],
          sensitivity: ["standard"],
          relationship: "direct",
          status: "active",
          validFrom: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    assert.equal(evaluationContext.disposition, "authorized");
    checks++;
    const confidenceOnlyContext = resolveScopedGovernanceContext({
      organizationId: fixture.organizationId,
      subjectId: fixture.actorId,
      requestedScope: evaluationScope,
      operation: CANONICAL_UNDERSTANDING_COMPOSITION_EVALUATION_OPERATION,
      purpose: fixture.purposeRef,
      sensitivity: "standard",
      evaluatedAt: fixture.at,
      temporal: { mode: "current" },
      serverResolvedAuthority: [
        {
          authorityRef: "authority:replay:confidence",
          policyRef: "policy:replay:confidence",
          organizationId: fixture.organizationId,
          subjectId: fixture.actorId,
          scope: evaluationScope,
          operations: [CANONICAL_UNDERSTANDING_REVISION_OPERATION],
          sensitivity: ["standard"],
          relationship: "direct",
          status: "active",
          validFrom: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    assert.equal(confidenceOnlyContext.disposition, "denied");
    checks++;
    const provisioned = await provisionNorthstarPreparationLineageFixture({
      environment: "test",
      fixtureRoot: lineageFixtureRoot,
      now: fixture.at,
    });
    bindOwnerIssuedQuestion(provisioned.seed.productQuestionId);
    assert.equal(provisioned.disposition, "provisioned");
    checks++;
    assert.ok(
      provisioned.counts.sources > 0 &&
        provisioned.counts.material > 0 &&
        provisioned.counts.understandings > 0,
    );
    checks++;
    await cp(
      path.join(lineageFixtureRoot, "discovery-governed-source-content-northstar-preparation"),
      roots(root).sourceContentRoot,
      { recursive: true },
    );
    await cp(path.join(lineageFixtureRoot, "runtime"), roots(root).runtimeRoot, { recursive: true });
    const a = await execute(
      root,
      "prepare-and-freeze",
      lineageFixtureRoot,
      provisioned.seed.seedDigest,
    );
    checks += a.assertions.length;
    const b = await execute(root, "capture-and-review", lineageFixtureRoot, provisioned.seed.seedDigest, a.handoff);
    checks += b.assertions.length;
    const resign = (
      value: SafeHandoff,
      changes: Record<string, unknown>,
    ): SafeHandoff => {
      const { handoffDigest: _old, ...unsigned } = { ...value, ...changes };
      return { ...unsigned, handoffDigest: digest(unsigned) };
    };
    const reject = async (attempt: () => Promise<unknown>) => {
      await assert.rejects(attempt);
      checks += 1;
    };
    const cArgs = [lineageFixtureRoot, provisioned.seed.seedDigest] as const;
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        { ...a.handoff, handoffDigest: "0".repeat(64) },
        b.handoff,
      ),
    );
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        a.handoff,
        resign(b.handoff, { productWorkflowRepositoryRevision: "stale" }),
      ),
    );
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        a.handoff,
        resign(b.handoff, { runtimeRepositoryRevision: "stale" }),
      ),
    );
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        a.handoff,
        resign(b.handoff, { sourceContentRepositoryRevision: "stale" }),
      ),
    );
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        resign(a.handoff, { frozenSnapshotDigest: "0".repeat(64) }),
        b.handoff,
      ),
    );
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        a.handoff,
        resign(b.handoff, { sourceBindingVersion: 999 }),
      ),
    );
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        a.handoff,
        resign(b.handoff, { exactContentDigest: "0".repeat(64) }),
      ),
    );
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        a.handoff,
        resign(b.handoff, {
          proposals: [
            {
              proposalId: "wrong",
              kind: "evidence-candidate",
              payloadDigest: "0".repeat(64),
            },
          ],
        }),
      ),
    );
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        a.handoff,
        resign(b.handoff, { dispositions: [] }),
      ),
    );
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        resign(a.handoff, { organizationId: "cross-organization" }),
        b.handoff,
      ),
    );
    await reject(() =>
      execute(
        root,
        "route-actual-owners-and-prepare-again",
        ...cArgs,
        resign(a.handoff, { questionId: "wrong-question" }),
        b.handoff,
      ),
    );
    const wrongRoot = await mkdtemp(
      path.join(rootBase, "discovery-leadership-conversation-replay-"),
    );
    try {
      await reject(() =>
        execute(
          wrongRoot,
          "route-actual-owners-and-prepare-again",
          ...cArgs,
          a.handoff,
          b.handoff,
        ),
      );
    } finally {
      await rm(wrongRoot, { recursive: true, force: true });
    }
    const missingLineageRoot = await mkdtemp(
      path.join(rootBase, "discovery-northstar-preparation-lineage-"),
    );
    try {
      await reject(() =>
        execute(
          root,
          "route-actual-owners-and-prepare-again",
          missingLineageRoot,
          provisioned.seed.seedDigest,
          a.handoff,
          b.handoff,
        ),
      );
    } finally {
      await rm(missingLineageRoot, { recursive: true, force: true });
    }
    const c = await execute(
      root,
      "route-actual-owners-and-prepare-again",
      ...cArgs,
      a.handoff,
      b.handoff,
    );
    checks += c.assertions.length;
    assert.equal(c.handoff.processAHandoffDigest, a.handoff.handoffDigest);
    checks++;
    assert.equal(c.handoff.processBHandoffDigest, b.handoff.handoffDigest);
    checks++;
    const d = await execute(
      root,
      "reload-direct-evidence-successor",
      lineageFixtureRoot,
      null,
      c.handoff,
    );
    checks += d.assertions.length;
    process.env.AR3_OBSERVER_MODE = "disabled";
    const disabled = await execute(
      root,
      "reload-direct-evidence-successor",
      lineageFixtureRoot,
      null,
      c.handoff,
    );
    process.env.AR3_OBSERVER_MODE = "throwing";
    const throwing = await execute(
      root,
      "reload-direct-evidence-successor",
      lineageFixtureRoot,
      null,
      c.handoff,
    );
    delete process.env.AR3_OBSERVER_MODE;
    assert.deepEqual(disabled.handoff, d.handoff);
    assert.deepEqual(throwing.handoff, d.handoff);
    assert.equal(disabled.observations?.length, 0);
    assert.equal(throwing.observations?.length, 0);
    checks += 4;
    const occurrenceActions = await readFile(
        "app/product-alpha/leadership-conversation/actions.ts",
        "utf8",
      ),
      experience = await readFile(
        "components/product-alpha/leadership-conversation/LeadershipConversationExperience.tsx",
        "utf8",
      ),
      telemetryOwner = await readFile(
        "lib/telemetry/alphaProductTelemetryOwner.ts",
        "utf8",
      );
    assert.match(
      occurrenceActions,
      /dispositionOccurrence1CarryForwardAction[\s\S]*server\.review[\s\S]*server\.routeApproved/,
    );
    assert.match(experience, /Confirm what Discovery should carry forward/);
    assert.match(telemetryOwner, /return"repository-unavailable"/);
    assert.doesNotMatch(telemetryOwner, /throw new Error/);
    checks += 4;
    const ambiguousRoot = await mkdtemp(
      path.join(rootBase, "discovery-leadership-conversation-replay-"),
    );
    try {
      await cp(
        path.join(lineageFixtureRoot, "discovery-governed-source-content-northstar-preparation"),
        roots(ambiguousRoot).sourceContentRoot,
        { recursive: true },
      );
      await cp(path.join(lineageFixtureRoot, "runtime"), roots(ambiguousRoot).runtimeRoot, { recursive: true });
      const ambiguousA = await execute(
          ambiguousRoot,
          "prepare-and-freeze",
          lineageFixtureRoot,
          provisioned.seed.seedDigest,
        ),
        ambiguousB = await execute(
          ambiguousRoot,
          "capture-and-review",
          lineageFixtureRoot,
          provisioned.seed.seedDigest,
          ambiguousA.handoff,
        ),
        ambiguous = await execute(
          ambiguousRoot,
          "operation-linked-ambiguity",
          ...cArgs,
          ambiguousA.handoff,
          ambiguousB.handoff,
        );
      checks += ambiguous.assertions.length;
    } finally {
      await rm(ambiguousRoot, { recursive: true, force: true });
    }
    const runLegacyEvidenceScenario = async (ambiguousEvidence: boolean) => {
      const legacyRoot = await mkdtemp(path.join(rootBase, "discovery-leadership-conversation-replay-"));
      try {
        await cp(path.join(lineageFixtureRoot, "discovery-governed-source-content-northstar-preparation"), roots(legacyRoot).sourceContentRoot, { recursive: true });
        const legacyA = await execute(legacyRoot, "legacy-prepare-and-freeze", lineageFixtureRoot, provisioned.seed.seedDigest),
          legacyB = await execute(legacyRoot, "legacy-capture-and-review", lineageFixtureRoot, provisioned.seed.seedDigest, legacyA.handoff),
          legacyC = await execute(legacyRoot, ambiguousEvidence ? "legacy-operation-linked-ambiguity" : "legacy-route-actual-owners", lineageFixtureRoot, provisioned.seed.seedDigest, legacyA.handoff, legacyB.handoff);
        checks += legacyA.assertions.length + legacyB.assertions.length + legacyC.assertions.length;
        assert.equal(legacyC.handoff.processAHandoffDigest, legacyA.handoff.handoffDigest);
        assert.equal(legacyC.handoff.processBHandoffDigest, legacyB.handoff.handoffDigest);
        checks += 2;
        return { legacyA, legacyB, legacyC };
      } finally {
        await rm(legacyRoot, { recursive: true, force: true });
      }
    };
    const legacyEvidence = await runLegacyEvidenceScenario(false), legacyEvidenceAmbiguity = await runLegacyEvidenceScenario(true);
    const observations = [
      ...(a.observations ?? []),
      ...(b.observations ?? []),
      ...(c.observations ?? []),
      ...(d.observations ?? []),
      ...(legacyEvidence.legacyA.observations ?? []),
      ...(legacyEvidence.legacyB.observations ?? []),
      ...(legacyEvidence.legacyC.observations ?? []),
      ...(legacyEvidenceAmbiguity.legacyA.observations ?? []),
      ...(legacyEvidenceAmbiguity.legacyB.observations ?? []),
      ...(legacyEvidenceAmbiguity.legacyC.observations ?? []),
    ];
    const inventoryFamilies = c.handoff.inventoryFamilies as Record<
      string,
      number
    >;
    const expectedNonzeroFamilies = [
      "occurrences",
      "preparedPublications",
      "frozenPublications",
      "publicationReceipts",
      "capturePublications",
      "captureReceipts",
      "whatChangedPublications",
      "futurePreparationLinks",
      "routingLinks",
      "idempotencyRecords",
      "closures",
      "reviewedCompletions",
      "reviewedProposals",
      "events",
    ] as const;
    const missingFindingIds = expectedNonzeroFamilies.filter(
      (family) =>
        !Number.isSafeInteger(inventoryFamilies[family]) ||
        inventoryFamilies[family]! <= 0,
    );
    for (const zeroFamily of [
      "contributionPublications",
      "contributionReceipts",
    ] as const)
      if (inventoryFamilies[zeroFamily] !== 0)
        missingFindingIds.push(zeroFamily as never);
    assert.deepEqual(missingFindingIds, []);
    assert.equal(c.handoff.foreignStatePreserved, true);
    return {
      validation: "leadership-conversation-replay-001",
      result: "PASS",
      checks,
      freshProcesses: 23,
      processA: "persisted",
      processB: "loaded-a-and-persisted-capture-review",
      processC: "loaded-a-b-and-executed-actual-owners",
      processD: "reloaded-direct-evidence-successor",
      northstarFixtureProvisionerInvocations: 1,
      processCSeedIntegrityReloads: 1,
      processCHiddenProvisioningInvocations: 0,
      missingLineageFailsClosed: true,
      reviewedCarryForwardCandidate: "deterministic-five-kind-owner-path",
      reviewedCarryForwardCompletion: "durable-owner-issued",
      legacyEvidenceOwnerReplay: "actual-class-2-separate-root",
      legacyEvidenceInventory: legacyEvidence.legacyC.handoff.inventoryFamilies,
      productDecisionDraft: "actual-service",
      additionalOwner: "actual-unknown",
      futurePreparation: "persisted",
      idempotentReentry: "passed",
      negativeBindingControls: 13,
      handoffDigestsVerified: true,
      canonicalComposition: true,
      stubbedPositiveOwners: false,
      boundedEnvironment: true,
      shell: false,
      timeoutMilliseconds: 30000,
      networkCalls: 0,
      connectorCalls: 0,
      driveReads: 0,
      driveWrites: 0,
      productionAccess: 0,
      deployments: 0,
      inventory: {
        families: inventoryFamilies,
        duplicateFindings: c.handoff.duplicateInventoryFindings,
        missingFindings: missingFindingIds.length,
        foreignPreserved: c.handoff.foreignStatePreserved,
        foreignStateDigest: c.handoff.foreignStateDigest,
      },
      observerModes: {
        productOutputDigests: [d, disabled, throwing].map((value) =>
          digest(value.handoff),
        ),
        durableStateDigests: [d, disabled, throwing].map((value) =>
          digest({
            workflowRevision: value.handoff.workflowRevision,
            artifactVersionId: value.handoff.artifactVersionId,
          }),
        ),
        eventInventoryDigests: [d, disabled, throwing].map((value) =>
          digest(value.observations ?? []),
        ),
        eventCounts: [d, disabled, throwing].map(
          (value) => (value.observations ?? []).length,
        ),
      },
      observability: {
        eventCount: observations.length,
        neutralityCaseCount: c.handoff.neutralityCaseCount,
        stages: [...new Set(observations.map((value) => value.workflowStage))],
        categories: [
          ...new Set(observations.map((value) => value.eventCategory)),
        ],
        segments: [a, b, c, d].map((result, index) => ({
          segment: index + 1,
          events: (result.observations ?? []).map(
            ({ correlation, ...event }) => ({
              ...event,
              correlation: `run-${index + 1}`,
            }),
          ),
        })),
        freshProcess: true,
      },
    } as const;
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(lineageFixtureRoot, { recursive: true, force: true });
    await assert.rejects(() =>
      import("node:fs/promises").then((fs) => fs.lstat(root)),
    );
    await assert.rejects(() =>
      import("node:fs/promises").then((fs) => fs.lstat(lineageFixtureRoot)),
    );
    if (!forceValidation) activeStandaloneCapability = undefined;
  }
}

export async function measureLeadershipConversationReplayJoinedInventory(
  input: ReplayTaskAuthorityInputV1,
) {
  assert.equal(
    input.profile.profile.id,
    "ar5b-authenticated-recovery-conformance",
  );
  assert.equal(input.profile.profile.version, "version-1");
  const authority = await validateReplayTaskAuthority(input);
  activeReplayAuthority = authority;
  let result: Awaited<ReturnType<typeof main>>;
  try {
    result = await main(true);
  } finally {
    activeReplayAuthority = undefined;
  }
  assert.ok(result);
  assert.equal(activeExecutionSegmentDigests.length, 22);
  assert.equal(new Set(activeExecutionSegmentDigests).size, 22);
  assert.equal(result.inventory.duplicateFindings, 0);
  assert.equal(result.inventory.missingFindings, 0);
  assert.equal(result.inventory.foreignPreserved, true);
  assert.match(String(result.inventory.foreignStateDigest), /^[a-f0-9]{64}$/);
  const observerModes = result.observerModes,
    productOutputMatched =
      new Set(observerModes.productOutputDigests).size === 1,
    durableStateMatched = new Set(observerModes.durableStateDigests).size === 1,
    observerFailureContained =
      observerModes.eventCounts[1] === 0 && observerModes.eventCounts[2] === 0;
  const eventSegments = result.observability.segments,
    orderingFindings = eventSegments.reduce(
      (total, segment) =>
        total +
        segment.events.filter((event, index) => event.sequence !== index + 1)
          .length,
      0,
    ),
    pairingFindings = eventSegments.reduce(
      (total, segment) =>
        total +
        segment.events.filter(
          (event, index) =>
            event.transitionCategory === "attempted" &&
            !segment.events
              .slice(index + 1)
              .some(
                (candidate) =>
                  candidate.workflowStage === event.workflowStage &&
                  candidate.transitionCategory !== "attempted",
              ),
        ).length,
      0,
    );
  assert.equal(orderingFindings, 0);
  assert.equal(pairingFindings, 0);
  assert.ok(
    productOutputMatched && durableStateMatched && observerFailureContained,
  );
  const unsigned = {
    schemaVersion: "1" as const,
    owner: "leadership-conversation-replay-joined-inventory" as const,
    executionAuthorityCategory:
      "foundation-v1-2-task-authorized-measurement" as const,
    taskAuthorityDigest: authority.taskAuthorityDigest,
    sourceDigest: input.sourceDigest,
    taskDigest: input.taskDigest,
    runDigest: input.runDigest,
    profileDigest: digest(input.profile),
    recipe: "leadership-conversation-joined-replay-v1" as const,
    processTopology: "existing-multiprocess-replay-topology-v1" as const,
    executionSegmentDigest: digest(activeExecutionSegmentDigests),
    executionSegmentCount: activeExecutionSegmentDigests.length,
    familyCount: Object.keys(result.inventory.families).length,
    inventoryDigest: digest(result.inventory.families),
    duplicateFindings: result.inventory.duplicateFindings,
    missingFindings: result.inventory.missingFindings,
    foreignPreserved: result.inventory.foreignPreserved,
    foreignStateDigest: result.inventory.foreignStateDigest as string,
    observerModeProductOutputDigest: digest(observerModes.productOutputDigests),
    observerModeDurableStateDigest: digest(observerModes.durableStateDigests),
    observerModeEventInventoryDigest: digest(
      observerModes.eventInventoryDigests,
    ),
    observerParityCategory: "measured-match" as const,
    eventCount: result.observability.eventCount,
    eventOrderingFindings: orderingFindings,
    eventPairingFindings: pairingFindings,
    cleanupCategory: "path-8-local-zero" as const,
  };
  const measured = { ...unsigned, measurementDigest: digest(unsigned) };
  await publishJoinedReplayResult(input.joinedResultPath, measured);
  return measured;
}

if (
  process.argv[1] &&
  import.meta.url === new URL(`file://${process.argv[1]}`).href
)
  void main().then((result) => {
    if (result) process.stdout.write(`${JSON.stringify(result)}\n`);
  });
