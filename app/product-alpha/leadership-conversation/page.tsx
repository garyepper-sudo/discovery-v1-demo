import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { buildChiefFirstPrepareViewFromWorkspace } from "../../../product/frontend/leadershipConversationFixtureAdapter";
import { composeChiefLeadershipAnalysisToAction } from "../../../product/integration/chiefLeadershipAnalysisToActionComposer";
import { createLeadershipConversationServerComposition } from "../../../product/integration/leadershipConversationServerComposition";
import { readNorthstarPreparationLineageSeed } from "../../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { SANDBOX_ORGANIZATION_ID } from "../../../product/simulations/living-organization-sandbox/manifest";
import { northstarLeadershipConversationFixture } from "../../../product/workflow/leadershipConversation";
export const dynamic = "force-dynamic";
export default async function LeadershipConversationPage() {
  if (process.env.NODE_ENV==="production" && process.env.DISCOVERY_PRODUCT_ALPHA_FIXTURES_ENABLED!=="true") notFound();
  const { userId } = await auth(), server = createLeadershipConversationServerComposition();
  if (!userId || !await server.authorizePageCurrentAccess({ userId, organizationId: SANDBOX_ORGANIZATION_ID })) notFound();
  const fixtureRoot = process.env.DISCOVERY_NORTHSTAR_PREPARATION_LINEAGE_FIXTURE_ROOT;
  if (!fixtureRoot) throw new Error("Northstar preparation lineage seed is unavailable.");
  const seed = await readNorthstarPreparationLineageSeed({ fixtureRoot, organizationId: SANDBOX_ORGANIZATION_ID, fixtureId: "northstar-preparation-lineage-fixture-v1", provisioningKey: "northstar-preparation-lineage:v1" }), fixture = northstarLeadershipConversationFixture(seed.productQuestionId), workspace = await server.workspace({ userId, organizationId: seed.organizationId, questionId: seed.productQuestionId, conversationId: fixture.conversationId });
  let candidate;
  try {
    const view = buildChiefFirstPrepareViewFromWorkspace(workspace), support = await server.resolveEvidenceSupport({ contractVersion: "1", organizationId: seed.organizationId, questionId: seed.productQuestionId, subjectId: userId, requestedScope: { organizationId: seed.organizationId, type: "organization", id: seed.organizationId }, purposeRef: seed.purpose, sensitivity: seed.sensitivity, evaluatedAt: workspace.context?.recordedAt ?? fixture.at, evidenceIds: seed.canonicalMaterial.map(item => item.canonicalObjectId), replayKey: `candidate1-route:${seed.seedDigest}` });
    candidate = composeChiefLeadershipAnalysisToAction({ view, productQuestion: workspace.base.base.question.text, meetingPurpose: view.meeting.purpose, support, permissionScope: "organization", replayKey: `candidate1-route:${seed.seedDigest}` });
  } catch { notFound(); }
  const rendered = candidate.communication.rendered;
  return <main><header><p>Chief · recurring leadership conversation</p><h1>{candidate.view.meeting.title}</h1><p>{candidate.view.meeting.purpose}</p></header>{rendered.firstSurface.map(section => <section key={section.sectionId}><h2>{section.label}</h2>{section.items.map(item => <p key={item.itemId}>{item.text}</p>)}</section>)}{rendered.progressiveDisclosure.length > 0 && <details><summary>Why this is my view</summary>{rendered.progressiveDisclosure.map(section => <section key={section.sectionId}><h2>{section.label}</h2>{section.items.map(item => <p key={item.itemId}>{item.text}</p>)}</section>)}</details>}<footer><p>Chief composes authorized Product understanding. It does not create organizational truth or expose protected source bodies.</p></footer></main>;
}
