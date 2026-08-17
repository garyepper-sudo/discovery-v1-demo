import assert from "node:assert/strict";

import { NextRequest, NextResponse } from "next/server";

import { normalizeClerkSameRequestContinuation } from "../../middleware";

let assertions = 0;
const check = (condition: unknown, message: string): void => {
  assert.ok(condition, message);
  assertions += 1;
};

const request = (url: string): NextRequest => new NextRequest(url);

async function main(): Promise<void> {
const same = NextResponse.rewrite(
  "http://127.0.0.1:3016/product-alpha/leadership-conversation?cycle=1",
  { request: { headers: new Headers({ "x-discovery-request-id": "safe" }) } },
);
same.headers.set("x-clerk-auth-status", "signed-in");
same.headers.append("set-cookie", "first=safe; Path=/; HttpOnly");
same.headers.append("set-cookie", "second=safe; Path=/; HttpOnly");
const sameResult = normalizeClerkSameRequestContinuation(
  request("http://localhost:3016/product-alpha/leadership-conversation?cycle=1"),
  same,
);
check(sameResult === same, "same-request normalization must retain the response object");
check(!sameResult.headers.has("x-middleware-rewrite"), "same-request rewrite must be removed");
check(sameResult.headers.get("x-middleware-next") === "1", "normal continuation must be signaled");
check(sameResult.headers.get("x-clerk-auth-status") === "signed-in", "Clerk headers must survive");
check(sameResult.headers.get("x-middleware-request-x-discovery-request-id") === "safe", "request propagation must survive");
check((sameResult.headers.get("set-cookie") ?? "").includes("first=safe"), "first cookie must survive");
check((sameResult.headers.get("set-cookie") ?? "").includes("second=safe"), "second cookie must survive");

for (const [label, destination] of [
  ["different path", "http://localhost:3016/product-alpha/other?cycle=1"],
  ["different query", "http://localhost:3016/product-alpha/leadership-conversation?cycle=2"],
  ["different origin", "https://example.invalid/product-alpha/leadership-conversation?cycle=1"],
  ["Clerk proxy path", "http://localhost:3016/__clerk/proxy"],
] as const) {
  const response = NextResponse.rewrite(destination);
  const result = normalizeClerkSameRequestContinuation(
    request("http://localhost:3016/product-alpha/leadership-conversation?cycle=1"),
    response,
  );
  check(result.headers.get("x-middleware-rewrite") === destination, `${label} rewrite must remain`);
}

const redirect = NextResponse.redirect("http://localhost:3016/sign-in");
const redirectResult = normalizeClerkSameRequestContinuation(request("http://localhost:3016/product-alpha"), redirect);
check(redirectResult === redirect, "redirect object must remain unchanged");
check(redirectResult.status === 307, "redirect status must remain unchanged");
check(redirectResult.headers.get("location") === "http://localhost:3016/sign-in", "redirect destination must remain unchanged");

const denial = new NextResponse("denied", { status: 403, headers: { "x-middleware-rewrite": "http://localhost:3016/product-alpha" } });
const denialResult = normalizeClerkSameRequestContinuation(request("http://localhost:3016/product-alpha"), denial);
check(denialResult.status === 403, "denial status must remain unchanged");
check(denialResult.headers.has("x-middleware-rewrite"), "denial control headers must remain unchanged");
check((await denialResult.text()) === "denied", "denial body must remain unchanged");

const error = new NextResponse("error", { status: 500 });
check(normalizeClerkSameRequestContinuation(request("http://localhost:3016/product-alpha"), error) === error, "error response must remain unchanged");

const continuation = NextResponse.next();
check(normalizeClerkSameRequestContinuation(request("http://localhost:3016/product-alpha"), continuation) === continuation, "existing continuation must remain unchanged");
check(continuation.headers.get("x-middleware-next") === "1", "existing continuation signal must remain");

for (const alias of ["localhost", "127.0.0.1", "[::1]"]) {
  const response = NextResponse.rewrite(`http://${alias}:3016/product-alpha`);
  const result = normalizeClerkSameRequestContinuation(request("http://localhost:3016/product-alpha"), response);
  check(result.headers.get("x-middleware-next") === "1", `supported loopback alias ${alias} must normalize`);
}

const unrelatedHost = NextResponse.rewrite("http://devbox:3016/product-alpha");
check(normalizeClerkSameRequestContinuation(request("http://localhost:3016/product-alpha"), unrelatedHost).headers.has("x-middleware-rewrite"), "unrelated host must not normalize");

const malformed = new NextResponse(null, { headers: { "x-middleware-rewrite": "://invalid" } });
check(normalizeClerkSameRequestContinuation(request("http://localhost:3016/product-alpha"), malformed) === malformed, "unusable destination must remain unchanged");

console.log(`PASS — ${assertions} focused Clerk protected-route middleware assertions`);
console.log("self-proxy classifications: 0");
console.log("cookies preserved: 2");
}

void main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
