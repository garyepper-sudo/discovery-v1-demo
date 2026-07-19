import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

import type {
  OrganizationalUncertainty,
} from "../model/epistemic/organizationalUncertainty";

import type {
  PersistentBelief,
} from "../understanding/types";

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
   * Small signed confidence adjustment derived from prior reviewed
   * outcomes involving the selected strategy.
   *
   * Range: -0.05 to 0.05.
   */
  longitudinalStrategyAdjustment: number;

  /**
   * Number of distinct prior Executive Learning outcomes that informed
   * the longitudinal strategy adjustment.
   */
  matchedExecutiveLearningCount: number;

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

type LongitudinalStrategyCalibration = {
  adjustment: number;
  matchedExecutiveLearningCount: number;
};

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  if (!Number.isFinite(value)) {
    return minimum;
  }

  return Math.max(
    minimum,
    Math.min(
      maximum,
      value,
    ),
  );
}

function clamp01(
  value: number,
): number {
  return clamp(
    value,
    0,
    1,
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

function isReviewDerivedBelief(
  belief: PersistentBelief,
): boolean {
  return (
    typeof belief.selectedOptionId ===
      "string" &&
    belief.selectedOptionId.trim().length >
      0 &&
    typeof belief.executiveOutcomeConfidenceAdjustment ===
      "number" &&
    Number.isFinite(
      belief.executiveOutcomeConfidenceAdjustment,
    )
  );
}

/**
 * Produces a deliberately conservative confidence adjustment from prior
 * reviewed outcomes involving the same selected strategy.
 *
 * Beliefs are grouped by Executive Learning ancestry so a learning event
 * that produced several knowledge statements does not receive additional
 * weight merely because it created several beliefs.
 */
function longitudinalStrategyCalibration(
  winner:
    RankedExecutiveScenario,
  runtime:
    OrganizationRuntime,
): LongitudinalStrategyCalibration {
  const selectedOptionId =
    winner.optionId?.trim();

  if (!selectedOptionId) {
    return {
      adjustment:
        0,

      matchedExecutiveLearningCount:
        0,
    };
  }

  const organizationalMemory =
    runtime.memory
      .organizationalMemory;

  if (!organizationalMemory) {
    return {
      adjustment:
        0,

      matchedExecutiveLearningCount:
        0,
    };
  }

  const matchingBeliefs =
    organizationalMemory
      .beliefs
      .filter(
        (
          belief,
        ): belief is PersistentBelief =>
          isReviewDerivedBelief(
            belief,
          ) &&
          belief.selectedOptionId ===
            selectedOptionId,
      );

  if (
    matchingBeliefs.length ===
    0
  ) {
    return {
      adjustment:
        0,

      matchedExecutiveLearningCount:
        0,
    };
  }

  const adjustmentByLearningEvent =
    new Map<
      string,
      number[]
    >();

  matchingBeliefs.forEach(
    (belief) => {
      const learningEventId =
        belief.executiveLearningId ??
        belief.decisionRecordId ??
        belief.id;

      const existingAdjustments =
        adjustmentByLearningEvent.get(
          learningEventId,
        ) ?? [];

      existingAdjustments.push(
        clamp(
          belief
            .executiveOutcomeConfidenceAdjustment ??
            0,
          -1,
          1,
        ),
      );

      adjustmentByLearningEvent.set(
        learningEventId,
        existingAdjustments,
      );
    },
  );

  const learningEventAdjustments =
    Array.from(
      adjustmentByLearningEvent
        .values(),
    ).map(
      (adjustments) =>
        adjustments.reduce(
          (
            total,
            adjustment,
          ) =>
            total +
            adjustment,
          0,
        ) /
        adjustments.length,
    );

  const averageOutcomeAdjustment =
    learningEventAdjustments.reduce(
      (
        total,
        adjustment,
      ) =>
        total +
        adjustment,
      0,
    ) /
    learningEventAdjustments.length;

  return {
    /**
     * A fully positive or fully negative prior outcome can move final
     * confidence by no more than five percentage points.
     */
    adjustment:
      clamp(
        averageOutcomeAdjustment *
          0.05,
        -0.05,
        0.05,
      ),

    matchedExecutiveLearningCount:
      learningEventAdjustments.length,
  };
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

  const longitudinalCalibration =
    longitudinalStrategyCalibration(
      winner,
      runtime,
    );

  /**
   * The Decision Operating System performs no independent epistemic
   * reasoning here.
   *
   * Evidence completeness, evidence agreement, and learning certainty are
   * consumed directly from the canonical Organizational Uncertainty object.
   *
   * Reviewed strategy outcomes are consumed from typed PersistentBelief
   * ancestry and may move final confidence by no more than five percentage
   * points.
   */
  const baseCalibratedConfidence =
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

  const calibratedConfidence =
    clamp01(
      baseCalibratedConfidence +
        longitudinalCalibration
          .adjustment,
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

  if (
    longitudinalCalibration
      .adjustment <
    0
  ) {
    confidenceLimiters.push(
      "Prior reviewed outcomes reduced confidence in the selected strategy.",
    );
  }

  return {
    recommendationQualityScore,

    evidenceConfidenceScore,

    agreementAnalysis:
      organizationalUncertainty,

    learningConfidenceScore,

    constraintConfidenceScore,

    longitudinalStrategyAdjustment:
      longitudinalCalibration
        .adjustment,

    matchedExecutiveLearningCount:
      longitudinalCalibration
        .matchedExecutiveLearningCount,

    calibratedConfidence,

    confidenceLimiters:
      Array.from(
        new Set(
          confidenceLimiters,
        ),
      ),
  };
}