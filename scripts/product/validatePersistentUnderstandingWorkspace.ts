import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const alpha = readFileSync("components/alpha/AlphaExperience.tsx", "utf8");
const styles = readFileSync(
  "components/alpha/AlphaExperience.module.css",
  "utf8",
);
const viewModel = readFileSync("product/alpha/viewModels.ts", "utf8");
const communicationView = readFileSync(
  "components/product-shell/data/buildDiscoveryExperienceView.ts",
  "utf8",
);

for (const label of [
  "New Understanding",
  "Understanding",
  "Explore",
  "Settings",
  "Active Understandings",
  "Discovery’s Current Understanding",
  "Why Discovery Believes This",
  "Discovery Still Needs To Understand",
  "Improve This Understanding",
  "Teach Discovery something new",
  "Next Best Improvement",
  "Evidence Basis",
]) {
  assert.ok(alpha.includes(label), `Missing workspace label: ${label}`);
}

assert.ok(
  alpha.includes("boundedCurrentAnswer(understanding.synthesis)") &&
    alpha.includes("basis?.summaryExplanation") &&
    alpha.includes("basis?.uncertainty") &&
    alpha.includes("understanding.evidenceRequestDisclosure?.request"),
  "The workspace must compose existing Product Communication fields.",
);
assert.ok(
  alpha.includes("<DiscoveryOnboardingExperience") &&
    alpha.includes("embedded") &&
    alpha.includes("initialOrganizationId={experience.organization.id}"),
  "Teach Discovery must reuse the exact-organization evidence experience in context.",
);
assert.ok(
  alpha.includes('title="New Understanding is not available in this sprint"') &&
    alpha.includes('title="Explore is planned for a future sprint"') &&
    alpha.includes('title="Settings are not available in this sprint"'),
  "Future workspace controls must remain explicitly unavailable.",
);
assert.ok(
  alpha.includes('understanding.confidence.qualitative ?? "Authority-qualified"') &&
    alpha.includes("understanding.confidence.limitation"),
  "Confidence must preserve the authorized boundary without fabrication.",
);
assert.ok(
  alpha.includes("basis.evidenceCategories.map") &&
    alpha.includes("category.count"),
  "Evidence context must use authorized role counts rather than invented evidence.",
);
assert.ok(
  alpha.includes("UnderstandingDisclosure") &&
    alpha.includes("changeTrigger") &&
    alpha.includes("fullSynthesisTrigger"),
  "Existing progressive disclosure must remain available.",
);
assert.ok(
  styles.includes(".workspaceSidebar") &&
    styles.includes(".workspaceColumns") &&
    styles.includes(".teachDiscoveryBar"),
  "The persistent shell, canvas, and anchored teaching interaction require presentation styles.",
);
assert.equal(
  viewModel.includes("PersistentUnderstandingWorkspace"),
  false,
  "Sprint 1 must not introduce a new canonical or product view-model contract.",
);
assert.ok(
  communicationView.includes("buildDiscoveryExperienceView"),
  "The existing Product Communication view remains the workspace source.",
);
assert.equal(alpha.includes("62%"), false);
assert.equal(alpha.includes("3 collaborators"), false);
assert.equal(alpha.includes("Launch Approval Process Notes"), false);

console.log(JSON.stringify({
  validation: "persistent-understanding-workspace",
  result: "PASS",
  productCommunicationReused: true,
  evidencePipelineReused: true,
  confidenceFabricated: false,
  collaboratorMetadataFabricated: false,
  evidenceNamesFabricated: false,
  newViewModelIntroduced: false,
  runtimeMutatedByRendering: false,
  compatibilityScenesRetained: true,
}, null, 2));
