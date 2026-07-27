import { readFile } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { createOrganizationRuntimeRepository } from "../../engine/v3/runtime";
import {
  provisionAlphaAccess,
  provisionOrganizationRuntime,
} from "../../lib/alpha-provisioning/provisionDesignPartner";

const args = new Map<string, string>();
for (let index = 2; index < process.argv.length; index += 2) {
  const name = process.argv[index];
  const value = process.argv[index + 1];
  if (!name?.startsWith("--") || !value) throw new Error("Arguments require --name value");
  args.set(name.slice(2), value);
}

function exact(name: string): string {
  const value = args.get(name);
  if (!value || value === "*" || value.trim() !== value) {
    throw new Error(`Required exact --${name} is missing`);
  }
  return value;
}

async function main(): Promise<void> {
  const operation = exact("operation");
  const organizationId = exact("organization");
  const actor = exact("actor");
  const idempotencyKey = exact("idempotency-key");
  const repository = createOrganizationRuntimeRepository();
  if (operation === "runtime") {
    const sourcePath = path.resolve(exact("runtime-source"));
    const raw = await readFile(sourcePath);
    console.log(JSON.stringify(await provisionOrganizationRuntime({
      organizationId,
      actor,
      idempotencyKey,
      expectedRuntimeSha256: exact("runtime-sha256"),
      runtimeBytes: raw,
      repository,
      allowOverwrite: args.get("allow-overwrite") === "true",
    }), null, 2));
    return;
  }
  if (operation !== "access") {
    throw new Error("Operation must be runtime or access");
  }
  const sql = postgres(requireDiscoveryDatabaseUrl("administration"), { max: 1 });
  try {
    console.log(JSON.stringify(await provisionAlphaAccess({
      organizationId,
      consumerId: exact("consumer"),
      actor,
      idempotencyKey,
      repository,
      accessRepository: new PostgresAlphaAccessRecordRepository(sql),
    }), null, 2));
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
