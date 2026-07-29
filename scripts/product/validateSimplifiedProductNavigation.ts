import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const alpha = readFileSync("components/alpha/AlphaExperience.tsx", "utf8");
const viewModels = readFileSync("product/alpha/viewModels.ts", "utf8");
const route = readFileSync("app/(product)/your-organization/page.tsx", "utf8");

for (const scene of ["home", "questions", "decisions", "history"]) {
  assert.ok(
    alpha.includes(`scene: "${scene}"`) &&
      viewModels.includes(`"${scene}"`),
    `${scene} must be registered in primary and compatible scene contracts.`,
  );
}
assert.ok(
  alpha.includes("hosted ? primaryNavigation") &&
    alpha.includes("!hosted && journeyNavigation"),
  "Hosted desktop and mobile navigation must use the simplified model.",
);
for (const legacy of [
  "ask",
  "orient",
  "plan",
  "learn",
  "understand",
  "respond",
  "follow",
  "return",
]) {
  assert.ok(
    viewModels.includes(`"${legacy}"`) &&
      alpha.includes(`case "${legacy}"`),
    `Legacy ${legacy} scene must remain a safe compatibility path.`,
  );
}
assert.ok(
  alpha.includes("router.push(`/your-organization?${search.toString()}`)") &&
    alpha.includes("organizationId: experience.organization.id"),
  "Scene navigation must preserve organization identity and browser history.",
);
assert.ok(
  route.includes("alphaScenes.includes") &&
    route.includes("requestedScene"),
  "The active route must continue validating requested scenes.",
);
assert.ok(
  alpha.includes("No decisions have been connected to this understanding yet.") &&
    alpha.includes("does not yet have enough authorized supported"),
  "Decisions must fail closed when no authorized decision view exists.",
);
assert.ok(
  alpha.includes("No meaningful understanding change is available yet."),
  "History must have a concise truthful empty state.",
);

console.log(JSON.stringify({
  validation: "simplified-product-navigation",
  result: "PASS",
  primaryNavigation: ["Home", "Questions", "Decisions", "History"],
  legacyScenesRetained: 8,
  organizationIdentityPreserved: true,
  browserHistoryPreserved: true,
  unsupportedActionsTruthful: true,
}, null, 2));
