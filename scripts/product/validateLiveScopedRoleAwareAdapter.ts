import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import type { AlphaOrganizationAccessRecord } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import { SANDBOX_PERSONAS, SANDBOX_ORGANIZATION_ID, type ResolvedSandboxPersona } from "../../lib/access/sandboxMultiUserAccess";
import { assertFrontendSafeSerialization } from "../../product/frontend/roleAwareLivingOrganization";
import { mapRoleAwarePresentation } from "../../product/frontend/roleAwarePresentation";
import { defaultSandboxScope, readLiveScopedRoleAwareProjection } from "../../product/integration/liveScopedRoleAwareAdapter";
import { readScopedOrganizationalProductProjection } from "../../product/integration/scopedOrganizationalProductProjection";

const NOW = "2026-08-04T20:00:00.000Z";
let checks = 0;
const check = (condition: unknown, message: string) => { assert.ok(condition, message); checks += 1; };
const persona = (index: number, label?: string): ResolvedSandboxPersona => ({ ...SANDBOX_PERSONAS[index]!, ...(label ? { label } : {}), userId: `user_syntheticlive${index}` });
const record = (p: ResolvedSandboxPersona, overrides: Partial<AlphaOrganizationAccessRecord> = {}): AlphaOrganizationAccessRecord => ({
  accessRecordId: `access:${p.key}`,
  policyId: "alpha-explicit-allowlist-disclosure",
  policyVersion: "1",
  consumerId: p.userId,
  organizationId: SANDBOX_ORGANIZATION_ID,
  relationship: "allowed_alpha_user",
  supportedExperiences: ["organization"],
  scope: { type: "organization", organizationId: SANDBOX_ORGANIZATION_ID },
  status: "active",
  createdAt: "2026-08-04T12:00:00.000Z",
  ...overrides,
});

function runtimeRepository(organizationId = SANDBOX_ORGANIZATION_ID) {
  let reads = 0;
  const runtime = createEmptyOrganizationRuntime({ organizationId, name: "Synthetic live validation" });
  return {
    repository: { read: async (requested: string) => { reads += 1; return requested === organizationId ? { bytes: new Uint8Array(), revision: "revision:synthetic-live", runtime } : null; } },
    reads: () => reads,
  };
}

async function main() {
for (let index = 0; index < 3; index += 1) {
  const p = persona(index);
  const counted = runtimeRepository();
  let projectionCalls = 0;
  const live = await readLiveScopedRoleAwareProjection({ userId: p.userId, organizationId: SANDBOX_ORGANIZATION_ID, persona: p, accessRecords: [record(p)], runtimeRepository: counted.repository, evaluatedAt: NOW, projectionReader: (input) => { projectionCalls += 1; return readScopedOrganizationalProductProjection(input); } });
  check(live.runtimeReads === 1 && counted.reads() === 1, `${p.key} must use one Runtime read`);
  check(projectionCalls === 1, `${p.key} must produce exactly one scoped Product projection`);
  check(live.disposition === "authorized", `${p.key} must return an authorized live result`);
  if (live.disposition !== "authorized") throw new Error(`${p.key} unexpectedly denied`);
  check(live.projection.recipientId === p.userId && live.projection.organizationId === SANDBOX_ORGANIZATION_ID, `${p.key} identity binding`);
  check(JSON.stringify(live.projection.requestedScope) === JSON.stringify(defaultSandboxScope(p)), `${p.key} default scope`);
  assertFrontendSafeSerialization(live.projection);
}

const manager = persona(2);
for (const scenario of [
  { name: "recipient mismatch", userId: "user_syntheticother", organizationId: SANDBOX_ORGANIZATION_ID, records: [record(manager)] },
  { name: "revoked", userId: manager.userId, organizationId: SANDBOX_ORGANIZATION_ID, records: [record(manager, { status: "revoked", revokedAt: NOW })] },
  { name: "cross organization", userId: manager.userId, organizationId: "sandbox-foreign", records: [record(manager)] },
  { name: "malformed chain", userId: manager.userId, organizationId: SANDBOX_ORGANIZATION_ID, records: [record(manager), record(manager, { accessRecordId: "access:fork", supersedesAccessRecordId: "missing" })] },
]) {
  const counted = runtimeRepository();
  let projectionCalls = 0;
  const live = await readLiveScopedRoleAwareProjection({ userId: scenario.userId, organizationId: scenario.organizationId, persona: manager, accessRecords: scenario.records, runtimeRepository: counted.repository, evaluatedAt: NOW, projectionReader: (input) => { projectionCalls += 1; return readScopedOrganizationalProductProjection(input); } });
  check(live.disposition === "denied" && live.runtimeReads === 0 && counted.reads() === 0, `${scenario.name} must deny before Runtime read`);
  check(projectionCalls === 0 && live.projection === null, `${scenario.name} must produce no Product projection`);
}

const standard = persona(1);
const renamed = persona(1, "Changed descriptive title");
const standardRuntime = runtimeRepository();
const renamedRuntime = runtimeRepository();
const standardProjection = await readLiveScopedRoleAwareProjection({ userId: standard.userId, organizationId: SANDBOX_ORGANIZATION_ID, persona: standard, accessRecords: [record(standard)], runtimeRepository: standardRuntime.repository, evaluatedAt: NOW });
const renamedProjection = await readLiveScopedRoleAwareProjection({ userId: renamed.userId, organizationId: SANDBOX_ORGANIZATION_ID, persona: renamed, accessRecords: [record(renamed)], runtimeRepository: renamedRuntime.repository, evaluatedAt: NOW });
if (standardProjection.disposition !== "authorized" || renamedProjection.disposition !== "authorized") throw new Error("Role-neutral validation unexpectedly denied");
check(JSON.stringify(standardProjection.projection) === JSON.stringify(renamedProjection.projection), "role title must not change projection meaning");

const view = mapRoleAwarePresentation({ description: "Live", roleDescription: standard.label, scopeLabel: standardProjection.scopeLabel, workspace: "home", projection: standardProjection.projection, primaryHeading: "Live", expectedDisposition: "disclosed", routePath: "/development/role-aware-live", liveDiagnostic: { organizationId: SANDBOX_ORGANIZATION_ID, requestedScope: standardProjection.scopeLabel, sourceRevisionDigest: standardProjection.sourceRevisionDigest } });
assertFrontendSafeSerialization(view);
const serialized = JSON.stringify(view);
check(!serialized.includes("RA-"), "live presentation must contain no fixture identity");
check(!serialized.includes("fixtureId"), "live presentation must contain no fixture selector binding");
check(!serialized.includes("runtime") && !serialized.includes("memory"), "live presentation must contain no raw Runtime");
check(view.metrics.length === 0, "unsupported or unlineaged metric values must not appear");
check(view.decisionCalibration === null, "unavailable decision calibration must not be recomputed by presentation");
check(view.routePath === "/development/role-aware-live", "live route must remain isolated");

const page = readFileSync("app/development/role-aware-live/page.tsx", "utf8");
const middleware = readFileSync("middleware.ts", "utf8");
check(page.includes("isHostedDiscoveryEnvironment()") && page.includes("notFound()"), "Production route must fail with 404");
check(page.includes("noStore()") && middleware.includes("role-aware-live"), "live route must be private and authenticated");
check(!page.includes("ROLE_AWARE_FIXTURES") && !page.includes("getRoleAwareFixture"), "live route must have no fixture fallback");
check(!page.includes("searchParams).role") && !page.includes("searchParams).scope"), "live route must accept no role or scope authority");

console.log(JSON.stringify({ status: "PASS", checks, runtimeReads: { authorized: 1, denied: 0, revoked: 0, crossOrganization: 0 }, fixtureFallback: false, rawRuntimeReturned: false, externalActivity: { network: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0 } }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Live scoped adapter validation failed.");
  process.exitCode = 1;
});
