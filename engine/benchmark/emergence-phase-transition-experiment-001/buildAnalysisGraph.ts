import type { GeneratedCognition } from "../emergent-organizational-intelligence-production-shadow-experiment-002/types";
import type {
  AnalysisEdge,
  AnalysisGraph,
  EvidenceConfiguration,
} from "./types";

const stop = new Set([
  "about", "after", "again", "current", "during", "from", "have", "increasing",
  "into", "more", "same", "that", "their", "this", "with",
]);
const tokens = (value: string) =>
  new Set(
    value
      .toLowerCase()
      .split(/\W+/)
      .filter((item) => item.length >= 5 && !stop.has(item)),
  );

export function buildAnalysisGraph(
  configuration: EvidenceConfiguration,
  cognition: GeneratedCognition,
): AnalysisGraph {
  const nodes: AnalysisGraph["nodes"] = [];
  const edges: AnalysisEdge[] = [];
  const evidence = [...configuration.scenario.evidence].sort((a, b) =>
    a.sourceId.localeCompare(b.sourceId),
  );
  for (const item of evidence) {
    nodes.push({ id: `e:${item.sourceId}`, kind: "evidence" });
    nodes.push({ id: `s:${item.silo}`, kind: "silo" });
    edges.push({
      id: `membership:${item.sourceId}:${item.silo}`,
      source: `e:${item.sourceId}`,
      target: `s:${item.silo}`,
      kind: "silo-membership",
    });
  }
  for (let left = 0; left < evidence.length; left += 1) {
    for (let right = left + 1; right < evidence.length; right += 1) {
      const overlap = [...tokens(evidence[left].content)].filter((item) =>
        tokens(evidence[right].content).has(item),
      );
      if (overlap.length > 0) {
        edges.push({
          id: `lexical:${evidence[left].sourceId}:${evidence[right].sourceId}`,
          source: `e:${evidence[left].sourceId}`,
          target: `e:${evidence[right].sourceId}`,
          kind: "lexical-overlap",
        });
      }
      const a = Date.parse(evidence[left].observedAt ?? "");
      const b = Date.parse(evidence[right].observedAt ?? "");
      if (Number.isFinite(a) && Number.isFinite(b) && a < b) {
        edges.push({
          id: `temporal:${evidence[left].sourceId}:${evidence[right].sourceId}`,
          source: `e:${evidence[left].sourceId}`,
          target: `e:${evidence[right].sourceId}`,
          kind: "temporal",
        });
      }
    }
  }
  for (const mechanism of cognition.mechanisms) {
    nodes.push({ id: `m:${mechanism.id}`, kind: "mechanism" });
    for (const sourceId of mechanism.sourceIds) {
      edges.push({
        id: `lineage:${sourceId}:${mechanism.id}`,
        source: `e:${sourceId}`,
        target: `m:${mechanism.id}`,
        kind: "lineage",
      });
    }
  }
  return {
    nodes: [...new Map(nodes.map((item) => [item.id, item])).values()].sort(
      (a, b) => a.id.localeCompare(b.id),
    ),
    edges: edges.sort((a, b) => a.id.localeCompare(b.id)),
  };
}
