import type {
  OrganizationalUnderstandingItem,
  OrganizationalUnderstandingState,
} from "../runtime/organizationalUnderstandingState";
import {
  createDefaultUnderstandingMechanism,
  createEmptyDomainRelevance,
  createUnderstandingTitle,
  getConfidenceBand,
  getUnderstandingStatus,
} from "../runtime/organizationalUnderstandingState";

type UnderstandingCandidate = {
  id?: string;
  statement: string;
  confidence?: number;
  evidenceIds?: string[];
  observationIds?: string[];
  beliefIds?: string[];
  themeIds?: string[];
  mechanismIds?: string[];
  contradictionIds?: string[];
  source?: string;
};

type ConsolidationChange = {
  type:
    | "new_understanding"
    | "strengthened_understanding"
    | "weakened_understanding"
    | "stabilized_understanding"
    | "merged_understanding";
  title: string;
  description: string;
  relatedUnderstandingIds: string[];
};

type ConsolidationResult = {
  updatedUnderstandings: OrganizationalUnderstandingItem[];
  changes: ConsolidationChange[];
};

const BAD_UNDERSTANDING_TOKENS = new Set([
  "discovery",
  "treats",
  "strong",
  "belief",
  "believes",
  "industrial",
  "strategic",
  "signal",
  "signals",
  "pattern",
  "patterns",
  "organizational",
]);

const SEMANTIC_GROUPS: Record<string, string[]> = {
  centralized_decision_authority: [
    "decision",
    "authority",
    "approval",
    "leadership",
    "centralized",
    "central",
    "executive",
  ],
  execution_friction: [
    "execution",
    "delivery",
    "implementation",
    "follow",
    "operational",
    "delay",
    "blocked",
  ],
  knowledge_retention: [
    "knowledge",
    "memory",
    "retained",
    "individual",
    "person",
    "systems",
    "institutional",
  ],
  coordination_fragmentation: [
    "coordination",
    "cross",
    "functional",
    "ownership",
    "handoff",
    "fragmented",
    "silo",
  ],
  planning_execution_gap: [
    "planning",
    "strategy",
    "execution",
    "changes",
    "faster",
    "alignment",
  ],
  resource_constraint: [
    "resource",
    "capacity",
    "constraint",
    "limited",
    "staffing",
    "bandwidth",
    "funding",
  ],
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function cleanStatement(value: string): string {
  return value
    .replace(/Discovery treats this as a strong belief:?/gi, "")
    .replace(/Discovery believes:?/gi, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isTokenSoup(value: string): boolean {
  const tokens = normalizeText(value).split(" ").filter(Boolean);

  if (tokens.length <= 2) return true;

  const badTokenCount = tokens.filter((token) =>
    BAD_UNDERSTANDING_TOKENS.has(token)
  ).length;

  return badTokenCount >= Math.max(2, Math.floor(tokens.length * 0.45));
}

function normalizeUnderstandingStatement(value: string): string {
  const cleaned = cleanStatement(value);

  if (!cleaned || isTokenSoup(cleaned)) {
    return "Organizational behavior requires clearer evidence before forming a durable understanding.";
  }

  const trimmed = cleaned.replace(/[.;:,\s]+$/g, "");
  const sentence = trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

  return `${sentence}.`;
}

function createSummary(statement: string): string {
  return statement;
}

function createWhyItMatters(statement: string): string {
  const normalized = normalizeText(statement);

  if (
    normalized.includes("decision") ||
    normalized.includes("authority") ||
    normalized.includes("approval")
  ) {
    return "Decision structure shapes speed, accountability, and the organization's ability to act without unnecessary escalation.";
  }

  if (
    normalized.includes("execution") ||
    normalized.includes("delivery") ||
    normalized.includes("implementation")
  ) {
    return "Execution quality determines whether strategic intent becomes durable operational progress.";
  }

  if (
    normalized.includes("knowledge") ||
    normalized.includes("memory") ||
    normalized.includes("retained")
  ) {
    return "Knowledge retention affects continuity, resilience, and the organization's ability to preserve understanding through change.";
  }

  if (
    normalized.includes("coordination") ||
    normalized.includes("ownership") ||
    normalized.includes("cross")
  ) {
    return "Coordination patterns affect accountability, handoffs, and the organization's ability to work across functions.";
  }

  return "This may represent a recurring organizational behavior that affects how the organization understands, decides, and acts.";
}

function createImplications(statement: string): string[] {
  const normalized = normalizeText(statement);

  if (
    normalized.includes("decision") ||
    normalized.includes("authority") ||
    normalized.includes("approval")
  ) {
    return [
      "Decisions may slow when senior leaders are unavailable.",
      "Teams may hesitate to act without explicit approval.",
      "Accountability may concentrate around a small number of decision makers.",
    ];
  }

  if (
    normalized.includes("execution") ||
    normalized.includes("delivery") ||
    normalized.includes("implementation")
  ) {
    return [
      "Plans may outpace operational capacity.",
      "Priorities may require stronger translation into execution routines.",
      "Progress may depend on clearer ownership and follow-through.",
    ];
  }

  if (
    normalized.includes("knowledge") ||
    normalized.includes("memory") ||
    normalized.includes("retained")
  ) {
    return [
      "Turnover may create knowledge loss.",
      "Important context may remain informal or person-dependent.",
      "The organization may need stronger systems for preserving institutional memory.",
    ];
  }

  if (
    normalized.includes("coordination") ||
    normalized.includes("ownership") ||
    normalized.includes("cross")
  ) {
    return [
      "Cross-functional work may require clearer ownership.",
      "Handoffs may create avoidable friction.",
      "Teams may interpret responsibility differently across functions.",
    ];
  }

  return [];
}

function tokenSimilarity(a: string, b: string): number {
  const aTokens = new Set(normalizeText(a).split(" ").filter(Boolean));
  const bTokens = new Set(normalizeText(b).split(" ").filter(Boolean));

  if (!aTokens.size || !bTokens.size) return 0;

  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;

  return overlap / union;
}

function semanticGroupKey(statement: string): string | undefined {
  const normalized = normalizeText(statement);

  for (const [group, terms] of Object.entries(SEMANTIC_GROUPS)) {
    const matches = terms.filter((term) => normalized.includes(term)).length;
    if (matches >= 2) return group;
  }

  return undefined;
}

function semanticSimilarity(a: string, b: string): number {
  const aGroup = semanticGroupKey(a);
  const bGroup = semanticGroupKey(b);

  if (aGroup && bGroup && aGroup === bGroup) return 0.82;

  return tokenSimilarity(a, b);
}

function isContradictory(candidate: string, existing: string): boolean {
  const candidateText = normalizeText(candidate);
  const existingText = normalizeText(existing);

  const improvementSignal =
    candidateText.includes("improved") ||
    candidateText.includes("resolved") ||
    candidateText.includes("reduced") ||
    candidateText.includes("no longer") ||
    candidateText.includes("eliminated") ||
    candidateText.includes("accelerated");

  const constraintSignal =
    existingText.includes("delay") ||
    existingText.includes("constraint") ||
    existingText.includes("risk") ||
    existingText.includes("slowing") ||
    existingText.includes("blocked") ||
    existingText.includes("limited") ||
    existingText.includes("friction");

  return improvementSignal && constraintSignal;
}

function clampConfidence(value: number): number {
  return Math.max(0.15, Math.min(0.94, Number(value.toFixed(2))));
}

function clampMetric(value: number): number {
  return Math.max(0, Math.min(1, Number(value.toFixed(2))));
}

function calibrateConfidence(params: {
  existingConfidence?: number;
  candidateConfidence?: number;
  supportCount: number;
  evidenceCount: number;
  observationCount: number;
  mechanismCount: number;
  contradictionCount: number;
  contradictory: boolean;
}): number {
  const existingConfidence = params.existingConfidence ?? 0.55;
  const candidateConfidence = params.candidateConfidence ?? 0.55;

  const supportSignal = Math.min(0.16, params.supportCount * 0.025);
  const evidenceSignal = Math.min(0.18, params.evidenceCount * 0.02);
  const observationSignal = Math.min(0.14, params.observationCount * 0.015);
  const mechanismSignal = Math.min(0.1, params.mechanismCount * 0.025);
  const contradictionPenalty = Math.min(
    0.28,
    params.contradictionCount * 0.07 + (params.contradictory ? 0.12 : 0)
  );

  return clampConfidence(
    existingConfidence * 0.52 +
      candidateConfidence * 0.18 +
      0.18 +
      supportSignal +
      evidenceSignal +
      observationSignal +
      mechanismSignal -
      contradictionPenalty
  );
}

function deriveStrength(confidence: number, supportCount: number): number {
  return clampMetric(confidence * 0.75 + Math.min(0.2, supportCount * 0.05));
}

function deriveStability(params: {
  confidence: number;
  supportCount: number;
  contradictionCount: number;
}): number {
  return clampMetric(
    params.confidence * 0.6 +
      Math.min(0.3, params.supportCount * 0.075) -
      Math.min(0.2, params.contradictionCount * 0.05)
  );
}

function deriveCoverage(params: {
  evidenceCount: number;
  observationCount: number;
  mechanismCount: number;
  beliefCount: number;
}): number {
  return clampMetric(
    Math.min(0.35, params.evidenceCount * 0.05) +
      Math.min(0.25, params.observationCount * 0.035) +
      Math.min(0.25, params.mechanismCount * 0.08) +
      Math.min(0.15, params.beliefCount * 0.075)
  );
}

function deriveNovelty(params: {
  confidence: number;
  supportCount: number;
  similarExistingCount: number;
}): number {
  return clampMetric(
    0.35 -
      Math.min(0.2, params.similarExistingCount * 0.08) +
      Math.min(0.15, params.confidence * 0.15) -
      Math.min(0.1, params.supportCount * 0.015)
  );
}

function deriveExplanatoryPower(params: {
  confidence: number;
  mechanismCount: number;
  beliefCount: number;
  evidenceCount: number;
}): number {
  return clampMetric(
    params.confidence * 0.45 +
      Math.min(0.25, params.mechanismCount * 0.08) +
      Math.min(0.2, params.beliefCount * 0.08) +
      Math.min(0.1, params.evidenceCount * 0.025)
  );
}

function createId(statement: string): string {
  const normalized = normalizeText(statement).slice(0, 56).replace(/\s+/g, "-");
  return `understanding-${normalized}-${Date.now()}`;
}

function mergeIds(existing: string[], incoming?: string[]): string[] {
  return Array.from(new Set([...existing, ...(incoming ?? [])]));
}

function getSupportCount(params: {
  supportCount: number;
  evidenceIds: string[];
  observationIds: string[];
  beliefIds: string[];
  themeIds: string[];
  mechanismIds: string[];
}): number {
  return Math.max(
    params.supportCount,
    params.evidenceIds.length,
    params.observationIds.length,
    params.beliefIds.length,
    params.themeIds.length,
    params.mechanismIds.length
  );
}

function completeCanonicalUnderstanding(
  understanding: OrganizationalUnderstandingItem
): OrganizationalUnderstandingItem {
  const statement = normalizeUnderstandingStatement(understanding.statement);

  const coverage =
    understanding.coverage ??
    deriveCoverage({
      evidenceCount: understanding.evidenceIds.length,
      observationCount: understanding.observationIds.length,
      mechanismCount: understanding.mechanismIds.length,
      beliefCount: understanding.beliefIds.length,
    });

  const explanatoryPower =
    understanding.explanatoryPower ??
    deriveExplanatoryPower({
      confidence: understanding.confidence,
      mechanismCount: understanding.mechanismIds.length,
      beliefCount: understanding.beliefIds.length,
      evidenceCount: understanding.evidenceIds.length,
    });

  return {
    ...understanding,

    title: understanding.title || createUnderstandingTitle(statement),
    statement,
    summary: createSummary(statement),
    mechanism:
      understanding.mechanism || createDefaultUnderstandingMechanism(statement),

    strength:
      understanding.strength ??
      deriveStrength(understanding.confidence, understanding.supportCount),

    stability:
      understanding.stability ??
      deriveStability({
        confidence: understanding.confidence,
        supportCount: understanding.supportCount,
        contradictionCount: understanding.contradictionIds.length,
      }),

    coverage,
    novelty:
      understanding.novelty ??
      deriveNovelty({
        confidence: understanding.confidence,
        supportCount: understanding.supportCount,
        similarExistingCount: 0,
      }),
    explanatoryPower,

    domainRelevance:
      understanding.domainRelevance ?? createEmptyDomainRelevance(),

    recommendationIds: understanding.recommendationIds ?? [],
    missingInformation: understanding.missingInformation ?? [],

    supportingDynamics: understanding.supportingDynamics ?? [],
    supportingCapabilities: understanding.supportingCapabilities ?? [],
    investigationIds: understanding.investigationIds ?? [],

    whyItMatters: understanding.whyItMatters || createWhyItMatters(statement),
    implications: understanding.implications ?? [],
    openQuestions: understanding.openQuestions ?? [],
  };
}

export function consolidateUnderstanding(
  currentState: OrganizationalUnderstandingState,
  candidates: UnderstandingCandidate[]
): ConsolidationResult {
  const now = new Date().toISOString();
  const updatedUnderstandings = currentState.currentUnderstandings.map(
    completeCanonicalUnderstanding
  );
  const changes: ConsolidationChange[] = [];

  for (const candidate of candidates) {
    const normalizedStatement = normalizeUnderstandingStatement(
      candidate.statement
    );

    const bestMatch = updatedUnderstandings
      .map((existing) => ({
        existing,
        similarity: semanticSimilarity(normalizedStatement, existing.statement),
      }))
      .sort((a, b) => b.similarity - a.similarity)[0];

    if (bestMatch && bestMatch.similarity >= 0.5) {
      const existing = bestMatch.existing;
      const previousConfidence = existing.confidence;
      const contradictory = isContradictory(
        normalizedStatement,
        existing.statement
      );

      existing.evidenceIds = mergeIds(existing.evidenceIds, candidate.evidenceIds);
      existing.observationIds = mergeIds(
        existing.observationIds,
        candidate.observationIds
      );
      existing.beliefIds = mergeIds(existing.beliefIds, candidate.beliefIds);
      existing.themeIds = mergeIds(existing.themeIds, candidate.themeIds);
      existing.mechanismIds = mergeIds(
        existing.mechanismIds,
        candidate.mechanismIds
      );
      existing.contradictionIds = mergeIds(
        existing.contradictionIds,
        candidate.contradictionIds
      );

      const nextSupportCount = contradictory
        ? existing.supportCount
        : getSupportCount({
            supportCount: existing.supportCount + 1,
            evidenceIds: existing.evidenceIds,
            observationIds: existing.observationIds,
            beliefIds: existing.beliefIds,
            themeIds: existing.themeIds,
            mechanismIds: existing.mechanismIds,
          });

      const nextConfidence = calibrateConfidence({
        existingConfidence: existing.confidence,
        candidateConfidence: candidate.confidence,
        supportCount: nextSupportCount,
        evidenceCount: existing.evidenceIds.length,
        observationCount: existing.observationIds.length,
        mechanismCount: existing.mechanismIds.length,
        contradictionCount: existing.contradictionIds.length,
        contradictory,
      });

      existing.statement = normalizeUnderstandingStatement(existing.statement);
      existing.title = existing.title || createUnderstandingTitle(existing.statement);
      existing.summary = createSummary(existing.statement);
      existing.mechanism =
        existing.mechanism ||
        createDefaultUnderstandingMechanism(existing.statement);
      existing.whyItMatters = createWhyItMatters(existing.statement);
      existing.implications = createImplications(existing.statement);
      existing.confidence = nextConfidence;
      existing.confidenceBand = getConfidenceBand(nextConfidence);
      existing.strength = deriveStrength(nextConfidence, nextSupportCount);
      existing.stability = deriveStability({
        confidence: nextConfidence,
        supportCount: nextSupportCount,
        contradictionCount: existing.contradictionIds.length,
      });
      existing.coverage = deriveCoverage({
        evidenceCount: existing.evidenceIds.length,
        observationCount: existing.observationIds.length,
        mechanismCount: existing.mechanismIds.length,
        beliefCount: existing.beliefIds.length,
      });
      existing.novelty = deriveNovelty({
        confidence: nextConfidence,
        supportCount: nextSupportCount,
        similarExistingCount: 1,
      });
      existing.explanatoryPower = deriveExplanatoryPower({
        confidence: nextConfidence,
        mechanismCount: existing.mechanismIds.length,
        beliefCount: existing.beliefIds.length,
        evidenceCount: existing.evidenceIds.length,
      });
      existing.domainRelevance =
        existing.domainRelevance ?? createEmptyDomainRelevance();
      existing.recommendationIds = existing.recommendationIds ?? [];
      existing.missingInformation = existing.missingInformation ?? [];
      existing.supportingDynamics = existing.supportingDynamics ?? [];
      existing.supportingCapabilities = existing.supportingCapabilities ?? [];
      existing.investigationIds = existing.investigationIds ?? [];
      existing.status = contradictory
        ? "weakening"
        : getUnderstandingStatus({
            confidence: nextConfidence,
            supportCount: nextSupportCount,
          });

      existing.supportCount = nextSupportCount;
      existing.lastUpdatedAt = now;

      existing.history = [
        ...existing.history,
        {
          date: now,
          event: contradictory ? "weakened" : "strengthened",
          previousConfidence,
          nextConfidence,
          reason: contradictory
            ? `Evidence contradicted this understanding: "${normalizedStatement}"`
            : `New experience reinforced this understanding: "${normalizedStatement}"`,
        },
      ];

      changes.push({
        type: contradictory
          ? "weakened_understanding"
          : nextSupportCount >= 4 && nextConfidence >= 0.75
            ? "stabilized_understanding"
            : bestMatch.similarity >= 0.75
              ? "merged_understanding"
              : "strengthened_understanding",
        title: contradictory
          ? "Understanding weakened"
          : bestMatch.similarity >= 0.75
            ? "Understanding merged"
            : "Understanding strengthened",
        description: contradictory
          ? `Evidence may contradict this understanding: "${existing.statement}"`
          : `Related organizational evidence was merged into: "${existing.statement}"`,
        relatedUnderstandingIds: [existing.id],
      });

      continue;
    }

    const confidence = calibrateConfidence({
      candidateConfidence: candidate.confidence,
      supportCount: 1,
      evidenceCount: candidate.evidenceIds?.length ?? 0,
      observationCount: candidate.observationIds?.length ?? 0,
      mechanismCount: candidate.mechanismIds?.length ?? 0,
      contradictionCount: candidate.contradictionIds?.length ?? 0,
      contradictory: false,
    });

    const newUnderstanding: OrganizationalUnderstandingItem = {
      id: candidate.id ?? createId(normalizedStatement),

      title: createUnderstandingTitle(normalizedStatement),
      statement: normalizedStatement,
      summary: createSummary(normalizedStatement),
      mechanism: createDefaultUnderstandingMechanism(normalizedStatement),

      confidence,
      confidenceBand: getConfidenceBand(confidence),
      strength: deriveStrength(confidence, 1),
      stability: deriveStability({
        confidence,
        supportCount: 1,
        contradictionCount: candidate.contradictionIds?.length ?? 0,
      }),

      coverage: deriveCoverage({
        evidenceCount: candidate.evidenceIds?.length ?? 0,
        observationCount: candidate.observationIds?.length ?? 0,
        mechanismCount: candidate.mechanismIds?.length ?? 0,
        beliefCount: candidate.beliefIds?.length ?? 0,
      }),
      novelty: deriveNovelty({
        confidence,
        supportCount: 1,
        similarExistingCount: 0,
      }),
      explanatoryPower: deriveExplanatoryPower({
        confidence,
        mechanismCount: candidate.mechanismIds?.length ?? 0,
        beliefCount: candidate.beliefIds?.length ?? 0,
        evidenceCount: candidate.evidenceIds?.length ?? 0,
      }),

      domainRelevance: createEmptyDomainRelevance(),

      status: getUnderstandingStatus({ confidence, supportCount: 1 }),

      firstSeenAt: now,
      lastUpdatedAt: now,
      supportCount: 1,

      evidenceIds: candidate.evidenceIds ?? [],
      observationIds: candidate.observationIds ?? [],
      beliefIds: candidate.beliefIds ?? [],
      themeIds: candidate.themeIds ?? [],
      mechanismIds: candidate.mechanismIds ?? [],
      contradictionIds: candidate.contradictionIds ?? [],
      recommendationIds: [],

      supportingDynamics: [],
      supportingCapabilities: [],
      investigationIds: [],

      missingInformation: [],

      whyItMatters: createWhyItMatters(normalizedStatement),
      openQuestions: [
        "Will future organizational experience reinforce, weaken, or clarify this understanding?",
      ],
      implications: createImplications(normalizedStatement),

      history: [
        {
          date: now,
          event: "created",
          nextConfidence: confidence,
          reason: `New organizational understanding created from evidence: "${normalizedStatement}"`,
        },
      ],
    };

    updatedUnderstandings.push(newUnderstanding);

    changes.push({
      type: "new_understanding",
      title: "New understanding created",
      description: `A new durable organizational understanding was formed: "${normalizedStatement}"`,
      relatedUnderstandingIds: [newUnderstanding.id],
    });
  }

  return {
    updatedUnderstandings,
    changes,
  };
}