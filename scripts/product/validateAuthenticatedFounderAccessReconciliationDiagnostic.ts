import assert from "node:assert/strict";

import { createAuthenticatedFounderAccessGetHandler } from "../../lib/alpha-provisioning/authenticatedFounderAccessReconciliationRoute";
import { AuthenticatedFounderAccessReconciliationError, AuthenticatedFounderAccessUnauthenticatedError, inspectAuthenticatedFounderAccess } from "../../lib/alpha-provisioning/authenticatedFounderAccessReconciliationOperation";
import type { AlphaOrganizationAccessRecord } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";

const environment = {
  NODE_ENV: "production",
  VERCEL_ENV: "production",
  DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY:
    "test-participant-identity-locator-key-32",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_ZXhhbXBsZS5jbGVyay5hY2NvdW50cyQ",
} as NodeJS.ProcessEnv;
const identity = { consumerId: "private-clerk-subject", provider: "clerk" as const, verificationId: "private-session", verifiedAt: "2026-09-19T00:00:00.000Z" };
const founder = { organizationId: "founder-organization" };
const record = (organizationId: string, status: "active" | "revoked" = "active"): AlphaOrganizationAccessRecord => ({ accessRecordId: `access-${organizationId}-${status}`, policyId: "alpha-explicit-allowlist-disclosure", policyVersion: "1", consumerId: identity.consumerId, organizationId, relationship: "allowed_alpha_user", supportedExperiences: ["organization"], scope: { type: "organization", organizationId }, status, createdAt: "2026-09-18T00:00:00.000Z", ...(status === "revoked" ? { revokedAt: "2026-09-18T01:00:00.000Z" } : {}) });
const run = (records: readonly AlphaOrganizationAccessRecord[], binding = true) => inspectAuthenticatedFounderAccess(environment, {
  openSql: () => ({ end: async () => {} }), resolveIdentity: async () => ({ status: "verified", identity }), resolveFounder: async () => founder,
  access: () => ({ findAccessRecordsForConsumer: async () => records, findExistingParticipantIdentityBinding: async () => binding ? { participantRef: "private-participant" } : undefined, inspectActiveParticipantIdentityNamespace: async () => ({ scheme: "clerk-user-v2" }), findGrants: async () => [] }),
});

async function main(): Promise<void> {
  const pass = await run([record(founder.organizationId)]);
  assert.equal(pass.rootCause, "PASS"); assert.equal(pass.predicates.finalConfiguredOrganizationAuthorized, "PASS");
  const missing = await run([], false);
  assert.equal(missing.rootCause, "ACCESS_GRANT_MISSING"); assert.equal(missing.participantBindingFound, false); assert.equal(missing.predicates.accessQueryReturnedRecords, "FAIL");
  const revoked = await run([record(founder.organizationId, "revoked")]);
  assert.equal(revoked.rootCause, "ACCESS_GRANT_HISTORICAL_OR_REVOKED");
  const other = await run([record("other-organization")]);
  assert.equal(other.rootCause, "ACCESS_GRANT_MISSING"); assert.equal(other.founderOrganizationReferencedByAnyRecord, false);
  const safe = JSON.stringify(missing);
  assert.ok(!safe.includes("private-clerk-subject") && !safe.includes("private-participant") && !safe.includes("founder-organization"));
  const unauthenticated = createAuthenticatedFounderAccessGetHandler(async () => { throw new AuthenticatedFounderAccessUnauthenticatedError(); });
  assert.equal((await unauthenticated()).status, 401);
  const failed = createAuthenticatedFounderAccessGetHandler(async () => { throw new AuthenticatedFounderAccessReconciliationError(); });
  assert.equal((await failed()).status, 409);
  console.log("RESULT PASS authenticated-founder-access-reconciliation-diagnostic");
}
void main();
