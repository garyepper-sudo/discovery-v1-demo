import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  GoogleDriveConnectorService,
  GoogleDriveOAuthStateError,
  sha256,
  type GoogleDriveAuthorizationStateRecord,
  type GoogleDriveConnectorMetadata,
} from "../../product/connectors/google-drive";
import {
  GOOGLE_DRIVE_DEVELOPMENT_PURPOSE,
  GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE,
  isGoogleDriveDevelopmentOrganizationEligible,
  isGoogleDriveSandboxAcceptanceScope,
} from "../../product/connectors/google-drive/developmentEligibility";
import { SANDBOX_ORGANIZATION_ID } from "../../product/simulations/living-organization-sandbox/manifest";

const USER = "user_binding_contract_test";
const ONBOARDING_ORGANIZATION = "onb-dev-0123456789abcdef01234567";
const NOW = "2026-08-01T12:00:00.000Z";
let checks = 0;
const check = (condition: unknown, message: string) => {
  assert.ok(condition, message);
  checks += 1;
};

function environment(overrides: Record<string, string | undefined> = {}) {
  return {
    DISCOVERY_ENV: "development",
    NEXT_PUBLIC_DISCOVERY_ENV: "development",
    DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
    NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_binding",
    CLERK_SECRET_KEY: "sk_test_binding",
    DISCOVERY_DATABASE_URL: "postgres://localhost/discovery_binding",
    DISCOVERY_DATABASE_ADMIN_URL: "postgres://localhost/discovery_binding",
    DISCOVERY_DATABASE_MIGRATION_URL: "postgres://localhost/discovery_binding",
    DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem",
    DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: "/tmp/discovery-onboarding-binding",
    DISCOVERY_ALPHA_ORGANIZATION_ID: "",
    DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED: "false",
    DISCOVERY_RUNTIME_PROVISIONING_ENABLED: "false",
    DISCOVERY_ACCESS_PROVISIONING_ENABLED: "false",
    DISCOVERY_GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_ENABLED: "true",
    DISCOVERY_GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_USER_ID: USER,
    ...overrides,
  };
}

function eligible(
  organizationId: string,
  purpose: typeof GOOGLE_DRIVE_DEVELOPMENT_PURPOSE | typeof GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE = GOOGLE_DRIVE_DEVELOPMENT_PURPOSE,
  overrides = {},
) {
  return isGoogleDriveDevelopmentOrganizationEligible({
    organizationId,
    userId: USER,
    purpose,
    environment: environment(overrides),
  });
}

check(eligible(ONBOARDING_ORGANIZATION), "Existing canonical onboarding ID must remain eligible.");
for (const invalid of [
  "onb-dev-0123456789abcdef0123456",
  "onb-dev-0123456789abcdef012345678",
  "onb-dev-0123456789ABCDEF01234567",
  "onb-dev-0123456789abcdef0123456g",
]) check(!eligible(invalid), `Malformed onboarding ID must remain rejected: ${invalid}`);
check(!eligible(SANDBOX_ORGANIZATION_ID), "Sandbox must be rejected for the ordinary connector purpose.");
check(!isGoogleDriveDevelopmentOrganizationEligible({
  organizationId: ONBOARDING_ORGANIZATION,
  userId: USER,
  purpose: "unrelated-purpose" as never,
  environment: environment(),
}), "Unknown connector purposes must be rejected for every organization.");
check(!isGoogleDriveSandboxAcceptanceScope({
  organizationId: ONBOARDING_ORGANIZATION,
  userId: USER,
  purpose: GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE,
  environment: environment(),
}), "The sandbox purpose must not bypass ordinary onboarding organization authority.");
check(!eligible(SANDBOX_ORGANIZATION_ID, GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE, {
  DISCOVERY_GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_ENABLED: "false",
}), "Disabled sandbox acceptance must reject the sandbox ID.");
check(eligible(SANDBOX_ORGANIZATION_ID, GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE),
  "Enabled exact-user development sandbox acceptance must accept the exact sandbox ID.");
check(!eligible("sandbox-other", GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE),
  "Arbitrary sandbox IDs must be rejected.");
check(!eligible(SANDBOX_ORGANIZATION_ID, GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE, {
  DISCOVERY_GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_USER_ID: "user_other",
}), "User substitution must be rejected.");
check(!eligible(SANDBOX_ORGANIZATION_ID, GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE, {
  DISCOVERY_ENV: "production",
  NEXT_PUBLIC_DISCOVERY_ENV: "production",
}), "Production must reject the sandbox exception.");
check(!eligible(SANDBOX_ORGANIZATION_ID, GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE, {
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_live_forbidden",
  CLERK_SECRET_KEY: "sk_live_forbidden",
}), "Live Clerk keys must reject the sandbox exception.");
check(!eligible(SANDBOX_ORGANIZATION_ID, GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE, {
  DISCOVERY_DATABASE_URL: "postgres://remote.invalid/discovery",
}), "Failed local environment validation must reject the sandbox exception.");

class States {
  records = new Map<string, GoogleDriveAuthorizationStateRecord>();
  async create(record: GoogleDriveAuthorizationStateRecord) { this.records.set(record.stateDigest, record); }
  async inspect(digest: string) { return this.records.get(digest) ?? null; }
  async consume(digest: string, consumedAt: string) {
    const record = this.records.get(digest);
    if (!record) return "missing" as const;
    if (record.consumedAt) return "already-consumed" as const;
    this.records.set(digest, { ...record, consumedAt });
    return "consumed" as const;
  }
}

const states = new States();
const metadata: GoogleDriveConnectorMetadata = { sources: [], folders: [], files: [], passages: [], sourceVersions: [] };
const service = new GoogleDriveConnectorService({
  api: {
    authorizationUrl: (state: string) => `https://accounts.invalid/?state=${state}`,
  } as never,
  credentials: { read: async () => null, write: async () => undefined, delete: async () => false },
  metadata: { read: async () => metadata, replace: async () => undefined },
  productAdapter: {
    getQuestionWorkspace: async () => { throw new Error("not invoked"); },
    contributeEvidence: async () => { throw new Error("not invoked"); },
    recordSearch: async () => { throw new Error("not invoked"); },
  },
  authorize: async (input) => input.userId === USER
    && input.organizationId === SANDBOX_ORGANIZATION_ID
    && input.purpose === GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE,
  authorizationPurpose: GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE,
  authorizationStates: states,
  stateSigningSecret: "binding-contract-state-secret-at-least-32-characters",
  now: () => NOW,
});

async function validateStateAndOwnership() {
const request = await service.beginAuthorization({ userId: USER, organizationId: SANDBOX_ORGANIZATION_ID });
const inspected = service.inspectAuthorizationState(request.state);
check(inspected.organizationId === SANDBOX_ORGANIZATION_ID, "OAuth state must retain the exact sandbox organization.");
check(inspected.userId === USER, "OAuth state must retain the exact user.");
check(inspected.purpose === GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_PURPOSE, "OAuth state must retain the exact purpose.");
check((await service.diagnoseAuthorizationState({ userId: USER, organizationId: SANDBOX_ORGANIZATION_ID, state: request.state })).finalResult === "valid",
  "Exact OAuth state must diagnose as valid.");
check((await service.diagnoseAuthorizationState({ userId: "user_other", organizationId: SANDBOX_ORGANIZATION_ID, state: request.state })).reason === "user-mismatch",
  "OAuth user substitution must fail.");
check((await service.diagnoseAuthorizationState({ userId: USER, organizationId: "onb-dev-aaaaaaaaaaaaaaaaaaaaaaaa", state: request.state })).reason === "organization-mismatch",
  "OAuth organization substitution must fail.");
const ordinaryService = new GoogleDriveConnectorService({
  ...(service as unknown as { dependencies: object }).dependencies,
  authorizationPurpose: GOOGLE_DRIVE_DEVELOPMENT_PURPOSE,
} as never);
check((await ordinaryService.diagnoseAuthorizationState({ userId: USER, organizationId: SANDBOX_ORGANIZATION_ID, state: request.state })).reason === "purpose-mismatch",
  "OAuth purpose substitution must fail.");
const [payload, signature] = request.state.split(".");
assert(payload && signature);
assert.throws(() => service.inspectAuthorizationState(`${payload.slice(0, -1)}A.${signature}`), GoogleDriveOAuthStateError);
checks += 1;
await service.rejectAuthorization({ userId: USER, organizationId: SANDBOX_ORGANIZATION_ID, state: request.state });
check((await service.diagnoseAuthorizationState({ userId: USER, organizationId: SANDBOX_ORGANIZATION_ID, state: request.state })).reason === "already-consumed",
  "Replayed OAuth state must fail closed.");
check(states.records.has(sha256(request.state)), "The exact signed state digest must own replay protection.");

const serviceSource = await readFile("product/connectors/google-drive/service.ts", "utf8");
const acceptanceSource = await readFile("scripts/development/googleDriveLiveAcceptance.ts", "utf8");
check(serviceSource.includes("organizationId: input.organizationId") && serviceSource.includes("folder.organizationId !== input.organizationId"),
  "Source and folder ownership must remain exact to the requested organization.");
check(acceptanceSource.includes("scope.organizationId !== SANDBOX_ORGANIZATION_ID")
  && acceptanceSource.includes("folder.organizationId !== scope.organizationId")
  && acceptanceSource.includes("includeNested:false"),
  "Sandbox synchronization must retain exact Runtime/source/folder identity and non-recursive scope.");
}

validateStateAndOwnership().then(() => {
  console.log(JSON.stringify({
    result: "pass",
    checks,
    connectorCalls: 0,
    driveReads: 0,
    driveWrites: 0,
    productionAccess: 0,
  }));
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Organization binding validation failed.");
  process.exitCode = 1;
});
