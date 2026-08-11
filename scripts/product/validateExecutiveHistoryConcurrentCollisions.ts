import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { access, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

import { FilesystemExecutiveHistoryAccessRepository } from "../../engine/v3/governance/executiveHistoryAccessRepository";
import { ExecutiveHistoryCurrentAccessService } from "../../engine/v3/governance/executiveHistoryCurrentAccessService";
import { ACTOR, AT, ORG, review, setup } from "./validateExecutiveHistoryCurrentAccess";

const execute = promisify(execFile);
const self = fileURLToPath(import.meta.url);

async function waitFor(file: string): Promise<void> {
  for (let attempt = 0; attempt < 500; attempt += 1) {
    try { await access(file); return; } catch { await new Promise((resolve) => setTimeout(resolve, 10)); }
  }
  throw new Error(`Timed out waiting for ${path.basename(file)}.`);
}

async function worker(root: string, mode: string, index: string): Promise<void> {
  const repository = new FilesystemExecutiveHistoryAccessRepository(path.join(root, "access"));
  const service = new ExecutiveHistoryCurrentAccessService(repository);
  const ready = path.join(root, `${mode}-${index}.ready`);
  const go = path.join(root, `${mode}.go`);
  if (mode === "same" || mode === "different") {
    await writeFile(ready, "ready\n", { mode: 0o600 });
    await waitFor(go);
    await service.revokeBinding({
      organizationId: ORG,
      recordKind: "executive-review",
      recordId: review.id,
      occurredAt: mode === "same" ? "2026-08-11T13:00:00.000Z" : `2026-08-11T15:00:0${index}.000Z`,
      actorRef: ACTOR,
      idempotencyKey: mode === "same" ? "concurrent:same" : "concurrent:different",
    });
    return;
  }
  if (mode === "cas") {
    const snapshot = await repository.read(ORG);
    await writeFile(ready, "ready\n", { mode: 0o600 });
    await waitFor(go);
    const store = structuredClone(snapshot.store);
    store.idempotency.push({ keyDigest: `cas-${index}`, requestFingerprint: `fingerprint-${index}`, resultRef: `result-${index}` });
    await repository.replace(ORG, store, snapshot.revision);
    return;
  }
  const snapshot = await repository.read(ORG);
  const policy = snapshot.store.policies.filter((value) => value.actions.includes("review:read")).at(-1)!;
  await writeFile(ready, "ready\n", { mode: 0o600 });
  await waitFor(go);
  await service.revisePolicy({
    organizationId: ORG,
    policyId: policy.policyId,
    expectedPolicyRevisionId: policy.policyRevisionId,
    effectiveAt: `2026-08-11T17:00:0${index}.000Z`,
    actorRef: ACTOR,
    idempotencyKey: `fork-${index}`,
    actions: policy.actions,
    purposes: [`purpose-${index}`],
    sensitivity: policy.sensitivity,
    audience: policy.audience,
    expiresAt: policy.expiresAt,
    authorityRevisionRefs: policy.authorityRevisionRefs,
  });
}

async function pair(root: string, mode: string): Promise<PromiseSettledResult<{ stdout: string; stderr: string }>[]> {
  const children = ["1", "2"].map((index) => execute(process.execPath, ["--import", "tsx", self, root, mode, index], { env: process.env }));
  await Promise.all(["1", "2"].map((index) => waitFor(path.join(root, `${mode}-${index}.ready`))));
  await writeFile(path.join(root, `${mode}.go`), "go\n", { mode: 0o600 });
  return Promise.allSettled(children);
}

async function main(): Promise<void> {
  const [root, mode, index] = process.argv.slice(2);
  if (root && mode && index) return worker(root, mode, index);
  const temporary = await mkdtemp(path.join(tmpdir(), "discovery-executive-history-concurrency-"));
  let checks = 0;
  try {
    const value = await setup(temporary);
    let result = await pair(temporary, "same");
    assert.equal(result.filter((entry) => entry.status === "fulfilled").length, 2); checks += 1;
    let store = (await value.accessRepository.read(ORG)).store;
    assert.equal(store.events.filter((event) => event.eventType === "binding-revoked").length, 1); checks += 1;
    await value.access.restoreBinding({ organizationId: ORG, recordKind: "executive-review", recordId: review.id, occurredAt: "2026-08-11T14:00:00.000Z", actorRef: ACTOR, idempotencyKey: "concurrent:restore:one" });
    result = await pair(temporary, "different");
    assert.equal(result.filter((entry) => entry.status === "fulfilled").length, 1); checks += 1;
    assert.equal(result.filter((entry) => entry.status === "rejected").length, 1); checks += 1;
    store = (await value.accessRepository.read(ORG)).store;
    assert.equal(store.events.filter((event) => event.eventType === "binding-revoked").length, 2); checks += 1;
    result = await pair(temporary, "cas");
    assert.equal(result.filter((entry) => entry.status === "fulfilled").length, 1); checks += 1;
    assert.equal(result.filter((entry) => entry.status === "rejected").length, 1); checks += 1;
    store = (await value.accessRepository.read(ORG)).store;
    assert.equal(store.idempotency.filter((entry) => entry.keyDigest.startsWith("cas-")).length, 1); checks += 1;
    result = await pair(temporary, "fork");
    assert.equal(result.filter((entry) => entry.status === "fulfilled").length, 1); checks += 1;
    assert.equal(result.filter((entry) => entry.status === "rejected").length, 1); checks += 1;
    store = (await value.accessRepository.read(ORG)).store;
    const reviewPolicyId = store.policies.find((policy) => policy.actions.includes("review:read"))!.policyId;
    const heads = store.policies.filter((policy) => policy.policyId === reviewPolicyId);
    assert.equal(heads.filter((policy) => policy.revision === 2).length, 1); checks += 1;
    assert.equal(store.events.filter((event) => event.eventType === "policy-revised").length, 1); checks += 1;
    assert.equal(store.organizationId, ORG); checks += 1;
    assert.equal(store.bindings.length >= 4, true); checks += 1;
    assert.equal(store.policies.length >= 3, true); checks += 1;
    assert.equal(store.events.every((event) => event.organizationId === ORG), true); checks += 1;
    assert.equal(new Set(store.idempotency.map((entry) => entry.keyDigest)).size, store.idempotency.length); checks += 1;
    assert.equal(new Set(store.events.map((event) => event.eventId)).size, store.events.length); checks += 1;
    assert.equal(new Set(store.bindings.map((binding) => binding.bindingRevisionId)).size, store.bindings.length); checks += 1;
    assert.equal(new Set(store.policies.map((policy) => policy.policyRevisionId)).size, store.policies.length); checks += 1;
    assert.equal(heads.filter((policy) => !store.policies.some((candidate) => candidate.predecessorRevisionId === policy.policyRevisionId)).length, 1); checks += 1;
    assert.equal(store.bindings.filter((binding) => binding.recordId === review.id && binding.state === "revoked").length, 2); checks += 1;
    const persistedFiles = await readdir(path.join(temporary, "access"));
    assert.deepEqual(persistedFiles, [`${ORG}.json`]); checks += 1;
    assert.equal(persistedFiles.some((file) => file.endsWith(".lock") || file.endsWith(".tmp")), false); checks += 1;
    console.log(`RESULT PASS executive-history-concurrent-collisions checks=${checks} processes=8`);
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
