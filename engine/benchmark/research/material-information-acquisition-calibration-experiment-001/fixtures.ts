import type { ActionKind, CalibrationCandidate, CalibrationScenario, MaterialAcquisitionCounterfactualOutcome, Ordinal, SequentialScenario } from "./types";

const domains = ["sales", "onboarding", "inventory", "product-launch", "cost-reduction", "safety", "compliance", "retention", "hiring", "coordination"];
const actionKinds: ActionKind[] = ["inspect-existing-evidence", "compare-existing-evidence", "search-authorized-source", "ask-authorized-person", "request-document", "recommend-survey", "recommend-measurement", "recommend-experiment", "monitor-signal", "wait-for-outcome"];
const bands = ["none", "low", "moderate", "high"] as const;
const burdenBands = ["low", "low", "moderate", "high"] as const;
const delayBands = ["immediate", "short", "medium", "long"] as const;

const candidate = (actionId: string, kind: ActionKind, values: Partial<Omit<CalibrationCandidate, "actionId" | "kind">> = {}): CalibrationCandidate => ({
  actionId, kind, eligible: true, informationContribution: 2, discriminationGain: 2,
  organizationalRelevance: 2, reliability: 2, burden: 1, cost: 1, delay: 1,
  reversibility: 3, evidenceQuality: 2, ...values,
});

function outcome(action: CalibrationCandidate, optimal: boolean): MaterialAcquisitionCounterfactualOutcome {
  const information = optimal ? Math.max(action.informationContribution, 2) as Ordinal : Math.min(action.informationContribution, 1) as Ordinal;
  const discrimination = optimal ? Math.max(action.discriminationGain, 2) as Ordinal : Math.min(action.discriminationGain, 1) as Ordinal;
  return {
    actionId: action.actionId,
    informationContribution: bands[information], discriminationGain: bands[discrimination],
    unknownEffect: optimal ? (information === 3 ? "resolved" : "narrowed") : "unchanged",
    answerImpact: optimal && information >= 2 ? "eligibility-changed" : "none",
    objectiveImpact: optimal && action.kind === "ask-authorized-person" ? "authority-resolved" : "none",
    recommendationImpact: optimal && information >= 2 ? "eligibility-changed" : "none",
    decisionQualityImpact: optimal ? (action.organizationalRelevance === 3 ? "high" : "moderate") : "none",
    reliabilityAfterEvaluation: bands[Math.max(1, action.reliability)] as "low" | "moderate" | "high",
    realizedBurden: burdenBands[action.burden], realizedDelay: delayBands[action.delay],
    governanceSafe: action.eligible,
  };
}

function standardScenario(index: number, split: CalibrationScenario["split"]): CalibrationScenario {
  const domain = domains[index % domains.length];
  const winnerKind = actionKinds[index % actionKinds.length];
  const winner = candidate(`winner-${index}`, winnerKind, { informationContribution: 3, discriminationGain: 3, organizationalRelevance: 3, reliability: 3, burden: 1, cost: 1, delay: 1, evidenceQuality: 3 });
  const highInfoWrong = candidate(`high-info-${index}`, actionKinds[(index + 3) % actionKinds.length], { informationContribution: 3, discriminationGain: 2, organizationalRelevance: 1, reliability: 1, burden: 3, cost: 2, delay: 2 });
  const lowBurdenWrong = candidate(`low-burden-${index}`, actionKinds[(index + 6) % actionKinds.length], { informationContribution: 1, discriminationGain: 1, organizationalRelevance: 2, reliability: 2, burden: 0, cost: 0, delay: 0 });
  const candidates = [winner, highInfoWrong, lowBurdenWrong];
  return { id: `${split}-${domain}-${index}`, organizationId: `org-${index % 4}`, questionId: `q-${index}`, domain, purpose: (["understanding", "objective", "recommendation", "decision"] as const)[index % 4], split, understandingSufficient: false, candidates, outcomes: candidates.map((item) => outcome(item, item === winner)), optimalActionId: winner.actionId, topTwoActionIds: [winner.actionId, highInfoWrong.actionId], materialTie: false, incomparable: false };
}

const calibration = Array.from({ length: 32 }, (_, index) => standardScenario(index, "calibration"));
const validation = Array.from({ length: 8 }, (_, offset) => standardScenario(32 + offset, "validation"));

const attributes: Array<keyof Pick<CalibrationCandidate, "informationContribution" | "discriminationGain" | "organizationalRelevance" | "reliability" | "burden" | "cost" | "delay" | "reversibility" | "evidenceQuality">> = ["informationContribution", "discriminationGain", "organizationalRelevance", "reliability", "burden", "cost", "delay", "reversibility", "evidenceQuality"];

function holdoutAttributeScenario(index: number): CalibrationScenario {
  const attribute = attributes[index % attributes.length];
  const lowerIsBetter = attribute === "burden" || attribute === "cost" || attribute === "delay";
  const best = candidate(`z-best-${attribute}-${index}`, actionKinds[index % actionKinds.length]);
  const other = candidate(`a-other-${attribute}-${index}`, actionKinds[(index + 1) % actionKinds.length]);
  (best[attribute] as number) = lowerIsBetter ? 0 : 3;
  (other[attribute] as number) = lowerIsBetter ? 3 : 0;
  const candidates = [best, other];
  return { id: `holdout-${attribute}-${index}`, organizationId: `holdout-org-${index % 3}`, questionId: `holdout-q-${index}`, domain: domains[index % domains.length], purpose: "understanding", split: "holdout", understandingSufficient: false, candidates, outcomes: candidates.map((item) => outcome(item, item === best)), optimalActionId: best.actionId, topTwoActionIds: candidates.map(({ actionId }) => actionId), materialTie: false, incomparable: false };
}

function holdoutOrderingScenario(index: number): CalibrationScenario {
  const challenge = index % 3;
  const best = candidate(`z-order-best-${index}`, actionKinds[(index + 2) % actionKinds.length], { informationContribution: 3, discriminationGain: 2, organizationalRelevance: 2, reliability: 2, burden: 2 });
  const other = candidate(`a-order-other-${index}`, actionKinds[(index + 5) % actionKinds.length], { informationContribution: 2, discriminationGain: 2, organizationalRelevance: challenge === 0 ? 3 : 2, reliability: challenge === 1 ? 3 : 2, burden: challenge === 2 ? 0 : 2 });
  const candidates = [best, other];
  return { id: `holdout-order-${index}`, organizationId: `holdout-order-org-${index % 3}`, questionId: `holdout-order-q-${index}`, domain: domains[index % domains.length], purpose: "understanding", split: "holdout", understandingSufficient: false, candidates, outcomes: candidates.map((item) => outcome(item, item === best)), optimalActionId: best.actionId, topTwoActionIds: candidates.map(({ actionId }) => actionId), materialTie: false, incomparable: false };
}

const holdout = [
  ...Array.from({ length: 9 }, (_, index) => holdoutAttributeScenario(index)),
  ...Array.from({ length: 9 }, (_, index) => holdoutOrderingScenario(index)),
];

const stopCandidate = candidate("holdout-stop", "stop", { informationContribution: 0, discriminationGain: 0, organizationalRelevance: 3, reliability: 3, burden: 0, cost: 0, delay: 0 });
const weakCandidate = candidate("holdout-weak", "recommend-survey", { informationContribution: 1, discriminationGain: 1, organizationalRelevance: 1, burden: 3, cost: 3, delay: 2 });
holdout.push({ id: "holdout-stopping", organizationId: "holdout-org-stop", questionId: "holdout-q-stop", domain: "retention", purpose: "understanding", split: "holdout", understandingSufficient: true, candidates: [weakCandidate, stopCandidate], outcomes: [outcome(weakCandidate, false), { ...outcome(stopCandidate, true), unknownEffect: "unchanged", answerImpact: "none", recommendationImpact: "stop-enabled" }], optimalActionId: stopCandidate.actionId, topTwoActionIds: [stopCandidate.actionId], materialTie: false, incomparable: false });

const tieA = candidate("tie-a", "inspect-existing-evidence", { informationContribution: 2, discriminationGain: 2, organizationalRelevance: 2, reliability: 2, burden: 1, cost: 0, delay: 0 });
const tieB = candidate("tie-b", "ask-authorized-person", { informationContribution: 2, discriminationGain: 2, organizationalRelevance: 2, reliability: 2, burden: 1, cost: 0, delay: 0 });
holdout.push({ id: "holdout-material-tie", organizationId: "holdout-org-tie", questionId: "holdout-q-tie", domain: "coordination", purpose: "objective", split: "holdout", understandingSufficient: false, candidates: [tieA, tieB], outcomes: [outcome(tieA, true), outcome(tieB, true)], optimalActionId: tieA.actionId, topTwoActionIds: [tieA.actionId, tieB.actionId], materialTie: true, incomparable: false });

const stoppingCases: Array<{ id: string; sufficient: boolean; action: CalibrationCandidate; shouldStop: boolean }> = [
  { id: "low-material", sufficient: false, action: candidate("low-material-action", "search-authorized-source", { informationContribution: 3, discriminationGain: 2, organizationalRelevance: 0, reliability: 2, burden: 1 }), shouldStop: true },
  { id: "burden-dominates", sufficient: false, action: candidate("burden-dominates-action", "recommend-experiment", { informationContribution: 2, discriminationGain: 2, organizationalRelevance: 3, reliability: 3, burden: 3, cost: 3, delay: 3 }), shouldStop: true },
  { id: "material-low-burden", sufficient: false, action: candidate("material-low-burden-action", "ask-authorized-person", { informationContribution: 2, discriminationGain: 2, organizationalRelevance: 3, reliability: 3, burden: 0, cost: 0, delay: 0 }), shouldStop: false },
];
for (const item of stoppingCases) {
  const stop = candidate(`${item.id}-stop`, "stop", { informationContribution: 0, discriminationGain: 0, organizationalRelevance: 2, reliability: 3, burden: 0, cost: 0, delay: 0 });
  const winner = item.shouldStop ? stop : item.action;
  const candidates = [item.action, stop];
  holdout.push({ id: `holdout-stop-${item.id}`, organizationId: `holdout-org-${item.id}`, questionId: `holdout-q-${item.id}`, domain: "coordination", purpose: "understanding", split: "holdout", understandingSufficient: item.sufficient, candidates, outcomes: candidates.map((entry) => outcome(entry, entry === winner)), optimalActionId: winner.actionId, topTwoActionIds: [winner.actionId], materialTie: false, incomparable: false });
}

const unavailableA = candidate("incomparable-a", "recommend-survey", { eligible: false, informationContribution: 3, organizationalRelevance: 3 });
const unavailableB = candidate("incomparable-b", "recommend-experiment", { eligible: false, discriminationGain: 3, organizationalRelevance: 3 });
const incomparableAbstain = candidate("incomparable-abstain", "abstain", { informationContribution: 0, discriminationGain: 0, organizationalRelevance: 2, burden: 0, cost: 0, delay: 0 });
holdout.push({ id: "holdout-incomparable", organizationId: "holdout-org-incomparable", questionId: "holdout-q-incomparable", domain: "safety", purpose: "decision", split: "holdout", understandingSufficient: false, candidates: [unavailableA, unavailableB, incomparableAbstain], outcomes: [outcome(unavailableA, false), outcome(unavailableB, false), outcome(incomparableAbstain, true)], optimalActionId: incomparableAbstain.actionId, topTwoActionIds: [incomparableAbstain.actionId], materialTie: false, incomparable: true });

const blocked = candidate("blocked", "search-authorized-source", { eligible: false, informationContribution: 3, organizationalRelevance: 3 });
const abstain = candidate("negative-abstain", "abstain", { informationContribution: 0, discriminationGain: 0, organizationalRelevance: 2, burden: 0, cost: 0, delay: 0 });
const negative: CalibrationScenario[] = Array.from({ length: 4 }, (_, index) => ({ id: `negative-${index}`, organizationId: `negative-org-${index}`, questionId: `negative-q-${index}`, domain: domains[index], purpose: "understanding", split: "negative-control", understandingSufficient: false, candidates: [{ ...blocked, actionId: `blocked-${index}` }, { ...abstain, actionId: `abstain-${index}` }], outcomes: [outcome({ ...blocked, actionId: `blocked-${index}` }, false), outcome({ ...abstain, actionId: `abstain-${index}` }, true)], optimalActionId: `abstain-${index}`, topTwoActionIds: [`abstain-${index}`], materialTie: false, incomparable: false }));

export const calibrationScenarios: CalibrationScenario[] = [...calibration, ...validation, ...holdout, ...negative];

export const wordingPerturbations: CalibrationScenario[] = calibration.slice(0, 4).map((base, index) => ({ ...base, id: `wording-${index}`, wordingVariantOf: base.id, questionId: `wording-q-${index}` }));

function sequentialRound(sequence: number, round: number, kind: ActionKind): SequentialScenario["rounds"][number] {
  const base = standardScenario(100 + sequence * 10 + round, "validation");
  const winner = candidate(`seq-${sequence}-${round}`, kind, { informationContribution: kind === "stop" ? 0 : 3, discriminationGain: kind === "stop" ? 0 : 3, organizationalRelevance: 3, reliability: 3, burden: kind === "stop" ? 0 : 1, cost: 0, delay: 0 });
  const stale = candidate(`stale-${sequence}-${round}`, round === 0 ? "ask-authorized-person" : "inspect-existing-evidence", { informationContribution: 1, organizationalRelevance: 1, burden: 2 });
  base.id = `sequential-${sequence}-round-${round}`; base.questionId = `sequential-q-${sequence}`; base.organizationId = `sequential-org-${sequence}`; base.understandingSufficient = kind === "stop"; base.candidates = [winner, stale]; base.outcomes = [outcome(winner, true), outcome(stale, false)]; base.optimalActionId = winner.actionId; base.topTwoActionIds = [winner.actionId];
  return { revision: `revision-${sequence}-${round}`, scenario: base, expectedKind: kind };
}

export const sequentialScenarios: SequentialScenario[] = Array.from({ length: 10 }, (_, sequence) => ({ id: `sequence-${sequence}`, rounds: (["inspect-existing-evidence", "ask-authorized-person", "search-authorized-source", "stop"] as ActionKind[]).map((kind, round) => sequentialRound(sequence, round, kind)) }));
