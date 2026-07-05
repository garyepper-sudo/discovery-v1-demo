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
  }>;
  executiveAssessment?: {
    summary?: string;
    executiveNarrative?: string;
    mechanismCenteredNarrative?: string;
    primaryMechanismSummaries?: string[];
  };
};

function evidenceToContext(
  benchmark: ReturnType<typeof loadBenchmarkCases>[number],
): string {
  return benchmark.evidence
    .map((item) => `${item.title}: ${item.content}`)
    .join("\n\n");
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

    const semanticConcepts = memory.semanticConcepts as
      | Array<{ title?: string; label?: string; summary?: string }>
      | undefined;

    const compressedConcepts =
      semanticConcepts?.map(
        (concept) => concept.title || concept.label || concept.summary || "",
      ) ?? [];

    const executiveText = [
      memory.executiveAssessment?.summary,
      memory.executiveAssessment?.executiveNarrative,
      memory.executiveAssessment?.mechanismCenteredNarrative,
      ...(memory.executiveAssessment?.primaryMechanismSummaries ?? []),
    ]
      .filter(Boolean)
      .join(" ");

    return scoreBenchmark(benchmark, {
      mechanisms,
      capabilities,
      compressedConcepts,
      executiveText,
    });
  });

  const report = createBenchmarkReport(scores);

  printBenchmarkReport(report);
}

main();