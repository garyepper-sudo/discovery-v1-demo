import {
  buildExecutiveStory,
} from "../../v3/communication/buildExecutiveStory";

import {
  synthesizeExecutiveCommunication,
} from "../../v3/communication/synthesizeExecutiveCommunication";

import type {
  ExecutiveCommunicationSource,
} from "../../v3/communication/executiveCommunicationSource";

const ORGANIZATION_ID =
  "atlas-manufacturing-simulation";

const GENERATED_AT =
  "2026-07-14T12:00:00.000Z";

const PRIMARY_CONSTRAINT_ID =
  "condition-strategicalignment";

const PRIMARY_CONSTRAINT_TITLE =
  "Strategic Alignment";

const WINNING_STRATEGY_ID =
  "intervention-clarify-decision-ownership";

const WINNING_STRATEGY_TITLE =
  "Clarify decision ownership";

const RUNNER_UP_TITLE =
  "Reduce concurrent work";

const THIRD_STRATEGY_TITLE =
  "Remove one approval layer";

const OPTIMIZATION_OBJECTIVE_ID =
  "executive-optimization-objective-canonical-communication";

const NEXT_EVIDENCE_QUESTION =
  "Which recurring decisions generate the most avoidable escalation and waiting?";

const MAXIMUM_NARRATIVE_WORDS =
  180;

type Check = {
  name: string;

  passed: boolean;

  detail: string;
};

function normalizeText(
  value: string,
): string {
  return value
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(
  value: string,
): number {
  const normalized =
    normalizeText(value);

  if (!normalized) {
    return 0;
  }

  return normalized
    .split(/\s+/)
    .length;
}

function sentenceList(
  value: string,
): string[] {
  const normalized =
    normalizeText(value);

  if (!normalized) {
    return [];
  }

  return (
    normalized.match(
      /[^.!?]+[.!?]+|[^.!?]+$/g,
    ) ?? []
  )
    .map(
      (sentence) =>
        normalizeText(sentence),
    )
    .filter(
      (sentence) =>
        sentence.length > 0,
    );
}

function normalizedSentenceKey(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function duplicateSentences(
  value: string,
): string[] {
  const seen =
    new Set<string>();

  const duplicates =
    new Set<string>();

  for (
    const sentence of
    sentenceList(value)
  ) {
    const key =
      normalizedSentenceKey(
        sentence,
      );

    if (!key) {
      continue;
    }

    if (seen.has(key)) {
      duplicates.add(sentence);
    } else {
      seen.add(key);
    }
  }

  return [
    ...duplicates,
  ];
}

function containsText(
  value: string,
  expected: string,
): boolean {
  return value
    .toLowerCase()
    .includes(
      expected.toLowerCase(),
    );
}

const canonicalSource = {
  organizationId:
    ORGANIZATION_ID,

  executiveAssessment: {
    organizationId:
      ORGANIZATION_ID,

    summary:
      "Strategic Alignment is currently the primary condition shaping organizational performance.",

    executiveNarrative:
      "Strategic Alignment is deteriorating because teams are operating from inconsistent priorities and unclear decision boundaries.",

    confidence:
      0.8,

    primaryExecutiveConstraint: {
      id:
        "primary-executive-constraint-strategic-alignment",

      conditionId:
        PRIMARY_CONSTRAINT_ID,

      title:
        PRIMARY_CONSTRAINT_TITLE,

      executiveSummary:
        "Teams are making inconsistent tradeoffs because priorities and decision ownership are not sufficiently clear.",

      whyNow:
        "Strategic misalignment is increasing escalation, rework, and execution drift.",

      expectedExecutiveImpact:
        "Improved strategic alignment should reduce escalation and improve execution capacity.",

      confidence:
        0.8,
    },

    primaryJudgment: {
      dominantConditionId:
        PRIMARY_CONSTRAINT_ID,

      headline:
        PRIMARY_CONSTRAINT_TITLE,

      executiveJudgment:
        "Strategic Alignment is the organization's highest-leverage current constraint.",

      confidence:
        0.8,
    },

    supportingMechanisms: [
      {
        label:
          "Priority Conflict",

        rationale:
          "Competing priorities are causing teams to make inconsistent operating tradeoffs.",
      },

      {
        label:
          "Decision Latency",

        rationale:
          "Unclear authority is increasing escalation and slowing recurring decisions.",
      },

      {
        label:
          "Governance Friction",

        rationale:
          "Approval dependencies are adding avoidable delay.",
      },
    ],

    theoryValidation: {
      supportingMechanisms: [
        {
          label:
            "Priority Conflict",

          rationale:
            "Competing priorities are causing teams to make inconsistent operating tradeoffs.",
        },

        {
          label:
            "Decision Latency",

          rationale:
            "Unclear authority is increasing escalation and slowing recurring decisions.",
        },

        {
          label:
            "Governance Friction",

          rationale:
            "Approval dependencies are adding avoidable delay.",
        },
      ],
    },
  },

  executiveRecommendation: {
    id:
      "executive-recommendation-canonical-communication",

    organizationId:
      ORGANIZATION_ID,

    headline:
      WINNING_STRATEGY_TITLE,

    status:
      "investigate-further",

    recommendedInterventionId:
      WINNING_STRATEGY_ID,

    primaryConstraintId:
      PRIMARY_CONSTRAINT_ID,

    primaryConstraintTitle:
      PRIMARY_CONSTRAINT_TITLE,

    optimizationObjectiveId:
      OPTIMIZATION_OBJECTIVE_ID,

    optimizationObjective:
      "Improve Strategic Alignment while remaining budget neutral and avoiding increased organizational risk.",

    rationale:
      "Clarifying decision ownership directly addresses strategic ambiguity without increasing headcount or adding governance complexity.",

    whyRecommended: [
      "Clarifying decision ownership produced the greatest expected organizational improvement under the current constraints.",

      "It ranked ahead of the alternatives because it addresses the primary constraint while preserving execution capacity.",

      "The intervention remains budget neutral and does not require additional headcount.",
    ],

    expectedBenefits: [
      "Clearer decision ownership is expected to reduce escalation, improve strategic alignment, and increase execution capacity.",
    ],

    confidence:
      0.8,

    intervention: {
      id:
        WINNING_STRATEGY_ID,

      executiveIntervention:
        WINNING_STRATEGY_TITLE,

      supportingActions: [
        "Map recurring operating decisions to accountable owners.",

        "Define the conditions that require executive escalation.",

        "Review decision-cycle time after implementation.",
      ],
    },

    recommendedStrategy: {
      id:
        WINNING_STRATEGY_ID,

      title:
        WINNING_STRATEGY_TITLE,

      targetConditionIds: [
        PRIMARY_CONSTRAINT_ID,
        "condition-decisionflow",
        "condition-leadershipdependency",
      ],
    },
  },

  organizationalState: {
    organizationId:
      ORGANIZATION_ID,

    status:
      "critical",

    summary:
      "The organization remains operational, but inconsistent priorities and unclear authority are reducing execution reliability.",

    executiveImplication:
      "Without intervention, leadership dependency, escalation, and execution drift are likely to increase.",

    confidence:
      0.8,

    recommendedFocus: [
      PRIMARY_CONSTRAINT_TITLE,
      "Decision Flow",
      "Leadership Dependency",
    ],
  },

  organizationalConditions: [
    {
      id:
        PRIMARY_CONSTRAINT_ID,

      name:
        PRIMARY_CONSTRAINT_TITLE,

      domain:
        "strategy",

      status:
        "deteriorating",

      priority:
        "critical",

      confidence:
        0.8,

      strength:
        0.84,

      trend:
        "strengthening",

      summary:
        "Teams are operating from inconsistent priorities and interpretations of what matters most.",

      whyItMatters:
        "Misaligned priorities are increasing escalation, rework, and execution drift.",

      recommendedExecutiveAction:
        "Clarify decision ownership and reinforce shared strategic priorities.",

      supportingConceptIds:
        [],

      supportingBeliefIds:
        [],

      supportingMechanismIds: [
        "mechanism:priorityConflict",
        "mechanism:decisionLatency",
        "mechanism:governanceFriction",
      ],

      supportingTheoryIds:
        [],

      upstreamConditionIds:
        [],

      downstreamConditionIds: [
        "condition-decisionflow",
        "condition-executioncapacity",
      ],

      lastUpdatedAt:
        GENERATED_AT,
    },

    {
      id:
        "condition-decisionflow",

      name:
        "Decision Flow",

      domain:
        "execution",

      status:
        "deteriorating",

      priority:
        "high",

      confidence:
        0.76,

      strength:
        0.73,

      trend:
        "stable",

      summary:
        "Important operating decisions continue to require avoidable escalation.",

      whyItMatters:
        "Decision delay reduces execution throughput and increases leadership dependency.",

      recommendedExecutiveAction:
        "Define recurring decision rights and escalation boundaries.",

      supportingConceptIds:
        [],

      supportingBeliefIds:
        [],

      supportingMechanismIds: [
        "mechanism:decisionLatency",
      ],

      supportingTheoryIds:
        [],

      upstreamConditionIds: [
        PRIMARY_CONSTRAINT_ID,
      ],

      downstreamConditionIds: [
        "condition-executioncapacity",
      ],

      lastUpdatedAt:
        GENERATED_AT,
    },

    {
      id:
        "condition-executioncapacity",

      name:
        "Execution Capacity",

      domain:
        "execution",

      status:
        "deteriorating",

      priority:
        "high",

      confidence:
        0.72,

      strength:
        0.76,

      trend:
        "stable",

      summary:
        "Execution capacity is being reduced by escalation, priority conflict, and operating delay.",

      whyItMatters:
        "The organization is producing less reliable execution without adding productive capacity.",

      recommendedExecutiveAction:
        "Reduce avoidable operating friction before adding more work.",

      supportingConceptIds:
        [],

      supportingBeliefIds:
        [],

      supportingMechanismIds: [
        "mechanism:priorityConflict",
        "mechanism:decisionLatency",
      ],

      supportingTheoryIds:
        [],

      upstreamConditionIds: [
        PRIMARY_CONSTRAINT_ID,
        "condition-decisionflow",
      ],

      downstreamConditionIds:
        [],

      lastUpdatedAt:
        GENERATED_AT,
    },
  ],

  organizationalPredictions: [
    {
      id:
        "prediction-strategic-alignment-deterioration",

      statement:
        "Strategic Alignment is at risk of further deterioration without intervention.",

      confidence:
        0.74,

      likelihood:
        0.78,
    },
  ],

  predictionReflection: {
    confidenceLimiters: [
      "Discovery has limited longitudinal evidence showing whether decision ambiguity is persistent across operating cycles.",
    ],
  },

  organizationalLearningProfile: {
    learningVelocity:
      "moderate",

    knowledgeRetention:
      0.72,

    beliefStability:
      0.81,

    summary:
      "Understanding is becoming more stable, but longitudinal decision evidence remains incomplete.",
  },

  organizationalUncertainty: {
    overallUncertainty:
      0.2,

    status:
      "moderate",

    confidenceLimiters: [
      "Current decision authority has not yet been fully mapped.",
    ],

    recommendedEvidenceAreas: [
      "Decision-cycle-time evidence before and after ownership clarification.",
    ],
  },

  investigationOpportunities: [
    {
      id:
        "investigation-decision-authority",

      topic:
        "Decision Authority",

      suggestedExecutiveQuestion:
        NEXT_EVIDENCE_QUESTION,

      expectedConfidenceGain:
        14,

      affectedConditions: [
        PRIMARY_CONSTRAINT_TITLE,
        "Decision Flow",
        "Leadership Dependency",
      ],
    },
  ],

  executiveOptimization: {
    optimizationObjective: {
      id:
        OPTIMIZATION_OBJECTIVE_ID,

      summary:
        "Improve Strategic Alignment by selecting the intervention with the greatest expected organizational improvement under current constraints.",
    },

    primaryExecutiveConstraint: {
      id:
        "primary-executive-constraint-strategic-alignment",

      conditionId:
        PRIMARY_CONSTRAINT_ID,

      title:
        PRIMARY_CONSTRAINT_TITLE,

      executiveSummary:
        "Teams are making inconsistent tradeoffs because priorities and decision ownership are not sufficiently clear.",

      whyNow:
        "Strategic misalignment is increasing escalation, rework, and execution drift.",

      expectedExecutiveImpact:
        "Improved strategic alignment should reduce escalation and improve execution capacity.",
    },
  },

  executiveSimulation: {
    confidence:
      0.8,

    timeHorizon:
      "near-term",

    executiveSummary:
      "Clarifying decision ownership is expected to improve Strategic Alignment, Decision Flow, and Execution Capacity.",

    rankedScenarios: [
      {
        id:
          "ranked-scenario-clarify-decision-ownership",

        optionId:
          "intervention-option-clarify-decision-ownership",

        interventionId:
          WINNING_STRATEGY_ID,

        interventionTitle:
          WINNING_STRATEGY_TITLE,

        rank:
          1,

        reasonsForRank: [
          "Clarifying decision ownership produced the strongest expected improvement against Strategic Alignment.",
        ],
      },

      {
        id:
          "ranked-scenario-reduce-concurrent-work",

        optionId:
          "intervention-option-reduce-concurrent-work",

        interventionId:
          "intervention-reduce-concurrent-work",

        interventionTitle:
          RUNNER_UP_TITLE,

        rank:
          2,

        reasonsForRank: [
          "Reducing concurrent work improved execution capacity but left decision ambiguity partially unresolved.",
        ],
      },

      {
        id:
          "ranked-scenario-remove-approval-layer",

        optionId:
          "intervention-option-remove-approval-layer",

        interventionId:
          "intervention-remove-approval-layer",

        interventionTitle:
          THIRD_STRATEGY_TITLE,

        rank:
          3,

        reasonsForRank: [
          "Removing one approval layer reduced delay but created greater governance risk.",
        ],
      },
    ],
  },

  generatedAt:
    GENERATED_AT,
} as unknown as ExecutiveCommunicationSource;

const sourceSnapshotBefore =
  JSON.stringify(
    canonicalSource,
  );

const story =
  buildExecutiveStory(
    canonicalSource,
  );

const repeatedStory =
  buildExecutiveStory(
    canonicalSource,
  );

const communication =
  synthesizeExecutiveCommunication({
    source:
      canonicalSource,

    generatedAt:
      GENERATED_AT,
  });

const repeatedCommunication =
  synthesizeExecutiveCommunication({
    source:
      canonicalSource,

    generatedAt:
      GENERATED_AT,
  });

const sourceSnapshotAfter =
  JSON.stringify(
    canonicalSource,
  );

const narrativeWordCount =
  wordCount(
    story.narrative,
  );

const repeatedSentences =
  duplicateSentences(
    story.narrative,
  );

const alternativeStrategies =
  story.strategies.filter(
    (strategy) =>
      !strategy.selected,
  );

const selectedStrategies =
  story.strategies.filter(
    (strategy) =>
      strategy.selected,
  );

const checks: Check[] = [
  {
    name:
      "Canonical Executive Story created",

    passed:
      story.narrative.trim().length >
      0,

    detail:
      `${narrativeWordCount} word(s)`,
  },

  {
    name:
      "Exactly one primary constraint preserved",

    passed:
      story.primaryConstraint.id ===
        PRIMARY_CONSTRAINT_ID &&
      story.primaryConstraint.title ===
        PRIMARY_CONSTRAINT_TITLE,

    detail:
      `${story.primaryConstraint.title} · ${story.primaryConstraint.id ?? "none"}`,
  },

  {
    name:
      "Optimization objective preserved",

    passed:
      story.optimizationObjective
        ?.id ===
      OPTIMIZATION_OBJECTIVE_ID,

    detail:
      story.optimizationObjective
        ?.summary ??
      "No optimization objective.",
  },

  {
    name:
      "Three strategies preserved",

    passed:
      story.strategies.length ===
      3,

    detail:
      story.strategies
        .map(
          (strategy) =>
            `${strategy.rank}. ${strategy.title}`,
        )
        .join(" | "),
  },

  {
    name:
      "Exactly one winning strategy preserved",

    passed:
      selectedStrategies.length ===
        1 &&
      selectedStrategies[0]
        ?.title ===
        WINNING_STRATEGY_TITLE,

    detail:
      selectedStrategies[0]
        ?.title ??
      "No selected strategy.",
  },

  {
    name:
      "Alternative strategies preserved",

    passed:
      alternativeStrategies.length ===
        2 &&
      alternativeStrategies.some(
        (strategy) =>
          strategy.title ===
          RUNNER_UP_TITLE,
      ) &&
      alternativeStrategies.some(
        (strategy) =>
          strategy.title ===
          THIRD_STRATEGY_TITLE,
      ),

    detail:
      alternativeStrategies
        .map(
          (strategy) =>
            strategy.title,
        )
        .join(", "),
  },

  {
    name:
      "Comparative advantage created",

    passed:
      Boolean(
        story.recommendation
          .comparativeAdvantage,
      ),

    detail:
      story.recommendation
        .comparativeAdvantage ??
      "No comparative advantage.",
  },

  {
    name:
      "Expected outcome created",

    passed:
      story.expectedOutcome
        .trim().length > 0 &&
      containsText(
        story.expectedOutcome,
        "Strategic Alignment",
      ),

    detail:
      story.expectedOutcome,
  },

  {
    name:
      "Confidence summary created",

    passed:
      story.confidence.score ===
        80 &&
      story.confidence.summary
        .trim().length > 0 &&
      story.confidence.limitations
        .length > 0,

    detail:
      story.confidence.summary,
  },

  {
    name:
      "Highest-value next evidence preserved",

    passed:
      story.nextEvidence
        ?.question ===
        NEXT_EVIDENCE_QUESTION &&
      story.nextEvidence
        ?.expectedConfidenceGain ===
        14,

    detail:
      story.nextEvidence
        ? `${story.nextEvidence.question} · +${story.nextEvidence.expectedConfidenceGain ?? 0}%`
        : "No next evidence.",
  },

  {
    name:
      "Narrative includes primary constraint",

    passed:
      containsText(
        story.narrative,
        PRIMARY_CONSTRAINT_TITLE,
      ),

    detail:
      PRIMARY_CONSTRAINT_TITLE,
  },

  {
    name:
      "Narrative includes winning strategy",

    passed:
      containsText(
        story.narrative,
        WINNING_STRATEGY_TITLE,
      ),

    detail:
      WINNING_STRATEGY_TITLE,
  },

  {
    name:
      "Narrative includes an alternative",

    passed:
      containsText(
        story.narrative,
        RUNNER_UP_TITLE,
      ) ||
      containsText(
        story.narrative,
        THIRD_STRATEGY_TITLE,
      ),

    detail:
      `${RUNNER_UP_TITLE} or ${THIRD_STRATEGY_TITLE}`,
  },

  {
    name:
      "Narrative includes confidence",

    passed:
      containsText(
        story.narrative,
        "80%",
      ),

    detail:
      story.confidence.summary,
  },

  {
    name:
      "Narrative includes next evidence",

    passed:
      containsText(
        story.narrative,
        NEXT_EVIDENCE_QUESTION,
      ),

    detail:
      NEXT_EVIDENCE_QUESTION,
  },

  {
    name:
      "Narrative remains concise",

    passed:
      narrativeWordCount <=
      MAXIMUM_NARRATIVE_WORDS,

    detail:
      `${narrativeWordCount}/${MAXIMUM_NARRATIVE_WORDS} words`,
  },

  {
    name:
      "Narrative contains no duplicate sentences",

    passed:
      repeatedSentences.length ===
      0,

    detail:
      repeatedSentences.length === 0
        ? "No duplicate sentences."
        : repeatedSentences.join(
            " | ",
          ),
  },

  {
    name:
      "Executive Story deterministic",

    passed:
      JSON.stringify(
        story,
      ) ===
      JSON.stringify(
        repeatedStory,
      ),

    detail:
      "Repeated synthesis produced an identical Executive Story.",
  },

  {
    name:
      "Canonical Executive Communication created",

    passed:
      communication.organizationId ===
        ORGANIZATION_ID &&
      communication.id.length > 0,

    detail:
      communication.id,
  },

  {
    name:
      "Executive Story survives into communication",

    passed:
      communication.executiveSummary ===
        story.narrative &&
      communication.recommendation
        .headline ===
        story.recommendation.title &&
      communication.forecast
        .headline ===
        story.expectedOutcome,

    detail:
      communication.executiveSummary,
  },

  {
    name:
      "Communication confidence normalized",

    passed:
      communication.confidence
        .value ===
        0.8 &&
      communication.forecast
        .confidence ===
        0.8,

    detail:
      `Judgment ${communication.confidence.value}; forecast ${communication.forecast.confidence}.`,
  },

  {
    name:
      "Communication deterministic",

    passed:
      JSON.stringify(
        communication,
      ) ===
      JSON.stringify(
        repeatedCommunication,
      ),

    detail:
      "Repeated synthesis produced identical Executive Communication.",
  },

  {
    name:
      "Canonical source remained unchanged",

    passed:
      sourceSnapshotBefore ===
      sourceSnapshotAfter,

    detail:
      sourceSnapshotBefore ===
      sourceSnapshotAfter
        ? "Canonical source not mutated."
        : "Canonical source changed.",
  },
];

const passed =
  checks.filter(
    (check) =>
      check.passed,
  ).length;

const failed =
  checks.length -
  passed;

console.log("");
console.log(
  "==========================================",
);
console.log(
  "DISCOVERY EXECUTIVE COMMUNICATION",
);
console.log(
  "Experiment 002",
);
console.log(
  "Canonical Executive Story",
);
console.log(
  "==========================================",
);
console.log("");

console.log(
  "Executive Story",
);
console.log(
  "------------------------------",
);
console.log(
  story.narrative,
);
console.log("");

console.log(
  "Strategy Comparison",
);
console.log(
  "------------------------------",
);

for (
  const strategy of
  story.strategies
) {
  console.log(
    `${strategy.selected ? "SELECTED" : "ALTERNATIVE"}  ${strategy.rank}. ${strategy.title}`,
  );

  console.log(
    `      ${strategy.rationale}`,
  );
}

console.log("");

console.log(
  "Assertions",
);
console.log(
  "------------------------------",
);

for (const check of checks) {
  console.log(
    `${check.passed ? "PASS" : "FAIL"}  ${check.name}`,
  );

  console.log(
    `      ${check.detail}`,
  );
}

console.log("");
console.log(
  `Passed: ${passed}`,
);
console.log(
  `Failed: ${failed}`,
);
console.log("");

if (failed > 0) {
  process.exitCode = 1;
}

console.log(
  "Experiment Complete",
);
console.log("");