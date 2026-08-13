import "server-only";

import { createHash } from "node:crypto";

import { readCanonicalScopeLineageTopology, resolveCurrentSourceScopeBinding } from "../../engine/v3/governance/canonicalScopeLineage";
import type { ScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import type { OrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { produceCanonicalUnderstandingAudienceLineage } from "../../engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage";
import { resolveCanonicalUnderstandingCurrentEligibility } from "../../engine/v3/understanding/resolveCanonicalUnderstandingCurrentEligibility";
import type { ProductArtifactCurrentOwnerStateV1 } from "../workflow/productArtifactCurrentAccessContracts";
import type { ProductArtifactInspectionMetadataV1 } from "../workflow/productArtifactInspectionMetadataContracts";
import { buildGenericScopedProductSource } from "./runtimeToScopedProductSource";
import { readScopedOrganizationalProductProjection } from "./scopedOrganizationalProductProjection";

const stable = (value: unknown): string =>
  Array.isArray(value)
    ? `[${value.map(stable).join(",")}]`
    : value && typeof value === "object"
      ? `{${Object.entries(value as Record<string, unknown>)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
          .join(",")}}`
      : JSON.stringify(value);
const digest = (value: unknown): string =>
  createHash("sha256").update(stable(value)).digest("hex");

export type ProductArtifactCurrentOwnerStateResolutionInputV1 = {
  organizationId: string;
  subjectId: string;
  purpose: string;
  sensitivity: "standard" | "restricted" | "private";
  evaluatedAt: string;
  governance: ScopedGovernanceContext;
  metadata: ProductArtifactInspectionMetadataV1;
};

const unavailable = (
  input: ProductArtifactCurrentOwnerStateResolutionInputV1,
): ProductArtifactCurrentOwnerStateV1 => ({
  contractVersion: "1",
  organizationId: input.organizationId,
  productQuestionId: input.metadata.productQuestionId,
  sourceGovernanceDigest: null,
  eligibilityDigest: null,
  eligibilityDisposition:
    input.governance.disposition === "denied" ? "withheld" : "unavailable",
  projectionRevision: null,
  projectionDigest: null,
  canonicalUnderstandingRevision: null,
  canonicalChangeResultDigest: null,
  lineagePolicyVersion: null,
});

/**
 * Content-free server composition of existing owner results. This resolver
 * owns no policy, authorization, persistence, Runtime, or artifact semantics.
 */
export class ProductArtifactCurrentOwnerStateResolver {
  constructor(
    private readonly dependencies: {
      runtimeRepository: Pick<OrganizationRuntimeRepository, "read">;
    },
  ) {}

  async resolve(
    input: ProductArtifactCurrentOwnerStateResolutionInputV1,
  ): Promise<ProductArtifactCurrentOwnerStateV1> {
    const lineage = input.metadata.materialLineage;
    const governance = input.governance;
    if (
      !lineage ||
      lineage.organizationId !== input.organizationId ||
      lineage.productQuestionId !== input.metadata.productQuestionId ||
      lineage.artifactId !== input.metadata.artifactId ||
      lineage.artifactRevision !== input.metadata.artifactRevision ||
      lineage.purpose !== input.purpose ||
      lineage.sensitivity !== input.sensitivity ||
      lineage.scopeDigest !== digest(governance.requestedScope) ||
      governance.disposition !== "authorized" ||
      governance.organizationId !== input.organizationId ||
      governance.subjectId !== input.subjectId ||
      governance.purpose !== input.purpose ||
      governance.sensitivity !== input.sensitivity ||
      governance.evaluatedAt !== input.evaluatedAt ||
      governance.temporal.mode !== "current"
    ) return unavailable(input);

    try {
      const stored = await this.dependencies.runtimeRepository.read(input.organizationId);
      if (!stored || stored.runtime.metadata.organizationId !== input.organizationId) {
        return unavailable(input);
      }
      const scopeLineageIndex = stored.runtime.memory.canonicalScopeLineageIndex;
      if (!scopeLineageIndex || scopeLineageIndex.organizationId !== input.organizationId) {
        return unavailable(input);
      }
      const compositions =
        stored.runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? [];
      const historicalProjectionBasis = compositions.find(
        (item) =>
          item.organizationId === input.organizationId &&
          item.id === lineage.projectionSourceRef &&
          item.revisionId === lineage.canonicalUnderstandingRevision,
      );
      if (!historicalProjectionBasis) return unavailable(input);
      const canonicalIds = new Set(
        lineage.canonicalMaterial.map((item) => item.canonicalObjectId),
      );
      const explanations = stored.runtime.memory.organizationalExplanations;
      const materialSupports = explanations
        .flatMap((item) => item.canonicalGovernanceLineage?.materialSupports ?? [])
        .filter((item) => canonicalIds.has(item.canonicalEvidenceId));
      if (materialSupports.length === 0) return unavailable(input);

      const audienceLineage = produceCanonicalUnderstandingAudienceLineage({
        organizationId: input.organizationId,
        compositions,
        explanations,
        scopeLineageIndex,
        scopeTopology: readCanonicalScopeLineageTopology(scopeLineageIndex),
      });
      const currentBindingRefs: string[] = [];
      const eligibility = resolveCanonicalUnderstandingCurrentEligibility(
        {
          contractVersion: "1",
          organizationId: input.organizationId,
          subjectId: input.subjectId,
          purposeRef: input.purpose,
          requestedScope: governance.requestedScope,
          sensitivity: input.sensitivity,
          evaluatedAt: input.evaluatedAt,
          authorizationContextRef: governance.contextId,
          canonicalUnderstandingRevision: stored.revision,
          audienceLineageDigest: audienceLineage.digest,
          lineagePolicyVersion: lineage.lineagePolicyVersion,
          materialSupports,
        },
        {
          authorization: governance,
          isPurposeCompatible: ({ requestedPurpose, materialPurposeRefs }) =>
            materialPurposeRefs.includes(requestedPurpose),
          resolveCurrentSourceBinding: ({
            historicalBindingId,
            historicalGovernanceRevisionRef,
          }) => {
            const expected = lineage.sourceBindings.find(
              (item) =>
                item.sourceBindingId === historicalBindingId &&
                item.bindingRevisionId === historicalBindingId,
            );
            const historical = scopeLineageIndex.sourceBindings.find(
              (item) =>
                item.bindingId === historicalBindingId &&
                item.digest === historicalGovernanceRevisionRef,
            );
            if (!expected || !historical) return undefined;
            const current = resolveCurrentSourceScopeBinding(
              scopeLineageIndex.sourceBindings.filter(
                (item) =>
                  item.organizationId === input.organizationId &&
                  item.source.sourceId === historical.source.sourceId,
              ),
              input.evaluatedAt,
            );
            if (!current) return undefined;
            currentBindingRefs.push(current.digest);
            return {
              organizationId: input.organizationId,
              historicalBindingId,
              currentBindingRevisionRef: current.bindingId,
              currentGovernanceRevisionRef: current.digest,
              availability: current.availability ?? "unavailable",
              purposeRefs: current.purposeRef ? [current.purposeRef] : [],
              scopes: current.assertions.map((item) => item.scope),
            };
          },
        },
      );
      if (eligibility.disposition !== "eligible") {
        return {
          ...unavailable(input),
          eligibilityDigest: eligibility.resultDigest,
          eligibilityDisposition: eligibility.disposition,
          canonicalUnderstandingRevision: stored.revision,
          lineagePolicyVersion: lineage.lineagePolicyVersion,
        };
      }
      const projection = readScopedOrganizationalProductProjection({
        authenticatedUserId: input.subjectId,
        organizationId: input.organizationId,
        context: governance,
        repository: {
          readAuthorizedSource: () =>
            buildGenericScopedProductSource({
              stored,
              organizationId: input.organizationId,
              requestedScope: governance.requestedScope,
              currentEligibility: eligibility,
            }),
        },
      });
      if (
        projection.disposition !== "available" ||
        projection.sourceRevisionRef !== stored.revision
      ) return unavailable(input);

      return {
        contractVersion: "1",
        organizationId: input.organizationId,
        productQuestionId: input.metadata.productQuestionId,
        sourceGovernanceDigest: digest([...new Set(currentBindingRefs)].sort()),
        eligibilityDigest: eligibility.resultDigest,
        eligibilityDisposition: "eligible",
        projectionRevision: projection.sourceRevisionRef,
        projectionDigest: digest(projection),
        canonicalUnderstandingRevision: stored.revision,
        canonicalChangeResultDigest: "not-applicable",
        lineagePolicyVersion: lineage.lineagePolicyVersion,
      };
    } catch {
      return unavailable(input);
    }
  }
}
