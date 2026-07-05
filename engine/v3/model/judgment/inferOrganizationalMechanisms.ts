import {
  buildMechanismNetwork,
  type MechanismNetwork,
} from "./buildMechanismNetwork";
import { buildMechanismCandidates } from "./mechanismCandidateBuilder";
import { consolidateOrganizationalMechanisms } from "./consolidateOrganizationalMechanisms";
import { interpretMechanismCandidates } from "./mechanismInterpreter";
import type { InferOrganizationalMechanismsInput } from "./mechanismInferenceTypes";
import type { OrganizationalMechanism } from "./organizationalMechanism";

export function inferOrganizationalMechanisms({
  phenomena = [],
  patterns = [],
  semanticConcepts = [],
  explanations = [],
  reasoningPaths = [],
  capabilities = [],
  understandingClusters = [],
  judgments = [],
}: InferOrganizationalMechanismsInput): MechanismNetwork {
  const hasPhenomena = Array.isArray(phenomena) && phenomena.length > 0;
  const hasPatterns = Array.isArray(patterns) && patterns.length > 0;
  const hasSemanticConcepts =
    Array.isArray(semanticConcepts) && semanticConcepts.length > 0;
  const hasExplanations =
    Array.isArray(explanations) && explanations.length > 0;

  if (
    !hasPhenomena &&
    !hasPatterns &&
    !hasSemanticConcepts &&
    !hasExplanations
  ) {
    const mechanisms: OrganizationalMechanism[] = [];
    return buildMechanismNetwork(mechanisms);
  }

  const candidates = buildMechanismCandidates({
    phenomena,
    patterns,
    semanticConcepts,
    explanations,
    reasoningPaths,
    capabilities,
    understandingClusters,
    judgments,
  });

  const rawMechanisms = interpretMechanismCandidates(candidates);

  const mechanisms = consolidateOrganizationalMechanisms(rawMechanisms);

  return buildMechanismNetwork(mechanisms);
}