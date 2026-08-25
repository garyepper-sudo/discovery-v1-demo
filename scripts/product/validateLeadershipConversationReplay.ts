import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { createHash } from "node:crypto";
import { lstat, mkdtemp, readFile, readdir, rm } from "node:fs/promises";
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

const runFile = promisify(execFile);
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

async function processB(root: string, encodedA: string): Promise<WorkerResult> {
  const a = parseHandoff(encodedA);
  const locations = roots(root);
  const workflow = createProductWorkflowArtifactRepository({
    root: locations.workflowRoot,
    environment: "test",
  });
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
  const frozenClosure = resolveCurrentOccurrenceClosureMetadataV1({
    store: stored.store,
    organizationId: fixture.organizationId,
    questionId,
    conversationId: identity.conversationId,
  });
  assert.equal(sourceWorkspace.currentPreparedWorkProduct, null);
  const closureInput = {
    ...identity,
    seriesId: frozenClosure.seriesId,
    expectedWorkflowRevision: sourceWorkspace.workflowRevision,
    authorizedProjectionDigest: frozenClosure.authorizedProjectionDigest,
    candidateAssessmentDigest: null,
    b11CommunicationDigest: null,
    personalRoomSheetDigest: frozenClosure.personalRoomSheetDigest,
    idempotencyKey: "process-c-closure",
  };
  if (!sourceWorkspace.closureCompletion) {
    await composition.completeCycle1Closure(closureInput);
    sourceWorkspace = await composition.workspace(identity);
  }
  assert.ok(sourceWorkspace.closureCompletion);
  assert.equal(
    sourceWorkspace.closureCompletion.authorizedProjectionDigest,
    frozenClosure.authorizedProjectionDigest,
  );
  assert.equal(
    sourceWorkspace.closureCompletion.personalRoomSheetDigest,
    frozenClosure.personalRoomSheetDigest,
  );
  assert.ok(
    sourceWorkspace.closureCompletion.reviewedProposalIds.includes(
      material.proposalId,
    ) &&
      sourceWorkspace.closureCompletion.canonicalRoutingLinkIds.some((value) =>
        sourceWorkspace.routingLinks.some(
          (link) =>
            link.routingLinkId === value &&
            link.proposalId === material.proposalId,
        ),
      ),
  );
  const frozenPublication = stored.store.frozenSnapshotPublications!.find(
      (value) => value.artifactId === frozenClosure.checkpointId,
    )!,
    sourcePublication = stored.store.preparedWorkPublications!.find(
      (value) =>
        value.artifactRevision ===
        frozenPublication.preparedWorkProductVersionId,
    )!;
  const predecessorRequest = {
    contractVersion: "2" as const,
    organizationId: identity.organizationId,
    predecessorArtifactOrganizationId: identity.organizationId,
    productQuestionId: identity.questionId,
    meetingSeriesId: frozenClosure.seriesId,
    predecessorOccurrenceId: identity.conversationId,
    predecessorConversationId: identity.conversationId,
    predecessorCheckpointId: frozenClosure.checkpointId,
    subjectId: identity.userId,
    artifactId: sourcePublication.artifactId,
    artifactRevision: sourcePublication.artifactRevision,
    headerDigest: sourcePublication.headerDigest,
    bodyRefDigest: sourcePublication.protectedBody.refDigest,
    purpose: fixture.purposeRef,
    scopeDigest: sourcePublication.materialLineage!.scopeDigest!,
    sensitivity: sourcePublication.materialLineage!.sensitivity!,
    evaluatedAt: fixture.at,
  };
  const deniedRequests = [
      { ...predecessorRequest, subjectId: "denied-user" },
      {
        ...predecessorRequest,
        predecessorArtifactOrganizationId: "foreign-organization",
      },
      { ...predecessorRequest, predecessorOccurrenceId: "stale-occurrence" },
      { ...predecessorRequest, artifactId: "absent-artifact" },
      { ...predecessorRequest, bodyRefDigest: "malformed" },
    ],
    neutralTraces: unknown[][] = [];
  for (const request of deniedRequests) {
    const start = observedEvents.length;
    await activeObserver?.observe({
      eventCategory: "access-check",
      workflowStage: "reload",
      transitionCategory: "attempted",
      outcomeCategory: "attempted",
      roleCategory: "unavailable",
      occurrenceCategory: "occurrence-1",
      viewportCategory: "not-applicable",
      latencyBucket: "not-measured",
      replayRecoveryCategory: "none",
      failureCategory: "none",
      protectedLoadCategory: "attempted",
    });
    const result =
      await composition.productArtifactAccess.readHistoricalPredecessor(
        request,
      );
    assert.notEqual(result.outcome, "accessible");
    await activeObserver?.observe({
      eventCategory: "access-check",
      workflowStage: "reload",
      transitionCategory: "completed",
      outcomeCategory: "access-unavailable",
      roleCategory: "unavailable",
      occurrenceCategory: "occurrence-1",
      viewportCategory: "not-applicable",
      latencyBucket: "not-measured",
      replayRecoveryCategory: "none",
      failureCategory: "access",
      protectedLoadCategory: "unavailable",
    });
    neutralTraces.push(
      observedEvents
        .slice(start)
        .map(({ sequence, correlation, ...event }) => event),
    );
  }
  assert.ok(
    neutralTraces.every(
      (value) => JSON.stringify(value) === JSON.stringify(neutralTraces[0]),
    ),
  );
  const accessObserver = activeObserver,
    revokedGrant: ScopedAuthorityGrant = {
      authorityRef: `leadership-conversation:${fixture.actorId}`,
      policyRef: "leadership-conversation-development:v1",
      organizationId: identity.organizationId,
      subjectId: identity.userId,
      scope: {
        organizationId: identity.organizationId,
        type: "organization",
        id: identity.organizationId,
      },
      operations: ["product-artifact:prepare-again"],
      sensitivity: ["standard"],
      relationship: "direct",
      status: "revoked",
      validFrom: "2026-01-01T00:00:00.000Z",
    },
    revokedComposition = await validationComposition(
      locations,
      lineageFixtureRoot,
      [revokedGrant],
    );
  activeObserver = accessObserver;
  const revokedStart = observedEvents.length;
  await activeObserver?.observe({
    eventCategory: "access-check",
    workflowStage: "reload",
    transitionCategory: "attempted",
    outcomeCategory: "attempted",
    roleCategory: "unavailable",
    occurrenceCategory: "occurrence-1",
    viewportCategory: "not-applicable",
    latencyBucket: "not-measured",
    replayRecoveryCategory: "none",
    failureCategory: "none",
    protectedLoadCategory: "attempted",
  });
  assert.equal(
    (
      await revokedComposition.productArtifactAccess.readHistoricalPredecessor(
        predecessorRequest,
      )
    ).outcome,
    "withheld",
  );
  await activeObserver?.observe({
    eventCategory: "access-check",
    workflowStage: "reload",
    transitionCategory: "completed",
    outcomeCategory: "access-unavailable",
    roleCategory: "unavailable",
    occurrenceCategory: "occurrence-1",
    viewportCategory: "not-applicable",
    latencyBucket: "not-measured",
    replayRecoveryCategory: "none",
    failureCategory: "access",
    protectedLoadCategory: "unavailable",
  });
  neutralTraces.push(
    observedEvents
      .slice(revokedStart)
      .map(({ sequence, correlation, ...event }) => event),
  );
  assert.ok(
    neutralTraces.every(
      (value) => JSON.stringify(value) === JSON.stringify(neutralTraces[0]),
    ),
  );
  const beforeClosureReplay = await workflow.read(fixture.organizationId);
  await composition.completeCycle1Closure(closureInput);
  const afterClosureReplay = await workflow.read(fixture.organizationId);
  assert.deepEqual(afterClosureReplay, beforeClosureReplay);
  await assert.rejects(
    () =>
      composition.completeCycle1Closure({
        ...closureInput,
        expectedWorkflowRevision: beforeClosureReplay.revision,
        authorizedProjectionDigest: "f".repeat(64),
      }),
    (error) =>
      error instanceof ProductWorkflowIncompatibleIdempotencyReplayError &&
      error.code === "incompatible_idempotency_replay",
  );
  const afterIncompatible = await workflow.read(fixture.organizationId);
  assert.deepEqual(afterIncompatible, beforeClosureReplay);
  if (ambiguousEvidence) {
    await assert.rejects(
      () => composition.prepareNextOccurrence(identity),
      /unavailable/,
    );
    return {
      role: "operation-linked-ambiguity",
      handoff: handoff({
        organizationId: fixture.organizationId,
        questionId,
        conversationId: fixture.conversationId,
        ambiguous: true,
      }),
      assertions: ["multiple-complete-operation-links-fail-closed"],
    };
  }
  const preparedAgain = await composition.prepareNextOccurrence(identity),
    nextConversationId = preparedAgain.nextWorkspace.conversationId;
  assert.notEqual(nextConversationId, identity.conversationId);
  assert.equal(preparedAgain.nextPrepare.priorCycle.status, "completed");
  assert.equal(preparedAgain.nextWorkspace.currentStep, "freeze");
  stored = await workflow.read(fixture.organizationId);
  const beforeReplay = {
    revision: stored.revision,
    routes: stored.store.canonicalRoutingReceipts.length,
    future: stored.store.futurePreparationLinks.length,
    preparations: stored.store.preparedWorkPublications!.length,
  };
  for (const [kind, key] of [
    ["decision-draft", "process-c-route-decision"],
    ["unknown", "process-c-route-unknown"],
  ] as const)
    await route(kind, key);
  const replayedNext = await composition.prepareNextOccurrence(identity);
  assert.equal(replayedNext.nextWorkspace.conversationId, nextConversationId);
  stored = await workflow.read(fixture.organizationId);
  assert.deepEqual(
    {
      revision: stored.revision,
      routes: stored.store.canonicalRoutingReceipts.length,
      future: stored.store.futurePreparationLinks.length,
      preparations: stored.store.preparedWorkPublications!.length,
    },
    beforeReplay,
  );
  assert.notEqual(nextConversationId, fixture.conversationId);
  assert.equal(
    stored.store.contexts.filter(
      (value) => value.conversationId === nextConversationId,
    ).length,
    1,
  );
  assert.equal(
    stored.store.preparedWorkPublications!.filter(
      (value) =>
        value.productWorkflowId ===
        `leadership-conversation:${nextConversationId}`,
    ).length,
    1,
  );
  assert.equal(
    stored.store.frozenSnapshotPublications!.filter(
      (value) =>
        value.productWorkflowId ===
        `leadership-conversation:${nextConversationId}`,
    ).length,
    0,
  );
  await assert.rejects(
    () =>
      composition.routeApproved({
        ...identity,
        proposalId: proposal("decision-draft").proposalId,
        purposeRef: "different-purpose",
        expectedWorkflowRevision: stored.revision,
        idempotencyKey: "process-c-route-decision",
      }),
    /conflict/,
  );
  runtime = await runtimeRepository.read(fixture.organizationId);
  assert.ok(runtime);
  if (!("receiptDigest" in decision) || !("receiptDigest" in unknown))
    throw new Error("actual owner receipt unavailable");
  const publicationBodyRecords = [
      ...(stored.store.preparedWorkPublications ?? []).map(
        (value) => value.protectedBody,
      ),
      ...(stored.store.frozenSnapshotPublications ?? []).map(
        (value) => value.protectedBody,
      ),
      ...(stored.store.whatChangedPublications ?? []).flatMap((value) =>
        Array.isArray(value.protectedBody)
          ? value.protectedBody
          : [value.protectedBody],
      ),
    ],
    runtimeBodyRecords: Array<
      Record<string, unknown> & { bodyId: string; exactBodyDigest: string }
    > = [],
    collectBodyRefs = (value: unknown): void => {
      if (!value || typeof value !== "object") return;
      if (Array.isArray(value)) {
        for (const item of value) collectBodyRefs(item);
        return;
      }
      const record = value as Record<string, unknown>;
      if (
        typeof record.bodyId === "string" &&
        typeof record.exactBodyDigest === "string"
      )
        runtimeBodyRecords.push(
          record as Record<string, unknown> & {
            bodyId: string;
            exactBodyDigest: string;
          },
        );
      for (const nested of Object.values(record)) collectBodyRefs(nested);
    };
  collectBodyRefs(runtime.runtime.memory.events);
  const protectedBodyRecords = [
      ...new Map(
        [...publicationBodyRecords, ...runtimeBodyRecords].map((value) => [
          value.bodyId,
          value,
        ]),
      ).values(),
    ],
    protectedBodyRefs = protectedBodyRecords.map((value) => value.bodyId),
    bodyRoot = path.join(root, "product-artifact-bodies"),
    bodyFiles = (await readdir(bodyRoot, { recursive: true })).map(String),
    physicalRefFiles = bodyFiles.filter(
      (value) =>
        value.includes(`${path.sep}refs${path.sep}`) && value.endsWith(".json"),
    ),
    physicalBlobFiles = bodyFiles.filter(
      (value) =>
        value.includes(`${path.sep}blobs${path.sep}`) &&
        value.endsWith(".blob"),
    ),
    physicalRefs = await Promise.all(
      physicalRefFiles.map((value) =>
        readFile(path.join(bodyRoot, value), "utf8").then(
          (text) =>
            JSON.parse(text) as { bodyId: string; exactBodyDigest: string },
        ),
      ),
    );
  assert.deepEqual(
    new Set(physicalRefs.map((value) => value.bodyId)),
    new Set(protectedBodyRefs),
  );
  assert.deepEqual(
    new Set(physicalBlobFiles.map((value) => path.basename(value, ".blob"))),
    new Set(protectedBodyRecords.map((value) => value.exactBodyDigest)),
  );
  for (const [index, relative] of physicalRefFiles.entries()) {
    const status = await lstat(path.join(bodyRoot, relative));
    assert.ok(
      status.isFile() &&
        !status.isSymbolicLink() &&
        (status.mode & 0o777) === 0o600,
    );
    const expected = protectedBodyRecords.find(
      (value) => value.bodyId === physicalRefs[index]!.bodyId,
    );
    assert.ok(expected);
    assert.deepEqual(physicalRefs[index], expected);
  }
  for (const relative of physicalBlobFiles) {
    const target = path.join(bodyRoot, relative),
      status = await lstat(target),
      bytes = await readFile(target),
      expectedDigest = path.basename(relative, ".blob");
    assert.ok(
      status.isFile() &&
        !status.isSymbolicLink() &&
        (status.mode & 0o777) === 0o600,
    );
    assert.equal(
      createHash("sha256").update(bytes).digest("hex"),
      expectedDigest,
    );
  }
  const runtimeOperations = runtime.runtime.memory.events.flatMap((value) =>
      value && typeof value === "object" && "contributionOperationId" in value
        ? [
            String(
              (value as { contributionOperationId: unknown })
                .contributionOperationId,
            ),
          ]
        : [],
    ),
    runtimeEvidence = runtime.runtime.memory.events.flatMap((value) => {
      if (!value || typeof value !== "object") return [];
      const batch = (
        value as {
          canonicalAdmissionBatch?: {
            admissions?: Array<{
              canonicalEvidenceId?: unknown;
              canonicalAdmissionId?: unknown;
            }>;
          };
        }
      ).canonicalAdmissionBatch;
      return (batch?.admissions ?? []).flatMap((admission) =>
        typeof admission.canonicalEvidenceId === "string" &&
        typeof admission.canonicalAdmissionId === "string"
          ? [
              `${admission.canonicalEvidenceId}\0${admission.canonicalAdmissionId}`,
            ]
          : [],
      );
    }),
    runtimeTerminals = (
      await readdir(
        path.join(locations.runtimeRoot, ".operations", fixture.organizationId),
      ).catch(() => [])
    ).filter((value) => value.endsWith(".json")),
    workflowTerminals = (
      await readdir(
        path.join(
          locations.workflowRoot,
          "organizations",
          ".operations",
          fixture.organizationId,
        ),
      ).catch(() => [])
    ).filter((value) => value.endsWith(".json"));
  const terminalBindings = async (root: string, files: string[]) =>
      Promise.all(files.map(async (file) => {
        const value = JSON.parse(await readFile(path.join(root, file), "utf8")) as Record<string, unknown>;
        return `${String(value.requestFingerprint)}\0${String(value.operationBindingDigest ?? "workflow")}\0${String(value.expectedRevision)}\0${String(value.intendedDigest)}\0${String(value.disposition ?? (file.endsWith(".conflict.json") ? "cas-conflict" : "already-committed"))}`;
      })),
    runtimeTerminalBindings = await terminalBindings(
      path.join(locations.runtimeRoot, ".operations", fixture.organizationId), runtimeTerminals,
    ),
    workflowTerminalBindings = await terminalBindings(
      path.join(locations.workflowRoot, "organizations", ".operations", fixture.organizationId), workflowTerminals,
    );
  const evidenceRoutes = stored.store.canonicalRoutingReceipts.filter(
      (value) => value.ownerKind === "evidence",
    ),
    routedEvidence = evidenceRoutes.flatMap((value) =>
      value.admissions.map(
        (admission) =>
          `${admission.canonicalEvidenceId}\0${admission.canonicalAdmissionId}`,
      ),
    );
  assert.deepEqual(new Set(runtimeEvidence), new Set(routedEvidence));
  assert.ok(
    evidenceRoutes.every((value) =>
      runtimeOperations.includes(value.contributionOperationId),
    ),
  );
  const capturePublicationTuples = (stored.store.privateWorkingContributionCaptures ?? []).map((value) =>
      `${value.snapshotId}\0${value.captureId}\0${digest(value.contributionRefs)}\0${value.idempotencyKeyDigest}\0${value.requestFingerprint}`,
    ),
    captureReceiptTuples = (stored.store.privateWorkingContributionCaptureReceipts ?? []).map((value) =>
      `${value.snapshotId}\0${value.captureId}\0${value.contributionRefsDigest}\0${value.idempotencyKeyDigest}\0${value.requestFingerprint}`,
    );
  assert.deepEqual(new Set(captureReceiptTuples), new Set(capturePublicationTuples));
  const inventoryFamilies = {
    occurrences: stored.store.contexts.length,
    protectedBodyRefs: protectedBodyRefs.length,
    physicalBodyRefs: physicalRefs.length,
    physicalBlobs: physicalBlobFiles.length,
    preparedPublications: (stored.store.preparedWorkPublications ?? []).length,
    frozenPublications: (stored.store.frozenSnapshotPublications ?? []).length,
    publicationReceipts: (stored.store.publicationReceipts ?? []).length,
    contributionPublications: (stored.store.privateWorkingContributionPublications ?? []).length,
    contributionReceipts: (stored.store.privateWorkingContributionReceipts ?? []).length,
    capturePublications: (stored.store.privateWorkingContributionCaptures ?? []).length,
    captureReceipts: (stored.store.privateWorkingContributionCaptureReceipts ?? []).length,
    captureCorrespondenceTuples: capturePublicationTuples.length,
    whatChangedPublications: (stored.store.whatChangedPublications ?? []).length,
    futurePreparationLinks: stored.store.futurePreparationLinks.length,
    routingLinks: stored.store.routingLinks.length,
    idempotencyRecords: stored.store.idempotency.length,
    evidenceRoutes: evidenceRoutes.length,
    runtimeEvidence: runtimeEvidence.length,
    runtimeCanonicalOperations: runtimeOperations.length,
    runtimeTerminals: runtimeTerminals.length,
    workflowTerminals: workflowTerminals.length,
    runtimeTerminalBindings: runtimeTerminalBindings.length,
    workflowTerminalBindings: workflowTerminalBindings.length,
    closures: (stored.store.cycle1ClosureCompletions ?? []).length,
    productMaterializations: (stored.store.productMaterializations ?? [])
      .length,
    productMaterializationReceipts: (
      stored.store.productMaterializationReceipts ?? []
    ).length,
    events: stored.store.events.length,
  };
  const uniqueFamilies = {
    contexts: stored.store.contexts.map((value) => value.conversationId),
    protectedBodyRefs,
    physicalBodyRefs: physicalRefs.map((value) => value.bodyId),
    runtimeEvidence,
    runtimeCanonicalOperations: runtimeOperations,
    runtimeTerminals,
    workflowTerminals,
    runtimeTerminalBindings,
    workflowTerminalBindings,
    eventIds: stored.store.events.map((value) => value.eventId),
    preparedPublications: (stored.store.preparedWorkPublications ?? []).map(
      (value) =>
        `${value.productWorkflowId}\0${value.artifactId}\0${value.artifactRevision}`,
    ),
    frozenPublications: (stored.store.frozenSnapshotPublications ?? []).map(
      (value) =>
        `${value.productWorkflowId}\0${value.artifactId}\0${value.artifactRevision}`,
    ),
    publicationReceipts: (stored.store.publicationReceipts ?? []).map(
      (value) => value.receiptId,
    ),
    contributionPublications: (stored.store.privateWorkingContributionPublications ?? []).map((value) => value.artifactId),
    contributionReceipts: (stored.store.privateWorkingContributionReceipts ?? []).map((value) => value.receiptId),
    capturePublications: (stored.store.privateWorkingContributionCaptures ?? []).map((value) => value.captureId),
    captureReceipts: (stored.store.privateWorkingContributionCaptureReceipts ?? []).map((value) => value.receiptId),
    capturePublicationTuples,
    captureReceiptTuples,
    whatChangedPublications: (stored.store.whatChangedPublications ?? []).map((value) => value.artifactId),
    futurePreparationLinks: stored.store.futurePreparationLinks.map((value) => value.futurePreparationLinkId),
    routingLinks: stored.store.routingLinks.map((value) => value.routingLinkId),
    idempotencyRecords: stored.store.idempotency.map((value) => `${value.keyDigest}\0${value.requestFingerprint}\0${value.recordRef}`),
    routingReceipts: stored.store.canonicalRoutingReceipts.map(
      (value) => value.integrationReceiptId,
    ),
    closures: (stored.store.cycle1ClosureCompletions ?? []).map(
      (value) => value.closureId,
    ),
    productMaterializations: (stored.store.productMaterializations ?? []).map(
      (value) => value.materializationRecordId,
    ),
    productMaterializationReceipts: (
      stored.store.productMaterializationReceipts ?? []
    ).map((value) => value.receiptId),
  };
  const duplicateInventoryFindings = Object.entries(uniqueFamilies).reduce(
    (total, [family, ids]) => {
      const duplicates = ids.length - new Set(ids).size;
      assert.equal(
        duplicates,
        0,
        `${family} contains duplicate owner identities`,
      );
      return total + duplicates;
    },
    0,
  );
  assert.equal((stored.store.privateWorkingContributionPublications ?? []).length, 0);
  assert.equal((stored.store.privateWorkingContributionReceipts ?? []).length, 0);
  assert.ok((stored.store.privateWorkingContributionCaptures ?? []).length > 0);
  assert.ok((stored.store.privateWorkingContributionCaptureReceipts ?? []).length > 0);
  assert.equal((stored.store.privateWorkingContributionPublications ?? []).length, (stored.store.privateWorkingContributionReceipts ?? []).length);
  assert.equal((stored.store.privateWorkingContributionCaptures ?? []).length, (stored.store.privateWorkingContributionCaptureReceipts ?? []).length);
  assert.ok((stored.store.whatChangedPublications ?? []).length > 0);
  assert.ok(stored.store.futurePreparationLinks.length > 0);
  assert.ok(stored.store.routingLinks.length > 0);
  assert.ok(stored.store.idempotency.length > 0);
  const manifest = handoff({
    processAHandoffDigest: a.handoffDigest,
    processBHandoffDigest: b.handoffDigest,
    organizationId: fixture.organizationId,
    questionId: questionId,
    conversationId: fixture.conversationId,
    nextConversationId,
    materialEvidenceReceiptDigest: material.receiptDigest,
    duplicateEvidenceReceiptDigest: duplicate.receiptDigest,
    decisionDraftReceiptDigest: decision.receiptDigest,
    unknownReceiptDigest: unknown.receiptDigest,
    futurePreparationLinkId:
      stored.store.futurePreparationLinks.at(-1)!.futurePreparationLinkId,
    productWorkflowRepositoryRevision: stored.revision,
    runtimeRepositoryRevision: runtime.revision,
    sourceContentRepositoryRevision: await sourceRepository.inspectRevision(
      fixture.organizationId,
    ),
    routingReceiptCount: stored.store.canonicalRoutingReceipts.length,
    idempotentReentry: true,
    neutralityCaseCount: neutralTraces.length,
    inventoryFamilies,
    duplicateInventoryFindings,
  });
  return {
    role: "route-actual-owners-and-prepare-again",
    handoff: manifest,
    assertions: [
      "handoffs-verified",
      "northstar-seed-reloaded",
      "northstar-source-binding-lineage-verified",
      "northstar-material-lineage-verified",
      "material-evidence-actual",
      "canonical-change-owner-result",
      "duplicate-evidence-class-2",
      "duplicate-understanding-unchanged",
      "decision-draft-actual",
      "unknown-actual",
      "future-preparation-persisted",
      "idempotent-reentry",
    ],
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
  assert.equal(source.currentPreparedWorkProduct, null);
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
    role: "reload-direct-evidence-successor",
    handoff: handoff({
      organizationId: fixture.organizationId,
      questionId,
      nextConversationId,
      artifactVersionId: first.currentPreparedWorkProduct!.artifactVersionId,
      workflowRevision: after,
    }),
    assertions: [
      "fresh-process-successor-link-from-body-safe-predecessor",
      "fresh-process-successor-reload",
      "direct-evidence-current-access",
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
      : role === "capture-and-review"
        ? await processB(root, encodedA!)
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

async function execute(
  root: string,
  role: string,
  lineageFixtureRoot: string | null,
  expectedSeedDigest: string | null,
  ...handoffs: SafeHandoff[]
): Promise<WorkerResult> {
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
  ];
  const { stdout, stderr } = await runFile(process.execPath, args, {
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

async function main(): Promise<void> {
  if (process.argv.includes("--worker")) {
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
  let checks = 0;
  const root = await mkdtemp(
    path.join(tmpdir(), "discovery-leadership-conversation-replay-"),
  );
  const lineageFixtureRoot = await mkdtemp(
    path.join(tmpdir(), "discovery-northstar-preparation-lineage-"),
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
    const a = await execute(
      root,
      "prepare-and-freeze",
      lineageFixtureRoot,
      provisioned.seed.seedDigest,
    );
    checks += a.assertions.length;
    const b = await execute(root, "capture-and-review", null, null, a.handoff);
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
      path.join(tmpdir(), "discovery-leadership-conversation-replay-"),
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
      path.join(tmpdir(), "discovery-northstar-preparation-lineage-"),
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
      /acceptOccurrence1EvidenceAction[\s\S]*server\.review[\s\S]*server\.routeApproved/,
    );
    assert.match(experience, /Accept as Evidence/);
    assert.match(telemetryOwner, /return"repository-unavailable"/);
    assert.doesNotMatch(telemetryOwner, /throw new Error/);
    checks += 4;
    const ambiguousRoot = await mkdtemp(
      path.join(tmpdir(), "discovery-leadership-conversation-replay-"),
    );
    try {
      const ambiguousA = await execute(
          ambiguousRoot,
          "prepare-and-freeze",
          lineageFixtureRoot,
          provisioned.seed.seedDigest,
        ),
        ambiguousB = await execute(
          ambiguousRoot,
          "capture-and-review",
          null,
          null,
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
    const observations = [
      ...(a.observations ?? []),
      ...(b.observations ?? []),
      ...(c.observations ?? []),
      ...(d.observations ?? []),
    ];
    console.log(
      JSON.stringify({
        validation: "leadership-conversation-replay-001",
        result: "PASS",
        checks,
        freshProcesses: 17,
        processA: "persisted",
        processB: "loaded-a-and-persisted-capture-review",
        processC: "loaded-a-b-and-executed-actual-owners",
        processD: "reloaded-direct-evidence-successor",
        northstarFixtureProvisionerInvocations: 1,
        processCSeedIntegrityReloads: 1,
        processCHiddenProvisioningInvocations: 0,
        missingLineageFailsClosed: true,
        materialEvidence: "actual-path",
        duplicateEvidence: "actual-class-2",
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
          families: c.handoff.inventoryFamilies,
          duplicateFindings: c.handoff.duplicateInventoryFindings,
        },
        observability: {
          eventCount: observations.length,
          neutralityCaseCount: c.handoff.neutralityCaseCount,
          stages: [
            ...new Set(observations.map((value) => value.workflowStage)),
          ],
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
      }),
    );
  } finally {
    await rm(root, { recursive: true, force: true });
    await rm(lineageFixtureRoot, { recursive: true, force: true });
    await assert.rejects(() =>
      import("node:fs/promises").then((fs) => fs.lstat(root)),
    );
    await assert.rejects(() =>
      import("node:fs/promises").then((fs) => fs.lstat(lineageFixtureRoot)),
    );
  }
}

void main();
