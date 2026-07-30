import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const alpha = readFileSync("components/alpha/AlphaExperience.tsx", "utf8");
const route = readFileSync("app/api/discovery-lab/route.ts", "utf8");
const onboardingRoute = readFileSync(
  "app/onboarding/page.tsx",
  "utf8",
);
const onboarding = readFileSync(
  "components/onboarding/DiscoveryOnboardingExperience.tsx",
  "utf8",
);
const hostedWorkspace = alpha.slice(
  alpha.indexOf("function HostedUnderstandingWorkspace"),
  alpha.indexOf("function HomeScene"),
);

assert.ok(
  alpha.includes('experience.organization.id.startsWith("onb-dev-")'),
  "Active evidence addition must remain isolated to onboarding sandboxes.",
);
assert.ok(
  alpha.includes("<DiscoveryOnboardingExperience") &&
    alpha.includes("embedded") &&
    alpha.includes("onEvidenceProcessed={evidenceProcessed}"),
  "Active evidence addition must embed the canonical onboarding evidence experience.",
);
assert.ok(
  alpha.includes("initialOrganizationId={experience.organization.id}"),
  "Evidence addition must target the exact existing organization.",
);
assert.equal(
  hostedWorkspace.includes("router.push(`/onboarding?${search.toString()}`)"),
  false,
  "The active understanding loop must not leave the workspace.",
);
assert.ok(
  route.includes("isOnboardingTestOrganizationId(organizationId)") &&
    route.includes("findAccessRecords") &&
    route.includes("Organization access denied."),
  "The reused route must enforce exact sandbox identity and active access.",
);
assert.ok(
  route.includes("investigation.canonicalResponse"),
  "Identical retries must retain canonical idempotent replay.",
);
assert.ok(
  onboarding.includes('setStage("evidence-plan")'),
  "The onboarding result must permit repeated evidence addition without a new organization.",
);
assert.ok(
  onboarding.includes("window.sessionStorage.setItem(") &&
    onboarding.includes('stage: "evidence-plan"') &&
    onboarding.includes("organizationId: body.organizationId") &&
    onboarding.includes("evidenceSources: []"),
  "Successful investigations must retain the question while opening a fresh evidence batch.",
);
assert.ok(
  onboardingRoute.includes("improveExisting") &&
    onboardingRoute.includes(
      "requestedOrganizationId === state.organizationId",
    ),
  "Reentry must require the exact active organization.",
);
assert.equal(
  alpha.includes("provisionOnboardingTestOrganization"),
  false,
  "The active product must not provision a second organization.",
);

console.log(JSON.stringify({
  validation: "iterative-understanding-loop",
  result: "PASS",
  exactOrganizationReused: true,
  originalQuestionPreserved: true,
  deterministicRetryIdentity: true,
  canonicalInvestigationReused: true,
  authorizationFailsClosed: true,
  duplicateOrganizationCreated: false,
  completedBatchClearedFromDraft: true,
}, null, 2));
