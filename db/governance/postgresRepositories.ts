import { createHash, createHmac, randomUUID } from "node:crypto";

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
  mapAlphaActorMappingRow,
  type AlphaActorMappingDatabaseRow,
  type AlphaAccessDatabaseRow,
} from "./mapping";
import {
  AlphaStorageError,
  type AlphaAccessRecordRepository,
  type AlphaDisclosureAuditRepository,
  type AssignPersistenceSafeActorInput,
  type PersistenceSafeActorReferenceRepository,
  type GrantAlphaAccessInput,
  type RevokeAlphaAccessInput,
  type RestoreAlphaAccessInput,
  type RestorableAlphaAccessRecordRepository,
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
  implements AlphaAccessRecordRepository, RestorableAlphaAccessRecordRepository, PersistenceSafeActorReferenceRepository
{
  constructor(private readonly sql: GovernanceSql, private readonly actorSubjectLookupKey?: string) {}

  private subjectLookupDigest(consumerId: string): string {
    if (!this.actorSubjectLookupKey || this.actorSubjectLookupKey.length < 32) {
      throw new AlphaStorageError("unavailable", "Alpha actor mapping key unavailable");
    }
    return createHmac("sha256", this.actorSubjectLookupKey).update(consumerId).digest("hex");
  }

  async assignPersistenceSafeActor(input: AssignPersistenceSafeActorInput) {
    for (const [value, label] of [[input.consumerId, "consumerId"], [input.organizationId, "organizationId"], [input.idempotencyKey, "idempotencyKey"]] as const) validateIdentity(value, label);
    if (!Number.isFinite(Date.parse(input.assignedAt))) throw new AlphaStorageError("integrity-failure", "Invalid actor assignment time");
    const subjectDigest = this.subjectLookupDigest(input.consumerId);
    return this.serializable(async (tx) => {
      await tx`SELECT pg_advisory_xact_lock(hashtextextended(${`actor:${input.organizationId}:${subjectDigest}`}, 0))`;
      const access = await tx<{ access_record_id: string }[]>`
        SELECT access_record_id FROM alpha_access_records
        WHERE policy_id = ${ALPHA_ALLOWLIST_POLICY_ID}
          AND policy_version = ${ALPHA_ALLOWLIST_POLICY_VERSION}
          AND consumer_id = ${input.consumerId}
          AND organization_id = ${input.organizationId}
          AND experience = 'organization'
          AND status = 'active'
          AND granted_at <= ${input.assignedAt}
          AND (expires_at IS NULL OR expires_at > ${input.assignedAt})
      `;
      if (access.length !== 1) {
        throw new AlphaStorageError("invalid-transition", "Active Alpha access is required for actor assignment");
      }
      const replay = await tx<AlphaActorMappingDatabaseRow[]>`SELECT mapping_id, mapping_revision, actor_ref, organization_id, subject_lookup_digest, status, assigned_at, revoked_at, predecessor_mapping_id FROM alpha_actor_mappings WHERE assignment_idempotency_key = ${input.idempotencyKey}`;
      if (replay.length === 1) {
        if (replay[0].organization_id !== input.organizationId || replay[0].subject_lookup_digest !== subjectDigest || new Date(replay[0].assigned_at).toISOString() !== new Date(input.assignedAt).toISOString()) throw new AlphaStorageError("conflict", "Actor assignment idempotency identity conflict");
        return mapAlphaActorMappingRow(replay[0]);
      }
      const active = await tx<AlphaActorMappingDatabaseRow[]>`SELECT mapping_id, mapping_revision, actor_ref, organization_id, subject_lookup_digest, status, assigned_at, revoked_at, predecessor_mapping_id FROM alpha_actor_mappings WHERE organization_id = ${input.organizationId} AND subject_lookup_digest = ${subjectDigest} AND status = 'active'`;
      if (active.length === 1) throw new AlphaStorageError("conflict", "Actor assignment conflict: mapping already assigned by another request");
      const rows = await tx<AlphaActorMappingDatabaseRow[]>`INSERT INTO alpha_actor_mappings (mapping_id, mapping_revision, actor_ref, organization_id, subject_lookup_digest, status, assigned_at, assignment_idempotency_key) VALUES (${`alpha-actor-mapping:${randomUUID()}`}, 1, ${`actor:${randomUUID()}`}, ${input.organizationId}, ${subjectDigest}, 'active', ${input.assignedAt}, ${input.idempotencyKey}) RETURNING mapping_id, mapping_revision, actor_ref, organization_id, subject_lookup_digest, status, assigned_at, revoked_at, predecessor_mapping_id`;
      return mapAlphaActorMappingRow(rows[0]);
    });
  }

  async resolvePersistenceSafeActor(input: { consumerId: string; organizationId: string; resolvedAt: string }) {
    validateIdentity(input.consumerId, "consumerId"); validateIdentity(input.organizationId, "organizationId");
    if (!Number.isFinite(Date.parse(input.resolvedAt))) throw new AlphaStorageError("integrity-failure", "Invalid actor resolution time");
    const subjectDigest = this.subjectLookupDigest(input.consumerId);
    try {
      const rows = await this.sql<AlphaActorMappingDatabaseRow[]>`SELECT mapping_id, mapping_revision, actor_ref, organization_id, subject_lookup_digest, status, assigned_at, revoked_at, predecessor_mapping_id FROM alpha_actor_mappings WHERE organization_id = ${input.organizationId} AND subject_lookup_digest = ${subjectDigest} AND status = 'active' AND assigned_at <= ${input.resolvedAt}`;
      if (rows.length > 1) throw new AlphaStorageError("integrity-failure", "Ambiguous actor mapping");
      return rows[0] ? mapAlphaActorMappingRow(rows[0]) : undefined;
    } catch (error) { if (error instanceof AlphaStorageError) throw error; throw new AlphaStorageError("unavailable", "Alpha actor mapping store unavailable", true); }
  }

  private async attachActorReferences(records: readonly AlphaOrganizationAccessRecord[], consumerId: string, resolvedAt: string) {
    if (!this.actorSubjectLookupKey) return records;
    return Promise.all(records.map(async (record) => {
      const actorReference = await this.resolvePersistenceSafeActor({ consumerId, organizationId: record.organizationId, resolvedAt });
      return actorReference ? { ...record, actorReference } : record;
    }));
  }

  async findAccessRecordsForConsumer(input: {
    consumerId: string;
    experience: "organization";
    resolvedAt: string;
  }): Promise<readonly AlphaOrganizationAccessRecord[]> {
    validateIdentity(input.consumerId, "consumerId");
    if (
      input.experience !== "organization" ||
      !Number.isFinite(Date.parse(input.resolvedAt))
    ) {
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
          AND experience = ${input.experience}
        ORDER BY organization_id, granted_at, access_record_id
      `;
      return this.attachActorReferences(rows.map(mapAlphaAccessRow), input.consumerId, input.resolvedAt);
    } catch (error) {
      if (error instanceof AlphaStorageError) throw error;
      throw new AlphaStorageError(
        "unavailable",
        "Alpha access store unavailable",
        true,
      );
    }
  }

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
      return this.attachActorReferences(rows.map(mapAlphaAccessRow), input.consumerId, input.resolvedAt);
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

  async restoreAccess(input: RestoreAlphaAccessInput): Promise<{ previous: AlphaOrganizationAccessRecord; next: AlphaOrganizationAccessRecord }> {
    for (const [value, label] of [[input.previousAccessRecordId, "previousAccessRecordId"], [input.nextAccessRecordId, "nextAccessRecordId"], [input.actor, "actor"], [input.reasonCode, "reasonCode"], [input.idempotencyKey, "idempotencyKey"]] as const) validateIdentity(value, label);
    if (!Number.isFinite(Date.parse(input.restoredAt))) throw new AlphaStorageError("integrity-failure", "Invalid restoration time");
    return this.serializable(async (tx) => {
      const existing = await tx<{ predecessor_access_record_id: string | null; successor_access_record_id: string | null }[]>`SELECT predecessor_access_record_id, successor_access_record_id FROM alpha_access_lifecycle_events WHERE idempotency_key = ${input.idempotencyKey}`;
      if (existing.length === 1) {
        if (existing[0].predecessor_access_record_id !== input.previousAccessRecordId || existing[0].successor_access_record_id !== input.nextAccessRecordId) throw new AlphaStorageError("conflict", "Restoration idempotency identity conflict");
        return { previous: mapAlphaAccessRow(await this.loadById(tx, input.previousAccessRecordId)), next: mapAlphaAccessRow(await this.loadById(tx, input.nextAccessRecordId)) };
      }
      const previous = await this.loadById(tx, input.previousAccessRecordId, true);
      if (previous.status !== "revoked") throw new AlphaStorageError("invalid-transition", "Only the revoked chain head may be restored");
      await tx`SELECT pg_advisory_xact_lock(hashtextextended(${`${previous.consumer_id}:${previous.organization_id}:${previous.experience}`}, 0))`;
      if (!previous.revoked_at || Date.parse(input.restoredAt) < new Date(previous.revoked_at).getTime()) {
        throw new AlphaStorageError("invalid-transition", "Restoration cannot become effective before revocation");
      }
      const terminals = await tx<{ access_record_id: string }[]>`
        SELECT candidate.access_record_id
        FROM alpha_access_records candidate
        WHERE candidate.policy_id = ${previous.policy_id}
          AND candidate.policy_version = ${previous.policy_version}
          AND candidate.consumer_id = ${previous.consumer_id}
          AND candidate.organization_id = ${previous.organization_id}
          AND candidate.experience = ${previous.experience}
          AND NOT EXISTS (
            SELECT 1 FROM alpha_access_records successor
            WHERE successor.supersedes_access_record_id = candidate.access_record_id
          )
      `;
      if (terminals.length !== 1 || terminals[0].access_record_id !== input.previousAccessRecordId) {
        throw new AlphaStorageError("invalid-transition", "Only the exact current chain head may be restored");
      }
      const successors = await tx<{ access_record_id: string }[]>`SELECT access_record_id FROM alpha_access_records WHERE supersedes_access_record_id = ${input.previousAccessRecordId}`;
      if (successors.length !== 0) throw new AlphaStorageError("invalid-transition", "Stale or forked restoration refused");
      const rows = await tx<AlphaAccessDatabaseRow[]>`
        INSERT INTO alpha_access_records (access_record_id, policy_id, policy_version, consumer_id, organization_id, relationship, experience, scope_type, scope_id, status, granted_at, granted_by, expires_at, supersedes_access_record_id, administrative_idempotency_key, created_at, updated_at)
        VALUES (${input.nextAccessRecordId}, ${previous.policy_id}, ${previous.policy_version}, ${previous.consumer_id}, ${previous.organization_id}, ${previous.relationship}, ${previous.experience}, ${previous.scope_type}, ${previous.scope_id}, 'active', ${input.restoredAt}, ${input.actor}, ${previous.expires_at}, ${input.previousAccessRecordId}, ${input.idempotencyKey}, ${input.restoredAt}, ${input.restoredAt})
        RETURNING access_record_id, policy_id, policy_version, consumer_id, organization_id, relationship, experience, scope_type, scope_id, status, granted_at, expires_at, revoked_at, supersedes_access_record_id
      `;
      await tx`INSERT INTO alpha_access_lifecycle_events (event_id, access_record_id, actor, action, reason_code, idempotency_key, occurred_at, predecessor_access_record_id, successor_access_record_id) VALUES (${eventId("grant", input.idempotencyKey)}, ${input.nextAccessRecordId}, ${input.actor}, 'grant', ${input.reasonCode}, ${input.idempotencyKey}, ${input.restoredAt}, ${input.previousAccessRecordId}, ${input.nextAccessRecordId})`;
      return { previous: mapAlphaAccessRow(previous), next: mapAlphaAccessRow(rows[0]) };
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
