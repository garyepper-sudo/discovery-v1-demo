import { createHash } from "node:crypto";

import { createCanonicalScopeTopology, type CanonicalScopeTopology } from "./canonicalScopeLineage";
import type { GovernedScopeRef } from "./scopedGovernanceContext";

export const RECIPIENT_AUDIENCE_GRANT_VERSION = "1" as const;
export const RECIPIENT_AUDIENCE_RESOURCE_FAMILY = "canonical-organizational-understanding" as const;
export type RecipientAudienceOperation = "receive";
export type RecipientAudiencePurpose = "organizational-understanding";
export type RecipientAudienceCoverage = "exact" | "explicit-descendants";
export type RecipientAudienceGrantState = "proposed" | "active" | "inactive" | "revoked" | "superseded";

export type CurrentOrganizationAccessAssignment = {
  assignmentId: string; assignmentRevision: string; organizationId: string;
  recipientId: string; state: "active" | "inactive" | "revoked";
};
export type RecipientAudienceGrant = {
  kind: "recipient-audience-grant"; schemaVersion: typeof RECIPIENT_AUDIENCE_GRANT_VERSION;
  grantId: string; revisionId: string; revision: number; organizationId: string;
  assignmentId: string; assignmentRevision: string; recipientId: string;
  resourceFamily: typeof RECIPIENT_AUDIENCE_RESOURCE_FAMILY;
  operations: RecipientAudienceOperation[]; purposes: RecipientAudiencePurpose[];
  audienceScopes: GovernedScopeRef[]; coverage: RecipientAudienceCoverage;
  state: RecipientAudienceGrantState; issuerAuthorityRef: string;
  issuerOperation: "audience-grant:administer"; effectiveAt: string;
  supersedesRevisionId: string | null; digest: string;
};
export type RecipientAudienceRequirement = {
  organizationId: string; recipientId: string;
  resourceFamily: typeof RECIPIENT_AUDIENCE_RESOURCE_FAMILY;
  operation: RecipientAudienceOperation; purpose: RecipientAudiencePurpose;
  audienceScope: GovernedScopeRef;
};
export type RecipientAudienceDecisionReason =
  | "authorized-exact" | "authorized-explicit-descendant" | "assignment-inactive"
  | "assignment-invalid" | "grant-missing" | "grant-inactive" | "grant-invalid"
  | "assignment-revision-stale" | "recipient-mismatch" | "organization-mismatch"
  | "resource-mismatch" | "operation-mismatch" | "purpose-mismatch"
  | "scope-unknown" | "scope-not-authorized" | "scope-relation-invalid";
export type RecipientAudienceDecision = {
  kind: "recipient-audience-decision"; schemaVersion: typeof RECIPIENT_AUDIENCE_GRANT_VERSION;
  decisionId: string; disposition: "authorized" | "denied" | "invalid";
  organizationId: string; recipientId: string; evaluatedGrantRevisionIds: string[];
  assignmentId?: string; assignmentRevision?: string; matchedScope?: GovernedScopeRef;
  relationRule?: "exact" | "explicit-contains"; reason: RecipientAudienceDecisionReason;
};

const compare = (a: string, b: string): number => a.localeCompare(b);
function stable(value: unknown): string { if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`; if (value && typeof value === "object") return `{${Object.entries(value as Record<string, unknown>).sort(([a],[b]) => compare(a,b)).map(([k,v]) => `${JSON.stringify(k)}:${stable(v)}`).join(",")}}`; return JSON.stringify(value); }
const hash = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");
const exact = (value: string): boolean => value.trim() === value && value.length > 0 && value !== "*" && !value.includes("\0");
const scopeKey = (s: GovernedScopeRef): string => stable([s.organizationId, s.type, s.id]);
const copyScope = (s: GovernedScopeRef): GovernedScopeRef => ({ organizationId: s.organizationId, type: s.type, id: s.id });
function normalizeScopes(scopes: readonly GovernedScopeRef[]): GovernedScopeRef[] { return [...new Map(scopes.map((s) => [scopeKey(s), copyScope(s)])).values()].sort((a,b) => compare(scopeKey(a), scopeKey(b))); }

export function createRecipientAudienceGrant(input: Omit<RecipientAudienceGrant, "kind" | "schemaVersion" | "grantId" | "revisionId" | "digest" | "audienceScopes" | "operations" | "purposes"> & { audienceScopes: readonly GovernedScopeRef[]; operations: readonly RecipientAudienceOperation[]; purposes: readonly RecipientAudiencePurpose[]; topology: CanonicalScopeTopology }): RecipientAudienceGrant {
  const scopes = normalizeScopes(input.audienceScopes);
  const operations = [...new Set(input.operations)].sort(compare);
  const purposes = [...new Set(input.purposes)].sort(compare);
  if (![input.organizationId,input.assignmentId,input.assignmentRevision,input.recipientId,input.issuerAuthorityRef].every(exact) || input.revision < 1 || !Number.isFinite(Date.parse(input.effectiveAt)) || !scopes.length || !operations.length || !purposes.length) throw new Error("Recipient audience grant identity or authority is invalid.");
  if (input.topology.organizationId !== input.organizationId || scopes.some((s) => s.organizationId !== input.organizationId || !input.topology.nodes.some((n) => scopeKey(n) === scopeKey(s)))) throw new Error("Recipient audience grant scope is unknown or cross-organization.");
  if (input.revision === 1 && input.supersedesRevisionId !== null) throw new Error("Initial audience grant cannot supersede a revision.");
  if (input.revision > 1 && !input.supersedesRevisionId) throw new Error("Audience grant revision requires an exact predecessor.");
  const grantId = `recipient-audience-grant:${hash([input.organizationId,input.assignmentId,input.recipientId,input.resourceFamily,operations,purposes,scopes,input.coverage])}`;
  const unsigned = { kind: "recipient-audience-grant" as const, schemaVersion: RECIPIENT_AUDIENCE_GRANT_VERSION, grantId, revision: input.revision, organizationId: input.organizationId, assignmentId: input.assignmentId, assignmentRevision: input.assignmentRevision, recipientId: input.recipientId, resourceFamily: input.resourceFamily, operations, purposes, audienceScopes: scopes, coverage: input.coverage, state: input.state, issuerAuthorityRef: input.issuerAuthorityRef, issuerOperation: input.issuerOperation, effectiveAt: input.effectiveAt, supersedesRevisionId: input.supersedesRevisionId };
  const revisionId = `recipient-audience-grant-revision:${hash(unsigned)}`;
  return { ...unsigned, revisionId, digest: hash({ ...unsigned, revisionId }) };
}

function validGrant(g: RecipientAudienceGrant, topology: CanonicalScopeTopology): boolean { try { const recreated = createRecipientAudienceGrant({ ...g, topology }); return g.kind === "recipient-audience-grant" && g.schemaVersion === RECIPIENT_AUDIENCE_GRANT_VERSION && recreated.revisionId === g.revisionId && recreated.digest === g.digest; } catch { return false; } }
function contains(topology: CanonicalScopeTopology, from: GovernedScopeRef, to: GovernedScopeRef): boolean {
  const edges = topology.relationships.filter((r) => r.kind === "contains"); const seen = new Set<string>(); const queue = [scopeKey(from)]; const target = scopeKey(to);
  while (queue.length) { const current = queue.shift()!; if (current === target) return true; if (seen.has(current)) continue; seen.add(current); for (const edge of edges) if (scopeKey(edge.from) === current) queue.push(scopeKey(edge.to)); }
  return false;
}
export function evaluateRecipientAudienceAuthority(input: { assignment: CurrentOrganizationAccessAssignment | null; grants: readonly RecipientAudienceGrant[]; requirement: RecipientAudienceRequirement; topology: CanonicalScopeTopology }): RecipientAudienceDecision {
  const { assignment, requirement, topology } = input; const base = { kind: "recipient-audience-decision" as const, schemaVersion: RECIPIENT_AUDIENCE_GRANT_VERSION, organizationId: requirement.organizationId, recipientId: requirement.recipientId };
  const finish = (disposition: RecipientAudienceDecision["disposition"], reason: RecipientAudienceDecisionReason, extra: Partial<RecipientAudienceDecision> = {}): RecipientAudienceDecision => { const unsigned = { ...base, disposition, evaluatedGrantRevisionIds: [...new Set(input.grants.map((g) => g.revisionId))].sort(compare), reason, ...extra }; return { ...unsigned, decisionId: `recipient-audience-decision:${hash(unsigned)}` }; };
  if (!assignment || ![requirement.organizationId,requirement.recipientId,requirement.audienceScope.id,assignment.assignmentId,assignment.assignmentRevision].every(exact)) return finish("invalid", "assignment-invalid");
  try { const rebuilt = createCanonicalScopeTopology({ organizationId: topology.organizationId, topologyVersion: topology.topologyVersion, effectiveAt: topology.effectiveAt, supersedesTopologyId: topology.supersedesTopologyId, nodes: topology.nodes, relationships: topology.relationships }); if (rebuilt.topologyId !== topology.topologyId || rebuilt.digest !== topology.digest) return finish("invalid", "scope-relation-invalid"); } catch { return finish("invalid", "scope-relation-invalid"); }
  if (assignment.organizationId !== requirement.organizationId || requirement.audienceScope.organizationId !== requirement.organizationId || topology.organizationId !== requirement.organizationId) return finish("denied", "organization-mismatch");
  if (assignment.recipientId !== requirement.recipientId) return finish("denied", "recipient-mismatch");
  if (assignment.state !== "active") return finish("denied", "assignment-inactive");
  if (!topology.nodes.some((n) => scopeKey(n) === scopeKey(requirement.audienceScope))) return finish("denied", "scope-unknown");
  const bound = input.grants.filter((g) => g.organizationId === assignment.organizationId && g.assignmentId === assignment.assignmentId && g.recipientId === assignment.recipientId);
  if (!bound.length) return finish("denied", "grant-missing", { assignmentId: assignment.assignmentId, assignmentRevision: assignment.assignmentRevision });
  if (bound.some((g) => !validGrant(g, topology))) return finish("invalid", "grant-invalid");
  const current = bound.filter((g) => g.assignmentRevision === assignment.assignmentRevision && g.state === "active");
  if (!current.length && bound.some((g) => g.assignmentRevision !== assignment.assignmentRevision)) return finish("denied", "assignment-revision-stale");
  if (!current.length) return finish("denied", "grant-inactive");
  const activeByIdentity = new Map<string, RecipientAudienceGrant[]>();
  for (const item of current) activeByIdentity.set(item.grantId, [...(activeByIdentity.get(item.grantId) ?? []), item]);
  if ([...activeByIdentity.values()].some((revisions) => new Set(revisions.map((item) => item.revisionId)).size > 1)) return finish("invalid", "grant-invalid");
  const resourceMatched = current.filter((g) => g.resourceFamily === requirement.resourceFamily);
  if (!resourceMatched.length) return finish("denied", "resource-mismatch");
  const operationMatched = resourceMatched.filter((g) => g.operations.includes(requirement.operation));
  if (!operationMatched.length) return finish("denied", "operation-mismatch");
  const eligible = operationMatched.filter((g) => g.purposes.includes(requirement.purpose));
  if (!eligible.length) return finish("denied", "purpose-mismatch");
  for (const grant of eligible.sort((a,b) => compare(a.revisionId,b.revisionId))) for (const scope of grant.audienceScopes) {
    if (scopeKey(scope) === scopeKey(requirement.audienceScope)) return finish("authorized", "authorized-exact", { assignmentId: assignment.assignmentId, assignmentRevision: assignment.assignmentRevision, matchedScope: copyScope(scope), relationRule: "exact" });
    if (grant.coverage === "explicit-descendants" && contains(topology, scope, requirement.audienceScope)) return finish("authorized", "authorized-explicit-descendant", { assignmentId: assignment.assignmentId, assignmentRevision: assignment.assignmentRevision, matchedScope: copyScope(scope), relationRule: "explicit-contains" });
  }
  return finish("denied", "scope-not-authorized", { assignmentId: assignment.assignmentId, assignmentRevision: assignment.assignmentRevision });
}
