import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import {
  buildUnifiedExecutiveWorkspaceView,
} from "../../components/product-shell/data/buildUnifiedExecutiveWorkspaceView";
import {
  buildYourOrganizationCommunicationView,
  YOUR_ORGANIZATION_COMMUNICATION_ADAPTER_VERSION,
} from "../../components/product-shell/data/buildYourOrganizationCommunicationView";
import type {
  ProductCommunicationAvailabilityState,
  ProductCommunicationPlan,
} from "../../engine/v3/communication/productCommunicationPlan";
import {
  loadOrganizationRuntimeState,
} from "../../engine/v3/runtime";

const ROOT = path.resolve(__dirname, "../..");
const ORGANIZATION_ID = "atlas-manufacturing-simulation";
const CONDITION_REF = {
  objectType: "organizational-condition" as const,
  objectId: "condition:continuity",
};
const EXPLANATION_REF = {
  objectType: "organizational-explanation" as const,
  objectId: "explanation:concentration",
};
const EVIDENCE_REF = {
  objectType: "evidence" as const,
  objectId: "evidence:delivery",
};
const INVESTIGATION_REF = {
  objectType: "investigation-opportunity" as const,
  objectId: "investigation:delivery",
};
const COMPOSITION_REF = {
  objectType: "organizational-understanding" as const,
  objectId: "understanding:delivery",
  revisionId: "understanding:delivery:revision:1",
};
let checks = 0;

function check(assertion: () => void): void {
  assertion();
  checks += 1;
}

function plan(): ProductCommunicationPlan {
  return {
    planId: "plan:your-organization-adapter",
    contractVersion: "1",
    policyId: "product-communication:organization",
    policyVersion: "1",
    organizationId: ORGANIZATION_ID,
    consumerId: "consumer:your-organization-adapter",
    experience: "organization",
    generatedAt: "2026-07-30T00:00:00.000Z",
    projectionId: "projection:your-organization-adapter",
    disclosureDecisionId: "disclosure:your-organization-adapter",
    sourceRevisionIds: ["understanding:delivery:revision:1"],
    prioritySignals: [{
      signalId: "signal:condition-significance",
      subjectRef: CONDITION_REF,
      producer: "condition_significance",
      objective: "organizational-significance",
      priorityClass: "high",
      score: 0.8,
      rank: 1,
      supportingRefs: [EXPLANATION_REF],
    }],
    lead: {
      itemId: "communication-item:condition-continuity",
      subjectRef: CONDITION_REF,
      sourceText: {
        text: "Delivery knowledge remains concentrated.",
        sourceRef: CONDITION_REF,
        sourceField: "summary",
        sourceOwner: "canonical_cognition",
      },
      supportingRefs: [EXPLANATION_REF],
      priority: {
        source: "upstream_signal",
        ruleId: "valid-upstream-priority-signal",
        upstreamSignalIds: ["signal:condition-significance"],
        subjectRef: CONDITION_REF,
        explanation: { code: "condition_significance_signal" },
      },
      availability: {
        area: "lead",
        state: "available-with-source-text",
      },
    },
    support: [
      {
        itemId: "communication-item:evidence",
        subjectRef: EVIDENCE_REF,
        supportingRefs: [EXPLANATION_REF],
        priority: {
          source: "communication_policy",
          ruleId: "supporting-disclosed-reference",
          subjectRef: EVIDENCE_REF,
          explanation: { code: "supporting_disclosed_reference" },
        },
        availability: {
          area: "support",
          state: "available-structurally-without-text",
        },
      },
      {
        itemId: "communication-item:understanding",
        subjectRef: COMPOSITION_REF,
        supportingRefs: [EXPLANATION_REF],
        priority: {
          source: "communication_policy",
          ruleId: "supporting-disclosed-reference",
          subjectRef: COMPOSITION_REF,
          explanation: { code: "supporting_disclosed_reference" },
        },
        availability: {
          area: "support",
          state: "available-structurally-without-text",
        },
      },
    ],
    uncertainty: [{
      itemId: "communication-item:uncertainty",
      subjectRef: EXPLANATION_REF,
      sourceText: {
        text: "Independent outcomes remain unavailable.",
        sourceRef: EXPLANATION_REF,
        sourceField: "uncertainty.statement",
        sourceOwner: "canonical_cognition",
      },
      supportingRefs: [],
      priority: {
        source: "experience_requirement",
        ruleId: "unresolved-uncertainty-required",
        subjectRef: EXPLANATION_REF,
        explanation: { code: "unresolved_uncertainty_required" },
      },
      availability: {
        area: "uncertainty",
        state: "available-with-source-text",
      },
    }],
    changes: [{
      itemId: "communication-item:evolution",
      subjectRef: {
        objectType: "organizational-evolution",
        objectId: "evolution:delivery",
      },
      supportingRefs: [COMPOSITION_REF],
      priority: {
        source: "experience_requirement",
        ruleId: "material-change-required",
        subjectRef: {
          objectType: "organizational-evolution",
          objectId: "evolution:delivery",
        },
        explanation: { code: "material_change_required" },
      },
      availability: {
        area: "changes",
        state: "available-structurally-without-text",
      },
    }],
    nextInquiries: [{
      itemId: "communication-item:investigation",
      subjectRef: INVESTIGATION_REF,
      sourceText: {
        text: "Where does delivery judgment remain concentrated?",
        sourceRef: INVESTIGATION_REF,
        sourceField: "suggestedExecutiveQuestion",
        sourceOwner: "canonical_cognition",
      },
      supportingRefs: [CONDITION_REF],
      priority: {
        source: "experience_requirement",
        ruleId: "investigation-opportunity-available",
        subjectRef: INVESTIGATION_REF,
        explanation: { code: "investigation_opportunity_available" },
      },
      availability: {
        area: "next-inquiries",
        state: "available-with-source-text",
      },
    }],
    alternatives: [{
      compositionRef: COMPOSITION_REF,
      alternatives: [
        {
          explanationRef: {
            objectType: "organizational-explanation",
            objectId: "explanation:process",
          },
          disposition: "unresolved",
          supportingRefs: [{
            objectType: "evidence",
            objectId: "evidence:process",
          }],
        },
        {
          explanationRef: EXPLANATION_REF,
          disposition: "unresolved",
          supportingRefs: [EVIDENCE_REF],
        },
      ],
    }],
    evidenceRoles: [{
      evidenceRef: EVIDENCE_REF,
      explanationRef: EXPLANATION_REF,
      role: "supports",
      basisKind: "evidence-relationship",
      basisReferenceIds: ["relationship:delivery"],
      relatedExplanationRefs: [],
    }],
    availability: [
      { area: "communication", state: "available-structurally-without-text" },
      { area: "lead", state: "available-with-source-text" },
      { area: "priority", state: "available-structurally-without-text" },
      { area: "support", state: "available-structurally-without-text" },
      { area: "uncertainty", state: "available-structurally-without-text" },
      { area: "changes", state: "available-structurally-without-text" },
      { area: "next-inquiries", state: "available-with-source-text" },
      { area: "alternatives", state: "unresolved-alternatives-required" },
      { area: "application-inputs", state: "available-empty" },
    ],
  };
}

function withCommunicationState(
  state: ProductCommunicationAvailabilityState,
): ProductCommunicationPlan {
  const candidate = plan();
  candidate.availability = [{
    area: "communication",
    state,
  }];
  candidate.lead = undefined;
  candidate.support = [];
  candidate.uncertainty = [];
  candidate.changes = [];
  candidate.nextInquiries = [];
  candidate.alternatives = [];
  candidate.evidenceRoles = [];
  return candidate;
}

function reversePlan(source: ProductCommunicationPlan): ProductCommunicationPlan {
  return {
    ...source,
    support: [...source.support].reverse(),
    uncertainty: [...source.uncertainty].reverse(),
    changes: [...source.changes].reverse(),
    nextInquiries: [...source.nextInquiries].reverse(),
    alternatives: [...source.alternatives].reverse().map((group) => ({
      ...group,
      alternatives: [...group.alternatives].reverse(),
    })),
    evidenceRoles: [...source.evidenceRoles].reverse(),
    availability: [...source.availability].reverse(),
  };
}

const initialPlan = plan();
const initialPlanJson = JSON.stringify(initialPlan);
const view = buildYourOrganizationCommunicationView({ plan: initialPlan });
const viewJson = JSON.stringify(view);
const repeatedJson = JSON.stringify(
  buildYourOrganizationCommunicationView({ plan: initialPlan }),
);
const reversedJson = JSON.stringify(
  buildYourOrganizationCommunicationView({
    plan: reversePlan(plan()),
  }),
);

check(() => assert.equal(repeatedJson, viewJson));
check(() => assert.equal(reversedJson, viewJson));
check(() => assert.equal(JSON.stringify(initialPlan), initialPlanJson));
check(() => assert.equal(view.adapterVersion, YOUR_ORGANIZATION_COMMUNICATION_ADAPTER_VERSION));
check(() => assert.equal(view.organizationId, ORGANIZATION_ID));
check(() => assert.equal(view.consumerId, "consumer:your-organization-adapter"));
check(() => assert.equal(view.planId, initialPlan.planId));
check(() => assert.equal(view.projectionId, initialPlan.projectionId));
check(() => assert.equal(view.disclosureDecisionId, initialPlan.disclosureDecisionId));
check(() => assert.deepEqual(view.sourceRevisionIds, initialPlan.sourceRevisionIds));
check(() => assert.deepEqual(view.policy, {
  id: "product-communication:organization",
  version: "1",
}));
check(() => assert.equal(view.lead?.role, "lead-understanding"));
check(() => assert.deepEqual(view.lead?.subjectRef, CONDITION_REF));
check(() => assert.deepEqual(view.lead?.priority, initialPlan.lead?.priority));
check(() => assert.equal(
  view.headline.sourceText?.text,
  "Delivery knowledge remains concentrated.",
));
check(() => assert.deepEqual(
  view.headline.sourceText,
  initialPlan.lead?.sourceText,
));
check(() => assert.equal(view.support.length, 2));
check(() => assert.ok(view.support.every((item) => item.priority)));
check(() => assert.ok(view.support.some((item) => item.subjectRef.objectType === "evidence")));
check(() => assert.ok(view.support.some((item) => item.subjectRef.objectType === "organizational-understanding")));
check(() => assert.equal(view.uncertainty.length, 1));
check(() => assert.equal(
  view.uncertainty[0].sourceText?.text,
  "Independent outcomes remain unavailable.",
));
check(() => assert.equal(view.alternatives.length, 1));
check(() => assert.equal(view.alternatives[0].alternatives.length, 2));
check(() => assert.ok(view.alternatives[0].alternatives.every(
  (item) => item.disposition === "unresolved",
)));
check(() => assert.equal(view.nextInquiries.length, 1));
check(() => assert.equal(
  view.nextInquiries[0].sourceText?.text,
  "Where does delivery judgment remain concentrated?",
));
check(() => assert.equal(view.nextInquiries[0].sourceText?.sourceField, "suggestedExecutiveQuestion"));
check(() => assert.equal(view.changes.length, 1));
check(() => assert.equal(view.changes[0].sourceText, undefined));
check(() => assert.equal(view.evidenceRoles.length, 1));
check(() => assert.deepEqual(view.evidenceRoles, initialPlan.evidenceRoles));
check(() => assert.equal(
  view.availability.find((entry) => entry.area === "alternatives")?.state,
  "unresolved-alternatives-required",
));
check(() => assert.equal(view.unsupportedFields.length, 9));
check(() => assert.ok(view.unsupportedFields.some(
  (entry) => entry.field === "why-it-matters",
)));
check(() => assert.ok(view.unsupportedFields.some(
  (entry) => entry.field === "recommendation",
)));
check(() => assert.ok(view.unsupportedFields.some(
  (entry) => entry.field === "scalar-confidence",
)));
check(() => assert.ok(view.unsupportedFields.some(
  (entry) => entry.field === "next-action",
)));
check(() => assert.ok(!viewJson.includes("fixture")));
check(() => assert.ok(!viewJson.includes("benchmark")));
check(() => assert.ok(!viewJson.includes("assessment")));
check(() => assert.ok(!viewJson.includes("most important")));
check(() => assert.ok(!viewJson.includes("why this matters")));

for (const state of [
  "available-with-source-text",
  "available-structurally-without-text",
  "available-empty",
  "source-text-unavailable",
  "upstream-priority-unavailable",
  "unresolved-alternatives-required",
  "projection-data-unavailable",
  "withheld",
  "revoked",
  "invalid-authority",
  "organization-mismatch",
  "consumer-mismatch",
  "historical-compatibility-unavailable",
  "unsupported-application-input",
] as const) {
  const stateView = buildYourOrganizationCommunicationView({
    plan: withCommunicationState(state),
  });
  check(() => assert.equal(stateView.availability[0].state, state));
}

const withoutQuestion = plan();
withoutQuestion.nextInquiries[0] = {
  ...withoutQuestion.nextInquiries[0],
  sourceText: undefined,
  availability: {
    area: "next-inquiries",
    state: "available-structurally-without-text",
  },
};
const withoutQuestionView = buildYourOrganizationCommunicationView({
  plan: withoutQuestion,
});
check(() => assert.equal(withoutQuestionView.nextInquiries[0].sourceText, undefined));

const runtimePath = path.join(
  ROOT,
  ".discovery-runtime/organizations/atlas-manufacturing-simulation.json",
);
const runtimeBefore = fs.readFileSync(runtimePath, "utf8");
const runtime = loadOrganizationRuntimeState(ORGANIZATION_ID);
const activeBefore = JSON.stringify(buildUnifiedExecutiveWorkspaceView(runtime));
buildYourOrganizationCommunicationView({ plan: initialPlan });
const activeAfter = JSON.stringify(buildUnifiedExecutiveWorkspaceView(runtime));
const runtimeAfter = fs.readFileSync(runtimePath, "utf8");
check(() => assert.equal(runtimeAfter, runtimeBefore));
check(() => assert.equal(activeAfter, activeBefore));

const activeRoute = fs.readFileSync(
  path.join(
    ROOT,
    "components/product-shell/data/buildUnifiedExecutiveWorkspaceView.ts",
  ),
  "utf8",
);
check(() => assert.ok(activeRoute.includes("buildRuntimeOrganizationView")));
check(() => assert.ok(!activeRoute.includes("buildYourOrganizationCommunicationView")));

const adapterSource = fs.readFileSync(
  path.join(
    ROOT,
    "components/product-shell/data/buildYourOrganizationCommunicationView.ts",
  ),
  "utf8",
);
check(() => assert.ok(!adapterSource.includes("OrganizationRuntime")));
check(() => assert.ok(!adapterSource.includes("compileProductCommunicationPlan")));
check(() => assert.ok(!adapterSource.includes("discloseCanonical")));
check(() => assert.ok(!adapterSource.includes("new Date(")));
check(() => assert.ok(!adapterSource.includes("Math.random")));
check(() => assert.ok(!adapterSource.includes("confidence: number")));
check(() => assert.ok(!adapterSource.includes("recommendation:")));

const viewHash = crypto.createHash("sha256").update(viewJson).digest("hex");
const runtimeHash = crypto
  .createHash("sha256")
  .update(runtimeAfter)
  .digest("hex");
const activeHash = crypto
  .createHash("sha256")
  .update(activeAfter)
  .digest("hex");

assert.equal(checks, 69);
process.stdout.write(`${JSON.stringify({
  validation: "Your Organization Product Communication Adapter",
  checks,
  passed: checks,
  failed: 0,
  viewHash,
  runtimeHash,
  activeRouteHash: activeHash,
  activeRoute: "unchanged",
  classification:
    "A — Your Organization Communication Adapter Demonstrated",
}, null, 2)}\n`);
