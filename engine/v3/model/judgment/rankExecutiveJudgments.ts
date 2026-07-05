import type {
  OrganizationalExplanation,
  OrganizationalJudgment,
} from "./organizationalJudgment";

type DetectJudgmentContradictionsInput = {
  explanations: OrganizationalExplanation[];
  judgments: OrganizationalJudgment[];
};

export function detectJudgmentContradictions(
  input: DetectJudgmentContradictionsInput,
): OrganizationalJudgment[] {
  const { explanations, judgments } = input;

  const explanationMap = new Map(
    explanations.map((explanation) => [explanation.id, explanation]),
  );

  return judgments.map((judgment) => {
    const explanation = explanationMap.get(judgment.explanationId);

    if (!explanation) {
      return judgment;
    }

    const competingExplanationIds: string[] = [];

    for (const other of explanations) {
      if (other.id === explanation.id) continue;

      const sharedRootCause = other.relatedRootCauseIds.some((id) =>
        explanation.relatedRootCauseIds.includes(id),
      );

      const sharedEffect = other.explainedEffectIds.some((id) =>
        explanation.explainedEffectIds.includes(id),
      );

      if (sharedRootCause || sharedEffect) {
        competingExplanationIds.push(other.id);
      }
    }

    const contradictionRisk = Math.min(
      0.25,
      competingExplanationIds.length * 0.05,
    );

    return {
      ...judgment,
      competingExplanationIds,
      criteria: {
        ...judgment.criteria,
        contradictionRisk,
      },
      overallScore: Math.max(0, judgment.overallScore - contradictionRisk),
    };
  });
}