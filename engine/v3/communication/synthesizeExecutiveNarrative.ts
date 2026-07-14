import type {
  ExecutiveProjection,
} from "../../../components/executive-v2/projection/ExecutiveProjection";

import type {
  ExecutiveNarrative,
  ExecutiveNarrativeChange,
  ExecutiveNarrativeEvidenceSection,
  ExecutiveNarrativeSignal,
} from "./executiveNarrative";

function firstSentence(
  value: string | undefined,
): string | undefined {
  const normalized = value
    ?.replace(/\s+/g, " ")
    .trim();

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

function formatLabel(
  value: string,
): string {
  return value
    .replace(
      /([a-z])([A-Z])/g,
      "$1 $2",
    )
    .replace(/[_:-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function formatStatus(
  value: string,
): string {
  return formatLabel(value);
}

/**
 * Removes phrases that describe Discovery's internal reasoning machinery
 * rather than the organization itself.
 */
function removeEngineLanguage(
  value: string | undefined,
): string | undefined {
  const sentence =
    firstSentence(value);

  if (!sentence) {
    return undefined;
  }

  const cleaned = sentence
    .replace(
      /\bDiscovery (currently )?(believes|judges|sees|estimates|assigns|formed|selected)\b/gi,
      "",
    )
    .replace(
      /\bThe current working theory is that\b/gi,
      "",
    )
    .replace(
      /\bis supported by \d+ (phenomenon|phenomena),? \d+ explanations?,? \d+ reasoning paths?,? and \d+ capability signals?\.?/gi,
      "",
    )
    .replace(
      /\bwith \d+% confidence and \d+% condition strength\.?/gi,
      "",
    )
    .replace(
      /\bthrough \d+ causal relationships?\.?/gi,
      "",
    )
    .replace(
      /\bthe propagated effects were applied to the projected organizational conditions\.?/gi,
      "",
    )
    .replace(
      /\s+/g,
      " ",
    )
    .replace(
      /\s+([,.!?])/g,
      "$1",
    )
    .trim();

  return cleaned || undefined;
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

function buildHeadline(
  projection: ExecutiveProjection,
): string {
  const primaryCondition =
    projection
      .organizationalConditions?.[0];

  const name =
    primaryCondition?.name
      .toLowerCase() ?? "";

  if (
    name.includes("coordination") ||
    name.includes("decision flow")
  ) {
    return "Execution is slowing because cross-functional coordination and decision ownership remain unclear.";
  }

  if (
    name.includes("knowledge")
  ) {
    return "Execution is becoming more dependent on individuals because critical knowledge is not being preserved or reused.";
  }

  if (
    name.includes("learning")
  ) {
    return "Recurring problems are persisting because experience is not consistently becoming operating improvement.";
  }

  if (
    name.includes("strategic")
  ) {
    return "Execution is fragmenting because teams are operating without sufficiently clear shared priorities.";
  }

  if (
    name.includes("execution capacity")
  ) {
    return "Execution capacity is under pressure because the organization is carrying more work than its operating system can reliably support.";
  }

  return (
    removeEngineLanguage(
      primaryCondition?.summary,
    ) ??
    removeEngineLanguage(
      projection
        .executiveAssessment
        ?.summary,
    ) ??
    removeEngineLanguage(
      projection
        .currentUnderstanding
        .belief,
    ) ??
    "A material organizational constraint is limiting execution."
  );
}

function buildExecutiveSummary(
  projection: ExecutiveProjection,
): string {
  const primaryCondition =
    projection
      .organizationalConditions?.[0];

  const name =
    primaryCondition?.name
      .toLowerCase() ?? "";

  if (
    name.includes("coordination")
  ) {
    return "Teams are relying too heavily on informal handoffs, repeated escalation, and unclear ownership to coordinate important work.";
  }

  if (
    name.includes("decision")
  ) {
    return "Routine operating decisions continue to depend on a small number of leaders or approval points, increasing delay and reducing execution throughput.";
  }

  if (
    name.includes("knowledge")
  ) {
    return "Important context remains concentrated in people and one-off conversations, forcing teams to rediscover prior learning and repeat avoidable work.";
  }

  if (
    name.includes("learning")
  ) {
    return "The organization is identifying recurring problems but is not reliably converting them into reusable process, policy, or operating improvements.";
  }

  return (
    removeEngineLanguage(
      primaryCondition
        ?.whyItMatters,
    ) ??
    removeEngineLanguage(
      projection
        .organizationalState
        ?.executiveImplication,
    ) ??
    "The current pattern has broad organizational leverage and deserves executive attention."
  );
}

function signalStatement(
  label: string,
): string {
  const normalized =
    formatLabel(label)
      .toLowerCase();

  if (
    normalized.includes(
      "governance friction",
    )
  ) {
    return "Approval and governance requirements are creating avoidable operating delay.";
  }

  if (
    normalized.includes(
      "decision latency",
    )
  ) {
    return "Important decisions are taking longer to resolve.";
  }

  if (
    normalized.includes(
      "accountability gap",
    )
  ) {
    return "Ownership for cross-functional outcomes remains unclear.";
  }

  if (
    normalized.includes(
      "coordination breakdown",
    )
  ) {
    return "Teams are repeatedly re-coordinating work instead of following reliable handoffs.";
  }

  if (
    normalized.includes(
      "knowledge fragmentation",
    )
  ) {
    return "Critical context is distributed across people and disconnected sources.";
  }

  if (
    normalized.includes(
      "institutional memory",
    )
  ) {
    return "Prior learning is not consistently available when teams make new decisions.";
  }

  if (
    normalized.includes(
      "priority conflict",
    )
  ) {
    return "Competing priorities are diluting focus and execution capacity.";
  }

  return `${formatLabel(label)} is materially influencing the current organizational constraint.`;
}

function buildSignals(
  projection: ExecutiveProjection,
): ExecutiveNarrativeSignal[] {
  const signals:
    ExecutiveNarrativeSignal[] = [];

  const mechanisms =
    projection
      .executiveAssessment
      ?.theoryValidation
      ?.supportingMechanisms ?? [];

  for (
    const mechanism of
    mechanisms.slice(0, 3)
  ) {
    signals.push({
      id:
        `mechanism-${mechanism.label}`,

      statement:
        signalStatement(
          mechanism.label,
        ),

      explanation:
        removeEngineLanguage(
          mechanism.rationale,
        ),
    });
  }

  if (signals.length < 3) {
    const conditions =
      projection
        .organizationalConditions ?? [];

    for (
      const condition of
      conditions.slice(
        0,
        3 - signals.length,
      )
    ) {
      const statement =
        removeEngineLanguage(
          condition.summary,
        );

      if (statement) {
        signals.push({
          id:
            `condition-${condition.name}`,

          statement,

          explanation:
            removeEngineLanguage(
              condition.whyItMatters,
            ),
        });
      }
    }
  }

  return signals.slice(0, 3);
}

function changeSummary(
  name: string,
  status: string,
): string {
  const normalizedName =
    name.toLowerCase();

  const worsening =
    directionFromStatus(status) ===
    "worsening";

  if (
    normalizedName.includes(
      "coordination",
    )
  ) {
    return worsening
      ? "Cross-functional work is becoming harder to coordinate."
      : "Cross-functional coordination is becoming more reliable.";
  }

  if (
    normalizedName.includes(
      "knowledge",
    )
  ) {
    return worsening
      ? "Critical knowledge is becoming less reusable across teams."
      : "Organizational knowledge is becoming easier to preserve and reuse.";
  }

  if (
    normalizedName.includes(
      "learning",
    )
  ) {
    return worsening
      ? "The organization is learning more slowly from repeated problems."
      : "Repeated experience is translating into improvement more reliably.";
  }

  if (
    normalizedName.includes(
      "decision",
    )
  ) {
    return worsening
      ? "Decision delay and escalation pressure are increasing."
      : "Routine decisions are moving with less delay.";
  }

  if (
    normalizedName.includes(
      "execution",
    )
  ) {
    return worsening
      ? "Available execution capacity is becoming more constrained."
      : "Execution capacity is becoming more reliable.";
  }

  return `${name} is ${formatStatus(status).toLowerCase()}.`;
}

function buildChanges(
  projection: ExecutiveProjection,
): ExecutiveNarrativeChange[] {
  return (
    projection
      .organizationalConditions ?? []
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
          `change-${index}-${condition.name}`,

        label:
          condition.name,

        direction:
          directionFromStatus(
            condition.status,
          ),

        summary:
          changeSummary(
            condition.name,
            condition.status,
          ),
      }),
    );
}

function buildForecastHeadline(
  projection: ExecutiveProjection,
): string {
  const prediction =
    projection
      .simulation
      ?.projectedPredictions?.[0];

  const cleanedPrediction =
    removeEngineLanguage(
      prediction,
    );

  if (cleanedPrediction) {
    return cleanedPrediction;
  }

  const primaryCondition =
    projection
      .organizationalConditions?.[0]
      ?.name.toLowerCase() ?? "";

  if (
    primaryCondition.includes(
      "coordination",
    )
  ) {
    return "Execution capacity is likely to deteriorate if coordination and decision ownership remain unchanged.";
  }

  if (
    primaryCondition.includes(
      "knowledge",
    )
  ) {
    return "Teams are likely to repeat prior work and become more dependent on individual knowledge holders.";
  }

  if (
    primaryCondition.includes(
      "learning",
    )
  ) {
    return "Recurring operating problems are likely to persist without stronger learning loops.";
  }

  return "The current organizational constraint is likely to persist without intervention.";
}

function buildRecommendationHeadline(
  projection: ExecutiveProjection,
): string {
  const primaryCondition =
    projection
      .organizationalConditions?.[0];

  const name =
    primaryCondition?.name
      .toLowerCase() ?? "";

  if (
    name.includes("coordination") ||
    name.includes("decision")
  ) {
    return "Clarify decision ownership and standardize cross-functional handoffs.";
  }

  if (
    name.includes("knowledge")
  ) {
    return "Create a repeatable system for preserving and transferring critical operating knowledge.";
  }

  if (
    name.includes("learning")
  ) {
    return "Turn recurring operating failures into explicit process and policy improvements.";
  }

  if (
    name.includes("strategic")
  ) {
    return "Reduce competing priorities and establish a smaller set of shared operating outcomes.";
  }

  return (
    removeEngineLanguage(
      primaryCondition
        ?.recommendedExecutiveAction,
    ) ??
    removeEngineLanguage(
      projection
        .explanation
        .nextMove,
    ) ??
    "Address the highest-leverage organizational constraint before scaling additional work."
  );
}

function buildRecommendationActions(
  projection: ExecutiveProjection,
): string[] {
  const primaryCondition =
    projection
      .organizationalConditions?.[0];

  const name =
    primaryCondition?.name
      .toLowerCase() ?? "";

  if (
    name.includes("coordination") ||
    name.includes("decision")
  ) {
    return [
      "Define clear owners for recurring cross-functional decisions.",
      "Remove approval steps that do not materially reduce risk.",
      "Standardize handoffs between the teams responsible for shared outcomes.",
    ];
  }

  if (
    name.includes("knowledge")
  ) {
    return [
      "Identify the knowledge most vulnerable to individual dependency.",
      "Create reusable operating records for important decisions and handoffs.",
      "Make knowledge transfer part of normal delivery rather than a separate activity.",
    ];
  }

  if (
    name.includes("learning")
  ) {
    return [
      "Select the recurring problems with the greatest operating cost.",
      "Assign owners to convert lessons into process changes.",
      "Track whether those changes prevent the problem from returning.",
    ];
  }

  const directAction =
    removeEngineLanguage(
      primaryCondition
        ?.recommendedExecutiveAction,
    );

  return directAction
    ? [directAction]
    : [];
}

function buildEvidenceSections(
  projection: ExecutiveProjection,
): ExecutiveNarrativeEvidenceSection[] {
  const conditions =
    projection
      .organizationalConditions ?? [];

  return [
    {
      id:
        "judgment",

      title:
        "Why Discovery believes this",

      summary:
        removeEngineLanguage(
          projection
            .explanation
            .why,
        ) ??
        "The evidence supporting Discovery's current judgment.",

      content:
        removeEngineLanguage(
          projection
            .executiveAssessment
            ?.executiveNarrative,
        ) ??
        removeEngineLanguage(
          projection
            .explanation
            .why,
        ) ??
        "The current organizational evidence supports Discovery's executive judgment.",
    },

    {
      id:
        "organizational-state",

      title:
        "Current organizational state",

      summary:
        removeEngineLanguage(
          projection
            .organizationalState
            ?.summary,
        ) ??
        "Discovery's integrated view of the organization today.",

      content:
        removeEngineLanguage(
          projection
            .organizationalState
            ?.executiveImplication,
        ) ??
        removeEngineLanguage(
          projection
            .organizationalState
            ?.summary,
        ) ??
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
              `${condition.name}: ${
                removeEngineLanguage(
                  condition.summary,
                ) ??
                changeSummary(
                  condition.name,
                  condition.status,
                )
              }`,
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
        removeEngineLanguage(
          projection
            .organizationalLearningProfile
            ?.summary,
        ) ??
        "How Discovery's confidence and understanding are evolving.",

      content:
        removeEngineLanguage(
          projection
            .organizationalLearningProfile
            ?.summary,
        ) ??
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
        buildForecastHeadline(
          projection,
        ),

      content:
        removeEngineLanguage(
          projection
            .simulation
            ?.explanation,
        ) ??
        buildForecastHeadline(
          projection,
        ),

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

export function synthesizeExecutiveNarrative(
  projection: ExecutiveProjection,
): ExecutiveNarrative {
  return {
    headline:
      buildHeadline(
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
        buildForecastHeadline(
          projection,
        ),

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
        "The forecast reflects the continuation of current organizational conditions if leadership does not materially change the operating pattern.",
    },

    recommendation: {
      headline:
        buildRecommendationHeadline(
          projection,
        ),

      actions:
        buildRecommendationActions(
          projection,
        ),

      rationale:
        "This course of action targets the operating mechanisms most directly connected to the current constraint while avoiding unnecessary organizational expansion.",

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
