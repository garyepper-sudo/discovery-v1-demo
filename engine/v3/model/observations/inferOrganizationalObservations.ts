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

const PATTERN_MEANING_HINTS: Record<OrganizationalPatternType, string[]> = {
  documentation_distributed_across_systems: [
    "knowledge_continuity",
    "organizational_memory",
    "communication",
    "coordination",
  ],
  work_is_being_repeated: [
    "knowledge_continuity",
    "organizational_memory",
    "execution_capacity",
    "organizational_agility",
  ],
  knowledge_not_transferring: [
    "knowledge_continuity",
    "organizational_memory",
    "communication",
    "coordination",
  ],
  decisions_wait_for_approval: [
    "decision_authority",
    "leadership_dependency",
    "governance",
    "organizational_agility",
  ],
  ownership_is_unclear: ["ownership", "accountability", "coordination"],
  learning_is_not_compounding: [
    "knowledge_continuity",
    "organizational_memory",
    "innovation_flow",
  ],
  coordination_is_fragmented: ["coordination", "alignment", "communication"],
  generic_pattern: [],
};

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
        confidence: clamp01(0.55 + matchedTerms.length * 0.08),
        strength: clamp01(0.5 + matchedTerms.length * 0.1),
      });
    });
  });

  return observations;
}

function getConceptReinforcement(params: {
  type: OrganizationalPatternType;
  semanticConcepts: SemanticConceptLike[];
}): {
  supportingConceptIds: string[];
  supportingMeaningIds: string[];
  conceptReinforcement: number;
} {
  const { type, semanticConcepts } = params;
  const relevantMeaningIds = new Set(PATTERN_MEANING_HINTS[type] ?? []);

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
    supportingConcepts.flatMap((concept) => concept.supportingMeaningIds ?? [])
  );

  const conceptReinforcement = clamp01(
    average(
      supportingConcepts.map(
        (concept) =>
          concept.emergenceScore ?? concept.strength ?? concept.confidence ?? 0
      )
    )
  );

  return {
    supportingConceptIds,
    supportingMeaningIds,
    conceptReinforcement,
  };
}

function makePattern(params: {
  type: OrganizationalPatternType;
  label: string;
  description: string;
  observations: OrganizationalObservation[];
  possiblePhenomenonTypes: string[];
  semanticConcepts?: SemanticConceptLike[];
}): OrganizationalPattern {
  const {
    type,
    label,
    description,
    observations,
    possiblePhenomenonTypes,
    semanticConcepts = [],
  } = params;

  const baseConfidence = clamp01(
    observations.reduce((sum, observation) => sum + observation.confidence, 0) /
      Math.max(1, observations.length)
  );

  const baseStrength = clamp01(
    observations.reduce((sum, observation) => sum + observation.strength, 0) /
      Math.max(1, observations.length)
  );

  const {
    supportingConceptIds,
    supportingMeaningIds,
    conceptReinforcement,
  } = getConceptReinforcement({
    type,
    semanticConcepts,
  });

  return {
    id: `pattern-${type}`,
    type,
    label,
    description,
    observationIds: observations.map((observation) => observation.id),
    sourceEvidenceIds: unique(
      observations.flatMap((observation) => observation.sourceEvidenceIds)
    ),
    relatedEntityIds: unique(
      observations.flatMap((observation) => observation.relatedEntityIds)
    ),
    supportingConceptIds,
    supportingMeaningIds,
    conceptReinforcement,
    confidence: clamp01(baseConfidence * 0.75 + conceptReinforcement * 0.25),
    strength: clamp01(baseStrength * 0.7 + conceptReinforcement * 0.3),
    possiblePhenomenonTypes,
  };
}

function inferPatterns(
  observations: OrganizationalObservation[],
  semanticConcepts: SemanticConceptLike[] = []
): OrganizationalPattern[] {
  const byType = new Map<
    OrganizationalObservationType,
    OrganizationalObservation[]
  >();

  observations.forEach((observation) => {
    const existing = byType.get(observation.type) ?? [];
    existing.push(observation);
    byType.set(observation.type, existing);
  });

  const patterns: OrganizationalPattern[] = [];

  const documentationObservations = [
    ...(byType.get("distributed_documentation") ?? []),
    ...(byType.get("knowledge_stored_locally") ?? []),
  ];

  if (documentationObservations.length > 0) {
    patterns.push(
      makePattern({
        type: "documentation_distributed_across_systems",
        label: "Documentation Distributed Across Systems",
        description:
          "Multiple observations suggest knowledge is distributed across systems, documents, or people.",
        observations: documentationObservations,
        possiblePhenomenonTypes: [
          "knowledge_fragmentation",
          "scattered_documentation",
          "institutional_memory_loss",
        ],
        semanticConcepts,
      })
    );
  }

  const repeatedWorkObservations = [
    ...(byType.get("duplicated_work") ?? []),
    ...(byType.get("repeated_experiment") ?? []),
  ];

  if (repeatedWorkObservations.length > 0) {
    patterns.push(
      makePattern({
        type: "work_is_being_repeated",
        label: "Work Is Being Repeated",
        description:
          "Multiple observations suggest the organization may be repeating work or experiments.",
        observations: repeatedWorkObservations,
        possiblePhenomenonTypes: [
          "duplicated_work",
          "repeated_experimentation",
          "organizational_learning_failure",
        ],
        semanticConcepts,
      })
    );
  }

  const transferObservations = [
    ...(byType.get("weak_handoff") ?? []),
    ...(byType.get("knowledge_stored_locally") ?? []),
    ...(byType.get("learning_not_reused") ?? []),
  ];

  if (transferObservations.length > 0) {
    patterns.push(
      makePattern({
        type: "knowledge_not_transferring",
        label: "Knowledge Is Not Transferring",
        description:
          "Multiple observations suggest knowledge is not moving reliably across people, teams, or time.",
        observations: transferObservations,
        possiblePhenomenonTypes: [
          "weak_knowledge_transfer",
          "institutional_memory_loss",
          "organizational_learning_failure",
        ],
        semanticConcepts,
      })
    );
  }

  const approvalObservations = [
    ...(byType.get("approval_waiting") ?? []),
    ...(byType.get("executive_escalation") ?? []),
  ];

  if (approvalObservations.length > 0) {
    patterns.push(
      makePattern({
        type: "decisions_wait_for_approval",
        label: "Decisions Wait For Approval",
        description:
          "Multiple observations suggest work or decisions are waiting on approval or escalation.",
        observations: approvalObservations,
        possiblePhenomenonTypes: ["approval_bottleneck", "decision_latency"],
        semanticConcepts,
      })
    );
  }

  return patterns;
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