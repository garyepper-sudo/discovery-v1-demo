import "server-only";
import type { PostgresAlphaAccessRecordRepository } from "../../db/governance/postgresRepositories";
import { ExistingParticipantIdentityResolutionService, type VerifiedClerkLocator } from "../auth/existingParticipantIdentityResolutionCore";

const issued=new WeakSet<object>();
export type FounderFirstUnderstandingVerifiedRequest = {readonly participantRef:string;readonly consumerId:string;readonly route:"/onboarding/first-understanding";readonly namespaceScheme:"clerk-user-v2";readonly namespaceAnchorId:string};
export async function verifyFounderFirstUnderstandingRequest(verified:VerifiedClerkLocator,repository:PostgresAlphaAccessRecordRepository):Promise<FounderFirstUnderstandingVerifiedRequest>{
 if(process.env.NODE_ENV==="production")throw new Error("Founder Local Alpha is unavailable.");
 const namespace=await repository.inspectActiveParticipantIdentityNamespace();
 if(namespace?.scheme!=="clerk-user-v2")throw new Error("Active V2 participant namespace is unavailable.");
 const binding=await new ExistingParticipantIdentityResolutionService(repository).lookupExistingParticipantBinding(verified);
 if(binding.status!=="found")throw new Error("Founder participant setup is required.");
 const result=Object.freeze({participantRef:binding.participantRef,consumerId:verified.identity.consumerId,route:"/onboarding/first-understanding" as const,namespaceScheme:namespace.scheme,namespaceAnchorId:namespace.anchorId});issued.add(result);return result;
}
export function assertFounderFirstUnderstandingVerifiedRequest(value:FounderFirstUnderstandingVerifiedRequest):void {if(process.env.NODE_ENV==="production"||!issued.has(value)||value.route!=="/onboarding/first-understanding"||value.namespaceScheme!=="clerk-user-v2")throw new Error("Verified founder request authority is unavailable.");}
/** Synthetic identity is available exclusively through isolated-validation composition. */
export function createFounderFirstUnderstandingVerifiedRequestForIsolatedValidation(participantRef:string,consumerId:string):FounderFirstUnderstandingVerifiedRequest {if(process.env.NODE_ENV!=="test")throw new Error("Isolated request authority is unavailable.");const result=Object.freeze({participantRef,consumerId,route:"/onboarding/first-understanding" as const,namespaceScheme:"clerk-user-v2" as const,namespaceAnchorId:"isolated-validation-anchor"});issued.add(result);return result;}
