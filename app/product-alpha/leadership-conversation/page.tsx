import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { composeChiefFirstPrepareViewFromWorkspace } from "../../../product/integration/chiefLeadershipPreparationComposer";
import { createLeadershipConversationServerComposition, resolveCurrentLeadershipConversationCheckpoint } from "../../../product/integration/leadershipConversationServerComposition";
import { readNorthstarPreparationLineageSeed } from "../../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { SANDBOX_ORGANIZATION_ID } from "../../../product/simulations/living-organization-sandbox/manifest";
import { isLeadershipConversationPrepareAvailable, northstarLeadershipConversationFixture } from "../../../product/workflow/leadershipConversation";
import { LeadershipConversationExperience } from "../../../components/product-alpha/leadership-conversation/LeadershipConversationExperience";
import { LeadershipConversationPrepare } from "../../../components/product-alpha/leadership-conversation/LeadershipConversationPrepare";
import styles from "../../../components/product-alpha/leadership-conversation/LeadershipConversationExperience.module.css";
import { compileChiefOfStaffValueLayerV1 } from "../../../product/workflow/leadershipConversation/chiefCommunicationPlan";
import { getPersonalRoomSheetPreviewAction } from "./actions";

export const dynamic = "force-dynamic";
export default async function LeadershipConversationPage() {
  if (process.env.NODE_ENV === "production" && process.env.DISCOVERY_PRODUCT_ALPHA_FIXTURES_ENABLED !== "true") notFound();
  const { userId } = await auth(), server = createLeadershipConversationServerComposition();
  if (!userId || !await server.authorizePageCurrentAccess({ userId, organizationId: SANDBOX_ORGANIZATION_ID })) notFound();
  const fixtureRoot = process.env.DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT;
  if (!fixtureRoot) throw new Error("Northstar preparation lineage seed is unavailable.");
  const seed = await readNorthstarPreparationLineageSeed({ fixtureRoot, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: "northstar-preparation-lineage-fixture-v1", provisioningKey: "northstar-preparation-lineage:v1" }), fixture = northstarLeadershipConversationFixture(seed.productQuestionId);
  const identity = { userId, organizationId: seed.organizationId, questionId: seed.productQuestionId, conversationId: fixture.conversationId };
  const workspace = await server.workspace(identity);
  if (workspace.futurePreparationLink) {
    const nextWorkspace = await server.workspace({ ...identity, conversationId: workspace.futurePreparationLink.nextConversationId });
    if (!isLeadershipConversationPrepareAvailable(nextWorkspace) || !workspace.closureCompletion) return <main className={styles.page}><header className={styles.hero}><p>Leadership conversation · Occurrence 2</p><h1>Meeting preparation is unavailable</h1><p role="status">Protected preparation cannot be shown with your current access.</p></header><section className={styles.card}><h2>What you can do</h2><p>Confirm your current access or return to your organization workspace. No protected meeting content has been loaded.</p></section></main>;
    const nextBase = composeChiefFirstPrepareViewFromWorkspace(nextWorkspace), nextPrepare = { ...nextBase, seriesId: workspace.closureCompletion.seriesId, priorCycle: { status: "completed" as const, message: "Occurrence 1 is closed and its reviewed outcome is reflected here." }, currentStep: "freeze" as const };
    return <main className={styles.page}><header className={styles.hero}><p>Leadership conversation · Occurrence 2</p><h1>{nextPrepare.meeting.title}</h1><p>{nextPrepare.meeting.purpose}</p><p role="status">Occurrence 2 is prepared, but the next meeting has not started.</p></header><section className={styles.card}><h2>Prepare Again</h2><p>Only the reviewed closure and current authorized evidence shaped this preparation. Private Working and unreviewed meeting content did not carry forward.</p><LeadershipConversationPrepare prepare={nextPrepare} valueLayer={compileChiefOfStaffValueLayerV1(nextPrepare)} /></section></main>;
  }
  if (!isLeadershipConversationPrepareAvailable(workspace)) return <main className={styles.page}><header className={styles.hero}><p>Leadership conversation · Occurrence 1</p><h1>Meeting preparation is unavailable</h1><p role="status">Protected preparation cannot be shown with your current access.</p></header><section className={styles.card}><h2>What you can do</h2><p>Confirm your current access or return to your organization workspace. No protected meeting content has been loaded.</p></section></main>;
  const prepare = composeChiefFirstPrepareViewFromWorkspace(workspace), personal = await getPersonalRoomSheetPreviewAction();
  const checkpoint = workspace.currentStep === "capture" ? await resolveCurrentLeadershipConversationCheckpoint(identity) : null;
  return <LeadershipConversationExperience initialWorkspace={workspace} prepare={prepare} valueLayer={compileChiefOfStaffValueLayerV1(prepare)} personalSheet={personal.sheet} occurrenceRef={personal.occurrenceRef} initialCheckpoint={checkpoint ? { checkpointId: checkpoint.checkpointId, contributionArtifactIds: checkpoint.contributionArtifactIds } : null} />;
}
