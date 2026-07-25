import type { CandidateCausalEdge, CandidateTopology } from "./types";

export function classifyTopology(edges: CandidateCausalEdge[]): CandidateTopology {
  if (edges.length < 2) return "unresolved";
  const incoming = new Map<string, number>();
  const outgoing = new Map<string, number>();
  for (const edge of edges) {
    outgoing.set(edge.fromNodeId, (outgoing.get(edge.fromNodeId) ?? 0) + 1);
    incoming.set(edge.toNodeId, (incoming.get(edge.toNodeId) ?? 0) + 1);
  }
  const branching = [...outgoing.values()].some((count) => count >= 2);
  const converging = [...incoming.values()].some((count) => count >= 2);
  if (branching && converging) return "mixed";
  if (branching) return "branching";
  if (converging) return "converging";
  return "linear";
}
