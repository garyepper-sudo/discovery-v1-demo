import type { TopologyCandidate } from "./types";

export function recommendNextEvidence(candidate: TopologyCandidate) {
  const requests: TopologyCandidate["recommendedNextEvidence"] = [];
  const ambiguous = candidate.edges.filter((edge) => edge.supportStatus === "supported-but-ambiguous");
  for (const edge of ambiguous) requests.push({
    missingRelationship: `an intervention response or controlled contrast for ${edge.fromNodeId} → ${edge.toNodeId}`,
    purpose: "direction",
    reason: "Temporal or correlational support alone cannot establish causal direction.",
  });
  if (candidate.topology === "unresolved") requests.push({
    missingRelationship: "a supported mediator connecting the proposed driver and outcome",
    purpose: "mediation",
    reason: "The current Evidence does not establish a complete causal path.",
  });
  if (candidate.competingExplanations.length === 0) requests.push({
    missingRelationship: "Evidence comparing the leading structure with a credible alternative",
    purpose: "alternative-discrimination",
    reason: "Qualification requires comparative discrimination.",
  });
  return requests;
}
