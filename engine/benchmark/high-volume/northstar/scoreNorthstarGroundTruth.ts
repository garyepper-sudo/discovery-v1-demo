import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "./northstarCompanyFixture";

import {
  runCanonicalNorthstarGroundTruthReplay,
} from "./runCanonicalNorthstarGroundTruthReplay";

type GroundTruthDimension = {
  id: string;
  label: string;
  weight: number;

  positiveKeywordGroups: string[][];

  negativeKeywordGroups?: string[][];

  rationale: string;
};

type GroundTruthDimensionScore = {
  id: string;
  label: string;
  weight: number;
  score: number;
  matchedGroups: string[];
  missingGroups: string[];
  contradictoryMatches: string[];
  passed: boolean;
  rationale: string;
};

type FalsePositiveRule = {
  id: string;
  label: string;
  penalty: number;
  keywordGroups: string[][];
  allowedContextGroups?: string[][];
};

type FalsePositiveResult = {
  id: string;
  label: string;
  penalty: number;
  triggered: boolean;
  matchedGroups: string[];
};

type NorthstarGroundTruthScore = {
  organizationId: string;
  scoredAt: string;

  dimensionScore: number;
  falsePositivePenalty: number;
  calibrationPenalty: number;
  finalScore: number;

  executiveConfidence: number | null;

  dimensions: GroundTruthDimensionScore[];
  falsePositives: FalsePositiveResult[];

  conclusion: string;
};

type TextLike = {
  id?: string;
  name?: string;
  title?: string;
  label?: string;
  statement?: string;
  summary?: string;
  description?: string;
  rationale?: string;
  whyItMatters?: string;
  recommendedExecutiveAction?: string;
  executiveName?: string;
  executiveNarrative?: string;
  executiveRecommendation?: string;
};

type ExtendedMemory = {
  beliefs?: TextLike[];
  organizationalBeliefs?: TextLike[];
  theories?: TextLike[];

  organizationalConcepts?: TextLike[];
  semanticConcepts?: TextLike[];
  conceptualUnderstanding?: TextLike[];

  organizationalConditions?: TextLike[];

  organizationalState?: TextLike;

  mechanismNetwork?: {
    mechanisms?: TextLike[];
  };

  executiveAssessment?: TextLike & {
    recommendedFocus?: string[];

    primaryMechanismSummaries?: string[];

    organizationalUnderstanding?: TextLike & {
      confidence?: number;
      dominantTheory?: string;
      executiveRecommendation?: string;

      organizationalState?: TextLike;

      dominantCondition?: TextLike;
    };

    theoryValidation?: {
      dominantTheory?: string | null;
      whyDiscoveryBelievesIt?: string;
      calibratedConfidence?: number;
      calibratedConfidenceExplanation?: string;
      executiveRecommendation?: string;

      supportingMechanisms?: TextLike[];
      supportingOrganizationalBeliefs?: TextLike[];
      competingTheoriesConsidered?: TextLike[];
      contradictoryOrWeakeningEvidence?: TextLike[];
    };
  };

  organizationalMemory?: {
    beliefs?: TextLike[];
    theories?: TextLike[];
    organizationalConditions?: TextLike[];
    organizationalState?: TextLike;

    organizationalLearningProfile?: {
      learningVelocityScore?: number;
    };
  } | null;
};

const GROUND_TRUTH_DIMENSIONS:
  GroundTruthDimension[] = [
  {
    id:
      "concurrent-work",

    label:
      "Excessive concurrent work",

    weight:
      30,

    positiveKeywordGroups: [
      [
        "concurrent work",
        "too many projects",
        "too much work in progress",
        "work in progress",
        "wip",
      ],

      [
        "priority conflict",
        "priority overload",
        "competing priorities",
        "focus fragmentation",
        "execution demand exceeds",
      ],

      [
        "sequence work",
        "reduce active work",
        "reduce concurrent",
        "protect highest-leverage work",
      ],
    ],

    rationale:
      "The primary operating constraint is excessive concurrent work, which fragments focus and exceeds organizational execution capacity.",
  },

  {
    id:
      "decision-rights",

    label:
      "Weak decision rights",

    weight:
      25,

    positiveKeywordGroups: [
      [
        "decision rights",
        "decision authority",
        "unclear governance",
        "governance friction",
      ],

      [
        "approval bottleneck",
        "approval dependency",
        "centralized authority",
        "leadership dependency",
      ],

      [
        "clarify decision",
        "distribute authority",
        "reduce approval",
      ],
    ],

    rationale:
      "Unclear decision rights and approval dependency slow execution and push routine decisions upward.",
  },

  {
    id:
      "acquisition-fragmentation",

    label:
      "Acquisition fragmentation",

    weight:
      20,

    positiveKeywordGroups: [
      [
        "vector",
        "acquisition",
        "integration",
        "post-merger",
      ],

      [
        "fragmentation",
        "incompatible process",
        "systems integration",
        "operating model ambiguity",
        "knowledge continuity",
      ],

      [
        "integration failure",
        "organizational continuity failure",
        "continuity failure",
      ],
    ],

    rationale:
      "The Vector acquisition amplified fragmentation across systems, operating practices, knowledge, and leadership.",
  },

  {
    id:
      "staffing-not-root-cause",

    label:
      "Staffing is not the root cause",

    weight:
      15,

    positiveKeywordGroups: [
      [
        "capacity constraint",
        "execution capacity",
        "resource constraint",
      ],

      [
        "governance friction",
        "priority conflict",
        "coordination breakdown",
        "decision latency",
      ],

      [
        "without adding headcount",
        "avoid additional headcount",
        "staffing is not",
        "not a staffing",
        "hiring will not",
      ],
    ],

    negativeKeywordGroups: [
      [
        "hire more",
        "increase headcount",
        "add engineers",
        "add staff",
        "recruit more",
      ],
    ],

    rationale:
      "The apparent capacity problem is driven primarily by prioritization, governance, coordination, and concurrency rather than insufficient staffing.",
  },

  {
    id:
      "customer-escalation-symptom",

    label:
      "Customer escalation is downstream",

    weight:
      10,

    positiveKeywordGroups: [
      [
        "customer friction",
        "customer escalation",
        "strategic account risk",
        "delivery failure",
      ],

      [
        "downstream",
        "propagate",
        "caused by",
        "reinforced by",
        "execution capacity",
        "coordination system",
      ],
    ],

    rationale:
      "Customer escalations are an important consequence of operating-system failures, but not the primary root cause.",
  },
];

const FALSE_POSITIVE_RULES:
  FalsePositiveRule[] = [
  {
    id:
      "headcount-primary",

    label:
      "Recommends headcount as the primary intervention",

    penalty:
      12,

    keywordGroups: [
      [
        "hire more",
        "increase headcount",
        "add engineers",
        "add staff",
        "recruit more",
      ],
    ],

    allowedContextGroups: [
      [
        "avoid",
        "do not",
        "not the root cause",
        "without adding",
      ],
    ],
  },

  {
    id:
      "technology-replacement",

    label:
      "Recommends major technology replacement without causal support",

    penalty:
      6,

    keywordGroups: [
      [
        "replace erp",
        "new erp",
        "replace systems",
        "technology replacement",
      ],
    ],
  },

  {
    id:
      "leadership-removal",

    label:
      "Recommends leadership removal without causal support",

    penalty:
      8,

    keywordGroups: [
      [
        "replace leadership",
        "remove leadership",
        "fire leadership",
        "replace executives",
      ],
    ],
  },

  {
    id:
      "reorganization-primary",

    label:
      "Recommends broad reorganization as the primary intervention",

    penalty:
      6,

    keywordGroups: [
      [
        "reorganize departments",
        "full reorganization",
        "major reorganization",
        "restructure the company",
      ],
    ],
  },
];

function normalizeText(
  value:
    string,
): string {
  return value
    .toLowerCase()
    .replace(
      /[^a-z0-9\s-]/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
}

function collectText(
  value:
    unknown,
): string[] {
  if (
    value ===
      null ||
    value ===
      undefined
  ) {
    return [];
  }

  if (
    typeof value ===
      "string"
  ) {
    return [
      value,
    ];
  }

  if (
    Array.isArray(
      value,
    )
  ) {
    return value.flatMap(
      collectText,
    );
  }

  if (
    typeof value ===
      "object"
  ) {
    return Object.values(
      value as
        Record<
          string,
          unknown
        >,
    ).flatMap(
      collectText,
    );
  }

  return [];
}

function buildDiscoveryCorpus(
  memory:
    ExtendedMemory,
): string {
  const sources = [
    memory.beliefs,
    memory.organizationalBeliefs,
    memory.theories,
    memory.organizationalConcepts,
    memory.semanticConcepts,
    memory.conceptualUnderstanding,
    memory.organizationalConditions,
    memory.organizationalState,
    memory.mechanismNetwork
      ?.mechanisms,
    memory.executiveAssessment,
    memory.organizationalMemory
      ?.beliefs,
    memory.organizationalMemory
      ?.theories,
    memory.organizationalMemory
      ?.organizationalConditions,
    memory.organizationalMemory
      ?.organizationalState,
  ];

  return normalizeText(
    collectText(
      sources,
    ).join(
      " ",
    ),
  );
}

function groupLabel(
  group:
    string[],
): string {
  return group.join(
    " / ",
  );
}

function matchKeywordGroup(
  corpus:
    string,

  group:
    string[],
): boolean {
  return group.some(
    (keyword) =>
      corpus.includes(
        normalizeText(
          keyword,
        ),
      ),
  );
}

function scoreDimension(
  dimension:
    GroundTruthDimension,

  corpus:
    string,
): GroundTruthDimensionScore {
  const matchedGroups =
    dimension
      .positiveKeywordGroups
      .filter(
        (group) =>
          matchKeywordGroup(
            corpus,
            group,
          ),
      );

  const missingGroups =
    dimension
      .positiveKeywordGroups
      .filter(
        (group) =>
          !matchKeywordGroup(
            corpus,
            group,
          ),
      );

  const contradictoryMatches =
    (
      dimension
        .negativeKeywordGroups ??
      []
    )
      .filter(
        (group) =>
          matchKeywordGroup(
            corpus,
            group,
          ),
      );

  const positiveRatio =
    matchedGroups.length /
    dimension
      .positiveKeywordGroups
      .length;

  const contradictionFactor =
    contradictoryMatches.length >
      0
      ? 0.5
      : 1;

  const score =
    Number(
      (
        dimension.weight *
        positiveRatio *
        contradictionFactor
      ).toFixed(
        2,
      ),
    );

  return {
    id:
      dimension.id,

    label:
      dimension.label,

    weight:
      dimension.weight,

    score,

    matchedGroups:
      matchedGroups.map(
        groupLabel,
      ),

    missingGroups:
      missingGroups.map(
        groupLabel,
      ),

    contradictoryMatches:
      contradictoryMatches.map(
        groupLabel,
      ),

    passed:
      positiveRatio >=
        2 /
          3 &&
      contradictoryMatches.length ===
        0,

    rationale:
      dimension.rationale,
  };
}

function hasAllowedContext(
  corpus:
    string,

  rule:
    FalsePositiveRule,
): boolean {
  return (
    rule.allowedContextGroups ??
    []
  ).some(
    (group) =>
      matchKeywordGroup(
        corpus,
        group,
      ),
  );
}

function evaluateFalsePositive(
  rule:
    FalsePositiveRule,

  corpus:
    string,
): FalsePositiveResult {
  const matchedGroups =
    rule.keywordGroups
      .filter(
        (group) =>
          matchKeywordGroup(
            corpus,
            group,
          ),
      );

  const triggered =
    matchedGroups.length >
      0 &&
    !hasAllowedContext(
      corpus,
      rule,
    );

  return {
    id:
      rule.id,

    label:
      rule.label,

    penalty:
      triggered
        ? rule.penalty
        : 0,

    triggered,

    matchedGroups:
      matchedGroups.map(
        groupLabel,
      ),
  };
}

function getExecutiveConfidence(
  memory:
    ExtendedMemory,
): number | null {
  const candidates = [
    memory.executiveAssessment
      ?.organizationalUnderstanding
      ?.confidence,

    memory.executiveAssessment
      ?.theoryValidation
      ?.calibratedConfidence,

    (
      memory.executiveAssessment as
        ExtendedMemory["executiveAssessment"] & {
          confidence?: number;
        }
    )?.confidence,
  ];

  for (
    const candidate of
    candidates
  ) {
    if (
      typeof candidate ===
        "number" &&
      Number.isFinite(
        candidate,
      )
    ) {
      return candidate;
    }
  }

  return null;
}

function calculateCalibrationPenalty(
  confidence:
    number | null,

  dimensionScore:
    number,
): number {
  if (
    confidence ===
    null
  ) {
    return 0;
  }

  const normalizedAccuracy =
    dimensionScore /
    100;

  const gap =
    Math.abs(
      confidence -
      normalizedAccuracy,
    );

  if (
    gap <=
    0.1
  ) {
    return 0;
  }

  if (
    gap <=
    0.2
  ) {
    return 2;
  }

  if (
    gap <=
    0.3
  ) {
    return 5;
  }

  return 8;
}

function buildConclusion(
  score:
    number,
): string {
  if (
    score >=
    90
  ) {
    return "Discovery converged strongly on the true organizational explanation.";
  }

  if (
    score >=
    75
  ) {
    return "Discovery identified most of the true organizational explanation, with material gaps remaining.";
  }

  if (
    score >=
    60
  ) {
    return "Discovery produced a partially correct explanation but did not yet converge reliably.";
  }

  return "Discovery did not converge sufficiently on the known organizational ground truth.";
}

function printDimension(
  dimension:
    GroundTruthDimensionScore,
): void {
  console.log("------------------------------------------");
  console.log(
    dimension.label,
  );

  console.log(
    `${dimension.passed ? "PASS" : "PARTIAL"}  ${dimension.score} / ${dimension.weight}`,
  );

  console.log(
    dimension.rationale,
  );

  if (
    dimension
      .matchedGroups
      .length >
    0
  ) {
    console.log(
      "Matched:",
    );

    for (
      const match of
      dimension.matchedGroups
    ) {
      console.log(
        `- ${match}`,
      );
    }
  }

  if (
    dimension
      .missingGroups
      .length >
    0
  ) {
    console.log(
      "Missing:",
    );

    for (
      const missing of
      dimension.missingGroups
    ) {
      console.log(
        `- ${missing}`,
      );
    }
  }

  if (
    dimension
      .contradictoryMatches
      .length >
    0
  ) {
    console.log(
      "Contradictory evidence:",
    );

    for (
      const contradiction of
      dimension
        .contradictoryMatches
    ) {
      console.log(
        `- ${contradiction}`,
      );
    }
  }

  console.log("");
}

export function scoreNorthstarGroundTruth():
  NorthstarGroundTruthScore {
  const runtime =
    runCanonicalNorthstarGroundTruthReplay();

  const memory =
    runtime.memory as
      typeof runtime.memory &
      ExtendedMemory;

  const corpus =
    buildDiscoveryCorpus(
      memory,
    );

  const dimensions =
    GROUND_TRUTH_DIMENSIONS
      .map(
        (dimension) =>
          scoreDimension(
            dimension,
            corpus,
          ),
      );

  const dimensionScore =
    Number(
      dimensions
        .reduce(
          (
            total,
            dimension,
          ) =>
            total +
            dimension.score,
          0,
        )
        .toFixed(
          2,
        ),
    );

  const falsePositives =
    FALSE_POSITIVE_RULES
      .map(
        (rule) =>
          evaluateFalsePositive(
            rule,
            corpus,
          ),
      );

  const falsePositivePenalty =
    falsePositives.reduce(
      (
        total,
        result,
      ) =>
        total +
        result.penalty,
      0,
    );

  const executiveConfidence =
    getExecutiveConfidence(
      memory,
    );

  const calibrationPenalty =
    calculateCalibrationPenalty(
      executiveConfidence,
      dimensionScore,
    );

  const finalScore =
    Math.max(
      0,
      Number(
        (
          dimensionScore -
          falsePositivePenalty -
          calibrationPenalty
        ).toFixed(
          2,
        ),
      ),
    );

  const score:
    NorthstarGroundTruthScore = {
    organizationId:
      NORTHSTAR_ORGANIZATION_ID,

    scoredAt:
      "2026-07-22T20:00:00.000Z",

    dimensionScore,

    falsePositivePenalty,

    calibrationPenalty,

    finalScore,

    executiveConfidence,

    dimensions,

    falsePositives,

    conclusion:
      buildConclusion(
        finalScore,
      ),
  };

  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR GROUND TRUTH SCORE");
  console.log("==========================================");
  console.log("");

  console.log(
    `Organization: ${northstarCompanyFixture.organization.name}`,
  );

  console.log(
    `Known primary problem: ${northstarCompanyFixture.groundTruth.primaryProblem}`,
  );

  console.log("");

  for (
    const dimension of
    dimensions
  ) {
    printDimension(
      dimension,
    );
  }

  console.log("False-positive evaluation");
  console.log("------------------------------------------");

  for (
    const result of
    falsePositives
  ) {
    console.log(
      `${result.triggered ? "TRIGGERED" : "CLEAR"}  ${result.label}`,
    );

    if (
      result.triggered
    ) {
      console.log(
        `Penalty: -${result.penalty}`,
      );
    }
  }

  console.log("");
  console.log("Calibration");
  console.log("------------------------------------------");

  console.log(
    `Executive confidence: ${executiveConfidence ?? "unavailable"}`,
  );

  console.log(
    `Dimension accuracy: ${(dimensionScore / 100).toFixed(3)}`,
  );

  console.log(
    `Calibration penalty: -${calibrationPenalty}`,
  );

  console.log("");
  console.log("==========================================");
  console.log("FINAL SCORE");
  console.log("==========================================");
  console.log("");

  console.log(
    `Dimension score: ${dimensionScore} / 100`,
  );

  console.log(
    `False-positive penalty: -${falsePositivePenalty}`,
  );

  console.log(
    `Calibration penalty: -${calibrationPenalty}`,
  );

  console.log(
    `Final score: ${finalScore} / 100`,
  );

  console.log("");
  console.log(
    score.conclusion,
  );

  console.log("");

  return score;
}

import {
  basename,
} from "node:path";

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "scoreNorthstarGroundTruth.ts"
) {
  scoreNorthstarGroundTruth();
}

export type {
  GroundTruthDimensionScore,
  NorthstarGroundTruthScore,
};
