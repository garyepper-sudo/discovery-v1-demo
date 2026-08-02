import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

import {
  GOOGLE_DRIVE_EXPECTED_REDIRECT_URI,
  inspectGoogleDriveLiveConfiguration,
} from "../../product/connectors/google-drive/liveConfiguration";

const mode = process.argv[2] ?? "all";
const read = (path: string) => readFileSync(path, "utf8");
const authorizePath = "app/api/development/google-drive/authorize/route.ts";
const callbackPath = "app/api/development/google-drive/callback/route.ts";
const diagnosticPath = "app/api/development/google-drive/diagnostic/route.ts";
const authorize = read(authorizePath);
const callback = read(callbackPath);
const liveDiagnostic = read(diagnosticPath);
const liveService = read("product/connectors/google-drive/liveOAuthService.ts");
const eligibility = read("product/connectors/google-drive/developmentEligibility.ts");
const connector = read("product/connectors/google-drive/service.ts");
const repositories = read("product/connectors/google-drive/repositories.ts");
const diagnostic = read("scripts/development/printGoogleDriveLiveConfiguration.ts");
const middleware = read("middleware.ts");

function validateConfig(): void {
  const valid = inspectGoogleDriveLiveConfiguration({
    DISCOVERY_ENV: "development",
    NEXT_PUBLIC_DISCOVERY_ENV: "development",
    DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
    NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
    GOOGLE_DRIVE_CLIENT_ID: "client",
    GOOGLE_DRIVE_CLIENT_SECRET: "secret",
    GOOGLE_DRIVE_REDIRECT_URI: GOOGLE_DRIVE_EXPECTED_REDIRECT_URI,
    GOOGLE_DRIVE_CREDENTIAL_ENCRYPTION_KEY: Buffer.alloc(32, 4).toString("base64"),
    GOOGLE_DRIVE_STATE_SIGNING_SECRET: "a-signing-secret-with-at-least-32-characters",
  });
  assert.deepEqual(valid.missingOrInvalid, []);
  assert.equal(
    inspectGoogleDriveLiveConfiguration({
      DISCOVERY_ENV: "production",
      GOOGLE_DRIVE_REDIRECT_URI: "https://example.com/callback",
    }).developmentEnvironmentValid,
    false,
  );
  assert.equal(GOOGLE_DRIVE_EXPECTED_REDIRECT_URI,
    "http://localhost:3010/api/development/google-drive/callback");
}

function validateRoutes(): void {
  assert.equal(existsSync(authorizePath), true);
  assert.equal(existsSync(callbackPath), true);
  assert.equal(existsSync(diagnosticPath), true);
  assert.match(authorize, /export const dynamic = "force-dynamic"/);
  assert.match(callback, /export const dynamic = "force-dynamic"/);
  assert.match(authorize, /await auth\(\)/);
  assert.match(callback, /await auth\(\)/);
  assert.match(liveDiagnostic, /await auth\(\)/);
  assert.match(authorize, /isGoogleDriveDevelopmentOrganizationEligible/);
  assert.match(authorize, /beginAuthorization/);
  assert.match(callback, /inspectAuthorizationState/);
  assert.match(callback, /completeAuthorization/);
  assert.match(
    middleware,
    /api\\\/\(\?:discovery-lab\|product-alpha\|development\\\/\(\?:google-drive\|current-identity\)\)/,
  );
  assert.match(
    middleware,
    /"\/api\/development\/google-drive\/:path\*"/,
  );
  assert.match(middleware, /const protectActivatedYourOrganization = clerkMiddleware/);
  assert.match(middleware, /await auth\.protect\(\)/);
  assert.match(
    middleware,
    /onboardingTestEnvironmentEnabled\(\)[\s\S]*onboardingTestSurface\.test/,
  );
  for (const unchangedRoute of [
    "onboarding",
    "your-organization",
    "product-alpha",
    '"/api/product-alpha/:path*"',
  ]) {
    assert.ok(
      middleware.includes(unchangedRoute),
      `Existing middleware coverage must remain present: ${unchangedRoute}`,
    );
  }
  assert.doesNotMatch(`${authorize}\n${callback}`, /accessToken|refreshToken|clientSecret/);
  assert.doesNotMatch(liveDiagnostic, /accessToken|refreshToken|clientSecret|credential|authorizationCode/);
  assert.match(liveDiagnostic, /listAuthorizedFolders/);
  assert.match(liveDiagnostic, /isOnboardingTestOrganizationId/);
  assert.doesNotMatch(`${authorize}\n${callback}`, /redirect\([^)]*(next|returnTo|redirectUri)/);
}

function validateStart(): void {
  const authIndex = authorize.indexOf("await auth()");
  const organizationIndex = authorize.indexOf("if (!isGoogleDriveDevelopmentOrganizationEligible");
  const connectorIndex = authorize.indexOf("authorization = await createDevelopmentGoogleDriveOAuthService(");
  assert.ok(authIndex >= 0 && organizationIndex > authIndex && connectorIndex > organizationIndex);
  assert.match(connector, /expiresAt[\s\S]*10 \* 60_000/);
  assert.match(connector, /GOOGLE_DRIVE_SCOPES/);
}

function validateCallback(): void {
  const authIndex = callback.indexOf("await auth()");
  const stateIndex = callback.indexOf("inspectAuthorizationState");
  const completeIndex = callback.indexOf("completeAuthorization");
  assert.ok(authIndex >= 0 && stateIndex > authIndex && completeIndex > stateIndex);
  assert.match(connector, /authorizationStates\.consume/);
  assert.match(connector, /already-consumed/);
  assert.match(connector, /timingSafeEqual/);
  assert.match(callback, /expired-state/);
  assert.match(callback, /invalid-state/);
  assert.match(callback, /configuration-missing/);
}

function validateEnvironmentSafety(): void {
  assert.match(liveService, /validateOnboardingTestEnvironment/);
  assert.match(liveService, /environment\.environment !== "development"/);
  assert.match(liveService, /environment\.runtimeStorage !== "filesystem"/);
  assert.match(liveService, /isGoogleDriveDevelopmentOrganizationEligible/);
  assert.match(liveService, /isGoogleDriveSandboxAcceptanceScope/);
  assert.match(eligibility, /isOnboardingTestOrganizationId/);
  assert.match(eligibility, /DISCOVERY_GOOGLE_DRIVE_SANDBOX_ACCEPTANCE_ENABLED/);
  assert.match(liveService, /PostgresAlphaAccessRecordRepository/);
  assert.match(liveService, /findAccessRecords/);
  assert.match(liveService, /EncryptedFileGoogleDriveCredentialRepository/);
  assert.match(repositories, /aes-256-gcm/);
  assert.match(repositories, /mode: 0o600/);
}

function validateSecretSafety(): void {
  assert.doesNotMatch(diagnostic, /process\.env\.(GOOGLE_DRIVE_CLIENT_SECRET|GOOGLE_DRIVE_CREDENTIAL_ENCRYPTION_KEY|GOOGLE_DRIVE_STATE_SIGNING_SECRET)/);
  assert.match(read(".gitignore"), /\.env\.local/);
  assert.match(read(".gitignore"), /\.discovery-runtime\/onboarding-google-drive\//);
  const changed = [
    authorize, callback, liveService, connector, repositories, diagnostic,
  ].join("\n");
  assert.doesNotMatch(changed, /AIza[0-9A-Za-z_-]{20,}|-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/);
}

const validations: Record<string, () => void> = {
  config: validateConfig,
  routes: validateRoutes,
  start: validateStart,
  callback: validateCallback,
  state: validateCallback,
  environment: validateEnvironmentSafety,
  secrets: validateSecretSafety,
};

if (mode === "all") Object.values(validations).forEach((validate) => validate());
else {
  const validate = validations[mode];
  if (!validate) throw new Error(`Unknown OAuth validation mode: ${mode}`);
  validate();
}
console.log(`Google Drive OAuth boundary validation passed (${mode}).`);
