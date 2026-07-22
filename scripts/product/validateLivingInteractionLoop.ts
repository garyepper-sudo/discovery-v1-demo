import assert from "node:assert/strict";

import { buildOrganizationExperienceView } from "../../components/product-shell/data/buildOrganizationExperienceView";
import { buildAskExperienceView } from "../../components/product-shell/data/buildAskExperienceView";
import { buildDecisionsExperienceView } from "../../components/product-shell/data/buildDecisionsExperienceView";
import { buildSessionImpact, completedSessionEntry } from "../../components/product-shell/data/buildSessionImpact";
import { createLeadershipDecisionRecord } from "../../components/product-shell/data/createLeadershipDecisionRecord";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";

const runtime = createEmptyOrganizationRuntime({ organizationId: "org_loop_validation", name: "Loop Validation" });
runtime.metadata.investigationCount = 2;
const memory = runtime.memory as unknown as Record<string, unknown>;
memory.organizationalConditions = [
  { id: "condition-decision-flow", name: "Decision Flow", status: "constrained", confidence: 0.8 },
  { id: "condition-coordination", name: "Coordination", status: "active", confidence: 0.7 },
];
memory.executiveAssessment = { primaryJudgment: { dominantConditionId: "condition-decision-flow", confidence: 0.8 }, summary: "Decision Flow is constrained." };
runtime.memory.organizationalUnderstandingState.health.coherence = 0.68;
runtime.memory.organizationalUnderstandingState.currentUnderstandings = [{
  id: "understanding-loop", source: "executive-assessment", title: "Decision authority is slowing execution.", statement: "Decision authority is slowing execution.", summary: "Routine decisions wait for senior approval.", confidence: 0.8,
  confidenceBand: "high", strength: 0.8, stability: 0.7, coverage: 0.6, novelty: 0.2, explanatoryPower: 0.8,
  domainRelevance: { strategy: 0, finance: 0, operations: 1, customers: 0, employees: 0, products: 0 }, status: "emerging",
  firstSeenAt: "2026-01-01T00:00:00.000Z", lastUpdatedAt: "2026-01-01T00:00:00.000Z", supportCount: 2,
  evidenceIds: [], observationIds: [], beliefIds: [], themeIds: [], mechanismIds: [], contradictionIds: [], recommendationIds: [], supportingDynamics: [], supportingCapabilities: [], investigationIds: [], missingInformation: [], openQuestions: [], implications: [], history: [],
  mechanism: "Routine decisions depend on senior approval.", whyItMatters: "Execution waits for leadership.",
}];
memory.executiveRecommendation = { id: "recommendation-stable", headline: "Delegate routine decisions.", confidence: 0.76, risks: ["Boundaries may be unclear during transition."] };
memory.executiveCommunication = { headline: "Decision authority is slowing execution.", executiveSummary: "Routine decisions wait for senior approval.", supportingSignals: [] };

const organization = buildOrganizationExperienceView(runtime);
assert.ok(organization.insights.length <= 3);
assert.equal(organization.model.areas[0]?.id, "condition-decision-flow");

const ask = buildAskExperienceView(runtime);
assert.equal(ask.model.areas[0]?.id, "condition-decision-flow");
assert.deepEqual(buildAskExperienceView(runtime), ask);

const beforeRecommendation = JSON.stringify(memory.executiveRecommendation);
const leadershipRecord = createLeadershipDecisionRecord({ organizationId: runtime.metadata.organizationId, interactionId: "interaction-1", consideration: "Clarify regional decision rights.", whyNow: "Escalation is slowing delivery.", outcome: "Faster routine decisions.", targetConditionIds: ["condition-decision-flow"], createdAt: "2026-01-01T00:00:00.000Z" });
assert.match(leadershipRecord.executiveDecisionId, /^leadership-decision-/);
assert.deepEqual(leadershipRecord.expectedOutcomes[0]?.conditionIds, ["condition-decision-flow"]);
runtime.memory.executiveDecisionRecords = [leadershipRecord];
const decisions = buildDecisionsExperienceView(runtime);
assert.equal(decisions.currentPosition.source, "Leadership");
assert.equal(JSON.stringify(memory.executiveRecommendation), beforeRecommendation);

const provisional = { id: "discussion", action: "brainstorm" as const, kind: "discussion" as const, label: "Consider regional authority", status: "provisional" as const };
const saved = { id: "observation", action: "add-context" as const, kind: "observation" as const, label: "Regional approvals are slow", status: "saved" as const };
const runtimeBeforeProvisional = JSON.stringify(runtime);
const provisionalImpact = buildSessionImpact([provisional]);
assert.equal(provisionalImpact.changedModel, false);
assert.equal(provisionalImpact.durable.length, 0);
assert.equal(JSON.stringify(runtime), runtimeBeforeProvisional);
const impact = buildSessionImpact([provisional, saved, saved]);
assert.equal(impact.headline, "You made Discovery better.");
assert.equal(impact.durable.length, 1);
assert.equal(impact.provisional.length, 1);
assert.deepEqual(buildSessionImpact([provisional, saved]), buildSessionImpact([provisional, saved]));
assert.equal(completedSessionEntry(false, { action: "challenge", kind: "observation", label: "Failed challenge", status: "saved" }), null);
const mixedImpact = buildSessionImpact([provisional, saved, { id: "decision", action: "create-decision", kind: "decision", label: "Clarify regional authority", status: "saved" }]);
assert.equal(mixedImpact.durable.length, 2);
assert.equal(mixedImpact.provisional.length, 1);

console.log("Living interaction loop validation: 18 checks passed.");
