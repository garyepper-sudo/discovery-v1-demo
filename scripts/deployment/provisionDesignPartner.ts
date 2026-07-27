import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import {
  createOrganizationRuntimeRepository,
  type OrganizationRuntime,
} from "../../engine/v3/runtime";
import { normalizeOrganizationRuntime } from "../../engine/v3/runtime/organizationStateStore";

const args = new Map<string, string>();
for (let index = 2; index < process.argv.length; index += 2) {
  const name = process.argv[index];
  const value = process.argv[index + 1];
  if (!name?.startsWith("--") || !value) throw new Error("Arguments require --name value");
  args.set(name.slice(2), value);
}

function exact(name: string): string {
  const value = args.get(name);
  if (!value || value === "*" || value.trim() !== value) {
    throw new Error(`Required exact --${name} is missing`);
  }
  return value;
}

async function main(): Promise<void> {
  const organizationId = exact("organization");
  const consumerId = exact("consumer");
  const actor = exact("actor");
  const sourcePath = path.resolve(exact("runtime-source"));
  const idempotencyKey = exact("idempotency-key");
  const allowOverwrite = args.get("allow-overwrite") === "true";
  assert.match(organizationId, /^[a-zA-Z0-9_-]+$/);

  const raw = await readFile(sourcePath);
  const runtime = normalizeOrganizationRuntime(
    JSON.parse(raw.toString("utf8")) as OrganizationRuntime,
  );
  assert.equal(runtime.metadata.organizationId, organizationId, "Runtime organization mismatch");
  assert.ok(runtime.metadata.investigationCount > 0, "Runtime has no completed investigation");
  assert.ok(
    (runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? []).length > 0,
    "Runtime has no canonical Organizational Understanding composition",
  );

  const repository = createOrganizationRuntimeRepository();
  const requestId = createHash("sha256").update(idempotencyKey).digest("hex");
  const metadata = { requestId, operatorId: actor };
  const existing = await repository.read(organizationId);
  let backupId: string | undefined;
  let stored;
  if (existing) {
    if (!allowOverwrite) {
      throw new Error("Runtime already exists; pass --allow-overwrite true to replace it");
    }
    backupId = `pre-provision-${requestId.slice(0, 24)}`;
    await repository.backup(organizationId, backupId, metadata);
    stored = await repository.replace(
      organizationId,
      raw,
      existing.revision,
      metadata,
    );
  } else {
    stored = await repository.create(organizationId, raw, metadata);
  }

  const verified = await repository.read(organizationId);
  assert.ok(verified, "Uploaded Runtime is unavailable");
  assert.equal(verified.runtime.metadata.organizationId, organizationId);
  assert.equal(
    createHash("sha256").update(verified.bytes).digest("hex"),
    createHash("sha256").update(raw).digest("hex"),
    "Uploaded Runtime bytes changed",
  );

  const sql = postgres(requireDiscoveryDatabaseUrl("administration"), { max: 1 });
  try {
    const access = await new PostgresAlphaAccessRecordRepository(sql).grantAccess({
      accessRecordId: `alpha-access:${requestId}`,
      consumerId,
      organizationId,
      experience: "organization",
      actor,
      reasonCode: "first-design-partner-provisioning",
      idempotencyKey,
      grantedAt: new Date().toISOString(),
    });
    console.log(JSON.stringify({
      result: "PROVISIONED",
      organizationId,
      consumerId,
      runtimeBackend: repository.backend,
      runtimeSha256: createHash("sha256").update(raw).digest("hex"),
      runtimeRevision: stored.revision,
      accessRecordId: access.accessRecordId,
      backupId,
    }, null, 2));
  } catch (error) {
    if (backupId) {
      await repository.restore(
        organizationId,
        backupId,
        verified.revision,
        metadata,
      );
    }
    throw error;
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
