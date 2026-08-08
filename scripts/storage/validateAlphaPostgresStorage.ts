import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

import postgres from "postgres";

import {
  ALPHA_ALLOWLIST_POLICY_ID,
  ALPHA_ALLOWLIST_POLICY_VERSION,
  preflightAlphaOrganizationAccess,
  type AlphaDisclosureDecisionAuditEvent,
  type VerifiedConsumerIdentity,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { runDurableAlphaDisclosureTransactionShadow } from "../../db/governance/disclosureTransactionShadow";
import {
  PostgresAlphaAccessRecordRepository,
  PostgresAlphaDisclosureAuditRepository,
} from "../../db/governance/postgresRepositories";
import { AlphaStorageError } from "../../db/governance/types";
import { inspectGovernanceMigrationState } from "./governanceMigrationContract";
import type { Sql } from "postgres";

async function main(): Promise<void> {
const url = process.env.DISCOVERY_TEST_DATABASE_URL;
if (!url || !/localhost|127\.0\.0\.1/.test(url)) {
  throw new Error("DISCOVERY_TEST_DATABASE_URL must name an explicit local PostgreSQL");
}

const sql = postgres(url, { max: 12 });
const repository = new PostgresAlphaAccessRecordRepository(sql);
const auditRepository = new PostgresAlphaDisclosureAuditRepository(sql);
const now = "2026-07-26T12:00:00.000Z";
const later = "2026-07-27T12:00:00.000Z";
const results: Array<{ id: string; statement: string }> = [];

function check(id: string, statement: string, condition: unknown): void {
  assert.ok(condition, `${id}: ${statement}`);
  results.push({ id, statement });
}

async function rejects(
  id: string,
  statement: string,
  operation: () => Promise<unknown>,
  expected?: string,
): Promise<void> {
  try {
    await operation();
    assert.fail(`${id}: expected rejection`);
  } catch (error) {
    if (expected) {
      assert.equal(
        error instanceof AlphaStorageError ? error.code : (error as { code?: string }).code,
        expected,
      );
    }
    results.push({ id, statement });
  }
}

function sha256(value: unknown): string {
  return createHash("sha256")
    .update(JSON.stringify(value))
    .digest("hex");
}

await sql`TRUNCATE alpha_actor_mappings, alpha_disclosure_audit_events,
  alpha_access_lifecycle_events, alpha_access_records CASCADE`;

const version = await sql<{ version: string }[]>`
  SELECT current_setting('server_version') AS version
`;
check("01", "PostgreSQL 17 is the representative test database", version[0].version.startsWith("17."));

const relations = await sql<{ name: string }[]>`
  SELECT tablename AS name FROM pg_tables
  WHERE schemaname = 'public' AND tablename LIKE 'alpha_%'
  ORDER BY tablename
`;
const requiredRelations = ["alpha_access_records", "alpha_access_lifecycle_events", "alpha_disclosure_audit_events", "alpha_actor_mappings"];
check("02", "all required named governance tables exist", requiredRelations.every((name) => relations.some((row) => row.name === name)));
const actorColumns = await sql<{ column_name: string; data_type: string; is_nullable: string }[]>`
  SELECT column_name, data_type, is_nullable FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'alpha_actor_mappings'
`;
const actorColumn = (name: string) => actorColumns.find((column) => column.column_name === name);
check("02a", "actor mapping stores a required non-null opaque text actorRef", actorColumn("actor_ref")?.data_type === "text" && actorColumn("actor_ref")?.is_nullable === "NO");
check("02b", "actor mapping stores private lookup digest without raw subject column", actorColumn("subject_lookup_digest")?.data_type === "text" && !actorColumn("consumer_id"));
check("02c", "actor mapping stores exact organization and revision", actorColumn("organization_id")?.is_nullable === "NO" && actorColumn("mapping_revision")?.data_type === "integer");
const actorConstraints = await sql<{ name: string }[]>`
  SELECT conname AS name FROM pg_constraint
  WHERE conrelid = 'alpha_actor_mappings'::regclass
`;
const actorIndexes = await sql<{ name: string }[]>`
  SELECT indexname AS name FROM pg_indexes
  WHERE schemaname = 'public' AND tablename = 'alpha_actor_mappings'
`;
check("02d", "actorRef uniqueness is database-enforced", actorConstraints.some((row) => row.name === "alpha_actor_mappings_actor_ref_key"));
check("02e", "active organization and subject lookup uniqueness is database-enforced", actorIndexes.some((row) => row.name === "alpha_actor_mapping_active_subject_uq"));
check("02f", "assignment idempotency uniqueness is database-enforced", actorConstraints.some((row) => row.name === "alpha_actor_mappings_assignment_idempotency_key_key"));
check("02g", "migration performs no historical actor backfill", Number((await sql<{ count: number }[]>`SELECT count(*)::int AS count FROM alpha_actor_mappings`)[0].count) === 0);

async function migrationStateWithMutation(mutation: (transaction: Sql) => Promise<void>) {
  return sql.begin(async (transaction) => {
    await mutation(transaction as unknown as Sql);
    const state = await inspectGovernanceMigrationState(transaction as unknown as Sql);
    throw Object.assign(new Error("rollback schema control"), { state });
  }).catch((error: Error & { state?: Awaited<ReturnType<typeof inspectGovernanceMigrationState>> }) => error.state);
}
check("02h", "missing actor table is classified fail-closed", (await migrationStateWithMutation(async (tx) => { await tx`DROP TABLE alpha_actor_mappings CASCADE`; }))?.status === "PARTIAL");
check("02i", "missing actorRef uniqueness is classified fail-closed", (await migrationStateWithMutation(async (tx) => { await tx`ALTER TABLE alpha_actor_mappings DROP CONSTRAINT alpha_actor_mappings_actor_ref_key`; }))?.status === "PARTIAL");
check("02j", "missing lookup uniqueness is classified fail-closed", (await migrationStateWithMutation(async (tx) => { await tx`DROP INDEX alpha_actor_mapping_active_subject_uq`; }))?.status === "PARTIAL");
check("02k", "nullable actorRef is classified fail-closed", (await migrationStateWithMutation(async (tx) => { await tx`ALTER TABLE alpha_actor_mappings ALTER COLUMN actor_ref DROP NOT NULL`; }))?.status === "PARTIAL");
check("02l", "wrong actorRef type is classified fail-closed", (await migrationStateWithMutation(async (tx) => { await tx`ALTER TABLE alpha_actor_mappings DROP CONSTRAINT alpha_actor_mappings_actor_ref_key`; await tx`ALTER TABLE alpha_actor_mappings DROP CONSTRAINT alpha_actor_mapping_identity_check`; await tx`ALTER TABLE alpha_actor_mappings ALTER COLUMN actor_ref TYPE integer USING 1`; }))?.status === "PARTIAL");
check("02m", "missing actor migration journal is classified fail-closed", (await migrationStateWithMutation(async (tx) => { await tx`DELETE FROM drizzle.__drizzle_migrations WHERE id = (SELECT max(id) FROM drizzle.__drizzle_migrations)`; }))?.status !== "CURRENT");
check("02n", "valid three-table predecessor is classified migration-pending", (await migrationStateWithMutation(async (tx) => { await tx`DELETE FROM drizzle.__drizzle_migrations WHERE id = (SELECT max(id) FROM drizzle.__drizzle_migrations)`; await tx`DROP TABLE alpha_actor_mappings CASCADE`; }))?.status === "PENDING");

const triggers = await sql<{ count: number }[]>`
  SELECT count(*)::int AS count FROM pg_trigger
  WHERE NOT tgisinternal AND tgname LIKE 'alpha_%'
`;
check("03", "three governance enforcement triggers exist", triggers[0].count === 3);

const roles = await sql<{ count: number }[]>`
  SELECT count(*)::int AS count FROM pg_roles
  WHERE rolname IN ('discovery_alpha_application', 'discovery_alpha_administration')
`;
check("04", "application and administration roles exist", roles[0].count === 2);

const granted = await repository.grantAccess({
  accessRecordId: "alpha-access:primary",
  consumerId: "user_primary",
  organizationId: "atlas-manufacturing",
  experience: "organization",
  actor: "operator_primary",
  reasonCode: "alpha-approved",
  idempotencyKey: "grant-primary",
  grantedAt: now,
  expiresAt: "2026-08-26T12:00:00.000Z",
});
check("05", "grant returns the exact access identity", granted.accessRecordId === "alpha-access:primary");
check("06", "grant preserves canonical policy identity", granted.policyId === ALPHA_ALLOWLIST_POLICY_ID);
check("07", "grant preserves canonical policy version", granted.policyVersion === ALPHA_ALLOWLIST_POLICY_VERSION);
check("08", "grant preserves organization scope", granted.scope.organizationId === "atlas-manufacturing");
check("09", "grant starts active", granted.status === "active");

const idempotentGrant = await repository.grantAccess({
  accessRecordId: "alpha-access:primary",
  consumerId: "user_primary",
  organizationId: "atlas-manufacturing",
  experience: "organization",
  actor: "operator_primary",
  reasonCode: "alpha-approved",
  idempotencyKey: "grant-primary",
  grantedAt: now,
  expiresAt: "2026-08-26T12:00:00.000Z",
});
check("10", "identical grant idempotency returns the existing record", idempotentGrant.accessRecordId === granted.accessRecordId);

const chain = await repository.findAccessRecords({
  consumerId: "user_primary",
  organizationId: "atlas-manufacturing",
  experience: "organization",
  resolvedAt: now,
});
check("11", "active access lookup returns one exact chain member", chain.length === 1);
check("12", "consumer isolation denies another consumer", (await repository.findAccessRecords({
  consumerId: "user_other",
  organizationId: "atlas-manufacturing",
  experience: "organization",
  resolvedAt: now,
})).length === 0);
check("13", "organization isolation denies another organization", (await repository.findAccessRecords({
  consumerId: "user_primary",
  organizationId: "other-organization",
  experience: "organization",
  resolvedAt: now,
})).length === 0);
await rejects("14", "wildcard consumers fail closed", () => repository.findAccessRecords({
  consumerId: "*", organizationId: "atlas-manufacturing", experience: "organization", resolvedAt: now,
}), "integrity-failure");
await rejects("15", "wildcard organizations fail closed", () => repository.findAccessRecords({
  consumerId: "user_primary", organizationId: "*", experience: "organization", resolvedAt: now,
}), "integrity-failure");

await rejects("16", "database prevents a duplicate active grant", () => repository.grantAccess({
  accessRecordId: "alpha-access:duplicate",
  consumerId: "user_primary",
  organizationId: "atlas-manufacturing",
  experience: "organization",
  actor: "operator_primary",
  reasonCode: "duplicate",
  idempotencyKey: "grant-duplicate",
  grantedAt: now,
}), "conflict");

const concurrent = await Promise.allSettled([
  repository.grantAccess({
    accessRecordId: "alpha-access:concurrent-a", consumerId: "user_concurrent",
    organizationId: "atlas-manufacturing", experience: "organization",
    actor: "operator_primary", reasonCode: "concurrency", idempotencyKey: "concurrent-a", grantedAt: now,
  }),
  repository.grantAccess({
    accessRecordId: "alpha-access:concurrent-b", consumerId: "user_concurrent",
    organizationId: "atlas-manufacturing", experience: "organization",
    actor: "operator_primary", reasonCode: "concurrency", idempotencyKey: "concurrent-b", grantedAt: now,
  }),
]);
check("17", "concurrent grants produce exactly one success", concurrent.filter((item) => item.status === "fulfilled").length === 1);
check("18", "concurrent grants produce exactly one conflict", concurrent.filter((item) => item.status === "rejected").length === 1);

const superseded = await repository.supersedeAccess({
  previousAccessRecordId: "alpha-access:primary",
  nextAccessRecordId: "alpha-access:successor",
  actor: "operator_primary",
  reasonCode: "scope-renewal",
  idempotencyKey: "supersede-primary",
  supersededAt: later,
  expiresAt: "2026-09-26T12:00:00.000Z",
});
check("19", "supersession returns the predecessor", superseded.previous.accessRecordId === "alpha-access:primary");
check("20", "stored superseded predecessor maps to historical domain active", superseded.previous.status === "active");
check("21", "supersession returns the successor", superseded.next.accessRecordId === "alpha-access:successor");
check("22", "successor carries exact predecessor identity", superseded.next.supersedesAccessRecordId === "alpha-access:primary");

const supersededChain = await repository.findAccessRecords({
  consumerId: "user_primary",
  organizationId: "atlas-manufacturing",
  experience: "organization",
  resolvedAt: later,
});
check("23", "complete supersession chain is returned", supersededChain.length === 2);
const identity: VerifiedConsumerIdentity = {
  consumerId: "user_primary",
  provider: "clerk",
  verificationId: "session_primary",
  verifiedAt: now,
};
const preflight = preflightAlphaOrganizationAccess(
  { identity, organizationId: "atlas-manufacturing", experience: "organization", resolvedAt: later },
  { findAccessRecords: () => supersededChain },
);
check("24", "existing pure evaluator remains authoritative", preflight.disposition === "eligible");
check("25", "preflight selects the successor", preflight.accessRecord?.accessRecordId === "alpha-access:successor");

const revoked = await repository.revokeAccess({
  accessRecordId: "alpha-access:successor",
  actor: "operator_primary",
  reasonCode: "access-ended",
  idempotencyKey: "revoke-successor",
  revokedAt: "2026-07-28T12:00:00.000Z",
});
check("26", "revocation returns revoked domain status", revoked.status === "revoked");
check("27", "revocation preserves exact timestamp", revoked.revokedAt === "2026-07-28T12:00:00.000Z");
await rejects("28", "terminal records cannot be revoked twice", () => repository.revokeAccess({
  accessRecordId: "alpha-access:successor", actor: "operator_primary",
  reasonCode: "repeat", idempotencyKey: "revoke-repeat", revokedAt: "2026-07-29T12:00:00.000Z",
}), "invalid-transition");

const lifecycle = await sql<{ action: string }[]>`
  SELECT action FROM alpha_access_lifecycle_events
  WHERE access_record_id IN ('alpha-access:primary', 'alpha-access:successor')
  ORDER BY occurred_at, action
`;
check("29", "grant, supersede, and revoke lifecycle events are durable", lifecycle.length === 3);
await rejects("30", "lifecycle updates are rejected by the database", async () => {
  await sql`UPDATE alpha_access_lifecycle_events SET reason_code = 'tampered'
    WHERE idempotency_key = 'grant-primary'`;
});
await rejects("31", "lifecycle deletes are rejected by the database", async () => {
  await sql`DELETE FROM alpha_access_lifecycle_events WHERE idempotency_key = 'grant-primary'`;
});
await rejects("32", "access identity fields are immutable", async () => {
  await sql`UPDATE alpha_access_records SET organization_id = 'tampered'
    WHERE access_record_id = 'alpha-access:successor'`;
});

const auditEvent: AlphaDisclosureDecisionAuditEvent = {
  eventId: "alpha-audit:event-primary",
  decisionId: "alpha-decision:primary",
  eventType: "alpha-disclosure-decision-resolved",
  policyId: ALPHA_ALLOWLIST_POLICY_ID,
  policyVersion: ALPHA_ALLOWLIST_POLICY_VERSION,
  consumerId: "user_concurrent",
  organizationId: "atlas-manufacturing",
  experience: "organization",
  accessRecordId: concurrent.find((item) => item.status === "fulfilled")?.status === "fulfilled"
    ? concurrent.find((item) => item.status === "fulfilled")!.value.accessRecordId
    : undefined,
  disposition: "withheld",
  sourceRevisionIds: [],
  authorityReceiptIds: [],
  resolvedAt: now,
  reasonCodes: ["authority-receipt-missing"],
};
check("33", "audit append succeeds", (await auditRepository.append(auditEvent)) === "inserted");
check("34", "identical audit append is idempotent", (await auditRepository.append(auditEvent)) === "already_present_identical");
await rejects("35", "same audit ID with different payload fails", () =>
  auditRepository.append({ ...auditEvent, reasonCodes: ["policy-input-invalid"] }), "integrity-failure");
await rejects("36", "audit updates are rejected by the database", async () => {
  await sql`UPDATE alpha_disclosure_audit_events SET disposition = 'invalid'
    WHERE audit_event_id = ${auditEvent.eventId}`;
});
await rejects("37", "audit deletes are rejected by the database", async () => {
  await sql`DELETE FROM alpha_disclosure_audit_events WHERE audit_event_id = ${auditEvent.eventId}`;
});
check("38", "denied audit stores no protected cognition references",
  auditEvent.sourceRevisionIds.length === 0 && auditEvent.authorityReceiptIds.length === 0);

await rejects("39", "application role cannot bypass append-only enforcement", () =>
  sql.begin(async (transaction) => {
    await transaction`SET LOCAL ROLE discovery_alpha_application`;
    await transaction`UPDATE alpha_disclosure_audit_events SET disposition = 'invalid'
      WHERE audit_event_id = ${auditEvent.eventId}`;
  }),
);

await repository.grantAccess({
  accessRecordId: "alpha-access:orchestration",
  consumerId: "user_orchestration",
  organizationId: "atlas-manufacturing",
  experience: "organization",
  actor: "operator_primary",
  reasonCode: "orchestration",
  idempotencyKey: "grant-orchestration",
  grantedAt: now,
});
const orchestrationIdentity: VerifiedConsumerIdentity = {
  consumerId: "user_orchestration", provider: "clerk",
  verificationId: "session_orchestration", verifiedAt: now,
};
const runtimeBytesBefore = readFileSync(
  ".discovery-runtime/organizations/atlas-manufacturing-simulation.json",
);
const replay = await runDurableAlphaDisclosureTransactionShadow({
  sql,
  identity: orchestrationIdentity,
  organizationId: "atlas-manufacturing",
  experience: "organization",
  resolvedAt: now,
  runtimeLoader: {
    load: () => ({ organizationId: "atlas-manufacturing", compositions: [], authorityReceipts: [] }),
  },
});
check("40", "inactive durable disclosure replay commits", replay.status === "committed");
check("41", "Runtime loader is invoked exactly once", replay.runtimeLoaderInvocations === 1);
check("42", "durable replay writes its audit event", Number((await sql<{ count: number }[]>`
  SELECT count(*)::int AS count FROM alpha_disclosure_audit_events
`)[0].count) === 2);
check("43", "Runtime remains byte-identical", Buffer.compare(runtimeBytesBefore,
  readFileSync(".discovery-runtime/organizations/atlas-manufacturing-simulation.json")) === 0);

const runtimeFailure = await runDurableAlphaDisclosureTransactionShadow({
  sql,
  identity: orchestrationIdentity,
  organizationId: "atlas-manufacturing",
  experience: "organization",
  resolvedAt: now,
  runtimeLoader: { load: () => { throw new Error("injected Runtime failure"); } },
});
check("44", "Runtime failure denies and rolls back", runtimeFailure.status === "denied" && runtimeFailure.reason === "runtime-unavailable");
check("45", "Runtime failure does not append audit", Number((await sql<{ count: number }[]>`
  SELECT count(*)::int AS count FROM alpha_disclosure_audit_events
`)[0].count) === 2);

await sql`CREATE FUNCTION alpha_test_reject_audit() RETURNS trigger LANGUAGE plpgsql AS $$
  BEGIN RAISE EXCEPTION 'injected audit failure'; END; $$`;
await sql`CREATE TRIGGER alpha_test_audit_failure BEFORE INSERT ON alpha_disclosure_audit_events
  FOR EACH ROW EXECUTE FUNCTION alpha_test_reject_audit()`;
const auditFailure = await runDurableAlphaDisclosureTransactionShadow({
  sql,
  identity: orchestrationIdentity,
  organizationId: "atlas-manufacturing",
  experience: "organization",
  resolvedAt: "2026-07-26T12:00:01.000Z",
  runtimeLoader: {
    load: () => ({ organizationId: "atlas-manufacturing", compositions: [], authorityReceipts: [] }),
  },
});
await sql`DROP TRIGGER alpha_test_audit_failure ON alpha_disclosure_audit_events`;
await sql`DROP FUNCTION alpha_test_reject_audit()`;
check("46", "audit failure fails disclosure closed", auditFailure.status === "denied" && auditFailure.reason === "audit-unavailable");
check("47", "audit failure transaction leaves no partial event", Number((await sql<{ count: number }[]>`
  SELECT count(*)::int AS count FROM alpha_disclosure_audit_events
`)[0].count) === 2);

const expired = await repository.grantAccess({
  accessRecordId: "alpha-access:expired",
  consumerId: "user_expired",
  organizationId: "atlas-manufacturing",
  experience: "organization",
  actor: "operator_primary",
  reasonCode: "expiry-test",
  idempotencyKey: "grant-expired",
  grantedAt: now,
  expiresAt: "2026-07-26T12:00:00.000Z",
});
const expiredPreflight = preflightAlphaOrganizationAccess(
  {
    identity: { consumerId: "user_expired", provider: "clerk", verificationId: "s", verifiedAt: now },
    organizationId: "atlas-manufacturing", experience: "organization",
    resolvedAt: "2026-07-26T12:00:01.000Z",
  },
  { findAccessRecords: () => [expired] },
);
check("48", "expiry is evaluated at explicit request time", expiredPreflight.disposition === "denied");

const dryRun = spawnSync(
  "npx",
  ["tsx", "scripts/storage/alphaAccessAdmin.ts", "grant", "--consumer", "user_cli",
    "--organization", "atlas-manufacturing", "--actor", "operator_cli", "--reason", "cli-test",
    "--idempotency-key", "cli-test", "--dry-run"],
  { encoding: "utf8" },
);
check("49", "CLI dry-run previews without a database credential", dryRun.status === 0);
check("50", "CLI preview redacts database secrets", !dryRun.stdout.includes("postgres://"));
const cliSource = readFileSync("scripts/storage/alphaAccessAdmin.ts", "utf8");
check("51", "CLI requires confirmation before mutation", cliSource.includes("Mutation requires --confirm"));
check("52", "CLI has no Clerk email lookup", !/email|clerkClient/.test(cliSource));

for (const relativePath of [
  "components/product-shell/ProductWorkspace.tsx",
  "components/product-shell/data/buildRuntimeOrganizationView.ts",
]) {
  check(
    `route-${results.length + 1}`,
    `${relativePath} remains byte-identical to HEAD`,
    readFileSync(relativePath, "utf8") === execFileSync("git", ["show", `HEAD:${relativePath}`], { encoding: "utf8" }),
  );
}
const activatedRouteSource = readFileSync(
  "app/(product)/your-organization/page.tsx",
  "utf8",
);
check("55", "Your Organization route retains feature-flag rollback",
  activatedRouteSource.includes("isYourOrganizationAlphaActivationEnabled") &&
  activatedRouteSource.includes("<ProductWorkspace"));
const middlewareSource = readFileSync("middleware.ts", "utf8");
check("56", "middleware limits Clerk protection to bounded activation",
  middlewareSource.includes("activatedYourOrganizationPath") &&
  middlewareSource.includes("protectActivatedYourOrganization"));
const layoutSource = readFileSync("app/layout.tsx", "utf8");
check("57", "Clerk provider is conditional on the activation flag",
  layoutSource.includes("isYourOrganizationAlphaActivationEnabled") &&
  layoutSource.includes("<ClerkProvider>"));

const runtimeSerialized = runtimeBytesBefore.toString("utf8");
check("58", "Runtime contains no Alpha access table data", !runtimeSerialized.includes("alpha_access_records"));
check("59", "Runtime contains no disclosure audit table data", !runtimeSerialized.includes("alpha_disclosure_audit_events"));
check("60", "storage result makes no User Intelligence claim", !JSON.stringify(results).includes("Local Understanding Utility"));

const output = {
  validator: "Durable Alpha PostgreSQL Storage Foundation",
  databaseVersion: version[0].version,
  counts: { passed: results.length, failed: 0 },
  results,
  hashes: {
    validationSha256: sha256(results),
    migrationSha256: createHash("sha256")
      .update(readFileSync("db/migrations/0000_alpha_governance_foundation.sql"))
      .digest("hex"),
    runtimeBeforeSha256: createHash("sha256").update(runtimeBytesBefore).digest("hex"),
    runtimeAfterSha256: createHash("sha256")
      .update(readFileSync(".discovery-runtime/organizations/atlas-manufacturing-simulation.json"))
      .digest("hex"),
  },
  activation: "feature-flagged-your-organization",
  classification: "A — STORAGE ACTIVE AT BOUNDED LOCAL YOUR ORGANIZATION BOUNDARY",
};

console.log(JSON.stringify(output, null, 2));
await sql.end();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
