import assert from "node:assert/strict";

import {
  resolveScopedGovernanceContext,
  type GovernedScopeRef,
  type ScopedAuthorityGrant,
  type ScopedGovernanceContext,
} from "../../engine/v3/governance/scopedGovernanceContext";
import {
  projectScopedDecisionCalibration,
  type DecisionCalibrationAxis,
  type DecisionCalibrationAxisValue,
  type DecisionCalibrationClassification,
  type ServerResolvedDecisionCalibrationInput,
  type ServerResolvedDecisionCalibrationSignal,
} from "../../product/integration/scopedDecisionCalibrationProjection";
import {
  readScopedOrganizationalProductProjection,
  type ScopedProjectionRepositorySource,
} from "../../product/integration/scopedOrganizationalProductProjection";

const ORG = "synthetic-multi-role-governance-001";
const FOREIGN = "synthetic-multi-role-governance-other-001";
const NOW = "2026-08-06T12:00:00.000Z";
const EARLIER = "2026-08-05T12:00:00.000Z";
const REVISION = "decision-context-revision:1";
const SCOPE = { organizationId: ORG, type: "team", id: "scope:team:delivery" } as const satisfies GovernedScopeRef;
const CANARIES = ["restricted-strategy-canary", "restricted-evidence-canary", "raw-runtime-canary"];
const trace: Array<Record<string, unknown>> = [];
let repositoryReads = 0;
let writes = 0;

function grant(subjectId: string, status: "active" | "revoked" = "active"): ScopedAuthorityGrant {
  return { authorityRef: `authority:${subjectId}`, policyRef: "policy:scoped-decision-calibration:v1", organizationId: ORG, subjectId, scope: SCOPE, operations: ["understanding:disclose-direct", "understanding:disclose-derived", "understanding:read-historical"], sensitivity: ["standard"], relationship: "direct", status, validFrom: EARLIER, ...(status === "revoked" ? { revokedAt: NOW } : {}) };
}
function context(subjectId = "person:manager", grants: ScopedAuthorityGrant[] = [grant(subjectId)], temporal: ScopedGovernanceContext["temporal"] = { mode: "current" }): ScopedGovernanceContext {
  return resolveScopedGovernanceContext({ organizationId: ORG, subjectId, requestedScope: SCOPE, operation: temporal.mode === "historical" ? "understanding:read-historical" : "understanding:disclose-derived", purpose: "evaluate-authorized-decision-context", sensitivity: "standard", evaluatedAt: NOW, temporal, serverResolvedAuthority: grants });
}
const defaultValues: { [A in DecisionCalibrationAxis]: DecisionCalibrationAxisValue[A] } = {
  authority: "authorized", "strategic-relationship": "consistent", "evidence-support": "current-supported",
  "local-feasibility": "feasible", "cross-scope-effect": "compatible", "strategy-challenge-potential": "no-supported-challenge",
  "experiment-status": "not-experiment", "outcome-status": "not-yet-observed",
};
function signal<A extends DecisionCalibrationAxis>(axis: A, value: DecisionCalibrationAxisValue[A], authorityRef: string, supportRefs: string[] = [`lineage:${axis}`]): ServerResolvedDecisionCalibrationSignal<A> {
  return { axis, value, safeRef: `calibration:${axis}`, organizationId: ORG, scope: SCOPE, sensitivity: "standard", derivedKind: axis === "evidence-support" ? "summary" : "explanation", support: supportRefs.map((safeRef) => ({ safeRef, organizationId: ORG, scope: SCOPE, sensitivity: "standard", authorityRef })), supportLineageComplete: true, safeAbstractionAllowed: false, protectedCombination: false, safeReasonCode: `canonical-${axis}`, auditRefs: [`audit:${axis}`] };
}
function calibration(ctx: ScopedGovernanceContext, overrides: Partial<{ [A in DecisionCalibrationAxis]: DecisionCalibrationAxisValue[A] }> = {}, inputOverrides: Partial<ServerResolvedDecisionCalibrationInput> = {}): ServerResolvedDecisionCalibrationInput {
  const authorityRef = ctx.disposition === "authorized" ? ctx.authorityRefs[0]! : "authority:unresolved";
  const values = { ...defaultValues, ...overrides };
  const experiment = values["experiment-status"] === "authorized-bounded-experiment";
  const canonicalInputs: ServerResolvedDecisionCalibrationInput["canonicalInputs"] = {
    strategicAssumptionRefs: ["assumption:strategy:1"], localAssumptionRefs: ["assumption:local:1"],
    supportingEvidenceRefs: ["evidence:supporting:1"], contradictingEvidenceRefs: values["strategy-challenge-potential"] === "may-require-strategy-review" ? ["evidence:contradicting:1"] : [],
    organizationalUnderstandingRefs: ["understanding:scope:1"], localConstraintRefs: ["constraint:local:1"],
    broaderConstraintRefs: ["constraint:broader:1"], crossFunctionalDependencyRefs: ["dependency:cross-functional:1"],
    expectedOutcomeRef: "outcome:expected:1", actualOutcomeRefs: values["outcome-status"] === "not-yet-observed" ? [] : ["outcome:actual:1"],
    ...(experiment ? { experimentAuthorizationRef: "experiment-authority:1", experimentBoundsRef: "experiment-bounds:1", reversibilityRef: "reversibility:1" } : {}),
    disclosurePolicyRefs: ["policy:scoped-decision-calibration:v1"],
  };
  const canonicalRefs = Object.values(canonicalInputs).flatMap((value) => Array.isArray(value) ? value : value ? [value] : []);
  return { organizationId: ORG, recipientId: ctx.subjectId, decisionRef: "decision:northstar:001", decisionRevisionRef: "decision:northstar:001:v1", decisionStatus: "proposed", decisionOwnerRef: "person:decision-owner", decisionScope: SCOPE, decisionTimeAuthorityRef: authorityRef, currentAuthorityRef: authorityRef, objectiveRevisionRef: "objective:northstar:v3", optimizationContextRevisionRef: "optimization-context:northstar:v2", decisionTimeContextRevisionRef: REVISION, canonicalInputs, signals: (Object.keys(values) as DecisionCalibrationAxis[]).map((axis, index) => signal(axis, values[axis] as never, authorityRef, index === 0 ? canonicalRefs : [`lineage:${axis}`])), divergenceExplanationSearchComplete: false, protectedCombination: false, auditRefs: ["audit:decision:northstar"], ...inputOverrides };
}
function produce(ctx: ScopedGovernanceContext, source: ServerResolvedDecisionCalibrationInput) {
  return projectScopedDecisionCalibration({ authenticatedUserId: ctx.subjectId, organizationId: ORG, context: ctx, serverResolved: source });
}
function source(decisionCalibration: ServerResolvedDecisionCalibrationInput): ScopedProjectionRepositorySource {
  return { organizationId: ORG, sourceRevisionRef: REVISION, items: [], metrics: [], metricCombinationPolicy: [], decisionCalibration };
}
function adapter(ctx: ScopedGovernanceContext, decisionCalibration: ServerResolvedDecisionCalibrationInput) {
  return readScopedOrganizationalProductProjection({ authenticatedUserId: ctx.subjectId, organizationId: ORG, context: ctx, repository: { readAuthorizedSource: () => { repositoryReads += 1; return structuredClone(source(decisionCalibration)); } } });
}
function check(id: string, benchmarkCaseId: string, expected: DecisionCalibrationClassification, overrides: Partial<{ [A in DecisionCalibrationAxis]: DecisionCalibrationAxisValue[A] }>, inputOverrides: Partial<ServerResolvedDecisionCalibrationInput> = {}): void {
  const ctx = context();
  const before = repositoryReads;
  const calibrationInput = calibration(ctx, overrides, inputOverrides);
  const output = adapter(ctx, calibrationInput);
  assert.ok(output.decisionCalibration && "classification" in output.decisionCalibration);
  const result = output.decisionCalibration;
  assert.equal(result.classification, expected);
  assert.equal(repositoryReads - before, 1);
  assert.equal(output.unsupportedCapabilities.length, 0);
  assert.equal(result.executionAuthorized, false);
  trace.push({ id, benchmarkCaseId, productionOwner: "projectScopedDecisionCalibration", adapter: "readScopedOrganizationalProductProjection", organization: ORG, recipient: ctx.subjectId, requestedScope: SCOPE.id, purpose: ctx.purpose, decisionRef: result.decisionRef, objectiveRevision: result.objectiveRevisionRef, optimizationContextRevision: result.optimizationContextRevisionRef, authorityResult: result.axes.find((axis) => axis.axis === "authority"), authorizedEvidenceInputs: calibrationInput.canonicalInputs.supportingEvidenceRefs, withheldInputs: [], authorizedUnderstandingInputs: calibrationInput.canonicalInputs.organizationalUnderstandingRefs, localConstraints: calibrationInput.canonicalInputs.localConstraintRefs, broaderConstraints: calibrationInput.canonicalInputs.broaderConstraintRefs, experimentAuthority: calibrationInput.canonicalInputs.experimentAuthorizationRef ?? null, outcomeState: result.axes.find((axis) => axis.axis === "outcome-status"), axisDispositions: result.axes.map((axis) => [axis.axis, axis.disposition, axis.value]), overallClassification: expected, safeLineage: result.safeSupportingLineage, reads: 1, writes: 0, externalActivity: 0, observedSerializedResult: JSON.stringify(result) });
}

check("case-01", "decision:aligned-supported", "aligned-supported", {});
check("case-02", "decision:aligned-stale", "aligned-stale", { "evidence-support": "explicitly-stale" });
check("case-03", "decision:justified-divergence", "justified-divergence", { "strategic-relationship": "materially-divergent" });
check("case-04", "decision:unexplained-drift", "unexplained-drift", { "strategic-relationship": "materially-divergent", "evidence-support": "insufficient-authorized-evidence" }, { divergenceExplanationSearchComplete: true });
check("case-05", "decision:ambiguous-intent", "ambiguous-strategic-intent", { "strategic-relationship": "ambiguous" });
check("case-06", "decision:cross-scope-conflict", "cross-scope-conflict", { "cross-scope-effect": "material-conflict" });
check("case-07", "decision:local-infeasibility", "local-infeasibility", { "local-feasibility": "infeasible" });
check("case-08", "decision:possible-strategy-invalidation", "possible-strategy-invalidation", { "strategic-relationship": "materially-divergent", "evidence-support": "mixed-or-contradicted", "strategy-challenge-potential": "may-require-strategy-review" });
check("case-09", "decision:authorized-experiment", "authorized-experiment", { authority: "authorized-bounded-experiment", "strategic-relationship": "materially-divergent", "experiment-status": "authorized-bounded-experiment" });
check("case-10", "decision:outside-authority", "unauthorized-action", { authority: "outside-authority" });
check("case-11", "decision:additional-authority", "unauthorized-action", { authority: "requires-additional-authority" });

const authorized = context();
const incomplete = calibration(authorized);
incomplete.signals.find((item) => item.axis === "evidence-support")!.supportLineageComplete = false;
assert.equal(produce(authorized, incomplete).classification, "insufficient-authorized-information");
const hidden = calibration(authorized);
hidden.signals.find((item) => item.axis === "strategic-relationship")!.sensitivity = "restricted";
assert.equal(produce(authorized, hidden).classification, "withheld");
const unavailableOutcome = calibration(authorized);
unavailableOutcome.signals = unavailableOutcome.signals.filter((item) => item.axis !== "outcome-status");
const unavailableOutcomeResult = produce(authorized, unavailableOutcome);
assert.equal(unavailableOutcomeResult.classification, "aligned-supported");
assert.equal(unavailableOutcomeResult.axes.find((axis) => axis.axis === "outcome-status")?.disposition, "unavailable");
const combined = calibration(authorized, {}, { protectedCombination: true });
assert.equal(produce(authorized, combined).classification, "withheld");

const reordered = calibration(authorized);
const reversed = { ...reordered, signals: [...reordered.signals].reverse() };
assert.deepEqual(produce(authorized, reordered), produce(authorized, reversed));
const duplicated = { ...reordered, signals: [...reordered.signals, structuredClone(reordered.signals[0]!)] };
assert.deepEqual(produce(authorized, reordered), produce(authorized, duplicated));

const historical = context("person:manager", [grant("person:manager")], { mode: "historical", revisionRef: REVISION, snapshotAt: EARLIER });
assert.equal(produce(historical, calibration(historical)).classification, "aligned-supported");
const restored = context("person:restored", [grant("person:restored")]);
assert.equal(produce(restored, calibration(restored)).classification, "aligned-supported");
const revoked = context("person:revoked", [grant("person:revoked", "revoked")]);
assert.equal(produce(revoked, calibration(revoked)).classification, "withheld");

const beforeDenied = repositoryReads;
const deniedAdapter = readScopedOrganizationalProductProjection({ authenticatedUserId: "person:other", organizationId: ORG, context: authorized, repository: { readAuthorizedSource: () => { repositoryReads += 1; return source(calibration(authorized)); } } });
assert.equal(deniedAdapter.disposition, "withheld"); assert.equal(repositoryReads, beforeDenied);
const beforeForeign = repositoryReads;
const foreignAdapter = readScopedOrganizationalProductProjection({ authenticatedUserId: authorized.subjectId, organizationId: FOREIGN, context: authorized, repository: { readAuthorizedSource: () => { repositoryReads += 1; return source(calibration(authorized)); } } });
assert.equal(foreignAdapter.disposition, "withheld"); assert.equal(repositoryReads, beforeForeign);

const roleNames = ["team-lead", "manager", "director", "functional-executive", "organization-executive"];
const roleOutputs = roleNames.map(() => produce(authorized, calibration(authorized)));
for (const output of roleOutputs.slice(1)) assert.deepEqual(output, roleOutputs[0]);

const serialized = JSON.stringify({ trace, incomplete: produce(authorized, incomplete), hidden: produce(authorized, hidden), unavailableOutcomeResult });
for (const canary of CANARIES) assert.equal(serialized.includes(canary), false);
for (const forbidden of ["alignmentScore", "conformityScore", "approve", "reject", "execute", "mutate", "organizationalUnderstandingState", "runtime", "memory"]) assert.equal(serialized.includes(`\"${forbidden}\"`), false);
assert.equal(writes, 0);

console.log(JSON.stringify({ result: "PASS", gap: "GAP-MR-006", focusedChecks: 32, canonicalCases: 10, productionOwner: "projectScopedDecisionCalibration", adapter: "readScopedOrganizationalProductProjection", authorizedProjectionRepositoryReads: 1, deniedProjectionRepositoryReads: 0, crossOrganizationProjectionRepositoryReads: 0, writes, network: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0, productionAccess: 0, deployment: 0, trace }, null, 2));
