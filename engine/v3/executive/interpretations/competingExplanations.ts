import type { ExecutiveInterpretationInput } from "./executiveInterpretationTypes";

function cleanList(values?: string[]): string[] {
  return (values ?? [])
    .map((value) => value.trim())
    .filter((value) => value.length > 0);
}

export function buildCompetingExplanationNarrative(
  input: ExecutiveInterpretationInput,
): string {
  const primary = input.narratives[0];

  const weakened = cleanList(
    primary?.mentalModelEvolution?.weakenedExplanations,
  );

  if (weakened.length > 0) {
    return `A previously likely explanation became less consistent with the evidence: ${weakened.join(
      "; ",
    )}.`;
  }

  const continuityReasons = cleanList(primary?.continuity?.whyChanged);

  if (continuityReasons.length > 0) {
    return `Discovery has weakened alternative explanations because ${continuityReasons.join(
      "; ",
    )}.`;
  }

  if (input.whatChanged.length > 0) {
    return `Discovery still treats alternative explanations as plausible, but recent changes make the current explanation more useful for executive decision-making than treating each signal separately.`;
  }

  return "Discovery has not yet ruled out competing explanations. The current explanation should be treated as the most coherent working theory rather than a final conclusion.";
}