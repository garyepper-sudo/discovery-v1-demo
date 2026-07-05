import type {
  OrganizationalAssessment,
  OrganizationalJudgment,
  RejectedExplanation,
} from "./organizationalJudgment";

type BuildExecutiveAssessmentInput = {
  judgments: OrganizationalJudgment[];
};

const average = (values: number[]): number =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;

export function buildExecutiveAssessment(
  input: BuildExecutiveAssessmentInput,
): OrganizationalAssessment {
  const rankedJudgments = [...input.judgments].sort(
    (a, b) => b.overallScore - a.overallScore,
  );

  const strongestJudgment = rankedJudgments[0] ?? null;

  const rejectedExplanations: RejectedExplanation[] = rankedJudgments
    .filter((judgment) => judgment.status === "rejected")
    .map((judgment) => ({
      explanationId: judgment.explanationId,
      reason:
        judgment.weaknesses[0] ??
        "This explanation did not meet the threshold for executive confidence.",
      confidence: judgment.confidence,
    }));

  const recommendedFocus = rankedJudgments
    .filter(
      (judgment) =>
        judgment.status === "accepted" || judgment.status === "competing",
    )
    .slice(0, 3)
    .map((judgment) => judgment.title);

  const confidence = average(
    rankedJudgments
      .filter((judgment) => judgment.status !== "rejected")
      .map((judgment) => judgment.confidence),
  );

  const summary = strongestJudgment
    ? `Discovery judges that the strongest explanation is: ${strongestJudgment.title}.`
    : "Discovery did not identify a sufficiently strong organizational explanation.";

  const executiveNarrative = strongestJudgment
    ? `${strongestJudgment.assessment} This explanation ranked highest because it had the strongest combined judgment score across evidence, explanatory power, causal plausibility, executive significance, and intervention leverage.`
    : "The available reasoning paths did not produce a coherent executive assessment.";

  return {
    summary,
    strongestJudgmentId: strongestJudgment?.id ?? null,
    judgments: rankedJudgments.map((judgment, index) => ({
      ...judgment,
      rank: index + 1,
    })),
    rejectedExplanations,
    executiveNarrative,
    recommendedFocus,
    confidence,
  };
}