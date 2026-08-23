"use server";

import { auth } from "@clerk/nextjs/server";
import { createLeadershipConversationServerComposition, resolveCurrentLeadershipConversationCheckpoint, resolveCurrentLeadershipConversationClosureMetadata } from "../../../product/integration/leadershipConversationServerComposition";
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

function guard(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Leadership Conversation development route is unavailable.");
  }
}
function observeJourney(workflowStage:AlphaContentSafeObservabilityEventV1["workflowStage"],transitionCategory:AlphaContentSafeObservabilityEventV1["transitionCategory"],outcomeCategory:AlphaContentSafeObservabilityEventV1["outcomeCategory"],failureCategory:AlphaContentSafeObservabilityEventV1["failureCategory"]="none"){writeAlphaOperationalLog({eventCategory:"workflow-transition",workflowStage,transitionCategory,outcomeCategory,failureCategory});}
export async function observeLeadershipConversationBrowserEventAction(input:{stage:AlphaContentSafeObservabilityEventV1["workflowStage"];transition:AlphaContentSafeObservabilityEventV1["transitionCategory"];outcome:AlphaContentSafeObservabilityEventV1["outcomeCategory"];viewport:AlphaContentSafeObservabilityEventV1["viewportCategory"]}){await signedInUserId();writeAlphaOperationalLog({eventCategory:"browser",workflowStage:input.stage,transitionCategory:input.transition,outcomeCategory:input.outcome,failureCategory:input.outcome==="browser-failure"?"browser":"none",viewportCategory:input.viewport,occurrenceCategory:"occurrence-1"});}

async function signedInUserId(): Promise<string> {
  guard();
  const { userId } = await auth();
  if (!userId) throw new Error("Leadership Conversation authentication is required.");
  return userId;
}

async function composeCurrentPersonalRoomSheet() {
  const userId = await signedInUserId(), server = createLeadershipConversationServerComposition();
  if (!await server.authorizePageCurrentAccess({ userId, organizationId: SANDBOX_ORGANIZATION_ID })) throw new Error("Personal Room Sheet current access is unavailable.");
  const fixtureRoot = process.env.DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT;
  if (!fixtureRoot) throw new Error("Northstar preparation lineage seed is unavailable.");
  const seed = await readNorthstarPreparationLineageSeed({ fixtureRoot, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: "northstar-preparation-lineage-fixture-v1", provisioningKey: "northstar-preparation-lineage:v1" }), fixture = northstarLeadershipConversationFixture(seed.productQuestionId), workspace = await server.workspace({ userId, organizationId: seed.organizationId, questionId: seed.productQuestionId, conversationId: fixture.conversationId }), view = stabilizePersonalRoomSheetPrepareInput(composeChiefFirstPrepareViewFromWorkspace(workspace)), replayKey = createPersonalRoomSheetReplayKey(seed.seedDigest, userId), support = await server.resolveEvidenceSupport({ contractVersion: "1", organizationId: seed.organizationId, questionId: seed.productQuestionId, subjectId: userId, requestedScope: { organizationId: seed.organizationId, type: "organization", id: seed.organizationId }, purposeRef: seed.purpose, sensitivity: seed.sensitivity, evaluatedAt: workspace.context?.recordedAt ?? fixture.at, evidenceIds: seed.canonicalMaterial.map(item => item.canonicalObjectId), replayKey }), candidate = composeChiefLeadershipAnalysisToAction({ view, productQuestion: workspace.base.base.question.text, meetingPurpose: view.meeting.purpose, support, permissionScope: "organization", replayKey });
  const sheet = await server.composePersonalRoomSheet({ userId, organizationId: seed.organizationId, seriesId: view.seriesId, occurrenceId: view.conversationId, questionId: seed.productQuestionId, meetingPurpose: view.meeting.purpose, sourceProjectionDigest: support.projection.projectionDigest, analysis: candidate.analysis, b11Plan: candidate.communication.plan, b11CommunicationDigest: candidate.communication.rendered.planDigest });
  return { sheet, occurrenceRef: view.conversationId };
}

export async function getPersonalRoomSheetPreviewAction() {
  const current = await composeCurrentPersonalRoomSheet();
  return { sheet: projectContentSafePersonalRoomSheet(current.sheet), occurrenceRef: current.occurrenceRef };
}

export async function confirmPersonalRoomSheetAction(input: PersonalRoomSheetConfirmationRequestV1): Promise<PersonalRoomSheetConfirmationResponseV1> {
  if (input.contractVersion !== PERSONAL_ROOM_SHEET_CONTRACT_VERSION || !Number.isSafeInteger(input.requestSequence) || input.requestSequence < 0) throw new Error("Personal Room Sheet confirmation request is invalid.");
  const current = await composeCurrentPersonalRoomSheet(), sheet = current.sheet;
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

async function occurrence1Context() {
  const userId = await signedInUserId(), server = createLeadershipConversationServerComposition();
  if (!await server.authorizePageCurrentAccess({ userId, organizationId: SANDBOX_ORGANIZATION_ID })) throw new Error("Occurrence 1 is unavailable.");
  const fixtureRoot = process.env.DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT;
  if (!fixtureRoot) throw new Error("Occurrence 1 is unavailable.");
  const seed = await readNorthstarPreparationLineageSeed({ fixtureRoot, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: "northstar-preparation-lineage-fixture-v1", provisioningKey: "northstar-preparation-lineage:v1" }), fixture = northstarLeadershipConversationFixture(seed.productQuestionId), identity = { userId, organizationId: seed.organizationId, questionId: seed.productQuestionId, conversationId: fixture.conversationId };
  return { server, identity, fixture };
}

export async function freezeOccurrence1Action(input: { preparedWorkProductVersionId: string; expectedPersonalRoomSheetDigest: string; contributedItemIds: string[] }): Promise<{ checkpointId: string; contributionArtifactIds: string[]; workspace: LeadershipConversationWorkspaceV1 }> {
  observeJourney("contribute","attempted","attempted");
  const { server, identity } = await occurrence1Context();
  if (!input.preparedWorkProductVersionId) throw new Error("Occurrence 1 preparation is unavailable.");
  const currentPersonalRoomSheet = await composeCurrentPersonalRoomSheet();
  const currentSheet = projectContentSafePersonalRoomSheet(currentPersonalRoomSheet.sheet);
  if (input.expectedPersonalRoomSheetDigest !== currentSheet.personalRoomSheetDigest) throw new Error("Occurrence 1 contribution is unavailable.");
  const selectedContent = input.contributedItemIds.length ? resolvePersonalRoomSheetContribution(currentSheet, { expectedPersonalRoomSheetDigest: input.expectedPersonalRoomSheetDigest, selectedItemIds: input.contributedItemIds }) : [];
  await server.freeze({ ...identity, artifactVersionId: input.preparedWorkProductVersionId, privateWorkingContribution: { seriesId: currentPersonalRoomSheet.sheet.seriesId, occurrenceId: currentPersonalRoomSheet.sheet.occurrenceId, authorizationRevision: currentPersonalRoomSheet.sheet.sourceProjectionDigest, provenanceDigest: currentPersonalRoomSheet.sheet.personalRoomSheetDigest, selectedContent }, idempotencyKey: `occurrence-1-freeze:${identity.conversationId}` });
  const checkpoint = await resolveCurrentLeadershipConversationCheckpoint(identity);
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
    });
    return reconstructPersonalRoomSheetContributionActionState(previous, result);
  } catch {
    return { ...previous, error: "The meeting could not be frozen. Refresh the preparation and try again." };
  }
}

export async function captureOccurrence1Action(input: { meetingNotes: string }): Promise<LeadershipConversationWorkspaceV1> {
  observeJourney("capture","attempted","attempted");
  const { server, identity, fixture } = await occurrence1Context(), meetingNotes = input.meetingNotes.trim();
  if (!meetingNotes || meetingNotes.length > 4000) throw new Error("Occurrence 1 Capture is invalid.");
  const checkpoint = await resolveCurrentLeadershipConversationCheckpoint(identity);
  const contributedItems = checkpoint.contributionArtifactIds.length ? await server.readFrozenPrivateWorkingContribution({ ...identity, snapshotId: checkpoint.checkpointId, artifactIds: checkpoint.contributionArtifactIds }) : [];
  await server.captureFrozenPrivateWorkingContribution({ ...identity, snapshotId: checkpoint.checkpointId, idempotencyKey: `occurrence-1-contribution-capture:${identity.conversationId}` });
  const contributionRecord = contributedItems.length ? `Contributed from Private Working:\n${contributedItems.map(item => `- ${item}`).join("\n")}` : "No Private Working content was contributed.";
  const text = `${new TextDecoder().decode(NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE.captureBytes)}\n${contributionRecord}\n\nMeeting notes:\n${meetingNotes}\n`;
  const stored = await server.receiveUpload({ ...identity, frozenSnapshotId: checkpoint.checkpointId, purposeRef: fixture.purposeRef, mediaType: "text/plain", bytes: new TextEncoder().encode(text), displayLabel: "Occurrence 1 meeting record", originalFilename: null, idempotencyKey: `occurrence-1-capture:${identity.conversationId}` }), uploadReceipt = stored.uploadReceipts.filter(item => item.conversationId === identity.conversationId).at(-1);
  if (!uploadReceipt) throw new Error("Occurrence 1 Capture is unavailable.");
  await server.generateProposals({ ...identity, uploadReceiptId: uploadReceipt.uploadReceiptId, purposeRef: fixture.purposeRef, idempotencyKey: `occurrence-1-proposals:${identity.conversationId}` });
  const workspace=await server.workspace(identity);observeJourney("capture","completed","success");return workspace;
}

export async function reviewOccurrence1ProposalAction(input: { proposalId: string; disposition: ProposalDisposition }): Promise<LeadershipConversationWorkspaceV1> {
  observeJourney("review","attempted","attempted");
  const { server, identity } = await occurrence1Context(), current = await server.workspace(identity), proposal = current.proposals.find(item => item.proposalId === input.proposalId);
  if ((input.disposition !== "deferred" && input.disposition !== "rejected") || !proposal || current.dispositions.some(item => item.proposalId === input.proposalId)) throw new Error("Occurrence 1 review is unavailable.");
  await server.review({ ...identity, proposalId: proposal.proposalId, disposition: input.disposition, effectivePayload: null, reason: input.disposition === "deferred" ? "Kept open for a later governed review." : "Not carried forward from Occurrence 1.", idempotencyKey: `occurrence-1-review:${proposal.proposalId}:${input.disposition}` });
  const workspace=await server.workspace(identity);observeJourney("review","completed",input.disposition==="deferred"?"expected-abstention":"success");return workspace;
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

export async function completeOccurrence1Action(): Promise<LeadershipConversationWorkspaceV1> {
  observeJourney("closure","attempted","attempted");
  const { server, identity } = await occurrence1Context(), current = await server.workspace(identity);
  if (current.closureCompletion) return current;
  if (!current.actions.some(action => action.id === "complete-closure" && action.enabled)) throw new Error("Occurrence 1 completion is unavailable.");
  const frozen = await resolveCurrentLeadershipConversationClosureMetadata(identity);
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

export async function prepareAgainOccurrence1Action() {
  observeJourney("prepare-again","attempted","attempted");
  const { server, identity } = await occurrence1Context();
  const current = await server.workspace(identity);
  if (!current.futurePreparationLink && !current.actions.some(action => action.id === "prepare-again" && action.enabled)) throw new Error("Prepare Again is unavailable.");
  const result=await server.prepareNextOccurrence(identity);
  observeJourney("what-changed","completed","success");observeJourney("prepare-again","completed","success");return{...result,valueLayer:compileChiefOfStaffValueLayerV1(result.nextPrepare)};
}
