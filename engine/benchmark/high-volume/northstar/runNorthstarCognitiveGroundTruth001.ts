import {
  basename,
} from "node:path";

import {
  loadOrganizationRuntimeState,
} from "../../../v3/runtime/organizationStateStore";

import {
  NORTHSTAR_ORGANIZATION_ID,
  northstarCompanyFixture,
} from "./northstarCompanyFixture";

type CognitiveLayerId =
  | "phenomena"
  | "mechanisms"
  | "beliefs"
  | "concepts"
  | "theories"
  | "conditions"
  | "executiveAssessment";

type TextLike = {
  id?: string;
  type?: string;
  domain?: string;
  name?: string;
  title?: string;
  label?: string;
  statement?: string;
  summary?: string;
  description?: string;
  rationale?: string;
  explanation?: string;
  whyItMatters?: string;
  executiveName?: string;
  executiveNarrative?: string;
  executiveRecommendation?: string;
  recommendedExecutiveAction?: string;
  recommendedFocus?: string[];
  primaryMechanismSummaries?: string[];
  [key: string]: unknown;
};

type ExtendedMemory = {
  phenomena?: TextLike[];
  organizationalPhenomena?: TextLike[];
  organizationalPhenomenaState?: {
    phenomena?: TextLike[];
  };

  mechanismNetwork?: {
    mechanisms?: TextLike[];
  };

  beliefs?: TextLike[];
  organizationalBeliefs?: TextLike[];

  organizationalConcepts?: TextLike[];
  semanticConcepts?: TextLike[];
  conceptualUnderstanding?: TextLike[];

  theories?: TextLike[];

  organizationalConditions?: TextLike[];
  organizationalState?: TextLike;

  executiveAssessment?: TextLike;

  organizationalMemory?: {
    beliefs?: TextLike[];
    theories?: TextLike[];
    organizationalConditions?: TextLike[];
    organizationalState?: TextLike;
  } | null;
};

type ExpectedCognitiveObject = {
  id: string;
  label: string;

  /**
   * Preferred structured identities. These are compared against actual
   * object id, type, domain, name, label, and title values.
   */
  canonicalIdentities?: string[];

  /**
   * A semantic signature is a set of independently meaningful concepts.
   * Each inner group represents one required concept and contains acceptable
   * structured expressions of that concept.
   *
   * Matching occurs against one cognitive object at a time. This benchmark
   * never flattens the full runtime into a global keyword corpus.
   */
  semanticSignature: string[][];

  minimumSemanticCoverage?: number;
};

type CognitiveLayerDefinition = {
  id: CognitiveLayerId;
  label: string;
  weight: number;
  expected: ExpectedCognitiveObject[];
};

type ActualCognitiveObject = {
  id: string;
  label: string;
  identities: string[];
  text: string;
  raw: TextLike;
};

type CognitiveObjectMatch = {
  expectedId: string;
  expectedLabel: string;
  actualId: string | null;
  actualLabel: string | null;
  identityMatched: boolean;
  semanticCoverage: number;
  score: number;
  passed: boolean;
  matchedConcepts: string[];
  missingConcepts: string[];
};

type CognitiveLayerScore = {
  id: CognitiveLayerId;
  label: string;
  weight: number;
  score: number;
  accuracy: number;
  passed: boolean;
  expectedCount: number;
  producedCount: number;
  matches: CognitiveObjectMatch[];
  missing: string[];
  unexpected: string[];
};

type NorthstarCognitiveGroundTruthScore = {
  benchmarkId: "northstar-cognitive-ground-truth-001";
  organizationId: string;
  evaluatedAt: string;
  overallScore: number;
  passed: boolean;
  highestFidelityLayer: string | null;
  lowestFidelityLayer: string | null;
  layers: CognitiveLayerScore[];
  conclusion: string;
};

const COGNITIVE_LAYER_DEFINITIONS:
  CognitiveLayerDefinition[] = [
  {
    id:
      "phenomena",

    label:
      "Phenomena",

    weight:
      15,

    expected: [
      {
        id:
          "phenomenon-excessive-concurrent-work",

        label:
          "Excessive concurrent work fragments organizational focus",

        canonicalIdentities: [
          "concurrent_work",
          "work_in_progress_overload",
          "priority_overload",
          "focus_fragmentation",
        ],

        semanticSignature: [
          [
            "concurrent work",
            "work in progress",
            "too many projects",
            "priority overload",
            "priority conflict",
          ],

          [
            "fragmented focus",
            "focus fragmentation",
            "execution demand exceeds",
            "execution capacity",
          ],
        ],
      },

      {
        id:
          "phenomenon-weak-decision-rights",

        label:
          "Weak decision rights create approval dependency",

        canonicalIdentities: [
          "decision_rights_ambiguity",
          "approval_dependency",
          "governance_friction",
          "leadership_dependency",
        ],

        semanticSignature: [
          [
            "decision rights",
            "decision authority",
            "unclear governance",
            "governance friction",
          ],

          [
            "approval dependency",
            "approval bottleneck",
            "centralized authority",
            "leadership dependency",
          ],
        ],
      },

      {
        id:
          "phenomenon-acquisition-fragmentation",

        label:
          "The Vector acquisition amplified organizational fragmentation",

        canonicalIdentities: [
          "acquisition_fragmentation",
          "integration_fragmentation",
          "organizational_continuity_failure",
          "knowledge_fragmentation",
        ],

        semanticSignature: [
          [
            "vector",
            "acquisition",
            "integration",
            "post merger",
          ],

          [
            "fragmentation",
            "knowledge continuity",
            "incompatible process",
            "organizational continuity failure",
          ],
        ],
      },

      {
        id:
          "phenomenon-customer-escalation-downstream",

        label:
          "Customer escalation is a downstream operating symptom",

        canonicalIdentities: [
          "customer_escalation",
          "customer_friction",
          "delivery_failure",
          "strategic_account_risk",
        ],

        semanticSignature: [
          [
            "customer escalation",
            "customer friction",
            "strategic account risk",
            "delivery failure",
          ],

          [
            "downstream",
            "propagate",
            "caused by",
            "reinforced by",
          ],
        ],
      },
    ],
  },

  {
    id:
      "mechanisms",

    label:
      "Mechanisms",

    weight:
      20,

    expected: [
      {
        id:
          "mechanism-concurrent-work-overload",

        label:
          "Concurrent work overload reduces execution reliability",

        canonicalIdentities: [
          "priority_conflict",
          "capability_constraint",
          "resource_allocation",
          "concurrent_work_overload",
        ],

        semanticSignature: [
          [
            "priority conflict",
            "concurrent work",
            "resource allocation",
            "too much work in progress",
          ],

          [
            "execution capacity",
            "execution reliability",
            "focus",
            "throughput",
          ],
        ],
      },

      {
        id:
          "mechanism-centralized-governance-bottleneck",

        label:
          "Centralized governance creates decision latency",

        canonicalIdentities: [
          "centralized_governance_bottleneck",
          "approval_bottleneck",
          "decision_latency",
          "governance_friction",
        ],

        semanticSignature: [
          [
            "centralized governance bottleneck",
            "approval bottleneck",
            "centralized authority",
          ],

          [
            "decision latency",
            "decision flow",
            "slow execution",
            "approval dependency",
          ],
        ],
      },

      {
        id:
          "mechanism-cross-functional-friction",

        label:
          "Cross-functional coordination friction constrains execution",

        canonicalIdentities: [
          "cross_functional_execution_friction",
          "coordination_breakdown",
          "coordination_friction",
        ],

        semanticSignature: [
          [
            "cross functional execution friction",
            "coordination breakdown",
            "coordination friction",
          ],

          [
            "handoff",
            "ownership",
            "execution capacity",
            "execution reliability",
          ],
        ],
      },

      {
        id:
          "mechanism-acquisition-integration-fragmentation",

        label:
          "Acquisition integration fragmentation weakens continuity",

        canonicalIdentities: [
          "organizational_continuity_failure",
          "integration_failure",
          "knowledge_fragmentation",
        ],

        semanticSignature: [
          [
            "acquisition",
            "integration",
            "vector",
            "post merger",
          ],

          [
            "continuity failure",
            "knowledge fragmentation",
            "operating model ambiguity",
            "incompatible process",
          ],
        ],
      },

      {
        id:
          "mechanism-customer-escalation-propagation",

        label:
          "Operating constraints propagate into customer escalation",

        canonicalIdentities: [
          "customer_escalation_propagation",
          "delivery_failure",
          "strategic_account_risk",
        ],

        semanticSignature: [
          [
            "customer escalation",
            "customer friction",
            "delivery failure",
          ],

          [
            "propagate",
            "downstream",
            "execution capacity",
            "coordination system",
          ],
        ],
      },
    ],
  },

  {
    id:
      "beliefs",

    label:
      "Beliefs",

    weight:
      15,

    expected: [
      {
        id:
          "belief-effort-not-converting-to-progress",

        label:
          "High effort is not converting into proportional progress",

        canonicalIdentities: [
          "belief_high_effort_is_not_converting_into_proportional_progress",
        ],

        semanticSignature: [
          [
            "high effort",
            "organizational effort",
          ],

          [
            "not converting into proportional progress",
            "low execution reliability",
            "execution demand exceeds",
          ],
        ],
      },

      {
        id:
          "belief-decision-authority",

        label:
          "Decision authority is too centralized or unclear",

        canonicalIdentities: [
          "belief_decision_authority",
          "decision_authority",
        ],

        semanticSignature: [
          [
            "decision authority",
            "decision rights",
          ],

          [
            "centralized",
            "unclear",
            "approval dependency",
            "leadership dependency",
          ],
        ],
      },

      {
        id:
          "belief-staffing-not-root-cause",

        label:
          "Staffing is not the primary root cause",

        canonicalIdentities: [
          "staffing_not_root_cause",
          "headcount_not_root_cause",
        ],

        semanticSignature: [
          [
            "staffing is not",
            "not a staffing",
            "without adding headcount",
            "avoid additional headcount",
            "hiring will not",
          ],

          [
            "priority conflict",
            "governance friction",
            "coordination breakdown",
            "concurrent work",
          ],
        ],
      },

      {
        id:
          "belief-acquisition-amplified-fragmentation",

        label:
          "The acquisition amplified fragmentation",

        canonicalIdentities: [
          "acquisition_amplified_fragmentation",
          "organizational_continuity_failure",
        ],

        semanticSignature: [
          [
            "vector",
            "acquisition",
            "integration",
          ],

          [
            "fragmentation",
            "continuity failure",
            "knowledge continuity",
          ],
        ],
      },
    ],
  },

  {
    id:
      "concepts",

    label:
      "Concepts",

    weight:
      10,

    expected: [
      {
        id:
          "concept-execution-capacity",

        label:
          "Execution Capacity",

        canonicalIdentities: [
          "execution_capacity",
          "capability_constraint",
        ],

        semanticSignature: [
          [
            "execution capacity",
            "capability constraint",
            "resource constraint",
          ],
        ],
      },

      {
        id:
          "concept-decision-authority",

        label:
          "Decision Authority",

        canonicalIdentities: [
          "decision_authority",
          "decision_rights",
        ],

        semanticSignature: [
          [
            "decision authority",
            "decision rights",
            "governance",
          ],
        ],
      },

      {
        id:
          "concept-organizational-continuity",

        label:
          "Organizational Continuity",

        canonicalIdentities: [
          "organizational_continuity",
          "knowledge_continuity",
          "organizational_learning_failure",
        ],

        semanticSignature: [
          [
            "organizational continuity",
            "knowledge continuity",
            "organizational learning",
          ],
        ],
      },
    ],
  },

  {
    id:
      "theories",

    label:
      "Theories",

    weight:
      15,

    expected: [
      {
        id:
          "theory-primary-causal-explanation",

        label:
          "Concurrent work and weak decision rights jointly reduce execution reliability",

        canonicalIdentities: [
          "concurrent_work_decision_rights_theory",
          "execution_reliability_theory",
        ],

        semanticSignature: [
          [
            "concurrent work",
            "priority conflict",
            "work in progress",
          ],

          [
            "decision rights",
            "decision authority",
            "governance friction",
            "approval dependency",
          ],

          [
            "execution reliability",
            "execution capacity",
            "low execution",
          ],
        ],

        minimumSemanticCoverage:
          2 / 3,
      },

      {
        id:
          "theory-acquisition-amplification",

        label:
          "The acquisition amplified pre-existing fragmentation",

        canonicalIdentities: [
          "acquisition_fragmentation_theory",
          "organizational_continuity_failure",
        ],

        semanticSignature: [
          [
            "vector",
            "acquisition",
            "integration",
          ],

          [
            "amplified",
            "fragmentation",
            "continuity failure",
            "knowledge continuity",
          ],
        ],
      },

      {
        id:
          "theory-customer-escalation-downstream",

        label:
          "Customer escalation is downstream of operating-system constraints",

        canonicalIdentities: [
          "customer_escalation_downstream_theory",
          "delivery_failure_propagation",
        ],

        semanticSignature: [
          [
            "customer escalation",
            "customer friction",
            "delivery failure",
          ],

          [
            "downstream",
            "propagate",
            "execution capacity",
            "coordination system",
          ],
        ],
      },
    ],
  },

  {
    id:
      "conditions",

    label:
      "Organizational Conditions",

    weight:
      15,

    expected: [
      {
        id:
          "condition-execution-capacity",

        label:
          "Execution Capacity is constrained",

        canonicalIdentities: [
          "condition-executioncapacity",
          "executioncapacity",
          "execution_capacity",
        ],

        semanticSignature: [
          [
            "execution capacity",
          ],

          [
            "constrained",
            "limiting organizational performance",
            "low execution reliability",
          ],
        ],
      },

      {
        id:
          "condition-decision-flow",

        label:
          "Decision Flow is constrained by weak decision rights",

        canonicalIdentities: [
          "condition-decisionflow",
          "decisionflow",
          "decision_flow",
        ],

        semanticSignature: [
          [
            "decision flow",
            "decision rights",
            "decision authority",
          ],

          [
            "constrained",
            "approval bottleneck",
            "decision latency",
          ],
        ],
      },

      {
        id:
          "condition-coordination",

        label:
          "Coordination System is constrained",

        canonicalIdentities: [
          "condition-coordination",
          "coordination",
          "coordination_system",
        ],

        semanticSignature: [
          [
            "coordination system",
            "coordination",
          ],

          [
            "constrained",
            "informal coordination",
            "unclear ownership",
            "manual handoff",
          ],
        ],
      },

      {
        id:
          "condition-knowledge-continuity",

        label:
          "Knowledge Continuity is constrained",

        canonicalIdentities: [
          "condition-knowledgecontinuity",
          "knowledgecontinuity",
          "knowledge_continuity",
        ],

        semanticSignature: [
          [
            "knowledge continuity",
          ],

          [
            "constrained",
            "institutional knowledge",
            "localized in people",
            "informal context transfer",
          ],
        ],
      },

      {
        id:
          "condition-operating-model",

        label:
          "Operating Model is constrained",

        canonicalIdentities: [
          "condition-operatingmodel",
          "operatingmodel",
          "operating_model",
        ],

        semanticSignature: [
          [
            "operating model",
          ],

          [
            "constrained",
            "implicit expectations",
            "unclear roles",
            "informal process knowledge",
          ],
        ],
      },
    ],
  },

  {
    id:
      "executiveAssessment",

    label:
      "Executive Assessment",

    weight:
      10,

    expected: [
      {
        id:
          "assessment-primary-problem",

        label:
          "Primary problem identifies concurrent work and weak decision rights",

        semanticSignature: [
          [
            "concurrent work",
            "priority conflict",
            "reduce active work",
            "sequence work",
          ],

          [
            "decision rights",
            "decision authority",
            "approval bottleneck",
            "governance friction",
          ],

          [
            "execution reliability",
            "execution capacity",
            "organizational performance",
          ],
        ],

        minimumSemanticCoverage:
          2 / 3,
      },

      {
        id:
          "assessment-recommended-intervention",

        label:
          "Recommendation reduces concurrent work and clarifies decision authority",

        semanticSignature: [
          [
            "reduce concurrent",
            "reduce active work",
            "sequence work",
            "protect highest leverage work",
          ],

          [
            "clarify decision",
            "distribute authority",
            "reduce approval",
            "decision rights",
          ],
        ],
      },

      {
        id:
          "assessment-rejects-headcount-root-cause",

        label:
          "Assessment does not treat headcount as the primary solution",

        semanticSignature: [
          [
            "without adding headcount",
            "avoid additional headcount",
            "staffing is not",
            "not a staffing",
            "hiring will not",
          ],

          [
            "priority conflict",
            "governance friction",
            "coordination breakdown",
            "concurrent work",
          ],
        ],
      },

      {
        id:
          "assessment-customer-escalation-downstream",

        label:
          "Assessment treats customer escalation as downstream",

        semanticSignature: [
          [
            "customer escalation",
            "customer friction",
            "strategic account risk",
            "delivery failure",
          ],

          [
            "downstream",
            "propagate",
            "caused by",
            "execution capacity",
            "coordination system",
          ],
        ],
      },
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
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .replace(
      /[_/.-]+/g,
      " ",
    )
    .replace(
      /[^a-z0-9\s]/g,
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
    typeof value ===
      "number" ||
    typeof value ===
      "boolean"
  ) {
    return [];
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

function uniqueNormalized(
  values:
    Array<
      string |
      undefined
    >,
): string[] {
  return Array.from(
    new Set(
      values
        .filter(
          (
            value,
          ): value is string =>
            typeof value ===
              "string" &&
            value.trim().length >
              0,
        )
        .map(
          normalizeText,
        )
        .filter(
          Boolean,
        ),
    ),
  );
}

function buildActualObject(
  raw:
    TextLike,

  index:
    number,

  layerId:
    CognitiveLayerId,
): ActualCognitiveObject {
  const identities =
    uniqueNormalized(
      [
        raw.id,
        raw.type,
        raw.domain,
        raw.name,
        raw.label,
        raw.title,
      ],
    );

  const label =
    raw.label ??
    raw.name ??
    raw.title ??
    raw.statement ??
    raw.id ??
    `${layerId}-${index + 1}`;

  return {
    id:
      raw.id ??
      `${layerId}-${index + 1}`,

    label,

    identities,

    text:
      normalizeText(
        collectText(
          raw,
        ).join(
          " ",
        ),
      ),

    raw,
  };
}

function dedupeActualObjects(
  objects:
    ActualCognitiveObject[],
): ActualCognitiveObject[] {
  const deduped =
    new Map<
      string,
      ActualCognitiveObject
    >();

  for (
    const object of
    objects
  ) {
    const key =
      normalizeText(
        object.id,
      ) ||
      normalizeText(
        object.label,
      );

    if (
      !deduped.has(
        key,
      )
    ) {
      deduped.set(
        key,
        object,
      );
    }
  }

  return Array.from(
    deduped.values(),
  );
}

function extractLayerObjects(
  memory:
    ExtendedMemory,

  layerId:
    CognitiveLayerId,
): ActualCognitiveObject[] {
  let values:
    TextLike[] = [];

  switch (
    layerId
  ) {
    case "phenomena":
      values = [
        ...(
          memory.phenomena ??
          []
        ),

        ...(
          memory.organizationalPhenomena ??
          []
        ),

        ...(
          memory
            .organizationalPhenomenaState
            ?.phenomena ??
          []
        ),
      ];
      break;

    case "mechanisms":
      values = [
        ...(
          memory
            .mechanismNetwork
            ?.mechanisms ??
          []
        ),
      ];
      break;

    case "beliefs":
      values = [
        ...(
          memory.beliefs ??
          []
        ),

        ...(
          memory.organizationalBeliefs ??
          []
        ),

        ...(
          memory
            .organizationalMemory
            ?.beliefs ??
          []
        ),
      ];
      break;

    case "concepts":
      values = [
        ...(
          memory.organizationalConcepts ??
          []
        ),

        ...(
          memory.semanticConcepts ??
          []
        ),

        ...(
          memory.conceptualUnderstanding ??
          []
        ),
      ];
      break;

    case "theories":
      values = [
        ...(
          memory.theories ??
          []
        ),

        ...(
          memory
            .organizationalMemory
            ?.theories ??
          []
        ),
      ];
      break;

    case "conditions":
      values = [
        ...(
          memory.organizationalConditions ??
          []
        ),

        ...(
          memory
            .organizationalMemory
            ?.organizationalConditions ??
          []
        ),
      ];
      break;

    case "executiveAssessment":
      values =
        memory.executiveAssessment
          ? [
              memory.executiveAssessment,
            ]
          : [];
      break;
  }

  return dedupeActualObjects(
    values.map(
      (
        value,
        index,
      ) =>
        buildActualObject(
          value,
          index,
          layerId,
        ),
    ),
  );
}

function containsExpression(
  actualText:
    string,

  expression:
    string,
): boolean {
  const normalizedExpression =
    normalizeText(
      expression,
    );

  return (
    normalizedExpression.length >
      0 &&
    actualText.includes(
      normalizedExpression,
    )
  );
}

function semanticCoverage(
  expected:
    ExpectedCognitiveObject,

  actual:
    ActualCognitiveObject,
): {
  coverage: number;
  matchedConcepts: string[];
  missingConcepts: string[];
} {
  const matchedConcepts:
    string[] = [];

  const missingConcepts:
    string[] = [];

  for (
    const conceptGroup of
    expected.semanticSignature
  ) {
    const matchedExpression =
      conceptGroup.find(
        (expression) =>
          containsExpression(
            actual.text,
            expression,
          ),
      );

    if (
      matchedExpression
    ) {
      matchedConcepts.push(
        matchedExpression,
      );
    } else {
      missingConcepts.push(
        conceptGroup.join(
          " / ",
        ),
      );
    }
  }

  return {
    coverage:
      expected
        .semanticSignature
        .length ===
      0
        ? 1
        : matchedConcepts.length /
          expected
            .semanticSignature
            .length,

    matchedConcepts,

    missingConcepts,
  };
}

function identityMatches(
  expected:
    ExpectedCognitiveObject,

  actual:
    ActualCognitiveObject,
): boolean {
  const expectedIdentities =
    uniqueNormalized(
      expected
        .canonicalIdentities ??
      [],
    );

  if (
    expectedIdentities.length ===
    0
  ) {
    return false;
  }

  return expectedIdentities.some(
    (expectedIdentity) =>
      actual.identities.some(
        (actualIdentity) =>
          actualIdentity ===
            expectedIdentity ||
          actualIdentity.includes(
            expectedIdentity,
          ) ||
          expectedIdentity.includes(
            actualIdentity,
          ),
      ),
  );
}

function evaluateCandidate(
  expected:
    ExpectedCognitiveObject,

  actual:
    ActualCognitiveObject,
): CognitiveObjectMatch {
  const identityMatched =
    identityMatches(
      expected,
      actual,
    );

  const semantic =
    semanticCoverage(
      expected,
      actual,
    );

  const minimumCoverage =
    expected
      .minimumSemanticCoverage ??
    0.5;

  const passed =
    identityMatched ||
    semantic.coverage >=
      minimumCoverage;

  const score =
    identityMatched
      ? Math.max(
          0.9,
          semantic.coverage,
        )
      : semantic.coverage;

  return {
    expectedId:
      expected.id,

    expectedLabel:
      expected.label,

    actualId:
      actual.id,

    actualLabel:
      actual.label,

    identityMatched,

    semanticCoverage:
      Number(
        semantic.coverage.toFixed(
          3,
        ),
      ),

    score:
      Number(
        score.toFixed(
          3,
        ),
      ),

    passed,

    matchedConcepts:
      semantic.matchedConcepts,

    missingConcepts:
      semantic.missingConcepts,
  };
}

function buildMissingMatch(
  expected:
    ExpectedCognitiveObject,
): CognitiveObjectMatch {
  return {
    expectedId:
      expected.id,

    expectedLabel:
      expected.label,

    actualId:
      null,

    actualLabel:
      null,

    identityMatched:
      false,

    semanticCoverage:
      0,

    score:
      0,

    passed:
      false,

    matchedConcepts:
      [],

    missingConcepts:
      expected
        .semanticSignature
        .map(
          (group) =>
            group.join(
              " / ",
            ),
        ),
  };
}

function scoreLayer(
  definition:
    CognitiveLayerDefinition,

  actualObjects:
    ActualCognitiveObject[],
): CognitiveLayerScore {
  const usedActualIds =
    new Set<
      string
    >();

  const matches:
    CognitiveObjectMatch[] = [];

  for (
    const expected of
    definition.expected
  ) {
    const candidates =
      actualObjects
        .filter(
          (actual) =>
            !usedActualIds.has(
              actual.id,
            ),
        )
        .map(
          (actual) =>
            evaluateCandidate(
              expected,
              actual,
            ),
        )
        .sort(
          (
            left,
            right,
          ) =>
            right.score -
            left.score,
        );

    const best =
      candidates[0];

    if (
      !best ||
      !best.passed
    ) {
      matches.push(
        buildMissingMatch(
          expected,
        ),
      );

      continue;
    }

    matches.push(
      best,
    );

    if (
      best.actualId
    ) {
      usedActualIds.add(
        best.actualId,
      );
    }
  }

  const accuracy =
    definition
      .expected
      .length ===
    0
      ? 1
      : matches.reduce(
          (
            total,
            match,
          ) =>
            total +
            match.score,
          0,
        ) /
        definition
          .expected
          .length;

  const score =
    Number(
      (
        definition.weight *
        accuracy
      ).toFixed(
        2,
      ),
    );

  const unexpected =
    actualObjects
      .filter(
        (actual) =>
          !usedActualIds.has(
            actual.id,
          ),
      )
      .filter(
        (actual) => {
          const bestExpectedScore =
            definition
              .expected
              .map(
                (expected) =>
                  evaluateCandidate(
                    expected,
                    actual,
                  ).score,
              )
              .sort(
                (
                  left,
                  right,
                ) =>
                  right -
                  left,
              )[0] ??
            0;

          return bestExpectedScore <
            0.5;
        },
      )
      .map(
        (actual) =>
          actual.label,
      );

  const missing =
    matches
      .filter(
        (match) =>
          !match.passed,
      )
      .map(
        (match) =>
          match.expectedLabel,
      );

  return {
    id:
      definition.id,

    label:
      definition.label,

    weight:
      definition.weight,

    score,

    accuracy:
      Number(
        (
          accuracy *
          100
        ).toFixed(
          2,
        ),
      ),

    passed:
      accuracy >=
        0.75,

    expectedCount:
      definition
        .expected
        .length,

    producedCount:
      actualObjects.length,

    matches,

    missing,

    unexpected,
  };
}

function buildConclusion(
  overallScore:
    number,
): string {
  if (
    overallScore >=
    90
  ) {
    return "Discovery converged strongly on the known organizational ground truth across the canonical cognitive layers.";
  }

  if (
    overallScore >=
    80
  ) {
    return "Discovery produced a substantially correct cognitive model, with identifiable layer-specific gaps remaining.";
  }

  if (
    overallScore >=
    65
  ) {
    return "Discovery formed a partially correct cognitive model but has material semantic drift in one or more layers.";
  }

  return "Discovery did not converge sufficiently on the known organizational ground truth at the structured cognitive-object level.";
}

function printMatch(
  match:
    CognitiveObjectMatch,
): void {
  console.log(
    `${match.passed ? "PASS" : "MISS"}  ${match.expectedLabel}`,
  );

  if (
    match.actualLabel
  ) {
    console.log(
      `  Produced: ${match.actualLabel}`,
    );
  } else {
    console.log(
      "  Produced: none",
    );
  }

  console.log(
    `  Identity match: ${match.identityMatched ? "yes" : "no"}`,
  );

  console.log(
    `  Semantic coverage: ${(match.semanticCoverage * 100).toFixed(0)}%`,
  );

  if (
    match.matchedConcepts.length >
    0
  ) {
    console.log(
      `  Matched concepts: ${match.matchedConcepts.join(", ")}`,
    );
  }

  if (
    match.missingConcepts.length >
    0
  ) {
    console.log(
      `  Missing concepts: ${match.missingConcepts.join(" | ")}`,
    );
  }
}

function printLayer(
  layer:
    CognitiveLayerScore,
): void {
  console.log("------------------------------------------");
  console.log(
    layer.label,
  );

  console.log(
    `${layer.passed ? "PASS" : "PARTIAL"}  ${layer.score} / ${layer.weight} (${layer.accuracy}%)`,
  );

  console.log(
    `Expected: ${layer.expectedCount} | Produced: ${layer.producedCount}`,
  );

  console.log("");

  for (
    const match of
    layer.matches
  ) {
    printMatch(
      match,
    );

    console.log("");
  }

  if (
    layer.unexpected.length >
    0
  ) {
    console.log(
      "Unexpected or weakly related objects:",
    );

    for (
      const unexpected of
      layer.unexpected
    ) {
      console.log(
        `- ${unexpected}`,
      );
    }

    console.log("");
  }
}

export function runNorthstarCognitiveGroundTruth001():
  NorthstarCognitiveGroundTruthScore {
  const runtime =
    loadOrganizationRuntimeState(
      NORTHSTAR_ORGANIZATION_ID,
    );

  const memory =
    runtime.memory as
      typeof runtime.memory &
      ExtendedMemory;

  const layers =
    COGNITIVE_LAYER_DEFINITIONS
      .map(
        (definition) =>
          scoreLayer(
            definition,
            extractLayerObjects(
              memory,
              definition.id,
            ),
          ),
      );

  const overallScore =
    Number(
      layers
        .reduce(
          (
            total,
            layer,
          ) =>
            total +
            layer.score,
          0,
        )
        .toFixed(
          2,
        ),
    );

  const rankedLayers =
    [
      ...layers,
    ].sort(
      (
        left,
        right,
      ) =>
        right.accuracy -
        left.accuracy,
    );

  const score:
    NorthstarCognitiveGroundTruthScore = {
    benchmarkId:
      "northstar-cognitive-ground-truth-001",

    organizationId:
      NORTHSTAR_ORGANIZATION_ID,

    evaluatedAt:
      new Date()
        .toISOString(),

    overallScore,

    passed:
      overallScore >=
        80,

    highestFidelityLayer:
      rankedLayers[0]
        ?.label ??
      null,

    lowestFidelityLayer:
      rankedLayers[
        rankedLayers.length -
          1
      ]?.label ??
      null,

    layers,

    conclusion:
      buildConclusion(
        overallScore,
      ),
  };

  console.log("");
  console.log("==========================================");
  console.log("NORTHSTAR COGNITIVE GROUND TRUTH 001");
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
    const layer of
    layers
  ) {
    printLayer(
      layer,
    );
  }

  console.log("==========================================");
  console.log("COGNITIVE GROUND TRUTH RESULT");
  console.log("==========================================");
  console.log("");

  console.log(
    `Overall cognitive accuracy: ${overallScore} / 100`,
  );

  console.log(
    `Highest fidelity layer: ${score.highestFidelityLayer ?? "unavailable"}`,
  );

  console.log(
    `Lowest fidelity layer: ${score.lowestFidelityLayer ?? "unavailable"}`,
  );

  console.log(
    `Result: ${score.passed ? "PASS" : "PARTIAL"}`,
  );

  console.log("");
  console.log(
    score.conclusion,
  );

  console.log("");

  return score;
}

if (
  basename(
    process.argv[1] ??
      "",
  ) ===
  "runNorthstarCognitiveGroundTruth001.ts"
) {
  runNorthstarCognitiveGroundTruth001();
}

export type {
  CognitiveLayerScore,
  CognitiveObjectMatch,
  NorthstarCognitiveGroundTruthScore,
};
