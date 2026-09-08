import "server-only";
import { createHash } from "node:crypto";
import { createProductWorkflowArtifactRepository } from "../workflow/leadershipConversation/productWorkflowArtifactRepository";
import type { MeetingSeriesCurrentAccess, AuthorizedMeetingResolutionV1 } from "./authorizedMeetingDirectory";

const address=(organizationId:string,seriesId:string)=>createHash("sha256").update(`meeting-series-address:v1:${organizationId}:${seriesId}`).digest("base64url").slice(0,24);
/** Founder path: persisted workflow only; it never consults fixture lineage or
 * sandbox personas. */
export async function founderAuthorizedMeetingDirectory(input:{userId:string;organizationId:string;questionId:string;workflowRoot:string;currentAccess:MeetingSeriesCurrentAccess}):Promise<AuthorizedMeetingResolutionV1[]>{
 const {store}=await createProductWorkflowArtifactRepository({root:input.workflowRoot,environment:"development"}).read(input.organizationId),result:AuthorizedMeetingResolutionV1[]=[];
 for(const context of store.contexts.filter(value=>value.organizationId===input.organizationId&&value.questionId===input.questionId)){const scopes=(store as typeof store&{registeredMeetingPreparationScopes?:import("../workflow/leadershipConversation").RegisteredMeetingPreparationScopeV1[]}).registeredMeetingPreparationScopes?.filter(value=>value.organizationId===input.organizationId&&value.questionId===input.questionId&&value.conversationId===context.conversationId)??[];if(scopes.length!==1)continue;const seriesId=scopes[0]!.seriesId,decision=await input.currentAccess.authorize({userId:input.userId,organizationId:input.organizationId,seriesId});if(decision!=="authorized"&&decision!=="legacy-confirmed")continue;result.push({organizationId:input.organizationId,questionId:input.questionId,seriesId,occurrenceId:context.conversationId,predecessorOccurrenceId:null,seriesAddress:address(input.organizationId,seriesId),title:context.title,timeframe:context.timeframe,phase:"Prepare",packStatus:"Needs preparation",nextAction:"Prepare",materialChangeCount:null});}return result.sort((a,b)=>a.title.localeCompare(b.title));
}
