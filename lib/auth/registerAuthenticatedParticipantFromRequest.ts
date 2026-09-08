import "server-only";
import postgres from "postgres";
import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { ExistingParticipantIdentityResolutionService } from "./existingParticipantIdentityResolutionCore";
import { resolveClerkStableInstanceIdentity } from "./clerkStableInstanceIdentity";
import { resolveVerifiedConsumerIdentityFromClerk } from "./resolveVerifiedConsumerIdentityFromClerk";

export async function registerAuthenticatedParticipantFromRequest(): Promise<{ status: "ready" | "unavailable" }> {
  const authenticatedIdentity = await resolveVerifiedConsumerIdentityFromClerk();
  if (authenticatedIdentity.status !== "verified") return { status: "unavailable" };
  const locatorKey = process.env.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY;
  const instance = resolveClerkStableInstanceIdentity(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if (!locatorKey || locatorKey.length < 32 || !instance) return { status: "unavailable" };
  let sql: ReturnType<typeof postgres> | undefined;
  try {
    sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
    const anchors = await sql.begin(async (tx) => {
      await tx`SET TRANSACTION READ ONLY`;
      return tx<{ count: number }[]>`SELECT count(*)::int AS count FROM participant_identity_namespace_anchors WHERE namespace = ${"clerk-participant-identity-v1-to-v2"}`;
    });
    if (anchors[0]?.count !== 1) return { status: "unavailable" };
    const result = await new ExistingParticipantIdentityResolutionService(new PostgresAlphaAccessRecordRepository(sql, undefined, locatorKey, instance)).resolve({ authenticatedIdentity });
    return result.status === "resolved" ? { status: "ready" } : { status: "unavailable" };
  } catch { return { status: "unavailable" }; }
  finally { if (sql) await sql.end({ timeout: 1 }); }
}
