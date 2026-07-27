import assert from "node:assert/strict";
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

const checks: string[] = [];
function check(statement: string, condition: unknown): void {
  assert.ok(condition, statement);
  checks.push(statement);
}

async function reset(sql: postgres.Sql): Promise<void> {
  await sql`DROP TABLE IF EXISTS alpha_disclosure_audit_events,
    alpha_access_lifecycle_events, alpha_access_records CASCADE`;
  await sql`DROP FUNCTION IF EXISTS alpha_reject_append_only_mutation() CASCADE`;
  await sql`DROP FUNCTION IF EXISTS alpha_enforce_access_transition() CASCADE`;
  await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
}

async function journalCount(sql: postgres.Sql): Promise<number> {
  const [row] = await sql<{ count: number }[]>`
    SELECT count(*)::int AS count FROM drizzle.__drizzle_migrations
  `;
  return row.count;
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
    check("migration 0000 creates one journal row", await journalCount(sql) === 1);
    const second = await applyGovernanceMigrations(sql);
    check("second invocation is CURRENT", second.status === "CURRENT");
    check("second invocation is a no-op", await journalCount(sql) === 1);

    await reset(sql);
    const migrationSql = await readFile(
      path.join(
        canonicalGovernanceMigrationsFolder,
        "0000_alpha_governance_foundation.sql",
      ),
      "utf8",
    );
    await sql.unsafe(migrationSql);
    check(
      "governance schema without journal reports PARTIAL",
      (await inspectGovernanceMigrationState(sql)).status === "PARTIAL",
    );

    await reset(sql);
    await applyGovernanceMigrations(sql);
    await sql`DROP TABLE alpha_disclosure_audit_events CASCADE`;
    check(
      "journal without required table reports PARTIAL",
      (await inspectGovernanceMigrationState(sql)).status === "PARTIAL",
    );

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
      path.join(failingFolder, "0000_alpha_governance_foundation.sql"),
      `${migrationSql}\nSELECT 1 / 0;\n`,
    );
    await assert.rejects(() =>
      applyGovernanceMigrations(sql, failingFolder)
    );
    const [failedSchema] = await sql<{ count: number }[]>`
      SELECT count(*)::int AS count FROM pg_tables
      WHERE schemaname = 'public' AND tablename LIKE 'alpha_%'
    `;
    check("failed migration rolls back governance tables", failedSchema.count === 0);
    check("failed migration writes no journal row", await journalCount(sql) === 0);
    check(
      "failed clean migration remains PENDING",
      (await inspectGovernanceMigrationState(sql)).status === "PENDING",
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
      check("concurrent attempts create one journal row", await journalCount(sql) === 1);
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
            'alpha_audit_policy_review_idx'
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
    check("all nine reviewed indexes exist", catalog.indexes === 9);
    check("all three reviewed triggers exist", catalog.triggers === 3);
    check("both reviewed functions exist", catalog.functions === 2);
    check("both reviewed roles exist", catalog.roles === 2);
    check("reviewed constraints remain present", catalog.constraints >= 12);

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
