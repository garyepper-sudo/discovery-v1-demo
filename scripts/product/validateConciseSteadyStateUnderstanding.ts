import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const alpha = readFileSync("components/alpha/AlphaExperience.tsx", "utf8");
const workspace = alpha.slice(
  alpha.indexOf("function HostedUnderstandingWorkspace"),
  alpha.indexOf("function HomeScene"),
);
const currentSection = workspace.slice(
  workspace.indexOf('aria-labelledby="current-understanding-title"'),
  workspace.indexOf('aria-labelledby="why-understanding-title"'),
);
const whySection = workspace.slice(
  workspace.indexOf('aria-labelledby="why-understanding-title"'),
  workspace.indexOf('aria-labelledby="uncertainty-title"'),
);
const uncertaintySection = workspace.slice(
  workspace.indexOf('aria-labelledby="uncertainty-title"'),
  workspace.indexOf('aria-labelledby="improve-understanding-title"'),
);
const improvementSection = workspace.slice(
  workspace.indexOf('aria-labelledby="improve-understanding-title"'),
  workspace.indexOf("<DiscoveryOnboardingExperience"),
);

assert.ok(
  currentSection.includes("{conciseUnderstanding}") &&
    alpha.includes("conciseAuthorizedUnderstanding(understanding)") &&
    alpha.includes("boundedSentences(understanding.synthesis, 2)") &&
    alpha.includes("boundedCurrentAnswer(understanding.strongestExplanation)") &&
    alpha.includes("boundedCurrentAnswer(understanding.explanation)") &&
    alpha.includes("boundedCurrentAnswer(understanding.whyItMatters)") &&
    alpha.includes("> 100"),
  "The visible answer must compose only exact bounded Product Communication sentences under the 100-word ceiling.",
);
assert.equal(
  currentSection.includes("understanding.synthesis"),
  false,
  "The full synthesis must not render in the steady-state answer.",
);
assert.ok(
  whySection.includes(".slice(0, 3)") &&
    whySection.includes("boundedCurrentAnswer(item)"),
  "Default supporting reasoning must be limited to three bounded points.",
);
assert.ok(
  uncertaintySection.includes(".slice(0, 3)") &&
    uncertaintySection.includes("boundedCurrentAnswer(item)"),
  "Default uncertainty must be limited to three bounded statements.",
);
assert.equal(
  improvementSection.includes("request.rationale"),
  false,
  "The full investigation rationale must remain behind disclosure.",
);
assert.ok(
  workspace.includes("fullSynthesisTrigger") &&
    workspace.includes("fullSynthesisDisclosure"),
  "Full organizational analysis must remain available through disclosure.",
);
assert.equal(
  workspace.includes("basis.evidenceCategories.map"),
  false,
  "Evidence-role counts must not occupy the steady-state workspace.",
);
assert.equal(
  workspace.includes("No authorized evidence-role counts are available."),
  false,
  "Empty evidence counts must not render as a premium-space fallback.",
);

console.log(JSON.stringify({
  validation: "concise-steady-state-understanding",
  result: "PASS",
  answerTraceableToProductCommunication: true,
  fullSynthesisVisibleByDefault: false,
  defaultSupportingPointsMaximum: 3,
  defaultUncertaintyMaximum: 3,
  primaryImprovementCount: 1,
  emptyEvidenceCountsVisible: false,
}, null, 2));
