import type { CognitiveFitnessScore } from "./benchmarkTypes";

type TheoryValidationItem = {
  label?: string;
  rationale?: string;
  confidence?: number;
};

type CompetingTheoryItem = {
  theory?: string;
  reasonItWasConsidered?: string;
  reasonItLost?: string;
  confidence?: number;
};

type OrganizationalMemoryMaturityInput = {
  score?: number;
  persistentBeliefs?: number;
  recurringMechanisms?: number;
  stableTheories?: number;
  historicalContinuity?: number;
  contradictionResolution?: number;
  understandingReuse?: number;
  conceptStability?: number;
  reasons?: string[];
};

export type UnderstandingFitnessInput = {
  observations?: unknown[];
  mechanisms?: string[];
  capabilities?: string[];
  compressedConcepts?: string[];
  conceptualUnderstanding?: string[];
  organizationalBeliefs?: Array<{
    statement?: string;
    confidence?: number;
    trend?: string;
  }>;
  organizationalBeliefRevisions?: Array<{
    beliefId?: string;
    previousConfidence?: number;
    revisedConfidence?: number;
    trend?: string;
    reason?: string;
  }>;
  organizationalMemoryMaturity?: OrganizationalMemoryMaturityInput | null;
  executiveText?: string;
  theoryValidation?: {
    dominantTheory?: string | null;
    whyDiscoveryBelievesIt?: string;
    supportingMechanisms?: TheoryValidationItem[];
    supportingOrganizationalBeliefs?: TheoryValidationItem[];
    competingTheoriesConsidered?: CompetingTheoryItem[];
    contradictoryOrWeakeningEvidence?: TheoryValidationItem[];
    calibratedConfidenceExplanation?: string;
    additionalEvidenceThatWouldIncreaseConfidence?: string[];
    evidenceThatWouldFalsifyTheory?: string[];
    executiveRecommendation?: string;
  };
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function scorePresence(count: number, target: number): number {
  if (target <= 0) return 1;
  return clamp01(count / target);
}

function hasText(value: string | null | undefined): boolean {
  return Boolean(value && value.trim().length > 0);
}

function roundScore(value: number): number {
  return Math.round(clamp01(value) * 100);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function scoreFromPercent(value: number | undefined): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return clamp01(value / 100);
}

function computeMaturityLevel(score: CognitiveFitnessScore): number {
  const overall = score.overall;

  if (overall >= 95) return 7;
  if (overall >= 88) return 6;
  if (overall >= 80) return 5;
  if (overall >= 70) return 4;
  if (overall >= 60) return 3;
  if (overall >= 45) return 2;
  return 1;
}

export function scoreUnderstandingFitness(
  input: UnderstandingFitnessInput,
): CognitiveFitnessScore {
  const observations = input.observations ?? [];
  const mechanisms = input.mechanisms ?? [];
  const capabilities = input.capabilities ?? [];
  const compressedConcepts = input.compressedConcepts ?? [];
  const conceptualUnderstanding = input.conceptualUnderstanding ?? [];
  const organizationalBeliefs = input.organizationalBeliefs ?? [];
  const organizationalBeliefRevisions =
    input.organizationalBeliefRevisions ?? [];
  const theoryValidation = input.theoryValidation;
  const memoryMaturity = input.organizationalMemoryMaturity ?? null;

  const perception = scorePresence(observations.length, 5);

  const patternFormation = average([
    scorePresence(mechanisms.length, 3),
    scorePresence(compressedConcepts.length, 3),
    scorePresence(conceptualUnderstanding.length, 2),
  ]);

  const mechanisticReasoning = average([
    scorePresence(mechanisms.length, 3),
    scorePresence(theoryValidation?.supportingMechanisms?.length ?? 0, 3),
    hasText(theoryValidation?.whyDiscoveryBelievesIt) ? 1 : 0,
  ]);

  const calculatedOrganizationalMemory = average([
    scorePresence(organizationalBeliefs.length, 3),
    scorePresence(organizationalBeliefRevisions.length, 2),
    organizationalBeliefs.some((belief) => hasText(belief.trend)) ? 1 : 0,
  ]);

  const maturityOrganizationalMemory = scoreFromPercent(memoryMaturity?.score);

  const organizationalMemory =
    maturityOrganizationalMemory ?? calculatedOrganizationalMemory;

  const conceptFormation = average([
    scorePresence(compressedConcepts.length, 3),
    scorePresence(conceptualUnderstanding.length, 2),
  ]);

  const theoryFormation = average([
    hasText(theoryValidation?.dominantTheory) ? 1 : 0,
    scorePresence(conceptualUnderstanding.length, 2),
    scorePresence(theoryValidation?.competingTheoriesConsidered?.length ?? 0, 2),
  ]);

  const cognitiveIntegration = average([
    scorePresence(theoryValidation?.supportingMechanisms?.length ?? 0, 3),
    scorePresence(
      theoryValidation?.supportingOrganizationalBeliefs?.length ?? 0,
      1,
    ),
    scorePresence(mechanisms.length, 3),
    scorePresence(organizationalBeliefs.length, 2),
    hasText(input.executiveText) ? 1 : 0,
  ]);

  const executiveUnderstanding = average([
    hasText(input.executiveText) ? 1 : 0,
    hasText(theoryValidation?.executiveRecommendation) ? 1 : 0,
    scorePresence(capabilities.length, 2),
  ]);

  const epistemicIntelligence = average([
    hasText(theoryValidation?.calibratedConfidenceExplanation) ? 1 : 0,
    scorePresence(theoryValidation?.competingTheoriesConsidered?.length ?? 0, 1),
    scorePresence(
      theoryValidation?.contradictoryOrWeakeningEvidence?.length ?? 0,
      1,
    ),
    scorePresence(
      theoryValidation?.additionalEvidenceThatWouldIncreaseConfidence?.length ??
        0,
      2,
    ),
    scorePresence(theoryValidation?.evidenceThatWouldFalsifyTheory?.length ?? 0, 2),
  ]);

  const emergence = average([
    scorePresence(conceptualUnderstanding.length, 2),
    hasText(theoryValidation?.dominantTheory) ? 1 : 0,
    scorePresence(theoryValidation?.competingTheoriesConsidered?.length ?? 0, 2),
  ]);

  const rawOverall = average([
    perception,
    patternFormation,
    mechanisticReasoning,
    organizationalMemory,
    conceptFormation,
    theoryFormation,
    cognitiveIntegration,
    executiveUnderstanding,
    epistemicIntelligence,
    emergence,
  ]);

  const partialScore = {
    perception: roundScore(perception),
    patternFormation: roundScore(patternFormation),
    mechanisticReasoning: roundScore(mechanisticReasoning),
    organizationalMemory: roundScore(organizationalMemory),
    conceptFormation: roundScore(conceptFormation),
    theoryFormation: roundScore(theoryFormation),
    cognitiveIntegration: roundScore(cognitiveIntegration),
    executiveUnderstanding: roundScore(executiveUnderstanding),
    epistemicIntelligence: roundScore(epistemicIntelligence),
    emergence: roundScore(emergence),
    overall: roundScore(rawOverall),
    maturityLevel: 1,
  };

  return {
    ...partialScore,
    maturityLevel: computeMaturityLevel(partialScore),
  };
}