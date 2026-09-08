import "server-only";
import path from "node:path";
import { FilesystemOrganizationRuntimeRepository } from "../../engine/v3/runtime/organizationRuntimeRepository";
import { createProductWorkflowArtifactRepository } from "../../product/workflow/leadershipConversation/productWorkflowArtifactRepository";
import { createProductArtifactBodyRepository } from "../../product/persistence/productArtifactBodyRepository";
import { validateProductArtifactInspectionMetadataV1 } from "../../product/workflow/productArtifactInspectionMetadataContracts";
import type { PreparedWorkProductBodyV1, RegisteredMeetingPreparationScopeV1 } from "../../product/workflow/leadershipConversation";
import { founderAuthorizedMeetingDirectory } from "../../product/integration/founderAuthorizedMeetingDirectory";
import { buildProductQuestionWorkspace } from "../../product/workflow/buildProductQuestionWorkspace";
import { createFounderFirstUnderstandingRequestComposition } from "./founderFirstUnderstandingRequestComposition";

/** A bounded current-grant projection of initial Prepared Work; no Pack or
 * source body is loaded by this Meeting Home path. */
export async function resolveFounderFirstUnderstandingMeetingHome(seriesAddress: string) {
  if (process.env.NODE_ENV === "production" || process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED !== "true" || !/^[A-Za-z0-9_-]{24}$/u.test(seriesAddress)) return null;
  const request = await createFounderFirstUnderstandingRequestComposition();
  try {
    const runtime = new FilesystemOrganizationRuntimeRepository(), root = path.join(process.cwd(),".discovery-runtime"), workflowRoot = process.env.DISCOVERY_LEADERSHIP_CONVERSATION_WORKFLOW_ROOT ?? path.join(root,"product-workflow"), workflow = createProductWorkflowArtifactRepository({ root: workflowRoot, environment:"development" }), bodies = createProductArtifactBodyRepository({ root: process.env.DISCOVERY_PRODUCT_ARTIFACT_BODY_ROOT ?? path.join(root,"product-artifact-bodies") });
    const matches=[];
    for (const organizationId of await request.accessRepository.findOrganizationIdsForParticipant(request.participantRef)) {
      const policy = await request.accessRepository.findPolicy(organizationId);
      if (policy?.mode !== "participant-reference-v1") continue;
      const stored = await runtime.read(organizationId), bootstrap = stored?.runtime.memory.initialUnderstandingBootstrap;
      if (!stored || !bootstrap) continue;
      const meetings = await founderAuthorizedMeetingDirectory({ userId: request.consumerId, organizationId, questionId: bootstrap.initialProductQuestionId, workflowRoot, currentAccess:{ authorize:async ({userId,organizationId:target,seriesId})=>{
        if(userId!==request.consumerId||target!==organizationId)return "denied";
        const org=await request.accessRepository.findGrants({organizationId,participantRef:request.participantRef,scope:"organization"}), meeting=await request.accessRepository.findGrants({organizationId,participantRef:request.participantRef,scope:"meeting-series",meetingSeriesId:seriesId});
        return org.filter(value=>value.status==="active").length===1&&meeting.filter(value=>value.status==="active").length===1?"authorized":"denied";
      }}});
      for(const meeting of meetings.filter(value=>value.seriesAddress===seriesAddress)) {
        const {store}=await workflow.read(organizationId), scopes=(store as typeof store&{registeredMeetingPreparationScopes?:RegisteredMeetingPreparationScopeV1[]}).registeredMeetingPreparationScopes??[], scope=scopes.find(value=>value.organizationId===organizationId&&value.questionId===meeting.questionId&&value.conversationId===meeting.occurrenceId&&value.seriesId===meeting.seriesId), publications=(store.preparedWorkPublications??[]).filter(value=>value.productQuestionId===meeting.questionId&&value.productWorkflowId===`leadership-conversation:${meeting.occurrenceId}`);
        if(!scope||publications.length!==1)continue;
        const publication=publications[0]!,lineage=publication.materialLineage;
        validateProductArtifactInspectionMetadataV1(publication);
        if(lineage?.contractVersion!=="3"||lineage.bootstrapFingerprint!==bootstrap.requestFingerprint||lineage.preparationScopeDigest!==scope.scopeDigest)continue;
        const prepared=JSON.parse(new TextDecoder().decode(await bodies.readStagedExact(publication.protectedBody))) as PreparedWorkProductBodyV1;
        matches.push({organizationId,organizationName:stored.runtime.metadata.name??"Your organization",title:meeting.title,cadence:meeting.timeframe,question:buildProductQuestionWorkspace({runtime:stored.runtime,questionId:meeting.questionId}).question.title,sourceCount:scope.sourceVersions.length,prepared:prepared.content});
      }
    }
    return matches.length===1?matches[0]!:null;
  } finally { await request.close(); }
}
