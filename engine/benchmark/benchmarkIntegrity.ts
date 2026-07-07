import type { LongitudinalBenchmarkReport } from "./longitudinalBenchmarkRunner";

type IntegrityCheck = {
  label: string;
  passed: boolean;
  detail?: string;
};

export type BenchmarkIntegrityReport = {
  generatedAt: string;
  integrityScore: number;
  passedChecks: number;
  failedChecks: number;
  checks: IntegrityCheck[];
};

function check(label: string, passed: boolean, detail?: string): IntegrityCheck {
  return { label, passed, detail };
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function validateGrowthCalculations(
  report: LongitudinalBenchmarkReport,
): IntegrityCheck[] {
  const checks: IntegrityCheck[] = [];

  for (let index = 1; index < report.steps.length; index += 1) {
    const previous = report.steps[index - 1];
    const current = report.steps[index];

    const expectedUnderstandingGrowth =
      current.understandingScore - previous.understandingScore;

    checks.push(
      check(
        `Investigation ${current.investigationNumber} understanding growth`,
        current.understandingGrowth === expectedUnderstandingGrowth,
        `expected ${expectedUnderstandingGrowth}, got ${current.understandingGrowth}`,
      ),
    );

    if (
      isNumber(previous.memoryMaturityScore) &&
      isNumber(current.memoryMaturityScore)
    ) {
      const expectedMemoryGrowth =
        current.memoryMaturityScore - previous.memoryMaturityScore;

      checks.push(
        check(
          `Investigation ${current.investigationNumber} memory growth`,
          current.memoryGrowth === expectedMemoryGrowth,
          `expected ${expectedMemoryGrowth}, got ${current.memoryGrowth}`,
        ),
      );
    }
  }

  return checks;
}

function validateRuntimePersistence(
  report: LongitudinalBenchmarkReport,
): IntegrityCheck {
  const hasMultipleInvestigations = report.steps.length > 1;

  const hasPostInitialGrowthSignals = report.steps
    .slice(1)
    .some(
      (step) =>
        isNumber(step.understandingGrowth) ||
        isNumber(step.memoryGrowth) ||
        isNumber(step.organizationalLearningScore) ||
        isNumber(step.learningVelocity),
    );

  return check(
    "Runtime persistence",
    hasMultipleInvestigations && hasPostInitialGrowthSignals,
    hasPostInitialGrowthSignals
      ? "longitudinal signals detected after investigation 1"
      : "no longitudinal signals detected after investigation 1",
  );
}

function validateScorePresence(
  report: LongitudinalBenchmarkReport,
): IntegrityCheck[] {
  return [
    check(
      "Understanding scores present",
      report.steps.every((step) => isNumber(step.understandingScore)),
    ),
    check(
      "Cognitive fitness scores present",
      report.steps.every((step) => isNumber(step.cognitiveFitnessScore)),
    ),
    check(
      "Memory maturity eventually present",
      report.steps.some((step) => isNumber(step.memoryMaturityScore)),
    ),
    check(
      "Organizational learning eventually present",
      report.steps.some((step) => isNumber(step.organizationalLearningScore)),
    ),
    check(
      "Learning velocity eventually present",
      report.steps.some((step) => isNumber(step.learningVelocity)),
    ),
  ];
}

function validateLearningSignals(
  report: LongitudinalBenchmarkReport,
): IntegrityCheck[] {
  return [
    check(
      "Belief evolution detected",
      report.steps.some((step) => (step.beliefsStrengthened ?? 0) > 0),
    ),
    check(
      "Theory stabilization detected",
      report.steps.some((step) => (step.theoriesStabilized ?? 0) > 0),
    ),
    check(
      "Knowledge retention measured",
      report.steps.some((step) => isNumber(step.knowledgeRetention)),
    ),
    check(
      "Belief stability measured",
      report.steps.some((step) => isNumber(step.beliefStability)),
    ),
    check(
      "Theory stability measured",
      report.steps.some((step) => isNumber(step.theoryStability)),
    ),
  ];
}

function validateSummaryConsistency(
  report: LongitudinalBenchmarkReport,
): IntegrityCheck[] {
  const first = report.steps[0];
  const last = report.steps[report.steps.length - 1];

  if (!first || !last) {
    return [check("Summary consistency", false, "no longitudinal steps found")];
  }

  const expectedUnderstandingGrowth =
    last.understandingScore - first.understandingScore;

  const checks: IntegrityCheck[] = [
    check(
      "Total understanding growth",
      report.totalUnderstandingGrowth === expectedUnderstandingGrowth,
      `expected ${expectedUnderstandingGrowth}, got ${report.totalUnderstandingGrowth}`,
    ),
  ];

  if (
    isNumber(first.memoryMaturityScore) &&
    isNumber(last.memoryMaturityScore)
  ) {
    const expectedMemoryGrowth =
      last.memoryMaturityScore - first.memoryMaturityScore;

    checks.push(
      check(
        "Total memory growth",
        report.totalMemoryGrowth === expectedMemoryGrowth,
        `expected ${expectedMemoryGrowth}, got ${report.totalMemoryGrowth}`,
      ),
    );
  }

  return checks;
}

export function createBenchmarkIntegrityReport(
  report: LongitudinalBenchmarkReport,
): BenchmarkIntegrityReport {
  const checks = [
    ...validateScorePresence(report),
    ...validateGrowthCalculations(report),
    ...validateLearningSignals(report),
    ...validateSummaryConsistency(report),
    validateRuntimePersistence(report),
  ];

  const passedChecks = checks.filter((item) => item.passed).length;
  const failedChecks = checks.length - passedChecks;

  const integrityScore =
    checks.length === 0 ? 0 : Math.round((passedChecks / checks.length) * 100);

  return {
    generatedAt: new Date().toISOString(),
    integrityScore,
    passedChecks,
    failedChecks,
    checks,
  };
}

export function printBenchmarkIntegrityReport(
  report: BenchmarkIntegrityReport,
): void {
  console.log("");
  console.log("=========================================");
  console.log("BENCHMARK INTEGRITY");
  console.log("=========================================");
  console.log("");

  for (const item of report.checks) {
    console.log(`${item.label.padEnd(36, ".")} ${item.passed ? "✓" : "○"}`);

    if (!item.passed && item.detail) {
      console.log(`   ${item.detail}`);
    }
  }

  console.log("");
  console.log(`Passed Checks ................. ${report.passedChecks}`);
  console.log(`Failed Checks ................. ${report.failedChecks}`);
  console.log(`Integrity Score ............... ${report.integrityScore}%`);
}