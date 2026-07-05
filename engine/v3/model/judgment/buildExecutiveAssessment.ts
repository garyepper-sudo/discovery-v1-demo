import type {
  OrganizationalAssessment,
  OrganizationalJudgment,
  RejectedExplanation,
} from "./organizationalJudgment";
import type { OrganizationalMechanism } from "./organizationalMechanism";

type BuildExecutiveAssessmentInput = {
  judgments: OrganizationalJudgment[];
  mechanisms?: OrganizationalMechanism[];
};

const average = (values: number[]): number =>
  values.length === 0
    ? 0
    : values.reduce((sum, value) => sum + value, 0) / values.length;

function numericPriority(value: number | string | undefined): number {
  if (typeof value === "number") return value;
  if (value === "critical") return 1;
  if (value === "high") return 0.85;
  if (value === "medium") return 0.6;
  if (value === "low") return 0.35;
  return 0;
}

function rankMechanism(mechanism: OrganizationalMechanism): number {
  return (
    mechanism.confidence * 0.45 +
    numericPriority(mechanism.executivePriority) * 0.35 +
    Math.min(0.2, (mechanism.supportCount ?? 0) * 0.04)
  );
}

function summarizeMechanism(mechanism: OrganizationalMechanism): string {
  return `${mechanism.executiveName || mechanism.title}: ${
    mechanism.executiveSummary || mechanism.summary
  }`;
}

export function buildExecutiveAssessment(
  input: BuildExecutiveAssessmentInput,
): OrganizationalAssessment {
  const rankedJudgments = [...input.judgments].sort(
    (a, b) => b.overallScore - a.overallScore,
  );

  const rankedMechanisms = [...(input.mechanisms ?? [])].sort(
    (a, b) => rankMechanism(b) - rankMechanism(a),
  );

  const primaryMechanisms = rankedMechanisms.slice(0, 3);
  const strongestJudgment = rankedJudgments[0] ?? null;
  const strongestMechanism = primaryMechanisms[0] ?? null;

  const rejectedExplanations: RejectedExplanation[] = rankedJudgments
    .filter((judgment) => judgment.status === "rejected")
    .map((judgment) => ({
      explanationId: judgment.explanationId,
      reason:
        judgment.weaknesses[0] ??
        "This explanation did not meet the threshold for executive confidence.",
      confidence: judgment.confidence,
    }));

  const recommendedFocus =
    primaryMechanisms.length > 0
      ? primaryMechanisms.map((mechanism) => mechanism.executiveName || mechanism.title)
      : rankedJudgments
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

  const summary = strongestMechanism
    ? `Discovery judges that the strongest organizational mechanism is: ${
        strongestMechanism.executiveName || strongestMechanism.title
      }.`
    : strongestJudgment
      ? `Discovery judges that the strongest explanation is: ${strongestJudgment.title}.`
      : "Discovery did not identify a sufficiently strong organizational explanation.";

  const executiveNarrative = strongestJudgment
    ? `${strongestJudgment.assessment} This explanation ranked highest because it had the strongest combined judgment score across evidence, explanatory power, causal plausibility, executive significance, and intervention leverage.`
    : "The available reasoning paths did not produce a coherent executive assessment.";

  const mechanismCenteredNarrative = strongestMechanism
    ? `${strongestMechanism.executiveName || strongestMechanism.title} appears to be the primary force shaping the organization's behavior. ${strongestMechanism.executiveImplication}`
    : undefined;

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
    primaryMechanismIds: primaryMechanisms.map((mechanism) => mechanism.id),
    primaryMechanismSummaries: primaryMechanisms.map(summarizeMechanism),
    mechanismCenteredNarrative,
    confidence,
  };
}