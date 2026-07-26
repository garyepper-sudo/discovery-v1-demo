import { createHash } from "node:crypto";
import { createInterface } from "node:readline/promises";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";

async function main(): Promise<void> {
const [operation = "", ...rawArguments] = process.argv.slice(2);
const argumentsByName = new Map<string, string>();
for (let index = 0; index < rawArguments.length; index += 1) {
  const argument = rawArguments[index];
  if (!argument.startsWith("--")) continue;
  if (argument === "--confirm" || argument === "--dry-run") {
    argumentsByName.set(argument.slice(2), "true");
  } else {
    argumentsByName.set(argument.slice(2), rawArguments[index + 1] ?? "");
    index += 1;
  }
}

function required(name: string): string {
  const value = argumentsByName.get(name);
  if (!value || value === "*" || value.trim() !== value) {
    throw new Error(`Required exact --${name} is missing or invalid`);
  }
  return value;
}

function deterministicId(prefix: string, idempotencyKey: string): string {
  return `${prefix}:${createHash("sha256").update(idempotencyKey).digest("hex")}`;
}

const mutation = ["grant", "revoke", "supersede"].includes(operation);
const preview = {
  operation,
  actor: argumentsByName.get("actor") ?? "(required for mutation)",
  consumer: argumentsByName.get("consumer") ?? "(not supplied)",
  organization: argumentsByName.get("organization") ?? "(not supplied)",
  experience: argumentsByName.get("experience") ?? "organization",
  reason: argumentsByName.get("reason") ?? "(required for mutation)",
  idempotencyKey: argumentsByName.get("idempotency-key") ?? "(required for mutation)",
  accessRecordId: argumentsByName.get("access-record-id") ?? "(generated for grant)",
  successorAccessRecordId:
    argumentsByName.get("successor-access-record-id") ?? "(generated for supersede)",
  expiresAt: argumentsByName.get("expires-at") ?? null,
};
console.log(JSON.stringify(preview, null, 2));

if (argumentsByName.has("dry-run")) process.exit(0);
if (mutation && !argumentsByName.has("confirm")) {
  if (!process.stdin.isTTY) throw new Error("Mutation requires --confirm");
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const response = await prompt.question("Type YES to apply this exact change: ");
  prompt.close();
  if (response !== "YES") process.exit(2);
}

const sql = postgres(requireDiscoveryDatabaseUrl("administration"), { max: 1 });
const repository = new PostgresAlphaAccessRecordRepository(sql);
try {
  if (operation === "inspect") {
    const records = await repository.findAccessRecords({
      consumerId: required("consumer"),
      organizationId: required("organization"),
      experience: "organization",
      resolvedAt: argumentsByName.get("resolved-at") ?? new Date().toISOString(),
    });
    console.log(JSON.stringify(records, null, 2));
  } else if (operation === "grant") {
    const key = required("idempotency-key");
    console.log(
      JSON.stringify(
        await repository.grantAccess({
          accessRecordId:
            argumentsByName.get("access-record-id") ??
            deterministicId("alpha-access", key),
          consumerId: required("consumer"),
          organizationId: required("organization"),
          experience: "organization",
          actor: required("actor"),
          reasonCode: required("reason"),
          idempotencyKey: key,
          grantedAt: argumentsByName.get("at") ?? new Date().toISOString(),
          ...(argumentsByName.get("expires-at")
            ? { expiresAt: argumentsByName.get("expires-at") }
            : {}),
        }),
        null,
        2,
      ),
    );
  } else if (operation === "revoke") {
    console.log(
      JSON.stringify(
        await repository.revokeAccess({
          accessRecordId: required("access-record-id"),
          actor: required("actor"),
          reasonCode: required("reason"),
          idempotencyKey: required("idempotency-key"),
          revokedAt: argumentsByName.get("at") ?? new Date().toISOString(),
        }),
        null,
        2,
      ),
    );
  } else if (operation === "supersede") {
    const key = required("idempotency-key");
    console.log(
      JSON.stringify(
        await repository.supersedeAccess({
          previousAccessRecordId: required("access-record-id"),
          nextAccessRecordId:
            argumentsByName.get("successor-access-record-id") ??
            deterministicId("alpha-access", key),
          actor: required("actor"),
          reasonCode: required("reason"),
          idempotencyKey: key,
          supersededAt: argumentsByName.get("at") ?? new Date().toISOString(),
          ...(argumentsByName.get("expires-at")
            ? { expiresAt: argumentsByName.get("expires-at") }
            : {}),
        }),
        null,
        2,
      ),
    );
  } else {
    throw new Error("Operation must be inspect, grant, revoke, or supersede");
  }
} finally {
  await sql.end();
}
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
