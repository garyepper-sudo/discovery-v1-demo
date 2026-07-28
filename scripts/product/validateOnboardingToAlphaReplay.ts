import assert from "node:assert/strict";
import { mkdtemp, unlink } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type {
  AlphaOrganizationAccessRecord,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import {
  buildAlphaCanonicalAuthorityReceipt,
  runAlphaAllowlistDisclosureShadow,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import type {
  AlphaAccessRecordRepository,
} from "../../db/governance/types";
import { composeActivatedYourOrganization } from "../../components/product-shell/data/composeActivatedYourOrganization";
import { runDiscoveryV3 } from "../../engine/v3";
import {
  FilesystemOrganizationRuntimeRepository,
} from "../../engine/v3/runtime/organizationRuntimeRepository";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { buildOnboardingInvestigationInput } from "../../lib/onboarding/testing/buildOnboardingInvestigationInput";
import { provisionOnboardingTestOrganization } from "../../lib/onboarding/testing/onboardingTestOrganization";

const now = "2026-07-28T00:00:00.000Z";
const consumerId = "user_onboardingreplayvalidation0001";
const requestId = "deterministic-local-onboarding-replay";

function accessRepository(): AlphaAccessRecordRepository & {
  records: AlphaOrganizationAccessRecord[];
  lifecycleEvents: string[];
} {
  const records: AlphaOrganizationAccessRecord[] = [];
  const lifecycleEvents: string[] = [];
  return {
    records,
    lifecycleEvents,
    async findAccessRecordsForConsumer(input) {
      return records.filter((record) =>
        record.consumerId === input.consumerId &&
        record.supportedExperiences.includes(input.experience)
      );
    },
    async findAccessRecords(input) {
      return records.filter((record) =>
        record.consumerId === input.consumerId &&
        record.organizationId === input.organizationId &&
        record.supportedExperiences.includes(input.experience)
      );
    },
    async grantAccess(input) {
      const record: AlphaOrganizationAccessRecord = {
        accessRecordId: input.accessRecordId,
        policyId: "alpha-explicit-allowlist-disclosure",
        policyVersion: "1",
        consumerId: input.consumerId,
        organizationId: input.organizationId,
        relationship: "allowed_alpha_user",
        supportedExperiences: ["organization"],
        scope: {
          type: "organization",
          organizationId: input.organizationId,
        },
        status: "active",
        createdAt: input.grantedAt,
      };
      records.push(record);
      lifecycleEvents.push(`grant:${record.accessRecordId}`);
      return record;
    },
    async revokeAccess(input) {
      const record = records.find(
        (candidate) => candidate.accessRecordId === input.accessRecordId,
      );
      assert.ok(record);
      record.status = "revoked";
      lifecycleEvents.push(`revoke:${record.accessRecordId}`);
      return record;
    },
    async supersedeAccess() {
      throw new Error("not used");
    },
  };
}

function canonicalSummary(input: ReturnType<typeof evolveOrganizationRuntime>) {
  return {
    explanations: input.memory.organizationalExplanations.map((explanation) => ({
      semanticKey: explanation.semanticKey,
      claim: explanation.claim,
      evidenceIds: explanation.evidenceIds,
      viability: explanation.viability,
    })),
    compositions:
      input.memory.organizationalUnderstandingState.canonicalCompositions?.map(
        (composition) => ({
          explanationIds: composition.explanationIds,
          uncertainty: composition.compositionUncertainty,
          authorityDisposition:
            composition.authorityTransition?.disposition ?? "provisional",
        }),
      ) ?? [],
  };
}

async function main(): Promise<void> {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), "discovery-onboarding-replay-"),
  );
  const runtimeRepository =
    new FilesystemOrganizationRuntimeRepository(directory);
  const access = accessRepository();
  const environment = {
    DISCOVERY_ENV: "development",
    NEXT_PUBLIC_DISCOVERY_ENV: "development",
    DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
    NEXT_PUBLIC_DISCOVERY_ONBOARDING_TEST_ENABLED: "true",
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test_validation",
    CLERK_SECRET_KEY: "sk_test_validation",
    DISCOVERY_DATABASE_URL: "postgresql://localhost/onboarding",
    DISCOVERY_DATABASE_ADMIN_URL: "postgresql://localhost/onboarding",
    DISCOVERY_DATABASE_MIGRATION_URL: "postgresql://localhost/onboarding",
    DISCOVERY_RUNTIME_STORAGE_BACKEND: "filesystem",
    DISCOVERY_RUNTIME_ORGANIZATIONS_DIRECTORY: directory,
    DISCOVERY_ALPHA_ORGANIZATION_ID: "",
    DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED: "false",
    DISCOVERY_RUNTIME_PROVISIONING_ENABLED: "false",
    DISCOVERY_ACCESS_PROVISIONING_ENABLED: "false",
  };
  const receipt = await provisionOnboardingTestOrganization({
    environment,
    consumerId,
    requestId,
    organizationName: "Local Onboarding Validation",
    now,
    runtimeRepository,
    accessRepository: access,
  });
  assert.match(receipt.organizationId, /^onb-dev-[a-f0-9]{24}$/);

  const investigationInput = buildOnboardingInvestigationInput({
    company: "Local Onboarding Validation",
    industry: "Product development",
    question: "How does leadership approval affect release delivery?",
    messyInput: [
      "Leadership approves every product release.",
      "The product team depends on leadership approval before release.",
      "The release process uses the operations dashboard.",
      "Approval delays create a release bottleneck.",
      "The bottleneck contributes to team fatigue.",
    ].join("\n"),
  });
  const stored = await runtimeRepository.read(receipt.organizationId);
  assert.ok(stored);
  const firstResult = runDiscoveryV3(investigationInput);
  const evolved = evolveOrganizationRuntime({
    runtime: stored.runtime,
    result: firstResult,
    input: investigationInput,
  });
  await runtimeRepository.replace(
    receipt.organizationId,
    new TextEncoder().encode(`${JSON.stringify(evolved, null, 2)}\n`),
    stored.revision,
    {
      requestId: "validate-onboarding-evolution",
      operatorId: "onboarding-replay-validator",
    },
  );

  assert.equal(evolved.metadata.investigationCount, 1);
  assert.ok(evolved.memory.organizationalExplanations.length >= 1);
  const compositions =
    evolved.memory.organizationalUnderstandingState.canonicalCompositions ?? [];
  assert.ok(compositions.length >= 1);
  const evidenceIds = new Set(firstResult.evidence.map((item) => item.id));
  for (const explanation of evolved.memory.organizationalExplanations) {
    assert.ok(explanation.evidenceIds.length >= 1);
    assert.ok(explanation.evidenceIds.every((id) => evidenceIds.has(id)));
    assert.ok(explanation.reasoningPathIds.length >= 1);
    assert.equal(explanation.viability, "unadjudicated");
  }
  assert.ok(firstResult.evidence.some((item) =>
    item.sourceId === "onboarding-leadership-context"
  ));
  assert.ok(!JSON.stringify(evolved).toLowerCase().includes("atlas"));

  const accessRecord = access.records.find(
    (record) => record.organizationId === receipt.organizationId,
  );
  assert.ok(accessRecord);
  const identity = {
    consumerId,
    provider: "clerk" as const,
    verificationId: "local-onboarding-replay",
    verifiedAt: now,
  };
  const disclosure = runAlphaAllowlistDisclosureShadow(
    {
      identity,
      organizationId: receipt.organizationId,
      experience: "organization",
      resolvedAt: now,
    },
    {
      accessReader: {
        findAccessRecords() {
          return [accessRecord];
        },
      },
      runtimeLoader: {
        load() {
          return {
            organizationId: receipt.organizationId,
            compositions,
            authorityReceipts: compositions.flatMap((composition) => {
              const authorityReceipt =
                buildAlphaCanonicalAuthorityReceipt(composition);
              return authorityReceipt ? [authorityReceipt] : [];
            }),
          };
        },
      },
    },
  );
  assert.equal(disclosure.preflight.disposition, "eligible");
  assert.ok(disclosure.resolution);
  const activated = composeActivatedYourOrganization({
    runtime: evolved,
    identity,
    resolution: disclosure.resolution,
    resolvedAt: now,
  });
  assert.equal(activated.status, "available");

  const replayResult = runDiscoveryV3(investigationInput);
  const replay = evolveOrganizationRuntime({
    runtime: stored.runtime,
    result: replayResult,
    input: investigationInput,
  });
  assert.deepEqual(canonicalSummary(replay), canonicalSummary(evolved));

  const insufficientInput = buildOnboardingInvestigationInput({
    company: "Local Onboarding Validation",
    messyInput: "The office walls are blue.",
  });
  const insufficient = evolveOrganizationRuntime({
    runtime: stored.runtime,
    result: runDiscoveryV3(insufficientInput),
    input: insufficientInput,
  });
  assert.equal(insufficient.memory.organizationalExplanations.length, 0);
  assert.equal(
    insufficient.memory.organizationalUnderstandingState
      .canonicalCompositions?.length ?? 0,
    0,
  );

  await access.revokeAccess({
    accessRecordId: accessRecord.accessRecordId,
    actor: "onboarding-replay-validator",
    reasonCode: "validation-reset",
    idempotencyKey: "validation-reset",
    revokedAt: now,
  });
  await unlink(path.join(directory, `${receipt.organizationId}.json`));
  assert.equal(await runtimeRepository.read(receipt.organizationId), null);
  assert.equal(accessRecord.status, "revoked");
  assert.deepEqual(access.lifecycleEvents, [
    `grant:${accessRecord.accessRecordId}`,
    `revoke:${accessRecord.accessRecordId}`,
  ]);

  console.log(JSON.stringify({
    validation: "local-onboarding-to-alpha-replay",
    result: "PASS",
    organizationId: receipt.organizationId,
    evidenceCount: firstResult.evidence.length,
    completedExplanationCount:
      evolved.memory.organizationalExplanations.length,
    canonicalCompositionCount: compositions.length,
    provenancePreserved: true,
    confidenceCalibrated: true,
    alphaExperienceAvailable: true,
    insufficientInputFailsHonestly: true,
    deterministicReplay: true,
    exactReset: true,
    atlasDataPresent: false,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
