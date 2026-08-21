"use server";

import { auth } from "@clerk/nextjs/server";
import { createLeadershipConversationServerComposition } from "../../../product/integration/leadershipConversationServerComposition";
import type { CanonicalProductWorkspaceAdapter } from "../../../product/integration/canonicalProductWorkspaceAdapter";
import type { ChiefFirstPrepareActivationV1 } from "../../../product/workflow/leadershipConversation";
import { buildChiefFirstPrepareViewFromWorkspace } from "../../../product/frontend/leadershipConversationFixtureAdapter";
import { composeChiefLeadershipAnalysisToAction } from "../../../product/integration/chiefLeadershipAnalysisToActionComposer";
import { createPersonalRoomSheetConfirmationDigest, projectContentSafePersonalRoomSheet } from "../../../product/integration/chiefPersonalRoomSheetComposer";
import { readNorthstarPreparationLineageSeed } from "../../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { SANDBOX_ORGANIZATION_ID } from "../../../product/simulations/living-organization-sandbox/manifest";
import { northstarLeadershipConversationFixture } from "../../../product/workflow/leadershipConversation";
import { PERSONAL_ROOM_SHEET_CONTRACT_VERSION, type PersonalRoomSheetConfirmationRequestV1, type PersonalRoomSheetConfirmationResponseV1 } from "../../../product/workflow/leadershipConversation/personalRoomSheetContracts";

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
  const seed = await readNorthstarPreparationLineageSeed({ fixtureRoot, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: "northstar-preparation-lineage-fixture-v1", provisioningKey: "northstar-preparation-lineage:v1" }), fixture = northstarLeadershipConversationFixture(seed.productQuestionId), workspace = await server.workspace({ userId, organizationId: seed.organizationId, questionId: seed.productQuestionId, conversationId: fixture.conversationId }), view = buildChiefFirstPrepareViewFromWorkspace(workspace), support = await server.resolveEvidenceSupport({ contractVersion: "1", organizationId: seed.organizationId, questionId: seed.productQuestionId, subjectId: userId, requestedScope: { organizationId: seed.organizationId, type: "organization", id: seed.organizationId }, purposeRef: seed.purpose, sensitivity: seed.sensitivity, evaluatedAt: workspace.context?.recordedAt ?? fixture.at, evidenceIds: seed.canonicalMaterial.map(item => item.canonicalObjectId), replayKey: `candidate3a-route:${seed.seedDigest}` }), candidate = composeChiefLeadershipAnalysisToAction({ view, productQuestion: workspace.base.base.question.text, meetingPurpose: view.meeting.purpose, support, permissionScope: "organization", replayKey: `candidate3a-route:${seed.seedDigest}` });
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
