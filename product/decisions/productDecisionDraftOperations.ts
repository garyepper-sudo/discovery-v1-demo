import { createHash } from "node:crypto";

import type { OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { buildDurableProductQuestion } from "../questions/questionLifecycle";
import {
  PRODUCT_DECISION_DRAFT_CONTRACT_VERSION,
  PRODUCT_DECISION_DRAFT_EVENT_KIND,
  type ProductDecisionDraftAuthorityGrantV1,
  type ProductDecisionDraftContentV1,
  type ProductDecisionDraftOperation,
  type ProductDecisionDraftOperationReceiptV1,
  type ProductDecisionDraftRecordResultV1,
  type ProductDecisionDraftRevisionEventV1,
  type ProductDecisionDraftRevisionV1,
  type RecordProductDecisionDraftRequestV1,
} from "./productDecisionDraftContracts";

const exact = (value: string, label: string): string => {
  if (!value || value.trim() !== value || value === "*") throw new Error(`${label} is invalid.`);
  return value;
};
const iso = (value: string, label: string): string => {
  exact(value, label);
  if (!Number.isFinite(Date.parse(value))) throw new Error(`${label} must be an ISO timestamp.`);
  return value;
};
const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`).join(",")}}`;
  }
  return JSON.stringify(value);
};
export const productDecisionDraftDigest = (value: unknown): string =>
  createHash("sha256").update(stable(value)).digest("hex");
const identifier = (namespace: string, value: unknown): string =>
  `${namespace}:${productDecisionDraftDigest(value)}`;

const PURPOSE_BY_OPERATION: Record<ProductDecisionDraftOperation, ProductDecisionDraftAuthorityGrantV1["purpose"]> = {
  "product-decision-draft:create": "create-product-decision-draft",
  "product-decision-draft:revise": "revise-product-decision-draft",
  "product-decision-draft:read": "read-product-decision-draft",
};

function validateContent(content: ProductDecisionDraftContentV1): ProductDecisionDraftContentV1 {
  const allowed = ["assumptions", "expectedOutcomes", "intendedDecisionMakerLabel", "intendedDecisionMakerRef", "intervention", "measures", "proposedReviewDate", "rationale", "risks", "title"];
  const actual = Object.keys(content as Record<string, unknown>).sort();
  if (actual.length !== allowed.length || actual.some((key, index) => key !== allowed[index])) {
    throw new Error("Draft content contains an unsupported field.");
  }
  exact(content.title, "Draft title");
  exact(content.intervention, "Draft intervention");
  exact(content.rationale, "Draft rationale");
  for (const value of [...content.assumptions, ...content.risks]) exact(value, "Draft statement");
  for (const outcome of content.expectedOutcomes) {
    exact(outcome.id, "Expected Outcome id"); exact(outcome.description, "Expected Outcome description");
    if (outcome.timeHorizon !== null) exact(outcome.timeHorizon, "Expected Outcome horizon");
  }
  for (const measure of content.measures) {
    exact(measure.id, "Measure id"); exact(measure.name, "Measure name");
    if (measure.baseline !== null && !Number.isFinite(measure.baseline)) throw new Error("Measure baseline is invalid.");
    if (measure.target !== null && !Number.isFinite(measure.target)) throw new Error("Measure target is invalid.");
    if (measure.unit !== null) exact(measure.unit, "Measure unit");
  }
  if ((content.intendedDecisionMakerRef === null) !== (content.intendedDecisionMakerLabel === null)) {
    throw new Error("Intended decision-maker reference and label must be supplied together.");
  }
  if (content.intendedDecisionMakerRef !== null) exact(content.intendedDecisionMakerRef, "Intended decision-maker reference");
  if (content.intendedDecisionMakerLabel !== null) exact(content.intendedDecisionMakerLabel, "Intended decision-maker label");
  if (content.proposedReviewDate !== null) iso(content.proposedReviewDate, "Proposed review date");
  return structuredClone(content);
}

function authorized(input: {
  grant: ProductDecisionDraftAuthorityGrantV1;
  operation: ProductDecisionDraftOperation;
  organizationId: string;
  questionId: string;
}): void {
  const { grant } = input;
  if (!grant.authorized || grant.contractVersion !== PRODUCT_DECISION_DRAFT_CONTRACT_VERSION
    || grant.operation !== input.operation || grant.organizationId !== input.organizationId
    || grant.questionId !== input.questionId || grant.scope.type !== "product-question"
    || grant.scope.id !== input.questionId || grant.purpose !== PURPOSE_BY_OPERATION[input.operation]
    || grant.sensitivity !== "standard" || grant.status !== "active") {
    throw new Error("Product Decision Draft operation access denied.");
  }
  exact(grant.actorRef, "Draft actor"); exact(grant.authorityRef, "Draft authority");
  exact(grant.policyRef, "Draft policy"); iso(grant.authorizedAt, "Draft authorization time");
  iso(grant.validFrom, "Draft authority valid-from time");
  if (Date.parse(grant.validFrom) > Date.parse(grant.authorizedAt)) throw new Error("Product Decision Draft operation access denied.");
  if (grant.validUntil) {
    iso(grant.validUntil, "Draft authority valid-until time");
    if (Date.parse(grant.validUntil) <= Date.parse(grant.authorizedAt)) throw new Error("Product Decision Draft operation access denied.");
  }
  if (grant.revokedAt) throw new Error("Product Decision Draft operation access denied.");
}

function validateEvent(value: unknown, runtime: OrganizationRuntime): ProductDecisionDraftRevisionEventV1 | null {
  if (!value || typeof value !== "object" || (value as { kind?: unknown }).kind !== PRODUCT_DECISION_DRAFT_EVENT_KIND) return null;
  const event = value as ProductDecisionDraftRevisionEventV1;
  if (event.schemaVersion !== PRODUCT_DECISION_DRAFT_CONTRACT_VERSION || !event.revision || !event.receipt
    || event.organizationId !== runtime.metadata.organizationId || event.revision.contractVersion !== PRODUCT_DECISION_DRAFT_CONTRACT_VERSION
    || event.receipt.contractVersion !== PRODUCT_DECISION_DRAFT_CONTRACT_VERSION || event.questionId !== event.revision.questionId
    || event.questionId !== event.receipt.questionId || event.draftId !== event.revision.draftId
    || event.draftId !== event.receipt.draftId || event.revision.revisionId !== event.receipt.revisionId
    || event.revision.revision !== event.receipt.revision || event.revision.predecessorRevisionId !== event.receipt.predecessorRevisionId
    || event.revision.organizationId !== event.organizationId || event.receipt.organizationId !== event.organizationId
    || event.revision.sourceAnswerId !== event.receipt.sourceAnswerId || event.occurredAt !== event.revision.recordedAt
    || event.occurredAt !== event.receipt.recordedAt || !Number.isInteger(event.revision.revision) || event.revision.revision < 1) {
    throw new Error("Product Decision Draft event is malformed.");
  }
  const content = {
    title: event.revision.title, intervention: event.revision.intervention, rationale: event.revision.rationale,
    assumptions: event.revision.assumptions, risks: event.revision.risks, expectedOutcomes: event.revision.expectedOutcomes,
    measures: event.revision.measures, intendedDecisionMakerRef: event.revision.intendedDecisionMakerRef,
    intendedDecisionMakerLabel: event.revision.intendedDecisionMakerLabel, proposedReviewDate: event.revision.proposedReviewDate,
  };
  validateContent(content);
  if (event.revision.contentDigest !== productDecisionDraftDigest(content)) throw new Error("Product Decision Draft content digest is invalid.");
  const expectedRevisionId = identifier("product-decision-draft-revision", {
    draftId: event.draftId, revisionNumber: event.revision.revision,
    predecessorRevisionId: event.revision.predecessorRevisionId,
    contentDigest: event.revision.contentDigest, recordedAt: event.occurredAt,
  });
  if (event.revision.revisionId !== expectedRevisionId) throw new Error("Product Decision Draft revision identity is invalid.");
  const receiptWithoutDigest = { ...event.receipt, receiptDigest: "", resultDigest: "" };
  const expectedReceiptId = identifier("product-decision-draft-receipt", { ...receiptWithoutDigest, receiptId: "" });
  if (event.receipt.receiptId !== expectedReceiptId) throw new Error("Product Decision Draft receipt identity is invalid.");
  const expectedReceiptDigest = productDecisionDraftDigest({ ...event.receipt, receiptDigest: "", resultDigest: "" });
  const expectedResultDigest = productDecisionDraftDigest({ revision: event.revision, receiptId: event.receipt.receiptId });
  if (event.receipt.receiptDigest !== expectedReceiptDigest || event.receipt.resultDigest !== expectedResultDigest) {
    throw new Error("Product Decision Draft receipt digest is invalid.");
  }
  const expectedEventId = identifier("product-decision-draft-event", { revisionId: event.revision.revisionId, receiptId: event.receipt.receiptId });
  if (event.eventId !== expectedEventId) throw new Error("Product Decision Draft event identity is invalid.");
  return event;
}

export function productDecisionDraftEvents(runtime: OrganizationRuntime): ProductDecisionDraftRevisionEventV1[] {
  return runtime.memory.events.map((event) => validateEvent(event, runtime))
    .filter((event): event is ProductDecisionDraftRevisionEventV1 => event !== null)
    .sort((left, right) => left.revision.revision - right.revision.revision
      || left.occurredAt.localeCompare(right.occurredAt) || left.eventId.localeCompare(right.eventId));
}

export const productDecisionDraftHistory = (runtime: OrganizationRuntime, questionId: string, draftId?: string): ProductDecisionDraftRevisionV1[] => {
  const history = productDecisionDraftEvents(runtime)
    .filter((event) => event.questionId === questionId && (!draftId || event.draftId === draftId))
    .map((event) => structuredClone(event.revision));
  const draftIds = new Set(history.map((revision) => revision.draftId));
  if (draftIds.size > 1) throw new Error("Product Decision Draft history is ambiguous.");
  for (let index = 0; index < history.length; index += 1) {
    const revision = history[index]!;
    if (revision.revision !== index + 1) throw new Error("Product Decision Draft revision history is not sequential.");
    if (index === 0 && revision.predecessorRevisionId !== null) throw new Error("Product Decision Draft initial predecessor is invalid.");
    if (index > 0 && revision.predecessorRevisionId !== history[index - 1]!.revisionId) throw new Error("Product Decision Draft predecessor history is invalid.");
  }
  return history;
};

export function currentProductDecisionDraftRevision(runtime: OrganizationRuntime, questionId: string): ProductDecisionDraftRevisionV1 | null {
  const history = productDecisionDraftHistory(runtime, questionId);
  if (new Set(history.map((revision) => revision.draftId)).size > 1) {
    throw new Error("Product Decision Draft history is ambiguous.");
  }
  return history.reduce<ProductDecisionDraftRevisionV1 | null>(
    (current, revision) => !current || revision.revision > current.revision
      || (revision.revision === current.revision && revision.revisionId.localeCompare(current.revisionId) > 0)
      ? revision : current,
    null,
  );
}

export function recordProductDecisionDraftRevision(input: {
  runtime: OrganizationRuntime;
  request: RecordProductDecisionDraftRequestV1;
  grant: ProductDecisionDraftAuthorityGrantV1;
}): { runtime: OrganizationRuntime; result: ProductDecisionDraftRecordResultV1 } {
  const { request } = input;
  if (request.contractVersion !== PRODUCT_DECISION_DRAFT_CONTRACT_VERSION) throw new Error("Draft request version is unsupported.");
  const operation: ProductDecisionDraftOperation = request.expectedCurrentRevision === null
    ? "product-decision-draft:create" : "product-decision-draft:revise";
  authorized({ grant: input.grant, operation, organizationId: request.organizationId, questionId: request.questionId });
  if (request.organizationId !== input.runtime.metadata.organizationId) throw new Error("Draft organization mismatch.");
  exact(request.questionId, "Question id"); exact(request.sourceAnswerId, "Source Answer id");
  exact(request.idempotencyKey, "Idempotency key"); iso(request.recordedAt, "Draft recorded time");
  if (request.originatingProposalRef !== null) exact(request.originatingProposalRef, "Originating proposal reference");
  const content = validateContent(request.content);
  const keyDigest = productDecisionDraftDigest(request.idempotencyKey);
  const { idempotencyKey: _omittedIdempotencyKey, ...requestWithoutKey } = request;
  void _omittedIdempotencyKey;
  const fingerprintValue = {
    ...requestWithoutKey, content, operation, actorRef: input.grant.actorRef,
    authorityRef: input.grant.authorityRef, policyRef: input.grant.policyRef,
  };
  const requestFingerprint = productDecisionDraftDigest(fingerprintValue);
  const events = productDecisionDraftEvents(input.runtime);
  const priorOperation = events.find((event) => event.receipt.idempotencyKeyDigest === keyDigest);
  if (priorOperation) {
    if (priorOperation.receipt.requestFingerprint !== requestFingerprint) throw new Error("Draft idempotency conflict.");
    return { runtime: input.runtime, result: { revision: structuredClone(priorOperation.revision), receipt: structuredClone(priorOperation.receipt), idempotent: true } };
  }
  const question = buildDurableProductQuestion({ runtime: input.runtime, questionId: request.questionId });
  if (!question || question.organizationId !== request.organizationId) throw new Error("Product Question is unavailable.");
  if (question.status === "archived") throw new Error("Archived Product Question cannot accept a draft mutation.");
  if (question.revision !== request.expectedQuestionRevision) throw new Error("Product Question revision changed.");
  if (!question.answerHistory.some((answer) => answer.answerId === request.sourceAnswerId)) throw new Error("Source Product Answer is unavailable.");
  const current = currentProductDecisionDraftRevision(input.runtime, request.questionId);
  if ((current?.revision ?? null) !== request.expectedCurrentRevision) throw new Error("Draft current revision changed.");
  if (!current && request.draftId !== null) throw new Error("Initial draft identity must be derived by the owner.");
  const draftId = current?.draftId
    ?? identifier("product-decision-draft", { organizationId: request.organizationId, questionId: request.questionId, sourceAnswerId: request.sourceAnswerId, keyDigest });
  if (request.draftId !== null && request.draftId !== draftId) throw new Error("Draft identity mismatch.");
  const revisionNumber = (request.expectedCurrentRevision ?? 0) + 1;
  if (revisionNumber === 1 && request.predecessorRevisionId !== null) throw new Error("Initial draft cannot have a predecessor.");
  if (revisionNumber > 1 && request.predecessorRevisionId !== current?.revisionId) throw new Error("Draft predecessor mismatch.");
  if (current && (current.draftId !== draftId || current.sourceAnswerId !== request.sourceAnswerId)) throw new Error("Draft lineage mismatch.");
  const contentDigest = productDecisionDraftDigest(content);
  const revisionId = identifier("product-decision-draft-revision", { draftId, revisionNumber, predecessorRevisionId: request.predecessorRevisionId, contentDigest, recordedAt: request.recordedAt });
  const revision: ProductDecisionDraftRevisionV1 = {
    contractVersion: PRODUCT_DECISION_DRAFT_CONTRACT_VERSION,
    organizationId: request.organizationId, questionId: request.questionId, sourceAnswerId: request.sourceAnswerId,
    draftId, revisionId, revision: revisionNumber, predecessorRevisionId: request.predecessorRevisionId,
    originatingProposalRef: request.originatingProposalRef, ...content, recordedAt: request.recordedAt,
    recordedByActorRef: input.grant.actorRef, authorityRef: input.grant.authorityRef, policyRef: input.grant.policyRef,
    requestFingerprint, contentDigest, idempotencyKeyDigest: keyDigest,
  };
  const operationId = identifier("product-decision-draft-operation", { keyDigest, requestFingerprint });
  const receiptIdentityBase = {
    contractVersion: PRODUCT_DECISION_DRAFT_CONTRACT_VERSION, receiptId: "", operationId,
    organizationId: request.organizationId, questionId: request.questionId, sourceAnswerId: request.sourceAnswerId,
    draftId, revisionId, revision: revisionNumber, predecessorRevisionId: request.predecessorRevisionId,
    disposition: revisionNumber === 1 ? "created" as const : "revised" as const, recordedAt: request.recordedAt,
    actorRef: input.grant.actorRef, authorityRef: input.grant.authorityRef, policyRef: input.grant.policyRef,
    requestFingerprint, contentDigest, idempotencyKeyDigest: keyDigest, receiptDigest: "", resultDigest: "",
  };
  const receiptId = identifier("product-decision-draft-receipt", receiptIdentityBase);
  const resultDigest = productDecisionDraftDigest({ revision, receiptId });
  const receiptWithoutDigest = { ...receiptIdentityBase, receiptId, resultDigest };
  const receipt: ProductDecisionDraftOperationReceiptV1 = {
    ...receiptWithoutDigest,
    receiptDigest: productDecisionDraftDigest({ ...receiptWithoutDigest, receiptDigest: "", resultDigest: "" }),
  };
  const event: ProductDecisionDraftRevisionEventV1 = {
    kind: PRODUCT_DECISION_DRAFT_EVENT_KIND, schemaVersion: PRODUCT_DECISION_DRAFT_CONTRACT_VERSION,
    eventId: identifier("product-decision-draft-event", { revisionId, receiptId }), organizationId: request.organizationId,
    questionId: request.questionId, draftId, revision, receipt, occurredAt: request.recordedAt,
  };
  return {
    runtime: { ...input.runtime, metadata: { ...input.runtime.metadata, updatedAt: request.recordedAt }, memory: { ...input.runtime.memory, events: [...input.runtime.memory.events, event] } },
    result: { revision: structuredClone(revision), receipt: structuredClone(receipt), idempotent: false },
  };
}
