import { createHash } from "node:crypto";
import postgres from "postgres";
import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { nextSandboxLifecycleTime, resolveSandboxAccessHead, resolveSandboxPersonas, safeAssignment, SANDBOX_ORGANIZATION_ID, type SandboxPersonaKey } from "../../lib/access/sandboxMultiUserAccess";

type Action = "provision" | "inspect" | "revoke" | "restore" | "reset";
function parse(argv: string[]) {
  const action = argv.shift() as Action;
  if (!["provision", "inspect", "revoke", "restore", "reset"].includes(action)) throw new Error("Expected provision, inspect, revoke, restore, or reset.");
  const values: Record<string, string> = {};
  const allowedOptions = new Set(["organization-id", "persona", "ceo-user-id", "director-user-id", "manager-user-id"]);
  while (argv.length) {
    const key = argv.shift()!;
    const value = argv.shift();
    const name = key.startsWith("--") ? key.slice(2) : "";
    if (!allowedOptions.has(name) || !value || values[name]) throw new Error("Every option must be known, unique, and have one exact value.");
    values[name] = value;
  }
  if (values["organization-id"] !== SANDBOX_ORGANIZATION_ID) throw new Error("Exact sandbox organization is required.");
  const persona = values.persona as SandboxPersonaKey | undefined;
  if ((action === "revoke" || action === "restore") && !["sandbox-ceo", "sandbox-director", "sandbox-manager"].includes(persona ?? "")) throw new Error("Exact sandbox persona is required.");
  return { action, persona, values };
}
const id = (kind: string, value: string) => `sandbox-${kind}:${createHash("sha256").update(value).digest("hex")}`;

async function main() {
  const args = parse(process.argv.slice(2));
  const personas = resolveSandboxPersonas({
    ...process.env,
    ...(args.values["ceo-user-id"] ? { DISCOVERY_SANDBOX_CEO_USER_ID: args.values["ceo-user-id"] } : {}),
    ...(args.values["director-user-id"] ? { DISCOVERY_SANDBOX_DIRECTOR_USER_ID: args.values["director-user-id"] } : {}),
    ...(args.values["manager-user-id"] ? { DISCOVERY_SANDBOX_MANAGER_USER_ID: args.values["manager-user-id"] } : {}),
  });
  const sql = postgres(requireDiscoveryDatabaseUrl("administration"), { max: 1 });
  const repository = new PostgresAlphaAccessRecordRepository(sql);
  try {
    const summaries = [];
    for (const persona of personas) {
      let records = await repository.findAccessRecords({ consumerId: persona.userId, organizationId: SANDBOX_ORGANIZATION_ID, experience: "organization", resolvedAt: new Date().toISOString() });
      let current = resolveSandboxAccessHead(records);
      const targeted = !args.persona || args.persona === persona.key;
      if (targeted && (args.action === "provision" || args.action === "reset")) {
        if (!current) await repository.grantAccess({ accessRecordId: id("access", persona.userId), consumerId: persona.userId, organizationId: SANDBOX_ORGANIZATION_ID, experience: "organization", actor: "development-sandbox-operator", reasonCode: "multi-user-sandbox-baseline", idempotencyKey: id("provision", persona.userId), grantedAt: "2026-08-04T12:00:00.000Z" });
        else if (current.status === "revoked") await repository.restoreAccess({ previousAccessRecordId: current.accessRecordId, nextAccessRecordId: id("restore", current.accessRecordId), actor: "development-sandbox-operator", reasonCode: "multi-user-sandbox-restore", idempotencyKey: id("restore-request", current.accessRecordId), restoredAt: nextSandboxLifecycleTime(current.createdAt) });
      } else if (targeted && args.action === "revoke") {
        if (!current || current.status !== "active") throw new Error("Exact active assignment not found.");
        await repository.revokeAccess({ accessRecordId: current.accessRecordId, actor: "development-sandbox-operator", reasonCode: "multi-user-sandbox-revoke", idempotencyKey: id("revoke", current.accessRecordId), revokedAt: nextSandboxLifecycleTime(current.createdAt) });
      } else if (targeted && args.action === "restore") {
        if (!current || current.status !== "revoked") throw new Error("Exact revoked assignment not found.");
        await repository.restoreAccess({ previousAccessRecordId: current.accessRecordId, nextAccessRecordId: id("restore", current.accessRecordId), actor: "development-sandbox-operator", reasonCode: "multi-user-sandbox-restore", idempotencyKey: id("restore-request", current.accessRecordId), restoredAt: nextSandboxLifecycleTime(current.createdAt) });
      }
      records = await repository.findAccessRecords({ consumerId: persona.userId, organizationId: SANDBOX_ORGANIZATION_ID, experience: "organization", resolvedAt: new Date().toISOString() });
      summaries.push(safeAssignment(persona, records));
    }
    console.log(JSON.stringify({ action: args.action, organizationId: SANDBOX_ORGANIZATION_ID, assignments: summaries }, null, 2));
  } finally { await sql.end(); }
}
main().catch((error) => { console.error(error instanceof Error ? error.message : "Sandbox access operation failed."); process.exitCode = 1; });
