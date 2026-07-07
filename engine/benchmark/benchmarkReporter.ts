import type {
  BenchmarkReport,
  BenchmarkScore,
  CognitiveFitnessScore,
  OrganizationalLearningScore,
} from "./benchmarkTypes";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function aggregateCognitiveFitness(
  scores: BenchmarkScore[],
): CognitiveFitnessScore | undefined {
  const fitnessScores = scores
    .map((score) => score.cognitiveFitness)
    .filter((score): score is CognitiveFitnessScore => Boolean(score));

  if (fitnessScores.length === 0) return undefined;

  return {
    perception: average(fitnessScores.map((score) => score.perception)),
    patternFormation: average(fitnessScores.map((score) => score.patternFormation)),
    mechanisticReasoning: average(
      fitnessScores.map((score) => score.mechanisticReasoning),
    ),
    organizationalMemory: average(
      fitnessScores.map((score) => score.organizationalMemory),
    ),
    conceptFormation: average(fitnessScores.map((score) => score.conceptFormation)),
    theoryFormation: average(fitnessScores.map((score) => score.theoryFormation)),
    cognitiveIntegration: average(
      fitnessScores.map((score) => score.cognitiveIntegration),
    ),
    executiveUnderstanding: average(
      fitnessScores.map((score) => score.executiveUnderstanding),
    ),
    epistemicIntelligence: average(
      fitnessScores.map((score) => score.epistemicIntelligence),
    ),
    emergence: average(fitnessScores.map((score) => score.emergence)),
    overall: average(fitnessScores.map((score) => score.overall)),
    maturityLevel: average(fitnessScores.map((score) => score.maturityLevel)),
  };
}

function aggregateOrganizationalLearning(
  scores: BenchmarkScore[],
): OrganizationalLearningScore | undefined {
  const learningScores = scores
    .map((score) => score.organizationalLearning)
    .filter((score): score is OrganizationalLearningScore => Boolean(score));

  if (learningScores.length === 0) return undefined;

  return {
    organizationalLearningScore: average(
      learningScores.map((score) => score.organizationalLearningScore),
    ),
    learningVelocity: average(
      learningScores.map((score) => score.learningVelocity),
    ),
    memoryGrowth: average(learningScores.map((score) => score.memoryGrowth)),
    understandingGrowth: average(
      learningScores.map((score) => score.understandingGrowth),
    ),
    beliefStability: average(
      learningScores.map((score) => score.beliefStability),
    ),
    theoryStability: average(
      learningScores.map((score) => score.theoryStability),
    ),
    knowledgeRetention: average(
      learningScores.map((score) => score.knowledgeRetention),
    ),
    mechanismReuse: average(learningScores.map((score) => score.mechanismReuse)),
    conceptReuse: average(learningScores.map((score) => score.conceptReuse)),
    adaptiveLearning: average(
      learningScores.map((score) => score.adaptiveLearning),
    ),
    passed: learningScores.every((score) => score.passed),
    diagnosis: Array.from(
      new Set(learningScores.flatMap((score) => score.diagnosis)),
    ),
  };
}

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

  const cognitiveFitness = aggregateCognitiveFitness(scores);
  const organizationalLearning = aggregateOrganizationalLearning(scores);

  return {
    generatedAt: new Date().toISOString(),
    totalBenchmarks: scores.length,
    passedBenchmarks: passed,
    failedBenchmarks: scores.length - passed,
    overallScore,
    cognitiveFitnessOverall: cognitiveFitness?.overall,
    cognitiveFitness,
    organizationalLearningOverall:
      organizationalLearning?.organizationalLearningScore,
    organizationalLearning,
    scores,
  };
}

function printCognitiveFitness(score: CognitiveFitnessScore): void {
  console.log(`   Cognitive Fitness      : ${score.overall}%`);
  console.log(`   Maturity Level         : ${score.maturityLevel}`);
  console.log(`   Pattern Formation      : ${score.patternFormation}%`);
  console.log(`   Mechanistic Reasoning  : ${score.mechanisticReasoning}%`);
  console.log(`   Organizational Memory  : ${score.organizationalMemory}%`);
  console.log(`   Concept Formation      : ${score.conceptFormation}%`);
  console.log(`   Theory Formation       : ${score.theoryFormation}%`);
  console.log(`   Cognitive Integration  : ${score.cognitiveIntegration}%`);
  console.log(`   Epistemic Intelligence : ${score.epistemicIntelligence}%`);
  console.log(`   Emergence              : ${score.emergence}%`);
}

function printOrganizationalLearning(score: OrganizationalLearningScore): void {
  console.log(`   Organizational Learning: ${score.organizationalLearningScore}%`);
  console.log(`   Learning Velocity      : ${score.learningVelocity}%`);
  console.log(`   Memory Growth          : ${score.memoryGrowth}%`);
  console.log(`   Understanding Growth   : ${score.understandingGrowth}%`);
  console.log(`   Belief Stability       : ${score.beliefStability}%`);
  console.log(`   Theory Stability       : ${score.theoryStability}%`);
  console.log(`   Knowledge Retention    : ${score.knowledgeRetention}%`);
  console.log(`   Mechanism Reuse        : ${score.mechanismReuse}%`);
  console.log(`   Concept Reuse          : ${score.conceptReuse}%`);
  console.log(`   Adaptive Learning      : ${score.adaptiveLearning}%`);
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

  if (score.organizationalLearning) {
    for (const item of score.organizationalLearning.diagnosis) {
      console.log(`      ✓ ${item}`);
    }
  }

  if (score.cognitiveFitness?.cognitiveIntegration !== undefined) {
    if (score.cognitiveFitness.cognitiveIntegration >= 80) {
      console.log(
        "      ✓ Cognitive layers are integrating into a unified organizational model.",
      );
    } else if (score.cognitiveFitness.cognitiveIntegration < 60) {
      console.log(
        "      ~ Cognitive integration remains the main frontier: outputs exist, but synthesis can improve.",
      );
    }
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
  if (
    score.organizationalLearning &&
    score.organizationalLearning.organizationalLearningScore < 60
  ) {
    console.log(
      "   Recommendation: improve longitudinal learning, historical continuity, and evidence reuse across investigations.",
    );
    return;
  }

  if (
    score.cognitiveFitness &&
    score.cognitiveFitness.cognitiveIntegration < 60
  ) {
    console.log(
      "   Recommendation: improve synthesis across beliefs, mechanisms, concepts, and executive conclusions.",
    );
    return;
  }

  if (
    score.cognitiveFitness &&
    score.cognitiveFitness.organizationalMemory < 60
  ) {
    console.log(
      "   Recommendation: improve memory reuse, belief evolution, and historical continuity.",
    );
    return;
  }

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

  if (report.cognitiveFitness) {
    console.log(`Cognitive Fitness     : ${report.cognitiveFitness.overall}%`);
    console.log(
      `Cognitive Maturity    : Level ${report.cognitiveFitness.maturityLevel}`,
    );
  }

  if (report.organizationalLearning) {
    console.log(
      `Organizational Learning: ${report.organizationalLearning.organizationalLearningScore}%`,
    );
  }

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

    if (score.cognitiveFitness) {
      console.log("");
      console.log("   Cognitive Fitness Profile:");
      printCognitiveFitness(score.cognitiveFitness);
    }

    if (score.organizationalLearning) {
      console.log("");
      console.log("   Organizational Learning Profile:");
      printOrganizationalLearning(score.organizationalLearning);
    }

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