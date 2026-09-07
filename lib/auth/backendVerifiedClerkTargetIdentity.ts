import "server-only";

import type { ExistingParticipantIdentityBindingRepository } from "../../db/governance/types";
import { resolveClerkStableInstanceIdentity } from "./clerkStableInstanceIdentity";

/**
 * Server-produced proof for a target supplied to an internal operation.  This
 * is not an authenticated principal or session locator and carries no authority.
 */
export type BackendVerifiedClerkTargetIdentity = {
  kind: "backend-verified-clerk-target-identity-v1";
  provider: "clerk";
  providerSubject: string;
  instanceDiscriminator: string;
};

/** Small injectable seam; production uses Clerk's official server client. */
export type ClerkTargetBackend = { getUser(userId: string): Promise<unknown> };

export class ClerkTargetNotFoundError extends Error {
  readonly code = "clerk-target-not-found";
}

export type BackendVerifiedClerkTargetIdentityResolution =
  | { status: "found"; participantRef: string; identity: BackendVerifiedClerkTargetIdentity }
  | { status: "unbound"; identity: BackendVerifiedClerkTargetIdentity }
  | { status: "not-found" }
  | { status: "unavailable" };

export type BackendVerifiedClerkTargetConfiguration = {
  secretKey: unknown;
  publishableKey: unknown;
};

const exact = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0 && value.trim() === value && value !== "*" && !value.includes("\0");
const clerkUserId = (value: unknown): value is string => exact(value) && /^user_[A-Za-z0-9]+$/.test(value);

function configuredInstance(configuration: BackendVerifiedClerkTargetConfiguration): string | undefined {
  if (!exact(configuration.secretKey) || !/^sk_(?:test|live)_[A-Za-z0-9_-]+$/.test(configuration.secretKey)) return undefined;
  return resolveClerkStableInstanceIdentity(configuration.publishableKey);
}

function isTypedNotFound(error: unknown): boolean {
  return error instanceof ClerkTargetNotFoundError ||
    (Boolean(error) && typeof error === "object" && (error as { code?: unknown }).code === "clerk-target-not-found");
}

export async function verifyBackendClerkTargetIdentity(input: {
  clerkUserId: unknown;
  configuration: BackendVerifiedClerkTargetConfiguration;
  backend: ClerkTargetBackend;
}): Promise<{ status: "verified"; identity: BackendVerifiedClerkTargetIdentity } | { status: "not-found" } | { status: "unavailable" }> {
  const instanceDiscriminator = configuredInstance(input.configuration);
  if (!clerkUserId(input.clerkUserId) || !instanceDiscriminator || !input.backend || typeof input.backend.getUser !== "function") return { status: "unavailable" };
  try {
    const user = await input.backend.getUser(input.clerkUserId);
    if (!user || typeof user !== "object" || Array.isArray(user) || !clerkUserId((user as { id?: unknown }).id) || (user as { id: string }).id !== input.clerkUserId) return { status: "unavailable" };
    return { status: "verified", identity: { kind: "backend-verified-clerk-target-identity-v1", provider: "clerk", providerSubject: input.clerkUserId, instanceDiscriminator } };
  } catch (error) {
    return isTypedNotFound(error) ? { status: "not-found" } : { status: "unavailable" };
  }
}

/**
 * Backend lookup only: the repository owns V1 compatibility, V2 stable
 * subject+instance selection, and anchor-integrity failure.  No bind, grant,
 * access, or principal operation is available here.
 */
export async function resolveBackendVerifiedClerkTargetIdentity(input: {
  clerkUserId: unknown;
  configuration: BackendVerifiedClerkTargetConfiguration;
  backend: ClerkTargetBackend;
  participantBindings: Pick<ExistingParticipantIdentityBindingRepository, "findExistingParticipantIdentityBinding">;
  /** The same resolved instance passed to the existing V2 repository owner. */
  participantBindingInstance: unknown;
}): Promise<BackendVerifiedClerkTargetIdentityResolution> {
  const verified = await verifyBackendClerkTargetIdentity(input);
  if (verified.status !== "verified") return verified;
  if (!exact(input.participantBindingInstance) || input.participantBindingInstance !== verified.identity.instanceDiscriminator) return { status: "unavailable" };
  try {
    const binding = await input.participantBindings.findExistingParticipantIdentityBinding({ provider: "clerk", providerSubject: verified.identity.providerSubject });
    return binding ? { status: "found", participantRef: binding.participantRef, identity: verified.identity } : { status: "unbound", identity: verified.identity };
  } catch {
    return { status: "unavailable" };
  }
}

export async function resolveBackendVerifiedClerkTargetIdentityFromEnvironment(
  input: { clerkUserId: unknown; participantBindings: Pick<ExistingParticipantIdentityBindingRepository, "findExistingParticipantIdentityBinding">; participantBindingInstance: unknown },
  backend?: ClerkTargetBackend,
): Promise<BackendVerifiedClerkTargetIdentityResolution> {
  let configuredBackend = backend;
  try {
    if (!configuredBackend) {
      const { clerkClient } = await import("@clerk/nextjs/server");
      configuredBackend = { getUser: async (userId) => (await clerkClient()).users.getUser(userId) };
    }
  } catch {
    return { status: "unavailable" };
  }
  return resolveBackendVerifiedClerkTargetIdentity({
    clerkUserId: input.clerkUserId,
    configuration: { secretKey: process.env.CLERK_SECRET_KEY, publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY },
    backend: configuredBackend,
    participantBindings: input.participantBindings,
    participantBindingInstance: input.participantBindingInstance,
  });
}
