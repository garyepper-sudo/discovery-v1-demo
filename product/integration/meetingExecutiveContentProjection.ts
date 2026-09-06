import type { LeadershipConversationWorkspaceV1 } from "../workflow/leadershipConversation";
import type {ChiefMeetingPackBodyV1} from "../workflow/leadershipConversation/meetingPackContracts";

export type MeetingExecutiveContinuityV1={label:"Decision"|"Explicit non-decision"|"Open commitment"|"Unresolved question"|"Changed understanding"|"Still uncertain";text:string};
export type WorkflowOnlyTalkingPointV1={itemId:string;itemIndex:number;originKind:"reviewed-closure";semanticKind:"workflow-status"};
export function projectExecutiveTalkingPoints(talkingPoints:ChiefMeetingPackBodyV1["talkingPoints"],workflowOnly:WorkflowOnlyTalkingPointV1[]):ChiefMeetingPackBodyV1["talkingPoints"]{const hidden=new Set(workflowOnly.map(item=>item.itemIndex));return{...talkingPoints,doNotForget:talkingPoints.doNotForget.filter((_,index)=>!hidden.has(index))};}
export function projectSavedTalkingPointAdditions(generatedText:string,savedText:string):string[]{if(savedText===generatedText)return[];const generated=new Map<string,number>();for(const line of generatedText.split("\n").map(value=>value.trim()).filter(Boolean))generated.set(line,(generated.get(line)??0)+1);const additions:string[]=[];for(const line of savedText.split("\n").map(value=>value.trim()).filter(Boolean)){const remaining=generated.get(line)??0;if(remaining){generated.set(line,remaining-1);continue;}additions.push(line.startsWith("- ")||line.startsWith("* ")?line.slice(2):line);}return additions;}

export function projectMeetingExecutiveContinuity(workspace:LeadershipConversationWorkspaceV1):{items:MeetingExecutiveContinuityV1[];workflowDetails:string[];workflowOnlyTalkingPoints:WorkflowOnlyTalkingPointV1[]}{
  const closure=workspace.closureCompletion;if(!closure)return{items:[],workflowDetails:[],workflowOnlyTalkingPoints:[]};
  const retained=new Map<string,{sectionIndex:number;itemIndex:number;semanticKind:"workflow-status"|"substantive"}>();
  closure.sections.forEach((section,sectionIndex)=>{if(section.label==="What remains unresolved")return;section.items.forEach((item,itemIndex)=>{const normalized=item.trim();if(normalized&&!retained.has(normalized)&&retained.size<6)retained.set(normalized,{sectionIndex,itemIndex,semanticKind:section.label==="Checkpoint status"?"workflow-status":"substantive"});});});
  const workflowOnlyTalkingPoints=[...retained.values()].map((item,itemIndex)=>({...item,itemIndex})).filter((item):item is typeof item&{semanticKind:"workflow-status"}=>item.semanticKind==="workflow-status").map(item=>({itemId:`${closure.closureId}:section:${item.sectionIndex}:item:${item.itemIndex}`,itemIndex:item.itemIndex,originKind:"reviewed-closure" as const,semanticKind:item.semanticKind}));
  const items:MeetingExecutiveContinuityV1[]=[];
  for(const disposition of workspace.dispositions){
    const proposal=workspace.proposals.find(value=>value.proposalId===disposition.proposalId);if(!proposal)continue;
    const summary=(disposition.effectivePayload??proposal.payload).summary;
    const nonpromotion=workspace.reviewedCarryForwardNonpromotions.find(value=>value.proposalId===proposal.proposalId&&value.dispositionReceiptId===disposition.dispositionReceiptId);
    const route=workspace.canonicalRoutingReceipts.find(value=>value.proposalId===proposal.proposalId&&value.dispositionReceiptId===disposition.dispositionReceiptId);
    if(disposition.disposition==="deferred"){items.push({label:"Unresolved question",text:summary});continue;}
    if(disposition.disposition==="rejected"||disposition.disposition==="duplicate")continue;
    if(proposal.kind==="decision-draft"&&nonpromotion){items.push({label:"Explicit non-decision",text:"The decision remains unresolved because the required current information was unavailable."});continue;}
    if(proposal.kind==="decision-draft"){items.push({label:"Decision",text:summary});continue;}
    if(proposal.kind==="commitment"){items.push({label:"Open commitment",text:summary});continue;}
    if(proposal.kind==="unknown"||proposal.kind==="follow-up-question"){items.push({label:"Unresolved question",text:summary});continue;}
    if(route?.changeFacts.organizationalUnderstanding==="changed"){items.push({label:"Changed understanding",text:summary});continue;}
    if(proposal.kind==="assumption-change"){items.push({label:"Still uncertain",text:summary});}
  }
  return{items:items.slice(0,5),workflowDetails:closure.sections.flatMap(section=>section.items.map(item=>`${section.label}: ${item}`)),workflowOnlyTalkingPoints};
}
