import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type {
  AnalysisGraph,
  EvidenceConfiguration,
  RelationalMetrics,
} from "./types";

const round = (value: number) => Math.round(value * 1_000_000) / 1_000_000;

function components(graph: AnalysisGraph, excluded?: string) {
  const ids = graph.nodes
    .map((item) => item.id)
    .filter((item) => item !== excluded);
  const neighbors = new Map(ids.map((id) => [id, new Set<string>()]));
  for (const edge of graph.edges) {
    if (
      edge.source === excluded ||
      edge.target === excluded ||
      !neighbors.has(edge.source) ||
      !neighbors.has(edge.target)
    ) continue;
    neighbors.get(edge.source)!.add(edge.target);
    neighbors.get(edge.target)!.add(edge.source);
  }
  const seen = new Set<string>();
  const sizes: number[] = [];
  for (const id of ids) {
    if (seen.has(id)) continue;
    const queue = [id];
    let size = 0;
    seen.add(id);
    while (queue.length) {
      const next = queue.shift()!;
      size += 1;
      for (const neighbor of neighbors.get(next) ?? []) {
        if (!seen.has(neighbor)) {
          seen.add(neighbor);
          queue.push(neighbor);
        }
      }
    }
    sizes.push(size);
  }
  return sizes;
}

export function calculateRelationalMetrics(
  configuration: EvidenceConfiguration,
  cognition: GeneratedCognition,
  graph: AnalysisGraph,
): RelationalMetrics {
  const evidence = [...configuration.scenario.evidence].sort((a, b) =>
    a.sourceId.localeCompare(b.sourceId),
  );
  const siloCounts = new Map<string, number>();
  for (const item of evidence) {
    siloCounts.set(item.silo, (siloCounts.get(item.silo) ?? 0) + 1);
  }
  const normalized = evidence.map((item) =>
    item.content.toLowerCase().replace(/\W+/g, " ").trim(),
  );
  const unique = new Set(normalized).size;
  const lexical = graph.edges.filter((item) => item.kind === "lexical-overlap");
  const evidenceNodes = graph.nodes.filter((item) => item.kind === "evidence");
  const baseComponents = components(graph);
  const articulations = evidenceNodes.filter(
    (item) => components(graph, item.id).length > baseComponents.length,
  ).length;
  const times = evidence
    .map((item) => Date.parse(item.observedAt ?? ""))
    .filter(Number.isFinite);
  const mechanisms = cognition.mechanisms;
  const qualifying = mechanisms.filter(
    (item) => item.crossSilo && !item.explicitInSingleSource,
  );
  const completeLineage = mechanisms.filter(
    (item) => item.evidenceIds.length > 0 && item.sourceIds.length > 0,
  ).length;
  return {
    evidenceCount: evidence.length,
    siloCount: siloCounts.size,
    uniqueSourceCount: new Set(evidence.map((item) => item.sourceId)).size,
    characterVolume: evidence.reduce(
      (sum, item) => sum + item.content.length,
      0,
    ),
    largestSiloConcentration: round(
      Math.max(...siloCounts.values()) / Math.max(1, evidence.length),
    ),
    redundancyRatio: round(1 - unique / Math.max(1, evidence.length)),
    complementarityRatio: round(
      lexical.length / Math.max(1, evidence.length - 1),
    ),
    connectedComponents: baseComponents.length,
    largestComponentRatio: round(
      Math.max(...baseComponents, 0) / Math.max(1, graph.nodes.length),
    ),
    crossSiloEdgeCount: lexical.length,
    crossSiloEdgeDensity: round(
      lexical.length /
        Math.max(1, (evidence.length * (evidence.length - 1)) / 2),
    ),
    bridgeEdgeCount: Math.max(0, articulations),
    articulationPointCount: articulations,
    maximumCausalDepth: qualifying.length
      ? Math.max(...qualifying.map((item) => item.silos.length))
      : 0,
    temporalSpanDays:
      times.length > 1
        ? round((Math.max(...times) - Math.min(...times)) / 86_400_000)
        : 0,
    temporalConsistency: times.every(
      (item, index) => index === 0 || item >= times[index - 1],
    )
      ? 1
      : 0,
    contradictionCount: cognition.contradictions.length,
    mechanismCount: mechanisms.length,
    qualifyingMechanismCount: qualifying.length,
    maximumSupportingSilos: Math.max(
      0,
      ...mechanisms.map((item) => item.silos.length),
    ),
    mechanismConfidence: round(
      mechanisms.length
        ? mechanisms.reduce((sum, item) => sum + item.confidence, 0) /
            mechanisms.length
        : 0,
    ),
    lineageCompleteness: round(
      completeLineage / Math.max(1, mechanisms.length),
    ),
  };
}
