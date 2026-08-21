"use server";

import { auth } from "@clerk/nextjs/server";
import { createLeadershipConversationServerComposition, resolveCurrentLeadershipConversationCheckpoint } from "../../../product/integration/leadershipConversationServerComposition";
import type { CanonicalProductWorkspaceAdapter } from "../../../product/integration/canonicalProductWorkspaceAdapter";
import type { ChiefFirstPrepareActivationV1 } from "../../../product/workflow/leadershipConversation";
import { composeChiefFirstPrepareViewFromWorkspace } from "../../../product/integration/chiefLeadershipPreparationComposer";
import { composeChiefLeadershipAnalysisToAction } from "../../../product/integration/chiefLeadershipAnalysisToActionComposer";
import { createPersonalRoomSheetConfirmationDigest, projectContentSafePersonalRoomSheet } from "../../../product/integration/chiefPersonalRoomSheetComposer";
import { readNorthstarPreparationLineageSeed } from "../../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { SANDBOX_ORGANIZATION_ID } from "../../../product/simulations/living-organization-sandbox/manifest";
import { NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE, northstarLeadershipConversationFixture, type LeadershipConversationWorkspaceV1, type ProposalDisposition } from "../../../product/workflow/leadershipConversation";
import { createPersonalRoomSheetReplayKey, PERSONAL_ROOM_SHEET_CONTRACT_VERSION, reconstructPersonalRoomSheetContributionActionState, resolvePersonalRoomSheetContribution, stabilizePersonalRoomSheetPrepareInput, type PersonalRoomSheetConfirmationRequestV1, type PersonalRoomSheetConfirmationResponseV1, type PersonalRoomSheetContributionActionState } from "../../../product/workflow/leadershipConversation/personalRoomSheetContracts";

function guard(): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Leadership Conversation development route is unavailable.");
  }
}

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
export async function activateAndPrepareLeadershipConversationAction(input:ChiefFirstPrepareActivationV1){return createLeadershipConversationServerComposition().activateAndPrepare({...input,userId:await signedInUserId()});}

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
  const { server, identity } = await occurrence1Context();
  if (!input.preparedWorkProductVersionId) throw new Error("Occurrence 1 preparation is unavailable.");
  const currentPersonalRoomSheet = await composeCurrentPersonalRoomSheet();
  const selectedContent = resolvePersonalRoomSheetContribution(projectContentSafePersonalRoomSheet(currentPersonalRoomSheet.sheet), { expectedPersonalRoomSheetDigest: input.expectedPersonalRoomSheetDigest, selectedItemIds: input.contributedItemIds });
  await server.freeze({ ...identity, artifactVersionId: input.preparedWorkProductVersionId, privateWorkingContribution: { seriesId: currentPersonalRoomSheet.sheet.seriesId, occurrenceId: currentPersonalRoomSheet.sheet.occurrenceId, authorizationRevision: currentPersonalRoomSheet.sheet.sourceProjectionDigest, provenanceDigest: currentPersonalRoomSheet.sheet.personalRoomSheetDigest, selectedContent }, idempotencyKey: `occurrence-1-freeze:${identity.conversationId}` });
  const checkpoint = await resolveCurrentLeadershipConversationCheckpoint(identity);
  if (!checkpoint.contributionArtifactIds.length) throw new Error("Occurrence 1 contribution is unavailable.");
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
  const { server, identity, fixture } = await occurrence1Context(), meetingNotes = input.meetingNotes.trim();
  if (!meetingNotes || meetingNotes.length > 4000) throw new Error("Occurrence 1 Capture is invalid.");
  const checkpoint = await resolveCurrentLeadershipConversationCheckpoint(identity);
  if (!checkpoint.contributionArtifactIds.length) throw new Error("Occurrence 1 contribution is unavailable.");
  const contributedItems = await server.readFrozenPrivateWorkingContribution({ ...identity, snapshotId: checkpoint.checkpointId, artifactIds: checkpoint.contributionArtifactIds });
  await server.captureFrozenPrivateWorkingContribution({ ...identity, snapshotId: checkpoint.checkpointId, idempotencyKey: `occurrence-1-contribution-capture:${identity.conversationId}` });
  const text = `${new TextDecoder().decode(NORTHSTAR_LEADERSHIP_CONVERSATION_FIXTURE.captureBytes)}\nContributed from Private Working:\n${contributedItems.map(item => `- ${item}`).join("\n")}\n\nMeeting notes:\n${meetingNotes}\n`;
  const stored = await server.receiveUpload({ ...identity, frozenSnapshotId: checkpoint.checkpointId, purposeRef: fixture.purposeRef, mediaType: "text/plain", bytes: new TextEncoder().encode(text), displayLabel: "Occurrence 1 meeting record", originalFilename: null, idempotencyKey: `occurrence-1-capture:${identity.conversationId}` }), uploadReceipt = stored.uploadReceipts.filter(item => item.conversationId === identity.conversationId).at(-1);
  if (!uploadReceipt) throw new Error("Occurrence 1 Capture is unavailable.");
  await server.generateProposals({ ...identity, uploadReceiptId: uploadReceipt.uploadReceiptId, purposeRef: fixture.purposeRef, idempotencyKey: `occurrence-1-proposals:${identity.conversationId}` });
  return server.workspace(identity);
}

export async function reviewOccurrence1ProposalAction(input: { proposalId: string; disposition: ProposalDisposition }): Promise<LeadershipConversationWorkspaceV1> {
  const { server, identity } = await occurrence1Context(), current = await server.workspace(identity), proposal = current.proposals.find(item => item.proposalId === input.proposalId);
  if ((input.disposition !== "deferred" && input.disposition !== "rejected") || !proposal || current.dispositions.some(item => item.proposalId === input.proposalId)) throw new Error("Occurrence 1 review is unavailable.");
  await server.review({ ...identity, proposalId: proposal.proposalId, disposition: input.disposition, effectivePayload: null, reason: input.disposition === "deferred" ? "Kept open for a later governed review." : "Not carried forward from Occurrence 1.", idempotencyKey: `occurrence-1-review:${proposal.proposalId}:${input.disposition}` });
  return server.workspace(identity);
}

export async function completeOccurrence1Action(): Promise<LeadershipConversationWorkspaceV1> {
  const { server, identity } = await occurrence1Context(), current = await server.workspace(identity);
  if (!current.actions.some(action => action.id === "complete-closure" && action.enabled)) throw new Error("Occurrence 1 completion is unavailable.");
  const personal = await composeCurrentPersonalRoomSheet();
  await server.completeCycle1Closure({ ...identity, seriesId: personal.sheet.seriesId, expectedWorkflowRevision: current.workflowRevision, authorizedProjectionDigest: personal.sheet.sourceProjectionDigest, candidateAssessmentDigest: personal.sheet.candidate1AssessmentDigest, b11CommunicationDigest: personal.sheet.b11CommunicationDigest, personalRoomSheetDigest: personal.sheet.personalRoomSheetDigest, idempotencyKey: `occurrence-1-completion:${identity.conversationId}` });
  return server.workspace(identity);
}
