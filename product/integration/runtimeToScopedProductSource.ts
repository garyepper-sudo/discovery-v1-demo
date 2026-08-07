import type { StoredOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntimeRepository";
import type { GovernedScopeRef } from "../../engine/v3/governance/scopedGovernanceContext";
import type { ScopedProjectionRepositorySource } from "./scopedOrganizationalProductProjection";
import { selectScopedProductItemsFromCanonicalLineage } from "./scopedOrganizationalProductProjection";
import type { CanonicalUnderstandingCurrentEligibilityResultV1 } from "../../engine/v3/understanding/resolveCanonicalUnderstandingCurrentEligibility";

/**
 * Builds the generic Product repository source from the one persistence-owned
 * loaded record. Canonical Organizational Understanding is intentionally not
 * represented here; it has its own disclosure and projection contract.
 */
export function buildGenericScopedProductSource(input: {
  stored: StoredOrganizationRuntime;
  organizationId: string;
  requestedScope: GovernedScopeRef;
  currentEligibility?: CanonicalUnderstandingCurrentEligibilityResultV1;
}): ScopedProjectionRepositorySource {
  if (
    input.stored.runtime.metadata.organizationId !== input.organizationId ||
    !input.stored.revision
  ) throw new Error("Stored Runtime identity mismatch.");

  const source: ScopedProjectionRepositorySource = {
    organizationId: input.organizationId,
    sourceRevisionRef: input.stored.revision,
    items: [],
    metrics: [],
    metricCombinationPolicy: [],
    ...(input.currentEligibility
      ? {
          currentEligibilityRequired: true,
          currentEligibility: structuredClone(input.currentEligibility),
        }
      : {}),
  };
  const items = selectScopedProductItemsFromCanonicalLineage({
    organizationId: input.organizationId,
    requestedScope: input.requestedScope,
    items: source.items,
    lineageIndex: input.stored.runtime.memory.canonicalScopeLineageIndex,
  });
  return { ...source, items };
}
