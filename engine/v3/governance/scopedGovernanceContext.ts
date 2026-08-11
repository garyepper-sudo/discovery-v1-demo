import { createHash } from "node:crypto";

export const SCOPED_GOVERNANCE_CONTEXT_VERSION = "1";
export type GovernedScopeType = "organization" | "function" | "department" | "team" | "initiative" | "private-workspace" | "restricted";
export type GovernedScopeRef = { organizationId: string; type: GovernedScopeType; id: string };
export type ScopedGovernanceOperation = "understanding:disclose-direct" | "understanding:disclose-derived" | "understanding:read-historical" | "understanding:read-historical-metadata" | "organizational-understanding:revise-confidence-uncertainty" | "contribution:submit" | "contribution:request-evidence-candidacy" | "source-content:write" | "source-content:read-for-proposal" | "source-content:read-for-evidence-admission" | "source-content:reset-development" | "source-binding:register-local" | "source-binding:resolve-current" | "source-binding:revise-availability" | "product-artifact:read" | "product-artifact:reuse" | "product-artifact:compare" | "product-artifact:prepare-again" | "product-artifact:create-successor" | "product-workspace:read" | "leadership-history:list" | "leadership-history:read";
export type GovernedSensitivity = "standard" | "restricted" | "private";
export type ScopedAuthorityGrant = {
  authorityRef: string; policyRef: string; organizationId: string; subjectId: string;
  scope: GovernedScopeRef; operations: ScopedGovernanceOperation[];
  sensitivity: GovernedSensitivity[];
  relationship: "direct" | "descendant" | "initiative-member" | "private-owner" | "restricted-authority";
  status: "active" | "revoked"; validFrom: string; validUntil?: string; revokedAt?: string;
};
export type ScopedGovernanceTemporalContext = { mode: "current" } | { mode: "historical"; revisionRef: string; snapshotAt: string };
export type ScopedGovernanceContextRequest = {
  organizationId: string; subjectId: string; requestedScope: GovernedScopeRef;
  operation: ScopedGovernanceOperation; purpose: string; sensitivity: GovernedSensitivity;
  evaluatedAt: string; temporal: ScopedGovernanceTemporalContext;
  serverResolvedAuthority: readonly ScopedAuthorityGrant[];
};
type DenialReason = "organization-mismatch" | "invalid-request" | "authority-missing" | "authority-revoked" | "operation-not-authorized" | "scope-not-authorized" | "sensitivity-not-authorized" | "historical-reference-invalid";
type ContextBase = {
  version: typeof SCOPED_GOVERNANCE_CONTEXT_VERSION; contextId: string;
  organizationId: string; subjectId: string; requestedScope: GovernedScopeRef;
  operation: ScopedGovernanceOperation; purpose: string; sensitivity: GovernedSensitivity;
  evaluatedAt: string; temporal: ScopedGovernanceTemporalContext;
};
export type ScopedGovernanceContext =
  | ContextBase & { disposition: "authorized"; authorityRefs: string[]; policyRefs: string[]; relationship: ScopedAuthorityGrant["relationship"] }
  | ContextBase & { disposition: "denied" | "invalid"; reason: DenialReason; authorityRefs: []; policyRefs: [] };

const compare = (left: string, right: string): number => left.localeCompare(right);
function stable(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.entries(value as Record<string, unknown>).sort(([a],[b]) => compare(a,b)).map(([key,item]) => JSON.stringify(key) + ":" + stable(item)).join(",") + "}";
  return JSON.stringify(value);
}
function identity(value: unknown): string { return "scoped-governance-context:" + createHash("sha256").update(stable(value)).digest("hex"); }
function exact(value: string): boolean { return value.trim() === value && value.length > 0 && value !== "*"; }
function timestamp(value: string): boolean { return exact(value) && Number.isFinite(Date.parse(value)); }
function sameScope(left: GovernedScopeRef, right: GovernedScopeRef): boolean {
  return left.organizationId === right.organizationId && left.type === right.type && left.id === right.id;
}
function base(request: ScopedGovernanceContextRequest): Omit<ContextBase, "contextId"> {
  return { version: SCOPED_GOVERNANCE_CONTEXT_VERSION, organizationId: request.organizationId, subjectId: request.subjectId, requestedScope: structuredClone(request.requestedScope), operation: request.operation, purpose: request.purpose, sensitivity: request.sensitivity, evaluatedAt: request.evaluatedAt, temporal: structuredClone(request.temporal) };
}
function denied(request: ScopedGovernanceContextRequest, reason: DenialReason, disposition: "denied" | "invalid" = "denied"): ScopedGovernanceContext {
  const safe = base(request);
  return { ...safe, contextId: identity({ ...safe, reason }), disposition, reason, authorityRefs: [], policyRefs: [] };
}
function validGrant(grant: ScopedAuthorityGrant, request: ScopedGovernanceContextRequest): boolean {
  return grant.status === "active" && exact(grant.authorityRef) && exact(grant.policyRef) && grant.organizationId === request.organizationId && grant.subjectId === request.subjectId && grant.scope.organizationId === request.organizationId && timestamp(grant.validFrom) && Date.parse(grant.validFrom) <= Date.parse(request.evaluatedAt) && (!grant.validUntil || (timestamp(grant.validUntil) && Date.parse(grant.validUntil) > Date.parse(request.evaluatedAt)));
}

/**
 * Resolves server-loaded authority into one reusable scoped context. Role names
 * and reporting hierarchy are absent: exact grants, scope, operation,
 * sensitivity, purpose, and time own authorization.
 */
export function resolveScopedGovernanceContext(request: ScopedGovernanceContextRequest): ScopedGovernanceContext {
  if (!exact(request.organizationId) || !exact(request.subjectId) || !exact(request.requestedScope.id) || !exact(request.purpose) || !timestamp(request.evaluatedAt) || request.requestedScope.organizationId !== request.organizationId) return denied(request, "invalid-request", "invalid");
  if (request.temporal.mode === "historical" && (!exact(request.temporal.revisionRef) || !timestamp(request.temporal.snapshotAt))) return denied(request, "historical-reference-invalid", "invalid");
  const subjectGrants = request.serverResolvedAuthority.filter((grant) => grant.organizationId === request.organizationId && grant.subjectId === request.subjectId).sort((a,b) => compare(a.authorityRef,b.authorityRef));
  if (!subjectGrants.length) return denied(request, "authority-missing");
  const current = subjectGrants.filter((grant) => validGrant(grant, request));
  if (!current.length && subjectGrants.some((grant) => grant.status === "revoked" && (!grant.revokedAt || Date.parse(grant.revokedAt) <= Date.parse(request.evaluatedAt)))) return denied(request, "authority-revoked");
  if (!current.some((grant) => grant.operations.includes(request.operation))) return denied(request, "operation-not-authorized");
  const scoped = current.filter((grant) => sameScope(grant.scope, request.requestedScope));
  if (!scoped.length) return denied(request, "scope-not-authorized");
  const sensitive = scoped.filter((grant) => grant.sensitivity.includes(request.sensitivity));
  if (!sensitive.length) return denied(request, "sensitivity-not-authorized");
  const authorityRefs = [...new Set(sensitive.map((item) => item.authorityRef))].sort(compare);
  const policyRefs = [...new Set(sensitive.map((item) => item.policyRef))].sort(compare);
  const relationship = [...sensitive].sort((a,b) => compare(a.relationship,b.relationship))[0]!.relationship;
  const safe = { ...base(request), disposition: "authorized" as const, authorityRefs, policyRefs, relationship };
  return { ...safe, contextId: identity(safe) };
}
