import type { ConceptCandidate } from "./conceptCandidateTypes";

type SourceRecord = {
  id: string;
  label?: string;
  name?: string;
  title?: string;
  statement?: string;
  summary?: string;
  description?: string;
  explanation?: string;
  confidence?: number;
  strength?: number;
  status?: string;
};

export type BuildConceptCandidatesParams = {
  mechanisms?: SourceRecord[];
  mechanismNetwork?: SourceRecord[];
  mechanismPatterns?: SourceRecord[];
  organizationalBeliefs?: SourceRecord[];
  dynamics?: SourceRecord[];
  understandingClusters?: SourceRecord[];
  understandings?: SourceRecord[];
};

type SourceType = ConceptCandidate["sourceType"];

type TheoryPrototype = {
  id: string;
  statement: string;
  summary: string;
  keywords: string[];
  explanation: string;
};

type CognitiveObservation = {
  id: string;
  sourceType: SourceType;
  sourceId: string;
  sourceIds: string[];
  text: string;
  normalizedText: string;
  keywords: string[];
  confidence: number;
};

type ConceptCohort = {
  prototype: TheoryPrototype;
  observations: CognitiveObservation[];
  matchedKeywords: string[];
  averageConfidence: number;
  structuralDensity: number;
  semanticDensity: number;
};

const THEORY_PROTOTYPES: TheoryPrototype[] = [
  {
    id: "organizational-continuity-failure",
    statement: "Organizational continuity failure is emerging.",
    summary:
      "Multiple mechanisms appear to be manifestations of a deeper failure to preserve, transfer, and reuse organizational knowledge.",
    keywords: [
      "knowledge",
      "documentation",
      "memory",
      "learning",
      "handoff",
      "transfer",
      "fragmentation",
      "continuity",
      "duplicate",
      "duplicated",
      "institutional",
      "reuse",
      "tribal",
      "onboarding",
      "context",
    ],
    explanation:
      "Discovery formed this as a higher-order organizational theory because multiple signals point toward degradation in organizational memory, learning transfer, and continuity.",
  },
  {
    id: "centralized-governance-bottleneck",
    statement: "Centralized governance bottleneck is constraining the organization.",
    summary:
      "Multiple mechanisms appear to be manifestations of a deeper dependency on centralized approval, unclear authority, or slow decision escalation.",
    keywords: [
      "decision",
      "approval",
      "authority",
      "governance",
      "centralized",
      "centralised",
      "latency",
      "bottleneck",
      "escalation",
      "ownership",
      "priority",
      "prioritization",
      "accountability",
      "permission",
    ],
    explanation:
      "Discovery formed this as a higher-order organizational theory because several signals suggest decision flow is constrained by authority, escalation, or approval structure.",
  },
  {
    id: "cross-functional-execution-friction",
    statement: "Cross-functional execution friction is increasing.",
    summary:
      "Multiple mechanisms appear to be manifestations of a deeper coordination problem across teams, handoffs, ownership boundaries, or operating interfaces.",
    keywords: [
      "coordination",
      "handoff",
      "cross",
      "functional",
      "silo",
      "alignment",
      "ownership",
      "fragmented",
      "communication",
      "collaboration",
      "interface",
      "dependency",
      "handoffs",
      "team",
      "teams",
    ],
    explanation:
      "Discovery formed this as a higher-order organizational theory because several signals cluster around coordination, ownership boundaries, and cross-functional execution.",
  },
  {
    id: "execution-capacity-strain",
    statement: "Execution capacity strain is emerging.",
    summary:
      "Multiple mechanisms appear to be manifestations of a deeper mismatch between organizational demand and available capacity, focus, or resources.",
    keywords: [
      "execution",
      "capacity",
      "resource",
      "resources",
      "pressure",
      "constraint",
      "delivery",
      "operational",
      "burnout",
      "overload",
      "bandwidth",
      "throughput",
      "workload",
      "demand",
      "focus",
    ],
    explanation:
      "Discovery formed this as a higher-order organizational theory because several signals suggest delivery demand is exceeding available organizational capacity.",
  },
  {
    id: "strategic-alignment-drift",
    statement: "Strategic alignment drift is weakening execution.",
    summary:
      "Multiple mechanisms appear to be manifestations of a deeper loss of shared priorities, operating narrative, or strategic interpretation.",
    keywords: [
      "alignment",
      "priority",
      "priorities",
      "prioritization",
      "strategy",
      "strategic",
      "clarity",
      "narrative",
      "focus",
      "inconsistent",
      "direction",
      "misalignment",
      "tradeoff",
      "tradeoffs",
    ],
    explanation:
      "Discovery formed this as a higher-order organizational theory because several signals suggest teams are operating from inconsistent priorities or interpretations of what matters.",
  },
  {
    id: "organizational-learning-failure",
    statement: "Organizational learning failure is limiting adaptation.",
    summary:
      "Multiple mechanisms appear to be manifestations of a deeper failure to convert experience into reusable organizational improvement.",
    keywords: [
      "learning",
      "feedback",
      "adaptation",
      "retrospective",
      "improve",
      "improvement",
      "repeat",
      "repeated",
      "lesson",
      "lessons",
      "mistake",
      "experiment",
      "iteration",
      "knowledge",
      "practice",
    ],
    explanation:
      "Discovery formed this as a higher-order organizational theory because several signals suggest the organization is not reliably converting experience into improved behavior.",
  },
  {
    id: "operating-model-ambiguity",
    statement: "Operating model ambiguity is creating organizational drag.",
    summary:
      "Multiple mechanisms appear to be manifestations of unclear roles, decision rights, workflows, ownership, or operating expectations.",
    keywords: [
      "role",
      "roles",
      "responsibility",
      "responsibilities",
      "ownership",
      "workflow",
      "process",
      "unclear",
      "ambiguous",
      "ambiguity",
      "expectation",
      "expectations",
      "decision rights",
      "accountability",
      "handoff",
    ],
    explanation:
      "Discovery formed this as a higher-order organizational theory because several signals suggest the operating model is not explicit enough to guide consistent action.",
  },
];

const STOP_WORDS = new Set([
  "about",
  "after",
  "again",
  "also",
  "another",
  "because",
  "before",
  "being",
  "between",
  "could",
  "from",
  "into",
  "more",
  "most",
  "over",
  "same",
  "should",
  "some",
  "such",
  "that",
  "their",
  "there",
  "these",
  "this",
  "those",
  "through",
  "under",
  "when",
  "where",
  "which",
  "while",
  "with",
  "would",
]);

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalize(text: string | undefined): string {
  return (text ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function textOf(record: SourceRecord): string {
  return (
    record.statement ??
    record.label ??
    record.name ??
    record.title ??
    record.summary ??
    record.description ??
    record.explanation ??
    ""
  ).trim();
}

function fullTextOf(record: SourceRecord): string {
  return [
    record.statement,
    record.label,
    record.name,
    record.title,
    record.summary,
    record.description,
    record.explanation,
    record.status,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function keywords(text: string): string[] {
  return unique(
    normalize(text)
      .split(" ")
      .filter((word) => word.length > 3)
      .filter((word) => !STOP_WORDS.has(word)),
  );
}

function confidenceOf(record: SourceRecord): number {
  return clamp01(record.confidence ?? record.strength ?? 0.5);
}

function strengthOf(confidence: number): ConceptCandidate["strength"] {
  if (confidence >= 0.75) return "strong";
  if (confidence >= 0.45) return "moderate";
  return "weak";
}

function emptyCandidateSupport(): Pick<
  ConceptCandidate,
  | "supportingUnderstandingIds"
  | "supportingMechanismIds"
  | "supportingPatternIds"
  | "supportingBeliefIds"
  | "supportingDynamicIds"
  | "supportingClusterIds"
> {
  return {
    supportingUnderstandingIds: [],
    supportingMechanismIds: [],
    supportingPatternIds: [],
    supportingBeliefIds: [],
    supportingDynamicIds: [],
    supportingClusterIds: [],
  };
}

function supportForObservations(
  observations: CognitiveObservation[],
): Pick<
  ConceptCandidate,
  | "supportingUnderstandingIds"
  | "supportingMechanismIds"
  | "supportingPatternIds"
  | "supportingBeliefIds"
  | "supportingDynamicIds"
  | "supportingClusterIds"
> {
  const support = emptyCandidateSupport();

  for (const observation of observations) {
    if (observation.sourceType === "mechanism") {
      support.supportingMechanismIds.push(observation.sourceId);
    }

    if (observation.sourceType === "mechanism-pattern") {
      support.supportingPatternIds.push(observation.sourceId);
    }

    if (observation.sourceType === "organizational-belief") {
      support.supportingBeliefIds.push(observation.sourceId);
    }

    if (observation.sourceType === "dynamic") {
      support.supportingDynamicIds.push(observation.sourceId);
    }

    if (observation.sourceType === "understanding-cluster") {
      support.supportingClusterIds.push(observation.sourceId);
    }

    if (observation.sourceType === "understanding") {
      support.supportingUnderstandingIds.push(observation.sourceId);
    }
  }

  return {
    supportingUnderstandingIds: unique(support.supportingUnderstandingIds),
    supportingMechanismIds: unique(support.supportingMechanismIds),
    supportingPatternIds: unique(support.supportingPatternIds),
    supportingBeliefIds: unique(support.supportingBeliefIds),
    supportingDynamicIds: unique(support.supportingDynamicIds),
    supportingClusterIds: unique(support.supportingClusterIds),
  };
}

function buildObservations(
  sourceType: SourceType,
  records: SourceRecord[],
): CognitiveObservation[] {
  return records
    .filter((record) => record.id && textOf(record).length > 0)
    .map((record) => {
      const text = fullTextOf(record);
      const sourceIds = [record.id];

      return {
        id: `${sourceType}-${record.id}`,
        sourceType,
        sourceId: record.id,
        sourceIds,
        text,
        normalizedText: normalize(text),
        keywords: keywords(text),
        confidence: confidenceOf(record),
      };
    });
}

function countPrototypeMatches(
  observation: CognitiveObservation,
  prototype: TheoryPrototype,
): string[] {
  return prototype.keywords.filter((keyword) =>
    observation.normalizedText.includes(normalize(keyword)),
  );
}

function sourceDiversity(observations: CognitiveObservation[]): number {
  return new Set(observations.map((observation) => observation.sourceType)).size;
}

function mechanismCount(observations: CognitiveObservation[]): number {
  return observations.filter((observation) => observation.sourceType === "mechanism")
    .length;
}

function sharedKeywordDensity(observations: CognitiveObservation[]): number {
  const counts = new Map<string, number>();

  for (const observation of observations) {
    for (const keyword of observation.keywords) {
      counts.set(keyword, (counts.get(keyword) ?? 0) + 1);
    }
  }

  const recurringKeywords = Array.from(counts.values()).filter(
    (count) => count >= 2,
  ).length;

  return clamp01(recurringKeywords / 8);
}

function buildPrototypeCohorts(
  observations: CognitiveObservation[],
): ConceptCohort[] {
  return THEORY_PROTOTYPES.flatMap((prototype) => {
    const matched = observations
      .map((observation) => ({
        observation,
        matches: countPrototypeMatches(observation, prototype),
      }))
      .filter(({ matches }) => matches.length > 0);

    const cohortObservations = matched.map(({ observation }) => observation);
    const matchedKeywords = unique(matched.flatMap(({ matches }) => matches));

    const hasEnoughSignals = cohortObservations.length >= 3;
    const hasMechanismSupport = mechanismCount(cohortObservations) >= 2;
    const hasCrossLayerSupport = sourceDiversity(cohortObservations) >= 2;

    if (!hasEnoughSignals || (!hasMechanismSupport && !hasCrossLayerSupport)) {
      return [];
    }

    const semanticDensity = clamp01(
      matchedKeywords.length / Math.max(4, prototype.keywords.length * 0.45),
    );

    const structuralDensity = clamp01(
      cohortObservations.length / 8 +
        sourceDiversity(cohortObservations) / 8 +
        mechanismCount(cohortObservations) / 8 +
        sharedKeywordDensity(cohortObservations) * 0.5,
    );

    return [
      {
        prototype,
        observations: cohortObservations,
        matchedKeywords,
        averageConfidence: average(
          cohortObservations.map((observation) => observation.confidence),
        ),
        structuralDensity,
        semanticDensity,
      },
    ];
  });
}

function cohortConfidence(cohort: ConceptCohort): number {
  return clamp01(
    cohort.averageConfidence * 0.45 +
      cohort.structuralDensity * 0.35 +
      cohort.semanticDensity * 0.2,
  );
}

function buildCandidateFromCohort(cohort: ConceptCohort): ConceptCandidate {
  const confidence = cohortConfidence(cohort);
  const sourceIds = unique(
    cohort.observations.flatMap((observation) => observation.sourceIds),
  );

  const support = supportForObservations(cohort.observations);

  return {
    id: `concept-theory-${cohort.prototype.id}`,
    statement: cohort.prototype.statement,
    summary: cohort.prototype.summary,
    sourceType: "mechanism",
    sourceIds,
    ...support,
    keywords: unique([
      ...cohort.prototype.keywords,
      ...cohort.matchedKeywords,
      ...cohort.observations.flatMap((observation) => observation.keywords),
    ]).slice(0, 32),
    semanticSignature: cohort.prototype.id,
    confidence,
    strength: strengthOf(confidence),
    explanation: cohort.prototype.explanation,
  };
}

function buildEmergentKeywordCohorts(
  observations: CognitiveObservation[],
): ConceptCandidate[] {
  const keywordGroups = new Map<string, CognitiveObservation[]>();

  for (const observation of observations) {
    for (const keyword of observation.keywords) {
      if (!keywordGroups.has(keyword)) {
        keywordGroups.set(keyword, []);
      }

      keywordGroups.get(keyword)?.push(observation);
    }
  }

  return Array.from(keywordGroups.entries())
    .filter(([, group]) => group.length >= 4)
    .filter(([, group]) => sourceDiversity(group) >= 2)
    .filter(([, group]) => mechanismCount(group) >= 1)
    .map(([keyword, group]) => {
      const confidence = clamp01(
        average(group.map((observation) => observation.confidence)) * 0.5 +
          clamp01(group.length / 8) * 0.25 +
          clamp01(sourceDiversity(group) / 5) * 0.25,
      );

      const support = supportForObservations(group);
      const sourceIds = unique(
        group.flatMap((observation) => observation.sourceIds),
      );

      return {
        id: `concept-emergent-${keyword}`,
        statement: `Recurring ${keyword} pattern is emerging.`,
        summary: `Multiple cognitive signals repeatedly reference ${keyword}, suggesting it may represent a deeper organizational theme.`,
        sourceType: "mechanism",
        sourceIds,
        ...support,
        keywords: unique([
          keyword,
          ...group.flatMap((observation) => observation.keywords),
        ]).slice(0, 24),
        semanticSignature: `emergent-${keyword}`,
        confidence,
        strength: strengthOf(confidence),
        explanation:
          "Discovery formed this candidate from recurring cross-layer cognitive signals rather than a single mechanism relationship.",
      };
    });
}

function mergeCandidate(
  existing: ConceptCandidate,
  candidate: ConceptCandidate,
): ConceptCandidate {
  const confidence = clamp01(
    Math.max(existing.confidence, candidate.confidence) * 0.7 +
      average([existing.confidence, candidate.confidence]) * 0.3,
  );

  return {
    ...existing,
    sourceIds: unique([...existing.sourceIds, ...candidate.sourceIds]),

    supportingUnderstandingIds: unique([
      ...existing.supportingUnderstandingIds,
      ...candidate.supportingUnderstandingIds,
    ]),

    supportingMechanismIds: unique([
      ...existing.supportingMechanismIds,
      ...candidate.supportingMechanismIds,
    ]),

    supportingPatternIds: unique([
      ...existing.supportingPatternIds,
      ...candidate.supportingPatternIds,
    ]),

    supportingBeliefIds: unique([
      ...existing.supportingBeliefIds,
      ...candidate.supportingBeliefIds,
    ]),

    supportingDynamicIds: unique([
      ...existing.supportingDynamicIds,
      ...candidate.supportingDynamicIds,
    ]),

    supportingClusterIds: unique([
      ...existing.supportingClusterIds,
      ...candidate.supportingClusterIds,
    ]),

    keywords: unique([...existing.keywords, ...candidate.keywords]).slice(0, 40),
    confidence,
    strength: strengthOf(confidence),
    explanation:
      existing.explanation === candidate.explanation
        ? existing.explanation
        : `${existing.explanation} ${candidate.explanation}`,
  };
}

function mergeCandidates(candidates: ConceptCandidate[]): ConceptCandidate[] {
  const merged = new Map<string, ConceptCandidate>();

  for (const candidate of candidates) {
    const existing = merged.get(candidate.semanticSignature);

    if (!existing) {
      merged.set(candidate.semanticSignature, candidate);
      continue;
    }

    merged.set(candidate.semanticSignature, mergeCandidate(existing, candidate));
  }

  return Array.from(merged.values()).sort((a, b) => b.confidence - a.confidence);
}

export function buildConceptCandidates(
  params: BuildConceptCandidatesParams,
): ConceptCandidate[] {
  const observations = [
    ...buildObservations("mechanism", asArray(params.mechanisms)),
    ...buildObservations("mechanism-network", asArray(params.mechanismNetwork)),
    ...buildObservations("mechanism-pattern", asArray(params.mechanismPatterns)),
    ...buildObservations(
      "organizational-belief",
      asArray(params.organizationalBeliefs),
    ),
    ...buildObservations("dynamic", asArray(params.dynamics)),
    ...buildObservations(
      "understanding-cluster",
      asArray(params.understandingClusters),
    ),
    ...buildObservations("understanding", asArray(params.understandings)),
  ];

  const prototypeCandidates = buildPrototypeCohorts(observations).map(
    buildCandidateFromCohort,
  );

  const emergentCandidates = buildEmergentKeywordCohorts(observations);

  return mergeCandidates([...prototypeCandidates, ...emergentCandidates]);
}