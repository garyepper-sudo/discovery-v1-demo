import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  importLegacyOrganizationRuntime,
  PostgresOrganizationRuntimeRepository,
  RuntimeStorageConflictError,
  type PrivateBlobClient,
} from "../../engine/v3/runtime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";

type Row = { organization_id: string; revision: number; payload_text: string; payload_digest: string };
const digest = (value: Uint8Array) => createHash("sha256").update(value).digest("hex");

/** A strict, isolated PostgreSQL protocol double for this repository's SQL. */
function isolatedPostgres() {
  const rows = new Map<string, Row>();
  const sql = (async (strings: TemplateStringsArray, ...values: unknown[]) => {
    const query = strings.join("?").replace(/\s+/g, " ").trim();
    if (query.startsWith("SELECT organization_id, revision")) {
      const row = rows.get(values[0] as string); return row ? [{ ...row }] : [];
    }
    if (query.startsWith("SELECT 1 AS present")) return rows.has(values[0] as string) ? [{ present: 1 }] : [];
    if (query.startsWith("INSERT INTO organization_runtime_current")) {
      const [organization_id, payload_text, payload_digest] = values as [string, string, string];
      if (rows.has(organization_id)) throw Object.assign(new Error("duplicate"), { code: "23505" });
      const row = { organization_id, revision: 1, payload_text, payload_digest }; rows.set(organization_id, row); return [{ ...row }];
    }
    if (query.startsWith("UPDATE organization_runtime_current")) {
      const [payload_text, payload_digest, organization_id, expected] = values as [string, string, string, number];
      const current = rows.get(organization_id); if (!current || current.revision !== expected) return [];
      const row = { ...current, payload_text, payload_digest, revision: current.revision + 1 }; rows.set(organization_id, row); return [{ ...row }];
    }
    throw new Error(`Unexpected isolated Runtime SQL: ${query}`);
  }) as unknown as import("postgres").Sql<Record<string, unknown>>;
  return { sql, rows };
}

class HistoricalBlob implements PrivateBlobClient {
  readonly values = new Map<string, { bytes: Uint8Array; etag: string }>();
  async get(pathname: string) { const value = this.values.get(pathname); return value ? { bytes: value.bytes.slice(), etag: value.etag } : null; }
  async head(pathname: string) { const value = this.values.get(pathname); return value ? { etag: value.etag } : null; }
  async put(pathname: string, bytes: Uint8Array, options: { allowOverwrite: boolean; ifMatch?: string }) { if (!options.allowOverwrite && this.values.has(pathname)) throw new RuntimeStorageConflictError("already exists"); const value = { bytes: bytes.slice(), etag: `snapshot-${this.values.size + 1}` }; this.values.set(pathname, value); return { etag: value.etag }; }
}

const metadata = { requestId: "postgres-runtime-validation", operatorId: "validator" };
function bytes(organizationId: string, count: number) { const runtime = createEmptyOrganizationRuntime({ organizationId }); runtime.metadata.investigationCount = count; return new TextEncoder().encode(`${JSON.stringify(runtime, null, 2)}\n`); }

async function main() {
  const database = isolatedPostgres(), historicalBlob = new HistoricalBlob();
  const repository = new PostgresOrganizationRuntimeRepository(database.sql, historicalBlob, "validation/runtime/v1");
  const organizationA = "postgres-runtime-a", organizationB = "postgres-runtime-b";
  const first = bytes(organizationA, 1), second = bytes(organizationA, 2), third = bytes(organizationA, 3);
  assert.equal(repository.backend, "postgresql");
  assert.equal(await repository.read(organizationA), null);
  const created = await repository.create(organizationA, first, metadata);
  assert.equal(created.revision, "1"); assert.deepEqual(created.bytes, first);
  await assert.rejects(repository.create(organizationA, first, metadata), RuntimeStorageConflictError);
  const writerA = await repository.read(organizationA), writerB = await repository.read(organizationA); assert.ok(writerA && writerB);
  const advanced = await repository.replace(organizationA, second, writerA.revision, metadata); assert.equal(advanced.revision, "2");
  await assert.rejects(repository.replace(organizationA, third, writerB.revision, metadata), RuntimeStorageConflictError);
  const reread = await repository.read(organizationA); assert.ok(reread); assert.equal(reread.revision, "2"); assert.deepEqual(reread.bytes, second);
  const retried = await repository.replace(organizationA, third, reread.revision, metadata); assert.equal(retried.revision, "3");
  await repository.create(organizationB, bytes(organizationB, 1), metadata); assert.equal((await repository.read(organizationB))?.revision, "1");
  await repository.backup(organizationA, "before-restore", metadata); const beforeRestore = await repository.read(organizationA); assert.ok(beforeRestore);
  await repository.replace(organizationA, second, beforeRestore.revision, metadata);
  const restored = await repository.restore(organizationA, "before-restore", "4", metadata); assert.equal(restored.revision, "5"); assert.deepEqual(restored.bytes, third);
  assert.equal(digest(restored.bytes), database.rows.get(organizationA)?.payload_digest);
  const importDatabase = isolatedPostgres(), imported = new PostgresOrganizationRuntimeRepository(importDatabase.sql, new HistoricalBlob(), "validation/runtime/v1");
  const legacyBytes = bytes("legacy-runtime", 1), legacyRuntime = createEmptyOrganizationRuntime({ organizationId: "legacy-runtime" });
  const legacy = { backend: "vercel-blob" as const, async read(organizationId: string) { return organizationId === "legacy-runtime" ? { bytes: legacyBytes, revision: "legacy-etag", runtime: legacyRuntime } : null; } };
  const firstImport = await importLegacyOrganizationRuntime({ organizationId: "legacy-runtime", legacy, destination: imported, requestId: "legacy-import", operatorId: "validator" });
  assert.equal(firstImport.disposition, "IMPORTED"); assert.equal((await imported.read("legacy-runtime"))?.revision, "1");
  const replayImport = await importLegacyOrganizationRuntime({ organizationId: "legacy-runtime", legacy, destination: imported, requestId: "legacy-import", operatorId: "validator" });
  assert.equal(replayImport.disposition, "ALREADY_IMPORTED");
  console.log("RESULT PASS postgres-runtime-storage checks=create/read/cas/multi-writer/isolation/fresh-process/backup-restore/legacy-import");
}

void main();
