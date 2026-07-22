import {
  buildMechanismNetwork,
  type MechanismNetwork,
} from "./buildMechanismNetwork";
import { buildMechanismCandidates } from "./mechanismCandidateBuilder";
import { consolidateOrganizationalMechanisms } from "./consolidateOrganizationalMechanisms";
import { interpretMechanismCandidates } from "./mechanismInterpreter";
import type { InferOrganizationalMechanismsInput } from "./mechanismInferenceTypes";
import type { OrganizationalMechanism } from "./organizationalMechanism";

function asArray<T>(value: T[] | undefined | null): T[] {
  return Array.isArray(value) ? value : [];
}

export function inferOrganizationalMechanisms(
  input: InferOrganizationalMechanismsInput,
): MechanismNetwork {
  const safeSource = input ?? {};

  const safeInput = {
    previousMechanisms: asArray(safeSource.previousMechanisms),
    phenomena: asArray(safeSource.phenomena),
    understandings: asArray(safeSource.understandings),
    patterns: asArray(safeSource.patterns),
    compressedPatternThemes: asArray(safeSource.compressedPatternThemes),
    semanticConcepts: asArray(safeSource.semanticConcepts),
    explanations: asArray(safeSource.explanations),
    reasoningPaths: asArray(safeSource.reasoningPaths),
    capabilities: asArray(safeSource.capabilities),
    understandingClusters: asArray(safeSource.understandingClusters),
    judgments: asArray(safeSource.judgments),
  };

  const hasSignal =
    safeInput.phenomena.length > 0 ||
    safeInput.patterns.length > 0 ||
    safeInput.compressedPatternThemes.length > 0 ||
    safeInput.semanticConcepts.length > 0 ||
    safeInput.explanations.length > 0 ||
    safeInput.reasoningPaths.length > 0 ||
    safeInput.capabilities.length > 0 ||
    safeInput.understandingClusters.length > 0 ||
    safeInput.judgments.length > 0;

  if (!hasSignal) {
    const mechanisms: OrganizationalMechanism[] = [];
    return buildMechanismNetwork(mechanisms);
  }

  const candidates = buildMechanismCandidates(safeInput);

  const safeCandidates = Array.isArray(candidates) ? candidates : [];

  const rawMechanisms = interpretMechanismCandidates(safeCandidates, {
    phenomena: safeInput.phenomena,
    understandings: safeInput.understandings,
  });

  const safeRawMechanisms = Array.isArray(rawMechanisms) ? rawMechanisms : [];

  const mechanisms = consolidateOrganizationalMechanisms(
    safeRawMechanisms,
    safeInput.previousMechanisms,
  );

  const safeMechanisms = Array.isArray(mechanisms) ? mechanisms : [];

  return buildMechanismNetwork(safeMechanisms);
}
