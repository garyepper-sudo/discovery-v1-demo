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
  patterns = [],
  explanations = [],
  reasoningPaths = [],
  capabilities = [],
  understandingClusters = [],
  judgments = [],
}: InferOrganizationalMechanismsInput): MechanismNetwork {
  const hasPatterns = Array.isArray(patterns) && patterns.length > 0;
  const hasExplanations = Array.isArray(explanations) && explanations.length > 0;

  if (!hasPatterns && !hasExplanations) {
    const mechanisms: OrganizationalMechanism[] = [];
    return buildMechanismNetwork(mechanisms);
  }

  const candidates = buildMechanismCandidates({
    patterns,
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