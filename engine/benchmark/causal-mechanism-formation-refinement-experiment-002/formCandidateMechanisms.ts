import { classifyTopology } from "./classifyTopology";
import { deriveTopologyAwareFalsification } from "./deriveTopologyAwareFalsification";
import { formExplicitEdges } from "./formExplicitLinearMechanisms";
import { identifyAlternativesAndConfounders } from "./identifyAlternativesAndConfounders";
import { inferImplicitEdges } from "./inferImplicitEdges";
import { recommendNextEvidence } from "./recommendNextEvidence";
import { registerTopologyAwareImplications } from "./registerTopologyAwareImplications";
import type {
  CandidateCausalEdge, CandidateCausalNode, RegisteredInput, TopologyCandidate,
} from "./types";

const unique = (values: string[]) => [...new Set(values)].sort();

function nodesFor(edges: CandidateCausalEdge[]): CandidateCausalNode[] {
  const ids = unique(edges.flatMap((edge) => [edge.fromNodeId, edge.toNodeId]));
  const incoming = new Map(ids.map((id) => [id, edges.filter((edge) => edge.toNodeId === id).length]));
  const outgoing = new Map(ids.map((id) => [id, edges.filter((edge) => edge.fromNodeId === id).length]));
  return ids.map((id) => {
    const related = edges.filter((edge) => edge.fromNodeId === id || edge.toNodeId === id);
    const role = (incoming.get(id) ?? 0) === 0 ? "upstream-driver"
      : (outgoing.get(id) ?? 0) === 0 ? "downstream-outcome" : "mediator";
    return {
      id, statement: id, role,
      artifactIds: unique(related.flatMap((edge) => edge.artifactIds)),
      evidenceIds: unique(related.flatMap((edge) => edge.evidenceIds)),
      supportingSiloIds: unique(related.flatMap((edge) => edge.supportingSiloIds)),
      supportStatus: related.every((edge) => edge.supportStatus === "explicit")
        ? "explicit" : related.every((edge) => edge.supportStatus !== "supported-but-ambiguous")
          ? "deterministically-derived" : "supported-but-ambiguous",
    };
  });
}

function structurallyComplete(topology: ReturnType<typeof classifyTopology>, edges: CandidateCausalEdge[]) {
  const incoming = new Map<string, number>(), outgoing = new Map<string, number>();
  edges.forEach((edge) => {
    incoming.set(edge.toNodeId, (incoming.get(edge.toNodeId) ?? 0) + 1);
    outgoing.set(edge.fromNodeId, (outgoing.get(edge.fromNodeId) ?? 0) + 1);
  });
  if (topology === "linear") return edges.length >= 2;
  if (topology === "branching")
    return [...outgoing].some(([id, count]) => count >= 2 && (incoming.get(id) ?? 0) >= 1);
  if (topology === "converging")
    return [...incoming].some(([id, count]) => count >= 2 && (outgoing.get(id) ?? 0) >= 1);
  return false;
}

function candidate(
  input: RegisteredInput,
  strategy: TopologyCandidate["strategy"],
  edges: CandidateCausalEdge[],
): TopologyCandidate {
  const { alternatives, confounderFlags } = identifyAlternativesAndConfounders(input);
  const topology = classifyTopology(edges);
  const deterministic = edges.length > 0 &&
    edges.every((edge) => edge.supportStatus === "explicit" || edge.supportStatus === "deterministically-derived");
  const complete = structurallyComplete(topology, edges);
  const explicitConditions = input.rawEvidence.flatMap((item) => {
    const match = item.text.match(/ when (.+?)\.$/i);
    return match ? [match[1]] : [];
  });
  const qualifies = complete && deterministic && alternatives.length > 0 && confounderFlags.length === 0;
  const value: TopologyCandidate = {
    id: `${strategy}:${input.scenarioId}`,
    strategy, topology, nodes: nodesFor(edges), edges,
    activatingConditions: unique(explicitConditions),
    competingExplanations: alternatives,
    implications: [],
    falsificationCriteria: [],
    confidence: qualifies ? 0.78 : complete ? 0.52 : 0.3,
    classification: confounderFlags.length > 0 ? "rejected"
      : qualifies ? "qualified-causal-mechanism"
        : edges.length > 0 ? "causal-hypothesis" : "fragment",
    missingStructure: [
      !complete && "complete-topology",
      !deterministic && "deterministic-edge-support",
      alternatives.length === 0 && "alternative-discrimination",
      confounderFlags.length > 0 && "unresolved-confounder",
    ].filter(Boolean) as string[],
    recommendedNextEvidence: [],
  };
  value.implications = registerTopologyAwareImplications(value);
  value.falsificationCriteria = deriveTopologyAwareFalsification(value);
  value.recommendedNextEvidence = recommendNextEvidence(value);
  return value;
}

export function formCandidateMechanisms(input: RegisteredInput) {
  const explicit = formExplicitEdges(input);
  const implicit = inferImplicitEdges(input);
  const allDeterministic = [...explicit, ...implicit].filter((edge) =>
    edge.supportStatus !== "supported-but-ambiguous");
  return [
    candidate(input, "explicit-linear", explicit),
    candidate(input, "implicit-linear", implicit),
    candidate(input, "explicit-topology", explicit),
    candidate(input, "implicit-topology", implicit),
    candidate(input, "conservative-unified", allDeterministic),
  ];
}
