import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import type { AlphaOrganizationAccessRecord } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import {
  SANDBOX_PERSONAS,
  SANDBOX_ORGANIZATION_ID,
  type ResolvedSandboxPersona,
} from "../../lib/access/sandboxMultiUserAccess";
import { readLiveScopedRoleAwareProjection } from "../../product/integration/liveScopedRoleAwareAdapter";

const NOW = "2026-08-04T20:00:00.000Z";
const RETAINED = "/Users/garyepper/Desktop/Alpha-Sprint-14-main/.discovery-onboarding-runtime/organizations";
const EXPECTED = "824a4c2e3f86cf000e3f8442d2bf38a97b4281e545959a49bf2bc6f41bb8b047";
const sha = (value: Uint8Array | string): string =>
  createHash("sha256").update(value).digest("hex");
const persona = (index: number): ResolvedSandboxPersona => ({
  ...SANDBOX_PERSONAS[index]!,
  userId: `user_syntheticlive${index}`,
});
const record = (
  value: ResolvedSandboxPersona,
  overrides: Partial<AlphaOrganizationAccessRecord> = {},
): AlphaOrganizationAccessRecord => ({
  accessRecordId: `access:${value.key}`,
  policyId: "alpha-explicit-allowlist-disclosure",
  policyVersion: "1",
  consumerId: value.userId,
  organizationId: SANDBOX_ORGANIZATION_ID,
  relationship: "allowed_alpha_user",
  supportedExperiences: ["organization"],
  scope: { type: "organization", organizationId: SANDBOX_ORGANIZATION_ID },
  status: "active",
  createdAt: "2026-08-04T12:00:00.000Z",
  ...overrides,
});

async function readHistorical(
  value: ResolvedSandboxPersona,
  records: readonly AlphaOrganizationAccessRecord[] = [record(value)],
) {
  let reads = 0;
  const repository = new FilesystemOrganizationRuntimeRepository(RETAINED);
  const result = await readLiveScopedRoleAwareProjection({
    userId: value.userId,
    organizationId: SANDBOX_ORGANIZATION_ID,
    persona: value,
    accessRecords: records,
    runtimeRepository: {
      read: async (organizationId) => {
        reads += 1;
        return repository.read(organizationId);
      },
    },
    evaluatedAt: NOW,
  });
  return { result, reads };
}

async function main(): Promise<void> {
  const path = `${RETAINED}/${SANDBOX_ORGANIZATION_ID}.json`;
  assert.equal(sha(readFileSync(path)), EXPECTED);

  for (let index = 0; index < 3; index += 1) {
    const { result, reads } = await readHistorical(persona(index));
    assert.equal(result.disposition, "denied");
    assert.equal(reads, 1);
    assert.deepEqual(Object.keys(result), ["disposition"]);
  }

  const manager = persona(2);
  for (const records of [
    [],
    [record(manager, { status: "revoked", revokedAt: NOW })],
    [record(manager), record(manager, {
      accessRecordId: "fork",
      supersedesAccessRecordId: "missing",
    })],
  ]) {
    const { result, reads } = await readHistorical(manager, records);
    assert.equal(result.disposition, "denied");
    assert.equal(reads, 0);
    assert.deepEqual(Object.keys(result), ["disposition"]);
  }

  const mismatch = await readLiveScopedRoleAwareProjection({
    userId: "user_other",
    organizationId: SANDBOX_ORGANIZATION_ID,
    persona: manager,
    accessRecords: [record(manager)],
    runtimeRepository: { read: async () => { throw new Error("must not read"); } },
    evaluatedAt: NOW,
  });
  assert.deepEqual(mismatch, { disposition: "denied" });
  assert.equal(sha(readFileSync(path)), EXPECTED);

  const source = readFileSync("product/integration/liveScopedRoleAwareAdapter.ts", "utf8");
  assert.ok(source.indexOf("preflightAlphaOrganizationAccess") < source.indexOf("runtimeRepository.read"));
  assert.ok(source.indexOf("currentEligibility.disposition") < source.indexOf("const canonical = composeActivatedYourOrganization"));
  assert.equal((source.match(/composeActivatedYourOrganization\(/g) ?? []).length, 1);
  assert.doesNotMatch(source, /sourcePopulator|scopeSelector|projectionReader|runtimeReads/);

  console.log(JSON.stringify({
    status: "PASS",
    historicalRetainedRuntime: "governance-incomplete",
    historicalDisposition: "denied",
    accounts: 3,
    authorizedRuntimeReadsBeforeDenial: 1,
    revokedRuntimeReads: 0,
    deniedShape: ["disposition"],
    retainedRuntimeDigest: EXPECTED,
    positiveGovernedEligibilityOwner: "validate:canonical-understanding-current-eligibility",
    externalActivity: { network: 0, connectorCalls: 0, driveReads: 0, driveWrites: 0 },
  }));
}

void main();
