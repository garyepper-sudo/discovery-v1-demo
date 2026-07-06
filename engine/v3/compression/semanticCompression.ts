import type { OrganizationalDynamic } from "../functional/functionalInterpretation";
import type { OrganizationalConcept } from "./types";

type UnderstandingLike = {
  id: string;
  label?: string;
  summary?: string;
  description?: string;
  confidence?: number;
  strength?: number;
  status?: string;
};

type ConceptRecipe = {
  id: string;
  statement: string;
  summary: string;
  dynamicLabels: string[];
  keywords?: string[];
};

const CONCEPT_RECIPES: ConceptRecipe[] = [
  {
    id: "organizational-continuity",
    statement: "Organizational continuity is weakening.",
    summary:
      "Knowledge continuity and localized learning suggest that the organization is not reliably preserving what it learns.",
    dynamicLabels: ["Knowledge Continuity Weak", "Learning Localized"],
    keywords: [
      "knowledge",
      "documentation",
      "memory",
      "learning",
      "handoff",
      "transfer",
      "fragmentation",
      "continuity",
    ],
  },
  {
    id: "centralized-governance-bottleneck",
    statement: "Centralized governance is slowing execution.",
    summary:
      "Centralized authority and decision latency suggest that execution depends too heavily on approval flow.",
    dynamicLabels: ["Authority Centralized", "Decision Latency"],
    keywords: [
      "approval",
      "decision",
      "latency",
      "centralized",
      "centralised",
      "authority",
      "governance",
      "bottleneck",
    ],
  },
  {
    id: "cross-functional-execution-friction",
    statement: "Cross-functional execution is fragmented.",
    summary:
      "Coordination fragmentation and diffuse ownership suggest that work moves locally but weakens across handoffs.",
    dynamicLabels: ["Coordination Fragmented", "Ownership Diffuse"],
    keywords: [
      "coordination",
      "handoff",
      "ownership",
      "fragmented",
      "cross-functional",
      "cross functional",
      "alignment",
      "silo",
    ],
  },
  {
    id: "execution-capacity-pressure",
    statement: "Execution capacity is under pressure.",
    summary:
      "Execution constraints and strained resource allocation suggest that demand may be exceeding operating capacity.",
    dynamicLabels: ["Execution Constrained", "Resource Allocation Strained"],
    keywords: [
      "execution",
      "capacity",
      "resource",
      "pressure",
      "burnout",
      "constraint",
      "delivery",
      "operational",
    ],
  },
  {
    id: "operational-alignment-risk",
    statement: "Operational alignment is at risk.",
    summary:
      "Fragmented coordination, unclear prioritization, and inconsistent communication suggest weak shared operating alignment.",
    dynamicLabels: [
      "Coordination Fragmented",
      "Prioritization Unclear",
      "Communication Inconsistent",
    ],
    keywords: [
      "alignment",
      "priority",
      "prioritization",
      "communication",
      "coordination",
      "clarity",
      "narrative",
      "inconsistent",
    ],
  },
];

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalize(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function normalizeText(...values: Array<string | undefined>): string {
  return values.map(normalize).filter(Boolean).join(" ");
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function countKeywordMatches(text: string, keywords: string[]): number {
  if (!text || keywords.length === 0) return 0;

  return keywords.filter((keyword) => text.includes(normalize(keyword))).length;
}

function dynamicText(dynamic: OrganizationalDynamic): string {
  return normalizeText(
    dynamic.label,
    dynamic.statement,
    dynamic.description,
    dynamic.status,
  );
}

function understandingText(understanding: UnderstandingLike): string {
  return normalizeText(
    understanding.label,
    understanding.summary,
    understanding.description,
    understanding.status,
  );
}

function dynamicMatchScore(
  recipe: ConceptRecipe,
  dynamic: OrganizationalDynamic,
): number {
  const label = normalize(dynamic.label || dynamic.statement);
  const requiredLabels = new Set(recipe.dynamicLabels.map(normalize));

  if (requiredLabels.has(label)) return 1;

  const text = dynamicText(dynamic);
  const keywordMatches = countKeywordMatches(text, recipe.keywords ?? []);

  if (keywordMatches >= 2) return 0.8;
  if (keywordMatches === 1) return 0.55;

  return 0;
}

function findDynamicsForRecipe(
  recipe: ConceptRecipe,
  dynamics: OrganizationalDynamic[],
): OrganizationalDynamic[] {
  return asArray(dynamics).filter((dynamic) => dynamicMatchScore(recipe, dynamic) > 0);
}

function createConceptFromDynamics(params: {
  recipe: ConceptRecipe;
  dynamics: OrganizationalDynamic[];
  totalDynamics: number;
}): OrganizationalConcept {
  const { recipe, dynamics, totalDynamics } = params;

  const confidence = clamp(
    average(dynamics.map((dynamic) => dynamic.confidence ?? 0.65)),
  );

  const coverage = clamp(dynamics.length / Math.max(totalDynamics, 1));

  const stability = clamp(
    average(
      dynamics.map((dynamic) =>
        dynamic.status === "stable"
          ? 1
          : dynamic.status === "reinforced"
          ? 0.75
          : 0.35,
      ),
    ),
  );

  const novelty = clamp(1 - stability);

  const explanatoryPower = clamp(
    confidence * 0.45 + coverage * 0.25 + stability * 0.3,
  );

  const supportingUnderstandingIds = unique(
    dynamics.flatMap((dynamic) =>
      asArray(dynamic.supportingUnderstandingIds),
    ),
  );

  return {
    id: `concept-${recipe.id}`,
    statement: recipe.statement,
    summary: recipe.summary,
    understandingIds: supportingUnderstandingIds,
    confidence,
    coverage,
    stability,
    novelty,
    explanatoryPower,
    status:
      stability > 0.8
        ? "stable"
        : stability > 0.55
        ? "reinforced"
        : "new",
    explanation:
      "Discovery formed this concept by compressing structured organizational dynamics rather than reinterpreting prose.",
  };
}

function createFallbackConcept(
  understandings: UnderstandingLike[],
): OrganizationalConcept[] {
  const safeUnderstandings = asArray(understandings);

  if (!safeUnderstandings.length) return [];

  const confidence = clamp(
    average(
      safeUnderstandings.map(
        (understanding) =>
          understanding.confidence ?? understanding.strength ?? 0.5,
      ),
    ),
  );

  return [
    {
      id: "concept-unstructured-understanding-pattern",
      statement: "A coherent organizational pattern is emerging.",
      summary:
        "Discovery detected related understandings, but structured dynamics were not available for graph compression.",
      understandingIds: safeUnderstandings.map((understanding) => understanding.id),
      confidence,
      coverage: 1,
      stability: 0.35,
      novelty: 0.65,
      explanatoryPower: confidence,
      status: "new",
      explanation:
        "Discovery used a temporary fallback because this runtime path has not yet passed Organizational Dynamics into semantic compression.",
    },
  ];
}

function createThematicFallbackConcepts(
  understandings: UnderstandingLike[],
): OrganizationalConcept[] {
  const safeUnderstandings = asArray(understandings);

  return CONCEPT_RECIPES.flatMap((recipe) => {
    const matchedUnderstandings = safeUnderstandings.filter((understanding) => {
      const text = understandingText(understanding);
      return countKeywordMatches(text, recipe.keywords ?? []) > 0;
    });

    if (matchedUnderstandings.length === 0) return [];

    const confidence = clamp(
      average(
        matchedUnderstandings.map(
          (understanding) =>
            understanding.confidence ?? understanding.strength ?? 0.5,
        ),
      ),
    );

    const coverage = clamp(
      matchedUnderstandings.length / Math.max(1, safeUnderstandings.length),
    );

    const stability = clamp(
      average(
        matchedUnderstandings.map((understanding) =>
          understanding.status === "stable"
            ? 1
            : understanding.status === "reinforced"
            ? 0.75
            : 0.35,
        ),
      ),
    );

    return [
      {
        id: `concept-${recipe.id}`,
        statement: recipe.statement,
        summary: recipe.summary,
        understandingIds: matchedUnderstandings.map(
          (understanding) => understanding.id,
        ),
        confidence,
        coverage,
        stability,
        novelty: clamp(1 - stability),
        explanatoryPower: clamp(
          confidence * 0.45 + coverage * 0.25 + stability * 0.3,
        ),
        status:
          stability > 0.8
            ? "stable"
            : stability > 0.55
            ? "reinforced"
            : "new",
        explanation:
          "Discovery formed this concept by compressing recurring thematic understanding signals.",
      } satisfies OrganizationalConcept,
    ];
  });
}

export function runSemanticCompression(params: {
  dynamics?: OrganizationalDynamic[];
  understandings?: UnderstandingLike[];
}): OrganizationalConcept[] {
  const dynamics = asArray(params.dynamics);
  const understandings = asArray(params.understandings);

  if (dynamics.length === 0) {
    const thematicFallbacks = createThematicFallbackConcepts(understandings);

    if (thematicFallbacks.length > 0) {
      return thematicFallbacks.sort(
        (a, b) => b.explanatoryPower - a.explanatoryPower,
      );
    }

    return createFallbackConcept(understandings);
  }

  const conceptMap = new Map<string, OrganizationalConcept>();

  for (const recipe of CONCEPT_RECIPES) {
    const matchedDynamics = findDynamicsForRecipe(recipe, dynamics);

    if (matchedDynamics.length === 0) continue;

    const concept = createConceptFromDynamics({
      recipe,
      dynamics: matchedDynamics,
      totalDynamics: dynamics.length,
    });

    conceptMap.set(concept.id, concept);
  }

  for (const fallbackConcept of createThematicFallbackConcepts(understandings)) {
    const existing = conceptMap.get(fallbackConcept.id);

    if (
      !existing ||
      fallbackConcept.explanatoryPower > existing.explanatoryPower
    ) {
      conceptMap.set(fallbackConcept.id, fallbackConcept);
    }
  }

  return Array.from(conceptMap.values()).sort(
    (a, b) => b.explanatoryPower - a.explanatoryPower,
  );
}