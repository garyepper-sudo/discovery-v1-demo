import assert from "node:assert/strict";
import fs from "node:fs";

import { buildUnifiedExecutiveWorkspaceView } from "../../components/product-shell/data/buildUnifiedExecutiveWorkspaceView";
import { createLeadershipDecisionRecord } from "../../components/product-shell/data/createLeadershipDecisionRecord";
import { buildSessionImpact } from "../../components/product-shell/data/buildSessionImpact";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";

const runtime = createEmptyOrganizationRuntime({ organizationId: "org_unified_workspace", name: "Northwind Leadership" });
const memory = runtime.memory as unknown as Record<string, unknown>;
memory.organizationalConditions = [{ id: "condition-authority", name: "Decision Authority", status: "constrained", confidence: .81 }, { id: "condition-capacity", name: "Execution Capacity", status: "active", confidence: .72 }];
runtime.memory.organizationalUnderstandingState.health.coherence = .64;
runtime.memory.organizationalUnderstandingState.currentUnderstandings = [{ id: "understanding-1", statement: "Decision ownership ambiguity is slowing execution.", summary: "Clarifying who decides could unlock capacity.", confidence: .73, observationIds: [], missingInformation: [], openQuestions: [], evidenceIds: [], beliefIds: [], themeIds: [], mechanismIds: [], contradictionIds: [], recommendationIds: [], supportingDynamics: [], supportingCapabilities: [], investigationIds: [], implications: [], history: [] } as never];
memory.executiveRecommendation = { id: "recommendation-stable", headline: "Delegate routine decision authority", confidence: .76, risks: [] };
memory.executiveCommunication = { headline: "Decision ownership ambiguity is slowing execution.", executiveSummary: "Clarify decision rights." };
memory.simulatedOrganizationStates = [{ id: "scenario-1", name: "Delegate routine authority", status: "modeled" }];
memory.investigationOpportunities = [{ suggestedExecutiveQuestion: "Which decisions still escalate?", reason: "Decision latency remains uncertain." }];

const before = JSON.stringify(runtime);
const view = buildUnifiedExecutiveWorkspaceView(runtime);
assert.equal(view.organization.id, "org_unified_workspace");
assert.equal(view.greetingName, "Northwind");
assert.equal(view.insights[0]?.headline, "Decision ownership ambiguity is slowing execution.");
assert.equal(view.model.areas[0]?.id, "condition-authority");
assert.equal(view.summary.understanding, 64);
assert.equal(view.summary.confidence, 73);
assert.equal(view.summary.primaryConstraint, "Decision Authority");
assert.ok(view.think.starters.length > 0);
assert.match(view.think.destination, /organizationId=org_unified_workspace/);
assert.match(view.decisions.destination, /organizationId=org_unified_workspace/);
assert.match(view.experiment.runDestination, /organizationId=org_unified_workspace/);
assert.match(view.brief.destination, /organizationId=org_unified_workspace/);
assert.match(view.actions.teach, /organizationId=org_unified_workspace/);
assert.equal(view.influence.metric, null);
assert.equal(JSON.stringify(runtime), before);
assert.deepEqual(buildUnifiedExecutiveWorkspaceView(runtime), view);

const decision = createLeadershipDecisionRecord({ organizationId: runtime.metadata.organizationId, interactionId: "unified-1", consideration: "Clarify decision rights", whyNow: "Execution is slowing", targetConditionIds: ["condition-authority"], createdAt: "2026-07-22T00:00:00.000Z" });
assert.equal(decision.organizationId, runtime.metadata.organizationId);
assert.match(decision.executiveDecisionId, /^leadership-decision-/);
assert.equal(buildSessionImpact([{ id: "draft", action: "brainstorm", kind: "discussion", label: "Consider delegation", status: "provisional" }]).durable.length, 0);

const source = fs.readFileSync("components/product-shell/unified/UnifiedExecutiveWorkspace.tsx", "utf8");
for (const required of ["Today&apos;s top insight", "Interactive Organization Model", "Let&apos;s brainstorm", "Track what matters", "Stress test ideas", "Communicate impact", "Session impact", "One living model"]) assert.ok(source.includes(required), required);
assert.ok(source.includes('/api/product-interaction'));

console.log("Unified executive workspace validation: 28 checks passed.");
