import {
  assertAlphaContentSafeObservabilityEventV1,
  type AlphaContentSafeObservabilityEventV1,
} from "../observability/alphaContentSafeObservabilityContracts";

export const ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION = "1" as const;
export const ALPHA_TELEMETRY_PURPOSE = "alpha-product-improvement" as const;
export const alphaFeedbackDimensions = [
  "usefulness",
  "surprise-reduction",
  "understanding-improvement",
] as const;
export const alphaFeedbackRatings = [
  "not-helpful",
  "somewhat-helpful",
  "helpful",
] as const;
export const alphaOperatorScopes = [
  "consent-admin",
  "telemetry-read",
  "telemetry-delete",
  "retention-sweep",
  "zero-verify",
] as const;
export const alphaProgressiveDisclosureCategories = [
  "not-applicable",
  "questions-tensions",
  "reasoning-provenance",
] as const;
export type AlphaFeedbackDimension = (typeof alphaFeedbackDimensions)[number];
export type AlphaFeedbackRating = (typeof alphaFeedbackRatings)[number];
export type AlphaOperatorScope = (typeof alphaOperatorScopes)[number];
export type AlphaTelemetryPseudonym = `atp_${string}`;
export type AlphaLifecycleTelemetry = {
  eventCategory: AlphaContentSafeObservabilityEventV1["eventCategory"];
  workflowStage: AlphaContentSafeObservabilityEventV1["workflowStage"];
  transitionCategory: AlphaContentSafeObservabilityEventV1["transitionCategory"];
  outcomeCategory: AlphaContentSafeObservabilityEventV1["outcomeCategory"];
  roleCategory: AlphaContentSafeObservabilityEventV1["roleCategory"];
  occurrenceCategory: AlphaContentSafeObservabilityEventV1["occurrenceCategory"];
  viewportCategory: AlphaContentSafeObservabilityEventV1["viewportCategory"];
  latencyBucket: AlphaContentSafeObservabilityEventV1["latencyBucket"];
  replayRecoveryCategory: AlphaContentSafeObservabilityEventV1["replayRecoveryCategory"];
  failureCategory: AlphaContentSafeObservabilityEventV1["failureCategory"];
  buildCategory: AlphaContentSafeObservabilityEventV1["buildCategory"];
  protectedLoadCategory: AlphaContentSafeObservabilityEventV1["protectedLoadCategory"];
  progressiveDisclosureCategory: (typeof alphaProgressiveDisclosureCategories)[number];
};
export type AlphaTelemetryRecord = {
  schemaVersion: typeof ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION;
  recordId: string;
  organizationPseudonym: AlphaTelemetryPseudonym;
  organizationPseudonyms: AlphaTelemetryPseudonym[];
  keyVersion: string;
  purpose: typeof ALPHA_TELEMETRY_PURPOSE;
  kind: "lifecycle" | "feedback";
  eventTime: string;
  expiresAt: string;
  lifecycle?: AlphaLifecycleTelemetry;
  feedback?: { dimension: AlphaFeedbackDimension; rating: AlphaFeedbackRating };
  integrityMac: string;
};
export type AlphaConsentReceipt = {
  receiptId: string;
  organizationPseudonym: AlphaTelemetryPseudonym;
  organizationPseudonyms: AlphaTelemetryPseudonym[];
  keyVersion: string;
  purpose: typeof ALPHA_TELEMETRY_PURPOSE;
  contractVersion: typeof ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION;
  writtenConsentProofDigest: string;
  activatedAt: string;
  validUntil: string;
  status: "active" | "deletion-pending" | "revoked";
  complianceExpiresAt?: string;
  integrityMac: string;
};
export type AlphaOperatorGrant = {
  grantId: string;
  operatorPseudonym: AlphaTelemetryPseudonym;
  organizationPseudonym: AlphaTelemetryPseudonym;
  organizationPseudonyms: AlphaTelemetryPseudonym[];
  keyVersion: string;
  purpose: typeof ALPHA_TELEMETRY_PURPOSE;
  scopes: AlphaOperatorScope[];
  issuedAt: string;
  validUntil: string;
  status: "active" | "revoked";
  complianceExpiresAt?: string;
  integrityMac: string;
};
export type AlphaTelemetryAudit = {
  auditId: string;
  operatorPseudonym: AlphaTelemetryPseudonym;
  organizationPseudonym: AlphaTelemetryPseudonym;
  organizationPseudonyms: AlphaTelemetryPseudonym[];
  keyVersion: string;
  purpose: typeof ALPHA_TELEMETRY_PURPOSE;
  operation: "consent" | "read" | "delete" | "sweep" | "revoke" | "zero-verify";
  outcome: "success" | "denied" | "blocked";
  occurredAt: string;
  complianceExpiresAt: string;
  integrityMac: string;
};
export type AlphaDeletionReceipt = {
  receiptId: string;
  organizationPseudonym: AlphaTelemetryPseudonym;
  organizationPseudonyms: AlphaTelemetryPseudonym[];
  keyVersion: string;
  keyVersions: string[];
  deletedPayloadCount: number;
  occurredAt: string;
  complianceExpiresAt: string;
  integrityMac: string;
};
export const ALPHA_TELEMETRY_RETENTION_DAYS = 90 as const;
export const ALPHA_TELEMETRY_COMPLIANCE_RETENTION_DAYS = 90 as const;
export const ALPHA_TELEMETRY_PHYSICAL_DELETION_MAX_HOURS = 24 as const;
export type AlphaTelemetryState = {
  schemaVersion: typeof ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION;
  revision: number;
  records: AlphaTelemetryRecord[];
  consents: AlphaConsentReceipt[];
  grants: AlphaOperatorGrant[];
  audits: AlphaTelemetryAudit[];
  deletions: AlphaDeletionReceipt[];
  indexes: {
    primary: Record<string, string>;
    organization: Record<string, string[]>;
    expiry: Record<string, string[]>;
    feedback: Record<string, string[]>;
    audit: Record<string, string[]>;
  };
};
export type AlphaTelemetryOutcome =
  | "persisted"
  | "disabled"
  | "consent-unavailable"
  | "key-unavailable"
  | "rejected"
  | "repository-unavailable"
  | "deleted"
  | "denied";
const token = /^[a-z0-9][a-z0-9_-]{0,79}$/u,
  digest = /^[a-f0-9]{64}$/u;
export function assertClosedFeedback(
  value: unknown,
): asserts value is {
  dimension: AlphaFeedbackDimension;
  rating: AlphaFeedbackRating;
} {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("Feedback is invalid.");
  const r = value as Record<string, unknown>;
  if (
    Object.keys(r).sort().join(",") !== "dimension,rating" ||
    !alphaFeedbackDimensions.includes(r.dimension as AlphaFeedbackDimension) ||
    !alphaFeedbackRatings.includes(r.rating as AlphaFeedbackRating)
  )
    throw new Error("Feedback is invalid.");
}
export function assertTelemetryRecord(record: AlphaTelemetryRecord): void {
  const allowed=record.kind==="lifecycle"?["schemaVersion","recordId","organizationPseudonym","organizationPseudonyms","keyVersion","purpose","kind","eventTime","expiresAt","lifecycle","integrityMac"]:["schemaVersion","recordId","organizationPseudonym","organizationPseudonyms","keyVersion","purpose","kind","eventTime","expiresAt","feedback","integrityMac"];
  if(Object.keys(record).length!==allowed.length||Object.keys(record).some(key=>!allowed.includes(key)))throw new Error("Telemetry record is invalid.");
  if (
    record.schemaVersion !== ALPHA_PRODUCT_TELEMETRY_SCHEMA_VERSION ||
    !token.test(record.recordId) ||
    !/^atp_[a-f0-9]{64}$/u.test(record.organizationPseudonym) ||
    !Array.isArray(record.organizationPseudonyms) || record.organizationPseudonyms.length===0 || new Set(record.organizationPseudonyms).size!==record.organizationPseudonyms.length || !record.organizationPseudonyms.every(value=>/^atp_[a-f0-9]{64}$/u.test(value)) || !record.organizationPseudonyms.includes(record.organizationPseudonym) ||
    !token.test(record.keyVersion) ||
    record.purpose !== ALPHA_TELEMETRY_PURPOSE ||
    !digest.test(record.integrityMac) ||
    !Number.isFinite(Date.parse(record.eventTime)) ||
    !Number.isFinite(Date.parse(record.expiresAt))
  )
    throw new Error("Telemetry record is invalid.");
  if (record.kind === "lifecycle") {
    if (
      !record.lifecycle ||
      record.feedback ||
      !alphaProgressiveDisclosureCategories.includes(
        record.lifecycle.progressiveDisclosureCategory,
      )
    )
      throw new Error("Telemetry record is invalid.");
    const { progressiveDisclosureCategory, ...event } = record.lifecycle;
    assertAlphaContentSafeObservabilityEventV1({
      ...event,
      schemaVersion: "1",
      sequence: 1,
      correlation: "run-1",
    });
  } else {
    if (record.lifecycle || !record.feedback)
      throw new Error("Telemetry record is invalid.");
    assertClosedFeedback(record.feedback);
  }
}
