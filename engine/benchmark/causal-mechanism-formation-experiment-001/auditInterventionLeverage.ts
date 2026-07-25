import type { CandidateCausalMechanism } from "./types";

export function auditInterventionLeverage(candidate: CandidateCausalMechanism) {
  const link = candidate.mediatingRelationships[0];
  const implication = candidate.implications[0];
  if (!link) return { classification: "unavailable", link: "", reason: "No mediated causal link." };
  return {
    classification: implication && candidate.falsificationCriteria.length
      ? "fully recoverable" : "partially recoverable",
    link: `${link.from} → ${link.to}`,
    why: `Changing ${link.from} should change ${link.to} if the registered relationship is causal.`,
    successSignal: implication?.predictedOutcome ?? "",
    falsification: candidate.falsificationCriteria[0]?.criterion ?? "",
  };
}
