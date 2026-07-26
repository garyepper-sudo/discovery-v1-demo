import { createHash } from "node:crypto";

import type {
  CanonicalUnderstandingAuthorityTransition,
  CanonicalUnderstandingComposition,
} from "../understanding/buildCanonicalUnderstandingCompatibilityShadow";
import {
  discloseCanonicalOrganizationalUnderstanding,
  type OrganizationalUnderstandingDisclosureDecision,
  type OrganizationalUnderstandingDisclosureResult,
} from "../understanding/discloseCanonicalOrganizationalUnderstanding";

export const ALPHA_ALLOWLIST_POLICY_ID =
  "alpha-explicit-allowlist-disclosure";
export const ALPHA_ALLOWLIST_POLICY_VERSION = "1";
export const ALPHA_ORGANIZATION_EXPERIENCE = "organization";

export type VerifiedConsumerIdentity = {
  consumerId: string;
  provider: "clerk";
  verificationId: string;
  verifiedAt: string;
};

export type AlphaOrganizationAccessRecord = {
  accessRecordId: string;
  policyId: typeof ALPHA_ALLOWLIST_POLICY_ID;
  policyVersion: typeof ALPHA_ALLOWLIST_POLICY_VERSION;
  consumerId: string;
  organizationId: string;
  relationship: "allowed_alpha_user";
  supportedExperiences: readonly [typeof ALPHA_ORGANIZATION_EXPERIENCE];
  scope: {
    type: "organization";
    organizationId: string;
  };
  status: "active" | "revoked";
  createdAt: string;
  validUntil?: string;
  revokedAt?: string;
  supersedesAccessRecordId?: string;
};

export interface AlphaAccessRecordReader {
  findAccessRecords(input: {
    consumerId: string;
    organizationId: string;
    experience: typeof ALPHA_ORGANIZATION_EXPERIENCE;
  }): readonly AlphaOrganizationAccessRecord[];
}

export type AlphaDisclosureReasonCode =
  | "active-explicit-access"
  | "access-revoked"
  | "access-record-conflict"
  | "access-record-invalid"
  | "access-record-missing"
  | "access-record-reader-unavailable"
  | "authority-receipt-invalid"
  | "authority-receipt-missing"
  | "composition-identity-invalid"
  | "identity-invalid"
  | "policy-input-invalid"
  | "request-experience-unsupported";

export type AlphaOrganizationAccessPreflight = {
  preflightId: string;
  policyId: typeof ALPHA_ALLOWLIST_POLICY_ID;
  policyVersion: typeof ALPHA_ALLOWLIST_POLICY_VERSION;
  consumerId: string;
  organizationId: string;
  experience: typeof ALPHA_ORGANIZATION_EXPERIENCE;
  resolvedAt: string;
  disposition: "eligible" | "denied" | "revoked" | "invalid";
  reasonCodes: AlphaDisclosureReasonCode[];
  accessRecord?: AlphaOrganizationAccessRecord;
};

export type AlphaCanonicalAuthorityReceipt = {
  receiptId: string;
  organizationId: string;
  compositionId: string;
  revisionId: string;
  transition: CanonicalUnderstandingAuthorityTransition;
};

export type AlphaCompositionReference = {
  compositionId: string;
  revisionId: string;
  authorityReceiptId: string;
};

export type ResolveAlphaDisclosureDecisionInput = {
  identity: VerifiedConsumerIdentity;
  organizationId: string;
  experience: typeof ALPHA_ORGANIZATION_EXPERIENCE;
  requestedCompositions: readonly CanonicalUnderstandingComposition[];
  authorityReceipts: readonly AlphaCanonicalAuthorityReceipt[];
  resolvedAt: string;
  preflight: AlphaOrganizationAccessPreflight;
};

export type AlphaDisclosureDecisionDisposition =
  | "disclosed"
  | "partially-disclosed"
  | "withheld"
  | "revoked"
  | "invalid";

export type AlphaDisclosureDecisionProvenance = {
  policyId: typeof ALPHA_ALLOWLIST_POLICY_ID;
  policyVersion: typeof ALPHA_ALLOWLIST_POLICY_VERSION;
  consumerId: string;
  organizationId: string;
  experience: typeof ALPHA_ORGANIZATION_EXPERIENCE;
  resolvedAt: string;
  disposition: AlphaDisclosureDecisionDisposition;
  reasonCodes: AlphaDisclosureReasonCode[];
  accessRecordId?: string;
  supersedesAccessRecordId?: string;
  validUntil?: string;
  requestedCompositionRefs: AlphaCompositionReference[];
  disclosedCompositionRefs: AlphaCompositionReference[];
  withheldCompositionRefs: AlphaCompositionReference[];
};

export type AlphaDisclosureDecisionAuditEvent = {
  eventId: string;
  decisionId: string;
  eventType: "alpha-disclosure-decision-resolved";
  policyId: typeof ALPHA_ALLOWLIST_POLICY_ID;
  policyVersion: typeof ALPHA_ALLOWLIST_POLICY_VERSION;
  consumerId: string;
  organizationId: string;
  experience: typeof ALPHA_ORGANIZATION_EXPERIENCE;
  accessRecordId?: string;
  disposition: AlphaDisclosureDecisionDisposition;
  sourceRevisionIds: string[];
  authorityReceiptIds: string[];
  resolvedAt: string;
  reasonCodes: AlphaDisclosureReasonCode[];
};

export type AlphaAllowlistDisclosureResolution = {
  decision: OrganizationalUnderstandingDisclosureDecision;
  disclosure: OrganizationalUnderstandingDisclosureResult;
  provenance: AlphaDisclosureDecisionProvenance;
  auditEvent: AlphaDisclosureDecisionAuditEvent;
};

export interface AlphaRuntimeCompositionLoader {
  load(input: {
    organizationId: string;
  }): {
    organizationId: string;
    compositions: readonly CanonicalUnderstandingComposition[];
    authorityReceipts: readonly AlphaCanonicalAuthorityReceipt[];
  };
}

export type AlphaAllowlistDisclosureShadowResult = {
  preflight: AlphaOrganizationAccessPreflight;
  resolution?: AlphaAllowlistDisclosureResolution;
  runtimeLoadState: "not-invoked" | "loaded" | "failed" | "identity-mismatch";
};

const compare = (left: string, right: string): number =>
  left.localeCompare(right);

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => compare(left, right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function digest(prefix: string, value: unknown): string {
  const hash = createHash("sha256").update(stable(value)).digest("hex");
  return `${prefix}:${hash}`;
}

function isNonemptyIdentity(value: string): boolean {
  return (
    value.trim() === value &&
    value.length > 0 &&
    value !== "*" &&
    !value.includes("\0")
  );
}

function validTimestamp(value: string): boolean {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    Number.isFinite(Date.parse(value))
  );
}

function uniqueSorted<T>(
  values: readonly T[],
  identity: (value: T) => string,
): T[] {
  return [...new Map(
    values
      .map((value) => [identity(value), value] as const)
      .sort(([left], [right]) => compare(left, right)),
  ).values()];
}

function copyAccessRecord(
  record: AlphaOrganizationAccessRecord,
): AlphaOrganizationAccessRecord {
  return structuredClone(record);
}

function validIdentity(
  identity: VerifiedConsumerIdentity | null | undefined,
  resolvedAt: string,
): identity is VerifiedConsumerIdentity {
  return Boolean(
    identity &&
      identity.provider === "clerk" &&
      isNonemptyIdentity(identity.consumerId) &&
      isNonemptyIdentity(identity.verificationId) &&
      validTimestamp(identity.verifiedAt) &&
      Date.parse(identity.verifiedAt) <= Date.parse(resolvedAt),
  );
}

function validAccessRecord(
  record: AlphaOrganizationAccessRecord,
  input: {
    consumerId: string;
    organizationId: string;
    experience: typeof ALPHA_ORGANIZATION_EXPERIENCE;
    resolvedAt: string;
  },
): boolean {
  if (
    !isNonemptyIdentity(record.accessRecordId) ||
    record.policyId !== ALPHA_ALLOWLIST_POLICY_ID ||
    record.policyVersion !== ALPHA_ALLOWLIST_POLICY_VERSION ||
    record.consumerId !== input.consumerId ||
    record.organizationId !== input.organizationId ||
    record.relationship !== "allowed_alpha_user" ||
    record.supportedExperiences.length !== 1 ||
    record.supportedExperiences[0] !== input.experience ||
    record.scope.type !== "organization" ||
    record.scope.organizationId !== input.organizationId ||
    !validTimestamp(record.createdAt) ||
    Date.parse(record.createdAt) > Date.parse(input.resolvedAt)
  ) {
    return false;
  }

  if (
    record.validUntil !== undefined &&
    (!validTimestamp(record.validUntil) ||
      Date.parse(record.validUntil) < Date.parse(record.createdAt))
  ) {
    return false;
  }

  if (record.status === "active") {
    return record.revokedAt === undefined;
  }

  return Boolean(
    record.status === "revoked" &&
      record.revokedAt &&
      validTimestamp(record.revokedAt) &&
      Date.parse(record.revokedAt) >= Date.parse(record.createdAt),
  );
}

function terminalAccessRecord(
  records: readonly AlphaOrganizationAccessRecord[],
): {
  record?: AlphaOrganizationAccessRecord;
  conflict: boolean;
} {
  const ids = records.map((record) => record.accessRecordId);
  if (new Set(ids).size !== records.length) return { conflict: true };

  const byId = new Map(
    records.map((record) => [record.accessRecordId, record] as const),
  );
  const superseded = new Set<string>();

  for (const record of records) {
    if (!record.supersedesAccessRecordId) continue;
    if (
      record.supersedesAccessRecordId === record.accessRecordId ||
      !byId.has(record.supersedesAccessRecordId)
    ) {
      return { conflict: true };
    }
    superseded.add(record.supersedesAccessRecordId);
  }

  const terminals = records.filter(
    (record) => !superseded.has(record.accessRecordId),
  );
  if (terminals.length !== 1) return { conflict: true };

  const visited = new Set<string>();
  let current: AlphaOrganizationAccessRecord | undefined = terminals[0];
  while (current) {
    if (visited.has(current.accessRecordId)) return { conflict: true };
    visited.add(current.accessRecordId);
    current = current.supersedesAccessRecordId
      ? byId.get(current.supersedesAccessRecordId)
      : undefined;
  }
  if (visited.size !== records.length) return { conflict: true };

  const terminal = terminals[0];
  if (
    terminal.status === "active" &&
    records.some((record) => record.status === "revoked")
  ) {
    return { conflict: true };
  }
  return { record: terminal, conflict: false };
}

function preflight(
  input: {
    identity: VerifiedConsumerIdentity | null | undefined;
    organizationId: string;
    experience: string;
    resolvedAt: string;
  },
  disposition: AlphaOrganizationAccessPreflight["disposition"],
  reasonCodes: readonly AlphaDisclosureReasonCode[],
  accessRecord?: AlphaOrganizationAccessRecord,
): AlphaOrganizationAccessPreflight {
  const consumerId = input.identity?.consumerId ?? "";
  const normalizedReasons = [...new Set(reasonCodes)].sort(compare);
  const result: Omit<AlphaOrganizationAccessPreflight, "preflightId"> = {
    policyId: ALPHA_ALLOWLIST_POLICY_ID,
    policyVersion: ALPHA_ALLOWLIST_POLICY_VERSION,
    consumerId,
    organizationId: input.organizationId,
    experience: ALPHA_ORGANIZATION_EXPERIENCE,
    resolvedAt: input.resolvedAt,
    disposition,
    reasonCodes: normalizedReasons,
    ...(accessRecord ? { accessRecord: copyAccessRecord(accessRecord) } : {}),
  };
  return {
    preflightId: digest("alpha-access-preflight", result),
    ...result,
  };
}

export function preflightAlphaOrganizationAccess(
  input: {
    identity: VerifiedConsumerIdentity | null | undefined;
    organizationId: string;
    experience: string;
    resolvedAt: string;
  },
  accessReader: AlphaAccessRecordReader,
): AlphaOrganizationAccessPreflight {
  if (
    !validTimestamp(input.resolvedAt) ||
    !isNonemptyIdentity(input.organizationId)
  ) {
    return preflight(input, "invalid", ["policy-input-invalid"]);
  }
  if (!validIdentity(input.identity, input.resolvedAt)) {
    return preflight(input, "invalid", ["identity-invalid"]);
  }
  const identity = input.identity;
  if (input.experience !== ALPHA_ORGANIZATION_EXPERIENCE) {
    return preflight(input, "denied", ["request-experience-unsupported"]);
  }

  let records: readonly AlphaOrganizationAccessRecord[];
  try {
    records = accessReader.findAccessRecords({
      consumerId: identity.consumerId,
      organizationId: input.organizationId,
      experience: ALPHA_ORGANIZATION_EXPERIENCE,
    });
  } catch {
    return preflight(input, "denied", [
      "access-record-reader-unavailable",
    ]);
  }

  if (records.length === 0) {
    return preflight(input, "denied", ["access-record-missing"]);
  }
  if (
    records.some(
      (record) =>
        !validAccessRecord(record, {
          consumerId: identity.consumerId,
          organizationId: input.organizationId,
          experience: ALPHA_ORGANIZATION_EXPERIENCE,
          resolvedAt: input.resolvedAt,
        }),
    )
  ) {
    return preflight(input, "invalid", ["access-record-invalid"]);
  }

  const resolved = terminalAccessRecord(records);
  if (resolved.conflict || !resolved.record) {
    return preflight(input, "invalid", ["access-record-conflict"]);
  }
  if (
    resolved.record.validUntil &&
    Date.parse(resolved.record.validUntil) < Date.parse(input.resolvedAt)
  ) {
    return preflight(input, "denied", ["access-record-missing"]);
  }
  if (resolved.record.status === "revoked") {
    return preflight(
      input,
      "revoked",
      ["access-revoked"],
      resolved.record,
    );
  }
  return preflight(
    input,
    "eligible",
    ["active-explicit-access"],
    resolved.record,
  );
}

function authorityReceiptIdentity(input: {
  organizationId: string;
  compositionId: string;
  revisionId: string;
  transition: CanonicalUnderstandingAuthorityTransition;
}): string {
  return digest("alpha-authority-receipt", input);
}

export function buildAlphaCanonicalAuthorityReceipt(
  composition: CanonicalUnderstandingComposition,
): AlphaCanonicalAuthorityReceipt | null {
  if (!composition.authorityTransition) return null;
  const receipt = {
    organizationId: composition.organizationId,
    compositionId: composition.id,
    revisionId: composition.revisionId,
    transition: structuredClone(composition.authorityTransition),
  };
  return {
    receiptId: authorityReceiptIdentity(receipt),
    ...receipt,
  };
}

function validAuthorityReceipt(
  composition: CanonicalUnderstandingComposition,
  receipt: AlphaCanonicalAuthorityReceipt,
): boolean {
  const transition = composition.authorityTransition;
  return Boolean(
    transition &&
      composition.organizationId === receipt.organizationId &&
      composition.id === receipt.compositionId &&
      composition.revisionId === receipt.revisionId &&
      receipt.receiptId ===
        authorityReceiptIdentity({
          organizationId: receipt.organizationId,
          compositionId: receipt.compositionId,
          revisionId: receipt.revisionId,
          transition: receipt.transition,
        }) &&
      stable(transition) === stable(receipt.transition) &&
      transition.disposition === "authorized-organizational-knowledge" &&
      transition.authorityOwner ===
        "canonical-organizational-understanding" &&
      transition.explanationIds.length > 0 &&
      stable([...transition.explanationIds].sort(compare)) ===
        stable([...composition.explanationIds].sort(compare)),
  );
}

function compositionReference(
  composition: CanonicalUnderstandingComposition,
  authorityReceiptId: string,
): AlphaCompositionReference {
  return {
    compositionId: composition.id,
    revisionId: composition.revisionId,
    authorityReceiptId,
  };
}

function makeResolution(input: {
  identity: VerifiedConsumerIdentity;
  organizationId: string;
  resolvedAt: string;
  preflight: AlphaOrganizationAccessPreflight;
  requestedRefs: readonly AlphaCompositionReference[];
  validCompositions: readonly CanonicalUnderstandingComposition[];
  validRefs: readonly AlphaCompositionReference[];
  withheldRefs: readonly AlphaCompositionReference[];
  reasonCodes: readonly AlphaDisclosureReasonCode[];
  disposition: AlphaDisclosureDecisionDisposition;
}): AlphaAllowlistDisclosureResolution {
  const reasonCodes = [...new Set(input.reasonCodes)].sort(compare);
  const decisionDisposition =
    input.preflight.disposition === "revoked"
      ? "revoked"
      : input.preflight.disposition === "eligible"
        ? "eligible"
        : "withheld";
  const decisionIdentity = {
    policyId: ALPHA_ALLOWLIST_POLICY_ID,
    policyVersion: ALPHA_ALLOWLIST_POLICY_VERSION,
    consumerId: input.identity.consumerId,
    organizationId: input.organizationId,
    experience: ALPHA_ORGANIZATION_EXPERIENCE,
    accessRecordId: input.preflight.accessRecord?.accessRecordId ?? null,
    requestedRefs: input.requestedRefs,
    validRefs: input.validRefs,
    resolvedAt: input.resolvedAt,
    disposition: decisionDisposition,
    reasonCodes,
  };
  const decision: OrganizationalUnderstandingDisclosureDecision = {
    id: digest("alpha-disclosure-decision", decisionIdentity),
    organizationId: input.organizationId,
    consumerId: input.identity.consumerId,
    disposition: decisionDisposition,
    effectiveAt: input.resolvedAt,
    basis: reasonCodes,
  };
  const disclosure = discloseCanonicalOrganizationalUnderstanding({
    organizationId: input.organizationId,
    consumerId: input.identity.consumerId,
    decision,
    compositions: input.validCompositions,
  });
  const accessRecord = input.preflight.accessRecord;
  const provenance: AlphaDisclosureDecisionProvenance = {
    policyId: ALPHA_ALLOWLIST_POLICY_ID,
    policyVersion: ALPHA_ALLOWLIST_POLICY_VERSION,
    consumerId: input.identity.consumerId,
    organizationId: input.organizationId,
    experience: ALPHA_ORGANIZATION_EXPERIENCE,
    resolvedAt: input.resolvedAt,
    disposition: input.disposition,
    reasonCodes,
    ...(accessRecord
      ? {
          accessRecordId: accessRecord.accessRecordId,
          ...(accessRecord.supersedesAccessRecordId
            ? {
                supersedesAccessRecordId:
                  accessRecord.supersedesAccessRecordId,
              }
            : {}),
          ...(accessRecord.validUntil
            ? { validUntil: accessRecord.validUntil }
            : {}),
        }
      : {}),
    requestedCompositionRefs: [...input.requestedRefs],
    disclosedCompositionRefs: [...input.validRefs],
    withheldCompositionRefs: [...input.withheldRefs],
  };
  const auditBody: Omit<AlphaDisclosureDecisionAuditEvent, "eventId"> = {
    decisionId: decision.id,
    eventType: "alpha-disclosure-decision-resolved" as const,
    policyId: ALPHA_ALLOWLIST_POLICY_ID,
    policyVersion: ALPHA_ALLOWLIST_POLICY_VERSION,
    consumerId: input.identity.consumerId,
    organizationId: input.organizationId,
    experience: ALPHA_ORGANIZATION_EXPERIENCE,
    ...(accessRecord ? { accessRecordId: accessRecord.accessRecordId } : {}),
    disposition: input.disposition,
    sourceRevisionIds: input.validRefs
      .map((reference) => reference.revisionId)
      .sort(compare),
    authorityReceiptIds: input.validRefs
      .map((reference) => reference.authorityReceiptId)
      .sort(compare),
    resolvedAt: input.resolvedAt,
    reasonCodes,
  };
  return {
    decision,
    disclosure,
    provenance,
    auditEvent: {
      eventId: digest("alpha-disclosure-audit-event", auditBody),
      ...auditBody,
    },
  };
}

export function resolveAlphaAllowlistDisclosureDecision(
  input: ResolveAlphaDisclosureDecisionInput,
): AlphaAllowlistDisclosureResolution {
  const preflightMatches =
    input.preflight.policyId === ALPHA_ALLOWLIST_POLICY_ID &&
    input.preflight.policyVersion === ALPHA_ALLOWLIST_POLICY_VERSION &&
    input.preflight.consumerId === input.identity.consumerId &&
    input.preflight.organizationId === input.organizationId &&
    input.preflight.experience === input.experience &&
    input.preflight.resolvedAt === input.resolvedAt;

  if (
    !validTimestamp(input.resolvedAt) ||
    !validIdentity(input.identity, input.resolvedAt) ||
    !isNonemptyIdentity(input.organizationId) ||
    input.experience !== ALPHA_ORGANIZATION_EXPERIENCE ||
    !preflightMatches ||
    input.preflight.disposition !== "eligible"
  ) {
    const reasonCodes: AlphaDisclosureReasonCode[] =
      input.preflight.disposition === "revoked"
        ? ["access-revoked"]
        : input.preflight.reasonCodes.length > 0
          ? input.preflight.reasonCodes
          : ["policy-input-invalid"];
    return makeResolution({
      identity: input.identity,
      organizationId: input.organizationId,
      resolvedAt: input.resolvedAt,
      preflight: input.preflight,
      requestedRefs: [],
      validCompositions: [],
      validRefs: [],
      withheldRefs: [],
      reasonCodes,
      disposition:
        input.preflight.disposition === "revoked" ? "revoked" : "invalid",
    });
  }

  const compositions = [...input.requestedCompositions].sort((left, right) =>
    compare(`${left.id}\0${left.revisionId}`, `${right.id}\0${right.revisionId}`),
  );
  const receipts = [...input.authorityReceipts].sort((left, right) =>
    compare(left.receiptId, right.receiptId),
  );
  const duplicateCompositions =
    uniqueSorted(
      compositions,
      (composition) => `${composition.id}\0${composition.revisionId}`,
    ).length !== compositions.length;
  const duplicateReceipts =
    uniqueSorted(receipts, (receipt) => receipt.receiptId).length !==
    receipts.length;
  const receiptsByComposition = new Map<string, AlphaCanonicalAuthorityReceipt[]>();
  for (const receipt of receipts) {
    const key = `${receipt.compositionId}\0${receipt.revisionId}`;
    receiptsByComposition.set(key, [
      ...(receiptsByComposition.get(key) ?? []),
      receipt,
    ]);
  }

  const validCompositions: CanonicalUnderstandingComposition[] = [];
  const validRefs: AlphaCompositionReference[] = [];
  const withheldRefs: AlphaCompositionReference[] = [];
  const reasonCodes: AlphaDisclosureReasonCode[] = [
    "active-explicit-access",
  ];

  for (const composition of compositions) {
    const key = `${composition.id}\0${composition.revisionId}`;
    const matching = receiptsByComposition.get(key) ?? [];
    const safeReceiptId =
      matching.length === 1 ? matching[0].receiptId : "unavailable";
    const reference = compositionReference(composition, safeReceiptId);

    if (
      composition.organizationId !== input.organizationId ||
      !isNonemptyIdentity(composition.id) ||
      !isNonemptyIdentity(composition.revisionId)
    ) {
      withheldRefs.push(reference);
      reasonCodes.push("composition-identity-invalid");
      continue;
    }
    if (matching.length === 0) {
      withheldRefs.push(reference);
      reasonCodes.push("authority-receipt-missing");
      continue;
    }
    if (
      matching.length !== 1 ||
      !validAuthorityReceipt(composition, matching[0])
    ) {
      withheldRefs.push(reference);
      reasonCodes.push("authority-receipt-invalid");
      continue;
    }

    validCompositions.push(structuredClone(composition));
    validRefs.push(compositionReference(composition, matching[0].receiptId));
  }

  const unmatchedReceipt = receipts.some(
    (receipt) =>
      !compositions.some(
        (composition) =>
          composition.id === receipt.compositionId &&
          composition.revisionId === receipt.revisionId,
      ),
  );
  if (duplicateCompositions) {
    reasonCodes.push("composition-identity-invalid");
  }
  if (duplicateReceipts || unmatchedReceipt) {
    reasonCodes.push("authority-receipt-invalid");
  }

  const inputInvalid =
    duplicateCompositions || duplicateReceipts || unmatchedReceipt;
  const requestedRefs = inputInvalid
    ? []
    : [...validRefs, ...withheldRefs].sort((left, right) =>
        compare(
          `${left.compositionId}\0${left.revisionId}`,
          `${right.compositionId}\0${right.revisionId}`,
        ),
      );
  const safeValidCompositions = inputInvalid ? [] : validCompositions;
  const safeValidRefs = inputInvalid ? [] : validRefs;
  const safeWithheldRefs = inputInvalid ? [] : withheldRefs;
  const disposition: AlphaDisclosureDecisionDisposition = inputInvalid
    ? "invalid"
    : validRefs.length === 0
      ? "withheld"
      : withheldRefs.length > 0
        ? "partially-disclosed"
        : "disclosed";

  return makeResolution({
    identity: input.identity,
    organizationId: input.organizationId,
    resolvedAt: input.resolvedAt,
    preflight: input.preflight,
    requestedRefs,
    validCompositions: safeValidCompositions,
    validRefs: safeValidRefs,
    withheldRefs: safeWithheldRefs,
    reasonCodes,
    disposition,
  });
}

export function runAlphaAllowlistDisclosureShadow(
  input: {
    identity: VerifiedConsumerIdentity | null | undefined;
    organizationId: string;
    experience: string;
    resolvedAt: string;
  },
  dependencies: {
    accessReader: AlphaAccessRecordReader;
    runtimeLoader: AlphaRuntimeCompositionLoader;
  },
): AlphaAllowlistDisclosureShadowResult {
  const access = preflightAlphaOrganizationAccess(
    input,
    dependencies.accessReader,
  );
  if (access.disposition !== "eligible" || !input.identity) {
    return {
      preflight: access,
      ...(input.identity &&
      validIdentity(input.identity, input.resolvedAt) &&
      isNonemptyIdentity(input.organizationId)
        ? {
            resolution: resolveAlphaAllowlistDisclosureDecision({
              identity: input.identity,
              organizationId: input.organizationId,
              experience: ALPHA_ORGANIZATION_EXPERIENCE,
              requestedCompositions: [],
              authorityReceipts: [],
              resolvedAt: input.resolvedAt,
              preflight: access,
            }),
          }
        : {}),
      runtimeLoadState: "not-invoked",
    };
  }

  let loaded: ReturnType<AlphaRuntimeCompositionLoader["load"]>;
  try {
    loaded = dependencies.runtimeLoader.load({
      organizationId: input.organizationId,
    });
  } catch {
    return {
      preflight: access,
      runtimeLoadState: "failed",
    };
  }
  if (loaded.organizationId !== input.organizationId) {
    return {
      preflight: access,
      runtimeLoadState: "identity-mismatch",
    };
  }

  return {
    preflight: access,
    resolution: resolveAlphaAllowlistDisclosureDecision({
      identity: input.identity,
      organizationId: input.organizationId,
      experience: ALPHA_ORGANIZATION_EXPERIENCE,
      requestedCompositions: loaded.compositions,
      authorityReceipts: loaded.authorityReceipts,
      resolvedAt: input.resolvedAt,
      preflight: access,
    }),
    runtimeLoadState: "loaded",
  };
}
