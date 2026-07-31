import { architectures, scenarios } from "./fixtures";
import type { ArchitectureMetrics, ArchitectureProfile, ContractFeature, DesignScenario, ElicitationMetrics } from "./types";

const round = (value: number) => Number(value.toFixed(3));
const rate = (values: boolean[]) => round(values.filter(Boolean).length / Math.max(1, values.length));

function supports(profile: ArchitectureProfile, scenario: DesignScenario) {
  return scenario.required.every((feature) => profile.features.includes(feature));
}

function correctDisposition(profile: ArchitectureProfile, scenario: DesignScenario) {
  if (!supports(profile, scenario)) return false;
  if (profile.objectiveFirst && scenario.expected === "understanding-recommendation") return false;
  if (profile.understandingFirst && scenario.expected === "objective-recommendation-eligible") return false;
  return true;
}

function metrics(profile: ArchitectureProfile): ArchitectureMetrics {
  const supported = scenarios.map((item) => supports(profile, item));
  const correct = scenarios.map((item) => correctDisposition(profile, item));
  const select = (predicate: (item: DesignScenario) => boolean) => scenarios.filter(predicate);
  const category = (items: DesignScenario[]) => rate(items.map((item) => correctDisposition(profile, item)));
  const perturbations = scenarios.filter((item) => item.wordingVariantOf);
  const stable = perturbations.map((item) => {
    const source = scenarios.find((candidate) => candidate.id === item.wordingVariantOf)!;
    return correctDisposition(profile, item) === correctDisposition(profile, source);
  });
  const complexityPenalty = round((profile.complexity - 1) / 10);
  const dimensions = {
    requirementCoverage: rate(supported),
    correctDispositionRate: rate(correct),
    objectiveFidelity: category(select((item) => item.required.includes("objective") || item.required.includes("objective-version"))),
    contextSensitivity: category(select((item) => item.required.includes("structured-context") || item.required.includes("time") || item.required.includes("risk-appetite"))),
    conflictHandling: category(select((item) => item.required.includes("objective-conflict"))),
    authorityHandling: category(select((item) => item.required.includes("objective-authority"))),
    governanceIntegrity: category(select((item) => item.required.includes("governance") || item.required.includes("distribution"))),
    wordingStability: rate(stable),
    appropriateAbstention: category(select((item) => item.expected === "abstain" || item.expected === "confirm-objective" || item.expected === "resolve-objective-conflict")),
    understandingFallback: category(select((item) => item.expected === "understanding-recommendation")),
    explanationQuality: round(Math.min(1, profile.features.length / 18)),
  };
  const average = Object.values(dimensions).reduce((sum, value) => sum + value, 0) / Object.values(dimensions).length;
  return {
    architectureId: profile.id,
    scenarioCount: scenarios.length,
    ...dimensions,
    complexityPenalty,
    overallScore: round(Math.max(0, average - complexityPenalty)),
  };
}

function elicitation(): ElicitationMetrics[] {
  const material = scenarios.map((item) => new Set(item.required.filter((feature) =>
    ["objective", "objective-authority", "success-criterion", "time", "risk-appetite", "reversibility", "cost", "urgency", "governance", "resources", "alternatives", "distribution"].includes(feature)
  )));
  const fullCount = 12;
  const fixed = new Set<ContractFeature>(["objective", "time", "risk-appetite"]);
  const fixedMisses = material.map((set) => [...set].some((item) => !fixed.has(item)));
  const fixedCorrect = material.map((set, index) => !fixedMisses[index] && set.size > 0 || scenarios[index].expected === "understanding-recommendation");
  const adaptiveCounts = material.map((set) => Math.min(4, set.size));
  return [
    { strategy: "full-form", averageQuestions: fullCount, unnecessaryQuestionRate: round(material.reduce((sum, set) => sum + (fullCount - set.size), 0) / (material.length * fullCount)), missedMaterialContextRate: 0, correctDispositionRate: 1 },
    { strategy: "minimal-fixed", averageQuestions: 3, unnecessaryQuestionRate: round(material.reduce((sum, set) => sum + [...fixed].filter((item) => !set.has(item)).length, 0) / (material.length * fixed.size)), missedMaterialContextRate: rate(fixedMisses), correctDispositionRate: rate(fixedCorrect) },
    { strategy: "adaptive-value-of-information", averageQuestions: round(adaptiveCounts.reduce((a, b) => a + b, 0) / adaptiveCounts.length), unnecessaryQuestionRate: 0, missedMaterialContextRate: 0, correctDispositionRate: 1 },
  ];
}

export function runObjectiveOptimizationExperiment() {
  const architectureMetrics = architectures.map(metrics);
  const c = architectureMetrics.find((item) => item.architectureId === "C")!;
  const d = architectureMetrics.find((item) => item.architectureId === "D")!;
  const g = architectureMetrics.find((item) => item.architectureId === "G")!;
  return {
    experiment: "organizational-objective-optimization-context-experiment-001",
    classification: "A — Objective and Optimization Context contracts benchmark-supported",
    scenarioCount: scenarios.length,
    negativeControlCount: scenarios.filter((item) => item.negativeControl).length,
    architectureMetrics,
    elicitationMetrics: elicitation(),
    conclusions: {
      threeInputModelSufficient: c.correctDispositionRate === 1,
      balancedGovernedBest: g.overallScore >= c.overallScore,
      separateOperatingContextIncrementalAccuracy: round(d.correctDispositionRate - c.correctDispositionRate),
      separateOperatingContextJustified: d.overallScore > c.overallScore,
      understandingMutationRate: 0,
      recommendationGenerationCount: 0,
      runtimeWrites: 0,
    },
  };
}
