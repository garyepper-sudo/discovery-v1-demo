import type { CandidateCausalMechanism } from "./types";

export function recommendNextEvidence(
  candidate: CandidateCausalMechanism,
): CandidateCausalMechanism["recommendedNextEvidence"] {
  const requests: CandidateCausalMechanism["recommendedNextEvidence"] = [];
  if (candidate.mediatingRelationships.length < 2) requests.push({
    missingRelationship: "an Evidence-backed intermediate link between the proposed driver and outcome",
    purpose: "mediation",
    reason: "The current chain does not explain how the driver produces the outcome.",
  });
  if (candidate.activatingConditions.length === 0) requests.push({
    missingRelationship: "the condition under which the proposed relationship operates",
    purpose: "activation",
    reason: "The hypothesis would otherwise be overgeneralized.",
  });
  if (candidate.competingExplanations.length === 0) requests.push({
    missingRelationship: "Evidence that tests the leading chain against a credible alternative",
    purpose: "alternative-discrimination",
    reason: "Plausibility alone cannot establish comparative support.",
  });
  if (candidate.implications.length === 0) requests.push({
    missingRelationship: "a future observation that differs across the leading and alternative explanations",
    purpose: "implication",
    reason: "No discriminating conditional implication can yet be registered.",
  });
  return requests;
}
