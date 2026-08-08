import type {
  AlphaDisclosureDecisionAuditEvent,
  AlphaOrganizationAccessRecord,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import type { PersistenceSafeActorReferenceV1 } from "../../engine/v3/governance/persistenceSafeActorReference";

export type AlphaStorageErrorCode =
  | "unavailable"
  | "conflict"
  | "invalid-transition"
  | "integrity-failure";

export class AlphaStorageError extends Error {
  constructor(
    readonly code: AlphaStorageErrorCode,
    message: string,
    readonly retryable = false,
  ) {
    super(message);
    this.name = "AlphaStorageError";
  }
}

export type GrantAlphaAccessInput = {
  accessRecordId: string;
  consumerId: string;
  organizationId: string;
  experience: "organization";
  actor: string;
  reasonCode: string;
  idempotencyKey: string;
  grantedAt: string;
  expiresAt?: string;
};

export type AssignPersistenceSafeActorInput = {
  consumerId: string;
  organizationId: string;
  idempotencyKey: string;
  assignedAt: string;
};

export interface PersistenceSafeActorReferenceRepository {
  assignPersistenceSafeActor(input: AssignPersistenceSafeActorInput): Promise<PersistenceSafeActorReferenceV1>;
  resolvePersistenceSafeActor(input: { consumerId: string; organizationId: string; resolvedAt: string }): Promise<PersistenceSafeActorReferenceV1 | undefined>;
}

export type RevokeAlphaAccessInput = {
  accessRecordId: string;
  actor: string;
  reasonCode: string;
  idempotencyKey: string;
  revokedAt: string;
};

export type RestoreAlphaAccessInput = {
  previousAccessRecordId: string;
  nextAccessRecordId: string;
  actor: string;
  reasonCode: string;
  idempotencyKey: string;
  restoredAt: string;
};

export type SupersedeAlphaAccessInput = {
  previousAccessRecordId: string;
  nextAccessRecordId: string;
  actor: string;
  reasonCode: string;
  idempotencyKey: string;
  supersededAt: string;
  expiresAt?: string;
};

export interface AlphaAccessRecordRepository {
  findAccessRecordsForConsumer(input: {
    consumerId: string;
    experience: "organization";
    resolvedAt: string;
  }): Promise<readonly AlphaOrganizationAccessRecord[]>;
  findAccessRecords(input: {
    consumerId: string;
    organizationId: string;
    experience: "organization";
    resolvedAt: string;
  }): Promise<readonly AlphaOrganizationAccessRecord[]>;
  grantAccess(input: GrantAlphaAccessInput): Promise<AlphaOrganizationAccessRecord>;
  revokeAccess(input: RevokeAlphaAccessInput): Promise<AlphaOrganizationAccessRecord>;
  supersedeAccess(input: SupersedeAlphaAccessInput): Promise<{
    previous: AlphaOrganizationAccessRecord;
    next: AlphaOrganizationAccessRecord;
  }>;
}

export interface RestorableAlphaAccessRecordRepository extends AlphaAccessRecordRepository {
  restoreAccess(input: RestoreAlphaAccessInput): Promise<{
    previous: AlphaOrganizationAccessRecord;
    next: AlphaOrganizationAccessRecord;
  }>;
}

export interface AlphaDisclosureAuditRepository {
  append(
    event: AlphaDisclosureDecisionAuditEvent,
    transaction?: unknown,
  ): Promise<"inserted" | "already_present_identical">;
}
