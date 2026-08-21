import type { ScopedGovernanceContext } from "../governance/scopedGovernanceContext";

export const SOURCE_CONTENT_CONTRACT_VERSION = "1" as const;
export type SourceContentMediaTypeV1 = "text/plain" | "text/markdown";

export type SourceContentVersionV1 = {
  contractVersion: "1";
  organizationId: string;
  sourceBindingId: string;
  sourceContentVersionId: string;
  mediaType: SourceContentMediaTypeV1;
  byteLength: number;
  exactContentDigest: string;
  normalizedContentDigest: string;
  storedAt: string;
  storedByActorRef: string;
  idempotencyKeyDigest: string;
  storageIntegrityDigest: string;
};

export type SourceContentWriteRequestV1 = {
  contractVersion: "1";
  organizationId: string;
  sourceBindingId: string;
  purposeRef: string;
  mediaType: SourceContentMediaTypeV1;
  bytes: Uint8Array;
  storedAt: string;
  storedByActorRef: string;
  idempotencyKey: string;
  expectedRepositoryRevision: string | null;
  authorization: ScopedGovernanceContext;
};

export type SourceContentWriteReceiptV1 = {
  contractVersion: "1";
  organizationId: string;
  sourceBindingId: string;
  sourceContentVersionId: string;
  mediaType: SourceContentMediaTypeV1;
  byteLength: number;
  exactContentDigest: string;
  normalizedContentDigest: string;
  repositoryRevision: string;
  disposition: "stored" | "idempotent-replay" | "exact-duplicate";
  storedAt: string;
  storedByActorRef: string;
  receiptDigest: string;
};

export type SourceContentReadRequestV1 = {
  contractVersion: "1";
  organizationId: string;
  sourceBindingId: string;
  sourceContentVersionId: string;
  purposeRef: string;
  authorization: ScopedGovernanceContext;
};

export type SourceContentReadResultV1 = {
  contractVersion: "1";
  version: SourceContentVersionV1;
  bytes: Uint8Array;
  text: string;
};

export type SourceContentMetadataResolutionRequestV1 = {
  contractVersion: "1";
  organizationId: string;
  sourceBindingId: string;
  normalizedContentDigest: string;
  purposeRef: string;
  authorization: ScopedGovernanceContext;
};

export type SourceContentMetadataResolutionResultV1 = {
  contractVersion: "1";
  version: SourceContentVersionV1;
};

export type SourceContentRepositorySnapshotV1 = {
  contractVersion: "1";
  organizationId: string;
  repositoryRevision: string;
  versions: SourceContentVersionV1[];
  idempotency: Array<{ idempotencyKeyDigest: string; requestFingerprint: string; sourceContentVersionId: string }>;
  snapshotDigest: string;
};

export type SourceContentDevelopmentResetRequestV1 = {
  contractVersion: "1";
  environment: "development" | "sandbox" | "test";
  organizationId: string;
  purposeRef: string;
  actorRef: string;
  authorization: ScopedGovernanceContext;
};

export type SourceContentDevelopmentResetReceiptV1 = {
  contractVersion: "1";
  organizationId: string;
  removed: boolean;
  resetAt: string;
  receiptDigest: string;
};

export type ResolvedSourceContentWriteV1 = Omit<SourceContentWriteRequestV1, "authorization" | "idempotencyKey"> & {
  exactContentDigest: string;
  normalizedContentDigest: string;
  idempotencyKeyDigest: string;
  requestFingerprint: string;
};

export interface SourceContentRepository {
  inspectRevision(organizationId: string): Promise<string | null>;
  write(input: ResolvedSourceContentWriteV1): Promise<SourceContentWriteReceiptV1>;
  read(organizationId: string, sourceContentVersionId: string): Promise<{ version: SourceContentVersionV1; bytes: Uint8Array } | null>;
  resolveExactMetadata?(organizationId: string, sourceBindingId: string, normalizedContentDigest: string): Promise<SourceContentVersionV1 | null>;
  resetDevelopmentFixture(organizationId: string): Promise<boolean>;
}

export interface SourceContentClock { now(): string }
