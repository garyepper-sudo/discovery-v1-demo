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
};

const CONCEPT_RECIPES: ConceptRecipe[] = [
  {
    id: "organizational-continuity",
    statement: "Organizational continuity is weakening.",
    summary:
      "Knowledge continuity and localized learning suggest that the organization is not reliably preserving what it learns.",
    dynamicLabels: ["Knowledge Continuity Weak", "Learning Localized"],
  },
  {
    id: "centralized-governance-bottleneck",
    statement: "Centralized governance is slowing execution.",
    summary:
      "Centralized authority and decision latency suggest that execution depends too heavily on approval flow.",
    dynamicLabels: ["Authority Centralized", "Decision Latency"],
  },
  {
    id: "cross-functional-execution-friction",
    statement: "Cross-functional execution is fragmented.",
    summary:
      "Coordination fragmentation and diffuse ownership suggest that work moves locally but weakens across handoffs.",
    dynamicLabels: ["Coordination Fragmented", "Ownership Diffuse"],
  },
  {
    id: "execution-capacity-pressure",
    statement: "Execution capacity is under pressure.",
    summary:
      "Execution constraints and strained resource allocation suggest that demand may be exceeding operating capacity.",
    dynamicLabels: ["Execution Constrained", "Resource Allocation Strained"],
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
  },
];

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function findDynamicsForRecipe(
  recipe: ConceptRecipe,
  dynamics: OrganizationalDynamic[]
): OrganizationalDynamic[] {
  const requiredLabels = new Set(recipe.dynamicLabels.map(normalize));

  return dynamics.filter((dynamic) =>
    requiredLabels.has(normalize(dynamic.label || dynamic.statement))
  );
}

function createConceptFromDynamics(params: {
  recipe: ConceptRecipe;
  dynamics: OrganizationalDynamic[];
  totalDynamics: number;
}): OrganizationalConcept {
  const { recipe, dynamics, totalDynamics } = params;

  const confidence = clamp(
    average(dynamics.map((dynamic) => dynamic.confidence ?? 0.65))
  );

  const coverage = clamp(dynamics.length / Math.max(totalDynamics, 1));

  const stability = clamp(
    average(
      dynamics.map((dynamic) =>
        dynamic.status === "stable"
          ? 1
          : dynamic.status === "reinforced"
          ? 0.75
          : 0.35
      )
    )
  );

  const novelty = clamp(1 - stability);

  const explanatoryPower = clamp(
    confidence * 0.45 + coverage * 0.25 + stability * 0.3
  );

  const supportingUnderstandingIds = unique(
    dynamics.flatMap((dynamic) => dynamic.supportingUnderstandingIds ?? [])
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
  understandings: UnderstandingLike[]
): OrganizationalConcept[] {
  if (!understandings.length) return [];

  const confidence = clamp(
    average(
      understandings.map(
        (understanding) =>
          understanding.confidence ?? understanding.strength ?? 0.5
      )
    )
  );

  return [
    {
      id: "concept-unstructured-understanding-pattern",
      statement: "A coherent organizational pattern is emerging.",
      summary:
        "Discovery detected related understandings, but structured dynamics were not available for graph compression.",
      understandingIds: understandings.map((understanding) => understanding.id),
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

export function runSemanticCompression(params: {
  dynamics?: OrganizationalDynamic[];
  understandings?: UnderstandingLike[];
}): OrganizationalConcept[] {
  const { dynamics = [], understandings = [] } = params;

  if (dynamics.length === 0) {
    return createFallbackConcept(understandings);
  }

  return CONCEPT_RECIPES.map((recipe) => {
    const matchedDynamics = findDynamicsForRecipe(recipe, dynamics);

    if (matchedDynamics.length === 0) return null;

    return createConceptFromDynamics({
      recipe,
      dynamics: matchedDynamics,
      totalDynamics: dynamics.length,
    });
  })
    .filter((concept): concept is OrganizationalConcept => Boolean(concept))
    .sort((a, b) => b.explanatoryPower - a.explanatoryPower);
}