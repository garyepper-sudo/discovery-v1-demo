import "server-only";

import postgres from "postgres";
import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository, PostgresParticipantReferenceAccessRepository } from "../../db/governance/postgresRepositories";
import { ExistingParticipantIdentityResolutionService } from "../auth/existingParticipantIdentityResolutionCore";
import { resolveClerkStableInstanceIdentity } from "../auth/clerkStableInstanceIdentity";
import { resolveVerifiedConsumerIdentityFromClerk } from "../auth/resolveVerifiedConsumerIdentityFromClerk";
import { ParticipantReferenceAccessAdministration } from "./participantReferenceAccess";
import { createFounderFirstUnderstandingOwnerBundleFromEnvironment } from "./founderFirstUnderstandingOwnerBundle";
import { verifyFounderFirstUnderstandingRequest, type FounderFirstUnderstandingVerifiedRequest } from "./founderFirstUnderstandingRequestAuthority";
import { FounderFirstUnderstandingApplicationService } from "./founderFirstUnderstandingApplicationService";

export type FounderFirstUnderstandingRequestComposition={participantRef:string;consumerId:string;access:ParticipantReferenceAccessAdministration;accessRepository:PostgresParticipantReferenceAccessRepository;verifiedRequest:FounderFirstUnderstandingVerifiedRequest;close():Promise<void>};
/** Constructs only from a verified active request and an existing V2 mapping.
 * It never creates a participant binding and owns no browser-provided identity. */
export async function createFounderFirstUnderstandingRequestComposition():Promise<FounderFirstUnderstandingRequestComposition>{
 if(process.env.NODE_ENV==="production"||process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED!=="true")throw new Error("Founder Local Alpha is unavailable.");
 const verified=await resolveVerifiedConsumerIdentityFromClerk();if(verified.status!=="verified")throw new Error("Founder participant identity is unavailable.");
 const key=process.env.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY,instance=resolveClerkStableInstanceIdentity(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);if(!key||key.length<32||!instance)throw new Error("Founder participant identity is unavailable.");
 const sql=postgres(requireDiscoveryDatabaseUrl("application"),{max:1});try{const verifiedRequest=await verifyFounderFirstUnderstandingRequest(verified,new PostgresAlphaAccessRecordRepository(sql,undefined,key,instance));const accessRepository=new PostgresParticipantReferenceAccessRepository(sql);return{participantRef:verifiedRequest.participantRef,consumerId:verifiedRequest.consumerId,verifiedRequest,access:new ParticipantReferenceAccessAdministration(accessRepository),accessRepository,close:async()=>{await sql.end({timeout:1});}};}catch(error){await sql.end({timeout:1});throw error;}
}

/** Complete request composition owns its client through final cleanup. */
export async function createFounderFirstUnderstandingApplicationServiceFromRequest() {
 const request=await createFounderFirstUnderstandingRequestComposition();
 try { return new FounderFirstUnderstandingApplicationService(createFounderFirstUnderstandingOwnerBundleFromEnvironment(request)); }
 catch(error) { await request.close(); throw error; }
}
