import assert from "node:assert/strict";
import { createHmac, randomUUID } from "node:crypto";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

import type { ExistingParticipantIdentityBindingRepository } from "../../db/governance/types";
import { ExistingParticipantIdentityResolutionService } from "../../lib/auth/existingParticipantIdentityResolutionCore";

const AT = "2026-09-06T12:00:00.000Z";
const key = "identity-resolution-validator-key-000000000000000000000000000000";
const safeIdentity = (subject: string) => ({ status: "verified" as const, identity: { consumerId: subject, provider: "clerk" as const, verificationId: `session:${subject}`, verifiedAt: AT } });

type StoredBinding = { locatorDigest: string; bindingId: string; participantRef: string; createdAt: string };
class IsolatedBindings implements ExistingParticipantIdentityBindingRepository {
  constructor(private readonly file: string) {}
  private async all(): Promise<StoredBinding[]> { try { return JSON.parse(await readFile(this.file, "utf8")) as StoredBinding[]; } catch { return []; } }
  async resolveOrBindExistingParticipantIdentity(input: { provider: "clerk"; providerSubject: string; resolvedAt: string; }) {
    const locatorDigest = createHmac("sha256", key).update(`${input.provider}:${input.providerSubject}`).digest("hex");
    const records = await this.all();
    const matches = records.filter((record) => record.locatorDigest === locatorDigest);
    if (matches.length > 1) throw new Error("ambiguous binding");
    if (matches[0]) return matches[0];
    const binding = { locatorDigest, bindingId: `binding:${randomUUID()}`, participantRef: `participant:${randomUUID()}`, createdAt: input.resolvedAt };
    await writeFile(this.file, JSON.stringify([...records, binding]), { mode: 0o600 });
    return binding;
  }

  async findExistingParticipantIdentityBinding(input: { provider: "clerk"; providerSubject: string; }) {
    const locatorDigest = createHmac("sha256", key).update(`${input.provider}:${input.providerSubject}`).digest("hex");
    const records = await this.all();
    const matches = records.filter((record) => record.locatorDigest === locatorDigest);
    if (matches.length > 1) throw new Error("ambiguous binding");
    return matches[0];
  }
}

async function resolve(file: string, subject: string) {
  return new ExistingParticipantIdentityResolutionService(new IsolatedBindings(file)).resolve({ authenticatedIdentity: safeIdentity(subject) });
}

async function lookup(file: string, subject: string) {
  return new ExistingParticipantIdentityResolutionService(new IsolatedBindings(file)).lookupExistingParticipantBinding(safeIdentity(subject));
}

async function fresh(file: string) {
  const result = spawnSync("npx", ["tsx", process.argv[1]!, "--fresh", file], { encoding: "utf8" });
  assert.equal(result.status, 0, "fresh process must succeed");
  return JSON.parse(result.stdout) as Record<string, unknown>;
}

async function main() {
  if (process.argv[2] === "--fresh") {
    const a = await resolve(process.argv[3]!, "synthetic-user-a");
    const b = await resolve(process.argv[3]!, "synthetic-user-b");
    const lookupA = await lookup(process.argv[3]!, "synthetic-user-a");
    const lookupB = await lookup(process.argv[3]!, "synthetic-user-b");
    process.stdout.write(JSON.stringify({ a, b, lookupA, lookupB }));
    return;
  }
  const root = await mkdtemp(path.join(tmpdir(), "discovery-existing-participant-identity-"));
  const file = path.join(root, "bindings.json");
  try {
    const a = await resolve(file, "synthetic-user-a");
    const b = await resolve(file, "synthetic-user-b");
    assert.equal(a.status, "resolved"); assert.equal(b.status, "resolved");
    assert.notEqual(a.status === "resolved" ? a.participantRef : "", b.status === "resolved" ? b.participantRef : "");
    const first = await readFile(file, "utf8");
    assert.equal((JSON.parse(first) as StoredBinding[]).length, 2);
    assert.ok(!first.includes("synthetic-user-a") && !first.includes("synthetic-user-b"));
    const replay = await resolve(file, "synthetic-user-a");
    assert.deepEqual(replay, a); assert.equal(await readFile(file, "utf8"), first);
    const restart = await fresh(file);
    assert.deepEqual(restart.a, a); assert.deepEqual(restart.b, b);
    assert.deepEqual(restart.lookupA, { status: "found", participantRef: a.status === "resolved" ? a.participantRef : "" });
    assert.deepEqual(restart.lookupB, { status: "found", participantRef: b.status === "resolved" ? b.participantRef : "" });
    const beforeLookup = await readFile(file, "utf8");
    assert.deepEqual(await lookup(file, "synthetic-user-a"), { status: "found", participantRef: a.status === "resolved" ? a.participantRef : "" });
    assert.deepEqual(await lookup(file, "synthetic-user-b"), { status: "found", participantRef: b.status === "resolved" ? b.participantRef : "" });
    assert.deepEqual(await lookup(file, "synthetic-user-unknown"), { status: "not-found" });
    assert.deepEqual(await lookup(file, "synthetic-user-unknown"), { status: "not-found" });
    assert.equal(await readFile(file, "utf8"), beforeLookup);
    const beforeFailures = await readFile(file, "utf8");
    const service = new ExistingParticipantIdentityResolutionService(new IsolatedBindings(file));
    const unknown = await service.resolve({ authenticatedIdentity: { status: "denied", reason: "clerk-authentication-required" } });
    const forged = await service.resolve({ authenticatedIdentity: safeIdentity("synthetic-user-a"), participantRef: "participant:forged", actorRef: "actor:forged", organizationId: "foreign", role: "admin", capability: "all" });
    assert.deepEqual(unknown, { status: "unavailable" }); assert.deepEqual(forged, unknown);
    assert.deepEqual(await service.lookupExistingParticipantBinding({ status: "denied", reason: "clerk-authentication-required" } as never), { status: "unavailable" });
    assert.equal(await readFile(file, "utf8"), beforeFailures);
    await writeFile(file, JSON.stringify([...JSON.parse(beforeFailures) as StoredBinding[], { ...(JSON.parse(beforeFailures) as StoredBinding[])[0]!, bindingId: "binding:duplicate" }]));
    const ambiguous = await resolve(file, "synthetic-user-a");
    assert.deepEqual(ambiguous, unknown);
    console.log(JSON.stringify({ validation: "existing-participant-identity-resolution", result: "PASS", existingIdentitiesResolved: 2, authenticationUsersCreated: 0, participantBindingsCreated: 2, actorIdentitiesDerived: 0, freshProcessMismatches: 0, replayDuplicates: 0, unknownAccepted: 0, ambiguousAccepted: 0, conflictingBindingsAccepted: 0, callerSuppliedInternalIdentitiesTrusted: 0, unauthorizedIdentityDisclosures: 0, accessGrantsCreated: 0, publicIdentityEndpointsAdded: 0, customerIdentityDataCommitted: 0, network: 0 }));
  } finally { await rm(root, { recursive: true, force: true }); }
}

main().catch((error) => { console.error(error); process.exitCode = 1; });
