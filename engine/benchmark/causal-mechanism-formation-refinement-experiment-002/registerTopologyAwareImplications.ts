import type { TopologyCandidate } from "./types";

export function registerTopologyAwareImplications(candidate: TopologyCandidate) {
  const outgoing = new Set(candidate.edges.map((edge) => edge.fromNodeId));
  const leaves = candidate.nodes.filter((node) => !outgoing.has(node.id));
  if (candidate.classification === "rejected") return [];
  if (candidate.topology === "converging") {
    const contributors = candidate.nodes
      .filter((node) => node.role === "upstream-driver").map((node) => node.id);
    return leaves.map((leaf) => ({
      trigger: `all supported contributors remain present: ${contributors.join(", ")}`,
      predictedOutcome: leaf.statement,
      affectedBranchOrPathIds: contributors,
      horizon: "under the registered operating conditions",
      confidence: candidate.confidence,
      artifactIds: [...new Set(candidate.edges.flatMap((edge) => edge.artifactIds))].sort(),
      evidenceIds: [...new Set(candidate.edges.flatMap((edge) => edge.evidenceIds))].sort(),
    }));
  }
  return leaves.map((leaf) => ({
    trigger: candidate.activatingConditions[0] ?? "the supported upstream condition persists",
    predictedOutcome: leaf.statement,
    affectedBranchOrPathIds: candidate.edges
      .filter((edge) => edge.toNodeId === leaf.id).map((edge) => edge.id),
    horizon: "under the registered operating conditions",
    confidence: candidate.confidence,
    artifactIds: [...new Set(candidate.edges.flatMap((edge) => edge.artifactIds))].sort(),
    evidenceIds: [...new Set(candidate.edges.flatMap((edge) => edge.evidenceIds))].sort(),
  }));
}
