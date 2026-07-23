import type { CollaborationDimension, ExecutiveConversationRun, ExecutiveConversationScenario, ScenarioScore } from "./executiveConversationTypes";

const clamp = (value: number, maximum: number) => Math.round(Math.max(0, Math.min(maximum, value)) * 100) / 100;
export const COLLABORATION_WEIGHTS: Record<CollaborationDimension, number> = { executiveUnderstanding:15, questionQuality:10, collaborativeReasoning:15, constructiveChallenge:10, conversationalContinuity:10, modelStewardship:15, recommendationQuality:10, actionHandoff:5, sessionImpactAccuracy:5, executiveTrust:5 };

export function scoreExecutiveConversation(scenario: ExecutiveConversationScenario, run: ExecutiveConversationRun): ScenarioScore {
  const recognized = new Set(run.trace.flatMap((turn) => turn.recognizedConcepts));
  const coverage = scenario.expected.requiredConcepts.length ? recognized.size / scenario.expected.requiredConcepts.length : 1;
  const questions = run.trace.reduce((sum, turn) => sum + turn.questionCount, 0);
  const uniqueResponses = new Set(run.trace.map((turn) => turn.discoveryResponse)).size;
  const challengeNeeded = scenario.expected.expectedChallenge === "required";
  const challenged = run.trace.some((turn) => turn.challenged);
  const expectedWrites = scenario.expected.expectedDurableWrites;
  const actualWrites = run.trace.flatMap((turn) => turn.durableWrites);
  const writesCorrect = JSON.stringify(actualWrites) === JSON.stringify(expectedWrites);
  const handoff = scenario.turns.findLast((turn) => turn.action)?.action ?? "defer";
  const recommendationTurns = run.trace.filter((turn) => turn.recommendationPresent).map((turn) => turn.turn);
  const recommendationTiming = scenario.expected.recommendationAfterTurn === null ? recommendationTurns.length === 0 : recommendationTurns.every((turn) => turn >= scenario.expected.recommendationAfterTurn!);
  const dimensions: Record<CollaborationDimension, number> = {
    executiveUnderstanding: clamp(15 * coverage, 15),
    questionQuality: clamp(questions <= scenario.expected.maximumUsefulClarifyingQuestions ? 10 : 10 - (questions - scenario.expected.maximumUsefulClarifyingQuestions) * 2, 10),
    collaborativeReasoning: clamp(6 + 9 * coverage, 15),
    constructiveChallenge: clamp(challengeNeeded ? (challenged ? 8 : 2) : challenged ? 9 : 7, 10),
    conversationalContinuity: clamp(3 + 7 * (uniqueResponses / Math.max(1, run.trace.length)), 10),
    modelStewardship: clamp(writesCorrect && run.runtimeDiff.unrelatedAreasPreserved && run.hardFailures.length === 0 ? 15 : 5, 15),
    recommendationQuality: clamp(recommendationTiming ? 8 : 3, 10),
    actionHandoff: clamp(handoff === scenario.expected.expectedHandoff ? 5 : 1, 5),
    sessionImpactAccuracy: clamp(run.sessionImpact.durable.length === scenario.expected.expectedSessionImpactEntries ? 5 : 0, 5),
    executiveTrust: 0,
  };
  dimensions.executiveTrust = clamp(5 * ((dimensions.questionQuality/10 + dimensions.constructiveChallenge/10 + dimensions.conversationalContinuity/10 + dimensions.modelStewardship/15) / 4), 5);
  const score = Math.round(Object.values(dimensions).reduce((sum, value) => sum + value, 0) * 100) / 100;
  const ordered = Object.entries(dimensions).sort((a,b) => b[1]/COLLABORATION_WEIGHTS[b[0] as CollaborationDimension] - a[1]/COLLABORATION_WEIGHTS[a[0] as CollaborationDimension]);
  const warnings = [];
  if (coverage < .67) warnings.push("Discovery response did not cover enough scenario-specific concepts.");
  if (uniqueResponses < run.trace.length) warnings.push("Discovery repeated the same projected response across changing turns.");
  if (challengeNeeded && !challenged) warnings.push("A weak executive assumption was not constructively challenged.");
  if (!recommendationTiming) warnings.push("Recommendation timing did not match the conversation state.");
  return { scenarioId: scenario.id, score, dimensions, criticalFailures: [...run.hardFailures], warnings, strongestBehavior: ordered[0][0], weakestBehavior: ordered[ordered.length-1][0] };
}
