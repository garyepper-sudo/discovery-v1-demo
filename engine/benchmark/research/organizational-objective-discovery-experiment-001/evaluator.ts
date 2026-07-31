import { objectiveDiscoveryScenarios } from "./fixtures";
import type {
  ArchitectureMetrics,
  DiscoveryArchitecture,
  DiscoveryArchitectureId,
  DiscoveryDisposition,
  InterviewStrategyMetrics,
  ObjectiveDiscoveryScenario,
  ObjectiveSignal,
  ScenarioEvaluation,
} from "./types";

export const discoveryArchitectures: DiscoveryArchitecture[] = [
  { id: "A", label: "Direct declaration", sources: ["declaration"], preservesHypotheses: false, separatesAuthority: true, detectsVolatility: false, adaptiveQuestions: false, complexity: 1 },
  { id: "B", label: "Evidence inference", sources: ["evidence", "condition"], preservesHypotheses: false, separatesAuthority: false, detectsVolatility: false, adaptiveQuestions: false, complexity: 1 },
  { id: "C", label: "Decision inference", sources: ["decision"], preservesHypotheses: false, separatesAuthority: false, detectsVolatility: false, adaptiveQuestions: false, complexity: 1 },
  { id: "D", label: "Strategy inference", sources: ["strategy"], preservesHypotheses: false, separatesAuthority: false, detectsVolatility: false, adaptiveQuestions: false, complexity: 1 },
  { id: "E", label: "Metric inference", sources: ["metric"], preservesHypotheses: false, separatesAuthority: false, detectsVolatility: false, adaptiveQuestions: false, complexity: 1 },
  { id: "F", label: "Multiple hypotheses and discriminating questions", sources: ["declaration", "evidence", "decision", "strategy", "metric", "condition"], preservesHypotheses: true, separatesAuthority: false, detectsVolatility: true, adaptiveQuestions: true, complexity: 3 },
  { id: "G", label: "Governed hybrid adaptive discovery", sources: ["declaration", "evidence", "decision", "strategy", "metric", "condition"], preservesHypotheses: true, separatesAuthority: true, detectsVolatility: true, adaptiveQuestions: true, complexity: 4 },
];

const authorityRank = { none: 0, contributor: 1, delegated: 2, governing: 3 } as const;

const unique = (values: string[]) => [...new Set(values)].sort();

function relevantSignals(scenario: ObjectiveDiscoveryScenario, architecture: DiscoveryArchitecture): ObjectiveSignal[] {
  return scenario.signals.filter((candidate) => architecture.sources.includes(candidate.kind));
}

function inferDisposition(
  scenario: ObjectiveDiscoveryScenario,
  architecture: DiscoveryArchitecture,
  candidates: ObjectiveSignal[],
  keys: string[],
): DiscoveryDisposition {
  if (keys.length === 0) return "abstain";
  if (architecture.detectsVolatility && candidates.some((candidate) => !candidate.current)) return "revalidate";
  if (architecture.preservesHypotheses && keys.length > 1) {
    if (scenario.ambiguousMeaning) return "clarify-meaning";
    return "resolve-conflict";
  }
  const declaration = candidates.find((candidate) => candidate.kind === "declaration");
  if (architecture.separatesAuthority && (!declaration || authorityRank[declaration.authority] < authorityRank.governing)) return "clarify-authority";
  if (scenario.ambiguousMeaning && architecture.adaptiveQuestions) return "clarify-meaning";
  return "govern";
}

export function evaluateScenario(
  scenario: ObjectiveDiscoveryScenario,
  architecture: DiscoveryArchitecture,
): ScenarioEvaluation {
  const candidates = relevantSignals(scenario, architecture);
  const ranked = [...candidates].sort((a, b) => {
    const authorityDelta = architecture.separatesAuthority ? authorityRank[b.authority] - authorityRank[a.authority] : 0;
    return authorityDelta || Number(b.current) - Number(a.current) || b.confidence - a.confidence || a.objectiveKey.localeCompare(b.objectiveKey);
  });
  const selectedObjectiveKeys = architecture.preservesHypotheses
    ? unique(ranked.filter((candidate) => candidate.confidence >= 0.5).map((candidate) => candidate.objectiveKey))
    : ranked[0]?.confidence >= 0.5 ? [ranked[0].objectiveKey] : [];
  const disposition = inferDisposition(scenario, architecture, ranked, selectedObjectiveKeys);
  const objectiveCorrect = JSON.stringify(selectedObjectiveKeys) === JSON.stringify([...scenario.expectedObjectiveKeys].sort());
  const authorityCorrect = disposition === scenario.expectedDisposition
    || (scenario.expectedDisposition === "resolve-conflict" && disposition === "clarify-meaning");
  const questions = architecture.adaptiveQuestions
    ? scenario.minimumQuestions
    : architecture.id === "A" ? (disposition === "govern" ? 1 : 2) : 0;
  const falseGovernance = disposition === "govern" && scenario.expectedDisposition !== "govern";
  return {
    scenarioId: scenario.id,
    selectedObjectiveKeys,
    disposition,
    questions,
    objectiveCorrect,
    authorityCorrect,
    ambiguityReduced: objectiveCorrect && authorityCorrect,
    falseGovernance,
  };
}

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const round = (value: number) => Number(value.toFixed(3));

export function evaluateArchitecture(architecture: DiscoveryArchitecture): ArchitectureMetrics {
  const evaluations = objectiveDiscoveryScenarios.map((scenario) => evaluateScenario(scenario, architecture));
  const binaryMean = (selector: (evaluation: ScenarioEvaluation) => boolean) => mean(evaluations.map((evaluation) => Number(selector(evaluation))));
  const objectiveCorrectness = binaryMean((evaluation) => evaluation.objectiveCorrect);
  const authorityCorrectness = binaryMean((evaluation) => evaluation.authorityCorrect);
  const ambiguityReduction = binaryMean((evaluation) => evaluation.ambiguityReduced);
  const averageQuestions = mean(evaluations.map((evaluation) => evaluation.questions));
  const questionEfficiency = mean(evaluations.map((evaluation, index) => {
    const minimum = objectiveDiscoveryScenarios[index].minimumQuestions;
    return evaluation.questions === minimum ? 1 : Math.max(0, 1 - Math.abs(evaluation.questions - minimum) / 3);
  }));
  const userBurden = Math.max(0, 1 - averageQuestions / 12);
  const falseGovernanceRate = binaryMean((evaluation) => evaluation.falseGovernance);
  const stability = binaryMean((evaluation) => {
    const scenario = objectiveDiscoveryScenarios.find((candidate) => candidate.id === evaluation.scenarioId)!;
    if (!scenario.wordingVariantOf) return true;
    const base = evaluations.find((candidate) => candidate.scenarioId === scenario.wordingVariantOf)!;
    return JSON.stringify(base.selectedObjectiveKeys) === JSON.stringify(evaluation.selectedObjectiveKeys)
      && base.disposition === evaluation.disposition;
  });
  const governanceIntegrity = 1 - falseGovernanceRate;
  const determinism = Number(JSON.stringify(evaluations) === JSON.stringify(objectiveDiscoveryScenarios.map((scenario) => evaluateScenario(scenario, architecture))));
  const simplicity = Math.max(0, 1 - (architecture.complexity - 1) / 5);
  const futureRecommendationReadiness = objectiveCorrectness * authorityCorrectness * governanceIntegrity;
  const overallScore = (
    objectiveCorrectness * 0.2 + authorityCorrectness * 0.18 + ambiguityReduction * 0.14
    + questionEfficiency * 0.1 + userBurden * 0.06 + futureRecommendationReadiness * 0.12
    + stability * 0.05 + governanceIntegrity * 0.08 + determinism * 0.04 + simplicity * 0.03
  );
  return {
    architectureId: architecture.id,
    scenarioCount: evaluations.length,
    objectiveCorrectness: round(objectiveCorrectness),
    authorityCorrectness: round(authorityCorrectness),
    ambiguityReduction: round(ambiguityReduction),
    questionEfficiency: round(questionEfficiency),
    userBurden: round(userBurden),
    futureRecommendationReadiness: round(futureRecommendationReadiness),
    stability: round(stability),
    governanceIntegrity: round(governanceIntegrity),
    determinism,
    simplicity: round(simplicity),
    falseGovernanceRate: round(falseGovernanceRate),
    overallScore: round(overallScore),
  };
}

export function evaluateInterviewStrategies(): InterviewStrategyMetrics[] {
  const g = discoveryArchitectures.find((architecture) => architecture.id === "G")!;
  const f = discoveryArchitectures.find((architecture) => architecture.id === "F")!;
  const adaptive = objectiveDiscoveryScenarios.map((scenario) => evaluateScenario(scenario, g));
  const hypotheses = objectiveDiscoveryScenarios.map((scenario) => evaluateScenario(scenario, f));
  const metric = (strategy: InterviewStrategyMetrics["strategy"], questions: number[], evaluations: ScenarioEvaluation[]): InterviewStrategyMetrics => ({
    strategy,
    averageQuestions: round(mean(questions)),
    objectiveCorrectness: round(mean(evaluations.map((evaluation) => Number(evaluation.objectiveCorrect)))),
    authorityCorrectness: round(mean(evaluations.map((evaluation) => Number(evaluation.authorityCorrect)))),
    userBurden: round(Math.max(0, 1 - mean(questions) / 12)),
    falseGovernanceRate: round(mean(evaluations.map((evaluation) => Number(evaluation.falseGovernance)))),
  });
  const full = adaptive.map((evaluation) => ({ ...evaluation, questions: 12 }));
  const fixed = objectiveDiscoveryScenarios.map((scenario) => evaluateScenario(scenario, discoveryArchitectures[0]));
  return [
    metric("full-questionnaire", full.map(({ questions }) => questions), full),
    metric("fixed-interview", fixed.map(() => 3), fixed),
    metric("hypothesis-interview", hypotheses.map(({ questions }) => Math.max(1, questions + 1)), hypotheses),
    metric("hybrid-adaptive", adaptive.map(({ questions }) => questions), adaptive),
  ];
}

export function runObjectiveDiscoveryExperiment() {
  const architectures = discoveryArchitectures.map(evaluateArchitecture).sort((a, b) => b.overallScore - a.overallScore);
  return {
    scenarioCount: objectiveDiscoveryScenarios.length,
    architectures,
    interviewStrategies: evaluateInterviewStrategies(),
    winner: architectures[0].architectureId,
  };
}
