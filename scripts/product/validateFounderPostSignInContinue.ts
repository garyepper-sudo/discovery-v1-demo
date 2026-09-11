import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

async function main() {
  const identityPage = await readFile("app/onboarding/identity/page.tsx", "utf8");
  const setup = await readFile("app/onboarding/identity/IdentitySetup.tsx", "utf8");
  const continuation = await readFile("lib/alpha-activation/founderAuthorizedMeetingContinuation.ts", "utf8");

  assert.match(identityPage, /initialStatus === "ready"[\s\S]*resolveFounderAuthorizedMeetingContinuation/, "only a found participant resolves a destination");
  assert.match(setup, /Continue to Discovery/, "ready identity renders deliberate continuation");
  assert.match(setup, /href=\{continuation\.href\}/, "continuation uses only the server-provided opaque destination");
  assert.match(setup, /You do not currently have access to a Discovery meeting\./, "ready identity fails closed without a destination");
  assert.match(continuation, /meetings\.length !== 1/, "continuation refuses zero or multiple destinations");
  assert.match(continuation, /href: `\/product-alpha\/meetings\/\$\{meeting\.seriesAddress\}`/, "a singleton projects only its opaque address");
  assert.match(continuation, /title: meeting\.title/, "a singleton projects its human-readable title");
  assert.doesNotMatch(continuation, /searchParams|returnTo|redirect|meetingId|organizationId.*process\.env/, "continuation accepts no browser-supplied destination");
  console.log(JSON.stringify({ validation: "founder-post-signin-continue-v1", result: "PASS" }));
}

void main();
