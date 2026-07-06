import type {
  SemanticObservation,
  SemanticObservationSourceType,
  SemanticStrength,
} from "./types";

export type SemanticObservationInput = {
  id?: string;
  statement?: string;
  summary?: string;
  title?: string;
  label?: string;
  name?: string;
  description?: string;
  explanation?: string;
  status?: string;
  confidence?: number;
  score?: number;
  strength?: SemanticStrength | number;
  keywords?: string[];
  semanticSignature?: string;
};

export type BuildSemanticObservationsParams = {
  understandings?: SemanticObservationInput[];
  understandingClusters?: SemanticObservationInput[];
  organizationalDynamics?: SemanticObservationInput[];
  meaningSignals?: SemanticObservationInput[];
  organizationalConcepts?: SemanticObservationInput[];
  phenomena?: SemanticObservationInput[];
  mechanisms?: SemanticObservationInput[];
  mechanismNetworks?: SemanticObservationInput[];
  mechanismPatterns?: SemanticObservationInput[];
  organizationalBeliefs?: SemanticObservationInput[];
  conceptCandidates?: SemanticObservationInput[];
};

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
  "organization",
  "organizational",
  "team",
  "teams",
  "across",
  "appears",
  "unclassified",
  "recurring",
  "pattern",
  "patterns",
]);

const CONCEPT_LEXICON: Record<string, string[]> = {
  "knowledge-preservation": [
    "knowledge",
    "documentation",
    "memory",
    "institutional",
    "tribal",
    "preserve",
    "retention",
  ],
  "institutional-memory": [
    "memory",
    "institutional",
    "history",
    "context",
    "tribal",
    "loss",
    "lost",
  ],
  "knowledge-transfer": [
    "transfer",
    "handoff",
    "handover",
    "onboarding",
    "training",
    "context",
    "reuse",
  ],
  "context-loss": [
    "context",
    "lost",
    "loss",
    "fragmented",
    "fragmentation",
    "handoff",
    "rediscover",
  ],
  "documentation-decay": [
    "documentation",
    "docs",
    "documented",
    "outdated",
    "missing",
    "incomplete",
    "stale",
  ],
  "repeat-work": [
    "duplicate",
    "duplicated",
    "repeat",
    "repeated",
    "redo",
    "rework",
    "reinvent",
    "recreate",
  ],
  "onboarding-friction": [
    "onboarding",
    "ramp",
    "training",
    "handoff",
    "context",
    "new",
    "learn",
  ],
  "learning-continuity": [
    "learning",
    "lesson",
    "lessons",
    "reuse",
    "practice",
    "continuity",
  ],

  "decision-latency": [
    "decision",
    "latency",
    "slow",
    "delay",
    "delayed",
    "waiting",
    "blocked",
  ],
  "approval-dependency": [
    "approval",
    "permission",
    "signoff",
    "review",
    "centralized",
    "escalation",
  ],
  "authority-ambiguity": [
    "authority",
    "decision rights",
    "unclear",
    "ownership",
    "accountability",
    "permission",
  ],
  "governance-drag": [
    "governance",
    "process",
    "bureaucracy",
    "review",
    "escalation",
    "control",
  ],
  "escalation-dependence": [
    "escalation",
    "escalate",
    "approval",
    "blocked",
    "decision",
    "leader",
  ],
  "accountability-gap": [
    "accountability",
    "owner",
    "ownership",
    "responsibility",
    "unclear",
    "gap",
  ],
  "ownership-uncertainty": [
    "owner",
    "ownership",
    "unclear",
    "responsibility",
    "handoff",
    "accountability",
  ],

  "coordination-friction": [
    "coordination",
    "sync",
    "collaboration",
    "communication",
    "cross",
    "functional",
  ],
  "handoff-breakdown": [
    "handoff",
    "handover",
    "transfer",
    "handoffs",
    "lost",
    "context",
  ],
  "ownership-boundary": [
    "ownership",
    "boundary",
    "interface",
    "responsibility",
    "handoff",
  ],
  "siloed-execution": [
    "silo",
    "siloed",
    "fragmented",
    "separate",
    "coordination",
    "cross",
  ],
  "dependency-management": [
    "dependency",
    "dependencies",
    "blocked",
    "waiting",
    "coordination",
    "handoff",
  ],
  "interface-breakdown": [
    "interface",
    "handoff",
    "boundary",
    "communication",
    "coordination",
  ],
  "cross-functional-drag": [
    "cross",
    "functional",
    "collaboration",
    "alignment",
    "coordination",
    "handoff",
  ],

  "capacity-mismatch": [
    "capacity",
    "demand",
    "overload",
    "bandwidth",
    "constraint",
    "resource",
  ],
  "resource-constraint": [
    "resource",
    "resources",
    "constraint",
    "limited",
    "capacity",
    "budget",
    "staff",
  ],
  "delivery-pressure": [
    "delivery",
    "deadline",
    "pressure",
    "throughput",
    "delay",
    "execution",
  ],
  "focus-dilution": [
    "focus",
    "priority",
    "priorities",
    "spread",
    "fragmented",
    "distracted",
  ],
  "operational-overload": [
    "operational",
    "overload",
    "burnout",
    "workload",
    "pressure",
    "capacity",
  ],
  "throughput-limitation": [
    "throughput",
    "velocity",
    "delivery",
    "capacity",
    "delay",
    "bottleneck",
  ],
  "execution-delay": [
    "execution",
    "delay",
    "delayed",
    "blocked",
    "backlog",
    "delivery",
  ],

  "priority-drift": [
    "priority",
    "priorities",
    "drift",
    "changing",
    "inconsistent",
    "focus",
  ],
  "strategic-ambiguity": [
    "strategy",
    "strategic",
    "unclear",
    "clarity",
    "direction",
    "ambiguity",
  ],
  "goal-misalignment": [
    "goal",
    "goals",
    "alignment",
    "misalignment",
    "direction",
    "priority",
  ],
  "narrative-fragmentation": [
    "narrative",
    "story",
    "interpretation",
    "message",
    "fragmented",
    "inconsistent",
  ],
  "directional-inconsistency": [
    "direction",
    "inconsistent",
    "strategy",
    "priorities",
    "clarity",
  ],
  "tradeoff-ambiguity": [
    "tradeoff",
    "tradeoffs",
    "priority",
    "decision",
    "strategy",
    "unclear",
  ],

  "feedback-loop-breakdown": [
    "feedback",
    "loop",
    "retrospective",
    "learning",
    "improve",
    "adaptation",
  ],
  "lesson-retention-failure": [
    "lesson",
    "lessons",
    "learning",
    "repeat",
    "mistake",
    "memory",
  ],
  "experience-to-improvement-gap": [
    "experience",
    "improvement",
    "learning",
    "practice",
    "iteration",
    "adaptation",
  ],
  "adaptive-learning-failure": [
    "adaptation",
    "learning",
    "feedback",
    "iteration",
    "improvement",
  ],
  "repeated-mistakes": [
    "mistake",
    "mistakes",
    "repeat",
    "repeated",
    "lesson",
    "learning",
  ],
  "retrospective-breakdown": [
    "retrospective",
    "retro",
    "feedback",
    "lesson",
    "improvement",
  ],
  "practice-transfer-gap": [
    "practice",
    "transfer",
    "standard",
    "standardize",
    "reuse",
    "learning",
  ],

  "role-ambiguity": [
    "role",
    "roles",
    "unclear",
    "responsibility",
    "expectation",
    "ambiguity",
  ],
  "ownership-ambiguity": [
    "ownership",
    "owner",
    "unclear",
    "responsibility",
    "accountability",
  ],
  "workflow-uncertainty": [
    "workflow",
    "process",
    "unclear",
    "handoff",
    "operating",
    "steps",
  ],
  "decision-rights-confusion": [
    "decision rights",
    "authority",
    "decision",
    "ownership",
    "unclear",
  ],
  "process-ambiguity": [
    "process",
    "workflow",
    "unclear",
    "ambiguous",
    "expectations",
  ],
  "operating-expectation-gap": [
    "expectation",
    "expectations",
    "operating",
    "role",
    "workflow",
    "unclear",
  ],
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function normalize(value: string | undefined): string {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function inferStatement(input: SemanticObservationInput): string {
  return (
    input.statement ??
    input.summary ??
    input.label ??
    input.name ??
    input.title ??
    input.description ??
    input.explanation ??
    ""
  ).trim();
}

function fullTextOf(input: SemanticObservationInput): string {
  return [
    input.statement,
    input.label,
    input.name,
    input.title,
    input.summary,
    input.description,
    input.explanation,
    input.status,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
}

function inferSummary(input: SemanticObservationInput, statement: string): string {
  return (input.summary ?? input.description ?? statement).trim();
}

function inferConfidence(input: SemanticObservationInput): number {
  if (typeof input.confidence === "number") return clamp01(input.confidence);
  if (typeof input.score === "number") return clamp01(input.score / 100);
  if (typeof input.strength === "number") return clamp01(input.strength);
  return 0.6;
}

function inferStrength(confidence: number): SemanticStrength {
  if (confidence >= 0.75) return "strong";
  if (confidence >= 0.45) return "moderate";
  return "weak";
}

function extractKeywords(text: string): string[] {
  return unique(
    normalize(text)
      .split(" ")
      .filter((word) => word.length > 3)
      .filter((word) => !STOP_WORDS.has(word)),
  );
}

function inferConcepts(text: string): string[] {
  const normalizedText = normalize(text);
  const inferred: string[] = [];

  for (const [concept, terms] of Object.entries(CONCEPT_LEXICON)) {
    const matches = terms.filter((term) =>
      normalizedText.includes(normalize(term)),
    );

    if (matches.length >= 1) {
      inferred.push(concept);
    }
  }

  return unique(inferred);
}

function inferKeywords(input: SemanticObservationInput, text: string): string[] {
  const providedKeywords =
    Array.isArray(input.keywords) && input.keywords.length > 0
      ? input.keywords.map(normalize)
      : [];

  return unique([
    ...providedKeywords,
    ...extractKeywords(text),
    ...inferConcepts(text),
  ]).slice(0, 32);
}

function supportingIdsForSourceType(params: {
  sourceType: SemanticObservationSourceType;
  id: string | undefined;
}): Pick<
  SemanticObservation,
  | "supportingUnderstandingIds"
  | "supportingClusterIds"
  | "supportingDynamicIds"
  | "supportingMeaningSignalIds"
  | "supportingConceptIds"
  | "supportingPhenomenonIds"
  | "supportingMechanismIds"
  | "supportingNetworkIds"
  | "supportingPatternIds"
  | "supportingBeliefIds"
  | "supportingCandidateIds"
> {
  const id = params.id;

  return {
    supportingUnderstandingIds:
      params.sourceType === "understanding" && id ? [id] : [],
    supportingClusterIds:
      params.sourceType === "understanding-cluster" && id ? [id] : [],
    supportingDynamicIds: params.sourceType === "dynamic" && id ? [id] : [],
    supportingMeaningSignalIds:
      params.sourceType === "meaning-signal" && id ? [id] : [],
    supportingConceptIds:
      params.sourceType === "organizational-concept" && id ? [id] : [],
    supportingPhenomenonIds:
      params.sourceType === "phenomenon" && id ? [id] : [],
    supportingMechanismIds:
      params.sourceType === "mechanism" && id ? [id] : [],
    supportingNetworkIds:
      params.sourceType === "mechanism-network" && id ? [id] : [],
    supportingPatternIds:
      params.sourceType === "mechanism-pattern" && id ? [id] : [],
    supportingBeliefIds:
      params.sourceType === "organizational-belief" && id ? [id] : [],
    supportingCandidateIds:
      params.sourceType === "concept-candidate" && id ? [id] : [],
  };
}

function makeObservation(params: {
  input: SemanticObservationInput;
  index: number;
  sourceType: SemanticObservationSourceType;
}): SemanticObservation | null {
  const statement = inferStatement(params.input);
  if (!statement) return null;

  const text = fullTextOf(params.input) || statement;
  const id =
    params.input.id ??
    `semantic-observation-${params.sourceType}-${params.index + 1}`;

  const summary = inferSummary(params.input, statement);
  const confidence = inferConfidence(params.input);
  const keywords = inferKeywords(params.input, text);
  const concepts = inferConcepts(text);

  const semanticSignature =
    params.input.semanticSignature ??
    unique([...concepts, ...keywords, ...extractKeywords(statement)])
      .slice(0, 24)
      .join(" ");

  return {
    id,
    statement,
    summary,

    sourceType: params.sourceType,
    sourceIds: params.input.id ? [params.input.id] : [],

    ...supportingIdsForSourceType({
      sourceType: params.sourceType,
      id: params.input.id,
    }),

    keywords,
    semanticSignature,

    confidence,
    strength:
      typeof params.input.strength === "string"
        ? params.input.strength
        : inferStrength(confidence),

    explanatoryStrength: confidence,
    organizationalPersistence:
      params.sourceType === "mechanism-pattern" ||
      params.sourceType === "organizational-belief" ||
      params.sourceType === "understanding-cluster" ||
      params.sourceType === "understanding"
        ? Math.max(confidence, 0.7)
        : confidence,

    explanation:
      params.input.explanation ??
      `Semantic observation derived from ${params.sourceType}.`,
  };
}

function addObservations(params: {
  observations: SemanticObservation[];
  inputs: SemanticObservationInput[] | undefined;
  sourceType: SemanticObservationSourceType;
  exclude?: (input: SemanticObservationInput) => boolean;
}): void {
  for (const [index, input] of (params.inputs ?? []).entries()) {
    if (params.exclude?.(input)) continue;

    const observation = makeObservation({
      input,
      index,
      sourceType: params.sourceType,
    });

    if (observation) {
      params.observations.push(observation);
    }
  }
}

export function buildSemanticObservations(
  params: BuildSemanticObservationsParams,
): SemanticObservation[] {
  const observations: SemanticObservation[] = [];

  addObservations({
    observations,
    inputs: params.understandings,
    sourceType: "understanding",
  });

  addObservations({
    observations,
    inputs: params.understandingClusters,
    sourceType: "understanding-cluster",
  });

  addObservations({
    observations,
    inputs: params.organizationalDynamics,
    sourceType: "dynamic",
  });

  addObservations({
    observations,
    inputs: params.meaningSignals,
    sourceType: "meaning-signal",
  });

  addObservations({
    observations,
    inputs: params.organizationalConcepts,
    sourceType: "organizational-concept",
  });

  addObservations({
    observations,
    inputs: params.phenomena,
    sourceType: "phenomenon",
  });

  addObservations({
    observations,
    inputs: params.mechanisms,
    sourceType: "mechanism",
  });

  addObservations({
    observations,
    inputs: params.mechanismNetworks,
    sourceType: "mechanism-network",
    exclude: (input) => Boolean(input.id?.startsWith("mechanism-edge:")),
  });

  addObservations({
    observations,
    inputs: params.mechanismPatterns,
    sourceType: "mechanism-pattern",
  });

  addObservations({
    observations,
    inputs: params.organizationalBeliefs,
    sourceType: "organizational-belief",
  });

  addObservations({
    observations,
    inputs: params.conceptCandidates,
    sourceType: "concept-candidate",
  });

  return observations;
}