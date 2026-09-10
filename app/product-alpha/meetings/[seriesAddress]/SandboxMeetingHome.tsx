import { notFound, redirect } from "next/navigation";
import { MeetingPortfolioNavigation, MeetingPortfolioShell } from "../../../../components/product-alpha/meetings/MeetingPortfolioShell";
import { LeadershipConversationExperience } from "../../../../components/product-alpha/leadership-conversation/LeadershipConversationExperience";
import DiscoveryShell from "../../../../components/product-shell/DiscoveryShell";
import { SANDBOX_ORGANIZATION_ID } from "../../../../lib/access/sandboxMultiUserAccess";
import { createParticipantReferenceMeetingCurrentAccessFromEnvironment } from "../../../../lib/alpha-activation/participantReferenceMeetingAccessServer";
import { classifyLegacyMeetingOrganizationClaim } from "../../../../lib/alpha-activation/founderFirstUnderstandingMeetingHome";
import { authorizedMeetingDirectory, resolveAuthorizedMeetingAddress } from "../../../../product/integration/authorizedMeetingDirectory";
import { composeChiefFirstPrepareViewFromWorkspace } from "../../../../product/integration/chiefLeadershipPreparationComposer";
import { createLeadershipConversationServerComposition, resolveCurrentLeadershipConversationCheckpoint } from "../../../../product/integration/leadershipConversationServerComposition";
import { projectCrossMeetingRelevanceV1, projectMeetingExecutiveContinuity } from "../../../../product/integration/meetingExecutiveContentProjection";
import { compileChiefOfStaffValueLayerV1 } from "../../../../product/workflow/leadershipConversation/chiefCommunicationPlan";
import { getPersonalRoomSheetPreviewAction } from "../../leadership-conversation/actions";

export default async function SandboxMeetingHome({
  userId,
  seriesAddress,
  suppliedOrganization,
}: {
  userId: string;
  seriesAddress: string;
  suppliedOrganization?: string | string[];
}) {
  const meetingAccess = createParticipantReferenceMeetingCurrentAccessFromEnvironment();
  const meeting = await resolveAuthorizedMeetingAddress({
    userId,
    organizationId: SANDBOX_ORGANIZATION_ID,
    seriesAddress,
    currentAccess: meetingAccess,
  });
  if (!meeting) notFound();

  const legacyClaim = classifyLegacyMeetingOrganizationClaim(suppliedOrganization, meeting.organizationId);
  if (legacyClaim === "conflict") notFound();
  if (legacyClaim === "matching") redirect(`/product-alpha/meetings/${seriesAddress}`);

  const server = createLeadershipConversationServerComposition();
  const workspace = await server.workspace({
    userId,
    organizationId: meeting.organizationId,
    questionId: meeting.questionId,
    conversationId: meeting.occurrenceId,
  });
  let prepare = composeChiefFirstPrepareViewFromWorkspace(workspace);
  if (meeting.predecessorOccurrenceId) {
    const priorWorkspace = await server.workspace({
      userId,
      organizationId: meeting.organizationId,
      questionId: meeting.questionId,
      conversationId: meeting.predecessorOccurrenceId,
    });
    const closure = priorWorkspace.closureCompletion;
    if (!closure) notFound();
    const continuity = projectMeetingExecutiveContinuity(priorWorkspace);
    prepare = {
      ...prepare,
      seriesId: meeting.seriesId,
      priorCycle: {
        status: "completed",
        message: continuity.items.length
          ? continuity.items.map(item => `${item.label}: ${item.text}`).join("\n")
          : "No consequential reviewed continuity was recorded.",
        ...continuity,
      },
    };
  }

  let pack = null;
  let unavailable = false;
  try {
    pack = await server.readMeetingPack({
      userId,
      organizationId: meeting.organizationId,
      questionId: meeting.questionId,
      conversationId: meeting.occurrenceId,
      seriesId: meeting.seriesId,
    });
  } catch {
    unavailable = true;
  }

  const analysisResponse = await server.analyzeSourceScopedForDevelopment({
    userId,
    organizationId: meeting.organizationId,
    questionId: meeting.questionId,
    seriesId: meeting.seriesId,
    occurrenceId: meeting.occurrenceId,
  });
  const analysis = analysisResponse.result.status === "eligible" ? analysisResponse.result.candidate : undefined;
  const alignment = analysis
    ? await server.readMeetingPerspectives({
        userId,
        organizationId: meeting.organizationId,
        questionId: meeting.questionId,
        conversationId: meeting.occurrenceId,
        seriesId: meeting.seriesId,
        workingAnalysisDigest: analysis.candidateDigest,
      })
    : [];
  const personal = await getPersonalRoomSheetPreviewAction(seriesAddress);
  const checkpoint = workspace.currentStep === "capture" || workspace.currentStep === "review"
    ? await resolveCurrentLeadershipConversationCheckpoint({
        userId,
        organizationId: meeting.organizationId,
        questionId: meeting.questionId,
        conversationId: meeting.occurrenceId,
        seriesId: meeting.seriesId,
      })
    : null;
  const directory = await authorizedMeetingDirectory({
    userId,
    organizationId: meeting.organizationId,
    currentAccess: meetingAccess,
  });
  const origins = await Promise.all(directory.filter(item => item.occurrenceId !== meeting.occurrenceId).map(async item => {
    const originWorkspace = await server.workspace({
      userId,
      organizationId: meeting.organizationId,
      questionId: item.questionId,
      conversationId: item.occurrenceId,
    });
    const citations = originWorkspace.proposals.flatMap(value => value.reviewedCarryForward?.citations ?? []);
    const citationAccess = citations.length > 0 && await server.verifyReviewedCarryForwardCitations({
      userId,
      organizationId: meeting.organizationId,
      seriesId: item.seriesId,
      citations,
    });
    return { meeting: item, workspace: originWorkspace, citationAccess };
  }));
  const relevantElsewhere = projectCrossMeetingRelevanceV1(workspace, origins);

  return <DiscoveryShell organization={{ organizationId: meeting.organizationId, organizationName: "Northstar Implementation Services", runtimeAvailable: true, coherence: null, confidence: null, coherenceLabel: "Understanding available" }} showSessionImpact={false} productNavigation={<MeetingPortfolioNavigation meetings={directory}/>}>
    <MeetingPortfolioShell meetings={directory}>
      <LeadershipConversationExperience initialWorkspace={workspace} prepare={prepare} valueLayer={compileChiefOfStaffValueLayerV1(prepare, analysis)} personalSheet={personal.sheet} occurrenceRef={personal.occurrenceRef} initialCheckpoint={checkpoint ? { checkpointId: checkpoint.checkpointId, contributionArtifactIds: checkpoint.contributionArtifactIds } : null} initialMeetingPack={pack} meetingPackUnavailable={unavailable} relevantElsewhere={relevantElsewhere} alignment={alignment} workingAnalysisDigest={analysis?.candidateDigest ?? null} seriesAddress={seriesAddress} occurrenceLabel={meeting.predecessorOccurrenceId ? "Successor occurrence" : "Current occurrence"}/>
    </MeetingPortfolioShell>
  </DiscoveryShell>;
}
