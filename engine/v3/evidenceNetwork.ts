import { buildEvidenceGraph, V3EvidenceGraph } from "./evidenceGraph";
import { buildEvidenceRelationships } from "./evidenceRelationships";
import {
  V3Evidence,
  V3EvidenceRelationship,
  V3EvidenceRelationshipType,
} from "./types";

export type V3EvidenceNetwork = {
  evidence: V3Evidence[];
  relationships: V3EvidenceRelationship[];
  graph: V3EvidenceGraph;

  summary: {
    evidenceCount: number;
    relationshipCount: number;
    clusterCount: number;
    dominantRelationshipTypes: V3EvidenceRelationshipType[];
    mostConnectedEvidenceIds: string[];
    contradictionCount: number;
    density: number;
    averageConfidence: number;
  };
};

export function buildEvidenceNetwork(evidence: V3Evidence[]): V3EvidenceNetwork {
  const relationships = buildEvidenceRelationships(evidence);
  const graph = buildEvidenceGraph(evidence, relationships);

  return {
    evidence,
    relationships,
    graph,
    summary: buildNetworkSummary(evidence, relationships, graph),
  };
}

function buildNetworkSummary(
  evidence: V3Evidence[],
  relationships: V3EvidenceRelationship[],
  graph: V3EvidenceGraph
): V3EvidenceNetwork["summary"] {
  return {
    evidenceCount: evidence.length,
    relationshipCount: relationships.length,
    clusterCount: graph.clusters.length,
    dominantRelationshipTypes: getDominantRelationshipTypes(relationships),
    mostConnectedEvidenceIds: getMostConnectedEvidenceIds(graph),
    contradictionCount: graph.metrics.contradictionCount,
    density: graph.metrics.density,
    averageConfidence: graph.metrics.averageConfidence,
  };
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

function getMostConnectedEvidenceIds(graph: V3EvidenceGraph): string[] {
  return [...graph.nodes]
    .sort((a, b) => b.connectionCount - a.connectionCount)
    .filter((node) => node.connectionCount > 0)
    .slice(0, 5)
    .map((node) => node.evidenceId);
}