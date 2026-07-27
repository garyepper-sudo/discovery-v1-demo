import assert from "node:assert/strict";

import {
  resolveAuthorizedOrganization,
} from "../../lib/alpha-activation/resolveAuthorizedOrganization";
import type { AlphaOrganizationAccessRecord } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";

const NOW = "2026-07-27T12:00:00.000Z";
const USER = "user_approved";
const ATLAS = "atlas-manufacturing-simulation";
let checks = 0;

function check(assertion: () => void): void {
  assertion();
  checks += 1;
}

function record(input: {
  organizationId?: string;
  consumerId?: string;
  status?: "active" | "revoked";
  validUntil?: string;
  accessRecordId?: string;
} = {}): AlphaOrganizationAccessRecord {
  const organizationId = input.organizationId ?? ATLAS;
  return {
    accessRecordId: input.accessRecordId ?? `access:${organizationId}`,
    policyId: "alpha-explicit-allowlist-disclosure",
    policyVersion: "1",
    consumerId: input.consumerId ?? USER,
    organizationId,
    relationship: "allowed_alpha_user",
    supportedExperiences: ["organization"],
    scope: { type: "organization", organizationId },
    status: input.status ?? "active",
    createdAt: "2026-07-26T12:00:00.000Z",
    ...(input.validUntil ? { validUntil: input.validUntil } : {}),
    ...(input.status === "revoked" ? { revokedAt: NOW } : {}),
  };
}

async function resolve(input: {
  records: readonly AlphaOrganizationAccessRecord[];
  consumerId?: string;
  requestedOrganizationId?: string;
  configuredOrganizationId?: string;
}) {
  let repositoryReads = 0;
  let runtimeReads = 0;
  let disclosureWrites = 0;
  const result = await resolveAuthorizedOrganization({
    identity: {
      consumerId: input.consumerId ?? USER,
      provider: "clerk",
      verificationId: "session:verified",
      verifiedAt: NOW,
    },
    ...(input.requestedOrganizationId
      ? { requestedOrganizationId: input.requestedOrganizationId }
      : {}),
    ...(input.configuredOrganizationId
      ? { configuredOrganizationId: input.configuredOrganizationId }
      : {}),
    resolvedAt: NOW,
    accessRepository: {
      async findAccessRecordsForConsumer(repositoryInput) {
        repositoryReads += 1;
        return input.records.filter(
          (candidate) =>
            candidate.consumerId === repositoryInput.consumerId,
        );
      },
    },
  });
  return { result, repositoryReads, runtimeReads, disclosureWrites };
}

async function main(): Promise<void> {
const single = await resolve({ records: [record()] });
check(() => assert.deepEqual(single.result, {
  status: "resolved",
  organizationId: ATLAS,
  resolutionSource: "single-authorized-organization",
}));

const guarded = await resolve({
  records: [record()],
  configuredOrganizationId: ATLAS,
});
check(() => assert.equal(guarded.result.status, "resolved"));
check(() => assert.equal(
  guarded.result.status === "resolved" ? guarded.result.resolutionSource : "",
  "configured-authorized-organization",
));

const explicit = await resolve({
  records: [record()],
  requestedOrganizationId: ATLAS,
});
check(() => assert.equal(
  explicit.result.status === "resolved" ? explicit.result.resolutionSource : "",
  "explicit-authorized-selection",
));

const deniedCases = [
  await resolve({ records: [] }),
  await resolve({ records: [record()], consumerId: "user_wrong" }),
  await resolve({
    records: [record()],
    requestedOrganizationId: "another-organization",
  }),
  await resolve({
    records: [record()],
    requestedOrganizationId: "../atlas",
  }),
  await resolve({
    records: [record()],
    configuredOrganizationId: "another-organization",
  }),
  await resolve({
    records: [
      record(),
      record({
        organizationId: "another-organization",
        accessRecordId: "access:another",
      }),
    ],
  }),
  await resolve({ records: [record({ status: "revoked" })] }),
  await resolve({
    records: [record({ validUntil: "2026-07-27T11:59:59.000Z" })],
  }),
];

for (const denied of deniedCases) {
  check(() => assert.equal(denied.result.status, "denied"));
  check(() => assert.equal(denied.runtimeReads, 0));
  check(() => assert.equal(denied.disclosureWrites, 0));
  check(() => assert.ok(denied.repositoryReads <= 1));
}

const guardrailCannotGrant = await resolve({
  records: [],
  configuredOrganizationId: ATLAS,
});
check(() => assert.deepEqual(guardrailCannotGrant.result, {
  status: "denied",
  reason: "configured-organization-not-authorized",
}));

const queryCannotGrant = await resolve({
  records: [],
  requestedOrganizationId: ATLAS,
});
check(() => assert.deepEqual(queryCannotGrant.result, {
  status: "denied",
  reason: "requested-organization-not-authorized",
}));

console.log(JSON.stringify({
  validation: "authorized-organization-resolution",
  result: "PASS",
  checks,
  authority: "durable-access-records",
  runtimeReadsForDeniedCases: 0,
  disclosureWritesForDeniedCases: 0,
}));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
