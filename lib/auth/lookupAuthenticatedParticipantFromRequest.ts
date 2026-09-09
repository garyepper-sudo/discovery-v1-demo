import "server-only";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import {
  PostgresAlphaAccessRecordRepository,
} from "../../db/governance/postgresRepositories";
import {
  classifyExistingAuthenticatedParticipant,
  type AuthenticatedParticipantLookupStatus,
} from "./authenticatedParticipantIdentityRecognition";
import { resolveClerkStableInstanceIdentity } from "./clerkStableInstanceIdentity";
import { resolveVerifiedConsumerIdentityFromClerk } from "./resolveVerifiedConsumerIdentityFromClerk";

/** Uses the same request identity, locator key, instance, and repository owner
 * as participant registration, but exposes only a non-creating lookup status. */
export async function lookupAuthenticatedParticipantFromRequest(): Promise<
  AuthenticatedParticipantLookupStatus
> {
  const verifiedIdentity = await resolveVerifiedConsumerIdentityFromClerk();
  if (verifiedIdentity.status !== "verified") return "unavailable";

  const locatorKey = process.env.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY;
  const stableInstance = resolveClerkStableInstanceIdentity(
    process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  );
  if (!locatorKey || locatorKey.length < 32 || !stableInstance) {
    return "unavailable";
  }

  const sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  try {
    return await classifyExistingAuthenticatedParticipant(
      verifiedIdentity,
      new PostgresAlphaAccessRecordRepository(
        sql,
        undefined,
        locatorKey,
        stableInstance,
      ),
    );
  } catch {
    return "unavailable";
  } finally {
    await sql.end({ timeout: 1 });
  }
}
