import type { Sql } from "postgres";

import {
  preflightAlphaOrganizationAccess,
  resolveAlphaAllowlistDisclosureDecision,
  type AlphaAllowlistDisclosureResolution,
  type AlphaRuntimeCompositionLoader,
  type VerifiedConsumerIdentity,
} from "../../engine/v3/governance/alphaAllowlistDisclosureProducer";
import { mapAlphaAccessRow, type AlphaAccessDatabaseRow } from "./mapping";
import { PostgresAlphaDisclosureAuditRepository } from "./postgresRepositories";
import { AlphaStorageError } from "./types";

export type DurableAlphaDisclosureShadowResult =
  | {
      status: "committed";
      resolution: AlphaAllowlistDisclosureResolution;
      runtimeLoaderInvocations: 1;
    }
  | {
      status: "denied";
      reason: "access-denied" | "runtime-unavailable" | "audit-unavailable";
      runtimeLoaderInvocations: 0 | 1;
    };

export async function runDurableAlphaDisclosureTransaction(input: {
  sql: Sql<Record<string, unknown>>;
  identity: VerifiedConsumerIdentity;
  organizationId: string;
  experience: "organization";
  resolvedAt: string;
  runtimeLoader: {
    load: (
      input: Parameters<AlphaRuntimeCompositionLoader["load"]>[0],
    ) =>
      | ReturnType<AlphaRuntimeCompositionLoader["load"]>
      | Promise<ReturnType<AlphaRuntimeCompositionLoader["load"]>>;
  };
}): Promise<DurableAlphaDisclosureShadowResult> {
  let runtimeLoaderInvocations: 0 | 1 = 0;
  try {
    return (await input.sql.begin(
      "isolation level repeatable read",
      async (transaction) => {
        await transaction`SELECT set_config('statement_timeout', '5000', true)`;
        await transaction`SELECT set_config('lock_timeout', '1000', true)`;
        await transaction`SELECT set_config('idle_in_transaction_session_timeout', '7000', true)`;

        const rows = await transaction<AlphaAccessDatabaseRow[]>`
          SELECT access_record_id, policy_id, policy_version, consumer_id,
            organization_id, relationship, experience, scope_type, scope_id,
            status, granted_at, expires_at, revoked_at, supersedes_access_record_id
          FROM alpha_access_records
          WHERE policy_id = 'alpha-explicit-allowlist-disclosure'
            AND policy_version = '1'
            AND consumer_id = ${input.identity.consumerId}
            AND organization_id = ${input.organizationId}
            AND experience = ${input.experience}
          ORDER BY granted_at, access_record_id
          FOR SHARE
        `;
        const records = rows.map(mapAlphaAccessRow);
        const preflight = preflightAlphaOrganizationAccess(
          {
            identity: input.identity,
            organizationId: input.organizationId,
            experience: input.experience,
            resolvedAt: input.resolvedAt,
          },
          { findAccessRecords: () => records },
        );
        if (preflight.disposition !== "eligible") {
          return {
            status: "denied",
            reason: "access-denied",
            runtimeLoaderInvocations,
          } as const;
        }

        let runtime;
        try {
          runtimeLoaderInvocations = 1;
          runtime = await input.runtimeLoader.load({
            organizationId: input.organizationId,
          });
        } catch {
          throw new AlphaStorageError("unavailable", "Runtime unavailable", true);
        }
        if (runtime.organizationId !== input.organizationId) {
          throw new AlphaStorageError(
            "integrity-failure",
            "Runtime organization mismatch",
          );
        }
        const resolution = resolveAlphaAllowlistDisclosureDecision({
          identity: input.identity,
          organizationId: input.organizationId,
          experience: input.experience,
          requestedCompositions: runtime.compositions,
          authorityReceipts: runtime.authorityReceipts,
          resolvedAt: input.resolvedAt,
          preflight,
        });
        await new PostgresAlphaDisclosureAuditRepository(input.sql).append(
          resolution.auditEvent,
          transaction,
        );
        return {
          status: "committed",
          resolution,
          runtimeLoaderInvocations: 1,
        } as const;
      },
    )) as DurableAlphaDisclosureShadowResult;
  } catch (error) {
    const runtimeFailure =
      error instanceof AlphaStorageError &&
      error.message === "Runtime unavailable";
    return {
      status: "denied",
      reason: runtimeFailure ? "runtime-unavailable" : "audit-unavailable",
      runtimeLoaderInvocations,
    };
  }
}

/** Backward-compatible name retained for the completed inactive shadow gate. */
export const runDurableAlphaDisclosureTransactionShadow =
  runDurableAlphaDisclosureTransaction;
