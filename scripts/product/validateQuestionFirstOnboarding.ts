import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(__dirname, "../..");
const component = fs.readFileSync(
  path.join(
    root,
    "components/onboarding/DiscoveryOnboardingExperience.tsx",
  ),
  "utf8",
);
const route = fs.readFileSync(
  path.join(root, "app/api/discovery-lab/route.ts"),
  "utf8",
);

const requiredComponentContracts = [
  /What are you trying to understand\?/,
  /Investigate this/,
  /organization-context/,
  /evidence-plan/,
  /processing/,
  /first-understanding/,
  /What have you already noticed about this\?/,
  /Continue with current context/,
  /Upload file/,
  /Paste information/,
  /Current understanding/,
  /Likely explanations/,
  /Alternative explanations/,
  /Decision implications/,
  /Evidence still weak/,
  /What Discovery would investigate next/,
  /What Discovery would watch next/,
  /Working explanation/,
  /Continue to Discovery/,
  /fetch\("\/api\/discovery-lab"/,
  /if \(submitting\) return/,
  /window\.sessionStorage\.getItem/,
  /setOnboardingRequestId\(draft\.onboardingRequestId\)/,
  /window\.sessionStorage\.removeItem\(draftStorageKey\)/,
  /new AbortController\(\)/,
  /stageHeadingRef\.current\?\.focus\(\)/,
  /buildProductHref\("\/your-organization"/,
];

for (const contract of requiredComponentContracts) {
  assert.match(component, contract);
}

const prohibitedActiveOnboardingLanguage = [
  /Build your Operating Model/,
  /Create Your Operating Model/,
  /Executive Operating System/,
  /Executive Work experience/,
  /Choose files/,
  /API returned/,
  /board-deck/,
  /alphaFixture/,
  /atlas-manufacturing-simulation/,
];

for (const prohibited of prohibitedActiveOnboardingLanguage) {
  assert.doesNotMatch(component, prohibited);
}

const requiredRouteContracts = [
  /status: "validation-failed"/,
  /status: "access-denied"/,
  /status: "insufficient-evidence"/,
  /: "complete"/,
  /productUtility\?\.status === "provisional"/,
  /translateProductUnderstanding/,
  /optimizeTruthfulUtility/,
  /understanding: productUtility\.understanding/,
  /productUnderstandingStatus/,
  /productUtilityStatus/,
  /onboarding\.investigation\.completed/,
];

for (const contract of requiredRouteContracts) {
  assert.match(route, contract);
}

assert.doesNotMatch(route, /alphaFixture/);
assert.doesNotMatch(route, /atlas-manufacturing-simulation/);

console.log(JSON.stringify({
  validation: "question-first-onboarding",
  result: "PASS",
  questionFirst: true,
  progressiveStages: true,
  canonicalEndpoint: "/api/discovery-lab",
  rawTechnicalErrorsHidden: true,
  placeholderUploadsRemoved: true,
  canonicalInitialUnderstandingRequired: true,
}, null, 2));
