import type {
  OrganizationalExplanation,
  OrganizationalJudgment,
  OrganizationalJudgmentCriteria,
} from "./organizationalJudgment";

type EvaluateExplanationsInput = {
  explanations: OrganizationalExplanation[];
};

const clamp01 = (value: number): number =>
  Math.max(0, Math.min(1, value));

function scoreExplanation(
  explanation: OrganizationalExplanation,
): OrganizationalJudgmentCriteria {
  const evidentialSupport = clamp01(
    explanation.evidenceReferences.length * 0.08,
  );

  const explanatoryPower = clamp01(
    explanation.explainedEffectIds.length * 0.15 +
      explanation.relatedRootCauseIds.length * 0.10,
  );

  const parsimony = clamp01(
    1 - explanation.assumptions.length * 0.15,
  );

  const causalPlausibility = clamp01(explanation.confidence);

  const contradictionRisk = 0;

  const executiveSignificance = clamp01(
    explanation.relatedLeveragePointIds.length * 0.20 +
      explanation.relatedExecutiveConclusionIds.length * 0.15,
  );

  const interventionLeverage = clamp01(
    explanation.relatedLeveragePointIds.length * 0.25,
  );

  return {
    evidentialSupport,
    explanatoryPower,
    parsimony,
    causalPlausibility,
    contradictionRisk,
    executiveSignificance,
    interventionLeverage,
  };
}

function overallScore(
  criteria: OrganizationalJudgmentCriteria,
): number {
  return clamp01(
    criteria.evidentialSupport * 0.20 +
      criteria.explanatoryPower * 0.20 +
      criteria.parsimony * 0.10 +
      criteria.causalPlausibility * 0.20 +
      criteria.executiveSignificance * 0.20 +
      criteria.interventionLeverage * 0.10 -
      criteria.contradictionRisk * 0.10,
  );
}

export function evaluateExplanations(
  input: EvaluateExplanationsInput,
): OrganizationalJudgment[] {
  const judgments = input.explanations.map((explanation) => {
    const criteria = scoreExplanation(explanation);

    const score = overallScore(criteria);

    return {
      id: `judgment-${explanation.id}`,

      explanationId: explanation.id,

      title: explanation.title,

      assessment: explanation.summary,

      criteria,

      overallScore: score,

      confidence: explanation.confidence,

      rank: 0,

      status:
        score >= 0.75
          ? "accepted"
          : score >= 0.50
          ? "competing"
          : score >= 0.30
          ? "weak"
          : "rejected",

      strengths: [],

      weaknesses: [],

      competingExplanationIds: [],

      rejectedExplanationIds: [],

      evidenceReferences: explanation.evidenceReferences,

      executiveRecommendation:
        score >= 0.75
          ? "Prioritize executive attention."
          : score >= 0.50
          ? "Monitor and gather additional evidence."
          : "Insufficient support for executive action.",
    } satisfies OrganizationalJudgment;
  });

  judgments.sort((a, b) => b.overallScore - a.overallScore);

  judgments.forEach((judgment, index) => {
    judgment.rank = index + 1;
  });

  return judgments;
}