import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";

import type { ExistingParticipantIdentityBindingRepository } from "../../db/governance/types";
import { ExistingParticipantIdentityResolutionService } from "../../lib/auth/existingParticipantIdentityResolutionCore";
import { resolveClerkStableInstanceIdentity } from "../../lib/auth/clerkStableInstanceIdentity";

const AT = "2026-09-06T12:00:00.000Z";
const key = "identity-resolution-validator-key-000000000000000000000000000000";
const encodedKey = (host: string) => `pk_test_${Buffer.from(`${host}$`).toString("base64url")}`;
const safeIdentity = (subject: string, session = `session:${subject}`) => ({ status: "verified" as const, identity: { consumerId: subject, provider: "clerk" as const, verificationId: session, verifiedAt: AT } });
type Binding = { bindingId: string; participantRef: string; createdAt: string; digest: string };
type Anchor = { anchorId: string; activationIdempotencyKey: string; legacy: string; instance: string; activatedAt: string };

class IsolatedBindings implements ExistingParticipantIdentityBindingRepository {
  readonly v1: Binding[] = []; readonly v2: Binding[] = []; anchor: Anchor | undefined; fail = false;
  constructor(private readonly stableInstance: string | undefined) {}
  private hmac(value: string) { return createHmac("sha256", key).update(value).digest("hex"); }
  private v1Digest(subject: string) { return this.hmac(`clerk:${subject}`); }
  private instance() { if (!this.stableInstance) throw new Error("stable instance unavailable"); return this.hmac(`discovery:participant-identity:stable-instance:v2:${this.stableInstance}`); }
  private v2Digest(subject: string) { return this.hmac(`discovery:participant-identity:stable-subject:v2:${this.instance()}:clerk:${subject}`); }
  private legacy() { return this.hmac("discovery:participant-identity:legacy-namespace:v1"); }
  private active() { if (!this.anchor) return false; if (this.anchor.legacy !== this.legacy() || this.anchor.instance !== this.instance()) throw new Error("anchor instance conflict"); return true; }
  private selection(subject: string) { const v1 = this.v1.filter((value) => value.digest === this.v1Digest(subject)); const v2 = this.active() ? this.v2.filter((value) => value.digest === this.v2Digest(subject)) : []; if (v1.length > 1 || v2.length > 1 || (v1[0] && v2[0] && v1[0].participantRef !== v2[0].participantRef)) throw new Error("binding conflict"); return v2[0] ?? v1[0]; }
  async resolveOrBindExistingParticipantIdentity(input: { provider: "clerk"; providerSubject: string; resolvedAt: string; }) { if (this.fail) throw new Error("repository unavailable"); const existing = this.selection(input.providerSubject), v1 = this.v1.find((value) => value.digest === this.v1Digest(input.providerSubject)), v2 = this.active() ? this.v2.find((value) => value.digest === this.v2Digest(input.providerSubject)) : undefined; if (existing) { if (this.active() && v1 && !v2) this.v2.push({ ...v1, bindingId: `mapping:${randomUUID()}`, createdAt: input.resolvedAt, digest: this.v2Digest(input.providerSubject) }); return existing; } const binding = { bindingId: `binding:${randomUUID()}`, participantRef: `participant:${randomUUID()}`, createdAt: input.resolvedAt, digest: this.active() ? this.v2Digest(input.providerSubject) : this.v1Digest(input.providerSubject) }; (this.active() ? this.v2 : this.v1).push(binding); return binding; }
  async findExistingParticipantIdentityBinding(input: { provider: "clerk"; providerSubject: string; }) { if (this.fail) throw new Error("repository unavailable"); return this.selection(input.providerSubject); }
  async activateLegacyParticipantIdentityNamespaceAnchor(input: { activationIdempotencyKey: string; activatedAt: string; }) { if (this.fail) throw new Error("repository unavailable"); const legacy = this.legacy(), instance = this.instance(); if (this.anchor) { if (this.anchor.activationIdempotencyKey !== input.activationIdempotencyKey || this.anchor.legacy !== legacy || this.anchor.instance !== instance) throw new Error("anchor conflict"); return { anchorId: this.anchor.anchorId, activatedAt: this.anchor.activatedAt }; } this.anchor = { anchorId: `anchor:${randomUUID()}`, activationIdempotencyKey: input.activationIdempotencyKey, legacy, instance, activatedAt: input.activatedAt }; return { anchorId: this.anchor.anchorId, activatedAt: this.anchor.activatedAt }; }
}

async function resolve(bindings: IsolatedBindings, subject: string, session?: string) { return new ExistingParticipantIdentityResolutionService(bindings).resolve({ authenticatedIdentity: safeIdentity(subject, session) }); }
async function lookup(bindings: IsolatedBindings, subject: string) { return new ExistingParticipantIdentityResolutionService(bindings).lookupExistingParticipantBinding(safeIdentity(subject)); }

async function main() {
  const instance = resolveClerkStableInstanceIdentity(encodedKey("example.clerk.accounts"));
  assert.equal(instance, "https://example.clerk.accounts/");
  for (const malformed of ["pk_test_", "pk_live_not-base64!", `pk_test_${Buffer.from("example.clerk.accounts").toString("base64url")}`, encodedKey("example.clerk.accounts/path"), encodedKey("user@example.clerk.accounts"), encodedKey("example.clerk.accounts?x=1")]) assert.equal(resolveClerkStableInstanceIdentity(malformed), undefined);
  const bindings = new IsolatedBindings(instance);
  const a = await resolve(bindings, "synthetic-user-a", "session:one"), b = await resolve(bindings, "synthetic-user-b");
  assert.equal(a.status, "resolved"); assert.equal(b.status, "resolved"); assert.notEqual(a.status === "resolved" ? a.participantRef : "", b.status === "resolved" ? b.participantRef : "");
  assert.equal(bindings.v1[0]!.digest, createHmac("sha256", key).update("clerk:synthetic-user-a").digest("hex"));
  assert.deepEqual(await resolve(bindings, "synthetic-user-a", "session:rotated"), a);
  const beforeAnchor = { v1: bindings.v1.length, v2: bindings.v2.length };
  const anchor = await bindings.activateLegacyParticipantIdentityNamespaceAnchor({ activationIdempotencyKey: "cutover-001", activatedAt: AT });
  assert.deepEqual(await bindings.activateLegacyParticipantIdentityNamespaceAnchor({ activationIdempotencyKey: "cutover-001", activatedAt: AT }), anchor); assert.deepEqual({ v1: bindings.v1.length, v2: bindings.v2.length }, beforeAnchor);
  assert.deepEqual(await lookup(bindings, "synthetic-user-a"), { status: "found", participantRef: a.status === "resolved" ? a.participantRef : "" });
  assert.deepEqual(await resolve(bindings, "synthetic-user-a"), a); assert.equal(bindings.v2.length, 1); assert.equal(bindings.v2[0]!.participantRef, a.status === "resolved" ? a.participantRef : "");
  const c = await resolve(bindings, "synthetic-user-c"); assert.equal(c.status, "resolved"); assert.equal(bindings.v2.length, 2); assert.equal(bindings.v1.length, 2);
  const otherInstance = new IsolatedBindings(resolveClerkStableInstanceIdentity(encodedKey("other.clerk.accounts"))); otherInstance.v1.push(...bindings.v1); otherInstance.v2.push(...bindings.v2); otherInstance.anchor = bindings.anchor;
  assert.deepEqual(await lookup(otherInstance, "synthetic-user-c"), { status: "unavailable" });
  const conflict = new IsolatedBindings(instance); conflict.v1.push({ ...bindings.v1[0]! }); await conflict.activateLegacyParticipantIdentityNamespaceAnchor({ activationIdempotencyKey: "cutover-conflict", activatedAt: AT }); conflict.v2.push({ ...bindings.v1[0]!, bindingId: "binding:other", participantRef: `participant:${randomUUID()}`, digest: createHmac("sha256", key).update(`discovery:participant-identity:stable-subject:v2:${createHmac("sha256", key).update(`discovery:participant-identity:stable-instance:v2:${instance}`).digest("hex")}:clerk:synthetic-user-a`).digest("hex") });
  assert.deepEqual(await lookup(conflict, "synthetic-user-a"), { status: "unavailable" });
  bindings.fail = true; assert.deepEqual(await lookup(bindings, "synthetic-user-a"), { status: "unavailable" }); bindings.fail = false;
  const service = new ExistingParticipantIdentityResolutionService(bindings); assert.deepEqual(await service.resolve({ authenticatedIdentity: { status: "denied", reason: "clerk-authentication-required" } }), { status: "unavailable" });
  const serialized = JSON.stringify({ v1: bindings.v1, v2: bindings.v2, anchor: bindings.anchor }); assert.ok(!serialized.includes("synthetic-user") && !serialized.includes("example.clerk.accounts") && !serialized.includes("pk_test_"));
  console.log(JSON.stringify({ validation: "existing-participant-identity-resolution", result: "PASS", v1Compatibility: true, v2RegistrationsAfterAnchor: 1, sessionRotationMismatches: 0, crossInstanceAccepted: 0, conflictingBindingsAccepted: 0, anchorBindingsCreated: 0, malformedInstanceAccepted: 0, repositoryFailuresAccepted: 0, rawIdentityDataPersisted: 0, accessGrantsCreated: 0, network: 0 }));
}
main().catch((error) => { console.error(error); process.exitCode = 1; });
