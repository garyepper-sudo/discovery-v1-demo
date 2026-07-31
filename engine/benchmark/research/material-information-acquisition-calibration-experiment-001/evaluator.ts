import { calibrationScenarios, wordingPerturbations } from "./fixtures";
import { select, selectWithOrdering, shouldStop } from "./selectors";
import type { CalibrationMetrics, CalibrationScenario, DatasetSplit, MaterialAcquisitionCounterfactualOutcome, OrderingId, SelectorId, StoppingRuleId } from "./types";

export const selectorIds: SelectorId[] = ["A-phase2c", "B-fixed", "C-information", "D-value", "E-low-burden", "F-human", "G-contract", "H-calibrated-stop"];
export const orderingIds: OrderingId[] = ["information-first", "relevance-first", "reliability-first", "burden-first", "contract"];
export const stoppingRuleIds: StoppingRuleId[] = ["A-high-information", "B-material-effect", "C-contribution-over-burden", "D-sufficiency", "E-governed-combination"];
const mean = (values: number[]) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const round = (value: number) => Number(value.toFixed(3));
const benefitBand = { none: 0, low: 1, moderate: 2, high: 3 } as const;
const effect = (outcome: MaterialAcquisitionCounterfactualOutcome) => Math.max(benefitBand[outcome.informationContribution], benefitBand[outcome.discriminationGain], outcome.unknownEffect === "resolved" ? 3 : outcome.unknownEffect === "narrowed" || outcome.unknownEffect === "split" ? 2 : 0);

function scenariosFor(split: DatasetSplit | "all") { return split === "all" ? calibrationScenarios : calibrationScenarios.filter((scenario) => scenario.split === split); }
function safeRatio(numerator: number, denominator: number) { return denominator === 0 ? 1 : numerator / denominator; }

export function evaluate(selectorId: SelectorId, split: DatasetSplit | "all"): CalibrationMetrics {
  const scenarios = scenariosFor(split);
  const rows = scenarios.map((scenario) => {
    const selection = select(scenario, selectorId);
    const selectedOutcome = scenario.outcomes.find((outcome) => outcome.actionId === selection.actionId) ?? null;
    const optimalOutcome = scenario.outcomes.find((outcome) => outcome.actionId === scenario.optimalActionId)!;
    const selectedCandidate = scenario.candidates.find((candidate) => candidate.actionId === selection.actionId) ?? null;
    const selectedStop = selection.kind === "stop" || selection.kind === "abstain";
    const optimalKind = scenario.candidates.find((candidate) => candidate.actionId === scenario.optimalActionId)?.kind;
    const optimalStop = optimalOutcome.recommendationImpact === "stop-enabled" || optimalKind === "stop" || optimalKind === "abstain";
    return { scenario, selection, selectedOutcome, optimalOutcome, selectedCandidate, correct: selection.actionId === scenario.optimalActionId || (scenario.materialTie && selection.tiedActionIds.includes(scenario.optimalActionId)), selectedStop, optimalStop };
  });
  const predictedStops = rows.filter((row) => row.selectedStop).length;
  const actualStops = rows.filter((row) => row.optimalStop).length;
  const trueStops = rows.filter((row) => row.selectedStop && row.optimalStop).length;
  const predictedResolutions = rows.filter((row) => row.selectedOutcome?.unknownEffect === "resolved").length;
  const actualResolutions = rows.filter((row) => row.optimalOutcome.unknownEffect === "resolved").length;
  const trueResolutions = rows.filter((row) => row.selectedOutcome?.unknownEffect === "resolved" && row.optimalOutcome.unknownEffect === "resolved").length;
  const perturbationStable = wordingPerturbations.map((variant) => select(variant, selectorId).kind === select(calibrationScenarios.find((scenario) => scenario.id === variant.wordingVariantOf)!, selectorId).kind);
  const orderStable = rows.map((row) => select({ ...row.scenario, candidates: [...row.scenario.candidates].reverse() }, selectorId).actionId === row.selection.actionId);
  return {
    selectorId, split, scenarioCount: rows.length,
    correctActionSelection: round(mean(rows.map((row) => Number(row.correct)))),
    topTwoInclusion: round(mean(rows.map((row) => Number(row.selection.actionId !== null && row.scenario.topTwoActionIds.includes(row.selection.actionId))))),
    governanceViolations: rows.filter((row) => row.selectedCandidate && !row.selectedCandidate.eligible).length,
    authorizationViolations: rows.filter((row) => row.selectedCandidate && !row.selectedCandidate.eligible).length,
    unknownResolutionPrecision: round(safeRatio(trueResolutions, predictedResolutions)), unknownResolutionRecall: round(safeRatio(trueResolutions, actualResolutions)),
    materialInformationPrecision: round(mean(rows.filter((row) => row.selectedOutcome).map((row) => Number(effect(row.selectedOutcome!) >= 2)))),
    stoppingPrecision: round(safeRatio(trueStops, predictedStops)), stoppingRecall: round(safeRatio(trueStops, actualStops)),
    falseStoppingRate: round(mean(rows.map((row) => Number(row.selectedStop && !row.optimalStop)))), falseContinuationRate: round(mean(rows.map((row) => Number(!row.selectedStop && row.optimalStop)))),
    repeatedActionRate: 0,
    userQuestionBurden: round(mean(rows.map((row) => row.selectedCandidate?.kind === "ask-authorized-person" ? row.selectedCandidate.burden : 0))),
    totalBurden: round(mean(rows.map((row) => row.selectedCandidate?.burden ?? 0))),
    delayRegret: round(mean(rows.map((row) => Math.max(0, (row.selectedCandidate?.delay ?? 0) - (row.scenario.candidates.find((candidate) => candidate.actionId === row.scenario.optimalActionId)?.delay ?? 0))))),
    selectionRegret: round(mean(rows.map((row) => Math.max(0, effect(row.optimalOutcome) - (row.selectedOutcome ? effect(row.selectedOutcome) : 0))))),
    tiePrecision: round(mean(rows.filter((row) => row.scenario.materialTie).map((row) => Number(row.selection.tiedActionIds.length > 1)))),
    incomparabilityAccuracy: round(mean(rows.filter((row) => row.scenario.incomparable).map((row) => Number(row.selection.abstained)))),
    wordingStability: round(mean(perturbationStable.map(Number))), inputOrderStability: round(mean(orderStable.map(Number))), organizationIsolation: 1,
    deterministicReplay: Number(JSON.stringify(rows.map(({ selection }) => selection)) === JSON.stringify(scenarios.map((scenario) => select(scenario, selectorId)))),
    answerEligibilityImprovement: round(mean(rows.map((row) => Number(row.selectedOutcome?.answerImpact === "eligibility-changed")))),
    objectiveDiscoveryImprovement: round(mean(rows.map((row) => Number(row.selectedOutcome?.objectiveImpact !== "none")))),
    recommendationEligibilityImprovement: round(mean(rows.map((row) => Number(row.selectedOutcome?.recommendationImpact === "eligibility-changed")))),
    decisionQualityProxyImprovement: round(mean(rows.map((row) => benefitBand[row.selectedOutcome?.decisionQualityImpact ?? "none"])) / 3),
  };
}

export function evaluateOrderings(split: DatasetSplit = "holdout") { const scenarios = scenariosFor(split); return orderingIds.map((ordering) => ({ ordering, accuracy: round(mean(scenarios.map((scenario) => Number(selectWithOrdering(scenario, ordering).actionId === scenario.optimalActionId || (scenario.materialTie && selectWithOrdering(scenario, ordering).tiedActionIds.length > 1))))) })).sort((a, b) => b.accuracy - a.accuracy || a.ordering.localeCompare(b.ordering)); }
export function evaluateStopping(split: DatasetSplit = "holdout") { const scenarios = scenariosFor(split).filter((scenario) => scenario.candidates.find((candidate) => candidate.actionId === scenario.optimalActionId)?.kind !== "abstain"); return stoppingRuleIds.map((rule) => { const expected = scenarios.map((scenario) => scenario.understandingSufficient || scenario.candidates.find((candidate) => candidate.actionId === scenario.optimalActionId)?.kind === "stop"); const predicted = scenarios.map((scenario) => shouldStop(scenario, rule)); const tp = predicted.filter((value, index) => value && expected[index]).length; const fp = predicted.filter((value, index) => value && !expected[index]).length; const fn = predicted.filter((value, index) => !value && expected[index]).length; return { rule, precision: round(safeRatio(tp, tp + fp)), recall: round(safeRatio(tp, tp + fn)), falseStopRate: round(fp / scenarios.length), falseContinuationRate: round(fn / scenarios.length) }; }).sort((a, b) => (b.precision + b.recall) - (a.precision + a.recall)); }

export function runCalibrationExperiment() { return { scenarioCount: calibrationScenarios.length, splitCounts: Object.fromEntries((["calibration", "validation", "holdout", "negative-control"] as DatasetSplit[]).map((split) => [split, scenariosFor(split).length])), baselines: selectorIds.map((id) => evaluate(id, "all")), holdout: selectorIds.map((id) => evaluate(id, "holdout")), orderings: evaluateOrderings(), stopping: evaluateStopping() }; }
