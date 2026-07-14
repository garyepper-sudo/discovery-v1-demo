import type {
  ExecutiveProjection,
} from "../../executive-v2/projection/ExecutiveProjection";

import type {
  ExecutiveBriefingChange,
  ExecutiveBriefingChangeDirection,
  ExecutiveBriefingProjection,
  ExecutiveBriefingReason,
  ExecutiveBriefingReasoningSection,
} from "./ExecutiveBriefingProjection";

function firstSentence(
  value: string | undefined,
): string | undefined {
  const normalized = value?.trim();

  if (!normalized) {
    return undefined;
  }

  const match = normalized.match(
    /^.*?[.!?](?:\s|$)/,
  );

  return match?.[0]?.trim() ?? normalized;
}

function formatStatus(
  value: string,
): string {
  return value
    .replace(/-/g, " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function changeDirectionFromStatus(
  status: string,
): ExecutiveBriefingChangeDirection {
  const normalized =
    status.toLowerCase();

  if (
    normalized.includes("improv") ||
    normalized.includes("weakening")
  ) {
    return "improving";
  }

  if (
    normalized.includes("deterior") ||
    normalized.includes("strengthening") ||
    normalized.includes("critical")
  ) {
    return "worsening";
  }

  return "stable";
}

function buildConclusion(
  projection: ExecutiveProjection,
): string {
  return (
    firstSentence(
      projection
        .organizationalConditions?.[0]
        ?.summary,
    ) ??
    firstSentence(
      projection
        .organizationalState
        ?.summary,
    ) ??
    firstSentence(
      projection
        .executiveAssessment
        ?.summary,
    ) ??
    firstSentence(
      projection
        .currentUnderstanding
        .belief,
    ) ??
    "Discovery is still forming its executive judgment."
  );
}

function buildReasons(
  projection: ExecutiveProjection,
): ExecutiveBriefingReason[] {
  const reasons:
    ExecutiveBriefingReason[] = [];

  const mechanisms =
    projection
      .executiveAssessment
      ?.theoryValidation
      ?.supportingMechanisms ?? [];

  for (
    const mechanism of
    mechanisms.slice(0, 3)
  ) {
    reasons.push({
      id:
        `mechanism-${mechanism.label}`,

      label:
        mechanism.label,

      explanation:
        firstSentence(
          mechanism.rationale,
        ),
    });
  }

  if (reasons.length < 3) {
    const beliefs =
      projection
        .organizationalBeliefs ?? [];

    for (
      const belief of
      beliefs.slice(
        0,
        3 - reasons.length,
      )
    ) {
      reasons.push({
        id:
          `belief-${belief.statement}`,

        label:
          firstSentence(
            belief.statement,
          ) ?? belief.statement,

        explanation:
          belief.supportingMechanisms
            .length > 0
            ? `Supported by ${belief.supportingMechanisms.join(", ")}.`
            : undefined,
      });
    }
  }

  if (reasons.length === 0) {
    const explanation =
      firstSentence(
        projection
          .explanation
          .why,
      );

    if (explanation) {
      reasons.push({
        id:
          "current-explanation",

        label:
          explanation,
      });
    }
  }

  return reasons.slice(0, 3);
}

function buildChanges(
  projection: ExecutiveProjection,
): ExecutiveBriefingChange[] {
  const conditions =
    projection
      .organizationalConditions ?? [];

  return conditions
    .filter(
      (condition) =>
        condition.status
          .toLowerCase() !==
        "stable",
    )
    .slice(0, 3)
    .map(
      (condition, index) => ({
        id:
          `condition-${index}-${condition.name}`,

        label:
          condition.name,

        direction:
          changeDirectionFromStatus(
            condition.status,
          ),

        status:
          formatStatus(
            condition.status,
          ),
      }),
    );
}

function buildReasoningSections(
  projection: ExecutiveProjection,
): ExecutiveBriefingReasoningSection[] {
  return [
    {
      id:
        "belief",

      title:
        "Why Discovery believes this",

      summary:
        firstSentence(
          projection
            .explanation
            .why,
        ) ??
        "The evidence supporting Discovery's current judgment.",

      content:
        projection
          .executiveAssessment
          ?.executiveNarrative ??
        projection
          .explanation
          .why,
    },

    {
      id:
        "state",

      title:
        "Current organizational state",

      summary:
        firstSentence(
          projection
            .organizationalState
            ?.summary,
        ) ??
        "Discovery's integrated view of the organization today.",

      content:
        projection
          .organizationalState
          ?.executiveImplication ??
        projection
          .organizationalState
          ?.summary ??
        "Discovery is still forming the current organizational state.",

      metrics:
        projection
          .organizationalState
          ? [
              {
                label:
                  "Status",

                value:
                  formatStatus(
                    projection
                      .organizationalState
                      .status,
                  ),
              },
              {
                label:
                  "Confidence",

                value:
                  `${projection.organizationalState.confidence}%`,
              },
            ]
          : undefined,
    },

    {
      id:
        "conditions",

      title:
        "Conditions and change",

      summary:
        `${projection.organizationalConditions?.length ?? 0} active organizational condition(s).`,

      content:
        (
          projection
            .organizationalConditions ?? []
        )
          .map(
            (condition) =>
              `${condition.name}: ${condition.summary}`,
          )
          .join("\n\n") ||
        "No organizational conditions are currently available.",

      metrics:
        (
          projection
            .organizationalConditions ?? []
        )
          .slice(0, 4)
          .map(
            (condition) => ({
              label:
                condition.name,

              value:
                `${formatStatus(condition.status)} · ${condition.confidence}%`,
            }),
          ),
    },

    {
      id:
        "learning",

      title:
        "How Discovery is learning",

      summary:
        firstSentence(
          projection
            .organizationalLearningProfile
            ?.summary,
        ) ??
        "How Discovery's confidence and understanding are evolving.",

      content:
        projection
          .organizationalLearningProfile
          ?.summary ??
        "Longitudinal learning data is not yet available.",

      metrics:
        projection
          .organizationalLearningProfile
          ? [
              {
                label:
                  "Learning velocity",

                value:
                  projection
                    .organizationalLearningProfile
                    .learningVelocity,
              },
              {
                label:
                  "Knowledge retention",

                value:
                  `${projection.organizationalLearningProfile.knowledgeRetention}%`,
              },
              {
                label:
                  "Belief stability",

                value:
                  `${projection.organizationalLearningProfile.beliefStability}%`,
              },
            ]
          : undefined,
    },

    {
      id:
        "future",

      title:
        "Future outlook",

      summary:
        firstSentence(
          projection
            .simulation
            ?.projectedPredictions?.[0],
        ) ??
        firstSentence(
          projection
            .simulation
            ?.explanation,
        ) ??
        "Discovery is still forming its future outlook.",

      content:
        projection
          .simulation
          ?.explanation ??
        "No current simulation is available.",

      metrics:
        projection.simulation
          ? [
              {
                label:
                  "Confidence",

                value:
                  `${projection.simulation.confidence}%`,
              },
              {
                label:
                  "Time horizon",

                value:
                  formatStatus(
                    projection
                      .simulation
                      .timeHorizon,
                  ),
              },
            ]
          : undefined,
    },
  ];
}

export function buildExecutiveBriefingProjection(
  projection: ExecutiveProjection,
): ExecutiveBriefingProjection {
  const forecastHeadline =
    firstSentence(
      projection
        .simulation
        ?.projectedPredictions?.[0],
    ) ??
    firstSentence(
      projection
        .simulation
        ?.explanation,
    ) ??
    "Discovery is still forming its future outlook.";

  const recommendationHeadline =
    firstSentence(
      projection
        .organizationalConditions?.[0]
        ?.recommendedExecutiveAction,
    ) ??
    firstSentence(
      projection
        .executiveAssessment
        ?.theoryValidation
        ?.executiveRecommendation,
    ) ??
    firstSentence(
      projection
        .explanation
        .nextMove,
    ) ??
    "Continue gathering evidence before taking material action.";

  const recommendedInvestigation =
    projection
      .investigationOpportunities?.[0]
      ?.suggestedExecutiveQuestion;

  return {
    conclusion:
      buildConclusion(
        projection,
      ),

    confidence:
      projection
        .currentUnderstanding
        .confidence,

    reasons:
      buildReasons(
        projection,
      ),

    changes:
      buildChanges(
        projection,
      ),

    forecast: {
      headline:
        forecastHeadline,

      confidence:
        projection
          .simulation
          ?.confidence ??
        projection
          .currentUnderstanding
          .confidence,

      timeHorizon:
        projection
          .simulation
          ?.timeHorizon,

      explanation:
        firstSentence(
          projection
            .simulation
            ?.explanation,
        ),
    },

    recommendation: {
      headline:
        recommendationHeadline,

      explanation:
        firstSentence(
          projection
            .executiveAssessment
            ?.theoryValidation
            ?.executiveRecommendation,
        ) ??
        firstSentence(
          projection
            .explanation
            .nextMove,
        ),

      recommendedInvestigation,

      decisionHref:
        "/executive-decision",
    },

    reasoningSections:
      buildReasoningSections(
        projection,
      ),
  };
}