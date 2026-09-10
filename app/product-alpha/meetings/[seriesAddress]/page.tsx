import {auth} from "@clerk/nextjs/server";
import {notFound,redirect} from "next/navigation";
import DiscoveryShell from "../../../../components/product-shell/DiscoveryShell";
import {resolveFounderFirstUnderstandingMeetingHome} from "../../../../lib/alpha-activation/founderFirstUnderstandingMeetingHome";
import {FounderAddGovernedContextForm} from "../../../../components/product-alpha/meetings/FounderAddGovernedContextForm";
import {FounderAddContextRecovery} from "../../../../components/product-alpha/meetings/FounderAddContextRecovery";
export const dynamic="force-dynamic";
export default async function MeetingHome({params,searchParams}:{params:Promise<{seriesAddress:string}>;searchParams:Promise<{organizationId?:string|string[]}>}){
 const {userId}=await auth();if(!userId)notFound();
 const {seriesAddress}=await params;
 const suppliedOrganization=(await searchParams).organizationId;
 if(process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED==="true"){
  const founder=await resolveFounderFirstUnderstandingMeetingHome(seriesAddress,suppliedOrganization);
  if(founder?.status==="organization-conflict"||founder?.status!=="found")notFound();
  if(suppliedOrganization!==undefined)redirect(`/product-alpha/meetings/${seriesAddress}`);
  const destination=`/product-alpha/meetings/${seriesAddress}`;
  return <DiscoveryShell organization={{organizationId:"",organizationName:founder.organizationName,runtimeAvailable:true,coherence:null,confidence:null,coherenceLabel:"Understanding beginning"}} showSessionImpact={false} opaqueMeetingHref={destination}><main style={{maxWidth:800,margin:"32px auto",padding:24,color:"#17221d"}}><h1>{founder.title}</h1><p>{founder.cadence}</p><h2>{founder.question}</h2><p>{founder.sourceCount} governed sources are connected to this question.</p><h2>{founder.sourceCount===1?"Initial Prepared Work":"Updated Prepared Work"}</h2><p>{founder.prepared.situationSummary}</p><ul>{founder.prepared.uncertaintyAndLimitations.map(value=><li key={value}>{value}</li>)}</ul><p>No prior reviewed state or meeting history exists.</p>{founder.recovery.status==="available"&&<FounderAddContextRecovery seriesAddress={seriesAddress}/>} {founder.canAddContext&&<FounderAddGovernedContextForm seriesAddress={seriesAddress} currentSourceCount={founder.sourceCount} question={founder.question}/>}</main></DiscoveryShell>;
 }
 const {default:SandboxMeetingHome}=await import("./SandboxMeetingHome");
 return <SandboxMeetingHome userId={userId} seriesAddress={seriesAddress} suppliedOrganization={suppliedOrganization}/>;
}
