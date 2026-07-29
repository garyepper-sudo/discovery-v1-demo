import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const alpha = readFileSync("components/alpha/AlphaExperience.tsx", "utf8");
const onboarding = readFileSync(
  "components/onboarding/DiscoveryOnboardingExperience.tsx",
  "utf8",
);

for (const text of [
  "What are you trying to understand?",
  "Tell Discovery what you already know",
  "You can add more information at any time",
  "Improve this understanding",
  "Continue to Discovery",
]) {
  assert.ok(onboarding.includes(text), `Onboarding must preserve: ${text}`);
}

for (const text of [
  "Original question",
  "Current answer",
  "Remaining uncertainty",
  "Next learning",
  "Add information",
]) {
  assert.ok(alpha.includes(text), `Active question must expose: ${text}`);
}

assert.ok(
  alpha.includes("experience.understanding.originalQuestion"),
  "The active product must use the authorized originating question.",
);
assert.ok(
  alpha.includes("boundedCurrentAnswer(experience.understanding.synthesis)"),
  "The active product must reuse the deterministic bounded canonical answer.",
);
assert.ok(
  alpha.includes("experience.understanding.confidence.limitation"),
  "The product must preserve the authorized confidence boundary.",
);
assert.equal(
  alpha.includes("overall confidence score") ||
    alpha.includes("combined confidence"),
  false,
  "The question-centered flow must not invent a combined confidence value.",
);

console.log(JSON.stringify({
  validation: "question-centered-flow",
  result: "PASS",
  originalQuestionPreserved: true,
  currentAnswerCanonical: true,
  confidenceBoundaryPreserved: true,
  nextActionVisible: true,
}, null, 2));
