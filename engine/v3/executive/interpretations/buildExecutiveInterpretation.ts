import {
  buildCurrentExplanation,
  buildExplanationEvolution,
  buildExecutiveSummary,
} from "./explanationBuilder";

import { buildConfidenceNarrative } from "./confidenceNarrative";

import { buildCompetingExplanationNarrative } from "./competingExplanations";

import {
  buildRemainingUncertainty,
  buildEvidenceThatCouldChangeTheExplanation,
} from "./uncertaintyNarrative";

import type {
  ExecutiveInterpretation,
  ExecutiveInterpretationInput,
} from "./executiveInterpretationTypes";

export function buildExecutiveInterpretation(
  input: ExecutiveInterpretationInput,
): ExecutiveInterpretation {
  const currentExplanation = buildCurrentExplanation(input);

  const explanationEvolution = buildExplanationEvolution(input);

  const confidenceNarrative = buildConfidenceNarrative(input);

  const competingExplanationNarrative =
    buildCompetingExplanationNarrative(input);

  const remainingUncertainty = buildRemainingUncertainty(input);

  const evidenceThatCouldChangeTheExplanation =
    buildEvidenceThatCouldChangeTheExplanation(input);

  const executiveSummary = buildExecutiveSummary(
    currentExplanation,
    explanationEvolution,
  );

  const primaryNarrative = input.narratives[0];

  return {
    currentExplanation,
    explanationEvolution,
    confidenceNarrative,
    competingExplanationNarrative,
    remainingUncertainty,
    evidenceThatCouldChangeTheExplanation,
    executiveSummary,

    sourceNarrativeId: primaryNarrative?.id,
    sourceContinuity: primaryNarrative?.continuity,
    sourceMentalModelEvolution: primaryNarrative?.mentalModelEvolution,
  };
}