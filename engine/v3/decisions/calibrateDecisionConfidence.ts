import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

import type {
  OrganizationalUncertainty,
} from "../model/epistemic/organizationalUncertainty";

import type {
  RankedExecutiveScenario,
} from "./rankExecutiveScenarios";

import type {
  InterventionViabilityEvaluation,
} from "./evaluateInterventionViability";

export type DecisionConfidenceCalibration = {
  /**
   * Existing confidence implied by scenario quality and ranking.
   */
  recommendationQualityScore: number;

  /**
   * Canonical evidence completeness supplied by the Epistemic Operating
   * System.
   */
  evidenceConfidenceScore: number;

  /**
   * Canonical organizational uncertainty assessment consumed by the
   * Decision Operating System.
   */
  agreementAnalysis:
    OrganizationalUncertainty;

  /**
   * Canonical longitudinal certainty supplied by the Epistemic Operating
   * System.
   */
  learningConfidenceScore: number;

  /**
   * Confidence derived from the completeness of constraint evaluation.
   */
  constraintConfidenceScore: number;

  /**
   * Final calibrated confidence used by the executive recommendation.
   */
  calibratedConfidence: number;

  /**
   * Human-readable factors that reduce confidence.
   */
  confidenceLimiters: string[];
};

export type CalibrateDecisionConfidenceInput = {
  winner:
    RankedExecutiveScenario;

  runtime:
    OrganizationRuntime;

  viabilityEvaluations:
    InterventionViabilityEvaluation[];
};

type DecisionConfidenceMemory =
  OrganizationRuntime["memory"] & {
    organizationalUncertainty?:
      OrganizationalUncertainty;
  };

function clamp01(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, value),
  );
}

function constraintConfidence(
  evaluations:
    InterventionViabilityEvaluation[],
): number {
  const winnerEvaluation =
    evaluations.find(
      (evaluation) =>
        evaluation.status !==
        "disqualified",
    );

  if (!winnerEvaluation) {
    return 0;
  }

  const unresolvedCount =
    winnerEvaluation
      .unresolvedRequiredConstraints
      .length;

  const optionalIssueCount =
    winnerEvaluation
      .optionalIssues
      .length;

  return clamp01(
    1 -
      unresolvedCount * 0.2 -
      optionalIssueCount * 0.05,
  );
}

export function calibrateDecisionConfidence({
  winner,
  runtime,
  viabilityEvaluations,
}: CalibrateDecisionConfidenceInput):
  DecisionConfidenceCalibration {
  const memory =
    runtime.memory as
      DecisionConfidenceMemory;

  const organizationalUncertainty =
    memory.organizationalUncertainty;

  if (!organizationalUncertainty) {
    throw new Error(
      "Executive Decision Cycle requires Organizational Uncertainty to be present in runtime memory.",
    );
  }

  const recommendationQualityScore =
    clamp01(
      (
        winner.score +
        winner.confidenceScore
      ) / 2,
    );

  const evidenceConfidenceScore =
    clamp01(
      organizationalUncertainty
        .evidenceCompleteness,
    );

  const learningConfidenceScore =
    clamp01(
      organizationalUncertainty
        .learningCertainty,
    );

  const constraintConfidenceScore =
    constraintConfidence(
      viabilityEvaluations,
    );

  /**
   * The Decision Operating System performs no independent epistemic
   * reasoning here.
   *
   * Evidence completeness, evidence agreement, and learning certainty are
   * consumed directly from the canonical Organizational Uncertainty object.
   */
  const calibratedConfidence =
    clamp01(
      recommendationQualityScore *
        0.4 +
      evidenceConfidenceScore *
        0.2 +
      organizationalUncertainty
        .evidenceAgreement *
        0.2 +
      learningConfidenceScore *
        0.1 +
      constraintConfidenceScore *
        0.1,
    );

  const confidenceLimiters = [
    ...organizationalUncertainty
      .confidenceLimiters,
  ];

  if (
    constraintConfidenceScore <
    1
  ) {
    confidenceLimiters.push(
      "One or more executive constraints remain unresolved.",
    );
  }

  return {
    recommendationQualityScore,
    evidenceConfidenceScore,
    agreementAnalysis:
      organizationalUncertainty,
    learningConfidenceScore,
    constraintConfidenceScore,
    calibratedConfidence,
    confidenceLimiters:
      Array.from(
        new Set(
          confidenceLimiters,
        ),
      ),
  };
}
