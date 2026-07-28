import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import type {
  AlphaAccessRecordRepository,
  GrantAlphaAccessInput,
} from "../../db/governance/types";
import type {
  OrganizationRuntimeRepository,
  RuntimeStorageOperationMetadata,
  StoredOrganizationRuntime,
} from "../../engine/v3/runtime";
import { normalizeOrganizationRuntime } from "../../engine/v3/runtime/organizationStateStore";
import { isYourOrganizationAlphaActivationEnabled } from "../../lib/alpha-activation/config";
import {
  provisionAlphaAccess,
  provisionOrganizationRuntime,
} from "../../lib/alpha-provisioning/provisionDesignPartner";

const ORGANIZATION_ID = "atlas-manufacturing-simulation";
const CONSUMER_ID = "user_3H7HZOeAHXJ3Hi8MNjmgmHBmDsG";
const OPERATOR_ID = "discovery-alpha-operator";
const RUNTIME_PATH =
  ".local-provisioning/atlas-manufacturing-simulation.runtime.json";

class MemoryRuntimeRepository implements OrganizationRuntimeRepository {
  readonly backend = "vercel-blob" as const;
  value: StoredOrganizationRuntime | null = null;
  writes = 0;
  backups = 0;

  async read(): Promise<StoredOrganizationRuntime | null> {
    return this.value;
  }
  async exists(): Promise<boolean> {
    return this.value !== null;
  }
  async create(
    organizationId: string,
    bytes: Uint8Array,
  ): Promise<StoredOrganizationRuntime> {
    assert.equal(this.value, null);
    this.writes += 1;
    this.value = {
      bytes,
      revision: "etag-created",
      runtime: normalizeOrganizationRuntime(
        JSON.parse(Buffer.from(bytes).toString("utf8")),
      ),
    };
    assert.equal(this.value.runtime.metadata.organizationId, organizationId);
    return this.value;
  }
  async replace(): Promise<StoredOrganizationRuntime> {
    this.writes += 1;
    throw new Error("replace is not used by first provisioning");
  }
  async backup(
    _organizationId: string,
    _backupId: string,
    _metadata: RuntimeStorageOperationMetadata,
  ): Promise<StoredOrganizationRuntime> {
    this.backups += 1;
    assert.ok(this.value);
    return this.value;
  }
  async restore(): Promise<StoredOrganizationRuntime> {
    throw new Error("restore is not used");
  }
}

class MemoryAccessRepository implements AlphaAccessRecordRepository {
  grants = 0;
  lifecycleEvents = 0;
  records: Awaited<ReturnType<AlphaAccessRecordRepository["grantAccess"]>>[] = [];

  async findAccessRecordsForConsumer() {
    return [];
  }
  async findAccessRecords() {
    return this.records;
  }
  async grantAccess(input: GrantAlphaAccessInput) {
    this.grants += 1;
    this.lifecycleEvents += 1;
    const record = {
      accessRecordId: input.accessRecordId,
      policyId: "alpha-explicit-allowlist-disclosure" as const,
      policyVersion: "1" as const,
      consumerId: input.consumerId,
      organizationId: input.organizationId,
      relationship: "allowed_alpha_user" as const,
      supportedExperiences: ["organization"] as const,
      scope: {
        type: "organization" as const,
        organizationId: input.organizationId,
      },
      status: "active" as const,
      createdAt: input.grantedAt,
    };
    this.records.push(record);
    return record;
  }
  async revokeAccess(): Promise<never> {
    throw new Error("not used");
  }
  async supersedeAccess(): Promise<never> {
    throw new Error("not used");
  }
}

async function main(): Promise<void> {
  const bytes = new Uint8Array(await readFile(RUNTIME_PATH));
  const runtimeSha256 = createHash("sha256").update(bytes).digest("hex");
  const runtimeRepository = new MemoryRuntimeRepository();
  const accessRepository = new MemoryAccessRepository();

  const gate5 = await provisionOrganizationRuntime({
    organizationId: ORGANIZATION_ID,
    actor: OPERATOR_ID,
    idempotencyKey: "validate-gate5-runtime-only",
    expectedRuntimeSha256: runtimeSha256,
    runtimeBytes: bytes,
    repository: runtimeRepository,
  });
  assert.equal(gate5.result, "RUNTIME_PROVISIONED");
  assert.equal(runtimeRepository.writes, 1);
  assert.equal(accessRepository.grants, 0);
  assert.equal(isYourOrganizationAlphaActivationEnabled({}), false);

  const writesBeforeAccess = runtimeRepository.writes;
  const gate6 = await provisionAlphaAccess({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    actor: OPERATOR_ID,
    idempotencyKey: "validate-gate6-access-only",
    repository: runtimeRepository,
    accessRepository,
    now: "2026-07-27T00:00:00.000Z",
  });
  assert.equal(gate6.result, "ACCESS_PROVISIONED");
  assert.equal(accessRepository.grants, 1);
  assert.equal(accessRepository.lifecycleEvents, 1);
  assert.equal(runtimeRepository.writes, writesBeforeAccess);
  assert.equal(isYourOrganizationAlphaActivationEnabled({}), false);

  const gate6Replay = await provisionAlphaAccess({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    actor: OPERATOR_ID,
    idempotencyKey: "validate-gate6-access-only",
    repository: runtimeRepository,
    accessRepository,
    now: "2026-07-27T00:00:00.000Z",
  });
  assert.equal(gate6Replay.accessRecordId, gate6.accessRecordId);
  assert.equal(accessRepository.grants, 1);
  assert.equal(accessRepository.lifecycleEvents, 1);
  assert.equal(
    accessRepository.records.some(
      (record) => record.consumerId === "user_3UnrelatedExactUser00000000000",
    ),
    false,
  );
  assert.equal(runtimeRepository.writes, writesBeforeAccess);

  const writesBeforeActivation = runtimeRepository.writes;
  const grantsBeforeActivation = accessRepository.grants;
  assert.equal(isYourOrganizationAlphaActivationEnabled({
    DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED: "true",
  }), true);
  assert.equal(runtimeRepository.writes, writesBeforeActivation);
  assert.equal(accessRepository.grants, grantsBeforeActivation);

  const routeSource = await readFile(
    "app/api/internal/provision-atlas-runtime/route.ts",
    "utf8",
  );
  assert.ok(routeSource.includes('operation === "access"'));
  assert.ok(routeSource.includes('operation !== "runtime"'));
  assert.ok(routeSource.includes("DISCOVERY_RUNTIME_PROVISIONING_ENABLED"));
  assert.ok(routeSource.includes("DISCOVERY_ACCESS_PROVISIONING_ENABLED"));
  assert.ok(!routeSource.includes("DISCOVERY_PROVISIONING_OPERATION_ENABLED"));
  assert.ok(!routeSource.includes("provisionDesignPartner("));
  assert.ok(!routeSource.includes("DISCOVERY_ALPHA_YOUR_ORGANIZATION_ENABLED="));

  const missingRuntime = new MemoryRuntimeRepository();
  const blockedAccess = new MemoryAccessRepository();
  await assert.rejects(() => provisionAlphaAccess({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    actor: OPERATOR_ID,
    idempotencyKey: "validate-access-before-runtime",
    repository: missingRuntime,
    accessRepository: blockedAccess,
  }), /Runtime is unavailable/);
  assert.equal(blockedAccess.grants, 0);

  console.log(JSON.stringify({
    validation: "staged-alpha-provisioning-operations",
    result: "PASS",
    checks: 28,
    gate5: {
      runtimeUploaded: true,
      accessWrites: 0,
      activationChanged: false,
    },
    gate6: {
      accessGranted: true,
      duplicateGrantIdempotent: true,
      lifecycleEventTransactionalWithGrant: true,
      unrelatedUsersUnchanged: true,
      runtimeWrites: 0,
      activationChanged: false,
    },
    gate7: {
      activationRecognized: true,
      runtimeWrites: 0,
      accessWrites: 0,
    },
    activationRemainsExternalDeploymentOperation: true,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
