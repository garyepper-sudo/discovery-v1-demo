import { createHash } from "node:crypto";

import type {
  GovernedScopeRef,
  GovernedSensitivity,
  ScopedGovernanceContext,
} from "./scopedGovernanceContext";

export const EXECUTIVE_HISTORY_ACCESS_VERSION = "1" as const;

export type ExecutiveHistoryRecordKind = "executive-review" | "executive-learning";
export type ExecutiveHistoryAccessAction =
  | "history:list"
  | "review:read"
  | "outcome:read"
  | "learning:read"
  | "relationship:publish"
  | "relationship:list"
  | "relationship:detail"
  | "access:inspect"
  | "access:administer"
  | "access:revoke"
  | "access:restore";
export type ExecutiveHistoryLifecycle =
  | "pending"
  | "active"
  | "revoked"
  | "restored"
  | "superseded";
export type ExecutiveHistoryPolicyLifecycle =
  | "pending"
  | "active"
  | "revoked"
  | "superseded";
export type ExecutiveHistoryAudienceClause =
  | { kind: "direct"; subjectId: string; assignmentRevision: string }
  | { kind: "scope"; scope: GovernedScopeRef; coverage: "exact" | "explicit-descendants" };

export type ExecutiveHistoryAccessPolicyRevisionV1 = {
  contractVersion: typeof EXECUTIVE_HISTORY_ACCESS_VERSION;
  policyId: string;
  policyRevisionId: string;
  revision: number;
  organizationId: string;
  actions: ExecutiveHistoryAccessAction[];
  purposes: string[];
  sensitivity: GovernedSensitivity;
  audience: ExecutiveHistoryAudienceClause[];
  state: ExecutiveHistoryPolicyLifecycle;
  effectiveAt: string;
  expiresAt: string | null;
  predecessorRevisionId: string | null;
  authorityRevisionRefs: string[];
  fingerprint: string;
  integrityDigest: string;
};

export type ExecutiveHistoryAccessBindingV1 = {
  contractVersion: typeof EXECUTIVE_HISTORY_ACCESS_VERSION;
  bindingId: string;
  bindingRevisionId: string;
  revision: number;
  organizationId: string;
  recordKind: ExecutiveHistoryRecordKind;
  recordId: string;
  semanticOwner: "executive-review" | "executive-learning";
  parentReviewId: string | null;
  policyId: string;
  policyRevisionId: string;
  sensitivity: GovernedSensitivity;
  creationOperationId: string;
  semanticOwnerPublicationRef: string | null;
  semanticOwnerIntegrityDigest: string | null;
  state: ExecutiveHistoryLifecycle;
  effectiveAt: string;
  predecessorRevisionId: string | null;
  fingerprint: string;
  integrityDigest: string;
};

export type ExecutiveHistoryAccessEventV1 = {
  contractVersion: "1";
  eventId: string;
  organizationId: string;
  eventType:
    | "policy-pending"
    | "policy-created"
    | "policy-activated"
    | "policy-revised"
    | "policy-revoked"
    | "policy-restored"
    | "binding-pending"
    | "binding-activated"
    | "binding-revoked"
    | "binding-restored"
    | "binding-superseded"
    | "collision-denied";
  recordId: string | null;
  policyId: string | null;
  revisionRef: string;
  occurredAt: string;
  actorRef: string;
  eventDigest: string;
};

export type ExecutiveHistoryAccessStoreV1 = {
  contractVersion: "1";
  organizationId: string;
  policies: ExecutiveHistoryAccessPolicyRevisionV1[];
  bindings: ExecutiveHistoryAccessBindingV1[];
  events: ExecutiveHistoryAccessEventV1[];
  idempotency: { keyDigest: string; requestFingerprint: string; resultRef: string }[];
  storeDigest: string;
};

export type ExecutiveHistoryAccessRequestV1 = {
  contractVersion: "1";
  organizationId: string;
  subjectId: string;
  recordKind: ExecutiveHistoryRecordKind | "observed-outcome";
  recordId: string;
  parentReviewId?: string;
  action: ExecutiveHistoryAccessAction;
  purpose: string;
  requestedScope: GovernedScopeRef;
  sensitivity: GovernedSensitivity;
  evaluatedAt: string;
  assignment: {
    assignmentId: string;
    assignmentRevision: string;
    state: "active" | "inactive" | "revoked";
  } | null;
  governance: ScopedGovernanceContext;
};

export type ExecutiveHistoryAccessResultV1 = {
  contractVersion: "1";
  organizationId: string;
  subjectId: string;
  recordKind: ExecutiveHistoryAccessRequestV1["recordKind"];
  recordId: string;
  parentReviewId: string | null;
  action: ExecutiveHistoryAccessAction;
  purpose: string;
  evaluatedAt: string;
  disposition: "authorized" | "inaccessible";
  bindingRevisionId: string | null;
  policyRevisionId: string | null;
  matchedAuthorityRevisionRefs: string[];
  matchedAudience: "direct" | "scope" | null;
  resultDigest: string;
};

export function executiveHistoryStable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(executiveHistoryStable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${executiveHistoryStable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export const executiveHistoryDigest = (value: unknown): string =>
  createHash("sha256")
    .update(typeof value === "string" ? value : executiveHistoryStable(value))
    .digest("hex");

export const executiveHistoryId = (prefix: string, ...parts: unknown[]): string =>
  `${prefix}:${executiveHistoryDigest(parts)}`;

const exact = (value: string): boolean =>
  value.trim() === value && value.length > 0 && value !== "*" && !value.includes("\0");

export function assertExecutiveHistoryPolicy(value: ExecutiveHistoryAccessPolicyRevisionV1): void {
  const { integrityDigest, ...unsigned } = value;
  if (
    value.contractVersion !== "1" ||
    ![value.policyId, value.policyRevisionId, value.organizationId, value.fingerprint].every(exact) ||
    value.revision < 1 ||
    value.actions.length === 0 ||
    value.purposes.length === 0 ||
    value.audience.length === 0 ||
    (value.revision === 1) !== (value.predecessorRevisionId === null) ||
    executiveHistoryDigest(unsigned) !== integrityDigest
  ) {
    throw new Error("Executive History access policy integrity failed.");
  }
}

export function assertExecutiveHistoryBinding(value: ExecutiveHistoryAccessBindingV1): void {
  const { integrityDigest, ...unsigned } = value;
  if (
    value.contractVersion !== "1" ||
    ![
      value.bindingId,
      value.bindingRevisionId,
      value.organizationId,
      value.recordId,
      value.policyId,
      value.policyRevisionId,
      value.creationOperationId,
      value.fingerprint,
    ].every(exact) ||
    value.revision < 1 ||
    (value.revision === 1) !== (value.predecessorRevisionId === null) ||
    (value.recordKind === "executive-review") !== (value.semanticOwner === "executive-review") ||
    (value.recordKind === "executive-review" && value.parentReviewId !== null) ||
    (value.recordKind === "executive-learning" && !value.parentReviewId) ||
    executiveHistoryDigest(unsigned) !== integrityDigest
  ) {
    throw new Error("Executive History access binding integrity failed.");
  }
}

export function assertExecutiveHistoryAccessResult(value: ExecutiveHistoryAccessResultV1): void {
  const { resultDigest, ...unsigned } = value;
  if (executiveHistoryDigest(unsigned) !== resultDigest) {
    throw new Error("Executive History access result integrity failed.");
  }
}
