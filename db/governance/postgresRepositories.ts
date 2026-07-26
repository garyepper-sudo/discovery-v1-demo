import { createHash } from "node:crypto";

import type { Sql, TransactionSql } from "postgres";

import {
  ALPHA_ALLOWLIST_POLICY_ID,
  ALPHA_ALLOWLIST_POLICY_VERSION,
  type AlphaDisclosureDecisionAuditEvent,
  type AlphaOrganizationAccessRecord,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import {
  assertValidAuditEvent,
  mapAlphaAccessRow,
  type AlphaAccessDatabaseRow,
} from "./mapping";
import {
  AlphaStorageError,
  type AlphaAccessRecordRepository,
  type AlphaDisclosureAuditRepository,
  type GrantAlphaAccessInput,
  type RevokeAlphaAccessInput,
  type SupersedeAlphaAccessInput,
} from "./types";

type GovernanceSql = Sql<Record<string, unknown>>;
type GovernanceExecutor = GovernanceSql | TransactionSql<Record<string, unknown>>;

function validateIdentity(value: string, label: string): void {
  if (!value || value === "*" || value.trim() !== value || value.includes("\0")) {
    throw new AlphaStorageError("integrity-failure", `Invalid ${label}`);
  }
}

function eventId(action: string, idempotencyKey: string): string {
  return `alpha-access-${action}:${createHash("sha256")
    .update(idempotencyKey)
    .digest("hex")}`;
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export class PostgresAlphaAccessRecordRepository
  implements AlphaAccessRecordRepository
{
  constructor(private readonly sql: GovernanceSql) {}

  private async serializable<T>(
    operation: (transaction: TransactionSql<Record<string, unknown>>) => Promise<T>,
  ): Promise<T> {
    try {
      return (await this.sql.begin("isolation level serializable", operation)) as T;
    } catch (error) {
      if (error instanceof AlphaStorageError) throw error;
      const code = (error as { code?: string }).code;
      if (code === "23505" || code === "40001") {
        throw new AlphaStorageError("conflict", "Alpha access conflict");
      }
      throw new AlphaStorageError("unavailable", "Alpha access store unavailable", true);
    }
  }

  async findAccessRecords(input: {
    consumerId: string;
    organizationId: string;
    experience: "organization";
    resolvedAt: string;
  }): Promise<readonly AlphaOrganizationAccessRecord[]> {
    validateIdentity(input.consumerId, "consumerId");
    validateIdentity(input.organizationId, "organizationId");
    if (input.experience !== "organization" || !Number.isFinite(Date.parse(input.resolvedAt))) {
      throw new AlphaStorageError("integrity-failure", "Invalid access lookup");
    }
    try {
      const rows = await this.sql<AlphaAccessDatabaseRow[]>`
        SELECT access_record_id, policy_id, policy_version, consumer_id,
          organization_id, relationship, experience, scope_type, scope_id,
          status, granted_at, expires_at, revoked_at, supersedes_access_record_id
        FROM alpha_access_records
        WHERE policy_id = ${ALPHA_ALLOWLIST_POLICY_ID}
          AND policy_version = ${ALPHA_ALLOWLIST_POLICY_VERSION}
          AND consumer_id = ${input.consumerId}
          AND organization_id = ${input.organizationId}
          AND experience = ${input.experience}
        ORDER BY granted_at, access_record_id
      `;
      return rows.map(mapAlphaAccessRow);
    } catch (error) {
      if (error instanceof AlphaStorageError) throw error;
      throw new AlphaStorageError("unavailable", "Alpha access store unavailable", true);
    }
  }

  async grantAccess(input: GrantAlphaAccessInput): Promise<AlphaOrganizationAccessRecord> {
    for (const [value, label] of [
      [input.accessRecordId, "accessRecordId"],
      [input.consumerId, "consumerId"],
      [input.organizationId, "organizationId"],
      [input.actor, "actor"],
      [input.reasonCode, "reasonCode"],
      [input.idempotencyKey, "idempotencyKey"],
    ] as const) validateIdentity(value, label);
    if (input.experience !== "organization") {
      throw new AlphaStorageError("integrity-failure", "Unsupported experience");
    }
    return this.serializable(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(hashtextextended(${`${input.consumerId}:${input.organizationId}:${input.experience}`}, 0))`;
      const existing = await tx<AlphaAccessDatabaseRow[]>`
        SELECT access_record_id, policy_id, policy_version, consumer_id,
          organization_id, relationship, experience, scope_type, scope_id,
          status, granted_at, expires_at, revoked_at, supersedes_access_record_id
        FROM alpha_access_records WHERE administrative_idempotency_key = ${input.idempotencyKey}
      `;
      if (existing.length === 1) return mapAlphaAccessRow(existing[0]);
      const rows = await tx<AlphaAccessDatabaseRow[]>`
        INSERT INTO alpha_access_records (
          access_record_id, policy_id, policy_version, consumer_id, organization_id,
          relationship, experience, scope_type, scope_id, status, granted_at,
          granted_by, expires_at, administrative_idempotency_key, created_at, updated_at
        ) VALUES (
          ${input.accessRecordId}, ${ALPHA_ALLOWLIST_POLICY_ID},
          ${ALPHA_ALLOWLIST_POLICY_VERSION}, ${input.consumerId}, ${input.organizationId},
          'allowed_alpha_user', 'organization', 'organization', ${input.organizationId},
          'active', ${input.grantedAt}, ${input.actor}, ${input.expiresAt ?? null},
          ${input.idempotencyKey}, ${input.grantedAt}, ${input.grantedAt}
        )
        RETURNING access_record_id, policy_id, policy_version, consumer_id,
          organization_id, relationship, experience, scope_type, scope_id,
          status, granted_at, expires_at, revoked_at, supersedes_access_record_id
      `;
      await tx`
        INSERT INTO alpha_access_lifecycle_events (
          event_id, access_record_id, actor, action, reason_code,
          idempotency_key, occurred_at
        ) VALUES (
          ${eventId("grant", input.idempotencyKey)}, ${input.accessRecordId},
          ${input.actor}, 'grant', ${input.reasonCode},
          ${input.idempotencyKey}, ${input.grantedAt}
        )
      `;
      return mapAlphaAccessRow(rows[0]);
    });
  }

  async revokeAccess(input: RevokeAlphaAccessInput): Promise<AlphaOrganizationAccessRecord> {
    return this.serializable(async (tx) => {
      validateIdentity(input.accessRecordId, "accessRecordId");
      const existingEvent = await tx<{ access_record_id: string }[]>`
        SELECT access_record_id FROM alpha_access_lifecycle_events
        WHERE idempotency_key = ${input.idempotencyKey}
      `;
      if (existingEvent.length === 1) {
        const row = await this.loadById(tx, existingEvent[0].access_record_id);
        return mapAlphaAccessRow(row);
      }
      const rows = await tx<AlphaAccessDatabaseRow[]>`
        UPDATE alpha_access_records SET
          status = 'revoked', revoked_at = ${input.revokedAt},
          revoked_by = ${input.actor}, updated_at = ${input.revokedAt}
        WHERE access_record_id = ${input.accessRecordId} AND status = 'active'
        RETURNING access_record_id, policy_id, policy_version, consumer_id,
          organization_id, relationship, experience, scope_type, scope_id,
          status, granted_at, expires_at, revoked_at, supersedes_access_record_id
      `;
      if (rows.length !== 1) {
        throw new AlphaStorageError("invalid-transition", "Access record is not active");
      }
      await tx`
        INSERT INTO alpha_access_lifecycle_events (
          event_id, access_record_id, actor, action, reason_code,
          idempotency_key, occurred_at
        ) VALUES (
          ${eventId("revoke", input.idempotencyKey)}, ${input.accessRecordId},
          ${input.actor}, 'revoke', ${input.reasonCode},
          ${input.idempotencyKey}, ${input.revokedAt}
        )
      `;
      return mapAlphaAccessRow(rows[0]);
    });
  }

  async supersedeAccess(input: SupersedeAlphaAccessInput): Promise<{
    previous: AlphaOrganizationAccessRecord;
    next: AlphaOrganizationAccessRecord;
  }> {
    return this.serializable(async (tx) => {
      const previous = await this.loadById(tx, input.previousAccessRecordId, true);
      if (previous.status !== "active") {
        throw new AlphaStorageError("invalid-transition", "Access record is not active");
      }
      const existingEvent = await tx<{ successor_access_record_id: string }[]>`
        SELECT successor_access_record_id FROM alpha_access_lifecycle_events
        WHERE idempotency_key = ${input.idempotencyKey}
      `;
      if (existingEvent.length === 1 && existingEvent[0].successor_access_record_id) {
        return {
          previous: mapAlphaAccessRow(previous),
          next: mapAlphaAccessRow(
            await this.loadById(tx, existingEvent[0].successor_access_record_id),
          ),
        };
      }
      await tx`
        UPDATE alpha_access_records SET
          status = 'superseded', superseded_at = ${input.supersededAt},
          superseded_by = ${input.actor}, updated_at = ${input.supersededAt}
        WHERE access_record_id = ${input.previousAccessRecordId} AND status = 'active'
      `;
      const nextRows = await tx<AlphaAccessDatabaseRow[]>`
        INSERT INTO alpha_access_records (
          access_record_id, policy_id, policy_version, consumer_id, organization_id,
          relationship, experience, scope_type, scope_id, status, granted_at,
          granted_by, expires_at, supersedes_access_record_id,
          administrative_idempotency_key, created_at, updated_at
        ) VALUES (
          ${input.nextAccessRecordId}, ${previous.policy_id}, ${previous.policy_version},
          ${previous.consumer_id}, ${previous.organization_id}, ${previous.relationship},
          ${previous.experience}, ${previous.scope_type}, ${previous.scope_id}, 'active',
          ${input.supersededAt}, ${input.actor}, ${input.expiresAt ?? previous.expires_at},
          ${input.previousAccessRecordId}, ${input.idempotencyKey},
          ${input.supersededAt}, ${input.supersededAt}
        )
        RETURNING access_record_id, policy_id, policy_version, consumer_id,
          organization_id, relationship, experience, scope_type, scope_id,
          status, granted_at, expires_at, revoked_at, supersedes_access_record_id
      `;
      await tx`
        INSERT INTO alpha_access_lifecycle_events (
          event_id, access_record_id, actor, action, reason_code, idempotency_key,
          occurred_at, predecessor_access_record_id, successor_access_record_id
        ) VALUES (
          ${eventId("supersede", input.idempotencyKey)}, ${input.previousAccessRecordId},
          ${input.actor}, 'supersede', ${input.reasonCode}, ${input.idempotencyKey},
          ${input.supersededAt}, ${input.previousAccessRecordId}, ${input.nextAccessRecordId}
        )
      `;
      const transitioned = await this.loadById(tx, input.previousAccessRecordId);
      return {
        previous: mapAlphaAccessRow(transitioned),
        next: mapAlphaAccessRow(nextRows[0]),
      };
    });
  }

  private async loadById(
    sql: GovernanceExecutor,
    accessRecordId: string,
    lock = false,
  ): Promise<AlphaAccessDatabaseRow> {
    const rows = await sql<AlphaAccessDatabaseRow[]>`
      SELECT access_record_id, policy_id, policy_version, consumer_id,
        organization_id, relationship, experience, scope_type, scope_id,
        status, granted_at, expires_at, revoked_at, supersedes_access_record_id
      FROM alpha_access_records WHERE access_record_id = ${accessRecordId}
      ${lock ? sql`FOR UPDATE` : sql``}
    `;
    if (rows.length !== 1) {
      throw new AlphaStorageError("invalid-transition", "Access record not found");
    }
    return rows[0];
  }
}

export class PostgresAlphaDisclosureAuditRepository
  implements AlphaDisclosureAuditRepository
{
  constructor(private readonly sql: GovernanceSql) {}

  async append(
    event: AlphaDisclosureDecisionAuditEvent,
    transaction?: unknown,
  ): Promise<"inserted" | "already_present_identical"> {
    assertValidAuditEvent(event);
    const executor = (transaction as GovernanceExecutor | undefined) ?? this.sql;
    const payloadHash = createHash("sha256").update(stable(event)).digest("hex");
    try {
      const inserted = await executor<{ audit_event_id: string }[]>`
        INSERT INTO alpha_disclosure_audit_events (
          audit_event_id, decision_id, event_type, event_version, policy_id,
          policy_version, consumer_id, organization_id, experience,
          access_record_id, disposition, reason_codes, source_revision_ids,
          authority_receipt_ids, resolved_at, request_correlation_id,
          payload_hash, created_at
        ) VALUES (
          ${event.eventId}, ${event.decisionId}, ${event.eventType}, '1',
          ${event.policyId}, ${event.policyVersion}, ${event.consumerId},
          ${event.organizationId}, ${event.experience},
          ${event.accessRecordId ?? null}, ${event.disposition},
          ${executor.json(event.reasonCodes)}, ${executor.json(event.sourceRevisionIds)},
          ${executor.json(event.authorityReceiptIds)}, ${event.resolvedAt},
          ${event.decisionId}, ${payloadHash}, ${event.resolvedAt}
        )
        ON CONFLICT (audit_event_id) DO NOTHING
        RETURNING audit_event_id
      `;
      if (inserted.length === 1) return "inserted";
      const existing = await executor<{ payload_hash: string }[]>`
        SELECT payload_hash FROM alpha_disclosure_audit_events
        WHERE audit_event_id = ${event.eventId}
      `;
      if (existing.length === 1 && existing[0].payload_hash === payloadHash) {
        return "already_present_identical";
      }
      throw new AlphaStorageError(
        "integrity-failure",
        "Audit identity reused with different payload",
      );
    } catch (error) {
      if (error instanceof AlphaStorageError) throw error;
      throw new AlphaStorageError("unavailable", "Alpha audit store unavailable", true);
    }
  }
}
