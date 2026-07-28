import { createHash } from "node:crypto";
import { unlink } from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { getRuntimeOrganizationsDirectory } from "../../engine/v3/runtime/runtimeStorageLocation";
import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";
import { isOnboardingTestOrganizationId } from "../../lib/onboarding/testing";

type Arguments = {
  apply: boolean;
  email: string;
  organizationId?: string;
};

type ClerkUser = {
  id: string;
  email_addresses?: Array<{ email_address?: string }>;
};

function parseArguments(argv: string[]): Arguments {
  let apply = false;
  let email = "";
  let organizationId: string | undefined;
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === "--apply") apply = true;
    else if (argument === "--email") email = argv[++index] ?? "";
    else if (argument === "--organization") organizationId = argv[++index];
    else throw new Error(`Unknown reset argument: ${argument}`);
  }
  email = email.trim().toLowerCase();
  if (!email || !email.includes("@")) {
    throw new Error("Reset requires an exact --email address.");
  }
  if (organizationId && !isOnboardingTestOrganizationId(organizationId)) {
    throw new Error("--organization must be an onboarding-owned organization id.");
  }
  return { apply, email, ...(organizationId ? { organizationId } : {}) };
}

async function resolveExactClerkUser(email: string): Promise<ClerkUser> {
  const response = await fetch(
    `https://api.clerk.com/v1/users?email_address=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}` } },
  );
  if (!response.ok) {
    throw new Error(`Clerk development user lookup failed (${response.status}).`);
  }
  const candidates = (await response.json()) as ClerkUser[];
  const exact = candidates.filter((user) =>
    user.email_addresses?.some(
      (address) => address.email_address?.trim().toLowerCase() === email,
    ),
  );
  if (exact.length !== 1) {
    throw new Error(`Expected exactly one Clerk development user; found ${exact.length}.`);
  }
  return exact[0];
}

function resetKey(accessRecordId: string): string {
  return `onboarding-test-reset:${createHash("sha256")
    .update(accessRecordId)
    .digest("hex")}`;
}

async function main(): Promise<void> {
  const configuration = validateOnboardingTestEnvironment();
  if (
    configuration.environment !== "development" ||
    configuration.runtimeStorage !== "filesystem"
  ) {
    throw new Error("Reset is limited to the local development onboarding environment.");
  }
  const args = parseArguments(process.argv.slice(2));
  const user = await resolveExactClerkUser(args.email);
  const sql = postgres(requireDiscoveryDatabaseUrl("administration"), { max: 1 });
  try {
    const repository = new PostgresAlphaAccessRecordRepository(sql);
    const records = await repository.findAccessRecordsForConsumer({
      consumerId: user.id,
      experience: "organization",
      resolvedAt: new Date().toISOString(),
    });
    const owned = records.filter(
      (record) =>
        isOnboardingTestOrganizationId(record.organizationId) &&
        (!args.organizationId || record.organizationId === args.organizationId),
    );
    if (args.organizationId && owned.length === 0) {
      throw new Error("No exact onboarding access record matched the request.");
    }

    const organizationIds = [...new Set(owned.map((record) => record.organizationId))]
      .sort((left, right) => left.localeCompare(right, "en"));
    const plans = await Promise.all(organizationIds.map(async (organizationId) => {
      const otherConsumers = await sql<{ consumer_id: string }[]>`
        SELECT DISTINCT consumer_id
        FROM alpha_access_records
        WHERE organization_id = ${organizationId}
          AND consumer_id <> ${user.id}
      `;
      return {
        activeAccessRecordIds: owned
          .filter((record) =>
            record.organizationId === organizationId && record.status === "active"
          )
          .map((record) => record.accessRecordId)
          .sort((left, right) => left.localeCompare(right, "en")),
        organizationId,
        runtimeEligible: otherConsumers.length === 0,
      };
    }));

    console.log(JSON.stringify({
      mode: args.apply ? "apply" : "dry-run",
      environment: configuration.environment,
      clerkUserId: user.id,
      email: args.email,
      clerkIdentityPreserved: true,
      auditHistoryPreserved: true,
      actions: plans.map((plan) => ({
        revokeAccessRecords: plan.activeAccessRecordIds,
        organizationId: plan.organizationId,
        runtime: plan.runtimeEligible ? "delete exact file" : "preserve (shared)",
      })),
    }, null, 2));
    if (!args.apply) return;

    const runtimeDirectory = getRuntimeOrganizationsDirectory();
    for (const plan of plans) {
      for (const accessRecordId of plan.activeAccessRecordIds) {
        await repository.revokeAccess({
          accessRecordId,
          actor: `onboarding-test-reset:${user.id}`,
          reasonCode: "non-production-onboarding-test-reset",
          idempotencyKey: resetKey(accessRecordId),
          revokedAt: new Date().toISOString(),
        });
      }
      if (plan.runtimeEligible) {
        const runtimePath = path.join(runtimeDirectory, `${plan.organizationId}.json`);
        if (
          path.resolve(path.dirname(runtimePath)) !== path.resolve(runtimeDirectory) ||
          path.basename(runtimePath) !== `${plan.organizationId}.json`
        ) {
          throw new Error("Refusing unsafe Runtime reset path.");
        }
        try {
          await unlink(runtimePath);
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
        }
      }
    }
  } finally {
    await sql.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
