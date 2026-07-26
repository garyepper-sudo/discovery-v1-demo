import { readFile } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";

async function main(): Promise<void> {
const command = process.argv[2] ?? "up";
const migrationPath = path.join(
  process.cwd(),
  "db/migrations/0000_alpha_governance_foundation.sql",
);
const sql = postgres(requireDiscoveryDatabaseUrl("migration"), { max: 1 });

try {
  if (command === "up") {
    const migration = await readFile(migrationPath, "utf8");
    const applied = await sql<{ exists: boolean }[]>`
      SELECT to_regclass('public.alpha_access_records') IS NOT NULL AS exists
    `;
    if (!applied[0].exists) await sql.unsafe(migration);
    console.log("alpha-governance migration: current");
  } else if (command === "status") {
    const result = await sql<{ access: string | null; audit: string | null }[]>`
      SELECT to_regclass('public.alpha_access_records')::text AS access,
        to_regclass('public.alpha_disclosure_audit_events')::text AS audit
    `;
    console.log(JSON.stringify(result[0]));
  } else if (command === "reset") {
    const url = requireDiscoveryDatabaseUrl("migration");
    if (
      process.env.DISCOVERY_ALLOW_DESTRUCTIVE_LOCAL_RESET !== "true" ||
      !/localhost|127\.0\.0\.1/.test(url)
    ) {
      throw new Error("Reset requires an explicit local-only safety flag");
    }
    await sql`DROP TABLE IF EXISTS alpha_disclosure_audit_events,
      alpha_access_lifecycle_events, alpha_access_records CASCADE`;
    await sql`DROP FUNCTION IF EXISTS alpha_reject_append_only_mutation() CASCADE`;
    await sql`DROP FUNCTION IF EXISTS alpha_enforce_access_transition() CASCADE`;
    console.log("alpha-governance local schema reset");
  } else {
    throw new Error(`Unknown migration command: ${command}`);
  }
} finally {
  await sql.end();
}
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
