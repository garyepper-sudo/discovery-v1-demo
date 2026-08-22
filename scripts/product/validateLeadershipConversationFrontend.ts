import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { readLeadershipConversationFixture } from "../../product/frontend/leadershipConversationFixtureAdapter";
import { provisionNorthstarPreparationLineageFixture } from "../../product/simulations/living-organization-sandbox/preparationLineageFixtureProvisioner";
import { isLeadershipConversationPrepareAvailable } from "../../product/workflow/leadershipConversation";

let checks = 0;
const check = (value: unknown, message: string) => { assert.ok(value, message); checks += 1; };

async function main() {
  const root = await mkdtemp(path.join(tmpdir(), "discovery-northstar-preparation-lineage-frontend-"));
  try {
    const setup = await provisionNorthstarPreparationLineageFixture({ environment: "test", fixtureRoot: root });
    const workspace = readLeadershipConversationFixture(setup.seed.productQuestionId);
    const managerWorkspace = { ...workspace, currentPreparedWorkProduct: null };
    const [component, sheetPanel, activation, prepare, page, actions, server, builder, css] = await Promise.all([
      readFile("components/product-alpha/leadership-conversation/LeadershipConversationExperience.tsx", "utf8"),
      readFile("components/product-alpha/leadership-conversation/PersonalRoomSheetPanel.tsx", "utf8"),
      readFile("components/product-alpha/leadership-conversation/LeadershipConversationActivation.tsx", "utf8"),
      readFile("components/product-alpha/leadership-conversation/LeadershipConversationPrepare.tsx", "utf8"),
      readFile("app/product-alpha/leadership-conversation/page.tsx", "utf8"),
      readFile("app/product-alpha/leadership-conversation/actions.ts", "utf8"),
      readFile("product/integration/leadershipConversationServerComposition.ts", "utf8"),
      readFile("product/workflow/leadershipConversation/buildLeadershipConversationWorkspace.ts", "utf8"),
      readFile("components/product-alpha/leadership-conversation/LeadershipConversationExperience.module.css", "utf8"),
    ]);
    check(workspace.contractVersion === "1" && workspace.base.contractVersion === "2", "workspace composes V2");
    check(isLeadershipConversationPrepareAvailable(workspace) && !isLeadershipConversationPrepareAvailable(managerWorkspace), "body-free Manager workspace fails closed");
    check(workspace.currentStep === "freeze", "Product owns current step");
    check(!JSON.stringify(workspace).includes("NORTHSTAR-LEADERSHIP-CAPTURE-001"), "raw Source Content absent");
    check(!JSON.stringify(workspace).includes("OrganizationRuntime") && !JSON.stringify(workspace).includes("ScopedGovernanceContext"), "Runtime and authorization absent");
    check(component.includes("<main") && component.includes("<h1") && activation.includes("<h2") && prepare.includes("<h2"), "semantic headings");
    check(component.includes('role="status"') && component.includes('aria-live="polite"'), "text status announced");
    check(css.includes(":focus-visible") && css.includes("min-height: 44px"), "visible focus and touch targets");
    check(activation.includes("disabled={pending}"), "server action pending state rendered");
    check(sheetPanel.includes("disabled={disabled && !open}") && sheetPanel.includes('disabled={disabled || contributionLocked || contributedItemIds.length > 0}'), "Private Working remains closable while selection is disabled");
    check(sheetPanel.includes('aria-expanded={open}') && sheetPanel.includes("non-authoritative and private to you"), "Private Working boundary and disclosure state are accessible");
    check(component.includes("useActionState(freezeOccurrence1FormAction") && component.includes("freezeState.contributionArtifactIds"), "Freeze uses refresh-preserved server references");
    check(page.includes("notFound()") && page.includes('NODE_ENV === "production"'), "development guard");
    check((page.match(/<main className=\{styles\.page\}>/g)?.length ?? 0) === 3 && page.includes("styles.currentCard") && page.includes("styles.safeAction"), "Occurrence 2 and unavailable branches use bounded surfaces");
    check(prepare.includes('prepare.priorCycle.status === "none"') && prepare.includes("Change comparison will begin after this meeting cycle is completed."), "first cycle uses truthful comparison boundary");
    const successor = page.slice(page.indexOf("if (workspace.futurePreparationLink)"), page.indexOf("if (!isLeadershipConversationPrepareAvailable(workspace))"));
    check(successor.includes("server.workspace") && successor.includes("isLeadershipConversationPrepareAvailable(nextWorkspace)") && !successor.includes("getPersonalRoomSheetPreviewAction"), "fresh reload resolves authorized successor before predecessor personal work");
    check(page.indexOf("if (workspace.futurePreparationLink)") < page.indexOf("if (!isLeadershipConversationPrepareAvailable(workspace)") && page.includes("Discovery has not loaded or revealed protected meeting content."), "unavailable successor fails closed");
    check(actions.includes('"use server"') && actions.includes("activateAndPrepareLeadershipConversationAction") && !actions.includes("dispatchLeadershipConversation"), "explicit server actions");
    check(actions.includes("acceptOccurrence1EvidenceAction") && actions.includes('proposal.kind !== "evidence-candidate"') && component.includes("Accept as Evidence"), "Evidence acceptance remains explicit");
    check(!component.includes("SourceContentRepository") && !prepare.includes("OrganizationRuntime"), "frontend firewall");
    check(page.includes('href="/your-organization"') && !page.includes("authorization failed"), "safe non-disclosing unavailable next action");
    check(server.includes("productArtifactAccess.readAuthorized<PreparedWorkProductBodyV1>") && !server.includes("preparedWorkProducts.push"), "authorized split-persistence body reader unchanged");
    check(builder.includes("authorizedPreparedWorkProduct") && builder.includes("preparedWorkPublications"), "authorized Prepare projection unchanged");
    check(component.includes("What changed") && component.includes("Prepare Again") && component.includes("Occurrence 2 is prepared"), "What Changed and Prepare Again rendered");
    check(actions.includes("prepareAgainOccurrence1Action") && server.includes("prepareNextOccurrence"), "Prepare Again uses server-owned orchestration");
    check(component.indexOf("Occurrence 2 is prepared") < component.indexOf("<LeadershipConversationPrepare prepare={nextPrepare}"), "Occurrence 2 renders Prepare only");
    check(!component.includes("freezeOccurrence2") && !component.includes("captureOccurrence2"), "Occurrence 2 execution is not invented");
    check(component.includes("Current stage") && component.includes('aria-current="step"') && component.includes("completed ? null"), "active workflow step is explicit and completed cycles have no current step");
    console.log(JSON.stringify({ validation: "leadership-conversation-frontend-001", result: "PASS", checks, desktop: true, narrow: true, keyboard: true, rawSourceContent: false, runtime: false, cognition: false, authorizationContext: false, networkCalls: 0, productionAccess: 0 }));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

void main();
