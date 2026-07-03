import {
  Belief,
  DiscoveryBrief,
  Hypothesis,
  InvestigationInput,
  Signal,
  Surprise,
  Understanding,
} from "../../types";

export function createBrief(
  input: InvestigationInput,
  understandings: Understanding[],
  signals: Signal[],
  surprises: Surprise[],
  hypotheses: Hypothesis[] = [],
  beliefs: Belief[] = []
): DiscoveryBrief {
  const topBelief = beliefs[0];
  const topHypothesis = hypotheses[0];
  const topUnderstanding = understandings[0];

  return {
    executiveSummary: topBelief
      ? `${topBelief.statement} ${topBelief.reasoning} Confidence is ${topBelief.confidence}%.`
      : topUnderstanding
        ? `${topUnderstanding.title}: ${topUnderstanding.summary} Confidence is ${topUnderstanding.confidence}%.`
        : `Discovery reviewed ${input.company || "the company"} and found early signals, but not enough evidence to form a strong understanding yet.`,

    keySignals: [
      ...understandings.map(
        (understanding) =>
          `${understanding.title} — ${understanding.summary} Confidence: ${understanding.confidence}%.`
      ),
      ...signals.map((signal) => `${signal.title} — ${signal.whyItMatters}`),
    ],

    risks: [
      ...understandings.flatMap((understanding) =>
        understanding.conflictingEvidence.map(
          (conflict) => `Conflicting evidence: ${conflict}`
        )
      ),
      ...(topHypothesis
        ? [`Unvalidated hypothesis: ${topHypothesis.title}`]
        : []),
      ...surprises.map((surprise) => `Surprise to investigate: ${surprise.title}`),
    ],

    opportunities: [
      ...understandings.map(
        (understanding) =>
          `Deepen the understanding: ${understanding.title}`
      ),
      ...(topBelief
        ? [`Test whether this belief is true: ${topBelief.statement}`]
        : []),
    ],

    leadershipQuestions: [
      ...understandings.flatMap((understanding) => understanding.openQuestions),
      ...(topHypothesis
        ? [`What evidence would disprove this hypothesis: ${topHypothesis.title}?`]
        : []),
    ],

    recommendedNextMoves: [
      "Run a focused test against the highest-confidence understanding.",
      "Collect the evidence needed to validate or reject the top hypothesis.",
      "Compare whether the brief creates clearer executive action than a generic AI summary.",
    ],
  };
}