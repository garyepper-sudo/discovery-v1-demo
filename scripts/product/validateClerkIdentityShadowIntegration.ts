import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

import {
  ALPHA_ALLOWLIST_POLICY_ID,
  ALPHA_ALLOWLIST_POLICY_VERSION,
  ALPHA_ORGANIZATION_EXPERIENCE,
  type AlphaOrganizationAccessRecord,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import {
  normalizeClerkVerifiedConsumerIdentity,
  runClerkIdentityAlphaDisclosureShadow,
} from "../../engine/v3/governance/clerkVerifiedConsumerIdentity";

async function main(): Promise<void> {
const resolvedAt = "2026-07-26T12:00:00.000Z";
const organizationId = "atlas-manufacturing";
const consumerId = "user_clerk_alpha_001";
const sessionId = "sess_clerk_alpha_001";
let checks = 0;

function check(condition: unknown, message: string): void {
  assert.ok(condition, message);
  checks += 1;
}

function equal<T>(actual: T, expected: T, message: string): void {
  assert.deepEqual(actual, expected, message);
  checks += 1;
}

function activeRecord(): AlphaOrganizationAccessRecord {
  return {
    accessRecordId: "alpha-access:clerk-alpha-001",
    policyId: ALPHA_ALLOWLIST_POLICY_ID,
    policyVersion: ALPHA_ALLOWLIST_POLICY_VERSION,
    consumerId,
    organizationId,
    relationship: "allowed_alpha_user",
    supportedExperiences: [ALPHA_ORGANIZATION_EXPERIENCE],
    scope: { type: "organization", organizationId },
    status: "active",
    createdAt: "2026-07-25T12:00:00.000Z",
  };
}

const verified = normalizeClerkVerifiedConsumerIdentity({
  auth: {
    isAuthenticated: true,
    userId: consumerId,
    sessionId,
  },
  verifiedAt: resolvedAt,
});
equal(verified.status, "verified", "authenticated Clerk state verifies");
if (verified.status === "verified") {
  equal(verified.identity.consumerId, consumerId, "Clerk userId is the consumer");
  equal(verified.identity.provider, "clerk", "provider remains Clerk");
  equal(verified.identity.verificationId, sessionId, "session is verification provenance");
  equal(verified.identity.verifiedAt, resolvedAt, "verification time is explicit");
}

for (const [auth, reason] of [
  [
    { isAuthenticated: false, userId: null, sessionId: null },
    "clerk-authentication-required",
  ],
  [
    { isAuthenticated: true, userId: null, sessionId },
    "clerk-consumer-id-missing",
  ],
  [
    { isAuthenticated: true, userId: consumerId, sessionId: null },
    "clerk-verification-id-missing",
  ],
] as const) {
  equal(
    normalizeClerkVerifiedConsumerIdentity({ auth, verifiedAt: resolvedAt }),
    { status: "denied", reason },
    `fails closed: ${reason}`,
  );
}

const malformed = normalizeClerkVerifiedConsumerIdentity({
  auth: {
    isAuthenticated: true,
    userId: " user_clerk_alpha_001",
    sessionId,
  },
  verifiedAt: resolvedAt,
});
equal(
  malformed,
  { status: "denied", reason: "clerk-consumer-id-missing" },
  "malformed identifiers fail closed",
);

async function exercise(input: {
  resolveIdentity: () => Promise<typeof verified>;
  records: readonly AlphaOrganizationAccessRecord[];
}) {
  let accessReads = 0;
  let runtimeLoads = 0;
  const result = await runClerkIdentityAlphaDisclosureShadow(
    {
      organizationId,
      experience: ALPHA_ORGANIZATION_EXPERIENCE,
      resolvedAt,
    },
    {
      resolveIdentity: input.resolveIdentity,
      accessReader: {
        findAccessRecords: () => {
          accessReads += 1;
          return input.records;
        },
      },
      runtimeLoader: {
        load: () => {
          runtimeLoads += 1;
          return {
            organizationId,
            compositions: [],
            authorityReceipts: [],
          };
        },
      },
    },
  );
  return { result, accessReads, runtimeLoads };
}

const authFailure = await exercise({
  resolveIdentity: async () =>
    ({
      status: "denied",
      reason: "clerk-authentication-required",
    }),
  records: [],
});
equal(authFailure.accessReads, 0, "authentication denial skips access lookup");
equal(authFailure.runtimeLoads, 0, "authentication denial skips Runtime");
check(!authFailure.result.disclosureShadow, "authentication denial exposes no disclosure");

const verifierFailure = await runClerkIdentityAlphaDisclosureShadow(
  { organizationId, experience: ALPHA_ORGANIZATION_EXPERIENCE, resolvedAt },
  {
    resolveIdentity: async () => {
      throw new Error("missing Clerk server configuration");
    },
    accessReader: {
      findAccessRecords: () => {
        throw new Error("access lookup must not run");
      },
    },
    runtimeLoader: {
      load: () => {
        throw new Error("Runtime must not run");
      },
    },
  },
);
equal(
  verifierFailure.identityResolution,
  { status: "denied", reason: "clerk-server-verification-unavailable" },
  "server verification failure is normalized and closed",
);
check(!verifierFailure.disclosureShadow, "verification failure exposes no disclosure");

const missingAccess = await exercise({
  resolveIdentity: async () => verified,
  records: [],
});
equal(missingAccess.accessReads, 1, "verified identity invokes access lookup once");
equal(missingAccess.runtimeLoads, 0, "missing access skips Runtime");
equal(
  missingAccess.result.disclosureShadow?.preflight.disposition,
  "denied",
  "missing access is denied",
);

const activeAccess = await exercise({
  resolveIdentity: async () => verified,
  records: [activeRecord()],
});
equal(activeAccess.accessReads, 1, "active access lookup runs once");
equal(activeAccess.runtimeLoads, 1, "active access loads Runtime once");
equal(
  activeAccess.result.disclosureShadow?.runtimeLoadState,
  "loaded",
  "active access reaches existing disclosure producer",
);
equal(
  activeAccess.result.disclosureShadow?.preflight.consumerId,
  consumerId,
  "verified Clerk consumer reaches policy unchanged",
);

const adapterSource = readFileSync(
  "lib/auth/resolveVerifiedConsumerIdentityFromClerk.ts",
  "utf8",
);
check(adapterSource.includes('import "server-only"'), "adapter is server-only");
check(
  adapterSource.includes('from "@clerk/nextjs/server"'),
  "adapter uses official Clerk server package",
);
check(adapterSource.includes("await auth()"), "adapter invokes Clerk server auth");
check(!/email|organizationId|password|cookie|searchParams/.test(adapterSource), "adapter accepts no client identity surrogate");

const middlewareSource = readFileSync("middleware.ts", "utf8");
const layoutSource = readFileSync("app/layout.tsx", "utf8");
check(
  middlewareSource.includes("clerkMiddleware") &&
    middlewareSource.includes("auth.protect()") &&
    middlewareSource.includes("activatedYourOrganizationPath"),
  "Clerk protects only the feature-flagged Your Organization activation",
);
check(
  layoutSource.includes("<ClerkProvider>") &&
    layoutSource.includes("isYourOrganizationAlphaActivationEnabled"),
  "ClerkProvider is active only inside the bounded activation",
);

const clientImportSearch = spawnSync(
  "rg",
  [
    "-l",
    "resolveVerifiedConsumerIdentityFromClerk|clerkVerifiedConsumerIdentity",
    "app",
    "components",
  ],
  { encoding: "utf8" },
);
check(
  clientImportSearch.status === 0 &&
    clientImportSearch.stdout.trim() ===
      "components/product-shell/data/loadActivatedYourOrganization.ts",
  "only the server activation loader imports the verified identity adapter",
);

console.log(
  JSON.stringify(
    {
      validation: "clerk-identity-shadow",
      result: "PASS",
      checks,
      activation: "feature-flagged-your-organization-only",
      liveDeploymentVerification: "not-demonstrated",
    },
    null,
    2,
  ),
);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
