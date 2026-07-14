import type {
  ExecutiveProjection,
} from "../../../components/executive-v2/projection/ExecutiveProjection";

import {
  synthesizeExecutiveNarrative,
} from "./synthesizeExecutiveNarrative";

import type {
  ExecutiveCommunication,
  ExecutiveCommunicationEvidenceSection,
  ExecutiveCommunicationForecast,
} from "./executiveCommunication";

export type SynthesizeExecutiveCommunicationInput = {
  projection: ExecutiveProjection;

  organizationId: string;

  generatedAt?: string;
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

/**
 * Canonical Executive Communication producer.
 *
 * This Operating System does not perform new organizational reasoning.
 * It synthesizes canonical cognition into language appropriate for
 * executive decision-making.
 */
export function synthesizeExecutiveCommunication({
  projection,
  organizationId,
  generatedAt = new Date().toISOString(),
}: SynthesizeExecutiveCommunicationInput): ExecutiveCommunication {
  const narrative =
    synthesizeExecutiveNarrative(
      projection,
    );

  const primaryInvestigation =
    projection
      .investigationOpportunities?.[0];

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
        narrative.confidence /
        100,

      label:
        narrative.confidence >= 85
          ? "high"
          : narrative.confidence >= 70
            ? "moderate"
            : narrative.confidence >= 50
              ? "developing"
              : "low",

      limiters:
        projection
          .investigationOpportunities
          ?.slice(0, 3)
          .map(
            (opportunity) =>
              opportunity
                .suggestedExecutiveQuestion,
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
            narrative.confidence /
            100,
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
        narrative.forecast
          .confidence /
        100,

      timeHorizon:
        normalizeTimeHorizon(
          narrative.forecast
            .timeHorizon,
        ),

      affectedConditionIds:
        [],

      falsifyingSignals:
        [],
    },

    recommendation: {
      headline:
        narrative
          .recommendation
          .headline,

      actions:
        narrative
          .recommendation
          .actions,

      rationale:
        narrative
          .recommendation
          .rationale ?? "",

      tradeOffs:
        [],

      assumptions:
        [],

      evidenceThatCouldChangeRecommendation:
        primaryInvestigation
          ? [
              primaryInvestigation
                .suggestedExecutiveQuestion,
            ]
          : [],

      decisionHref:
        narrative
          .recommendation
          .decisionHref,
    },

    uncertainty:
      primaryInvestigation
        ? {
            question:
              primaryInvestigation
                .suggestedExecutiveQuestion,

            implication:
              "Resolving this question would determine whether the current organizational pattern is persistent or primarily situational.",

            recommendedInvestigation:
              primaryInvestigation
                .suggestedExecutiveQuestion,

            expectedConfidenceGain:
              primaryInvestigation
                .expectedConfidenceGain /
              100,
          }
        : undefined,

    evidenceSections:
      buildEvidenceSections(
        narrative,
      ),

    generatedAt,
  };
}