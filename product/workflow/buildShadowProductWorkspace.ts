import { createHash } from "node:crypto";

import type { AlphaAccessRecordRepository } from "../../db/governance/types";
import type { OrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import type { VerifiedConsumerIdentity } from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { resolveAuthorizedOrganization } from "../../lib/alpha-activation/resolveAuthorizedOrganization";
import { validateOnboardingTestEnvironment } from "../../lib/environment/discoveryEnvironment";
import { isOnboardingTestOrganizationId } from "../../lib/onboarding/testing";
import type { ProductQuestionWorkspace } from "./contracts";
import { buildProductQuestionWorkspace } from "./buildProductQuestionWorkspace";
import { renderProductQuestionWorkspace } from "./renderProductQuestionWorkspace";

export type ShadowProductWorkspace = {
  workspace: ProductQuestionWorkspace;
  markdown: string;
  runtimeRevision: string;
  runtimeDigest: string;
  limitations: string[];
};

export async function buildShadowProductWorkspace(input: {
  environment?: Readonly<Record<string, string | undefined>>;
  identity: VerifiedConsumerIdentity;
  organizationId: string;
  question?: string;
  resolvedAt: string;
  accessRepository: Pick<AlphaAccessRecordRepository, "findAccessRecordsForConsumer">;
  runtimeRepository: Pick<OrganizationRuntimeRepository, "backend" | "read">;
}): Promise<ShadowProductWorkspace> {
  const configuration = validateOnboardingTestEnvironment(input.environment ?? process.env);
  if (
    configuration.environment !== "development"
    || configuration.runtimeStorage !== "filesystem"
    || input.runtimeRepository.backend !== "filesystem"
    || !isOnboardingTestOrganizationId(input.organizationId)
  ) {
    throw new Error("Shadow Product Workspace is limited to an isolated local onboarding organization.");
  }
  const authorization = await resolveAuthorizedOrganization({
    identity: input.identity,
    requestedOrganizationId: input.organizationId,
    resolvedAt: input.resolvedAt,
    accessRepository: input.accessRepository,
  });
  if (
    authorization.status !== "resolved"
    || authorization.organizationId !== input.organizationId
  ) {
    throw new Error("The exact local organization is not authorized for this user.");
  }
  const stored = await input.runtimeRepository.read(input.organizationId);
  if (!stored) throw new Error("The authorized local Runtime does not exist.");
  const before = createHash("sha256").update(stored.bytes).digest("hex");
  const workspace = buildProductQuestionWorkspace({
    runtime: stored.runtime,
    ...(input.question ? { question: input.question } : {}),
  });
  const after = createHash("sha256").update(stored.bytes).digest("hex");
  if (before !== after) throw new Error("Read-only shadow projection changed Runtime bytes.");
  return {
    workspace,
    markdown: renderProductQuestionWorkspace(workspace),
    runtimeRevision: stored.revision,
    runtimeDigest: before,
    limitations: [
      "Read-only local diagnostic.",
      "Connected organizational records are not searched.",
    ],
  };
}
