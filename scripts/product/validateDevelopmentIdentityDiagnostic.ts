import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path: string) => readFileSync(path, "utf8");
const route = read("app/api/development/current-identity/route.ts");
const middleware = read("middleware.ts");

assert.match(route, /export const dynamic = "force-dynamic"/);
assert.match(route, /validateOnboardingTestEnvironment\(\)/);
assert.match(route, /environment\.environment !== "development"/);
assert.match(route, /await auth\.protect\(\)/);
assert.match(route, /const authentication = await auth\(\)/);
assert.match(route, /userId: authentication\.userId/);
assert.match(route, /environment: "development"/);

assert.doesNotMatch(
  route,
  /sessionToken|sessionClaims|cookies?\(|headers?\(|authorization|accessToken|refreshToken/,
);
assert.doesNotMatch(
  route,
  /postgres|Database|Runtime|createDevelopmentGoogleDriveOAuthService|findAccessRecords/,
);

assert.match(
  middleware,
  /development\\\/\(\?:google-drive\|current-identity\)/,
);
assert.match(
  middleware,
  /"\/api\/development\/current-identity"/,
);
assert.match(middleware, /const protectActivatedYourOrganization = clerkMiddleware/);
assert.match(middleware, /await auth\.protect\(\)/);

for (const unchangedRoute of [
  '"/onboarding/:path*"',
  '"/your-organization/:path*"',
  '"/product-alpha/:path*"',
  '"/api/product-alpha/:path*"',
  '"/api/development/google-drive/:path*"',
]) {
  assert.ok(
    middleware.includes(unchangedRoute),
    `Existing middleware behavior must remain registered: ${unchangedRoute}`,
  );
}

console.log(JSON.stringify({
  validation: "development-identity-diagnostic",
  result: "PASS",
  authenticatedIdentitySource: "Clerk request auth",
  productionDisposition: "fail-closed",
  databaseReads: 0,
  runtimeReads: 0,
  mutations: 0,
}));
