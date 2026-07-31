import { acquisitionScenarios } from "./fixtures";
import type { AcquisitionAction, AcquisitionMetrics, AcquisitionScenario, AcquisitionSelection, AcquisitionStrategyId } from "./types";

export const strategyIds: AcquisitionStrategyId[] = [
  "A-fixed-workflow", "B-always-ask", "C-always-search", "D-rule-priority",
  "E-information-gain", "F-organizational-value", "G-governed-hybrid",
  "always-measure", "always-survey", "always-experiment",
];

const kindForStrategy: Partial<Record<AcquisitionStrategyId, AcquisitionAction["kind"]>> = {
  "B-always-ask": "ask-user",
  "C-always-search": "search-existing",
  "always-measure": "recommend-measurement",
  "always-survey": "recommend-survey",
  "always-experiment": "recommend-experiment",
};

const fixedOrder: AcquisitionAction["kind"][] = ["search-existing", "ask-user", "recommend-measurement", "recommend-survey", "recommend-experiment", "recommend-waiting", "do-nothing", "abstain"];
const ruleOrder: AcquisitionAction["kind"][] = ["search-existing", "compare-evidence", "ask-user", "request-document", "recommend-measurement", "recommend-survey", "recommend-experiment", "recommend-waiting", "do-nothing", "abstain"];

function hybridScore(action: AcquisitionAction): number {
  if (!action.authorized || !action.governanceAllowed) return Number.NEGATIVE_INFINITY;
  return action.expectedInformationGain * 0.31
    + action.expectedOrganizationalValue * 0.34
    + action.sourceReliability * 0.13
    + action.existingEvidenceQuality * 0.04
    + Number(action.reversible) * 0.04
    - action.userBurden * 0.05
    - action.acquisitionCost * 0.05
    - action.delay * 0.04;
}

const rank = (candidates: AcquisitionAction[], score: (action: AcquisitionAction) => number) =>
  [...candidates].sort((a, b) => score(b) - score(a) || a.id.localeCompare(b.id))[0] ?? null;

export function selectAction(scenario: AcquisitionScenario, strategyId: AcquisitionStrategyId): AcquisitionSelection {
  let selected: AcquisitionAction | null = null;
  const fixedKind = kindForStrategy[strategyId];
  if (fixedKind) selected = scenario.candidates.find((candidate) => candidate.kind === fixedKind) ?? null;
  else if (strategyId === "A-fixed-workflow") selected = fixedOrder.map((kind) => scenario.candidates.find((candidate) => candidate.kind === kind)).find(Boolean) ?? null;
  else if (strategyId === "D-rule-priority") selected = ruleOrder.map((kind) => scenario.candidates.find((candidate) => candidate.kind === kind && candidate.authorized && candidate.governanceAllowed)).find(Boolean) ?? null;
  else if (strategyId === "E-information-gain") selected = rank(scenario.candidates, (candidate) => candidate.expectedInformationGain);
  else if (strategyId === "F-organizational-value") selected = rank(scenario.candidates, (candidate) => candidate.expectedOrganizationalValue);
  else selected = rank(scenario.candidates, hybridScore);
  return {
    scenarioId: scenario.id,
    actionId: selected?.id ?? null,
    actionKind: selected?.kind ?? null,
    correct: selected?.id === scenario.expectedActionId,
    governanceSafe: selected === null || (selected.authorized && selected.governanceAllowed),
  };
}

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;
const round = (value: number) => Number(value.toFixed(3));

export function evaluateStrategy(strategyId: AcquisitionStrategyId): AcquisitionMetrics {
  const selections = acquisitionScenarios.map((scenario) => selectAction(scenario, strategyId));
  const selectedActions = selections.map((selection, index) => acquisitionScenarios[index].candidates.find((candidate) => candidate.id === selection.actionId) ?? null);
  const correctness = mean(selections.map((selection) => Number(selection.correct)));
  const questionEfficiency = mean(selectedActions.map((selected, index) => Number(selected?.kind !== "ask-user" || acquisitionScenarios[index].candidates.find((candidate) => candidate.id === acquisitionScenarios[index].expectedActionId)?.kind === "ask-user")));
  const userBurden = 1 - mean(selectedActions.map((selected) => selected?.userBurden ?? 1));
  const costEfficiency = 1 - mean(selectedActions.map((selected) => selected?.acquisitionCost ?? 1));
  const delayEfficiency = 1 - mean(selectedActions.map((selected) => selected?.delay ?? 1));
  const understandingImprovement = mean(selectedActions.map((selected) => selected?.expectedInformationGain ?? 0)) * correctness;
  const recommendationImprovement = mean(selectedActions.map((selected) => selected?.expectedOrganizationalValue ?? 0)) * correctness;
  const governanceIntegrity = mean(selections.map((selection) => Number(selection.governanceSafe)));
  const determinism = Number(JSON.stringify(selections) === JSON.stringify(acquisitionScenarios.map((scenario) => selectAction(scenario, strategyId))));
  const complexity = strategyId === "G-governed-hybrid" ? 4 : strategyId === "D-rule-priority" ? 3 : 1;
  const architecturalSimplicity = 1 - (complexity - 1) / 5;
  const overallScore = correctness * 0.3 + questionEfficiency * 0.08 + userBurden * 0.08 + costEfficiency * 0.07 + delayEfficiency * 0.06 + understandingImprovement * 0.13 + recommendationImprovement * 0.13 + governanceIntegrity * 0.1 + determinism * 0.03 + architecturalSimplicity * 0.02;
  return { strategyId, scenarioCount: selections.length, correctChoice: round(correctness), questionEfficiency: round(questionEfficiency), userBurden: round(userBurden), costEfficiency: round(costEfficiency), delayEfficiency: round(delayEfficiency), understandingImprovement: round(understandingImprovement), recommendationImprovement: round(recommendationImprovement), governanceIntegrity: round(governanceIntegrity), determinism, architecturalSimplicity: round(architecturalSimplicity), overallScore: round(overallScore) };
}

export function runMaterialInformationAcquisitionExperiment() {
  const strategies = strategyIds.map(evaluateStrategy).sort((a, b) => b.overallScore - a.overallScore);
  return { scenarioCount: acquisitionScenarios.length, strategies, winner: strategies[0].strategyId };
}
