import assert from "node:assert/strict";

import { buildResearchExperienceView } from "../../components/product-shell/data/buildResearchExperienceView";
import { createEmptyOrganizationRuntime, type OrganizationRuntime } from "../../engine/v3/runtime";

type MutableMemory = Record<string, unknown>;

function fixture(): OrganizationRuntime {
  const runtime = createEmptyOrganizationRuntime({ organizationId: "org_research_validation", name: "Research Validation" });
  runtime.metadata.investigationCount = 1;
  const memory = runtime.memory as unknown as MutableMemory;
  memory.investigationOpportunities = [
    {
      id: "investigation-private-primary",
      topic: "Decision Authority",
      reason: "This investigation could reduce uncertainty in Decision Flow.",
      expectedConfidenceGain: 12,
      executiveLeverage: "high",
      affectedConditions: ["Decision Flow", "Leadership Dependency"],
      missingEvidence: [
        "Evidence about decision rights and approval paths.",
        "Evidence about escalation frequency.",
      ],
      suggestedExecutiveQuestion: "Which decisions still require senior approval?",
    },
    {
      id: "investigation-private-secondary",
      topic: "Knowledge Preservation",
      reason: "This investigation could reduce uncertainty in Knowledge Continuity.",
      expectedConfidenceGain: 9,
      executiveLeverage: "medium",
      affectedConditions: ["Knowledge Continuity"],
      missingEvidence: ["Evidence about where operational knowledge lives."],
      suggestedExecutiveQuestion: "Where does critical operational knowledge live?",
    },
  ];
  memory.executiveExplanation = {
    uncertaintyNarrative: "Decision ownership remains insufficiently observed.",
    investigationNarrative: "Evidence about routine approvals would clarify the current model.",
    recommendedEvidenceAreas: ["Recent decision logs."],
  };
  return runtime;
}

const populated = fixture();
const populatedView = buildResearchExperienceView(populated);
assert.equal(populatedView.highestUnknown?.headline, "Which decisions still require senior approval?");
assert.equal(populatedView.evidenceRequests.length, 2);
assert.equal(populatedView.opportunities.length, 1);
assert.match(populatedView.recommendation?.destination ?? "", /^\/research\?/);
assert.equal(populatedView.estimatedConfidenceImprovement, "12 points");

const missingEvidence = fixture();
(missingEvidence.memory as unknown as MutableMemory).investigationOpportunities = [];
missingEvidence.memory.organizationalUnderstandingState.currentUnderstandings = [{
  id: "understanding-private-id",
  openQuestions: ["Does decision ambiguity recur across teams?"],
  missingInformation: ["Cross-team decision records."],
  whyItMatters: "The intervention depends on whether the pattern is persistent.",
  confidence: 0.61,
} as never];
const missingEvidenceView = buildResearchExperienceView(missingEvidence);
assert.equal(missingEvidenceView.evidenceRequests[0]?.title, "Cross-team decision records.");
assert.equal(missingEvidenceView.highestUnknown?.confidence, 61);

const none = fixture();
const noneMemory = none.memory as unknown as MutableMemory;
noneMemory.investigationOpportunities = [];
delete noneMemory.executiveExplanation;
delete noneMemory.organizationalUncertainty;
none.memory.organizationalUnderstandingState.currentUnderstandings = [];
const noneView = buildResearchExperienceView(none);
assert.equal(noneView.highestUnknown, null);
assert.equal(noneView.recommendation, null);
assert.equal(noneView.evidenceRequests.length, 0);

const many = fixture();
const manyMemory = many.memory as unknown as MutableMemory;
manyMemory.investigationOpportunities = [
  ...(manyMemory.investigationOpportunities as unknown[]),
  ...Array.from({ length: 5 }, (_, index) => ({
    topic: `Topic ${index}`,
    reason: `Grounded reason ${index}.`,
    suggestedExecutiveQuestion: `Question ${index}?`,
  })),
];
assert.equal(buildResearchExperienceView(many).opportunities.length, 3);

const visible = JSON.stringify(populatedView);
assert.equal(visible.includes("private"), false);
assert.equal(visible.includes("Review the delivery playbook."), false);
assert.equal(visible.includes("Consultant onboarding guide"), false);
assert.equal(visible.includes("Teach Discovery"), false);
assert.deepEqual(buildResearchExperienceView(populated), buildResearchExperienceView(populated));

const noFabrication = buildResearchExperienceView(none);
assert.equal(noFabrication.opportunities.length, 0);
assert.equal(noFabrication.recommendation, null);

console.log("Research experience view validation: 8 cases passed.");
