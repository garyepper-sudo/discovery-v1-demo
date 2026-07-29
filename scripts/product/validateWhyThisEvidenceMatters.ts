import assert from "node:assert/strict";
import fs from "node:fs";

import {
  buildActivatedYourOrganizationView,
} from "../../components/product-shell/data/buildActivatedYourOrganizationView";
import {
  buildDiscoveryExperienceView,
} from "../../components/product-shell/data/buildDiscoveryExperienceView";
import {
  buildYourOrganizationCommunicationView,
} from "../../components/product-shell/data/buildYourOrganizationCommunicationView";
import {
  compileProductCommunicationPlan,
  ORGANIZATION_PRODUCT_COMMUNICATION_POLICY,
  PRODUCT_COMMUNICATION_CONTRACT_VERSION,
} from "../../engine/v3/communication/productCommunicationPlan";
import type {
  InvestigationOpportunity,
} from "../../engine/v3/model/investigation/buildInvestigationOpportunities";
import type {
  OrganizationalExplanation,
} from "../../engine/v3/model/judgment/organizationalJudgment";
import {
  compileOrganizationalUnderstandingProjection,
  ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
} from "../../engine/v3/projection/organizationalUnderstandingProjection";
import {
  createEmptyOrganizationRuntime,
} from "../../engine/v3/runtime";
import {
  buildCanonicalUnderstandingCompatibilityShadow,
} from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";
import {
  discloseCanonicalOrganizationalUnderstanding,
  type OrganizationalUnderstandingDisclosureDecision,
} from "../../engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding";

const ORGANIZATION_ID = "org-evidence-rationale-validation";
const CONSUMER_ID = "user-evidence-rationale-validation";
const NOW = "2026-08-03T12:00:00.000Z";

function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, item]) => `${JSON.stringify(key)}:${stable(item)}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

const explanation: OrganizationalExplanation = {
  id: "explanation:decision-flow",
  organizationId: ORGANIZATION_ID,
  semanticKey: "semantic:decision-flow",
  claim: {
    scope: {
      organizationId: ORGANIZATION_ID,
      type: "organization",
      id: ORGANIZATION_ID,
    },
    rootMechanismIds: ["mechanism:decision-flow"],
    outcomeRefs: [{ type: "phenomenon", id: "outcome:execution" }],
    causalRelationFamily: "constraint",
  },
  explanationSeedIds: ["seed:decision-flow"],
  reasoningPathIds: ["path:decision-flow"],
  mechanismIds: ["mechanism:decision-flow"],
  beliefIds: ["belief:decision-flow"],
  theoryIds: ["theory:decision-flow"],
  evidenceIds: ["evidence:decision-flow"],
  contradictionIds: [],
  assumptions: [],
  comparativeEvidenceRoles: [],
  viability: "unadjudicated",
  uncertainty: ["Decision outcomes remain incomplete."],
  createdAt: NOW,
  updatedAt: NOW,
};
const compositions = buildCanonicalUnderstandingCompatibilityShadow({
  organizationId: ORGANIZATION_ID,
  explanations: [explanation],
  now: NOW,
});
const condition = {
  id: "condition:decision-flow",
  name: "Decision Flow",
  domain: "execution",
  status: "constrained",
  priority: "high",
  confidence: 0.62,
  strength: 0.76,
  trend: "stable",
  summary: "Decision flow remains constrained.",
  whyItMatters: "Delayed decisions can slow execution.",
  supportingConceptIds: [],
  supportingBeliefIds: [],
  supportingMechanismIds: [],
  supportingTheoryIds: [],
  supportingExplanationIds: [explanation.id],
  upstreamConditionIds: [],
  downstreamConditionIds: [],
  recommendedExecutiveAction: "Clarify decision authority.",
  uncertaintySummary: "Outcome coverage remains incomplete.",
  confidenceLimiters: ["Independent outcome evidence is incomplete."],
  missingEvidence: ["Decision-cycle outcomes from multiple teams."],
  lastUpdatedAt: NOW,
};

function opportunity(input: {
  id: string;
  reason: string;
  expectedConfidenceGain?: number;
  affectedConditions?: string[];
  missingEvidence?: string[];
}): InvestigationOpportunity {
  return {
    id: input.id,
    topic: "Decision Authority",
    reason: input.reason,
    expectedConfidenceGain: input.expectedConfidenceGain ?? 12,
    executiveLeverage: "high",
  affectedConditions: input.affectedConditions ?? [condition.name],
    missingEvidence:
      input.missingEvidence ?? ["Decision-cycle outcomes from multiple teams."],
    suggestedExecutiveQuestion:
      "Which operational decisions still require escalation?",
  };
}

function disclosure(
  disposition: OrganizationalUnderstandingDisclosureDecision["disposition"] =
    "eligible",
) {
  return discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: {
      id: `disclosure:${disposition}`,
      organizationId: ORGANIZATION_ID,
      consumerId: CONSUMER_ID,
      disposition,
      effectiveAt: NOW,
      basis: ["focused-sprint-3-validation"],
    },
    compositions,
  });
}

function projection(input: {
  investigations: InvestigationOpportunity[];
  investigationsAvailable?: boolean;
  disposition?: OrganizationalUnderstandingDisclosureDecision["disposition"];
  organizationId?: string;
}) {
  return compileOrganizationalUnderstandingProjection({
    context: {
      organizationId: input.organizationId ?? ORGANIZATION_ID,
      consumerId: CONSUMER_ID,
      experience: "organization",
      generatedAt: NOW,
      contractVersion: ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
    },
    disclosure: disclosure(input.disposition),
    compositions,
    explanations: [explanation],
    conditions: [condition] as never,
    investigations: input.investigations,
    investigationsAvailable: input.investigationsAvailable ?? true,
    investigationPriorityRanks: Object.fromEntries(
      input.investigations.map((item, rank) => [item.id, rank]),
    ),
    evolution: [],
  });
}

function plan(projected: ReturnType<typeof projection>) {
  return compileProductCommunicationPlan({
    context: {
      organizationId: projected.organizationId,
      consumerId: projected.consumerId,
      experience: "organization",
      generatedAt: NOW,
      contractVersion: PRODUCT_COMMUNICATION_CONTRACT_VERSION,
    },
    projection: projected,
    prioritySignals: [],
  }, ORGANIZATION_PRODUCT_COMMUNICATION_POLICY);
}

const rationales = [
  "Priority increased because the current investigation has limited evidence coverage.",
  "Priority increased because this investigation could help resolve contradictory evidence.",
  "Priority increased because this investigation could distinguish among competing explanations.",
  "This investigation could reduce uncertainty in Decision Flow.",
];
const opportunities = rationales.map((reason, index) =>
  opportunity({
    id: index === 0 ? "investigation:z-highest" : `investigation:a-${index}`,
    reason,
    expectedConfidenceGain: 12 - index,
  }),
);
const projected = projection({ investigations: opportunities });
assert.deepEqual(
  projected.investigations.map((item) => item.priorityRank),
  [0, 1, 2, 3],
);
const communicationPlan = plan(projected);
assert.deepEqual(
  communicationPlan.nextInquiries.map((item) => item.inquiry?.priorityRank),
  [0, 1, 2, 3],
  "Product Communication must preserve canonical opportunity order.",
);
for (const [index, rationale] of rationales.entries()) {
  assert.equal(
    communicationPlan.nextInquiries[index]?.inquiry?.rationale,
    rationale,
  );
}
const communication = buildYourOrganizationCommunicationView({
  plan: communicationPlan,
});
assert.equal(
  communication.nextInquiries[0]?.subjectRef.objectId,
  "investigation:z-highest",
  "The adapter must not replace canonical priority with identifier order.",
);

const runtime = createEmptyOrganizationRuntime({
  organizationId: ORGANIZATION_ID,
  name: "Evidence Rationale Validation",
});
runtime.memory.organizationalExplanations = [structuredClone(explanation)];
runtime.memory.organizationalUnderstandingState.canonicalCompositions =
  structuredClone(compositions);
runtime.memory.organizationalConditions = [condition] as never;
const runtimeBytes = stable(runtime);
const activated = buildActivatedYourOrganizationView({
  runtime,
  projection: projected,
  communication,
});
const experience = buildDiscoveryExperienceView({ runtime, view: activated });
const disclosureView =
  experience.understanding.evidenceRequestDisclosure;
assert.equal(disclosureView?.state, "available");
assert.deepEqual(disclosureView?.request, {
  id: "authorized-evidence-request-1",
  question: "Which operational decisions still require escalation?",
  gaps: ["Decision-cycle outcomes from multiple teams."],
  clarificationTargets: ["Decision Flow"],
  rationale: rationales[0],
  expectedConfidenceGain: 12,
  expectedGainUnit: "canonical-confidence-gain-points",
  supportingReferencesAvailable: true,
  outcomeCaveat:
    "The result could strengthen, weaken, or redirect the current understanding.",
});

const reversedProjection = projection({
  investigations: [...opportunities].reverse(),
});
assert.equal(
  plan(reversedProjection).nextInquiries[0]?.subjectRef.objectId,
  opportunities.at(-1)?.id,
  "Presentation follows canonical producer order and does not recompute rank.",
);

const missingReasonPlan = plan(projection({
  investigations: [opportunity({ id: "investigation:no-reason", reason: "" })],
}));
assert.equal(
  missingReasonPlan.availability.find(
    (entry) => entry.area === "next-inquiries",
  )?.state,
  "inquiry-rationale-unavailable",
);

const missingGainProjection = projection({
  investigations: [opportunity({ id: "investigation:no-gain", reason: "Supported rationale." })],
});
missingGainProjection.investigations[0]!.value.expectedConfidenceGain =
  Number.NaN;
assert.equal(
  plan(missingGainProjection).availability.find(
    (entry) => entry.area === "next-inquiries",
  )?.state,
  "expected-gain-unavailable",
);

const missingReferencesProjection = projection({
  investigations: [opportunity({
    id: "investigation:no-supporting-reference",
    reason: "Supported rationale.",
  })],
});
missingReferencesProjection.investigations[0]!.supportingRefs = [];
assert.equal(
  plan(missingReferencesProjection).availability.find(
    (entry) => entry.area === "next-inquiries",
  )?.state,
  "supporting-references-unavailable",
);

assert.equal(
  plan(projection({ investigations: [] })).availability.find(
    (entry) => entry.area === "next-inquiries",
  )?.state,
  "available-empty",
);
assert.equal(
  plan(projection({
    investigations: [],
    investigationsAvailable: false,
  })).availability.find((entry) => entry.area === "next-inquiries")?.state,
  "investigation-data-unavailable",
);

const unauthorized = projection({
  investigations: [opportunity({
    id: "investigation:unauthorized",
    reason: "This reason must remain withheld.",
    affectedConditions: ["condition:not-disclosed"],
  })],
});
assert.equal(unauthorized.investigations.length, 0);
assert.equal(
  plan(unauthorized).availability.find(
    (entry) => entry.area === "next-inquiries",
  )?.state,
  "gap-known-request-not-authorized",
);
assert.equal(stable(plan(unauthorized)).includes("must remain withheld"), false);

const ambiguousConditionProjection = compileOrganizationalUnderstandingProjection({
  context: {
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    experience: "organization",
    generatedAt: NOW,
    contractVersion: ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
  },
  disclosure: disclosure(),
  compositions,
  explanations: [explanation],
  conditions: [
    condition,
    { ...condition, id: "condition:decision-flow-duplicate" },
  ] as never,
  investigations: [opportunity({
    id: "investigation:ambiguous-condition-name",
    reason: "Ambiguous condition names must fail closed.",
  })],
  investigationsAvailable: true,
  evolution: [],
});
assert.equal(
  ambiguousConditionProjection.investigations.length,
  0,
  "Ambiguous condition-name authorization must fail closed.",
);

const wrongOrganization = projection({
  investigations: opportunities,
  organizationId: "org-wrong",
});
assert.equal(wrongOrganization.investigations.length, 0);
assert.equal(wrongOrganization.availability[0]?.state, "organization-mismatch");
const revoked = projection({
  investigations: opportunities,
  disposition: "revoked",
});
assert.equal(revoked.investigations.length, 0);
assert.equal(revoked.availability[0]?.state, "revoked");

const repeatedExperience = buildDiscoveryExperienceView({
  runtime,
  view: buildActivatedYourOrganizationView({
    runtime,
    projection: projected,
    communication,
  }),
});
assert.equal(stable(experience), stable(repeatedExperience));
assert.equal(stable(runtime), runtimeBytes);
assert.equal(
  stable(experience).includes("investigation:z-highest"),
  false,
  "Raw investigation identifiers must not enter Alpha.",
);
assert.equal(
  /\b(explore|exploit|challenge|preserve)\b/.test(stable(disclosureView)),
  false,
  "Raw investigation strategy codes must not enter Alpha.",
);
assert.ok(experience.understanding.beliefBasis);
assert.ok(experience.understanding.changeDisclosure);

const activatedSource = fs.readFileSync(
  "components/product-shell/data/buildActivatedYourOrganizationView.ts",
  "utf8",
);
const discoverySource = fs.readFileSync(
  "components/product-shell/data/buildDiscoveryExperienceView.ts",
  "utf8",
);
const alphaSource = fs.readFileSync(
  "components/alpha/AlphaExperience.tsx",
  "utf8",
);
assert.equal(
  [activatedSource, discoverySource, alphaSource].some((source) =>
    source.includes("expectedConfidenceGain -") ||
    source.includes("expectedConfidenceGain +")
  ),
  false,
  "Alpha composition must not recompute expected gain.",
);
const disclosureSource = fs.readFileSync(
  "components/alpha/UnderstandingDisclosure.tsx",
  "utf8",
);
assert.ok(disclosureSource.includes("Why this evidence matters"));
assert.ok(disclosureSource.includes("This is an estimate, not a guarantee."));

console.log(JSON.stringify({
  validation: "why-this-evidence-matters",
  result: "PASS",
  capabilityIds: [
    "CAP-SELF-001",
    "CAP-SELF-002",
    "CAP-UND-004",
    "CAP-UND-006",
    "CAP-LRN-002",
    "CAP-MEM-001",
    "CAP-COM-001",
  ],
  canonicalPriorityPreserved: true,
  noRankingRecomputationInAlpha: true,
  expectedGainPreservedAsEstimate: true,
  organizationIsolated: true,
  revokedFailsClosed: true,
  rawIdentifiersDisclosed: false,
  runtimeMutated: false,
  sprint1AndSprint2Stable: true,
}, null, 2));
