import {
  V3Belief,
  V3Contradiction,
  V3Evidence,
  V3Theme,
  V3Understanding,
} from "../types";

export type UnderstandingEngineInput = {
  evidence: V3Evidence[];
  themes: V3Theme[];
  contradictions: V3Contradiction[];
  beliefs: V3Belief[];
  understanding: V3Understanding;
};

export type PrioritizedUnderstanding = {
  primaryBelief?: V3Belief;
  primaryTheme?: V3Theme;
  primaryContradiction?: V3Contradiction;
  strongestEvidence?: V3Evidence;
  confidence: number;
};

export type CompressedUnderstanding = {
  headline: string;
  coreClaim: string;
  strategicMeaning: string;
  confidence: number;
};

export type UnderstandingExplanation = {
  confidenceLabel: "early" | "moderate" | "strong";
  whyWeBelieveIt: string;
  uncertainty: string;
};

export type UnderstandingRecommendation = {
  nextQuestion: string;
  mondayMove: string;
  watchSignal: string;
};

export type ExecutiveNarrative = {
  headline: string;
  body: string;
  confidence: number;
  currentAssessment: string;
  suggestedNextQuestion: string;
  nextMoves: string[];
};