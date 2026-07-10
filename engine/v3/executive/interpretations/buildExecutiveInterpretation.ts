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
  //
  // Canonical organizational understanding
  //

  const currentExplanation = buildCurrentExplanation(input);

  /**
   * Sprint 53
   *
   * These are intentionally aliases of the same semantic understanding.
   * Discovery should have one explanation expressed through different
   * executive vocabulary—not multiple competing semantic models.
   */
  const organizationalTheory = currentExplanation;
  const currentMentalModel = currentExplanation;

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
    organizationalTheory,
    currentMentalModel,

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