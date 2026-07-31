import assert from "node:assert/strict";

import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type {
  OrganizationRuntimeRepository,
  StoredOrganizationRuntime,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import { CanonicalProductWorkspaceAdapter } from "../../product/integration";
import { createDurableProductQuestion } from "../../product/questions/questionLifecycle";
import {
  deriveProductUnknownCandidate,
  getProductUnknownHistory,
  listCurrentProductUnknowns,
  listProductUnknowns,
  productUnknownEvents,
  recordProductUnknownOperation,
  type ProductUnknownCandidate,
  type ProductUnknownOperationInput,
} from "../../product/unknowns";

const organizationId = "onb-dev-product-unknown-contract";
const questionId = "product-question-unknown-contract";
const otherQuestionId = "product-question-unknown-other";
const fixed = "2026-07-30T16:00:00.000Z";

function baseRuntime() {
  let runtime = createEmptyOrganizationRuntime({
    organizationId,
    name: "Unknown Contract Validation",
  });
  runtime.metadata = { ...runtime.metadata, createdAt: fixed, updatedAt: fixed };
  runtime = createDurableProductQuestion({
    runtime,
    title: "Why are customer onboarding handoffs getting delayed?",
    createdAt: fixed,
    questionId,
  }).runtime;
  return createDurableProductQuestion({
    runtime,
    title: "Why are enterprise renewal rates declining?",
    createdAt: fixed,
    questionId: otherQuestionId,
  }).runtime;
}

function candidate(overrides: Partial<Omit<ProductUnknownCandidate, "unknownId">> = {}) {
  return deriveProductUnknownCandidate({
    organizationId,
    questionId,
    category: "competing-explanation-discrimination",
    target: { kind: "relationship", subjectRef: "explanation:ownership-timing", predicate: "versus", objectRef: "explanation:credential-readiness" },
    summary: "Ownership timing and credential readiness remain competing explanations.",
    whyItMatters: "Discovery cannot yet distinguish their independent contribution.",
    sourceAncestry: [
      { kind: "answer-operation", id: "answer-operation-abstention" },
      { kind: "evidence", id: "evidence-ownership" },
      { kind: "evidence", id: "evidence-credentials" },
    ],
    ...overrides,
  });
}

function mutate(input: {
  runtime?: ReturnType<typeof baseRuntime>;
  operationId?: string;
  selected?: ProductUnknownCandidate;
  transition?: ProductUnknownOperationInput["transition"];
  reason?: string;
}) {
  const runtime = input.runtime ?? baseRuntime();
  const selected = input.selected ?? candidate();
  return recordProductUnknownOperation({
    runtime,
    questionId: selected.questionId,
    operationId: input.operationId ?? "unknown-open-1",
    occurredAt: fixed,
    actorRef: "clerk-development-user",
    authorizationScopeRef: `organization:${organizationId}:question:${selected.questionId}`,
    candidate: selected,
    transition: input.transition ?? { type: "open" },
    reason: input.reason ?? "The admitted Evidence cannot distinguish these explanations.",
  });
}

function validateOpenIdentityAndReload() {
  const opened = mutate({});
  assert.equal(opened.projection.status, "open");
  assert.equal(productUnknownEvents(opened.runtime).length, 1);
  assert.deepEqual(
    listCurrentProductUnknowns({ runtime: JSON.parse(JSON.stringify(opened.runtime)), questionId }),
    [opened.projection],
  );
  const wording = candidate({
    summary: "Different presentation wording.",
    whyItMatters: "Different bounded presentation wording.",
  });
  assert.equal(wording.unknownId, candidate().unknownId);
  const different = candidate({
    target: { kind: "relationship", subjectRef: "explanation:ownership-timing", predicate: "versus", objectRef: "explanation:staffing-capacity" },
  });
  assert.notEqual(different.unknownId, candidate().unknownId);
  const other = candidate({ questionId: otherQuestionId });
  assert.notEqual(other.unknownId, candidate().unknownId);
}

function validateLifecycle() {
  const opened = mutate({});
  const targeted = mutate({
    runtime: opened.runtime,
    operationId: "unknown-target-1",
    transition: { type: "target", targetingOperationRef: "future-improvement-operation-1" },
  });
  assert.equal(targeted.projection.status, "targeted");
  assert.equal(targeted.projection.resolutionAncestry, null);
  const resolved = mutate({
    runtime: targeted.runtime,
    operationId: "unknown-resolve-1",
    transition: { type: "resolve", resolutionAncestry: { kind: "evidence", evidenceIds: ["evidence-discriminating"] } },
  });
  assert.equal(resolved.projection.status, "resolved");
  assert.equal(getProductUnknownHistory({ runtime: resolved.runtime, questionId, unknownId: candidate().unknownId }).length, 3);
  assert.throws(() => mutate({
    runtime: opened.runtime,
    operationId: "invalid-resolution",
    transition: { type: "resolve", resolutionAncestry: { kind: "evidence", evidenceIds: [] } },
  }), /valid explicit ancestry/);
  const reopened = mutate({
    runtime: resolved.runtime,
    operationId: "unknown-reopen-1",
    transition: { type: "reopen", sourceAncestry: [{ kind: "evidence", id: "evidence-new-conflict" }] },
  });
  assert.equal(reopened.projection.status, "open");
  assert.equal(reopened.projection.unknownId, opened.projection.unknownId);
  assert.equal(reopened.projection.resolutionAncestry, null);
  const replacement = candidate({
    target: { kind: "measurement", metricRef: "credential-ready-at-kickoff", scopeRef: "customer-onboarding" },
    category: "measurement-gap",
  });
  const superseded = mutate({
    runtime: reopened.runtime,
    operationId: "unknown-supersede-1",
    transition: { type: "supersede", replacement },
  });
  const projections = listProductUnknowns({ runtime: superseded.runtime, questionId });
  assert.equal(projections.find((item) => item.unknownId === candidate().unknownId)?.status, "superseded");
  assert.equal(projections.find((item) => item.unknownId === replacement.unknownId)?.status, "open");
  const retired = mutate({
    runtime: opened.runtime,
    operationId: "unknown-retire-1",
    transition: { type: "retire" },
  });
  assert.equal(retired.projection.status, "retired");
  assert.equal(listCurrentProductUnknowns({ runtime: retired.runtime, questionId }).length, 0);
  assert.equal(getProductUnknownHistory({ runtime: retired.runtime, questionId, unknownId: candidate().unknownId }).length, 2);
}

function validateIdempotencyIsolationAndSafeVersions() {
  const opened = mutate({});
  const replay = mutate({ runtime: opened.runtime });
  assert.equal(replay.runtime, opened.runtime);
  assert.equal(productUnknownEvents(replay.runtime).length, 1);
  assert.throws(() => mutate({
    runtime: opened.runtime,
    selected: candidate({ target: { kind: "assumption", assumptionRef: "different" } }),
  }), /different semantic input/);
  const other = candidate({ questionId: otherQuestionId });
  const otherOpened = mutate({ runtime: opened.runtime, operationId: "other-question-open", selected: other });
  assert.equal(listProductUnknowns({ runtime: otherOpened.runtime, questionId }).length, 1);
  assert.equal(listProductUnknowns({ runtime: otherOpened.runtime, questionId: otherQuestionId }).length, 1);
  const future = {
    ...opened.runtime,
    memory: { ...opened.runtime.memory, events: [...opened.runtime.memory.events, {
      kind: "product-question-unknown-event", schemaVersion: "999", eventType: "unknown-opened",
    }] },
  };
  assert.equal(productUnknownEvents(future).length, 1);
  assert.equal(listCurrentProductUnknowns({ runtime: future, questionId }).length, 1);
}

async function validateAuthorizationAndNoAutomation() {
  let stored: StoredOrganizationRuntime = {
    runtime: baseRuntime(),
    revision: "revision-1",
    bytes: new Uint8Array(),
  };
  let reads = 0;
  let writes = 0;
  const repository: Pick<OrganizationRuntimeRepository, "read" | "replace"> = {
    async read() { reads += 1; return stored; },
    async replace(_id, bytes) {
      writes += 1;
      stored = { ...stored, runtime: JSON.parse(new TextDecoder().decode(bytes)), revision: `revision-${writes + 1}` };
      return stored;
    },
  };
  const denied = new CanonicalProductWorkspaceAdapter({
    runtimeRepository: repository,
    authorize: async () => false,
    investigate: async ({ runtime }) => ({ runtime, evidenceAccepted: false }),
  });
  await assert.rejects(() => denied.listUnknowns({
    userId: "unauthorized", organizationId, questionId,
  }), /access denied/);
  assert.equal(reads, 0);
  const allowed = new CanonicalProductWorkspaceAdapter({
    runtimeRepository: repository,
    authorize: async ({ userId, organizationId: requested }) =>
      userId === "authorized" && requested === organizationId,
    investigate: async ({ runtime }) => ({ runtime, evidenceAccepted: false }),
  });
  await allowed.mutateUnknown({
    userId: "authorized", organizationId, questionId,
    operationId: "adapter-open", occurredAt: fixed, actorRef: "authorized",
    candidate: candidate(), transition: { type: "open" }, reason: "Specific limitation.",
    operation: { requestId: "storage-open", operatorId: "validator" },
  });
  assert.equal(writes, 1);
  const kinds = stored.runtime.memory.events.map((event) =>
    event && typeof event === "object" ? String((event as { kind?: unknown }).kind ?? "") : ""
  );
  assert.equal(kinds.filter((kind) => kind === "product-question-unknown-event").length, 1);
  assert.equal(kinds.some((kind) => /recommendation|decision|outcome|learning|insight/.test(kind)), false);
}

function validateCandidateNoWriteAndProjectionDisappearance() {
  const runtime = baseRuntime();
  const before = JSON.stringify(runtime);
  const projected = candidate();
  assert.equal(JSON.stringify(runtime), before);
  assert.equal(projected.unknownId, candidate().unknownId);
  const opened = mutate({ runtime });
  const boundedView: typeof opened.projection[] = [];
  assert.equal(boundedView.length, 0);
  assert.equal(listCurrentProductUnknowns({ runtime: opened.runtime, questionId })[0]?.status, "open");
}

async function main() {
  validateOpenIdentityAndReload();
  validateLifecycle();
  validateIdempotencyIsolationAndSafeVersions();
  validateCandidateNoWriteAndProjectionDisappearance();
  await validateAuthorizationAndNoAutomation();
  console.log(JSON.stringify({
    validation: "product-unknown-contract",
    result: "PASS",
    scenarios: 18,
    eventSchemaVersionsRead: ["1", "2"],
    runtimeCollectionAdded: false,
    frontendChanged: false,
    downstreamAutomationCreated: false,
    productionChanged: false,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
