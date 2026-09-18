import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const alphaAccessRecords = pgTable(
  "alpha_access_records",
  {
    accessRecordId: text("access_record_id").primaryKey(),
    policyId: text("policy_id").notNull(),
    policyVersion: text("policy_version").notNull(),
    consumerId: text("consumer_id").notNull(),
    organizationId: text("organization_id").notNull(),
    relationship: text("relationship").notNull(),
    experience: text("experience").notNull(),
    scopeType: text("scope_type").notNull(),
    scopeId: text("scope_id").notNull(),
    status: text("status").notNull(),
    grantedAt: timestamp("granted_at", { withTimezone: true, mode: "string" })
      .notNull(),
    grantedBy: text("granted_by").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    revokedBy: text("revoked_by"),
    supersededAt: timestamp("superseded_at", {
      withTimezone: true,
      mode: "string",
    }),
    supersededBy: text("superseded_by"),
    supersedesAccessRecordId: text("supersedes_access_record_id"),
    administrativeIdempotencyKey: text("administrative_idempotency_key")
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .notNull(),
  },
  (table) => [
    check("alpha_access_status_check", sql`${table.status} in ('active', 'revoked', 'superseded')`),
    check("alpha_access_relationship_check", sql`${table.relationship} = 'allowed_alpha_user'`),
    check("alpha_access_experience_check", sql`${table.experience} = 'organization'`),
    check("alpha_access_scope_check", sql`${table.scopeType} = 'organization' and ${table.scopeId} = ${table.organizationId}`),
    uniqueIndex("alpha_access_admin_idempotency_uq").on(
      table.administrativeIdempotencyKey,
    ),
    uniqueIndex("alpha_access_successor_uq")
      .on(table.supersedesAccessRecordId)
      .where(sql`${table.supersedesAccessRecordId} is not null`),
    uniqueIndex("alpha_access_one_active_uq")
      .on(
        table.policyId,
        table.policyVersion,
        table.consumerId,
        table.organizationId,
        table.experience,
      )
      .where(sql`${table.status} = 'active'`),
    index("alpha_access_current_lookup_idx").on(
      table.consumerId,
      table.organizationId,
      table.experience,
      table.policyId,
      table.policyVersion,
    ),
  ],
);

export const organizationIdentities = pgTable(
  "organization_identities",
  {
    organizationId: text("organization_id").primaryKey(),
    creationKey: text("creation_key").notNull().unique(),
    displayName: text("display_name").notNull(),
    provenance: text("provenance").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    check("organization_identities_identity_check", sql`${table.organizationId} ~ '^organization:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and ${table.creationKey} <> '' and ${table.creationKey} <> '*' and ${table.creationKey} = btrim(${table.creationKey}) and ${table.displayName} <> '' and ${table.displayName} <> '*' and ${table.displayName} = btrim(${table.displayName}) and ${table.provenance} <> '' and ${table.provenance} <> '*' and ${table.provenance} = btrim(${table.provenance})`),
  ],
);

export const alphaActorMappings = pgTable(
  "alpha_actor_mappings",
  {
    mappingId: text("mapping_id").primaryKey(),
    mappingRevision: integer("mapping_revision").notNull(),
    actorRef: text("actor_ref").notNull(),
    organizationId: text("organization_id").notNull(),
    subjectLookupDigest: text("subject_lookup_digest").notNull(),
    status: text("status").notNull(),
    assignedAt: timestamp("assigned_at", { withTimezone: true, mode: "string" }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true, mode: "string" }),
    predecessorMappingId: text("predecessor_mapping_id"),
    assignmentIdempotencyKey: text("assignment_idempotency_key").notNull(),
  },
  (table) => [
    check("alpha_actor_mapping_status_check", sql`${table.status} in ('active', 'revoked')`),
    check("alpha_actor_mapping_revision_check", sql`${table.mappingRevision} >= 1`),
    check("alpha_actor_mapping_identity_check", sql`${table.mappingId} <> '' and ${table.mappingId} <> '*' and ${table.mappingId} = btrim(${table.mappingId}) and ${table.actorRef} ~ '^actor:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$' and ${table.organizationId} <> '' and ${table.organizationId} <> '*' and ${table.organizationId} = btrim(${table.organizationId})`),
    check("alpha_actor_mapping_lifecycle_check", sql`(${table.status} = 'active' and ${table.revokedAt} is null) or (${table.status} = 'revoked' and ${table.revokedAt} is not null and ${table.revokedAt} >= ${table.assignedAt})`),
    uniqueIndex("alpha_actor_mapping_actor_ref_uq").on(table.actorRef),
    uniqueIndex("alpha_actor_mapping_idempotency_uq").on(table.assignmentIdempotencyKey),
    check("alpha_actor_mapping_subject_digest_check", sql`${table.subjectLookupDigest} ~ '^[0-9a-f]{64}$'`),
    uniqueIndex("alpha_actor_mapping_active_subject_uq").on(table.organizationId, table.subjectLookupDigest).where(sql`${table.status} = 'active'`),
    index("alpha_actor_mapping_subject_history_idx").on(table.organizationId, table.subjectLookupDigest, table.mappingRevision),
  ],
);

export const existingParticipantIdentityBindings = pgTable(
  "existing_participant_identity_bindings",
  {
    bindingId: text("binding_id").primaryKey(),
    provider: text("provider").notNull(),
    locatorDigest: text("locator_digest").notNull(),
    participantRef: text("participant_ref").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    check("existing_participant_identity_binding_provider_check", sql`${table.provider} = 'clerk'`),
    check("existing_participant_identity_binding_locator_digest_check", sql`${table.locatorDigest} ~ '^[0-9a-f]{64}$'`),
    check("existing_participant_identity_binding_participant_ref_check", sql`${table.participantRef} ~ '^participant:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`),
    uniqueIndex("existing_participant_identity_binding_locator_uq").on(table.provider, table.locatorDigest),
    uniqueIndex("existing_participant_identity_binding_participant_uq").on(table.participantRef),
  ],
);

export const participantIdentityStableSubjectMappings = pgTable(
  "participant_identity_stable_subject_mappings",
  {
    bindingId: text("binding_id").primaryKey(), provider: text("provider").notNull(), stableSubjectDigest: text("stable_subject_digest").notNull(), participantRef: text("participant_ref").notNull(), createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    check("participant_identity_stable_subject_mapping_provider_check", sql`${table.provider} = 'clerk'`), check("participant_identity_stable_subject_mapping_digest_check", sql`${table.stableSubjectDigest} ~ '^[0-9a-f]{64}$'`), check("participant_identity_stable_subject_mapping_participant_ref_check", sql`${table.participantRef} ~ '^participant:[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'`), uniqueIndex("participant_identity_stable_subject_mapping_locator_uq").on(table.provider, table.stableSubjectDigest), uniqueIndex("participant_identity_stable_subject_mapping_participant_uq").on(table.participantRef),
  ],
);

export const participantIdentityNamespaceAnchors = pgTable(
  "participant_identity_namespace_anchors",
  {
    namespace: text("namespace").primaryKey(), anchorId: text("anchor_id").notNull().unique(), legacyNamespaceFingerprint: text("legacy_namespace_fingerprint").notNull(), stableInstanceFingerprint: text("stable_instance_fingerprint").notNull(), activationIdempotencyKey: text("activation_idempotency_key").notNull().unique(), activatedAt: timestamp("activated_at", { withTimezone: true, mode: "string" }).notNull(),
  },
  (table) => [
    check("participant_identity_namespace_anchor_namespace_check", sql`${table.namespace} = 'clerk-participant-identity-v1-to-v2'`), check("participant_identity_namespace_anchor_id_check", sql`${table.anchorId} <> '' AND ${table.anchorId} <> '*' AND ${table.anchorId} = btrim(${table.anchorId})`), check("participant_identity_namespace_anchor_legacy_fingerprint_check", sql`${table.legacyNamespaceFingerprint} ~ '^[0-9a-f]{64}$'`), check("participant_identity_namespace_anchor_instance_fingerprint_check", sql`${table.stableInstanceFingerprint} ~ '^[0-9a-f]{64}$'`), check("participant_identity_namespace_anchor_activation_key_check", sql`${table.activationIdempotencyKey} <> '' AND ${table.activationIdempotencyKey} <> '*' AND ${table.activationIdempotencyKey} = btrim(${table.activationIdempotencyKey})`),
  ],
);

export const alphaAccessLifecycleEvents = pgTable(
  "alpha_access_lifecycle_events",
  {
    eventId: text("event_id").primaryKey(),
    accessRecordId: text("access_record_id")
      .notNull()
      .references(() => alphaAccessRecords.accessRecordId),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    reasonCode: text("reason_code").notNull(),
    idempotencyKey: text("idempotency_key").notNull().unique(),
    occurredAt: timestamp("occurred_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    predecessorAccessRecordId: text("predecessor_access_record_id"),
    successorAccessRecordId: text("successor_access_record_id"),
  },
  (table) => [
    check("alpha_lifecycle_action_check", sql`${table.action} in ('grant', 'revoke', 'supersede')`),
    index("alpha_lifecycle_access_time_idx").on(
      table.accessRecordId,
      table.occurredAt,
    ),
  ],
);

export const alphaDisclosureAuditEvents = pgTable(
  "alpha_disclosure_audit_events",
  {
    auditEventId: text("audit_event_id").primaryKey(),
    decisionId: text("decision_id").notNull().unique(),
    eventType: text("event_type").notNull(),
    eventVersion: text("event_version").notNull(),
    policyId: text("policy_id").notNull(),
    policyVersion: text("policy_version").notNull(),
    consumerId: text("consumer_id").notNull(),
    organizationId: text("organization_id").notNull(),
    experience: text("experience").notNull(),
    accessRecordId: text("access_record_id"),
    disposition: text("disposition").notNull(),
    reasonCodes: jsonb("reason_codes").$type<string[]>().notNull(),
    sourceRevisionIds: jsonb("source_revision_ids").$type<string[]>().notNull(),
    authorityReceiptIds: jsonb("authority_receipt_ids").$type<string[]>().notNull(),
    resolvedAt: timestamp("resolved_at", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    requestCorrelationId: text("request_correlation_id").notNull(),
    payloadHash: text("payload_hash").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .notNull(),
  },
  (table) => [
    index("alpha_audit_decision_idx").on(table.decisionId),
    index("alpha_audit_organization_time_idx").on(
      table.organizationId,
      table.resolvedAt,
    ),
    index("alpha_audit_consumer_time_idx").on(
      table.consumerId,
      table.resolvedAt,
    ),
    uniqueIndex("alpha_audit_correlation_uq").on(table.requestCorrelationId),
  ],
);
