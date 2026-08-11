import { createHash } from "node:crypto";

import type { ScopedGovernanceContext } from "../governance/scopedGovernanceContext";
import type {
  OrganizationRuntimeRepository,
  RuntimeStorageOperationMetadata,
} from "../runtime/organizationRuntimeRepository";
import type { CanonicalUnderstandingRevisionOperationRecordV1 } from "../runtime/organizationalUnderstandingState";
import type {
  CanonicalUnderstandingComposition,
  CanonicalUnderstandingEpistemicRevisionV1,
} from "./buildCanonicalUnderstandingCompatibilityShadow";

export const CANONICAL_UNDERSTANDING_REVISION_OPERATION =
  "organizational-understanding:revise-confidence-uncertainty" as const;

export type ReviseCanonicalUnderstandingConfidenceRequestV1 = {
  contractVersion: "1";
  organizationId: string;
  questionId: string;
  stableUnderstandingId: string;
  expectedPredecessorRevisionId: string;
  confidence: number | null;
  uncertainty: string[];
  supportingMaterialRefs: string[];
  contradictingMaterialRefs: string[];
  interpretationVersion: string;
  purpose: string;
  sensitivity: "standard" | "restricted" | "private";
  actorRef: string;
  occurredAt: string;
  idempotencyKey: string;
  expectedRuntimeRevision: string;
  authorization: ScopedGovernanceContext;
  operation: RuntimeStorageOperationMetadata;
};

export type CanonicalUnderstandingRevisionReceiptV1 = {
  contractVersion: "1";
  operationId: string;
  organizationId: string;
  questionId: string;
  stableUnderstandingId: string;
  predecessorRevisionId: string;
  revisionId: string;
  conclusionRevisionId: string;
  changeType: "confidence" | "uncertainty" | "confidence-and-uncertainty";
  authorityRefs: string[];
  policyRefs: string[];
  idempotencyKeyDigest: string;
  requestFingerprint: string;
  eventId: string;
  runtimeRevisionBefore: string;
  runtimeRevisionAfter: string;
  occurredAt: string;
  receiptDigest: string;
};

const stable = (value: unknown): string =>
  Array.isArray(value)
    ? `[${value.map(stable).join(",")}]`
    : value && typeof value === "object"
      ? `{${Object.entries(value as Record<string, unknown>)
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
          .join(",")}}`
      : JSON.stringify(value);
const digest = (value: unknown): string =>
  createHash("sha256").update(stable(value)).digest("hex");
const unique = (values: readonly string[]): string[] =>
  [...new Set(values)].sort((a, b) => a.localeCompare(b));
const exact = (value: string): boolean =>
  value.trim() === value && value.length > 0 && value !== "*";
const deny = (): never => {
  throw new Error("Canonical Organizational Understanding revision denied.");
};

function currentRevision(composition: CanonicalUnderstandingComposition) {
  return composition.epistemicRevisions?.find(
    (item) => item.revisionId === composition.currentEpistemicRevisionId,
  );
}

export class CanonicalOrganizationalUnderstandingRevisionService {
  constructor(
    private readonly repository: Pick<OrganizationRuntimeRepository, "read" | "replace">,
    private readonly clock: { now(): string },
  ) {}

  async revise(
    request: ReviseCanonicalUnderstandingConfidenceRequestV1,
  ): Promise<{ receipt: CanonicalUnderstandingRevisionReceiptV1; idempotent: boolean }> {
    const authorization = request.authorization;
    const allowedRequestKeys = new Set([
      "contractVersion", "organizationId", "questionId", "stableUnderstandingId",
      "expectedPredecessorRevisionId", "confidence", "uncertainty",
      "supportingMaterialRefs", "contradictingMaterialRefs", "interpretationVersion",
      "purpose", "sensitivity", "actorRef", "occurredAt", "idempotencyKey",
      "expectedRuntimeRevision", "authorization", "operation",
    ]);
    if (
      Object.keys(request).some((key) => !allowedRequestKeys.has(key)) ||
      request.contractVersion !== "1" ||
      !exact(request.organizationId) ||
      !exact(request.questionId) ||
      !exact(request.stableUnderstandingId) ||
      !exact(request.expectedPredecessorRevisionId) ||
      !exact(request.interpretationVersion) ||
      !exact(request.purpose) ||
      !exact(request.actorRef) ||
      !exact(request.idempotencyKey) ||
      request.occurredAt !== this.clock.now() ||
      !Number.isFinite(Date.parse(request.occurredAt)) ||
      (request.confidence !== null &&
        (!Number.isFinite(request.confidence) || request.confidence < 0 || request.confidence > 1)) ||
      authorization.disposition !== "authorized" ||
      authorization.operation !== CANONICAL_UNDERSTANDING_REVISION_OPERATION ||
      authorization.organizationId !== request.organizationId ||
      authorization.subjectId !== request.actorRef ||
      authorization.purpose !== request.purpose ||
      authorization.sensitivity !== request.sensitivity ||
      authorization.evaluatedAt !== request.occurredAt ||
      authorization.temporal.mode !== "current" ||
      authorization.requestedScope.organizationId !== request.organizationId ||
      authorization.authorityRefs.length === 0 ||
      authorization.policyRefs.length === 0
    ) deny();

    const uncertainty = unique(request.uncertainty);
    const supportingMaterialRefs = unique(request.supportingMaterialRefs);
    const contradictingMaterialRefs = unique(request.contradictingMaterialRefs);
    if (
      uncertainty.some((item) => !exact(item)) ||
      supportingMaterialRefs.length + contradictingMaterialRefs.length === 0 ||
      [...supportingMaterialRefs, ...contradictingMaterialRefs].some((item) => !exact(item))
    ) deny();

    const keyDigest = digest(["canonical-understanding-revision-idempotency", request.idempotencyKey]);
    const requestFingerprint = digest({
      contractVersion: request.contractVersion,
      organizationId: request.organizationId,
      questionId: request.questionId,
      stableUnderstandingId: request.stableUnderstandingId,
      expectedPredecessorRevisionId: request.expectedPredecessorRevisionId,
      confidence: request.confidence,
      uncertainty,
      supportingMaterialRefs,
      contradictingMaterialRefs,
      interpretationVersion: request.interpretationVersion,
      purpose: request.purpose,
      sensitivity: request.sensitivity,
      actorRef: request.actorRef,
      occurredAt: request.occurredAt,
      operation: CANONICAL_UNDERSTANDING_REVISION_OPERATION,
      authorityRefs: authorization.authorityRefs,
      policyRefs: authorization.policyRefs,
      governanceContextId: authorization.contextId,
    });

    const stored = await this.repository.read(request.organizationId);
    if (!stored) return deny();
    const state = stored.runtime.memory.organizationalUnderstandingState;
    const operations = state.canonicalRevisionOperations ?? [];
    const prior = operations.find((item) => item.idempotencyKeyDigest === keyDigest);
    if (prior) {
      if (prior.requestFingerprint !== requestFingerprint) deny();
      const receipt = (stored.runtime.memory.events as unknown[]).find(
        (item): item is CanonicalUnderstandingRevisionReceiptV1 =>
          Boolean(
            item &&
              typeof item === "object" &&
              (item as { kind?: string }).kind === "canonical-understanding-revision-receipt" &&
              (item as CanonicalUnderstandingRevisionReceiptV1).receiptDigest === prior.receiptDigest,
          ),
      );
      if (!receipt) return deny();
      return { receipt: structuredClone(receipt), idempotent: true };
    }
    if (stored.revision !== request.expectedRuntimeRevision) return deny();

    const composition = state.canonicalCompositions?.find(
      (item) => item.id === request.stableUnderstandingId,
    );
    if (!composition) return deny();
    if (composition.organizationId !== request.organizationId) return deny();
    if (
      authorization.requestedScope.type !== composition.scope.type ||
      authorization.requestedScope.id !== composition.scope.id
    ) return deny();
    const predecessor = currentRevision(composition);
    const predecessorId = predecessor?.revisionId ?? composition.revisionId;
    if (predecessorId !== request.expectedPredecessorRevisionId) deny();
    const confidenceChanged = predecessor ? predecessor.confidence !== request.confidence : request.confidence !== null;
    const uncertaintyChanged = predecessor
      ? stable(predecessor.uncertainty) !== stable(uncertainty)
      : stable(composition.compositionUncertainty) !== stable(uncertainty);
    if (!confidenceChanged && !uncertaintyChanged) deny();
    if (
      predecessor &&
      stable(predecessor.supportingMaterialRefs) !== stable(supportingMaterialRefs) &&
      !confidenceChanged &&
      !uncertaintyChanged
    ) deny();

    const operationId = `canonical-understanding-revision-operation:v1:${digest([
      request.organizationId,
      keyDigest,
      requestFingerprint,
    ])}`;
    const revisionUnsigned = {
      contractVersion: "1" as const,
      stableUnderstandingId: composition.id,
      predecessorRevisionId: predecessorId,
      conclusionRevisionId: composition.revisionId,
      confidence: request.confidence,
      uncertainty,
      supportingMaterialRefs,
      contradictingMaterialRefs,
      scopeDigest: digest(composition.scope),
      interpretationVersion: request.interpretationVersion,
      operationId,
      occurredAt: request.occurredAt,
      actorRef: request.actorRef,
      authorityRefs: [...authorization.authorityRefs],
      policyRefs: [...authorization.policyRefs],
    };
    const revisionDigest = digest(revisionUnsigned);
    const revision: CanonicalUnderstandingEpistemicRevisionV1 = {
      ...revisionUnsigned,
      revisionId: `${composition.id}:epistemic-revision:${revisionDigest}`,
      revisionDigest,
    };
    const changeType = confidenceChanged && uncertaintyChanged
      ? "confidence-and-uncertainty" as const
      : confidenceChanged ? "confidence" as const : "uncertainty" as const;
    const eventId = `canonical-understanding-revision-event:v1:${digest([operationId, revision.revisionId])}`;

    const runtime = structuredClone(stored.runtime);
    const nextState = runtime.memory.organizationalUnderstandingState;
    const target = nextState.canonicalCompositions?.find((item) => item.id === composition.id);
    if (!target) return deny();
    target.epistemicRevisions = [...(target.epistemicRevisions ?? []), revision];
    target.currentEpistemicRevisionId = revision.revisionId;
    target.updatedAt = request.occurredAt;

    const receiptUnsigned = {
      contractVersion: "1" as const,
      operationId,
      organizationId: request.organizationId,
      questionId: request.questionId,
      stableUnderstandingId: composition.id,
      predecessorRevisionId: predecessorId,
      revisionId: revision.revisionId,
      conclusionRevisionId: composition.revisionId,
      changeType,
      authorityRefs: [...authorization.authorityRefs],
      policyRefs: [...authorization.policyRefs],
      idempotencyKeyDigest: keyDigest,
      requestFingerprint,
      eventId,
      runtimeRevisionBefore: stored.revision,
      runtimeRevisionAfter: digest(runtime),
      occurredAt: request.occurredAt,
    };
    const receipt = { ...receiptUnsigned, receiptDigest: digest(receiptUnsigned) };
    (runtime.memory.events as unknown[]).push({
      kind: "canonical-understanding-revision-event",
      contractVersion: "1",
      eventId,
      operationId,
      organizationId: request.organizationId,
      stableUnderstandingId: composition.id,
      predecessorRevisionId: predecessorId,
      revisionId: revision.revisionId,
      changeType,
      operation: CANONICAL_UNDERSTANDING_REVISION_OPERATION,
      actorRef: request.actorRef,
      authorityRefs: [...authorization.authorityRefs],
      policyRefs: [...authorization.policyRefs],
      requestFingerprint,
      occurredAt: request.occurredAt,
    }, {
      kind: "canonical-understanding-revision-receipt",
      ...receipt,
    });
    const operationRecordUnsigned = {
      contractVersion: "1" as const,
      operationId,
      organizationId: request.organizationId,
      stableUnderstandingId: composition.id,
      revisionId: revision.revisionId,
      predecessorRevisionId: predecessorId,
      idempotencyKeyDigest: keyDigest,
      requestFingerprint,
      eventId,
      receiptDigest: receipt.receiptDigest,
      recordedAt: request.occurredAt,
    };
    const operationRecord: CanonicalUnderstandingRevisionOperationRecordV1 = {
      ...operationRecordUnsigned,
      recordDigest: digest(operationRecordUnsigned),
    };
    nextState.canonicalRevisionOperations = [...operations, operationRecord];
    const bytes = new TextEncoder().encode(JSON.stringify(runtime, null, 2));
    const persisted = await this.repository.replace(
      request.organizationId,
      bytes,
      stored.revision,
      request.operation,
    );
    const persistedReceipt = (persisted.runtime.memory.events as unknown[]).find(
      (item) =>
        Boolean(
          item &&
            typeof item === "object" &&
            (item as { receiptDigest?: string }).receiptDigest === receipt.receiptDigest,
        ),
    );
    if (!persistedReceipt) deny();
    return { receipt, idempotent: false };
  }
}
