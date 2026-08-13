import "server-only";

import type { ScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import type { ProductArtifactBodyRepository } from "../persistence";
import {
  assertLeadershipConversationPublicationProofV1,
  type PreparedWorkProductPublicationV1,
  type ProductWorkflowArtifactRepository,
} from "../workflow/leadershipConversation";
import type {
  ProductArtifactCurrentAccessOperationV1,
  ProductArtifactCurrentOwnerStateV1,
} from "../workflow/productArtifactCurrentAccessContracts";
import type { ProductArtifactInspectionMetadataV1 } from "../workflow/productArtifactInspectionMetadataContracts";
import { ProductArtifactAuthorizedBodyReader } from "./productArtifactAuthorizedBodyReader";
import { resolveProductArtifactCurrentAccessV1 } from "./productArtifactCurrentAccessResolver";
import {
  ProductArtifactMetadataInspectionService,
  type ProductArtifactMetadataOwnerV1,
} from "./productArtifactMetadataInspectionService";

export type CanonicalProductArtifactReadRequestV1 = {
  contractVersion: "1";
  organizationId: string;
  subjectId: string;
  artifactType: string;
  artifactId: string;
  artifactRevision: string;
  operation: ProductArtifactCurrentAccessOperationV1;
  purpose: string;
  scopeDigest: string;
  sensitivity: "standard" | "restricted" | "private";
  evaluatedAt: string;
};

export type CanonicalProductArtifactCurrentAccessDependencies = {
  metadataOwners: readonly ProductArtifactMetadataOwnerV1[];
  bodyRepository: ProductArtifactBodyRepository;
  productWorkflowRepository: ProductWorkflowArtifactRepository;
  preauthorize(input: CanonicalProductArtifactReadRequestV1): Promise<boolean>;
  resolveGovernance(input: CanonicalProductArtifactReadRequestV1): Promise<ScopedGovernanceContext>;
  resolveCurrentOwnerState(
    input: CanonicalProductArtifactReadRequestV1,
    metadata: ProductArtifactInspectionMetadataV1,
  ): Promise<ProductArtifactCurrentOwnerStateV1>;
};

export class CanonicalProductArtifactCurrentAccessComposition {
  private readonly inspector: ProductArtifactMetadataInspectionService;
  private readonly reader: ProductArtifactAuthorizedBodyReader;

  constructor(private readonly dependencies: CanonicalProductArtifactCurrentAccessDependencies) {
    this.inspector = new ProductArtifactMetadataInspectionService(dependencies.metadataOwners);
    this.reader = new ProductArtifactAuthorizedBodyReader(dependencies.bodyRepository);
  }

  private async assertPersistedPublicationProof(
    input: CanonicalProductArtifactReadRequestV1,
    metadata: ProductArtifactInspectionMetadataV1,
  ): Promise<void> {
    if (metadata.publicationProofVersion !== "1") return;
    const store = (await this.dependencies.productWorkflowRepository.read(input.organizationId)).store;
    const prepared = (store.preparedWorkPublications ?? []).find(
      (item) => item.artifactId === metadata.artifactId && item.artifactRevision === metadata.artifactRevision,
    );
    const checkpoint = (store.frozenSnapshotPublications ?? []).find(
      (item) => item.artifactId === metadata.artifactId && item.artifactRevision === metadata.artifactRevision,
    );
    const publication = prepared ?? checkpoint;
    if (!publication || publication.headerDigest !== metadata.headerDigest) {
      throw new Error("Product artifact publication proof is unavailable.");
    }
    const eventType = publication.artifactType === "prepared-work"
      ? "prepared-work-product-version-recorded"
      : "prepared-work-product-frozen";
    const eventRecordRef = publication.artifactType === "prepared-work"
      ? publication.artifactRevision
      : publication.artifactId;
    const event = store.events.find(
      (item) => item.eventType === eventType && item.recordRef === eventRecordRef,
    );
    const receiptKind = publication.artifactType === "prepared-work"
      ? "prepared-work-publication"
      : "frozen-checkpoint-publication";
    const receipt = (store.publicationReceipts ?? []).find(
      (item) => item.receiptKind === receiptKind
        && item.artifactId === publication.artifactId
        && item.artifactRevision === publication.artifactRevision,
    );
    if (!event || !receipt) throw new Error("Product artifact publication proof is unavailable.");
    let sourcePublication: PreparedWorkProductPublicationV1 | undefined;
    if (publication.artifactType === "frozen-snapshot") {
      sourcePublication = (store.preparedWorkPublications ?? []).find(
        (item) => item.artifactRevision === publication.preparedWorkProductVersionId,
      );
      if (!sourcePublication) throw new Error("Product artifact publication proof is unavailable.");
    }
    assertLeadershipConversationPublicationProofV1({ publication, event, receipt, sourcePublication });
  }

  async readAuthorized<T>(
    input: CanonicalProductArtifactReadRequestV1 & { project(bytes: Uint8Array): T },
  ): Promise<{ disposition: "eligible"; value: T } | { disposition: "inaccessible"; value: null }> {
    const preauthorized = await this.dependencies.preauthorize(input);
    const inspected = await this.inspector.inspect({ ...input, preauthorized });
    if (inspected.disposition !== "available") return { disposition: "inaccessible", value: null };
    try {
      await this.assertPersistedPublicationProof(input, inspected.metadata);
    } catch {
      return { disposition: "inaccessible", value: null };
    }
    const governance = await this.dependencies.resolveGovernance(input);
    const current = await this.dependencies.resolveCurrentOwnerState(input, inspected.metadata);
    const access = resolveProductArtifactCurrentAccessV1({
      contractVersion: "1",
      organizationId: input.organizationId,
      subjectId: input.subjectId,
      operation: input.operation,
      purpose: input.purpose,
      scopeDigest: input.scopeDigest,
      sensitivity: input.sensitivity,
      evaluatedAt: input.evaluatedAt,
      metadata: inspected.metadata,
      governance,
    }, current);
    if (access.disposition !== "eligible") return { disposition: "inaccessible", value: null };
    const bytes = await this.reader.read({ metadata: inspected.metadata, access });
    return { disposition: "eligible", value: input.project(bytes) };
  }
}
