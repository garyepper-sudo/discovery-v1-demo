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
  materialLineage?: ProductArtifactMaterialLineageV1;
  headerDigest: string;
};

export type ProductArtifactMaterialLineageV1={contractVersion:"1";organizationId:string;semanticOwner:"leadership-conversation"|"product-decision-draft";productQuestionId:string;creationOperationId:string;lineagePolicyVersion:string;sourceBindings:Array<{sourceBindingId:string;bindingRevisionId:string}>;sourceContentVersions:Array<{sourceBindingId:string;sourceContentVersionId:string;normalizedContentDigest:string}>;canonicalMaterial:Array<{canonicalObjectId:string;revisionRef:string;owner:"canonical-evidence-admission"}>;canonicalUnderstandingRevision:string;projectionSourceRef:string;seedDigest:string;artifactType:PersistedProductArtifactTypeV1;artifactId:string;artifactRevision:string;envelopeDigest:string};

export type ProductArtifactNonBodyClassV1="product-question-workspace"|"leadership-conversation-history"|"replay-receipt"|"materialization-receipt"|"source-reference"|"stage-record";
export function assertProductArtifactNonBodyClassV1(value:string):asserts value is ProductArtifactNonBodyClassV1{if(!["product-question-workspace","leadership-conversation-history","replay-receipt","materialization-receipt","source-reference","stage-record"].includes(value))throw new Error("Product artifact non-body classification is invalid.");}

export function completeProductArtifactInspectionMetadataV1(
  input: Omit<ProductArtifactInspectionMetadataV1, "contractVersion" | "headerDigest">,
): ProductArtifactInspectionMetadataV1 {
  validateProductArtifactBodyRefV1(input.protectedBody);
  if(input.materialLineage){const lineage=structuredClone(input.materialLineage);const{envelopeDigest,...unsignedLineage}=lineage;lineage.envelopeDigest=productArtifactBodyDigest(unsignedLineage);input={...input,materialLineage:lineage};}
  const unsigned = { contractVersion: "1" as const, ...input };
  return { ...unsigned, headerDigest: productArtifactBodyDigest(unsigned) };
}

export function validateProductArtifactInspectionMetadataV1(value: ProductArtifactInspectionMetadataV1): void {
  validateProductArtifactBodyRefV1(value.protectedBody);
  const { headerDigest, ...unsigned } = value;
  if(value.materialLineage){const{envelopeDigest,...lineage}=value.materialLineage;const bindingIds=new Set(value.materialLineage.sourceBindings.map(item=>item.sourceBindingId));const versionAssociations=new Map<string,string>();let associationValid=bindingIds.size===value.materialLineage.sourceBindings.length;for(const item of value.materialLineage.sourceContentVersions){const association=`${item.sourceBindingId}\u0000${item.normalizedContentDigest}`,previous=versionAssociations.get(item.sourceContentVersionId);if(!item.sourceBindingId||!item.sourceContentVersionId||!/^[a-f0-9]{64}$/u.test(item.normalizedContentDigest)||!bindingIds.has(item.sourceBindingId)||previous!==undefined)associationValid=false;versionAssociations.set(item.sourceContentVersionId,association);}if(envelopeDigest!==productArtifactBodyDigest(lineage)||value.materialLineage.organizationId!==value.organizationId||value.materialLineage.semanticOwner!==value.semanticOwner||value.materialLineage.artifactType!==value.artifactType||value.materialLineage.artifactId!==value.artifactId||value.materialLineage.artifactRevision!==value.artifactRevision||value.materialLineage.productQuestionId!==value.productQuestionId||!value.materialLineage.seedDigest||!value.materialLineage.sourceBindings.length||!value.materialLineage.sourceContentVersions.length||!value.materialLineage.canonicalMaterial.length||!associationValid)throw new Error("Product artifact material lineage is invalid.");}
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
