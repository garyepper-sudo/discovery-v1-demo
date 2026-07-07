import { resetOrganizationRuntimeState } from "../v3/runtime";
import { loadBenchmarkCases } from "./benchmarkRunner";
import {
  createBenchmarkReport,
  printBenchmarkReport,
} from "./benchmarkReporter";
import { runBenchmarkInvestigation } from "./runBenchmarkInvestigation";
import { runLongitudinalBenchmark } from "./longitudinalBenchmarkRunner";
import {
  createBenchmarkIntegrityReport,
  printBenchmarkIntegrityReport,
} from "./benchmarkIntegrity";

function runStandardBenchmarks(): void {
  const benchmarks = loadBenchmarkCases();

  const scores = benchmarks.map((benchmark) => {
    const organizationId = `benchmark-${benchmark.id}`;

    resetOrganizationRuntimeState(organizationId);

    const investigation = runBenchmarkInvestigation({
      benchmark,
      organizationId,
    });

    console.log("Memory Maturity Object:");
    console.dir(investigation.organizationalMemoryMaturity, { depth: null });

    console.log("Organizational Learning Profile Object:");
    console.dir(investigation.organizationalLearningProfile, { depth: null });

    return {
      ...investigation.benchmarkScore,
      cognitiveFitness: investigation.cognitiveFitness,
    };
  });

  const report = createBenchmarkReport(scores);

  printBenchmarkReport(report);
}

async function runAllBenchmarks(): Promise<void> {
  console.log("");
  console.log("=========================================");
  console.log("DISCOVERY BENCHMARK SUITE");
  console.log("=========================================");
  console.log("");

  runStandardBenchmarks();

  console.log("");
  console.log("");

  const longitudinalReport =
  await runLongitudinalBenchmark();

const integrityReport =
  createBenchmarkIntegrityReport(
    longitudinalReport,
  );

printBenchmarkIntegrityReport(
  integrityReport,
);

  console.log("");
  console.log("=========================================");
  console.log("BENCHMARK SUITE COMPLETE");
  console.log("=========================================");
}

void runAllBenchmarks();