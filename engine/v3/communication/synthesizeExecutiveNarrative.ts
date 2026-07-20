import {
  buildExecutiveStory,
} from "./buildExecutiveStory";

import type {
  ExecutiveCommunicationSource,
} from "./executiveCommunicationSource";

import type {
  ExecutiveNarrative,
  ExecutiveNarrativeChange,
  ExecutiveNarrativeEvidenceSection,
  ExecutiveNarrativeSignal,
} from "./executiveNarrative";

/**
 * Temporary structural compatibility contract for callers that still supply
 * the legacy ExecutiveProjection shape.
 *
 * This contract intentionally lives in the engine and imports no component
 * types. It should be removed after Projection consumes ExecutiveCommunication.
 */
export type LegacyExecutiveCommunicationProjection = {
  currentUnderstanding?: {
    belief?: string;
    confidence?: number;
  };

  explanation?: {
    why?: string;
    nextMove?: string;
  };

  executiveAssessment?: {
    summary?: string;
    executiveNarrative?: string;
    confidence?: number;
    theoryValidation?: {
      supportingMechanisms?: Array<{
        label: string;
        rationale?: string;
      }>;
    };
  };

  organizationalState?: {
    status?: string;
    summary?: string;
    confidence?: number;
    executiveImplication?: string;
  };

  organizationalConditions?: Array<{
    id?: string;
    name: string;
    status: string;
    confidence: number;
    summary?: string;
    whyItMatters?: string;
    recommendedExecutiveAction?: string;
  }>;

  investigationOpportunities?: Array<{
    suggestedExecutiveQuestion: string;
    expectedConfidenceGain?: number;
  }>;

  organizationalLearningProfile?: {
    summary?: string;
    learningVelocity?: string;
    knowledgeRetention?: number;
    beliefStability?: number;
  };

  simulation?: {
    confidence?: number;
    timeHorizon?: string;
    explanation?: string;
    projectedPredictions?: string[];
  };
};

export type ExecutiveNarrativeSource =
  | ExecutiveCommunicationSource
  | LegacyExecutiveCommunicationProjection;

function isCanonicalSource(
  source: ExecutiveNarrativeSource,
): source is ExecutiveCommunicationSource {
  return (
    "executiveRecommendation" in source &&
    "organizationId" in source
  );
}

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
    .replace(/([a-z])([A-Z])/g, "$1 $2")
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
    .replace(/\s+/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .trim();

  return cleaned || undefined;
}

function asRecord(
  value: unknown,
): Record<string, unknown> | undefined {
  return (
    typeof value === "object" &&
    value !== null
  )
    ? value as Record<string, unknown>
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

function percentage(
  value: number | undefined,
): number {
  if (value === undefined) {
    return 50;
  }

  return value <= 1
    ? value * 100
    : value;
}

type ConditionView = {
  id?: string;
  name: string;
  status: string;
  confidence: number;
  summary?: string;
  whyItMatters?: string;
  recommendedExecutiveAction?: string;
};

function conditionsFrom(
  source: ExecutiveNarrativeSource,
): ConditionView[] {
  const conditions =
    source.organizationalConditions ?? [];

  return conditions.map(
    (condition) => {
      const record =
        asRecord(condition) ?? {};

      return {
        id:
          stringValue(record.id),

        name:
          stringValue(record.name) ??
          "Organizational Condition",

        status:
          stringValue(record.status) ??
          stringValue(record.trend) ??
          "stable",

        confidence:
          percentage(
            numberValue(record.confidence),
          ),

        summary:
          stringValue(record.summary) ??
          stringValue(record.description),

        whyItMatters:
          stringValue(record.whyItMatters) ??
          stringValue(record.executiveImplication),

        recommendedExecutiveAction:
          stringValue(
            record.recommendedExecutiveAction,
          ),
      };
    },
  );
}

function assessmentRecord(
  source: ExecutiveNarrativeSource,
): Record<string, unknown> {
  return (
    asRecord(
      source.executiveAssessment,
    ) ?? {}
  );
}

function stateRecord(
  source: ExecutiveNarrativeSource,
): Record<string, unknown> {
  return (
    asRecord(
      source.organizationalState,
    ) ?? {}
  );
}

function confidenceFrom(
  source: ExecutiveNarrativeSource,
): number {
  const assessment =
    assessmentRecord(source);

  const legacyCurrent =
    "currentUnderstanding" in source
      ? asRecord(
          source.currentUnderstanding,
        )
      : undefined;

  return percentage(
    numberValue(
      assessment.confidence,
    ) ??
    numberValue(
      legacyCurrent?.confidence,
    ),
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

function buildHeadline(
  source: ExecutiveNarrativeSource,
): string {
  const primaryCondition =
    conditionsFrom(source)[0];

  const name =
    primaryCondition?.name
      .toLowerCase() ?? "";

  if (
    name.includes("coordination") ||
    name.includes("decision flow")
  ) {
    return "Execution is slowing because cross-functional coordination and decision ownership remain unclear.";
  }

  if (name.includes("knowledge")) {
    return "Execution is becoming more dependent on individuals because critical knowledge is not being preserved or reused.";
  }

  if (name.includes("learning")) {
    return "Recurring problems are persisting because experience is not consistently becoming operating improvement.";
  }

  if (name.includes("strategic")) {
    return "Execution is fragmenting because teams are operating without sufficiently clear shared priorities.";
  }

  if (name.includes("execution capacity")) {
    return "Execution capacity is under pressure because the organization is carrying more work than its operating system can reliably support.";
  }

  const assessment =
    assessmentRecord(source);

  return (
    removeEngineLanguage(
      primaryCondition?.summary,
    ) ??
    removeEngineLanguage(
      stringValue(
        assessment.summary,
      ),
    ) ??
    (
      "currentUnderstanding" in source
        ? removeEngineLanguage(
            source.currentUnderstanding
              ?.belief,
          )
        : undefined
    ) ??
    "A material organizational constraint is limiting execution."
  );
}

function buildExecutiveSummary(
  source: ExecutiveNarrativeSource,
): string {
  const primaryCondition =
    conditionsFrom(source)[0];

  const name =
    primaryCondition?.name
      .toLowerCase() ?? "";

  if (name.includes("coordination")) {
    return "Teams are relying too heavily on informal handoffs, repeated escalation, and unclear ownership to coordinate important work.";
  }

  if (name.includes("decision")) {
    return "Routine operating decisions continue to depend on a small number of leaders or approval points, increasing delay and reducing execution throughput.";
  }

  if (name.includes("knowledge")) {
    return "Important context remains concentrated in people and one-off conversations, forcing teams to rediscover prior learning and repeat avoidable work.";
  }

  if (name.includes("learning")) {
    return "The organization is identifying recurring problems but is not reliably converting them into reusable process, policy, or operating improvements.";
  }

  const state =
    stateRecord(source);

  return (
    removeEngineLanguage(
      primaryCondition?.whyItMatters,
    ) ??
    removeEngineLanguage(
      stringValue(
        state.executiveImplication,
      ),
    ) ??
    removeEngineLanguage(
      stringValue(
        state.summary,
      ),
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

  if (normalized.includes("governance friction")) {
    return "Approval and governance requirements are creating avoidable operating delay.";
  }

  if (normalized.includes("decision latency")) {
    return "Important decisions are taking longer to resolve.";
  }

  if (normalized.includes("accountability gap")) {
    return "Ownership for cross-functional outcomes remains unclear.";
  }

  if (normalized.includes("coordination breakdown")) {
    return "Teams are repeatedly re-coordinating work instead of following reliable handoffs.";
  }

  if (normalized.includes("knowledge fragmentation")) {
    return "Critical context is distributed across people and disconnected sources.";
  }

  if (normalized.includes("institutional memory")) {
    return "Prior learning is not consistently available when teams make new decisions.";
  }

  if (normalized.includes("priority conflict")) {
    return "Competing priorities are diluting focus and execution capacity.";
  }

  return `${formatLabel(label)} is materially influencing the current organizational constraint.`;
}

function buildSignals(
  source: ExecutiveNarrativeSource,
): ExecutiveNarrativeSignal[] {
  const signals:
    ExecutiveNarrativeSignal[] = [];

  const assessment =
    assessmentRecord(source);

  const theoryValidation =
    asRecord(
      assessment.theoryValidation,
    );

  const mechanisms =
    Array.isArray(
      theoryValidation
        ?.supportingMechanisms,
    )
      ? theoryValidation
          .supportingMechanisms
      : [];

  for (
    const mechanism of
    mechanisms.slice(0, 3)
  ) {
    const record =
      asRecord(mechanism) ?? {};

    const label =
      stringValue(record.label) ??
      stringValue(record.name);

    if (!label) {
      continue;
    }

    signals.push({
      id:
        `mechanism-${label}`,

      statement:
        signalStatement(label),

      explanation:
        removeEngineLanguage(
          stringValue(record.rationale),
        ),
    });
  }

  if (signals.length < 3) {
    for (
      const condition of
      conditionsFrom(source)
        .slice(
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
            `condition-${condition.id ?? condition.name}`,

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

  if (normalizedName.includes("coordination")) {
    return worsening
      ? "Cross-functional work is becoming harder to coordinate."
      : "Cross-functional coordination is becoming more reliable.";
  }

  if (normalizedName.includes("knowledge")) {
    return worsening
      ? "Critical knowledge is becoming less reusable across teams."
      : "Organizational knowledge is becoming easier to preserve and reuse.";
  }

  if (normalizedName.includes("learning")) {
    return worsening
      ? "The organization is learning more slowly from repeated problems."
      : "Repeated experience is translating into improvement more reliably.";
  }

  if (normalizedName.includes("decision")) {
    return worsening
      ? "Decision delay and escalation pressure are increasing."
      : "Routine decisions are moving with less delay.";
  }

  if (normalizedName.includes("execution")) {
    return worsening
      ? "Available execution capacity is becoming more constrained."
      : "Execution capacity is becoming more reliable.";
  }

  return `${name} is ${formatStatus(status).toLowerCase()}.`;
}

function buildChanges(
  source: ExecutiveNarrativeSource,
): ExecutiveNarrativeChange[] {
  return conditionsFrom(source)
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
          `change-${index}-${condition.id ?? condition.name}`,

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

function firstPredictionStatement(
  source: ExecutiveNarrativeSource,
): string | undefined {
  if (isCanonicalSource(source)) {
    const prediction =
      source
        .organizationalPredictions
        ?.[0];

    const record =
      asRecord(prediction);

    return (
      stringValue(
        record?.statement,
      ) ??
      stringValue(
        record?.summary,
      )
    );
  }

  return source
    .simulation
    ?.projectedPredictions
    ?.[0];
}

function simulationRecord(
  source: ExecutiveNarrativeSource,
): Record<string, unknown> | undefined {
  return isCanonicalSource(source)
    ? asRecord(
        source.executiveSimulation,
      )
    : asRecord(
        source.simulation,
      );
}

function buildForecastHeadline(
  source: ExecutiveNarrativeSource,
): string {
  const cleanedPrediction =
    removeEngineLanguage(
      firstPredictionStatement(source),
    );

  if (cleanedPrediction) {
    return cleanedPrediction;
  }

  const primaryCondition =
    conditionsFrom(source)[0]
      ?.name.toLowerCase() ?? "";

  if (primaryCondition.includes("coordination")) {
    return "Execution capacity is likely to deteriorate if coordination and decision ownership remain unchanged.";
  }

  if (primaryCondition.includes("knowledge")) {
    return "Teams are likely to repeat prior work and become more dependent on individual knowledge holders.";
  }

  if (primaryCondition.includes("learning")) {
    return "Recurring operating problems are likely to persist without stronger learning loops.";
  }

  return "The current organizational constraint is likely to persist without intervention.";
}

function buildRecommendationHeadline(
  source: ExecutiveNarrativeSource,
): string {
  if (isCanonicalSource(source)) {
    return (
      removeEngineLanguage(
        source
          .executiveRecommendation
          .headline,
      ) ??
      source
        .executiveRecommendation
        .headline
    );
  }

  const primaryCondition =
    conditionsFrom(source)[0];

  return (
    removeEngineLanguage(
      primaryCondition
        ?.recommendedExecutiveAction,
    ) ??
    removeEngineLanguage(
      source.explanation
        ?.nextMove,
    ) ??
    "Address the highest-leverage organizational constraint before scaling additional work."
  );
}

function buildRecommendationActions(
  source: ExecutiveNarrativeSource,
): string[] {
  if (isCanonicalSource(source)) {
    return [
      source
        .executiveRecommendation
        .intervention
        .executiveIntervention,

      ...source
        .executiveRecommendation
        .intervention
        .supportingActions,
    ].filter(
      (value) =>
        value.trim().length > 0,
    );
  }

  const directAction =
    removeEngineLanguage(
      conditionsFrom(source)[0]
        ?.recommendedExecutiveAction,
    );

  return directAction
    ? [directAction]
    : [];
}

function recommendationRationale(
  source: ExecutiveNarrativeSource,
): string {
  return isCanonicalSource(source)
    ? source
        .executiveRecommendation
        .rationale
    : "This course of action targets the operating mechanisms most directly connected to the current constraint while avoiding unnecessary organizational expansion.";
}

function primaryInvestigation(
  source: ExecutiveNarrativeSource,
): {
  question?: string;
  expectedConfidenceGain?: number;
} {
  const opportunity =
    source
      .investigationOpportunities
      ?.[0];

  const record =
    asRecord(opportunity);

  return {
    question:
      stringValue(
        record?.suggestedExecutiveQuestion,
      ) ??
      stringValue(
        record?.question,
      ) ??
      stringValue(
        record?.topic,
      ),

    expectedConfidenceGain:
      numberValue(
        record?.expectedConfidenceGain,
      ),
  };
}

function learningRecord(
  source: ExecutiveNarrativeSource,
): Record<string, unknown> | undefined {
  return asRecord(
    source.organizationalLearningProfile,
  );
}

function buildEvidenceSections(
  source: ExecutiveNarrativeSource,
): ExecutiveNarrativeEvidenceSection[] {
  const conditions =
    conditionsFrom(source);

  const assessment =
    assessmentRecord(source);

  const state =
    stateRecord(source);

  const learning =
    learningRecord(source);

  const simulation =
    simulationRecord(source);

  const explanation =
    isCanonicalSource(source)
      ? asRecord(
          source.executiveExplanation,
        )
      : asRecord(
          source.explanation,
        );

  const forecast =
    buildForecastHeadline(source);

  return [
    {
      id:
        "judgment",

      title:
        "Why Discovery believes this",

      summary:
        removeEngineLanguage(
          stringValue(
            explanation?.why,
          ) ??
          stringValue(
            explanation?.assessmentNarrative,
          ),
        ) ??
        "The evidence supporting Discovery's current judgment.",

      content:
        removeEngineLanguage(
          stringValue(
            assessment.executiveNarrative,
          ) ??
          stringValue(
            assessment.summary,
          ),
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
          stringValue(
            state.summary,
          ),
        ) ??
        "Discovery's integrated view of the organization today.",

      content:
        removeEngineLanguage(
          stringValue(
            state.executiveImplication,
          ) ??
          stringValue(
            state.summary,
          ),
        ) ??
        "Discovery is still forming the current organizational state.",

      metrics:
        Object.keys(state).length > 0
          ? [
              {
                label:
                  "Status",

                value:
                  formatStatus(
                    stringValue(
                      state.status,
                    ) ??
                    "unknown",
                  ),
              },
              {
                label:
                  "Confidence",

                value:
                  `${percentage(numberValue(state.confidence))}%`,
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
                `${formatStatus(condition.status)} · ${Math.round(condition.confidence)}%`,
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
          stringValue(
            learning?.summary,
          ),
        ) ??
        "How Discovery's confidence and understanding are evolving.",

      content:
        removeEngineLanguage(
          stringValue(
            learning?.summary,
          ),
        ) ??
        "Longitudinal learning data is not yet available.",

      metrics:
        learning
          ? [
              {
                label:
                  "Learning velocity",

                value:
                  stringValue(
                    learning.learningVelocity,
                  ) ??
                  "Unknown",
              },
              {
                label:
                  "Knowledge retention",

                value:
                  `${percentage(numberValue(learning.knowledgeRetention))}%`,
              },
              {
                label:
                  "Belief stability",

                value:
                  `${percentage(numberValue(learning.beliefStability))}%`,
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
        forecast,

      content:
        removeEngineLanguage(
          stringValue(
            simulation?.explanation,
          ),
        ) ??
        forecast,

      metrics:
        simulation
          ? [
              {
                label:
                  "Confidence",

                value:
                  `${percentage(numberValue(simulation.confidence))}%`,
              },
              {
                label:
                  "Time horizon",

                value:
                  formatStatus(
                    stringValue(
                      simulation.timeHorizon,
                    ) ??
                    "near-term",
                  ),
              },
            ]
          : undefined,
    },
  ];
}

export function synthesizeExecutiveNarrative(
  source: ExecutiveNarrativeSource,
): ExecutiveNarrative {
  const simulation =
    simulationRecord(source);

  if (isCanonicalSource(source)) {
    const story =
      buildExecutiveStory(source);

    return {
      headline:
        story.primaryConstraint.summary,

      executiveSummary:
        story.narrative,

      confidence:
        story.confidence.score,

      why:
        buildSignals(source),

      changes:
        buildChanges(source),

      forecast: {
        headline:
          story.expectedOutcome,

        confidence:
          story.confidence.score,

        timeHorizon:
          stringValue(
            simulation?.timeHorizon,
          ),

        explanation:
          story.expectedOutcome,
      },

      recommendation: {
        headline:
          story.recommendation.title,

        actions:
          story.recommendation.actions,

        rationale:
          story.recommendation
            .comparativeAdvantage ??
          story.recommendation.rationale,

        recommendedInvestigation:
          story.nextEvidence
            ?.question,

        decisionHref:
          "/executive-decision",
      },

      evidenceSections:
        buildEvidenceSections(source),
    };
  }

  const investigation =
    primaryInvestigation(source);

  return {
    headline:
      buildHeadline(source),

    executiveSummary:
      buildExecutiveSummary(source),

    confidence:
      confidenceFrom(source),

    why:
      buildSignals(source),

    changes:
      buildChanges(source),

    forecast: {
      headline:
        buildForecastHeadline(source),

      confidence:
        percentage(
          numberValue(
            simulation?.confidence,
          ),
        ) ||
        confidenceFrom(source),

      timeHorizon:
        stringValue(
          simulation?.timeHorizon,
        ),

      explanation:
        "The forecast reflects the continuation of current organizational conditions if leadership does not materially change the operating pattern.",
    },

    recommendation: {
      headline:
        buildRecommendationHeadline(source),

      actions:
        buildRecommendationActions(source),

      rationale:
        recommendationRationale(source),

      recommendedInvestigation:
        investigation.question,

      decisionHref:
        "/executive-decision",
    },

    evidenceSections:
      buildEvidenceSections(source),
  };
}
