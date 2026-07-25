import { composePairwiseRelationships } from "../causal-mechanism-formation-experiment-001/composePairwiseRelationships";
import type { CandidateCausalEdge, RegisteredInput } from "./types";

export function formExplicitEdges(input: RegisteredInput): CandidateCausalEdge[] {
  return composePairwiseRelationships(input).map((edge, index) => ({
    id: `explicit-edge-${index}`,
    fromNodeId: edge.from,
    toNodeId: edge.to,
    relationship: edge.relationship,
    basis: "explicit-causal-language",
    supportForms: ["explicit-causal-language"],
    artifactIds: edge.artifactIds,
    evidenceIds: edge.evidenceIds,
    supportingSiloIds: [edge.silo],
    supportStatus: "explicit",
    confidence: 0.82,
    alternativeDirections: [],
    confounders: [],
  }));
}
