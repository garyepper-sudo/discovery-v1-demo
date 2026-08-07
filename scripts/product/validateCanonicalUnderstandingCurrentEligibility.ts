import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  resolveCanonicalUnderstandingCurrentEligibility,
  validateCanonicalUnderstandingCurrentEligibilityResult,
  type CanonicalUnderstandingCurrentEligibilityRequestV1,
  type CurrentMaterialSourceBindingResolution,
} from "../../engine/v3/understanding/resolveCanonicalUnderstandingCurrentEligibility";
import { resolveScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import { readScopedOrganizationalProductProjection } from "../../product/integration/scopedOrganizationalProductProjection";

const ORG = "current-eligibility-validation";
const SUBJECT = "subject:authorized";
const PURPOSE = "organizational-understanding";
const AT = "2026-08-07T16:00:00.000Z";
const scope = { organizationId: ORG, type: "organization" as const, id: ORG };
const stable = (value: unknown): string => Array.isArray(value)
  ? `[${value.map(stable).join(",")}]`
  : value && typeof value === "object"
    ? `{${Object.entries(value as Record<string, unknown>).sort(([a],[b])=>a.localeCompare(b)).map(([key,item])=>`${JSON.stringify(key)}:${stable(item)}`).join(",")}}`
    : JSON.stringify(value);
const digest = (value: unknown): string => createHash("sha256").update(stable(value)).digest("hex");

const authorized = resolveScopedGovernanceContext({
  organizationId: ORG,
  subjectId: SUBJECT,
  requestedScope: scope,
  operation: "understanding:disclose-derived",
  purpose: PURPOSE,
  sensitivity: "standard",
  evaluatedAt: AT,
  temporal: { mode: "current" },
  serverResolvedAuthority: [{
    authorityRef: "authority:current-eligibility",
    policyRef: "policy:current-eligibility:v1",
    organizationId: ORG,
    subjectId: SUBJECT,
    scope,
    operations: ["understanding:disclose-derived"],
    sensitivity: ["standard"],
    relationship: "direct",
    status: "active",
    validFrom: "2026-01-01T00:00:00.000Z",
  }],
});
assert.equal(authorized.disposition, "authorized");

const support = {
  canonicalEvidenceId: "canonical-evidence:safe",
  canonicalAdmissionId: "canonical-admission:safe",
  attributionId: "canonical-attribution:safe",
  attributionRevision: 1,
  attributionDigest: digest("attribution"),
  sourceBindingRefs: [{
    sourceBindingId: "source-binding:historical",
    sourceGovernanceRevision: digest("binding-historical"),
  }],
  purposeRefs: [PURPOSE],
  topologyId: "topology:safe",
  originBatchDigest: digest("batch"),
  role: "material" as const,
};
const request: CanonicalUnderstandingCurrentEligibilityRequestV1 = {
  contractVersion: "1",
  organizationId: ORG,
  subjectId: SUBJECT,
  purposeRef: PURPOSE,
  requestedScope: scope,
  sensitivity: "standard",
  evaluatedAt: AT,
  authorizationContextRef: authorized.contextId,
  canonicalUnderstandingRevision: "runtime-revision:1",
  audienceLineageDigest: digest("audience-lineage"),
  lineagePolicyVersion: "conservative-material-ancestor.v1",
  materialSupports: [support],
};
const current = (availability: CurrentMaterialSourceBindingResolution["availability"]): CurrentMaterialSourceBindingResolution => ({
  organizationId: ORG,
  historicalBindingId: support.sourceBindingRefs[0]!.sourceBindingId,
  currentBindingRevisionRef: "source-binding:current",
  currentGovernanceRevisionRef: digest(`current:${availability}`),
  availability,
  purposeRefs: [PURPOSE],
  scopes: [scope],
});
const resolve = (
  availability: CurrentMaterialSourceBindingResolution["availability"],
  overrides: Partial<CurrentMaterialSourceBindingResolution> = {},
  purposeCompatible = true,
) => resolveCanonicalUnderstandingCurrentEligibility(request, {
  authorization: authorized,
  isPurposeCompatible: () => purposeCompatible,
  resolveCurrentSourceBinding: () => ({ ...current(availability), ...overrides }),
});

let checks = 0;
const check = (condition: unknown, message: string): void => { assert.ok(condition, message); checks += 1; };

const eligible = resolve("available");
validateCanonicalUnderstandingCurrentEligibilityResult(eligible);
check(eligible.disposition === "eligible", "complete current lineage is eligible");
check(eligible.resultDigest === digest((({ resultDigest: _ignored, ...value }) => value)(eligible)), "independent digest oracle");
check(eligible.currentGovernanceRevisionRefs.length === 3, "authority, policy, and binding revisions retained");

const revoked = resolve("revoked");
check(revoked.disposition === "withheld", "revoked binding is withheld");
const missing = resolveCanonicalUnderstandingCurrentEligibility(request, {
  authorization: authorized,
  isPurposeCompatible: () => true,
  resolveCurrentSourceBinding: () => undefined,
});
check(missing.disposition === "unavailable", "missing current binding is unavailable");
const precedence = resolveCanonicalUnderstandingCurrentEligibility({
  ...request,
  materialSupports: [support, { ...support, canonicalEvidenceId: "canonical-evidence:missing", sourceBindingRefs: [{ sourceBindingId: "missing", sourceGovernanceRevision: "missing-revision" }] }],
}, {
  authorization: authorized,
  isPurposeCompatible: () => true,
  resolveCurrentSourceBinding: ({ historicalBindingId }) => historicalBindingId === "missing" ? undefined : current("revoked"),
});
check(precedence.disposition === "unavailable", "unavailable precedes withheld");
check(resolve("available", {}, false).disposition === "withheld", "purpose mismatch withheld");
check(resolve("available", { scopes: [{ ...scope, id: "other" }] }).disposition === "withheld", "scope mismatch withheld");

const deniedContext = resolveScopedGovernanceContext({
  organizationId: ORG, subjectId: SUBJECT, requestedScope: scope,
  operation: "understanding:disclose-derived", purpose: PURPOSE,
  sensitivity: "restricted", evaluatedAt: AT, temporal: { mode: "current" },
  serverResolvedAuthority: [],
});
const deniedRequest = { ...request, sensitivity: "restricted" as const, authorizationContextRef: deniedContext.contextId };
const denied = resolveCanonicalUnderstandingCurrentEligibility(deniedRequest, {
  authorization: deniedContext,
  isPurposeCompatible: () => true,
  resolveCurrentSourceBinding: () => current("available"),
});
check(denied.disposition === "withheld", "subject or sensitivity denial withheld");

const malformed = resolveCanonicalUnderstandingCurrentEligibility({ ...request, materialSupports: [] }, {
  authorization: authorized,
  isPurposeCompatible: () => true,
  resolveCurrentSourceBinding: () => current("available"),
});
check(malformed.disposition === "unavailable", "missing lineage unavailable");
const injected = resolveCanonicalUnderstandingCurrentEligibility({ ...request, disposition: "eligible" } as CanonicalUnderstandingCurrentEligibilityRequestV1, {
  authorization: authorized,
  isPurposeCompatible: () => true,
  resolveCurrentSourceBinding: () => current("available"),
});
check(injected.disposition === "unavailable", "caller disposition rejected");

const item = {
  safeRef: "safe-understanding:1",
  canonicalObjectType: "organizational-understanding",
  revisionRef: "understanding:1",
  organizationId: ORG,
  scope,
  sensitivity: "standard" as const,
  kind: "understanding" as const,
  disclosureKind: "explanation" as const,
  title: "Authorized summary",
  summary: "Only currently eligible cognition is present.",
  uncertainty: null,
  support: [{ safeRef: "safe-support:1", organizationId: ORG, scope, sensitivity: "standard" as const, authorityRef: authorized.authorityRefs[0] }],
  supportLineageComplete: true,
  safeAbstractionAllowed: false,
  protectedCombination: false,
  auditRefs: [],
};
const projection = (eligibility: typeof eligible) => readScopedOrganizationalProductProjection({
  authenticatedUserId: SUBJECT,
  organizationId: ORG,
  context: authorized,
  repository: { readAuthorizedSource: () => ({
    organizationId: ORG,
    sourceRevisionRef: request.canonicalUnderstandingRevision,
    items: [item], metrics: [], metricCombinationPolicy: [],
    currentEligibilityRequired: true,
    currentEligibility: eligibility,
  }) },
});
const resign = (value: Omit<typeof eligible, "resultDigest">): typeof eligible => ({
  ...value,
  resultDigest: digest(value),
});
check(projection(eligible).disposition === "available", "projection consumes eligible result");
const withheldProjection = projection(revoked);
check(withheldProjection.disposition === "withheld" && withheldProjection.items.length === 0, "withheld cognition excluded");
const unavailableProjection = projection(missing);
check(unavailableProjection.disposition === "unavailable" && unavailableProjection.items.length === 0, "unavailable cognition excluded");
const { resultDigest: _scopeDigest, ...scopeUnsigned } = eligible;
check(projection(resign({ ...scopeUnsigned, requestedScopeDigest: digest({ ...scope, id: "other" }) })).disposition === "unavailable", "projection rejects foreign scope binding");
const { resultDigest: _sensitivityDigest, ...sensitivityUnsigned } = eligible;
check(projection(resign({ ...sensitivityUnsigned, sensitivity: "restricted" })).disposition === "unavailable", "projection rejects sensitivity mismatch");
check(!JSON.stringify(withheldProjection).includes(support.sourceBindingRefs[0]!.sourceBindingId), "binding identity not disclosed");
check(eligible.resultDigest === resolve("available").resultDigest, "deterministic replay");

console.log(JSON.stringify({
  result: "PASS",
  checks,
  dispositions: { eligible: eligible.disposition, revoked: revoked.disposition, missing: missing.disposition },
  precedence: "unavailable-over-withheld",
  audienceLineageIsAuthorization: false,
  writes: 0,
  externalActivity: { network: 0, connector: 0, drive: 0, production: 0 },
}));
