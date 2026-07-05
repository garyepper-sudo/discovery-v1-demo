import type {
  OrganizationalObservation,
  OrganizationalObservationState,
  OrganizationalObservationType,
  OrganizationalPattern,
  OrganizationalPatternType,
} from "./organizationalObservations";

type EvidenceLike = {
  id?: string;
  title?: string;
  summary?: string;
  content?: string;
  text?: string;
  description?: string;
};

type EntityLike = {
  id?: string;
  canonicalName?: string;
  name?: string;
  category?: string;
  aliases?: string[];
  evidenceIds?: string[];
  confidence?: number;
};

type SemanticConceptLike = {
  id: string;
  supportingMeaningIds?: string[];
  confidence?: number;
  strength?: number;
  emergenceScore?: number;
};

type ObservationDefinition = {
  type: OrganizationalObservationType;
  label: string;
  terms: string[];
  description: string;
};

type PatternDefinition = {
  type: OrganizationalPatternType;
  label: string;
  description: string;
  meaningIds: string[];
  observationTypes: OrganizationalObservationType[];
  possiblePhenomenonTypes: string[];
};

const OBSERVATION_DEFINITIONS: ObservationDefinition[] = [
  {
    type: "distributed_documentation",
    label: "Distributed Documentation",
    terms: [
      "documentation",
      "docs",
      "wiki",
      "spreadsheet",
      "slack",
      "notion",
      "google doc",
      "shared drive",
      "scattered",
      "spread across",
      "hard to find",
    ],
    description:
      "Evidence suggests organizational knowledge may be distributed across multiple places.",
  },
  {
    type: "duplicated_work",
    label: "Duplicated Work",
    terms: [
      "duplicated work",
      "duplicate work",
      "rework",
      "redoing",
      "same work",
      "parallel effort",
      "overlapping effort",
    ],
    description:
      "Evidence suggests similar work may be happening more than once.",
  },
  {
    type: "repeated_experiment",
    label: "Repeated Experiment",
    terms: [
      "tried before",
      "already tried",
      "same experiment",
      "repeated experiment",
      "tested again",
      "pilot again",
      "same pilot",
    ],
    description:
      "Evidence suggests the organization may be repeating experiments or tests.",
  },
  {
    type: "knowledge_stored_locally",
    label: "Knowledge Stored Locally",
    terms: [
      "tribal knowledge",
      "in someone's head",
      "only person who knows",
      "senior employee",
      "individual memory",
      "local knowledge",
      "not documented",
    ],
    description:
      "Evidence suggests important knowledge may live with individuals instead of the organization.",
  },
  {
    type: "weak_handoff",
    label: "Weak Handoff",
    terms: [
      "handoff",
      "handoffs",
      "poor handoff",
      "weak handoff",
      "transition",
      "onboarding gap",
      "training gap",
      "not transferred",
    ],
    description:
      "Evidence suggests knowledge or work may not transfer cleanly across people or teams.",
  },
  {
    type: "approval_waiting",
    label: "Waiting For Approval",
    terms: [
      "approval",
      "waiting for approval",
      "sign off",
      "signoff",
      "blocked by approval",
      "pending approval",
      "review required",
    ],
    description:
      "Evidence suggests work may be waiting on approval or review.",
  },
  {
    type: "executive_escalation",
    label: "Executive Escalation",
    terms: [
      "executive review",
      "leadership review",
      "escalation",
      "escalated",
      "ceo approval",
      "leadership approval",
    ],
    description:
      "Evidence suggests decisions or work may be escalated to leadership.",
  },
  {
    type: "learning_not_reused",
    label: "Learning Not Reused",
    terms: [
      "lessons learned",
      "same mistake",
      "repeat mistake",
      "forgot",
      "not reused",
      "learning did not carry forward",
      "knowledge lost",
    ],
    description:
      "Evidence suggests prior learning may not be reused across future work.",
  },
];

const OBSERVATION_MEANING_HINTS: Record<
  OrganizationalObservationType,
  string[]
> = {
  distributed_documentation: [
    "knowledge_continuity",
    "organizational_memory",
    "communication",
    "coordination",
  ],
  duplicated_work: [
    "knowledge_continuity",
    "organizational_memory",
    "execution_capacity",
  ],
  repeated_experiment: [
    "knowledge_continuity",
    "organizational_memory",
    "innovation_flow",
  ],
  knowledge_stored_locally: [
    "knowledge_continuity",
    "organizational_memory",
    "leadership_dependency",
  ],
  weak_handoff: ["knowledge_continuity", "communication", "coordination"],
  missing_owner: ["ownership", "accountability", "coordination"],
  approval_waiting: [
    "decision_authority",
    "leadership_dependency",
    "governance",
  ],
  executive_escalation: [
    "decision_authority",
    "leadership_dependency",
    "governance",
  ],
  conflicting_documentation: [
    "knowledge_continuity",
    "organizational_memory",
    "alignment",
  ],
  learning_not_reused: [
    "knowledge_continuity",
    "organizational_memory",
    "innovation_flow",
  ],
  coordination_gap: ["coordination", "alignment", "communication"],
  generic_observation: [],
};

const PATTERN_DEFINITIONS: PatternDefinition[] = [
  {
    type: "documentation_distributed_across_systems",
    label: "Documentation Distributed Across Systems",
    description:
      "Multiple observations reinforce the concept that organizational knowledge is distributed across systems, documents, or people.",
    meaningIds: [
      "knowledge_continuity",
      "organizational_memory",
      "communication",
      "coordination",
    ],
    observationTypes: ["distributed_documentation", "knowledge_stored_locally"],
    possiblePhenomenonTypes: [
      "knowledge_fragmentation",
      "scattered_documentation",
      "institutional_memory_loss",
    ],
  },
  {
    type: "work_is_being_repeated",
    label: "Work Is Being Repeated",
    description:
      "Multiple observations reinforce the concept that work, experiments, or learning loops may be repeating instead of compounding.",
    meaningIds: [
      "knowledge_continuity",
      "organizational_memory",
      "execution_capacity",
      "organizational_agility",
    ],
    observationTypes: ["duplicated_work", "repeated_experiment"],
    possiblePhenomenonTypes: [
      "duplicated_work",
      "repeated_experimentation",
      "organizational_learning_failure",
    ],
  },
  {
    type: "knowledge_not_transferring",
    label: "Knowledge Is Not Transferring",
    description:
      "Multiple observations reinforce the concept that knowledge is not moving reliably across people, teams, or time.",
    meaningIds: [
      "knowledge_continuity",
      "organizational_memory",
      "communication",
      "coordination",
    ],
    observationTypes: [
      "weak_handoff",
      "knowledge_stored_locally",
      "learning_not_reused",
    ],
    possiblePhenomenonTypes: [
      "weak_knowledge_transfer",
      "institutional_memory_loss",
      "organizational_learning_failure",
    ],
  },
  {
    type: "decisions_wait_for_approval",
    label: "Decisions Wait For Approval",
    description:
      "Multiple observations reinforce the concept that work or decisions are waiting on approval, escalation, or leadership dependency.",
    meaningIds: [
      "decision_authority",
      "leadership_dependency",
      "governance",
      "organizational_agility",
    ],
    observationTypes: ["approval_waiting", "executive_escalation"],
    possiblePhenomenonTypes: ["approval_bottleneck", "decision_latency"],
  },
];

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function evidenceText(evidence: EvidenceLike): string {
  return [
    evidence.title,
    evidence.summary,
    evidence.content,
    evidence.text,
    evidence.description,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

function entityText(entity: EntityLike): string {
  return [
    entity.canonicalName,
    entity.name,
    entity.category,
    ...(Array.isArray(entity.aliases) ? entity.aliases : []),
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function average(values: number[]): number {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function semanticSummaryForObservation(
  definition: ObservationDefinition
): string {
  const meaningIds = OBSERVATION_MEANING_HINTS[definition.type] ?? [];

  if (meaningIds.length === 0) {
    return definition.description;
  }

  return `${definition.description} Semantically, this observation may indicate ${meaningIds
    .map((meaningId) => meaningId.replace(/_/g, " "))
    .join(", ")}.`;
}

function findRelatedEntities(params: {
  evidenceId: string;
  evidenceText: string;
  entities: EntityLike[];
}): string[] {
  const { evidenceId, evidenceText, entities } = params;

  return unique(
    entities
      .filter((entity) => {
        const id = typeof entity.id === "string" ? entity.id : "";
        const entityEvidenceIds = Array.isArray(entity.evidenceIds)
          ? entity.evidenceIds
          : [];

        if (!id) return false;
        if (entityEvidenceIds.includes(evidenceId)) return true;

        const text = entityText(entity);
        return text.length > 0 && evidenceText.includes(text);
      })
      .map((entity) => entity.id)
      .filter((id): id is string => Boolean(id))
  );
}

function inferObservations(params: {
  evidence: EvidenceLike[];
  entities: EntityLike[];
}): OrganizationalObservation[] {
  const { evidence, entities } = params;
  const observations: OrganizationalObservation[] = [];

  evidence.forEach((item, evidenceIndex) => {
    const id = item.id ?? `evidence-${evidenceIndex + 1}`;
    const text = evidenceText(item);

    if (!text) return;

    OBSERVATION_DEFINITIONS.forEach((definition) => {
      const matchedTerms = definition.terms.filter((term) =>
        text.includes(term)
      );

      if (matchedTerms.length === 0) return;

      const relatedEntityIds = findRelatedEntities({
        evidenceId: id,
        evidenceText: text,
        entities,
      });

      observations.push({
        id: `observation-${definition.type}-${evidenceIndex + 1}`,
        type: definition.type,
        label: definition.label,
        description: definition.description,
        sourceEvidenceIds: [id],
        relatedEntityIds,
        matchedTerms,
        supportingMeaningIds: OBSERVATION_MEANING_HINTS[definition.type] ?? [],
        semanticSummary: semanticSummaryForObservation(definition),
        semanticStrength: clamp01(0.5 + matchedTerms.length * 0.08),
        confidence: clamp01(0.55 + matchedTerms.length * 0.08),
        strength: clamp01(0.5 + matchedTerms.length * 0.1),
      });
    });
  });

  return observations;
}

function conceptScore(concept: SemanticConceptLike): number {
  return clamp01(
    concept.emergenceScore ?? concept.strength ?? concept.confidence ?? 0
  );
}

function getConceptSupport(params: {
  meaningIds: string[];
  semanticConcepts: SemanticConceptLike[];
}): {
  supportingConceptIds: string[];
  supportingMeaningIds: string[];
  conceptReinforcement: number;
} {
  const { meaningIds, semanticConcepts } = params;
  const relevantMeaningIds = new Set(meaningIds);

  if (!relevantMeaningIds.size || !semanticConcepts.length) {
    return {
      supportingConceptIds: [],
      supportingMeaningIds: [],
      conceptReinforcement: 0,
    };
  }

  const supportingConcepts = semanticConcepts.filter((concept) =>
    (concept.supportingMeaningIds ?? []).some((meaningId) =>
      relevantMeaningIds.has(meaningId)
    )
  );

  const supportingConceptIds = unique(
    supportingConcepts.map((concept) => concept.id)
  );

  const supportingMeaningIds = unique(
    supportingConcepts.flatMap((concept) =>
      (concept.supportingMeaningIds ?? []).filter((meaningId) =>
        relevantMeaningIds.has(meaningId)
      )
    )
  );

  const conceptReinforcement = average(supportingConcepts.map(conceptScore));

  return {
    supportingConceptIds,
    supportingMeaningIds,
    conceptReinforcement: clamp01(conceptReinforcement),
  };
}

function observationsForDefinition(params: {
  definition: PatternDefinition;
  observations: OrganizationalObservation[];
  conceptReinforcement: number;
}): OrganizationalObservation[] {
  const { definition, observations, conceptReinforcement } = params;
  const allowedTypes = new Set(definition.observationTypes);

  const semanticMeaningIds = new Set(definition.meaningIds);

  const matchingObservations = observations.filter((observation) => {
    const typeMatches = allowedTypes.has(observation.type);
    const meaningMatches = observation.supportingMeaningIds.some((meaningId) =>
      semanticMeaningIds.has(meaningId)
    );

    return typeMatches || meaningMatches;
  });

  if (conceptReinforcement <= 0) {
    return matchingObservations;
  }

  const strongObservations = matchingObservations.filter(
    (observation) =>
      observation.confidence >= 0.55 ||
      observation.strength >= 0.5 ||
      observation.semanticStrength >= 0.5
  );

  return strongObservations.length > 0
    ? strongObservations
    : matchingObservations;
}

function makePattern(params: {
  definition: PatternDefinition;
  observations: OrganizationalObservation[];
  supportingConceptIds: string[];
  supportingMeaningIds: string[];
  conceptReinforcement: number;
}): OrganizationalPattern {
  const {
    definition,
    observations,
    supportingConceptIds,
    supportingMeaningIds,
    conceptReinforcement,
  } = params;

  const baseConfidence = clamp01(
    observations.reduce((sum, observation) => sum + observation.confidence, 0) /
      Math.max(1, observations.length)
  );

  const baseStrength = clamp01(
    observations.reduce((sum, observation) => sum + observation.strength, 0) /
      Math.max(1, observations.length)
  );

  const semanticStrength = clamp01(
    average(observations.map((observation) => observation.semanticStrength))
  );

  return {
    id: `pattern-${definition.type}`,
    type: definition.type,
    label: definition.label,
    description: definition.description,
    observationIds: observations.map((observation) => observation.id),
    sourceEvidenceIds: unique(
      observations.flatMap((observation) => observation.sourceEvidenceIds)
    ),
    relatedEntityIds: unique(
      observations.flatMap((observation) => observation.relatedEntityIds)
    ),
    supportingConceptIds,
    supportingMeaningIds: unique([
      ...supportingMeaningIds,
      ...observations.flatMap((observation) => observation.supportingMeaningIds),
    ]),
    conceptReinforcement,
    confidence: clamp01(
      baseConfidence * 0.5 +
        semanticStrength * 0.2 +
        conceptReinforcement * 0.3
    ),
    strength: clamp01(
      baseStrength * 0.45 + semanticStrength * 0.25 + conceptReinforcement * 0.3
    ),
    possiblePhenomenonTypes: definition.possiblePhenomenonTypes,
  };
}

function inferPatterns(
  observations: OrganizationalObservation[],
  semanticConcepts: SemanticConceptLike[] = []
): OrganizationalPattern[] {
  const patterns: OrganizationalPattern[] = [];

  PATTERN_DEFINITIONS.forEach((definition) => {
    const {
      supportingConceptIds,
      supportingMeaningIds,
      conceptReinforcement,
    } = getConceptSupport({
      meaningIds: definition.meaningIds,
      semanticConcepts,
    });

    const supportingObservations = observationsForDefinition({
      definition,
      observations,
      conceptReinforcement,
    });

    if (supportingObservations.length === 0) return;

    patterns.push(
      makePattern({
        definition,
        observations: supportingObservations,
        supportingConceptIds,
        supportingMeaningIds,
        conceptReinforcement,
      })
    );
  });

  return patterns.sort((a, b) => b.strength - a.strength);
}

export function inferOrganizationalObservations(params: {
  evidence: EvidenceLike[];
  entities?: EntityLike[];
  semanticConcepts?: SemanticConceptLike[];
  now?: string;
}): OrganizationalObservationState {
  const observations = inferObservations({
    evidence: params.evidence,
    entities: params.entities ?? [],
  });

  const patterns = inferPatterns(observations, params.semanticConcepts ?? []);

  return {
    observations,
    patterns,
    lastUpdatedAt: params.now ?? new Date().toISOString(),
  };
}