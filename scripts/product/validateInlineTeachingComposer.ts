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
const workspace = alpha.slice(
  alpha.indexOf("function HostedUnderstandingWorkspace"),
  alpha.indexOf("function HomeScene"),
);
const inline = onboarding.slice(
  onboarding.indexOf("if (embedded && inlineComposer)"),
  onboarding.indexOf("if (embedded && learningFeedback)"),
);

assert.ok(
  workspace.includes("<DiscoveryOnboardingExperience") &&
    workspace.includes("inlineComposer") &&
    workspace.indexOf("<DiscoveryOnboardingExperience") <
      workspace.indexOf('id="understanding-details"'),
  "The existing evidence experience must render inline before deeper disclosure.",
);
assert.equal(workspace.includes('role="dialog"'), false);
assert.equal(workspace.includes('aria-modal="true"'), false);
assert.equal(workspace.includes("teachOverlay"), false);
assert.equal(workspace.includes("window.history.pushState"), false);

for (const value of [
  "Teach Discovery something new…",
  "Information for Discovery",
  "Upload file",
  "Add source",
  "Add to understanding",
  "Up to three sources per update",
]) {
  assert.ok(inline.includes(value), `Missing inline-composer contract: ${value}`);
}
assert.ok(
  inline.includes("ONBOARDING_EVIDENCE_MAX_FILES") &&
    onboarding.includes('fetch("/api/discovery-lab"') &&
    onboarding.includes("evidenceDigest(requestMaterial)") &&
    onboarding.includes("investigationRequestId"),
  "Inline teaching must reuse the existing batch, API, and deterministic identity path.",
);
assert.ok(
  inline.includes('aria-live="polite"') &&
    onboarding.includes("inlineInputRef.current?.focus()") &&
    inline.includes("Reading what you shared…") &&
    inline.includes("Connecting it to the current understanding"),
  "Processing and outcomes must remain announced in place without fabricated progress.",
);
for (const outcome of [
  "Discovery learned something new.",
  "Discovery incorporated what you shared.",
  "Discovery preserved what you shared, but still cannot distinguish among the leading explanations.",
]) {
  assert.ok(inline.includes(outcome), `Missing compact inline outcome: ${outcome}`);
}
assert.equal(inline.includes("Return to understanding"), false);
assert.equal(inline.includes("Retry with current evidence"), false);
assert.ok(
  onboarding.includes("setObservations(\"\")") &&
    onboarding.includes("setEvidenceSources([])"),
  "A successful admitted batch must reset the inline composer.",
);
assert.ok(
  inline.includes("Discovery could not safely process this update.") &&
    inline.includes('role="alert"'),
  "Genuine failures must remain local and announced.",
);
assert.ok(
  inline.includes("<button type=\"button\" disabled") &&
    inline.includes("Connect source") &&
    inline.includes('title="Not available yet"'),
  "Future connected sources must remain explicitly unavailable.",
);
assert.ok(
  styles.includes(".inlineComposer") &&
    styles.includes(".inlineWritingArea") &&
    styles.includes("@media (max-width: 720px)") &&
    styles.includes("grid-column: 1 / -1"),
  "The composer requires an accessible narrow-width presentation.",
);

console.log(JSON.stringify({
  validation: "inline-teaching-composer",
  result: "PASS",
  existingEvidencePipelineReused: true,
  drawerOrModalUsed: false,
  batchLimit: 3,
  processingInPlace: true,
  compactTruthfulFeedback: true,
  composerResets: true,
  routeMutationAdded: false,
  connectedSourcesEnabled: false,
}, null, 2));
