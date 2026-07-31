import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";

import type { AlphaAccessRecordRepository } from "../../../db/governance/types";
import {
  createEmptyOrganizationRuntime,
  type OrganizationRuntimeRepository,
} from "../../../engine/v3/runtime";
import { validateOnboardingTestEnvironment } from "../../environment/discoveryEnvironment";
import { isOnboardingTestOrganizationId } from "./onboardingTestOrganization";

export type DevelopmentRuntimeRecoveryReason =
  | "missing-ephemeral-runtime"
  | "development-storage-reset";

export type DevelopmentRuntimeRecoveryRequest = {
  organizationId: string;
  authorizedUserId: string;
  organizationName: string;
  industry: string | null;
  website: string | null;
  reason: DevelopmentRuntimeRecoveryReason;
  requestId: string;
  operatorIdentity: string;
};

export type DevelopmentRuntimeRecoveryReceipt = {
  organizationId: string;
  status: "recovered" | "already-present";
  runtimeRevision: string;
  recoveryReason: DevelopmentRuntimeRecoveryReason;
  metadataSource: "operator-supplied";
  preservedAccess: true;
  preservedConnections: true;
  createdAt: string;
  limitation: string;
};

export type DevelopmentRuntimeRecoveryLineage = {
  requestId: string;
  organizationId: string;
  authorizedUserId: string;
  operatorIdentity: string;
  reason: DevelopmentRuntimeRecoveryReason;
  organizationName: string;
  industry: string | null;
  website: string | null;
  occurredAt: string;
  runtimeRevision: string;
  metadataSource: "operator-supplied";
};

export interface DevelopmentRuntimeRecoveryLineageRepository {
  read(requestId: string): Promise<DevelopmentRuntimeRecoveryLineage | null>;
  write(record: DevelopmentRuntimeRecoveryLineage): Promise<void>;
}

function exact(value: string, label: string): string {
  if (!value || value === "*" || value.trim() !== value || value.includes("\0")) {
    throw new Error(`Invalid ${label}.`);
  }
  return value;
}

function normalizeOptional(value: string | null, label: string): string | null {
  if (value === null) return null;
  return exact(value, label);
}

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right, "en"))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

function sameRecovery(
  record: DevelopmentRuntimeRecoveryLineage,
  request: DevelopmentRuntimeRecoveryRequest,
): boolean {
  return stable({
    requestId: record.requestId,
    organizationId: record.organizationId,
    authorizedUserId: record.authorizedUserId,
    operatorIdentity: record.operatorIdentity,
    reason: record.reason,
    organizationName: record.organizationName,
    industry: record.industry,
    website: record.website,
  }) === stable(request);
}

export class FileDevelopmentRuntimeRecoveryLineageRepository
implements DevelopmentRuntimeRecoveryLineageRepository {
  constructor(
    private readonly filePath = path.join(
      process.cwd(),
      ".discovery-runtime",
      "development-runtime-recovery",
      "lineage.json",
    ),
  ) {}

  private async records(): Promise<Record<string, DevelopmentRuntimeRecoveryLineage>> {
    try {
      return JSON.parse(await readFile(this.filePath, "utf8")) as Record<
        string,
        DevelopmentRuntimeRecoveryLineage
      >;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return {};
      throw error;
    }
  }

  async read(requestId: string): Promise<DevelopmentRuntimeRecoveryLineage | null> {
    return (await this.records())[createHash("sha256").update(requestId).digest("hex")] ?? null;
  }

  async write(record: DevelopmentRuntimeRecoveryLineage): Promise<void> {
    const records = await this.records();
    const key = createHash("sha256").update(record.requestId).digest("hex");
    const existing = records[key];
    if (existing && stable(existing) !== stable(record)) {
      throw new Error("Development Runtime recovery lineage conflicts.");
    }
    records[key] = record;
    await mkdir(path.dirname(this.filePath), { recursive: true, mode: 0o700 });
    const temporary = `${this.filePath}.${process.pid}.tmp`;
    await writeFile(temporary, JSON.stringify(records, null, 2), { mode: 0o600 });
    await rename(temporary, this.filePath);
  }
}

export async function recoverDevelopmentOrganizationRuntime(input: {
  request: DevelopmentRuntimeRecoveryRequest;
  environment?: Readonly<Record<string, string | undefined>>;
  runtimeRepository: OrganizationRuntimeRepository;
  accessRepository: Pick<AlphaAccessRecordRepository, "findAccessRecords">;
  lineageRepository: DevelopmentRuntimeRecoveryLineageRepository;
  now?: () => string;
}): Promise<DevelopmentRuntimeRecoveryReceipt> {
  const environment = validateOnboardingTestEnvironment(
    input.environment ?? process.env,
  );
  if (environment.environment !== "development") {
    throw new Error("Development Runtime recovery requires development.");
  }
  if (input.runtimeRepository.backend !== "filesystem") {
    throw new Error("Development Runtime recovery requires filesystem Runtime storage.");
  }

  const request: DevelopmentRuntimeRecoveryRequest = {
    organizationId: exact(input.request.organizationId, "organization id"),
    authorizedUserId: exact(input.request.authorizedUserId, "authorized user id"),
    organizationName: exact(input.request.organizationName, "organization name"),
    industry: normalizeOptional(input.request.industry, "industry"),
    website: normalizeOptional(input.request.website, "website"),
    reason: input.request.reason,
    requestId: exact(input.request.requestId, "recovery request id"),
    operatorIdentity: exact(input.request.operatorIdentity, "operator identity"),
  };
  if (!isOnboardingTestOrganizationId(request.organizationId)) {
    throw new Error("Development Runtime recovery requires an exact onb-dev organization.");
  }
  if (!/^user_[A-Za-z0-9]+$/.test(request.authorizedUserId)) {
    throw new Error("Development Runtime recovery requires an exact Clerk user id.");
  }
  if (
    request.reason !== "missing-ephemeral-runtime"
    && request.reason !== "development-storage-reset"
  ) {
    throw new Error("Invalid development Runtime recovery reason.");
  }

  const resolvedAt = (input.now ?? (() => new Date().toISOString()))();
  if (!Number.isFinite(Date.parse(resolvedAt))) {
    throw new Error("Invalid recovery timestamp.");
  }
  const accessBefore = await input.accessRepository.findAccessRecords({
    consumerId: request.authorizedUserId,
    organizationId: request.organizationId,
    experience: "organization",
    resolvedAt,
  });
  const active = accessBefore.filter(
    (record) =>
      record.status === "active"
      && record.relationship === "allowed_alpha_user"
      && (!record.validUntil || Date.parse(record.validUntil) > Date.parse(resolvedAt)),
  );
  if (active.length !== 1) {
    throw new Error("Exact active development organization access is required.");
  }

  const existingLineage = await input.lineageRepository.read(request.requestId);
  const existingRuntime = await input.runtimeRepository.read(request.organizationId);
  if (existingRuntime) {
    if (
      !existingLineage
      || !sameRecovery(existingLineage, request)
      || existingLineage.runtimeRevision !== existingRuntime.revision
      || existingRuntime.runtime.metadata.name !== request.organizationName
      || (existingRuntime.runtime.metadata.industry ?? null) !== request.industry
      || (existingRuntime.runtime.metadata.website ?? null) !== request.website
    ) {
      throw new Error("Existing Runtime conflicts with the recovery request.");
    }
    return {
      organizationId: request.organizationId,
      status: "already-present",
      runtimeRevision: existingRuntime.revision,
      recoveryReason: request.reason,
      metadataSource: "operator-supplied",
      preservedAccess: true,
      preservedConnections: true,
      createdAt: existingLineage.occurredAt,
      limitation:
        "Organization identity was recovered; historical organizational state was not restored.",
    };
  }
  if (existingLineage) {
    throw new Error("Recovery lineage exists but the Runtime is missing.");
  }

  const runtime = createEmptyOrganizationRuntime({
    organizationId: request.organizationId,
    name: request.organizationName,
    ...(request.industry ? { industry: request.industry } : {}),
    ...(request.website ? { website: request.website } : {}),
  });
  const stored = await input.runtimeRepository.create(
    request.organizationId,
    new TextEncoder().encode(`${JSON.stringify(runtime, null, 2)}\n`),
    {
      requestId: `development-runtime-recovery:${createHash("sha256")
        .update(request.requestId)
        .digest("hex")}`,
      operatorId: request.operatorIdentity,
    },
  );
  await input.lineageRepository.write({
    ...request,
    occurredAt: stored.runtime.metadata.createdAt,
    runtimeRevision: stored.revision,
    metadataSource: "operator-supplied",
  });

  const verified = await input.runtimeRepository.read(request.organizationId);
  if (
    !verified
    || verified.revision !== stored.revision
    || verified.runtime.metadata.organizationId !== request.organizationId
    || verified.runtime.metadata.investigationCount !== 0
  ) {
    throw new Error("Recovered Runtime failed repository reload validation.");
  }
  const accessAfter = await input.accessRepository.findAccessRecords({
    consumerId: request.authorizedUserId,
    organizationId: request.organizationId,
    experience: "organization",
    resolvedAt,
  });
  if (stable(accessBefore) !== stable(accessAfter)) {
    throw new Error("Development Runtime recovery changed organization access.");
  }

  return {
    organizationId: request.organizationId,
    status: "recovered",
    runtimeRevision: stored.revision,
    recoveryReason: request.reason,
    metadataSource: "operator-supplied",
    preservedAccess: true,
    preservedConnections: true,
    createdAt: stored.runtime.metadata.createdAt,
    limitation:
      "Organization identity was recovered; historical organizational state was not restored.",
  };
}
