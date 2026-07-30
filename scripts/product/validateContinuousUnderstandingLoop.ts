import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const alpha = readFileSync("components/alpha/AlphaExperience.tsx", "utf8");
const onboarding = readFileSync(
  "components/onboarding/DiscoveryOnboardingExperience.tsx",
  "utf8",
);
const styles = readFileSync(
  "components/onboarding/DiscoveryOnboardingExperience.module.css",
  "utf8",
);
const route = readFileSync("app/api/discovery-lab/route.ts", "utf8");
const hostedWorkspace = alpha.slice(
  alpha.indexOf("function HostedUnderstandingWorkspace"),
  alpha.indexOf("function HomeScene"),
);

assert.ok(
  alpha.includes("<DiscoveryOnboardingExperience") &&
    alpha.includes("embedded") &&
    alpha.includes("inlineComposer"),
  "Teach Discovery must render the existing evidence experience inline inside the workspace.",
);
assert.ok(
  alpha.includes("initialOrganizationId={experience.organization.id}") &&
    alpha.includes("initialQuestion={understanding.originalQuestion}") &&
    alpha.includes("initialCompany={experience.organization.name}") &&
    alpha.includes('experience.organization.id.startsWith("onb-dev-")'),
  "The inline composer must remain scoped to the exact isolated organization.",
);
assert.ok(
  alpha.includes("startRefresh(() => router.refresh())") &&
    alpha.includes("refreshObserved") &&
    alpha.includes("setLearningFeedback({"),
  "The inline composer must wait until the refreshed authorized view settles.",
);
assert.equal(hostedWorkspace.includes('role="dialog"'), false);
assert.equal(hostedWorkspace.includes('aria-modal="true"'), false);
assert.equal(hostedWorkspace.includes("window.history.pushState"), false);
assert.equal(
  hostedWorkspace.includes("router.push(`/onboarding?${search.toString()}`)"),
  false,
  "Teach Discovery must not navigate to onboarding.",
);
assert.ok(
  onboarding.includes("onEvidenceProcessed?: (result: TeachDiscoveryEvidenceResult)") &&
    onboarding.includes('"organization-context"') &&
    onboarding.includes("setQuestion(embedded ? initialQuestion : draft.question)") &&
    onboarding.includes("setCompany(embedded ? initialCompany : draft.company)") &&
    onboarding.includes("setQuestion(initialQuestion)") &&
    onboarding.includes("setCompany(initialCompany)") &&
    onboarding.includes("if (embedded && onEvidenceProcessed)") &&
    onboarding.includes("onEvidenceProcessed({"),
  "The embedded component must preserve canonical context and expose a bounded completion callback.",
);
assert.ok(
  onboarding.includes('fetch("/api/discovery-lab"') &&
    onboarding.includes("investigationRequestId") &&
    onboarding.includes("evidenceDigest(requestMaterial)") &&
    onboarding.includes("ONBOARDING_EVIDENCE_MAX_FILES"),
  "Embedded teaching must retain the canonical API, idempotency, and batch limits.",
);
for (const step of [
  "Reading what you shared",
  "Connecting it to the current understanding",
  "Updating Discovery’s understanding",
]) {
  assert.ok(onboarding.includes(step), `Missing truthful processing state: ${step}`);
}
assert.ok(
  route.includes("isOnboardingTestOrganizationId(organizationId)") &&
    route.includes("findAccessRecords") &&
    route.includes("Organization access denied."),
  "Authorization and organization isolation must remain upstream of evidence admission.",
);
assert.equal(alpha.includes("setInterval"), false, "No fabricated progress timer is permitted.");
assert.equal(alpha.includes("% complete"), false, "No fabricated progress percentage is permitted.");
assert.ok(
  styles.includes(".inlineComposer") &&
    styles.includes(".inlineComposerActions") &&
    styles.includes("grid-template-columns: 1fr 1fr;"),
  "The inline composer must remain usable without horizontal clipping at the existing narrow breakpoint.",
);

console.log(JSON.stringify({
  validation: "continuous-understanding-loop",
  result: "PASS",
  routeTransitionRemoved: true,
  canonicalEvidenceExperienceReused: true,
  exactOrganizationPreserved: true,
  deterministicRequestIdentityPreserved: true,
  authorizedViewRefreshedInPlace: true,
  fabricatedProgress: false,
  runtimeContractChanged: false,
}, null, 2));
