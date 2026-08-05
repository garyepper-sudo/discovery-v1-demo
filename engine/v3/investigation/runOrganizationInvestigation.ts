import type {
  InvestigationInput,
} from "../../types";

import {
  runDiscoveryV3,
} from "../index";

import type {
  DiscoveryV3Result,
} from "../types";

import {
  evolveOrganizationRuntime,
} from "../runtime/evolveOrganizationRuntime";

import {
  createEmptyOrganizationRuntime,
  type OrganizationRuntime,
} from "../runtime/organizationRuntime";
import type { CanonicalScopeLineageAdmissionInput } from "../governance/canonicalScopeLineage";

import {
  loadOrganizationRuntimeState,
  persistOrganizationRuntimeState,
} from "../runtime/organizationStateStore";
import {
  canonicalInvestigationFingerprint,
  InvestigationIdempotencyConflictError,
  InvestigationInProgressError,
} from "./investigationIdempotency";

import {
  buildExecutiveProjection,
} from "../../../components/executive-v2/projection/buildExecutiveProjection";

export type OrganizationInvestigationInput =
  InvestigationInput & {
    organizationId: string;
    investigationRequestId?: string;
    scopeLineage?: CanonicalScopeLineageAdmissionInput;
  };

export type OrganizationInvestigationResult = {
  result: DiscoveryV3Result;
  runtime: OrganizationRuntime;
  executiveProjection: ReturnType<
    typeof buildExecutiveProjection
  >;
  idempotentReplay: boolean;
  canonicalResponse?: unknown;
  idempotencyReceiptRequestId?: string;
};

/**
 * Canonical production orchestration for one organizational investigation.
 *
 * This function owns the complete investigation lifecycle:
 *
 * load runtime
 * → run investigation cognition
 * → evolve organizational memory
 * → persist runtime
 * → build executive projection
 *
 * APIs, benchmarks, and product experiences should call this function rather
 * than recreating the lifecycle independently.
 */
export function runOrganizationInvestigation(
  params:
    OrganizationInvestigationInput,
): OrganizationInvestigationResult {
  const {
    organizationId,
    company,
    website,
    industry,
    question,
    context,
    evidenceSources,
    investigationRequestId,
    scopeLineage,
  } = params;

  const evidenceTimes = (evidenceSources ?? [])
    .map((source) => source.observedAt)
    .filter((value): value is string =>
      typeof value === "string" && !Number.isNaN(Date.parse(value)))
    .sort();
  const semanticTime = evidenceTimes.at(-1) ?? new Date().toISOString();
  const loadedRuntime = loadOrganizationRuntimeState(organizationId);
  const currentRuntime = loadedRuntime.metadata.investigationCount === 0
    ? createEmptyOrganizationRuntime({
        organizationId,
        name: loadedRuntime.metadata.name,
        industry: loadedRuntime.metadata.industry,
        website: loadedRuntime.metadata.website,
        now: semanticTime,
      })
    : loadedRuntime;

  const input: InvestigationInput = {
    company,
    website,
    industry,
    question,
    context,
    ...(evidenceSources
      ? {
          evidenceSources: [...evidenceSources].sort((left, right) =>
            left.sourceId < right.sourceId ? -1 : left.sourceId > right.sourceId ? 1 : 0),
        }
      : {}),
  };

  const fingerprint = canonicalInvestigationFingerprint({
    organizationId,
    input,
  });
  const receipts = currentRuntime.metadata.investigationReceipts ?? [];
  if (investigationRequestId) {
    const requestReceipt = receipts.find(
      (receipt) => receipt.requestId === investigationRequestId,
    );
    if (requestReceipt && requestReceipt.fingerprint !== fingerprint) {
      throw new InvestigationIdempotencyConflictError();
    }
    if (requestReceipt?.status === "in-progress") {
      throw new InvestigationInProgressError();
    }
    const fingerprintReceipt = receipts.find(
      (receipt) =>
        receipt.fingerprint === fingerprint &&
        receipt.status === "completed",
    );
    if (fingerprintReceipt) {
      const replayResult =
        currentRuntime.memory.understandingState as DiscoveryV3Result | null;
      if (!replayResult) {
        throw new Error("Completed investigation receipt has no Runtime result.");
      }
      return {
        result: replayResult,
        runtime: currentRuntime,
        executiveProjection: buildExecutiveProjection({
          result: replayResult,
          runtime: currentRuntime,
        }),
        idempotentReplay: true,
        idempotencyReceiptRequestId: fingerprintReceipt.requestId,
        ...(fingerprintReceipt.canonicalResponse !== undefined
          ? { canonicalResponse: fingerprintReceipt.canonicalResponse }
          : {}),
      };
    }
  }

  const startedAt = semanticTime;
  const nonTemporalEvidenceRecovery = receipts.some((receipt) => {
    if (receipt.status !== "completed" || !receipt.canonicalResponse) {
      return false;
    }
    const response = receipt.canonicalResponse as {
      body?: { status?: unknown };
    };
    return response.body?.status === "insufficient-evidence";
  });
  const runtimeWithInProgressReceipt = investigationRequestId
    ? persistOrganizationRuntimeState({
        ...currentRuntime,
        metadata: {
          ...currentRuntime.metadata,
          investigationReceipts: [
            ...receipts.filter(
              (receipt) => receipt.requestId !== investigationRequestId,
            ),
            {
              requestId: investigationRequestId,
              fingerprint,
              status: "in-progress" as const,
              investigationCount: currentRuntime.metadata.investigationCount,
              startedAt,
            },
          ],
        },
      })
    : currentRuntime;

  try {
    const result =
      runDiscoveryV3(input,scopeLineage);

    const evolvedRuntime =
      evolveOrganizationRuntime({
        runtime:
          runtimeWithInProgressReceipt,

        result,

        input,
        nonTemporalEvidenceRecovery,
        semanticTime,
      });

    const completedAt = evolvedRuntime.metadata.updatedAt;
    const runtimeWithReceipt = investigationRequestId
      ? {
          ...evolvedRuntime,
          metadata: {
            ...evolvedRuntime.metadata,
            investigationReceipts:
              (evolvedRuntime.metadata.investigationReceipts ?? []).map(
                (receipt) =>
                  receipt.requestId === investigationRequestId
                    ? {
                        ...receipt,
                        status: "completed" as const,
                        investigationCount:
                          evolvedRuntime.metadata.investigationCount,
                        completedAt,
                        safeToRetry: undefined,
                      }
                    : receipt,
              ),
          },
        }
      : evolvedRuntime;

  /**
   * evolveOrganizationRuntime() already advances investigationCount.
   *
   * Persist directly here rather than calling saveOrganizationRuntimeState(),
   * which would advance the count a second time.
   */
    const persistedRuntime =
      persistOrganizationRuntimeState(
        runtimeWithReceipt,
      );

    const evolvedResult =
      persistedRuntime.memory
        .understandingState as
        | DiscoveryV3Result
        | null;

    const effectiveResult =
      evolvedResult ?? result;

    const executiveProjection =
      buildExecutiveProjection({
        result:
          effectiveResult,

        runtime:
          persistedRuntime,
      });

    return {
      result:
        effectiveResult,
      runtime:
        persistedRuntime,
      executiveProjection,
      idempotentReplay: false,
      ...(investigationRequestId
        ? { idempotencyReceiptRequestId: investigationRequestId }
        : {}),
    };
  } catch (error) {
    if (investigationRequestId) {
      const failedRuntime = loadOrganizationRuntimeState(organizationId);
      const failedReceipts = failedRuntime.metadata.investigationReceipts ?? [];
      const receipt = failedReceipts.find(
        (candidate) => candidate.requestId === investigationRequestId,
      );
      if (
        receipt?.status === "in-progress" &&
        failedRuntime.metadata.investigationCount ===
          currentRuntime.metadata.investigationCount
      ) {
        persistOrganizationRuntimeState({
          ...failedRuntime,
          metadata: {
            ...failedRuntime.metadata,
            investigationReceipts: failedReceipts.map((candidate) =>
              candidate.requestId === investigationRequestId
                ? {
                    ...candidate,
                    status: "failed" as const,
                    safeToRetry: true,
                  }
                : candidate
            ),
          },
        });
      }
    }
    throw error;
  }
}
