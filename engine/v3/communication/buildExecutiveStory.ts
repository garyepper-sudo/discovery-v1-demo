import type {
  ExecutiveCommunicationSource,
} from "./executiveCommunicationSource";

import type {
  ExecutiveStory,
  ExecutiveStoryConfidence,
  ExecutiveStoryNextEvidence,
  ExecutiveStoryOptimizationObjective,
  ExecutiveStoryPrimaryConstraint,
  ExecutiveStoryRecommendation,
  ExecutiveStoryStrategy,
} from "./executiveStory";

type UnknownRecord =
  Record<string, unknown>;

function asRecord(
  value: unknown,
): UnknownRecord | undefined {
  return (
    typeof value === "object" &&
    value !== null
  )
    ? value as UnknownRecord
    : undefined;
}

function stringValue(
  value: unknown,
): string | undefined {
  return typeof value === "string"
    ? value
    : undefined;
}

function numberValue(
  value: unknown,
): number | undefined {
  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : undefined;
}

function stringArray(
  value: unknown,
): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(
    (item): item is string =>
      typeof item === "string" &&
      item.trim().length > 0,
  );
}

function recordArray(
  value: unknown,
): UnknownRecord[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map(asRecord)
    .filter(
      (
        record,
      ): record is UnknownRecord =>
        Boolean(record),
    );
}

function normalizeWhitespace(
  value: string,
): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();
}

function normalizedSentenceKey(
  value: string,
): string {
  return normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[.!?]+$/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function completeSentence(
  value: string,
): string {
  const normalized = normalizeWhitespace(value);

  if (!normalized) {
    return normalized;
  }

  return /[.!?]$/.test(normalized)
    ? normalized
    : `${normalized}.`;
}

function constraintLabel(
  value: string,
): string {
  const normalized = normalizeWhitespace(value)
    .replace(/[.!?]+$/g, "");

  return normalized
    .replace(
      /\s+is\s+(?:the\s+organization(?:'s|’s)\s+|the\s+)?primary(?:\s+executive)?\s+constraint$/i,
      "",
    )
    .trim();
}

function firstSentence(
  value: string | undefined,
): string | undefined {
  const normalized =
    value
      ? normalizeWhitespace(value)
      : undefined;

  if (!normalized) {
    return undefined;
  }

  return (
    normalized.match(
      /^.*?[.!?](?:\s|$)/,
    )?.[0]?.trim() ??
    normalized
  );
}

function removeEngineLanguage(
  value: string | undefined,
): string | undefined {
  const sentence =
    firstSentence(value);

  if (!sentence) {
    return undefined;
  }

  const cleaned =
    sentence
      .replace(
        /\bDiscovery (currently )?(believes|judges|sees|estimates|assigns|formed|selected)\b/gi,
        "",
      )
      .replace(
        /\bThe current working theory is that\b/gi,
        "",
      )
      .replace(
        /\bwith \d+% confidence and \d+% condition strength\.?/gi,
        "",
      )
      .replace(/\s+/g, " ")
      .replace(/\s+([,.!?])/g, "$1")
      .trim();

  return cleaned || undefined;
}

function clamp(
  value: number,
  minimum = 0,
  maximum = 100,
): number {
  return Math.min(
    maximum,
    Math.max(
      minimum,
      value,
    ),
  );
}

function percentage(
  value: number | undefined,
): number {
  if (value === undefined) {
    return 50;
  }

  return Math.round(
    clamp(
      value <= 1
        ? value * 100
        : value,
    ),
  );
}

function unique(
  values: string[],
): string[] {
  const seen =
    new Set<string>();

  const result:
    string[] = [];

  for (const value of values) {
    const normalized =
      normalizeWhitespace(value);

    const key =
      normalizedSentenceKey(normalized);

    if (
      !normalized ||
      seen.has(key)
    ) {
      continue;
    }

    seen.add(key);
    result.push(normalized);
  }

  return result;
}

function formatLabel(
  value: string,
): string {
  return value
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2",
    )
    .replace(
      /[_:-]+/g,
      " ",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function primaryJudgmentRecord(
  source:
    ExecutiveCommunicationSource,
): UnknownRecord {
  const assessment =
    asRecord(
      source.executiveAssessment,
    ) ?? {};

  return (
    asRecord(
      assessment.primaryJudgment,
    ) ??
    asRecord(
      assessment.primaryExecutiveJudgment,
    ) ??
    assessment
  );
}

function primaryConstraintRecord(
  source:
    ExecutiveCommunicationSource,
): UnknownRecord | undefined {
  const optimization =
    asRecord(
      source.executiveOptimization,
    );

  const recommendation =
    asRecord(
      source.executiveRecommendation,
    );

  const assessment =
    asRecord(
      source.executiveAssessment,
    );

  return (
    asRecord(
      optimization
        ?.primaryExecutiveConstraint,
    ) ??
    asRecord(
      optimization
        ?.primaryConstraint,
    ) ??
    asRecord(
      recommendation
        ?.primaryExecutiveConstraint,
    ) ??
    asRecord(
      assessment
        ?.primaryExecutiveConstraint,
    )
  );
}

function constraintIdFrom(
  source:
    ExecutiveCommunicationSource,
): string | undefined {
  const record =
    primaryConstraintRecord(
      source,
    );

  const judgment =
    primaryJudgmentRecord(
      source,
    );

  return (
    stringValue(
      record?.conditionId,
    ) ??
    stringValue(
      record?.id,
    ) ??
    stringValue(
      judgment.dominantConditionId,
    ) ??
    source
      .organizationalConditions
      ?.[0]
      ?.id
  );
}

function primaryConditionFrom(
  source:
    ExecutiveCommunicationSource,
) {
  const constraintId =
    constraintIdFrom(source);

  return (
    source
      .organizationalConditions
      .find(
        (condition) =>
          condition.id ===
          constraintId,
      ) ??
    source
      .organizationalConditions
      ?.[0]
  );
}

function constraintTitleFrom(
  source:
    ExecutiveCommunicationSource,
): string {
  const record =
    primaryConstraintRecord(
      source,
    );

  const judgment =
    primaryJudgmentRecord(
      source,
    );

  const condition =
    primaryConditionFrom(
      source,
    );

  return constraintLabel(
    condition?.name ??
    stringValue(
      record?.title,
    ) ??
    stringValue(
      record?.name,
    ) ??
    stringValue(
      judgment.headline,
    ) ??
    condition?.name ??
    "Primary Executive Constraint",
  );
}

function constraintSummaryFrom(
  source:
    ExecutiveCommunicationSource,
): string {
  const record =
    primaryConstraintRecord(
      source,
    );

  const judgment =
    primaryJudgmentRecord(
      source,
    );

  const condition =
    primaryConditionFrom(
      source,
    );

  return (
    removeEngineLanguage(
      stringValue(
        record?.executiveSummary,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        record?.summary,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        judgment.executiveJudgment,
      ),
    ) ??
    removeEngineLanguage(
      condition?.summary,
    ) ??
    `${constraintTitleFrom(source)} is the organization's highest-leverage current constraint.`
  );
}

function whyNowFrom(
  source:
    ExecutiveCommunicationSource,
): string | undefined {
  const record =
    primaryConstraintRecord(
      source,
    );

  return (
    removeEngineLanguage(
      stringValue(
        record?.whyNow,
      ),
    ) ??
    removeEngineLanguage(
      primaryConditionFrom(source)
        ?.whyItMatters,
    )
  );
}

function whyItMattersFrom(
  source:
    ExecutiveCommunicationSource,
): string {
  const condition =
    primaryConditionFrom(
      source,
    );

  const state =
    asRecord(
      source.organizationalState,
    );

  return (
    removeEngineLanguage(
      condition?.whyItMatters,
    ) ??
    removeEngineLanguage(
      stringValue(
        state?.executiveImplication,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        state?.summary,
      ),
    ) ??
    `Addressing ${constraintTitleFrom(source)} is expected to improve connected organizational conditions and reduce downstream execution risk.`
  );
}

function supportingMechanismLabels(
  source:
    ExecutiveCommunicationSource,
): string[] {
  const assessment =
    asRecord(
      source.executiveAssessment,
    );

  const theoryValidation =
    asRecord(
      assessment
        ?.theoryValidation,
    );

  const validationMechanisms =
    recordArray(
      theoryValidation
        ?.supportingMechanisms,
    );

  const directMechanisms =
    recordArray(
      assessment
        ?.supportingMechanisms,
    );

  const mechanismLabels = [
    ...validationMechanisms,
    ...directMechanisms,
  ]
    .map(
      (record) =>
        stringValue(
          record.label,
        ) ??
        stringValue(
          record.name,
        ),
    )
    .filter(
      (
        label,
      ): label is string =>
        Boolean(label),
    );

  return unique(
    mechanismLabels,
  ).slice(0, 3);
}

function causalStoryFrom(
  source:
    ExecutiveCommunicationSource,
): string {
  const mechanisms =
    supportingMechanismLabels(
      source,
    );

  const condition =
    primaryConditionFrom(
      source,
    );

  const downstreamNames =
    source
      .organizationalConditions
      .filter(
        (candidate) =>
          condition
            ?.downstreamConditionIds
            ?.includes(
              candidate.id,
            ),
      )
      .map(
        (candidate) =>
          candidate.name,
      )
      .slice(0, 2);

  const cause =
    mechanisms.length > 0
      ? mechanisms.join(", ")
      : "The current operating pattern";

  const consequence =
    downstreamNames.length > 0
      ? downstreamNames.join(
          " and ",
        )
      : "execution quality and organizational capacity";

  const verb =
    mechanisms.length === 1
      ? "reinforces"
      : "reinforce";

  return normalizeWhitespace(
    `${cause} ${verb} ${constraintTitleFrom(source)}, increasing pressure on ${consequence}.`,
  );
}

function optimizationObjectiveFrom(
  source:
    ExecutiveCommunicationSource,
): ExecutiveStoryOptimizationObjective | undefined {
  const optimization =
    asRecord(
      source.executiveOptimization,
    );

  const recommendation =
    asRecord(
      source.executiveRecommendation,
    );

  const objective =
    asRecord(
      optimization
        ?.optimizationObjective,
    ) ??
    asRecord(
      recommendation
        ?.optimizationObjective,
    ) ??
    optimization;

  const summary =
    removeEngineLanguage(
      stringValue(
        objective?.summary,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        objective?.explanation,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        recommendation
          ?.optimizationObjective,
      ),
    );

  if (!summary) {
    return undefined;
  }

  return {
    id:
      stringValue(
        objective?.id,
      ) ??
      stringValue(
        recommendation
          ?.optimizationObjectiveId,
      ),

    summary,
  };
}

function rankedScenarioRecords(
  source:
    ExecutiveCommunicationSource,
): UnknownRecord[] {
  const simulation =
    asRecord(
      source.executiveSimulation,
    );

  const optimization =
    asRecord(
      source.executiveOptimization,
    );

  const candidates = [
    simulation
      ?.rankedScenarios,
    simulation
      ?.scenarioRankings,
    simulation
      ?.scenarios,
    optimization
      ?.rankedScenarios,
    optimization
      ?.scenarioRankings,
  ];

  for (const candidate of candidates) {
    const records =
      recordArray(candidate);

    if (records.length > 0) {
      return records;
    }
  }

  return [];
}

function recommendationRecord(
  source:
    ExecutiveCommunicationSource,
): UnknownRecord {
  return (
    asRecord(
      source.executiveRecommendation,
    ) ?? {}
  );
}

function recommendationInterventionRecord(
  source:
    ExecutiveCommunicationSource,
): UnknownRecord {
  const recommendation =
    recommendationRecord(source);

  return (
    asRecord(
      recommendation.intervention,
    ) ??
    asRecord(
      recommendation.recommendedStrategy,
    ) ??
    recommendation
  );
}

function recommendedIdFrom(
  source:
    ExecutiveCommunicationSource,
): string | undefined {
  const recommendation =
    recommendationRecord(source);

  const intervention =
    recommendationInterventionRecord(
      source,
    );

  return (
    stringValue(
      recommendation
        .recommendedInterventionId,
    ) ??
    stringValue(
      recommendation
        .recommendedOptionId,
    ) ??
    stringValue(
      intervention.id,
    )
  );
}

function recommendedTitleFrom(
  source:
    ExecutiveCommunicationSource,
): string {
  const recommendation =
    recommendationRecord(source);

  const intervention =
    recommendationInterventionRecord(
      source,
    );

  return (
    removeEngineLanguage(
      stringValue(
        recommendation.headline,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        intervention
          .executiveIntervention,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        intervention.title,
      ),
    ) ??
    "Address the primary executive constraint"
  );
}

function scenarioTitle(
  scenario: UnknownRecord,
): string {
  const option =
    asRecord(
      scenario.option,
    );

  const intervention =
    asRecord(
      scenario.intervention,
    );

  return (
    stringValue(
      scenario.title,
    ) ??
    stringValue(
      scenario.optionTitle,
    ) ??
    stringValue(
      scenario.interventionTitle,
    ) ??
    stringValue(
      option?.title,
    ) ??
    stringValue(
      intervention?.title,
    ) ??
    "Executive Strategy"
  );
}

function scenarioId(
  scenario: UnknownRecord,
): string | undefined {
  const option =
    asRecord(
      scenario.option,
    );

  const intervention =
    asRecord(
      scenario.intervention,
    );

  return (
    stringValue(
      scenario.optionId,
    ) ??
    stringValue(
      scenario.interventionId,
    ) ??
    stringValue(
      scenario.id,
    ) ??
    stringValue(
      option?.id,
    ) ??
    stringValue(
      intervention?.id,
    )
  );
}

function scenarioRank(
  scenario: UnknownRecord,
  index: number,
): number {
  return (
    numberValue(
      scenario.rank,
    ) ??
    numberValue(
      scenario.position,
    ) ??
    index + 1
  );
}

function scenarioRationale(
  scenario: UnknownRecord,
  rank: number,
): string {
  const reasons =
    stringArray(
      scenario.reasonsForRank,
    );

  return (
    firstSentence(
      reasons[0],
    ) ??
    removeEngineLanguage(
      stringValue(
        scenario.rationale,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        scenario.summary,
      ),
    ) ??
    (
      rank === 1
        ? "This strategy produced the strongest expected organizational improvement under the current constraints."
        : "This strategy remained viable but produced less expected organizational improvement than the selected option."
    )
  );
}

function strategiesFrom(
  source:
    ExecutiveCommunicationSource,
): ExecutiveStoryStrategy[] {
  const recommendedId =
    recommendedIdFrom(source);

  const recommendedTitle =
    recommendedTitleFrom(source);

  const rankedScenarios =
    rankedScenarioRecords(
      source,
    );

  const strategies =
    rankedScenarios.map(
      (
        scenario,
        index,
      ): ExecutiveStoryStrategy => {
        const id =
          scenarioId(
            scenario,
          );

        const title =
          scenarioTitle(
            scenario,
          );

        const rank =
          scenarioRank(
            scenario,
            index,
          );

        return {
          id,

          title,

          rank,

          selected:
            (
              Boolean(
                recommendedId &&
                id ===
                recommendedId,
              ) ||
              title
                .toLowerCase() ===
              recommendedTitle
                .toLowerCase()
            ),

          rationale:
            scenarioRationale(
              scenario,
              rank,
            ),
        };
      },
    );

  if (
    strategies.length === 0
  ) {
    return [
      {
        id:
          recommendedId,

        title:
          recommendedTitle,

        rank:
          1,

        selected:
          true,

        rationale:
          "This strategy most directly addresses the primary executive constraint.",
      },
    ];
  }

  const selectedExists =
    strategies.some(
      (strategy) =>
        strategy.selected,
    );

  if (!selectedExists) {
    const first =
      strategies[0];

    if (first) {
      first.selected = true;
    }
  }

  return [...strategies]
    .sort(
      (left, right) =>
        left.rank -
        right.rank ||
        left.title.localeCompare(
          right.title,
        ),
    )
    .slice(0, 5);
}

function recommendationRationaleFrom(
  source:
    ExecutiveCommunicationSource,
): string {
  const recommendation =
    recommendationRecord(source);

  const whyRecommended =
    stringArray(
      recommendation
        .whyRecommended,
    );

  return (
    firstSentence(
      stringValue(
        recommendation.rationale,
      ),
    ) ??
    firstSentence(
      whyRecommended[0],
    ) ??
    `${recommendedTitleFrom(source)} most directly addresses ${constraintTitleFrom(source)} under the current constraints.`
  );
}

function comparativeAdvantageFrom(
  source:
    ExecutiveCommunicationSource,

  strategies:
    ExecutiveStoryStrategy[],
): string | undefined {
  const recommendation =
    recommendationRecord(source);

  const whyRecommended =
    stringArray(
      recommendation
        .whyRecommended,
    );

  const explicit =
    whyRecommended.find(
      (reason) => {
        const normalized =
          reason.toLowerCase();

        return (
          normalized.includes(
            "alternative",
          ) ||
          normalized.includes(
            "higher",
          ) ||
          normalized.includes(
            "greatest",
          ) ||
          normalized.includes(
            "rank",
          ) ||
          normalized.includes(
            "outperform",
          )
        );
      },
    );

  if (explicit) {
    return firstSentence(
      explicit,
    );
  }

  const winner =
    strategies.find(
      (strategy) =>
        strategy.selected,
    );

  const runnerUp =
    strategies.find(
      (strategy) =>
        !strategy.selected,
    );

  if (
    winner &&
    runnerUp
  ) {
    return `${winner.title} ranked ahead of ${runnerUp.title} because it produced greater expected improvement against the primary constraint.`;
  }

  return undefined;
}

function recommendationActionsFrom(
  source:
    ExecutiveCommunicationSource,
): string[] {
  const intervention =
    recommendationInterventionRecord(
      source,
    );

  const primary =
    stringValue(
      intervention
        .executiveIntervention,
    );

  const supporting =
    stringArray(
      intervention
        .supportingActions,
    );

  return unique(
    [
      primary,
      ...supporting,
    ].filter(
      (
        value,
      ): value is string =>
        Boolean(value),
    ),
  ).slice(0, 3);
}

function expectedOutcomeFrom(
  source:
    ExecutiveCommunicationSource,
): string {
  const recommendation =
    recommendationRecord(source);

  const simulation =
    asRecord(
      source.executiveSimulation,
    );

  const expectedBenefits =
    stringArray(
      recommendation
        .expectedBenefits,
    );

  const recommendationOutcome =
    firstSentence(
      expectedBenefits[0],
    );

  if (recommendationOutcome) {
    return recommendationOutcome;
  }

  const simulationSummary =
    removeEngineLanguage(
      stringValue(
        simulation
          ?.executiveSummary,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        simulation
          ?.expectedOutcome,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        simulation
          ?.explanation,
      ),
    );

  if (simulationSummary) {
    return simulationSummary;
  }

  const constraint =
    primaryConstraintRecord(
      source,
    );

  return (
    removeEngineLanguage(
      stringValue(
        constraint
          ?.expectedExecutiveImpact,
      ),
    ) ??
    `The intervention is expected to reduce ${constraintTitleFrom(source)} and improve connected execution conditions.`
  );
}

function confidenceScoreFrom(
  source:
    ExecutiveCommunicationSource,
): number {
  const recommendation =
    recommendationRecord(source);

  const simulation =
    asRecord(
      source.executiveSimulation,
    );

  const assessment =
    asRecord(
      source.executiveAssessment,
    );

  return percentage(
    numberValue(
      recommendation
        .confidence,
    ) ??
    numberValue(
      simulation
        ?.confidence,
    ) ??
    numberValue(
      assessment
        ?.confidence,
    ),
  );
}

function confidenceLevel(
  score: number,
): ExecutiveStoryConfidence["level"] {
  if (score >= 75) {
    return "high";
  }

  if (score >= 50) {
    return "moderate";
  }

  return "low";
}

function uncertaintyLimitations(
  source:
    ExecutiveCommunicationSource,
): string[] {
  const uncertainty =
    asRecord(
      source.organizationalUncertainty,
    );

  const reflection =
    asRecord(
      source.predictionReflection,
    );

  return unique([
    ...stringArray(
      uncertainty
        ?.confidenceLimiters,
    ),

    ...stringArray(
      reflection
        ?.confidenceLimiters,
    ),
  ]).slice(0, 2);
}

function confidenceFrom(
  source:
    ExecutiveCommunicationSource,

  strategies:
    ExecutiveStoryStrategy[],
): ExecutiveStoryConfidence {
  const score =
    confidenceScoreFrom(source);

  const level =
    confidenceLevel(score);

  const strengths =
    unique([
      strategies.length > 1
        ? `${strategies.length} viable strategies were compared.`
        : "The recommendation addresses the primary constraint.",

      "The selected strategy remained viable under the stated executive constraints.",

      "The recommendation is anchored to the highest-leverage organizational condition.",
    ]).slice(0, 3);

  const limitations =
    uncertaintyLimitations(
      source,
    );

  const limitationSummary =
    limitations[0]
      ? ` Confidence is limited because ${limitations[0].replace(/\.$/, "").toLowerCase()}.`
      : "";

  return {
    score,

    level,

    summary:
      `${formatLabel(level)} confidence at ${score}%.${limitationSummary}`,

    strengths,

    limitations,
  };
}

function nextEvidenceFrom(
  source:
    ExecutiveCommunicationSource,
): ExecutiveStoryNextEvidence | undefined {
  const opportunity =
    recordArray(
      source
        .investigationOpportunities,
    )[0];

  if (!opportunity) {
    return undefined;
  }

  const question =
    stringValue(
      opportunity
        .suggestedExecutiveQuestion,
    ) ??
    stringValue(
      opportunity.question,
    ) ??
    stringValue(
      opportunity.topic,
    );

  if (!question) {
    return undefined;
  }

  return {
    question,

    expectedConfidenceGain:
      numberValue(
        opportunity
          .expectedConfidenceGain,
      ),

    affectedConditions:
      stringArray(
        opportunity
          .affectedConditions,
      ),
  };
}

function buildNarrative(params: {
  primaryConstraintTitle:
    string;

  whyItMatters:
    string;

  causalStory:
    string;

  strategies:
    ExecutiveStoryStrategy[];

  recommendationTitle:
    string;

  recommendationRationale:
    string;

  comparativeAdvantage?:
    string;

  expectedOutcome:
    string;

  confidence:
    ExecutiveStoryConfidence;

  nextEvidence?:
    ExecutiveStoryNextEvidence;
}): string {
  const alternatives =
    params.strategies
      .filter(
        (strategy) =>
          !strategy.selected,
      )
      .map(
        (strategy) =>
          strategy.title,
      );

  const comparisonSentence =
    alternatives.length > 0
      ? `Discovery compared ${params.strategies.length} viable strategies, including ${alternatives.join(" and ")}.`
      : undefined;

  const evidenceSentence =
    params.nextEvidence
      ? `The highest-value next evidence is: ${params.nextEvidence.question}${
          params.nextEvidence
            .expectedConfidenceGain !==
          undefined
            ? ` This could improve confidence by approximately ${Math.round(params.nextEvidence.expectedConfidenceGain)} percentage points.`
            : ""
        }`
      : undefined;

  const constraintSentence =
    /\bprimary(?:\s+executive)?\s+constraint\b/i.test(
      params.primaryConstraintTitle,
    )
      ? completeSentence(params.primaryConstraintTitle)
      : `${constraintLabel(params.primaryConstraintTitle)} is the primary executive constraint.`;

  const recommendationSentence =
    /[.!?]$/.test(params.recommendationTitle.trim())
      ? completeSentence(params.recommendationTitle)
      : `${params.recommendationTitle} is the recommended strategy.`;

  return unique([
    constraintSentence,

    params.whyItMatters,

    params.causalStory,

    comparisonSentence,

    recommendationSentence,

    params.comparativeAdvantage ??
      params.recommendationRationale,

    params.expectedOutcome,

    params.confidence.summary,

    evidenceSentence,
  ].filter(
    (
      value,
    ): value is string =>
      Boolean(value),
  )).join(" ");
}

export function buildExecutiveStory(
  source:
    ExecutiveCommunicationSource,
): ExecutiveStory {
  const primaryConstraintTitle =
    constraintTitleFrom(source);

  const whyItMatters =
    whyItMattersFrom(source);

  const causalStory =
    causalStoryFrom(source);

  const optimizationObjective =
    optimizationObjectiveFrom(
      source,
    );

  const strategies =
    strategiesFrom(source);

  const recommendationTitle =
    recommendedTitleFrom(source);

  const recommendationRationale =
    recommendationRationaleFrom(
      source,
    );

  const comparativeAdvantage =
    comparativeAdvantageFrom(
      source,
      strategies,
    );

  const expectedOutcome =
    expectedOutcomeFrom(source);

  const confidence =
    confidenceFrom(
      source,
      strategies,
    );

  const nextEvidence =
    nextEvidenceFrom(source);

  const primaryConstraint:
    ExecutiveStoryPrimaryConstraint = {
      id:
        constraintIdFrom(
          source,
        ),

      title:
        primaryConstraintTitle,

      summary:
        constraintSummaryFrom(
          source,
        ),

      whyNow:
        whyNowFrom(source),
    };

  const recommendation:
    ExecutiveStoryRecommendation = {
      id:
        recommendedIdFrom(
          source,
        ),

      title:
        recommendationTitle,

      rationale:
        recommendationRationale,

      comparativeAdvantage,

      actions:
        recommendationActionsFrom(
          source,
        ),
    };

  return {
    primaryConstraint,

    whyItMatters,

    causalStory,

    optimizationObjective,

    strategies,

    recommendation,

    expectedOutcome,

    confidence,

    nextEvidence,

    narrative:
      buildNarrative({
        primaryConstraintTitle,

        whyItMatters,

        causalStory,

        strategies,

        recommendationTitle,

        recommendationRationale,

        comparativeAdvantage,

        expectedOutcome,

        confidence,

        nextEvidence,
      }),
  };
}
