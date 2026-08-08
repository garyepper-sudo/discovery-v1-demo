import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import postgres from "postgres";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";

async function main(): Promise<void> {
 const url = process.env.DISCOVERY_ACTOR_TEST_DATABASE_URL;
 const key = process.env.DISCOVERY_ACTOR_SUBJECT_LOOKUP_KEY;
 const mode = process.argv[2];
 if (!url || !key || key.length < 32) throw new Error("Isolated actor-test database and lookup key are required.");
 const consumerId = "user_fresh_process_subject";
 const organizationId = "sandbox-actor-fresh-process";
 const assignedAt = "2026-08-08T13:00:00.000Z";
 if (mode) {
  const sql = postgres(url, { max: 1 });
  try {
    const repository = new PostgresAlphaAccessRecordRepository(sql, key);
    if (mode === "tamper") {
      const wrongOrganizationDenied = !await repository.resolvePersistenceSafeActor({ consumerId, organizationId: "wrong-organization", resolvedAt: assignedAt });
      const wrongSubjectDenied = !await repository.resolvePersistenceSafeActor({ consumerId: `${consumerId}-wrong`, organizationId, resolvedAt: assignedAt });
      let replayConflictDenied = false;
      await repository.grantAccess({ accessRecordId: "fresh-wrong-subject-access", consumerId: `${consumerId}-wrong`, organizationId, experience: "organization", actor: "operator:test", reasonCode: "fresh-process-proof", idempotencyKey: "fresh-wrong-subject-access-grant", grantedAt: assignedAt });
      try { await repository.assignPersistenceSafeActor({ consumerId: `${consumerId}-wrong`, organizationId, assignedAt, idempotencyKey: "fresh-process-assignment" }); }
      catch { replayConflictDenied = true; }
      await repository.grantAccess({ accessRecordId: "fresh-concurrent-access", consumerId: `${consumerId}-concurrent`, organizationId, experience: "organization", actor: "operator:test", reasonCode: "fresh-process-proof", idempotencyKey: "fresh-concurrent-access-grant", grantedAt: assignedAt });
      const concurrent = await Promise.all(Array.from({ length: 6 }, () => repository.assignPersistenceSafeActor({ consumerId: `${consumerId}-concurrent`, organizationId, assignedAt, idempotencyKey: "fresh-concurrent-one-request" })));
      process.stdout.write(JSON.stringify({ wrongOrganizationDenied, wrongSubjectDenied, replayConflictDenied, singular: new Set(concurrent.map((value) => value.actorRef)).size === 1 }));
    } else {
      if (mode === "assign") await repository.grantAccess({ accessRecordId: "fresh-process-access", consumerId, organizationId, experience: "organization", actor: "operator:test", reasonCode: "fresh-process-proof", idempotencyKey: "fresh-process-access-grant", grantedAt: assignedAt });
      const result = mode === "assign"
        ? await repository.assignPersistenceSafeActor({ consumerId, organizationId, assignedAt, idempotencyKey: "fresh-process-assignment" })
        : await repository.resolvePersistenceSafeActor({ consumerId, organizationId, resolvedAt: assignedAt });
      if (!result) throw new Error("Actor reference unavailable");
      if (mode === "revoke") {
        const access = await repository.grantAccess({ accessRecordId: "fresh-process-access", consumerId, organizationId, experience: "organization", actor: result.actorRef, reasonCode: "fresh-process-proof", idempotencyKey: "fresh-process-access-grant", grantedAt: assignedAt });
        await repository.revokeAccess({ accessRecordId: access.accessRecordId, actor: result.actorRef, reasonCode: "fresh-process-proof", idempotencyKey: "fresh-process-access-revoke", revokedAt: "2026-08-08T13:01:00.000Z" });
        const revoked = await repository.findAccessRecords({ consumerId, organizationId, experience: "organization", resolvedAt: "2026-08-08T13:01:00.000Z" });
        await repository.restoreAccess({ previousAccessRecordId: access.accessRecordId, nextAccessRecordId: "fresh-process-access-restored", actor: result.actorRef, reasonCode: "fresh-process-proof", idempotencyKey: "fresh-process-access-restore", restoredAt: "2026-08-08T13:02:00.000Z" });
        const restored = await repository.findAccessRecords({ consumerId, organizationId, experience: "organization", resolvedAt: "2026-08-08T13:02:00.000Z" });
        await repository.revokeAccess({ accessRecordId: "fresh-process-access-restored", actor: result.actorRef, reasonCode: "fresh-process-proof", idempotencyKey: "fresh-process-restored-revoke", revokedAt: "2026-08-08T13:03:00.000Z" });
        const final = await repository.findAccessRecords({ consumerId, organizationId, experience: "organization", resolvedAt: "2026-08-08T13:03:00.000Z" });
        process.stdout.write(JSON.stringify({ actorRef: result.actorRef, resultDigest: result.resultDigest, currentAuthorizationDenied: final.every((record) => record.status !== "active"), historicalActorStable: revoked[0]?.actorReference?.actorRef === result.actorRef, accessRevisionStable: restored.find((record) => record.status === "active")?.actorReference?.actorRef === result.actorRef }));
      } else process.stdout.write(JSON.stringify({ actorRef: result.actorRef, mappingRevision: result.mappingRevision, resultDigest: result.resultDigest }));
    }
  } finally { await sql.end(); }
 } else {
  const run = (childMode: string) => {
    const child = spawnSync(process.execPath, ["--import", "tsx", new URL(import.meta.url).pathname, childMode], { env: process.env, encoding: "utf8" });
    assert.equal(child.status, 0, child.stderr);
    return JSON.parse(child.stdout) as { actorRef: string; mappingRevision: number; resultDigest: string };
  };
  const assigned = run("assign");
  const reloaded = run("resolve");
  assert.deepEqual(reloaded, assigned);
  assert.equal(assigned.mappingRevision, 1);
  const revoked = run("revoke") as unknown as { actorRef: string; resultDigest: string; currentAuthorizationDenied: boolean; historicalActorStable: boolean; accessRevisionStable: boolean };
  assert.equal(revoked.actorRef, assigned.actorRef);
  assert.equal(revoked.resultDigest, assigned.resultDigest);
  assert.equal(revoked.currentAuthorizationDenied, true);
  assert.equal(revoked.historicalActorStable, true);
  assert.equal(revoked.accessRevisionStable, true);
  const tamper = run("tamper") as unknown as Record<string, boolean>;
  assert.deepEqual(tamper, { wrongOrganizationDenied: true, wrongSubjectDenied: true, replayConflictDenied: true, singular: true });
  console.log("Persistence-safe actor fresh-process validation: PASS");
 }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Fresh-process validation failed"); process.exitCode = 1; });
