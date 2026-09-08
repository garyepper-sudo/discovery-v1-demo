import "server-only";

import type { ParticipantReferenceAccessRepository, ParticipantReferenceGrant, ParticipantReferencePolicy } from "./participantReferenceAccess";

export type ParticipantReferenceOrganizationSourceDecision = "legacy-confirmed" | "allowed" | "denied" | "unavailable";
export type SourceOwnership = { organizationId: string; sourceContentVersionId: string; authentic: boolean };
export type ServerParticipantResolution = () => Promise<{ status: "resolved"; participantRef: string } | { status: "denied" | "unavailable" }>;
const exact = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.trim() === value && !value.includes("\0");
const soleActive = (grants: readonly ParticipantReferenceGrant[]) => grants.filter((grant) => grant.status === "active").length === 1;
const validPolicy = (policy: ParticipantReferencePolicy) => policy.mode === "participant-reference-v1" && exact(policy.organizationId) && exact(policy.operationId);

/** Current access is intentionally resolved before the caller is allowed to
 * inspect source ownership or a cached/content body. */
export class ParticipantReferenceOrganizationSourceCurrentAccess {
  constructor(private readonly repository: ParticipantReferenceAccessRepository, private readonly resolveServerParticipant: ServerParticipantResolution) {}
  async authorizeOrganization(organizationId: string): Promise<ParticipantReferenceOrganizationSourceDecision> {
    if (!exact(organizationId)) return "denied";
    let policy: ParticipantReferencePolicy | undefined;
    try { policy = await this.repository.findPolicy(organizationId); } catch { return "unavailable"; }
    if (!policy) return "legacy-confirmed";
    if (!validPolicy(policy) || policy.organizationId !== organizationId) return "unavailable";
    let participant: Awaited<ReturnType<ServerParticipantResolution>>;
    try { participant = await this.resolveServerParticipant(); } catch { return "unavailable"; }
    if (participant.status === "unavailable") return "unavailable";
    if (participant.status !== "resolved" || !exact(participant.participantRef)) return "denied";
    try { return soleActive(await this.repository.findGrants({ organizationId, participantRef: participant.participantRef, scope: "organization" })) ? "allowed" : "denied"; } catch { return "unavailable"; }
  }
  async authorizeSource(input: { organizationId: string; sourceContentVersionId: string; resolveOwnership(): Promise<SourceOwnership | null> }): Promise<ParticipantReferenceOrganizationSourceDecision> {
    if (!exact(input.organizationId) || !exact(input.sourceContentVersionId)) return "denied";
    const decision = await this.authorizeOrganization(input.organizationId);
    if (decision !== "allowed") return decision;
    let ownership: SourceOwnership | null;
    try { ownership = await input.resolveOwnership(); } catch { return "unavailable"; }
    return ownership && ownership.authentic && ownership.organizationId === input.organizationId && ownership.sourceContentVersionId === input.sourceContentVersionId ? "allowed" : "denied";
  }
}
