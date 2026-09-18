import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
async function main(): Promise<void> {
  const [route, operation] = await Promise.all([readFile(path.join(process.cwd(), "app/api/ops/migrate-runtime-to-postgres/route.ts"), "utf8"), readFile(path.join(process.cwd(), "lib/alpha-provisioning/productionRuntimeMigrationOperation.ts"), "utf8")]);
  assert.ok(route.includes('import "server-only"') && route.includes('runtime = "nodejs"'));
  assert.ok(route.includes("timingSafeEqual") && route.includes("DISCOVERY_RUNTIME_MIGRATION_SECRET"));
  assert.ok(route.indexOf("if (!authorized(request))") < route.lastIndexOf("migrateProductionRuntimeToPostgres"));
  assert.ok(!route.includes("postgres(") && !route.includes("INSERT INTO") && !route.includes("console."));
  assert.ok(operation.includes("applyGovernanceMigrations") && operation.includes("importLegacyOrganizationRuntime"));
  assert.ok(operation.includes('before.appliedMigrations === 8') && operation.includes('before.expectedMigrations === 9'));
  assert.ok(operation.includes('before.status === "PENDING" ? await applyGovernanceMigrations(sql) : before'));
  assert.ok(operation.includes("ALREADY_COMPLETE") && operation.includes("RuntimeStorageConflictError"));
  assert.ok(!operation.includes("payload_text") && !operation.includes("console."));
  console.log("RESULT PASS production-runtime-migration-ops-route");
}
void main();
