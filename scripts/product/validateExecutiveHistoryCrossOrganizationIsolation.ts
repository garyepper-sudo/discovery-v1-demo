import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { OrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { resolveScopedGovernanceContext, type GovernedScopeRef } from "../../engine/v3/governance/scopedGovernanceContext";
import { FilesystemExecutiveHistoryAccessRepository } from "../../engine/v3/governance/executiveHistoryAccessRepository";
import { ExecutiveHistoryCurrentAccessService } from "../../engine/v3/governance/executiveHistoryCurrentAccessService";
import type { ExecutiveHistoryAccessRequestV1 } from "../../engine/v3/governance/executiveHistoryCurrentAccessContracts";
import { CanonicalExecutiveHistoryAccessComposition, serializeExecutiveHistorySafeProjectionV1 } from "../../product/integration/canonicalExecutiveHistoryAccessComposition";
import type { ExecutiveReview } from "../../engine/v3/work/executiveReview";
import type { ExecutiveLearning } from "../../engine/v3/work/executiveLearning";

const execute = promisify(execFile);
const self = fileURLToPath(import.meta.url);
const AT = "2026-08-11T12:00:00.000Z";
const PURPOSE = "executive-history-current-disclosure";
const COMMON_REVIEW = "review-colliding-local-id";
const COMMON_OUTCOME = "outcome-colliding-local-id";
const COMMON_LEARNING = "learning-colliding-local-id";

function scope(organizationId: string): GovernedScopeRef {
  return { organizationId, type: "team", id: "leadership-team" };
}

function governance(organizationId: string, actor: string, authorized: boolean) {
  const requestedScope = scope(organizationId);
  return resolveScopedGovernanceContext({
    organizationId,
    subjectId: actor,
    requestedScope,
    operation: "leadership-history:read",
    purpose: PURPOSE,
    sensitivity: "standard",
    evaluatedAt: AT,
    temporal: { mode: "current" },
    serverResolvedAuthority: authorized ? [{
      authorityRef: `authority:${organizationId}:${actor}`,
      policyRef: `policy:${organizationId}:v1`,
      organizationId,
      subjectId: actor,
      scope: requestedScope,
      operations: ["leadership-history:read"],
      sensitivity: ["standard"],
      relationship: "direct",
      status: "active",
      validFrom: "2026-01-01T00:00:00.000Z",
    }] : [],
  });
}

function request(
  organizationId: string,
  actor: string,
  kind: ExecutiveHistoryAccessRequestV1["recordKind"],
  recordId: string,
  authorized: boolean,
  parentReviewId = COMMON_REVIEW,
): ExecutiveHistoryAccessRequestV1 {
  return {
    contractVersion: "1",
    organizationId,
    subjectId: actor,
    recordKind: kind,
    recordId,
    ...(kind === "observed-outcome" ? { parentReviewId } : {}),
    action: kind === "executive-review" ? "review:read" : kind === "observed-outcome" ? "outcome:read" : "learning:read",
    purpose: PURPOSE,
    requestedScope: scope(organizationId),
    sensitivity: "standard",
    evaluatedAt: AT,
    assignment: { assignmentId: `assignment:${actor}`, assignmentRevision: `assignment:${actor}:v1`, state: "active" },
    governance: governance(organizationId, actor, authorized),
  };
}

function dependencies(root: string) {
  const repository = new FilesystemExecutiveHistoryAccessRepository(path.join(root, "access"));
  const access = new ExecutiveHistoryCurrentAccessService(repository);
  const runtime = new FilesystemOrganizationRuntimeRepository(path.join(root, "runtime"));
  return { repository, access, runtime };
}

async function seed(root: string, organizationId: string, actor: string): Promise<void> {
  const value = dependencies(root);
  const runtime = createEmptyOrganizationRuntime({ organizationId, now: AT });
  const review: ExecutiveReview = {
    id: COMMON_REVIEW,
    organizationId,
    executiveWorkId: `work:${organizationId}`,
    decisionRecordId: `decision:${organizationId}`,
    selectedOptionId: "option-1",
    status: "successful",
    observedOutcomes: [{ expectedOutcomeId: COMMON_OUTCOME, observation: `protected:${organizationId}`, achieved: true, confidence: 0.8 }],
    summary: `protected-review:${organizationId}`,
    reviewedAt: AT,
  };
  const learning: ExecutiveLearning = {
    id: COMMON_LEARNING,
    organizationId,
    executiveReviewId: COMMON_REVIEW,
    executiveWorkId: review.executiveWorkId,
    decisionRecordId: review.decisionRecordId,
    selectedOptionId: review.selectedOptionId,
    summary: `protected-learning:${organizationId}`,
    confidenceAdjustment: 0.1,
    organizationalKnowledge: [`knowledge:${organizationId}`],
    futureRecommendationChanges: [],
    learnedAt: AT,
  };
  runtime.memory.executiveReviews = [review];
  runtime.memory.executiveLearning = [learning];
  await value.runtime.create(organizationId, new TextEncoder().encode(JSON.stringify(runtime, null, 2)), { requestId: `runtime:${organizationId}`, operatorId: actor });
  const policy = await value.access.createPolicy({ organizationId, policyId: `history-policy-${organizationId}`, actions: ["review:read", "outcome:read", "learning:read"], purposes: [PURPOSE], sensitivity: "standard", audience: [{ kind: "direct", subjectId: actor, assignmentRevision: `assignment:${actor}:v1` }], effectiveAt: AT, authorityRevisionRefs: [`authority:${organizationId}:v1`], actorRef: actor, idempotencyKey: `policy:${organizationId}` });
  for (const [recordKind, recordId, parentReviewId] of [["executive-review", COMMON_REVIEW, null], ["executive-learning", COMMON_LEARNING, COMMON_REVIEW]] as const) {
    await value.access.createPendingBinding({ organizationId, recordKind, recordId, parentReviewId, policyRevisionId: policy.policyRevisionId, sensitivity: "standard", creationOperationId: `create:${organizationId}:${recordId}`, effectiveAt: AT, actorRef: actor, idempotencyKey: `binding:${organizationId}:${recordId}:pending` });
    await value.access.activateBinding({ organizationId, recordKind, recordId, occurredAt: AT, actorRef: actor, idempotencyKey: `binding:${organizationId}:${recordId}:active`, semanticOwnerPublicationRef: `runtime:${organizationId}`, semanticOwnerIntegrityDigest: `owner:${organizationId}:${recordId}` });
  }
}

async function validate(root: string): Promise<number> {
  const A = "organization-history-a", B = "organization-history-b", actorA = "principal-a", actorB = "principal-b";
  const value = dependencies(root);
  let loads = 0;
  const runtime = new Proxy(value.runtime, { get(target, key, receiver) { if (key === "read") return async (...args: Parameters<OrganizationRuntimeRepository["read"]>) => { loads += 1; return target.read(...args); }; return Reflect.get(target, key, receiver); } }) as OrganizationRuntimeRepository;
  const composition = new CanonicalExecutiveHistoryAccessComposition({ access: value.access, runtime, authorizeAdministration: async () => true });
  let checks = 0;
  const localA = await composition.readReview(request(A, actorA, "executive-review", COMMON_REVIEW, true) as never);
  const localB = await composition.readReview(request(B, actorB, "executive-review", COMMON_REVIEW, true) as never);
  assert.equal(localA?.review.organizationId, A); checks += 1;
  assert.equal(localB?.review.organizationId, B); checks += 1;
  assert.notEqual(localA?.review.summary, localB?.review.summary); checks += 1;
  assert.equal((await composition.readOutcome(request(A, actorA, "observed-outcome", COMMON_OUTCOME, true) as never))?.outcome.expectedOutcomeId, COMMON_OUTCOME); checks += 1;
  assert.equal((await composition.readLearning(request(B, actorB, "executive-learning", COMMON_LEARNING, true) as never))?.learning.organizationId, B); checks += 1;
  const beforeDeniedLoads = loads;
  const aToB = await composition.projectReview(request(B, actorA, "executive-review", COMMON_REVIEW, false) as never);
  const bToA = await composition.projectReview(request(A, actorB, "executive-review", COMMON_REVIEW, false) as never);
  assert.equal(aToB.disposition, "inaccessible"); checks += 1;
  assert.equal(bToA.disposition, "inaccessible"); checks += 1;
  assert.equal(loads, beforeDeniedLoads); checks += 1;
  assert.equal(serializeExecutiveHistorySafeProjectionV1(aToB), serializeExecutiveHistorySafeProjectionV1(bToA)); checks += 1;
  const foreignOutcome = await composition.projectOutcome(request(B, actorA, "observed-outcome", COMMON_OUTCOME, false, "review-only-in-a") as never);
  const foreignLearning = await composition.projectLearning(request(A, actorB, "executive-learning", COMMON_LEARNING, false) as never);
  assert.equal(foreignOutcome.disposition, "inaccessible"); checks += 1;
  assert.equal(foreignLearning.disposition, "inaccessible"); checks += 1;
  assert.equal(loads, beforeDeniedLoads); checks += 1;
  const policyA = (await value.repository.read(A)).store.policies[0]!;
  await assert.rejects(() => value.access.createPendingBinding({ organizationId: B, recordKind: "executive-review", recordId: "foreign-policy-record", policyRevisionId: policyA.policyRevisionId, sensitivity: "standard", creationOperationId: "foreign", effectiveAt: AT, actorRef: actorA, idempotencyKey: "foreign-policy" })); checks += 1;
  assert.equal((await value.repository.read(A)).store.organizationId, A); checks += 1;
  assert.equal((await value.repository.read(B)).store.organizationId, B); checks += 1;
  assert.equal((await value.repository.read(A)).store.bindings.length, 4); checks += 1;
  assert.equal((await value.repository.read(B)).store.bindings.length, 4); checks += 1;
  const serialized = [aToB, bToA, foreignOutcome, foreignLearning].map(serializeExecutiveHistorySafeProjectionV1);
  assert.equal(new Set(serialized).size, 1); checks += 1;
  for (const forbidden of [A, B, actorA, actorB, COMMON_REVIEW, COMMON_OUTCOME, COMMON_LEARNING, "policy", "binding", "protected"]) {
    assert.equal(serialized[0]!.includes(forbidden), false); checks += 1;
  }
  return checks;
}

async function main(): Promise<void> {
  const mode = process.argv[2], rootArgument = process.argv[3];
  if (mode && rootArgument) {
    if (mode === "seed-a") return seed(rootArgument, "organization-history-a", "principal-a");
    if (mode === "seed-b") return seed(rootArgument, "organization-history-b", "principal-b");
    const checks = await validate(rootArgument);
    console.log(`WORKER PASS checks=${checks}`);
    return;
  }
  const root = await mkdtemp(path.join(tmpdir(), "discovery-executive-history-cross-org-"));
  try {
    await execute(process.execPath, ["--import", "tsx", self, "seed-a", root], { env: process.env });
    await execute(process.execPath, ["--import", "tsx", self, "seed-b", root], { env: process.env });
    const result = await execute(process.execPath, ["--import", "tsx", self, "validate", root], { env: process.env });
    const match = result.stdout.match(/checks=(\d+)/);
    assert.ok(match && Number(match[1]) >= 24);
    console.log(`RESULT PASS executive-history-cross-organization checks=${match[1]} processes=3 foreignProtectedLoads=0`);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
