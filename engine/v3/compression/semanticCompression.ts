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

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function tokenize(text: string): string[] {
  return normalizeText(text)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3);
}

function getUnderstandingText(understanding: UnderstandingLike): string {
  return [
    understanding.label,
    understanding.summary,
    understanding.description,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .join(" ");
}

function calculateSimilarity(a: UnderstandingLike, b: UnderstandingLike): number {
  const aTokens = new Set(tokenize(getUnderstandingText(a)));
  const bTokens = new Set(tokenize(getUnderstandingText(b)));

  if (aTokens.size === 0 || bTokens.size === 0) return 0;

  const overlap = [...aTokens].filter((token) => bTokens.has(token)).length;
  const union = new Set([...aTokens, ...bTokens]).size;

  return overlap / union;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function inferConceptStatement(understandings: UnderstandingLike[]): string {
  const text = understandings.map(getUnderstandingText).join(" ");

  if (
    text.includes("decision") ||
    text.includes("approval") ||
    text.includes("leadership") ||
    text.includes("alignment")
  ) {
    return "Decision authority and leadership alignment are shaping organizational execution.";
  }

  if (
    text.includes("execution") ||
    text.includes("delivery") ||
    text.includes("capacity") ||
    text.includes("operational")
  ) {
    return "Execution capacity is a recurring constraint in organizational performance.";
  }

  if (
    text.includes("knowledge") ||
    text.includes("memory") ||
    text.includes("handoff") ||
    text.includes("continuity")
  ) {
    return "Organizational knowledge is unevenly preserved and transferred.";
  }

  if (
    text.includes("customer") ||
    text.includes("market") ||
    text.includes("revenue") ||
    text.includes("dependence")
  ) {
    return "Customer and market dependence are influencing organizational priorities.";
  }

  if (
    text.includes("innovation") ||
    text.includes("product") ||
    text.includes("pipeline") ||
    text.includes("experiment")
  ) {
    return "Innovation progress depends on the organization’s ability to convert ideas into repeatable execution.";
  }

  return "A coherent organizational pattern is emerging across multiple understandings.";
}

function buildConceptSummary(understandings: UnderstandingLike[]): string {
  const labels = understandings
    .map((understanding) => understanding.label || understanding.summary)
    .filter(Boolean)
    .slice(0, 3);

  if (labels.length === 0) {
    return "This concept compresses related understandings into a smaller explanatory idea.";
  }

  return `This concept compresses related understandings including ${labels.join(
    ", "
  )}.`;
}

function createConcept(params: {
  index: number;
  understandings: UnderstandingLike[];
  totalUnderstandings: number;
}): OrganizationalConcept {
  const { index, understandings, totalUnderstandings } = params;

  const confidence = clamp(
    average(
      understandings.map(
        (understanding) =>
          understanding.confidence ?? understanding.strength ?? 0.5
      )
    )
  );

  const coverage = clamp(understandings.length / Math.max(totalUnderstandings, 1));
  const stability = clamp(
    average(
      understandings.map((understanding) =>
        understanding.status === "stable"
          ? 1
          : understanding.status === "reinforced"
          ? 0.75
          : 0.35
      )
    )
  );

  const novelty = clamp(1 - stability);
  const explanatoryPower = clamp((confidence + coverage + stability) / 3);

  return {
    id: `concept-${index + 1}`,
    statement: inferConceptStatement(understandings),
    summary: buildConceptSummary(understandings),
    understandingIds: understandings.map((understanding) => understanding.id),
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
      "Discovery formed this concept by compressing semantically related understandings into a smaller explanatory idea.",
  };
}

function clusterUnderstandings(
  understandings: UnderstandingLike[]
): UnderstandingLike[][] {
  const clusters: UnderstandingLike[][] = [];
  const used = new Set<string>();
  const similarityThreshold = 0.12;

  for (const understanding of understandings) {
    if (used.has(understanding.id)) continue;

    const cluster = [understanding];
    used.add(understanding.id);

    for (const candidate of understandings) {
      if (used.has(candidate.id)) continue;

      const isSimilar = cluster.some(
        (member) => calculateSimilarity(member, candidate) >= similarityThreshold
      );

      if (isSimilar) {
        cluster.push(candidate);
        used.add(candidate.id);
      }
    }

    clusters.push(cluster);
  }

  return clusters;
}

export function runSemanticCompression(params: {
  understandings: UnderstandingLike[];
}): OrganizationalConcept[] {
  const { understandings } = params;

  if (!Array.isArray(understandings) || understandings.length === 0) {
    return [];
  }

  const clusters = clusterUnderstandings(understandings);

  return clusters
    .map((cluster, index) =>
      createConcept({
        index,
        understandings: cluster,
        totalUnderstandings: understandings.length,
      })
    )
    .sort((a, b) => b.explanatoryPower - a.explanatoryPower);
}