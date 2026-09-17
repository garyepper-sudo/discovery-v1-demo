"use server";

import { auth } from "@clerk/nextjs/server";
import { createLeadershipConversationServerComposition, readOptionalMeetingPackForAskV1, resolveCurrentLeadershipConversationCheckpoint, resolveCurrentLeadershipConversationClosureMetadata, type ReviewedCarryForwardFinalizationAcknowledgementV1 } from "../../../product/integration/leadershipConversationServerComposition";
import type { CanonicalProductWorkspaceAdapter } from "../../../product/integration/canonicalProductWorkspaceAdapter";
import type { ChiefFirstPrepareActivationV1 } from "../../../product/workflow/leadershipConversation";
import { composeChiefFirstPrepareViewFromWorkspace } from "../../../product/integration/chiefLeadershipPreparationComposer";
import { composeChiefLeadershipAnalysisToAction } from "../../../product/integration/chiefLeadershipAnalysisToActionComposer";
import { createPersonalRoomSheetConfirmationDigest, projectContentSafePersonalRoomSheet } from "../../../product/integration/chiefPersonalRoomSheetComposer";
import { readNorthstarPreparationLineageSeed } from "../../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { SANDBOX_ORGANIZATION_ID } from "../../../product/simulations/living-organization-sandbox/manifest";
import { NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE, northstarLeadershipConversationFixture, type LeadershipConversationWorkspaceV1, type ProposalDisposition } from "../../../product/workflow/leadershipConversation";
import { resolveEvidenceAcceptanceContinuationV1 } from "../../../product/workflow/leadershipConversation/operations";
import { createPersonalRoomSheetReplayKey, PERSONAL_ROOM_SHEET_CONTRACT_VERSION, reconstructPersonalRoomSheetContributionActionState, resolvePersonalRoomSheetContribution, stabilizePersonalRoomSheetPrepareInput, type PersonalRoomSheetConfirmationRequestV1, type PersonalRoomSheetConfirmationResponseV1, type PersonalRoomSheetContributionActionState } from "../../../product/workflow/leadershipConversation/personalRoomSheetContracts";
import { compileChiefOfStaffValueLayerV1 } from "../../../product/workflow/leadershipConversation/chiefCommunicationPlan";
import { writeAlphaOperationalLog } from "../../../lib/operations/alphaOperationalLog";
import type { AlphaContentSafeObservabilityEventV1 } from "../../../lib/observability/alphaContentSafeObservabilityContracts";
import { createAlphaTelemetryComposition } from "../../../lib/telemetry/alphaTelemetryComposition";
import { assertClosedFeedback, type AlphaFeedbackDimension, type AlphaFeedbackRating } from "../../../lib/telemetry/alphaProductTelemetryContracts";
import { unavailable } from "../../../lib/analysis/sourceScopedExecutiveAnalysisContracts";
import type { MeetingPackPrivateNoteIntentV1 } from "../../../product/workflow/leadershipConversation/meetingPackContracts";
import { leadershipDigest, leadershipStableSerialize } from "../../../product/workflow/leadershipConversation/determinism";
import { resolveAuthorizedMeetingAddress } from "../../../product/integration/authorizedMeetingDirectory";
import {projectMeetingAskAnswer,type MeetingAskAnswerV1} from "../../../product/integration/meetingAskProjection";
import {createParticipantReferenceMeetingCurrentAccessFromEnvironment} from "../../../lib/alpha-activation/participantReferenceMeetingAccessServer";
import { createFounderMeetingHomeComposition } from "../../../lib/alpha-activation/founderMeetingHomeComposition";
import { createMeetingPackBuildTrace } from "../../../lib/observability/meetingPackBuildTrace";

async function resolveCurrentAuthorizedMeeting(userId:string,seriesAddress:string){return resolveAuthorizedMeetingAddress({userId,organizationId:SANDBOX_ORGANIZATION_ID,seriesAddress,currentAccess:createParticipantReferenceMeetingCurrentAccessFromEnvironment()??undefined});}

function guard(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Leadership Conversation development route is unavailable.");
  }
}
function observeJourney(workflowStage:AlphaContentSafeObservabilityEventV1["workflowStage"],transitionCategory:AlphaContentSafeObservabilityEventV1["transitionCategory"],outcomeCategory:AlphaContentSafeObservabilityEventV1["outcomeCategory"],failureCategory:AlphaContentSafeObservabilityEventV1["failureCategory"]="none"){void writeAlphaOperationalLog({eventCategory:"workflow-transition",workflowStage,transitionCategory,outcomeCategory,failureCategory},undefined,{organizationScope:SANDBOX_ORGANIZATION_ID});}
async function authorizedTelemetryIdentity(){const userId=await signedInUserId(),server=createLeadershipConversationServerComposition();if(!await server.authorizePageCurrentAccess({userId,organizationId:SANDBOX_ORGANIZATION_ID}))throw new Error("Telemetry operation is unavailable.");return{userId,organizationId:SANDBOX_ORGANIZATION_ID};}
export async function observeLeadershipConversationBrowserEventAction(input:{stage:AlphaContentSafeObservabilityEventV1["workflowStage"];transition:AlphaContentSafeObservabilityEventV1["transitionCategory"];outcome:AlphaContentSafeObservabilityEventV1["outcomeCategory"];viewport:AlphaContentSafeObservabilityEventV1["viewportCategory"]}){const identity=await authorizedTelemetryIdentity();await writeAlphaOperationalLog({eventCategory:"browser",workflowStage:input.stage,transitionCategory:input.transition,outcomeCategory:input.outcome,failureCategory:input.outcome==="browser-failure"?"browser":"none",viewportCategory:input.viewport,occurrenceCategory:"occurrence-1"},undefined,{organizationScope:identity.organizationId});}
export async function submitAlphaTelemetryFeedbackAction(input:{dimension:AlphaFeedbackDimension;rating:AlphaFeedbackRating}){const identity=await authorizedTelemetryIdentity();assertClosedFeedback(input);const telemetry=createAlphaTelemetryComposition();if(telemetry)await telemetry.telemetry.feedback(identity.organizationId,input);return{accepted:true as const};}
export async function submitAlphaProgressiveDisclosureAction(category:"questions-tensions"|"reasoning-provenance"){const identity=await authorizedTelemetryIdentity(),telemetry=createAlphaTelemetryComposition();if(telemetry)await telemetry.telemetry.progressiveDisclosure(identity.organizationId,category);return{accepted:true as const};}

async function signedInUserId(): Promise<string> {
  guard();
  const { userId } = await auth();
  if (!userId) throw new Error("Leadership Conversation authentication is required.");
  return userId;
}

async function composeCurrentPersonalRoomSheet(seriesAddress?:string) {
  const {server,identity,seriesId}=await occurrence1Context(seriesAddress),userId=identity.userId;
  const fixtureRoot = process.env.DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT;
  if (!fixtureRoot) throw new Error("Northstar preparation lineage seed is unavailable.");
  const seed = await readNorthstarPreparationLineageSeed({ fixtureRoot, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: "northstar-preparation-lineage-fixture-v1", provisioningKey: "northstar-preparation-lineage:v1" }), fixture = northstarLeadershipConversationFixture(seed.productQuestionId), workspace = await server.workspace(identity), baseView=composeChiefFirstPrepareViewFromWorkspace(workspace),view = stabilizePersonalRoomSheetPrepareInput({...baseView,seriesId}), replayKey = createPersonalRoomSheetReplayKey(`${seed.seedDigest}:${seriesId}:${identity.conversationId}`, userId), support = await server.resolveEvidenceSupport({ contractVersion: "1", organizationId: seed.organizationId, questionId: seed.productQuestionId, subjectId: userId, requestedScope: { organizationId: seed.organizationId, type: "organization", id: seed.organizationId }, purposeRef: seed.purpose, sensitivity: seed.sensitivity, evaluatedAt: workspace.context?.recordedAt ?? fixture.at, evidenceIds: seed.canonicalMaterial.map(item => item.canonicalObjectId), replayKey }), candidate = composeChiefLeadershipAnalysisToAction({ view, productQuestion: workspace.base.base.question.text, meetingPurpose: view.meeting.purpose, support, permissionScope: "organization", replayKey });
  const sheet = await server.composePersonalRoomSheet({ userId, organizationId: seed.organizationId, seriesId, occurrenceId: identity.conversationId, questionId: seed.productQuestionId, meetingPurpose: view.meeting.purpose, sourceProjectionDigest: support.projection.projectionDigest, analysis: candidate.analysis, b11Plan: candidate.communication.plan, b11CommunicationDigest: candidate.communication.rendered.planDigest });
  return { sheet, occurrenceRef: view.conversationId };
}

export async function getPersonalRoomSheetPreviewAction(seriesAddress?:string) {
  const current = await composeCurrentPersonalRoomSheet(seriesAddress);
  return { sheet: projectContentSafePersonalRoomSheet(current.sheet), occurrenceRef: current.occurrenceRef };
}

export async function confirmPersonalRoomSheetAction(input: PersonalRoomSheetConfirmationRequestV1&{seriesAddress?:string}): Promise<PersonalRoomSheetConfirmationResponseV1> {
  if (input.contractVersion !== PERSONAL_ROOM_SHEET_CONTRACT_VERSION || !Number.isSafeInteger(input.requestSequence) || input.requestSequence < 0) throw new Error("Personal Room Sheet confirmation request is invalid.");
  const current = await composeCurrentPersonalRoomSheet(input.seriesAddress), sheet = current.sheet;
  if (input.occurrenceRef !== current.occurrenceRef || input.expectedSourceProjectionDigest !== sheet.sourceProjectionDigest || input.expectedCandidate1AssessmentDigest !== sheet.candidate1AssessmentDigest || input.expectedB11CommunicationDigest !== sheet.b11CommunicationDigest || input.expectedPersonalRoomSheetDigest !== sheet.personalRoomSheetDigest) throw Object.assign(new Error("Personal Room Sheet confirmation is stale."), { code: "PERSONAL_ROOM_SHEET_STALE" });
  return { contractVersion: PERSONAL_ROOM_SHEET_CONTRACT_VERSION, sheet: projectContentSafePersonalRoomSheet(sheet), personalRoomSheetDigest: sheet.personalRoomSheetDigest, confirmationDigest: createPersonalRoomSheetConfirmationDigest(sheet), requestSequence: input.requestSequence };
}

export async function getLeadershipConversationWorkspaceAction(input: {
  organizationId: string;
  questionId: string;
  conversationId: string;
}) {
  const userId = await signedInUserId();
  return createLeadershipConversationServerComposition().workspace({ ...input, userId });
}
export async function activateAndPrepareLeadershipConversationAction(input:ChiefFirstPrepareActivationV1){observeJourney("activate","attempted","attempted");const result=await createLeadershipConversationServerComposition().activateAndPrepare({...input,userId:await signedInUserId()});observeJourney("prepare","completed","success");return result;}
function exactActionRecord(value:unknown,keys:readonly string[]):value is Record<string,unknown>{return Boolean(value&&typeof value==="object"&&!Array.isArray(value)&&Object.keys(value).length===keys.length&&keys.every(key=>Object.prototype.hasOwnProperty.call(value,key)));}
function parseGenerateSourceScopedExecutiveAnalysisArguments(argumentsList:readonly unknown[]):string|undefined{if(argumentsList.length>1||argumentsList.length===1&&typeof argumentsList[0]!=="string")throw new Error("Generate analysis request is invalid.");return argumentsList[0] as string|undefined;}
export async function generateSourceScopedExecutiveAnalysisAction(...runtimeArguments:unknown[]){const seriesAddress=parseGenerateSourceScopedExecutiveAnalysisArguments(runtimeArguments);try{const context=await currentMeetingPackContext(seriesAddress);try{return await context.server.analyzeSourceScopedForDevelopment({...context.identity,seriesId:context.seriesId,occurrenceId:context.identity.conversationId});}finally{await context.close();}}catch{return{result:unavailable(0),failureCategory:"source-access-changed" as const};}}
export async function askMeetingDiscoveryAction(...runtimeArguments:unknown[]):Promise<MeetingAskAnswerV1>{const input=runtimeArguments[0];if(runtimeArguments.length!==1||!exactActionRecord(input,["seriesAddress","question"])||typeof input.seriesAddress!=="string"||typeof input.question!=="string"||!input.question.trim()||input.question.trim().length>500)throw new Error("Meeting question is invalid.");const context=await currentMeetingPackContext(input.seriesAddress);try{const analysisResult=await context.server.analyzeSourceScopedForDevelopment({...context.identity,seriesId:context.seriesId,occurrenceId:context.identity.conversationId});if(analysisResult.result.status!=="eligible")return projectMeetingAskAnswer({scope:"this meeting",question:input.question,candidate:null,pack:null});const packResult=await readOptionalMeetingPackForAskV1(context.server,{...context.identity,seriesId:context.seriesId});return projectMeetingAskAnswer({scope:"this meeting",question:input.question,candidate:analysisResult.result.candidate,pack:packResult.status==="current"?packResult.pack:null});}finally{await context.close();}}
function assertGetMeetingPackArguments(argumentsList:readonly unknown[]):void{if(argumentsList.length!==0)throw new Error("Meeting Pack request is invalid.");}
export async function getMeetingPackAction(...runtimeArguments:unknown[]){assertGetMeetingPackArguments(runtimeArguments);const context=await currentMeetingPackContext();try{return await context.server.readMeetingPack({...context.identity,seriesId:context.seriesId});}finally{await context.close();}}
type CriticalAcknowledgement=import("../../../product/integration/leadershipConversationServerComposition").ReviewedCarryForwardCriticalAcknowledgementV1;
async function closeCriticalContext(outcome:CriticalAcknowledgement,close:(()=>Promise<void>)|undefined):Promise<CriticalAcknowledgement>{
  if(close)try{await close();}catch{if(["created","already-available","saved","already-saved","complete","already-complete"].includes(outcome.status))return{action:outcome.action,status:"saved-refresh-required",nextStep:"reload"};}
  return outcome;
}
export async function startReviewedCarryForwardFromMeetingPackAction(input:{seriesAddress:string},...extraArguments:unknown[]):Promise<CriticalAcknowledgement>{
  let outcome:CriticalAcknowledgement={action:"start-review",status:"outcome-unavailable",nextStep:"reload"},close:(()=>Promise<void>)|undefined;
  if(extraArguments.length||!exactActionRecord(input,["seriesAddress"])||typeof input.seriesAddress!=="string")return outcome;
  try{const context=await currentMeetingPackContext(input.seriesAddress);close=context.close;outcome=await context.server.startReviewedCarryForwardAcknowledged({...context.identity,seriesId:context.seriesId});}catch{/* Keep authority and transport failures bounded. */}
  return closeCriticalContext(outcome,close);
}
function parseAddMeetingPackPrivateNoteArguments(argumentsList:readonly unknown[]):{text:string;intent:MeetingPackPrivateNoteIntentV1}{const input=argumentsList[0];if(argumentsList.length!==1||!exactActionRecord(input,["text","intent"])||typeof input.text!=="string"||!(["keep-private","talking-points","agenda"] as const).includes(input.intent as MeetingPackPrivateNoteIntentV1))throw new Error("Private context request is invalid.");return{text:input.text,intent:input.intent as MeetingPackPrivateNoteIntentV1};}
async function assertMeetingPreparationOpen(context:Awaited<ReturnType<typeof currentMeetingPackContext>>){const workspace=await context.server.workspace({...context.identity,seriesId:context.seriesId});if(!["prepare","freeze","set-up"].includes(workspace.currentStep))throw new Error("Meeting preparation is frozen.");}
export async function addMeetingPackPrivateNoteAction(input:{text:string;intent:MeetingPackPrivateNoteIntentV1;seriesAddress?:string}){if(!(exactActionRecord(input,["text","intent"])||exactActionRecord(input,["text","intent","seriesAddress"]))||typeof input.text!=="string"||input.seriesAddress!==undefined&&typeof input.seriesAddress!=="string"||!(["keep-private","talking-points","agenda"] as const).includes(input.intent))throw new Error("Private context request is invalid.");const context=await currentMeetingPackContext(input.seriesAddress);try{await assertMeetingPreparationOpen(context);const{server,identity,seriesId}=context,text=input.text.trim(),idempotencyKey=`meeting-pack-note:${leadershipDigest(leadershipStableSerialize({seriesId,occurrenceId:identity.conversationId,intent:input.intent,text}))}`;await server.addMeetingPackPrivateNote({...identity,seriesId,text,intent:input.intent,idempotencyKey});return await server.readMeetingPack({...identity,seriesId});}finally{await context.close();}}
export async function shareMeetingPerspectiveAction(input:{seriesAddress:string;stance:"agree"|"challenge"|"need-information"|"propose-alternative";rationale:string;workingAnalysisDigest:string}){if(!exactActionRecord(input,["seriesAddress","stance","rationale","workingAnalysisDigest"])||!input.seriesAddress||!input.workingAnalysisDigest||!input.rationale.trim()||input.rationale.length>500||!(["agree","challenge","need-information","propose-alternative"] as const).includes(input.stance))throw new Error("Meeting perspective is invalid.");const context=await currentMeetingPackContext(input.seriesAddress);const{server,identity,seriesId}=context;try{await assertMeetingPreparationOpen(context);const idempotencyKey=`shared-meeting-perspective:${leadershipDigest(leadershipStableSerialize({seriesId,occurrenceId:identity.conversationId,stance:input.stance,rationale:input.rationale.trim(),workingAnalysisDigest:input.workingAnalysisDigest}))}`;await server.shareMeetingPerspective({...identity,seriesId,stance:input.stance,rationale:input.rationale,workingAnalysisDigest:input.workingAnalysisDigest,idempotencyKey});return await server.readMeetingPerspectives({...identity,seriesId,workingAnalysisDigest:input.workingAnalysisDigest});}finally{await context.close();}}
function parseBuildMeetingPackArguments(argumentsList:readonly unknown[]):string|undefined{if(argumentsList.length>1||argumentsList.length===1&&typeof argumentsList[0]!=="string")throw new Error("Meeting Pack request is invalid.");return argumentsList[0] as string|undefined;}
export async function buildMeetingPackAction(...runtimeArguments:unknown[]){const trace=createMeetingPackBuildTrace();trace?.("request-received");trace?.("server-action-entered");const seriesAddress=parseBuildMeetingPackArguments(runtimeArguments);trace?.("transport-normalized","completed");const context=await currentMeetingPackContext(seriesAddress);try{trace?.("authenticated-request-resolved","completed");trace?.("participant-resolved","completed");trace?.("opaque-meeting-resolved","completed");trace?.("organization-access-allowed","completed");trace?.("meeting-access-allowed","completed");await assertMeetingPreparationOpen(context);trace?.("preparation-open-verified","completed");const{server,identity,seriesId}=context;const result=await server.buildMeetingPack({...identity,seriesId});trace?.("action-success-returned","completed");return result;}catch(error){trace?.("action-failed","failed",error);throw error;}finally{await context.close();}}
export async function refreshMeetingPackDraftAction(...runtimeArguments:unknown[]){const trace=createMeetingPackBuildTrace();trace?.("request-received");trace?.("server-action-entered");const seriesAddress=parseBuildMeetingPackArguments(runtimeArguments);trace?.("transport-normalized","completed");const context=await currentMeetingPackContext(seriesAddress);try{trace?.("authenticated-request-resolved","completed");trace?.("participant-resolved","completed");trace?.("opaque-meeting-resolved","completed");trace?.("organization-access-allowed","completed");trace?.("meeting-access-allowed","completed");await assertMeetingPreparationOpen(context);trace?.("preparation-open-verified","completed");const{server,identity,seriesId}=context,result=await server.refreshMeetingPack({...identity,seriesId});trace?.("action-success-returned","completed");return result;}catch(error){trace?.("action-failed","failed",error);throw error;}finally{await context.close();}}
function parseSaveMeetingPackArguments(argumentsList:readonly unknown[]):{agendaText:string;talkingPointsText:string;expectedArtifactRevision:string}{const input=argumentsList[0];if(argumentsList.length!==1||!exactActionRecord(input,["agendaText","talkingPointsText","expectedArtifactRevision"])||typeof input.agendaText!=="string"||typeof input.talkingPointsText!=="string"||typeof input.expectedArtifactRevision!=="string")throw new Error("Meeting Pack save request is invalid.");return{agendaText:input.agendaText,talkingPointsText:input.talkingPointsText,expectedArtifactRevision:input.expectedArtifactRevision};}
export async function saveMeetingPackAction(input:{agendaText:string;talkingPointsText:string;expectedArtifactRevision:string;seriesAddress?:string}){if(!(exactActionRecord(input,["agendaText","talkingPointsText","expectedArtifactRevision"])||exactActionRecord(input,["agendaText","talkingPointsText","expectedArtifactRevision","seriesAddress"]))||typeof input.agendaText!=="string"||typeof input.talkingPointsText!=="string"||typeof input.expectedArtifactRevision!=="string"||input.seriesAddress!==undefined&&typeof input.seriesAddress!=="string")throw new Error("Meeting Pack save request is invalid.");const{seriesAddress,...edit}=input,context=await currentMeetingPackContext(seriesAddress);try{await assertMeetingPreparationOpen(context);const{server,identity,seriesId}=context,idempotencyKey=`meeting-pack-save:${leadershipDigest(leadershipStableSerialize(edit))}`;return await server.reviseMeetingPack({...identity,seriesId,...edit,idempotencyKey});}finally{await context.close();}}

export async function routeApprovedTakeawayProposalAction(input: {
  organizationId: string;
  questionId: string;
  conversationId: string;
  proposalId: string;
  purposeRef: string;
  expectedWorkflowRevision: string | null;
  idempotencyKey: string;
}) {
  const userId = await signedInUserId();
  return createLeadershipConversationServerComposition().routeApproved({ ...input, userId });
}

type WithoutUser<T> = T extends { userId: string } ? Omit<T, "userId"> : never;
type AdapterInput<K extends keyof CanonicalProductWorkspaceAdapter> = CanonicalProductWorkspaceAdapter[K] extends (input: infer I) => unknown ? WithoutUser<I> : never;

export async function recordLeadershipConversationContextAction(input: AdapterInput<"recordLeadershipConversationContext">) { return createLeadershipConversationServerComposition().recordContext({ ...input, userId: await signedInUserId() }); }
export async function createPreparedWorkProductVersionAction(input: AdapterInput<"createPreparedWorkProductVersion">) { return createLeadershipConversationServerComposition().recordPreparation({ ...input, userId: await signedInUserId() }); }
export async function freezePreparedWorkProductAction(input: AdapterInput<"freezePreparedWorkProduct">) { return createLeadershipConversationServerComposition().freeze({ ...input, userId: await signedInUserId() }); }
export async function receiveLeadershipConversationUploadAction(input: AdapterInput<"receiveLeadershipConversationUpload">) { return createLeadershipConversationServerComposition().receiveUpload({ ...input, userId: await signedInUserId() }); }
export async function generateLeadershipConversationProposalsAction(input: AdapterInput<"generateLeadershipConversationProposals">) { return createLeadershipConversationServerComposition().generateProposals({ ...input, userId: await signedInUserId() }); }
export async function recordTakeawayProposalDispositionAction(input: AdapterInput<"recordTakeawayProposalDisposition">) { return createLeadershipConversationServerComposition().review({ ...input, userId: await signedInUserId() }); }
export async function completeLeadershipConversationCycle1ClosureAction(input: AdapterInput<"completeLeadershipConversationCycle1Closure">) { return createLeadershipConversationServerComposition().completeCycle1Closure({ ...input, userId: await signedInUserId() }); }
export async function completeLeadershipConversationCycle1ClosureFormAction(input: AdapterInput<"completeLeadershipConversationCycle1Closure">, _formData: FormData): Promise<void> { await completeLeadershipConversationCycle1ClosureAction(input); }
export async function prepareNextLeadershipConversationAction(input: AdapterInput<"prepareNextLeadershipConversation">) { return createLeadershipConversationServerComposition().prepareAgain({ ...input, userId: await signedInUserId() }); }
export async function resetLeadershipConversationDevelopmentScenarioAction(input: AdapterInput<"resetLeadershipConversationDevelopmentScenario">) { return createLeadershipConversationServerComposition().reset({ ...input, userId: await signedInUserId() }); }

async function occurrence1Context(seriesAddress?:string) {
  const userId = await signedInUserId(), server = createLeadershipConversationServerComposition();
  if(seriesAddress){const resolved=await resolveAuthorizedMeetingAddress({userId,organizationId:SANDBOX_ORGANIZATION_ID,seriesAddress});if(!resolved)throw new Error("Meeting is unavailable.");const fixtureRoot=process.env.DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT;if(!fixtureRoot)throw new Error("Meeting is unavailable.");const seed=await readNorthstarPreparationLineageSeed({fixtureRoot,organizationId:SANDBOX_ORGANIZATION_ID,fixtureId:"northstar-preparation-lineage-fixture-v1",provisioningKey:"northstar-preparation-lineage:v1"}),fixture=northstarLeadershipConversationFixture(seed.productQuestionId);return{server,identity:{userId,organizationId:resolved.organizationId,questionId:resolved.questionId,conversationId:resolved.occurrenceId},fixture,seriesId:resolved.seriesId};}
  if (!await server.authorizePageCurrentAccess({ userId, organizationId: SANDBOX_ORGANIZATION_ID })) throw new Error("Occurrence 1 is unavailable.");
  const fixtureRoot = process.env.DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT;
  if (!fixtureRoot) throw new Error("Occurrence 1 is unavailable.");
  const seed = await readNorthstarPreparationLineageSeed({ fixtureRoot, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: "northstar-preparation-lineage-fixture-v1", provisioningKey: "northstar-preparation-lineage:v1" }), fixture = northstarLeadershipConversationFixture(seed.productQuestionId), identity = { userId, organizationId: seed.organizationId, questionId: seed.productQuestionId, conversationId: fixture.conversationId }, seriesId = `leadership-conversation-series:${fixture.conversationId}`;
  const currentAccess = createParticipantReferenceMeetingCurrentAccessFromEnvironment();
  if ((await currentAccess.authorize({ userId, organizationId: identity.organizationId, seriesId })) !== "authorized") throw new Error("Occurrence 1 is unavailable.");
  return { server, identity, fixture,seriesId };
}
async function currentMeetingPackContext(seriesAddress?:string){if(seriesAddress){if(process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED==="true"){const founder=await createFounderMeetingHomeComposition(seriesAddress);return{server:founder.server,identity:{userId:founder.request.consumerId,organizationId:founder.meeting.organizationId,questionId:founder.meeting.questionId,conversationId:founder.meeting.occurrenceId},seriesId:founder.meeting.seriesId,close:founder.close};}const userId=await signedInUserId(),resolved=await resolveAuthorizedMeetingAddress({userId,organizationId:SANDBOX_ORGANIZATION_ID,seriesAddress});if(!resolved)throw new Error("Meeting is unavailable.");return{server:createLeadershipConversationServerComposition(),identity:{userId,organizationId:resolved.organizationId,questionId:resolved.questionId,conversationId:resolved.occurrenceId},seriesId:resolved.seriesId,close:async()=>{}};}const current=await occurrence1Context(),workspace=await current.server.workspace(current.identity);if(workspace.futurePreparationLink&&workspace.closureCompletion){const identity={...current.identity,conversationId:workspace.futurePreparationLink.nextConversationId};return{server:current.server,identity,seriesId:workspace.closureCompletion.seriesId,close:async()=>{}};}return{server:current.server,identity:current.identity,seriesId:`leadership-conversation-series:${current.identity.conversationId}`,close:async()=>{}};}
async function reviewedCarryForwardContext(seriesAddress?:string){
  if(seriesAddress&&process.env.DISCOVERY_FOUNDER_LOCAL_ALPHA_ENABLED==="true"){const context=await currentMeetingPackContext(seriesAddress);return{...context,purposeRef:"leadership-conversation-capture"};}
  const context=await occurrence1Context(seriesAddress);return{server:context.server,identity:context.identity,seriesId:context.seriesId,close:async()=>{},purposeRef:context.fixture.purposeRef};
}

export async function freezeOccurrence1Action(input: { preparedWorkProductVersionId: string; expectedPersonalRoomSheetDigest: string; contributedItemIds: string[];seriesAddress?:string }): Promise<{ checkpointId: string; contributionArtifactIds: string[]; workspace: LeadershipConversationWorkspaceV1 }> {
  observeJourney("contribute","attempted","attempted");
  const { server, identity,seriesId } = await occurrence1Context(input.seriesAddress);
  if (!input.preparedWorkProductVersionId) throw new Error("Occurrence 1 preparation is unavailable.");
  const currentPersonalRoomSheet = await composeCurrentPersonalRoomSheet(input.seriesAddress);
  const currentSheet = projectContentSafePersonalRoomSheet(currentPersonalRoomSheet.sheet);
  if (input.expectedPersonalRoomSheetDigest !== currentSheet.personalRoomSheetDigest) throw new Error("Occurrence 1 contribution is unavailable.");
  const selectedContent = input.contributedItemIds.length ? resolvePersonalRoomSheetContribution(currentSheet, { expectedPersonalRoomSheetDigest: input.expectedPersonalRoomSheetDigest, selectedItemIds: input.contributedItemIds }) : [];
  await server.freeze({ ...identity, artifactVersionId: input.preparedWorkProductVersionId, privateWorkingContribution: { seriesId: currentPersonalRoomSheet.sheet.seriesId, occurrenceId: currentPersonalRoomSheet.sheet.occurrenceId, authorizationRevision: currentPersonalRoomSheet.sheet.sourceProjectionDigest, provenanceDigest: currentPersonalRoomSheet.sheet.personalRoomSheetDigest, selectedContent }, idempotencyKey: `occurrence-1-freeze:${identity.conversationId}` });
  const checkpoint = await resolveCurrentLeadershipConversationCheckpoint({...identity,seriesId});
  observeJourney("contribute",input.contributedItemIds.length?"completed":"intentionally-empty",input.contributedItemIds.length?"success":"expected-abstention");observeJourney("freeze","completed","success");
  return { checkpointId: checkpoint.checkpointId, contributionArtifactIds: checkpoint.contributionArtifactIds, workspace: await server.workspace(identity) };
}

export type Occurrence1FreezeActionState = PersonalRoomSheetContributionActionState<LeadershipConversationWorkspaceV1>;

export async function freezeOccurrence1FormAction(
  previous: Occurrence1FreezeActionState,
  formData: FormData,
): Promise<Occurrence1FreezeActionState> {
  try {
    const contributedItemIds = formData.getAll("contributedItemId").filter((value): value is string => typeof value === "string");
    const result = await freezeOccurrence1Action({
      preparedWorkProductVersionId: String(formData.get("preparedWorkProductVersionId") ?? ""),
      expectedPersonalRoomSheetDigest: String(formData.get("expectedPersonalRoomSheetDigest") ?? ""),
      contributedItemIds,
      seriesAddress:String(formData.get("seriesAddress")||"")||undefined,
    });
    return reconstructPersonalRoomSheetContributionActionState(previous, result);
  } catch {
    return { ...previous, error: "The meeting could not be frozen. Refresh the preparation and try again." };
  }
}

export async function captureOccurrence1Action(input: { meetingNotes: string;seriesAddress?:string }): Promise<LeadershipConversationWorkspaceV1> {
  observeJourney("capture","attempted","attempted");
  const { server, identity, fixture,seriesId } = await occurrence1Context(input.seriesAddress), meetingNotes = input.meetingNotes.trim();
  if (!meetingNotes || meetingNotes.length > 4000) throw new Error("Occurrence 1 Capture is invalid.");
  const checkpoint = await resolveCurrentLeadershipConversationCheckpoint({...identity,seriesId});
  const contributedItems = checkpoint.contributionArtifactIds.length ? await server.readFrozenPrivateWorkingContribution({ ...identity, snapshotId: checkpoint.checkpointId, artifactIds: checkpoint.contributionArtifactIds }) : [];
  await server.captureFrozenPrivateWorkingContribution({ ...identity, snapshotId: checkpoint.checkpointId, idempotencyKey: `occurrence-1-contribution-capture:${identity.conversationId}` });
  await server.buildMeetingPack({ ...identity, seriesId });
  const contributionRecord = contributedItems.length ? `Contributed from Private Working:\n${contributedItems.map(item => `- ${item}`).join("\n")}` : "No Private Working content was contributed.";
  const text = `${new TextDecoder().decode(NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE.captureBytes)}\n${contributionRecord}\n\nMeeting notes:\n${meetingNotes}\n`;
  const stored = await server.receiveUpload({ ...identity, frozenSnapshotId: checkpoint.checkpointId, purposeRef: fixture.purposeRef, mediaType: "text/plain", bytes: new TextEncoder().encode(text), displayLabel: "Occurrence 1 meeting record", originalFilename: null, idempotencyKey: `occurrence-1-capture:${identity.conversationId}` }), uploadReceipt = stored.uploadReceipts.filter(item => item.conversationId === identity.conversationId).at(-1);
  if (!uploadReceipt) throw new Error("Occurrence 1 Capture is unavailable.");
  await server.beginReviewedCarryForwardFromMeetingPack({ ...identity, seriesId });
  const workspace=await server.workspace(identity);observeJourney("capture","completed","success");return workspace;
}

export async function reviewOccurrence1ProposalAction(input: { proposalId: string; disposition: ProposalDisposition }): Promise<LeadershipConversationWorkspaceV1> {
  observeJourney("review","attempted","attempted");
  const { server, identity } = await occurrence1Context(), current = await server.workspace(identity), proposal = current.proposals.find(item => item.proposalId === input.proposalId);
  if ((input.disposition !== "deferred" && input.disposition !== "rejected") || !proposal || current.dispositions.some(item => item.proposalId === input.proposalId)) throw new Error("Occurrence 1 review is unavailable.");
  await server.review({ ...identity, proposalId: proposal.proposalId, disposition: input.disposition, effectivePayload: null, reason: input.disposition === "deferred" ? "Kept open for a later governed review." : "Not carried forward from Occurrence 1.", idempotencyKey: `occurrence-1-review:${proposal.proposalId}:${input.disposition}` });
  const workspace=await server.workspace(identity);observeJourney("review","completed",input.disposition==="deferred"?"expected-abstention":"success");return workspace;
}

export async function dispositionOccurrence1CarryForwardAction(input:{proposalId:string;disposition:"accept"|"correct"|"reject"|"needs-information";correctedSummary?:string;seriesAddress?:string},...extraArguments:unknown[]):Promise<CriticalAcknowledgement>{
  let outcome:CriticalAcknowledgement={action:"review-proposal",status:"outcome-unavailable",nextStep:"reload"},close:(()=>Promise<void>)|undefined;
  if(extraArguments.length||!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).some(key=>!["proposalId","disposition","correctedSummary","seriesAddress"].includes(key))||typeof input.proposalId!=="string"||!["accept","correct","reject","needs-information"].includes(input.disposition)||input.seriesAddress!==undefined&&typeof input.seriesAddress!=="string"||input.correctedSummary!==undefined&&typeof input.correctedSummary!=="string"||input.disposition!=="correct"&&input.correctedSummary!==undefined)return outcome;
  try{const context=await reviewedCarryForwardContext(input.seriesAddress);close=context.close;outcome=await context.server.reviewCarryForwardAcknowledged({...context.identity,seriesId:context.seriesId,proposalId:input.proposalId,disposition:input.disposition,correctedSummary:input.correctedSummary});}catch{/* Do not expose internal review failures. */}
  return closeCriticalContext(outcome,close);
}

export async function resumeOccurrence1CarryForwardRouteAction(input:{proposalId?:string;seriesAddress?:string},...extraArguments:unknown[]):Promise<CriticalAcknowledgement>{
  let outcome:CriticalAcknowledgement={action:"resume-recording",status:"outcome-unavailable",nextStep:"reload"},close:(()=>Promise<void>)|undefined;
  if(extraArguments.length||!input||typeof input!=="object"||Array.isArray(input)||Object.keys(input).some(key=>!["proposalId","seriesAddress"].includes(key))||input.proposalId!==undefined&&typeof input.proposalId!=="string"||input.seriesAddress!==undefined&&typeof input.seriesAddress!=="string")return outcome;
  try{const context=await reviewedCarryForwardContext(input.seriesAddress);close=context.close;outcome=await context.server.resumeCarryForwardAcknowledged({...context.identity,seriesId:context.seriesId,purposeRef:context.purposeRef,proposalId:input.proposalId});}catch{/* Do not expose internal recording failures. */}
  return closeCriticalContext(outcome,close);
}
export async function resumeOccurrence1CarryForwardCompletionAction(seriesAddress?:string):Promise<ReviewedCarryForwardFinalizationAcknowledgementV1>{
  let outcome:ReviewedCarryForwardFinalizationAcknowledgementV1={status:"outcome-unavailable",reviewComplete:null,nextStep:"reload"},close:(()=>Promise<void>)|undefined;
  try{const context=await reviewedCarryForwardContext(seriesAddress);close=context.close;outcome=await context.server.finalizeReviewedCarryForward({...context.identity,seriesId:context.seriesId});}
  catch{/* The boundary deliberately exposes no server failure detail. */}
  finally{if(close)try{await close();}catch{if(outcome.reviewComplete)outcome={status:"saved-refresh-required",reviewComplete:true,nextStep:"reload"};}}
  return outcome;
}

export async function acceptOccurrence1EvidenceAction(input: { proposalId: string }): Promise<LeadershipConversationWorkspaceV1> {
  const { server, identity, fixture } = await occurrence1Context();
  let current = await server.workspace(identity);
  const proposal = current.proposals.find(item => item.proposalId === input.proposalId);
  if (!proposal || proposal.kind !== "evidence-candidate") throw new Error("Occurrence 1 Evidence review is unavailable.");
  let continuation = resolveEvidenceAcceptanceContinuationV1(current, input.proposalId);
  if (continuation.disposition === "denied") throw new Error("Occurrence 1 Evidence review is unavailable.");
  if (continuation.disposition === "complete") return current;
  if (continuation.disposition === "review") {
    try {
      await server.review({ ...identity, proposalId: input.proposalId, disposition: "approved", effectivePayload: null, reason: "Accepted as canonical Evidence through explicit review.", idempotencyKey: `occurrence-1-review:${input.proposalId}:approved` });
    } catch {
      current = await server.workspace(identity);
      continuation = resolveEvidenceAcceptanceContinuationV1(current, input.proposalId);
      if (continuation.disposition !== "route" && continuation.disposition !== "complete") throw new Error("Occurrence 1 Evidence review is unavailable.");
    }
    current = await server.workspace(identity);
    continuation = resolveEvidenceAcceptanceContinuationV1(current, input.proposalId);
    if (continuation.disposition === "complete") return current;
    if (continuation.disposition !== "route") throw new Error("Occurrence 1 Evidence review is unavailable.");
  }
  if (continuation.disposition !== "route" || !current.actions.some(action => action.id === "route-approved" && action.enabled)) throw new Error("Occurrence 1 Evidence routing is unavailable.");
  try {
    await server.routeApproved({ ...identity, proposalId: input.proposalId, purposeRef: fixture.purposeRef, expectedWorkflowRevision: current.workflowRevision, idempotencyKey: `occurrence-1-route:${input.proposalId}:${continuation.dispositionReceiptId}` });
  } catch {
    const raced = await server.workspace(identity), resolved = resolveEvidenceAcceptanceContinuationV1(raced, input.proposalId);
    if (resolved.disposition === "complete" && resolved.dispositionReceiptId === continuation.dispositionReceiptId) return raced;
    throw new Error("Occurrence 1 Evidence routing is pending. Retry acceptance.");
  }
  const routed = await server.workspace(identity), resolved = resolveEvidenceAcceptanceContinuationV1(routed, input.proposalId);
  if (resolved.disposition !== "complete" || resolved.dispositionReceiptId !== continuation.dispositionReceiptId) throw new Error("Occurrence 1 Evidence routing is pending. Retry acceptance.");
  return routed;
}

export async function completeOccurrence1Action(seriesAddress?:string): Promise<LeadershipConversationWorkspaceV1> {
  observeJourney("closure","attempted","attempted");
  const { server, identity,seriesId } = await occurrence1Context(seriesAddress), current = await server.workspace(identity);
  if (current.closureCompletion) return current;
  if (!current.actions.some(action => action.id === "complete-closure" && action.enabled)) throw new Error("Occurrence 1 completion is unavailable.");
  const frozen = await resolveCurrentLeadershipConversationClosureMetadata({...identity,seriesId});
  if (frozen.workflowRevision !== current.workflowRevision || frozen.occurrenceId !== identity.conversationId) throw new Error("Occurrence 1 completion is unavailable.");
  try {
    await server.completeCycle1Closure({ ...identity, seriesId: frozen.seriesId, expectedWorkflowRevision: frozen.workflowRevision, authorizedProjectionDigest: frozen.authorizedProjectionDigest, candidateAssessmentDigest: null, b11CommunicationDigest: null, personalRoomSheetDigest: frozen.personalRoomSheetDigest, idempotencyKey: `occurrence-1-completion:${identity.conversationId}` });
  } catch {
    const raced = await server.workspace(identity);
    if (raced.closureCompletion?.seriesId === frozen.seriesId && raced.closureCompletion.authorizedProjectionDigest === frozen.authorizedProjectionDigest && raced.closureCompletion.personalRoomSheetDigest === frozen.personalRoomSheetDigest) return raced;
    throw new Error("Occurrence 1 completion is unavailable.");
  }
  const completed = await server.workspace(identity);
  if (completed.closureCompletion?.seriesId !== frozen.seriesId || completed.closureCompletion.authorizedProjectionDigest !== frozen.authorizedProjectionDigest || completed.closureCompletion.personalRoomSheetDigest !== frozen.personalRoomSheetDigest) throw new Error("Occurrence 1 completion is unavailable.");
  observeJourney("closure","completed","success");return completed;
}

export async function closeAndContinueOccurrence1Action(...args:unknown[]):Promise<import("../../../product/workflow/leadershipConversation/contracts").CloseContinuationAcknowledgementV1>{
  if(args.length!==1||typeof args[0]!=="string"||!/^[A-Za-z0-9_-]{24}$/.test(args[0]))return{status:"integrity-conflict",stage:"unknown",nextStep:"none"};
  let close:(()=>Promise<void>)|undefined,outcome:import("../../../product/workflow/leadershipConversation/contracts").CloseContinuationAcknowledgementV1={status:"outcome-unavailable",stage:"unknown",nextStep:"reload"};
  try{const context=await reviewedCarryForwardContext(args[0]);close=context.close;outcome=await context.server.closeAndContinue({...context.identity,seriesId:context.seriesId});}catch{/* Closed acknowledgement only. */}
  try{await close?.();}catch{if(outcome.stage==="complete")outcome={status:"saved-refresh-required",stage:"complete",nextStep:"reload"};}
  return outcome;
}

export async function prepareAgainOccurrence1Action() {
  observeJourney("prepare-again","attempted","attempted");
  const { server, identity } = await occurrence1Context();
  const current = await server.workspace(identity);
  if (!current.futurePreparationLink && !current.actions.some(action => action.id === "prepare-again" && action.enabled)) throw new Error("Prepare Again is unavailable.");
  const result=await server.prepareNextOccurrence(identity);
  observeJourney("what-changed","completed","success");observeJourney("prepare-again","completed","success");return{...result,valueLayer:compileChiefOfStaffValueLayerV1(result.nextPrepare)};
}
