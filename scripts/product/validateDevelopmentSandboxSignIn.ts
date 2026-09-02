import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

import { NextRequest, NextResponse } from "next/server";

import {
  authorizeSandboxRequest,
  grantsFor,
  resolvePersonaForSignedInUser,
  resolveSandboxPersonas,
  SANDBOX_ORGANIZATION_ID,
} from "../../lib/access/sandboxMultiUserAccess";
import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";
import { isHostedDiscoveryEnvironment } from "../../lib/production-route-policy";
import {
  isDevelopmentSandboxSignInRequest,
  normalizeClerkSameRequestContinuation,
} from "../../middleware";
import {
  CHIEF_V1_PATH,
  SANDBOX_SIGN_IN_PATH,
  terminateSandboxSession,
} from "../../app/development/sandbox-sign-in/SandboxSignInClient";

const PAGE_PATH = "app/development/sandbox-sign-in/[[...sandbox-sign-in]]/page.tsx";
const CLIENT_PATH = "app/development/sandbox-sign-in/SandboxSignInClient.tsx";
const VALIDATOR_PATH = "scripts/product/validateDevelopmentSandboxSignIn.ts";

const developmentEnvironment = {
  DISCOVERY_ENV: "development",
  NEXT_PUBLIC_DISCOVERY_ENV: "development",
  DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
  NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ["pk", "test", "synthetic"].join("_"),
  CLERK_SECRET_KEY: ["sk", "test", "synthetic"].join("_"),
  DISCOVERY_DATABASE_URL: "postgresql://localhost/discovery",
  DISCOVERY_DATABASE_ADMIN_URL: "postgresql://localhost/discovery",
  DISCOVERY_DATABASE_MIGRATION_URL: "postgresql://localhost/discovery",
  DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem",
  DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: "/tmp/onboarding-synthetic",
  DISCOVERY_SANDBOX_CEO_USER_ID: "user_syntheticceo",
  DISCOVERY_SANDBOX_DIRECTOR_USER_ID: "user_syntheticdirector",
  DISCOVERY_SANDBOX_MANAGER_USER_ID: "user_syntheticmanager",
} as const;

let checks = 0;
const check = (condition: unknown, message: string): void => {
  assert.ok(condition, message);
  checks += 1;
};

async function main(): Promise<void> {
  const [page, client, middleware, validator] = await Promise.all([
    readFile(PAGE_PATH, "utf8"),
    readFile(CLIENT_PATH, "utf8"),
    readFile("middleware.ts", "utf8"),
    readFile(VALIDATOR_PATH, "utf8"),
  ]);
  await assert.rejects(access("app/development/sandbox-sign-in/page.tsx"));
  checks += 1;

  check(validateOnboardingTestEnvironment(developmentEnvironment).environment === "development", "exact local development environment is eligible");
  check(isDevelopmentSandboxSignInRequest(SANDBOX_SIGN_IN_PATH, developmentEnvironment), "base Clerk path reaches the development-only middleware boundary");
  check(isDevelopmentSandboxSignInRequest(`${SANDBOX_SIGN_IN_PATH}/factor-one`, developmentEnvironment), "nested Clerk factor path reaches the same middleware boundary");
  check(!isDevelopmentSandboxSignInRequest("/development/sandbox-sign-in-lookalike", developmentEnvironment), "lookalike path is outside the sign-in boundary");
  check(!isDevelopmentSandboxSignInRequest(CHIEF_V1_PATH, developmentEnvironment), "protected Product route is never treated as the public sign-in entry");

  for (const hosted of [
    { ...developmentEnvironment, NODE_ENV: "production" },
    { ...developmentEnvironment, VERCEL: "1" },
    { ...developmentEnvironment, VERCEL_ENV: "preview" },
    { ...developmentEnvironment, VERCEL_ENV: "production" },
  ]) {
    check(isHostedDiscoveryEnvironment(hosted), "hosted environment is recognized");
    check(!isDevelopmentSandboxSignInRequest(SANDBOX_SIGN_IN_PATH, hosted), "hosted environment cannot reach the sign-in middleware exception");
  }
  check(!isDevelopmentSandboxSignInRequest(SANDBOX_SIGN_IN_PATH, { ...developmentEnvironment, DISCOVERY_ONBOARDING_TEST_ENABLED: "false" }), "disabled test environment fails closed");
  assert.throws(() => validateOnboardingTestEnvironment({ ...developmentEnvironment, DISCOVERY_ENV: "production", NEXT_PUBLIC_DISCOVERY_ENV: "production" }));
  checks += 1;

  const personas = resolveSandboxPersonas(developmentEnvironment);
  check(personas.length === 3, "only the three existing sandbox personas resolve");
  for (const persona of personas) {
    check(resolvePersonaForSignedInUser(persona.userId, developmentEnvironment)?.key === persona.key, `exact ${persona.key} identity resolves`);
    check(resolvePersonaForSignedInUser(persona.userId, developmentEnvironment)?.key === persona.key, `exact ${persona.key} replay is deterministic`);
  }
  check(resolvePersonaForSignedInUser("user_forged", developmentEnvironment) === undefined, "unknown Clerk user cannot select a persona");
  assert.throws(() => resolveSandboxPersonas({ ...developmentEnvironment, DISCOVERY_SANDBOX_CEO_USER_ID: "forged" }));
  checks += 1;

  const ceo = personas[0]!;
  const workspaceScope = ceo.scopes.find((scope) => scope.type === "organization")!;
  check(authorizeSandboxRequest({ persona: ceo, status: "active", requestedScope: workspaceScope, operation: "product-workspace:read" }).disposition === "authorized", "allowed persona still passes existing current-access owner");
  check(authorizeSandboxRequest({ persona: ceo, status: "active", requestedScope: workspaceScope, operation: "product-workspace:read", organizationId: "forged-organization" }).disposition !== "authorized", "client-forged organization fails current access");
  check(authorizeSandboxRequest({ persona: ceo, status: "revoked", requestedScope: workspaceScope, operation: "product-workspace:read" }).disposition !== "authorized", "revoked current access fails closed after sign-in");
  check(authorizeSandboxRequest({ persona: ceo, status: "active", requestedScope: workspaceScope, operation: "contribution:submit" }).disposition !== "authorized", "client-forged role capability is not inferred from identity");
  check(JSON.stringify(grantsFor({ ...ceo, label: "Forged administrator" }, "active")) === JSON.stringify(grantsFor(ceo, "active")), "client-visible role labels cannot alter authority");

  const successfulDestinations: string[] = [];
  let signOutCalls = 0;
  const successfulSignOut = await terminateSandboxSession({
    signOut: async () => { signOutCalls += 1; },
    replace: (destination) => { successfulDestinations.push(destination); },
    currentLocation: "http://localhost:3000/development/sandbox-sign-in",
  });
  check(successfulSignOut === "signed-out" && signOutCalls === 1, "successful session termination delegates once to Clerk");
  check(successfulDestinations.join("") === SANDBOX_SIGN_IN_PATH, "successful sign-out returns only to the fixed local sign-in path");
  const failedDestinations: string[] = [];
  const failedSignOut = await terminateSandboxSession({
    signOut: async () => { throw new Error("synthetic Clerk failure"); },
    replace: (destination) => { failedDestinations.push(destination); },
    currentLocation: "http://localhost:3000/development/sandbox-sign-in/factor-one",
  });
  check(failedSignOut === "reload-required", "Clerk sign-out failure is classified safely");
  check(failedDestinations.join("") === "http://localhost:3000/development/sandbox-sign-in/factor-one", "sign-out failure reloads the same local page without choosing identity");

  const request = new NextRequest("http://localhost:3000/development/sandbox-sign-in/factor-one");
  const same = NextResponse.rewrite("http://127.0.0.1:3000/development/sandbox-sign-in/factor-one");
  check(normalizeClerkSameRequestContinuation(request, same).headers.get("x-middleware-next") === "1", "same-request Clerk continuation remains reachable on loopback");
  const external = NextResponse.rewrite("https://example.invalid/development/sandbox-sign-in/factor-one");
  check(normalizeClerkSameRequestContinuation(request, external).headers.has("x-middleware-rewrite"), "arbitrary external redirect or rewrite remains rejected");
  const alteredPath = NextResponse.rewrite("http://localhost:3000/development/sandbox-sign-in/forged-role");
  check(normalizeClerkSameRequestContinuation(request, alteredPath).headers.has("x-middleware-rewrite"), "client-forged continuation path is not normalized into an authenticated request");

  check(page.includes("validateOnboardingTestEnvironment") && page.includes("isHostedDiscoveryEnvironment") && page.includes("notFound()"), "server page retains development and hosted fail-closed guards");
  check(page.includes('redirect("/product-alpha/leadership-conversation")'), "authorized persona redirect is fixed and same-origin");
  check(client.includes("forceRedirectUrl={CHIEF_V1_PATH}") && !client.includes("redirectUrl") && !client.includes("afterSignInUrl"), "client exposes no redirect input");
  check(!/\b(?:userId|email|organizationId|role|permissions?)\s*=\s*\{/.test(client), "client exposes no arbitrary identity, organization, role, or permission prop");
  check(middleware.includes('"/development/sandbox-sign-in/:path*"'), "middleware matcher covers base and optional catch-all factor paths");
  check(middleware.includes("protectActivatedYourOrganization"), "unrelated Product routes retain Clerk protection");

  const secretPatterns = [
    /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{8,}\b/,
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i,
    /\b(?:cookie|session[_-]?token|authorization)\s*[:=]\s*["'][^"']+["']/i,
    /\beyJ[A-Za-z0-9_-]{12,}\.[A-Za-z0-9_-]{12,}/,
  ];
  for (const [path, source] of [[PAGE_PATH, page], [CLIENT_PATH, client], ["middleware.ts", middleware], [VALIDATOR_PATH, validator]] as const) {
    check(secretPatterns.every((pattern) => !pattern.test(source)), `${path} contains no credential, email, cookie, session, or token value`);
  }

  console.log(JSON.stringify({
    validation: "development-sandbox-sign-in",
    result: "PASS",
    checks,
    hostedExposure: 0,
    arbitraryIdentitySelections: 0,
    arbitraryRedirects: 0,
    protectedRouteBypasses: 0,
    networkRequests: 0,
  }));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Development sandbox sign-in validation failed.");
  process.exitCode = 1;
});
