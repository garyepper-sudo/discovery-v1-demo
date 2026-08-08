import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import postgres from "postgres";

import {
  applyGovernanceMigrations,
  canonicalGovernanceMigrationsFolder,
  inspectGovernanceMigrationState,
} from "./governanceMigrationContract";

const url = process.env.DISCOVERY_TEST_DATABASE_URL;
if (!url || !/localhost|127\.0\.0\.1/.test(url)) {
  throw new Error("DISCOVERY_TEST_DATABASE_URL must name an explicit local PostgreSQL");
}
const databaseUrl = url;

const expectedMigrationTags = [
  "0000_alpha_governance_foundation",
  "0001_alpha_persistence_safe_actor_reference",
] as const;
const expectedRelations = [
  "alpha_access_records",
  "alpha_access_lifecycle_events",
  "alpha_disclosure_audit_events",
  "alpha_actor_mappings",
] as const;
const expectedActorIndexes = [
  "alpha_actor_mappings_actor_ref_key",
  "alpha_actor_mappings_assignment_idempotency_key_key",
  "alpha_actor_mapping_active_subject_uq",
  "alpha_actor_mapping_subject_history_idx",
] as const;
const expectedActorColumns = [
  ["mapping_id", "text", "NO"],
  ["mapping_revision", "integer", "NO"],
  ["actor_ref", "text", "NO"],
  ["organization_id", "text", "NO"],
  ["subject_lookup_digest", "text", "NO"],
  ["status", "text", "NO"],
  ["assigned_at", "timestamp with time zone", "NO"],
  ["revoked_at", "timestamp with time zone", "YES"],
  ["predecessor_mapping_id", "text", "YES"],
  ["assignment_idempotency_key", "text", "NO"],
] as const;

const checks: string[] = [];
function check(statement: string, condition: unknown): void {
  assert.ok(condition, statement);
  checks.push(statement);
}

async function reset(sql: postgres.Sql): Promise<void> {
  await sql`DROP TABLE IF EXISTS alpha_actor_mappings,
    alpha_disclosure_audit_events,
    alpha_access_lifecycle_events, alpha_access_records CASCADE`;
  await sql`DROP FUNCTION IF EXISTS alpha_reject_append_only_mutation() CASCADE`;
  await sql`DROP FUNCTION IF EXISTS alpha_enforce_access_transition() CASCADE`;
  await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
}

async function expectPartialAfter(
  sql: postgres.Sql,
  statement: string,
  mutation: (transaction: postgres.TransactionSql) => Promise<unknown>,
): Promise<void> {
  await reset(sql);
  await applyGovernanceMigrations(sql);
  const rollback = new Error("expected validator rollback");
  await assert.rejects(
    () => sql.begin(async (transaction) => {
      await mutation(transaction);
      check(statement, (await inspectGovernanceMigrationState(
        transaction as unknown as postgres.Sql,
      )).status === "PARTIAL");
      throw rollback;
    }),
    (error: unknown) => error === rollback,
  );
}

async function journalCount(sql: postgres.Sql): Promise<number> {
  const [row] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations
  `;
  return row.count;
}

async function establishCanonicalPredecessor(
  sql: postgres.Sql,
  migrationSql: string,
): Promise<void> {
  await sql.unsafe(migrationSql);
  await sql`CREATE SCHEMA drizzle`;
  await sql`CREATE TABLE drizzle.__drizzle_migrations (
    id serial PRIMARY KEY,
    hash text NOT NULL,
    created_at bigint
  )`;
  const digest = createHash("sha256").update(migrationSql).digest("hex");
  await sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
    VALUES (${digest}, ${1785067200000})`;
}

async function main(): Promise<void> {
  const sql = postgres(databaseUrl, { max: 1 });
  const temporaryRoot = await mkdtemp(
    path.join(os.tmpdir(), "discovery-governance-migrations-"),
  );
  try {
    await reset(sql);
    check(
      "empty database reports EMPTY",
      (await inspectGovernanceMigrationState(sql)).status === "EMPTY",
    );

    const first = await applyGovernanceMigrations(sql);
    check("first migration reaches CURRENT", first.status === "CURRENT");
    check("ordered migrations create two journal rows", await journalCount(sql) === 2);
    check("current history reports both required migrations", first.appliedMigrations === expectedMigrationTags.length);
    const second = await applyGovernanceMigrations(sql);
    check("second invocation is CURRENT", second.status === "CURRENT");
    check("second invocation is a no-op", await journalCount(sql) === 2);

    const migrationSql = await readFile(
      path.join(canonicalGovernanceMigrationsFolder, "0000_alpha_governance_foundation.sql"),
      "utf8",
    );
    const actorMigrationSql = await readFile(
      path.join(canonicalGovernanceMigrationsFolder, "0001_alpha_persistence_safe_actor_reference.sql"),
      "utf8",
    );
    await reset(sql);
    await establishCanonicalPredecessor(sql, migrationSql);
    const predecessor = await inspectGovernanceMigrationState(sql);
    check("valid predecessor history reports PENDING", predecessor.status === "PENDING");
    check("valid predecessor has one ordered journal row", await journalCount(sql) === 1);

    await reset(sql);
    await sql.unsafe(migrationSql);
    check(
      "governance schema without journal reports PARTIAL",
      (await inspectGovernanceMigrationState(sql)).status === "PARTIAL",
    );

    await expectPartialAfter(sql, "journal without required table reports PARTIAL", (tx) =>
      tx`DROP TABLE alpha_disclosure_audit_events CASCADE`);
    await expectPartialAfter(sql, "actor relation omitted reports PARTIAL", (tx) =>
      tx`DROP TABLE alpha_actor_mappings CASCADE`);
    await expectPartialAfter(sql, "renamed actor relation reports PARTIAL", (tx) =>
      tx`ALTER TABLE alpha_actor_mappings RENAME TO alpha_actor_mapping_wrong`);
    await expectPartialAfter(sql, "actor relation with wrong columns reports PARTIAL", (tx) =>
      tx`ALTER TABLE alpha_actor_mappings DROP COLUMN mapping_revision`);
    await expectPartialAfter(sql, "actorRef replaced by raw subject reports PARTIAL", (tx) =>
      tx`ALTER TABLE alpha_actor_mappings RENAME COLUMN actor_ref TO authentication_subject`);
    await expectPartialAfter(sql, "actorRef replaced by lookup digest reports PARTIAL", (tx) =>
      tx`ALTER TABLE alpha_actor_mappings RENAME COLUMN actor_ref TO actor_lookup_digest`);
    await expectPartialAfter(sql, "missing organization binding reports PARTIAL", (tx) =>
      tx`ALTER TABLE alpha_actor_mappings DROP COLUMN organization_id`);
    await expectPartialAfter(sql, "missing actorRef uniqueness reports PARTIAL", (tx) =>
      tx`ALTER TABLE alpha_actor_mappings DROP CONSTRAINT alpha_actor_mappings_actor_ref_key`);
    await expectPartialAfter(sql, "missing mapping uniqueness reports PARTIAL", (tx) =>
      tx`ALTER TABLE alpha_actor_mappings DROP CONSTRAINT alpha_actor_mappings_assignment_idempotency_key_key`);
    await expectPartialAfter(sql, "missing actor lookup index reports PARTIAL", (tx) =>
      tx`DROP INDEX alpha_actor_mapping_subject_history_idx`);
    await expectPartialAfter(sql, "wrong actorRef nullability reports PARTIAL", (tx) =>
      tx`ALTER TABLE alpha_actor_mappings ALTER COLUMN actor_ref DROP NOT NULL`);
    await expectPartialAfter(sql, "incompatible actorRef type reports PARTIAL", (tx) =>
      tx`ALTER TABLE alpha_actor_mappings ALTER COLUMN actor_ref TYPE varchar(128)`);

    await reset(sql);
    await applyGovernanceMigrations(sql);
    await sql`UPDATE drizzle.__drizzle_migrations SET created_at = CASE id
      WHEN (SELECT min(id) FROM drizzle.__drizzle_migrations) THEN 1786276800000
      ELSE 1785067200000 END`;
    check("wrong migration ordering reports DRIFTED", (await inspectGovernanceMigrationState(sql)).status === "DRIFTED");

    await reset(sql);
    await applyGovernanceMigrations(sql);
    await sql`INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY id LIMIT 1`;
    check("duplicate migration identity reports DRIFTED", (await inspectGovernanceMigrationState(sql)).status === "DRIFTED");

    await reset(sql);
    await applyGovernanceMigrations(sql);
    await sql`UPDATE drizzle.__drizzle_migrations SET hash = 'conflicting-migration-digest'
      WHERE id = (SELECT max(id) FROM drizzle.__drizzle_migrations)`;
    check("conflicting migration digest reports DRIFTED", (await inspectGovernanceMigrationState(sql)).status === "DRIFTED");

    await reset(sql);
    await applyGovernanceMigrations(sql);
    await sql`DELETE FROM drizzle.__drizzle_migrations
      WHERE id = (SELECT min(id) FROM drizzle.__drizzle_migrations)`;
    check("successor without predecessor reports DRIFTED", (await inspectGovernanceMigrationState(sql)).status === "DRIFTED");

    const alteredFolder = path.join(temporaryRoot, "altered");
    await cp(canonicalGovernanceMigrationsFolder, alteredFolder, {
      recursive: true,
    });
    await writeFile(
      path.join(alteredFolder, "0000_alpha_governance_foundation.sql"),
      `${migrationSql}\n-- altered history must be rejected\n`,
    );
    check(
      "edited applied migration reports DRIFTED",
      (await inspectGovernanceMigrationState(sql, alteredFolder)).status ===
        "DRIFTED",
    );

    await reset(sql);
    const failingFolder = path.join(temporaryRoot, "failing");
    await cp(canonicalGovernanceMigrationsFolder, failingFolder, {
      recursive: true,
    });
    await writeFile(
      path.join(failingFolder, "0001_alpha_persistence_safe_actor_reference.sql"),
      `${actorMigrationSql}\nSELECT 1 / 0;\n`,
    );
    await assert.rejects(() =>
      applyGovernanceMigrations(sql, failingFolder)
    );
    const [failedSchema] = await sql<{ count: number }[]>`
      SELECT count(*)::int AS count FROM pg_tables
      WHERE schemaname = 'public' AND tablename LIKE 'alpha_%'
    `;
    check("failed migration transaction rolls back governance tables", failedSchema.count === 0);
    check("failed migration transaction writes no journal row", await journalCount(sql) === 0);
    check(
      "empty journal after failed migration fails closed as PARTIAL",
      (await inspectGovernanceMigrationState(sql)).status === "PARTIAL",
    );

    await reset(sql);
    const concurrentA = postgres(databaseUrl, { max: 1 });
    const concurrentB = postgres(databaseUrl, { max: 1 });
    try {
      const results = await Promise.all([
        applyGovernanceMigrations(concurrentA),
        applyGovernanceMigrations(concurrentB),
      ]);
      check(
        "concurrent attempts serialize to CURRENT",
        results.every((result) => result.status === "CURRENT"),
      );
      check("concurrent attempts create two ordered journal rows", await journalCount(sql) === 2);
    } finally {
      await Promise.all([concurrentA.end(), concurrentB.end()]);
    }

    await reset(sql);
    const reconstructed = await applyGovernanceMigrations(sql);
    check(
      "committed files reconstruct CURRENT schema",
      reconstructed.status === "CURRENT",
    );
    const [catalog] = await sql<{
      indexes: number;
      triggers: number;
      functions: number;
      roles: number;
      constraints: number;
    }[]>`
      SELECT
        (SELECT count(*)::int FROM pg_indexes
          WHERE schemaname = 'public' AND indexname IN (
            'alpha_access_one_active_uq', 'alpha_access_successor_uq',
            'alpha_access_current_lookup_idx', 'alpha_access_consumer_history_idx',
            'alpha_access_organization_history_idx', 'alpha_lifecycle_access_time_idx',
            'alpha_audit_organization_time_idx', 'alpha_audit_consumer_time_idx',
            'alpha_audit_policy_review_idx',
            'alpha_actor_mappings_actor_ref_key',
            'alpha_actor_mappings_assignment_idempotency_key_key',
            'alpha_actor_mapping_active_subject_uq',
            'alpha_actor_mapping_subject_history_idx'
          )) AS indexes,
        (SELECT count(*)::int FROM pg_trigger
          WHERE NOT tgisinternal AND tgname LIKE 'alpha_%') AS triggers,
        (SELECT count(*)::int FROM pg_proc
          WHERE proname IN ('alpha_reject_append_only_mutation',
            'alpha_enforce_access_transition')) AS functions,
        (SELECT count(*)::int FROM pg_roles
          WHERE rolname IN ('discovery_alpha_application',
            'discovery_alpha_administration')) AS roles,
        (SELECT count(*)::int FROM pg_constraint
          WHERE conname LIKE 'alpha_%') AS constraints
    `;
    check("all thirteen reviewed indexes exist", catalog.indexes === 13);
    check("all three reviewed triggers exist", catalog.triggers === 3);
    check("both reviewed functions exist", catalog.functions === 2);
    check("both reviewed roles exist", catalog.roles === 2);
    check("reviewed constraints remain present", catalog.constraints >= 19);
    const relations = await sql<{ table_name: string }[]>`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ${sql(expectedRelations)}
      ORDER BY table_name
    `;
    check("all four canonical governance relations exist", relations.length === expectedRelations.length);
    const actorIndexes = await sql<{ indexname: string }[]>`
      SELECT indexname FROM pg_indexes WHERE schemaname = 'public'
        AND indexname IN ${sql(expectedActorIndexes)}
    `;
    check("all four actor mapping indexes exist", actorIndexes.length === expectedActorIndexes.length);
    const actorColumns = await sql<{ column_name: string; data_type: string; is_nullable: string }[]>`
      SELECT column_name, data_type, is_nullable FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'alpha_actor_mappings'
    `;
    const actorColumnEvidence = new Set(actorColumns.map((column) =>
      `${column.column_name}:${column.data_type}:${column.is_nullable}`));
    check("actor mapping columns have exact independent types and nullability",
      expectedActorColumns.every(([name, type, nullable]) =>
        actorColumnEvidence.has(`${name}:${type}:${nullable}`)));

    await reset(sql);
    check("full reset removes the migration journal", (await inspectGovernanceMigrationState(sql)).status === "EMPTY");
    const [remaining] = await sql<{ count: number }[]>`
      SELECT count(*)::int AS count FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name IN ${sql(expectedRelations)}
    `;
    check("full reset leaves no governance relation or actor row", remaining.count === 0);
    const reapplied = await applyGovernanceMigrations(sql);
    check("reset then reapply reconstructs CURRENT", reapplied.status === "CURRENT");
    check("reset then replay reconstructs two journal rows", await journalCount(sql) === 2);

    console.log(JSON.stringify({
      validation: "governance-migration-journal",
      result: "PASS",
      checks: checks.length,
      journal: "drizzle.__drizzle_migrations",
      journalRows: await journalCount(sql),
      finalStatus: reconstructed.status,
      hostedDatabaseTouched: false,
    }, null, 2));
  } finally {
    await rm(temporaryRoot, { recursive: true, force: true });
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
