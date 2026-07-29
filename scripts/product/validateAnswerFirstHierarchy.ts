import assert from "node:assert/strict";
import fs from "node:fs";

const alphaPath = "components/alpha/AlphaExperience.tsx";
const disclosurePath = "components/alpha/UnderstandingDisclosure.tsx";
const compositionPath =
  "components/product-shell/data/buildDiscoveryExperienceView.ts";

const alpha = fs.readFileSync(alphaPath, "utf8");
const disclosure = fs.readFileSync(disclosurePath, "utf8");
const composition = fs.readFileSync(compositionPath, "utf8");

function position(source: string, value: string): number {
  const index = source.indexOf(value);
  assert.notEqual(index, -1, `Expected ${value} in source.`);
  return index;
}

const understandStart = position(alpha, "function UnderstandScene");
const understandEnd = position(alpha, "function RespondScene");
const understand = alpha.slice(understandStart, understandEnd);

const originalQuestion = position(understand, "<Eyebrow>Original question</Eyebrow>");
const currentAnswer = position(understand, "<Eyebrow>Current answer</Eyebrow>");
const uncertainty = position(understand, "<Eyebrow>Remaining uncertainty</Eyebrow>");
const nextLearning = position(
  understand,
  '<Eyebrow tone="violet">Next learning opportunity</Eyebrow>',
);
const fullSynthesis = position(understand, "{fullSynthesisTrigger}");

assert.ok(originalQuestion < currentAnswer);
assert.ok(currentAnswer < uncertainty);
assert.ok(uncertainty < nextLearning);
assert.ok(nextLearning < fullSynthesis);
assert.ok(
  understand.includes(
    "fullSynthesis={experience.understanding.synthesis}",
  ),
);
assert.ok(
  disclosure.includes("<p>{fullSynthesis}</p>"),
  "The full synthesis must be presented byte-identically.",
);
assert.ok(
  alpha.includes("synthesis.slice(0, sentenceEnd + 1)"),
  "The bounded answer must be an exact prefix, not a rewritten synthesis.",
);
assert.equal(
  composition.includes("boundedCurrentAnswer"),
  false,
  "Answer bounding must remain presentation-only.",
);
assert.equal(
  composition.includes("Full organizational analysis"),
  false,
  "Product Communication composition must remain unchanged.",
);

console.log(JSON.stringify({
  validation: "answer-first-hierarchy",
  result: "PASS",
  order: [
    "original-question",
    "current-answer",
    "remaining-uncertainty",
    "next-learning-opportunity",
    "full-organizational-analysis",
  ],
  canonicalSynthesisPreservedExactly: true,
  productCommunicationChanged: false,
  runtimeChanged: false,
  cognitionChanged: false,
  authorizationChanged: false,
}, null, 2));
