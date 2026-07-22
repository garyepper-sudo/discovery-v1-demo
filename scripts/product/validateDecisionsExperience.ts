import assert from "node:assert/strict";

import { buildDecisionsExperienceView } from "../../components/product-shell/data/buildDecisionsExperienceView";
import { createEmptyOrganizationRuntime, type OrganizationRuntime } from "../../engine/v3/runtime";

type MutableMemory = Record<string, unknown>;

function fixture(): OrganizationRuntime {
  const runtime = createEmptyOrganizationRuntime({ organizationId: "org_decisions_validation", name: "Decision Validation" });
  runtime.metadata.investigationCount = 1;
  const memory = runtime.memory as unknown as MutableMemory;
  memory.primaryExecutiveConstraint = {
    id: "constraint-private-id",
    title: "Decision Authority",
    executiveSummary: "Routine operating decisions still require senior escalation.",
    whyNow: "Escalation is slowing delivery decisions.",
    expectedExecutiveImpact: "Clear authority should reduce avoidable delay.",
    confidence: 0.68,
  };
  memory.executiveRecommendation = {
    id: "recommendation-private-id",
    headline: "Delegate routine decision authority.",
    executiveRecommendation: "Assign clear ownership for routine operating decisions.",
    rationale: "Clear ownership should reduce avoidable escalation.",
    confidence: 0.76,
    uncertaintySummary: "Evidence about exception handling is still needed.",
  };
  return runtime;
}

function decision(status: string, id = "decision-private-id") {
  return {
    id,
    title: "Clarify decision ownership",
    decision: "Authorize clear ownership for routine operating decisions.",
    rationale: "Routine escalation is delaying delivery decisions.",
    status,
    disposition: "accepted-recommendation",
    discoveryConfidenceAtDecision: 0.81,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
    outcomeStatus: "not-reviewed",
  };
}

function work(status: string) {
  return {
    id: "work-private-id",
    decisionRecordId: "decision-private-id",
    title: "Clarify decision ownership",
    status,
    updatedAt: "2026-01-03T00:00:00.000Z",
  };
}

const noDecision = fixture();
const noDecisionView = buildDecisionsExperienceView(noDecision);
assert.equal(noDecisionView.state.kind, "no-active-decision");
assert.equal(noDecisionView.lifecycle.currentStage, null);
assert.equal(noDecisionView.lifecycle.stages.some((stage) => stage.status === "current"), false);

const constraintOnly = fixture();
delete (constraintOnly.memory as unknown as MutableMemory).executiveRecommendation;
assert.equal(buildDecisionsExperienceView(constraintOnly).state.kind, "no-active-decision");

const active = fixture();
(active.memory as unknown as MutableMemory).executiveDecisionRecords = [decision("decided")];
(active.memory as unknown as MutableMemory).executiveWork = [work("in-progress")];
const activeView = buildDecisionsExperienceView(active);
assert.equal(activeView.state.kind, "active");
assert.equal(activeView.lifecycle.currentStage, "executing");

const committed = fixture();
(committed.memory as unknown as MutableMemory).executiveDecisionRecords = [decision("decided")];
assert.equal(buildDecisionsExperienceView(committed).lifecycle.currentStage, "committed");

const executing = fixture();
(executing.memory as unknown as MutableMemory).executiveDecisionRecords = [decision("in-progress")];
assert.equal(buildDecisionsExperienceView(executing).lifecycle.currentStage, "executing");

const learned = fixture();
(learned.memory as unknown as MutableMemory).executiveDecisionRecords = [decision("completed")];
(learned.memory as unknown as MutableMemory).executiveWork = [{ ...work("completed") }];
(learned.memory as unknown as MutableMemory).executiveLearning = [{ executiveWorkId: "work-private-id", summary: "Decision authority improved." }];
const learnedView = buildDecisionsExperienceView(learned);
assert.equal(learnedView.state.kind, "no-active-decision");
assert.equal(learnedView.otherWork[0]?.status, "Completed");

const multiple = fixture();
(multiple.memory as unknown as MutableMemory).executiveDecisionRecords = [
  decision("decided"),
  { ...decision("completed", "historical-private-id"), title: "Reduce concurrent work", updatedAt: "2025-12-01T00:00:00.000Z" },
];
const multipleView = buildDecisionsExperienceView(multiple);
assert.equal(multipleView.otherWork.some((item) => item.title === multipleView.state.title), false);

const missingConfidence = fixture();
delete ((missingConfidence.memory as unknown as MutableMemory).executiveRecommendation as MutableMemory).confidence;
delete ((missingConfidence.memory as unknown as MutableMemory).primaryExecutiveConstraint as MutableMemory).confidence;
assert.equal(buildDecisionsExperienceView(missingConfidence).currentPosition.confidenceLabel, "Confidence not yet established");

const empty = fixture();
delete (empty.memory as unknown as MutableMemory).executiveRecommendation;
delete (empty.memory as unknown as MutableMemory).primaryExecutiveConstraint;
assert.equal(buildDecisionsExperienceView(empty).state.kind, "not-ready");

const investigate = fixture();
(investigate.memory as unknown as MutableMemory).executiveSimulation = {
  recommendation: { status: "investigate-further", summary: "More evidence is required.", confidence: 0.5 },
};
const investigateView = buildDecisionsExperienceView(investigate);
assert.equal(investigateView.currentPosition.recommendationStatus, "Investigate further");
assert.match(investigateView.nextStep?.destination ?? "", /^\/research\?/);

const visible = JSON.stringify(activeView);
assert.equal(visible.includes("decision-private-id"), false);
assert.equal(visible.includes("Reduce founder dependency in delivery."), false);
assert.equal(visible.includes("Challenge the current assumption."), false);
assert.deepEqual(buildDecisionsExperienceView(noDecision), buildDecisionsExperienceView(noDecision));

console.log("Decisions experience view validation: 15 checks passed.");
