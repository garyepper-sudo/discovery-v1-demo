import { createHash } from "node:crypto";

import {
  ORGANIZATION_ONBOARDING_VERSION,
  organizationOnboardingStages,
  type OrganizationOnboardingReceipt,
  type OrganizationOnboardingRequest,
  type OrganizationOnboardingStage,
} from "./types";

function receiptId(organizationId: string): string {
  const digest = createHash("sha256")
    .update(`${ORGANIZATION_ONBOARDING_VERSION}:${organizationId}`)
    .digest("hex");
  return `organization-onboarding:${digest}`;
}

function requestedConsumerIds(request: OrganizationOnboardingRequest): string[] {
  return [...new Set(request.initialConsumerIds)].sort((left, right) =>
    left.localeCompare(right, "en")
  );
}

function requestFingerprint(request: OrganizationOnboardingRequest): string {
  return createHash("sha256").update(JSON.stringify({
    organizationId: request.organizationId,
    organizationName: request.organizationName,
    runtimeDigest: request.runtime.digest,
    consumerIds: requestedConsumerIds(request),
  })).digest("hex");
}

export function createOnboardingReceipt(
  request: OrganizationOnboardingRequest,
  now: string,
): OrganizationOnboardingReceipt {
  return {
    receiptVersion: ORGANIZATION_ONBOARDING_VERSION,
    receiptId: receiptId(request.organizationId),
    requestFingerprint: requestFingerprint(request),
    organizationId: request.organizationId,
    organizationName: request.organizationName,
    requestedRuntimeDigest: request.runtime.digest,
    requestedConsumerIds: requestedConsumerIds(request),
    lifecycleState: "Created",
    currentStage: "Created",
    createdAt: now,
    updatedAt: now,
    stages: organizationOnboardingStages.map((stage) => ({
      stage,
      status: "Pending",
      attempts: 0,
      explanation: "Stage has not run.",
      validationResults: [],
      warnings: [],
    })),
    assignedUsers: [],
    health: { status: "Pending", checks: {} },
    smokeTest: { status: "Pending", checks: [] },
    warnings: [],
    retry: { allowed: true, fromStage: "Created" },
  };
}

export function assertCompatibleReceipt(
  request: OrganizationOnboardingRequest,
  receipt: OrganizationOnboardingReceipt,
): void {
  if (
    receipt.receiptVersion !== ORGANIZATION_ONBOARDING_VERSION ||
    receipt.receiptId !== receiptId(request.organizationId) ||
    receipt.requestFingerprint !== requestFingerprint(request) ||
    receipt.organizationId !== request.organizationId ||
    receipt.organizationName !== request.organizationName ||
    receipt.requestedRuntimeDigest !== request.runtime.digest ||
    receipt.requestedConsumerIds.join("\0") !==
      requestedConsumerIds(request).join("\0")
  ) {
    throw new Error("Previous onboarding receipt does not match the request.");
  }
  const receiptStages = receipt.stages.map(({ stage }) => stage);
  if (
    receiptStages.length !== organizationOnboardingStages.length ||
    receiptStages.some((stage, index) => stage !== organizationOnboardingStages[index])
  ) {
    throw new Error("Previous onboarding receipt has an invalid stage sequence.");
  }
}

export function stageReceipt(
  receipt: OrganizationOnboardingReceipt,
  stage: OrganizationOnboardingStage,
) {
  const result = receipt.stages.find((candidate) => candidate.stage === stage);
  if (!result) throw new Error(`Missing onboarding stage receipt: ${stage}`);
  return result;
}
