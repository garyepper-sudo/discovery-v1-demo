import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { resolveScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  CANONICAL_UNDERSTANDING_REVISION_OPERATION,
  CanonicalOrganizationalUnderstandingRevisionService,
} from "../../engine/v3/understanding/canonicalOrganizationalUnderstandingRevisionService";
import type { CanonicalUnderstandingComposition } from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";
import { discloseCanonicalOrganizationalUnderstanding } from "../../engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding";
import { compileOrganizationalUnderstandingProjection } from "../../engine/v3/projection/organizationalUnderstandingProjection";
import { resolveCanonicalOrganizationalUnderstandingChange } from "../../engine/v3/understanding/resolveCanonicalOrganizationalUnderstandingChange";

const organizationId = "confidence-revision-validation-001";
const actorRef = "actor-validation-001";
const at = "2026-08-10T12:00:00.000Z";
const later = "2026-08-10T12:01:00.000Z";
const purpose = "leadership-conversation-capture";
const stableUnderstandingId = "organizational-understanding:validation-001";

const composition: CanonicalUnderstandingComposition = {
  id: stableUnderstandingId,
  revisionId: `${stableUnderstandingId}:conclusion:1`,
  previousRevisionId: null,
  organizationId,
  scope: { organizationId, type: "organization", id: organizationId },
  outcomeRef: { type: "phenomenon", id: "validation-outcome-001" },
  explanationIds: [],
  authorityTransition: {
    authorityOwner: "canonical-organizational-understanding",
    contributionDecisionOwner: "canonical-understanding-contribution-validation",
    persistenceOwner: "organization-runtime",
    disclosureOwner: "application-boundary-not-evaluated",
    explanationIds: [],
    disposition: "authorized-organizational-knowledge",
    basis: ["existing-production-semantics-satisfied"],
  },
  compositionUncertainty: ["comparative-role-data-unavailable"],
  createdAt: at,
  updatedAt: at,
};

function authorization(evaluatedAt: string, overrides: Partial<Parameters<typeof resolveScopedGovernanceContext>[0]> = {}) {
  const requestedScope = { organizationId, type: "organization" as const, id: organizationId };
  return resolveScopedGovernanceContext({
    organizationId,
    subjectId: actorRef,
    requestedScope,
    operation: CANONICAL_UNDERSTANDING_REVISION_OPERATION,
    purpose,
    sensitivity: "standard",
    evaluatedAt,
    temporal: { mode: "current" },
    serverResolvedAuthority: [{
      authorityRef: "authority:confidence-revision:v1",
      policyRef: "policy:confidence-revision:v1",
      organizationId,
      subjectId: actorRef,
      scope: requestedScope,
      operations: [CANONICAL_UNDERSTANDING_REVISION_OPERATION],
      sensitivity: ["standard"],
      relationship: "direct",
      status: "active",
      validFrom: "2026-01-01T00:00:00.000Z",
    }],
    ...overrides,
  });
}

async function main() {
  const root = await mkdtemp(path.join(os.tmpdir(), "discovery-confidence-revision-"));
  try {
    const repository = new FilesystemOrganizationRuntimeRepository(root);
    const runtime = createEmptyOrganizationRuntime({ organizationId, now: at });
    runtime.memory.organizationalUnderstandingState.canonicalCompositions = [composition];
    const created = await repository.create(
      organizationId,
      new TextEncoder().encode(JSON.stringify(runtime, null, 2)),
      { requestId: "create-runtime", operatorId: actorRef },
    );
    let clock = at;
    const service = new CanonicalOrganizationalUnderstandingRevisionService(repository, { now: () => clock });
    const firstRequest = {
      contractVersion: "1" as const,
      organizationId,
      questionId: "question-validation-001",
      stableUnderstandingId,
      expectedPredecessorRevisionId: composition.revisionId,
      confidence: 0.72,
      uncertainty: ["comparative-role-data-unavailable"],
      supportingMaterialRefs: ["evidence:validation-support:1"],
      contradictingMaterialRefs: ["evidence:validation-contradiction:1"],
      interpretationVersion: "canonical-understanding-confidence:v1",
      purpose,
      sensitivity: "standard" as const,
      actorRef,
      occurredAt: at,
      idempotencyKey: "confidence-revision-1",
      expectedRuntimeRevision: created.revision,
      authorization: authorization(at),
      operation: { requestId: "confidence-revision-1", operatorId: actorRef },
    };
    const first = await service.revise(firstRequest);
    assert.equal(first.receipt.changeType, "confidence");
    assert.equal(first.receipt.stableUnderstandingId, stableUnderstandingId);
    assert.equal(first.receipt.conclusionRevisionId, composition.revisionId);
    const replay = await service.revise(firstRequest);
    assert.equal(replay.idempotent, true);
    assert.equal(replay.receipt.receiptDigest, first.receipt.receiptDigest);
    const replayWithCurrentEnvelope = await service.revise({ ...firstRequest, expectedRuntimeRevision: (await repository.read(organizationId))!.revision });
    assert.equal(replayWithCurrentEnvelope.idempotent, true);
    assert.equal(replayWithCurrentEnvelope.receipt.receiptDigest, first.receipt.receiptDigest);

    const afterFirst = (await repository.read(organizationId))!;
    clock = later;
    const second = await service.revise({
      ...firstRequest,
      expectedPredecessorRevisionId: first.receipt.revisionId,
      confidence: 0.72,
      uncertainty: ["unresolved-alternatives"],
      occurredAt: later,
      idempotencyKey: "confidence-revision-2",
      expectedRuntimeRevision: afterFirst.revision,
      authorization: authorization(later),
      operation: { requestId: "confidence-revision-2", operatorId: actorRef },
    });
    assert.equal(second.receipt.changeType, "uncertainty");
    assert.equal(second.receipt.predecessorRevisionId, first.receipt.revisionId);
    const current = (await repository.read(organizationId))!;
    const retained = current.runtime.memory.organizationalUnderstandingState.canonicalCompositions![0]!;
    assert.equal(retained.id, stableUnderstandingId);
    assert.equal(retained.revisionId, composition.revisionId);
    assert.equal(retained.currentEpistemicRevisionId, second.receipt.revisionId);
    assert.equal(retained.epistemicRevisions?.length, 2);
    assert.equal(current.runtime.memory.organizationalUnderstandingState.canonicalRevisionOperations?.length, 2);
    const change = resolveCanonicalOrganizationalUnderstandingChange({ organizationId, questionId: "question-validation-001", contributionOperationId: second.receipt.operationId, beforeCompositions: [composition], afterCompositions: [retained] });
    assert.equal(change.status, "available");
    if (change.status === "available") {
      assert.equal(change.result.disposition, "changed");
      assert.equal(change.result.changeType, "confidence-and-uncertainty-changed");
    }
    const ownerEvents = (current.runtime.memory.events as unknown[]).filter((item) => item && typeof item === "object" && (item as { kind?: string }).kind === "canonical-understanding-revision-event");
    const ownerReceipts = (current.runtime.memory.events as unknown[]).filter((item) => item && typeof item === "object" && (item as { kind?: string }).kind === "canonical-understanding-revision-receipt");
    assert.equal(ownerEvents.length, 2);
    assert.equal(ownerReceipts.length, 2);

    const disclosure = discloseCanonicalOrganizationalUnderstanding({
      organizationId,
      consumerId: actorRef,
      decision: { id: "decision:eligible", organizationId, consumerId: actorRef, disposition: "eligible", effectiveAt: later, basis: ["validation"] },
      compositions: [retained],
    });
    const projection = compileOrganizationalUnderstandingProjection({
      context: { organizationId, consumerId: actorRef, experience: "organization", generatedAt: later, contractVersion: "1" },
      disclosure,
      compositions: [retained],
      explanations: [], conditions: [], investigations: [], evolution: [],
    });
    assert.equal(projection.sourceRevisionIds[0], second.receipt.revisionId);
    assert.equal(projection.understandings[0]?.value.epistemicRevisions?.at(-1)?.confidence, 0.72);

    const writesBefore = current.revision;
    await assert.rejects(() => service.revise({
      ...firstRequest,
      idempotencyKey: "denied",
      expectedRuntimeRevision: current.revision,
      occurredAt: later,
      authorization: authorization(later, { serverResolvedAuthority: [] }),
    }));
    assert.equal((await repository.read(organizationId))!.revision, writesBefore);
    await assert.rejects(() => service.revise({
      ...firstRequest,
      idempotencyKey: firstRequest.idempotencyKey,
      expectedRuntimeRevision: current.revision,
      expectedPredecessorRevisionId: second.receipt.revisionId,
      confidence: 0.91,
      uncertainty: ["unresolved-alternatives"],
      occurredAt: later,
      authorization: authorization(later),
    }));
    const wrongOperation = resolveScopedGovernanceContext({
      organizationId, subjectId: actorRef,
      requestedScope: { organizationId, type: "organization", id: organizationId },
      operation: "understanding:disclose-direct", purpose, sensitivity: "standard",
      evaluatedAt: later, temporal: { mode: "current" },
      serverResolvedAuthority: [{ authorityRef: "authority:wrong-operation", policyRef: "policy:wrong-operation", organizationId, subjectId: actorRef, scope: { organizationId, type: "organization", id: organizationId }, operations: ["understanding:disclose-direct"], sensitivity: ["standard"], relationship: "direct", status: "active", validFrom: "2026-01-01T00:00:00.000Z" }],
    });
    await assert.rejects(() => service.revise({ ...firstRequest, idempotencyKey: "wrong-operation", expectedRuntimeRevision: current.revision, expectedPredecessorRevisionId: second.receipt.revisionId, confidence: 0.91, uncertainty: ["unresolved-alternatives"], occurredAt: later, authorization: wrongOperation }));
    await assert.rejects(() => service.revise({ ...firstRequest, idempotencyKey: "caller-conclusion", expectedRuntimeRevision: current.revision, expectedPredecessorRevisionId: second.receipt.revisionId, confidence: 0.91, uncertainty: ["unresolved-alternatives"], occurredAt: later, authorization: authorization(later), conclusion: "caller supplied" } as never));
    console.log("Canonical Understanding confidence revision validation: PASS");
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

void main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Confidence revision validation failed.");
  process.exitCode = 1;
});
