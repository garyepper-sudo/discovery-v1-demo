import assert from "node:assert/strict";

import {
  buildOrganizationExperienceView,
} from "../../components/product-shell/data/buildOrganizationExperienceView";
import {
  createEmptyOrganizationRuntime,
  type OrganizationRuntime,
} from "../../engine/v3/runtime";

function runtimeFixture(): OrganizationRuntime {
  const runtime = createEmptyOrganizationRuntime({
    organizationId: "org_validation",
    name: "Validation Organization",
  });
  const memory = runtime.memory as unknown as Record<string, unknown>;
  const understandingState = runtime.memory.organizationalUnderstandingState;

  runtime.metadata.investigationCount = 2;
  understandingState.health.coherence = 0.68;
  understandingState.currentUnderstandings = [
    {
      id: "understanding-private-id",
      source: "executive-assessment",
      title: "Delivery knowledge is concentrated in senior leaders.",
      statement: "Delivery knowledge is concentrated in senior leaders.",
      summary: "Scaling remains constrained until delivery judgment becomes reusable.",
      mechanism: "Critical judgment moves through direct involvement rather than repeatable practices.",
      confidence: 0.72,
      confidenceBand: "medium",
      strength: 0.7,
      stability: 0.6,
      coverage: 0.5,
      novelty: 0.3,
      explanatoryPower: 0.7,
      domainRelevance: {
        strategy: 0,
        finance: 0,
        operations: 1,
        customers: 0,
        employees: 0,
        products: 0,
      },
      status: "emerging",
      firstSeenAt: "2026-01-01T00:00:00.000Z",
      lastUpdatedAt: "2026-01-01T00:00:00.000Z",
      supportCount: 2,
      evidenceIds: [],
      observationIds: [],
      beliefIds: [],
      themeIds: [],
      mechanismIds: [],
      contradictionIds: [],
      recommendationIds: [],
      supportingDynamics: [],
      supportingCapabilities: [],
      investigationIds: [],
      missingInformation: ["Independent delivery outcome evidence."],
      whyItMatters: "Delivery quality may weaken as the organization grows.",
      openQuestions: [],
      implications: [],
      history: [],
    },
  ];
  understandingState.evolutionHistory = [
    {
      id: "change-private-id",
      date: "2026-01-02T00:00:00.000Z",
      type: "strengthened_understanding",
      title: "Understanding strengthened",
      description: "Delivery concentration became more strongly supported.",
      relatedUnderstandingIds: [],
    },
  ];
  memory.executiveExplanation = {
    assessmentNarrative: "Senior involvement remains the primary path for transferring delivery judgment.",
    confidenceNarrative: "Confidence is moderate because multiple observations agree.",
    recommendedEvidenceAreas: ["Independent consultant delivery outcomes."],
  };
  memory.organizationalConditions = [
    { id: "condition-private-1", whyItMatters: "Knowledge transfer is inconsistent." },
    { id: "condition-private-2", whyItMatters: "Knowledge transfer is inconsistent." },
    { id: "condition-private-3", whyItMatters: "Consultant autonomy varies." },
    { id: "condition-private-4", whyItMatters: "Quality review remains centralized." },
    { id: "condition-private-5", whyItMatters: "A fourth item must be excluded." },
  ];
  memory.investigationOpportunities = [
    {
      id: "investigation-private-id",
      topic: "Delivery independence",
      suggestedExecutiveQuestion: "Where does delivery judgment remain concentrated?",
      reason: "This would clarify the highest-leverage knowledge-transfer gap.",
    },
  ];

  return runtime;
}

const populated = runtimeFixture();
const populatedView = buildOrganizationExperienceView(populated);

assert.equal(populatedView.organization.name, "Validation Organization");
assert.equal(populatedView.model.coherence, 68);
assert.equal(populatedView.model.coherenceLabel, "Coherent");
assert.equal(populatedView.currentUnderstanding.confidence, 72);
assert.equal(populatedView.currentUnderstanding.observations.length, 3);
assert.equal(new Set(populatedView.currentUnderstanding.observations).size, 3);
assert.match(populatedView.exploration.recommended.destination, /^\/research\?/);

const noEvolution = runtimeFixture();
noEvolution.metadata.investigationCount = 1;
noEvolution.memory.organizationalUnderstandingState.evolutionHistory = [];
assert.equal(buildOrganizationExperienceView(noEvolution).changes.isFirstBaseline, true);

const coherenceWithoutConfidence = runtimeFixture();
(coherenceWithoutConfidence.memory.organizationalUnderstandingState.currentUnderstandings[0] as unknown as Record<string, unknown>).confidence = undefined;
assert.equal(
  buildOrganizationExperienceView(coherenceWithoutConfidence).currentUnderstanding.confidenceLabel,
  "Confidence not yet established",
);

const noUnderstanding = runtimeFixture();
noUnderstanding.memory.organizationalUnderstandingState.currentUnderstandings = [];
const emptyView = buildOrganizationExperienceView(noUnderstanding);
assert.equal(
  emptyView.currentUnderstanding.headline,
  "Discovery is still forming its first understanding of this organization.",
);

const withoutInvestigation = runtimeFixture();
(withoutInvestigation.memory as unknown as Record<string, unknown>).investigationOpportunities = [];
assert.notEqual(
  buildOrganizationExperienceView(withoutInvestigation).exploration.recommended.label,
  "Where does delivery judgment remain concentrated?",
);

const renderedStrings = JSON.stringify(populatedView);
assert.equal(renderedStrings.includes("private-id"), false);
assert.equal(renderedStrings.includes("Delivery quality remains dependent on founder knowledge."), false);
assert.deepEqual(
  buildOrganizationExperienceView(populated),
  buildOrganizationExperienceView(populated),
);

console.log("Organization experience view validation: 10 checks passed.");
