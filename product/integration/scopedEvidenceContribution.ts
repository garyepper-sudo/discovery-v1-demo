import { createHash } from "node:crypto";
import type { GovernedScopeRef, GovernedSensitivity, ScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";

export type ScopedContributionPropagation = "local-only" | "upward-consideration" | "lateral-initiative-consideration" | "broader-evidence-candidacy";
export type ScopedContributionRequest = {
  organizationId: string; contributorId: string; sourceScope: GovernedScopeRef;
  targetScope: GovernedScopeRef; purpose: string; sourceRef: string;
  sensitivity: GovernedSensitivity; propagation: ScopedContributionPropagation;
  idempotencyKey: string; contributedAt: string; contextRef?: string;
  governance: ScopedGovernanceContext;
};
export type ScopedContributionResult = {
  contributionId: string; organizationId: string; contributorId: string;
  sourceScope: GovernedScopeRef; targetScope: GovernedScopeRef;
  disposition: "rejected" | "retained-locally" | "accepted-governed-contribution" | "eligible-for-evidence-candidacy" | "deferred-for-review";
  propagation: "local-only" | "eligible-for-upward-consideration" | "eligible-for-lateral-initiative-consideration" | "eligible-for-broader-evidence-candidacy" | "prohibited";
  evidenceCandidateDisposition: "not-created" | "eligible-not-created";
  evidenceAdmissionDisposition: "not-evaluated";
  canonicalUnderstandingChanged: false;
  authorityRefs: string[];
  reason: "authorized-local-contribution" | "authorized-candidacy-request" | "private-content-retained-locally" | "review-required" | "organization-mismatch" | "current-authority-denied" | "scope-not-authorized" | "sensitivity-not-authorized" | "invalid-request";
  evaluatedAt: string;
};
const compare = (left: string, right: string): number => left.localeCompare(right);
function stable(value: unknown): string {
  if (Array.isArray(value)) return "[" + value.map(stable).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.entries(value as Record<string, unknown>).sort(([a],[b]) => compare(a,b)).map(([key,item]) => JSON.stringify(key) + ":" + stable(item)).join(",") + "}";
  return JSON.stringify(value);
}
type ResultFields = Omit<ScopedContributionResult, "contributionId" | "organizationId" | "contributorId" | "sourceScope" | "targetScope" | "authorityRefs" | "evaluatedAt" | "evidenceAdmissionDisposition" | "canonicalUnderstandingChanged">;
function result(request: ScopedContributionRequest, fields: ResultFields): ScopedContributionResult {
  const authorityRefs = request.governance.disposition === "authorized" ? [...request.governance.authorityRefs] : [];
  const safe = { organizationId: request.organizationId, contributorId: request.contributorId, sourceScope: structuredClone(request.sourceScope), targetScope: structuredClone(request.targetScope), ...fields, evidenceAdmissionDisposition: "not-evaluated" as const, canonicalUnderstandingChanged: false as const, authorityRefs, evaluatedAt: request.governance.evaluatedAt };
  return { contributionId: "scoped-contribution:" + createHash("sha256").update(stable([request.idempotencyKey, safe])).digest("hex"), ...safe };
}
function rejected(request: ScopedContributionRequest, reason: ScopedContributionResult["reason"]): ScopedContributionResult {
  return result(request, { disposition: "rejected", propagation: "prohibited", evidenceCandidateDisposition: "not-created", reason });
}

/** Evaluates contribution authority without creating or admitting Evidence. */
export function evaluateScopedEvidenceContribution(request: ScopedContributionRequest): ScopedContributionResult {
  const governance = request.governance;
  if (request.organizationId !== governance.organizationId || request.sourceScope.organizationId !== request.organizationId || request.targetScope.organizationId !== request.organizationId) return rejected(request, "organization-mismatch");
  if (governance.disposition !== "authorized" || governance.subjectId !== request.contributorId) return rejected(request, "current-authority-denied");
  if (governance.operation !== "contribution:submit" && governance.operation !== "contribution:request-evidence-candidacy") return rejected(request, "current-authority-denied");
  if (governance.requestedScope.id !== request.targetScope.id || governance.requestedScope.type !== request.targetScope.type) return rejected(request, "scope-not-authorized");
  if (governance.sensitivity !== request.sensitivity) return rejected(request, "sensitivity-not-authorized");
  if (!request.idempotencyKey.trim() || !request.sourceRef.trim() || !request.purpose.trim() || request.purpose !== governance.purpose || !Number.isFinite(Date.parse(request.contributedAt))) return rejected(request, "invalid-request");
  if (request.sensitivity === "private" || request.targetScope.type === "private-workspace") return result(request, { disposition: "retained-locally", propagation: "local-only", evidenceCandidateDisposition: "not-created", reason: "private-content-retained-locally" });
  if (request.propagation === "broader-evidence-candidacy" && governance.operation === "contribution:request-evidence-candidacy") return result(request, { disposition: "eligible-for-evidence-candidacy", propagation: "eligible-for-broader-evidence-candidacy", evidenceCandidateDisposition: "eligible-not-created", reason: "authorized-candidacy-request" });
  if (request.propagation === "upward-consideration") return result(request, { disposition: "deferred-for-review", propagation: "eligible-for-upward-consideration", evidenceCandidateDisposition: "not-created", reason: "review-required" });
  if (request.propagation === "lateral-initiative-consideration") {
    if (request.targetScope.type !== "initiative" || governance.relationship !== "initiative-member") return rejected(request, "scope-not-authorized");
    return result(request, { disposition: "accepted-governed-contribution", propagation: "eligible-for-lateral-initiative-consideration", evidenceCandidateDisposition: "not-created", reason: "authorized-local-contribution" });
  }
  return result(request, { disposition: "accepted-governed-contribution", propagation: "local-only", evidenceCandidateDisposition: "not-created", reason: "authorized-local-contribution" });
}
