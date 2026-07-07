export type OrganizationalLearningBenchmarkScore = {
  organizationalLearningScore: number;
  learningVelocity: number;
  memoryGrowth: number;
  understandingGrowth: number;
  beliefStability: number;
  theoryStability: number;
  knowledgeRetention: number;
  mechanismReuse: number;
  conceptReuse: number;
  adaptiveLearning: number;
  passed: boolean;
  diagnosis: string[];
};

type LearningProfileLike = {
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

function clampScore(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function growthToScore(value: number | undefined): number {
  if (typeof value !== "number") return 0;
  if (value <= 0) return 0;
  return clampScore(value * 10);
}

function adaptiveLearningScore(profile: LearningProfileLike): number {
  const investigationsObserved = profile.investigationsObserved ?? 0;
  const meaningfulEvents = profile.meaningfulLearningEventCount ?? 0;

  if (investigationsObserved <= 1) {
    return meaningfulEvents > 0 ? 35 : 0;
  }

  return clampScore((meaningfulEvents / Math.max(1, investigationsObserved * 4)) * 100);
}

export function scoreOrganizationalLearningBenchmark(params: {
  learningProfile?: LearningProfileLike | null;
}): OrganizationalLearningBenchmarkScore {
  const profile = params.learningProfile;

  if (!profile) {
    return {
      organizationalLearningScore: 0,
      learningVelocity: 0,
      memoryGrowth: 0,
      understandingGrowth: 0,
      beliefStability: 0,
      theoryStability: 0,
      knowledgeRetention: 0,
      mechanismReuse: 0,
      conceptReuse: 0,
      adaptiveLearning: 0,
      passed: false,
      diagnosis: ["No organizational learning profile was available."],
    };
  }

  const learningVelocity = clampScore(profile.learningVelocityScore ?? 0);
  const memoryGrowth = growthToScore(profile.memoryGrowth);
  const understandingGrowth = growthToScore(profile.understandingGrowth);
  const beliefStability = clampScore(profile.beliefStability ?? 0);
  const theoryStability = clampScore(profile.theoryStability ?? 0);
  const knowledgeRetention = clampScore(profile.knowledgeRetention ?? 0);
  const mechanismReuse = clampScore(profile.mechanismReuse ?? 0);
  const conceptReuse = clampScore(profile.conceptReuse ?? 0);
  const adaptiveLearning = adaptiveLearningScore(profile);

  const organizationalLearningScore = clampScore(
    learningVelocity * 0.18 +
      memoryGrowth * 0.12 +
      understandingGrowth * 0.12 +
      beliefStability * 0.14 +
      theoryStability * 0.14 +
      knowledgeRetention * 0.12 +
      mechanismReuse * 0.08 +
      conceptReuse * 0.06 +
      adaptiveLearning * 0.14,
  );

  const diagnosis: string[] = [];

  if ((profile.investigationsObserved ?? 0) <= 1) {
    diagnosis.push("Learning profile initialized; longitudinal growth requires additional investigations.");
  }

  if (learningVelocity >= 60) {
    diagnosis.push(`Learning velocity is ${profile.learningVelocity ?? "active"}.`);
  }

  if (beliefStability >= 60) {
    diagnosis.push("Beliefs are being reinforced or stabilized.");
  }

  if (theoryStability >= 60) {
    diagnosis.push("Organizational theories are stabilizing.");
  }

  if (knowledgeRetention < 60) {
    diagnosis.push("Knowledge retention needs more longitudinal evidence.");
  }

  if (memoryGrowth <= 0 && (profile.investigationsObserved ?? 0) > 1) {
    diagnosis.push("Memory maturity did not improve during this investigation.");
  }

  return {
    organizationalLearningScore,
    learningVelocity,
    memoryGrowth,
    understandingGrowth,
    beliefStability,
    theoryStability,
    knowledgeRetention,
    mechanismReuse,
    conceptReuse,
    adaptiveLearning,
    passed: organizationalLearningScore >= 60,
    diagnosis,
  };
}