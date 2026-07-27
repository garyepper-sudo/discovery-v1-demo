import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import {
  normalizeOrganizationRuntime,
} from "../../engine/v3/runtime/organizationStateStore";
import type { OrganizationRuntime } from "../../engine/v3/runtime";
import { getRuntimeOrganizationsDirectory } from "../../engine/v3/runtime/runtimeStorageLocation";

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
assert.match(organizationId, /^[a-zA-Z0-9_-]+$/);

const raw = await readFile(sourcePath, "utf8");
const runtime = normalizeOrganizationRuntime(JSON.parse(raw) as OrganizationRuntime);
assert.equal(runtime.metadata.organizationId, organizationId, "Runtime organization mismatch");
assert.ok(runtime.metadata.investigationCount > 0, "Runtime has no completed investigation");
assert.ok(
  (runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? []).length > 0,
  "Runtime has no canonical Organizational Understanding composition",
);

const directory = getRuntimeOrganizationsDirectory();
await mkdir(directory, { recursive: true });
const destination = path.join(directory, `${organizationId}.json`);
const temporary = `${destination}.provisioning`;
let backup: string | undefined;
try {
  await stat(destination);
  backup = `${destination}.backup-${Date.now()}`;
  await copyFile(destination, backup);
} catch {}

await writeFile(temporary, `${JSON.stringify(runtime, null, 2)}\n`, {
  encoding: "utf8",
  flag: "wx",
});
await rename(temporary, destination);

const sql = postgres(requireDiscoveryDatabaseUrl("administration"), { max: 1 });
try {
  const access = await new PostgresAlphaAccessRecordRepository(sql).grantAccess({
    accessRecordId: `alpha-access:${createHash("sha256").update(idempotencyKey).digest("hex")}`,
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
    runtimePath: destination,
    runtimeSha256: createHash("sha256").update(raw).digest("hex"),
    accessRecordId: access.accessRecordId,
    backupCreated: Boolean(backup),
  }, null, 2));
} catch (error) {
  if (backup) await copyFile(backup, destination);
  throw error;
} finally {
  await sql.end();
}
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
