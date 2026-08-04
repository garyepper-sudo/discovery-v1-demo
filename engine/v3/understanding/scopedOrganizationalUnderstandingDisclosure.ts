import { createHash } from "node:crypto";
import type { GovernedScopeRef, GovernedSensitivity, ScopedGovernanceContext } from "../governance/scopedGovernanceContext";

export type ScopedDisclosureDerivedKind = "direct-evidence" | "summary" | "explanation" | "confidence-movement" | "contradiction-existence" | "recommendation" | "inferred-relationship" | "aggregate-input" | "trend-input";
export type ScopedDisclosureSupport = { safeRef: string; organizationId: string; scope: GovernedScopeRef; sensitivity: GovernedSensitivity; authorityRef?: string };
export type ScopedDisclosureRequest = {
  requestRef: string; organizationId: string; recipientId: string; scope: GovernedScopeRef;
  sensitivity: GovernedSensitivity; kind: ScopedDisclosureDerivedKind;
  support: readonly ScopedDisclosureSupport[]; supportLineageComplete: boolean;
  safeAbstractionAllowed: boolean; protectedCombination: boolean;
  context: ScopedGovernanceContext;
};
export type ScopedDisclosureDisposition = "disclosed" | "safely-abstracted" | "withheld" | "unavailable" | "insufficient-authorized-information";
type DisclosureReason = "authorized-inputs" | "safe-abstraction-only" | "current-authority-denied" | "organization-mismatch" | "scope-mismatch" | "sensitivity-denied" | "support-lineage-incomplete" | "support-authority-unresolved" | "protected-combination" | "requested-object-unavailable";
export type ScopedDisclosureDecision = {
  decisionId: string; requestRef: string; organizationId: string; recipientId: string;
  requestedScope: GovernedScopeRef; purpose: string; kind: ScopedDisclosureDerivedKind;
  disposition: ScopedDisclosureDisposition; reason: DisclosureReason;
  authorityRefs: string[]; policyRefs: string[]; safeDisclosedLineage: string[];
  evaluatedAt: string; temporalMode: "current" | "historical";
};
const compare = (left: string, right: string): number => left.localeCompare(right);
function stable(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.entries(value as Record<string, unknown>).sort(([a],[b]) => compare(a,b)).map(([key,item]) => JSON.stringify(key) + ":" + stable(item)).join(",") + "}";
  return JSON.stringify(value);
}
function sameScope(left: GovernedScopeRef, right: GovernedScopeRef): boolean { return left.organizationId === right.organizationId && left.type === right.type && left.id === right.id; }
function decision(request: ScopedDisclosureRequest, disposition: ScopedDisclosureDisposition, reason: DisclosureReason, safeLineage: string[] = []): ScopedDisclosureDecision {
  const context = request.context;
  const authorityRefs = context.disposition === "authorized" ? [...context.authorityRefs] : [];
  const policyRefs = context.disposition === "authorized" ? [...context.policyRefs] : [];
  const safe = { requestRef: request.requestRef, organizationId: request.organizationId, recipientId: request.recipientId, requestedScope: structuredClone(request.scope), purpose: context.purpose, kind: request.kind, disposition, reason, authorityRefs, policyRefs, safeDisclosedLineage: [...new Set(safeLineage)].sort(compare), evaluatedAt: context.evaluatedAt, temporalMode: context.temporal.mode };
  return { decisionId: "scoped-disclosure:" + createHash("sha256").update(stable(safe)).digest("hex"), ...safe };
}

/** Evaluates one direct or derived item and emits only safe bounded metadata. */
export function evaluateScopedUnderstandingDisclosure(request: ScopedDisclosureRequest): ScopedDisclosureDecision {
  const context = request.context;
  if (request.organizationId !== context.organizationId || request.scope.organizationId !== request.organizationId) return decision(request, "withheld", "organization-mismatch");
  if (request.recipientId !== context.subjectId || context.disposition !== "authorized") return decision(request, "withheld", "current-authority-denied");
  if (!sameScope(request.scope, context.requestedScope)) return decision(request, "withheld", "scope-mismatch");
  if (request.sensitivity !== context.sensitivity) return decision(request, "withheld", "sensitivity-denied");
  if (!request.requestRef) return decision(request, "unavailable", "requested-object-unavailable");
  if (!request.supportLineageComplete || request.support.length === 0) return decision(request, "insufficient-authorized-information", "support-lineage-incomplete");
  if (request.protectedCombination && request.support.length > 1 && request.sensitivity !== "standard") {
    return request.safeAbstractionAllowed ? decision(request, "safely-abstracted", "safe-abstraction-only") : decision(request, "withheld", "protected-combination");
  }
  const authorizedSupport = request.support.filter((support) => support.organizationId === request.organizationId && sameScope(support.scope, context.requestedScope) && support.sensitivity === context.sensitivity && Boolean(support.authorityRef && context.authorityRefs.includes(support.authorityRef)));
  if (authorizedSupport.length !== request.support.length) return request.safeAbstractionAllowed ? decision(request, "safely-abstracted", "safe-abstraction-only") : decision(request, "withheld", "support-authority-unresolved");
  return decision(request, "disclosed", "authorized-inputs", authorizedSupport.map((support) => support.safeRef));
}

export type HistoricalVisibilityRecord = {
  projectionRef: string; organizationId: string; revisionRef: string; createdAt: string;
  creationAuthorityRef: string; contentAvailable: boolean; safeMetadataAvailable: boolean;
  disclosure: Omit<ScopedDisclosureRequest, "context">;
};
export type HistoricalVisibilityResult = {
  projectionRef: string; revisionRef?: string;
  disposition: "visible" | "safely-abstracted" | "metadata-only" | "withheld" | "unavailable" | "fail-closed";
  currentDecisionId?: string;
  reason: "current-policy-authorized" | "current-policy-abstraction-only" | "current-policy-metadata-only" | "current-policy-withheld" | "revision-unavailable" | "historical-policy-unresolved" | "organization-mismatch";
  evaluatedAt: string;
};
export interface HistoricalVisibilityReader { load(input: { organizationId: string; projectionRef: string; revisionRef: string }): HistoricalVisibilityRecord | undefined }

/** Current authority is resolved before historical content is loaded. */
export function readHistoricalScopedVisibility(input: { organizationId: string; recipientId: string; projectionRef: string; revisionRef: string; context: ScopedGovernanceContext; reader: HistoricalVisibilityReader }): HistoricalVisibilityResult {
  const base = { projectionRef: input.projectionRef, evaluatedAt: input.context.evaluatedAt };
  if (input.context.organizationId !== input.organizationId || input.context.requestedScope.organizationId !== input.organizationId) return { ...base, disposition: "withheld", reason: "organization-mismatch" };
  if (input.context.disposition !== "authorized" || input.context.subjectId !== input.recipientId || input.context.temporal.mode !== "historical" || input.context.temporal.revisionRef !== input.revisionRef) return { ...base, disposition: "fail-closed", reason: "historical-policy-unresolved" };
  const record = input.reader.load({ organizationId: input.organizationId, projectionRef: input.projectionRef, revisionRef: input.revisionRef });
  if (!record || record.organizationId !== input.organizationId || record.revisionRef !== input.revisionRef) return { ...base, disposition: "unavailable", reason: "revision-unavailable" };
  const current = evaluateScopedUnderstandingDisclosure({ ...record.disclosure, context: input.context });
  if (current.disposition === "disclosed" && record.contentAvailable) return { ...base, revisionRef: record.revisionRef, disposition: "visible", currentDecisionId: current.decisionId, reason: "current-policy-authorized" };
  if (current.disposition === "safely-abstracted") return { ...base, revisionRef: record.revisionRef, disposition: "safely-abstracted", currentDecisionId: current.decisionId, reason: "current-policy-abstraction-only" };
  if (record.safeMetadataAvailable) return { ...base, revisionRef: record.revisionRef, disposition: "metadata-only", currentDecisionId: current.decisionId, reason: "current-policy-metadata-only" };
  return { ...base, revisionRef: record.revisionRef, disposition: "withheld", currentDecisionId: current.decisionId, reason: "current-policy-withheld" };
}
