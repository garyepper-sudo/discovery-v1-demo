import assert from "node:assert/strict";

import { buildAskExperienceView } from "../../components/product-shell/data/buildAskExperienceView";
import { createEmptyOrganizationRuntime, type OrganizationRuntime } from "../../engine/v3/runtime";

type MutableMemory = Record<string, unknown>;

function fixture(): OrganizationRuntime {
  const runtime = createEmptyOrganizationRuntime({ organizationId: "org_ask_validation", name: "Ask Validation" });
  runtime.metadata.investigationCount = 1;
  const memory = runtime.memory as unknown as MutableMemory;
  memory.investigationOpportunities = [
    {
      id: "investigation-private-primary",
      suggestedExecutiveQuestion: "Which decisions still require senior approval?",
      reason: "This question would clarify Decision Flow.",
      missingEvidence: ["Evidence about approval paths."],
    },
    {
      id: "investigation-private-next",
      suggestedExecutiveQuestion: "Where do cross-functional handoffs slow down?",
      reason: "This question would clarify Coordination System.",
      missingEvidence: [],
    },
  ];
  memory.executiveCommunication = {
    id: "communication-private-id",
    headline: "Decision authority is constraining organizational execution.",
    executiveSummary: "Routine decisions continue to require senior escalation.",
    confidence: { value: 0.72, label: "moderate" },
    supportingSignals: [{ id: "signal-private-id", statement: "Teams wait for senior approval before acting." }],
    recommendation: { evidenceThatCouldChangeRecommendation: ["Evidence that teams routinely decide without escalation."] },
  };
  memory.executiveExplanation = {
    assessmentNarrative: "Decision authority remains concentrated in senior leadership.",
    confidenceNarrative: "Confidence is moderate because evidence remains incomplete.",
    confidenceLimiters: ["Approval-path evidence remains incomplete."],
    recommendedEvidenceAreas: ["Recent decision logs."],
  };
  return runtime;
}

const populated = fixture();
const view = buildAskExperienceView(populated);
assert.equal(view.question?.text, "Which decisions still require senior approval?");
assert.equal(view.answer?.headline, "Decision authority is constraining organizational execution.");
assert.equal(view.reasoning.central, "Decision authority remains concentrated in senior leadership.");
assert.equal(view.nextQuestion?.text, "Where do cross-functional handoffs slow down?");
assert.equal(view.uncertainty[0]?.statement, "Approval-path evidence remains incomplete.");

const sparse = fixture();
const sparseMemory = sparse.memory as unknown as MutableMemory;
delete sparseMemory.investigationOpportunities;
delete sparseMemory.executiveCommunication;
delete sparseMemory.executiveExplanation;
delete sparseMemory.executiveAssessment;
delete sparseMemory.organizationalUncertainty;
sparse.memory.organizationalUnderstandingState.currentUnderstandings = [];
const sparseView = buildAskExperienceView(sparse);
assert.equal(sparseView.question, null);
assert.equal(sparseView.answer, null);
assert.equal(sparseView.uncertainty.length, 0);

const visible = JSON.stringify(view);
assert.equal(visible.includes("private-id"), false);
assert.equal(visible.includes("Why does delivery still depend on the founder?"), false);
assert.equal(visible.includes("Question updated"), false);
assert.equal(visible.includes("static placeholder"), false);
assert.deepEqual(buildAskExperienceView(populated), buildAskExperienceView(populated));

assert.equal(view.reasoning.central, (populated.memory as unknown as MutableMemory).executiveExplanation && ((populated.memory as unknown as MutableMemory).executiveExplanation as MutableMemory).assessmentNarrative);

console.log("Ask experience view validation: 7 cases passed.");
