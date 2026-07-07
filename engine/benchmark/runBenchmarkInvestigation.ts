import { runDiscoveryV3 } from "../v3";
import {
  evolveOrganizationRuntime,
  loadOrganizationRuntimeState,
} from "../v3/runtime";
import type { DiscoveryBenchmarkCase } from "./benchmarkTypes";
import { scoreBenchmark } from "./benchmarkScorer";
import { scoreUnderstandingFitness } from "./understandingFitnessScorer";

type MemoryMaturitySnapshot = {
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

type OrganizationalLearningProfileSnapshot = {
  learningVelocityScore?: number;
  memoryGrowth?: number;
  understandingGrowth?: number;
  beliefStability?: number;
  theoryStability?: number;
  knowledgeRetention?: number;
  mechanismReuse?: number;
  conceptReuse?: number;
  meaningfulLearningEventCount?: number;
  investigationsObserved?: number;
  learningVelocity?: string;
};

export type BenchmarkRuntimeMemory = {
  observations?: unknown[];

  mechanismNetwork?: {
    mechanisms?: Array<{ title?: string; executiveName?: string }>;
  };

  organizationalCapabilitiesState?: {
    capabilities?: Array<{ label?: string; name?: string }>;
  };

  semanticConcepts?: Array<{
    title?: string;
    label?: string;
    summary?: string;
    statement?: string;
  }>;

  conceptualUnderstanding?: Array<{
    title?: string;
    label?: string;
    summary?: string;
    statement?: string;
  }>;

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

  memoryMaturity?: MemoryMaturitySnapshot | null;

  organizationalLearningProfile?: OrganizationalLearningProfileSnapshot | null;

  organizationalMemory?: {
    maturity?: MemoryMaturitySnapshot | null;
    organizationalLearningProfile?: OrganizationalLearningProfileSnapshot | null;
  } | null;

  executiveAssessment?: {
    summary?: string;
    executiveNarrative?: string;
    mechanismCenteredNarrative?: string;
    primaryMechanismSummaries?: string[];
    theoryValidation?: {
      dominantTheory?: string | null;
      whyDiscoveryBelievesIt?: string;
      supportingMechanisms?: Array<{
        label?: string;
        rationale?: string;
      }>;
      supportingOrganizationalBeliefs?: Array<{
        label?: string;
        rationale?: string;
      }>;
      competingTheoriesConsidered?: Array<{
        theory?: string;
        reasonItWasConsidered?: string;
        reasonItLost?: string;
      }>;
      contradictoryOrWeakeningEvidence?: Array<{
        label?: string;
        rationale?: string;
      }>;
      calibratedConfidenceExplanation?: string;
      additionalEvidenceThatWouldIncreaseConfidence?: string[];
      evidenceThatWouldFalsifyTheory?: string[];
      executiveRecommendation?: string;
    };
  };
};

export type BenchmarkInvestigationResult = {
  result: ReturnType<typeof runDiscoveryV3>;
  runtime: ReturnType<typeof loadOrganizationRuntimeState>;
  evolvedRuntime: ReturnType<typeof evolveOrganizationRuntime>;
  memory: BenchmarkRuntimeMemory;
  benchmarkScore: ReturnType<typeof scoreBenchmark>;
  cognitiveFitness: ReturnType<typeof scoreUnderstandingFitness>;
  mechanisms: string[];
  capabilities: string[];
  compressedConcepts: string[];
  conceptualUnderstanding: string[];
  executiveText: string;
  organizationalMemoryMaturity: MemoryMaturitySnapshot | null;
  organizationalLearningProfile: OrganizationalLearningProfileSnapshot | null;
};

function evidenceToContext(benchmark: DiscoveryBenchmarkCase): string {
  return benchmark.evidence
    .map((item) => `${item.title}: ${item.content}`)
    .join("\n\n");
}

function conceptText(concept: {
  title?: string;
  label?: string;
  statement?: string;
  summary?: string;
}): string {
  return [concept.title, concept.label, concept.statement, concept.summary]
    .filter(Boolean)
    .join(" ");
}

function theoryValidationText(
  theoryValidation:
    | NonNullable<BenchmarkRuntimeMemory["executiveAssessment"]>["theoryValidation"]
    | undefined,
): string {
  if (!theoryValidation) return "";

  return [
    theoryValidation.dominantTheory ?? undefined,
    theoryValidation.whyDiscoveryBelievesIt,
    ...(theoryValidation.supportingMechanisms?.flatMap((item) => [
      item.label,
      item.rationale,
    ]) ?? []),
    ...(theoryValidation.supportingOrganizationalBeliefs?.flatMap((item) => [
      item.label,
      item.rationale,
    ]) ?? []),
    ...(theoryValidation.competingTheoriesConsidered?.flatMap((item) => [
      item.theory,
      item.reasonItWasConsidered,
      item.reasonItLost,
    ]) ?? []),
    ...(theoryValidation.contradictoryOrWeakeningEvidence?.flatMap((item) => [
      item.label,
      item.rationale,
    ]) ?? []),
    theoryValidation.calibratedConfidenceExplanation,
    ...(theoryValidation.additionalEvidenceThatWouldIncreaseConfidence ?? []),
    ...(theoryValidation.evidenceThatWouldFalsifyTheory ?? []),
    theoryValidation.executiveRecommendation,
  ]
    .filter(Boolean)
    .join(" ");
}

export function runBenchmarkInvestigation(params: {
  benchmark: DiscoveryBenchmarkCase;
  organizationId: string;
}): BenchmarkInvestigationResult {
  const { benchmark, organizationId } = params;

  const runtime = loadOrganizationRuntimeState(organizationId);

  const input = {
    company: benchmark.company,
    website: "",
    industry: benchmark.industry,
    question: benchmark.question,
    context: `${benchmark.context ?? ""}\n\n${evidenceToContext(benchmark)}`,
    priorUnderstandingState: runtime.memory.understandingState,
  };

  const result = runDiscoveryV3(input);

  const evolvedRuntime = evolveOrganizationRuntime({
    runtime,
    result,
    input,
  });

  const memory = evolvedRuntime.memory as typeof evolvedRuntime.memory &
    BenchmarkRuntimeMemory;

  const mechanisms =
    memory.mechanismNetwork?.mechanisms?.map(
      (mechanism) => mechanism.executiveName || mechanism.title || "",
    ) ?? [];

  const capabilities =
    memory.organizationalCapabilitiesState?.capabilities?.map(
      (capability) => capability.label || capability.name || "",
    ) ?? [];

  const compressedConcepts = memory.semanticConcepts?.map(conceptText) ?? [];

  const conceptualUnderstanding =
    memory.conceptualUnderstanding?.map(conceptText) ?? [];

  const executiveText = [
    memory.executiveAssessment?.summary,
    memory.executiveAssessment?.executiveNarrative,
    memory.executiveAssessment?.mechanismCenteredNarrative,
    ...(memory.executiveAssessment?.primaryMechanismSummaries ?? []),
    theoryValidationText(memory.executiveAssessment?.theoryValidation),
  ]
    .filter(Boolean)
    .join(" ");

  const organizationalMemoryMaturity =
    memory.organizationalMemory?.maturity ?? memory.memoryMaturity ?? null;

  const organizationalLearningProfile =
    memory.organizationalMemory?.organizationalLearningProfile ??
    memory.organizationalLearningProfile ??
    null;

  const benchmarkScore = scoreBenchmark(benchmark, {
    mechanisms,
    capabilities,
    compressedConcepts,
    conceptualUnderstanding,
    executiveText,
    theoryValidation: memory.executiveAssessment?.theoryValidation,
    organizationalLearningProfile,
  });

  const cognitiveFitness = scoreUnderstandingFitness({
    observations: memory.observations,
    mechanisms,
    capabilities,
    compressedConcepts,
    conceptualUnderstanding,
    organizationalBeliefs: memory.organizationalBeliefs,
    organizationalBeliefRevisions: memory.organizationalBeliefRevisions,
    organizationalMemoryMaturity,
    executiveText,
    theoryValidation: memory.executiveAssessment?.theoryValidation,
  });

  return {
    result,
    runtime,
    evolvedRuntime,
    memory,
    benchmarkScore,
    cognitiveFitness,
    mechanisms,
    capabilities,
    compressedConcepts,
    conceptualUnderstanding,
    executiveText,
    organizationalMemoryMaturity,
    organizationalLearningProfile,
  };
}