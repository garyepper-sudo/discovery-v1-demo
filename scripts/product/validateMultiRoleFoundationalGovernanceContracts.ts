import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  resolveScopedGovernanceContext,
  type GovernedScopeRef,
  type GovernedSensitivity,
  type ScopedAuthorityGrant,
  type ScopedGovernanceOperation,
} from "../../engine/v3/governance/scopedGovernanceContext";
import {
  evaluateScopedUnderstandingDisclosure,
  readHistoricalScopedVisibility,
  type HistoricalVisibilityRecord,
  type ScopedDisclosureRequest,
} from "../../engine/v3/understanding/scopedOrganizationalUnderstandingDisclosure";
import {
  evaluateScopedEvidenceContribution,
  type ScopedContributionPropagation,
} from "../../product/integration/scopedEvidenceContribution";

const ORG = "synthetic-multi-role-governance-001";
const FOREIGN = "synthetic-multi-role-governance-other-001";
const USER = "person:engineering-manager";
const NOW = "2026-08-05T12:00:00.000Z";
const EARLIER = "2026-08-04T12:00:00.000Z";
const TEAM: GovernedScopeRef = { organizationId: ORG, type: "team", id: "scope:team:delivery" };
const DEPARTMENT: GovernedScopeRef = { organizationId: ORG, type: "department", id: "scope:department:platform" };
const FUNCTION: GovernedScopeRef = { organizationId: ORG, type: "function", id: "scope:function:engineering" };
const ORGANIZATION: GovernedScopeRef = { organizationId: ORG, type: "organization", id: "scope:organization" };
const INITIATIVE: GovernedScopeRef = { organizationId: ORG, type: "initiative", id: "scope:initiative:northstar" };
const PRIVATE: GovernedScopeRef = { organizationId: ORG, type: "private-workspace", id: "scope:private:engineering-manager" };
const PEOPLE: GovernedScopeRef = { organizationId: ORG, type: "restricted", id: "scope:restricted:people" };
const CANARIES = ["canary-hr-restricted", "canary-executive-discussion", "canary-private-note"];
const checks: Array<{ id: string; area: "disclosure" | "historical" | "contribution"; disposition: string; owner: string }> = [];
let reads = 0;
let writes = 0;

function grant(input: {
  subjectId?: string; scope?: GovernedScopeRef; operations?: ScopedGovernanceOperation[];
  sensitivity?: GovernedSensitivity[]; status?: "active" | "revoked";
  authorityRef?: string; validFrom?: string; revokedAt?: string;
} = {}): ScopedAuthorityGrant {
  return {
    authorityRef: input.authorityRef ?? "authority:manager:team",
    policyRef: "policy:scoped-governance:v1",
    organizationId: ORG,
    subjectId: input.subjectId ?? USER,
    scope: input.scope ?? TEAM,
    operations: input.operations ?? ["understanding:disclose-direct", "understanding:disclose-derived", "understanding:read-historical", "understanding:read-historical-metadata", "contribution:submit", "contribution:request-evidence-candidacy"],
    sensitivity: input.sensitivity ?? ["standard"],
    relationship: (input.scope ?? TEAM).type === "initiative" ? "initiative-member" : (input.scope ?? TEAM).type === "private-workspace" ? "private-owner" : (input.scope ?? TEAM).type === "restricted" ? "restricted-authority" : "direct",
    status: input.status ?? "active",
    validFrom: input.validFrom ?? EARLIER,
    ...(input.revokedAt ? { revokedAt: input.revokedAt } : {}),
  };
}
function context(input: {
  subjectId?: string; scope?: GovernedScopeRef; operation?: ScopedGovernanceOperation;
  sensitivity?: GovernedSensitivity; grants?: ScopedAuthorityGrant[];
  temporal?: { mode: "current" } | { mode: "historical"; revisionRef: string; snapshotAt: string };
  organizationId?: string;
} = {}) {
  const scope = input.scope ?? TEAM;
  return resolveScopedGovernanceContext({
    organizationId: input.organizationId ?? ORG,
    subjectId: input.subjectId ?? USER,
    requestedScope: scope,
    operation: input.operation ?? "understanding:disclose-direct",
    purpose: "improve-organizational-understanding",
    sensitivity: input.sensitivity ?? "standard",
    evaluatedAt: NOW,
    temporal: input.temporal ?? { mode: "current" },
    serverResolvedAuthority: input.grants ?? [grant({ scope })],
  });
}
function disclosure(input: Partial<ScopedDisclosureRequest> & { context: ReturnType<typeof context> }) {
  const request: ScopedDisclosureRequest = {
    requestRef: "object:safe-request-ref",
    organizationId: ORG,
    recipientId: USER,
    scope: input.context.requestedScope,
    sensitivity: input.context.sensitivity,
    kind: "direct-evidence",
    support: [{ safeRef: "safe-lineage:1", organizationId: ORG, scope: input.context.requestedScope, sensitivity: input.context.sensitivity, authorityRef: input.context.disposition === "authorized" ? input.context.authorityRefs[0] : undefined }],
    supportLineageComplete: true,
    safeAbstractionAllowed: false,
    protectedCombination: false,
    ...input,
  };
  return evaluateScopedUnderstandingDisclosure(request);
}
function check(id: string, area: "disclosure" | "historical" | "contribution", disposition: string, work: () => void, owner: string): void {
  work();
  checks.push({ id, area, disposition, owner });
}

const teamContext = context();
check("disclosure-01-direct-authorized", "disclosure", "disclosed", () => assert.equal(disclosure({ context: teamContext }).disposition, "disclosed"), "scoped Understanding disclosure");
check("disclosure-02-direct-unauthorized", "disclosure", "withheld", () => assert.equal(disclosure({ context: context({ grants: [] }) }).disposition, "withheld"), "scoped governance context");
check("disclosure-03-team-scope", "disclosure", "authorized", () => assert.equal(teamContext.disposition, "authorized"), "scoped governance context");
for (const [id, scope] of [["department", DEPARTMENT], ["function", FUNCTION], ["organization", ORGANIZATION], ["initiative", INITIATIVE]] as const) {
  check("disclosure-scope-" + id, "disclosure", "authorized", () => assert.equal(context({ scope, grants: [grant({ scope })] }).disposition, "authorized"), "scoped governance context");
}
for (const [id, scope, canary] of [["hr", PEOPLE, CANARIES[0]], ["executive", ORGANIZATION, CANARIES[1]], ["private", PRIVATE, CANARIES[2]]] as const) {
  const denied = context({ scope, sensitivity: scope === PRIVATE ? "private" : "restricted", grants: [grant({ scope, sensitivity: ["standard"] })] });
  check("disclosure-canary-" + id, "disclosure", "withheld", () => {
    const output = disclosure({
      context: denied,
      sensitivity: scope === PRIVATE ? "private" : "restricted",
      kind: "summary",
      support: [{ safeRef: canary, organizationId: ORG, scope, sensitivity: scope === PRIVATE ? "private" : "restricted" }],
    });
    assert.equal(output.disposition, "withheld");
    assert.equal(JSON.stringify(output).includes(canary), false);
  }, "scoped Understanding disclosure");
}
for (const kind of ["summary", "explanation", "confidence-movement", "contradiction-existence", "recommendation", "inferred-relationship", "aggregate-input", "trend-input"] as const) {
  check("disclosure-derived-" + kind, "disclosure", "withheld", () => {
    const output = disclosure({ context: teamContext, kind, support: [{ safeRef: "hidden", organizationId: ORG, scope: PEOPLE, sensitivity: "restricted" }] });
    assert.equal(output.disposition, "withheld");
    assert.deepEqual(output.safeDisclosedLineage, []);
  }, "scoped Understanding disclosure");
}
check("disclosure-combination", "disclosure", "withheld", () => {
  const restricted = context({ scope: PEOPLE, sensitivity: "restricted", grants: [grant({ scope: PEOPLE, sensitivity: ["restricted"] })] });
  const support = [1,2].map((index) => ({ safeRef: "bounded:" + index, organizationId: ORG, scope: PEOPLE, sensitivity: "restricted" as const, authorityRef: restricted.disposition === "authorized" ? restricted.authorityRefs[0] : undefined }));
  assert.equal(disclosure({ context: restricted, scope: PEOPLE, sensitivity: "restricted", kind: "summary", support, protectedCombination: true }).disposition, "withheld");
}, "scoped Understanding disclosure");
check("disclosure-ambiguous-lineage", "disclosure", "insufficient-authorized-information", () => assert.equal(disclosure({ context: teamContext, supportLineageComplete: false }).disposition, "insufficient-authorized-information"), "scoped Understanding disclosure");
check("disclosure-order-determinism", "disclosure", "deterministic", () => {
  const a = { safeRef: "a", organizationId: ORG, scope: TEAM, sensitivity: "standard" as const, authorityRef: "authority:manager:team" };
  const b = { ...a, safeRef: "b" };
  assert.equal(disclosure({ context: teamContext, support: [a,b] }).decisionId, disclosure({ context: teamContext, support: [b,a] }).decisionId);
}, "scoped Understanding disclosure");
check("disclosure-duplicate-support", "disclosure", "invariant", () => {
  const a = { safeRef: "a", organizationId: ORG, scope: TEAM, sensitivity: "standard" as const, authorityRef: "authority:manager:team" };
  assert.equal(disclosure({ context: teamContext, support: [a] }).decisionId, disclosure({ context: teamContext, support: [a,a] }).decisionId);
}, "scoped Understanding disclosure");

const record: HistoricalVisibilityRecord = {
  projectionRef: "projection:historical:1", organizationId: ORG, revisionRef: "revision:1",
  createdAt: EARLIER, creationAuthorityRef: "authority:old", contentAvailable: true,
  safeMetadataAvailable: true,
  disclosure: { requestRef: "historical:safe", organizationId: ORG, recipientId: USER, scope: TEAM, sensitivity: "standard", kind: "summary", support: [{ safeRef: "safe:historical", organizationId: ORG, scope: TEAM, sensitivity: "standard", authorityRef: "authority:manager:team" }], supportLineageComplete: true, safeAbstractionAllowed: false, protectedCombination: false },
};
const reader = { load: () => { reads += 1; return structuredClone(record); } };
const historicalContext = context({ operation: "understanding:read-historical", temporal: { mode: "historical", revisionRef: "revision:1", snapshotAt: EARLIER } });
check("historical-01-before-revocation", "historical", "visible", () => assert.equal(readHistoricalScopedVisibility({ organizationId: ORG, recipientId: USER, projectionRef: record.projectionRef, revisionRef: record.revisionRef, context: historicalContext, reader }).disposition, "visible"), "historical scoped visibility");
const revokedGrant = grant({ status: "revoked", revokedAt: NOW });
const revokedContext = context({ operation: "understanding:read-historical", temporal: { mode: "historical", revisionRef: "revision:1", snapshotAt: EARLIER }, grants: [revokedGrant] });
for (const id of ["after-revocation", "new-projection", "prior-id", "cached-id"]) {
  check("historical-" + id, "historical", "fail-closed", () => assert.equal(readHistoricalScopedVisibility({ organizationId: ORG, recipientId: USER, projectionRef: record.projectionRef, revisionRef: record.revisionRef, context: revokedContext, reader }).disposition, "fail-closed"), "historical scoped visibility");
}
check("historical-derived-restricted", "historical", "metadata-only", () => {
  const hidden = structuredClone(record); hidden.disclosure.support[0]!.scope = PEOPLE; hidden.disclosure.support[0]!.sensitivity = "restricted";
  const localReader = { load: () => { reads += 1; return hidden; } };
  assert.equal(readHistoricalScopedVisibility({ organizationId: ORG, recipientId: USER, projectionRef: record.projectionRef, revisionRef: record.revisionRef, context: historicalContext, reader: localReader }).disposition, "metadata-only");
}, "historical scoped visibility");
check("historical-immutable", "historical", "unchanged", () => {
  const before = JSON.stringify(record);
  readHistoricalScopedVisibility({ organizationId: ORG, recipientId: USER, projectionRef: record.projectionRef, revisionRef: record.revisionRef, context: revokedContext, reader });
  assert.equal(JSON.stringify(record), before);
}, "Runtime/revision owner");
check("historical-restored", "historical", "visible", () => {
  const restored = context({ operation: "understanding:read-historical", temporal: { mode: "historical", revisionRef: "revision:1", snapshotAt: EARLIER }, grants: [revokedGrant, grant({ authorityRef: "authority:restored", validFrom: NOW })] });
  const restoredRecord = structuredClone(record); restoredRecord.disclosure.support[0]!.authorityRef = "authority:restored";
  assert.equal(readHistoricalScopedVisibility({ organizationId: ORG, recipientId: USER, projectionRef: record.projectionRef, revisionRef: record.revisionRef, context: restored, reader: { load: () => { reads += 1; return restoredRecord; } } }).disposition, "visible");
}, "scoped governance context");
check("historical-unknown-policy", "historical", "fail-closed", () => assert.equal(readHistoricalScopedVisibility({ organizationId: ORG, recipientId: USER, projectionRef: record.projectionRef, revisionRef: record.revisionRef, context: context(), reader }).disposition, "fail-closed"), "historical scoped visibility");
check("historical-cross-organization-pre-read", "historical", "withheld", () => {
  const before = reads;
  const output = readHistoricalScopedVisibility({ organizationId: FOREIGN, recipientId: USER, projectionRef: record.projectionRef, revisionRef: record.revisionRef, context: historicalContext, reader });
  assert.equal(output.disposition, "withheld");
  assert.equal(reads, before);
}, "historical scoped visibility");
check("historical-repeat", "historical", "deterministic", () => {
  const input = { organizationId: ORG, recipientId: USER, projectionRef: record.projectionRef, revisionRef: record.revisionRef, context: historicalContext, reader };
  assert.deepEqual(readHistoricalScopedVisibility(input), readHistoricalScopedVisibility(input));
}, "historical scoped visibility");

function contribution(input: { contributorId?: string; scope?: GovernedScopeRef; sourceScope?: GovernedScopeRef; sensitivity?: GovernedSensitivity; propagation?: ScopedContributionPropagation; operation?: ScopedGovernanceOperation; grants?: ScopedAuthorityGrant[]; organizationId?: string; idempotencyKey?: string; purpose?: string } = {}) {
  const targetScope = input.scope ?? TEAM;
  const contributorId = input.contributorId ?? USER;
  const governance = context({ subjectId: contributorId, scope: targetScope, operation: input.operation ?? "contribution:submit", sensitivity: input.sensitivity ?? "standard", grants: input.grants ?? [grant({ subjectId: contributorId, scope: targetScope, sensitivity: [input.sensitivity ?? "standard"] })], organizationId: input.organizationId });
  return evaluateScopedEvidenceContribution({ organizationId: input.organizationId ?? ORG, contributorId, sourceScope: input.sourceScope ?? targetScope, targetScope, purpose: input.purpose ?? "improve-organizational-understanding", sourceRef: "source:safe", sensitivity: input.sensitivity ?? "standard", propagation: input.propagation ?? "local-only", idempotencyKey: input.idempotencyKey ?? "idempotency:1", contributedAt: NOW, governance });
}
check("contribution-team-lead-local", "contribution", "accepted-governed-contribution", () => assert.equal(contribution({ contributorId: "person:team-lead", grants: [grant({ subjectId: "person:team-lead" })] }).disposition, "accepted-governed-contribution"), "scoped contribution");
check("contribution-manager-private", "contribution", "retained-locally", () => assert.equal(contribution({ scope: PRIVATE, sensitivity: "private", grants: [grant({ scope: PRIVATE, sensitivity: ["private"] })] }).disposition, "retained-locally"), "scoped contribution");
check("contribution-hierarchy-no-promotion", "contribution", "rejected", () => assert.equal(contribution({ scope: ORGANIZATION, grants: [grant({ scope: TEAM })] }).disposition, "rejected"), "scoped governance context");
check("contribution-director-department", "contribution", "accepted-governed-contribution", () => assert.equal(contribution({ contributorId: "person:director", scope: DEPARTMENT, grants: [grant({ subjectId: "person:director", scope: DEPARTMENT })] }).disposition, "accepted-governed-contribution"), "scoped contribution");
check("contribution-initiative", "contribution", "accepted-governed-contribution", () => assert.equal(contribution({ contributorId: "person:initiative", scope: INITIATIVE, propagation: "lateral-initiative-consideration", grants: [grant({ subjectId: "person:initiative", scope: INITIATIVE })] }).disposition, "accepted-governed-contribution"), "scoped contribution");
check("contribution-lateral-requires-initiative", "contribution", "rejected", () => assert.equal(contribution({ propagation: "lateral-initiative-consideration" }).disposition, "rejected"), "scoped contribution");
check("contribution-purpose-bound-to-context", "contribution", "rejected", () => assert.equal(contribution({ purpose: "unvalidated-purpose" }).disposition, "rejected"), "scoped contribution");
check("contribution-outside-target", "contribution", "rejected", () => assert.equal(contribution({ scope: DEPARTMENT, grants: [grant({ scope: TEAM })] }).disposition, "rejected"), "scoped governance context");
check("contribution-candidacy-separated", "contribution", "eligible-for-evidence-candidacy", () => {
  const output = contribution({ operation: "contribution:request-evidence-candidacy", propagation: "broader-evidence-candidacy" });
  assert.equal(output.evidenceCandidateDisposition, "eligible-not-created");
  assert.equal(output.evidenceAdmissionDisposition, "not-evaluated");
}, "scoped contribution + Evidence owner");
check("contribution-admission-separated", "contribution", "not-evaluated", () => assert.equal(contribution().evidenceAdmissionDisposition, "not-evaluated"), "canonical Evidence admission");
check("contribution-challenge-strategy", "contribution", "deferred-for-review", () => assert.equal(contribution({ propagation: "upward-consideration" }).disposition, "deferred-for-review"), "scoped contribution");
check("contribution-cross-organization", "contribution", "rejected", () => {
  const beforeReads = reads; const beforeWrites = writes;
  assert.equal(contribution({ organizationId: FOREIGN }).disposition, "rejected");
  assert.equal(reads, beforeReads); assert.equal(writes, beforeWrites);
}, "scoped governance context");
check("contribution-idempotent", "contribution", "deterministic", () => assert.equal(contribution().contributionId, contribution().contributionId), "scoped contribution");
check("contribution-order-deterministic", "contribution", "deterministic", () => {
  const grants = [grant({ authorityRef: "authority:b" }), grant({ authorityRef: "authority:a" })];
  assert.equal(contribution({ grants }).contributionId, contribution({ grants: [...grants].reverse() }).contributionId);
}, "scoped governance context");
check("contribution-no-autonomous-propagation", "contribution", "false", () => {
  const output = contribution({ propagation: "upward-consideration" });
  assert.equal(output.canonicalUnderstandingChanged, false);
  assert.equal(output.evidenceCandidateDisposition, "not-created");
}, "scoped contribution");

const serialized = JSON.stringify(checks);
for (const canary of CANARIES) assert.equal(serialized.includes(canary), false);
const summary = {
  validation: "multi-role-foundational-governance-contracts",
  result: "PASS",
  checkCount: checks.length,
  disclosureChecks: checks.filter((item) => item.area === "disclosure").length,
  historicalChecks: checks.filter((item) => item.area === "historical").length,
  contributionChecks: checks.filter((item) => item.area === "contribution").length,
  organizationId: ORG,
  recipientScope: TEAM.id,
  canonicalOwners: ["scoped governance context", "canonical Understanding disclosure", "historical Runtime/revision", "Product contribution", "canonical Evidence admission"],
  reads,
  writes,
  externalCalls: 0,
  productionAccess: 0,
  connectorCalls: 0,
  driveReads: 0,
  driveWrites: 0,
  digest: createHash("sha256").update(JSON.stringify(checks)).digest("hex"),
  checks: checks,
};
console.log(JSON.stringify(summary, null, 2));
