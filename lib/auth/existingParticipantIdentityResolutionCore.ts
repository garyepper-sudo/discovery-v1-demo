import type { ExistingParticipantIdentityBindingRepository, ExistingParticipantIdentityLookup } from "../../db/governance/types";
import type { ClerkVerifiedConsumerIdentityResolution } from "../../engine/v3/governance/clerkVerifiedConsumerIdentity";

export type VerifiedClerkLocator = Extract<ClerkVerifiedConsumerIdentityResolution, { status: "verified" }>;

export type ExistingParticipantIdentityResolution =
  | { status: "resolved"; participantRef: string }
  | { status: "unavailable" };

const unavailable = (): ExistingParticipantIdentityResolution => ({ status: "unavailable" });
const exact = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.trim() === value && value !== "*" && !value.includes("\0");

function parseVerifiedIdentity(value: unknown): { provider: "clerk"; providerSubject: string; verifiedAt: string } | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  if (Object.keys(record).length !== 2 || record.status !== "verified" || !record.identity || typeof record.identity !== "object" || Array.isArray(record.identity)) return null;
  const identity = record.identity as Record<string, unknown>;
  if (Object.keys(identity).length !== 4 || identity.provider !== "clerk" || !exact(identity.consumerId) || !exact(identity.verificationId) || typeof identity.verifiedAt !== "string" || !Number.isFinite(Date.parse(identity.verifiedAt))) return null;
  return { provider: "clerk", providerSubject: identity.consumerId, verifiedAt: identity.verifiedAt };
}

export class ExistingParticipantIdentityResolutionService {
  constructor(private readonly participantBindings: ExistingParticipantIdentityBindingRepository) {}

  async resolve(input: unknown): Promise<ExistingParticipantIdentityResolution> {
    if (!input || typeof input !== "object" || Array.isArray(input) || Object.keys(input as Record<string, unknown>).length !== 1 || !("authenticatedIdentity" in input)) return unavailable();
    const identity = parseVerifiedIdentity((input as { authenticatedIdentity: ClerkVerifiedConsumerIdentityResolution }).authenticatedIdentity);
    if (!identity) return unavailable();
    try {
      const binding = await this.participantBindings.resolveOrBindExistingParticipantIdentity({
        provider: identity.provider,
        providerSubject: identity.providerSubject,
        resolvedAt: identity.verifiedAt,
      });
      return { status: "resolved", participantRef: binding.participantRef };
    } catch {
      return unavailable();
    }
  }

  async lookupExistingParticipantBinding(verifiedLocator: VerifiedClerkLocator): Promise<ExistingParticipantIdentityLookup | { status: "unavailable" }> {
    if (
      !verifiedLocator ||
      typeof verifiedLocator !== "object" ||
      verifiedLocator.status !== "verified" ||
      !verifiedLocator.identity ||
      typeof verifiedLocator.identity !== "object" ||
      Array.isArray(verifiedLocator.identity)
    ) return unavailable();
    const identity = parseVerifiedIdentity(verifiedLocator);
    if (!identity) return unavailable();
    try {
      const binding = await this.participantBindings.findExistingParticipantIdentityBinding({
        provider: identity.provider,
        providerSubject: identity.providerSubject,
      });
      return binding ? { status: "found", participantRef: binding.participantRef } : { status: "not-found" };
    } catch {
      return unavailable();
    }
  }
}
