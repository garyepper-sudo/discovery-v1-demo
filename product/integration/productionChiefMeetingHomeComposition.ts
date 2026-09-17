import "server-only";

import {createHash} from "node:crypto";

import {PostgresAlphaAccessRecordRepository,PostgresParticipantReferenceAccessRepository} from "../../db/governance/postgresRepositories";
import {ExistingParticipantIdentityResolutionService} from "../../lib/auth/existingParticipantIdentityResolutionCore";
import {resolveClerkStableInstanceIdentity} from "../../lib/auth/clerkStableInstanceIdentity";
import {resolveVerifiedConsumerIdentityFromClerk} from "../../lib/auth/resolveVerifiedConsumerIdentityFromClerk";
import {createOpenAIExecutiveAnalysisTransport} from "../../lib/analysis/openAIExecutiveAnalysisTransport";
import {evaluateParticipantReferenceCurrentAccess} from "../../lib/alpha-activation/participantReferenceAccess";
import type {ScopedAuthorityGrant} from "../../engine/v3/governance/scopedGovernanceContext";
import type {AuthorizedMeetingResolutionV1} from "./authorizedMeetingDirectory";
import {createHostedLeadershipConversationServerComposition} from "./leadershipConversationServerComposition";
import {createProductionChiefInfrastructure} from "./productionChiefInfrastructure";

const address=(organizationId:string,seriesId:string)=>createHash("sha256").update(`meeting-series-address:v1:${organizationId}:${seriesId}`).digest("base64url").slice(0,24);
const operations:ScopedAuthorityGrant["operations"]=["source-binding:resolve-current","source-content:read-for-proposal","source-content:read-for-claim-support","product-artifact:read","product-artifact:reuse","product-artifact:compare","product-workspace:read","product-artifact:prepare-again","product-artifact:create-successor","leadership-history:list","leadership-history:read","historical-checkpoint-lifecycle-link:publish","historical-checkpoint-lifecycle-link:list","historical-checkpoint-lifecycle-link:read"];

/** Request-local hosted composition. It resolves Clerk identity and current
 * participant grants before exposing an opaque meeting address. */
export async function createProductionChiefMeetingHomeComposition(seriesAddress:string){
  if(process.env.NODE_ENV!=="production"||!/^[A-Za-z0-9_-]{24}$/.test(seriesAddress))throw new Error("Meeting is unavailable.");
  const verified=await resolveVerifiedConsumerIdentityFromClerk();
  const locatorKey=process.env.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY,instance=resolveClerkStableInstanceIdentity(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if(verified.status!=="verified"||!locatorKey||locatorKey.length<32||!instance)throw new Error("Meeting is unavailable.");
  const infrastructure=createProductionChiefInfrastructure();
  try{
    const identities=new ExistingParticipantIdentityResolutionService(new PostgresAlphaAccessRecordRepository(infrastructure.sql,undefined,locatorKey,instance));
    const identity=await identities.lookupExistingParticipantBinding(verified);
    if(identity.status!=="found")throw new Error("Meeting is unavailable.");
    const accessRepository=new PostgresParticipantReferenceAccessRepository(infrastructure.sql);
    const currentAccess=async(organizationId:string,seriesId:string)=>{
      const policy=await accessRepository.findPolicy(organizationId);
      const [organization,meeting]=await Promise.all([accessRepository.findGrants({organizationId,participantRef:identity.participantRef,scope:"organization"}),accessRepository.findGrants({organizationId,participantRef:identity.participantRef,scope:"meeting-series",meetingSeriesId:seriesId})]);
      return evaluateParticipantReferenceCurrentAccess({policy,organizationGrants:organization,meetingGrants:meeting,organizationId,participantRef:identity.participantRef,meetingSeriesId:seriesId})==="authorized";
    };
    const organizations=await accessRepository.findOrganizationIdsForParticipant(identity.participantRef),matches:AuthorizedMeetingResolutionV1[]=[];
    for(const organizationId of organizations){
      const store=(await infrastructure.workflow.read(organizationId)).store;
      for(const context of store.contexts){
        if(context.organizationId!==organizationId)continue;
        const scopes=(store.registeredMeetingPreparationScopes??[]).filter(value=>value.organizationId===organizationId&&value.questionId===context.questionId&&value.conversationId===context.conversationId),seriesIds=new Set(scopes.map(value=>value.seriesId));
        if(seriesIds.size!==1)continue;
        const seriesId=[...seriesIds][0]!;
        if(address(organizationId,seriesId)!==seriesAddress||!await currentAccess(organizationId,seriesId))continue;
        const links=store.futurePreparationLinks.filter(value=>value.organizationId===organizationId&&value.questionId===context.questionId&&value.conversationId===context.conversationId),closures=(store.cycle1ClosureCompletions??[]).filter(value=>value.organizationId===organizationId&&value.questionId===context.questionId&&value.conversationId===context.conversationId);
        if(links.length>1||closures.length>1)throw new Error("Meeting is unavailable.");
        const link=links[0],successor=link?store.contexts.filter(value=>value.conversationId===link.nextConversationId):[];
        if(link&&(!closures[0]||link.contractVersion!=="2"||successor.length!==1||link.seriesId!==seriesId||link.sourceClosureId!==closures[0]!.closureId||link.sourceClosureDigest!==closures[0]!.contentDigest))throw new Error("Meeting is unavailable.");
        matches.push({organizationId,questionId:context.questionId,seriesId,occurrenceId:link?.nextConversationId??context.conversationId,predecessorOccurrenceId:link?context.conversationId:null,seriesAddress,title:context.title,timeframe:context.timeframe,phase:"Prepare",packStatus:"Needs preparation",nextAction:"Prepare",materialChangeCount:null});
      }
    }
    if(matches.length!==1)throw new Error("Meeting is unavailable.");
    const meeting=matches[0]!,requestMeetingAccess=async(input:{userId:string;organizationId:string;seriesId:string})=>input.userId===verified.identity.consumerId&&input.organizationId===meeting.organizationId&&input.seriesId===meeting.seriesId&&await currentAccess(input.organizationId,input.seriesId);
    const authorityGrants:ScopedAuthorityGrant[]=[{authorityRef:"participant-reference-current-access:v1",policyRef:"participant-reference-v1",organizationId:meeting.organizationId,subjectId:verified.identity.consumerId,scope:{organizationId:meeting.organizationId,type:"organization",id:meeting.organizationId},operations,sensitivity:["standard"],relationship:"direct",status:"active",validFrom:"2026-01-01T00:00:00.000Z"}];
    const server=createHostedLeadershipConversationServerComposition({runtimeRepository:infrastructure.runtime,workflowRepository:infrastructure.workflow as unknown as ReturnType<typeof import("../workflow/leadershipConversation/productWorkflowArtifactRepository").createProductWorkflowArtifactRepository>,sourceRepository:infrastructure.sources,bodyRepository:infrastructure.artifactBodies,executiveHistoryRepository:infrastructure.executiveHistory,analysisLifecycleStore:infrastructure.analysisLifecycle,analysisTransport:createOpenAIExecutiveAnalysisTransport(),analysisModel:process.env.DISCOVERY_ALPHA_ANALYSIS_MODEL,analysisTimeoutMs:120000,persistedPreparedWorkLineage:true,authorityGrants,authorized:(userId,organizationId)=>userId===verified.identity.consumerId&&organizationId===meeting.organizationId,participantRefForUser:userId=>userId===verified.identity.consumerId?identity.participantRef:undefined,currentMeetingAccess:requestMeetingAccess,resolvePersonaKey:()=>undefined,resolvePersonaUser:()=>undefined});
    return{server,identity:{userId:verified.identity.consumerId,participantRef:identity.participantRef},meeting,directory:matches,close:infrastructure.close};
  }catch(error){await infrastructure.close();throw error;}
}
