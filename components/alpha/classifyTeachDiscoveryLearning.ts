export type AuthorizedLearningSnapshot = {
  currentUnderstanding: string;
  confidence: string;
  uncertainty: string;
  evidenceBasis: string;
  nextImprovement: string;
};

export type TruthfulLearningOutcome =
  | "changed"
  | "strengthened"
  | "underdetermined";

export function classifyTruthfulLearningOutcome(params: {
  evidenceOutcome: "supported" | "underdetermined";
  before: AuthorizedLearningSnapshot;
  after: AuthorizedLearningSnapshot;
}): {
  outcome: TruthfulLearningOutcome;
  changedFields: string[];
} {
  const changedFields = [
    params.before.currentUnderstanding !== params.after.currentUnderstanding
      ? "Current understanding revised"
      : null,
    params.before.confidence !== params.after.confidence
      ? "Confidence boundary updated"
      : null,
    params.before.uncertainty !== params.after.uncertainty
      ? "Remaining uncertainty updated"
      : null,
    params.before.evidenceBasis !== params.after.evidenceBasis
      ? "Evidence basis updated"
      : null,
    params.before.nextImprovement !== params.after.nextImprovement
      ? "Next improvement updated"
      : null,
  ].filter((item): item is string => item !== null);

  if (params.evidenceOutcome === "underdetermined") {
    return { outcome: "underdetermined", changedFields };
  }
  return {
    outcome: changedFields.some((field) => field !== "Evidence basis updated")
      ? "changed"
      : "strengthened",
    changedFields,
  };
}
