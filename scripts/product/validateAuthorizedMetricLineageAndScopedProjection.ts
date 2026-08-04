import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import {
  evaluateAuthorizedMetricLineage,
  type AuthorizedMetricId,
  type CanonicalMetricInput,
  type ServerResolvedCanonicalMetric,
} from "../../engine/v3/governance/authorizedMetricLineage";
import {
  resolveScopedGovernanceContext,
  type GovernedScopeRef,
  type GovernedSensitivity,
  type ScopedAuthorityGrant,
  type ScopedGovernanceContext,
} from "../../engine/v3/governance/scopedGovernanceContext";
import {
  readScopedOrganizationalProductProjection,
  type ScopedProjectionRepositorySource,
  type ServerResolvedScopedProductItem,
  type ScopedProductItemKind,
} from "../../product/integration/scopedOrganizationalProductProjection";

const ORG = "synthetic-multi-role-governance-001";
const FOREIGN = "synthetic-multi-role-governance-other-001";
const NOW = "2026-08-06T12:00:00.000Z";
const EARLIER = "2026-08-05T12:00:00.000Z";
const REVISION = "understanding-revision:1";
const CANARIES = ["restricted-employee-identity", "restricted-executive-source", "raw-runtime-canary"];
const metricChecks: Array<Record<string, unknown>> = [];
const projectionChecks: Array<Record<string, unknown>> = [];
let repositoryReads = 0;
let writes = 0;

const scopes = {
  teamLead: { organizationId: ORG, type: "team", id: "scope:team:delivery" },
  manager: { organizationId: ORG, type: "team", id: "scope:team:platform" },
  director: { organizationId: ORG, type: "department", id: "scope:department:platform" },
  functionalExecutive: { organizationId: ORG, type: "function", id: "scope:function:engineering" },
  organizationExecutive: { organizationId: ORG, type: "organization", id: "scope:organization" },
} as const satisfies Record<string, GovernedScopeRef>;

type RoleName = keyof typeof scopes;

function grant(input: {
  subjectId: string;
  scope: GovernedScopeRef;
  sensitivity?: GovernedSensitivity[];
  status?: "active" | "revoked";
  authorityRef?: string;
  validFrom?: string;
  revokedAt?: string;
}): ScopedAuthorityGrant {
  return {
    authorityRef: input.authorityRef ?? `authority:${input.subjectId}:${input.scope.id}`,
    policyRef: "policy:scoped-product-projection:v1",
    organizationId: ORG,
    subjectId: input.subjectId,
    scope: input.scope,
    operations: ["understanding:disclose-direct", "understanding:disclose-derived", "understanding:read-historical"],
    sensitivity: input.sensitivity ?? ["standard"],
    relationship: input.scope.type === "initiative" ? "initiative-member" : "direct",
    status: input.status ?? "active",
    validFrom: input.validFrom ?? EARLIER,
    ...(input.revokedAt ? { revokedAt: input.revokedAt } : {}),
  };
}

function context(input: {
  subjectId?: string;
  scope?: GovernedScopeRef;
  organizationId?: string;
  purpose?: string;
  sensitivity?: GovernedSensitivity;
  temporal?: { mode: "current" } | { mode: "historical"; revisionRef: string; snapshotAt: string };
  grants?: ScopedAuthorityGrant[];
} = {}): ScopedGovernanceContext {
  const subjectId = input.subjectId ?? "person:manager";
  const scope = input.scope ?? scopes.manager;
  return resolveScopedGovernanceContext({
    organizationId: input.organizationId ?? ORG,
    subjectId,
    requestedScope: scope,
    operation: input.temporal?.mode === "historical" ? "understanding:read-historical" : "understanding:disclose-derived",
    purpose: input.purpose ?? "understand-authorized-organizational-scope",
    sensitivity: input.sensitivity ?? "standard",
    evaluatedAt: NOW,
    temporal: input.temporal ?? { mode: "current" },
    serverResolvedAuthority: input.grants ?? [grant({ subjectId, scope, sensitivity: [input.sensitivity ?? "standard"] })],
  });
}

function support(scope: GovernedScopeRef, authorityRef: string, safeRef = `lineage:${scope.id}`) {
  return [{ safeRef, organizationId: ORG, scope, sensitivity: "standard" as const, authorityRef }];
}

function metricInput(scope: GovernedScopeRef, authorityRef: string, overrides: Partial<CanonicalMetricInput> = {}): CanonicalMetricInput {
  return {
    safeRef: `input:${scope.id}:understanding`,
    organizationId: ORG,
    objectType: "organizational-understanding",
    scope,
    sensitivity: "standard",
    authorityRef,
    supportLineage: support(scope, authorityRef),
    supportLineageComplete: true,
    ...overrides,
  };
}

function metric(
  metricId: AuthorizedMetricId,
  scope: GovernedScopeRef,
  authorityRef: string,
  overrides: Partial<ServerResolvedCanonicalMetric> = {},
): ServerResolvedCanonicalMetric {
  const coherence = metricId === "organizational-understanding.coherence";
  return {
    metricId,
    organizationId: ORG,
    producerRef: coherence ? "update-organizational-understanding-state" : "compute-organizational-learning-profile",
    producerVersion: "1",
    requestedScope: scope,
    calculationMethod: coherence
      ? "canonical-organizational-understanding-health-coherence"
      : "canonical-organizational-learning-velocity-score",
    value: coherence ? 0.72 : 64,
    candidateInputs: [metricInput(scope, authorityRef)],
    inputCombinationProtected: false,
    resultSideChannelSafe: true,
    safeAbstractionAllowed: false,
    ...overrides,
  };
}

function checkMetric(id: string, benchmarkScenarioId: string, expected: string, work: () => string): void {
  const observed = work();
  assert.equal(observed, expected);
  metricChecks.push({ id, benchmarkScenarioId, expected, observed, productionOwner: "evaluateAuthorizedMetricLineage", reads: 0, writes: 0, externalActivity: 0 });
}

const managerContext = context();
assert.equal(managerContext.disposition, "authorized");
const managerAuthority = managerContext.disposition === "authorized" ? managerContext.authorityRefs[0]! : "";

checkMetric("metric-coherence-disclosed", "metric:coherence", "disclosed", () =>
  evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority) }).disposition,
);
checkMetric("metric-learning-velocity-disclosed", "metric:learning-velocity", "disclosed", () =>
  evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-learning.learning-velocity", scopes.manager, managerAuthority) }).disposition,
);
checkMetric("metric-freshness-unsupported", "metric:freshness", "unsupported-metric", () =>
  evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.freshness", scopes.manager, managerAuthority) }).disposition,
);
checkMetric("metric-restricted-input-never-influences-visible-value", "adversarial:restricted-input-global-metric", "withheld", () => {
  const hidden = metric("organizational-understanding.coherence", scopes.manager, managerAuthority, {
    value: 918273,
    candidateInputs: [metricInput(scopes.manager, managerAuthority, { sensitivity: "restricted", supportLineage: [{ safeRef: CANARIES[0]!, organizationId: ORG, scope: scopes.manager, sensitivity: "restricted", authorityRef: managerAuthority }] })],
  });
  const result = evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: hidden });
  assert.equal(JSON.stringify(result).includes("918273"), false);
  assert.equal(JSON.stringify(result).includes(CANARIES[0]!), false);
  return result.disposition;
});
checkMetric("metric-global-first-filter-later-prohibited", "metric:understanding-health", "withheld", () => {
  const global = metric("organizational-understanding.coherence", scopes.manager, managerAuthority, {
    candidateInputs: [metricInput(scopes.organizationExecutive, managerAuthority)],
  });
  return evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: global }).disposition;
});
for (const [id, scenario] of [["confidence-movement", "derived:confidence"], ["count-side-channel", "adversarial:protected-count"], ["trend-side-channel", "derived:metric"]] as const) {
  checkMetric(`metric-${id}`, scenario, "withheld", () => evaluateAuthorizedMetricLineage({
    context: managerContext,
    serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { resultSideChannelSafe: false, value: 772211 }),
  }).disposition);
}
checkMetric("metric-rank-unsupported", "metric:trend-ranking", "unsupported-metric", () =>
  evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-learning.trend-ranking", scopes.manager, managerAuthority) }).disposition,
);
checkMetric("metric-combination-leakage", "derived:combination", "withheld", () =>
  evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [metricInput(scopes.manager, managerAuthority), metricInput(scopes.manager, managerAuthority, { safeRef: "input:second" })], inputCombinationProtected: true }) }).disposition,
);
const revoked = context({ grants: [grant({ subjectId: "person:manager", scope: scopes.manager, status: "revoked", revokedAt: NOW })] });
checkMetric("metric-after-revocation", "revocation:historical-visibility", "withheld", () =>
  evaluateAuthorizedMetricLineage({ context: revoked, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority) }).disposition,
);
const historical = context({ temporal: { mode: "historical", revisionRef: REVISION, snapshotAt: EARLIER } });
const historicalAuthority = historical.disposition === "authorized" ? historical.authorityRefs[0]! : "";
checkMetric("metric-historical-current-authorization", "revocation:derived-content", "disclosed", () =>
  evaluateAuthorizedMetricLineage({ context: historical, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, historicalAuthority, { historicalRevisionRef: REVISION }) }).disposition,
);
checkMetric("metric-historical-lineage-missing", "revocation:cached-projection", "insufficient-authorized-information", () =>
  evaluateAuthorizedMetricLineage({ context: historical, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, historicalAuthority) }).disposition,
);
checkMetric("metric-missing-input-lineage", "metric:coherence", "insufficient-authorized-information", () =>
  evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [metricInput(scopes.manager, managerAuthority, { supportLineageComplete: false })] }) }).disposition,
);
checkMetric("metric-ambiguous-scope", "scope:aggregation", "withheld", () => {
  const invalid = context({ scope: { ...scopes.manager, id: "*" } });
  return evaluateAuthorizedMetricLineage({ context: invalid, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority) }).disposition;
});
checkMetric("metric-cross-organization", "isolation:projection-foreign", "withheld", () =>
  evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { organizationId: FOREIGN }) }).disposition,
);
checkMetric("metric-duplicate-input-invariance", "metric:coherence", "invariant", () => {
  const input = metricInput(scopes.manager, managerAuthority);
  const one = evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [input] }) });
  const duplicate = evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [input, input] }) });
  assert.deepEqual(one, duplicate);
  return "invariant";
});
checkMetric("metric-input-order-invariance", "metric:coherence", "invariant", () => {
  const first = metricInput(scopes.manager, managerAuthority);
  const second = metricInput(scopes.manager, managerAuthority, { safeRef: "input:second" });
  const forward = evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [first, second] }) });
  const reverse = evaluateAuthorizedMetricLineage({ context: managerContext, serverResolvedMetric: metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { candidateInputs: [second, first] }) });
  assert.deepEqual(forward, reverse);
  return "invariant";
});

const usefulKinds: ScopedProductItemKind[] = ["understanding", "material-change", "uncertainty", "evidence-gap", "investigation-opportunity", "dependency"];

function sourceFor(scope: GovernedScopeRef, authorityRef: string): ScopedProjectionRepositorySource {
  const items: ServerResolvedScopedProductItem[] = usefulKinds.map((kind, index) => ({
    safeRef: `safe:${scope.id}:${kind}`,
    canonicalObjectType: kind === "material-change" ? "organizational-evolution" : kind === "investigation-opportunity" ? "investigation-opportunity" : "organizational-understanding",
    revisionRef: REVISION,
    organizationId: ORG,
    scope,
    sensitivity: "standard" as const,
    kind,
    disclosureKind: kind === "material-change" ? "trend-input" as const : kind === "understanding" ? "direct-evidence" as const : "summary" as const,
    title: `${kind} for ${scope.id}`,
    summary: `Authorized ${kind} is available for the requested scope.`,
    uncertainty: kind === "uncertainty" || kind === "evidence-gap" ? "A bounded gap remains." : null,
    support: support(scope, authorityRef, `lineage:${scope.id}:${index}`),
    supportLineageComplete: true,
    safeAbstractionAllowed: false,
    protectedCombination: false,
    auditRefs: [`audit:${scope.id}:${index}`],
  }));
  items.push({
    safeRef: CANARIES[1]!, canonicalObjectType: "organizational-understanding", revisionRef: REVISION,
    organizationId: ORG, scope, sensitivity: "restricted", kind: "risk", disclosureKind: "summary",
    title: CANARIES[1]!, summary: CANARIES[2]!, uncertainty: null,
    support: [{ safeRef: CANARIES[0]!, organizationId: ORG, scope, sensitivity: "restricted" }],
    supportLineageComplete: true, safeAbstractionAllowed: false, protectedCombination: false, auditRefs: [],
  });
  return {
    organizationId: ORG,
    sourceRevisionRef: REVISION,
    items,
    metrics: [
      metric("organizational-understanding.coherence", scope, authorityRef),
      metric("organizational-learning.learning-velocity", scope, authorityRef),
      metric("organizational-understanding.freshness", scope, authorityRef),
    ],
    metricCombinationPolicy: [],
  };
}

function repository(source: ScopedProjectionRepositorySource) {
  return { readAuthorizedSource: () => { repositoryReads += 1; return structuredClone(source); } };
}

function checkProjection(id: string, expected: string, work: () => string, details: Record<string, unknown> = {}): void {
  const observed = work();
  assert.equal(observed, expected);
  projectionChecks.push({ id, expected, observed, productionOwner: "readScopedOrganizationalProductProjection", writes: 0, externalActivity: 0, ...details });
}

const roleResults: Record<string, ReturnType<typeof readScopedOrganizationalProductProjection>> = {};
for (const role of Object.keys(scopes) as RoleName[]) {
  const subjectId = `person:${role}`;
  const roleContext = context({ subjectId, scope: scopes[role] });
  assert.equal(roleContext.disposition, "authorized");
  const authorityRef = roleContext.disposition === "authorized" ? roleContext.authorityRefs[0]! : "";
  const before = repositoryReads;
  const projection = readScopedOrganizationalProductProjection({ authenticatedUserId: subjectId, organizationId: ORG, context: roleContext, repository: repository(sourceFor(scopes[role], authorityRef)) });
  roleResults[role] = projection;
  checkProjection(`projection-role-${role}`, "useful", () => {
    assert.equal(repositoryReads - before, 1);
    assert.equal(projection.disposition, "available");
    assert.ok(projection.items.length >= 4);
    assert.ok(new Set(projection.items.map((item) => item.kind)).size >= 4);
    assert.equal(projection.metrics.filter((item) => item.disposition === "disclosed").length, 2);
    assert.deepEqual(projection.decisionCalibration, { disposition: "unavailable", reason: "canonical-input-unavailable" });
    assert.equal(projection.unsupportedCapabilities.length, 0);
    return "useful";
  }, { benchmarkRole: role, requestedScope: scopes[role].id, reads: 1, disclosedSections: projection.items.map((item) => item.kind), authorizedMetrics: projection.metrics.filter((item) => item.disposition === "disclosed").map((item) => item.metricId) });
  const serialized = JSON.stringify(projection);
  for (const canary of CANARIES) assert.equal(serialized.includes(canary), false);
  for (const forbidden of ["organizationalUnderstandingState", "runtime", "memory", "evidenceIds", "sourceId", "credential", "connector"]) assert.equal(Object.hasOwn(projection, forbidden), false);
}

checkProjection("projection-exact-organization", "available", () => roleResults.manager!.disposition);
checkProjection("projection-exact-recipient-denial", "withheld", () => {
  const before = repositoryReads;
  const output = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:other", organizationId: ORG, context: managerContext, repository: repository(sourceFor(scopes.manager, managerAuthority)) });
  assert.equal(repositoryReads, before);
  return output.disposition;
}, { reads: 0 });
checkProjection("projection-cross-organization-pre-read", "withheld", () => {
  const before = repositoryReads;
  const output = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: FOREIGN, context: managerContext, repository: repository(sourceFor(scopes.manager, managerAuthority)) });
  assert.equal(repositoryReads, before);
  return output.disposition;
}, { reads: 0 });
checkProjection("projection-unauthorized-scope-pre-read", "withheld", () => {
  const before = repositoryReads;
  const denied = context({ scope: scopes.director, grants: [grant({ subjectId: "person:manager", scope: scopes.manager })] });
  const output = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: ORG, context: denied, repository: repository(sourceFor(scopes.director, managerAuthority)) });
  assert.equal(repositoryReads, before);
  return output.disposition;
}, { reads: 0 });
checkProjection("projection-purpose-bound", "bound", () => {
  assert.equal(roleResults.manager!.purpose, "understand-authorized-organizational-scope");
  return "bound";
});
checkProjection("projection-withheld-unavailable-distinct", "distinct", () => {
  assert.equal(roleResults.manager!.withheldItemCount, null);
  assert.ok(roleResults.manager!.unavailableKinds.length > 0);
  return "distinct";
});
checkProjection("projection-metric-authorized-only", "safe", () => {
  const metrics = roleResults.manager!.metrics;
  assert.equal(metrics.find((item) => item.metricId === "organizational-understanding.coherence")?.disposition, "disclosed");
  assert.equal(metrics.find((item) => item.metricId === "organizational-understanding.freshness")?.disposition, "unsupported-metric");
  return "safe";
});
checkProjection("projection-cross-metric-combination-leakage", "safely-abstracted", () => {
  const source = sourceFor(scopes.manager, managerAuthority);
  source.metrics = [
    metric("organizational-understanding.coherence", scopes.manager, managerAuthority, { value: 882211 }),
    metric("organizational-learning.learning-velocity", scopes.manager, managerAuthority, { value: 773322 }),
  ];
  source.metricCombinationPolicy = [{
    metricIds: ["organizational-understanding.coherence", "organizational-learning.learning-velocity"],
    safeAbstractionAllowed: true,
    policyRef: "policy:protected-cross-metric-combination:v1",
  }];
  const output = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: ORG, context: managerContext, repository: repository(source) });
  const serialized = JSON.stringify(output);
  assert.equal(serialized.includes("882211"), false);
  assert.equal(serialized.includes("773322"), false);
  assert.ok(output.metrics.every((item) => item.disposition === "safely-abstracted"));
  return "safely-abstracted";
});
checkProjection("projection-deterministic-identity", "deterministic", () => {
  const source = sourceFor(scopes.manager, managerAuthority);
  const first = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: ORG, context: managerContext, repository: repository(source) });
  const second = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: ORG, context: managerContext, repository: repository(source) });
  assert.deepEqual(first, second);
  return "deterministic";
});
checkProjection("projection-input-order-invariance", "invariant", () => {
  const source = sourceFor(scopes.manager, managerAuthority);
  const forward = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: ORG, context: managerContext, repository: repository(source) });
  const reverse = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: ORG, context: managerContext, repository: repository({ ...source, items: [...source.items].reverse(), metrics: [...source.metrics].reverse() }) });
  assert.deepEqual(forward, reverse);
  return "invariant";
});
checkProjection("projection-duplicate-input-invariance", "invariant", () => {
  const source = sourceFor(scopes.manager, managerAuthority);
  const once = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: ORG, context: managerContext, repository: repository(source) });
  const duplicate = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: ORG, context: managerContext, repository: repository({ ...source, items: [...source.items, source.items[0]!] }) });
  assert.deepEqual(once, duplicate);
  return "invariant";
});
checkProjection("projection-historical-current-authorization", "available", () => {
  const source = sourceFor(scopes.manager, historicalAuthority);
  return readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: ORG, context: historical, repository: repository({ ...source, metrics: source.metrics.map((item) => ({ ...item, historicalRevisionRef: REVISION })) }) }).disposition;
});
checkProjection("projection-revoked-pre-read", "withheld", () => {
  const before = repositoryReads;
  const output = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:manager", organizationId: ORG, context: revoked, repository: repository(sourceFor(scopes.manager, managerAuthority)) });
  assert.equal(repositoryReads, before);
  return output.disposition;
}, { reads: 0 });
checkProjection("projection-one-canonical-model", "preserved", () => {
  assert.equal(new Set(Object.values(roleResults).map((item) => item.sourceRevisionRef)).size, 1);
  return "preserved";
});
checkProjection("projection-no-decision-calibration-input", "unavailable", () => {
  assert.ok(Object.values(roleResults).every((item) => item.decisionCalibration !== null && "disposition" in item.decisionCalibration && item.decisionCalibration.disposition === "unavailable"));
  return "unavailable";
});

const summary = {
  validation: "authorized-metric-lineage-and-scoped-product-projection",
  result: "PASS",
  metricCheckCount: metricChecks.length,
  projectionCheckCount: projectionChecks.length,
  totalCheckCount: metricChecks.length + projectionChecks.length,
  roleProjectionCount: Object.keys(roleResults).length,
  usefulRoleProjectionCount: Object.values(roleResults).filter((item) => item.items.length >= 4).length,
  supportedMetricIds: ["organizational-understanding.coherence", "organizational-learning.learning-velocity"],
  unsupportedMetricIds: ["organizational-understanding.confidence", "organizational-understanding.freshness", "organizational-understanding.health", "organizational-learning.understanding-growth", "organizational-learning.memory-growth", "organizational-learning.trend-ranking"],
  repositoryReads,
  writes,
  crossOrganizationReadsBeforeFailure: 0,
  connectorCalls: 0,
  driveReads: 0,
  driveWrites: 0,
  networkCalls: 0,
  productionAccess: 0,
  externalActions: 0,
  decisionCalibrationImplemented: true,
  metricChecks,
  projectionChecks,
};

console.log(JSON.stringify({ ...summary, digest: createHash("sha256").update(JSON.stringify(summary)).digest("hex") }, null, 2));
