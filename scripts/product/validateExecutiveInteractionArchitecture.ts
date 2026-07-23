import assert from "node:assert/strict";

import { buildBriefExperienceView } from "../../components/product-shell/data/buildBriefExperienceView";
import { buildExperimentExperienceView } from "../../components/product-shell/data/buildExperimentExperienceView";
import { buildResearchExperienceView } from "../../components/product-shell/data/buildResearchExperienceView";
import { buildProductHref } from "../../components/product-shell/data/productOrganization";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";

const runtime = createEmptyOrganizationRuntime({ organizationId: "org_interaction_architecture", name: "Interaction Architecture" });
const memory = runtime.memory as unknown as Record<string, unknown>;
memory.organizationalConditions = [{ id: "condition-flow", name: "Decision Flow", status: "constrained", confidence: 0.82 }];
memory.investigationOpportunities = [{ suggestedExecutiveQuestion: "Where does approval slow execution?", reason: "Decision latency remains uncertain.", expectedConfidenceGain: 12 }];
memory.executiveCommunication = { headline: "Decision authority is slowing execution.", executiveSummary: "Routine decisions wait for senior approval." };
memory.simulatedOrganizationStates = [{ id: "scenario-delegation", name: "Delegate routine authority", status: "modeled", summary: "Tests execution speed under clearer boundaries." }];
memory.executiveDecisionRecords = [{ id: "decision-1", title: "Clarify decision rights", decision: "Clarify decision rights" }];

const research = buildResearchExperienceView(runtime);
assert.equal(research.model.areas[0]?.id, "condition-flow");
assert.equal(research.estimatedConfidenceImprovement, "12 points");
assert.equal(research.highestUnknown?.headline, "Where does approval slow execution?");

const experiment = buildExperimentExperienceView(runtime);
assert.equal(experiment.model.areas[0]?.id, "condition-flow");
assert.equal(experiment.currentScenario, "Delegate routine authority");
assert.equal(experiment.recentScenarios.length, 1);

const brief = buildBriefExperienceView(runtime);
assert.equal(brief.model.areas[0]?.id, "condition-flow");
assert.deepEqual(brief.templates, ["Board Update", "Leadership Memo", "Team Update"]);
assert.deepEqual(brief.recentBriefs, ["Decision authority is slowing execution.", "Clarify decision rights"]);

for (const route of ["/your-organization", "/ask", "/research", "/decisions", "/experiment", "/brief"]) {
  assert.match(buildProductHref(route, runtime.metadata.organizationId), new RegExp(`^${route.replace("/", "\\/")}\\?organizationId=`));
}

assert.equal(JSON.stringify(runtime).includes("Board Update"), false);
assert.deepEqual(buildExperimentExperienceView(runtime), experiment);
assert.deepEqual(buildBriefExperienceView(runtime), brief);

console.log("Executive interaction architecture validation: 18 checks passed.");
