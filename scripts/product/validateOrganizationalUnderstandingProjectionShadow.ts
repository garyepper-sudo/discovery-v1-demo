import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  buildRuntimeOrganizationView,
} from "../../components/product-shell/data/buildRuntimeOrganizationView";
import type {
  OrganizationalExplanation,
} from "../../engine/v3/model/judgment/organizationalJudgment";
import type {
  InvestigationOpportunity,
} from "../../engine/v3/model/investigation/buildInvestigationOpportunities";
import type {
  OrganizationalUncertainty,
} from "../../engine/v3/model/epistemic/organizationalUncertainty";
import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../../engine/v3/model/state/inferOrganizationalConditions";
import {
  compileOrganizationalUnderstandingProjection,
  ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
  type CanonicalEvolutionReference,
  type ProjectionSource,
} from "../../engine/v3/projection/organizationalUnderstandingProjection";
import {
  createEmptyOrganizationRuntime,
  loadOrganizationRuntimeState,
  type OrganizationRuntime,
} from "../../engine/v3/runtime";
import {
  buildCanonicalUnderstandingCompatibilityShadow,
  type CanonicalUnderstandingComposition,
} from "../../engine/v3/understanding/buildCanonicalUnderstandingCompatibilityShadow";
import {
  discloseCanonicalOrganizationalUnderstanding,
  type OrganizationalUnderstandingDisclosureDecision,
  type OrganizationalUnderstandingDisclosureResult,
} from "../../engine/v3/understanding/discloseCanonicalOrganizationalUnderstanding";

const ORGANIZATION_ID = "projection-shadow-organization";
const CONSUMER_ID = "projection-shadow-consumer";
const NOW = "2026-07-27T00:00:00.000Z";

function stable(value: unknown): string {
  return JSON.stringify(value);
}

function explanation(input: {
  id: string;
  outcomeId: string;
  evidenceId: string;
  uncertainty?: string[];
}): OrganizationalExplanation {
  return {
    id: input.id,
    organizationId: ORGANIZATION_ID,
    semanticKey: `semantic:${input.id}`,
    claim: {
      scope: {
        organizationId: ORGANIZATION_ID,
        type: "organization",
        id: ORGANIZATION_ID,
      },
      rootMechanismIds: [`mechanism:${input.id}`],
      outcomeRefs: [{ type: "phenomenon", id: input.outcomeId }],
      causalRelationFamily: "constraint",
    },
    explanationSeedIds: [`seed:${input.id}`],
    reasoningPathIds: [`path:${input.id}`],
    mechanismIds: [`mechanism:${input.id}`],
    beliefIds: [`belief:${input.id}`],
    theoryIds: [`theory:${input.id}`],
    evidenceIds: [input.evidenceId],
    contradictionIds: [],
    assumptions: [],
    comparativeEvidenceRoles: [
      {
        evidenceId: input.evidenceId,
        role: "supports",
        basis: {
          kind: "evidence-relationship",
          referenceIds: [`relationship:${input.id}`],
        },
        relatedExplanationIds: [],
      },
    ],
    viability: "unadjudicated",
    uncertainty: input.uncertainty ?? [],
    createdAt: NOW,
    updatedAt: NOW,
  };
}

const explanations = [
  explanation({
    id: "explanation:delivery",
    outcomeId: "outcome:delivery",
    evidenceId: "evidence:delivery",
    uncertainty: ["Independent delivery outcomes remain unavailable."],
  }),
  explanation({
    id: "explanation:coordination",
    outcomeId: "outcome:delivery",
    evidenceId: "evidence:coordination",
  }),
];

const compositions = buildCanonicalUnderstandingCompatibilityShadow({
  organizationId: ORGANIZATION_ID,
  explanations,
  evidence: [
    {
      id: "evidence:delivery",
      source: "interview",
      sourceId: "source:delivery",
    },
    {
      id: "evidence:coordination",
      source: "interview",
      sourceId: "source:coordination",
    },
  ],
  now: NOW,
});

assert.equal(compositions.length, 1);
assert.equal(compositions[0]?.compositionUncertainty.includes(
  "unresolved-alternatives",
), true);

const conditions: OrganizationalCondition[] = [
  {
    id: "condition:knowledge-continuity",
    name: "Knowledge Continuity",
    domain: "knowledgeContinuity",
    status: "constrained",
    priority: "high",
    confidence: 0.72,
    strength: 0.68,
    trend: "stable",
    summary: "Delivery knowledge remains concentrated.",
    whyItMatters: "Reusable delivery judgment is limited.",
    supportingConceptIds: [],
    supportingBeliefIds: [],
    supportingMechanismIds: ["mechanism:explanation:delivery"],
    supportingTheoryIds: [],
    supportingExplanationIds: ["explanation:delivery"],
    upstreamConditionIds: [],
    downstreamConditionIds: [],
    recommendedExecutiveAction: "Preserve reusable delivery judgment.",
    uncertaintySummary: "Independent outcomes remain unavailable.",
    confidenceLimiters: ["No independent outcome comparison."],
    missingEvidence: ["Independent delivery outcomes."],
    lastUpdatedAt: NOW,
  },
  {
    id: "condition:unrelated",
    name: "Unrelated Condition",
    domain: "unrelated",
    status: "stable",
    priority: "low",
    confidence: 0.9,
    strength: 0.9,
    trend: "stable",
    summary: "This content must not bypass disclosure.",
    whyItMatters: "It is unrelated.",
    supportingConceptIds: [],
    supportingBeliefIds: [],
    supportingMechanismIds: [],
    supportingTheoryIds: [],
    supportingExplanationIds: ["explanation:not-disclosed"],
    upstreamConditionIds: [],
    downstreamConditionIds: [],
    recommendedExecutiveAction: "Do not disclose.",
    uncertaintySummary: "",
    confidenceLimiters: [],
    missingEvidence: [],
    lastUpdatedAt: NOW,
  },
  {
    id: "condition:mixed",
    name: "Mixed Condition",
    domain: "mixed",
    status: "stable",
    priority: "low",
    confidence: 0.8,
    strength: 0.8,
    trend: "stable",
    summary: "This mixed support content must not bypass disclosure.",
    whyItMatters: "It combines disclosed and undisclosed support.",
    supportingConceptIds: [],
    supportingBeliefIds: [],
    supportingMechanismIds: [],
    supportingTheoryIds: [],
    supportingExplanationIds: [
      "explanation:delivery",
      "explanation:not-disclosed",
    ],
    upstreamConditionIds: [],
    downstreamConditionIds: [],
    recommendedExecutiveAction: "Do not disclose mixed support.",
    uncertaintySummary: "",
    confidenceLimiters: [],
    missingEvidence: [],
    lastUpdatedAt: NOW,
  },
];

const organizationalState: OrganizationalState = {
  id: "organizational-state:current",
  summary: "Current state is linked to disclosed knowledge continuity.",
  status: "strained",
  confidence: 0.7,
  dominantConditions: ["condition:knowledge-continuity"],
  improvingConditions: [],
  deterioratingConditions: [],
  unresolvedTensions: [],
  executiveImplication: "Preserve reusable delivery judgment.",
  recommendedFocus: ["Knowledge Continuity"],
  lastUpdatedAt: NOW,
};

const investigations: InvestigationOpportunity[] = [
  {
    id: "investigation:delivery",
    topic: "Delivery independence",
    reason: "Independent outcomes would reduce uncertainty.",
    expectedConfidenceGain: 0.12,
    executiveLeverage: "high",
    affectedConditions: ["condition:knowledge-continuity"],
    missingEvidence: ["Independent delivery outcomes."],
    suggestedExecutiveQuestion:
      "Where does delivery judgment remain concentrated?",
  },
  {
    id: "investigation:unrelated",
    topic: "Unrelated",
    reason: "This content must not bypass disclosure.",
    expectedConfidenceGain: 0.9,
    executiveLeverage: "high",
    affectedConditions: ["condition:unrelated"],
    missingEvidence: [],
    suggestedExecutiveQuestion: "This question must remain withheld.",
  },
];

const uncertainty: OrganizationalUncertainty = {
  organizationId: ORGANIZATION_ID,
  evidenceCompleteness: 0.5,
  evidenceAgreement: 0.8,
  contradictionDensity: 0,
  contradictionConfidence: 0,
  ambiguityScore: 0.6,
  learningCertainty: 0.4,
  predictionCertainty: 0.3,
  investigationUrgency: 0.7,
  unresolvedContradictionCount: 0,
  unresolvedQuestionCount: 1,
  competingExplanationCount: 2,
  overallUncertainty: 0.6,
  status: "high",
  drivers: [
    {
      type: "competing-explanations",
      description: "Two disclosed Explanations remain unresolved.",
      weight: 0.6,
      sourceObjectIds: ["explanation:delivery", "explanation:coordination"],
    },
    {
      type: "other",
      description: "This unrelated driver must not bypass disclosure.",
      weight: 0.4,
      sourceObjectIds: ["explanation:not-disclosed"],
    },
  ],
  recommendedEvidenceAreas: [],
  confidenceLimiters: [],
  summary: "Organization-wide uncertainty summary is not projected.",
  assessedAt: NOW,
};

const evolution: CanonicalEvolutionReference[] = [
  {
    id: "evolution:delivery",
    organizationId: ORGANIZATION_ID,
    occurredAt: NOW,
    objectType: "organizational-understanding",
    objectId: compositions[0]!.id,
    revisionId: compositions[0]!.revisionId,
    supportingRefs: [
      {
        objectType: "organizational-explanation",
        objectId: "explanation:delivery",
      },
    ],
  },
  {
    id: "evolution:unrelated",
    organizationId: ORGANIZATION_ID,
    occurredAt: NOW,
    objectType: "organizational-explanation",
    objectId: "explanation:not-disclosed",
    supportingRefs: [],
  },
];

function decision(
  disposition: OrganizationalUnderstandingDisclosureDecision["disposition"],
  overrides: Partial<OrganizationalUnderstandingDisclosureDecision> = {},
): OrganizationalUnderstandingDisclosureDecision {
  return {
    id: `disclosure:${disposition}`,
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    disposition,
    effectiveAt: NOW,
    basis: ["shadow-harness-resolved-decision"],
    ...overrides,
  };
}

function disclosure(
  disposition: OrganizationalUnderstandingDisclosureDecision["disposition"],
  overrides: Partial<OrganizationalUnderstandingDisclosureDecision> = {},
): OrganizationalUnderstandingDisclosureResult {
  return discloseCanonicalOrganizationalUnderstanding({
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    decision: decision(disposition, overrides),
    compositions,
  });
}

function source(
  disclosed: OrganizationalUnderstandingDisclosureResult = disclosure(
    "eligible",
  ),
): ProjectionSource {
  return {
    context: {
      organizationId: ORGANIZATION_ID,
      consumerId: CONSUMER_ID,
      experience: "organization",
      generatedAt: NOW,
      contractVersion: ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
    },
    disclosure: disclosed,
    compositions,
    explanations,
    conditions,
    organizationalState,
    uncertainty,
    investigations,
    evolution,
  };
}

let checks = 0;
function check(name: string, assertion: () => void): void {
  assertion();
  checks += 1;
  process.stdout.write(`PASS ${name}\n`);
}

const eligibleSource = source();
const before = stable(eligibleSource);
const projection = compileOrganizationalUnderstandingProjection(
  eligibleSource,
);

check("repeated projection is byte-stable", () => {
  assert.equal(
    stable(compileOrganizationalUnderstandingProjection(eligibleSource)),
    stable(projection),
  );
});

check("reversed source arrays normalize to equivalent output", () => {
  const reversed = {
    ...eligibleSource,
    compositions: [...eligibleSource.compositions].reverse(),
    explanations: [...eligibleSource.explanations].reverse(),
    conditions: [...eligibleSource.conditions].reverse(),
    investigations: [...eligibleSource.investigations].reverse(),
    evolution: [...eligibleSource.evolution].reverse(),
  };
  assert.equal(
    stable(compileOrganizationalUnderstandingProjection(reversed)),
    stable(projection),
  );
});

check("organization identity is preserved", () => {
  assert.equal(projection.organizationId, ORGANIZATION_ID);
  assert.equal(
    projection.understandings.every(
      (item) => item.value.organizationId === ORGANIZATION_ID,
    ),
    true,
  );
});

check("organization mismatch fails closed", () => {
  const mismatched = source();
  mismatched.context = {
    ...mismatched.context,
    organizationId: "foreign-organization",
  };
  const output = compileOrganizationalUnderstandingProjection(mismatched);
  assert.equal(output.understandings.length, 0);
  assert.equal(output.availability[0]?.state, "organization-mismatch");
});

check("consumer mismatch fails closed", () => {
  const mismatched = source();
  mismatched.context = {
    ...mismatched.context,
    consumerId: "foreign-consumer",
  };
  const output = compileOrganizationalUnderstandingProjection(mismatched);
  assert.equal(output.understandings.length, 0);
  assert.equal(output.availability[0]?.state, "consumer-mismatch");
});

check("withheld disclosure fails closed", () => {
  const output = compileOrganizationalUnderstandingProjection(
    source(disclosure("withheld")),
  );
  assert.equal(output.understandings.length, 0);
  assert.equal(output.explanations.length, 0);
  assert.equal(output.conditions.length, 0);
  assert.equal(output.availability[0]?.state, "withheld");
});

check("revoked disclosure fails closed", () => {
  const output = compileOrganizationalUnderstandingProjection(
    source(disclosure("revoked")),
  );
  assert.equal(output.understandings.length, 0);
  assert.equal(output.investigations.length, 0);
  assert.equal(output.availability[0]?.state, "revoked");
});

check("authority receipt absence fails closed", () => {
  const invalidComposition: CanonicalUnderstandingComposition = {
    ...compositions[0]!,
    authorityTransition: undefined,
  };
  const invalidDisclosure: OrganizationalUnderstandingDisclosureResult = {
    decisionId: "disclosure:invalid-authority",
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    disposition: "eligible",
    disclosedCompositions: [invalidComposition],
    suppressedCompositionIds: [],
  };
  const invalidSource = source(invalidDisclosure);
  invalidSource.compositions = [invalidComposition];
  const output = compileOrganizationalUnderstandingProjection(invalidSource);
  assert.equal(output.understandings.length, 0);
  assert.equal(output.availability[0]?.state, "authority-receipt-invalid");
});

check("support objects cannot bypass composition disclosure", () => {
  const serialized = stable(projection);
  assert.equal(serialized.includes("This content must not bypass disclosure."), false);
  assert.equal(serialized.includes("This question must remain withheld."), false);
  assert.equal(
    serialized.includes("This mixed support content must not bypass disclosure."),
    false,
  );
  assert.equal(serialized.includes("explanation:not-disclosed"), false);
});

check("canonical composition identity is exact", () => {
  assert.equal(projection.understandings[0]?.id, compositions[0]?.id);
  assert.deepEqual(
    projection.understandings[0]?.value,
    compositions[0],
  );
});

check("canonical revision identity is exact", () => {
  assert.deepEqual(projection.sourceRevisionIds, [
    compositions[0]!.revisionId,
  ]);
  assert.equal(
    projection.understandings[0]?.canonicalRef.revisionId,
    compositions[0]?.revisionId,
  );
});

check("exact Explanation membership is preserved", () => {
  assert.deepEqual(
    projection.explanations.map((item) => item.id),
    [...compositions[0]!.explanationIds].sort(),
  );
});

check("unresolved alternatives are preserved", () => {
  assert.equal(
    projection.uncertainty.some(
      (item) =>
        item.value.owner === "organizational-understanding" &&
        item.value.disposition === "unresolved-alternatives",
    ),
    true,
  );
});

check("uncertainty is preserved without recalculation", () => {
  assert.equal(
    projection.uncertainty.some(
      (item) =>
        item.value.owner === "organizational-explanation" &&
        item.value.statement ===
          "Independent delivery outcomes remain unavailable.",
    ),
    true,
  );
  assert.equal(stable(projection).includes("overallUncertainty"), false);
});

check("no fabricated prose is present", () => {
  const serialized = stable(projection);
  assert.equal(serialized.includes("headline"), false);
  assert.equal(serialized.includes("why this matters"), false);
  assert.equal(serialized.includes("executiveSummary"), false);
});

check("fixture-only Explanation prose is not projected", () => {
  const withFixtureProse = source();
  withFixtureProse.explanations = withFixtureProse.explanations.map(
    (item) => ({
      ...item,
      title: "Fixture-only title",
      summary: "Fixture-only summary",
    }),
  );
  const serialized = stable(
    compileOrganizationalUnderstandingProjection(withFixtureProse),
  );
  assert.equal(serialized.includes("Fixture-only title"), false);
  assert.equal(serialized.includes("Fixture-only summary"), false);
});

check("no fabricated confidence is present", () => {
  assert.equal(
    Object.prototype.hasOwnProperty.call(
      projection.understandings[0] ?? {},
      "confidence",
    ),
    false,
  );
});

check("Evidence bodies are not fabricated", () => {
  assert.equal(projection.evidence.length, 2);
  assert.equal(
    projection.evidence.every(
      (item) => item.value.bodyAvailability === "runtime-data-unavailable",
    ),
    true,
  );
  assert.equal(stable(projection).includes("evidenceBody"), false);
});

check("no projected ranking or primary judgment exists", () => {
  const serialized = stable(projection);
  assert.equal(serialized.includes("\"rank\""), false);
  assert.equal(serialized.includes("\"primary\""), false);
});

check("available-with-content is explicit", () => {
  assert.equal(
    projection.availability.find((item) => item.area === "understanding")
      ?.state,
    "available-with-content",
  );
});

check("available-but-empty is explicit", () => {
  const emptyDisclosure: OrganizationalUnderstandingDisclosureResult = {
    decisionId: "disclosure:eligible-empty",
    organizationId: ORGANIZATION_ID,
    consumerId: CONSUMER_ID,
    disposition: "eligible",
    disclosedCompositions: [],
    suppressedCompositionIds: [],
  };
  const output = compileOrganizationalUnderstandingProjection(
    source(emptyDisclosure),
  );
  assert.equal(
    output.availability.find((item) => item.area === "understanding")?.state,
    "available-empty",
  );
});

check("Runtime-not-available Evidence state is explicit", () => {
  assert.equal(
    projection.evidence.every(
      (item) => item.value.bodyAvailability === "runtime-data-unavailable",
    ),
    true,
  );
});

check("missing referenced Explanation is explicit", () => {
  const missing = source();
  missing.explanations = [explanations[0]!];
  const output = compileOrganizationalUnderstandingProjection(missing);
  assert.equal(
    output.availability.find((item) => item.area === "explanations")?.state,
    "referenced-data-missing",
  );
});

check("historical source mismatch fails closed", () => {
  const historical = source();
  historical.compositions = [];
  const output = compileOrganizationalUnderstandingProjection(historical);
  assert.equal(output.understandings.length, 0);
  assert.equal(
    output.availability[0]?.state,
    "historical-compatibility-unavailable",
  );
});

check("progressive disclosure preserves trace closure", () => {
  const summaryIds = new Set(
    projection.depth.summary.map((reference) => reference.objectId),
  );
  const supportIds = new Set(
    projection.depth.support.map((reference) => reference.objectId),
  );
  const traceIds = new Set(
    projection.depth.trace.map((reference) => reference.objectId),
  );
  assert.equal(summaryIds.has(compositions[0]!.id), true);
  for (const explanationId of compositions[0]!.explanationIds) {
    assert.equal(supportIds.has(explanationId), true);
  }
  for (const evidenceId of explanations.flatMap((item) => item.evidenceIds)) {
    assert.equal(traceIds.has(evidenceId), true);
  }
});

check("compiler does not mutate its source", () => {
  assert.equal(stable(eligibleSource), before);
});

check("Phase 8A semantic comparison is explicit", () => {
  const runtime = createEmptyOrganizationRuntime({
    organizationId: ORGANIZATION_ID,
    name: "Projection Shadow Organization",
  });
  runtime.metadata.investigationCount = 1;
  runtime.memory.organizationalUnderstandingState.canonicalCompositions =
    structuredClone(compositions);
  const memory = runtime.memory as unknown as Record<string, unknown>;
  memory.organizationalExplanations = structuredClone(explanations);
  const current = buildRuntimeOrganizationView(runtime);
  assert.equal(current.currentUnderstanding.available, false);
  assert.equal(projection.understandings.length, 1);
  assert.equal(
    projection.explanations.map((item) => item.id).join(","),
    compositions[0]!.explanationIds.join(","),
  );
});

check("active product adapter remains independently callable", () => {
  const runtime = createEmptyOrganizationRuntime({
    organizationId: ORGANIZATION_ID,
  });
  assert.equal(
    buildRuntimeOrganizationView(runtime).currentUnderstanding.summary,
    "Runtime not yet available",
  );
});

check("persisted Runtime replay remains immutable", () => {
  const runtime = loadOrganizationRuntimeState(
    "atlas-manufacturing-simulation",
  );
  const runtimeBefore = stable(runtime);
  const memory = runtime.memory as unknown as {
    organizationalExplanations?: OrganizationalExplanation[];
    organizationalConditions?: OrganizationalCondition[];
    organizationalState?: OrganizationalState;
    organizationalUncertainty?: OrganizationalUncertainty;
    investigationOpportunities?: InvestigationOpportunity[];
  };
  const runtimeCompositions =
    runtime.memory.organizationalUnderstandingState.canonicalCompositions ?? [];
  const replayDecision = decision("eligible", {
    organizationId: runtime.metadata.organizationId,
    consumerId: CONSUMER_ID,
  });
  const replayDisclosure = discloseCanonicalOrganizationalUnderstanding({
    organizationId: runtime.metadata.organizationId,
    consumerId: CONSUMER_ID,
    decision: replayDecision,
    compositions: runtimeCompositions,
  });
  const replaySource: ProjectionSource = {
    context: {
      organizationId: runtime.metadata.organizationId,
      consumerId: CONSUMER_ID,
      experience: "organization",
      generatedAt: NOW,
      contractVersion: ORGANIZATIONAL_UNDERSTANDING_PROJECTION_VERSION,
    },
    disclosure: replayDisclosure,
    compositions: runtimeCompositions,
    explanations: memory.organizationalExplanations ?? [],
    conditions: memory.organizationalConditions ?? [],
    organizationalState: memory.organizationalState,
    uncertainty: memory.organizationalUncertainty,
    investigations: memory.investigationOpportunities ?? [],
    evolution: [],
  };
  const first = compileOrganizationalUnderstandingProjection(replaySource);
  const second = compileOrganizationalUnderstandingProjection(replaySource);
  assert.equal(stable(first), stable(second));
  assert.equal(stable(runtime), runtimeBefore);
});

check("rollback boundary remains the untouched prior adapter", () => {
  const productSource = fs.readFileSync(
    path.join(
      process.cwd(),
      "components",
      "product-shell",
      "data",
      "buildUnifiedExecutiveWorkspaceView.ts",
    ),
    "utf8",
  );
  assert.equal(
    productSource.includes("compileOrganizationalUnderstandingProjection"),
    false,
  );
});

const semanticComparison = [
  {
    field: "canonical composition identity and revision",
    classification: "exact parity",
  },
  {
    field: "completed Explanation membership",
    classification: "exact parity",
  },
  {
    field: "structured uncertainty and unresolved alternatives",
    classification: "semantically equivalent",
  },
  {
    field: "optional Explanation title and summary",
    classification: "intentionally excluded from projection ownership",
  },
  {
    field: "Evidence bodies",
    classification: "intentionally unavailable",
  },
  {
    field: "unlinked Conditions, State, investigations, and changes",
    classification: "intentionally unavailable",
  },
  {
    field: "active application consumption",
    classification: "blocked by disclosure activation",
  },
] as const;

console.log(
  JSON.stringify(
    {
      benchmark: "Organizational Understanding Projection Shadow",
      checks,
      semanticComparison,
      activeProductPath: "unchanged",
      classification:
        "B — Projection Contract Valid, Compatibility Refinement Required",
    },
    null,
    2,
  ),
);
