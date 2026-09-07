import "server-only";
import postgres from "postgres";
import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository, PostgresParticipantReferenceAccessRepository } from "../../db/governance/postgresRepositories";
import { ExistingParticipantIdentityResolutionService } from "../auth/existingParticipantIdentityResolutionCore";
import { resolveClerkStableInstanceIdentity } from "../auth/clerkStableInstanceIdentity";
import { resolveVerifiedConsumerIdentityFromClerk } from "../auth/resolveVerifiedConsumerIdentityFromClerk";
import { ParticipantReferenceMeetingCurrentAccess, type ParticipantReferenceAccessDecision } from "./participantReferenceAccess";
export type ParticipantReferenceBridgeOutcome=ParticipantReferenceAccessDecision;
const unavailable={authorize:async():Promise<ParticipantReferenceBridgeOutcome>=>"unavailable"};
export function createParticipantReferenceMeetingCurrentAccessFromEnvironment(){const key=process.env.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY,instance=resolveClerkStableInstanceIdentity(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);let url:string;try{url=requireDiscoveryDatabaseUrl("application");}catch{return unavailable;}if(!key||key.length<32||!instance)return unavailable;return{async authorize(input:{userId:string;organizationId:string;seriesId:string}):Promise<ParticipantReferenceBridgeOutcome>{const verified=await resolveVerifiedConsumerIdentityFromClerk();if(verified.status!=="verified"||verified.identity.consumerId!==input.userId)return"denied";const sql=postgres(url,{max:1});try{return await new ParticipantReferenceMeetingCurrentAccess(new PostgresParticipantReferenceAccessRepository(sql),new ExistingParticipantIdentityResolutionService(new PostgresAlphaAccessRecordRepository(sql,undefined,key,instance))).authorize({verifiedLocator:verified,organizationId:input.organizationId,meetingSeriesId:input.seriesId});}catch{return"unavailable";}finally{await sql.end({timeout:1});}}};}
