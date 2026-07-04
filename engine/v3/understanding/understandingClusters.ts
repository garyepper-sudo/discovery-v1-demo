import type { V3Understanding } from "../types";
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

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
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
    return themes
      .map((theme) => theme[0].toUpperCase() + theme.slice(1))
      .join(" / ");
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

export function buildUnderstandingClusters(params: {
  understandings: ClusterableUnderstanding[];
  existingClusters?: UnderstandingCluster[];
  now?: string;
}): UnderstandingCluster[] {
  const { understandings, existingClusters = [] } = params;
  const now = params.now ?? new Date().toISOString();

  const clusters: ClusterableUnderstanding[][] = [];
  const similarityThreshold = 0.26;

  for (const understanding of understandings) {
    let bestClusterIndex = -1;
    let bestScore = 0;

    clusters.forEach((cluster, index) => {
      const clusterScore = average(
        cluster.map((member) =>
          overlapScore(understandingText(understanding), understandingText(member))
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
            overlapScore(understandingText(cluster[i]), understandingText(cluster[j]))
          );
        }
      }

      const cohesion = clamp01(average(pairScores));
      const confidence = clamp01(
        average(cluster.map((understanding) => understandingConfidence(understanding)))
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