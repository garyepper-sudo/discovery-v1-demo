import "server-only";

import type { ScopedGovernanceContext } from "../../engine/v3/governance/scopedGovernanceContext";
import type { ProductArtifactBodyRepository } from "../persistence";
import {
  assertLeadershipConversationPublicationProofV1,
  type PreparedWorkProductPublicationV1,
  type ProductWorkflowArtifactRepository,
} from "../workflow/leadershipConversation";
import type {
  HistoricalPredecessorBodySafeProjectionV2,
  HistoricalPredecessorCurrentAccessRequestV2,
  HistoricalPredecessorCurrentAccessResultV2,
  ProductArtifactCurrentAccessOperationV1,
  ProductArtifactCurrentOwnerStateV1,
} from "../workflow/productArtifactCurrentAccessContracts";
import type { PreparedWorkProductBodyV1 } from "../workflow/leadershipConversation";
import { productArtifactBodyDigest } from "../persistence";
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
  resolveHistoricalPredecessorOwnerState?(
    input: CanonicalProductArtifactReadRequestV1,
    metadata: ProductArtifactInspectionMetadataV1,
    request: HistoricalPredecessorCurrentAccessRequestV2,
  ): Promise<{state:ProductArtifactCurrentOwnerStateV1;durableRevoked:boolean}>;
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

  async readHistoricalPredecessor(
    request: HistoricalPredecessorCurrentAccessRequestV2,
  ):Promise<HistoricalPredecessorCurrentAccessResultV2>{
    const finish=(outcome:HistoricalPredecessorCurrentAccessResultV2["outcome"],projection:HistoricalPredecessorBodySafeProjectionV2|null,currentAccessResultDigest:string|null):HistoricalPredecessorCurrentAccessResultV2=>{const unsigned={contractVersion:"2" as const,organizationId:request.organizationId,productQuestionId:request.productQuestionId,meetingSeriesId:request.meetingSeriesId,predecessorOccurrenceId:request.predecessorOccurrenceId,predecessorConversationId:request.predecessorConversationId,predecessorCheckpointId:request.predecessorCheckpointId,subjectId:request.subjectId,artifactId:request.artifactId,artifactRevision:request.artifactRevision,outcome,projection,currentAccessResultDigest};return{...unsigned,resultDigest:productArtifactBodyDigest(unsigned)};};
    if(request.contractVersion!=="2"||!request.organizationId||!request.predecessorArtifactOrganizationId||!request.productQuestionId||!request.meetingSeriesId||!request.predecessorOccurrenceId||!request.predecessorConversationId||!request.predecessorCheckpointId||!request.subjectId||!request.artifactId||!request.artifactRevision||!request.headerDigest||!request.bodyRefDigest)return finish("malformed",null,null);
    const input:CanonicalProductArtifactReadRequestV1={contractVersion:"1",organizationId:request.organizationId,subjectId:request.subjectId,artifactType:"prepared-work",artifactId:request.artifactId,artifactRevision:request.artifactRevision,operation:"product-artifact:prepare-again",purpose:request.purpose,scopeDigest:request.scopeDigest,sensitivity:request.sensitivity,evaluatedAt:request.evaluatedAt};
    if(!await this.dependencies.preauthorize(input))return finish("withheld",null,null);
    if(request.predecessorArtifactOrganizationId!==request.organizationId)return finish("foreign",null,null);
    if(request.predecessorOccurrenceId!==request.predecessorConversationId)return finish("stale",null,null);
    const occurrence=await this.dependencies.productWorkflowRepository.readOccurrence?.({organizationId:request.organizationId,questionId:request.productQuestionId,seriesId:request.meetingSeriesId,conversationId:request.predecessorConversationId});
    if(!occurrence)return finish("absent",null,null);
    const publications=(occurrence.store.preparedWorkPublications??[]).filter(value=>value.artifactId===request.artifactId&&value.artifactRevision===request.artifactRevision);
    if(publications.length>1)return finish("ambiguous",null,null);
    const publication=publications[0];
    if(!publication)return finish("absent",null,null);
    const checkpoints=(occurrence.store.frozenSnapshotPublications??[]).filter(value=>value.productWorkflowId===`leadership-conversation:${request.predecessorConversationId}`&&value.artifactId===request.predecessorCheckpointId&&value.preparedWorkProductVersionId===request.artifactRevision);
    if(checkpoints.length>1)return finish("ambiguous",null,null);
    if(checkpoints.length!==1)return finish("stale",null,null);
    if(publication.productQuestionId!==request.productQuestionId||publication.organizationId!==request.organizationId)return finish("foreign",null,null);
    if(publication.headerDigest!==request.headerDigest||publication.protectedBody.refDigest!==request.bodyRefDigest)return finish("malformed",null,null);
    const inspected=await this.inspector.inspect({...input,preauthorized:true});
    if(inspected.disposition!=="available")return finish("withheld",null,null);
    try{await this.assertPersistedPublicationProof(input,inspected.metadata);}catch{return finish("malformed",null,null);}
    const governance=await this.dependencies.resolveGovernance(input);
    const historicalState=this.dependencies.resolveHistoricalPredecessorOwnerState?await this.dependencies.resolveHistoricalPredecessorOwnerState(input,inspected.metadata,request):{state:await this.dependencies.resolveCurrentOwnerState(input,inspected.metadata),durableRevoked:false},current=historicalState.state;
    const access=resolveProductArtifactCurrentAccessV1({contractVersion:"1",organizationId:input.organizationId,subjectId:input.subjectId,operation:input.operation,purpose:input.purpose,scopeDigest:input.scopeDigest,sensitivity:input.sensitivity,evaluatedAt:input.evaluatedAt,metadata:inspected.metadata,governance},current);
    if(access.disposition!=="eligible")return finish(historicalState.durableRevoked?"revoked":"withheld",null,access.resultDigest);
    let body:PreparedWorkProductBodyV1;try{body=JSON.parse(new TextDecoder().decode(await this.reader.read({metadata:inspected.metadata,access}))) as PreparedWorkProductBodyV1;const arrays=[body.content.whatChanged,body.content.decisionsRequiringAttention,body.content.importantTensions,body.content.contradictions,body.content.unknowns,body.content.priorCommitments,body.content.suggestedAgenda,body.content.talkingPoints,body.content.questionsToResolve,body.content.evidenceReferences,body.content.uncertaintyAndLimitations,body.content.unavailableAreas,body.lineage.sourceRevisionReferences,body.lineage.canonicalChangeReceiptReferences];if(body.contractVersion!=="1"||typeof body.content.headline!=="string"||typeof body.content.situationSummary!=="string"||!body.content.headline.trim()||!body.content.situationSummary.trim()||arrays.some(values=>!Array.isArray(values)||values.some(value=>typeof value!=="string"||!value.trim()))||typeof body.lineage.questionRevision!=="number"||!body.lineage.authorizedProjectionRevision||!body.lineage.authorizedProjectionDigest||!body.lineage.productCommunicationRevision||!body.lineage.productCommunicationDigest||typeof body.createdAt!=="string"||!['product-communication','leader-edit'].includes(body.createdBy))throw new Error("invalid");}catch{return finish("malformed",null,access.resultDigest);}
    const content={whatChanged:[...body.content.whatChanged],whatMattersNow:[body.content.situationSummary,...body.content.decisionsRequiringAttention],tensions:[...body.content.importantTensions,...body.content.contradictions],unknowns:[...body.content.unknowns],commitments:[...body.content.priorCommitments],questions:[...body.content.questionsToResolve],uncertainty:[...body.content.uncertaintyAndLimitations]};
    const base={contractVersion:"2" as const,organizationId:request.organizationId,productQuestionId:request.productQuestionId,meetingSeriesId:request.meetingSeriesId,predecessorOccurrenceId:request.predecessorOccurrenceId,predecessorConversationId:request.predecessorConversationId,predecessorCheckpointId:request.predecessorCheckpointId,artifactId:request.artifactId,artifactRevision:request.artifactRevision,headerDigest:publication.headerDigest,bodyRefDigest:publication.protectedBody.refDigest,materialLineageDigest:publication.materialLineage!.envelopeDigest,content},projection={...base,projectionDigest:productArtifactBodyDigest(base)};
    return finish("accessible",projection,access.resultDigest);
  }
}
