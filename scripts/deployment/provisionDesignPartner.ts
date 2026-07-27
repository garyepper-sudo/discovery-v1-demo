import { readFile } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { createOrganizationRuntimeRepository } from "../../engine/v3/runtime";
import { provisionDesignPartner } from "../../lib/alpha-provisioning/provisionDesignPartner";

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
  const organizationId = exact("organization");
  const consumerId = exact("consumer");
  const actor = exact("actor");
  const sourcePath = path.resolve(exact("runtime-source"));
  const idempotencyKey = exact("idempotency-key");
  const allowOverwrite = args.get("allow-overwrite") === "true";
  const raw = await readFile(sourcePath);
  const sql = postgres(requireDiscoveryDatabaseUrl("administration"), { max: 1 });
  try {
    const receipt = await provisionDesignPartner({
      consumerId,
      organizationId,
      actor,
      idempotencyKey,
      expectedRuntimeSha256: exact("runtime-sha256"),
      runtimeBytes: raw,
      repository: createOrganizationRuntimeRepository(),
      accessRepository: new PostgresAlphaAccessRecordRepository(sql),
      allowOverwrite,
    });
    console.log(JSON.stringify(receipt, null, 2));
  } finally {
    await sql.end();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
