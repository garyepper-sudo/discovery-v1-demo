// engine/v3/executive/interpretation/explanationBuilder.ts

import type { ExecutiveInterpretationInput } from "./executiveInterpretationTypes";

function clean(value?: string): string | undefined {
  const text = value?.trim();
  return text && text.length > 0 ? text : undefined;
}

export function buildCurrentExplanation(
  input: ExecutiveInterpretationInput,
): string {
  const primary = input.narratives[0];

  const mentalModel = clean(
    primary?.mentalModelEvolution?.currentExplanation,
  );

  if (mentalModel) {
    return `Discovery now explains that ${mentalModel}`;
  }

  if (primary?.executiveConversation) {
    return `Discovery now explains that ${primary.executiveConversation}`;
  }

  if (primary?.businessImpact) {
    return `Discovery now explains that ${primary.businessImpact}`;
  }

  const understanding = input.currentUnderstanding[0];

  if (understanding) {
    return `Discovery now explains that ${understanding.summary}`;
  }

  return "Discovery does not yet have sufficient evidence to produce a stable organizational explanation.";
}

export function buildExplanationEvolution(
  input: ExecutiveInterpretationInput,
): string {
  const primary = input.narratives[0];

  const evolution = clean(
    primary?.mentalModelEvolution?.explanationChanged,
  );

  if (evolution) {
    return `Recent investigations increasingly reinforce that ${evolution}`;
  }

  const continuity = primary?.continuity;

  if (continuity?.whatChanged?.length) {
    return `Recent investigations increasingly reinforce ${continuity.whatChanged.join(
      ", ",
    )}.`;
  }

  if (input.whatChanged.length) {
    return `Recent investigations refined Discovery's explanation through ${input.whatChanged.length} meaningful organizational change${
      input.whatChanged.length === 1 ? "" : "s"
    }.`;
  }

  return "Discovery's explanation has remained broadly consistent across recent investigations.";
}

export function buildExecutiveSummary(
  currentExplanation: string,
  explanationEvolution: string,
): string {
  return `${currentExplanation} ${explanationEvolution}`;
}