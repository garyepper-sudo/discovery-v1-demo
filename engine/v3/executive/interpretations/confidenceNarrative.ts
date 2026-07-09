import type { ExecutiveInterpretationInput } from "./executiveInterpretationTypes";

function formatConfidence(value?: number): string | undefined {
  if (value === undefined || Number.isNaN(value)) return undefined;

  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
}

export function buildConfidenceNarrative(
  input: ExecutiveInterpretationInput,
): string {
  const primary = input.narratives[0];

  const confidenceChange =
    primary?.mentalModelEvolution?.confidenceChanged?.trim();

  if (confidenceChange) {
    return `Discovery's confidence changed because ${confidenceChange}`;
  }

  const confidence =
    formatConfidence(primary?.confidence) ??
    formatConfidence(input.organizationConfidence);

  if (confidence) {
    return `Discovery treats this explanation as ${confidence} supported because multiple signals are now being interpreted as parts of the same organizational pattern rather than isolated observations.`;
  }

  if (primary?.supportingReasoning) {
    return `Multiple independent observations support this explanation: ${primary.supportingReasoning}`;
  }

  return "Discovery treats this explanation as provisional because the available evidence supports a coherent pattern, but the strength of that pattern has not yet been fully established.";
}