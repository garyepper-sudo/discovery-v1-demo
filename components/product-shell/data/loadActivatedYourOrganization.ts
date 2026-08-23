import "server-only";

import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../../db/config";
import { runDurableAlphaDisclosureTransaction } from "../../../db/governance/disclosureTransactionShadow";
import {
  buildAlphaCanonicalAuthorityReceipt,
} from "../../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import {
  createOrganizationRuntimeRepository,
  type OrganizationRuntime,
} from "../../../engine/v3/runtime";
import { PostgresAlphaAccessRecordRepository } from "../../../db/governance/postgresRepositories";
import { resolveAuthorizedOrganization } from "../../../lib/alpha-activation/resolveAuthorizedOrganization";
import { resolveVerifiedConsumerIdentityFromClerk } from "../../../lib/auth/resolveVerifiedConsumerIdentityFromClerk";
import { writeAlphaOperationalLog } from "../../../lib/operations/alphaOperationalLog";
import {
  composeActivatedYourOrganization,
  type ActivatedYourOrganizationState,
} from "./composeActivatedYourOrganization";

export async function loadActivatedYourOrganization(
  requestedOrganizationId: string | string[] | undefined,
  requestId = crypto.randomUUID(),
): Promise<ActivatedYourOrganizationState> {
  void requestId;
  writeAlphaOperationalLog({eventCategory:"access-check",workflowStage:"activate",transitionCategory:"attempted",outcomeCategory:"attempted",failureCategory:"none"});

  const resolvedAt = new Date().toISOString();
  const identityResolution =
    await resolveVerifiedConsumerIdentityFromClerk(resolvedAt);
  if (identityResolution.status !== "verified") {
    return {
      status: "authentication-required",
      reason: identityResolution.reason,
    };
  }

  if (Array.isArray(requestedOrganizationId)) {
    return {
      status: "organization-required",
      reason: "invalid-organization-id",
    };
  }

  let sql;
  try {
    sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  } catch {
    writeAlphaOperationalLog({eventCategory:"health",workflowStage:"activate",transitionCategory:"completed",outcomeCategory:"server-failure",failureCategory:"server"});
    return {
      status: "activation-unavailable",
      reason: "alpha-storage-configuration-unavailable",
    };
  }

  let runtime: OrganizationRuntime | undefined;
  try {
    const organizationResolution = await resolveAuthorizedOrganization({
      identity: identityResolution.identity,
      ...(requestedOrganizationId ? { requestedOrganizationId } : {}),
      ...(process.env.DISCOVERY_ALPHA_ORGANIZATION_ID
        ? {
            configuredOrganizationId:
              process.env.DISCOVERY_ALPHA_ORGANIZATION_ID,
          }
        : {}),
      resolvedAt,
      accessRepository: new PostgresAlphaAccessRecordRepository(sql),
    });
    if (organizationResolution.status !== "resolved") {
      writeAlphaOperationalLog({eventCategory:"access-check",workflowStage:"activate",transitionCategory:"completed",outcomeCategory:"access-unavailable",failureCategory:"access"});
      return {
        status: "organization-required",
        reason: organizationResolution.reason,
      };
    }
    const organizationId = organizationResolution.organizationId;

    const durable = await runDurableAlphaDisclosureTransaction({
      sql,
      identity: identityResolution.identity,
      organizationId,
      experience: "organization",
      resolvedAt,
      runtimeLoader: {
        async load({ organizationId: authorizedOrganizationId }) {
          const stored = await createOrganizationRuntimeRepository().read(
            authorizedOrganizationId,
          );
          if (!stored) throw new Error("Runtime unavailable");
          const loaded = stored.runtime;
          const compositions =
            loaded.memory.organizationalUnderstandingState
              .canonicalCompositions ?? [];
          if (
            loaded.metadata.organizationId !== authorizedOrganizationId ||
            loaded.metadata.investigationCount < 1 ||
            compositions.length === 0
          ) {
            throw new Error("Runtime unavailable");
          }
          runtime = loaded;
          return {
            organizationId: loaded.metadata.organizationId,
            compositions,
            authorityReceipts: compositions.flatMap((composition) => {
              const receipt =
                buildAlphaCanonicalAuthorityReceipt(composition);
              return receipt ? [receipt] : [];
            }),
          };
        },
      },
    });
    if (durable.status !== "committed") {
      writeAlphaOperationalLog({eventCategory:"access-check",workflowStage:"activate",transitionCategory:"completed",outcomeCategory:durable.reason==="access-denied"?"access-unavailable":"server-failure",failureCategory:durable.reason==="access-denied"?"access":"server"});
      return {
        status:
          durable.reason === "access-denied"
            ? "access-denied"
            : "runtime-unavailable",
        reason: durable.reason,
      };
    }
    if (!runtime) {
      writeAlphaOperationalLog({eventCategory:"health",workflowStage:"runtime",transitionCategory:"completed",outcomeCategory:"server-failure",failureCategory:"server"});
      return {
        status: "runtime-unavailable",
        reason: "authorized-runtime-not-loaded",
      };
    }
    const composed = composeActivatedYourOrganization({
      runtime,
      identity: identityResolution.identity,
      resolution: durable.resolution,
      resolvedAt,
    });
    if (composed.status === "available") {
      writeAlphaOperationalLog({eventCategory:"access-check",workflowStage:"activate",transitionCategory:"completed",outcomeCategory:"success",failureCategory:"none"});
    }
    return composed;
  } finally {
    await sql.end();
  }
}
