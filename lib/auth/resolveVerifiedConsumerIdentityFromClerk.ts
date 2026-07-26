import "server-only";

import { auth } from "@clerk/nextjs/server";

import {
  normalizeClerkVerifiedConsumerIdentity,
  type ClerkVerifiedConsumerIdentityResolution,
} from "../../engine/v3/governance/clerkVerifiedConsumerIdentity";

export async function resolveVerifiedConsumerIdentityFromClerk(
  verifiedAt = new Date().toISOString(),
): Promise<ClerkVerifiedConsumerIdentityResolution> {
  try {
    const authState = await auth();
    return normalizeClerkVerifiedConsumerIdentity({
      auth: {
        isAuthenticated: authState.userId !== null,
        userId: authState.userId,
        sessionId: authState.sessionId,
      },
      verifiedAt,
    });
  } catch {
    return {
      status: "denied",
      reason: "clerk-server-verification-unavailable",
    };
  }
}
