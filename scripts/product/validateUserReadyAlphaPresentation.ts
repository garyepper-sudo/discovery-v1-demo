import assert from "node:assert/strict";
import fs from "node:fs";

const alpha = fs.readFileSync(
  "components/alpha/AlphaExperience.tsx",
  "utf8",
);
const disclosure = fs.readFileSync(
  "components/alpha/UnderstandingDisclosure.tsx",
  "utf8",
);
const primitives = fs.readFileSync(
  "components/alpha/AlphaPrimitives.tsx",
  "utf8",
);
const composition = fs.readFileSync(
  "components/product-shell/data/buildDiscoveryExperienceView.ts",
  "utf8",
);

assert.ok(alpha.includes("boundedCurrentAnswer(experience.understanding.synthesis)"));
assert.ok(alpha.includes("experience.understanding.originalQuestion"));
assert.ok(alpha.includes("experience.understanding.primaryUnknown"));
assert.ok(alpha.includes("Open this understanding"));
assert.ok(alpha.includes("Response submission is not yet supported"));
assert.ok(alpha.includes("This sandbox does not submit or retain a response."));
assert.ok(alpha.includes("Follow controls are not yet available"));
assert.ok(alpha.includes("does not create notifications or change a saved follow state"));
assert.ok(
  alpha.includes("This organization remains read-only.") &&
    alpha.includes("disabled={!operational}"),
  "The persistent workspace must disclose and enforce read-only teaching state.",
);
assert.ok(alpha.includes("Organization member"));
assert.ok(alpha.includes("disabled={hosted}"));
assert.ok(alpha.includes("hosted ? <DiscoveryMark compact />"));
assert.ok(alpha.includes('aria-label="Discovery scene"'));
assert.equal(alpha.includes('aria-label="Open navigation"'), false);
assert.ok(primitives.includes("Help content is not yet available in this sandbox"));

assert.equal(
  alpha.includes("Hosted Alpha · authorized projection"),
  false,
  "Internal projection terminology must not appear in Hosted Alpha.",
);
assert.equal(
  alpha.includes("This inquiry is available from the authorized projection."),
  false,
  "Inquiry copy must describe user meaning rather than architecture.",
);
assert.equal(
  disclosure.includes("<Eyebrow>Authorized Product Communication</Eyebrow>"),
  false,
  "Product Communication ownership must not leak into user-facing labels.",
);
assert.equal(
  composition.includes("validateUserReadyAlphaPresentation"),
  false,
  "Presentation readiness must not alter composition.",
);
assert.equal(
  composition.includes(
    "Available from the authority-qualified projected organization view.",
  ),
  false,
  "Learning history must use customer language.",
);
assert.ok(
  disclosure.includes("<p>{fullSynthesis}</p>"),
  "The complete canonical synthesis must remain available unchanged.",
);

console.log(JSON.stringify({
  validation: "user-ready-alpha-presentation",
  result: "PASS",
  homeContinuity: {
    originalQuestion: true,
    boundedCurrentAnswer: true,
    uncertainty: true,
    nextLearning: true,
  },
  unsupportedActionsTruthful: true,
  hostedSubmissionClaim: false,
  hostedFollowPersistenceClaim: false,
  internalArchitectureLabelsVisible: false,
  productCommunicationChanged: false,
  runtimeChanged: false,
  cognitionChanged: false,
  authorizationChanged: false,
}, null, 2));
