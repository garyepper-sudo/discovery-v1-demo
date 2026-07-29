import assert from "node:assert/strict";
import fs from "node:fs";

import { buildDiscoveryExperienceView } from "../../components/product-shell/data/buildDiscoveryExperienceView";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";
import { alphaScenes } from "../../product/alpha/viewModels";

const runtime = createEmptyOrganizationRuntime({
  organizationId: "org_promoted_experience",
  name: "Promoted Experience",
});
const section = (summary: string, items: string[] = [summary]) => ({
  title: summary,
  owner: "authorized-projection",
  available: true,
  summary,
  items,
});
const experience = buildDiscoveryExperienceView({
  runtime,
  view: {
    insights: [{ id: "insight-1" }],
    runtimeSections: {
      currentUnderstanding: section("Authorized understanding"),
      explanations: section("Authorized explanation"),
      evidence: section("Authorized evidence"),
      uncertainty: section("Authorized unknown", [
        "Authorized unknown",
        "Authorized contradiction",
      ]),
      conditions: section("Authorized condition"),
      organizationalState: section("Authorized state"),
      investigations: section("Authorized inquiry"),
      recentChanges: section("Authorized change"),
      modelEvolution: section("Authorized evolution"),
    },
  } as never,
});

assert.equal(experience.productionMode, true);
assert.equal(experience.organization.id, "org_promoted_experience");
assert.equal(experience.understanding.synthesis, "Authorized understanding");
assert.equal(experience.understanding.explanation, "Authorized explanation");
assert.equal(experience.understanding.primaryUnknown, "Authorized unknown");
assert.equal(experience.understanding.contradiction, "Authorized contradiction");
assert.equal(experience.understanding.confidence.value, null);
assert.ok(!JSON.stringify(experience).includes("Runtime not yet available"));
assert.deepEqual(alphaScenes, [
  "home",
  "questions",
  "decisions",
  "history",
  "ask",
  "orient",
  "plan",
  "learn",
  "understand",
  "respond",
  "follow",
  "return",
]);

const route = fs.readFileSync(
  "app/(product)/your-organization/page.tsx",
  "utf8",
);
assert.ok(route.includes("loadActivatedYourOrganization("));
assert.ok(route.includes("buildDiscoveryExperienceView({"));
assert.ok(route.includes("<AlphaExperience"));
assert.ok(route.indexOf("loadActivatedYourOrganization(") <
  route.indexOf("buildDiscoveryExperienceView({"));

const experienceSource = fs.readFileSync(
  "components/alpha/AlphaExperience.tsx",
  "utf8",
);
assert.ok(experienceSource.includes("hosted"));
assert.ok(experienceSource.includes("organizationId: experience.organization.id"));
assert.ok(experienceSource.includes("router.push(`/your-organization?${search.toString()}`)"));
assert.ok(experienceSource.includes("Not quantitatively disclosed"));
assert.ok(experienceSource.includes("Future learning operations are not yet available in this Alpha"));
assert.ok(experienceSource.includes("ClerkSessionTerminationControl") === false);
assert.ok(!experienceSource.includes("router.push(`/alpha/${scene}`);") ||
  experienceSource.includes("if (hosted)"));

assert.ok(route.includes("<ClerkSessionTerminationControl"));

const experienceStyles = fs.readFileSync(
  "components/alpha/AlphaExperience.module.css",
  "utf8",
);
assert.ok(experienceStyles.includes(":focus-visible"));
assert.ok(experienceStyles.includes("@media (prefers-reduced-motion: reduce)"));

console.log(JSON.stringify({
  validation: "discovery-experience-promotion",
  result: "PASS",
  checks: 19,
  hostedEntry: "/your-organization",
  scenes: alphaScenes.length,
  productionFixtureFallback: false,
}));
