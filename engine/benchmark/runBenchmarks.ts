import { runDiscoveryV3 } from "../v3";
import {
  evolveOrganizationRuntime,
  loadOrganizationRuntimeState,
  resetOrganizationRuntimeState,
} from "../v3/runtime";
import { loadBenchmarkCases } from "./benchmarkRunner";
import { scoreBenchmark } from "./benchmarkScorer";
import {
  createBenchmarkReport,
  printBenchmarkReport,
} from "./benchmarkReporter";

type BenchmarkRuntimeMemory = {
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

function evidenceToContext(
  benchmark: ReturnType<typeof loadBenchmarkCases>[number],
): string {
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
  theoryValidation: NonNullable<
    BenchmarkRuntimeMemory["executiveAssessment"]
  >["theoryValidation"],
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

function main(): void {
  const benchmarks = loadBenchmarkCases();

  const scores = benchmarks.map((benchmark) => {
    const organizationId = `benchmark-${benchmark.id}`;

    resetOrganizationRuntimeState(organizationId);

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

    const compressedConcepts =
      memory.semanticConcepts?.map(conceptText) ?? [];

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

    return scoreBenchmark(benchmark, {
     mechanisms,
     capabilities,
     compressedConcepts,
     conceptualUnderstanding,
     executiveText,
     theoryValidation: memory.executiveAssessment?.theoryValidation,
    });
  });

  const report = createBenchmarkReport(scores);

  printBenchmarkReport(report);
}

main();