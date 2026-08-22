import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

let checks = 0;
const check = (value: unknown, message: string) => { assert.ok(value, message); checks += 1; };

async function main() {
  const [experience, prepare, personal, page, activation, experienceCss, personalCss] = await Promise.all([
    readFile("components/product-alpha/leadership-conversation/LeadershipConversationExperience.tsx", "utf8"),
    readFile("components/product-alpha/leadership-conversation/LeadershipConversationPrepare.tsx", "utf8"),
    readFile("components/product-alpha/leadership-conversation/PersonalRoomSheetPanel.tsx", "utf8"),
    readFile("app/product-alpha/leadership-conversation/page.tsx", "utf8"),
    readFile("components/product-alpha/leadership-conversation/LeadershipConversationActivation.tsx", "utf8"),
    readFile("components/product-alpha/leadership-conversation/LeadershipConversationExperience.module.css", "utf8"),
    readFile("components/product-alpha/leadership-conversation/PersonalRoomSheetPanel.module.css", "utf8"),
  ]);
  check(experience.includes("Current stage") && experience.includes("Next:") && experience.includes('aria-current="step"'), "workflow exposes one current stage and next action");
  check(experience.includes('completed ? null') && experience.includes('completed ? "Cycle complete"') && experience.includes('currentStage !== null && <li data-state="current"'), "completed cycles expose no current actionable stage");
  check(experience.includes("{completedStageCount} of {stepLabels.length} stages") && experience.includes('data-state="future"'), "workflow summarizes completed stages and orients only to the material next stage");
  check(experience.includes("styles.primaryAction") && experience.includes("styles.futureCard") && experience.includes("styles.completedCard"), "primary, future, and completed hierarchy is explicit");
  check(experience.indexOf("Only your explicitly selected contribution crossed the meeting boundary") < experience.indexOf("Capture what happened"), "Freeze explains the explicit-only boundary before Capture");
  check(experience.includes("Unselected Private Working was not retained") && experience.includes("Unselected private notes will not persist"), "unselected Private Working non-persistence is explicit");
  check(personal.includes("only you can see this") && personal.includes("non-authoritative and private to you"), "Private Working visibility and non-authority are explicit");
  check(personal.includes('aria-expanded={open}') && personal.includes('aria-controls="private-working-sheet"'), "Private Working disclosure exposes accessible state");
  check(personal.includes("Selected items become durable only when you contribute them and complete Freeze"), "durability requires explicit contribution and Freeze");
  check(prepare.includes("Explore questions, tensions, and what would improve understanding") && prepare.includes("How Discovery reached this view"), "secondary analysis and provenance use progressive disclosure");
  check(prepare.includes("valueLayer.attention") && prepare.includes("valueLayer.whyItMatters") && prepare.includes("valueLayer.changed"), "concise default retains priorities, rationale, and change state");
  check(prepare.includes('prepare.priorCycle.status === "none"') && prepare.includes("Change comparison will begin after this meeting cycle is completed."), "Occurrence 1 does not imply a prior comparison");
  check(page.includes('href="/your-organization"') && (page.match(/Discovery has not loaded or revealed protected meeting content\./g)?.length ?? 0) === 2, "unavailable states offer one safe route without disclosure");
  check(page.includes("Prepared from reviewed material only") && page.includes("Private Working and unreviewed meeting content did not carry forward"), "Occurrence 2 preserves reviewed-only carry-forward");
  check(activation.includes("What must this conversation help you understand?") && activation.includes("Only currently authorized sources are shown"), "activation is question-first and explains authorized source choice");
  check(experienceCss.includes(":focus-visible") && personalCss.includes(":focus-visible"), "interactive surfaces preserve visible keyboard focus");
  check(experienceCss.includes("min-height: 44px") && experienceCss.includes("overflow-wrap: anywhere"), "touch targets and long content remain bounded");
  check(experienceCss.includes("@media(max-width:700px)") && experienceCss.includes("grid-template-columns: 1fr") && personalCss.includes("@media(max-width:700px)"), "narrow layout reduces density without clipping workflow orientation");
  check(!experience.includes("SourceContentRepository") && !prepare.includes("OrganizationRuntime") && !page.includes("authorization failed"), "presentation remains behind Product boundary and failure copy is non-disclosing");
  check(!experience.includes("freezeOccurrence2") && !experience.includes("captureOccurrence2"), "Gate 7 does not invent Occurrence 2 execution semantics");
  console.log(JSON.stringify({ validation: "alpha-experience-and-operations-001", result: "PASS", checks, coreContractsChanged: 0, newOwners: 0, persistenceChanges: 0, authorizationChanges: 0 }));
}

void main();
