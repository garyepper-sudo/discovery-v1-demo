import type {
  OrganizationalAssessment,
} from "./organizationalJudgment";

import type {
  OrganizationalUncertainty,
} from "../epistemic/organizationalUncertainty";

import type {
  InvestigationOpportunity,
} from "../investigation/buildInvestigationOpportunities";

import type {
  ExecutiveExplanation,
} from "./executiveExplanation";

export type BuildExecutiveExplanationInput = {
  executiveAssessment:
    OrganizationalAssessment;

  organizationalUncertainty:
    OrganizationalUncertainty;

  investigationOpportunities:
    InvestigationOpportunity[];

  generatedAt?: string;
};

function percent(
  value: number,
): number {
  return Math.round(
    Math.max(
      0,
      Math.min(1, value),
    ) *
      100,
  );
}

function buildConfidenceNarrative(
  uncertainty:
    OrganizationalUncertainty,
): string {
  const certaintyPercent =
    percent(
      1 -
        uncertainty
          .overallUncertainty,
    );

  return [
    `Discovery currently assigns approximately ${certaintyPercent}% certainty to the organizational assessment.`,
    uncertainty.summary,
  ]
    .filter(Boolean)
    .join(" ");
}

function buildUncertaintyNarrative(
  uncertainty:
    OrganizationalUncertainty,
): string {
  if (
    uncertainty
      .confidenceLimiters
      .length === 0
  ) {
    return "Discovery did not identify a material epistemic limitation in the current assessment.";
  }

  return [
    "Confidence is limited by:",
    uncertainty
      .confidenceLimiters
      .slice(0, 5)
      .join(" "),
  ].join(" ");
}

function buildInvestigationNarrative(
  opportunities:
    InvestigationOpportunity[],
): string {
  const highestValue =
    opportunities[0];

  if (!highestValue) {
    return "Discovery did not identify a sufficiently valuable next investigation.";
  }

  const affectedConditions =
    highestValue
      .affectedConditions
      .join(", ");

  return [
    `Discovery's highest-value next investigation is ${highestValue.topic}.`,
    `It is expected to improve confidence by approximately ${highestValue.expectedConfidenceGain}%.`,
    affectedConditions
      ? `It may reduce uncertainty across ${affectedConditions}.`
      : "",
    highestValue
      .suggestedExecutiveQuestion
      ? `Suggested executive question: ${highestValue.suggestedExecutiveQuestion}`
      : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Translates canonical cognition into reusable executive-facing explanation.
 *
 * This producer performs no independent organizational, epistemic, decision,
 * or simulation reasoning. It composes Executive Assessment, Organizational
 * Uncertainty, and refined Investigation Opportunities into a communication
 * object suitable for projection, executive UI, and board reporting.
 */
export function buildExecutiveExplanation({
  executiveAssessment,
  organizationalUncertainty,
  investigationOpportunities,
  generatedAt =
    new Date().toISOString(),
}: BuildExecutiveExplanationInput):
  ExecutiveExplanation {
  const confidenceNarrative =
    buildConfidenceNarrative(
      organizationalUncertainty,
    );

  const uncertaintyNarrative =
    buildUncertaintyNarrative(
      organizationalUncertainty,
    );

  const investigationNarrative =
    buildInvestigationNarrative(
      investigationOpportunities,
    );

  const executiveSummary = [
    executiveAssessment.summary,
    confidenceNarrative,
  ]
    .filter(Boolean)
    .join(" ");

  return {
    executiveSummary,

    assessmentNarrative:
      executiveAssessment
        .executiveNarrative,

    confidenceNarrative,

    uncertaintyNarrative,

    investigationNarrative,

    uncertaintyStatus:
      organizationalUncertainty
        .status,

    overallUncertainty:
      organizationalUncertainty
        .overallUncertainty,

    confidenceLimiters: [
      ...organizationalUncertainty
        .confidenceLimiters,
    ],

    uncertaintyDrivers: [
      ...organizationalUncertainty
        .drivers,
    ],

    recommendedEvidenceAreas: [
      ...organizationalUncertainty
        .recommendedEvidenceAreas,
    ],

    generatedAt,
  };
}