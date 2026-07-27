import assert from "node:assert/strict";
import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";

async function main(): Promise<void> {
  const migration = postgres(requireDiscoveryDatabaseUrl("migration"), { max: 1 });
  const application = postgres(requireDiscoveryDatabaseUrl("application"), { max: 2 });
  try {
  const [{ version }] = await migration<{ version: number }[]>`
    SELECT current_setting('server_version_num')::int AS version
  `;
  assert.ok(version >= 170000, "Hosted PostgreSQL must be version 17 or newer");
  const [schema] = await migration<{
    access: string | null;
    audit: string | null;
    trigger_count: number;
  }[]>`
    SELECT to_regclass('public.alpha_access_records')::text AS access,
      to_regclass('public.alpha_disclosure_audit_events')::text AS audit,
      (SELECT count(*)::int FROM pg_trigger
       WHERE tgname IN (
         'alpha_access_terminal_transition',
         'alpha_lifecycle_append_only',
         'alpha_audit_append_only'
       )) AS trigger_count
  `;
  assert.equal(schema.access, "alpha_access_records");
  assert.equal(schema.audit, "alpha_disclosure_audit_events");
  assert.equal(schema.trigger_count, 3);
  const [{ ok }] = await application<{ ok: number }[]>`SELECT 1 AS ok`;
  assert.equal(ok, 1);
  console.log(JSON.stringify({
    validation: "hosted-alpha-database",
    result: "PASS",
    postgresqlMajor: Math.floor(version / 10000),
    poolConnectionsExercised: 2,
    schemaCurrent: true,
    appendOnlyTriggersPresent: true,
  }));
  } finally {
    await Promise.all([migration.end(), application.end()]);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
