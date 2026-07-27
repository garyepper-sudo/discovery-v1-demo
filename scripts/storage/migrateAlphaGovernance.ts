import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import {
  applyGovernanceMigrations,
  inspectGovernanceMigrationState,
} from "./governanceMigrationContract";

async function main(): Promise<void> {
const command = process.argv[2] ?? "up";
const sql = postgres(requireDiscoveryDatabaseUrl("migration"), { max: 1 });

try {
  if (command === "up") {
    const state = await applyGovernanceMigrations(sql);
    console.log(JSON.stringify({
      migration: "alpha-governance",
      result: "CURRENT",
      appliedMigrations: state.appliedMigrations,
      credentialsPrinted: false,
    }));
  } else if (command === "status") {
    const state = await inspectGovernanceMigrationState(sql);
    console.log(JSON.stringify({
      migration: "alpha-governance",
      ...state,
      credentialsPrinted: false,
    }));
    if (state.status === "DRIFTED" ||
        state.status === "PARTIAL" ||
        state.status === "UNKNOWN") {
      process.exitCode = 1;
    }
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
    await sql`DROP SCHEMA IF EXISTS drizzle CASCADE`;
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
