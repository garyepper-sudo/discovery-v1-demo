import type { CandidateCausalEdge } from "./types";
export function branchingEdges(edges: CandidateCausalEdge[]) {
  const counts = new Map<string, number>();
  edges.forEach((edge) => counts.set(edge.fromNodeId, (counts.get(edge.fromNodeId) ?? 0) + 1));
  return edges.filter((edge) => (counts.get(edge.fromNodeId) ?? 0) >= 2);
}
