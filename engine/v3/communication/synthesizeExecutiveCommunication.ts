import {
  synthesizeExecutiveNarrative,
  type LegacyExecutiveCommunicationProjection,
} from "./synthesizeExecutiveNarrative";

import type {
  ExecutiveCommunication,
  ExecutiveCommunicationEvidenceSection,
  ExecutiveCommunicationForecast,
} from "./executiveCommunication";

import type {
  ExecutiveCommunicationSource,
} from "./executiveCommunicationSource";

export type SynthesizeExecutiveCommunicationInput =
  | {
      source:
        ExecutiveCommunicationSource;

      generatedAt?:
        string;
    }
  | {
      /**
       * Transitional compatibility input.
       *
       * Remove after all callers provide ExecutiveCommunicationSource.
       */
      projection:
        LegacyExecutiveCommunicationProjection;

      organizationId:
        string;

      generatedAt?:
        string;
    };

function normalizeTimeHorizon(
  value: string | undefined,
): ExecutiveCommunicationForecast["timeHorizon"] {
  switch (value) {
    case "immediate":
    case "near-term":
    case "medium-term":
    case "long-term":
      return value;

    default:
      return "near-term";
  }
}

function buildEvidenceSections(
  narrative: ReturnType<
    typeof synthesizeExecutiveNarrative
  >,
): ExecutiveCommunicationEvidenceSection[] {
  return narrative.evidenceSections.map(
    (section) => ({
      id:
        section.id === "future"
          ? "forecast"
          : section.id,

      title:
        section.title,

      summary:
        section.summary,

      content:
        section.content,

      metrics:
        section.metrics,
    }),
  );
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

function investigationFrom(
  value: unknown,
): {
  question?: string;
  expectedConfidenceGain?: number;
} {
  const record =
    asRecord(value);

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

function confidenceFraction(
  value: number,
): number {
  return value > 1
    ? value / 100
    : value;
}

/**
 * Canonical Executive Communication producer.
 *
 * This Operating System does not perform new organizational reasoning.
 * It synthesizes canonical cognition into language appropriate for
 * executive decision-making.
 *
 * Canonical callers must supply ExecutiveCommunicationSource.
 * The projection branch is a temporary compatibility adapter.
 */
export function synthesizeExecutiveCommunication(
  input:
    SynthesizeExecutiveCommunicationInput,
): ExecutiveCommunication {
  const canonical =
    "source" in input;

  const source =
    canonical
      ? input.source
      : input.projection;

  const organizationId =
    canonical
      ? input.source.organizationId
      : input.organizationId;

  const generatedAt =
    input.generatedAt ??
    (
      canonical
        ? input.source.generatedAt
        : undefined
    ) ??
    new Date().toISOString();

  const narrative =
    synthesizeExecutiveNarrative(
      source,
    );

  const primaryInvestigation =
    investigationFrom(
      source
        .investigationOpportunities
        ?.[0],
    );

  const canonicalRecommendation =
    canonical
      ? input.source
          .executiveRecommendation
      : undefined;

  return {
    id:
      `executive-communication-${organizationId}-${generatedAt}`,

    organizationId,

    headline:
      narrative.headline,

    executiveSummary:
      narrative.executiveSummary,

    confidence: {
      value:
        confidenceFraction(
          narrative.confidence,
        ),

      label:
        narrative.confidence >= 85
          ? "high"
          : narrative.confidence >= 70
            ? "moderate"
            : narrative.confidence >= 50
              ? "developing"
              : "low",

      limiters:
        source
          .investigationOpportunities
          ?.slice(0, 3)
          .map(
            (opportunity) =>
              investigationFrom(
                opportunity,
              ).question,
          )
          .filter(
            (
              value,
            ): value is string =>
              Boolean(value),
          ) ?? [],
    },

    supportingSignals:
      narrative.why.map(
        (signal) => ({
          id:
            signal.id,

          statement:
            signal.statement,

          implication:
            signal.explanation,

          supportingConditionIds:
            [],

          supportingBeliefIds:
            [],

          supportingMechanismIds:
            [],

          supportingTheoryIds:
            [],

          supportingEvidenceIds:
            [],
        }),
      ),

    meaningfulChanges:
      narrative.changes.map(
        (change) => ({
          entityId:
            change.id,

          label:
            change.label,

          direction:
            change.direction,

          statement:
            change.summary,

          confidence:
            confidenceFraction(
              narrative.confidence,
            ),
        }),
      ),

    forecast: {
      headline:
        narrative.forecast
          .headline,

      explanation:
        narrative.forecast
          .explanation ?? "",

      confidence:
        confidenceFraction(
          narrative.forecast
            .confidence,
        ),

      timeHorizon:
        normalizeTimeHorizon(
          narrative.forecast
            .timeHorizon,
        ),

      affectedConditionIds:
        canonical
          ? input.source
              .organizationalConditions
              .slice(0, 3)
              .map(
                (condition) =>
                  condition.id,
              )
          : [],

      falsifyingSignals:
        [],
    },

    recommendation: {
      headline:
        canonicalRecommendation
          ?.headline ??
        narrative
          .recommendation
          .headline,

      actions:
        canonicalRecommendation
          ? [
              canonicalRecommendation
                .intervention
                .executiveIntervention,

              ...canonicalRecommendation
                .intervention
                .supportingActions,
            ].filter(
              (value) =>
                value.trim().length >
                0,
            )
          : narrative
              .recommendation
              .actions,

      rationale:
        canonicalRecommendation
          ?.rationale ??
        narrative
          .recommendation
          .rationale ??
        "",

      tradeOffs:
        [],

      assumptions:
        [],

      evidenceThatCouldChangeRecommendation:
        primaryInvestigation
          .question
          ? [
              primaryInvestigation
                .question,
            ]
          : [],

      decisionHref:
        narrative
          .recommendation
          .decisionHref,
    },

    uncertainty:
      primaryInvestigation
        .question
        ? {
            question:
              primaryInvestigation
                .question,

            implication:
              "Resolving this question would determine whether the current organizational pattern is persistent or primarily situational.",

            recommendedInvestigation:
              primaryInvestigation
                .question,

            expectedConfidenceGain:
              primaryInvestigation
                .expectedConfidenceGain ===
                undefined
                ? undefined
                : confidenceFraction(
                    primaryInvestigation
                      .expectedConfidenceGain,
                  ),
          }
        : undefined,

    evidenceSections:
      buildEvidenceSections(
        narrative,
      ),

    generatedAt,
  };
}
