import { resetOrganizationRuntimeState } from "../v3/runtime";
import { loadBenchmarkCases } from "./benchmarkRunner";
import { runBenchmarkInvestigation } from "./runBenchmarkInvestigation";

const LONGITUDINAL_BENCHMARK_ORGANIZATION_ID =
  "longitudinal-learning-benchmark";

export type LongitudinalStep = {
  investigationNumber: number;
  benchmarkId: string;
  title: string;

  understandingScore: number;
  cognitiveFitnessScore: number;
  organizationalLearningScore?: number;
  memoryMaturityScore?: number;

  learningVelocity?: number;
  understandingGrowth?: number;
  memoryGrowth?: number;

  beliefsStrengthened?: number;
  theoriesStabilized?: number;
  knowledgeRetention?: number;
  beliefStability?: number;
  theoryStability?: number;
};

export type LongitudinalBenchmarkReport = {
  generatedAt: string;
  totalInvestigations: number;
  initialUnderstandingScore?: number;
  finalUnderstandingScore?: number;
  totalUnderstandingGrowth?: number;
  initialMemoryMaturity?: number;
  finalMemoryMaturity?: number;
  totalMemoryGrowth?: number;
  plateauDetected: boolean;
  steps: LongitudinalStep[];
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function numberValue(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.round(value)
    : undefined;
}

function getCognitiveFitnessScore(cognitiveFitness: unknown): number {
  const record = asRecord(cognitiveFitness);

  return (
    numberValue(record.score) ??
    numberValue(record.overall) ??
    numberValue(record.overallScore) ??
    0
  );
}

function getOrganizationalLearningScore(profile: unknown): number | undefined {
  const record = asRecord(profile);

  return (
    numberValue(record.score) ??
    numberValue(record.learningScore) ??
    numberValue(record.organizationalLearningScore) ??
    numberValue(record.learningVelocityScore)
  );
}

function getLearningVelocity(profile: unknown): number | undefined {
  const record = asRecord(profile);

  return (
    numberValue(record.learningVelocityScore) ??
    numberValue(record.learningVelocity)
  );
}

function getMemoryMaturityScore(memoryMaturity: unknown): number | undefined {
  return numberValue(asRecord(memoryMaturity).score);
}

function countBeliefsStrengthened(memory: unknown): number {
  const record = asRecord(memory);
  const profile = asRecord(record.organizationalLearningProfile);

  const directCount =
    numberValue(profile.strengthenedBeliefCount) ??
    numberValue(profile.newBeliefCount);

  if (directCount !== undefined) return directCount;

  const revisions = record.organizationalBeliefRevisions;

  if (!Array.isArray(revisions)) return 0;

  return revisions.filter((revision) => {
    const revisionRecord = asRecord(revision);
    return revisionRecord.trend === "strengthening";
  }).length;
}

function countTheoriesStabilized(profile: unknown): number {
  const record = asRecord(profile);

  return (
    numberValue(record.stableTheoryCount) ??
    numberValue(record.strengthenedTheoryCount) ??
    0
  );
}

function hasLearningPlateau(steps: LongitudinalStep[]): boolean {
  if (steps.length < 3) return false;

  const recentGrowth = steps
    .slice(-3)
    .map((step) => Math.abs(step.understandingGrowth ?? 0));

  return recentGrowth.every((growth) => growth <= 1);
}

function printValue(value: number | string | undefined, suffix = ""): string {
  if (value === undefined) return "N/A";
  if (typeof value === "string") return value;
  return `${value}${suffix}`;
}

function printGrowth(value: number | undefined): string {
  if (value === undefined) return "N/A";
  return `${value >= 0 ? "+" : ""}${value}`;
}

export async function runLongitudinalBenchmark(): Promise<LongitudinalBenchmarkReport> {
  console.log("=========================================");
  console.log("LONGITUDINAL LEARNING BENCHMARK");
  console.log("=========================================");
  console.log("");

  resetOrganizationRuntimeState(LONGITUDINAL_BENCHMARK_ORGANIZATION_ID);

  const benchmarkCases = loadBenchmarkCases().slice(0, 5);
  const steps: LongitudinalStep[] = [];

  let previousUnderstandingScore: number | undefined;
  let previousMemoryMaturityScore: number | undefined;

  for (let index = 0; index < benchmarkCases.length; index += 1) {
    const benchmark = benchmarkCases[index];

    const investigation = runBenchmarkInvestigation({
      benchmark,
      organizationId: LONGITUDINAL_BENCHMARK_ORGANIZATION_ID,
    });

    const organizationalLearningProfile =
      investigation.organizationalLearningProfile;

    const organizationalMemoryMaturity =
      investigation.organizationalMemoryMaturity;

    const understandingScore = Math.round(investigation.benchmarkScore.score);
    const cognitiveFitnessScore = getCognitiveFitnessScore(
      investigation.cognitiveFitness,
    );
    const organizationalLearningScore = getOrganizationalLearningScore(
      organizationalLearningProfile,
    );
    const memoryMaturityScore = getMemoryMaturityScore(
      organizationalMemoryMaturity,
    );

    const understandingGrowth =
      previousUnderstandingScore === undefined
        ? undefined
        : understandingScore - previousUnderstandingScore;

    const memoryGrowth =
      previousMemoryMaturityScore === undefined ||
      memoryMaturityScore === undefined
        ? undefined
        : memoryMaturityScore - previousMemoryMaturityScore;

    const profileRecord = asRecord(organizationalLearningProfile);

    const step: LongitudinalStep = {
      investigationNumber: index + 1,
      benchmarkId: benchmark.id,
      title: benchmark.title ?? benchmark.id,

      understandingScore,
      cognitiveFitnessScore,
      organizationalLearningScore,
      memoryMaturityScore,

      learningVelocity: getLearningVelocity(organizationalLearningProfile),
      understandingGrowth,
      memoryGrowth,

      beliefsStrengthened: countBeliefsStrengthened(investigation.memory),
      theoriesStabilized: countTheoriesStabilized(
        organizationalLearningProfile,
      ),

      knowledgeRetention: numberValue(profileRecord.knowledgeRetention),
      beliefStability: numberValue(profileRecord.beliefStability),
      theoryStability: numberValue(profileRecord.theoryStability),
    };

    steps.push(step);

    printLongitudinalStep(step);

    previousUnderstandingScore = understandingScore;

    if (memoryMaturityScore !== undefined) {
      previousMemoryMaturityScore = memoryMaturityScore;
    }
  }

  const first = steps[0];
  const last = steps[steps.length - 1];

  const report: LongitudinalBenchmarkReport = {
    generatedAt: new Date().toISOString(),
    totalInvestigations: steps.length,

    initialUnderstandingScore: first?.understandingScore,
    finalUnderstandingScore: last?.understandingScore,
    totalUnderstandingGrowth:
      first && last ? last.understandingScore - first.understandingScore : undefined,

    initialMemoryMaturity: first?.memoryMaturityScore,
    finalMemoryMaturity: last?.memoryMaturityScore,
    totalMemoryGrowth:
      first?.memoryMaturityScore !== undefined &&
      last?.memoryMaturityScore !== undefined
        ? last.memoryMaturityScore - first.memoryMaturityScore
        : undefined,

    plateauDetected: hasLearningPlateau(steps),
    steps,
  };

  printLongitudinalSummary(report);

  return report;
}

function printLongitudinalStep(step: LongitudinalStep): void {
  console.log(`Investigation ${step.investigationNumber}`);
  console.log("");
  console.log(
    `Understanding ............ ${printValue(step.understandingScore, "%")}`,
  );
  console.log(
    `Cognitive Fitness ........ ${printValue(step.cognitiveFitnessScore, "%")}`,
  );
  console.log(
    `Organizational Learning .. ${
      step.investigationNumber === 1
        ? "Initializing"
        : printValue(step.organizationalLearningScore, "%")
    }`,
  );
  console.log(
    `Memory Maturity .......... ${printValue(step.memoryMaturityScore)}`,
  );

  if (step.investigationNumber > 1) {
    console.log("");
    console.log(`Understanding Growth ..... ${printGrowth(step.understandingGrowth)}`);
    console.log(`Memory Growth ............ ${printGrowth(step.memoryGrowth)}`);
    console.log("");
    console.log(`Learning Velocity ........ ${printValue(step.learningVelocity)}`);
    console.log(`Beliefs Strengthened ..... ${printValue(step.beliefsStrengthened)}`);
    console.log(`Theories Stabilized ...... ${printValue(step.theoriesStabilized)}`);
    console.log(
      `Knowledge Retention ...... ${printValue(step.knowledgeRetention, "%")}`,
    );
    console.log(`Belief Stability ......... ${printValue(step.beliefStability, "%")}`);
    console.log(`Theory Stability ......... ${printValue(step.theoryStability, "%")}`);
  }

  console.log("");
  console.log("-----------------------------------------");
  console.log("");
}

function printLongitudinalSummary(report: LongitudinalBenchmarkReport): void {
  console.log("LONGITUDINAL SUMMARY");
  console.log("");
  console.log(
    `Understanding Growth ..... ${printGrowth(report.totalUnderstandingGrowth)}`,
  );
  console.log(`Memory Growth ............ ${printGrowth(report.totalMemoryGrowth)}`);
  console.log(
    `Learning Plateau ......... ${
      report.plateauDetected ? "Detected" : "Not Yet Detected"
    }`,
  );
  console.log("");
  console.log("Validation:");
  console.log(
    report.totalUnderstandingGrowth !== undefined &&
      report.totalUnderstandingGrowth > 0
      ? "   ✓ Organizational understanding improved."
      : "   ○ Organizational understanding has not improved yet.",
  );
  console.log(
    report.totalMemoryGrowth !== undefined && report.totalMemoryGrowth > 0
      ? "   ✓ Organizational memory compounded."
      : "   ○ Organizational memory growth has not been demonstrated yet.",
  );
  console.log(
    report.steps.some((step) => (step.beliefsStrengthened ?? 0) > 0)
      ? "   ✓ Beliefs evolved across investigations."
      : "   ○ Belief evolution has not been demonstrated yet.",
  );
  console.log(
    report.steps.some((step) => (step.theoriesStabilized ?? 0) > 0)
      ? "   ✓ Theories stabilized over time."
      : "   ○ Theory stabilization has not been demonstrated yet.",
  );
  console.log(
    report.steps.some((step) => (step.learningVelocity ?? 0) > 0)
      ? "   ✓ Learning velocity became measurable."
      : "   ○ Learning velocity is not measurable yet.",
  );
}