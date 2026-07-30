import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { understandingSupportState } from "../../components/alpha/classifyTeachDiscoveryLearning";

assert.equal(understandingSupportState("Early"), "Emerging");
assert.equal(understandingSupportState("Moderate"), "Working");
assert.equal(understandingSupportState("High"), "Supported");
assert.equal(understandingSupportState(null), "Working");

const alpha = readFileSync("components/alpha/AlphaExperience.tsx", "utf8");
const workspace = alpha.slice(
  alpha.indexOf("function HostedUnderstandingWorkspace"),
  alpha.indexOf("function HomeScene"),
);

assert.ok(
  workspace.includes("understandingSupportState(") &&
    workspace.includes("Current support"),
  "Hosted Alpha must present the bounded product-owned support state.",
);
assert.equal(
  workspace.includes("Authority-qualified"),
  false,
  "Authority-qualified must not remain the primary user-facing support label.",
);
assert.equal(
  workspace.includes("understanding.confidence.value"),
  false,
  "Hosted Alpha must not expose an unsupported numeric confidence value.",
);
assert.ok(
  workspace.includes("No unsupported percentage is shown."),
  "The support presentation must make its bounded precision explicit.",
);

console.log(JSON.stringify({
  validation: "understanding-support-state",
  result: "PASS",
  vocabulary: ["Emerging", "Working", "Supported"],
  mapping: {
    Early: "Emerging",
    Moderate: "Working",
    High: "Supported",
    unavailableScalar: "Working",
  },
  numericConfidenceShown: false,
}, null, 2));
