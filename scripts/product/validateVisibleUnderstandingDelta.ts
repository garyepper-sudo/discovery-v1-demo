import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { visibleUnderstandingDelta } from "../../components/alpha/classifyTeachDiscoveryLearning";

assert.equal(
  visibleUnderstandingDelta({
    outcome: "changed",
    changedFields: ["Current understanding revised"],
  }).kind,
  "material_revision",
);
assert.equal(
  visibleUnderstandingDelta({
    outcome: "strengthened",
    changedFields: ["Evidence basis updated"],
  }).kind,
  "support_strengthened",
);
assert.equal(
  visibleUnderstandingDelta({
    outcome: "changed",
    changedFields: ["Remaining uncertainty updated"],
  }).kind,
  "uncertainty_changed",
);
assert.equal(
  visibleUnderstandingDelta({
    outcome: "changed",
    changedFields: ["Next improvement updated"],
  }).kind,
  "recommendation_changed",
);
assert.deepEqual(
  visibleUnderstandingDelta({
    outcome: "strengthened",
    changedFields: [],
  }),
  {
    kind: "no_material_change",
    headline: "Discovery incorporated what you shared.",
    detail: "The strongest current understanding remains unchanged.",
  },
);
assert.equal(
  visibleUnderstandingDelta({
    outcome: "underdetermined",
    changedFields: [],
  }).kind,
  "underdetermined",
);

const alpha = readFileSync("components/alpha/AlphaExperience.tsx", "utf8");
const workspace = alpha.slice(
  alpha.indexOf("function HostedUnderstandingWorkspace"),
  alpha.indexOf("function HomeScene"),
);
assert.ok(
  workspace.includes("Latest Change") &&
    workspace.includes("visibleUnderstandingDelta(learningFeedback)") &&
    workspace.includes('aria-live="polite"'),
  "The deterministic delta must render prominently and accessibly.",
);
assert.ok(
  workspace.includes("supportStateChange") &&
    workspace.includes("Current support:"),
  "Support movement may render only when the bounded state actually changes.",
);
assert.ok(
  workspace.includes("latestChangeEmphasized") &&
    workspace.includes("window.setTimeout"),
  "Changed sections must receive bounded temporary emphasis.",
);

console.log(JSON.stringify({
  validation: "visible-understanding-delta",
  result: "PASS",
  outcomes: [
    "material_revision",
    "support_strengthened",
    "uncertainty_changed",
    "recommendation_changed",
    "no_material_change",
    "underdetermined",
  ],
  rawEngineComparison: false,
  routeMutationAdded: false,
}, null, 2));
