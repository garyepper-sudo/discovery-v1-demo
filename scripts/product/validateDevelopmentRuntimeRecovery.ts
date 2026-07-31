import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";

import {
  ALPHA_ALLOWLIST_POLICY_ID,
  ALPHA_ALLOWLIST_POLICY_VERSION,
  type AlphaOrganizationAccessRecord,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime";
import {
  onboardingTestOrganizationId,
  recoverDevelopmentOrganizationRuntime,
  type DevelopmentRuntimeRecoveryLineage,
  type DevelopmentRuntimeRecoveryLineageRepository,
  type DevelopmentRuntimeRecoveryRequest,
} from "../../lib/onboarding/testing";

const userId = "user_developmentRuntimeRecoveryValidation";
const organizationId = onboardingTestOrganizationId({
  consumerId: userId,
  requestId: "development-runtime-recovery-validation",
});
const differentOrganizationId = onboardingTestOrganizationId({
  consumerId: userId,
  requestId: "development-runtime-recovery-other-organization",
});
const now = "2026-07-30T20:00:00.000Z";
const environment = {
  DISCOVERY_ENV: "development",
  NEXT_PUBLIC_DISCOVERY_ENV: "development",
  DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
  NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_validation",
  CLERK_SECRET_KEY: "sk_test_validation",
  DISCOVERY_DATABASE_URL: "postgresql://localhost/discovery",
  DISCOVERY_DATABASE_ADMIN_URL: "postgresql://127.0.0.1/discovery",
  DISCOVERY_DATABASE_MIGRATION_URL: "postgresql://localhost/discovery",
  DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem",
  DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY:
    "/tmp/discovery-onboarding-runtime-recovery-validation",
  DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED: "false",
  DISCOVERY_RUNTIME_PROVISIONING_ENABLED: "false",
  DISCOVERY_ACCESS_PROVISIONING_ENABLED: "false",
} as const;

const access: AlphaOrganizationAccessRecord = {
  accessRecordId: "alpha-access:development-runtime-recovery",
  policyId: ALPHA_ALLOWLIST_POLICY_ID,
  policyVersion: ALPHA_ALLOWLIST_POLICY_VERSION,
  consumerId: userId,
  organizationId,
  relationship: "allowed_alpha_user",
  supportedExperiences: ["organization"],
  scope: { type: "organization", organizationId },
  status: "active",
  createdAt: now,
};

class MemoryLineage implements DevelopmentRuntimeRecoveryLineageRepository {
  records = new Map<string, DevelopmentRuntimeRecoveryLineage>();
  async read(requestId: string) {
    return this.records.get(requestId) ?? null;
  }
  async write(record: DevelopmentRuntimeRecoveryLineage) {
    const existing = this.records.get(record.requestId);
    if (existing && JSON.stringify(existing) !== JSON.stringify(record)) {
      throw new Error("conflict");
    }
    this.records.set(record.requestId, record);
  }
}

function request(
  overrides: Partial<DevelopmentRuntimeRecoveryRequest> = {},
): DevelopmentRuntimeRecoveryRequest {
  return {
    organizationId,
    authorizedUserId: userId,
    organizationName: "Recovery Validation Organization",
    industry: null,
    website: null,
    reason: "missing-ephemeral-runtime",
    requestId: "runtime-recovery-validation-001",
    operatorIdentity: "development-operator:validation",
    ...overrides,
  };
}

async function rejects(operation: () => Promise<unknown>, pattern: RegExp) {
  await assert.rejects(operation, pattern);
}

async function main(): Promise<void> {
  const mode = process.argv[2] ?? "all";
  const directory = await mkdtemp(path.join(tmpdir(), "discovery-onboarding-recovery-"));
  try {
    const runtimeRepository = new FilesystemOrganizationRuntimeRepository(directory);
    const lineageRepository = new MemoryLineage();
    let accessReads = 0;
    const accessRepository = {
      async findAccessRecords(input: {
        consumerId: string;
        organizationId: string;
        experience: "organization";
        resolvedAt: string;
      }) {
        accessReads += 1;
        return input.consumerId === userId && input.organizationId === organizationId
          ? [access]
          : [];
      },
    };
    const recover = (value = request()) =>
      recoverDevelopmentOrganizationRuntime({
        request: value,
        environment,
        runtimeRepository,
        accessRepository,
        lineageRepository,
        now: () => now,
      });

    if (mode === "environment" || mode === "all") {
      await rejects(
        () => recoverDevelopmentOrganizationRuntime({
          request: request(),
          environment: { ...environment, DISCOVERY_ENV: "production" },
          runtimeRepository,
          accessRepository,
          lineageRepository,
          now: () => now,
        }),
        /forbidden in production/,
      );
    }
    if (mode === "authorization" || mode === "all") {
      await rejects(
        () => recover(request({ authorizedUserId: "user_Unauthorized" })),
        /Exact active development organization access is required/,
      );
      await rejects(
        () => recover(request({ organizationId: differentOrganizationId })),
        /Exact active development organization access is required/,
      );
      await rejects(
        () => recover(request({ organizationId: "onb-dev-malformed" })),
        /exact onb-dev organization/,
      );
      assert.equal(await runtimeRepository.exists(organizationId), false);
      assert.equal(await runtimeRepository.exists(differentOrganizationId), false);
    }

    const accessReadsBeforeRecovery = accessReads;
    const first = await recover();
    assert.equal(first.status, "recovered");
    assert.equal(first.organizationId, organizationId);
    assert.equal(first.preservedAccess, true);
    assert.equal(accessReads - accessReadsBeforeRecovery, 2);
    const stored = await runtimeRepository.read(organizationId);
    assert.ok(stored);
    assert.equal(stored.runtime.metadata.name, "Recovery Validation Organization");
    assert.equal(stored.runtime.metadata.industry, undefined);
    assert.equal(stored.runtime.metadata.website, undefined);
    assert.equal(stored.runtime.metadata.investigationCount, 0);
    assert.equal(stored.runtime.memory.observations.length, 0);
    assert.equal(stored.runtime.memory.organizationalExplanations.length, 0);
    assert.equal(stored.runtime.memory.executiveDecisionRecords.length, 0);
    assert.equal(stored.runtime.memory.executiveReviews.length, 0);

    if (mode === "idempotency" || mode === "state-preservation" || mode === "all") {
      const beforeBytes = Buffer.from(stored.bytes);
      const second = await recover();
      assert.equal(second.status, "already-present");
      assert.equal(second.runtimeRevision, first.runtimeRevision);
      const repeated = await runtimeRepository.read(organizationId);
      assert.ok(repeated);
      assert.equal(Buffer.compare(beforeBytes, Buffer.from(repeated.bytes)), 0);
      assert.equal(lineageRepository.records.size, 1);
    }
    if (mode === "conflict" || mode === "all") {
      await rejects(
        () => recover(request({ organizationName: "Conflicting Organization" })),
        /conflicts with the recovery request/,
      );
      await rejects(
        () => recover(request({
          requestId: "runtime-recovery-validation-002",
          organizationName: "Recovery Validation Organization",
        })),
        /conflicts with the recovery request/,
      );
    }
    if (mode === "lineage" || mode === "all") {
      const lineage = await lineageRepository.read("runtime-recovery-validation-001");
      assert.ok(lineage);
      assert.equal(lineage.organizationId, organizationId);
      assert.equal(lineage.authorizedUserId, userId);
      assert.equal(lineage.reason, "missing-ephemeral-runtime");
      assert.equal(lineage.runtimeRevision, first.runtimeRevision);
      assert.equal(lineage.metadataSource, "operator-supplied");
    }

    console.log(`Development Runtime recovery validation passed (${mode}).`);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
