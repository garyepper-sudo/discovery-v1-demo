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
import { ACTOR, AT, ORG, PURPOSE, governance, request, review, setup } from "./validateExecutiveHistoryCurrentAccess";

const run = promisify(execFile);
const self = fileURLToPath(import.meta.url);
const accessRoot = (root: string) => path.join(root, "access");
const runtimeRoot = (root: string) => path.join(root, "runtime");

function head(policies: ExecutiveHistoryAccessPolicyRevisionV1[]): ExecutiveHistoryAccessPolicyRevisionV1 {
  const reviewPolicies = policies.filter(
    (value) => value.policyId !== "policy-pending-control" && value.actions.includes("review:read"),
  );
  const predecessors = new Set(reviewPolicies.map((value) => value.predecessorRevisionId).filter(Boolean));
  const heads = reviewPolicies.filter((value) => !predecessors.has(value.policyRevisionId));
  assert.equal(heads.length, 1);
  return heads[0]!;
}

function dependencies(root: string) {
  const repository = new FilesystemExecutiveHistoryAccessRepository(accessRoot(root));
  const access = new ExecutiveHistoryCurrentAccessService(repository);
  const runtime = new FilesystemOrganizationRuntimeRepository(runtimeRoot(root));
  return { repository, access, runtime };
}

async function worker(mode: string, root: string): Promise<void> {
  if (mode === "seed") {
    await setup(root);
    return;
  }
  const value = dependencies(root);
  if (mode === "read") {
    const current = head((await value.repository.read(ORG)).store.policies);
    const evaluatedAt = current.effectiveAt > AT ? current.effectiveAt : AT;
    const composition = new CanonicalExecutiveHistoryAccessComposition({
      access: value.access,
      runtime: value.runtime,
      authorizeAdministration: async () => true,
    });
    assert.equal((await composition.readReview(request("executive-review", review.id, ACTOR, { evaluatedAt, governance: governance(ACTOR, true, PURPOSE, evaluatedAt) }) as never))?.review.id, review.id);
    return;
  }
  const current = head((await value.repository.read(ORG)).store.policies);
  if (mode === "revise") {
    await value.access.revisePolicy({
      organizationId: ORG,
      policyId: current.policyId,
      expectedPolicyRevisionId: current.policyRevisionId,
      actions: current.actions,
      purposes: current.purposes,
      sensitivity: current.sensitivity,
      audience: current.audience,
      effectiveAt: "2026-08-11T13:00:00.000Z",
      expiresAt: current.expiresAt,
      authorityRevisionRefs: ["authority:history:v2"],
      actorRef: ACTOR,
      idempotencyKey: "stale-policy:revise",
    });
    return;
  }
  if (mode === "deny") {
    let loads = 0;
    const runtime = new Proxy(value.runtime, {
      get(target, key, receiver) {
        if (key === "read") {
          return async (...args: Parameters<OrganizationRuntimeRepository["read"]>) => {
            loads += 1;
            return target.read(...args);
          };
        }
        return Reflect.get(target, key, receiver);
      },
    }) as OrganizationRuntimeRepository;
    const composition = new CanonicalExecutiveHistoryAccessComposition({
      access: value.access,
      runtime,
      authorizeAdministration: async () => true,
    });
    assert.equal(await composition.readReview(request("executive-review", review.id) as never), null);
    assert.equal(loads, 0);
    return;
  }
  if (mode === "rebind") {
    await value.access.rebindPolicy({
      organizationId: ORG,
      recordKind: "executive-review",
      recordId: review.id,
      policyRevisionId: current.policyRevisionId,
      occurredAt: current.effectiveAt,
      actorRef: ACTOR,
      idempotencyKey: `stale-policy:rebind:${current.revision}`,
    });
    return;
  }
  if (mode === "revoke") {
    await value.access.revokePolicy({
      organizationId: ORG,
      policyId: current.policyId,
      expectedPolicyRevisionId: current.policyRevisionId,
      occurredAt: "2026-08-11T14:00:00.000Z",
      actorRef: ACTOR,
      idempotencyKey: "stale-policy:revoke",
    });
    return;
  }
  if (mode === "restore") {
    await value.access.restorePolicy({
      organizationId: ORG,
      policyId: current.policyId,
      expectedPolicyRevisionId: current.policyRevisionId,
      occurredAt: "2026-08-11T15:00:00.000Z",
      actorRef: ACTOR,
      idempotencyKey: "stale-policy:restore",
    });
    return;
  }
  if (mode === "pending") {
    const pending = await value.access.createPendingPolicy({
      organizationId: ORG,
      policyId: "policy-pending-control",
      actions: ["review:read"],
      purposes: [PURPOSE],
      sensitivity: "standard",
      audience: [{ kind: "direct", subjectId: ACTOR, assignmentRevision: `assignment:${ACTOR}:v1` }],
      effectiveAt: AT,
      authorityRevisionRefs: ["authority:history:pending"],
      actorRef: ACTOR,
      idempotencyKey: "stale-policy:pending",
    });
    await assert.rejects(() =>
      value.access.createPendingBinding({
        organizationId: ORG,
        recordKind: "executive-review",
        recordId: "pending-policy-review",
        policyRevisionId: pending.policyRevisionId,
        sensitivity: "standard",
        creationOperationId: "pending-policy:create",
        effectiveAt: AT,
        actorRef: ACTOR,
        idempotencyKey: "pending-policy:binding",
      }),
    );
  }
}

async function main(): Promise<void> {
  const mode = process.argv[2];
  const rootArgument = process.argv[3];
  if (mode && rootArgument) return worker(mode, rootArgument);
  const root = await mkdtemp(path.join(tmpdir(), "discovery-executive-history-stale-policy-"));
  let checks = 0;
  try {
    for (const step of [
      "seed",
      "read",
      "revise",
      "deny",
      "rebind",
      "read",
      "revoke",
      "deny",
      "restore",
      "deny",
      "rebind",
      "read",
      "pending",
    ]) {
      await run(process.execPath, ["--import", "tsx", self, step, root], { env: process.env });
      checks += 1;
    }
    const value = dependencies(root);
    const store = (await value.repository.read(ORG)).store;
    assert.equal(
      store.policies.filter(
        (policy) =>
          policy.policyId !== "policy-pending-control" && policy.actions.includes("review:read"),
      ).length,
      4,
    );
    checks += 1;
    assert.equal(store.events.filter((event) => event.eventType === "policy-revised").length, 1);
    checks += 1;
    assert.equal(store.events.filter((event) => event.eventType === "policy-revoked").length, 1);
    checks += 1;
    assert.equal(store.events.filter((event) => event.eventType === "policy-restored").length, 1);
    checks += 1;
    assert.equal(store.events.filter((event) => event.eventType === "binding-superseded").length, 2);
    checks += 1;
    const current = head(store.policies);
    assert.equal(current.state, "active");
    checks += 1;
    assert.equal(
      (await value.access.authorize(request("executive-review", review.id, ACTOR, {
        evaluatedAt: current.effectiveAt,
        governance: governance(ACTOR, true, PURPOSE, current.effectiveAt),
      }))).policyRevisionId,
      current.policyRevisionId,
    );
    checks += 1;
    assert.equal(store.policies.some((policy) => policy.state === "pending"), true);
    checks += 1;
    console.log(`RESULT PASS executive-history-stale-policy checks=${checks} processes=13 protectedDeniedLoads=0`);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
