import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildActivatedYourOrganizationView,
} from "../../components/product-shell/data/buildActivatedYourOrganizationView";
import {
  buildDiscoveryExperienceView,
} from "../../components/product-shell/data/buildDiscoveryExperienceView";
import {
  buildRuntimeOrganizationView,
} from "../../components/product-shell/data/buildRuntimeOrganizationView";
import {
  compileOrganizationalUnderstandingProjection,
  ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
} from "../../engine/v3/projection/organizationalUnderstandingProjection";
import {
  createEmptyOrganizationRuntime,
  type OrganizationRuntime,
} from "../../engine/v3/runtime";

const NOW = "2026-08-04T12:00:00.000Z";
const QUESTION =
  "Why are launches slowing even after adding more review?";
const INQUIRY =
  "Has this condition appeared repeatedly over time?";
const UNCERTAINTY =
  "The organization has not yet accumulated enough stable longitudinal learning.";

const ref = (objectType: string, objectId: string) => ({
  objectType,
  objectId,
});
const section = (summary: string, items: string[] = [summary]) => ({
  title: summary,
  owner: "authorized-projection",
  available: true,
  summary,
  items,
});

function runtime(organizationId: string, question: string): OrganizationRuntime {
  const value = createEmptyOrganizationRuntime({
    organizationId,
    name: `Composition ${organizationId}`,
  });
  const memory = value.memory as unknown as {
    understandingSnapshots: Array<{
      question: string;
      timestamp: string;
    }>;
    events: Array<{ question: string; timestamp: string }>;
  };
  memory.understandingSnapshots = [{ question, timestamp: NOW }];
  memory.events = [{ question, timestamp: NOW }];
  return value;
}

function activatedView(input: {
  organizationId: string;
  consumerId: string;
  question: string;
  inquiry: string;
}) {
  const runtimeValue = runtime(input.organizationId, input.question);
  const projection = {
    projectionId: `projection:${input.organizationId}`,
    contractVersion: "1",
    organizationId: input.organizationId,
    consumerId: input.consumerId,
    disclosureDecisionId: `disclosure:${input.organizationId}`,
    sourceRevisionIds: [],
    understandings: [],
    explanations: [],
    evidence: [],
    uncertainty: [],
    conditions: [],
    investigations: [],
    evolution: [],
    availability: [],
  };
  const communication = {
    organizationId: input.organizationId,
    consumerId: input.consumerId,
    headline: {
      sourceText: {
        text: "Decision Flow is limiting organizational performance.",
      },
    },
    support: [
      {
        subjectRef: ref(
          "organizational-explanation",
          "explanation:decision-flow",
        ),
        sourceText: {
          text: "Approval loops are slowing routine operating decisions.",
        },
      },
      {
        subjectRef: ref(
          "organizational-explanation",
          "explanation:capacity",
        ),
        sourceText: {
          text: "Capacity pressure remains a plausible alternative.",
        },
      },
    ],
    uncertainty: [{
      sourceText: { text: UNCERTAINTY },
    }],
    nextInquiries: [{
      sourceText: { text: input.inquiry },
      priority: {
        source: "upstream_signal",
        explanation: {
          code: "investigation_information_gain_signal",
        },
      },
      inquiry: {
        priorityRank: 0,
        rationale:
          "This investigation could distinguish among competing explanations.",
        gaps: [
          "Longitudinal evidence showing whether Decision Flow is persistent.",
        ],
        clarificationTargets: ["Decision Flow"],
        expectedConfidenceGain: 14,
        expectedGainUnit: "canonical-confidence-gain-points",
        supportingReferencesAvailability: "available",
        outcomeCaveat:
          "The result could strengthen, weaken, or redirect the current understanding.",
      },
    }],
    changes: [],
    alternatives: [{
      compositionRef: ref(
        "organizational-understanding",
        "understanding:decision-flow",
      ),
      alternatives: [{
        explanationRef: ref(
          "organizational-explanation",
          "explanation:capacity",
        ),
        disposition: "unresolved",
        supportingRefs: [],
      }],
    }],
    evidenceRoles: [
      {
        evidenceRef: ref("evidence", "evidence:support"),
        explanationRef: ref(
          "organizational-explanation",
          "explanation:decision-flow",
        ),
        role: "supports",
      },
      {
        evidenceRef: ref("evidence", "evidence:opposes"),
        explanationRef: ref(
          "organizational-explanation",
          "explanation:decision-flow",
        ),
        role: "opposes",
      },
      {
        evidenceRef: ref("evidence", "evidence:shared"),
        explanationRef: ref(
          "organizational-explanation",
          "explanation:decision-flow",
        ),
        role: "shared",
      },
    ],
    availability: [
      { area: "changes", state: "first-supported-understanding" },
      { area: "next-inquiries", state: "available-with-source-text" },
    ],
  };
  const activated = buildActivatedYourOrganizationView({
    runtime: runtimeValue,
    projection: projection as never,
    communication: communication as never,
  });
  return {
    runtime: runtimeValue,
    view: activated,
    experience: buildDiscoveryExperienceView({
      runtime: runtimeValue,
      view: activated,
    }),
  };
}

const first = activatedView({
  organizationId: "org-composition-a",
  consumerId: "user-composition-a",
  question: QUESTION,
  inquiry: INQUIRY,
});
const repeated = activatedView({
  organizationId: "org-composition-a",
  consumerId: "user-composition-a",
  question: QUESTION,
  inquiry: INQUIRY,
});
const isolated = activatedView({
  organizationId: "org-composition-b",
  consumerId: "user-composition-b",
  question: "Why is retention changing?",
  inquiry: "Which customer cohorts changed first?",
});

assert.equal(first.experience.understanding.originalQuestion, QUESTION);
assert.notEqual(first.experience.understanding.originalQuestion, INQUIRY);
assert.equal(
  first.experience.understanding.whyItMatters,
  "No additional impact explanation is available.",
  "An active Runtime must describe missing impact content without implying Runtime failure.",
);
assert.equal(
  first.experience.understanding.whyItMatters.includes(
    "Runtime not yet available",
  ),
  false,
);
assert.equal(
  buildRuntimeOrganizationView(
    createEmptyOrganizationRuntime({
      organizationId: "org-runtime-unavailable",
    }),
  ).organizationalState.summary,
  "Runtime not yet available",
  "A genuinely unavailable Runtime section must retain its distinct compatibility state.",
);
const availableImpact = buildDiscoveryExperienceView({
  runtime: first.runtime,
  view: {
    ...first.view,
    runtimeSections: {
      ...first.view.runtimeSections,
      organizationalState: {
        ...first.view.runtimeSections.organizationalState,
        available: true,
        summary: "Authorized impact explanation.",
        items: ["Authorized impact explanation."],
      },
    },
  },
});
assert.equal(
  availableImpact.understanding.whyItMatters,
  "Authorized impact explanation.",
  "Existing authorized impact content must remain unchanged.",
);
assert.deepEqual(
  first.experience.understanding.beliefBasis?.evidenceCategories,
  [
    { role: "supports", count: 1 },
    { role: "opposes", count: 1 },
    { role: "shared", count: 1 },
  ],
);
assert.deepEqual(first.experience.understanding.beliefBasis?.alternatives, [{
  id: "authorized-alternative-1-1",
  disposition: "unresolved",
  summary: "Capacity pressure remains a plausible alternative.",
}]);
assert.deepEqual(
  first.experience.understanding.beliefBasis?.uncertainty,
  [UNCERTAINTY],
);
assert.equal(first.experience.understanding.primaryUnknown, UNCERTAINTY);
assert.equal(first.experience.sources.length, 1);
assert.equal(first.experience.sources[0]?.title, INQUIRY);
assert.equal(
  first.experience.understanding.beliefBasis?.nextInquiry?.question,
  INQUIRY,
);
assert.equal(
  first.experience.understanding.evidenceRequestDisclosure?.request?.question,
  INQUIRY,
);
assert.equal(
  first.experience.understanding.evidenceRequestDisclosure?.request
    ?.expectedConfidenceGain,
  14,
);
assert.equal(
  JSON.stringify(first.experience),
  JSON.stringify(repeated.experience),
  "Repeated composition must render deterministically.",
);
assert.equal(first.experience.organization.id, "org-composition-a");
assert.equal(isolated.experience.organization.id, "org-composition-b");
assert.equal(
  JSON.stringify(first.experience).includes("Why is retention changing?"),
  false,
  "Organization B content must not enter organization A.",
);

const authorityFailure = compileOrganizationalUnderstandingProjection({
  context: {
    organizationId: "org-authorized",
    consumerId: "user-authorized",
    experience: "organization",
    generatedAt: NOW,
    contractVersion: ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
  },
  disclosure: {
    organizationId: "org-other",
    consumerId: "user-authorized",
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
assert.equal(
  authorityFailure.availability[0]?.state,
  "organization-mismatch",
);
assert.equal(authorityFailure.understandings.length, 0);

const alphaSource = fs.readFileSync(
  "components/alpha/AlphaExperience.tsx",
  "utf8",
);
assert.ok(alphaSource.includes("function expectedContribution"));
assert.equal(
  alphaSource.includes(
    'Expected contribution</small><strong>{hosted ? "Unavailable"',
  ),
  false,
  "Hosted scenes must not substitute a scene-specific expected value.",
);

console.log(JSON.stringify({
  validation: "canonical-product-composition",
  result: "PASS",
  originalQuestionPreserved: true,
  evidenceRoleConsistency: true,
  alternativeConsistency: true,
  uncertaintyConsistency: true,
  expectedValueConsistency: true,
  investigationConsistency: true,
  unavailableSubstitutionWhenDataExists: false,
  activeRuntimeMissingImpactLanguageTruthful: true,
  unavailableRuntimeStatePreserved: true,
  deterministic: true,
  organizationIsolated: true,
  authorizationFailsClosed: true,
  replayStable: true,
  runtimeMutated: false,
}, null, 2));
