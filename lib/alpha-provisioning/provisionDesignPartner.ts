import assert from "node:assert/strict";
import { createHash } from "node:crypto";

import type { AlphaAccessRecordRepository } from "../../db/governance/types";
import {
  type OrganizationRuntime,
  type OrganizationRuntimeRepository,
} from "../../engine/v3/runtime";
import { normalizeOrganizationRuntime } from "../../engine/v3/runtime/organizationStateStore";

export type ProvisionDesignPartnerInput = {
  organizationId: string;
  consumerId: string;
  actor: string;
  idempotencyKey: string;
  expectedRuntimeSha256: string;
  runtimeBytes: Uint8Array;
  repository: OrganizationRuntimeRepository;
  accessRepository: AlphaAccessRecordRepository;
  allowOverwrite?: boolean;
  now?: string;
};

export type ProvisionDesignPartnerReceipt = {
  result: "PROVISIONED";
  organizationId: string;
  consumerId: string;
  runtimeBackend: "filesystem" | "vercel-blob";
  runtimeSha256: string;
  runtimeRevision: string;
  accessRecordId: string;
  backupId?: string;
};

function exact(value: string, label: string): void {
  assert.ok(value && value !== "*" && value.trim() === value, `Invalid ${label}`);
}

export async function provisionDesignPartner(
  input: ProvisionDesignPartnerInput,
): Promise<ProvisionDesignPartnerReceipt> {
  exact(input.organizationId, "organization id");
  exact(input.consumerId, "consumer id");
  exact(input.actor, "operator id");
  exact(input.idempotencyKey, "idempotency key");
  assert.match(input.organizationId, /^[a-zA-Z0-9_-]+$/);
  assert.match(input.expectedRuntimeSha256, /^[a-f0-9]{64}$/);

  const runtimeSha256 = createHash("sha256")
    .update(input.runtimeBytes)
    .digest("hex");
  assert.equal(
    runtimeSha256,
    input.expectedRuntimeSha256,
    "Runtime digest mismatch",
  );
  const runtime = normalizeOrganizationRuntime(
    JSON.parse(Buffer.from(input.runtimeBytes).toString("utf8")) as OrganizationRuntime,
  );
  assert.equal(
    runtime.metadata.organizationId,
    input.organizationId,
    "Runtime organization mismatch",
  );
  assert.ok(
    runtime.metadata.investigationCount > 0,
    "Runtime has no completed investigation",
  );
  assert.ok(
    (runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? [])
      .length > 0,
    "Runtime has no canonical Organizational Understanding composition",
  );
  assert.ok(
    (runtime.memory.organizationalExplanations ?? []).length > 0,
    "Runtime has no completed Organizational Explanation",
  );

  const resolvedAt = input.now ?? new Date().toISOString();
  const [existingRuntime, existingAccess] = await Promise.all([
    input.repository.read(input.organizationId),
    input.accessRepository.findAccessRecords({
      consumerId: input.consumerId,
      organizationId: input.organizationId,
      experience: "organization",
      resolvedAt,
    }),
  ]);
  if (existingAccess.length > 0) {
    throw new Error("Organization access already exists");
  }

  const requestId = createHash("sha256")
    .update(input.idempotencyKey)
    .digest("hex");
  const metadata = { requestId, operatorId: input.actor };
  let backupId: string | undefined;
  let stored;
  if (existingRuntime) {
    if (!input.allowOverwrite) {
      throw new Error("Runtime already exists; overwrite is disabled");
    }
    backupId = `pre-provision-${requestId.slice(0, 24)}`;
    await input.repository.backup(input.organizationId, backupId, metadata);
    stored = await input.repository.replace(
      input.organizationId,
      input.runtimeBytes,
      existingRuntime.revision,
      metadata,
    );
  } else {
    stored = await input.repository.create(
      input.organizationId,
      input.runtimeBytes,
      metadata,
    );
  }

  const verified = await input.repository.read(input.organizationId);
  assert.ok(verified, "Uploaded Runtime is unavailable");
  assert.equal(verified.runtime.metadata.organizationId, input.organizationId);
  assert.equal(
    createHash("sha256").update(verified.bytes).digest("hex"),
    runtimeSha256,
    "Uploaded Runtime bytes changed",
  );

  try {
    const access = await input.accessRepository.grantAccess({
      accessRecordId: `alpha-access:${requestId}`,
      consumerId: input.consumerId,
      organizationId: input.organizationId,
      experience: "organization",
      actor: input.actor,
      reasonCode: "first-design-partner-provisioning",
      idempotencyKey: input.idempotencyKey,
      grantedAt: resolvedAt,
    });
    return {
      result: "PROVISIONED",
      organizationId: input.organizationId,
      consumerId: input.consumerId,
      runtimeBackend: input.repository.backend,
      runtimeSha256,
      runtimeRevision: stored.revision,
      accessRecordId: access.accessRecordId,
      backupId,
    };
  } catch (error) {
    if (backupId) {
      await input.repository.restore(
        input.organizationId,
        backupId,
        verified.revision,
        metadata,
      );
    }
    throw error;
  }
}
