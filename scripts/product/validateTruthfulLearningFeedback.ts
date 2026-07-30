import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import {
  classifyTruthfulLearningOutcome,
  type AuthorizedLearningSnapshot,
} from "../../components/alpha/classifyTeachDiscoveryLearning";

const unchanged: AuthorizedLearningSnapshot = {
  currentUnderstanding: "Coordination remains the strongest supported explanation.",
  confidence: "authority-qualified",
  uncertainty: "Approval timing remains unresolved.",
  evidenceBasis: "supporting:2",
  nextImprovement: "Compare approval and launch timestamps.",
};

assert.deepEqual(
  classifyTruthfulLearningOutcome({
    evidenceOutcome: "supported",
    before: unchanged,
    after: { ...unchanged, currentUnderstanding: "Coordination and approval latency are both supported." },
  }),
  {
    outcome: "changed",
    changedFields: ["Current understanding revised"],
  },
  "A material authorized revision must produce Outcome A.",
);

assert.deepEqual(
  classifyTruthfulLearningOutcome({
    evidenceOutcome: "supported",
    before: unchanged,
    after: { ...unchanged, evidenceBasis: "supporting:3" },
  }),
  {
    outcome: "strengthened",
    changedFields: ["Evidence basis updated"],
  },
  "Evidence-basis growth without a material revision must produce Outcome B.",
);

assert.equal(
  classifyTruthfulLearningOutcome({
    evidenceOutcome: "underdetermined",
    before: unchanged,
    after: unchanged,
  }).outcome,
  "underdetermined",
  "Preserved evidence that cannot distinguish explanations must produce Outcome C.",
);

const onboarding = readFileSync(
  "components/onboarding/DiscoveryOnboardingExperience.tsx",
  "utf8",
);
const alpha = readFileSync("components/alpha/AlphaExperience.tsx", "utf8");

for (const copy of [
  "Discovery learned something new",
  "Discovery incorporated what you shared",
  "Discovery needs more evidence to distinguish what is happening",
  "What you shared has been preserved",
  "Return to understanding",
  "Add another perspective",
]) {
  assert.ok(onboarding.includes(copy), `Missing truthful learning feedback: ${copy}`);
}
assert.ok(
  onboarding.indexOf('response.status === 422') <
    onboarding.indexOf("!response.ok"),
  "The embedded abstention outcome must be translated before generic failure handling.",
);
assert.ok(
  onboarding.includes("setEvidenceSources([])") &&
    onboarding.includes('stage: "evidence-plan"'),
  "Admitted evidence must clear the completed batch and preserve the next batch contract.",
);
assert.ok(
  onboarding.includes("Discovery could not safely process this update") &&
    onboarding.includes('"Try again"'),
  "Genuine submission failures must retain a distinct Outcome D presentation.",
);
assert.ok(
  alpha.includes("classifyTruthfulLearningOutcome") &&
    alpha.includes("authorizedLearningSnapshot(understanding)") &&
    alpha.includes("startRefresh(() => router.refresh())"),
  "Learning outcomes must compare refreshed authorized projection data in context.",
);
assert.ok(
  alpha.indexOf('result.outcome === "underdetermined"') <
    alpha.indexOf("startRefresh(() => router.refresh())"),
  "An underdetermined admitted result must preserve the current authorized workspace without requiring a refresh.",
);
assert.equal(
  alpha.includes("confidence increased"),
  false,
  "Hosted Alpha must not claim unsupported confidence movement.",
);

console.log(JSON.stringify({
  validation: "truthful-learning-feedback",
  result: "PASS",
  outcomeA: "changed",
  outcomeB: "strengthened",
  outcomeC: "underdetermined",
  outcomeD: "actual-failure",
  evidencePreservationAcknowledged: true,
  unsupportedConfidenceMovement: false,
  routeNavigationAdded: false,
}, null, 2));
