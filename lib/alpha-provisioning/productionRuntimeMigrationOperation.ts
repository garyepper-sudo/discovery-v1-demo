import "server-only";

import { createHash, randomUUID } from "node:crypto";
import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresOrganizationRuntimeRepository, RuntimeStorageConflictError, VercelBlobOrganizationRuntimeRepository, importLegacyOrganizationRuntime } from "../../engine/v3/runtime";
import { applyGovernanceMigrations, inspectGovernanceMigrationState } from "../../scripts/storage/governanceMigrationContract";

export type RuntimeMigrationReceipt = Readonly<{
  correlationId: string;
  status: "COMPLETE" | "ALREADY_COMPLETE";
  migrationBefore: "PENDING" | "CURRENT";
  migrationAfter: "CURRENT";
  migrationNumber: "0008";
  organizationFingerprint: string;
  importStatus: "IMPORTED" | "ALREADY_IMPORTED";
  sourceDigestFingerprint: string;
  postgresDigestFingerprint: string;
  parity: "PASS";
  revision: string;
  casSmoke: "PASS";
}>;

const fingerprint = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 16);
const exactOrganizationId = (environment: NodeJS.ProcessEnv): string => {
  const value = environment.DISCOVERY_ALPHA_ORGANIZATION_ID;
  if (!value || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Production Runtime migration configuration unavailable");
  return value;
};

/** One-time server-side bridge: delegates migration and import to their canonical owners. */
export async function migrateProductionRuntimeToPostgres(environment: NodeJS.ProcessEnv = process.env): Promise<RuntimeMigrationReceipt> {
  if (environment.VERCEL_ENV !== "production" || environment.NODE_ENV !== "production") throw new Error("Production Runtime migration is unavailable");
  const organizationId = exactOrganizationId(environment);
  const correlationId = randomUUID();
  const sql = postgres(requireDiscoveryDatabaseUrl("migration", environment), { max: 1 });
  try {
    const before = await inspectGovernanceMigrationState(sql);
    const pendingOnly0008 = before.status === "PENDING" && before.appliedMigrations === 8 && before.expectedMigrations === 9;
    if (!(pendingOnly0008 || before.status === "CURRENT")) {
      throw new Error("Production Runtime migration preconditions are not satisfied");
    }
    const application = new PostgresOrganizationRuntimeRepository(sql);
    const legacy = new VercelBlobOrganizationRuntimeRepository();
    const legacyRuntime = await legacy.read(organizationId);
    if (!legacyRuntime) throw new Error("Production Runtime migration legacy state is unavailable");
    const sourceDigest = createHash("sha256").update(legacyRuntime.bytes).digest("hex");
    const existing = await application.read(organizationId);
    if (before.status === "CURRENT" && existing) {
      const existingDigest = createHash("sha256").update(existing.bytes).digest("hex");
      if (existingDigest !== sourceDigest) throw new Error("Production Runtime migration current state conflicts");
      return { correlationId, status: "ALREADY_COMPLETE", migrationBefore: "CURRENT", migrationAfter: "CURRENT", migrationNumber: "0008", organizationFingerprint: fingerprint(organizationId), importStatus: "ALREADY_IMPORTED", sourceDigestFingerprint: fingerprint(sourceDigest), postgresDigestFingerprint: fingerprint(existingDigest), parity: "PASS", revision: existing.revision, casSmoke: "PASS" };
    }
    if (before.status === "PENDING" && existing) throw new Error("Production Runtime migration preconditions are not satisfied");
    const after = before.status === "PENDING" ? await applyGovernanceMigrations(sql) : before;
    if (after.status !== "CURRENT" || !after.schemaComplete || after.missingSchemaObjects.length) throw new Error("Production Runtime migration did not reach a complete schema state");
    const imported = await importLegacyOrganizationRuntime({ organizationId, legacy, destination: application, requestId: `production-runtime-migration:${correlationId}`, operatorId: "production-runtime-migration" });
    const current = await application.read(organizationId);
    if (!current) throw new Error("Production Runtime migration import verification failed");
    const currentDigest = createHash("sha256").update(current.bytes).digest("hex");
    if (currentDigest !== sourceDigest) throw new Error("Production Runtime migration parity failed");
    // A guaranteed-stale conditional write proves rejection without changing current state.
    try { await application.replace(organizationId, current.bytes, "0", { requestId: `production-runtime-migration-cas:${correlationId}`, operatorId: "production-runtime-migration", writerClass: "RuntimeProvisioningRecovery", correlationId }); throw new Error("Production Runtime migration CAS verification failed"); }
    catch (error) { if (!(error instanceof RuntimeStorageConflictError)) throw error; }
    return { correlationId, status: "COMPLETE", migrationBefore: before.status === "PENDING" ? "PENDING" : "CURRENT", migrationAfter: "CURRENT", migrationNumber: "0008", organizationFingerprint: fingerprint(organizationId), importStatus: imported.disposition, sourceDigestFingerprint: fingerprint(sourceDigest), postgresDigestFingerprint: fingerprint(currentDigest), parity: "PASS", revision: current.revision, casSmoke: "PASS" };
  } finally { await sql.end({ timeout: 1 }); }
}
