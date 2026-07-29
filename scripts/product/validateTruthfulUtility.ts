import assert from "node:assert/strict";

import {
  productUnderstandingInternalVocabulary,
  translateProductUnderstanding,
  type ProductUnderstanding,
} from "../../components/product-shell/communication/productUnderstanding";
import {
  optimizeTruthfulUtility,
  type ProductUtility,
} from "../../components/product-shell/communication/truthfulUtility";
import { runDiscoveryV3 } from "../../engine/v3";
import { evolveOrganizationRuntime } from "../../engine/v3/runtime/evolveOrganizationRuntime";
import { createEmptyOrganizationRuntime } from "../../engine/v3/runtime/organizationRuntime";
import type { DiscoveryV3Result } from "../../engine/v3/types";
import { buildOnboardingInvestigationInput } from "../../lib/onboarding/testing/buildOnboardingInvestigationInput";

type Scenario = {
  name: string;
  question: string;
  observations: string[];
};

type Comparison = {
  name: string;
  result: DiscoveryV3Result;
  runtime: ReturnType<typeof evolveOrganizationRuntime>;
  old: ProductUnderstanding;
  utility: ProductUtility;
};

const scenarios: Scenario[] = [
  {
    name: "sales slowdown",
    question: "Why are sales slowing?",
    observations: [
      "Sales commissions increased 15%.",
      "Sales activity increased 20%.",
      "Close rates declined from 24% to 16%.",
      "Sales cycle duration increased from 45 days to 70 days.",
      "Possible explanations include demand, pricing, competition, product fit, or sales execution.",
      "The primary cause is not yet established.",
    ],
  },
  {
    name: "execution delays",
    question: "Why are projects getting delayed?",
    observations: [
      "Project delivery missed 4 of 6 deadlines.",
      "Approval waiting increased from 2 days to 8 days.",
      "Rework increased 20%.",
    ],
  },
  {
    name: "hiring capacity",
    question: "Why is hiring capacity falling behind demand?",
    observations: [
      "Open roles increased from 12 to 30.",
      "Time to fill increased from 45 days to 78 days.",
      "Workload per engineer increased 18%.",
    ],
  },
  {
    name: "decision bottlenecks",
    question: "Where are decisions getting stuck?",
    observations: [
      "Median decision time increased from 5 days to 16 days.",
      "Senior approval is required for 70% of pricing decisions.",
      "Escalations increased 25%.",
    ],
  },
  {
    name: "customer retention",
    question: "Why is customer retention declining?",
    observations: [
      "Customer retention declined from 92% to 84%.",
      "Support complaints increased 30%.",
      "Product usage declined 15% before renewal.",
    ],
  },
];

function compareScenario(scenario: Scenario): Comparison {
  const organizationId =
    `onb-dev-utility-${scenario.name.replace(/\s+/g, "-")}`;
  const input = buildOnboardingInvestigationInput({
    company: "Truthful Utility Validation",
    industry: "B2B software",
    question: scenario.question,
    messyInput: scenario.observations.join("\n"),
  });
  const originalLog = console.log;
  const originalInfo = console.info;
  console.log = () => undefined;
  console.info = () => undefined;
  let result: DiscoveryV3Result;
  let runtime: ReturnType<typeof evolveOrganizationRuntime>;
  try {
    result = runDiscoveryV3(input);
    runtime = evolveOrganizationRuntime({
      runtime: createEmptyOrganizationRuntime({
        organizationId,
        name: "Truthful Utility Validation",
        industry: "B2B software",
      }),
      result,
      input,
    });
  } finally {
    console.log = originalLog;
    console.info = originalInfo;
  }
  const old = translateProductUnderstanding({
    organizationId,
    result,
    runtime,
  });
  return {
    name: scenario.name,
    result,
    runtime,
    old,
    utility: optimizeTruthfulUtility({
      organizationId,
      result,
      runtime,
      understanding: old,
    }),
  };
}

function utilityStrings(utility: ProductUtility): string[] {
  return [
    utility.immediateInsight?.statement ?? "",
    utility.immediateInsight?.basis ?? "",
    ...utility.likelyExplanations.flatMap((item) => [
      item.statement,
      item.basis,
    ]),
    ...utility.alternativeExplanations.flatMap((item) => [
      item.statement,
      item.basis,
    ]),
    ...utility.whyDiscoveryThinksThis.flatMap((item) => [
      item.statement,
      item.basis,
    ]),
    ...utility.decisionImplications.flatMap((item) => [
      item.statement,
      item.basis,
    ]),
    utility.investigateNext?.label ?? "",
    utility.investigateNext?.whyItHelps ?? "",
    ...utility.watchNext.flatMap((item) => [
      item.label,
      item.whyItMatters,
    ]),
    ...utility.evidenceStrength.stillWeak,
    utility.confidence.label,
    utility.confidence.explanation,
  ];
}

function usefulness(understanding: ProductUnderstanding): number {
  return [
    understanding.status !== "insufficient",
    understanding.supportedFindings.length > 0,
    understanding.candidateExplanations.length > 0,
    understanding.nextEvidence.length > 0,
    understanding.confidence.state !== "unavailable",
  ].filter(Boolean).length;
}

function utilityUsefulness(utility: ProductUtility): number {
  return [
    utility.status !== "insufficient",
    Boolean(utility.immediateInsight),
    utility.whyDiscoveryThinksThis.length > 0,
    utility.likelyExplanations.length +
      utility.alternativeExplanations.length >
      0,
    utility.decisionImplications.length > 0,
    Boolean(utility.investigateNext),
    utility.watchNext.length > 0,
    utility.evidenceStrength.alreadyStrong.length > 0,
    utility.evidenceStrength.stillWeak.length > 0,
    utility.confidence.state !== "unavailable",
  ].filter(Boolean).length;
}

function assertNoDomainUtility(comparison: Comparison): void {
  assert.equal(
    comparison.utility.decisionImplications.length,
    0,
    `${comparison.name} must not synthesize a decision implication`,
  );
  assert.equal(
    comparison.utility.watchNext.length,
    0,
    `${comparison.name} must not synthesize domain watch signals`,
  );
  assert.deepEqual(
    comparison.utility.understanding,
    comparison.old,
    `${comparison.name} must retain conservative prior translation`,
  );
}

function assertLineage(
  utility: ProductUtility,
  result: DiscoveryV3Result,
): void {
  const evidenceIds = new Set(result.evidence.map((item) => item.id));
  const observationIds = new Set(result.observations.map((item) => item.id));
  const claims = [
    ...(utility.immediateInsight ? [utility.immediateInsight] : []),
    ...utility.likelyExplanations,
    ...utility.alternativeExplanations,
    ...utility.whyDiscoveryThinksThis,
    ...utility.decisionImplications,
  ];
  for (const claim of claims) {
    assert.ok(claim.lineage.evidenceIds.length > 0);
    assert.ok(claim.lineage.evidenceIds.every((id) => evidenceIds.has(id)));
    assert.ok(
      claim.lineage.observationIds.every((id) => observationIds.has(id)),
    );
  }
}

const comparisons = scenarios.map(compareScenario);

for (const comparison of comparisons) {
  const strings = utilityStrings(comparison.utility);
  assert.notEqual(comparison.utility.status, "insufficient");
  assert.ok(comparison.utility.immediateInsight);
  assert.equal(
    comparison.utility.decisionImplications.length,
    1,
    `${comparison.name} must expose one bounded decision implication; admitted: ${comparison.utility.whyDiscoveryThinksThis.map((item) => item.statement).join(" | ")}`,
  );
  assert.equal(
    comparison.utility.investigateNext?.priority,
    "highest-value",
  );
  assert.ok(
    comparison.utility.evidenceStrength.stillWeak.length > 0,
    `${comparison.name} must disclose unresolved uncertainty`,
  );
  assert.deepEqual(
    comparison.utility.confidence,
    comparison.old.confidence,
    `${comparison.name} must preserve the original confidence object`,
  );
  assert.ok(
    utilityUsefulness(comparison.utility) > usefulness(comparison.old),
    `${comparison.name} must improve useful product communication`,
  );
  assert.ok(
    strings.every(
      (value) => !productUnderstandingInternalVocabulary.test(value),
    ),
    `${comparison.name} must not expose internal cognition terminology`,
  );
  assert.ok(
    strings.every(
      (value) =>
        !/\b(?:caused by|root cause is|primary cause is|definitely|certainly)\b/i.test(
          value,
        ),
    ),
    `${comparison.name} must preserve causal restraint`,
  );
  assert.ok(
    strings.every(
      (value) => !/\b\d+(?:\.\d+)?%\s+confidence\b/i.test(value),
    ),
    `${comparison.name} must not fabricate numeric confidence`,
  );
  assertLineage(comparison.utility, comparison.result);

  const sourceScenario =
    scenarios.find((scenario) => scenario.name === comparison.name)!;
  const rerun = compareScenario(sourceScenario);
  assert.deepEqual(
    rerun.utility,
    comparison.utility,
    `${comparison.name} must remain deterministic`,
  );
  const reordered = optimizeTruthfulUtility({
    organizationId: comparison.runtime.metadata.organizationId,
    runtime: comparison.runtime,
    result: {
      ...comparison.result,
      evidence: [...comparison.result.evidence].reverse(),
      observations: [...comparison.result.observations].reverse(),
      contradictions: [...comparison.result.contradictions].reverse(),
    },
    understanding: comparison.old,
  });
  assert.deepEqual(
    reordered,
    comparison.utility,
    `${comparison.name} must be stable under equivalent evidence ordering`,
  );
  assert.throws(
    () =>
      optimizeTruthfulUtility({
        organizationId: "onb-dev-wrong-organization",
        runtime: comparison.runtime,
        result: comparison.result,
        understanding: comparison.old,
      }),
    /organization mismatch/,
  );
}

const paraphraseCases: Scenario[] = [
  {
    name: "sales paraphrase outreach",
    question: "Why is sales performance weakening?",
    observations: [
      "Incentive compensation rose.",
      "Representatives made more outreach.",
      "Win percentage fell.",
    ],
  },
  {
    name: "sales paraphrase opportunity time",
    question: "Why are sales slowing?",
    observations: [
      "Sales effort increased.",
      "Opportunities took longer to close.",
    ],
  },
  {
    name: "sales paraphrase conversion",
    question: "Why is revenue growth slowing?",
    observations: ["Commissions rose.", "Conversion dropped."],
  },
  {
    name: "execution paraphrase dependencies",
    question: "Why is project delivery late?",
    observations: [
      "Committed work finishes later.",
      "Dependencies wait unresolved.",
    ],
  },
  {
    name: "execution paraphrase cycle time",
    question: "Why are projects delayed?",
    observations: [
      "Project cycle time increased.",
      "Approval waiting grew longer.",
    ],
  },
  {
    name: "execution paraphrase handoffs",
    question: "Why are release deadlines slipping?",
    observations: [
      "Release deadlines were missed.",
      "Handoff delays increased.",
    ],
  },
  {
    name: "hiring paraphrase openings",
    question: "Why is hiring capacity constrained?",
    observations: [
      "Approved openings increased.",
      "Time to fill roles lengthened.",
      "Teams remained understaffed.",
    ],
  },
  {
    name: "hiring paraphrase recruiting",
    question: "Why is hiring falling behind?",
    observations: ["Open roles rose.", "Recruiting slowed."],
  },
  {
    name: "hiring paraphrase workload",
    question: "Why is staffing capacity constrained?",
    observations: [
      "Workload exceeded capacity.",
      "Hiring took longer.",
    ],
  },
  {
    name: "decision paraphrase signoffs",
    question: "Why do approvals take longer?",
    observations: [
      "Approvals require more elapsed time.",
      "Additional signoffs are now required.",
    ],
  },
  {
    name: "decision paraphrase executive review",
    question: "Where are decisions getting stuck?",
    observations: [
      "Decision delays increased.",
      "Executive signoffs are required.",
    ],
  },
  {
    name: "decision paraphrase escalation",
    question: "Why is decision authority slowing work?",
    observations: [
      "Approval waiting grew longer.",
      "Escalations increased.",
    ],
  },
  {
    name: "retention paraphrase complaints",
    question: "Why are renewals weakening?",
    observations: [
      "Renewals declined.",
      "Customer complaints increased.",
    ],
  },
  {
    name: "retention paraphrase usage",
    question: "Why is customer churn increasing?",
    observations: ["Churn increased.", "Product usage dropped."],
  },
  {
    name: "retention paraphrase cancellations",
    question: "Why is customer retention weakening?",
    observations: [
      "Customer retention weakened.",
      "Cancellation reasons changed.",
    ],
  },
];

const paraphraseComparisons = paraphraseCases.map(compareScenario);
for (const comparison of paraphraseComparisons) {
  if (comparison.utility.decisionImplications.length > 0) {
    assert.notEqual(comparison.utility.status, "insufficient");
    assert.equal(comparison.utility.decisionImplications.length, 1);
    assertLineage(comparison.utility, comparison.result);
  } else {
    assert.deepEqual(
      comparison.utility.understanding,
      comparison.old,
      `${comparison.name} must fail closed when canonical product admission does not expose both roles`,
    );
  }
}
const paraphraseRecoveryCount = paraphraseComparisons.filter(
  (comparison) => comparison.utility.decisionImplications.length === 1
).length;
assert.ok(
  paraphraseRecoveryCount > 0,
  "Independent paraphrase recovery must be measured rather than assumed.",
);

const nearMissCases: Scenario[] = [
  { name: "sales near miss picnic", question: "Why are sales slowing?", observations: ["Sales activity increased at the company picnic.", "Close rates refer to store closing schedules."] },
  { name: "sales near miss software", question: "Why are sales slowing?", observations: ["The software deployment pipeline increased capacity.", "The release close rate declined."] },
  { name: "sales near miss vocabulary", question: "Why are sales slowing?", observations: ["The sales team closed the office later.", "Activity increased in the volunteer program."] },
  { name: "execution near miss picnic", question: "Why is project delivery late?", observations: ["The project was a company picnic.", "Approval was applause for the speaker."] },
  { name: "execution near miss software", question: "Why is delivery delayed?", observations: ["The software deployment pipeline was renamed.", "The release branch waits for tests."] },
  { name: "execution near miss schedule", question: "Why are deadlines missed?", observations: ["The store closing schedule changed.", "A handoff was a football exercise."] },
  { name: "hiring near miss consultant", question: "Why is hiring constrained?", observations: ["Hiring a consultant took longer than expected."] },
  { name: "hiring near miss equipment", question: "Why is capacity constrained?", observations: ["The machine workload increased.", "A candidate key was rotated."] },
  { name: "hiring near miss article", question: "Why are open roles increasing?", observations: ["The plan assumes hiring time will increase.", "A role opened in a stage play."] },
  { name: "decision near miss survey", question: "Why are decisions delayed?", observations: ["What is your decision time in the customer survey?", "The approval rating increased."] },
  { name: "decision near miss game", question: "Why are approvals slower?", observations: ["The referee decision took longer.", "A sign-off was printed on a poster."] },
  { name: "decision near miss hypothetical", question: "Where are decisions stuck?", observations: ["Leadership asked whether approval time increased.", "A consultant hypothesized that escalation may rise."] },
  { name: "retention near miss documents", question: "Why is retention declining?", observations: ["The document retention policy changed.", "Records retention increased to seven years."] },
  { name: "retention near miss employee", question: "Why is customer retention declining?", observations: ["Employee retention improved.", "The customer support archive grew."] },
  { name: "retention near miss storage", question: "Why are renewals declining?", observations: ["Data retention decreased.", "A software cancellation token changed."] },
];

for (const scenario of nearMissCases) {
  assertNoDomainUtility(compareScenario(scenario));
}

const negationAndReversalCases: Scenario[] = [
  {
    name: "sales negation",
    question: "Why are sales slowing?",
    observations: [
      "Commissions did not increase.",
      "Close rates did not decline.",
    ],
  },
  {
    name: "sales reversal",
    question: "Why are sales slowing?",
    observations: [
      "Sales activity increased.",
      "Sales cycles shortened.",
    ],
  },
  {
    name: "retention reversal",
    question: "Why is customer retention changing?",
    observations: [
      "Customer retention improved.",
      "Customer complaints decreased.",
    ],
  },
  {
    name: "decision reversal",
    question: "Why is decision time changing?",
    observations: [
      "Approval time decreased.",
      "Escalations decreased.",
    ],
  },
];
for (const scenario of negationAndReversalCases) {
  assertNoDomainUtility(compareScenario(scenario));
}

const hypotheticalCases: Scenario[] = [
  {
    name: "sales hypothetical",
    question: "Why are sales slowing?",
    observations: [
      "Leadership asked whether sales activity increased.",
      "A consultant hypothesized that conversion may decline.",
    ],
  },
  {
    name: "hiring plan",
    question: "Why is hiring capacity constrained?",
    observations: [
      "The plan assumes open roles will increase.",
      "Hiring time is expected to increase.",
    ],
  },
  {
    name: "retention hypothesis",
    question: "Why is customer retention changing?",
    observations: [
      "A consultant hypothesized that retention may decline.",
      "Customer complaints could increase.",
    ],
  },
];
for (const scenario of hypotheticalCases) {
  assertNoDomainUtility(compareScenario(scenario));
}

assertNoDomainUtility(compareScenario({
  name: "cross-domain collision",
  question: "How are sales, hiring, decisions, delivery, and retention changing?",
  observations: [
    "Sales activity increased.",
    "Open roles increased.",
    "Approval waiting increased.",
    "Customer complaints increased.",
  ],
}));

const unknownDomain = compareScenario({
  name: "unknown domain",
  question: "Why is supplier quality becoming less predictable?",
  observations: [
    "Three supplier inspections failed this month.",
    "Material substitutions increased from 2 to 7.",
  ],
});
assertNoDomainUtility(unknownDomain);

const negative = compareScenario({
  name: "negative control",
  question: "Why are sales slowing?",
  observations: ["Sales are bad."],
});
assert.equal(negative.old.status, "insufficient");
assert.equal(negative.utility.status, "insufficient");
assert.equal(negative.utility.decisionImplications.length, 0);
assert.equal(negative.utility.watchNext.length, 0);
assert.equal(negative.utility.confidence.state, "unavailable");

const unrelated = compareScenario({
  name: "unrelated control",
  question: "Why are sales slowing?",
  observations: [
    "Office attendance increased 20%.",
    "Meeting duration increased from 30 minutes to 45 minutes.",
  ],
});
assert.equal(unrelated.utility.status, "insufficient");
assert.equal(unrelated.utility.decisionImplications.length, 0);

console.table(
  comparisons.map((comparison) => ({
    scenario: comparison.name,
    oldStatus: comparison.old.status,
    utilityStatus: comparison.utility.status,
    oldStructuralProxy: usefulness(comparison.old),
    utilityStructuralProxy: utilityUsefulness(comparison.utility),
    confidence: comparison.utility.confidence.state,
  })),
);
console.table(
  ["sales", "execution", "hiring", "decision", "retention"].map((domain) => {
    const domainCases = paraphraseComparisons.filter((comparison) =>
      comparison.name.startsWith(`${domain} `)
    );
    return {
      domain,
      recovered: domainCases.filter((comparison) =>
        comparison.utility.decisionImplications.length === 1
      ).length,
      attempted: domainCases.length,
    };
  }),
);
console.info(JSON.stringify({
  liveProductReview: [
    comparisons[0],
    comparisons[2],
    comparisons[3],
    comparisons[4],
    unknownDomain,
  ].map((comparison) => ({
    scenario: comparison.name,
    status: comparison.utility.status,
    immediateInsight: comparison.utility.immediateInsight?.statement ?? null,
    evidenceBasis: comparison.utility.whyDiscoveryThinksThis.map((item) =>
      item.statement
    ),
    alternatives: comparison.utility.alternativeExplanations.map((item) =>
      item.statement
    ),
    decisionImplication:
      comparison.utility.decisionImplications[0]?.statement ?? null,
    highestValueNextStep: comparison.utility.investigateNext?.label ?? null,
    confidence: comparison.utility.confidence.state,
    boundedUtilityAdded:
      comparison.utility.decisionImplications.length > 0,
  })),
}, null, 2));
console.info(
  `Truthful utility validation passed: exact grammar ${comparisons.length}/${comparisons.length}; independent paraphrases ${paraphraseRecoveryCount}/${paraphraseCases.length}; near-miss precision ${nearMissCases.length}/${nearMissCases.length}; negation/reversal ${negationAndReversalCases.length}/${negationAndReversalCases.length}; hypotheses ${hypotheticalCases.length}/${hypotheticalCases.length}; cross-domain precision 1/1. Structural proxy scores are deterministic coverage indicators, not measured user utility.`,
);
