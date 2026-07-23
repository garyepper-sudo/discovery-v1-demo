import assert from "node:assert/strict";

import { NextRequest } from "next/server";

import { POST as lockPrototype } from "../../app/alpha/lock/route";
import { POST as submitPassword } from "../../app/alpha-access/submit/route";
import {
  ALPHA_ACCESS_COOKIE,
  ALPHA_SESSION_MAX_AGE_SECONDS,
  createAlphaSession,
  safeAlphaPath,
  verifyAlphaSession,
} from "../../lib/alpha-access/session";
import { middleware } from "../../middleware";

const originalPassword = process.env.ALPHA_ACCESS_PASSWORD;
const originalSecret = process.env.ALPHA_SESSION_SECRET;
const password = "advisor-test-password";
const secret = "alpha-test-session-secret-with-sufficient-length";

function request(
  path: string,
  cookie?: string,
  method = "GET",
  body?: URLSearchParams,
) {
  return new NextRequest(`https://discovery.test${path}`, {
    method,
    headers: {
      ...(cookie ? { cookie } : {}),
      ...(body
        ? { "content-type": "application/x-www-form-urlencoded" }
        : {}),
    },
    body: body?.toString(),
  });
}

function cookieHeader(token: string) {
  return `${ALPHA_ACCESS_COOKIE}=${token}`;
}

async function run() {
  process.env.ALPHA_ACCESS_PASSWORD = password;
  process.env.ALPHA_SESSION_SECRET = secret;

  const alphaRedirect = await middleware(request("/alpha"));
  assert.equal(alphaRedirect.status, 307);
  assert.equal(
    alphaRedirect.headers.get("location"),
    "https://discovery.test/alpha-access?next=%2Falpha",
  );

  const nestedRedirect = await middleware(
    request("/alpha/understand?focus=contradiction"),
  );
  assert.equal(
    nestedRedirect.headers.get("location"),
    "https://discovery.test/alpha-access?next=%2Falpha%2Funderstand%3Ffocus%3Dcontradiction",
  );

  const productionRoute = await middleware(request("/your-organization"));
  assert.equal(productionRoute.headers.get("x-middleware-next"), "1");

  const invalidResponse = await submitPassword(
    request(
      "/alpha-access/submit",
      undefined,
      "POST",
      new URLSearchParams({
        password: "not-the-password",
        next: "/alpha/learn",
      }),
    ),
  );
  assert.equal(invalidResponse.status, 303);
  assert.match(
    invalidResponse.headers.get("location") ?? "",
    /\/alpha-access\?next=%2Falpha%2Flearn&error=invalid$/,
  );
  assert.equal(invalidResponse.cookies.get(ALPHA_ACCESS_COOKIE), undefined);

  const validResponse = await submitPassword(
    request(
      "/alpha-access/submit",
      undefined,
      "POST",
      new URLSearchParams({ password, next: "/alpha/learn" }),
    ),
  );
  assert.equal(validResponse.status, 303);
  assert.equal(
    validResponse.headers.get("location"),
    "https://discovery.test/alpha/learn",
  );
  const sessionCookie = validResponse.cookies.get(ALPHA_ACCESS_COOKIE);
  assert.ok(sessionCookie?.value);
  assert.equal(sessionCookie.httpOnly, true);
  assert.equal(sessionCookie.sameSite, "lax");
  assert.equal(sessionCookie.path, "/");
  assert.equal(sessionCookie.maxAge, ALPHA_SESSION_MAX_AGE_SECONDS);
  assert.equal(sessionCookie.value.includes(password), false);

  const authenticated = await middleware(
    request("/alpha/learn", cookieHeader(sessionCookie.value)),
  );
  assert.equal(authenticated.headers.get("x-middleware-next"), "1");
  assert.equal(
    authenticated.headers.get("cache-control"),
    "private, no-store, max-age=0",
  );

  const protectedChunk = await middleware(
    request(
      "/_next/static/chunks/app/alpha/%5Bscene%5D/page.js",
    ),
  );
  assert.equal(protectedChunk.status, 307);
  const authenticatedChunk = await middleware(
    request(
      "/_next/static/chunks/app/alpha/%5Bscene%5D/page.js",
      cookieHeader(sessionCookie.value),
    ),
  );
  assert.equal(authenticatedChunk.headers.get("x-middleware-next"), "1");

  const tampered = `${sessionCookie.value.slice(0, -1)}${
    sessionCookie.value.endsWith("a") ? "b" : "a"
  }`;
  const tamperedResponse = await middleware(
    request("/alpha/learn", cookieHeader(tampered)),
  );
  assert.equal(tamperedResponse.status, 307);

  const expired = await createAlphaSession(
    secret,
    Date.now() - (ALPHA_SESSION_MAX_AGE_SECONDS + 1) * 1000,
  );
  assert.equal(await verifyAlphaSession(expired, secret), false);

  const oldSecretToken = await createAlphaSession("old-signing-secret");
  assert.equal(await verifyAlphaSession(oldSecretToken, secret), false);

  const unsafeDestinations = [
    "https://attacker.test/alpha",
    "//attacker.test/alpha",
    "%2F%2Fattacker.test%2Falpha",
    "/your-organization",
    "javascript:alert(1)",
    "%E0%A4%A",
  ];
  for (const destination of unsafeDestinations) {
    assert.equal(safeAlphaPath(destination), "/alpha");
  }
  assert.equal(
    safeAlphaPath("/alpha/understand?focus=contradiction"),
    "/alpha/understand?focus=contradiction",
  );

  delete process.env.ALPHA_ACCESS_PASSWORD;
  delete process.env.ALPHA_SESSION_SECRET;
  const missingSecrets = await middleware(request("/alpha/home"));
  assert.equal(missingSecrets.status, 307);

  process.env.ALPHA_ACCESS_PASSWORD = password;
  process.env.ALPHA_SESSION_SECRET = secret;
  const logoutResponse = await lockPrototype(
    request(
      "/alpha/lock",
      cookieHeader(sessionCookie.value),
      "POST",
    ),
  );
  assert.equal(logoutResponse.status, 303);
  const clearedCookie = logoutResponse.cookies.get(ALPHA_ACCESS_COOKIE);
  assert.equal(clearedCookie?.value, "");
  assert.equal(clearedCookie?.maxAge, 0);

  console.log("Alpha access gate validation: 15 checks passed.");
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (originalPassword === undefined) delete process.env.ALPHA_ACCESS_PASSWORD;
    else process.env.ALPHA_ACCESS_PASSWORD = originalPassword;
    if (originalSecret === undefined) delete process.env.ALPHA_SESSION_SECRET;
    else process.env.ALPHA_SESSION_SECRET = originalSecret;
  });
