import { productArtifactBodyDigest, validateProductArtifactBodyRefV1, type PersistedProductArtifactTypeV1, type ProductArtifactBodyRefV1 } from "../persistence/productArtifactBodyContracts";

export type ProductArtifactInspectionMetadataV1 = {
  contractVersion: "1";
  organizationId: string;
  semanticOwner: "leadership-conversation" | "product-decision-draft";
  artifactType: PersistedProductArtifactTypeV1;
  artifactId: string;
  artifactRevision: string;
  productQuestionId: string;
  productWorkflowId: string | null;
  creationEnvelopeDigest: string;
  materialReferencesDigest: string;
  protectedBody: ProductArtifactBodyRefV1;
  ownerStageReceiptDigest: string;
  headerDigest: string;
};

export type ProductArtifactNonBodyClassV1="product-question-workspace"|"leadership-conversation-history"|"replay-receipt"|"materialization-receipt"|"source-reference"|"stage-record";
export function assertProductArtifactNonBodyClassV1(value:string):asserts value is ProductArtifactNonBodyClassV1{if(!["product-question-workspace","leadership-conversation-history","replay-receipt","materialization-receipt","source-reference","stage-record"].includes(value))throw new Error("Product artifact non-body classification is invalid.");}

export function completeProductArtifactInspectionMetadataV1(
  input: Omit<ProductArtifactInspectionMetadataV1, "contractVersion" | "headerDigest">,
): ProductArtifactInspectionMetadataV1 {
  validateProductArtifactBodyRefV1(input.protectedBody);
  const unsigned = { contractVersion: "1" as const, ...input };
  return { ...unsigned, headerDigest: productArtifactBodyDigest(unsigned) };
}

export function validateProductArtifactInspectionMetadataV1(value: ProductArtifactInspectionMetadataV1): void {
  validateProductArtifactBodyRefV1(value.protectedBody);
  const { headerDigest, ...unsigned } = value;
  if (
    value.contractVersion !== "1" ||
    value.organizationId !== value.protectedBody.organizationId ||
    value.semanticOwner !== value.protectedBody.semanticOwner ||
    value.artifactType !== value.protectedBody.artifactType ||
    value.artifactId !== value.protectedBody.artifactId ||
    value.artifactRevision !== value.protectedBody.artifactRevision ||
    headerDigest !== productArtifactBodyDigest(unsigned)
  ) throw new Error("Product artifact inspection metadata is invalid.");
}
