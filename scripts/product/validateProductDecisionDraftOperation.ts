import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import { createEmptyOrganizationRuntime, type OrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { StoredOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  currentProductDecisionDraftRevision,
  productDecisionDraftEvents,
  productDecisionDraftHistory,
  recordProductDecisionDraftRevision,
  type ProductDecisionDraftAuthorityGrantV1,
  type ProductDecisionDraftOperation,
  type CreateProductDecisionDraftRequestV1,
  type RecordProductDecisionDraftRequestV1,
  type ReviseProductDecisionDraftRequestV1,
} from "../../product/decisions";
import { ProductDecisionDraftService } from "../../product/integration/productDecisionDraftService";
import { appendProductQuestionEvent, createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import { buildProductQuestionWorkspace } from "../../product/workflow/buildProductQuestionWorkspace";

const organizationId = "decision-draft-validation";
const otherOrganizationId = "decision-draft-other";
const questionId = "question-decision-draft";
const answerId = "answer-decision-draft";
const firstAt = "2026-08-06T12:00:00.000Z";
const secondAt = "2026-08-06T12:05:00.000Z";
let checks = 0;
const check = (value: unknown, message: string): void => { assert.ok(value, message); checks += 1; };

function fixtureRuntime(): OrganizationRuntime {
  let runtime = createEmptyOrganizationRuntime({ organizationId, name: "Decision Draft Validation", now: firstAt });
  runtime = createDurableProductQuestion({ runtime, title: "Which intervention should reduce handoff delay?", questionId, createdAt: firstAt }).runtime;
  runtime = appendProductQuestionEvent(runtime, {
    type: "answer_recorded", organizationId, questionId, occurredAt: firstAt,
    answer: {
      answerId, canonicalSource: "product-answer", revision: 1,
      reasonForChange: "Initial supported Answer", changeReceiptId: "answer-receipt-1", timestamp: firstAt,
      confidence: { level: "moderate", score: 0.7, meaning: "Supported", principalLimiter: "Limited duration", authoritativeSource: "canonical-product-workflow" },
    },
  });
  return runtime;
}

const content = (title = "Assign an owner before kickoff") => ({
  title,
  intervention: "Assign a named onboarding owner before kickoff.",
  rationale: "Earlier ownership should reduce avoidable handoff waiting.",
  assumptions: ["Ownership timing is material."], risks: ["Earlier assignment may increase scheduling load."],
  expectedOutcomes: [{ id: "outcome-handoff-time", description: "Shorter handoff delay", timeHorizon: "30 days" }],
  measures: [{ id: "measure-handoff-hours", name: "Median handoff hours", baseline: 18, target: 8, unit: "hours" }],
  intendedDecisionMakerRef: "person:onboarding-lead", intendedDecisionMakerLabel: "Onboarding lead",
  proposedReviewDate: "2026-09-06T12:00:00.000Z",
});

function request(overrides: Partial<RecordProductDecisionDraftRequestV1> = {}): RecordProductDecisionDraftRequestV1 {
  return {
    contractVersion: "1", organizationId, questionId, sourceAnswerId: answerId,
    draftId: null, expectedQuestionRevision: 1, expectedCurrentRevision: null,
    predecessorRevisionId: null, originatingProposalRef: null, content: content(),
    recordedAt: firstAt, idempotencyKey: "create-draft-1", ...overrides,
  };
}

function grant(operation: ProductDecisionDraftOperation, overrides: Partial<ProductDecisionDraftAuthorityGrantV1> = {}): ProductDecisionDraftAuthorityGrantV1 {
  return {
    contractVersion: "1", operation, organizationId, questionId, actorRef: "actor-authorized",
    scope: { type: "product-question", id: questionId },
    purpose: operation === "product-decision-draft:create" ? "create-product-decision-draft"
      : operation === "product-decision-draft:revise" ? "revise-product-decision-draft" : "read-product-decision-draft",
    sensitivity: "standard", status: "active", validFrom: firstAt,
    authorityRef: "authority-decision-draft", policyRef: "policy-decision-draft", authorized: true,
    authorizedAt: operation === "product-decision-draft:revise" ? secondAt : firstAt, ...overrides,
  };
}

const bytes = (runtime: OrganizationRuntime): Uint8Array => new TextEncoder().encode(JSON.stringify(runtime, null, 2));
const revision = (value: Uint8Array): string => createHash("sha256").update(value).digest("hex");

class MemoryRepository {
  readCount = 0;
  replaceCount = 0;
  current: StoredOrganizationRuntime;
  constructor(runtime: OrganizationRuntime) {
    const value = bytes(runtime);
    this.current = { bytes: value, revision: revision(value), runtime: structuredClone(runtime) };
  }
  async read(id: string): Promise<StoredOrganizationRuntime | null> {
    this.readCount += 1;
    return id === organizationId ? structuredClone(this.current) : null;
  }
  async replace(id: string, value: Uint8Array, expected: string): Promise<StoredOrganizationRuntime> {
    this.replaceCount += 1;
    if (id !== organizationId || expected !== this.current.revision) throw new Error("Runtime revision changed");
    const runtime = JSON.parse(Buffer.from(value).toString("utf8")) as OrganizationRuntime;
    this.current = { bytes: value, revision: revision(value), runtime };
    return structuredClone(this.current);
  }
}

async function main(): Promise<void> {
  const initial = fixtureRuntime();
  const protectedBefore = JSON.stringify({ ...initial.memory, events: undefined });
  const direct = recordProductDecisionDraftRevision({ runtime: initial, request: request(), grant: grant("product-decision-draft:create") });
  check(direct.result.revision.revision === 1, "create revision 1");
  check(direct.result.receipt.disposition === "created" && Boolean(direct.result.receipt.receiptDigest), "immutable create receipt");
  check(productDecisionDraftEvents(direct.runtime).length === 1, "one typed immutable event");
  check(JSON.stringify({ ...direct.runtime.memory, events: undefined }) === protectedBefore, "no cognition or Runtime evolution");
  check(direct.runtime.memory.executiveDecisionRecords.length === 0, "no actual Decision created");
  check(direct.runtime.memory.executiveReviews.length === 0, "no Outcome created");

  const repository = new MemoryRepository(initial);
  const authorizationCalls: ProductDecisionDraftOperation[] = [];
  const service = new ProductDecisionDraftService({
    runtimeRepository: repository,
    authorize: async (input) => {
      authorizationCalls.push(input.operation);
      return grant(input.operation, { authorized: input.userId === "authorized", organizationId: input.organizationId,
        questionId: input.questionId, scope: input.scope, purpose: input.purpose,
        sensitivity: input.sensitivity, authorizedAt: input.evaluatedAt });
    },
  });
  const deniedReadCount = repository.readCount;
  await assert.rejects(() => service.create({ userId: "title-only", request: request() as CreateProductDecisionDraftRequestV1, storageOperation: { requestId: "denied", operatorId: "title-only" } }), /access denied/);
  check(repository.readCount === deniedReadCount, "denied create authorizes before repository read");
  const withheld = await service.read({ userId: "participant-only", request: { contractVersion: "1", organizationId, questionId, evaluatedAt: firstAt } });
  check(withheld.status === "withheld" && withheld.runtimeRevision === null && repository.readCount === deniedReadCount, "denied read discloses no repository state");

  const created = await service.create({ userId: "authorized", request: request() as CreateProductDecisionDraftRequestV1, storageOperation: { requestId: "create-storage", operatorId: "actor-authorized" } });
  check(created.revision.revision === 1 && repository.replaceCount === 1, "authorized create atomically replaces Runtime");
  const read = await service.read({ userId: "authorized", request: { contractVersion: "1", organizationId, questionId, evaluatedAt: firstAt } });
  check(read.status === "available" && read.current.lifecycle === "active" && read.history.length === 1, "authorized read returns current and history");
  const createRevision = created.runtimeRevision;
  const replay = await service.create({ userId: "authorized", request: request() as CreateProductDecisionDraftRequestV1, storageOperation: { requestId: "create-replay", operatorId: "actor-authorized" } });
  check(replay.idempotent && replay.receipt.receiptId === created.receipt.receiptId && replay.receipt.receiptDigest === created.receipt.receiptDigest && replay.runtimeRevision === createRevision && repository.replaceCount === 1, "same-key same-request returns original receipt without mutation");
  await assert.rejects(() => service.create({ userId: "authorized", request: request({ content: content("Conflicting title") }) as CreateProductDecisionDraftRequestV1, storageOperation: { requestId: "conflict", operatorId: "actor-authorized" } }), /idempotency conflict/);
  checks += 1;

  const reviseRequest = request({
    draftId: created.revision.draftId, expectedCurrentRevision: 1,
    predecessorRevisionId: created.revision.revisionId, recordedAt: secondAt,
    idempotencyKey: "revise-draft-2", content: content("Assign an accountable owner before kickoff"),
  });
  await assert.rejects(() => service.revise({ userId: "intended-decision-maker", request: reviseRequest as ReviseProductDecisionDraftRequestV1, storageOperation: { requestId: "denied-revise", operatorId: "metadata-only" } }), /access denied/);
  checks += 1;
  const revised = await service.revise({ userId: "authorized", request: reviseRequest as ReviseProductDecisionDraftRequestV1, storageOperation: { requestId: "revise-storage", operatorId: "actor-authorized" } });
  check(revised.revision.revision === 2 && revised.receipt.disposition === "revised", "revise creates revision 2 and immutable receipt");
  const history = productDecisionDraftHistory(repository.current.runtime, questionId, created.revision.draftId);
  check(history.length === 2 && history[0]?.revisionId === created.revision.revisionId, "revision 1 preserved with append-only history");
  check(currentProductDecisionDraftRevision(repository.current.runtime, questionId)?.revision === 2, "one current active revision is selected");
  await assert.rejects(() => service.revise({ userId: "authorized", request: { ...reviseRequest, idempotencyKey: "stale", recordedAt: "2026-08-06T12:06:00.000Z" } as ReviseProductDecisionDraftRequestV1, storageOperation: { requestId: "stale", operatorId: "actor-authorized" } }), /current revision changed/);
  checks += 1;
  await assert.rejects(() => service.revise({ userId: "authorized", request: { ...reviseRequest, expectedCurrentRevision: 2, predecessorRevisionId: "wrong", idempotencyKey: "wrong-predecessor", recordedAt: "2026-08-06T12:07:00.000Z" } as ReviseProductDecisionDraftRequestV1, storageOperation: { requestId: "wrong", operatorId: "actor-authorized" } }), /predecessor mismatch/);
  checks += 1;

  assert.throws(() => recordProductDecisionDraftRevision({ runtime: initial, request: request({ organizationId: otherOrganizationId, idempotencyKey: "cross-org" }), grant: grant("product-decision-draft:create", { organizationId: otherOrganizationId }) }), /organization mismatch/);
  checks += 1;
  assert.throws(() => recordProductDecisionDraftRevision({ runtime: initial, request: request({ questionId: "other-question", idempotencyKey: "cross-question" }), grant: grant("product-decision-draft:create", { questionId: "other-question", scope: { type: "product-question", id: "other-question" } }) }), /Question is unavailable/);
  checks += 1;
  assert.throws(() => recordProductDecisionDraftRevision({ runtime: repository.current.runtime, request: request({ draftId: revised.revision.draftId, expectedCurrentRevision: 2, predecessorRevisionId: revised.revision.revisionId, idempotencyKey: "status-invalid", recordedAt: "2026-08-06T12:08:00.000Z", content: { ...content(), status: "approved" } as never }), grant: grant("product-decision-draft:revise", { authorizedAt: "2026-08-06T12:08:00.000Z" }) }), /unsupported field/);
  checks += 1;

  const workspace = buildProductQuestionWorkspace({ runtime: repository.current.runtime, questionId });
  check(workspace.contractVersion === "1" && workspace.decisionDraft?.id === revised.revision.draftId, "ProductQuestionWorkspaceV2 contract remains unchanged and projects the active persisted draft");
  check(!("status" in revised.revision) && !("decisionRecordId" in revised.revision), "draft cannot claim decided approved or deferred Decision status");
  check(authorizationCalls[0] === "product-decision-draft:create" && authorizationCalls.includes("product-decision-draft:read"), "exact operation authorization used");

  const event = productDecisionDraftEvents(direct.runtime)[0]!;
  const tamperedContent = structuredClone(direct.runtime);
  (tamperedContent.memory.events.at(-1) as typeof event).revision.title = "Tampered";
  assert.throws(() => productDecisionDraftEvents(tamperedContent), /content digest/); checks += 1;
  const tamperedReceipt = structuredClone(direct.runtime);
  (tamperedReceipt.memory.events.at(-1) as typeof event).receipt.receiptDigest = "0".repeat(64);
  assert.throws(() => productDecisionDraftEvents(tamperedReceipt), /receipt digest/); checks += 1;
  const malformedVersion = structuredClone(direct.runtime);
  (malformedVersion.memory.events.at(-1) as { schemaVersion: string }).schemaVersion = "2";
  assert.throws(() => productDecisionDraftEvents(malformedVersion), /malformed/); checks += 1;
  const foreignEvent = structuredClone(direct.runtime);
  (foreignEvent.memory.events.at(-1) as typeof event).organizationId = otherOrganizationId;
  assert.throws(() => productDecisionDraftEvents(foreignEvent), /malformed/); checks += 1;
  const duplicateRevision = structuredClone(direct.runtime);
  duplicateRevision.memory.events.push(structuredClone(event));
  assert.throws(() => productDecisionDraftHistory(duplicateRevision, questionId), /not sequential/); checks += 1;

  const branchBase = direct.runtime;
  const branchRequest = (key: string, title: string, at: string) => request({
    draftId: direct.result.revision.draftId, expectedCurrentRevision: 1,
    predecessorRevisionId: direct.result.revision.revisionId, idempotencyKey: key,
    recordedAt: at, content: content(title),
  });
  const branchA = recordProductDecisionDraftRevision({ runtime: branchBase, request: branchRequest("branch-a", "Branch A", "2026-08-06T12:10:00.000Z"), grant: grant("product-decision-draft:revise", { authorizedAt: "2026-08-06T12:10:00.000Z" }) });
  const branchB = recordProductDecisionDraftRevision({ runtime: branchBase, request: branchRequest("branch-b", "Branch B", "2026-08-06T12:11:00.000Z"), grant: grant("product-decision-draft:revise", { authorizedAt: "2026-08-06T12:11:00.000Z" }) });
  const branched = structuredClone(branchBase);
  branched.memory.events.push(branchA.runtime.memory.events.at(-1), branchB.runtime.memory.events.at(-1));
  assert.throws(() => currentProductDecisionDraftRevision(branched, questionId), /not sequential/); checks += 1;

  assert.throws(() => recordProductDecisionDraftRevision({ runtime: initial, request: request({ draftId: "caller-supplied", idempotencyKey: "wrong-draft-id" }), grant: grant("product-decision-draft:create") }), /must be derived/); checks += 1;
  assert.throws(() => recordProductDecisionDraftRevision({ runtime: direct.runtime, request: request(), grant: grant("product-decision-draft:create", { actorRef: "different-actor" }) }), /idempotency conflict/); checks += 1;
  assert.throws(() => recordProductDecisionDraftRevision({ runtime: initial, request: request({ idempotencyKey: "revoked" }), grant: grant("product-decision-draft:create", { status: "revoked", revokedAt: firstAt }) }), /access denied/); checks += 1;
  assert.throws(() => recordProductDecisionDraftRevision({ runtime: initial, request: request({ idempotencyKey: "wrong-purpose" }), grant: grant("product-decision-draft:create", { purpose: "read-product-decision-draft" }) }), /access denied/); checks += 1;

  let archived = fixtureRuntime();
  archived = appendProductQuestionEvent(archived, { type: "status_changed", organizationId, questionId, occurredAt: secondAt, status: "archived" });
  assert.throws(() => recordProductDecisionDraftRevision({ runtime: archived, request: request({ idempotencyKey: "archived", recordedAt: secondAt }), grant: grant("product-decision-draft:create", { authorizedAt: secondAt }) }), /Archived/); checks += 1;

  class StaleRepository extends MemoryRepository {
    override async replace(): Promise<StoredOrganizationRuntime> { throw new Error("Runtime revision changed"); }
  }
  const staleRepository = new StaleRepository(initial);
  const staleService = new ProductDecisionDraftService({
    runtimeRepository: staleRepository,
    authorize: async (input) => grant(input.operation, { organizationId: input.organizationId, questionId: input.questionId,
      scope: input.scope, purpose: input.purpose, sensitivity: input.sensitivity, authorizedAt: input.evaluatedAt }),
  });
  await assert.rejects(() => staleService.create({ userId: "authorized", request: request({ idempotencyKey: "stale-repository" }) as CreateProductDecisionDraftRequestV1, storageOperation: { requestId: "stale-repository", operatorId: "actor-authorized" } }), /Runtime revision changed/); checks += 1;

  const persistedJson = JSON.stringify(repository.current.runtime.memory.events);
  check(!persistedJson.includes("create-draft-1") && !persistedJson.includes("validFrom") && !persistedJson.includes("scope\""), "raw idempotency key and raw authorization grant are not persisted");
  check(initial.memory.events.length + 2 === repository.current.runtime.memory.events.length, "only two Product Workflow events were appended");
  console.log(`Product Decision Draft operation validation PASS (${checks} checks)`);
}

void main();
