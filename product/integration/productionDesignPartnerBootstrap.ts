import "server-only";

import { createHash } from "node:crypto";
import postgres from "postgres";

import { requireDiscoveryDatabaseUrl } from "../../db/config";
import { PostgresAlphaAccessRecordRepository, PostgresParticipantReferenceAccessRepository } from "../../db/governance/postgresRepositories";
import { CanonicalLocalSourceBindingService } from "../../engine/v3/governance/canonicalLocalSourceBindingService";
import { resolveScopedGovernanceContext, type ScopedAuthorityGrant } from "../../engine/v3/governance/scopedGovernanceContext";
import { decodeAndNormalizeSourceContent, GovernedSourceContentService, sourceContentDigest } from "../../engine/v3/sources";
import { resolveClerkStableInstanceIdentity } from "../../lib/auth/clerkStableInstanceIdentity";
import { ParticipantReferenceAccessAdministration, evaluateParticipantReferenceCurrentAccess } from "../../lib/alpha-activation/participantReferenceAccess";
import { OrganizationIdentityOwner } from "../../lib/alpha-provisioning/organizationIdentityOwner";
import { provisionOrganizationUnderstandingBootstrap } from "../../lib/alpha-provisioning/provisionDesignPartner";
import { completeRegisteredMeetingPreparationScopeV1, deriveRecurringMeetingOccurrenceIdentity, leadershipId } from "../workflow/leadershipConversation";
import { createProductionChiefInfrastructure } from "./productionChiefInfrastructure";
import { createHostedLeadershipConversationServerComposition } from "./leadershipConversationServerComposition";
import { createOpenAIExecutiveAnalysisTransport } from "../../lib/analysis/openAIExecutiveAnalysisTransport";

const PURPOSE = "leadership-conversation-capture" as const;
const key = /^[a-z0-9][a-z0-9._:-]{0,127}$/u;
const exact = (value: unknown): value is string => typeof value === "string" && value.trim() === value && value.length > 0 && value !== "*" && !value.includes("\0");
const digest = (value: unknown) => createHash("sha256").update(JSON.stringify(value)).digest("hex");

export type ProductionDesignPartnerBootstrapInputV1 = {
  contractVersion: "1";
  clerkSubject: string;
  organization: { creationKey: string; displayName: string; provenance: string };
  operationId: string;
  occurredAt: string;
  productQuestion: string;
  meetingExternalKey: string;
  meetingTitle: string;
  meetingPurpose: string;
  cadenceLabel: string;
  role: string;
  preparationScopeExternalKey: string;
  sources: readonly { externalKey: string; mediaType: "text/plain" | "text/markdown"; bytes: Uint8Array }[];
};

export type ProductionDesignPartnerBootstrapReceiptV1 = {
  contractVersion: "1";
  organizationId: string;
  participantRef: string;
  productQuestionId: string;
  seriesId: string;
  occurrenceId: string;
  preparationScopeId: string;
  preparedWorkProductVersionId: string;
  meetingAddress: string;
  sourceCount: number;
};

function inputIsValid(input: ProductionDesignPartnerBootstrapInputV1): void {
  if (process.env.NODE_ENV !== "production" || Object.keys(input).sort().join("\0") !== ["cadenceLabel", "clerkSubject", "contractVersion", "meetingExternalKey", "meetingPurpose", "meetingTitle", "occurredAt", "operationId", "organization", "preparationScopeExternalKey", "productQuestion", "role", "sources"].join("\0")) throw new Error("Production bootstrap is unavailable.");
  if (input.contractVersion !== "1" || ![input.clerkSubject, input.operationId, input.meetingExternalKey, input.preparationScopeExternalKey, input.organization.creationKey, input.organization.displayName, input.organization.provenance].every(exact) || ![input.operationId, input.meetingExternalKey, input.preparationScopeExternalKey, input.organization.creationKey].every(value => key.test(value))) throw new Error("Production bootstrap input is invalid.");
  if (![input.productQuestion, input.meetingTitle, input.meetingPurpose, input.cadenceLabel, input.role].every(value => exact(value) && value.length <= 500) || !Number.isFinite(Date.parse(input.occurredAt)) || new Date(input.occurredAt).toISOString() !== input.occurredAt || input.sources.length < 1 || input.sources.length > 5 || new Set(input.sources.map(source => source.externalKey)).size !== input.sources.length || input.sources.some(source => !exact(source.externalKey) || !key.test(source.externalKey) || !["text/plain", "text/markdown"].includes(source.mediaType) || !(source.bytes instanceof Uint8Array) || !source.bytes.byteLength || source.bytes.byteLength > 1024 * 1024)) throw new Error("Production bootstrap input is invalid.");
}

function authority(input:{organizationId:string;subjectId:string;issuer:string;at:string;operation:Parameters<typeof resolveScopedGovernanceContext>[0]["operation"]}) {
  const scope={organizationId:input.organizationId,type:"organization" as const,id:input.organizationId};
  const grant:ScopedAuthorityGrant={authorityRef:input.issuer,policyRef:"production-design-partner-bootstrap:v1",organizationId:input.organizationId,subjectId:input.subjectId,scope,operations:[input.operation],sensitivity:["standard"],relationship:"direct",status:"active",validFrom:input.at};
  return resolveScopedGovernanceContext({organizationId:input.organizationId,subjectId:input.subjectId,requestedScope:scope,operation:input.operation,purpose:PURPOSE,sensitivity:"standard",evaluatedAt:input.at,temporal:{mode:"current"},serverResolvedAuthority:[grant]});
}

/**
 * Closed, server-side operational composition.  It is intentionally not an API
 * route: callers provide the exact Clerk subject and immutable source bytes, and
 * every durable write is delegated to an existing canonical owner.
 */
export async function bootstrapProductionDesignPartner(input: ProductionDesignPartnerBootstrapInputV1): Promise<ProductionDesignPartnerBootstrapReceiptV1> {
  inputIsValid(input);
  const locatorKey=process.env.DISCOVERY_PARTICIPANT_IDENTITY_LOCATOR_KEY;
  const instance=resolveClerkStableInstanceIdentity(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if (!locatorKey || locatorKey.length < 32 || !instance) throw new Error("Production bootstrap is unavailable.");
  const infrastructure=createProductionChiefInfrastructure();
  const administration=postgres(requireDiscoveryDatabaseUrl("administration"),{max:1});
  const at=input.occurredAt, issuer=`production-design-partner-bootstrap:${input.operationId}`;
  const operationLock=`production-design-partner-bootstrap:${input.operationId}`;
  let lockAcquired=false;
  try {
    await infrastructure.sql`SELECT pg_advisory_lock(hashtextextended(${operationLock}, 0))`;
    lockAcquired=true;
    const organization=await new OrganizationIdentityOwner(administration).createOrResolveOrganization({...input.organization,createdAt:at});
    const organizationId=organization.organizationId;
    const bootstrap=await provisionOrganizationUnderstandingBootstrap({organizationId,organizationName:organization.displayName,purpose:input.meetingPurpose,primaryQuestion:input.productQuestion,meetingExternalKey:input.meetingExternalKey,bootstrapOperationId:input.operationId,actor:`production-design-partner-bootstrap:${input.operationId}`,createdAt:at,repository:infrastructure.runtime});
    const questionId=bootstrap.productQuestionId;
    const identities=new PostgresAlphaAccessRecordRepository(infrastructure.sql,undefined,locatorKey,instance);
    const participant=await identities.resolveOrBindExistingParticipantIdentity({provider:"clerk",providerSubject:input.clerkSubject,resolvedAt:at});
    const accessRepository=new PostgresParticipantReferenceAccessRepository(infrastructure.sql);
    const access=new ParticipantReferenceAccessAdministration(accessRepository);
    const existingRuntime=await infrastructure.runtime.read(organizationId);
    if(!existingRuntime) throw new Error("Production bootstrap organization Runtime is unavailable.");

    await access.activatePolicy({organizationId,issuerAuthority:issuer,operationId:`${input.operationId}:policy`,occurredAt:at});
    await access.grant({organizationId,participantRef:participant.participantRef,scope:"organization",issuerAuthority:issuer,operationId:`${input.operationId}:organization`,occurredAt:at});
    const bindings=new CanonicalLocalSourceBindingService(infrastructure.runtime,{now:()=>at});
    const content=new GovernedSourceContentService(infrastructure.sources,{loadRevisions:async ({organizationId,sourceBindingId})=>{const stored=await infrastructure.runtime.read(organizationId),all=stored?.runtime.memory.canonicalScopeLineageIndex?.sourceBindings??[],target=all.find(value=>value.bindingId===sourceBindingId);return target?all.filter(value=>value.source.sourceId===target.source.sourceId):[];}},{now:()=>at});
    const versions=[] as {sourceBindingId:string;sourceContentVersionId:string;normalizedContentDigest:string}[];
    for(const source of input.sources){
      const normalized=decodeAndNormalizeSourceContent(source.bytes).normalizedText, normalizedDigest=sourceContentDigest(new TextEncoder().encode(normalized));
      const stored=await infrastructure.runtime.read(organizationId); if(!stored) throw new Error("Production bootstrap Runtime is unavailable.");
      const context=authority({organizationId,subjectId:participant.participantRef,issuer,at,operation:"source-binding:register-local"});
      let binding; try { binding=await bindings.registerCanonicalLocalSourceBinding({contractVersion:"1",organizationId,productQuestionId:questionId,sourceType:source.mediaType==="text/markdown"?"markdown-upload":"plain-text-upload",purposeRef:PURPOSE,normalizedContentDigest:normalizedDigest,requestedScopeAssertions:[{relationship:"applies-to",scope:{organizationId,type:"organization",id:organizationId}}],sensitivity:"standard",authorization:context,recordedAt:at,recordedByActorRef:participant.participantRef,idempotencyKey:`${input.operationId}:source:${source.externalKey}:binding`,expectedRuntimeRevision:stored.revision,operation:{requestId:`${input.operationId}:source:${source.externalKey}:binding`,operatorId:participant.participantRef}}); } catch { const resolved=await bindings.resolveCanonicalCurrentSourceBinding({contractVersion:"1",organizationId,productQuestionId:questionId,sourceType:source.mediaType==="text/markdown"?"markdown-upload":"plain-text-upload",purposeRef:PURPOSE,normalizedContentDigest:normalizedDigest,requestedScopeAssertions:[{relationship:"applies-to",scope:{organizationId,type:"organization",id:organizationId}}],sensitivity:"standard",authorization:authority({organizationId,subjectId:participant.participantRef,issuer,at,operation:"source-binding:resolve-current"}),resolvedAt:at}); binding={sourceBindingId:resolved.binding.bindingId}; }
      const state=await content.inspectExactWriteState({organizationId,productQuestionId:questionId,sourceBindingId:binding.sourceBindingId,purposeRef:PURPOSE,normalizedContentDigest:normalizedDigest,exactContentDigest:sourceContentDigest(source.bytes),byteLength:source.bytes.byteLength,authorization:authority({organizationId,subjectId:participant.participantRef,issuer,at,operation:"source-content:write"})});
      if(state.status==="conflict") throw new Error("Production bootstrap source content conflicts.");
      if(state.status==="incomplete") await content.restoreMissingBody({contractVersion:"1",organizationId,sourceBindingId:binding.sourceBindingId,sourceContentVersionId:state.version.sourceContentVersionId,purposeRef:PURPOSE,bytes:source.bytes,restoredByActorRef:participant.participantRef,authorization:authority({organizationId,subjectId:participant.participantRef,issuer,at,operation:"source-content:write"})});
      if(state.status==="absent") await content.write({contractVersion:"1",organizationId,sourceBindingId:binding.sourceBindingId,purposeRef:PURPOSE,mediaType:source.mediaType,bytes:source.bytes,storedAt:at,storedByActorRef:participant.participantRef,idempotencyKey:`${input.operationId}:source:${source.externalKey}:content`,expectedRepositoryRevision:state.repositoryRevision,authorization:authority({organizationId,subjectId:participant.participantRef,issuer,at,operation:"source-content:write"})});
      const complete=await content.inspectExactWriteState({organizationId,productQuestionId:questionId,sourceBindingId:binding.sourceBindingId,purposeRef:PURPOSE,normalizedContentDigest:normalizedDigest,exactContentDigest:sourceContentDigest(source.bytes),byteLength:source.bytes.byteLength,authorization:authority({organizationId,subjectId:participant.participantRef,issuer,at,operation:"source-content:write"})});
      if(complete.status!=="complete") throw new Error("Production bootstrap source content is incomplete.");
      versions.push({sourceBindingId:binding.sourceBindingId,sourceContentVersionId:complete.version.sourceContentVersionId,normalizedContentDigest:normalizedDigest});
    }
    const identity=deriveRecurringMeetingOccurrenceIdentity({organizationId,meetingExternalKey:input.meetingExternalKey}), seriesId=identity.seriesId;
    const scope=completeRegisteredMeetingPreparationScopeV1({contractVersion:"1",scopeId:leadershipId("registered-meeting-preparation-scope",organizationId,seriesId,input.preparationScopeExternalKey),organizationId,questionId,conversationId:identity.conversationId,seriesId,sourceVersions:versions.sort((a,b)=>a.sourceBindingId.localeCompare(b.sourceBindingId)),createdAt:at,createdByUserId:input.clerkSubject,idempotencyKeyDigest:leadershipId("general-recurring-meeting-scope-key",organizationId,input.meetingExternalKey),requestFingerprint:digest(input)});
    const before=await infrastructure.workflow.read(organizationId); await infrastructure.workflow.registerMeetingPreparationScope({...scope,expectedRevision:before.revision});
    await access.grant({organizationId,participantRef:participant.participantRef,scope:"meeting-series",meetingSeriesId:seriesId,issuerAuthority:issuer,operationId:`${input.operationId}:series`,occurredAt:at});
    const grants:ScopedAuthorityGrant["operations"]=["source-binding:resolve-current","source-content:read-for-proposal","source-content:read-for-claim-support","product-artifact:read","product-artifact:reuse","product-artifact:compare","product-workspace:read"];
    const server=createHostedLeadershipConversationServerComposition({runtimeRepository:infrastructure.runtime,workflowRepository:infrastructure.workflow as never,sourceRepository:infrastructure.sources,bodyRepository:infrastructure.artifactBodies,executiveHistoryRepository:infrastructure.executiveHistory,analysisLifecycleStore:infrastructure.analysisLifecycle,analysisTransport:createOpenAIExecutiveAnalysisTransport(),analysisModel:process.env.DISCOVERY_ALPHA_ANALYSIS_MODEL,analysisTimeoutMs:120000,persistedPreparedWorkLineage:true,authorityGrants:[{authorityRef:issuer,policyRef:"production-design-partner-bootstrap:v1",organizationId,subjectId:input.clerkSubject,scope:{organizationId,type:"organization",id:organizationId},operations:grants,sensitivity:["standard"],relationship:"direct",status:"active",validFrom:at}],authorized:(userId,candidateOrganizationId)=>userId===input.clerkSubject&&candidateOrganizationId===organizationId,participantRefForUser:userId=>userId===input.clerkSubject?participant.participantRef:undefined,currentMeetingAccess:async value=>{const policy=await accessRepository.findPolicy(value.organizationId),organizationGrants=await accessRepository.findGrants({organizationId:value.organizationId,participantRef:participant.participantRef,scope:"organization"}),meeting=await accessRepository.findGrants({organizationId:value.organizationId,participantRef:participant.participantRef,scope:"meeting-series",meetingSeriesId:value.seriesId});return evaluateParticipantReferenceCurrentAccess({policy,organizationGrants,meetingGrants:meeting,organizationId:value.organizationId,participantRef:participant.participantRef,meetingSeriesId:value.seriesId})==="authorized";},resolvePersonaKey:()=>undefined,resolvePersonaUser:()=>undefined});
    const prepared=await server.activateAndPrepareWithIdentity({contractVersion:"1",userId:input.clerkSubject,organizationId,questionId,meetingTitle:input.meetingTitle,timeframe:input.cadenceLabel,role:input.role,purpose:input.meetingPurpose,authorizedSourceRefs:versions.map(value=>value.sourceContentVersionId),idempotencyKey:leadershipId("general-recurring-meeting-activation",organizationId,input.meetingExternalKey),identity});
    const address=createHash("sha256").update(`meeting-series-address:v1:${organizationId}:${seriesId}`).digest("base64url").slice(0,24);
    return {contractVersion:"1",organizationId,participantRef:participant.participantRef,productQuestionId:questionId,seriesId,occurrenceId:identity.conversationId,preparationScopeId:scope.scopeId,preparedWorkProductVersionId:prepared.provenance.preparedWorkProductVersionId,meetingAddress:address,sourceCount:versions.length};
  } finally {
    try { if(lockAcquired) await infrastructure.sql`SELECT pg_advisory_unlock(hashtextextended(${operationLock}, 0))`; }
    finally { await Promise.all([infrastructure.close(),administration.end({timeout:1})]); }
  }
}
