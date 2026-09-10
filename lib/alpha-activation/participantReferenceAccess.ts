import "server-only";

import { createHash } from "node:crypto";

import { ExistingParticipantIdentityResolutionService, type VerifiedClerkLocator } from "../auth/existingParticipantIdentityResolutionCore";

export type ParticipantReferenceAccessMode = "participant-reference-v1";
export type ParticipantReferenceAccessDecision = "legacy-confirmed" | "authorized" | "denied" | "unavailable";
export type ParticipantReferenceGrantScope = "organization" | "meeting-series";
export type ParticipantReferenceGrant = {
  grantId: string;
  organizationId: string;
  participantRef: string;
  scope: ParticipantReferenceGrantScope;
  meetingSeriesId: string | null;
  status: "active" | "revoked";
  issuedBy: string;
  operationId: string;
  requestFingerprint: string;
  createdAt: string;
  revokedAt: string | null;
  supersedesGrantId: string | null;
};
export type ParticipantReferencePolicy = {
  organizationId: string;
  mode: ParticipantReferenceAccessMode;
  issuedBy: string;
  operationId: string;
  requestFingerprint: string;
  createdAt: string;
};

export interface ParticipantReferenceAccessRepository {
  activatePolicy(input: ParticipantReferencePolicy): Promise<ParticipantReferencePolicy>;
  findPolicy(organizationId: string): Promise<ParticipantReferencePolicy | undefined>;
  createGrant(input: ParticipantReferenceGrant): Promise<ParticipantReferenceGrant>;
  revokeGrant(input: { grantId: string; organizationId: string; issuedBy: string; operationId: string; requestFingerprint: string; revokedAt: string }): Promise<ParticipantReferenceGrant>;
  findGrants(input: { organizationId: string; participantRef: string; scope: ParticipantReferenceGrantScope; meetingSeriesId?: string }): Promise<readonly ParticipantReferenceGrant[]>;
}

const exact = (value: unknown): value is string => typeof value === "string" && value.length > 0 && value.trim() === value && value !== "*" && !value.includes("\0");
const fingerprint = (input: Record<string, unknown>) => createHash("sha256").update(JSON.stringify(Object.entries(input).sort(([a], [b]) => a.localeCompare(b)))).digest("hex");
const active = (grants: readonly ParticipantReferenceGrant[]) => grants.filter((grant) => grant.status === "active");
const validPolicyAuthority = (policy:ParticipantReferencePolicy, organizationId:string) => policy.organizationId===organizationId&&policy.mode==="participant-reference-v1"&&[policy.issuedBy,policy.operationId,policy.requestFingerprint,policy.createdAt].every(exact)&&Number.isFinite(Date.parse(policy.createdAt));
const validGrantIssuer = (grant:ParticipantReferenceGrant, input:{organizationId:string;participantRef:string;scope:ParticipantReferenceGrantScope;meetingSeriesId?:string}, issuer:string) => grant.organizationId===input.organizationId&&grant.participantRef===input.participantRef&&grant.scope===input.scope&&grant.meetingSeriesId===(input.scope==="meeting-series"?input.meetingSeriesId!:null)&&grant.status==="active"&&grant.issuedBy===issuer&&[grant.grantId,grant.operationId,grant.requestFingerprint,grant.createdAt].every(exact)&&Number.isFinite(Date.parse(grant.createdAt))&&grant.revokedAt===null;

/** The sole current-access decision boundary.  Policy mode never falls back
 * to legacy authorization: each active grant must be singular and issued by
 * the exact, well-formed authority recorded in the active policy. */
export function evaluateParticipantReferenceCurrentAccess(input:{policy:ParticipantReferencePolicy|undefined;organizationGrants:readonly ParticipantReferenceGrant[];meetingGrants:readonly ParticipantReferenceGrant[];organizationId:string;participantRef:string;meetingSeriesId:string}):ParticipantReferenceAccessDecision {
  if(!input.policy||!validPolicyAuthority(input.policy,input.organizationId))return "unavailable";
  const organizationInput={organizationId:input.organizationId,participantRef:input.participantRef,scope:"organization" as const};
  const meetingInput={organizationId:input.organizationId,participantRef:input.participantRef,scope:"meeting-series" as const,meetingSeriesId:input.meetingSeriesId};
  const organization=active(input.organizationGrants),meeting=active(input.meetingGrants);
  if(organization.length!==1||meeting.length!==1)return "denied";
  return validGrantIssuer(organization[0]!,organizationInput,input.policy.issuedBy)&&validGrantIssuer(meeting[0]!,meetingInput,input.policy.issuedBy)?"authorized":"denied";
}

/** Closed server-internal administration capability.  It accepts only opaque
 * participant references already issued by the identity owner. */
export class ParticipantReferenceAccessAdministration {
  constructor(private readonly repository: ParticipantReferenceAccessRepository) {}
  async activatePolicy(input: { organizationId: string; issuerAuthority: string; operationId: string; occurredAt: string }): Promise<ParticipantReferencePolicy> {
    if (![input.organizationId, input.issuerAuthority, input.operationId].every(exact) || !Number.isFinite(Date.parse(input.occurredAt))) throw new Error("Participant reference access administration is unavailable.");
    const requestFingerprint = fingerprint({ kind: "policy", organizationId: input.organizationId, issuerAuthority: input.issuerAuthority });
    return this.repository.activatePolicy({ organizationId: input.organizationId, mode: "participant-reference-v1", issuedBy: input.issuerAuthority, operationId: input.operationId, requestFingerprint, createdAt: input.occurredAt });
  }
  async grant(input: { organizationId: string; participantRef: string; scope: ParticipantReferenceGrantScope; meetingSeriesId?: string; issuerAuthority: string; operationId: string; occurredAt: string }): Promise<ParticipantReferenceGrant> {
    if (![input.organizationId, input.participantRef, input.issuerAuthority, input.operationId].every(exact) || !Number.isFinite(Date.parse(input.occurredAt)) || (input.scope === "meeting-series" ? !exact(input.meetingSeriesId) : input.meetingSeriesId !== undefined)) throw new Error("Participant reference access administration is unavailable.");
    const meetingSeriesId = input.scope === "meeting-series" ? input.meetingSeriesId! : null;
    const requestFingerprint = fingerprint({ kind: "grant", organizationId: input.organizationId, participantRef: input.participantRef, scope: input.scope, meetingSeriesId, issuerAuthority: input.issuerAuthority });
    return this.repository.createGrant({ grantId: `participant-reference-grant:${fingerprint({ operationId: input.operationId, requestFingerprint }).slice(0, 32)}`, organizationId: input.organizationId, participantRef: input.participantRef, scope: input.scope, meetingSeriesId, status: "active", issuedBy: input.issuerAuthority, operationId: input.operationId, requestFingerprint, createdAt: input.occurredAt, revokedAt: null, supersedesGrantId: null });
  }
  async revoke(input: { grantId: string; organizationId: string; issuerAuthority: string; operationId: string; occurredAt: string }): Promise<ParticipantReferenceGrant> {
    if (![input.grantId, input.organizationId, input.issuerAuthority, input.operationId].every(exact) || !Number.isFinite(Date.parse(input.occurredAt))) throw new Error("Participant reference access administration is unavailable.");
    return this.repository.revokeGrant({ grantId: input.grantId, organizationId: input.organizationId, issuedBy: input.issuerAuthority, operationId: input.operationId, requestFingerprint: fingerprint({ kind: "revoke", grantId: input.grantId, organizationId: input.organizationId, issuerAuthority: input.issuerAuthority }), revokedAt: input.occurredAt });
  }
}

export class ParticipantReferenceMeetingCurrentAccess {
  constructor(private readonly repository: ParticipantReferenceAccessRepository, private readonly identities: ExistingParticipantIdentityResolutionService) {}
  async authorize(input: { verifiedLocator: VerifiedClerkLocator; organizationId: string; meetingSeriesId: string }): Promise<ParticipantReferenceAccessDecision> {
    if (![input.organizationId, input.meetingSeriesId].every(exact)) return "denied";
    let policy: ParticipantReferencePolicy | undefined; try { policy=await this.repository.findPolicy(input.organizationId); } catch { return "unavailable"; }
    if (!policy) return "unavailable";
    const identity = await this.identities.lookupExistingParticipantBinding(input.verifiedLocator);
    if (identity.status !== "found") return "denied";
    let organization:ParticipantReferenceGrant[],meeting:ParticipantReferenceGrant[];try{organization=active(await this.repository.findGrants({organizationId:input.organizationId,participantRef:identity.participantRef,scope:"organization"}));meeting=active(await this.repository.findGrants({organizationId:input.organizationId,participantRef:identity.participantRef,scope:"meeting-series",meetingSeriesId:input.meetingSeriesId}));}catch{return"unavailable";}
    return evaluateParticipantReferenceCurrentAccess({policy,organizationGrants:organization,meetingGrants:meeting,organizationId:input.organizationId,participantRef:identity.participantRef,meetingSeriesId:input.meetingSeriesId});
  }
}
