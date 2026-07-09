import type { ExecutiveInterpretationInput } from "./executiveInterpretationTypes";

function cleanText(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function buildRemainingUncertainty(
  input: ExecutiveInterpretationInput,
): string {
  const primaryNarrative = input.narratives[0];
  const uncertainty = cleanText(
    primaryNarrative?.mentalModelEvolution?.remainingUncertainty,
  );

  if (uncertainty) {
    return `Discovery still cannot fully distinguish whether ${uncertainty}`;
  }

  const lowConfidenceUnderstanding = input.currentUnderstanding.find(
    (item) => item.confidence !== undefined && item.confidence < 0.55,
  );

  if (lowConfidenceUnderstanding) {
    return `Discovery still cannot fully distinguish whether "${lowConfidenceUnderstanding.title}" is a durable organizational pattern or a temporary signal.`;
  }

  return "Discovery still cannot fully distinguish which parts of this explanation are durable operating patterns and which parts may reflect the most recent investigation context.";
}

export function buildEvidenceThatCouldChangeTheExplanation(
  input: ExecutiveInterpretationInput,
): string {
  const primaryNarrative = input.narratives[0];
  const falsifier = cleanText(
    primaryNarrative?.mentalModelEvolution?.whatCouldChangeDiscoverysMind,
  );

  if (falsifier) {
    return `Additional evidence could substantially revise this explanation if ${falsifier}`;
  }

  const changedItem = input.whatChanged[0];

  if (changedItem) {
    return `Additional evidence could substantially revise this explanation if future investigations show that "${changedItem.title}" does not persist across teams, time periods, or decision contexts.`;
  }

  return "Additional evidence could substantially revise this explanation if future investigations show a different pattern of behavior, incentives, or constraints than Discovery currently understands.";
}