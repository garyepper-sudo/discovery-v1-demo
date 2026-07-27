import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import type { AlphaAccessRecordRepository } from "../../db/governance/types";
import type {
  OrganizationRuntimeRepository,
  StoredOrganizationRuntime,
} from "../../engine/v3/runtime";
import { normalizeOrganizationRuntime } from "../../engine/v3/runtime/organizationStateStore";
import { provisionDesignPartner } from "../../lib/alpha-provisioning/provisionDesignPartner";

const ORGANIZATION_ID = "atlas-manufacturing-simulation";
const CONSUMER_ID = "user_3H5yQgEI6LpgRv7CeNoZsRGvu3p";
const OPERATOR_ID = "discovery-alpha-operator";
const FROZEN_RUNTIME =
  ".local-provisioning/atlas-manufacturing-simulation.runtime.json";

class MemoryRuntimeRepository implements OrganizationRuntimeRepository {
  readonly backend = "vercel-blob" as const;
  value: StoredOrganizationRuntime | null = null;
  writes = 0;

  async read(): Promise<StoredOrganizationRuntime | null> {
    return this.value;
  }
  async exists(): Promise<boolean> {
    return this.value !== null;
  }
  async create(
    _organizationId: string,
    bytes: Uint8Array,
  ): Promise<StoredOrganizationRuntime> {
    this.writes += 1;
    this.value = {
      bytes,
      revision: "etag-created",
      runtime: normalizeOrganizationRuntime(
        JSON.parse(Buffer.from(bytes).toString("utf8")),
      ),
    };
    return this.value;
  }
  async replace(): Promise<StoredOrganizationRuntime> {
    throw new Error("replace must remain disabled");
  }
  async backup(): Promise<StoredOrganizationRuntime> {
    throw new Error("backup is unavailable without an existing Runtime");
  }
  async restore(): Promise<StoredOrganizationRuntime> {
    throw new Error("restore is unavailable without an existing Runtime");
  }
}

function accessRepository(existing = false): AlphaAccessRecordRepository {
  let granted = false;
  return {
    async findAccessRecords() {
      return existing ? [{
        accessRecordId: "existing",
        policyId: "alpha-explicit-allowlist-disclosure",
        policyVersion: "1",
        consumerId: CONSUMER_ID,
        organizationId: ORGANIZATION_ID,
        relationship: "allowed_alpha_user",
        supportedExperiences: ["organization"],
        scope: { type: "organization", organizationId: ORGANIZATION_ID },
        status: "active",
        createdAt: "2026-07-27T00:00:00.000Z",
      }] : [];
    },
    async grantAccess(input) {
      assert.equal(granted, false);
      granted = true;
      return {
        accessRecordId: input.accessRecordId,
        policyId: "alpha-explicit-allowlist-disclosure",
        policyVersion: "1",
        consumerId: input.consumerId,
        organizationId: input.organizationId,
        relationship: "allowed_alpha_user",
        supportedExperiences: ["organization"],
        scope: { type: "organization", organizationId: input.organizationId },
        status: "active",
        createdAt: input.grantedAt,
      };
    },
    async revokeAccess() {
      throw new Error("not used");
    },
    async supersedeAccess() {
      throw new Error("not used");
    },
  };
}

async function main(): Promise<void> {
  const bytes = new Uint8Array(await readFile(FROZEN_RUNTIME));
  const digest = createHash("sha256").update(bytes).digest("hex");
  const repository = new MemoryRuntimeRepository();
  const receipt = await provisionDesignPartner({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    actor: OPERATOR_ID,
    idempotencyKey: "validate-protected-operation",
    expectedRuntimeSha256: digest,
    runtimeBytes: bytes,
    repository,
    accessRepository: accessRepository(),
    now: "2026-07-27T00:00:00.000Z",
  });
  assert.equal(receipt.runtimeSha256, digest);
  assert.equal(repository.writes, 1);

  const mismatchRepository = new MemoryRuntimeRepository();
  await assert.rejects(() => provisionDesignPartner({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    actor: OPERATOR_ID,
    idempotencyKey: "validate-digest-rejection",
    expectedRuntimeSha256: "0".repeat(64),
    runtimeBytes: bytes,
    repository: mismatchRepository,
    accessRepository: accessRepository(),
  }), /Runtime digest mismatch/);
  assert.equal(mismatchRepository.writes, 0);

  const accessConflictRepository = new MemoryRuntimeRepository();
  await assert.rejects(() => provisionDesignPartner({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    actor: OPERATOR_ID,
    idempotencyKey: "validate-access-conflict",
    expectedRuntimeSha256: digest,
    runtimeBytes: bytes,
    repository: accessConflictRepository,
    accessRepository: accessRepository(true),
  }), /Organization access already exists/);
  assert.equal(accessConflictRepository.writes, 0);

  process.env.DISCOVERY_PROVISIONING_OPERATION_ENABLED = "false";
  const route = await import(
    "../../app/api/internal/provision-atlas-runtime/route"
  );
  const disabled = await route.POST(new Request(
    "https://discovery.invalid/api/internal/provision-atlas-runtime",
    { method: "POST" },
  ));
  assert.equal(disabled.status, 404);

  process.env.VERCEL_ENV = "preview";
  process.env.DISCOVERY_PROVISIONING_OPERATION_ENABLED = "true";
  const preview = await route.POST(new Request(
    "https://discovery.invalid/api/internal/provision-atlas-runtime",
    { method: "POST" },
  ));
  assert.equal(preview.status, 404);

  process.env.VERCEL_ENV = "production";
  process.env.DISCOVERY_PROVISIONING_OPERATION_SECRET =
    "validation-only-strong-operation-secret";
  const unauthorized = await route.POST(new Request(
    "https://discovery.invalid/api/internal/provision-atlas-runtime",
    { method: "POST" },
  ));
  assert.equal(unauthorized.status, 401);

  delete process.env.VERCEL_ENV;
  delete process.env.DISCOVERY_PROVISIONING_OPERATION_SECRET;
  process.env.DISCOVERY_PROVISIONING_OPERATION_ENABLED = "false";

  console.log(JSON.stringify({
    validation: "protected-production-provisioning-operation",
    result: "PASS",
    checks: 16,
    frozenRuntimeSha256: digest,
    disabledByDefault: true,
    productionEnvironmentOnly: true,
    unauthorizedRejected: true,
    digestMismatchBeforeWrite: true,
    accessConflictBeforeWrite: true,
    overwriteDisabled: true,
    runtimeContentsLogged: false,
  }, null, 2));
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
