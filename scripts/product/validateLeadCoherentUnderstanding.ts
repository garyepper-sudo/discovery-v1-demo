import assert from "node:assert/strict";

import { buildActivatedYourOrganizationView } from "../../components/product-shell/data/buildActivatedYourOrganizationView";
import { buildDiscoveryExperienceView } from "../../components/product-shell/data/buildDiscoveryExperienceView";
import { buildYourOrganizationCommunicationView } from "../../components/product-shell/data/buildYourOrganizationCommunicationView";
import {
  compileProductCommunicationPlan,
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
} from "../../engine/v3/communication/productCommunicationPlan";
import {
  compileOrganizationalUnderstandingProjection,
} from "../../engine/v3/projection/organizationalUnderstandingProjection";
import {
  createEmptyOrganizationRuntime,
} from "../../engine/v3/runtime";

const NOW = "2026-08-05T12:00:00.000Z";
const ORGANIZATION_ID = "org-lead-coherence";
const CONSUMER_ID = "user-lead-coherence";
const decisionRef = {
  objectType: "organizational-condition" as const,
  objectId: "condition-decision-flow",
};
const coordinationRef = {
  objectType: "organizational-condition" as const,
  objectId: "condition-coordination",
};

function condition(id: string, name: string, summary: string, uncertainty: string) {
  return {
    id,
    canonicalRef: {
      objectType: "organizational-condition" as const,
      objectId: id,
    },
    value: {
      id,
      organizationId: ORGANIZATION_ID,
      name,
      summary,
      uncertaintySummary: uncertainty,
      supportingExplanationIds: [],
    },
    supportingRefs: [],
  };
}

function projection(organizationId = ORGANIZATION_ID) {
  return {
    projectionId: `projection:${organizationId}`,
    contractVersion: "1",
    organizationId,
    consumerId: CONSUMER_ID,
    experience: "organization" as const,
    generatedAt: NOW,
    disclosureDecisionId: "disclosure:lead-coherence",
    sourceRevisionIds: ["revision:1"],
    understandings: [],
    explanations: [],
    evidence: [],
    uncertainty: [],
    conditions: [
      condition(
        decisionRef.objectId,
        "Decision Flow",
        "Decision Flow is limiting organizational performance.",
        "Decision Flow needs longitudinal evidence.",
      ),
      condition(
        coordinationRef.objectId,
        "Coordination System",
        "Coordination System is also constrained.",
        "Coordination System needs operational evidence.",
      ),
    ],
    investigations: [
      {
        id: "investigation:decision",
        canonicalRef: {
          objectType: "investigation-opportunity" as const,
          objectId: "investigation:decision",
        },
        priorityRank: 0,
        value: {
          id: "investigation:decision",
          suggestedExecutiveQuestion: "Which decisions still require escalation?",
          reason: "This could clarify Decision Flow and Coordination System.",
          expectedConfidenceGain: 12,
          missingEvidence: ["Decision-right evidence."],
          affectedConditions: ["Decision Flow", "Coordination System"],
        },
        supportingRefs: [decisionRef, coordinationRef],
      },
      {
        id: "investigation:coordination",
        canonicalRef: {
          objectType: "investigation-opportunity" as const,
          objectId: "investigation:coordination",
        },
        priorityRank: 1,
        value: {
          id: "investigation:coordination",
          suggestedExecutiveQuestion: "Where do handoffs slow down?",
          reason: "This could clarify Coordination System.",
          expectedConfidenceGain: 8,
          missingEvidence: ["Handoff evidence."],
          affectedConditions: ["Coordination System"],
        },
        supportingRefs: [coordinationRef],
      },
    ],
    evolution: [],
    availability: [
      { area: "projection", state: "available-with-content" },
      { area: "investigations", state: "available-with-content" },
    ],
    depth: { summary: [], support: [], trace: [] },
  };
}

function compose() {
  const projected = projection();
  const plan = compileProductCommunicationPlan(
    {
      context: {
        organizationId: ORGANIZATION_ID,
        consumerId: CONSUMER_ID,
        experience: "organization",
        generatedAt: NOW,
        contractVersion: "1",
      },
      projection: projected as never,
      prioritySignals: [{
        signalId: "priority:decision-flow",
        subjectRef: decisionRef,
        producer: "executive_priority",
        objective: "preserve-existing-executive-priority",
        rank: 0,
        supportingRefs: [],
      }],
    },
    ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
  );
  const communication = buildYourOrganizationCommunicationView({ plan });
  const runtime = createEmptyOrganizationRuntime({
    organizationId: ORGANIZATION_ID,
    name: "Lead coherence",
  });
  const before = JSON.stringify(runtime);
  const activated = buildActivatedYourOrganizationView({
    runtime,
    projection: projected as never,
    communication,
  });
  const experience = buildDiscoveryExperienceView({ runtime, view: activated });
  assert.equal(JSON.stringify(runtime), before, "Rendering must not mutate Runtime.");
  return { plan, communication, activated, experience };
}

const first = compose();
const repeated = compose();
assert.equal(
  first.communication.headline.sourceText?.text,
  "Decision Flow is limiting organizational performance.",
);
assert.equal(
  first.activated.runtimeSections.explanations.summary,
  "Decision Flow is limiting organizational performance.",
);
assert.equal(
  first.activated.runtimeSections.uncertainty.summary,
  "Decision Flow needs longitudinal evidence.",
);
assert.deepEqual(first.activated.beliefBasis.broaderSupport, [
  "Coordination System is also constrained.",
]);
assert.deepEqual(first.activated.beliefBasis.broaderUncertainty, [
  "Coordination System needs operational evidence.",
]);
assert.equal(first.activated.beliefBasis.nextInquiry?.scope, "multi-condition");
assert.deepEqual(
  first.activated.beliefBasis.nextInquiry?.affectedConditions,
  ["Decision Flow", "Coordination System"],
);
assert.equal(
  first.communication.nextInquiries[1]?.leadRelationship,
  "broader-context",
);
assert.equal(
  JSON.stringify(first.experience),
  JSON.stringify(repeated.experience),
  "Lead-coherent rendering must be deterministic.",
);
assert.equal(
  JSON.stringify(first.experience).includes("condition-decision-flow"),
  false,
  "Raw condition IDs must not reach Hosted Alpha.",
);

const source = compileProductCommunicationPlan.toString();
assert.equal(source.includes("includes(reference"), false);
assert.equal(source.includes("sourceText.text"), false);

const mismatch = compileOrganizationalUnderstandingProjection({
  context: {
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    experience: "organization",
    generatedAt: NOW,
    contractVersion: "1",
  },
  disclosure: {
    organizationId: "org-other",
    consumerId: CONSUMER_ID,
    decisionId: "disclosure:other",
    disposition: "eligible",
    disclosedCompositions: [],
  } as never,
  compositions: [],
  explanations: [],
  conditions: [],
  investigations: [],
  evolution: [],
});
assert.equal(mismatch.availability[0]?.state, "organization-mismatch");

const revoked = compileOrganizationalUnderstandingProjection({
  context: {
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    experience: "organization",
    generatedAt: NOW,
    contractVersion: "1",
  },
  disclosure: {
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decisionId: "disclosure:revoked",
    disposition: "revoked",
    disclosedCompositions: [],
  } as never,
  compositions: [],
  explanations: [],
  conditions: [],
  investigations: [],
  evolution: [],
});
assert.equal(revoked.availability[0]?.state, "revoked");

console.log(JSON.stringify({
  validation: "lead-coherent-understanding",
  result: "PASS",
  exactSupportPreserved: true,
  exactUncertaintyPreserved: true,
  crossConditionContextClassified: true,
  multiConditionInquiryScoped: true,
  wrongOrganizationFailsClosed: true,
  revokedDisclosureFailsClosed: true,
  textSimilarityJoin: false,
  deterministic: true,
  runtimeMutated: false,
}, null, 2));
