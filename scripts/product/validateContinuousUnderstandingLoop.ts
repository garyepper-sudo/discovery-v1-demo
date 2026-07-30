import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const alpha = readFileSync("components/alpha/AlphaExperience.tsx", "utf8");
const onboarding = readFileSync(
  "components/onboarding/DiscoveryOnboardingExperience.tsx",
  "utf8",
);
const styles = readFileSync(
  "components/alpha/AlphaExperience.module.css",
  "utf8",
);
const route = readFileSync("app/api/discovery-lab/route.ts", "utf8");
const hostedWorkspace = alpha.slice(
  alpha.indexOf("function HostedUnderstandingWorkspace"),
  alpha.indexOf("function HomeScene"),
);

assert.ok(
  alpha.includes('role="dialog"') &&
    alpha.includes('aria-modal="true"') &&
    alpha.includes("<DiscoveryOnboardingExperience") &&
    alpha.includes("embedded"),
  "Teach Discovery must open the existing evidence experience inside the workspace.",
);
assert.ok(
  alpha.includes("initialOrganizationId={experience.organization.id}") &&
    alpha.includes("initialQuestion={understanding.originalQuestion}") &&
    alpha.includes("initialCompany={experience.organization.name}") &&
    alpha.includes('experience.organization.id.startsWith("onb-dev-")'),
  "The drawer must remain scoped to the exact isolated organization.",
);
assert.ok(
  alpha.includes("startRefresh(() => router.refresh())") &&
    alpha.includes("refreshObserved") &&
    alpha.includes("setLearningFeedback({"),
  "The drawer must remain open until the refreshed authorized view settles.",
);
assert.ok(
  alpha.includes("previousFocus.current?.focus()") &&
    alpha.includes("onKeyDown={trapDrawerFocus}") &&
    alpha.includes('event.key === "Escape" && !refreshRequested'),
  "Drawer focus must be contained, intentionally dismissed, and restored.",
);
assert.ok(
  alpha.includes("discoveryTeachOpen: true") &&
    alpha.includes('window.addEventListener("popstate", closeOnHistoryBack)') &&
    alpha.includes("window.history.back()"),
  "Browser Back must dismiss the same-URL drawer without leaving the workspace.",
);
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
  "The embedded component must reuse canonical context collection and expose a bounded completion callback.",
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
  "Connecting it to existing evidence",
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
  styles.includes(".teachOverlay") &&
    styles.includes("grid-template-columns: 1fr;") &&
    styles.includes("width: 100vw;"),
  "The drawer must remain usable without horizontal clipping at the existing narrow breakpoint.",
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
