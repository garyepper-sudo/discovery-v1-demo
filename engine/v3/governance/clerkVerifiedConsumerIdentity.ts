import type {
  AlphaAccessRecordReader,
  AlphaAllowlistDisclosureShadowResult,
  AlphaRuntimeCompositionLoader,
  VerifiedConsumerIdentity,
} from "./alphaAllowlistDisclosureProducer";
import { runAlphaAllowlistDisclosureShadow } from "./alphaAllowlistDisclosureProducer";

export type ClerkServerAuthSnapshot = {
  isAuthenticated: boolean;
  userId: string | null;
  sessionId: string | null;
};

export type ClerkIdentityFailureReason =
  | "clerk-authentication-required"
  | "clerk-consumer-id-missing"
  | "clerk-verification-id-missing"
  | "clerk-server-verification-unavailable";

export type ClerkVerifiedConsumerIdentityResolution =
  | {
      status: "verified";
      identity: VerifiedConsumerIdentity;
    }
  | {
      status: "denied";
      reason: ClerkIdentityFailureReason;
    };

export type ClerkIdentityAlphaDisclosureShadowResult = {
  identityResolution: ClerkVerifiedConsumerIdentityResolution;
  disclosureShadow?: AlphaAllowlistDisclosureShadowResult;
};

function isNonemptyIdentifier(value: string | null): value is string {
  return Boolean(
    value &&
      value.trim() === value &&
      value !== "*" &&
      !value.includes("\0"),
  );
}

export function normalizeClerkVerifiedConsumerIdentity(input: {
  auth: ClerkServerAuthSnapshot;
  verifiedAt: string;
}): ClerkVerifiedConsumerIdentityResolution {
  if (!input.auth.isAuthenticated) {
    return {
      status: "denied",
      reason: "clerk-authentication-required",
    };
  }
  if (!isNonemptyIdentifier(input.auth.userId)) {
    return {
      status: "denied",
      reason: "clerk-consumer-id-missing",
    };
  }
  if (!isNonemptyIdentifier(input.auth.sessionId)) {
    return {
      status: "denied",
      reason: "clerk-verification-id-missing",
    };
  }

  return {
    status: "verified",
    identity: {
      consumerId: input.auth.userId,
      provider: "clerk",
      verificationId: input.auth.sessionId,
      verifiedAt: input.verifiedAt,
    },
  };
}

export async function runClerkIdentityAlphaDisclosureShadow(
  input: {
    organizationId: string;
    experience: string;
    resolvedAt: string;
  },
  dependencies: {
    resolveIdentity: () => Promise<ClerkVerifiedConsumerIdentityResolution>;
    accessReader: AlphaAccessRecordReader;
    runtimeLoader: AlphaRuntimeCompositionLoader;
  },
): Promise<ClerkIdentityAlphaDisclosureShadowResult> {
  let identityResolution: ClerkVerifiedConsumerIdentityResolution;
  try {
    identityResolution = await dependencies.resolveIdentity();
  } catch {
    identityResolution = {
      status: "denied",
      reason: "clerk-server-verification-unavailable",
    };
  }

  if (identityResolution.status !== "verified") {
    return { identityResolution };
  }

  return {
    identityResolution,
    disclosureShadow: runAlphaAllowlistDisclosureShadow(
      {
        identity: identityResolution.identity,
        organizationId: input.organizationId,
        experience: input.experience,
        resolvedAt: input.resolvedAt,
      },
      {
        accessReader: dependencies.accessReader,
        runtimeLoader: dependencies.runtimeLoader,
      },
    ),
  };
}
