import type { TopologyCandidate } from "./types";
export function auditInterventionLeverage(candidate: TopologyCandidate) {
  const targets = candidate.nodes.filter((node) => node.role === "mediator");
  return {
    classification: targets.length && candidate.falsificationCriteria.length
      ? "fully recoverable" : targets.length ? "partially recoverable" : "unavailable",
    mediatorTargets: targets.map((node) => node.id),
    branchTargets: candidate.topology === "branching"
      ? candidate.edges.filter((edge) => candidate.nodes.find((node) => node.id === edge.toNodeId)?.role === "downstream-outcome").map((edge) => edge.id)
      : [],
    contributorTargets: candidate.topology === "converging"
      ? candidate.nodes.filter((node) => node.role === "upstream-driver").map((node) => node.id)
      : [],
  };
}
