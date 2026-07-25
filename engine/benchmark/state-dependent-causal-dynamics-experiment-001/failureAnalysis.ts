import type { DynamicEdge } from "./types";
export function analyzeFailures(edges: DynamicEdge[]) {
  return {
    unresolved: edges.filter((edge) => edge.classification === "unresolved").map((edge) => edge.id),
    rejected: edges.filter((edge) => edge.classification === "rejected").map((edge) => edge.id),
    unsupportedClasses: ["unknown"],
    note:
      "Unresolved controls lack repeated state-discriminating structure. Unknown dynamics remain unsupported rather than inferred.",
  };
}
