import "server-only";

import { createHash } from "node:crypto";

import { readCanonicalScopeLineageTopology, resolveCurrentSourceScopeBinding } from "../../engine/v3/governance/canonicalScopeLineage";
import type { ScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import type { OrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { produceCanonicalUnderstandingAudienceLineage } from "../../engine/v3/understanding/produceCanonicalUnderstandingAudienceLineage";
import { resolveCanonicalUnderstandingCurrentEligibility } from "../../engine/v3/understanding/resolveCanonicalUnderstandingCurrentEligibility";
import type { ProductArtifactCurrentOwnerStateV1 } from "../workflow/productArtifactCurrentAccessContracts";
import type { HistoricalPredecessorCurrentAccessRequestV2 } from "../workflow/productArtifactCurrentAccessContracts";
import type { ProductArtifactInspectionMetadataV1 } from "../workflow/productArtifactInspectionMetadataContracts";
import { validateProductArtifactInspectionMetadataV1 } from "../workflow/productArtifactInspectionMetadataContracts";
import type { CanonicalEvidenceContributionOperationRecordV1 } from "./contracts";
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
      verifyDirectEvidenceOwnerProof?: (input:{organizationId:string;productQuestionId:string;provenance:import("../workflow/productArtifactInspectionMetadataContracts").DirectCanonicalEvidenceProvenanceV2})=>Promise<boolean>;
      resolveExactSourceMetadata?: (input:{organizationId:string;subjectId:string;purpose:string;evaluatedAt:string;sourceBindingId:string;normalizedContentDigest:string})=>Promise<{sourceContentVersionId:string;exactContentDigest:string;normalizedContentDigest:string;storageIntegrityDigest:string}|null>;
    },
  ) {}

  async resolve(
    input: ProductArtifactCurrentOwnerStateResolutionInputV1,
  ): Promise<ProductArtifactCurrentOwnerStateV1> {
    return this.resolveCurrent(input, false);
  }

  private async resolveCurrent(
    input: ProductArtifactCurrentOwnerStateResolutionInputV1,
    allowProvenSuccessorRevision: boolean,
    historicalStatus?:{durableRevoked:boolean},
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
      validateProductArtifactInspectionMetadataV1(input.metadata);
      if(lineage.contractVersion==="2")return this.resolveDirectEvidence(input,lineage);
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
          (item.revisionId === lineage.canonicalUnderstandingRevision ||
            (allowProvenSuccessorRevision && item.epistemicRevisions?.some(
              (revision) => revision.revisionId === lineage.canonicalUnderstandingRevision,
            ))),
      );
      if (!historicalProjectionBasis) return unavailable(input);
      if(!allowProvenSuccessorRevision&&historicalProjectionBasis.epistemicRevisions?.length&&historicalProjectionBasis.epistemicRevisions.at(-1)?.revisionId!==lineage.canonicalUnderstandingRevision)return unavailable(input);
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
      if(historicalStatus)historicalStatus.durableRevoked=eligibility.reasonClasses.includes("current-binding-revoked");
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

  private async resolveDirectEvidence(input:ProductArtifactCurrentOwnerStateResolutionInputV1,lineage:import("../workflow/productArtifactInspectionMetadataContracts").ProductArtifactMaterialLineageV2):Promise<ProductArtifactCurrentOwnerStateV1>{
    if(!this.dependencies.verifyDirectEvidenceOwnerProof||!this.dependencies.resolveExactSourceMetadata||lineage.lineageVariant!=="direct-canonical-evidence")return unavailable(input);
    const stored=await this.dependencies.runtimeRepository.read(input.organizationId);if(!stored||stored.runtime.metadata.organizationId!==input.organizationId)return unavailable(input);
    const p=lineage.directEvidenceProvenance,{bundleDigest,...bundle}=p;if(bundleDigest!==digest(bundle)||p.organizationId!==input.organizationId||p.productQuestionId!==lineage.productQuestionId||p.artifactId!==lineage.artifactId||p.artifactRevision!==lineage.artifactRevision||p.artifactWorkflowRef!==lineage.productWorkflowId)return unavailable(input);
    const operationMatches=stored.runtime.memory.events.filter((event):event is CanonicalEvidenceContributionOperationRecordV1=>Boolean(event&&typeof event==="object"&&(event as {kind?:unknown}).kind==="canonical-evidence-contribution-operation"&&(event as {contributionOperationId?:unknown}).contributionOperationId===p.operationEnvelope.contributionOperationId));if(operationMatches.length!==1)return unavailable(input);const operation=operationMatches[0]!,{recordDigest,...operationUnsigned}=operation;if(operation.organizationId!==input.organizationId||operation.questionId!==lineage.productQuestionId||operation.requestFingerprint!==p.operationEnvelope.requestFingerprint||operation.idempotencyKeyDigest!==p.operationEnvelope.idempotencyKeyDigest||operation.lineageEnvelopeDigest!==p.operationEnvelope.lineageEnvelopeDigest||recordDigest!==p.operationEnvelope.operationRecordDigest||recordDigest!==digest(operationUnsigned)||operation.canonicalAdmissionBatch.batchDigest!==p.admissionBatch.batchDigest||operation.canonicalAdmissionBatch.admissionDisposition!==p.admissionBatch.admissionDisposition)return unavailable(input);
    if(!await this.dependencies.verifyDirectEvidenceOwnerProof({organizationId:input.organizationId,productQuestionId:lineage.productQuestionId,provenance:p}))return unavailable(input);
    const index=stored.runtime.memory.canonicalScopeLineageIndex;if(!index||index.organizationId!==input.organizationId)return unavailable(input);const seenEvidence=new Set<string>(),seenBindings=new Map<string,string>();for(const declared of p.evidence){if(seenEvidence.has(declared.canonicalEvidenceId))return unavailable(input);seenEvidence.add(declared.canonicalEvidenceId);const admissions=operation.canonicalAdmissionBatch.admissions.filter(value=>value.canonicalEvidenceId===declared.canonicalEvidenceId&&value.canonicalAdmissionId===declared.canonicalAdmissionId&&value.attributionId===declared.attributionId&&value.attributionVersion===declared.attributionVersion&&value.attributionDigest===declared.attributionDigest);const attributions=index.evidenceAttributions.filter(value=>value.attributionId===declared.attributionId&&value.evidenceId===declared.canonicalEvidenceId&&value.evidenceAdmissionId===declared.canonicalAdmissionId&&value.attributionVersion===declared.attributionVersion&&value.digest===declared.attributionDigest);if(admissions.length!==1||attributions.length!==1||declared.sourceBindings.length!==admissions[0]!.sourceBindings.length)return unavailable(input);const local=new Set<string>();for(const source of declared.sourceBindings){const sourceDigest=digest(source),prior=seenBindings.get(source.sourceBindingId);if(local.has(source.sourceBindingId)||(prior!==undefined&&prior!==sourceDigest))return unavailable(input);local.add(source.sourceBindingId);seenBindings.set(source.sourceBindingId,sourceDigest);const admissionBinding=admissions[0]!.sourceBindings.filter(value=>value.sourceBindingId===source.sourceBindingId&&value.normalizedContentDigest===source.normalizedContentDigest),binding=index.sourceBindings.filter(value=>value.bindingId===source.bindingRevisionId&&value.digest===source.bindingRevisionDigest&&value.organizationId===input.organizationId&&value.source.normalizedContentDigest===source.normalizedContentDigest);if(admissionBinding.length!==1||binding.length!==1)return unavailable(input);const current=resolveCurrentSourceScopeBinding(index.sourceBindings.filter(value=>value.organizationId===input.organizationId&&value.source.sourceId===binding[0]!.source.sourceId),input.evaluatedAt);if(!current||current.bindingId!==source.bindingRevisionId||current.digest!==source.bindingRevisionDigest||current.availability!=="available"||current.purposeRef!==input.purpose||!current.assertions.some(value=>stable(value.scope)===stable(input.governance.requestedScope)))return unavailable(input);const metadata=await this.dependencies.resolveExactSourceMetadata({organizationId:input.organizationId,subjectId:input.subjectId,purpose:input.purpose,evaluatedAt:input.evaluatedAt,sourceBindingId:source.sourceBindingId,normalizedContentDigest:source.normalizedContentDigest});if(!metadata||metadata.sourceContentVersionId!==source.sourceContentVersionId||metadata.exactContentDigest!==source.exactContentDigest||metadata.normalizedContentDigest!==source.normalizedContentDigest||metadata.storageIntegrityDigest!==source.storageIntegrityDigest)return unavailable(input);}}
    if(seenEvidence.size!==operation.canonicalAdmissionBatch.admissions.length)return unavailable(input);return{contractVersion:"1",organizationId:input.organizationId,productQuestionId:lineage.productQuestionId,sourceGovernanceDigest:digest([...seenBindings.keys()].sort()),eligibilityDigest:digest({bundleDigest,authorization:input.governance.contextId}),eligibilityDisposition:"eligible",projectionRevision:stored.revision,projectionDigest:digest({artifactId:lineage.artifactId,artifactRevision:lineage.artifactRevision,bundleDigest}),canonicalUnderstandingRevision:null,canonicalChangeResultDigest:"not-applicable",lineagePolicyVersion:lineage.lineagePolicyVersion,accessBasis:{contractVersion:"2",kind:"direct-canonical-evidence",canonicalUnderstandingRevision:null,provenanceBundleDigest:bundleDigest}};
  }

  async resolveHistoricalPredecessor(
    input: ProductArtifactCurrentOwnerStateResolutionInputV1 & { request: HistoricalPredecessorCurrentAccessRequestV2 },
  ): Promise<{state:ProductArtifactCurrentOwnerStateV1;durableRevoked:boolean}> {
    const { request, metadata } = input;
    if (
      request.contractVersion !== "2" ||
      request.organizationId !== input.organizationId ||
      request.productQuestionId !== metadata.productQuestionId ||
      request.artifactId !== metadata.artifactId ||
      request.artifactRevision !== metadata.artifactRevision ||
      request.headerDigest !== metadata.headerDigest ||
      request.bodyRefDigest !== metadata.protectedBody.refDigest ||
      metadata.semanticOwner !== "leadership-conversation" ||
      metadata.artifactType !== "prepared-work" ||
      metadata.productWorkflowId !== `leadership-conversation:${request.predecessorConversationId}` ||
      metadata.materialLineage?.productWorkflowId !== metadata.productWorkflowId
    ) return {state:unavailable(input),durableRevoked:false};
    const status={durableRevoked:false};
    return{state:await this.resolveCurrent(input,true,status),durableRevoked:status.durableRevoked};
  }
}
