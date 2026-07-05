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

type ConceptRecipe = {
  id: string;
  label: string;
  statement: string;
  explanation: string;
  requiredMeaningIds: OrganizationalMeaningId[];
  optionalMeaningIds?: OrganizationalMeaningId[];
};

type MeaningCluster = {
  id: string;
  meaningIds: OrganizationalMeaningId[];
  signals: MeaningSignal[];
  reinforcementScore: number;
};

function avg(values: number[]): number {
  if (!values.length) return 0.5;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.max(min, Math.min(max, value));
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

const CONCEPT_RECIPES: ConceptRecipe[] = [
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

const EMERGENT_CONCEPT_FAMILIES: ConceptRecipe[] = [
  {
    id: "knowledge-accessibility",
    label: "Knowledge Accessibility",
    statement: "Organizational knowledge is not easily accessible at the moment of need.",
    explanation:
      "Multiple meaning signals suggest that knowledge exists, but is difficult to find, reuse, transfer, or preserve as shared organizational understanding.",
    requiredMeaningIds: ["knowledge_continuity"],
    optionalMeaningIds: [
      "organizational_memory",
      "communication",
      "coordination",
      "operational_complexity",
    ],
  },
  {
    id: "decision-centralization",
    label: "Decision Centralization",
    statement: "Decision-making appears concentrated around a narrow authority path.",
    explanation:
      "Multiple meaning signals suggest that progress depends on centralized authority, governance, or leadership involvement rather than distributed ownership.",
    requiredMeaningIds: ["decision_authority"],
    optionalMeaningIds: [
      "leadership_dependency",
      "governance",
      "accountability",
      "ownership",
      "organizational_agility",
    ],
  },
  {
    id: "execution-friction",
    label: "Execution Friction",
    statement: "The organization is experiencing friction converting intent into coordinated action.",
    explanation:
      "Multiple meaning signals suggest that execution is slowed by coordination, complexity, unclear ownership, or resource constraints.",
    requiredMeaningIds: ["execution_capacity"],
    optionalMeaningIds: [
      "coordination",
      "resource_allocation",
      "operational_complexity",
      "ownership",
      "accountability",
    ],
  },
  {
    id: "alignment-fragmentation",
    label: "Alignment Fragmentation",
    statement: "Teams appear to lack a shared operating interpretation.",
    explanation:
      "Multiple meaning signals suggest that teams may be working from different priorities, assumptions, communication patterns, or strategic interpretations.",
    requiredMeaningIds: ["alignment"],
    optionalMeaningIds: [
      "communication",
      "coordination",
      "strategic_uncertainty",
      "governance",
    ],
  },
];

function getSignalsForRecipe(
  recipe: ConceptRecipe,
  signals: MeaningSignal[]
): MeaningSignal[] {
  const relevantMeaningIds = new Set([
    ...recipe.requiredMeaningIds,
    ...(recipe.optionalMeaningIds ?? []),
  ]);

  return signals.filter((signal) => relevantMeaningIds.has(signal.meaningId));
}

function hasRequiredMeanings(
  recipe: ConceptRecipe,
  signals: MeaningSignal[]
): boolean {
  const presentMeaningIds = new Set(signals.map((signal) => signal.meaningId));

  return recipe.requiredMeaningIds.every((meaningId) =>
    presentMeaningIds.has(meaningId)
  );
}

function getSupportingUnderstandingIds(signals: MeaningSignal[]): string[] {
  return unique(signals.flatMap((signal) => signal.supportingUnderstandingIds));
}

function getSupportingMeaningIds(signals: MeaningSignal[]): OrganizationalMeaningId[] {
  return unique(signals.map((signal) => signal.meaningId));
}

function buildConceptFromRecipe(params: {
  recipe: ConceptRecipe;
  signals: MeaningSignal[];
  totalSignalCount: number;
  idPrefix?: string;
}): OrganizationalConcept {
  const { recipe, signals, totalSignalCount, idPrefix = "concept" } = params;

  const supportingUnderstandingIds = getSupportingUnderstandingIds(signals);
  const supportingMeaningIds = getSupportingMeaningIds(signals);

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

  const explanatoryFit = clamp(requiredFit * 0.65 + optionalFit * 0.35);

  const evidenceReinforcement = clamp(
    supportingUnderstandingIds.length / Math.max(signals.length, 1)
  );

  const confidence = clamp(avg(signals.map((signal) => signal.confidence)));
  const strength = clamp(
    avg(signals.map((signal) => signal.strength)) * 0.55 +
      explanatoryFit * 0.25 +
      evidenceReinforcement * 0.2
  );

  const compressionRatio = clamp(
    supportingMeaningIds.length / Math.max(totalSignalCount, 1)
  );

  const emergenceScore = clamp(
    confidence * 0.3 +
      strength * 0.35 +
      compressionRatio * 0.15 +
      explanatoryFit * 0.2
  );

  return {
    id: `${idPrefix}-${recipe.id}`,
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

function calculateMeaningOverlap(a: MeaningSignal, b: MeaningSignal): number {
  const sharedUnderstandingIds = a.supportingUnderstandingIds.filter((id) =>
    b.supportingUnderstandingIds.includes(id)
  );

  const sourceTermOverlap = a.sourceTerms.filter((term) =>
    b.sourceTerms.includes(term)
  );

  const evidenceOverlap = clamp(
    sharedUnderstandingIds.length /
      Math.max(
        unique([...a.supportingUnderstandingIds, ...b.supportingUnderstandingIds])
          .length,
        1
      )
  );

  const languageOverlap = clamp(
    sourceTermOverlap.length / Math.max(unique([...a.sourceTerms, ...b.sourceTerms]).length, 1)
  );

  const semanticAffinity = a.meaningId === b.meaningId ? 1 : 0.35;

  return clamp(
    semanticAffinity * 0.45 +
      evidenceOverlap * 0.35 +
      languageOverlap * 0.2
  );
}

function buildMeaningClusters(signals: MeaningSignal[]): MeaningCluster[] {
  const clustersByMeaningId = new Map<OrganizationalMeaningId, MeaningSignal[]>();

  for (const signal of signals) {
    const existing = clustersByMeaningId.get(signal.meaningId) ?? [];
    existing.push(signal);
    clustersByMeaningId.set(signal.meaningId, existing);
  }

  const baseClusters: MeaningCluster[] = Array.from(clustersByMeaningId.entries()).map(
    ([meaningId, meaningSignals]) => {
      const reinforcementScore = clamp(
        avg(meaningSignals.map((signal) => signal.confidence * signal.strength)) *
          0.65 +
          clamp(meaningSignals.length / Math.max(signals.length, 1)) * 0.35
      );

      return {
        id: `meaning-cluster-${meaningId}`,
        meaningIds: [meaningId],
        signals: meaningSignals,
        reinforcementScore,
      };
    }
  );

  const mergedClusters: MeaningCluster[] = [];

  for (const cluster of baseClusters) {
    const relatedClusters = baseClusters.filter((candidate) => {
      if (candidate.id === cluster.id) return false;

      const pairwiseOverlap = avg(
        cluster.signals.flatMap((left) =>
          candidate.signals.map((right) => calculateMeaningOverlap(left, right))
        )
      );

      return pairwiseOverlap >= 0.42;
    });

    const allSignals = unique([
      ...cluster.signals,
      ...relatedClusters.flatMap((relatedCluster) => relatedCluster.signals),
    ]);

    const meaningIds = unique([
      ...cluster.meaningIds,
      ...relatedClusters.flatMap((relatedCluster) => relatedCluster.meaningIds),
    ]);

    const reinforcementScore = clamp(
      avg(allSignals.map((signal) => signal.confidence * signal.strength)) * 0.55 +
        clamp(meaningIds.length / Math.max(clustersByMeaningId.size, 1)) * 0.25 +
        clamp(getSupportingUnderstandingIds(allSignals).length / Math.max(allSignals.length, 1)) *
          0.2
    );

    const id = `meaning-cluster-${meaningIds.sort().join("-")}`;

    if (!mergedClusters.some((existing) => existing.id === id)) {
      mergedClusters.push({
        id,
        meaningIds,
        signals: allSignals,
        reinforcementScore,
      });
    }
  }

  return mergedClusters
    .filter((cluster) => cluster.meaningIds.length >= 2 || cluster.signals.length >= 2)
    .sort((a, b) => b.reinforcementScore - a.reinforcementScore);
}

function findBestConceptFamily(
  cluster: MeaningCluster
): ConceptRecipe | undefined {
  const clusterMeaningIds = new Set(cluster.meaningIds);

  return [...EMERGENT_CONCEPT_FAMILIES, ...CONCEPT_RECIPES]
    .map((recipe) => {
      const requiredFit = recipe.requiredMeaningIds.every((meaningId) =>
        clusterMeaningIds.has(meaningId)
      )
        ? 1
        : 0;

      const optionalIds = recipe.optionalMeaningIds ?? [];
      const optionalFit =
        optionalIds.length === 0
          ? 0
          : optionalIds.filter((meaningId) => clusterMeaningIds.has(meaningId))
              .length / optionalIds.length;

      return {
        recipe,
        score: requiredFit * 0.7 + optionalFit * 0.3,
      };
    })
    .filter((candidate) => candidate.score >= 0.52)
    .sort((a, b) => b.score - a.score)[0]?.recipe;
}

function titleCaseMeaningId(meaningId: OrganizationalMeaningId): string {
  return meaningId
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildEmergentConceptFromCluster(params: {
  cluster: MeaningCluster;
  totalSignalCount: number;
}): OrganizationalConcept {
  const { cluster, totalSignalCount } = params;

  const matchedFamily = findBestConceptFamily(cluster);

  if (matchedFamily) {
    const concept = buildConceptFromRecipe({
      recipe: matchedFamily,
      signals: cluster.signals,
      totalSignalCount,
      idPrefix: "emergent-concept",
    });

    return {
      ...concept,
      strength: clamp(concept.strength * 0.75 + cluster.reinforcementScore * 0.25),
      emergenceScore: clamp(
        concept.emergenceScore * 0.7 + cluster.reinforcementScore * 0.3
      ),
      status:
        clamp(concept.emergenceScore * 0.7 + cluster.reinforcementScore * 0.3) >=
        0.72
          ? "stable"
          : clamp(concept.emergenceScore * 0.7 + cluster.reinforcementScore * 0.3) >=
            0.48
          ? "emerging"
          : "candidate",
    };
  }

  const supportingUnderstandingIds = getSupportingUnderstandingIds(cluster.signals);
  const supportingMeaningIds = cluster.meaningIds;
  const label = supportingMeaningIds.map(titleCaseMeaningId).join(" / ");

  const confidence = clamp(avg(cluster.signals.map((signal) => signal.confidence)));
  const strength = clamp(
    avg(cluster.signals.map((signal) => signal.strength)) * 0.6 +
      cluster.reinforcementScore * 0.4
  );
  const compressionRatio = clamp(
    supportingMeaningIds.length / Math.max(totalSignalCount, 1)
  );
  const emergenceScore = clamp(
    confidence * 0.3 +
      strength * 0.35 +
      cluster.reinforcementScore * 0.25 +
      compressionRatio * 0.1
  );

  return {
    id: `emergent-concept-${supportingMeaningIds.sort().join("-")}`,
    label,
    statement: `${label} appears to be a reinforced organizational concept.`,
    explanation:
      "Discovery formed this concept by detecting reinforcing meaning signals that repeatedly co-occur across the organization's accumulated understanding.",
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

function mergeConcepts(
  existingConcepts: OrganizationalConcept[],
  synthesizedConcepts: OrganizationalConcept[]
): OrganizationalConcept[] {
  const merged = [...existingConcepts];

  for (const concept of synthesizedConcepts) {
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
    const compressionRatio = clamp(
      supportingMeaningIds.length / Math.max(concept.supportingMeaningIds.length, 1)
    );
    const emergenceScore = clamp(
      confidence * 0.35 +
        strength * 0.4 +
        concept.emergenceScore * 0.15 +
        compressionRatio * 0.1
    );

    merged[existingIndex] = {
      ...existing,
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

  return merged.sort((a, b) => b.emergenceScore - a.emergenceScore);
}

export function synthesizeOrganizationalConcepts(params: {
  meaningSignals: MeaningSignal[];
  existingConcepts?: OrganizationalConcept[];
}): OrganizationalConcept[] {
  const { meaningSignals, existingConcepts = [] } = params;

  if (!meaningSignals.length) return existingConcepts;

  const recipeConcepts = CONCEPT_RECIPES.map((recipe) => {
    const signals = getSignalsForRecipe(recipe, meaningSignals);

    if (!signals.length) return null;
    if (!hasRequiredMeanings(recipe, signals)) return null;

    return buildConceptFromRecipe({
      recipe,
      signals,
      totalSignalCount: meaningSignals.length,
    });
  }).filter(Boolean) as OrganizationalConcept[];

  const meaningClusters = buildMeaningClusters(meaningSignals);

  const emergentConcepts = meaningClusters.map((cluster) =>
    buildEmergentConceptFromCluster({
      cluster,
      totalSignalCount: meaningSignals.length,
    })
  );

  return mergeConcepts(existingConcepts, [
    ...emergentConcepts,
    ...recipeConcepts,
  ]);
}