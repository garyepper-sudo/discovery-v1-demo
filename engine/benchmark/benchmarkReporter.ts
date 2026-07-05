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

  if (score.patternScore >= 40) {
    console.log("      ✓ Discovery compressed some recurring organizational concepts.");
  }

  if (score.mechanismInferenceScore < 50) {
    console.log("      ✗ Latent organizational mechanisms were not inferred strongly enough.");
  }

  if (score.executiveUnderstandingScore < 50) {
    console.log("      ✗ Executive understanding did not clearly explain why this is happening.");
  }
}

function printRecommendation(score: BenchmarkScore): void {
  if (score.mechanismInferenceScore < 50) {
    console.log("   Recommendation: improve inferOrganizationalMechanisms().");
    return;
  }

  if (score.executiveUnderstandingScore < 50) {
    console.log("   Recommendation: improve buildExecutiveAssessment().");
    return;
  }

  if (score.patternScore < 50) {
    console.log("   Recommendation: improve semantic compression and pattern formation.");
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
  console.log("COGNITIVE PIPELINE");
  console.log("--------------------------------------");

  for (const score of report.scores) {
    console.log("");
    console.log(`${score.passed ? "✅" : "❌"} ${score.title}`);
    console.log(`   Overall Understanding : ${score.score}%`);
    console.log(`   Perception            : ${score.perceptionScore}%`);
    console.log(`   Pattern Formation     : ${score.patternScore}%`);
    console.log(`   Mechanism Inference   : ${score.mechanismInferenceScore}%`);
    console.log(`   Capability Inference  : ${score.capabilityScore}%`);
    console.log(`   Executive Understanding: ${score.executiveUnderstandingScore}%`);
    console.log(`   Semantic Compression  : ${score.compressionScore}%`);

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