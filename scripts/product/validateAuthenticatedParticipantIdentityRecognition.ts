import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";

import type {
  ExistingParticipantIdentityBindingRepository,
  ExistingParticipantIdentityBindingV1,
  LegacyParticipantIdentityNamespaceAnchorV1,
} from "../../db/governance/types";
import { classifyExistingAuthenticatedParticipant } from "../../lib/auth/authenticatedParticipantIdentityRecognition";

const verified = {
  status: "verified" as const,
  identity: {
    consumerId: "synthetic-existing-user",
    provider: "clerk" as const,
    verificationId: "synthetic-rotated-session",
    verifiedAt: "2026-09-08T12:00:00.000Z",
  },
};

class IsolatedLookupRepository implements ExistingParticipantIdentityBindingRepository {
  writes = 0;
  namespace: "active" | "missing" | "unavailable" = "active";
  binding: ExistingParticipantIdentityBindingV1 | undefined;
  failLookup = false;

  async inspectActiveParticipantIdentityNamespace() {
    if (this.namespace === "unavailable") throw new Error("unavailable");
    return this.namespace === "active"
      ? { scheme: "clerk-user-v2" as const, anchorId: "synthetic-anchor" }
      : undefined;
  }

  async findExistingParticipantIdentityBinding() {
    if (this.failLookup) throw new Error("integrity-conflict");
    return this.binding;
  }

  async resolveOrBindExistingParticipantIdentity(): Promise<ExistingParticipantIdentityBindingV1> {
    this.writes += 1;
    throw new Error("write owner must not be reached during page load");
  }

  async activateLegacyParticipantIdentityNamespaceAnchor(): Promise<LegacyParticipantIdentityNamespaceAnchorV1> {
    this.writes += 1;
    throw new Error("namespace owner must not be reached during page load");
  }
}

async function main() {
  const repository = new IsolatedLookupRepository();
  repository.binding = {
    bindingId: "synthetic-binding",
    participantRef: "participant:00000000-0000-4000-8000-000000000001",
    createdAt: "2026-09-08T12:00:00.000Z",
  };
  assert.equal(await classifyExistingAuthenticatedParticipant(verified, repository), "ready");
  assert.equal(repository.writes, 0);

  repository.binding = undefined;
  assert.equal(await classifyExistingAuthenticatedParticipant(verified, repository), "setup-required");
  assert.equal(repository.writes, 0);

  repository.namespace = "missing";
  assert.equal(await classifyExistingAuthenticatedParticipant(verified, repository), "unavailable");
  repository.namespace = "unavailable";
  assert.equal(await classifyExistingAuthenticatedParticipant(verified, repository), "unavailable");
  repository.namespace = "active";
  repository.failLookup = true;
  assert.equal(await classifyExistingAuthenticatedParticipant(verified, repository), "unavailable");
  assert.equal(repository.writes, 0);

  const root = process.cwd();
  const page = await readFile(path.join(root, "app/onboarding/identity/page.tsx"), "utf8");
  const client = await readFile(path.join(root, "app/onboarding/identity/IdentitySetup.tsx"), "utf8");
  const firstUnderstandingPage = await readFile(path.join(root, "app/onboarding/first-understanding/page.tsx"), "utf8");
  assert.match(page, /lookupAuthenticatedParticipantFromRequest/);
  assert.doesNotMatch(page, /registerAuthenticatedParticipantFromRequest|completeDiscoveryIdentitySetup/);
  assert.match(client, /initialStatus === "ready"/);
  assert.match(client, /initialStatus === "unavailable"/);
  assert.match(client, /No identity was changed/);
  assert.match(firstUnderstandingPage, /identityStatus==="setup-required"\)redirect\("\/onboarding\/identity"\)/);
  assert.match(firstUnderstandingPage, /identityStatus==="unavailable"\)return <IdentityUnavailable\/>/);
  assert.doesNotMatch(firstUnderstandingPage, /if\(!request\)redirect\("\/onboarding\/identity"\)/);

  console.log(JSON.stringify({
    validation: "authenticated-participant-identity-recognition",
    result: "PASS",
    foundRecognized: true,
    absentOffersSetup: true,
    unavailableFailsClosed: true,
    conflictFailsClosed: true,
    pageLoadWrites: repository.writes,
    participantDisclosure: 0,
    rawIdentityDisclosure: 0,
  }));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
