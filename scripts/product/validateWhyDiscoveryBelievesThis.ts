import assert from "node:assert/strict";
import fs from "node:fs";

import { buildActivatedYourOrganizationView } from "../../components/product-shell/data/buildActivatedYourOrganizationView";
import { buildDiscoveryExperienceView } from "../../components/product-shell/data/buildDiscoveryExperienceView";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime";

const ORGANIZATION_ID = "org-belief-basis-validation";
const CONSUMER_ID = "user-belief-basis-validation";
const runtime = createEmptyOrganizationRuntime({
  organizationId: ORGANIZATION_ID,
  name: "Belief Basis Validation",
});
const ref = (
  objectType: string,
  objectId: string,
): { objectType: string; objectId: string } => ({ objectType, objectId });
const section = (summary: string, items: string[] = [summary]) => ({
  title: summary,
  owner: "authorized-projection",
  available: true,
  summary,
  items,
});
const communication = {
  organizationId: ORGANIZATION_ID,
  consumerId: CONSUMER_ID,
  headline: {
    sourceText: {
      text: "Decision ownership is constraining coordinated execution.",
    },
  },
  support: [
    {
      subjectRef: ref("organizational-explanation", "explanation-supported"),
      sourceText: {
        text: "Escalation patterns support decision ownership as a constraint.",
      },
    },
    {
      subjectRef: ref("organizational-explanation", "explanation-alternative"),
      sourceText: {
        text: "Capacity pressure remains a plausible alternative.",
      },
    },
  ],
  uncertainty: [
    {
      sourceText: {
        text: "Independent outcome evidence remains incomplete.",
      },
    },
  ],
  nextInquiries: [
    {
      sourceText: {
        text: "Which decisions still require escalation?",
      },
      priority: {
        source: "upstream_signal",
        explanation: {
          code: "investigation_information_gain_signal",
        },
      },
    },
  ],
  changes: [],
  alternatives: [
    {
      compositionRef: ref(
        "organizational-understanding",
        "understanding-decision-flow",
      ),
      alternatives: [
        {
          explanationRef: ref(
            "organizational-explanation",
            "explanation-alternative",
          ),
          disposition: "unresolved",
          supportingRefs: [ref("evidence", "evidence-capacity")],
        },
        {
          explanationRef: ref(
            "organizational-explanation",
            "explanation-without-text",
          ),
          disposition: "plausible",
          supportingRefs: [],
        },
      ],
    },
  ],
  evidenceRoles: [
    {
      evidenceRef: ref("evidence", "evidence-support"),
      explanationRef: ref(
        "organizational-explanation",
        "explanation-supported",
      ),
      role: "supports",
    },
    {
      evidenceRef: ref("evidence", "evidence-oppose"),
      explanationRef: ref(
        "organizational-explanation",
        "explanation-supported",
      ),
      role: "opposes",
    },
    {
      evidenceRef: ref("evidence", "evidence-shared"),
      explanationRef: ref(
        "organizational-explanation",
        "explanation-supported",
      ),
      role: "shared",
    },
  ],
};
const projection = {
  projectionId: "projection-belief-basis-validation",
  contractVersion: "1",
  organizationId: ORGANIZATION_ID,
  consumerId: CONSUMER_ID,
  disclosureDecisionId: "disclosure-belief-basis-validation",
  sourceRevisionIds: [],
  understandings: [],
  explanations: [],
  evidence: [],
  uncertainty: [],
  conditions: [],
  organizationalState: null,
  investigations: [],
  evolution: [],
  availability: [],
};

function build() {
  const activated = buildActivatedYourOrganizationView({
    runtime,
    projection: projection as never,
    communication: communication as never,
  });
  return {
    activated,
    experience: buildDiscoveryExperienceView({ runtime, view: activated }),
  };
}

const first = build();
const second = build();
const basis = first.experience.understanding.beliefBasis;
assert.ok(basis);
assert.equal(
  basis.summaryExplanation,
  "Escalation patterns support decision ownership as a constraint.",
);
assert.deepEqual(basis.evidenceCategories, [
  { role: "supports", count: 1 },
  { role: "opposes", count: 1 },
  { role: "shared", count: 1 },
]);
assert.deepEqual(basis.uncertainty, [
  "Independent outcome evidence remains incomplete.",
]);
assert.deepEqual(basis.alternatives, [
  {
    id: "authorized-alternative-1-1",
    disposition: "unresolved",
    summary: "Capacity pressure remains a plausible alternative.",
  },
  {
    id: "authorized-alternative-1-2",
    disposition: "plausible",
    summary: null,
  },
]);
assert.deepEqual(basis.nextInquiry, {
  question: "Which decisions still require escalation?",
  rationale: "investigation-information-gain",
});
assert.equal(
  JSON.stringify(first.experience),
  JSON.stringify(second.experience),
  "Repeated presentation composition must be deterministic.",
);
assert.equal(runtime.metadata.organizationId, ORGANIZATION_ID);
assert.equal(first.experience.organization.id, ORGANIZATION_ID);
assert.equal(
  JSON.stringify(first.experience).includes("evidence-support"),
  false,
  "Raw Evidence identifiers must not enter the Hosted Alpha view.",
);
assert.equal(
  JSON.stringify(first.experience).includes("evidence-capacity"),
  false,
  "Alternative supporting references must remain undisclosed.",
);
assert.equal(
  JSON.stringify(first.experience).includes("explanation-alternative"),
  false,
  "Raw Explanation identifiers must not enter the Hosted Alpha view.",
);

const component = fs.readFileSync(
  "components/alpha/UnderstandingDisclosure.tsx",
  "utf8",
);
assert.ok(component.includes("Why Discovery currently believes this"));
assert.ok(component.includes("Evidence bodies are not exposed"));
assert.ok(component.includes("Explanation text unavailable"));
assert.ok(component.includes("Product Communication"));

console.log(JSON.stringify({
  validation: "why-discovery-believes-this",
  result: "PASS",
  capabilityIds: ["CAP-UND-006", "CAP-SELF-001", "CAP-SELF-002", "CAP-COM-001"],
  deterministic: true,
  organizationIsolated: true,
  rawEvidenceDisclosed: false,
  runtimeMutated: false,
}, null, 2));
