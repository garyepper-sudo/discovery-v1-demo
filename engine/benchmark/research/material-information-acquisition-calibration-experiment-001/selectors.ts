import type { CalibrationCandidate, CalibrationScenario, OrderingId, Selection, SelectorId, StoppingRuleId } from "./types";

const benefit = (candidate: CalibrationCandidate) => Math.max(candidate.informationContribution, candidate.discriminationGain);
const low = (value: number) => 3 - value;
const tuple = (candidate: CalibrationCandidate, ordering: OrderingId): number[] => {
  const costs = [low(candidate.burden), low(candidate.cost), low(candidate.delay), candidate.reversibility];
  if (ordering === "relevance-first") return [candidate.organizationalRelevance, benefit(candidate), candidate.reliability, candidate.evidenceQuality, ...costs];
  if (ordering === "reliability-first") return [candidate.reliability, candidate.discriminationGain, candidate.organizationalRelevance, candidate.informationContribution, candidate.evidenceQuality, ...costs];
  if (ordering === "burden-first") return [low(candidate.burden), benefit(candidate), candidate.organizationalRelevance, candidate.reliability, low(candidate.cost), low(candidate.delay), candidate.reversibility, candidate.evidenceQuality];
  return [benefit(candidate), candidate.organizationalRelevance, candidate.reliability, candidate.evidenceQuality, ...costs];
};
const compareTuple = (a: number[], b: number[]) => { for (let i = 0; i < Math.max(a.length, b.length); i += 1) { const delta = (b[i] ?? 0) - (a[i] ?? 0); if (delta) return delta; } return 0; };
const eligible = (scenario: CalibrationScenario) => scenario.candidates.filter((candidate) => candidate.eligible);
const chooseKind = (scenario: CalibrationScenario, kinds: CalibrationCandidate["kind"][]) => kinds.map((kind) => eligible(scenario).find((candidate) => candidate.kind === kind)).find(Boolean) ?? null;

export function shouldStop(scenario: CalibrationScenario, rule: StoppingRuleId): boolean {
  const actions = eligible(scenario).filter((candidate) => candidate.kind !== "stop" && candidate.kind !== "abstain");
  if (rule === "A-high-information") return !actions.some((candidate) => benefit(candidate) === 3);
  if (rule === "B-material-effect") return !actions.some((candidate) => benefit(candidate) >= 2 && candidate.organizationalRelevance >= 2);
  if (rule === "C-contribution-over-burden") return !actions.some((candidate) => benefit(candidate) > candidate.burden);
  if (rule === "D-sufficiency") return scenario.understandingSufficient;
  return scenario.understandingSufficient || !actions.some((candidate) => benefit(candidate) >= 2 && candidate.organizationalRelevance >= 2 && candidate.reliability >= 2 && benefit(candidate) > candidate.burden);
}

export function selectWithOrdering(scenario: CalibrationScenario, ordering: OrderingId, stoppingRule: StoppingRuleId = "E-governed-combination"): Selection {
  const actions = eligible(scenario);
  const stop = actions.find((candidate) => candidate.kind === "stop");
  const abstain = actions.find((candidate) => candidate.kind === "abstain");
  if (shouldStop(scenario, stoppingRule) && stop) return { actionId: stop.actionId, kind: stop.kind, tiedActionIds: [], abstained: false };
  const comparable = actions.filter((candidate) => candidate.kind !== "stop" && candidate.kind !== "abstain");
  if (comparable.length === 0) return abstain ? { actionId: abstain.actionId, kind: abstain.kind, tiedActionIds: [], abstained: true } : { actionId: null, kind: null, tiedActionIds: [], abstained: true };
  const ranked = [...comparable].sort((a, b) => compareTuple(tuple(a, ordering), tuple(b, ordering)) || a.actionId.localeCompare(b.actionId));
  const tied = ranked.filter((candidate) => compareTuple(tuple(ranked[0], ordering), tuple(candidate, ordering)) === 0).map(({ actionId }) => actionId).sort();
  return { actionId: ranked[0].actionId, kind: ranked[0].kind, tiedActionIds: tied.length > 1 ? tied : [], abstained: false };
}

export function select(scenario: CalibrationScenario, selectorId: SelectorId): Selection {
  const actions = eligible(scenario);
  let chosen: CalibrationCandidate | null = null;
  if (selectorId === "A-phase2c") chosen = [...actions].sort((a, b) => b.discriminationGain - a.discriminationGain || b.informationContribution - a.informationContribution || a.burden - b.burden || a.delay - b.delay || a.cost - b.cost || a.actionId.localeCompare(b.actionId))[0] ?? null;
  else if (selectorId === "B-fixed") chosen = chooseKind(scenario, ["inspect-existing-evidence", "search-authorized-source", "ask-authorized-person", "recommend-survey", "recommend-measurement", "recommend-experiment", "wait-for-outcome", "stop", "abstain"]);
  else if (selectorId === "C-information") chosen = [...actions].sort((a, b) => benefit(b) - benefit(a) || a.actionId.localeCompare(b.actionId))[0] ?? null;
  else if (selectorId === "D-value") chosen = [...actions].sort((a, b) => b.organizationalRelevance - a.organizationalRelevance || a.actionId.localeCompare(b.actionId))[0] ?? null;
  else if (selectorId === "E-low-burden") chosen = [...actions].sort((a, b) => a.burden - b.burden || a.actionId.localeCompare(b.actionId))[0] ?? null;
  else if (selectorId === "F-human") chosen = chooseKind(scenario, ["inspect-existing-evidence", "compare-existing-evidence", "search-authorized-source", "ask-authorized-person", "recommend-experiment", "wait-for-outcome", "request-document", "recommend-measurement", "recommend-survey", "monitor-signal", "stop", "abstain"]);
  else return selectWithOrdering(scenario, "contract", selectorId === "H-calibrated-stop" ? "E-governed-combination" : "B-material-effect");
  return { actionId: chosen?.actionId ?? null, kind: chosen?.kind ?? null, tiedActionIds: [], abstained: chosen?.kind === "abstain" || chosen === null };
}
