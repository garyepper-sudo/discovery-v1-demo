import {auth} from "@clerk/nextjs/server";
import {notFound,redirect} from "next/navigation";
import DiscoveryShell from "../../../../components/product-shell/DiscoveryShell";
import ClerkSessionTerminationControl from "../../../../components/product-shell/ClerkSessionTerminationControl";
import { LeadershipConversationExperience } from "../../../../components/product-alpha/leadership-conversation/LeadershipConversationExperience";
import { composeChiefFirstPrepareViewFromWorkspace } from "../../../../product/integration/chiefLeadershipPreparationComposer";
import { createFounderMeetingHomeComposition } from "../../../../lib/alpha-activation/founderMeetingHomeComposition";
import type { LeadershipConversationWorkspaceV1 } from "../../../../product/workflow/leadershipConversation";
export const dynamic="force-dynamic";
function founderReviewProjection(workspace:LeadershipConversationWorkspaceV1):LeadershipConversationWorkspaceV1{return{closeContinuation:workspace.closeContinuation,currentStep:workspace.currentStep,workflowRevision:null,proposals:workspace.proposals.map(proposal=>({proposalId:proposal.proposalId,kind:proposal.kind,payload:{summary:proposal.payload.summary},reviewedCarryForward:proposal.reviewedCarryForward?{evidentiaryStatus:proposal.reviewedCarryForward.evidentiaryStatus,citations:proposal.reviewedCarryForward.citations.map(citation=>({sourceId:citation.sourceId,sourceVersion:citation.sourceVersion,bodyDigest:""}))}:undefined})),dispositions:workspace.dispositions.map(value=>({proposalId:value.proposalId,disposition:value.disposition,dispositionReceiptId:value.dispositionReceiptId,effectivePayload:value.effectivePayload?{summary:value.effectivePayload.summary}:null})),canonicalRoutingReceipts:workspace.canonicalRoutingReceipts.map(value=>({proposalId:value.proposalId,dispositionReceiptId:value.dispositionReceiptId,ownerKind:value.ownerKind})),reviewedCarryForwardNonpromotions:workspace.reviewedCarryForwardNonpromotions.map(value=>({proposalId:value.proposalId,dispositionReceiptId:value.dispositionReceiptId})),reviewedCarryForwardCompletion:workspace.reviewedCarryForwardCompletion?{counts:workspace.reviewedCarryForwardCompletion.counts}:null,actions:workspace.actions.map(value=>({id:value.id,enabled:value.enabled,requiredAuthority:"",blockedReason:value.blockedReason?"Unavailable.":null}))} as unknown as LeadershipConversationWorkspaceV1;}
export default async function MeetingHome({params,searchParams}:{params:Promise<{seriesAddress:string}>;searchParams:Promise<{organizationId?:string|string[]}>}){
 const {userId}=await auth();if(!userId)notFound();
 const {seriesAddress}=await params;
 const suppliedOrganization=(await searchParams).organizationId;
 if(process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED==="true"){
  const composition=await createFounderMeetingHomeComposition(seriesAddress);
  try{
    const {server,meeting,request}=composition;
    if(suppliedOrganization!==undefined){if(typeof suppliedOrganization!=="string"||suppliedOrganization!==meeting.organizationId)notFound();redirect(`/product-alpha/meetings/${seriesAddress}`);}
    const identity={userId:request.consumerId,organizationId:meeting.organizationId,questionId:meeting.questionId,conversationId:meeting.occurrenceId};
    const workspace=await server.workspace({...identity,seriesId:meeting.seriesId}),prepare=composeChiefFirstPrepareViewFromWorkspace(workspace);
    let pack=null,unavailable=false,refreshMeetingPackAvailable=false,reviewedCarryForwardAvailable=false;
    try{
      pack=await server.readMeetingPack({...identity,seriesId:meeting.seriesId});
    }catch{unavailable=true;}
    if(pack)refreshMeetingPackAvailable=await server.refreshMeetingPack.available({...identity,seriesId:meeting.seriesId});
    if(pack&&!workspace.proposals.length)reviewedCarryForwardAvailable=await server.reviewedCarryForwardFromMeetingPackAvailable({...identity,seriesId:meeting.seriesId});
    return <DiscoveryShell organization={{organizationId:meeting.organizationId,organizationName:"Your organization",runtimeAvailable:true,coherence:null,confidence:null,coherenceLabel:"Understanding beginning"}} showSessionImpact={false} opaqueMeetingHref={`/product-alpha/meetings/${seriesAddress}`} sessionControl={<ClerkSessionTerminationControl />}><LeadershipConversationExperience initialWorkspace={founderReviewProjection(workspace)} prepare={prepare} valueLayer={undefined} personalSheet={undefined} occurrenceRef={meeting.occurrenceId} initialCheckpoint={null} initialMeetingPack={pack} meetingPackUnavailable={unavailable} refreshMeetingPackAvailable={refreshMeetingPackAvailable} reviewedCarryForwardAvailable={reviewedCarryForwardAvailable} workingAnalysisDigest={null} seriesAddress={seriesAddress} readOnlyMeetingHome/></DiscoveryShell>;
  }finally{await composition.close();}
 }
 const {default:SandboxMeetingHome}=await import("./SandboxMeetingHome");
 return <SandboxMeetingHome userId={userId} seriesAddress={seriesAddress} suppliedOrganization={suppliedOrganization}/>;
}
