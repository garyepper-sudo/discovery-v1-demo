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
  writeAlphaOperationalLog({
    event: "alpha.request.started",
    requestId,
    ...(typeof requestedOrganizationId === "string"
      ? { organizationId: requestedOrganizationId }
      : {}),
    outcome: "started",
  });

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
    writeAlphaOperationalLog({
      event: "alpha.database.failed",
      requestId,
      ...(requestedOrganizationId
        ? { organizationId: requestedOrganizationId }
        : {}),
      outcome: "failed",
      reason: "database-configuration-unavailable",
    });
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
      writeAlphaOperationalLog({
        event: "alpha.access.denied",
        requestId,
        outcome: "denied",
        reason: organizationResolution.reason,
      });
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
      writeAlphaOperationalLog({
        event:
          durable.reason === "runtime-unavailable"
            ? "alpha.runtime.failed"
            : durable.reason === "audit-unavailable"
              ? "alpha.audit.failed"
              : "alpha.access.denied",
        requestId,
        organizationId,
        outcome: durable.reason === "access-denied" ? "denied" : "failed",
        reason: durable.reason,
      });
      return {
        status:
          durable.reason === "access-denied"
            ? "access-denied"
            : "runtime-unavailable",
        reason: durable.reason,
      };
    }
    if (!runtime) {
      writeAlphaOperationalLog({
        event: "alpha.runtime.failed",
        requestId,
        organizationId,
        outcome: "failed",
        reason: "authorized-runtime-not-loaded",
      });
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
      writeAlphaOperationalLog({
        event: "alpha.disclosure.completed",
        requestId,
        organizationId,
        outcome: "allowed",
      });
    }
    return composed;
  } finally {
    await sql.end();
  }
}
