import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import type { OrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { FilesystemExecutiveHistoryAccessRepository } from "../../engine/v3/governance/executiveHistoryAccessRepository";
import { ExecutiveHistoryCurrentAccessService } from "../../engine/v3/governance/executiveHistoryCurrentAccessService";
import type { ExecutiveHistoryAccessPolicyRevisionV1 } from "../../engine/v3/governance/executiveHistoryCurrentAccessContracts";
import { CanonicalExecutiveHistoryAccessComposition } from "../../product/integration/canonicalExecutiveHistoryAccessComposition";
import { ACTOR, ORG, PURPOSE, governance, learning, request, review, setup } from "./validateExecutiveHistoryCurrentAccess";

const EVALUATED_AT = "2026-08-11T18:00:00.000Z";
const currentRequest = (kind: "executive-review" | "observed-outcome" | "executive-learning", id: string) =>
  request(kind, id, ACTOR, { evaluatedAt: EVALUATED_AT, governance: governance(ACTOR, true, PURPOSE, EVALUATED_AT) });

const execute = promisify(execFile);
const self = fileURLToPath(import.meta.url);

function policyHead(
  policies: ExecutiveHistoryAccessPolicyRevisionV1[],
  action: "review:read" | "learning:read",
): ExecutiveHistoryAccessPolicyRevisionV1 {
  const candidates = policies.filter((value) => value.actions.includes(action));
  const predecessors = new Set(candidates.map((value) => value.predecessorRevisionId).filter(Boolean));
  const heads = candidates.filter((value) => !predecessors.has(value.policyRevisionId));
  assert.equal(heads.length, 1);
  return heads[0]!;
}

function dependencies(root: string) {
  const repository = new FilesystemExecutiveHistoryAccessRepository(path.join(root, "access"));
  const access = new ExecutiveHistoryCurrentAccessService(repository);
  const runtime = new FilesystemOrganizationRuntimeRepository(path.join(root, "runtime"));
  return { repository, access, runtime };
}

async function projectionWithLoads(
  root: string,
  kind: "executive-review" | "observed-outcome" | "executive-learning",
  id: string,
) {
  const value = dependencies(root);
  let loads = 0;
  const runtime = new Proxy(value.runtime, {
    get(target, key, receiver) {
      if (key === "read") return async (...args: Parameters<OrganizationRuntimeRepository["read"]>) => {
        loads += 1;
        return target.read(...args);
      };
      return Reflect.get(target, key, receiver);
    },
  }) as OrganizationRuntimeRepository;
  const composition = new CanonicalExecutiveHistoryAccessComposition({
    access: value.access,
    runtime,
    authorizeAdministration: async () => true,
  });
  const requested = currentRequest(kind, id) as never;
  const result = kind === "executive-review"
    ? await composition.projectReview(requested)
    : kind === "observed-outcome"
      ? await composition.projectOutcome(requested)
      : await composition.projectLearning(requested);
  return { result, loads };
}

async function worker(mode: string, root: string): Promise<void> {
  if (mode === "seed") return void (await setup(root));
  const value = dependencies(root);
  if (mode === "verify-all") {
    assert.equal((await value.access.authorize(currentRequest("executive-review", review.id))).disposition, "authorized");
    assert.equal((await value.access.authorize(currentRequest("observed-outcome", "outcome-001"))).disposition, "authorized");
    assert.equal((await value.access.authorize(currentRequest("executive-learning", learning.id))).disposition, "authorized");
    return;
  }
  if (mode === "revoke-review") {
    const reviewPolicy = policyHead((await value.repository.read(ORG)).store.policies, "review:read");
    await value.access.revokePolicy({ organizationId: ORG, policyId: reviewPolicy.policyId, expectedPolicyRevisionId: reviewPolicy.policyRevisionId, occurredAt: "2026-08-11T13:00:00.000Z", actorRef: ACTOR, idempotencyKey: "inherit:review:revoke" });
    return;
  }
  if (mode === "verify-review-revoked") {
    const deniedReview = await projectionWithLoads(root, "executive-review", review.id);
    const deniedOutcome = await projectionWithLoads(root, "observed-outcome", "outcome-001");
    assert.equal(deniedReview.result.disposition, "inaccessible");
    assert.equal(deniedOutcome.result.disposition, "inaccessible");
    assert.equal(deniedReview.loads + deniedOutcome.loads, 0);
    assert.equal((await value.access.authorize(currentRequest("executive-learning", learning.id))).disposition, "authorized");
    return;
  }
  if (mode === "restore-review") {
    const reviewPolicy = policyHead((await value.repository.read(ORG)).store.policies, "review:read");
    const restored = await value.access.restorePolicy({ organizationId: ORG, policyId: reviewPolicy.policyId, expectedPolicyRevisionId: reviewPolicy.policyRevisionId, occurredAt: "2026-08-11T14:00:00.000Z", actorRef: ACTOR, idempotencyKey: "inherit:review:restore" });
    await value.access.rebindPolicy({ organizationId: ORG, recordKind: "executive-review", recordId: review.id, policyRevisionId: restored.policyRevisionId, occurredAt: restored.effectiveAt, actorRef: ACTOR, idempotencyKey: "inherit:review:rebind" });
    return;
  }
  if (mode === "revoke-learning") {
    const learningPolicy = policyHead((await value.repository.read(ORG)).store.policies, "learning:read");
    await value.access.revokePolicy({ organizationId: ORG, policyId: learningPolicy.policyId, expectedPolicyRevisionId: learningPolicy.policyRevisionId, occurredAt: "2026-08-11T15:00:00.000Z", actorRef: ACTOR, idempotencyKey: "inherit:learning:revoke" });
    return;
  }
  if (mode === "verify-learning-revoked") {
    const deniedLearning = await projectionWithLoads(root, "executive-learning", learning.id);
    assert.equal(deniedLearning.result.disposition, "inaccessible");
    assert.equal(deniedLearning.loads, 0);
    assert.equal((await value.access.authorize(currentRequest("executive-review", review.id))).disposition, "authorized");
    assert.equal((await value.access.authorize(currentRequest("observed-outcome", "outcome-001"))).disposition, "authorized");
    return;
  }
  if (mode === "restore-learning") {
    const learningPolicy = policyHead((await value.repository.read(ORG)).store.policies, "learning:read");
    const restored = await value.access.restorePolicy({ organizationId: ORG, policyId: learningPolicy.policyId, expectedPolicyRevisionId: learningPolicy.policyRevisionId, occurredAt: "2026-08-11T16:00:00.000Z", actorRef: ACTOR, idempotencyKey: "inherit:learning:restore" });
    await value.access.rebindPolicy({ organizationId: ORG, recordKind: "executive-learning", recordId: learning.id, policyRevisionId: restored.policyRevisionId, occurredAt: restored.effectiveAt, actorRef: ACTOR, idempotencyKey: "inherit:learning:rebind" });
  }
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  const rootArgument = process.argv[3];
  if (mode && rootArgument) return worker(mode, rootArgument);
  const root = await mkdtemp(path.join(tmpdir(), "discovery-executive-history-inherited-revocation-"));
  let checks = 0;
  try {
    await execute(process.execPath, ["--import", "tsx", self, "seed", root], { env: process.env }); checks += 1;
    const runtimeBefore = (await dependencies(root).runtime.read(ORG))!.revision; checks += 1;
    for (const step of ["verify-all", "revoke-review", "verify-review-revoked", "restore-review", "verify-all", "revoke-learning", "verify-learning-revoked", "restore-learning", "verify-all"]) {
      await execute(process.execPath, ["--import", "tsx", self, step, root], { env: process.env });
      checks += 2;
    }
    const value = dependencies(root);
    assert.equal((await value.runtime.read(ORG))!.revision, runtimeBefore); checks += 1;
    const store = (await value.repository.read(ORG)).store;
    assert.equal(store.events.filter((event) => event.eventType === "policy-revoked").length, 2); checks += 1;
    assert.equal(store.events.filter((event) => event.eventType === "policy-restored").length, 2); checks += 1;
    assert.equal(store.events.filter((event) => event.eventType === "binding-superseded").length, 2); checks += 1;
    console.log(`RESULT PASS executive-history-inherited-policy-revocation checks=${checks} processes=10 deniedProtectedLoads=0`);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
