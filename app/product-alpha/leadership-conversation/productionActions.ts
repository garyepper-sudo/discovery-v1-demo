"use server";

import "server-only";

import {createHash} from "node:crypto";

import {createProductionChiefMeetingHomeComposition} from "../../../product/integration/productionChiefMeetingHomeComposition";
import {leadershipStableSerialize} from "../../../product/workflow/leadershipConversation/determinism";
import type {MeetingPackPrivateNoteIntentV1} from "../../../product/workflow/leadershipConversation/meetingPackContracts";

const opaqueAddress=(value:unknown):string=>{
  if(typeof value!=="string"||!/^[A-Za-z0-9_-]{24}$/.test(value))throw new Error("Meeting is unavailable.");
  return value;
};
const digest=(value:unknown)=>createHash("sha256").update(leadershipStableSerialize(value)).digest("hex");

/**
 * Production-only opaque-address action boundary.  Every invocation creates a
 * fresh request composition, which re-authenticates Clerk and re-evaluates the
 * participant's organization and exact-series grants before any protected
 * workflow, source, or artifact owner is reached.
 */
async function withCurrentMeeting<T>(seriesAddress:unknown, work:(input:{server:Awaited<ReturnType<typeof createProductionChiefMeetingHomeComposition>>["server"];identity:{userId:string;organizationId:string;questionId:string;conversationId:string};seriesId:string})=>Promise<T>):Promise<T>{
  const composition=await createProductionChiefMeetingHomeComposition(opaqueAddress(seriesAddress));
  try{
    const {server,meeting}=composition,identity={userId:composition.identity.userId,organizationId:meeting.organizationId,questionId:meeting.questionId,conversationId:meeting.occurrenceId};
    // This is deliberately before the supplied work: it is the per-invocation
    // current-access gate, not authority captured when the page rendered.
    await server.workspace({...identity,seriesId:meeting.seriesId});
    return await work({server,identity,seriesId:meeting.seriesId});
  }finally{await composition.close();}
}

export async function buildProductionMeetingPackAction(seriesAddress:string){return withCurrentMeeting(seriesAddress,({server,identity,seriesId})=>server.buildMeetingPack({...identity,seriesId}));}
export async function refreshProductionMeetingPackAction(seriesAddress:string){return withCurrentMeeting(seriesAddress,({server,identity,seriesId})=>server.refreshMeetingPack({...identity,seriesId}));}
export async function addProductionMeetingPackPrivateNoteAction(input:{seriesAddress:string;text:string;intent:MeetingPackPrivateNoteIntentV1}){
  if(!input||typeof input.text!=="string"||!(["keep-private","talking-points","agenda"] as const).includes(input.intent))throw new Error("Meeting pack request is invalid.");
  return withCurrentMeeting(input.seriesAddress,({server,identity,seriesId})=>server.addMeetingPackPrivateNote({...identity,seriesId,text:input.text.trim(),intent:input.intent,idempotencyKey:`production-meeting-pack-note:${digest({seriesId,text:input.text.trim(),intent:input.intent})}`}));
}
export async function saveProductionMeetingPackAction(input:{seriesAddress:string;agendaText:string;talkingPointsText:string;expectedArtifactRevision:string}){
  if(!input||typeof input.agendaText!=="string"||typeof input.talkingPointsText!=="string"||typeof input.expectedArtifactRevision!=="string")throw new Error("Meeting pack request is invalid.");
  return withCurrentMeeting(input.seriesAddress,({server,identity,seriesId})=>server.reviseMeetingPack({...identity,seriesId,agendaText:input.agendaText,talkingPointsText:input.talkingPointsText,expectedArtifactRevision:input.expectedArtifactRevision,idempotencyKey:`production-meeting-pack-save:${digest(input)}`}));
}
export async function generateProductionSourceScopedAnalysisAction(seriesAddress:string){return withCurrentMeeting(seriesAddress,async({server,identity,seriesId})=>({result:await server.analyzeSourceScoped({...identity,seriesId,occurrenceId:identity.conversationId}),failureCategory:null}));}
export async function startProductionReviewedCarryForwardAction(input:{seriesAddress:string}){return withCurrentMeeting(input?.seriesAddress,({server,identity,seriesId})=>server.startReviewedCarryForwardAcknowledged({...identity,seriesId}));}
export async function reviewProductionCarryForwardAction(input:{seriesAddress:string;proposalId:string;disposition:"accept"|"correct"|"reject"|"needs-information";correctedSummary?:string}){
  if(!input||typeof input.proposalId!=="string"||!(["accept","correct","reject","needs-information"] as const).includes(input.disposition)||input.correctedSummary!==undefined&&typeof input.correctedSummary!=="string")throw new Error("Review request is invalid.");
  return withCurrentMeeting(input.seriesAddress,({server,identity,seriesId})=>server.reviewCarryForwardAcknowledged({...identity,seriesId,proposalId:input.proposalId,disposition:input.disposition,correctedSummary:input.correctedSummary}));
}
export async function resumeProductionCarryForwardAction(input:{seriesAddress:string;proposalId?:string}){return withCurrentMeeting(input?.seriesAddress,({server,identity,seriesId})=>server.resumeCarryForwardAcknowledged({...identity,seriesId,purposeRef:"leadership-conversation-capture",proposalId:input.proposalId}));}
export async function finalizeProductionCarryForwardAction(seriesAddress:string){return withCurrentMeeting(seriesAddress,({server,identity,seriesId})=>server.finalizeReviewedCarryForward({...identity,seriesId}));}
export async function closeAndContinueProductionOccurrenceAction(seriesAddress:string){return withCurrentMeeting(seriesAddress,({server,identity,seriesId})=>server.closeAndContinue({...identity,seriesId}));}
