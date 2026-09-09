import type { ExistingParticipantIdentityBindingRepository } from "../../db/governance/types";
import {
  ExistingParticipantIdentityResolutionService,
  type VerifiedClerkLocator,
} from "./existingParticipantIdentityResolutionCore";

export type AuthenticatedParticipantLookupStatus =
  | "ready"
  | "setup-required"
  | "unavailable";

export type ParticipantIdentityLookupRepository = ExistingParticipantIdentityBindingRepository & {
  inspectActiveParticipantIdentityNamespace(): Promise<
    { scheme: "clerk-user-v2"; anchorId: string } | undefined
  >;
};

/**
 * Classifies an already-verified request without creating or changing a
 * participant binding. Missing or conflicting identity infrastructure fails
 * closed as unavailable; only an authoritative not-found result permits setup.
 */
export async function classifyExistingAuthenticatedParticipant(
  verifiedIdentity: VerifiedClerkLocator,
  repository: ParticipantIdentityLookupRepository,
): Promise<AuthenticatedParticipantLookupStatus> {
  try {
    const namespace = await repository.inspectActiveParticipantIdentityNamespace();
    if (namespace?.scheme !== "clerk-user-v2") return "unavailable";
    const binding = await new ExistingParticipantIdentityResolutionService(
      repository,
    ).lookupExistingParticipantBinding(verifiedIdentity);
    if (binding.status === "found") return "ready";
    if (binding.status === "not-found") return "setup-required";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}
