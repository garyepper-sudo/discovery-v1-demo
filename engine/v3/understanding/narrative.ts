import {
  CompressedUnderstanding,
  ExecutiveNarrative,
  UnderstandingExplanation,
  UnderstandingRecommendation,
} from "./types";

export function buildExecutiveNarrative(params: {
  compressed: CompressedUnderstanding;
  explanation: UnderstandingExplanation;
  recommendation: UnderstandingRecommendation;
}): ExecutiveNarrative {
  const { compressed, explanation, recommendation } = params;

  return {
    headline: compressed.headline,
    body: buildBody(compressed, explanation),
    confidence: compressed.confidence,
    currentAssessment: buildCurrentAssessment(explanation),
    suggestedNextQuestion: recommendation.nextQuestion,
    nextMoves: [
      recommendation.mondayMove,
      recommendation.watchSignal,
      recommendation.nextQuestion,
    ],
  };
}

function buildBody(
  compressed: CompressedUnderstanding,
  explanation: UnderstandingExplanation
): string {
  return `${compressed.coreClaim} ${compressed.strategicMeaning} Discovery is ${confidenceLanguage(
    explanation.confidenceLabel
  )} in this assessment. The main uncertainty is: ${explanation.uncertainty}`;
}

function buildCurrentAssessment(
  explanation: UnderstandingExplanation
): string {
  if (explanation.confidenceLabel === "strong") {
    return "Discovery has a strong working understanding, but it should still be tested against new evidence.";
  }

  if (explanation.confidenceLabel === "moderate") {
    return "Discovery has a moderate working understanding. It is useful for discussion, but not yet fully settled.";
  }

  return "Discovery has an early working understanding. It should be treated as directional.";
}

function confidenceLanguage(
  label: UnderstandingExplanation["confidenceLabel"]
): string {
  if (label === "strong") return "strongly confident";
  if (label === "moderate") return "moderately confident";
  return "early but not yet confident";
}