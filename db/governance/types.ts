import type {
  AlphaDisclosureDecisionAuditEvent,
  AlphaOrganizationAccessRecord,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";

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

export type RevokeAlphaAccessInput = {
  accessRecordId: string;
  actor: string;
  reasonCode: string;
  idempotencyKey: string;
  revokedAt: string;
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

export interface AlphaDisclosureAuditRepository {
  append(
    event: AlphaDisclosureDecisionAuditEvent,
    transaction?: unknown,
  ): Promise<"inserted" | "already_present_identical">;
}
