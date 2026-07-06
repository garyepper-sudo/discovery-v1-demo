import type { PatternLike } from "../../model/judgment/mechanismInferenceTypes";

const SIMILARITY_THRESHOLD = 0.22;

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "around",
  "as",
  "be",
  "but",
  "by",
  "for",
  "from",
  "in",
  "into",
  "is",
  "it",
  "may",
  "more",
  "not",
  "of",
  "or",
  "over",
  "than",
  "that",
  "the",
  "this",
  "to",
  "with",
]);

export type PatternSimilarityEdge = {
  sourcePatternId: string;
  targetPatternId: string;
  similarity: number;
  sharedTerms: string[];
  explanation: string;
};

export type PatternSimilarityGraph = {
  patternIds: string[];
  edges: PatternSimilarityEdge[];
};

export type PatternCluster = {
  id: string;
  patternIds: string[];
  averageSimilarity: number;
  sharedTerms: string[];
  representativeTerms: string[];
  semanticSummary: string;
  confidence: number;
  explanation: string;
};

export type CompressedPatternTheme = {
  id: string;
  label: string;
  summary: string;
  confidence: number;
  supportingPatternIds: string[];
  supportingObservationIds: string[];
  explanation: string;
};

export type PatternThemeCompressionResult = {
  graph: PatternSimilarityGraph;
  clusters: PatternCluster[];
  themes: CompressedPatternTheme[];
};

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function createSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 48);
}

function titleCase(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((term) => term.charAt(0).toUpperCase() + term.slice(1))
    .join(" ");
}

function patternText(pattern: PatternLike): string {
  return [
    pattern.label,
    pattern.statement,
    pattern.description,
    pattern.reason,
  ]
    .filter(Boolean)
    .join(" ");
}

function tokenize(text: string): string[] {
  return unique(
    text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .map((term) => term.trim())
      .filter((term) => term.length > 2 && !STOP_WORDS.has(term)),
  );
}

function overlapScore(a: string[], b: string[]): number {
  if (a.length === 0 || b.length === 0) return 0;

  const bSet = new Set(b);
  const shared = a.filter((term) => bSet.has(term));

  return shared.length / Math.sqrt(a.length * b.length);
}

function sharedTerms(a: string[], b: string[]): string[] {
  const bSet = new Set(b);
  return a.filter((term) => bSet.has(term)).slice(0, 8);
}

function observationOverlapScore(a: PatternLike, b: PatternLike): number {
  const aIds = a.relatedObservationIds ?? [];
  const bIds = b.relatedObservationIds ?? [];

  if (aIds.length === 0 || bIds.length === 0) return 0;

  const bSet = new Set(bIds);
  const shared = aIds.filter((id) => bSet.has(id));

  return shared.length / Math.sqrt(aIds.length * bIds.length);
}

function calculatePatternSimilarity(
  a: PatternLike,
  b: PatternLike,
): PatternSimilarityEdge | null {
  const aTerms = tokenize(patternText(a));
  const bTerms = tokenize(patternText(b));
  const terms = sharedTerms(aTerms, bTerms);

  const semanticOverlap = overlapScore(aTerms, bTerms);
  const observationOverlap = observationOverlapScore(a, b);

  const similarity = clamp(semanticOverlap * 0.75 + observationOverlap * 0.25);

  if (similarity < SIMILARITY_THRESHOLD) return null;

  return {
    sourcePatternId: a.id,
    targetPatternId: b.id,
    similarity,
    sharedTerms: terms,
    explanation:
      terms.length > 0
        ? `These patterns share semantic terms: ${terms.join(", ")}.`
        : "These patterns are related through shared supporting observations.",
  };
}

function buildPatternSimilarityGraph(
  patterns: PatternLike[],
): PatternSimilarityGraph {
  const edges: PatternSimilarityEdge[] = [];

  for (let i = 0; i < patterns.length; i += 1) {
    for (let j = i + 1; j < patterns.length; j += 1) {
      const edge = calculatePatternSimilarity(patterns[i], patterns[j]);

      if (edge) {
        edges.push(edge);
      }
    }
  }

  return {
    patternIds: patterns.map((pattern) => pattern.id),
    edges: edges.sort((a, b) => b.similarity - a.similarity),
  };
}

function buildAdjacencyMap(
  graph: PatternSimilarityGraph,
): Map<string, Set<string>> {
  const adjacency = new Map<string, Set<string>>();

  graph.patternIds.forEach((patternId) => {
    adjacency.set(patternId, new Set());
  });

  graph.edges.forEach((edge) => {
    adjacency.get(edge.sourcePatternId)?.add(edge.targetPatternId);
    adjacency.get(edge.targetPatternId)?.add(edge.sourcePatternId);
  });

  return adjacency;
}

function findConnectedComponents(graph: PatternSimilarityGraph): string[][] {
  const adjacency = buildAdjacencyMap(graph);
  const visited = new Set<string>();
  const components: string[][] = [];

  graph.patternIds.forEach((patternId) => {
    if (visited.has(patternId)) return;

    const stack = [patternId];
    const component: string[] = [];

    while (stack.length > 0) {
      const current = stack.pop();

      if (!current || visited.has(current)) continue;

      visited.add(current);
      component.push(current);

      adjacency.get(current)?.forEach((neighbor) => {
        if (!visited.has(neighbor)) {
          stack.push(neighbor);
        }
      });
    }

    if (component.length > 1) {
      components.push(component.sort());
    }
  });

  return components;
}

function summarizeCluster(params: {
  patternIds: string[];
  patterns: PatternLike[];
  sharedTerms: string[];
  averageSimilarity: number;
}): Pick<
  PatternCluster,
  "representativeTerms" | "semanticSummary" | "confidence"
> {
  const clusterPatterns = params.patterns.filter((pattern) =>
    params.patternIds.includes(pattern.id),
  );

  const representativeTerms = unique([
    ...params.sharedTerms,
    ...clusterPatterns.flatMap((pattern) => tokenize(patternText(pattern))),
  ]).slice(0, 12);

  const patternLabels = unique(
    clusterPatterns
      .map((pattern) => pattern.label ?? pattern.statement ?? pattern.description)
      .filter((text): text is string => Boolean(text)),
  ).slice(0, 5);

  const confidence = clamp(
    params.averageSimilarity * 0.55 +
      Math.min(1, clusterPatterns.length / 5) * 0.25 +
      average(
        clusterPatterns.map(
          (pattern) => pattern.confidence ?? pattern.strength ?? 0.6,
        ),
      ) *
        0.2,
  );

  return {
    representativeTerms,
    semanticSummary:
      representativeTerms.length > 0
        ? `These patterns appear to describe a shared organizational condition involving ${representativeTerms
            .slice(0, 6)
            .join(", ")}. Supporting patterns include: ${patternLabels.join("; ")}.`
        : `These patterns appear to describe a shared organizational condition across ${clusterPatterns.length} related patterns.`,
    confidence,
  };
}

function buildPatternClusters(
  graph: PatternSimilarityGraph,
  patterns: PatternLike[],
): PatternCluster[] {
  const components = findConnectedComponents(graph);

  return components.map((patternIds, index) => {
    const clusterEdges = graph.edges.filter(
      (edge) =>
        patternIds.includes(edge.sourcePatternId) &&
        patternIds.includes(edge.targetPatternId),
    );

    const averageSimilarity =
      clusterEdges.length === 0
        ? 0
        : clusterEdges.reduce((sum, edge) => sum + edge.similarity, 0) /
          clusterEdges.length;

    const terms = unique(clusterEdges.flatMap((edge) => edge.sharedTerms)).slice(
      0,
      10,
    );

    const summary = summarizeCluster({
      patternIds,
      patterns,
      sharedTerms: terms,
      averageSimilarity,
    });

    return {
      id: `pattern_cluster_${index + 1}`,
      patternIds,
      averageSimilarity: clamp(averageSimilarity),
      sharedTerms: terms,
      representativeTerms: summary.representativeTerms,
      semanticSummary: summary.semanticSummary,
      confidence: summary.confidence,
      explanation:
        terms.length > 0
          ? `Discovery grouped these patterns because they share recurring semantic language: ${terms.join(", ")}.`
          : "Discovery grouped these patterns because they form a connected similarity community.",
    };
  });
}

function buildThemeLabel(cluster: PatternCluster): string {
  const terms = cluster.representativeTerms.slice(0, 3);

  if (terms.length === 0) {
    return "Compressed Organizational Theme";
  }

  return titleCase(terms.join(" "));
}

function buildCompressedThemes(params: {
  clusters: PatternCluster[];
  patterns: PatternLike[];
}): CompressedPatternTheme[] {
  return params.clusters.map((cluster) => {
    const clusterPatterns = params.patterns.filter((pattern) =>
      cluster.patternIds.includes(pattern.id),
    );

    const supportingObservationIds = unique(
      clusterPatterns.flatMap((pattern) => pattern.relatedObservationIds ?? []),
    );

    const label = buildThemeLabel(cluster);

    return {
      id: `compressed_theme_${createSlug(cluster.id)}_${createSlug(label)}`,
      label,
      summary: cluster.semanticSummary,
      confidence: cluster.confidence,
      supportingPatternIds: cluster.patternIds,
      supportingObservationIds,
      explanation:
        `${cluster.explanation} Discovery compressed this pattern community into a reusable organizational theme while preserving source pattern and observation traceability.`,
    };
  });
}

export function compressPatternThemes(params: {
  patterns: PatternLike[];
}): PatternThemeCompressionResult {
  const graph = buildPatternSimilarityGraph(params.patterns);
  const clusters = buildPatternClusters(graph, params.patterns);
  const themes = buildCompressedThemes({
    clusters,
    patterns: params.patterns,
  });

  return {
    graph,
    clusters,
    themes,
  };
}