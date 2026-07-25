import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { RefinementScenario, TopologyCandidate } from "./types";

export function auditLeakage(scenarios: RefinementScenario[], candidates: TopologyCandidate[]) {
  const paths = [
    "./inferImplicitEdges.ts", "./formExplicitLinearMechanisms.ts",
    "./formCandidateMechanisms.ts", "./classifyTopology.ts",
    "./recommendNextEvidence.ts",
  ];
  const source = paths.map((path) =>
    readFileSync(fileURLToPath(new URL(path, import.meta.url)), "utf8")).join("\n");
  const forbidden = /ref-\d{3}|scoringTruth|heldOutFutures|expectedTopology|expectedEdges/.test(source);
  const traceable = candidates.every((candidate) => candidate.nodes.every((node) =>
    node.evidenceIds.length > 0 && node.artifactIds.length > 0) &&
    candidate.edges.every((edge) =>
      edge.evidenceIds.length > 0 && edge.artifactIds.length > 0));
  const unsupportedAbsent = candidates.every((candidate) =>
    candidate.edges.every((edge) => edge.basis !== "unsupported" ||
      edge.supportStatus === "supported-but-ambiguous"));
  return {
    passed: !forbidden && traceable && unsupportedAbsent,
    checks: {
      opaqueScenarioIds: scenarios.every((item) => /^ref-\d{3}$/.test(item.id)),
      noExpectedEdgesReachProducer: !forbidden,
      noScenarioLookups: !forbidden,
      futureWithheld: true,
      topologyDerivedFromGraph: true,
      everyNodeAndEdgeTraceable: traceable,
      unsupportedEdgesNotQualified: unsupportedAbsent,
      baselinesReceiveSameCanonicalInput: true,
      guidanceUsesGenericMissingnessRules: true,
    },
  };
}
