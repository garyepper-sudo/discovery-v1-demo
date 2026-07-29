export type HumanRubricCriterion = {
  id: string;
  label: string;
  scoreRange: readonly [0, 10];
  zero: string;
  five: string;
  ten: string;
  reviewerQuestion: string;
};

export const DISCOVERY_INTELLIGENCE_HUMAN_RUBRIC: HumanRubricCriterion[] = [
  {
    id: "understanding",
    label: "Understanding",
    scoreRange: [0, 10],
    zero: "Misstates the situation or provides no usable understanding.",
    five: "Captures the main pattern but misses material alternatives or limits.",
    ten: "Provides a traceable, compressed, generalizable explanation with material alternatives and limits.",
    reviewerQuestion: "Does this materially improve how the reader understands what is happening and why?",
  },
  {
    id: "truthfulness",
    label: "Truthfulness",
    scoreRange: [0, 10],
    zero: "Contains unsupported material claims or conceals decisive uncertainty.",
    five: "Mostly grounded, with minor overstatement or incomplete uncertainty.",
    ten: "Every material claim is grounded, calibrated, causally restrained, and lineage-preserving.",
    reviewerQuestion: "Is every material statement warranted at the strength used?",
  },
  {
    id: "utility",
    label: "Decision utility",
    scoreRange: [0, 10],
    zero: "Cannot affect reasonable managerial judgment.",
    five: "Clarifies part of the decision but leaves important tradeoffs implicit.",
    ten: "Changes the decision frame by revealing material tradeoffs, alternatives, or discriminating next evidence without false prescription.",
    reviewerQuestion: "Would this change a reasonable manager's thinking in a useful way?",
  },
  {
    id: "communication",
    label: "Communication",
    scoreRange: [0, 10],
    zero: "Confusing, verbose, unstructured, or dominated by internal terminology.",
    five: "Understandable but requires effort or contains avoidable complexity.",
    ten: "Clear, brief, structured, progressively disclosed, and readable by both executive and non-expert audiences.",
    reviewerQuestion: "Can the intended reader quickly identify the finding, support, limits, and next step?",
  },
  {
    id: "evidence_recommendations",
    label: "Evidence recommendations",
    scoreRange: [0, 10],
    zero: "Requests irrelevant, redundant, or non-discriminating evidence.",
    five: "Requests relevant evidence but does not prioritize information gain.",
    ten: "Recommends the smallest practical evidence sequence that best discriminates among live alternatives.",
    reviewerQuestion: "Would the proposed evidence materially reduce the most important uncertainty?",
  },
  {
    id: "uncertainty_handling",
    label: "Uncertainty handling",
    scoreRange: [0, 10],
    zero: "Treats uncertainty as certainty or uses generic disclaimers.",
    five: "Names uncertainty but not its decision consequence or resolution path.",
    ten: "Names specific uncertainty, preserves bounded utility, and identifies how to resolve it.",
    reviewerQuestion: "Are the limits specific, decision-relevant, and recoverable?",
  },
];

export const HUMAN_RUBRIC_MAXIMUM = 60;

export function validateHumanRubricScores(
  scores: Record<string, number>,
): number {
  const expected = new Set(
    DISCOVERY_INTELLIGENCE_HUMAN_RUBRIC.map((item) => item.id),
  );
  if (
    Object.keys(scores).length !== expected.size ||
    Object.keys(scores).some((id) => !expected.has(id))
  ) {
    throw new Error("Human rubric requires exactly the six canonical criteria.");
  }
  const total = Object.values(scores).reduce((sum, value) => {
    if (!Number.isInteger(value) || value < 0 || value > 10) {
      throw new Error("Human rubric scores must be integers from 0 to 10.");
    }
    return sum + value;
  }, 0);
  return total;
}
