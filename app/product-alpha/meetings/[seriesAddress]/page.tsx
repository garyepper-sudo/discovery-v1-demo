import {auth} from "@clerk/nextjs/server";
import {notFound} from "next/navigation";
import DiscoveryShell from "../../../../components/product-shell/DiscoveryShell";
import {MeetingPortfolioShell} from "../../../../components/product-alpha/meetings/MeetingPortfolioShell";
import {LeadershipConversationExperience} from "../../../../components/product-alpha/leadership-conversation/LeadershipConversationExperience";
import {authorizedMeetingDirectory,resolveAuthorizedMeetingAddress} from "../../../../product/integration/authorizedMeetingDirectory";
import {createLeadershipConversationServerComposition,resolveCurrentLeadershipConversationCheckpoint} from "../../../../product/integration/leadershipConversationServerComposition";
import {getPersonalRoomSheetPreviewAction} from "../../leadership-conversation/actions";
import {composeChiefFirstPrepareViewFromWorkspace} from "../../../../product/integration/chiefLeadershipPreparationComposer";
import {compileChiefOfStaffValueLayerV1} from "../../../../product/workflow/leadershipConversation/chiefCommunicationPlan";
import {SANDBOX_ORGANIZATION_ID} from "../../../../lib/access/sandboxMultiUserAccess";
export const dynamic="force-dynamic";
export default async function MeetingHome({params}:{params:Promise<{seriesAddress:string}>}){
 const {userId}=await auth();if(!userId)notFound();
 const {seriesAddress}=await params,meeting=await resolveAuthorizedMeetingAddress({userId,organizationId:SANDBOX_ORGANIZATION_ID,seriesAddress});if(!meeting)notFound();
 const server=createLeadershipConversationServerComposition(),workspace=await server.workspace({userId,organizationId:meeting.organizationId,questionId:meeting.questionId,conversationId:meeting.occurrenceId});
 let prepare=composeChiefFirstPrepareViewFromWorkspace(workspace);if(meeting.predecessorOccurrenceId)prepare={...prepare,seriesId:meeting.seriesId,priorCycle:{status:"completed",message:"The prior reviewed occurrence is closed and its approved continuity is reflected here."}};
 let pack=null,unavailable=false;try{pack=await server.readMeetingPack({userId,organizationId:meeting.organizationId,questionId:meeting.questionId,conversationId:meeting.occurrenceId,seriesId:meeting.seriesId})}catch{unavailable=true}
 const personal=await getPersonalRoomSheetPreviewAction(seriesAddress),checkpoint=workspace.currentStep==="capture"||workspace.currentStep==="review"?await resolveCurrentLeadershipConversationCheckpoint({userId,organizationId:meeting.organizationId,questionId:meeting.questionId,conversationId:meeting.occurrenceId,seriesId:meeting.seriesId}):null,directory=await authorizedMeetingDirectory({userId,organizationId:meeting.organizationId});
 return <DiscoveryShell organization={{organizationId:meeting.organizationId,organizationName:"Northstar Implementation Services",runtimeAvailable:true,coherence:null,confidence:null,coherenceLabel:"Understanding available"}} showSessionImpact={false}><MeetingPortfolioShell meetings={directory}><LeadershipConversationExperience initialWorkspace={workspace} prepare={prepare} valueLayer={compileChiefOfStaffValueLayerV1(prepare)} personalSheet={personal.sheet} occurrenceRef={personal.occurrenceRef} initialCheckpoint={checkpoint?{checkpointId:checkpoint.checkpointId,contributionArtifactIds:checkpoint.contributionArtifactIds}:null} initialMeetingPack={pack} meetingPackUnavailable={unavailable} seriesAddress={seriesAddress} occurrenceLabel={meeting.predecessorOccurrenceId?"Successor occurrence":"Current occurrence"}/></MeetingPortfolioShell></DiscoveryShell>
}
