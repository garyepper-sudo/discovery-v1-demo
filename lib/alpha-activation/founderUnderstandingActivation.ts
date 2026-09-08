import "server-only";

import { createHash } from "node:crypto";
import { readLocalGovernedSources, type LocalGovernedSourceDescriptor } from "./localGovernedSourceIntake";

export type FounderUnderstandingActivationPacketV1 = { schemaVersion: "1"; activationKey: string; organization: { externalKey: string; displayName: string }; understanding: { purpose: string; primaryQuestion: string }; meeting: { externalKey: string; title: string; cadence: string }; sources: readonly LocalGovernedSourceDescriptor[]; preparationScope: { externalKey: string; sourceKeys: readonly string[] } };
export type FounderUnderstandingActivationPlan = { organizationDisplayName: string; organizationKeyDigest: string; purpose: string; primaryQuestion: string; meeting: { title: string; cadence: string }; participantCount: 1; sourceCount: number; totalSourceBytes: number; sourcePurposes: readonly string[]; scopedSourceCount: number; ready: true; limitation: "Founder Local Alpha source files are local development content; this is not production ingestion." };

/** Opaque and nonserializable: only this server module can mint it. It conveys
 * exact local source-admission intent, never read, organization, meeting, or
 * participant authority. */
const founderLocalAlphaAuthority: unique symbol = Symbol("FounderLocalAlphaSourceAdmissionAuthorityV1");
export type FounderLocalAlphaSourceAdmissionAuthorityV1 = { readonly [founderLocalAlphaAuthority]: true };
const createFounderLocalAlphaSourceAdmissionAuthority = (): FounderLocalAlphaSourceAdmissionAuthorityV1 => Object.freeze({ [founderLocalAlphaAuthority]: true } as FounderLocalAlphaSourceAdmissionAuthorityV1);

export type FounderUnderstandingActivationOwners = {
  resolveUniqueFounder(): Promise<{ participantRef: string }>;
  validateActivationIdentity(input: { operationId: string; packetFingerprint: string }): Promise<void>;
  validateOrganization(input: { externalKey: string; displayName: string; operationId: string }): Promise<void>;
  validatePolicyAndOrganizationGrant(input: { participantRef: string; organizationExternalKey: string; operationId: string }): Promise<void>;
  validateQuestionAndMeeting(input: { organizationExternalKey: string; question: string; meetingExternalKey: string; cadence: string; sourceKeys: readonly string[]; operationId: string }): Promise<void>;
  applyStage(input: { stage: FounderUnderstandingActivationStage; participantRef: string; packet: FounderUnderstandingActivationPacketV1; sources: readonly { sourceKey: string; purpose: string; byteLength: number; bytes: Uint8Array }[]; operationId: string; packetFingerprint: string; authority: FounderLocalAlphaSourceAdmissionAuthorityV1 }): Promise<void>;
};

export const FOUNDER_UNDERSTANDING_ACTIVATION_STAGES = ["organization-provisioning", "policy-activation", "organization-grant", "source-admission", "preparation-scope-registration", "meeting-occurrence-provisioning", "meeting-grant", "prepared-work-persistence"] as const;
export type FounderUnderstandingActivationStage = (typeof FOUNDER_UNDERSTANDING_ACTIVATION_STAGES)[number];
const key = /^[a-z0-9][a-z0-9._:-]{0,127}$/u;
const text = (value: unknown, maximum = 500): value is string => typeof value === "string" && value.trim() === value && value.length > 0 && value.length <= maximum;
const digest = (value: string) => createHash("sha256").update(value).digest("hex");
const stable = (value: unknown) => JSON.stringify(value);
function exactKeys(value: Record<string, unknown>, allowed: readonly string[]): boolean { const actual = Object.keys(value).sort(), expected = [...allowed].sort(); return actual.length === expected.length && actual.every((field, index) => field === expected[index]); }
function object(value: unknown, fields: readonly string[]): Record<string, unknown> { if (!value || typeof value !== "object" || Array.isArray(value) || !exactKeys(value as Record<string, unknown>, fields)) throw new Error("Founder activation packet is invalid."); return value as Record<string, unknown>; }

export function parseFounderUnderstandingActivationPacket(value: unknown): FounderUnderstandingActivationPacketV1 {
  const root = object(value, ["schemaVersion", "activationKey", "organization", "understanding", "meeting", "sources", "preparationScope"]), organization = object(root.organization, ["externalKey", "displayName"]), understanding = object(root.understanding, ["purpose", "primaryQuestion"]), meeting = object(root.meeting, ["externalKey", "title", "cadence"]), scope = object(root.preparationScope, ["externalKey", "sourceKeys"]);
  if (root.schemaVersion !== "1" || !text(root.activationKey, 128) || !key.test(root.activationKey) || !text(organization.externalKey, 128) || !key.test(organization.externalKey) || !text(organization.displayName) || !text(understanding.purpose) || !text(understanding.primaryQuestion) || !text(meeting.externalKey, 128) || !key.test(meeting.externalKey) || !text(meeting.title) || !text(meeting.cadence) || !text(scope.externalKey, 128) || !key.test(scope.externalKey) || !Array.isArray(root.sources) || !Array.isArray(scope.sourceKeys)) throw new Error("Founder activation packet is invalid.");
  const sources = root.sources.map((item) => { const source = object(item, ["sourceKey", "relativePath", "purpose"]); if (!text(source.sourceKey, 128) || !key.test(source.sourceKey) || !text(source.relativePath) || !text(source.purpose)) throw new Error("Founder activation packet is invalid."); return { sourceKey: source.sourceKey, relativePath: source.relativePath, purpose: source.purpose }; });
  const sourceKeys = scope.sourceKeys.map((entry) => { if (!text(entry, 128) || !key.test(entry)) throw new Error("Founder activation packet is invalid."); return entry; });
  const sourceSet = new Set(sources.map((source) => source.sourceKey));
  if (!sources.length || sourceSet.size !== sources.length || !sourceKeys.length || new Set(sourceKeys).size !== sourceKeys.length || sourceKeys.some((sourceKey) => !sourceSet.has(sourceKey))) throw new Error("Founder activation packet is invalid.");
  return { schemaVersion: "1", activationKey: root.activationKey, organization: { externalKey: organization.externalKey, displayName: organization.displayName }, understanding: { purpose: understanding.purpose, primaryQuestion: understanding.primaryQuestion }, meeting: { externalKey: meeting.externalKey, title: meeting.title, cadence: meeting.cadence }, sources, preparationScope: { externalKey: scope.externalKey, sourceKeys: [...sourceKeys].sort() } };
}

export class FounderUnderstandingActivation {
  constructor(private readonly owners: FounderUnderstandingActivationOwners) {}
  async plan(input: { packet: unknown; sourceRoot: string }): Promise<FounderUnderstandingActivationPlan> {
    if (process.env.NODE_ENV === "production") throw new Error("Founder Local Alpha is unavailable.");
    const packet = parseFounderUnderstandingActivationPacket(input.packet), operationId = `founder-understanding:${digest(packet.activationKey)}`, packetFingerprint = digest(stable(packet)), founder = await this.owners.resolveUniqueFounder();
    if (!text(founder.participantRef, 512)) throw new Error("Founder activation is unavailable.");
    await this.owners.validateActivationIdentity({ operationId, packetFingerprint });
    await this.owners.validateOrganization({ externalKey: packet.organization.externalKey, displayName: packet.organization.displayName, operationId });
    await this.owners.validatePolicyAndOrganizationGrant({ participantRef: founder.participantRef, organizationExternalKey: packet.organization.externalKey, operationId });
    const sources = await readLocalGovernedSources({ sourceRoot: input.sourceRoot, descriptors: packet.sources });
    await this.owners.validateQuestionAndMeeting({ organizationExternalKey: packet.organization.externalKey, question: packet.understanding.primaryQuestion, meetingExternalKey: packet.meeting.externalKey, cadence: packet.meeting.cadence, sourceKeys: packet.preparationScope.sourceKeys, operationId });
    return { organizationDisplayName: packet.organization.displayName, organizationKeyDigest: digest(packet.organization.externalKey), purpose: packet.understanding.purpose, primaryQuestion: packet.understanding.primaryQuestion, meeting: { title: packet.meeting.title, cadence: packet.meeting.cadence }, participantCount: 1, sourceCount: sources.length, totalSourceBytes: sources.reduce((total, source) => total + source.byteLength, 0), sourcePurposes: sources.map((source) => source.purpose), scopedSourceCount: packet.preparationScope.sourceKeys.length, ready: true, limitation: "Founder Local Alpha source files are local development content; this is not production ingestion." };
  }
  async apply(input: { packet: unknown; sourceRoot: string }): Promise<FounderUnderstandingActivationPlan> {
    const packet = parseFounderUnderstandingActivationPacket(input.packet), plan = await this.plan(input), operationId = `founder-understanding:${digest(packet.activationKey)}`, packetFingerprint = digest(stable(packet)), founder = await this.owners.resolveUniqueFounder();
    if (!text(founder.participantRef, 512)) throw new Error("Founder activation is unavailable.");
    await this.owners.validateActivationIdentity({ operationId, packetFingerprint });
    await this.owners.validateOrganization({ externalKey: packet.organization.externalKey, displayName: packet.organization.displayName, operationId });
    await this.owners.validatePolicyAndOrganizationGrant({ participantRef: founder.participantRef, organizationExternalKey: packet.organization.externalKey, operationId });
    const sources = await readLocalGovernedSources({ sourceRoot: input.sourceRoot, descriptors: packet.sources }), authority = createFounderLocalAlphaSourceAdmissionAuthority();
    for (const stage of FOUNDER_UNDERSTANDING_ACTIVATION_STAGES) await this.owners.applyStage({ stage, participantRef: founder.participantRef, packet, sources, operationId, packetFingerprint, authority });
    return plan;
  }
}
