import assert from "node:assert/strict";

import {
  productUnderstandingInternalVocabulary,
  translateProductUnderstanding,
  type ProductUnderstanding,
} from "../../components/product-shell/communication/productUnderstanding";
import { runDiscoveryV3 } from "../../engine/v3";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { DiscoveryV3Result } from "../../engine/v3/types";
import { buildOnboardingInvestigationInput } from "../../lib/onboarding/testing/buildOnboardingInvestigationInput";

const organizationId = "onb-dev-product-translation";

type Scenario = {
  question: string;
  observations: string[];
};

function translateScenario(
  scenario: Scenario,
  targetOrganizationId = organizationId,
): {
  result: DiscoveryV3Result;
  understanding: ProductUnderstanding;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
} {
  const input = buildOnboardingInvestigationInput({
    company: "Product Translation Validation",
    industry: "B2B software",
    question: scenario.question,
    messyInput: scenario.observations.join("\n"),
  });
  const result = runDiscoveryV3(input);
  const runtime = evolveOrganizationRuntime({
    runtime: createEmptyOrganizationRuntime({
      organizationId: targetOrganizationId,
      name: "Product Translation Validation",
      industry: "B2B software",
    }),
    result,
    input,
  });
  return {
    result,
    runtime,
    understanding: translateProductUnderstanding({
      organizationId: targetOrganizationId,
      result,
      runtime,
    }),
  };
}

function visibleStrings(understanding: ProductUnderstanding): string[] {
  return [
    understanding.headline,
    ...understanding.supportedFindings.flatMap((item) => [
      item.statement,
      item.basis,
    ]),
    ...understanding.candidateExplanations.flatMap((item) => [
      item.statement,
      item.basis,
    ]),
    ...understanding.uncertainties,
    ...understanding.nextEvidence.flatMap((item) => [
      item.label,
      item.whyItHelps,
    ]),
    understanding.confidence.label,
    understanding.confidence.explanation,
  ];
}

function assertGrounded(
  understanding: ProductUnderstanding,
  result: DiscoveryV3Result,
): void {
  const evidenceIds = new Set(result.evidence.map((item) => item.id));
  const observationIds = new Set(result.observations.map((item) => item.id));
  for (const finding of understanding.supportedFindings) {
    assert.ok(finding.lineage.evidenceIds.length > 0);
    assert.ok(finding.lineage.evidenceIds.every((id) => evidenceIds.has(id)));
    assert.ok(
      finding.lineage.observationIds.every((id) => observationIds.has(id)),
    );
  }
  for (const candidate of understanding.candidateExplanations) {
    assert.ok(candidate.lineage.evidenceIds.length > 0);
    assert.ok(candidate.lineage.evidenceIds.every((id) => evidenceIds.has(id)));
  }
}

const salesScenario: Scenario = {
  question: "Why are sales slowing?",
  observations: [
    "Sales commissions increased approximately 15%.",
    "Sales activity increased.",
    "Year-over-year sales growth slowed from approximately 18% to approximately 5%.",
    "Close rates declined.",
    "Sales-cycle duration increased from approximately 45 days to approximately 70 days.",
    "Pipeline value remained relatively stable.",
    "Possible explanations include budget pressure, pricing, competition, product fit, or sales execution.",
    "The primary cause is not yet established.",
  ],
};

const sales = translateScenario(salesScenario);
assert.equal(sales.understanding.status, "provisional");
assert.equal(sales.runtime.memory.organizationalExplanations.length, 0);
assert.equal(
  sales.runtime.memory.organizationalUnderstandingState.canonicalCompositions
    ?.length ?? 0,
  0,
);
assert.ok(sales.understanding.supportedFindings.length >= 2);
assert.ok(sales.understanding.candidateExplanations.length >= 4);
assert.ok(
  sales.understanding.supportedFindings.some((item) =>
    /activity increased while close rates declined/i.test(item.statement)
  ),
);
assert.ok(
  sales.understanding.supportedFindings.some((item) =>
    /weakens a motivation-only explanation, but does not disprove it/i.test(
      item.basis,
    )
  ),
);
assert.ok(
  sales.understanding.supportedFindings.every(
    (item) =>
      item.lineage.explanationIds.length === 0 &&
      item.lineage.compositionIds.length === 0,
  ),
);
assert.ok(
  sales.understanding.nextEvidence.some((item) =>
    item.label === "Pipeline conversion by stage"
  ),
);
assert.equal(sales.understanding.confidence.state, "limited");
assertGrounded(sales.understanding, sales.result);
assert.ok(
  visibleStrings(sales.understanding).every(
    (value) => !productUnderstandingInternalVocabulary.test(value),
  ),
);
assert.ok(
  visibleStrings(sales.understanding).every(
    (value) => !/\b\d+(?:\.\d+)?%\s+confidence\b/i.test(value),
  ),
);
assert.ok(
  !visibleStrings(sales.understanding).some((value) =>
    /\b(primary cause is|caused by|root cause is)\b/i.test(value)
  ),
);

const reordered = translateProductUnderstanding({
  organizationId,
  runtime: sales.runtime,
  result: {
    ...sales.result,
    evidence: [...sales.result.evidence].reverse(),
    observations: [...sales.result.observations].reverse(),
    contradictions: [...sales.result.contradictions].reverse(),
  },
});
assert.deepEqual(reordered, sales.understanding);
assert.deepEqual(
  translateProductUnderstanding({
    organizationId,
    runtime: sales.runtime,
    result: sales.result,
  }),
  sales.understanding,
);

assert.throws(
  () =>
    translateProductUnderstanding({
      organizationId: "onb-dev-other-organization",
      runtime: sales.runtime,
      result: sales.result,
    }),
  /organization mismatch/,
);

const supported = translateScenario({
  question: "How does leadership approval affect release delivery?",
  observations: [
    "Leadership approves every product release.",
    "The product team depends on leadership approval before release.",
    "The release process uses the operations dashboard.",
    "Approval delays create a release bottleneck.",
    "The bottleneck contributes to team fatigue.",
  ],
});
assert.equal(supported.understanding.status, "supported");
assert.ok(
  supported.understanding.lineage.explanationIds.length > 0,
);
assert.ok(
  supported.understanding.lineage.compositionIds.length > 0,
);
assert.ok(
  supported.understanding.supportedFindings.every(
    (item) =>
      item.lineage.explanationIds.length > 0 &&
      item.lineage.compositionIds.length > 0,
  ),
);
assertGrounded(supported.understanding, supported.result);

const negativeControls: Scenario[] = [
  {
    question: "Why are sales slowing?",
    observations: ["Sales are bad."],
  },
  {
    question: "Why are sales slowing?",
    observations: ["The office walls are blue."],
  },
  {
    question: "Why are sales slowing?",
    observations: [
      "Sales increased 10%.",
      "Sales declined 10%.",
    ],
  },
  {
    question: "Why are sales slowing?",
    observations: ["Sales slowed because the representatives are lazy."],
  },
  {
    question: "Why are sales slowing?",
    observations: [""],
  },
];

for (const scenario of negativeControls) {
  const negative = translateScenario(scenario);
  assert.equal(negative.understanding.status, "insufficient");
  assert.deepEqual(negative.understanding.supportedFindings, []);
  assert.deepEqual(negative.understanding.candidateExplanations, []);
  assert.equal(negative.understanding.confidence.state, "unavailable");
  assert.ok(
    visibleStrings(negative.understanding).every(
      (value) => !productUnderstandingInternalVocabulary.test(value),
    ),
  );
}

console.log(JSON.stringify({
  validation: "product-understanding-translation",
  result: "PASS",
  salesStatus: sales.understanding.status,
  salesFindingCount: sales.understanding.supportedFindings.length,
  salesCandidateCount: sales.understanding.candidateExplanations.length,
  supportedCompletionValidated: true,
  deterministic: true,
  orderingStable: true,
  organizationIsolated: true,
  lineageValidated: true,
  internalVocabularyHidden: true,
  confidenceNotFabricated: true,
  negativeControlCount: negativeControls.length,
}, null, 2));
