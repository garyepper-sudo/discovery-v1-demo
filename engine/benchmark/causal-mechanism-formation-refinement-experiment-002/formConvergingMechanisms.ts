import type { CandidateCausalEdge } from "./types";
export function convergingEdges(edges: CandidateCausalEdge[]) {
  const counts = new Map<string, number>();
  edges.forEach((edge) => counts.set(edge.toNodeId, (counts.get(edge.toNodeId) ?? 0) + 1));
  return edges.filter((edge) => (counts.get(edge.toNodeId) ?? 0) >= 2);
}
