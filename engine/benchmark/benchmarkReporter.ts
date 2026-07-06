import type { BenchmarkReport, BenchmarkScore } from "./benchmarkTypes";

export function createBenchmarkReport(
  scores: BenchmarkScore[],
): BenchmarkReport {
  const passed = scores.filter((score) => score.passed).length;

  const overallScore =
    scores.length === 0
      ? 0
      : Math.round(
          scores.reduce((sum, score) => sum + score.score, 0) / scores.length,
        );

  return {
    generatedAt: new Date().toISOString(),
    totalBenchmarks: scores.length,
    passedBenchmarks: passed,
    failedBenchmarks: scores.length - passed,
    overallScore,
    scores,
  };
}

function printDiagnosis(score: BenchmarkScore): void {
  console.log("   Diagnosis:");

  if (score.perceptionScore >= 80) {
    console.log("      ✓ Evidence was ingested successfully.");
  }

  if (score.patternCoherenceScore >= 60) {
    console.log(
      "      ✓ Patterns, mechanisms, and concepts are converging into coherent understanding.",
    );
  } else if (score.patternCoherenceScore >= 40) {
    console.log(
      "      ~ Discovery is forming patterns, but coherence across mechanisms and theory is still uneven.",
    );
  }

  if (score.theoryValidationScore >= 70) {
    console.log("      ✓ Discovery can defend the selected organizational theory.");
  }

  if (score.confidenceCalibrationScore >= 70) {
    console.log("      ✓ Discovery is beginning to explain confidence and uncertainty.");
  }

  if (score.evidenceAttributionScore >= 70) {
    console.log("      ✓ Executive conclusions are traceable to supporting evidence.");
  }

  if (score.mechanismInferenceScore < 50) {
    console.log(
      "      ✗ Latent organizational mechanisms were not inferred strongly enough.",
    );
  }

  if (score.theoryValidationScore < 50) {
    console.log(
      "      ✗ Discovery selected a theory but did not adequately validate why it deserves to survive.",
    );
  }

  if (score.confidenceCalibrationScore < 50) {
    console.log(
      "      ✗ Discovery did not sufficiently calibrate confidence or explain uncertainty.",
    );
  }

  if (score.evidenceAttributionScore < 50) {
    console.log(
      "      ✗ Discovery did not clearly trace conclusions back to evidence.",
    );
  }

  if (score.executiveUnderstandingScore < 50) {
    console.log(
      "      ✗ Executive understanding did not clearly explain why this is happening.",
    );
  }
}

function printRecommendation(score: BenchmarkScore): void {
  if (score.mechanismInferenceScore < 50) {
    console.log("   Recommendation: improve mechanism inference.");
    return;
  }

  if (score.patternCoherenceScore < 50) {
    console.log(
      "   Recommendation: improve pattern coherence across mechanisms, concepts, and executive theory.",
    );
    return;
  }

  if (score.theoryValidationScore < 60) {
    console.log(
      "   Recommendation: improve theory validation inside buildExecutiveAssessment().",
    );
    return;
  }

  if (score.confidenceCalibrationScore < 60) {
    console.log(
      "   Recommendation: improve confidence calibration and uncertainty explanation.",
    );
    return;
  }

  if (score.evidenceAttributionScore < 60) {
    console.log(
      "   Recommendation: improve evidence attribution from executive conclusions back to mechanisms and concepts.",
    );
    return;
  }

  if (score.executiveUnderstandingScore < 50) {
    console.log("   Recommendation: improve buildExecutiveAssessment().");
    return;
  }

  console.log("   Recommendation: no immediate cognitive bottleneck detected.");
}

export function printBenchmarkReport(report: BenchmarkReport): void {
  console.log("");
  console.log("======================================");
  console.log("DISCOVERY COGNITIVE EVALUATION");
  console.log("======================================");
  console.log("");

  console.log(`Benchmarks : ${report.totalBenchmarks}`);
  console.log(`Passed     : ${report.passedBenchmarks}`);
  console.log(`Failed     : ${report.failedBenchmarks}`);
  console.log(`Overall Understanding : ${report.overallScore}%`);

  console.log("");
  console.log("--------------------------------------");
  console.log("ORGANIZATIONAL UNDERSTANDING SCORECARD");
  console.log("--------------------------------------");

  for (const score of report.scores) {
    console.log("");
    console.log(`${score.passed ? "✅" : "❌"} ${score.title}`);
    console.log(`   Overall Understanding  : ${score.score}%`);
    console.log(`   Perception             : ${score.perceptionScore}%`);
    console.log(`   Pattern Coherence      : ${score.patternCoherenceScore}%`);
    console.log(`   Mechanism Inference    : ${score.mechanismInferenceScore}%`);
    console.log(`   Capability Inference   : ${score.capabilityScore}%`);
    console.log(`   Semantic Compression   : ${score.compressionScore}%`);
    console.log(`   Executive Understanding: ${score.executiveUnderstandingScore}%`);
    console.log(`   Theory Validation      : ${score.theoryValidationScore}%`);
    console.log(`   Confidence Calibration : ${score.confidenceCalibrationScore}%`);
    console.log(`   Evidence Attribution   : ${score.evidenceAttributionScore}%`);

    if (score.notes.length > 0) {
      console.log("");
      console.log("   Notes:");

      for (const note of score.notes) {
        console.log(`      • ${note}`);
      }
    }

    console.log("");
    printDiagnosis(score);
    printRecommendation(score);
  }

  console.log("");
}