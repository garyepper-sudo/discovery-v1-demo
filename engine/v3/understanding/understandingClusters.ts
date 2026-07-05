import type { V3Understanding } from "../types";
import type {
  OrganizationReasoningGraph,
  OrganizationReasoningNode,
} from "../model/buildOrganizationReasoningGraph";
import type {
  UnderstandingCluster,
  UnderstandingClusterStatus,
} from "./types";

type ClusterableUnderstanding = Partial<V3Understanding> & {
  id?: string;
  statement?: string;
  summary?: string;
  title?: string;
  explanation?: string;
  strategicMeaning?: string;
  coreClaim?: string;
  confidence?: number;
  supportingBeliefIds?: string[];
  beliefIds?: string[];
  mechanismIds?: string[];
  themeIds?: string[];
};

function reasoningNodeId(node: OrganizationReasoningNode): string {
  return node.id ?? node.entityId ?? node.phenomenonId ?? node.canonicalName;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function titleCase(value: string): string {
  return normalizeText(value)
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function tokenize(value: string): Set<string> {
  const stopWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "of",
    "to",
    "in",
    "on",
    "for",
    "with",
    "by",
    "from",
    "as",
    "is",
    "are",
    "may",
    "might",
    "can",
    "could",
    "should",
    "organization",
    "organizational",
  ]);

  return new Set(
    normalizeText(value)
      .split(" ")
      .filter((word) => word.length > 2 && !stopWords.has(word))
  );
}

function overlapScore(a: string, b: string): number {
  const aTokens = tokenize(a);
  const bTokens = tokenize(b);

  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  const intersection = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;

  return intersection / union;
}

function getStringField(
  understanding: ClusterableUnderstanding,
  field: keyof ClusterableUnderstanding
): string {
  const value = understanding[field];
  return typeof value === "string" ? value : "";
}

function getStringArrayField(
  understanding: ClusterableUnderstanding,
  field: keyof ClusterableUnderstanding
): string[] {
  const value = understanding[field];

  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function understandingText(understanding: ClusterableUnderstanding): string {
  return [
    getStringField(understanding, "statement"),
    getStringField(understanding, "summary"),
    getStringField(understanding, "title"),
    getStringField(understanding, "explanation"),
    getStringField(understanding, "strategicMeaning"),
    getStringField(understanding, "coreClaim"),
    ...getStringArrayField(understanding, "supportingBeliefIds"),
    ...getStringArrayField(understanding, "beliefIds"),
    ...getStringArrayField(understanding, "mechanismIds"),
    ...getStringArrayField(understanding, "themeIds"),
  ]
    .filter(Boolean)
    .join(" ");
}

function understandingId(
  understanding: ClusterableUnderstanding,
  fallbackIndex: number
): string {
  return typeof understanding.id === "string" && understanding.id.length > 0
    ? understanding.id
    : `understanding-${fallbackIndex + 1}`;
}

function understandingConfidence(
  understanding: ClusterableUnderstanding
): number {
  return typeof understanding.confidence === "number"
    ? understanding.confidence
    : 0.5;
}

function sharedTokens(understandings: ClusterableUnderstanding[]): string[] {
  if (understandings.length === 0) return [];

  const tokenLists = understandings.map((understanding) =>
    tokenize(understandingText(understanding))
  );

  const [first, ...rest] = tokenLists;

  return [...first]
    .filter((token) => rest.every((tokens) => tokens.has(token)))
    .slice(0, 6);
}

function deriveLabel(understandings: ClusterableUnderstanding[]): string {
  const themes = sharedTokens(understandings);

  if (themes.length > 0) {
    return themes.map(titleCase).join(" / ");
  }

  return "Related Understanding Pattern";
}

function deriveStatus(params: {
  memberCount: number;
  cohesion: number;
  stability: number;
}): UnderstandingClusterStatus {
  const { memberCount, cohesion, stability } = params;

  if (memberCount >= 4 && cohesion >= 0.45 && stability >= 0.7) return "stable";
  if (memberCount >= 3 && cohesion >= 0.35) return "reinforcing";
  if (cohesion < 0.2) return "fragmented";

  return "emerging";
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function entityText(node: OrganizationReasoningNode): string {
  return [node.canonicalName, node.category, ...node.aliases]
    .filter(Boolean)
    .join(" ");
}

function entitySimilarity(
  a: OrganizationReasoningNode,
  b: OrganizationReasoningNode
): number {
  let score = overlapScore(entityText(a), entityText(b));

  if (a.category === b.category && a.category !== "unknown") {
    score += a.category === "risk" ? 0.08 : 0.18;
  }

  if (
    a.relatedEntityIds.includes(reasoningNodeId(b)) ||
    b.relatedEntityIds.includes(reasoningNodeId(a))
  ) {
    score += 0.35;
  }

  if (
    a.aliases.some(
      (alias) => normalizeText(alias) === normalizeText(b.canonicalName)
    ) ||
    b.aliases.some(
      (alias) => normalizeText(alias) === normalizeText(a.canonicalName)
    )
  ) {
    score += 0.45;
  }

  return clamp01(score);
}

function deriveEntityClusterLabel(nodes: OrganizationReasoningNode[]): string {
  const highConfidence = [...nodes].sort((a, b) => b.confidence - a.confidence);
  const primary = highConfidence[0];

  if (!primary) return "Organizational Pattern";

  const category = primary.category;

  if (category === "risk") return `${titleCase(primary.canonicalName)} Pattern`;

  if (category === "actor" || category === "team") {
    return `${titleCase(primary.canonicalName)} Coordination`;
  }

  if (category === "system") {
    return `${titleCase(primary.canonicalName)} Operations`;
  }

  if (category === "process") {
    return `${titleCase(primary.canonicalName)} Flow`;
  }

  return titleCase(primary.canonicalName);
}

function findExactPreviousCluster(params: {
  existingClusters: UnderstandingCluster[];
  memberIds: string[];
}): UnderstandingCluster | undefined {
  const { existingClusters, memberIds } = params;

  return existingClusters.find((existing) => {
    if (existing.memberUnderstandingIds.length !== memberIds.length) {
      return false;
    }

    return memberIds.every((id) =>
      existing.memberUnderstandingIds.includes(id)
    );
  });
}

function buildEntityCentricClusters(params: {
  organizationReasoningGraph: OrganizationReasoningGraph;
  existingClusters: UnderstandingCluster[];
  now: string;
}): UnderstandingCluster[] {
  const { organizationReasoningGraph, existingClusters, now } = params;

  const nodes = organizationReasoningGraph.nodes.filter(
    (node) => node.confidence >= 0.65
  );

  const clusters: OrganizationReasoningNode[][] = [];
  const similarityThreshold = 0.28;

  for (const node of nodes) {
    let bestClusterIndex = -1;
    let bestScore = 0;

    clusters.forEach((cluster, index) => {
      const clusterScore = average(
        cluster.map((member) => entitySimilarity(node, member))
      );

      if (clusterScore > bestScore) {
        bestScore = clusterScore;
        bestClusterIndex = index;
      }
    });

    if (bestClusterIndex >= 0 && bestScore >= similarityThreshold) {
      clusters[bestClusterIndex].push(node);
    } else {
      clusters.push([node]);
    }
  }

  return clusters
    .filter((cluster) => cluster.length > 1)
    .map((cluster, index) => {
      const memberIds = cluster.map((node) => reasoningNodeId(node));

      const previousCluster = findExactPreviousCluster({
        existingClusters,
        memberIds,
      });

      const pairScores: number[] = [];

      for (let i = 0; i < cluster.length; i += 1) {
        for (let j = i + 1; j < cluster.length; j += 1) {
          pairScores.push(entitySimilarity(cluster[i], cluster[j]));
        }
      }

      const cohesion = clamp01(average(pairScores));
      const confidence = clamp01(average(cluster.map((node) => node.confidence)));

      const stability = clamp01(
        previousCluster
          ? previousCluster.stability + 0.12 + cluster.length * 0.03
          : cluster.length >= 3
            ? 0.42
            : 0.28
      );

      const label = deriveEntityClusterLabel(cluster);

      const sharedThemes = [
        ...new Set(
          cluster.flatMap((node) => [
            node.category,
            ...tokenize(node.canonicalName),
          ])
        ),
      ].filter((theme) => theme !== "unknown");

      const sharedMechanisms = [
        ...new Set(
          cluster.flatMap((node) =>
            node.relatedEntityIds.length > 0
              ? node.relatedEntityIds
              : [`entity:${node.category}`]
          )
        ),
      ];

      return {
        id:
          previousCluster?.id ??
          `entity-understanding-cluster-${index + 1}-${now}`,

        label,

        description: `Multiple organizational entities appear to describe a related organizational structure: ${label}.`,

        memberUnderstandingIds: memberIds,
        sharedThemes,
        sharedMechanisms,
        confidence,
        cohesion,
        stability,
        status: deriveStatus({
          memberCount: cluster.length,
          cohesion,
          stability,
        }),
        createdAt: previousCluster?.createdAt ?? now,
        updatedAt: now,
      };
    });
}

function buildTextCentricClusters(params: {
  understandings: ClusterableUnderstanding[];
  existingClusters: UnderstandingCluster[];
  now: string;
}): UnderstandingCluster[] {
  const { understandings, existingClusters, now } = params;

  const clusters: ClusterableUnderstanding[][] = [];
  const similarityThreshold = 0.26;

  for (const understanding of understandings) {
    let bestClusterIndex = -1;
    let bestScore = 0;

    clusters.forEach((cluster, index) => {
      const clusterScore = average(
        cluster.map((member) =>
          overlapScore(
            understandingText(understanding),
            understandingText(member)
          )
        )
      );

      if (clusterScore > bestScore) {
        bestScore = clusterScore;
        bestClusterIndex = index;
      }
    });

    if (bestClusterIndex >= 0 && bestScore >= similarityThreshold) {
      clusters[bestClusterIndex].push(understanding);
    } else {
      clusters.push([understanding]);
    }
  }

  return clusters
    .filter((cluster) => cluster.length > 1)
    .map((cluster, index) => {
      const memberIds = cluster.map((understanding, memberIndex) =>
        understandingId(understanding, memberIndex)
      );

      const previousCluster = existingClusters.find((existing) =>
        memberIds.some((id) => existing.memberUnderstandingIds.includes(id))
      );

      const pairScores: number[] = [];

      for (let i = 0; i < cluster.length; i += 1) {
        for (let j = i + 1; j < cluster.length; j += 1) {
          pairScores.push(
            overlapScore(
              understandingText(cluster[i]),
              understandingText(cluster[j])
            )
          );
        }
      }

      const cohesion = clamp01(average(pairScores));
      const confidence = clamp01(
        average(cluster.map((understanding) =>
          understandingConfidence(understanding)
        ))
      );

      const stability = clamp01(
        previousCluster
          ? previousCluster.stability + 0.12 + cluster.length * 0.03
          : cluster.length >= 3
            ? 0.35
            : 0.2
      );

      const sharedThemes = sharedTokens(cluster);

      const sharedMechanisms = [
        ...new Set(
          cluster.flatMap((understanding) =>
            getStringArrayField(understanding, "mechanismIds")
          )
        ),
      ];

      const label = previousCluster?.label ?? deriveLabel(cluster);

      return {
        id: previousCluster?.id ?? `understanding-cluster-${index + 1}`,
        label,
        description:
          previousCluster?.description ??
          `Multiple understandings appear to describe the same underlying organizational phenomenon: ${label}.`,
        memberUnderstandingIds: memberIds,
        sharedThemes,
        sharedMechanisms,
        confidence,
        cohesion,
        stability,
        status: deriveStatus({
          memberCount: cluster.length,
          cohesion,
          stability,
        }),
        createdAt: previousCluster?.createdAt ?? now,
        updatedAt: now,
      };
    });
}

export function buildUnderstandingClusters(params: {
  understandings: ClusterableUnderstanding[];
  existingClusters?: UnderstandingCluster[];
  organizationReasoningGraph?: OrganizationReasoningGraph;
  now?: string;
}): UnderstandingCluster[] {
  const { understandings, existingClusters = [], organizationReasoningGraph } =
    params;

  const now = params.now ?? new Date().toISOString();

  if (
    organizationReasoningGraph &&
    Array.isArray(organizationReasoningGraph.nodes) &&
    organizationReasoningGraph.nodes.length > 0
  ) {
    const entityCentricClusters = buildEntityCentricClusters({
      organizationReasoningGraph,
      existingClusters,
      now,
    });

    if (entityCentricClusters.length > 0) {
      return entityCentricClusters;
    }
  }

  return buildTextCentricClusters({
    understandings,
    existingClusters,
    now,
  });
}