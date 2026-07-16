import type {
  V3Contradiction,
  V3Evidence,
} from "../../types";

import type {
  OrganizationalLearningProfile,
} from "../learning/computeOrganizationalLearningProfile";

import type {
  PredictionEvaluation,
} from "../predictions/evaluatePredictionOutcomes";

import type {
  InvestigationOpportunity,
} from "../investigation/buildInvestigationOpportunities";

import type {
  OrganizationalUncertainty,
  OrganizationalUncertaintyDriver,
  OrganizationalUncertaintyStatus,
} from "./organizationalUncertainty";

export type AssessOrganizationalUncertaintyInput = {
  organizationId: string;

  evidence:
    V3Evidence[];

  contradictions:
    V3Contradiction[];

  learningProfile?:
    OrganizationalLearningProfile;

  predictionEvaluations:
    PredictionEvaluation[];

  investigationOpportunities:
    InvestigationOpportunity[];

  assessedAt?: string;
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

function average(
  values: number[],
): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce(
    (sum, value) =>
      sum + value,
    0,
  ) / values.length;
}

function normalizePercentOrRatio(
  value:
    number | undefined,
): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return clamp01(
    value > 1
      ? value / 100
      : value,
  );
}

function uncertaintyStatus(
  overallUncertainty:
    number,
): OrganizationalUncertaintyStatus {
  if (
    overallUncertainty >=
    0.8
  ) {
    return "critical";
  }

  if (
    overallUncertainty >=
    0.6
  ) {
    return "high";
  }

  if (
    overallUncertainty >=
    0.35
  ) {
    return "moderate";
  }

  return "low";
}

function evidenceCompleteness(
  evidence:
    V3Evidence[],
): number {
  /**
   * Ten evidence objects currently represent full investigation support.
   * This explicit threshold matches the current stress benchmark and can
   * later be replaced by domain- and question-specific evidence coverage.
   */
  return clamp01(
    evidence.length / 10,
  );
}

function contradictionMetrics(
  evidence:
    V3Evidence[],

  contradictions:
    V3Contradiction[],
): {
  contradictionDensity: number;
  contradictionConfidence: number;
  evidenceAgreement: number;
} {
  const contradictionDensity =
    evidence.length === 0
      ? 0
      : clamp01(
          contradictions.length /
            evidence.length,
        );

  const contradictionConfidence =
    average(
      contradictions.map(
        (contradiction) =>
          clamp01(
            contradiction.confidence,
          ),
      ),
    );

  const severityPressure =
    average(
      contradictions.map(
        (contradiction) => {
          switch (
            contradiction.severity
          ) {
            case "strong":
              return 1;

            case "moderate":
              return 0.7;

            case "weak":
              return 0.4;

            default:
              return 0.5;
          }
        },
      ),
    );

  const contradictionPressure =
    clamp01(
      contradictionDensity *
        0.45 +
      contradictionConfidence *
        0.3 +
      severityPressure *
        0.25,
    );

  return {
    contradictionDensity,
    contradictionConfidence,
    evidenceAgreement:
      clamp01(
        1 -
          contradictionPressure,
      ),
  };
}

function learningCertainty(
  learningProfile:
    OrganizationalLearningProfile |
    undefined,
): number {
  if (!learningProfile) {
    return 0;
  }

  const maturity =
    average(
      [
        learningProfile
          .beliefStability,
        learningProfile
          .theoryStability,
        learningProfile
          .knowledgeRetention,
        learningProfile
          .contradictionResolution,
        learningProfile
          .conceptReuse,
        learningProfile
          .mechanismReuse,
        learningProfile
          .learningVelocityScore,
      ].map(
        normalizePercentOrRatio,
      ),
    );

  const investigationSupport =
    clamp01(
      learningProfile
        .investigationsObserved /
        3,
    );

  return clamp01(
    maturity * 0.8 +
    investigationSupport * 0.2,
  );
}

function predictionCertainty(
  evaluations:
    PredictionEvaluation[],
): number {
  if (
    evaluations.length ===
    0
  ) {
    return 0;
  }

  const usableScores =
    evaluations
      .map(
        (evaluation) => {
          const candidate =
            (
              evaluation as {
                accuracy?: number;
                confidenceAdjustment?: number;
              }
            );

          if (
            typeof candidate
              .accuracy ===
              "number"
          ) {
            return clamp01(
              candidate.accuracy,
            );
          }

          if (
            typeof candidate
              .confidenceAdjustment ===
              "number"
          ) {
            return clamp01(
              0.5 +
              candidate
                .confidenceAdjustment,
            );
          }

          return 0.5;
        },
      );

  return average(
    usableScores,
  );
}

function unresolvedQuestionCount(
  contradictions:
    V3Contradiction[],
): number {
  return contradictions.filter(
    (contradiction) =>
      Boolean(
        contradiction
          .unresolvedQuestion,
      ),
  ).length;
}

function competingExplanationCount(
  contradictions:
    V3Contradiction[],
): number {
  return contradictions.filter(
    (contradiction) =>
      (
        contradiction
          .opposingEvidenceIds
          ?.length ??
        0
      ) > 0,
  ).length;
}

function buildDrivers(params: {
  evidenceCompleteness: number;
  evidenceAgreement: number;
  contradictions: V3Contradiction[];
  learningCertainty: number;
  predictionCertainty: number;
  investigationOpportunities:
    InvestigationOpportunity[];
}): OrganizationalUncertaintyDriver[] {
  const drivers:
    OrganizationalUncertaintyDriver[] = [];

  if (
    params.evidenceCompleteness <
    0.6
  ) {
    drivers.push({
      type:
        "limited-evidence",

      description:
        "Available evidence is insufficient for a well-supported organizational assessment.",

      weight:
        1 -
        params.evidenceCompleteness,

      sourceObjectIds: [],
    });
  }

  if (
    params.evidenceAgreement <
    0.75
  ) {
    drivers.push({
      type:
        "contradictory-evidence",

      description:
        "Current evidence contains unresolved disagreement or mixed signals.",

      weight:
        1 -
        params.evidenceAgreement,

      sourceObjectIds:
        params.contradictions.map(
          (contradiction) =>
            contradiction.id,
        ),
    });
  }

  if (
    params.learningCertainty <
    0.5
  ) {
    drivers.push({
      type:
        "immature-learning",

      description:
        "The organization has not yet accumulated enough stable longitudinal learning.",

      weight:
        1 -
        params.learningCertainty,

      sourceObjectIds: [],
    });
  }

  if (
    params.predictionCertainty <
    0.5
  ) {
    drivers.push({
      type:
        "unvalidated-prediction",

      description:
        "Organizational predictions have limited validated outcome history.",

      weight:
        1 -
        params.predictionCertainty,

      sourceObjectIds: [],
    });
  }

  if (
    params.investigationOpportunities
      .length >
    0
  ) {
    drivers.push({
      type:
        "missing-evidence",

      description:
        "Additional investigation opportunities remain capable of materially improving organizational confidence.",

      weight:
        clamp01(
          params
            .investigationOpportunities
            .length /
            10,
        ),

      sourceObjectIds:
        params
          .investigationOpportunities
          .map(
            (opportunity) =>
              opportunity.id,
          ),
    });
  }

  return drivers;
}

export function assessOrganizationalUncertainty({
  organizationId,
  evidence,
  contradictions,
  learningProfile,
  predictionEvaluations,
  investigationOpportunities,
  assessedAt =
    new Date().toISOString(),
}: AssessOrganizationalUncertaintyInput):
  OrganizationalUncertainty {
  const evidenceCompletenessScore =
    evidenceCompleteness(
      evidence,
    );

  const {
    contradictionDensity,
    contradictionConfidence,
    evidenceAgreement,
  } =
    contradictionMetrics(
      evidence,
      contradictions,
    );

  const rawLearningCertaintyScore =
    learningCertainty(
      learningProfile,
    );

  const rawPredictionCertaintyScore =
    predictionCertainty(
      predictionEvaluations,
    );

  const unresolvedQuestions =
    unresolvedQuestionCount(
      contradictions,
    );

  const competingExplanations =
    competingExplanationCount(
      contradictions,
    );

  const ambiguityScore =
    clamp01(
      (
        1 -
        evidenceAgreement
      ) *
        0.55 +
      clamp01(
        unresolvedQuestions /
          5,
      ) *
        0.25 +
      clamp01(
        competingExplanations /
          5,
      ) *
        0.2,
    );

  /**
   * Evidence agreement limits the maximum certainty Discovery may assign.
   *
   * Additional evidence can improve completeness and longitudinal support,
   * but disputed evidence must cap downstream learning and prediction
   * certainty rather than being treated as equivalent to corroboration.
   */
  const epistemicCertaintyCeiling =
    clamp01(
      evidenceAgreement *
        0.85 +
      (
        1 -
        ambiguityScore
      ) *
        0.15,
    );

  const learningCertaintyScore =
    Math.min(
      rawLearningCertaintyScore,
      epistemicCertaintyCeiling,
    );

  const predictionCertaintyScore =
    Math.min(
      rawPredictionCertaintyScore,
      epistemicCertaintyCeiling,
    );

  const investigationUrgency =
    clamp01(
      (
        1 -
        evidenceCompletenessScore
      ) *
        0.3 +
      ambiguityScore *
        0.3 +
      (
        1 -
        learningCertaintyScore
      ) *
        0.2 +
      (
        1 -
        predictionCertaintyScore
      ) *
        0.1 +
      clamp01(
        investigationOpportunities
          .length /
          10,
      ) *
        0.1,
    );

  const compositeCertainty =
    clamp01(
      evidenceCompletenessScore *
        0.25 +
      evidenceAgreement *
        0.3 +
      learningCertaintyScore *
        0.2 +
      predictionCertaintyScore *
        0.1 +
      (
        1 -
        ambiguityScore
      ) *
        0.15,
    );

  const boundedCertainty =
    Math.min(
      compositeCertainty,
      epistemicCertaintyCeiling,
    );

  const overallUncertainty =
    clamp01(
      1 -
        boundedCertainty,
    );

  const drivers =
    buildDrivers({
      evidenceCompleteness:
        evidenceCompletenessScore,

      evidenceAgreement,

      contradictions,

      learningCertainty:
        learningCertaintyScore,

      predictionCertainty:
        predictionCertaintyScore,

      investigationOpportunities,
    });

  if (
    epistemicCertaintyCeiling <
    0.75
  ) {
    const ceilingLimiterExists =
      drivers.some(
        (driver) =>
          driver.type ===
            "contradictory-evidence" &&
          driver.description ===
            "Evidence disagreement limits the maximum certainty Discovery can assign to the current organizational assessment.",
      );

    if (!ceilingLimiterExists) {
      drivers.push({
        type:
          "contradictory-evidence",

        description:
          "Evidence disagreement limits the maximum certainty Discovery can assign to the current organizational assessment.",

        weight:
          1 -
          epistemicCertaintyCeiling,

        sourceObjectIds:
          contradictions.map(
            (contradiction) =>
              contradiction.id,
          ),
      });
    }
  }

  const recommendedEvidenceAreas =
    Array.from(
      new Set(
        [
          ...(
            learningProfile
              ?.recommendedEvidenceAreas ??
            []
          ),

          ...investigationOpportunities
            .flatMap(
              (opportunity) =>
                opportunity
                  .missingEvidence,
            ),
        ].filter(Boolean),
      ),
    );

  const confidenceLimiters =
    drivers.map(
      (driver) =>
        driver.description,
    );

  const status =
    uncertaintyStatus(
      overallUncertainty,
    );

  const summary =
    status === "low"
      ? "Discovery has relatively strong support for the current organizational assessment, with limited remaining uncertainty."
      : status ===
          "moderate"
        ? "Discovery has a usable organizational assessment, but material evidence, agreement, learning, or prediction uncertainty remains."
        : status ===
            "high"
          ? "Discovery should treat the current organizational assessment cautiously because several important uncertainty drivers remain unresolved."
          : "Discovery should not rely heavily on the current organizational assessment until major evidence and ambiguity gaps are resolved.";

  return {
    organizationId,

    evidenceCompleteness:
      evidenceCompletenessScore,

    evidenceAgreement,

    contradictionDensity,

    contradictionConfidence,

    ambiguityScore,

    learningCertainty:
      learningCertaintyScore,

    predictionCertainty:
      predictionCertaintyScore,

    investigationUrgency,

    unresolvedContradictionCount:
      contradictions.length,

    unresolvedQuestionCount:
      unresolvedQuestions,

    competingExplanationCount:
      competingExplanations,

    overallUncertainty,

    status,

    drivers,

    recommendedEvidenceAreas,

    confidenceLimiters,

    summary,

    assessedAt,
  };
}
