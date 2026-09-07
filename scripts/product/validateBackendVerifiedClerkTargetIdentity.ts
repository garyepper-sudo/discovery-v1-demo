import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import type { ExistingParticipantIdentityBindingRepository } from "../../db/governance/types";
import { ClerkTargetNotFoundError, resolveBackendVerifiedClerkTargetIdentity, type ClerkTargetBackend } from "../../lib/auth/backendVerifiedClerkTargetIdentity";

const subject = "user_Exact001";
const encodedKey = (host: string) => `pk_test_${Buffer.from(`${host}$`).toString("base64url")}`;
const configuration = { secretKey: "sk_test_abcdefghijklmnopqrstuvwxyz", publishableKey: encodedKey("example.clerk.accounts") };
let checks = 0;
const equal = (actual: unknown, expected: unknown) => { assert.deepEqual(actual, expected); checks += 1; };

class Bindings implements Pick<ExistingParticipantIdentityBindingRepository, "findExistingParticipantIdentityBinding"> {
  calls: { provider: "clerk"; providerSubject: string }[] = [];
  state: "v1" | "v2" | "unbound" | "failure" | "anchor-integrity" = "v1";
  async findExistingParticipantIdentityBinding(input: { provider: "clerk"; providerSubject: string }) {
    this.calls.push(input);
    if (this.state === "failure" || this.state === "anchor-integrity") throw new Error(this.state);
    if (this.state === "unbound") return undefined;
    return { bindingId: `${this.state}:binding`, participantRef: `${this.state}:participant`, createdAt: "2026-09-07T00:00:00.000Z" };
  }
}

async function resolve(bindings: Bindings, backend: ClerkTargetBackend, clerkUserId: unknown = subject, config = configuration) {
  return resolveBackendVerifiedClerkTargetIdentity({ clerkUserId, configuration: config, backend, participantBindings: bindings, participantBindingInstance: "https://example.clerk.accounts/" });
}

async function main() {
  const bindings = new Bindings();
  const calls: string[] = [];
  const backend: ClerkTargetBackend = { async getUser(userId) { calls.push(userId); return { id: userId }; } };
  const foundV1 = await resolve(bindings, backend);
  assert.equal(foundV1.status, "found");
  if (foundV1.status === "found") {
    equal(foundV1.identity.providerSubject, subject); // 1 exact request/backend parity
    equal(foundV1.identity.instanceDiscriminator, "https://example.clerk.accounts/"); // 2 canonical stable instance
    assert.ok(!("verificationId" in foundV1.identity)); checks += 1; // 3 session is absent
  }
  equal(calls, [subject]); // 4 one exact backend call
  equal(bindings.calls, [{ provider: "clerk", providerSubject: subject }]); // 5 no actor/session lookup
  bindings.state = "v2";
  const foundV2 = await resolve(bindings, backend);
  equal(foundV2.status, "found"); // 6 V2 repository selection
  if (foundV2.status === "found") equal(foundV2.participantRef, "v2:participant");
  const rotated = await resolve(bindings, backend);
  equal(rotated, foundV2); // 7 session rotation cannot affect target identity
  bindings.state = "unbound";
  const unbound = await resolve(bindings, backend);
  equal(unbound.status, "unbound"); // 8 existing lookup is read-only and does not bind
  equal(await resolve(bindings, { async getUser() { throw new ClerkTargetNotFoundError(); } }), { status: "not-found" }); // 9 typed not found
  equal(await resolve(bindings, { async getUser() { throw new Error("transport"); } }), { status: "unavailable" }); // 10 transport error
  equal(await resolve(bindings, { async getUser() { return { id: "user_Other" }; } }), { status: "unavailable" }); // 11 response mismatch
  equal(await resolve(bindings, backend, ` ${subject}`), { status: "unavailable" });
  equal(await resolve(bindings, backend, subject, { ...configuration, publishableKey: encodedKey("other.clerk.accounts") }), { status: "unavailable" }); // cross-instance repository mismatch
  bindings.state = "anchor-integrity";
  equal(await resolve(bindings, backend), { status: "unavailable" });
  const source = readFileSync("lib/auth/backendVerifiedClerkTargetIdentity.ts", "utf8");
  for (const invariant of [source.includes('import "server-only"'), source.includes("clerkClient"), source.includes("findExistingParticipantIdentityBinding"), !source.includes("VerifiedClerkLocator"), !/sessionId|actor|authorize\(|grant\(|resolveOrBindExistingParticipantIdentity/.test(source), !/createUser|updateUser|deleteUser/.test(source)]) { assert.ok(invariant); checks += 1; }
  console.log(JSON.stringify({ validation: "backend-verified-clerk-target-identity", result: "PASS", checks, writes: 0, grants: 0, sessionLocators: 0, liveProviderCalls: 0 }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
