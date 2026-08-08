import assert from "node:assert/strict";
import path from "node:path";

import { drizzle } from "drizzle-orm/postgres-js";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import type { Sql } from "postgres";

export type GovernanceMigrationStatus =
  | "EMPTY"
  | "PENDING"
  | "CURRENT"
  | "DRIFTED"
  | "PARTIAL"
  | "UNKNOWN";

export type GovernanceMigrationState = {
  status: GovernanceMigrationStatus;
  expectedMigrations: number;
  appliedMigrations: number;
  journalPresent: boolean;
  schemaComplete: boolean;
  missingSchemaObjects: readonly string[];
  reason: string;
};

const JOURNAL_SCHEMA = "drizzle";
const JOURNAL_TABLE = "__drizzle_migrations";
const LOCK_NAME = "discovery:alpha-governance-migrations";

const expectedRelations = [
  "alpha_access_records",
  "alpha_access_lifecycle_events",
  "alpha_disclosure_audit_events",
  "alpha_actor_mappings",
] as const;
const expectedIndexes = [
  "alpha_access_one_active_uq",
  "alpha_access_successor_uq",
  "alpha_access_current_lookup_idx",
  "alpha_access_consumer_history_idx",
  "alpha_access_organization_history_idx",
  "alpha_lifecycle_access_time_idx",
  "alpha_audit_organization_time_idx",
  "alpha_audit_consumer_time_idx",
  "alpha_audit_policy_review_idx",
  "alpha_actor_mappings_actor_ref_key",
  "alpha_actor_mappings_assignment_idempotency_key_key",
  "alpha_actor_mapping_active_subject_uq",
  "alpha_actor_mapping_subject_history_idx",
] as const;
const expectedFunctions = [
  "alpha_reject_append_only_mutation",
  "alpha_enforce_access_transition",
] as const;
const expectedTriggers = [
  "alpha_lifecycle_append_only",
  "alpha_audit_append_only",
  "alpha_access_terminal_transition",
] as const;
const expectedRoles = [
  "discovery_alpha_application",
  "discovery_alpha_administration",
] as const;
const expectedConstraints = [
  "alpha_access_policy_check",
  "alpha_access_identity_check",
  "alpha_access_relationship_check",
  "alpha_access_experience_check",
  "alpha_access_scope_check",
  "alpha_access_status_check",
  "alpha_access_expiry_check",
  "alpha_access_lifecycle_shape_check",
  "alpha_access_no_self_successor_check",
  "alpha_access_lifecycle_events_access_record_id_fkey",
  "alpha_access_records_supersedes_access_record_id_fkey",
  "alpha_disclosure_audit_events_access_record_id_fkey",
  "alpha_actor_mappings_mapping_revision_check",
  "alpha_actor_mappings_actor_ref_key",
  "alpha_actor_mappings_status_check",
  "alpha_actor_mappings_predecessor_mapping_id_fkey",
  "alpha_actor_mappings_assignment_idempotency_key_key",
  "alpha_actor_mapping_identity_check",
  "alpha_actor_mapping_lifecycle_check",
] as const;
const expectedActorColumns = [
  ["mapping_id", "text", "NO"], ["mapping_revision", "integer", "NO"],
  ["actor_ref", "text", "NO"], ["organization_id", "text", "NO"],
  ["subject_lookup_digest", "text", "NO"], ["status", "text", "NO"],
  ["assigned_at", "timestamp with time zone", "NO"], ["revoked_at", "timestamp with time zone", "YES"],
  ["predecessor_mapping_id", "text", "YES"], ["assignment_idempotency_key", "text", "NO"],
] as const;
const actorSchemaObjects = new Set([
  "relation:alpha_actor_mappings",
  ...expectedIndexes.filter((name) => name.startsWith("alpha_actor")).map((name) => `index:${name}`),
  ...expectedConstraints.filter((name) => name.startsWith("alpha_actor")).map((name) => `constraint:${name}`),
  ...expectedActorColumns.map(([name, type, nullable]) => `column:alpha_actor_mappings:${name}:${type}:${nullable}`),
]);

export const canonicalGovernanceMigrationsFolder = path.join(
  process.cwd(),
  "db/migrations",
);

async function schemaEvidence(sql: Sql): Promise<{
  complete: boolean;
  anyPresent: boolean;
  missing: string[];
}> {
  const rows = await sql<{ kind: string; name: string }[]>`
    SELECT 'relation' AS kind, c.relname AS name
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relname IN ${sql(expectedRelations)}
    UNION ALL
    SELECT 'index', c.relname
    FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'i'
      AND c.relname IN ${sql(expectedIndexes)}
    UNION ALL
    SELECT 'function', p.proname
    FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN ${sql(expectedFunctions)}
    UNION ALL
    SELECT 'trigger', t.tgname
    FROM pg_trigger t
    WHERE NOT t.tgisinternal AND t.tgname IN ${sql(expectedTriggers)}
    UNION ALL
    SELECT 'role', r.rolname FROM pg_roles r
    WHERE r.rolname IN ${sql(expectedRoles)}
    UNION ALL
    SELECT 'constraint', c.conname FROM pg_constraint c
    WHERE c.conname IN ${sql(expectedConstraints)}
  `;
  const found = new Set(rows.map(({ kind, name }) => `${kind}:${name}`));
  const columns = await sql<{ column_name: string; data_type: string; is_nullable: string }[]>`
    SELECT column_name, data_type, is_nullable FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'alpha_actor_mappings'
  `;
  for (const column of columns) found.add(`column:alpha_actor_mappings:${column.column_name}:${column.data_type}:${column.is_nullable}`);
  const expected = [
    ...expectedRelations.map((name) => `relation:${name}`),
    ...expectedIndexes.map((name) => `index:${name}`),
    ...expectedFunctions.map((name) => `function:${name}`),
    ...expectedTriggers.map((name) => `trigger:${name}`),
    ...expectedRoles.map((name) => `role:${name}`),
    ...expectedConstraints.map((name) => `constraint:${name}`),
    ...expectedActorColumns.map(([name, type, nullable]) => `column:alpha_actor_mappings:${name}:${type}:${nullable}`),
  ];
  const missing = expected.filter((item) => !found.has(item));

  if (missing.length === 0) {
    const [grants] = await sql<{
      application_access_select: boolean;
      application_audit_select: boolean;
      application_audit_insert: boolean;
      administration_access_select: boolean;
      administration_access_insert: boolean;
      administration_access_update: boolean;
      administration_lifecycle_select: boolean;
      administration_lifecycle_insert: boolean;
      administration_audit_select: boolean;
      application_actor_select: boolean;
      administration_actor_select: boolean;
      administration_actor_insert: boolean;
      administration_actor_update: boolean;
    }[]>`
      SELECT
        has_table_privilege('discovery_alpha_application', 'public.alpha_access_records', 'SELECT') AS application_access_select,
        has_table_privilege('discovery_alpha_application', 'public.alpha_disclosure_audit_events', 'SELECT') AS application_audit_select,
        has_table_privilege('discovery_alpha_application', 'public.alpha_disclosure_audit_events', 'INSERT') AS application_audit_insert,
        has_table_privilege('discovery_alpha_administration', 'public.alpha_access_records', 'SELECT') AS administration_access_select,
        has_table_privilege('discovery_alpha_administration', 'public.alpha_access_records', 'INSERT') AS administration_access_insert,
        has_table_privilege('discovery_alpha_administration', 'public.alpha_access_records', 'UPDATE') AS administration_access_update,
        has_table_privilege('discovery_alpha_administration', 'public.alpha_access_lifecycle_events', 'SELECT') AS administration_lifecycle_select,
        has_table_privilege('discovery_alpha_administration', 'public.alpha_access_lifecycle_events', 'INSERT') AS administration_lifecycle_insert,
        has_table_privilege('discovery_alpha_administration', 'public.alpha_disclosure_audit_events', 'SELECT') AS administration_audit_select,
        has_table_privilege('discovery_alpha_application', 'public.alpha_actor_mappings', 'SELECT') AS application_actor_select,
        has_table_privilege('discovery_alpha_administration', 'public.alpha_actor_mappings', 'SELECT') AS administration_actor_select,
        has_table_privilege('discovery_alpha_administration', 'public.alpha_actor_mappings', 'INSERT') AS administration_actor_insert,
        has_table_privilege('discovery_alpha_administration', 'public.alpha_actor_mappings', 'UPDATE') AS administration_actor_update
    `;
    for (const [name, value] of Object.entries(grants)) {
      if (!value) missing.push(`grant:${name}`);
    }
  }
  return {
    complete: missing.length === 0,
    anyPresent: [...found].some((item) => !item.startsWith("role:")),
    missing,
  };
}

export async function inspectGovernanceMigrationState(
  sql: Sql,
  migrationsFolder = canonicalGovernanceMigrationsFolder,
): Promise<GovernanceMigrationState> {
  try {
    const expected = readMigrationFiles({ migrationsFolder });
    const [{ journal }] = await sql<{ journal: string | null }[]>`
      SELECT to_regclass(${`${JOURNAL_SCHEMA}.${JOURNAL_TABLE}`})::text AS journal
    `;
    const schema = await schemaEvidence(sql);
    if (!journal) {
      return {
        status: schema.anyPresent ? "PARTIAL" : "EMPTY",
        expectedMigrations: expected.length,
        appliedMigrations: 0,
        journalPresent: false,
        schemaComplete: schema.complete,
        missingSchemaObjects: schema.missing,
        reason: schema.anyPresent
          ? "Governance objects exist without the database migration journal."
          : "Database migration journal and governance schema are absent.",
      };
    }

    const applied = await sql<{
      id: number;
      hash: string;
      created_at: string;
    }[]>`
      SELECT id, hash, created_at::text
      FROM drizzle.__drizzle_migrations
      ORDER BY created_at, id
    `;
    const journalMatches =
      applied.length <= expected.length &&
      applied.every((row, index) =>
        row.hash === expected[index]?.hash &&
        Number(row.created_at) === expected[index]?.folderMillis
      );
    if (!journalMatches || applied.length > expected.length) {
      return {
        status: "DRIFTED",
        expectedMigrations: expected.length,
        appliedMigrations: applied.length,
        journalPresent: true,
        schemaComplete: schema.complete,
        missingSchemaObjects: schema.missing,
        reason: "Database migration history does not match committed migration identity or digest.",
      };
    }
    if (applied.length < expected.length) {
      const predecessorIsValid = applied.length === expected.length - 1 &&
        schema.missing.length === actorSchemaObjects.size &&
        schema.missing.every((item) => actorSchemaObjects.has(item));
      return {
        status: predecessorIsValid ? "PENDING" : "PARTIAL",
        expectedMigrations: expected.length,
        appliedMigrations: applied.length,
        journalPresent: true,
        schemaComplete: false,
        missingSchemaObjects: schema.missing,
        reason: predecessorIsValid
          ? "Valid predecessor schema; persistence-safe actor migration remains pending."
          : "Migration journal and predecessor schema are inconsistent.",
      };
    }
    if (!schema.complete && (applied.length > 0 || schema.anyPresent)) {
      return {
        status: "PARTIAL",
        expectedMigrations: expected.length,
        appliedMigrations: applied.length,
        journalPresent: true,
        schemaComplete: false,
        missingSchemaObjects: schema.missing,
        reason: "Journal and expected governance schema are inconsistent.",
      };
    }
    return {
      status: "CURRENT",
      expectedMigrations: expected.length,
      appliedMigrations: applied.length,
      journalPresent: true,
      schemaComplete: true,
      missingSchemaObjects: [],
      reason: "Database journal and governance schema match committed migrations.",
    };
  } catch {
    return {
      status: "UNKNOWN",
      expectedMigrations: 0,
      appliedMigrations: 0,
      journalPresent: false,
      schemaComplete: false,
      missingSchemaObjects: [],
      reason: "Migration state could not be determined safely.",
    };
  }
}

export async function applyGovernanceMigrations(
  sql: Sql,
  migrationsFolder = canonicalGovernanceMigrationsFolder,
): Promise<GovernanceMigrationState> {
  await sql`SELECT pg_advisory_lock(hashtextextended(${LOCK_NAME}, 0))`;
  try {
    const before = await inspectGovernanceMigrationState(sql, migrationsFolder);
    assert.ok(
      before.status === "EMPTY" ||
        before.status === "PENDING" ||
        before.status === "CURRENT",
      `Migration refused from ${before.status} state: ${before.reason}`,
    );
    if (before.status !== "CURRENT") {
      await migrate(drizzle(sql), { migrationsFolder });
    }
    const after = await inspectGovernanceMigrationState(sql, migrationsFolder);
    assert.equal(
      after.status,
      "CURRENT",
      `Migration did not produce CURRENT state: ${after.reason}`,
    );
    return after;
  } finally {
    await sql`SELECT pg_advisory_unlock(hashtextextended(${LOCK_NAME}, 0))`;
  }
}
