import { createHash } from "node:crypto";

import type { CanonicalMaterialEvidenceSupportV1 } from "../governance/canonicalDerivedArtifactGovernanceAncestry";
import type {
  GovernedScopeRef,
  GovernedSensitivity,
  ScopedGovernanceContext,
} from "../governance/scopedGovernanceContext";

export const CANONICAL_UNDERSTANDING_CURRENT_ELIGIBILITY_VERSION = "1" as const;

export type CanonicalUnderstandingEligibilityDisposition =
  | "eligible"
  | "withheld"
  | "unavailable";

export type CanonicalUnderstandingCurrentEligibilityRequestV1 = {
  contractVersion: "1";
  organizationId: string;
  subjectId: string;
  purposeRef: string;
  requestedScope: GovernedScopeRef;
  sensitivity: GovernedSensitivity;
  evaluatedAt: string;
  authorizationContextRef: string;
  canonicalUnderstandingRevision: string;
  audienceLineageDigest: string;
  lineagePolicyVersion: string;
  materialSupports: readonly CanonicalMaterialEvidenceSupportV1[];
};

export type CurrentMaterialSourceBindingResolution = {
  organizationId: string;
  historicalBindingId: string;
  currentBindingRevisionRef: string;
  currentGovernanceRevisionRef: string;
  availability: "available" | "revoked" | "unavailable";
  purposeRefs: readonly string[];
  scopes: readonly GovernedScopeRef[];
};

export type CanonicalUnderstandingCurrentEligibilityResultV1 = {
  contractVersion: "1";
  organizationId: string;
  subjectId: string;
  purposeRef: string;
  requestedScopeDigest: string;
  sensitivity: GovernedSensitivity;
  evaluatedAt: string;
  authorizationContextRef: string;
  canonicalUnderstandingRevision: string;
  audienceLineageDigest: string;
  lineagePolicyVersion: string;
  disposition: CanonicalUnderstandingEligibilityDisposition;
  reasonClasses: readonly (
    | "current-authority-denied"
    | "current-binding-revoked"
    | "current-purpose-denied"
    | "current-scope-denied"
    | "current-sensitivity-denied"
    | "material-lineage-unavailable"
  )[];
  eligibleArtifactRevisionDigests: readonly string[];
  currentGovernanceRevisionRefs: readonly string[];
  resultDigest: string;
};

export type CanonicalUnderstandingCurrentEligibilityDependencies = {
  authorization: ScopedGovernanceContext;
  resolveCurrentSourceBinding(input: {
    organizationId: string;
    historicalBindingId: string;
    historicalGovernanceRevisionRef: string;
    evaluatedAt: string;
  }): CurrentMaterialSourceBindingResolution | undefined;
  isPurposeCompatible(input: {
    requestedPurpose: string;
    materialPurposeRefs: readonly string[];
  }): boolean;
};

const compare = (left: string, right: string): number => left.localeCompare(right);
const exact = (value: string): boolean => value.length > 0 && value.trim() === value && value !== "*";
const sameScope = (left: GovernedScopeRef, right: GovernedScopeRef): boolean =>
  left.organizationId === right.organizationId && left.type === right.type && left.id === right.id;
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
const digest = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");
export const canonicalUnderstandingCurrentEligibilityScopeDigest = (
  scope: GovernedScopeRef,
): string => digest(scope);
const unique = (values: readonly string[]): string[] => [...new Set(values)].sort(compare);

function finish(
  request: CanonicalUnderstandingCurrentEligibilityRequestV1,
  disposition: CanonicalUnderstandingEligibilityDisposition,
  reasonClasses: CanonicalUnderstandingCurrentEligibilityResultV1["reasonClasses"],
  governanceRefs: readonly string[],
): CanonicalUnderstandingCurrentEligibilityResultV1 {
  const unsigned = {
    contractVersion: CANONICAL_UNDERSTANDING_CURRENT_ELIGIBILITY_VERSION,
    organizationId: request.organizationId,
    subjectId: request.subjectId,
    purposeRef: request.purposeRef,
    requestedScopeDigest: canonicalUnderstandingCurrentEligibilityScopeDigest(request.requestedScope),
    sensitivity: request.sensitivity,
    evaluatedAt: request.evaluatedAt,
    authorizationContextRef: request.authorizationContextRef,
    canonicalUnderstandingRevision: request.canonicalUnderstandingRevision,
    audienceLineageDigest: request.audienceLineageDigest,
    lineagePolicyVersion: request.lineagePolicyVersion,
    disposition,
    reasonClasses: [...new Set(reasonClasses)].sort(compare),
    eligibleArtifactRevisionDigests:
      disposition === "eligible"
        ? unique(request.materialSupports.map((support) => support.attributionDigest))
        : [],
    currentGovernanceRevisionRefs: unique(governanceRefs),
  };
  return { ...unsigned, resultDigest: digest(unsigned) };
}

/**
 * Read-only server operation. Immutable lineage is input evidence; current
 * binding and authority state are resolved only through injected owners.
 */
export function resolveCanonicalUnderstandingCurrentEligibility(
  request: CanonicalUnderstandingCurrentEligibilityRequestV1,
  dependencies: CanonicalUnderstandingCurrentEligibilityDependencies,
): CanonicalUnderstandingCurrentEligibilityResultV1 {
  const allowed = new Set([
    "contractVersion", "organizationId", "subjectId", "purposeRef",
    "requestedScope", "sensitivity", "evaluatedAt", "authorizationContextRef",
    "canonicalUnderstandingRevision", "audienceLineageDigest",
    "lineagePolicyVersion", "materialSupports",
  ]);
  if (
    Object.keys(request).some((key) => !allowed.has(key)) ||
    request.contractVersion !== "1" ||
    ![
      request.organizationId, request.subjectId, request.purposeRef,
      request.authorizationContextRef, request.canonicalUnderstandingRevision,
      request.audienceLineageDigest, request.lineagePolicyVersion,
    ].every(exact) ||
    request.requestedScope.organizationId !== request.organizationId ||
    !Number.isFinite(Date.parse(request.evaluatedAt)) ||
    request.materialSupports.length === 0
  ) {
    return finish(request, "unavailable", ["material-lineage-unavailable"], []);
  }

  const context = dependencies.authorization;
  if (
    context.contextId !== request.authorizationContextRef ||
    context.organizationId !== request.organizationId ||
    context.subjectId !== request.subjectId ||
    context.purpose !== request.purposeRef ||
    context.sensitivity !== request.sensitivity ||
    context.evaluatedAt !== request.evaluatedAt ||
    context.temporal.mode !== "current" ||
    !sameScope(context.requestedScope, request.requestedScope)
  ) {
    return finish(request, "unavailable", ["material-lineage-unavailable"], []);
  }
  if (context.disposition !== "authorized") {
    return finish(request, "withheld", ["current-authority-denied"], []);
  }

  const reasons = new Set<CanonicalUnderstandingCurrentEligibilityResultV1["reasonClasses"][number]>();
  const governanceRefs: string[] = [...context.authorityRefs, ...context.policyRefs];
  for (const support of request.materialSupports) {
    if (
      !exact(support.canonicalEvidenceId) ||
      !exact(support.canonicalAdmissionId) ||
      !exact(support.attributionId) ||
      !exact(support.attributionDigest) ||
      !exact(support.topologyId) ||
      !exact(support.originBatchDigest) ||
      support.sourceBindingRefs.length === 0
    ) {
      reasons.add("material-lineage-unavailable");
      continue;
    }
    if (!dependencies.isPurposeCompatible({
      requestedPurpose: request.purposeRef,
      materialPurposeRefs: support.purposeRefs,
    })) reasons.add("current-purpose-denied");

    for (const reference of support.sourceBindingRefs) {
      const current = dependencies.resolveCurrentSourceBinding({
        organizationId: request.organizationId,
        historicalBindingId: reference.sourceBindingId,
        historicalGovernanceRevisionRef: reference.sourceGovernanceRevision,
        evaluatedAt: request.evaluatedAt,
      });
      if (!current || current.organizationId !== request.organizationId) {
        reasons.add("material-lineage-unavailable");
        continue;
      }
      governanceRefs.push(current.currentGovernanceRevisionRef);
      if (current.availability === "unavailable") reasons.add("material-lineage-unavailable");
      else if (current.availability === "revoked") reasons.add("current-binding-revoked");
      if (!current.scopes.some((scope) => sameScope(scope, request.requestedScope))) {
        reasons.add("current-scope-denied");
      }
      if (!dependencies.isPurposeCompatible({
        requestedPurpose: request.purposeRef,
        materialPurposeRefs: current.purposeRefs,
      })) reasons.add("current-purpose-denied");
    }
  }
  const all = [...reasons];
  const unavailable = all.includes("material-lineage-unavailable");
  const disposition = unavailable ? "unavailable" : all.length ? "withheld" : "eligible";
  return finish(request, disposition, all, governanceRefs);
}

export function validateCanonicalUnderstandingCurrentEligibilityResult(
  result: CanonicalUnderstandingCurrentEligibilityResultV1,
): void {
  const allowed = new Set([
    "contractVersion", "organizationId", "subjectId", "purposeRef",
    "requestedScopeDigest", "sensitivity", "evaluatedAt",
    "authorizationContextRef", "canonicalUnderstandingRevision",
    "audienceLineageDigest", "lineagePolicyVersion", "disposition",
    "reasonClasses", "eligibleArtifactRevisionDigests",
    "currentGovernanceRevisionRefs", "resultDigest",
  ]);
  const { resultDigest, ...unsigned } = result;
  if (
    Object.keys(result).some((key) => !allowed.has(key)) ||
    result.contractVersion !== "1" ||
    ![
      result.organizationId, result.subjectId, result.purposeRef,
      result.requestedScopeDigest, result.authorizationContextRef,
      result.canonicalUnderstandingRevision, result.audienceLineageDigest,
      result.lineagePolicyVersion, result.resultDigest,
    ].every(exact) ||
    !Number.isFinite(Date.parse(result.evaluatedAt)) ||
    resultDigest !== digest(unsigned) ||
    result.reasonClasses.some((reason) => ![
      "current-authority-denied", "current-binding-revoked",
      "current-purpose-denied", "current-scope-denied",
      "current-sensitivity-denied", "material-lineage-unavailable",
    ].includes(reason)) ||
    (result.disposition !== "eligible" && result.eligibleArtifactRevisionDigests.length > 0) ||
    (result.disposition === "eligible" && result.reasonClasses.length > 0) ||
    result.currentGovernanceRevisionRefs.some((reference) => !exact(reference))
  ) throw new Error("Canonical Understanding current eligibility result is invalid.");
}
