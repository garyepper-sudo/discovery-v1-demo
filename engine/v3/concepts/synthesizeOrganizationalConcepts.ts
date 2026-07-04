import type { MeaningSignal, OrganizationalMeaningId } from "../meaning/types";

export type OrganizationalConcept = {
  id: string;
  label: string;
  statement: string;
  explanation: string;
  supportingUnderstandingIds: string[];
  supportingMeaningIds: OrganizationalMeaningId[];
  evidenceCount: number;
  confidence: number;
  strength: number;
  compressionRatio: number;
  emergenceScore: number;
  status: "candidate" | "emerging" | "stable";
};

function avg(values: number[]): number {
  if (!values.length) return 0.5;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

const CONCEPT_RECIPES: {
  id: string;
  label: string;
  statement: string;
  explanation: string;
  requiredMeaningIds: OrganizationalMeaningId[];
  optionalMeaningIds?: OrganizationalMeaningId[];
}[] = [
  {
    id: "centralized-decision-authority",
    label: "Centralized Decision Authority",
    statement: "Decision authority is overly centralized.",
    explanation:
      "The organization shows repeated signals that authority, approval, and progress depend on senior leadership or formal review rather than distributed ownership.",
    requiredMeaningIds: ["decision_authority"],
    optionalMeaningIds: [
      "leadership_dependency",
      "governance",
      "organizational_agility",
      "customer_responsiveness",
    ],
  },
  {
    id: "execution-capacity-constraint",
    label: "Execution Capacity Constraint",
    statement: "The organization has an execution capacity constraint.",
    explanation:
      "The organization appears able to identify important work, but recurring signals suggest difficulty converting intent into sustained delivery.",
    requiredMeaningIds: ["execution_capacity"],
    optionalMeaningIds: [
      "resource_allocation",
      "operational_complexity",
      "coordination",
      "organizational_agility",
    ],
  },
  {
    id: "fragmented-organizational-alignment",
    label: "Fragmented Organizational Alignment",
    statement: "Organizational alignment is fragmented across teams.",
    explanation:
      "Multiple signals suggest teams are operating with different priorities, interpretations, or definitions of success.",
    requiredMeaningIds: ["alignment"],
    optionalMeaningIds: ["communication", "coordination", "strategic_uncertainty"],
  },
  {
    id: "institutional-knowledge-loss",
    label: "Institutional Knowledge Loss",
    statement: "Critical organizational knowledge is not sufficiently preserved.",
    explanation:
      "The organization appears to rely on individual memory, informal handoffs, or repeated rediscovery rather than durable knowledge systems.",
    requiredMeaningIds: ["knowledge_continuity"],
    optionalMeaningIds: ["organizational_memory", "communication", "coordination"],
  },
  {
    id: "risk-averse-operating-pattern",
    label: "Risk-Averse Operating Pattern",
    statement: "The organization is biased toward risk avoidance.",
    explanation:
      "The organization shows signals that action, experimentation, or decision-making may be constrained by fear of failure, uncertainty, or excessive permission-seeking.",
    requiredMeaningIds: ["risk_appetite"],
    optionalMeaningIds: [
      "decision_authority",
      "governance",
      "innovation_flow",
      "leadership_dependency",
    ],
  },
];

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function getSignalsForRecipe(
  recipe: (typeof CONCEPT_RECIPES)[number],
  signals: MeaningSignal[]
): MeaningSignal[] {
  const relevantMeaningIds = new Set([
    ...recipe.requiredMeaningIds,
    ...(recipe.optionalMeaningIds ?? []),
  ]);

  return signals.filter((signal) => relevantMeaningIds.has(signal.meaningId));
}

function hasRequiredMeanings(
  recipe: (typeof CONCEPT_RECIPES)[number],
  signals: MeaningSignal[]
): boolean {
  const presentMeaningIds = new Set(signals.map((signal) => signal.meaningId));

  return recipe.requiredMeaningIds.every((meaningId) =>
    presentMeaningIds.has(meaningId)
  );
}

function buildConceptFromRecipe(params: {
  recipe: (typeof CONCEPT_RECIPES)[number];
  signals: MeaningSignal[];
  totalSignalCount: number;
}): OrganizationalConcept {
  const { recipe, signals, totalSignalCount } = params;

  const supportingUnderstandingIds = unique(
    signals.flatMap((signal) => signal.supportingUnderstandingIds)
  );

  const supportingMeaningIds = unique(signals.map((signal) => signal.meaningId));

  const requiredCount = recipe.requiredMeaningIds.length;
  const requiredPresentCount = recipe.requiredMeaningIds.filter((meaningId) =>
    supportingMeaningIds.includes(meaningId)
  ).length;

  const optionalCount = recipe.optionalMeaningIds?.length ?? 0;
  const optionalPresentCount =
    recipe.optionalMeaningIds?.filter((meaningId) =>
      supportingMeaningIds.includes(meaningId)
    ).length ?? 0;

  const requiredFit =
    requiredCount === 0 ? 1 : requiredPresentCount / requiredCount;

  const optionalFit =
    optionalCount === 0 ? 0 : optionalPresentCount / optionalCount;

  const explanatoryFit = clamp(requiredFit * 0.7 + optionalFit * 0.3);

  const confidence = clamp(avg(signals.map((signal) => signal.confidence)));
  const strength = clamp(
    avg(signals.map((signal) => signal.strength)) * 0.7 + explanatoryFit * 0.3
  );

  const compressionRatio = clamp(
    supportingMeaningIds.length / Math.max(totalSignalCount, 1)
  );

  const emergenceScore = clamp(
    confidence * 0.35 +
      strength * 0.35 +
      compressionRatio * 0.15 +
      explanatoryFit * 0.15
  );

  return {
    id: `concept-${recipe.id}`,
    label: recipe.label,
    statement: recipe.statement,
    explanation: recipe.explanation,
    supportingUnderstandingIds,
    supportingMeaningIds,
    evidenceCount: supportingUnderstandingIds.length,
    confidence,
    strength,
    compressionRatio,
    emergenceScore,
    status:
      emergenceScore >= 0.72
        ? "stable"
        : emergenceScore >= 0.48
        ? "emerging"
        : "candidate",
  };
}

export function synthesizeOrganizationalConcepts(params: {
  meaningSignals: MeaningSignal[];
  existingConcepts?: OrganizationalConcept[];
}): OrganizationalConcept[] {
  const { meaningSignals, existingConcepts = [] } = params;

  if (!meaningSignals.length) return existingConcepts;

  const synthesized = CONCEPT_RECIPES.map((recipe) => {
    const signals = getSignalsForRecipe(recipe, meaningSignals);

    if (!signals.length) return null;
    if (!hasRequiredMeanings(recipe, signals)) return null;

    return buildConceptFromRecipe({
      recipe,
      signals,
      totalSignalCount: meaningSignals.length,
    });
  }).filter(Boolean) as OrganizationalConcept[];

  const merged = [...existingConcepts];

  for (const concept of synthesized) {
    const existingIndex = merged.findIndex((item) => item.id === concept.id);

    if (existingIndex === -1) {
      merged.push(concept);
      continue;
    }

    const existing = merged[existingIndex];

    const supportingUnderstandingIds = unique([
      ...existing.supportingUnderstandingIds,
      ...concept.supportingUnderstandingIds,
    ]);

    const supportingMeaningIds = unique([
      ...(existing.supportingMeaningIds ?? []),
      ...concept.supportingMeaningIds,
    ]);

    const confidence = clamp((existing.confidence + concept.confidence) / 2 + 0.04);
    const strength = clamp((existing.strength + concept.strength) / 2 + 0.04);
    const emergenceScore = clamp(
      confidence * 0.4 + strength * 0.4 + concept.compressionRatio * 0.2
    );

    merged[existingIndex] = {
      ...existing,
      supportingUnderstandingIds,
      supportingMeaningIds,
      evidenceCount: supportingUnderstandingIds.length,
      confidence,
      strength,
      compressionRatio: concept.compressionRatio,
      emergenceScore,
      status:
        emergenceScore >= 0.72
          ? "stable"
          : emergenceScore >= 0.48
          ? "emerging"
          : "candidate",
    };
  }

  return merged.sort((a, b) => b.emergenceScore - a.emergenceScore);
}