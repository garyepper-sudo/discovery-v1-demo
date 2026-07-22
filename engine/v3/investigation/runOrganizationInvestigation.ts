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

import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

import {
  loadOrganizationRuntimeState,
  persistOrganizationRuntimeState,
} from "../runtime/organizationStateStore";

import {
  buildExecutiveProjection,
} from "../../../components/executive-v2/projection/buildExecutiveProjection";

export type OrganizationInvestigationInput =
  InvestigationInput & {
    organizationId: string;
  };

export type OrganizationInvestigationResult = {
  result: DiscoveryV3Result;
  runtime: OrganizationRuntime;
  executiveProjection: ReturnType<
    typeof buildExecutiveProjection
  >;
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
  } = params;

  const currentRuntime =
    loadOrganizationRuntimeState(
      organizationId,
    );

  const input: InvestigationInput = {
    company,
    website,
    industry,
    question,
    context,
  };

  const result =
    runDiscoveryV3(
      input,
    );

  const evolvedRuntime =
    evolveOrganizationRuntime({
      runtime:
        currentRuntime,

      result,

      input,
    });

  /**
   * evolveOrganizationRuntime() already advances investigationCount.
   *
   * Persist directly here rather than calling saveOrganizationRuntimeState(),
   * which would advance the count a second time.
   */
  const persistedRuntime =
    persistOrganizationRuntimeState(
      evolvedRuntime,
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
  };
}
