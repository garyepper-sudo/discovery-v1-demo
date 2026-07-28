import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  ONBOARDING_EVIDENCE_MAX_BYTES,
  sanitizeEvidenceName,
  validateEvidenceContent,
  validateEvidenceFileMetadata,
} from "../../lib/onboarding/evidence/onboardingEvidence";
import { runDiscoveryV3 } from "../../engine/v3";
import {
  createEmptyOrganizationRuntime,
  evolveOrganizationRuntime,
} from "../../engine/v3/runtime";
import { buildOnboardingInvestigationInput } from "../../lib/onboarding/testing/buildOnboardingInvestigationInput";

const root = path.resolve(__dirname, "../..");
const read = (relativePath: string) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");
const component = read(
  "components/onboarding/DiscoveryOnboardingExperience.tsx",
);
const stylesheet = read(
  "components/onboarding/DiscoveryOnboardingExperience.module.css",
);
const route = read("app/api/discovery-lab/route.ts");
const evidenceEngine = read("engine/v3/evidence.ts");

function quietlyEvolve(
  input: ReturnType<typeof buildOnboardingInvestigationInput>,
  organizationId: string,
) {
  const originalLog = console.log;
  console.log = () => {};
  try {
    return evolveOrganizationRuntime({
      runtime: createEmptyOrganizationRuntime({ organizationId }),
      result: runDiscoveryV3(input),
      input,
    });
  } finally {
    console.log = originalLog;
  }
}

for (const metadata of [
  { name: "notes.txt", type: "text/plain", size: 10 },
  { name: "brief.md", type: "text/markdown", size: 10 },
  { name: "measures.csv", type: "text/csv", size: 10 },
]) {
  assert.equal(validateEvidenceFileMetadata(metadata), null);
}
assert.match(
  validateEvidenceFileMetadata({
    name: "board.pdf",
    type: "application/pdf",
    size: 10,
  }) ?? "",
  /not supported/,
);
assert.match(
  validateEvidenceFileMetadata({
    name: "report.docx",
    type:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    size: 10,
  }) ?? "",
  /not supported/,
);
assert.match(
  validateEvidenceFileMetadata({
    name: "notes.txt",
    type: "text/plain",
    size: ONBOARDING_EVIDENCE_MAX_BYTES + 1,
  }) ?? "",
  /under 512 KB/,
);
assert.match(validateEvidenceContent("\u0000binary") ?? "", /not plain text/);
assert.match(
  validateEvidenceContent("é".repeat(ONBOARDING_EVIDENCE_MAX_BYTES / 2 + 1)) ??
    "",
  /under 512 KB/,
);
assert.equal(sanitizeEvidenceName("../../<Board>|Notes?.txt"), "BoardNotes.txt");

const content = "Approvals took 11 days in May.\nTwo launches missed the handoff.";
const digest = createHash("sha256").update(content).digest("hex");
const input = buildOnboardingInvestigationInput({
  company: "Local Test Organization",
  question: "Why are launches delayed?",
  messyInput: "Three recent launches missed their target dates.",
  evidenceSources: [
    {
      id: "client-only-id",
      sourceRole: "delivery-timeline",
      displayName: "Delivery timeline",
      ingestionMethod: "file",
      originalFilename: "timeline.txt",
      mimeType: "text/plain",
      contentDigest: digest,
      extractionStatus: "extracted",
      content,
    },
  ],
});
const added = input.evidenceSources?.find(
  (source) => source.sourceRole === "delivery-timeline",
);
assert.ok(added);
assert.equal(added.originalFilename, "timeline.txt");
assert.equal(added.sourceName, "Delivery timeline");
assert.equal(added.organizationScope, "current-onboarding-organization");
assert.equal(added.ingestionMethod, "file");
assert.equal(added.mimeType, "text/plain");
assert.equal(added.contentDigest, digest);
assert.equal(added.extractionStatus, "extracted");
assert.match(added.sourceId, /^onboarding-added-[a-f0-9]{20}-1$/);
assert.equal(added.content, content);
const investigation = runDiscoveryV3(input);
assert.ok(investigation.evidence.some((item) =>
  item.sourceRole === "delivery-timeline" &&
  item.originalFilename === "timeline.txt" &&
  item.contentDigest === digest
));

const supportedContent = [
  "Approval took 11 days for the May release.",
  "The bottleneck contributed to two missed launch dates.",
].join("\n");
const supportedDigest = createHash("sha256")
  .update(supportedContent)
  .digest("hex");
const supportedInput = buildOnboardingInvestigationInput({
  company: "Local Test Organization",
  industry: "Product development",
  question: "How does leadership approval affect release delivery?",
  messyInput: [
    "Leadership approves every product release.",
    "The product team depends on leadership approval before release.",
    "The release process uses the operations dashboard.",
    "Approval delays create a release bottleneck.",
    "The bottleneck contributes to team fatigue.",
  ].join("\n"),
  evidenceSources: [{
    id: "client-only-id",
    sourceRole: "delivery-timeline",
    displayName: "Delivery timeline",
    ingestionMethod: "paste",
    contentDigest: supportedDigest,
    extractionStatus: "extracted",
    content: supportedContent,
  }],
});
const supported = quietlyEvolve(
  supportedInput,
  "onb-dev-evidencevalidation0001",
);
assert.ok(supported.memory.organizationalExplanations.length >= 1);

const negativeInput = buildOnboardingInvestigationInput({
  company: "Local Test Organization",
  question: "Why are launches delayed?",
  messyInput: "The office walls are blue.",
});
const negative = quietlyEvolve(
  negativeInput,
  "onb-dev-evidencenegative0001",
);
assert.equal(negative.memory.organizationalExplanations.length, 0);

assert.throws(
  () =>
    buildOnboardingInvestigationInput({
      company: "Local Test Organization",
      question: "Why are launches delayed?",
      messyInput: "A concrete observation.",
      evidenceSources: [{
        id: "client-only-id",
        sourceRole: "delivery-timeline",
        displayName: "Delivery timeline",
        ingestionMethod: "file",
        originalFilename: "timeline.txt",
        mimeType: "text/plain",
        contentDigest: "0".repeat(64),
        extractionStatus: "extracted",
        content,
      }],
    }),
  /digest/,
);

for (const contract of [
  /AlphaExperience\.module\.css/,
  /QuietHeader/,
  /<Eyebrow/,
  /<Panel/,
  /<Action/,
  /Upload file/,
  /Paste information/,
  /Continue with current context/,
  /Add something else/,
  /Replace/,
  /Remove/,
  /ONBOARDING_EVIDENCE_MAX_FILES/,
  /validateEvidenceFileMetadata/,
  /evidenceSources/,
  /Retry with current evidence/,
  /Return to observations/,
  /role="alert"/,
]) {
  assert.match(component, contract);
}
for (const token of [
  /var\(--alpha-canvas\)/,
  /var\(--alpha-ink\)/,
  /var\(--alpha-body\)/,
  /var\(--alpha-muted\)/,
  /var\(--alpha-line\)/,
  /var\(--alpha-violet\)/,
]) {
  assert.match(stylesheet, token);
}
for (const contract of [
  /buildOnboardingInvestigationInput\(body\)/,
  /status: "validation-failed"/,
  /recovery: evidenceRecovery/,
  /status: "insufficient-evidence"/,
]) {
  assert.match(route, contract);
}
for (const provenance of [
  /sourceRole/,
  /sourceName/,
  /organizationScope/,
  /ingestionMethod/,
  /originalFilename/,
  /mimeType/,
  /contentDigest/,
  /extractionStatus/,
]) {
  assert.match(evidenceEngine, provenance);
}

assert.doesNotMatch(component, /atlas-manufacturing-simulation/);
assert.doesNotMatch(component, /alphaFixture/);
assert.doesNotMatch(route, /console\.(?:info|error|log)\([^)]*body/);
assert.doesNotMatch(route, /JSON\.stringify\(body\)/);

console.log(JSON.stringify({
  validation: "onboarding-evidence-experience",
  result: "PASS",
  visualSystem: "Discovery Alpha",
  supportedFormats: ["txt", "md", "markdown", "csv", "pasted-text"],
  rejectedFormats: ["pdf", "docx"],
  maximumSources: 3,
  maximumBytesPerFile: ONBOARDING_EVIDENCE_MAX_BYTES,
  provenanceRetained: true,
  runtimeBoundaryPreserved: true,
}, null, 2));
