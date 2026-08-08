import {
  ALPHA_ALLOWLIST_POLICY_ID,
  ALPHA_ALLOWLIST_POLICY_VERSION,
  ALPHA_ORGANIZATION_EXPERIENCE,
  type AlphaDisclosureDecisionAuditEvent,
  type AlphaOrganizationAccessRecord,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { AlphaStorageError } from "./types";
import { persistenceSafeActorReference } from "../../engine/v3/governance/persistenceSafeActorReference";

export type AlphaActorMappingDatabaseRow = {
  mapping_id: string;
  mapping_revision: number;
  actor_ref: string;
  organization_id: string;
  subject_lookup_digest: string;
  status: string;
  assigned_at: Date | string;
  revoked_at: Date | string | null;
  predecessor_mapping_id: string | null;
};

export type AlphaAccessDatabaseRow = {
  access_record_id: string;
  policy_id: string;
  policy_version: string;
  consumer_id: string;
  organization_id: string;
  relationship: string;
  experience: string;
  scope_type: string;
  scope_id: string;
  status: string;
  granted_at: Date | string;
  expires_at: Date | string | null;
  revoked_at: Date | string | null;
  supersedes_access_record_id: string | null;
};

function timestamp(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(date.getTime())) {
    throw new AlphaStorageError("integrity-failure", "Invalid stored timestamp");
  }
  return date.toISOString();
}

function identifier(value: string): boolean {
  return Boolean(value && value !== "*" && value.trim() === value && !value.includes("\0"));
}

export function mapAlphaActorMappingRow(row: AlphaActorMappingDatabaseRow) {
  if (!/^[0-9a-f]{64}$/.test(row.subject_lookup_digest) || !["active", "revoked"].includes(row.status)) {
    throw new AlphaStorageError("integrity-failure", "Invalid Alpha actor mapping row");
  }
  return persistenceSafeActorReference({
    mappingId: row.mapping_id,
    mappingRevision: row.mapping_revision,
    actorRef: row.actor_ref,
    organizationId: row.organization_id,
    status: row.status as "active" | "revoked",
    assignedAt: timestamp(row.assigned_at),
    ...(row.revoked_at ? { revokedAt: timestamp(row.revoked_at) } : {}),
    ...(row.predecessor_mapping_id ? { predecessorMappingId: row.predecessor_mapping_id } : {}),
  });
}

export function mapAlphaAccessRow(
  row: AlphaAccessDatabaseRow,
): AlphaOrganizationAccessRecord {
  if (
    row.policy_id !== ALPHA_ALLOWLIST_POLICY_ID ||
    row.policy_version !== ALPHA_ALLOWLIST_POLICY_VERSION ||
    row.relationship !== "allowed_alpha_user" ||
    row.experience !== ALPHA_ORGANIZATION_EXPERIENCE ||
    row.scope_type !== "organization" ||
    row.scope_id !== row.organization_id ||
    !identifier(row.access_record_id) ||
    !identifier(row.consumer_id) ||
    !identifier(row.organization_id) ||
    !["active", "revoked", "superseded"].includes(row.status)
  ) {
    throw new AlphaStorageError("integrity-failure", "Invalid Alpha access row");
  }
  const status = row.status === "revoked" ? "revoked" : "active";
  return {
    accessRecordId: row.access_record_id,
    policyId: ALPHA_ALLOWLIST_POLICY_ID,
    policyVersion: ALPHA_ALLOWLIST_POLICY_VERSION,
    consumerId: row.consumer_id,
    organizationId: row.organization_id,
    relationship: "allowed_alpha_user",
    supportedExperiences: [ALPHA_ORGANIZATION_EXPERIENCE],
    scope: { type: "organization", organizationId: row.organization_id },
    status,
    createdAt: timestamp(row.granted_at),
    ...(row.expires_at ? { validUntil: timestamp(row.expires_at) } : {}),
    ...(row.revoked_at ? { revokedAt: timestamp(row.revoked_at) } : {}),
    ...(row.supersedes_access_record_id
      ? { supersedesAccessRecordId: row.supersedes_access_record_id }
      : {}),
  };
}

export function assertValidAuditEvent(
  event: AlphaDisclosureDecisionAuditEvent,
): void {
  if (
    !identifier(event.eventId) ||
    !identifier(event.decisionId) ||
    event.eventType !== "alpha-disclosure-decision-resolved" ||
    event.policyId !== ALPHA_ALLOWLIST_POLICY_ID ||
    event.policyVersion !== ALPHA_ALLOWLIST_POLICY_VERSION ||
    event.experience !== ALPHA_ORGANIZATION_EXPERIENCE ||
    !identifier(event.consumerId) ||
    !identifier(event.organizationId) ||
    !Number.isFinite(Date.parse(event.resolvedAt)) ||
    !Array.isArray(event.reasonCodes) ||
    !Array.isArray(event.sourceRevisionIds) ||
    !Array.isArray(event.authorityReceiptIds)
  ) {
    throw new AlphaStorageError("integrity-failure", "Invalid Alpha audit event");
  }
}
