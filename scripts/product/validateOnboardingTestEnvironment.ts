import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  onboardingTestOrganizationId,
  provisionOnboardingTestOrganization,
  resolveOnboardingRouteState,
} from "../../lib/onboarding/testing";
import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";

const baseEnvironment = {
  DISCOVERY_ENV: "development",
  NEXT_PUBLIC_DISCOVERY_ENV: "development",
  DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
  NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_validation",
  CLERK_SECRET_KEY: "sk_test_validation",
  DISCOVERY_DATABASE_URL: "postgresql://localhost/discovery_onboarding",
  DISCOVERY_DATABASE_ADMIN_URL: "postgresql://127.0.0.1/discovery_onboarding",
  DISCOVERY_DATABASE_MIGRATION_URL: "postgresql://localhost/discovery_onboarding",
  DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem",
  DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: "/tmp/discovery-onboarding-validation",
  DISCOVERY_ALPHA_ORGANIZATION_ID: "",
  DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED: "false",
  DISCOVERY_RUNTIME_PROVISIONING_ENABLED: "false",
  DISCOVERY_ACCESS_PROVISIONING_ENABLED: "false",
} as const;

function refuses(changes: Record<string, string>): void {
  assert.throws(() => validateOnboardingTestEnvironment({
    ...baseEnvironment,
    ...changes,
  }));
}

async function main(): Promise<void> {
  validateOnboardingTestEnvironment(baseEnvironment);
  assert.throws(
    () => validateOnboardingTestEnvironment({
      ...baseEnvironment,
      DISCOVERY_ENV: "production",
      NEXT_PUBLIC_DISCOVERY_ENV: "production",
    }),
    /forbidden in production/,
    "Production reset is rejected before any network or storage dependency is created",
  );
  assert.throws(
    () => validateOnboardingTestEnvironment({
      ...baseEnvironment,
      DISCOVERY_DATABASE_URL: "postgresql://production.example/db",
    }),
    /remote databases are refused/,
    "Development onboarding continues to reject remote PostgreSQL",
  );
  refuses({ CLERK_SECRET_KEY: "sk_live_forbidden" });
  refuses({ DISCOVERY_RUNTIME_STORAGE_BACKEND: "vercel-blob" });
  refuses({ DISCOVERY_ALPHA_ORGANIZATION_ID: "atlas-manufacturing-simulation" });
  refuses({ NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "false" });

const [rootRouteSource, onboardingRouteSource, compatibilityRouteSource] =
  await Promise.all([
    readFile("app/page.tsx", "utf8"),
    readFile("app/onboarding/page.tsx", "utf8"),
    readFile("app/discovery-v1/page.tsx", "utf8"),
  ]);
assert.match(
  rootRouteSource,
  /export const dynamic = ["']force-dynamic["'];/,
  "The environment-sensitive root route must execute per request",
);
assert.match(
  onboardingRouteSource,
  /export const dynamic = ["']force-dynamic["'];/,
  "The Clerk and access-state-dependent onboarding route must execute per request",
);
assert.match(
  onboardingRouteSource,
  /<DiscoveryOnboardingExperience/,
  "New and interrupted users render the canonical onboarding experience",
);
assert.match(
  compatibilityRouteSource,
  /Legacy route retained for direct compatibility only/,
  "/discovery-v1 remains an explicit compatibility wrapper",
);
assert.doesNotMatch(
  compatibilityRouteSource,
  /resolveOnboardingRouteState|validateOnboardingTestEnvironment/,
  "/discovery-v1 must not duplicate canonical onboarding routing",
);
await import("../../app/page");

const now = "2026-01-01T00:00:00.000Z";
const consumerId = "user_onboarding_validation";
const requestId = "request-onboarding-validation";
const expectedOrganizationId = onboardingTestOrganizationId({ consumerId, requestId });
const runtimeByOrganization = new Map<string, any>();
const accessRecords: any[] = [];

const runtimeRepository: any = {
  backend: "filesystem",
  async read(organizationId: string) {
    return runtimeByOrganization.get(organizationId) ?? null;
  },
  async create(organizationId: string, bytes: Uint8Array) {
    const runtime = JSON.parse(new TextDecoder().decode(bytes));
    const stored = { runtime, revision: `revision-${organizationId}`, bytes };
    runtimeByOrganization.set(organizationId, stored);
    return stored;
  },
};
const accessRepository: any = {
  async findAccessRecordsForConsumer(input: { consumerId: string }) {
    return accessRecords.filter((record) => record.consumerId === input.consumerId);
  },
  async findAccessRecords(input: { consumerId: string; organizationId: string }) {
    return accessRecords.filter((record) =>
      record.consumerId === input.consumerId &&
      record.organizationId === input.organizationId
    );
  },
  async grantAccess(input: any) {
    const record = {
      accessRecordId: input.accessRecordId,
      consumerId: input.consumerId,
      organizationId: input.organizationId,
      experience: "organization",
      status: "active",
      grantedAt: input.grantedAt,
    };
    accessRecords.push(record);
    return record;
  },
};

const newUserState = await resolveOnboardingRouteState({
  consumerId,
  resolvedAt: now,
  accessRepository,
  runtimeRepository,
});
assert.deepEqual(
  newUserState,
  { status: "new-user" },
  "Scenario A: a new user renders canonical onboarding",
);

const firstProvisioning = await provisionOnboardingTestOrganization({
  environment: baseEnvironment,
  consumerId,
  requestId,
  organizationName: "Validation Organization",
  now,
  runtimeRepository,
  accessRepository,
});
assert.equal(firstProvisioning.organizationId, expectedOrganizationId);
assert.equal(firstProvisioning.runtime.created, true);
assert.equal(firstProvisioning.access.created, true);
const interruptedState = await resolveOnboardingRouteState({
  consumerId,
  resolvedAt: now,
  accessRepository,
  runtimeRepository,
});
assert.deepEqual(
  interruptedState,
  { status: "interrupted", organizationId: expectedOrganizationId },
  "Scenario B: interrupted onboarding renders with resumable organization state",
);

const repeatedProvisioning = await provisionOnboardingTestOrganization({
  environment: baseEnvironment,
  consumerId,
  requestId,
  organizationName: "Validation Organization",
  now,
  runtimeRepository,
  accessRepository,
});
assert.equal(repeatedProvisioning.runtime.created, false);
assert.equal(repeatedProvisioning.access.created, false);

runtimeByOrganization.get(expectedOrganizationId).runtime.metadata.investigationCount = 1;
const activeState = await resolveOnboardingRouteState({
  consumerId,
  resolvedAt: now,
  accessRepository,
  runtimeRepository,
});
assert.equal(activeState.status, "active");
assert.equal(
  activeState.status === "active" ? activeState.destination : null,
  `/your-organization?organizationId=${expectedOrganizationId}`,
  "Scenario C: completed onboarding redirects to the workspace",
);

accessRecords.push(
  {
    accessRecordId: "multi-access-one",
    consumerId: "user_multiple_validation",
    organizationId: "onb-dev-111111111111111111111111",
    experience: "organization",
    status: "active",
    grantedAt: now,
  },
  {
    accessRecordId: "multi-access-two",
    consumerId: "user_multiple_validation",
    organizationId: "onb-dev-222222222222222222222222",
    experience: "organization",
    status: "active",
    grantedAt: now,
  },
);
assert.deepEqual(await resolveOnboardingRouteState({
  consumerId: "user_multiple_validation",
  resolvedAt: now,
  accessRepository,
  runtimeRepository,
}), {
  status: "organization-selection-required",
  organizationIds: [
    "onb-dev-111111111111111111111111",
    "onb-dev-222222222222222222222222",
  ],
  destination: "/organizations",
}, "Multiple organizations redirect to organization selection");

accessRecords.push({
  accessRecordId: "invited-access",
  consumerId: "user_invited_validation",
  organizationId: expectedOrganizationId,
  experience: "organization",
  status: "active",
  grantedAt: now,
});
assert.equal((await resolveOnboardingRouteState({
  consumerId: "user_invited_validation",
  resolvedAt: now,
  accessRepository,
  runtimeRepository,
})).status, "active", "Scenario D: invited user enters the existing organization");

accessRecords.splice(0, accessRecords.length);
runtimeByOrganization.delete(expectedOrganizationId);
assert.equal((await resolveOnboardingRouteState({
  consumerId,
  resolvedAt: now,
  accessRepository,
  runtimeRepository,
})).status, "new-user", "Scenario E: reset returns the user to a clean first-run state");

  console.log("Onboarding test environment validation passed (scenarios A-E).");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
