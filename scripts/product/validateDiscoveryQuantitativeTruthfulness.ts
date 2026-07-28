import assert from "node:assert/strict";
import fs from "node:fs";

import { buildDiscoveryExperienceView } from "../../components/product-shell/data/buildDiscoveryExperienceView";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";

let checks = 0;
function check(condition: unknown, message: string) {
  assert.ok(condition, message);
  checks += 1;
}

const section = (summary: string, items: string[] = [summary]) => ({
  title: summary,
  owner: "authorized-projection",
  available: true,
  summary,
  items,
});
const experience = buildDiscoveryExperienceView({
  runtime: createEmptyOrganizationRuntime({
    organizationId: "atlas-truthfulness-validation",
    name: "Truthfulness Validation",
  }),
  view: {
    insights: [{ id: "authorized-understanding" }],
    runtimeSections: {
      currentUnderstanding: section("Authorized understanding"),
      explanations: section("Authorized explanation"),
      evidence: section("Authorized evidence"),
      uncertainty: section("Authorized uncertainty"),
      conditions: section("Authorized condition"),
      organizationalState: section("Authorized state"),
      investigations: section("Authorized inquiry"),
      recentChanges: section("Authorized change"),
      modelEvolution: section("Authorized evolution"),
    },
  } as never,
});

check(experience.understanding.confidence.qualitative === null,
  "Production qualitative confidence must not be synthesized.");
check(experience.understanding.confidence.value === null,
  "Production scalar confidence must remain undisclosed.");
check(experience.understanding.confidence.change === null,
  "Production confidence trend must remain undisclosed.");
check(experience.sources.every((source) => source.contribution === null),
  "Production contribution ratings must not be synthesized.");
check(experience.changes.every((change) => change.impact === null),
  "Production impact ratings must not be synthesized.");
check(!JSON.stringify(experience).match(/\b(?:81|64|58|74|62)\b/),
  "Prototype quantitative values must not enter the Production view model.");

const experienceSource = fs.readFileSync(
  "components/alpha/AlphaExperience.tsx",
  "utf8",
);
const semanticSource = fs.readFileSync(
  "components/alpha/AlphaSemantic.tsx",
  "utf8",
);
const routeSource = fs.readFileSync(
  "app/(product)/your-organization/page.tsx",
  "utf8",
);

check(experienceSource.includes("<b>Confidence unavailable</b> · Trend unavailable"),
  "Related Understandings must render bounded unavailable states.");
check(experienceSource.includes("Quantitative evolution is unavailable."),
  "Understanding Evolution must render a bounded unavailable state.");
check(experienceSource.includes("showTrend={!hosted}"),
  "Hosted relationship rows must suppress synthetic trend graphics.");
check(experienceSource.includes("!hosted && <Sparkline"),
  "Hosted cards must suppress synthetic sparklines.");
check(experienceSource.includes('hosted ? "Unavailable" : "Early"'),
  "Hosted Plan confidence must not use fixture ratings.");
check(experienceSource.includes('experience.changes[0]?.impact ?? "Unavailable"'),
  "Hosted impact must originate in the view model or be unavailable.");
check(semanticSource.includes("confidence.value !== null &&"),
  "Confidence graphics must require a disclosed scalar value.");
check(semanticSource.includes('confidence.qualitative ?? "Unavailable"'),
  "Missing qualitative confidence must render unavailable.");
check(semanticSource.includes('confidence.change === null ? "Trend unavailable"'),
  "Missing trend must render unavailable.");
check(semanticSource.includes('confidence.value === null ? "Undisclosed"'),
  "Missing scalar confidence must render undisclosed.");
check(routeSource.includes("buildDiscoveryExperienceView({"),
  "The hosted route must continue to use the authorized adapter.");
check(!routeSource.includes("alphaFixture"),
  "The hosted route must not import the prototype fixture.");

console.log(JSON.stringify({
  validation: "discovery-quantitative-truthfulness",
  result: "PASS",
  checks,
  productionQuantitativeSource: "authorized-view-model-only",
  missingValueState: "unavailable-or-undisclosed",
}));
