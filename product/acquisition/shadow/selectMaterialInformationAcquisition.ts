import { stableId } from "../../workflow/text";
import type {
  MaterialAcquisitionCandidate,
  MaterialAcquisitionEstimate,
  MaterialAcquisitionExplanation,
  MaterialInformationAcquisitionInput,
  MaterialInformationAcquisitionResult,
} from "./contracts";

const ordinal = { low: 1, moderate: 2, high: 3 } as const;
const cost = { none: 0, low: 1, moderate: 2, high: 3 } as const;
const delay = { immediate: 0, short: 1, material: 2, unknown: 3 } as const;
const reversible = { irreversible: 0, "partially-reversible": 1, reversible: 2 } as const;

function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).sort().join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value).sort().map((key) => `${key}:${canonical((value as Record<string, unknown>)[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function available<T>(estimate: MaterialAcquisitionEstimate<T>): T | null {
  return estimate.state === "available" ? estimate.value : null;
}

function explanation(input: MaterialInformationAcquisitionInput, rationale: string, alternatives: string[], limitations: string[], stoppingCondition: string | null): MaterialAcquisitionExplanation {
  return {
    uncertaintyRef: input.materialUncertainty.unknownVersionRef,
    rationale,
    alternativeCandidateIds: [...alternatives].sort(),
    limitations: [...new Set(limitations)].sort(),
    stoppingCondition,
  };
}

function selectionId(input: MaterialInformationAcquisitionInput): string {
  return stableId("material-acquisition-shadow-selection", canonical({
    organizationId: input.organizationId,
    questionId: input.questionId,
    understandingRevisionRef: input.understandingRevisionRef,
    materialUncertainty: input.materialUncertainty,
    purpose: input.purpose,
    candidates: input.candidates,
    budgetContext: input.budgetContext,
    authorizationContextRef: input.authorizationContextRef,
    governanceContextRefs: input.governanceContextRefs,
    evaluatedAt: input.evaluatedAt,
  }));
}

function completeVector(candidate: MaterialAcquisitionCandidate): number[] | null {
  const information = available(candidate.expectedInformationContribution);
  const discrimination = available(candidate.expectedDiscriminationGain);
  const relevance = available(candidate.expectedOrganizationalRelevance);
  const reliability = available(candidate.reliability);
  const evidence = available(candidate.existingEvidenceQuality);
  const burden = available(candidate.burden);
  const candidateCost = available(candidate.cost);
  const candidateDelay = available(candidate.delay);
  const candidateReversibility = available(candidate.reversibility);
  if (!information || !discrimination || !relevance || !reliability || !evidence || !burden
    || candidateCost === null || candidateDelay === null || !candidateReversibility) return null;
  return [
    Math.max(ordinal[information], ordinal[discrimination]),
    ordinal[relevance],
    ordinal[reliability],
    ordinal[evidence],
    -ordinal[burden],
    -cost[candidateCost],
    -delay[candidateDelay],
    reversible[candidateReversibility],
  ];
}

function withinBudget(input: MaterialInformationAcquisitionInput, candidate: MaterialAcquisitionCandidate): boolean {
  const burden = available(candidate.burden);
  const candidateCost = available(candidate.cost);
  const candidateDelay = available(candidate.delay);
  const candidateReversibility = available(candidate.reversibility);
  if (!burden || candidateCost === null || candidateDelay === null || !candidateReversibility) return false;
  if (input.budgetContext.maxBurden && ordinal[burden] > ordinal[input.budgetContext.maxBurden]) return false;
  if (input.budgetContext.maxCost && cost[candidateCost] > cost[input.budgetContext.maxCost]) return false;
  if (input.budgetContext.maxDelay && delay[candidateDelay] > delay[input.budgetContext.maxDelay]) return false;
  return input.budgetContext.irreversibleActionAllowed || candidateReversibility !== "irreversible";
}

function eligible(input: MaterialInformationAcquisitionInput, candidate: MaterialAcquisitionCandidate): boolean {
  const gate = candidate.eligibility;
  const consent = gate.consentState === "not-required" || gate.consentState === "granted";
  return candidate.target.organizationId === input.organizationId
    && candidate.uncertaintyRef === input.materialUncertainty.unknownVersionRef
    && gate.ownerAvailable && gate.targetAccessible && gate.executionAvailable
    && gate.authorizationSatisfied && gate.governanceAllowed && consent
    && available(candidate.reliability) !== null
    && withinBudget(input, candidate);
}

function dominates(left: number[], right: number[]): boolean {
  return left.every((value, index) => value >= right[index])
    && left.some((value, index) => value > right[index]);
}

export function selectMaterialInformationAcquisition(input: MaterialInformationAcquisitionInput): MaterialInformationAcquisitionResult {
  const id = selectionId(input);
  const baseLimitations = ["Shadow-only projection; no action was initiated."];
  if (input.contractVersion !== "1" || !input.authorizationContextRef.trim() || !Number.isFinite(Date.parse(input.evaluatedAt))) {
    return { kind: "abstain", selectionId: id, reason: "selector-unsupported", explanation: explanation(input, "The selector input is unsupported.", [], baseLimitations, null) };
  }
  if (input.budgetContext.userDeclined) {
    return { kind: "stop", selectionId: id, reason: "user-declined", explanation: explanation(input, "The user declined additional acquisition.", [], baseLimitations, null) };
  }
  if (input.budgetContext.budgetExhausted) {
    return { kind: "stop", selectionId: id, reason: "budget-exhausted", explanation: explanation(input, "The governed acquisition budget is exhausted.", [], baseLimitations, null) };
  }
  const explicitStop = input.candidates.find((candidate) =>
    candidate.actionType === "stop" && candidate.eligibility.reasonCodes.includes("understanding-sufficient"));
  if (explicitStop) {
    return { kind: "stop", selectionId: id, reason: "understanding-sufficient", explanation: explanation(input, "The authorized owner reports that current understanding is sufficient.", [], baseLimitations, explicitStop.stoppingCondition) };
  }
  if (!input.budgetContext.materialPreferencesComplete) {
    return { kind: "abstain", selectionId: id, reason: "missing-material-input", explanation: explanation(input, "A material comparison preference is unavailable; no default was invented.", [], baseLimitations, null) };
  }
  const actionCandidates = input.candidates.filter((candidate) => candidate.actionType !== "stop" && candidate.actionType !== "abstain");
  const candidates = actionCandidates.filter((candidate) => eligible(input, candidate));
  if (candidates.length === 0) {
    const governanceBlocked = actionCandidates.some((candidate) => !candidate.eligibility.governanceAllowed);
    const authorizationBlocked = actionCandidates.some((candidate) => !candidate.eligibility.authorizationSatisfied || !candidate.eligibility.targetAccessible);
    const unreliable = actionCandidates.length > 0 && actionCandidates.every((candidate) => available(candidate.reliability) === null);
    if (governanceBlocked) return { kind: "abstain", selectionId: id, reason: "governance-blocked", explanation: explanation(input, "Governance prohibits every otherwise relevant action.", [], baseLimitations, null) };
    if (authorizationBlocked) return { kind: "abstain", selectionId: id, reason: "no-authorized-action", explanation: explanation(input, "No exact authorized acquisition action is available.", [], baseLimitations, null) };
    if (unreliable) return { kind: "stop", selectionId: id, reason: "remaining-actions-unreliable", explanation: explanation(input, "Remaining action reliability is unavailable or unreliable.", [], baseLimitations, null) };
    return { kind: "abstain", selectionId: id, reason: "missing-material-input", explanation: explanation(input, "No safely comparable candidate remains.", [], baseLimitations, null) };
  }
  const vectors = candidates.map((candidate) => ({ candidate, vector: completeVector(candidate) }));
  if (vectors.some((item) => item.vector === null)) {
    return { kind: "abstain", selectionId: id, reason: "missing-material-input", explanation: explanation(input, "A material non-safety estimate is unavailable; no favorable default was used.", candidates.map((candidate) => candidate.candidateId), baseLimitations, null) };
  }
  const complete = vectors as Array<{ candidate: MaterialAcquisitionCandidate; vector: number[] }>;
  const nonDominated = complete.filter((item) => !complete.some((other) => other !== item && dominates(other.vector, item.vector)));
  if (nonDominated.length === 1) {
    const winner = nonDominated[0].candidate;
    if (!winner.eligibility.reasonCodes.includes("material-effect-confirmed")) {
      return { kind: "stop", selectionId: id, reason: "insufficient-net-value", explanation: explanation(input, "No owner confirms a material effect on current understanding or a governed downstream choice.", [], baseLimitations, null) };
    }
    return {
      kind: "selected-action", selectionId: id, selected: winner,
      alternatives: candidates.filter((candidate) => candidate.candidateId !== winner.candidateId).sort((a, b) => a.candidateId.localeCompare(b.candidateId)),
      explanation: explanation(input, "One eligible candidate materially dominates without converting the comparison into a scalar score.", candidates.filter((candidate) => candidate !== winner).map((candidate) => candidate.candidateId), baseLimitations, winner.stoppingCondition),
    };
  }
  const equal = nonDominated.every((item) => canonical(item.vector) === canonical(nonDominated[0].vector));
  if (equal) {
    const tied = nonDominated.map((item) => item.candidate).sort((a, b) => a.candidateId.localeCompare(b.candidateId));
    return { kind: "material-tie", selectionId: id, candidates: tied, discriminatingQuestion: "Which governed constraint should decide between these equally supported actions?", explanation: explanation(input, "The candidates remain materially tied; identifier and input order did not choose a winner.", tied.map((candidate) => candidate.candidateId), baseLimitations, null) };
  }
  return { kind: "abstain", selectionId: id, reason: "incomparable-actions", explanation: explanation(input, "The non-dominated actions require different material tradeoffs and remain incomparable.", nonDominated.map((item) => item.candidate.candidateId), baseLimitations, null) };
}
