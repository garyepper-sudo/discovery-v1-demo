import type { SemanticCohort, SemanticObservationSourceType } from "../semantic";
import type { ConceptCandidate, ConceptCandidateSourceType } from "./conceptCandidateTypes";

export type BuildConceptCandidatesParams = {
  semanticCohorts?: SemanticCohort[];
};

type TheoryPrototype = {
  id: string;
  statement: string;
  summary: string;
  keywords: string[];
  concepts: string[];
  weakTerms: string[];
  explanation: string;
};

type ConceptInterpretation = {
  prototype: TheoryPrototype;
  cohort: SemanticCohort;
  matchedKeywords: string[];
  matchedConcepts: string[];
  crossLayerSupport: number;
  explanatoryBreadth: number;
  prototypeMatchQuality: number;
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
      "recreate",
      "rediscover",
      "reinvent",
      "lost",
      "loss",
    ],
    concepts: [
      "knowledge-preservation",
      "institutional-memory",
      "knowledge-transfer",
      "context-loss",
      "documentation-decay",
      "repeat-work",
      "onboarding-friction",
      "learning-continuity",
    ],
    weakTerms: ["team", "teams", "organization", "recurring", "appears"],
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
      "review",
      "signoff",
      "blocked",
      "waiting",
    ],
    concepts: [
      "decision-latency",
      "approval-dependency",
      "authority-ambiguity",
      "governance-drag",
      "escalation-dependence",
      "accountability-gap",
      "ownership-uncertainty",
    ],
    weakTerms: ["approval", "team", "organization", "recurring", "appears"],
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
      "handover",
      "sync",
      "handoffs",
    ],
    concepts: [
      "coordination-friction",
      "handoff-breakdown",
      "ownership-boundary",
      "siloed-execution",
      "dependency-management",
      "interface-breakdown",
      "cross-functional-drag",
    ],
    weakTerms: ["team", "teams", "across", "organization", "recurring"],
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
      "delay",
      "delayed",
      "backlog",
    ],
    concepts: [
      "capacity-mismatch",
      "resource-constraint",
      "delivery-pressure",
      "focus-dilution",
      "operational-overload",
      "throughput-limitation",
      "execution-delay",
    ],
    weakTerms: ["execution", "organization", "recurring", "appears"],
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
      "goal",
      "goals",
      "roadmap",
    ],
    concepts: [
      "priority-drift",
      "strategic-ambiguity",
      "goal-misalignment",
      "narrative-fragmentation",
      "focus-dilution",
      "directional-inconsistency",
      "tradeoff-ambiguity",
    ],
    weakTerms: ["alignment", "organization", "recurring", "appears"],
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
      "failure",
      "pattern",
    ],
    concepts: [
      "feedback-loop-breakdown",
      "lesson-retention-failure",
      "experience-to-improvement-gap",
      "adaptive-learning-failure",
      "repeated-mistakes",
      "retrospective-breakdown",
      "practice-transfer-gap",
    ],
    weakTerms: ["recurring", "pattern", "organization", "appears"],
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
      "operating",
      "model",
    ],
    concepts: [
      "role-ambiguity",
      "ownership-ambiguity",
      "workflow-uncertainty",
      "decision-rights-confusion",
      "accountability-gap",
      "process-ambiguity",
      "operating-expectation-gap",
    ],
    weakTerms: ["process", "organization", "recurring", "appears"],
    explanation:
      "Discovery formed this as a higher-order organizational theory because several signals suggest the operating model is not explicit enough to guide consistent action.",
  },
];

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
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

function strengthOf(confidence: number): ConceptCandidate["strength"] {
  if (confidence >= 0.75) return "strong";
  if (confidence >= 0.45) return "moderate";
  return "weak";
}

function conceptCandidateSourceType(
  sourceTypes: SemanticObservationSourceType[],
): ConceptCandidateSourceType {
  const supported: ConceptCandidateSourceType[] = [
    "mechanism",
    "mechanism-network",
    "mechanism-pattern",
    "organizational-belief",
    "dynamic",
    "understanding-cluster",
    "understanding",
  ];

  return sourceTypes.find((sourceType): sourceType is ConceptCandidateSourceType =>
    supported.includes(sourceType as ConceptCandidateSourceType),
  ) ?? "mechanism";
}

function interpretationText(cohort: SemanticCohort): string {
  return normalize(
    [
      cohort.statement,
      cohort.summary,
      cohort.canonicalMeaning.statement,
      cohort.canonicalMeaning.summary,
      cohort.keywords.join(" "),
      cohort.canonicalMeaning.conceptIds.join(" "),
      cohort.semanticSignature,
    ].join(" "),
  );
}

function countPrototypeMatches(
  cohort: SemanticCohort,
  prototype: TheoryPrototype,
): {
  keywords: string[];
  concepts: string[];
} {
  const text = interpretationText(cohort);
  const cohortKeywords = cohort.keywords.map(normalize);
  const canonicalConcepts = cohort.canonicalMeaning.conceptIds.map(normalize);

  const keywordMatches = prototype.keywords.filter((keyword) => {
    const normalizedKeyword = normalize(keyword);

    return (
      text.includes(normalizedKeyword) ||
      cohortKeywords.includes(normalizedKeyword)
    );
  });

  const conceptMatches = prototype.concepts.filter((concept) => {
    const normalizedConcept = normalize(concept);

    return (
      canonicalConcepts.includes(normalizedConcept) ||
      cohortKeywords.includes(normalizedConcept) ||
      text.includes(normalizedConcept)
    );
  });

  return {
    keywords: unique(keywordMatches),
    concepts: unique(conceptMatches),
  };
}

function weakTermPenalty(
  matchedKeywords: string[],
  prototype: TheoryPrototype,
): number {
  const weakMatches = matchedKeywords.filter((keyword) =>
    prototype.weakTerms.includes(normalize(keyword)),
  );

  if (matchedKeywords.length === 0) return 0;

  return clamp01(weakMatches.length / matchedKeywords.length);
}

function sourceDiversity(cohort: SemanticCohort): number {
  return new Set(cohort.sourceTypes).size;
}

function mechanismSupportCount(cohort: SemanticCohort): number {
  return unique([
    ...cohort.supportingMechanismIds,
    ...cohort.supportingNetworkIds,
    ...cohort.supportingPatternIds,
  ]).length;
}

function crossLayerSupportScore(cohort: SemanticCohort): number {
  return clamp01(sourceDiversity(cohort) / 5 + mechanismSupportCount(cohort) / 6);
}

function explanatoryBreadthScore(
  cohort: SemanticCohort,
  matchedConcepts: string[],
): number {
  const breadth = unique([
    ...matchedConcepts,
    ...cohort.canonicalMeaning.conceptIds,
    ...cohort.keywords,
  ]).length;

  return clamp01(breadth / 10);
}

function prototypeMatchQuality(params: {
  prototype: TheoryPrototype;
  matchedKeywords: string[];
  matchedConcepts: string[];
}): number {
  const { prototype, matchedKeywords, matchedConcepts } = params;

  const keywordScore = clamp01(matchedKeywords.length / 5);
  const conceptScore = clamp01(matchedConcepts.length / 3);
  const weakPenalty = weakTermPenalty(matchedKeywords, prototype);

  return clamp01(keywordScore * 0.4 + conceptScore * 0.6 - weakPenalty * 0.25);
}

function hasMeaningfulSupport(params: {
  cohort: SemanticCohort;
  matchedConcepts: string[];
  matchedKeywords: string[];
  prototype: TheoryPrototype;
}): boolean {
  const { cohort, matchedConcepts, matchedKeywords, prototype } = params;

  const enoughSemanticMemory =
    cohort.observationIds.length >= 2 || cohort.occurrenceCount >= 2;
  const enoughMechanismSupport = mechanismSupportCount(cohort) >= 1;
  const enoughLayerSupport = sourceDiversity(cohort) >= 2;
  const enoughConcepts = matchedConcepts.length >= 1;
  const enoughKeywords = matchedKeywords.length >= 2;
  const weakPenalty = weakTermPenalty(matchedKeywords, prototype);

  return (
    enoughSemanticMemory &&
    (enoughConcepts || enoughKeywords) &&
    (enoughMechanismSupport || enoughLayerSupport) &&
    weakPenalty < 0.6
  );
}

function buildConceptInterpretations(
  cohorts: SemanticCohort[],
): ConceptInterpretation[] {
  return THEORY_PROTOTYPES.flatMap((prototype) =>
    cohorts.flatMap((cohort) => {
      const matches = countPrototypeMatches(cohort, prototype);

      if (
        !hasMeaningfulSupport({
          cohort,
          matchedConcepts: matches.concepts,
          matchedKeywords: matches.keywords,
          prototype,
        })
      ) {
        return [];
      }

      return [
        {
          prototype,
          cohort,
          matchedKeywords: matches.keywords,
          matchedConcepts: matches.concepts,
          crossLayerSupport: crossLayerSupportScore(cohort),
          explanatoryBreadth: explanatoryBreadthScore(cohort, matches.concepts),
          prototypeMatchQuality: prototypeMatchQuality({
            prototype,
            matchedKeywords: matches.keywords,
            matchedConcepts: matches.concepts,
          }),
        },
      ];
    }),
  );
}

function interpretationConfidence(interpretation: ConceptInterpretation): number {
  const { cohort } = interpretation;

  return clamp01(
    cohort.confidence * 0.25 +
      cohort.canonicalMeaning.confidence * 0.2 +
      interpretation.prototypeMatchQuality * 0.2 +
      interpretation.crossLayerSupport * 0.15 +
      interpretation.explanatoryBreadth * 0.1 +
      cohort.semanticStability * 0.05 +
      cohort.organizationalPersistence * 0.05,
  );
}

function candidateExplanation(interpretation: ConceptInterpretation): string {
  const { cohort } = interpretation;

  const supportParts = [
    cohort.observationIds.length > 0
      ? `${cohort.observationIds.length} semantic observations`
      : "",
    sourceDiversity(cohort) > 1
      ? `${sourceDiversity(cohort)} cognitive layers`
      : "",
    mechanismSupportCount(cohort) > 0
      ? `${mechanismSupportCount(cohort)} mechanism-level supports`
      : "",
    interpretation.matchedConcepts.length > 0
      ? `${interpretation.matchedConcepts.length} matched canonical concepts`
      : "",
    cohort.occurrenceCount > 1 ? `${cohort.occurrenceCount} occurrences` : "",
  ].filter(Boolean);

  return `${interpretation.prototype.explanation} It interprets the persistent semantic cohort "${cohort.canonicalMeaning.statement}" and is supported by ${supportParts.join(
    ", ",
  )}. This candidate classifies canonical semantic memory rather than rebuilding semantic meaning from raw observations.`;
}

function buildCandidateFromInterpretation(
  interpretation: ConceptInterpretation,
): ConceptCandidate {
  const { cohort, prototype } = interpretation;
  const confidence = interpretationConfidence(interpretation);

  return {
    id: `concept-theory-${prototype.id}`,
    statement: prototype.statement,
    summary: prototype.summary,
    sourceType: conceptCandidateSourceType(cohort.sourceTypes),
    sourceIds: unique(cohort.sourceIds),

    supportingUnderstandingIds: unique(cohort.supportingUnderstandingIds),
    supportingMechanismIds: unique(cohort.supportingMechanismIds),
    supportingPatternIds: unique(cohort.supportingPatternIds),
    supportingBeliefIds: [],
    supportingDynamicIds: unique(cohort.supportingDynamicIds),
    supportingClusterIds: unique(cohort.supportingClusterIds),

    keywords: unique([
      ...interpretation.matchedConcepts,
      ...interpretation.matchedKeywords,
      ...cohort.canonicalMeaning.conceptIds,
      ...cohort.keywords,
      ...prototype.keywords,
    ]).slice(0, 32),

    semanticSignature: prototype.id,
    confidence,
    strength: strengthOf(confidence),
    explanation: candidateExplanation(interpretation),
  };
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
  const interpretations = buildConceptInterpretations(
    asArray(params.semanticCohorts),
  );

  return mergeCandidates(interpretations.map(buildCandidateFromInterpretation));
}