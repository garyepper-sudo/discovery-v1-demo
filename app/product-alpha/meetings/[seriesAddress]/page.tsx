import {auth} from "@clerk/nextjs/server";
import {notFound,redirect} from "next/navigation";
import DiscoveryShell from "../../../../components/product-shell/DiscoveryShell";
import ClerkSessionTerminationControl from "../../../../components/product-shell/ClerkSessionTerminationControl";
import { LeadershipConversationExperience } from "../../../../components/product-alpha/leadership-conversation/LeadershipConversationExperience";
import { composeChiefFirstPrepareViewFromWorkspace } from "../../../../product/integration/chiefLeadershipPreparationComposer";
import { createFounderMeetingHomeComposition } from "../../../../lib/alpha-activation/founderMeetingHomeComposition";
export const dynamic="force-dynamic";
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
    let pack=null,unavailable=false,refreshMeetingPackAvailable=false;
    try{
      pack=await server.readMeetingPack({...identity,seriesId:meeting.seriesId});
    }catch{unavailable=true;}
    if(pack)refreshMeetingPackAvailable=await server.refreshMeetingPack.available({...identity,seriesId:meeting.seriesId});
    return <DiscoveryShell organization={{organizationId:meeting.organizationId,organizationName:"Your organization",runtimeAvailable:true,coherence:null,confidence:null,coherenceLabel:"Understanding beginning"}} showSessionImpact={false} opaqueMeetingHref={`/product-alpha/meetings/${seriesAddress}`} sessionControl={<ClerkSessionTerminationControl />}><LeadershipConversationExperience initialWorkspace={workspace} prepare={prepare} valueLayer={undefined} personalSheet={undefined} occurrenceRef={meeting.occurrenceId} initialCheckpoint={null} initialMeetingPack={pack} meetingPackUnavailable={unavailable} refreshMeetingPackAvailable={refreshMeetingPackAvailable} workingAnalysisDigest={null} seriesAddress={seriesAddress} readOnlyMeetingHome/></DiscoveryShell>;
  }finally{await composition.close();}
 }
 const {default:SandboxMeetingHome}=await import("./SandboxMeetingHome");
 return <SandboxMeetingHome userId={userId} seriesAddress={seriesAddress} suppliedOrganization={suppliedOrganization}/>;
}
