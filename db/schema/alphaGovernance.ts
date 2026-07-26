import {
  check,
  index,
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
