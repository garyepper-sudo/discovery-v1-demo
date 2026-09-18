import "server-only";

import { createHash, randomUUID } from "node:crypto";
import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresOrganizationRuntimeRepository, PostgresRuntimeCreateConflictError, PostgresRuntimeCreateError, RuntimeStorageConflictError, VercelBlobOrganizationRuntimeRepository, importLegacyOrganizationRuntime } from "../../engine/v3/runtime";
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

/** Closed, content-safe boundaries for the protected one-time operation. */
export const runtimeMigrationStages = [
  "PRECHECK",
  "MIGRATION_STATUS_BEFORE",
  "LEGACY_BLOB_RUNTIME_READ",
  "POSTGRES_RUNTIME_CONFLICT_CHECK",
  "MIGRATION_0008_APPLY",
  "MIGRATION_STATUS_AFTER",
  "POSTGRES_RUNTIME_IMPORT",
  "POSTGRES_RUNTIME_CREATE_VALIDATE",
  "POSTGRES_RUNTIME_CREATE_INSERT",
  "POSTGRES_RUNTIME_CREATE_RETURN_VALIDATE",
  "POSTGRES_RUNTIME_READBACK",
  "PAYLOAD_PARITY_VERIFY",
  "CAS_SMOKE",
] as const;
export type RuntimeMigrationStage = (typeof runtimeMigrationStages)[number];
export type RuntimeMigrationDurableWriteState =
  | "BEFORE_ANY_DURABLE_WRITE"
  | "AFTER_MIGRATION_BEFORE_IMPORT"
  | "AFTER_OR_DURING_IMPORT"
  | "AFTER_IMPORT"
  | "UNKNOWN";
export type RuntimeMigrationRetrySafety = true | false | "unknown";
export type RuntimeMigrationErrorCode =
  | "RUNTIME_MIGRATION_STAGE_FAILED"
  | "POSTGRES_RUNTIME_ORGANIZATION_PARENT_MISSING"
  | "POSTGRES_RUNTIME_ALREADY_EXISTS"
  | "POSTGRES_RUNTIME_CONSTRAINT_FAILED"
  | "POSTGRES_RUNTIME_PERSISTENCE_FAILED"
  | "POSTGRES_RUNTIME_UNKNOWN";
export type RuntimeMigrationFailureReceipt = Readonly<{
  status: "FAILED_CLOSED";
  correlationId: string;
  stage: RuntimeMigrationStage;
  errorCode: RuntimeMigrationErrorCode;
  durableWriteState: RuntimeMigrationDurableWriteState;
  retrySafe: RuntimeMigrationRetrySafety;
}>;

export class RuntimeMigrationOperationError extends Error {
  constructor(readonly receipt: RuntimeMigrationFailureReceipt) {
    super("Runtime migration operation failed");
  }
}
type RuntimeMigrationDependencies = Readonly<{
  openSql: () => { end(input: { timeout: number }): Promise<void> };
  inspect: (sql: any) => Promise<any>;
  apply: (sql: any, callback: () => void) => Promise<any>;
  legacy: () => any;
  application: (sql: any) => any;
  importLegacy: (input: any) => Promise<any>;
}>;

const fingerprint = (value: string) => createHash("sha256").update(value).digest("hex").slice(0, 16);
const stageForCreateBoundary = (boundary: "validate" | "insert" | "return-validate"): RuntimeMigrationStage =>
  boundary === "validate" ? "POSTGRES_RUNTIME_CREATE_VALIDATE" : boundary === "insert" ? "POSTGRES_RUNTIME_CREATE_INSERT" : "POSTGRES_RUNTIME_CREATE_RETURN_VALIDATE";
const exactOrganizationId = (environment: NodeJS.ProcessEnv): string => {
  const value = environment.DISCOVERY_ALPHA_ORGANIZATION_ID;
  if (!value || !/^[A-Za-z0-9_-]+$/.test(value)) throw new Error("Production Runtime migration configuration unavailable");
  return value;
};

/** One-time server-side bridge: delegates migration and import to their canonical owners. */
export async function migrateProductionRuntimeToPostgres(environment: NodeJS.ProcessEnv = process.env, injected?: Partial<RuntimeMigrationDependencies>): Promise<RuntimeMigrationReceipt> {
  const correlationId = randomUUID();
  let stage: RuntimeMigrationStage = "PRECHECK";
  let durableWriteState: RuntimeMigrationDurableWriteState = "BEFORE_ANY_DURABLE_WRITE";
  let sql: any;
  const dependencies: RuntimeMigrationDependencies = {
    openSql: () => postgres(requireDiscoveryDatabaseUrl("migration", environment), { max: 1 }),
    inspect: inspectGovernanceMigrationState,
    apply: (connection, callback) => applyGovernanceMigrations(connection, undefined, callback),
    legacy: () => new VercelBlobOrganizationRuntimeRepository(),
    application: (connection) => new PostgresOrganizationRuntimeRepository(connection),
    importLegacy: importLegacyOrganizationRuntime,
    ...injected,
  };
  try {
    if (environment.VERCEL_ENV !== "production" || environment.NODE_ENV !== "production") throw new Error("Production Runtime migration is unavailable");
    const organizationId = exactOrganizationId(environment);
    requireDiscoveryDatabaseUrl("migration", environment);
    sql = dependencies.openSql();
    stage = "MIGRATION_STATUS_BEFORE";
    const before = await dependencies.inspect(sql);
    const pendingOnly0008 = before.status === "PENDING" && before.appliedMigrations === 8 && before.expectedMigrations === 9;
    if (!(pendingOnly0008 || before.status === "CURRENT")) {
      throw new Error("Production Runtime migration preconditions are not satisfied");
    }
    stage = "LEGACY_BLOB_RUNTIME_READ";
    const legacy = dependencies.legacy();
    const legacyRuntime = await legacy.read(organizationId);
    if (!legacyRuntime) throw new Error("Production Runtime migration legacy state is unavailable");
    const sourceDigest = createHash("sha256").update(legacyRuntime.bytes).digest("hex");
    stage = "MIGRATION_0008_APPLY";
    // The migration helper owns both the durable write and its own verification;
    // a thrown result cannot truthfully distinguish their ordering here.
    if (before.status === "PENDING") durableWriteState = "UNKNOWN";
    const after = before.status === "PENDING"
      ? await dependencies.apply(sql, () => { stage = "MIGRATION_STATUS_AFTER"; durableWriteState = "AFTER_MIGRATION_BEFORE_IMPORT"; })
      : before;
    durableWriteState = "AFTER_MIGRATION_BEFORE_IMPORT";
    stage = "MIGRATION_STATUS_AFTER";
    if (after.status !== "CURRENT" || !after.schemaComplete || after.missingSchemaObjects.length) throw new Error("Production Runtime migration did not reach a complete schema state");
    stage = "POSTGRES_RUNTIME_CONFLICT_CHECK";
    const application = dependencies.application(sql);
    const existing = await application.read(organizationId);
    if (before.status === "CURRENT" && existing) {
      durableWriteState = "AFTER_IMPORT";
      stage = "PAYLOAD_PARITY_VERIFY";
      const existingDigest = createHash("sha256").update(existing.bytes).digest("hex");
      if (existingDigest !== sourceDigest) throw new Error("Production Runtime migration current state conflicts");
      return { correlationId, status: "ALREADY_COMPLETE", migrationBefore: "CURRENT", migrationAfter: "CURRENT", migrationNumber: "0008", organizationFingerprint: fingerprint(organizationId), importStatus: "ALREADY_IMPORTED", sourceDigestFingerprint: fingerprint(sourceDigest), postgresDigestFingerprint: fingerprint(existingDigest), parity: "PASS", revision: existing.revision, casSmoke: "PASS" };
    }
    if (before.status === "PENDING" && existing) throw new Error("Production Runtime migration preconditions are not satisfied");
    stage = "POSTGRES_RUNTIME_IMPORT";
    let importWriteStarted = false;
    const imported = await dependencies.importLegacy({ organizationId, legacy, destination: application, requestId: `production-runtime-migration:${correlationId}`, operatorId: "production-runtime-migration", onBoundary: (boundary: string) => {
      stage = boundary === "legacy-read" ? "LEGACY_BLOB_RUNTIME_READ" : boundary === "destination-read" ? "POSTGRES_RUNTIME_CONFLICT_CHECK" : "POSTGRES_RUNTIME_IMPORT";
      if (boundary === "destination-create") { importWriteStarted = true; durableWriteState = "AFTER_OR_DURING_IMPORT"; }
      else if (!importWriteStarted) durableWriteState = "AFTER_MIGRATION_BEFORE_IMPORT";
    }, onCreateBoundary: (boundary: "validate" | "insert" | "return-validate") => { stage = stageForCreateBoundary(boundary); } });
    durableWriteState = "AFTER_IMPORT";
    stage = "POSTGRES_RUNTIME_READBACK";
    const current = await application.read(organizationId);
    if (!current) throw new Error("Production Runtime migration import verification failed");
    stage = "PAYLOAD_PARITY_VERIFY";
    const currentDigest = createHash("sha256").update(current.bytes).digest("hex");
    if (currentDigest !== sourceDigest) throw new Error("Production Runtime migration parity failed");
    stage = "CAS_SMOKE";
    // A guaranteed-stale conditional write proves rejection without changing current state.
    try { await application.replace(organizationId, current.bytes, "0", { requestId: `production-runtime-migration-cas:${correlationId}`, operatorId: "production-runtime-migration", writerClass: "RuntimeProvisioningRecovery", correlationId }); throw new Error("Production Runtime migration CAS verification failed"); }
    catch (error) { if (!(error instanceof RuntimeStorageConflictError)) throw error; }
    return { correlationId, status: "COMPLETE", migrationBefore: before.status === "PENDING" ? "PENDING" : "CURRENT", migrationAfter: "CURRENT", migrationNumber: "0008", organizationFingerprint: fingerprint(organizationId), importStatus: imported.disposition, sourceDigestFingerprint: fingerprint(sourceDigest), postgresDigestFingerprint: fingerprint(currentDigest), parity: "PASS", revision: current.revision, casSmoke: "PASS" };
  } catch (error) {
    const createError = error instanceof PostgresRuntimeCreateError || error instanceof PostgresRuntimeCreateConflictError ? error : null;
    if (createError) stage = stageForCreateBoundary(createError.boundary);
    const retrySafe: RuntimeMigrationRetrySafety = stage === "LEGACY_BLOB_RUNTIME_READ" || stage === "POSTGRES_RUNTIME_IMPORT" || stage === "POSTGRES_RUNTIME_CREATE_VALIDATE" || stage === "POSTGRES_RUNTIME_CREATE_INSERT" || stage === "POSTGRES_RUNTIME_CREATE_RETURN_VALIDATE" || stage === "CAS_SMOKE" ? true : stage === "POSTGRES_RUNTIME_READBACK" || stage === "POSTGRES_RUNTIME_CONFLICT_CHECK" ? "unknown" : false;
    throw new RuntimeMigrationOperationError({ status: "FAILED_CLOSED", correlationId, stage, errorCode: createError?.errorCode ?? "RUNTIME_MIGRATION_STAGE_FAILED", durableWriteState, retrySafe });
  } finally { if (sql) await sql.end({ timeout: 1 }); }
}
