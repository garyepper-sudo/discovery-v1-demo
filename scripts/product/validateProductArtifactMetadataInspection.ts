import assert from "node:assert/strict";
import {createProductArtifactBodyRefV1,productArtifactBodyDigest} from "../../product/persistence/productArtifactBodyContracts";
import {assertProductArtifactNonBodyClassV1,completeProductArtifactInspectionMetadataV1,validateProductArtifactInspectionMetadataV1} from "../../product/workflow/productArtifactInspectionMetadataContracts";

const cases=[
  ["prepared-work","leadership-conversation"],
  ["frozen-snapshot","leadership-conversation"],
  ["what-changed","leadership-conversation"],
  ["product-decision-draft","product-decision-draft"],
] as const;
for(const [artifactType,semanticOwner] of cases){const artifactId=`${artifactType}-1`,artifactRevision="revision-1",body=createProductArtifactBodyRefV1({organizationId:"metadata-validation",semanticOwner,artifactType,artifactId,artifactRevision,exactBodyDigest:productArtifactBodyDigest(`${artifactType}-protected`),byteLength:10,mediaType:"application/json",schemaRef:`discovery:product:${artifactType}-body:v1`}),header=completeProductArtifactInspectionMetadataV1({organizationId:"metadata-validation",semanticOwner,artifactType,artifactId,artifactRevision,productQuestionId:"question-1",productWorkflowId:semanticOwner==="leadership-conversation"?"workflow-1":null,creationEnvelopeDigest:productArtifactBodyDigest("creation"),materialReferencesDigest:productArtifactBodyDigest("materials"),protectedBody:body,ownerStageReceiptDigest:productArtifactBodyDigest("stage")});validateProductArtifactInspectionMetadataV1(header);assert(!JSON.stringify(header).includes(`${artifactType}-protected`));}
for(const value of ["product-question-workspace","leadership-conversation-history","replay-receipt","materialization-receipt","source-reference","stage-record"])assertProductArtifactNonBodyClassV1(value);
assert.throws(()=>assertProductArtifactNonBodyClassV1("workspace-body"));
console.log("Product artifact metadata inspection PASS (4 persisted headers; 6 non-body classes)");
