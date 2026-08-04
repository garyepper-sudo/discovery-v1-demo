import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { AlphaOrganizationAccessRecord } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { authorizeSandboxRequest, grantsFor, nextSandboxLifecycleTime, resolveSandboxAccessHead, resolveSandboxPersonas, safeAssignment, SANDBOX_ORGANIZATION_ID } from "../../lib/access/sandboxMultiUserAccess";

const environment = {
  DISCOVERY_ENV: "development", NEXT_PUBLIC_DISCOVERY_ENV: "development",
  DISCOVERY_ONBOARDING_TEST_ENABLED: "true", NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ["pk", "test", "synthetic"].join("_"), CLERK_SECRET_KEY: ["sk", "test", "synthetic"].join("_"),
  DISCOVERY_DATABASE_URL: "postgresql://localhost/discovery", DISCOVERY_DATABASE_ADMIN_URL: "postgresql://localhost/discovery", DISCOVERY_DATABASE_MIGRATION_URL: "postgresql://localhost/discovery",
  DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem", DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: "/tmp/onboarding-synthetic",
  DISCOVERY_SANDBOX_CEO_USER_ID: "user_syntheticceo", DISCOVERY_SANDBOX_DIRECTOR_USER_ID: "user_syntheticdirector", DISCOVERY_SANDBOX_MANAGER_USER_ID: "user_syntheticmanager",
};
let checks = 0;
const personas = resolveSandboxPersonas(environment);
assert.equal(new Set(personas.map(({ userId }) => userId)).size, 3); checks++;
assert(personas.every(({ scopes }) => scopes.every(({ organizationId }) => organizationId === SANDBOX_ORGANIZATION_ID))); checks++;
assert.throws(() => resolveSandboxPersonas({ ...environment, DISCOVERY_SANDBOX_MANAGER_USER_ID: environment.DISCOVERY_SANDBOX_DIRECTOR_USER_ID })); checks++;
assert.throws(() => resolveSandboxPersonas({ ...environment, DISCOVERY_SANDBOX_MANAGER_USER_ID: "arbitrary" })); checks++;
assert.throws(() => resolveSandboxPersonas({ ...environment, DISCOVERY_ENV: "production", NEXT_PUBLIC_DISCOVERY_ENV: "production" })); checks++;
const [ceo, director, manager] = personas;
for (const persona of personas) {
  const result = authorizeSandboxRequest({ persona, status: "active", requestedScope: persona.scopes[0]!, operation: persona.operations[0]! });
  assert.equal(result.disposition, "authorized"); checks++;
}
assert.notEqual(authorizeSandboxRequest({ persona: manager, status: "active", requestedScope: ceo.scopes[0]!, operation: manager.operations[0]! }).disposition, "authorized"); checks++;
assert.notEqual(authorizeSandboxRequest({ persona: director, status: "active", requestedScope: { organizationId: SANDBOX_ORGANIZATION_ID, type: "restricted", id: "people-hr" }, operation: director.operations[0]! }).disposition, "authorized"); checks++;
assert.notEqual(authorizeSandboxRequest({ persona: ceo, status: "active", requestedScope: { organizationId: SANDBOX_ORGANIZATION_ID, type: "restricted", id: "people-hr" }, operation: ceo.operations[0]! }).disposition, "authorized"); checks++;
assert.notEqual(authorizeSandboxRequest({ persona: manager, status: "active", requestedScope: manager.scopes[0]!, operation: "understanding:read-historical" }).disposition, "authorized"); checks++;
assert.notEqual(authorizeSandboxRequest({ persona: manager, status: "revoked", requestedScope: manager.scopes[0]!, operation: manager.operations[0]! }).disposition, "authorized"); checks++;
assert.notEqual(authorizeSandboxRequest({ persona: ceo, status: "active", requestedScope: ceo.scopes[0]!, operation: ceo.operations[0]!, organizationId: "another-organization" }).disposition, "authorized"); checks++;
assert.deepEqual(grantsFor({ ...manager, label: "Changed title only" }, "active"), grantsFor(manager, "active")); checks++;
assert.deepEqual(safeAssignment(manager, []), safeAssignment(manager, [])); checks++;
const revokedAt = nextSandboxLifecycleTime("2026-08-04T12:00:00.000Z");
const restoredAt = nextSandboxLifecycleTime(revokedAt);
const revokedAgainAt = nextSandboxLifecycleTime(restoredAt);
assert(Date.parse(revokedAt) < Date.parse(restoredAt) && Date.parse(restoredAt) < Date.parse(revokedAgainAt)); checks++;
assert.throws(() => nextSandboxLifecycleTime("invalid")); checks++;
for (const file of ["middleware.ts", "app/api/development/sandbox-access/route.ts", "app/development/sandbox-access/page.tsx"]) {
  assert(readFileSync(file, "utf8").includes("isHostedDiscoveryEnvironment")); checks++;
}
const accessRecord = (accessRecordId: string, overrides: Partial<AlphaOrganizationAccessRecord> = {}): AlphaOrganizationAccessRecord => ({
  accessRecordId,
  policyId: "alpha-explicit-allowlist-disclosure",
  policyVersion: "1",
  consumerId: manager.userId,
  organizationId: SANDBOX_ORGANIZATION_ID,
  relationship: "allowed_alpha_user",
  supportedExperiences: ["organization"],
  scope: { type: "organization", organizationId: SANDBOX_ORGANIZATION_ID },
  status: "active",
  createdAt: "2026-08-04T12:00:00.000Z",
  ...overrides,
});
const chainOriginal = accessRecord("chain:original", { status: "revoked", revokedAt });
const chainRestore = accessRecord("chain:restore", { createdAt: restoredAt, supersedesAccessRecordId: chainOriginal.accessRecordId });
const chainRevokedAgain = accessRecord("chain:revoked-again", { status: "revoked", createdAt: revokedAgainAt, revokedAt: revokedAgainAt, supersedesAccessRecordId: chainRestore.accessRecordId });
const chainRestoredAgain = accessRecord("chain:restored-again", { createdAt: nextSandboxLifecycleTime(revokedAgainAt), supersedesAccessRecordId: chainRevokedAgain.accessRecordId });
assert.equal(resolveSandboxAccessHead([chainOriginal, chainRestore, chainRevokedAgain, chainRestoredAgain])?.accessRecordId, chainRestoredAgain.accessRecordId); checks++;
assert.equal(resolveSandboxAccessHead([chainRestoredAgain, chainOriginal, chainRevokedAgain, chainRestore])?.accessRecordId, chainRestoredAgain.accessRecordId); checks++;
assert.throws(() => resolveSandboxAccessHead([chainOriginal, chainRestore, accessRecord("chain:fork", { createdAt: restoredAt, supersedesAccessRecordId: chainOriginal.accessRecordId })])); checks++;
assert.throws(() => resolveSandboxAccessHead([chainOriginal, accessRecord("chain:foreign", { consumerId: "user_syntheticother", createdAt: restoredAt, supersedesAccessRecordId: chainOriginal.accessRecordId })])); checks++;
assert.throws(() => resolveSandboxAccessHead([accessRecord("cycle:a", { supersedesAccessRecordId: "cycle:b" }), accessRecord("cycle:b", { supersedesAccessRecordId: "cycle:a" })])); checks++;
console.log(`RESULT: PASS (${checks} deterministic checks; network=0 connector=0 drive=0 production=0)`);
