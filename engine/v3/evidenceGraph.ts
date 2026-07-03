import {
  V3Evidence,
  V3EvidenceRelationship,
  V3EvidenceRelationshipType,
} from "./types";

export type V3EvidenceGraphNode = {
  id: string;
  evidenceId: string;
  label: string;
  confidence: number;
  type: V3Evidence["type"];
  polarity?: V3Evidence["polarity"];
  strength?: V3Evidence["strength"];
  keywords: string[];
  entities: string[];
  connectionCount: number;
};

export type V3EvidenceGraphEdge = {
  id: string;
  fromEvidenceId: string;
  toEvidenceId: string;
  type: V3EvidenceRelationshipType;
  confidence: number;
  explanation: string;
};

export type V3EvidenceCluster = {
  id: string;
  evidenceIds: string[];
  dominantRelationshipTypes: V3EvidenceRelationshipType[];
  confidence: number;
  label: string;
};

export type V3EvidenceGraph = {
  nodes: V3EvidenceGraphNode[];
  edges: V3EvidenceGraphEdge[];
  clusters: V3EvidenceCluster[];

  metrics: {
    evidenceCount: number;
    relationshipCount: number;
    density: number;
    averageConfidence: number;
    contradictionCount: number;
    supportCount: number;
    explanationCount: number;
  };
};

export function buildEvidenceGraph(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): V3EvidenceGraph {
  const nodes = buildNodes(evidence, relationships);
  const edges = buildEdges(relationships);
  const clusters = buildClusters(evidence, relationships);

  return {
    nodes,
    edges,
    clusters,
    metrics: buildMetrics(evidence, relationships),
  };
}

function buildNodes(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): V3EvidenceGraphNode[] {
  return evidence.map((item) => {
    const connectionCount = relationships.filter(
      (relationship) =>
        relationship.sourceEvidenceId === item.id ||
        relationship.targetEvidenceId === item.id
    ).length;

    return {
      id: `EGN-${item.id}`,
      evidenceId: item.id,
      label: item.text,
      confidence: item.confidence,
      type: item.type,
      polarity: item.polarity,
      strength: item.strength,
      keywords: item.keywords,
      entities: item.entities,
      connectionCount,
    };
  });
}

function buildEdges(
  relationships: V3EvidenceRelationship[]
): V3EvidenceGraphEdge[] {
  return relationships.map((relationship) => ({
    id: `EGE-${relationship.id}`,
    fromEvidenceId: relationship.sourceEvidenceId,
    toEvidenceId: relationship.targetEvidenceId,
    type: relationship.type,
    confidence: relationship.confidence,
    explanation: relationship.explanation,
  }));
}

function buildClusters(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): V3EvidenceCluster[] {
  const clusters: V3EvidenceCluster[] = [];
  const visited = new Set<string>();

  for (const item of evidence) {
    if (visited.has(item.id)) continue;

    const connectedIds = collectConnectedEvidenceIds(item.id, relationships);

    if (connectedIds.length < 2) {
      visited.add(item.id);
      continue;
    }

    connectedIds.forEach((id) => visited.add(id));

    const clusterRelationships = relationships.filter(
      (relationship) =>
        connectedIds.includes(relationship.sourceEvidenceId) &&
        connectedIds.includes(relationship.targetEvidenceId)
    );

    clusters.push({
      id: `EGC-${clusters.length + 1}`,
      evidenceIds: connectedIds,
      dominantRelationshipTypes: getDominantRelationshipTypes(
        clusterRelationships
      ),
      confidence: average(
        clusterRelationships.map((relationship) => relationship.confidence)
      ),
      label: createClusterLabel(connectedIds, evidence),
    });
  }

  return clusters;
}

function collectConnectedEvidenceIds(
  startId: string,
  relationships: V3EvidenceRelationship[]
): string[] {
  const connected = new Set<string>([startId]);
  const queue = [startId];

  while (queue.length > 0) {
    const currentId = queue.shift();

    if (!currentId) continue;

    const neighbors = relationships
      .filter(
        (relationship) =>
          relationship.sourceEvidenceId === currentId ||
          relationship.targetEvidenceId === currentId
      )
      .flatMap((relationship) => [
        relationship.sourceEvidenceId,
        relationship.targetEvidenceId,
      ]);

    for (const neighborId of neighbors) {
      if (!connected.has(neighborId)) {
        connected.add(neighborId);
        queue.push(neighborId);
      }
    }
  }

  return Array.from(connected);
}

function getDominantRelationshipTypes(
  relationships: V3EvidenceRelationship[]
): V3EvidenceRelationshipType[] {
  const counts = new Map<V3EvidenceRelationshipType, number>();

  for (const relationship of relationships) {
    counts.set(relationship.type, (counts.get(relationship.type) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([type]) => type);
}

function createClusterLabel(
  evidenceIds: string[],
  evidence: V3Evidence[]
): string {
  const clusterEvidence = evidence.filter((item) =>
    evidenceIds.includes(item.id)
  );

  const keywordCounts = new Map<string, number>();

  for (const item of clusterEvidence) {
    for (const keyword of item.keywords) {
      keywordCounts.set(keyword, (keywordCounts.get(keyword) ?? 0) + 1);
    }
  }

  const topKeywords = Array.from(keywordCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([keyword]) => keyword);

  if (topKeywords.length > 0) {
    return `Evidence cluster around ${topKeywords.join(", ")}`;
  }

  return "Connected evidence cluster";
}

function buildMetrics(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[]
): V3EvidenceGraph["metrics"] {
  const possibleRelationships =
    evidence.length <= 1 ? 0 : (evidence.length * (evidence.length - 1)) / 2;

  return {
    evidenceCount: evidence.length,
    relationshipCount: relationships.length,
    density:
      possibleRelationships === 0
        ? 0
        : round(relationships.length / possibleRelationships),
    averageConfidence: round(
      average(relationships.map((relationship) => relationship.confidence))
    ),
    contradictionCount: relationships.filter(
      (relationship) => relationship.type === "contradicts"
    ).length,
    supportCount: relationships.filter(
      (relationship) => relationship.type === "supports"
    ).length,
    explanationCount: relationships.filter(
      (relationship) => relationship.type === "explains"
    ).length,
  };
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}