import type { OrganizationalCondition } from "../state/inferOrganizationalConditions";
import type {
  OrganizationalPrediction,
  OrganizationalPredictionConditionChange,
} from "./organizationalPrediction";

export type PredictionConditionComparisonStatus =
  | "confirmed"
  | "partially-confirmed"
  | "contradicted"
  | "unresolved";

export type PredictionConditionComparison = {
  conditionId: string;

  predictedDirection:
    OrganizationalPredictionConditionChange["direction"];

  predictedStatus?:
    OrganizationalPredictionConditionChange["predictedStatus"];

  observedStatus?:
    OrganizationalCondition["status"];

  observedTrend?:
    OrganizationalCondition["trend"];

  comparisonStatus:
    PredictionConditionComparisonStatus;

  score: number;

  explanation: string;
};

export type PredictionOutcomeComparisonStatus =
  | "confirmed"
  | "partially-confirmed"
  | "not-confirmed"
  | "inconclusive";

export type PredictionOutcomeComparison = {
  predictionId: string;
  comparedAt: string;

  outcomeStatus:
    PredictionOutcomeComparisonStatus;

  accuracyScore: number;

  matchedConditionChangeCount: number;
  partiallyMatchedConditionChangeCount: number;
  contradictedConditionChangeCount: number;
  unresolvedConditionChangeCount: number;

  conditionComparisons:
    PredictionConditionComparison[];

  outcomeSummary: string;
  explanation: string;

  supportingEvidenceIds: string[];
};

export type ComparePredictionOutcomeInput = {
  prediction: OrganizationalPrediction;

  observedConditions:
    OrganizationalCondition[];

  comparedAt?: string;

  supportingEvidenceIds?: string[];
};

function clamp01(value: number): number {
  return Math.max(
    0,
    Math.min(1, value),
  );
}

function findObservedCondition(
  conditionId: string,
  observedConditions:
    OrganizationalCondition[],
): OrganizationalCondition | undefined {
  return observedConditions.find(
    (condition) =>
      condition.id === conditionId,
  );
}

function compareDirection({
  predictedDirection,
  observedCondition,
}: {
  predictedDirection:
    OrganizationalPredictionConditionChange["direction"];

  observedCondition:
    OrganizationalCondition;
}): PredictionConditionComparison {
  const observedStatus =
    observedCondition.status;

  const observedTrend =
    observedCondition.trend;

  if (
    predictedDirection === "deteriorating"
  ) {
    if (
      observedStatus === "deteriorating" ||
      observedTrend === "strengthening"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "confirmed",

        score: 1,

        explanation:
          "The observed condition is deteriorating or strengthening as an active constraint, matching the predicted deterioration.",
      };
    }

    if (
      observedStatus === "constrained" ||
      observedStatus === "weak" ||
      observedStatus === "unresolved"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "partially-confirmed",

        score: 0.6,

        explanation:
          "The condition remains constrained or weak, which is directionally consistent with deterioration but does not fully confirm worsening.",
      };
    }

    if (
      observedStatus === "improving" ||
      observedTrend === "weakening"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "contradicted",

        score: 0,

        explanation:
          "The condition is improving or weakening as a constraint, contradicting the predicted deterioration.",
      };
    }
  }

  if (
    predictedDirection === "improving"
  ) {
    if (
      observedStatus === "improving" ||
      observedTrend === "weakening"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "confirmed",

        score: 1,

        explanation:
          "The observed condition is improving or weakening as a constraint, matching the predicted improvement.",
      };
    }

    if (
      observedStatus === "stable" ||
      observedTrend === "stable"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "partially-confirmed",

        score: 0.5,

        explanation:
          "The condition has stabilized, which is directionally better than deterioration but does not fully confirm improvement.",
      };
    }

    if (
      observedStatus === "deteriorating" ||
      observedTrend === "strengthening"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "contradicted",

        score: 0,

        explanation:
          "The condition is deteriorating or strengthening as a constraint, contradicting the predicted improvement.",
      };
    }
  }

  if (
    predictedDirection === "stable"
  ) {
    if (
      observedStatus === "stable" ||
      observedTrend === "stable"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "confirmed",

        score: 1,

        explanation:
          "The observed condition remains stable, matching the predicted continuation.",
      };
    }

    if (
      observedStatus === "emerging" ||
      observedStatus === "unresolved"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "partially-confirmed",

        score: 0.5,

        explanation:
          "The condition remains present but its direction is not yet stable enough to fully confirm the prediction.",
      };
    }

    if (
      observedStatus === "improving" ||
      observedStatus === "deteriorating"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "contradicted",

        score: 0,

        explanation:
          "The condition materially changed rather than remaining stable.",
      };
    }
  }

  if (
    predictedDirection === "constrained"
  ) {
    if (
      observedStatus === "constrained" ||
      observedStatus === "weak"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "confirmed",

        score: 1,

        explanation:
          "The condition remains constrained or weak, matching the prediction.",
      };
    }

    if (
      observedStatus === "deteriorating" ||
      observedStatus === "unresolved"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "partially-confirmed",

        score: 0.6,

        explanation:
          "The condition remains under pressure, which is consistent with constraint but not an exact match.",
      };
    }

    if (
      observedStatus === "improving" ||
      observedStatus === "stable"
    ) {
      return {
        conditionId:
          observedCondition.id,

        predictedDirection,

        observedStatus,

        observedTrend,

        comparisonStatus:
          "contradicted",

        score: 0,

        explanation:
          "The condition is improving or stable rather than constrained.",
      };
    }
  }

  return {
    conditionId:
      observedCondition.id,

    predictedDirection,

    observedStatus,

    observedTrend,

    comparisonStatus:
      "unresolved",

    score: 0,

    explanation:
      "The observed condition does not provide enough directional evidence to evaluate the prediction.",
  };
}

function compareConditionChange({
  predictedChange,
  observedConditions,
}: {
  predictedChange:
    OrganizationalPredictionConditionChange;

  observedConditions:
    OrganizationalCondition[];
}): PredictionConditionComparison {
  const observedCondition =
    findObservedCondition(
      predictedChange.conditionId,
      observedConditions,
    );

  if (!observedCondition) {
    return {
      conditionId:
        predictedChange.conditionId,

      predictedDirection:
        predictedChange.direction,

      predictedStatus:
        predictedChange.predictedStatus,

      comparisonStatus:
        "unresolved",

      score: 0,

      explanation:
        "The predicted condition was not present in the later organizational condition set.",
    };
  }

  const comparison =
    compareDirection({
      predictedDirection:
        predictedChange.direction,

      observedCondition,
    });

  return {
    ...comparison,

    predictedStatus:
      predictedChange.predictedStatus,
  };
}

function deriveOutcomeStatus(
  comparisons:
    PredictionConditionComparison[],
): PredictionOutcomeComparisonStatus {
  if (comparisons.length === 0) {
    return "inconclusive";
  }

  const confirmedCount =
    comparisons.filter(
      (comparison) =>
        comparison.comparisonStatus ===
        "confirmed",
    ).length;

  const partialCount =
    comparisons.filter(
      (comparison) =>
        comparison.comparisonStatus ===
        "partially-confirmed",
    ).length;

  const contradictedCount =
    comparisons.filter(
      (comparison) =>
        comparison.comparisonStatus ===
        "contradicted",
    ).length;

  const resolvedCount =
    confirmedCount +
    partialCount +
    contradictedCount;

  if (resolvedCount === 0) {
    return "inconclusive";
  }

  if (
    confirmedCount === resolvedCount &&
    contradictedCount === 0
  ) {
    return "confirmed";
  }

  if (
    contradictedCount === resolvedCount
  ) {
    return "not-confirmed";
  }

  if (
    confirmedCount > 0 ||
    partialCount > 0
  ) {
    return "partially-confirmed";
  }

  return "inconclusive";
}

function buildOutcomeSummary({
  status,
  confirmedCount,
  partialCount,
  contradictedCount,
  unresolvedCount,
}: {
  status:
    PredictionOutcomeComparisonStatus;

  confirmedCount: number;
  partialCount: number;
  contradictedCount: number;
  unresolvedCount: number;
}): string {
  return (
    `Prediction outcome is ${status}. ` +
    `${confirmedCount} condition change(s) were confirmed, ` +
    `${partialCount} partially confirmed, ` +
    `${contradictedCount} contradicted, and ` +
    `${unresolvedCount} unresolved.`
  );
}

export function comparePredictionOutcome(
  input: ComparePredictionOutcomeInput,
): PredictionOutcomeComparison {
  const comparedAt =
    input.comparedAt ??
    new Date().toISOString();

  const conditionComparisons =
    input.prediction
      .predictedConditionChanges
      .map((predictedChange) =>
        compareConditionChange({
          predictedChange,
          observedConditions:
            input.observedConditions,
        }),
      );

  const matchedConditionChangeCount =
    conditionComparisons.filter(
      (comparison) =>
        comparison.comparisonStatus ===
        "confirmed",
    ).length;

  const partiallyMatchedConditionChangeCount =
    conditionComparisons.filter(
      (comparison) =>
        comparison.comparisonStatus ===
        "partially-confirmed",
    ).length;

  const contradictedConditionChangeCount =
    conditionComparisons.filter(
      (comparison) =>
        comparison.comparisonStatus ===
        "contradicted",
    ).length;

  const unresolvedConditionChangeCount =
    conditionComparisons.filter(
      (comparison) =>
        comparison.comparisonStatus ===
        "unresolved",
    ).length;

  const accuracyScore =
    conditionComparisons.length === 0
      ? 0
      : clamp01(
          conditionComparisons.reduce(
            (total, comparison) =>
              total + comparison.score,
            0,
          ) /
            conditionComparisons.length,
        );

  const outcomeStatus =
    deriveOutcomeStatus(
      conditionComparisons,
    );

  const outcomeSummary =
    buildOutcomeSummary({
      status:
        outcomeStatus,

      confirmedCount:
        matchedConditionChangeCount,

      partialCount:
        partiallyMatchedConditionChangeCount,

      contradictedCount:
        contradictedConditionChangeCount,

      unresolvedCount:
        unresolvedConditionChangeCount,
    });

  return {
    predictionId:
      input.prediction.id,

    comparedAt,

    outcomeStatus,

    accuracyScore,

    matchedConditionChangeCount,

    partiallyMatchedConditionChangeCount,

    contradictedConditionChangeCount,

    unresolvedConditionChangeCount,

    conditionComparisons,

    outcomeSummary,

    explanation:
      conditionComparisons.length === 0
        ? "The prediction did not contain structured condition changes that could be compared against later organizational conditions."
        : conditionComparisons
            .map(
              (comparison) =>
                `${comparison.conditionId}: ${comparison.explanation}`,
            )
            .join(" "),

    supportingEvidenceIds:
      input.supportingEvidenceIds ?? [],
  };
}