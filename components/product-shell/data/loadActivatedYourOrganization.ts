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
import { resolveVerifiedConsumerIdentityFromClerk } from "../../../lib/auth/resolveVerifiedConsumerIdentityFromClerk";
import { writeAlphaOperationalLog } from "../../../lib/operations/alphaOperationalLog";
import {
  composeActivatedYourOrganization,
  type ActivatedYourOrganizationState,
} from "./composeActivatedYourOrganization";

const VALID_ORGANIZATION_ID = /^[a-zA-Z0-9_-]+$/;

export async function loadActivatedYourOrganization(
  organizationId: string | string[] | undefined,
  requestId = crypto.randomUUID(),
): Promise<ActivatedYourOrganizationState> {
  writeAlphaOperationalLog({
    event: "alpha.request.started",
    requestId,
    ...(typeof organizationId === "string" ? { organizationId } : {}),
    outcome: "started",
  });
  if (
    typeof organizationId !== "string" ||
    !VALID_ORGANIZATION_ID.test(organizationId)
  ) {
    return {
      status: "organization-required",
      reason: "exact-organization-identifier-required",
    };
  }

  const resolvedAt = new Date().toISOString();
  const identityResolution =
    await resolveVerifiedConsumerIdentityFromClerk(resolvedAt);
  if (identityResolution.status !== "verified") {
    return {
      status: "authentication-required",
      reason: identityResolution.reason,
    };
  }

  let sql;
  try {
    sql = postgres(requireDiscoveryDatabaseUrl("application"), { max: 1 });
  } catch {
    writeAlphaOperationalLog({
      event: "alpha.database.failed",
      requestId,
      organizationId,
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
