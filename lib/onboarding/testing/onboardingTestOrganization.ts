import { createHash } from "node:crypto";

import type { AlphaAccessRecordRepository } from "../../../db/governance/types";
import {
  createEmptyOrganizationRuntime,
  type OrganizationRuntimeRepository,
} from "../../../engine/v3/runtime";
import { validateOnboardingTestEnvironment } from "../../environment/discoveryEnvironment";

const TEST_ORGANIZATION_PREFIX = "onb-dev-";

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function exact(value: string, label: string): string {
  if (
    !value ||
    value === "*" ||
    value.trim() !== value ||
    value.includes("\0")
  ) {
    throw new Error(`Invalid ${label}.`);
  }
  return value;
}

export function onboardingTestOrganizationId(input: {
  consumerId: string;
  requestId: string;
}): string {
  exact(input.consumerId, "consumer id");
  exact(input.requestId, "request id");
  return `${TEST_ORGANIZATION_PREFIX}${digest(
    `${input.consumerId}:${input.requestId}`,
  ).slice(0, 24)}`;
}

export function isOnboardingTestOrganizationId(
  organizationId: string,
): boolean {
  return new RegExp(`^${TEST_ORGANIZATION_PREFIX}[a-f0-9]{24}$`).test(
    organizationId,
  );
}

export type OnboardingRouteState =
  | { status: "new-user" }
  | {
      status: "interrupted";
      organizationId: string;
    }
  | {
      status: "active";
      organizationId: string;
      destination: string;
    }
  | {
      status: "organization-selection-required";
      organizationIds: string[];
      destination: "/organizations";
    };

export async function resolveOnboardingRouteState(input: {
  consumerId: string;
  resolvedAt: string;
  accessRepository: Pick<
    AlphaAccessRecordRepository,
    "findAccessRecordsForConsumer"
  >;
  runtimeRepository: Pick<OrganizationRuntimeRepository, "read">;
}): Promise<OnboardingRouteState> {
  exact(input.consumerId, "consumer id");
  const records = await input.accessRepository.findAccessRecordsForConsumer({
    consumerId: input.consumerId,
    experience: "organization",
    resolvedAt: input.resolvedAt,
  });
  const activeOrganizationIds = [...new Set(records
    .filter((record) =>
      record.status === "active" &&
      (!record.validUntil ||
        Date.parse(record.validUntil) > Date.parse(input.resolvedAt))
    )
    .map((record) => record.organizationId))]
    .sort((left, right) => left.localeCompare(right, "en"));

  if (activeOrganizationIds.length === 0) {
    return { status: "new-user" };
  }
  if (activeOrganizationIds.length > 1) {
    return {
      status: "organization-selection-required",
      organizationIds: activeOrganizationIds,
      destination: "/organizations",
    };
  }

  const organizationId = activeOrganizationIds[0];
  const stored = await input.runtimeRepository.read(organizationId);
  if (!stored || stored.runtime.metadata.investigationCount === 0) {
    return {
      status: "interrupted",
      organizationId,
    };
  }
  return {
    status: "active",
    organizationId,
    destination: `/your-organization?organizationId=${encodeURIComponent(
      organizationId,
    )}`,
  };
}

export type OnboardingTestProvisioningReceipt = {
  environment: "development";
  organizationId: string;
  consumerId: string;
  runtime: {
    created: boolean;
    revision: string;
  };
  access: {
    created: boolean;
    accessRecordId: string;
  };
};

export async function provisionOnboardingTestOrganization(input: {
  environment?: Readonly<Record<string, string | undefined>>;
  consumerId: string;
  requestId: string;
  organizationName: string;
  industry?: string;
  website?: string;
  now: string;
  runtimeRepository: OrganizationRuntimeRepository;
  accessRepository: AlphaAccessRecordRepository;
}): Promise<OnboardingTestProvisioningReceipt> {
  const environment = validateOnboardingTestEnvironment(
    input.environment ?? process.env,
  );
  if (environment.environment !== "development") {
    throw new Error("Onboarding test provisioning requires development.");
  }
  const consumerId = exact(input.consumerId, "consumer id");
  const requestId = exact(input.requestId, "request id");
  const organizationName = exact(input.organizationName, "organization name");
  if (input.runtimeRepository.backend !== "filesystem") {
    throw new Error("Development onboarding requires filesystem Runtime storage.");
  }

  const organizationId = onboardingTestOrganizationId({
    consumerId,
    requestId,
  });
  const idempotencyKey = `onboarding-test:${digest(
    `${consumerId}:${requestId}`,
  )}`;

  let stored = await input.runtimeRepository.read(organizationId);
  let runtimeCreated = false;
  if (!stored) {
    const runtime = createEmptyOrganizationRuntime({
      organizationId,
      name: organizationName,
      ...(input.industry ? { industry: input.industry } : {}),
      ...(input.website ? { website: input.website } : {}),
    });
    stored = await input.runtimeRepository.create(
      organizationId,
      new TextEncoder().encode(`${JSON.stringify(runtime, null, 2)}\n`),
      {
        requestId: idempotencyKey,
        operatorId: `onboarding-test:${consumerId}`,
      },
    );
    runtimeCreated = true;
  }
  if (
    stored.runtime.metadata.organizationId !== organizationId ||
    stored.runtime.metadata.name !== organizationName
  ) {
    throw new Error("Existing test Runtime conflicts with the onboarding request.");
  }

  const existingAccess = await input.accessRepository.findAccessRecords({
    consumerId,
    organizationId,
    experience: "organization",
    resolvedAt: input.now,
  });
  const activeAccess = existingAccess.find((record) => record.status === "active");
  let accessRecordId = activeAccess?.accessRecordId;
  let accessCreated = false;
  if (!accessRecordId) {
    try {
      const access = await input.accessRepository.grantAccess({
        accessRecordId: `alpha-access:${digest(idempotencyKey)}`,
        consumerId,
        organizationId,
        experience: "organization",
        actor: `onboarding-test:${consumerId}`,
        reasonCode: "non-production-onboarding-test",
        idempotencyKey,
        grantedAt: input.now,
      });
      accessRecordId = access.accessRecordId;
      accessCreated = true;
    } catch (error) {
      if (runtimeCreated) {
        throw new Error(
          `Partial onboarding provisioning for ${organizationId}: Runtime created, access not created; retry the same request id.`,
          { cause: error },
        );
      }
      throw error;
    }
  }

  return {
    environment: "development",
    organizationId,
    consumerId,
    runtime: {
      created: runtimeCreated,
      revision: stored.revision,
    },
    access: {
      created: accessCreated,
      accessRecordId,
    },
  };
}
