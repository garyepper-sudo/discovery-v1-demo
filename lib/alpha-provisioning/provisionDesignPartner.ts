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

export type ProvisionOrganizationRuntimeInput = {
  organizationId: string;
  actor: string;
  idempotencyKey: string;
  expectedRuntimeSha256: string;
  runtimeBytes: Uint8Array;
  repository: OrganizationRuntimeRepository;
  allowOverwrite?: boolean;
};

export type ProvisionOrganizationRuntimeReceipt = {
  result: "RUNTIME_PROVISIONED";
  organizationId: string;
  runtimeBackend: "filesystem" | "vercel-blob";
  runtimeSha256: string;
  runtimeRevision: string;
  backupId?: string;
};

export type ProvisionAlphaAccessInput = {
  organizationId: string;
  consumerId: string;
  actor: string;
  idempotencyKey: string;
  repository: OrganizationRuntimeRepository;
  accessRepository: AlphaAccessRecordRepository;
  now?: string;
};

export type ProvisionAlphaAccessReceipt = {
  result: "ACCESS_PROVISIONED";
  organizationId: string;
  consumerId: string;
  accessRecordId: string;
};

function exact(value: string, label: string): void {
  assert.ok(value && value !== "*" && value.trim() === value, `Invalid ${label}`);
}

function validateRuntime(input: ProvisionOrganizationRuntimeInput): {
  runtime: OrganizationRuntime;
  runtimeSha256: string;
} {
  exact(input.organizationId, "organization id");
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
  return { runtime, runtimeSha256 };
}

export async function provisionOrganizationRuntime(
  input: ProvisionOrganizationRuntimeInput,
): Promise<ProvisionOrganizationRuntimeReceipt> {
  exact(input.organizationId, "organization id");
  exact(input.actor, "operator id");
  exact(input.idempotencyKey, "idempotency key");
  assert.match(input.organizationId, /^[a-zA-Z0-9_-]+$/);
  const { runtimeSha256 } = validateRuntime(input);

  const requestId = createHash("sha256")
    .update(input.idempotencyKey)
    .digest("hex");
  const metadata = { requestId, operatorId: input.actor };
  const existingRuntime = await input.repository.read(input.organizationId);
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
  assert.equal(
    Buffer.compare(Buffer.from(verified.bytes), Buffer.from(input.runtimeBytes)),
    0,
    "Uploaded Runtime bytes changed",
  );

  return {
    result: "RUNTIME_PROVISIONED",
    organizationId: input.organizationId,
    runtimeBackend: input.repository.backend,
    runtimeSha256,
    runtimeRevision: stored.revision,
    backupId,
  };
}

export async function provisionAlphaAccess(
  input: ProvisionAlphaAccessInput,
): Promise<ProvisionAlphaAccessReceipt> {
  exact(input.organizationId, "organization id");
  exact(input.consumerId, "consumer id");
  exact(input.actor, "operator id");
  exact(input.idempotencyKey, "idempotency key");
  assert.match(input.organizationId, /^[a-zA-Z0-9_-]+$/);
  const resolvedAt = input.now ?? new Date().toISOString();
  const requestId = createHash("sha256")
    .update(input.idempotencyKey)
    .digest("hex");
  const accessRecordId = `alpha-access:${requestId}`;
  assert.ok(
    await input.repository.exists(input.organizationId),
    "Organization Runtime is unavailable",
  );
  const existingAccess = await input.accessRepository.findAccessRecords({
    consumerId: input.consumerId,
    organizationId: input.organizationId,
    experience: "organization",
    resolvedAt,
  });
  if (existingAccess.length > 0) {
    if (
      existingAccess.length === 1 &&
      existingAccess[0].accessRecordId === accessRecordId
    ) {
      return {
        result: "ACCESS_PROVISIONED",
        organizationId: input.organizationId,
        consumerId: input.consumerId,
        accessRecordId,
      };
    }
    throw new Error("Organization access already exists");
  }
  const access = await input.accessRepository.grantAccess({
    accessRecordId,
    consumerId: input.consumerId,
    organizationId: input.organizationId,
    experience: "organization",
    actor: input.actor,
    reasonCode: "first-design-partner-provisioning",
    idempotencyKey: input.idempotencyKey,
    grantedAt: resolvedAt,
  });
  return {
    result: "ACCESS_PROVISIONED",
    organizationId: input.organizationId,
    consumerId: input.consumerId,
    accessRecordId: access.accessRecordId,
  };
}

export async function provisionDesignPartner(
  input: ProvisionDesignPartnerInput,
): Promise<ProvisionDesignPartnerReceipt> {
  const resolvedAt = input.now ?? new Date().toISOString();
  const existingAccess = await input.accessRepository.findAccessRecords({
    consumerId: input.consumerId,
    organizationId: input.organizationId,
    experience: "organization",
    resolvedAt,
  });
  if (existingAccess.length > 0) {
    throw new Error("Organization access already exists");
  }
  const runtime = await provisionOrganizationRuntime(input);
  try {
    const access = await provisionAlphaAccess({
      organizationId: input.organizationId,
      consumerId: input.consumerId,
      actor: input.actor,
      idempotencyKey: input.idempotencyKey,
      repository: input.repository,
      accessRepository: input.accessRepository,
      now: resolvedAt,
    });
    return {
      result: "PROVISIONED",
      organizationId: input.organizationId,
      consumerId: input.consumerId,
      runtimeBackend: runtime.runtimeBackend,
      runtimeSha256: runtime.runtimeSha256,
      runtimeRevision: runtime.runtimeRevision,
      accessRecordId: access.accessRecordId,
      backupId: runtime.backupId,
    };
  } catch (error) {
    if (runtime.backupId) {
      const requestId = createHash("sha256")
        .update(input.idempotencyKey)
        .digest("hex");
      await input.repository.restore(
        input.organizationId,
        runtime.backupId,
        runtime.runtimeRevision,
        { requestId, operatorId: input.actor },
      );
    }
    throw error;
  }
}
