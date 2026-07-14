import type {
  ExecutiveProjection,
} from "../../executive-v2/projection/ExecutiveProjection";

import type {
  ExecutiveNarrative,
  ExecutiveNarrativeChange,
  ExecutiveNarrativeEvidenceSection,
  ExecutiveNarrativeSignal,
} from "../../../engine/v3/communication/executiveNarrative";

function firstSentence(
  value: string | undefined,
): string | undefined {
  const normalized =
    value?.trim();

  if (!normalized) {
    return undefined;
  }

  const match =
    normalized.match(
      /^.*?[.!?](?:\s|$)/,
    );

  return (
    match?.[0]?.trim() ??
    normalized
  );
}

function compactText(
  value: string | undefined,
): string | undefined {
  const sentence =
    firstSentence(value);

  if (!sentence) {
    return undefined;
  }

  return sentence
    .replace(
      /\bDiscovery (currently )?(sees|judges|believes|estimates) that\b/gi,
      "",
    )
    .replace(
      /\bThe current working theory is that\b/gi,
      "",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .trim();
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

function normalizeLabel(
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

function directionFromStatus(
  status: string,
): ExecutiveNarrativeChange["direction"] {
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
    normalized.includes("critical") ||
    normalized.includes("constrain")
  ) {
    return "worsening";
  }

  return "stable";
}

function buildExecutiveHeadline(
  projection:
    ExecutiveProjection,
): string {
  const primaryCondition =
    projection
      .organizationalConditions?.[0];

  const conditionName =
    primaryCondition?.name
      .toLowerCase();

  if (
    conditionName?.includes(
      "coordination",
    )
  ) {
    return (
      "Execution is slowing because cross-functional coordination and decision ownership remain unclear."
    );
  }

  if (
    conditionName?.includes(
      "decision",
    )
  ) {
    return (
      "Execution is slowing because important decisions remain too dependent on centralized approval."
    );
  }

  if (
    conditionName?.includes(
      "knowledge",
    )
  ) {
    return (
      "The organization is losing execution leverage because critical knowledge is not being preserved or reused."
    );
  }

  if (
    conditionName?.includes(
      "learning",
    )
  ) {
    return (
      "Recurring problems are persisting because the organization is not consistently converting experience into operating improvement."
    );
  }

  if (
    conditionName?.includes(
      "strategic",
    )
  ) {
    return (
      "Execution is fragmenting because teams are operating without sufficiently clear shared priorities."
    );
  }

  return (
    compactText(
      primaryCondition?.summary,
    ) ??
    compactText(
      projection
        .executiveAssessment
        ?.summary,
    ) ??
    compactText(
      projection
        .organizationalState
        ?.summary,
    ) ??
    compactText(
      projection
        .currentUnderstanding
        .belief,
    ) ??
    "Discovery is still forming its current executive judgment."
  );
}

function buildExecutiveSummary(
  projection:
    ExecutiveProjection,
): string {
  const primaryCondition =
    projection
      .organizationalConditions?.[0];

  return (
    compactText(
      primaryCondition
        ?.whyItMatters,
    ) ??
    compactText(
      projection
        .organizationalState
        ?.executiveImplication,
    ) ??
    compactText(
      projection
        .executiveAssessment
        ?.executiveNarrative,
    ) ??
    compactText(
      projection
        .explanation
        .why,
    ) ??
    "The current evidence suggests a meaningful organizational constraint that deserves executive attention."
  );
}

function buildSignals(
  projection:
    ExecutiveProjection,
): ExecutiveNarrativeSignal[] {
  const signals:
    ExecutiveNarrativeSignal[] =
    [];

  const mechanisms =
    projection
      .executiveAssessment
      ?.theoryValidation
      ?.supportingMechanisms ??
    [];

  for (
    const mechanism of
    mechanisms.slice(0, 3)
  ) {
    signals.push({
      id:
        `mechanism-${mechanism.label}`,

      statement:
        normalizeLabel(
          mechanism.label,
        ),

      explanation:
        compactText(
          mechanism.rationale,
        ),
    });
  }

  if (signals.length < 3) {
    const conditions =
      projection
        .organizationalConditions ??
      [];

    for (
      const condition of
      conditions.slice(
        0,
        3 - signals.length,
      )
    ) {
      signals.push({
        id:
          `condition-${condition.name}`,

        statement:
          compactText(
            condition.summary,
          ) ??
          `${condition.name} is ${condition.status}.`,

        explanation:
          compactText(
            condition.whyItMatters,
          ),
      });
    }
  }

  if (signals.length === 0) {
    const fallback =
      compactText(
        projection
          .explanation
          .why,
      );

    if (fallback) {
      signals.push({
        id:
          "current-explanation",

        statement:
          fallback,
      });
    }
  }

  return signals.slice(0, 3);
}

function buildChanges(
  projection:
    ExecutiveProjection,
): ExecutiveNarrativeChange[] {
  return (
    projection
      .organizationalConditions ??
    []
  )
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
          directionFromStatus(
            condition.status,
          ),

        summary:
          compactText(
            condition.summary,
          ) ??
          `${condition.name} is ${formatStatus(condition.status).toLowerCase()}.`,
      }),
    );
}

function buildRecommendationActions(
  projection:
    ExecutiveProjection,
): string[] {
  const actions: string[] =
    [];

  const primaryCondition =
    projection
      .organizationalConditions?.[0];

  const directAction =
    compactText(
      primaryCondition
        ?.recommendedExecutiveAction,
    );

  if (directAction) {
    actions.push(
      directAction,
    );
  }

  const focusItems =
    projection
      .executiveAssessment
      ?.recommendedFocus ??
    projection
      .organizationalState
      ?.recommendedFocus ??
    [];

  for (
    const focusItem of
    focusItems
  ) {
    const normalized =
      normalizeLabel(
        focusItem,
      );

    if (
      normalized &&
      !actions.some(
        (action) =>
          action
            .toLowerCase()
            .includes(
              normalized.toLowerCase(),
            ),
      )
    ) {
      actions.push(
        `Address ${normalized.toLowerCase()}.`,
      );
    }

    if (
      actions.length >= 3
    ) {
      break;
    }
  }

  if (actions.length === 0) {
    const fallback =
      compactText(
        projection
          .explanation
          .nextMove,
      );

    if (fallback) {
      actions.push(
        fallback,
      );
    }
  }

  return actions.slice(0, 3);
}

function buildEvidenceSections(
  projection:
    ExecutiveProjection,
): ExecutiveNarrativeEvidenceSection[] {
  const conditions =
    projection
      .organizationalConditions ??
    [];

  return [
    {
      id:
        "judgment",

      title:
        "Why Discovery believes this",

      summary:
        compactText(
          projection
            .explanation
            .why,
        ) ??
        "The evidence supporting Discovery's current executive judgment.",

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
        "organizational-state",

      title:
        "Current organizational state",

      summary:
        compactText(
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
        `${conditions.length} active organizational condition(s).`,

      content:
        conditions
          .map(
            (condition) =>
              `${condition.name}: ${condition.summary}`,
          )
          .join("\n\n") ||
        "No organizational conditions are currently available.",

      metrics:
        conditions
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
        compactText(
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
        compactText(
          projection
            .simulation
            ?.projectedPredictions?.[0],
        ) ??
        compactText(
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

export function buildExecutiveNarrative(
  projection:
    ExecutiveProjection,
): ExecutiveNarrative {
  const forecastHeadline =
    compactText(
      projection
        .simulation
        ?.projectedPredictions?.[0],
    ) ??
    compactText(
      projection
        .simulation
        ?.explanation,
    ) ??
    "The current organizational constraint is likely to persist without intervention.";

  const primaryRecommendation =
    compactText(
      projection
        .organizationalConditions?.[0]
        ?.recommendedExecutiveAction,
    ) ??
    compactText(
      projection
        .executiveAssessment
        ?.theoryValidation
        ?.executiveRecommendation,
    ) ??
    compactText(
      projection
        .explanation
        .nextMove,
    ) ??
    "Clarify ownership and reduce the operating friction around the highest-priority constraint.";

  return {
    headline:
      buildExecutiveHeadline(
        projection,
      ),

    executiveSummary:
      buildExecutiveSummary(
        projection,
      ),

    confidence:
      projection
        .currentUnderstanding
        .confidence,

    why:
      buildSignals(
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
        compactText(
          projection
            .simulation
            ?.explanation,
        ),
    },

    recommendation: {
      headline:
        primaryRecommendation,

      actions:
        buildRecommendationActions(
          projection,
        ),

      rationale:
        compactText(
          projection
            .executiveAssessment
            ?.theoryValidation
            ?.executiveRecommendation,
        ) ??
        compactText(
          projection
            .explanation
            .nextMove,
        ),

      recommendedInvestigation:
        projection
          .investigationOpportunities?.[0]
          ?.suggestedExecutiveQuestion,

      decisionHref:
        "/executive-decision",
    },

    evidenceSections:
      buildEvidenceSections(
        projection,
      ),
  };
}