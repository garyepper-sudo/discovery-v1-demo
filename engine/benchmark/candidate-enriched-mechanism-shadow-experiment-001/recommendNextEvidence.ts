import type { CandidateEnrichedMechanism } from "./types";

const guidance: Record<string, { missingRelationship: string; reason: string }> = {
  mediation: {
    missingRelationship:
      "Evidence directly connecting the upstream driver to the stated downstream outcome through an observable intermediate change.",
    reason: "The generated artifacts contain endpoints but no explicit causal mediator.",
  },
  activation: {
    missingRelationship:
      "Evidence showing the condition under which the proposed relationship activates or persists.",
    reason: "The candidate does not establish when the relationship operates.",
  },
  alternatives: {
    missingRelationship:
      "Evidence that changes differently under the leading explanation and the strongest plausible alternative.",
    reason: "The generated artifacts do not discriminate competing explanations.",
  },
  implication: {
    missingRelationship:
      "Evidence connecting the mechanism to a specific observable future outcome.",
    reason: "No scenario-specific implication is preserved.",
  },
  falsification: {
    missingRelationship:
      "Evidence whose absence or reversal would weaken the proposed mechanism.",
    reason: "No falsification criterion is represented.",
  },
  lineage: {
    missingRelationship:
      "Traceable source Evidence for each material causal claim.",
    reason: "Qualification requires complete raw-Evidence lineage.",
  },
};

export function recommendNextEvidence(
  missingFields: string[],
): CandidateEnrichedMechanism["recommendedNextEvidence"] {
  return missingFields
    .filter((item) => guidance[item])
    .map((item) => guidance[item]);
}
