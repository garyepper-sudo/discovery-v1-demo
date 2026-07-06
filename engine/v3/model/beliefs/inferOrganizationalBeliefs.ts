import type { OrganizationalMechanism } from "../judgment/organizationalMechanism";
import type { OrganizationalBelief } from "./organizationalBeliefs";

type MechanismLike = Pick<
  OrganizationalMechanism,
  | "id"
  | "type"
  | "title"
  | "executiveName"
  | "summary"
  | "interpretation"
  | "executiveSummary"
  | "executiveImplication"
  | "organizationalBehavior"
  | "confidence"
  | "supportingEvidenceIds"
  | "supportingSemanticConceptIds"
> & {
  label?: string;
  description?: string;
  supportingPatternIds?: string[];
  supportingConceptIds?: string[];
  evidenceIds?: string[];
};

type MechanismBeliefCluster = {
  id: string;
  mechanisms: MechanismLike[];
};

type SemanticTheme = {
  label: string;
  score: number;
};

const SEMANTIC_THEMES: SemanticTheme[] = [
  { label: "knowledge", score: 0 },
  { label: "learning", score: 0 },
  { label: "memory", score: 0 },
  { label: "documentation", score: 0 },
  { label: "transfer", score: 0 },
  { label: "decision", score: 0 },
  { label: "authority", score: 0 },
  { label: "leadership", score: 0 },
  { label: "coordination", score: 0 },
  { label: "execution", score: 0 },
];

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function clampConfidence(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function splitSemanticText(text: string): string {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/[_-]+/g, " ");
}

function normalizeIdPart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function semanticTextForMechanism(mechanism: MechanismLike): string {
  return [
    mechanism.executiveName,
    mechanism.title,
    mechanism.type,
    mechanism.summary,
    mechanism.executiveSummary,
    mechanism.interpretation,
    mechanism.organizationalBehavior,
    mechanism.executiveImplication,
    mechanism.label,
    mechanism.description,
  ]
    .filter(Boolean)
    .join(" ");
}

function semanticTokensForMechanism(mechanism: MechanismLike): string[] {
  return unique(
    splitSemanticText(semanticTextForMechanism(mechanism))
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((token) => token.length > 3),
  );
}

function semanticSimilarity(
  left: MechanismLike,
  right: MechanismLike,
): number {
  const leftTokens = new Set(semanticTokensForMechanism(left));
  const rightTokens = new Set(semanticTokensForMechanism(right));

  const shared = [...leftTokens].filter((token) =>
    rightTokens.has(token),
  ).length;

  const total = new Set([...leftTokens, ...rightTokens]).size;

  if (total === 0) {
    return 0;
  }

  return shared / total;
}

function findRelatedMechanisms(
  mechanism: MechanismLike,
  mechanisms: MechanismLike[],
): MechanismLike[] {
  return mechanisms.filter((candidate) => {
    if (candidate.id === mechanism.id) {
      return false;
    }

    return semanticSimilarity(mechanism, candidate) >= 0.35;
  });
}

function buildMechanismBeliefClusters(
  mechanisms: MechanismLike[],
): MechanismBeliefCluster[] {
  const visitedMechanismIds = new Set<string>();
  const clusters: MechanismBeliefCluster[] = [];

  for (const mechanism of mechanisms) {
    if (visitedMechanismIds.has(mechanism.id)) {
      continue;
    }

    const relatedMechanisms = findRelatedMechanisms(mechanism, mechanisms);
    const clusterMechanisms = [mechanism, ...relatedMechanisms];

    for (const clusterMechanism of clusterMechanisms) {
      visitedMechanismIds.add(clusterMechanism.id);
    }

    clusters.push({
      id: `mechanism_cluster_${clusters.length + 1}`,
      mechanisms: clusterMechanisms,
    });
  }

  return clusters;
}

function dominantSemanticTermsForCluster(
  cluster: MechanismBeliefCluster,
): string[] {
  const tokenCounts = new Map<string, number>();

  for (const mechanism of cluster.mechanisms) {
    for (const token of semanticTokensForMechanism(mechanism)) {
      tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);
    }
  }

  return Array.from(tokenCounts.entries())
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1])
    .map(([token]) => token);
}

function clusterSemanticText(cluster: MechanismBeliefCluster): string {
  return splitSemanticText(
    cluster.mechanisms.map(semanticTextForMechanism).join(" "),
  ).toLowerCase();
}

function scoreSemanticTheme(params: {
  theme: string;
  terms: string[];
  text: string;
}): number {
  const { theme, terms, text } = params;

  const termScore = terms.filter((term) => term.includes(theme)).length * 2;
  const textScore = text.includes(theme) ? 1 : 0;

  return termScore + textScore;
}

function rankedSemanticThemesForCluster(
  cluster: MechanismBeliefCluster,
): SemanticTheme[] {
  const terms = dominantSemanticTermsForCluster(cluster);
  const text = clusterSemanticText(cluster);

  return SEMANTIC_THEMES.map((theme) => ({
    ...theme,
    score: scoreSemanticTheme({
      theme: theme.label,
      terms,
      text,
    }),
  }))
    .filter((theme) => theme.score > 0)
    .sort((left, right) => right.score - left.score);
}

function beliefStatementForCluster(cluster: MechanismBeliefCluster): string {
  const rankedThemes = rankedSemanticThemesForCluster(cluster);
  const themeLabels = rankedThemes.map((theme) => theme.label);

  const hasKnowledge = themeLabels.includes("knowledge");
  const hasLearning = themeLabels.includes("learning");
  const hasMemory = themeLabels.includes("memory");
  const hasDocumentation = themeLabels.includes("documentation");
  const hasTransfer = themeLabels.includes("transfer");

  const hasDecision = themeLabels.includes("decision");
  const hasAuthority = themeLabels.includes("authority");
  const hasLeadership = themeLabels.includes("leadership");

  const hasCoordination = themeLabels.includes("coordination");
  const hasExecution = themeLabels.includes("execution");

  if (
    hasKnowledge &&
    (hasTransfer || hasDocumentation || hasMemory || hasLearning)
  ) {
    return "The organization is failing to accumulate, preserve, and reuse knowledge.";
  }

  if (hasLearning && (hasKnowledge || hasMemory)) {
    return "The organization is not converting experience into durable organizational learning.";
  }

  if (hasMemory && (hasKnowledge || hasDocumentation)) {
    return "Organizational memory is not being preserved reliably over time.";
  }

  if (hasDocumentation && hasKnowledge) {
    return "Documentation is not functioning as reliable organizational memory.";
  }

  if (hasDecision && (hasAuthority || hasLeadership)) {
    return "Decision authority appears overly centralized.";
  }

  if (hasLeadership && hasAuthority) {
    return "The organization is overly dependent on leadership for operating decisions.";
  }

  if (hasCoordination && hasExecution) {
    return "Execution is being constrained by weak coordination across the organization.";
  }

  if (hasCoordination) {
    return "Cross-functional coordination is not reliably supporting execution.";
  }

  if (hasExecution) {
    return "The organization is struggling to convert intent into consistent execution.";
  }

  const leadingTheme = rankedThemes[0];

  if (leadingTheme) {
    return `The organization shows a recurring weakness in ${leadingTheme.label}.`;
  }

  return "The organization is exhibiting a recurring unresolved operating constraint.";
}

function beliefIdForStatement(statement: string): string {
  return `belief_${normalizeIdPart(statement)}`;
}

function derivedPatternIdsForCluster(
  cluster: MechanismBeliefCluster,
  statement: string,
): string[] {
  const rankedThemes = rankedSemanticThemesForCluster(cluster);
  const themeIds = rankedThemes.slice(0, 3).map((theme) => {
    return `pattern:belief-theme:${normalizeIdPart(theme.label)}`;
  });

  const mechanismTypeIds = unique(
    cluster.mechanisms
      .map((mechanism) => mechanism.type)
      .filter(Boolean)
      .map((type) => `pattern:mechanism-type:${normalizeIdPart(String(type))}`),
  );

  const statementPatternId = `pattern:belief:${normalizeIdPart(statement)}`;

  return unique([statementPatternId, ...themeIds, ...mechanismTypeIds]);
}

function derivedConceptIdsForCluster(
  cluster: MechanismBeliefCluster,
  statement: string,
): string[] {
  const rankedThemes = rankedSemanticThemesForCluster(cluster);
  const themeLabels = rankedThemes.map((theme) => theme.label);

  const conceptIds: string[] = [];

  if (
    themeLabels.includes("knowledge") ||
    themeLabels.includes("learning") ||
    themeLabels.includes("memory") ||
    themeLabels.includes("documentation") ||
    themeLabels.includes("transfer")
  ) {
    conceptIds.push("concept:organizational-continuity");
  }

  if (
    themeLabels.includes("decision") ||
    themeLabels.includes("authority") ||
    themeLabels.includes("leadership")
  ) {
    conceptIds.push("concept:centralized-governance-bottleneck");
  }

  if (
    themeLabels.includes("coordination") ||
    themeLabels.includes("execution")
  ) {
    conceptIds.push("concept:cross-functional-execution-friction");
  }

  conceptIds.push(`concept:belief:${normalizeIdPart(statement)}`);

  return unique(conceptIds);
}

export function inferOrganizationalBeliefs(params: {
  mechanisms?: MechanismLike[];
  now?: string;
}): OrganizationalBelief[] {
  const now = params.now ?? new Date().toISOString();
  const mechanisms = asArray(params.mechanisms);

  const beliefMap = new Map<string, OrganizationalBelief>();
  const clusters = buildMechanismBeliefClusters(mechanisms);

  for (const cluster of clusters) {
    const statement = beliefStatementForCluster(cluster);
    const id = beliefIdForStatement(statement);

    const existing = beliefMap.get(id);

    const clusterMechanismIds = unique(
      cluster.mechanisms.map((clusterMechanism) => clusterMechanism.id),
    );

    const explicitSupportingPatternIds = unique(
      cluster.mechanisms.flatMap((clusterMechanism) =>
        asArray(clusterMechanism.supportingPatternIds),
      ),
    );

    const explicitSupportingConceptIds = unique(
      cluster.mechanisms.flatMap((clusterMechanism) => [
        ...asArray(clusterMechanism.supportingConceptIds),
        ...asArray(clusterMechanism.supportingSemanticConceptIds),
      ]),
    );

    const clusterSupportingPatternIds = unique([
      ...explicitSupportingPatternIds,
      ...derivedPatternIdsForCluster(cluster, statement),
    ]);

    const clusterSupportingConceptIds = unique([
      ...explicitSupportingConceptIds,
      ...derivedConceptIdsForCluster(cluster, statement),
    ]);

    const clusterSupportingEvidenceIds = unique(
      cluster.mechanisms.flatMap((clusterMechanism) => [
        ...asArray(clusterMechanism.supportingEvidenceIds),
        ...asArray(clusterMechanism.evidenceIds),
      ]),
    );

    const clusterConfidence = clampConfidence(
      cluster.mechanisms.reduce(
        (sum, clusterMechanism) =>
          sum + clampConfidence(clusterMechanism.confidence ?? 0.5),
        0,
      ) / Math.max(1, cluster.mechanisms.length),
    );

    if (!existing) {
      beliefMap.set(id, {
        id,
        statement,
        confidence: clusterConfidence,
        supportingMechanismIds: clusterMechanismIds,
        supportingPatternIds: clusterSupportingPatternIds,
        supportingConceptIds: clusterSupportingConceptIds,
        supportingEvidenceIds: clusterSupportingEvidenceIds,
        contradictoryEvidenceIds: [],
        trend: "stable",
        lastUpdatedAt: now,
      });

      continue;
    }

    const combinedMechanismIds = unique([
      ...existing.supportingMechanismIds,
      ...clusterMechanismIds,
    ]);

    const revisedConfidence = clampConfidence(
      (existing.confidence * existing.supportingMechanismIds.length +
        clusterConfidence * clusterMechanismIds.length) /
        combinedMechanismIds.length,
    );

    beliefMap.set(id, {
      ...existing,
      confidence: revisedConfidence,
      supportingMechanismIds: combinedMechanismIds,
      supportingPatternIds: unique([
        ...existing.supportingPatternIds,
        ...clusterSupportingPatternIds,
      ]),
      supportingConceptIds: unique([
        ...existing.supportingConceptIds,
        ...clusterSupportingConceptIds,
      ]),
      supportingEvidenceIds: unique([
        ...existing.supportingEvidenceIds,
        ...clusterSupportingEvidenceIds,
      ]),
      trend:
        revisedConfidence > existing.confidence
          ? "strengthening"
          : revisedConfidence < existing.confidence
            ? "weakening"
            : "stable",
      lastUpdatedAt: now,
    });
  }

  return Array.from(beliefMap.values()).sort(
    (a, b) => b.confidence - a.confidence,
  );
}