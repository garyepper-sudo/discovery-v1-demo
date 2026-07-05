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
  explanations,
  reasoningPaths = [],
  capabilities = [],
  understandingClusters = [],
  judgments = [],
}: InferOrganizationalMechanismsInput): MechanismNetwork {
  if (!Array.isArray(explanations) || explanations.length === 0) {
    const mechanisms: OrganizationalMechanism[] = [];
    return buildMechanismNetwork(mechanisms);
  }

  const candidates = buildMechanismCandidates({
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