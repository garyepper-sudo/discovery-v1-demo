import type { DynamicEdge } from "./types";
export function analyzeThresholds(edges: DynamicEdge[]) {
  return edges.map((edge) => {
    const ordered = edge.observations;
    const deltas = ordered.slice(1).map((item, index) => ({
      fromState: ordered[index].stateLevel,
      toState: item.stateLevel,
      outcomeDelta: item.outcomeLevel - ordered[index].outcomeLevel,
    }));
    return {
      edgeId: edge.id,
      thresholdDetected: edge.dynamicClasses.includes("threshold"),
      largestTransition: [...deltas].sort((a, b) =>
        b.outcomeDelta - a.outcomeDelta)[0] ?? null,
      curveFitted: false,
    };
  });
}
