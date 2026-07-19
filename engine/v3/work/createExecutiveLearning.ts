import type {
  ExecutiveLearning,
} from "./executiveLearning";

import type {
  ExecutiveReview,
} from "./executiveReview";

export type CreateExecutiveLearningInput = {
  review: ExecutiveReview;

  learnedAt: string;
};

function requireNonEmptyString(
  value: string | null | undefined,
  fieldName: string,
): string {
  const normalized =
    value?.trim();

  if (!normalized) {
    throw new Error(
      `Cannot create Executive Learning: ${fieldName} is required.`,
    );
  }

  return normalized;
}

function clampConfidenceAdjustment(
  value: number,
): number {
  return Math.max(
    -1,
    Math.min(
      1,
      value,
    ),
  );
}

function buildConfidenceAdjustment(
  review: ExecutiveReview,
): number {
  if (
    review.status ===
    "inconclusive"
  ) {
    return 0;
  }

  const achieved =
    review.observedOutcomes.filter(
      (outcome) =>
        outcome.achieved ===
        true,
    ).length;

  const notAchieved =
    review.observedOutcomes.filter(
      (outcome) =>
        outcome.achieved ===
        false,
    ).length;

  const total =
    Math.max(
      1,
      review.observedOutcomes.length,
    );

  return clampConfidenceAdjustment(
    (achieved - notAchieved) /
      total,
  );
}

function buildOrganizationalKnowledge(
  review: ExecutiveReview,
): string[] {
  /**
   * An inconclusive review does not establish durable organizational
   * knowledge. Persisting unresolved observations as beliefs would
   * incorrectly convert uncertainty into organizational truth.
   */
  if (
    review.status ===
    "inconclusive"
  ) {
    return [];
  }

  return review.observedOutcomes.flatMap(
    (outcome) => {
      if (
        outcome.achieved ===
        true
      ) {
        return [
          `Expected outcome ${outcome.expectedOutcomeId} was achieved: ${outcome.observation}`,
        ];
      }

      if (
        outcome.achieved ===
        false
      ) {
        return [
          `Expected outcome ${outcome.expectedOutcomeId} was not achieved: ${outcome.observation}`,
        ];
      }

      /**
       * Mixed reviews may contain individual inconclusive outcomes.
       * Those unresolved observations should not become durable
       * organizational knowledge.
       */
      return [];
    },
  );
}

function buildFutureRecommendationChanges(
  review: ExecutiveReview,
): string[] {
  if (
    review.status ===
    "inconclusive"
  ) {
    return [
      "Future recommendations should request additional evidence before increasing or reducing confidence in similar interventions.",
    ];
  }

  const changes: string[] = [];

  const achievedOutcomes =
    review.observedOutcomes.filter(
      (outcome) =>
        outcome.achieved ===
        true,
    );

  const failedOutcomes =
    review.observedOutcomes.filter(
      (outcome) =>
        outcome.achieved ===
        false,
    );

  const inconclusiveOutcomes =
    review.observedOutcomes.filter(
      (outcome) =>
        outcome.achieved ===
        null,
    );

  if (
    achievedOutcomes.length >
    0
  ) {
    changes.push(
      "Future recommendations may increase confidence in similar interventions when comparable organizational conditions are present.",
    );
  }

  if (
    failedOutcomes.length >
    0
  ) {
    changes.push(
      "Future recommendations should reduce confidence in strategies associated with outcomes that were not achieved.",
    );
  }

  if (
    inconclusiveOutcomes.length >
    0
  ) {
    changes.push(
      "Future recommendations should request additional evidence for unresolved outcomes before treating them as durable learning.",
    );
  }

  return changes;
}

function buildSummary(
  review: ExecutiveReview,
): string {
  if (
    review.status ===
    "inconclusive"
  ) {
    return `Executive Review ${review.id} was inconclusive. Discovery identified an evidence gap but did not create durable organizational knowledge.`;
  }

  return `Discovery learned from Executive Review ${review.id}, which concluded the work was ${review.status}.`;
}

/**
 * Creates review-specific Executive Learning.
 *
 * This producer:
 *
 * - performs no Runtime mutation,
 * - does not update the Operating Model,
 * - creates durable knowledge only from resolved outcomes,
 * - preserves uncertainty when a review is inconclusive,
 * - prevents unresolved observations from becoming beliefs,
 * - preserves selected-strategy ancestry for longitudinal judgment.
 */
export function createExecutiveLearning({
  review,
  learnedAt,
}: CreateExecutiveLearningInput): ExecutiveLearning {
  if (
    review.observedOutcomes.length ===
    0
  ) {
    throw new Error(
      `Cannot create Executive Learning: Executive Review ${review.id} contains no observed outcomes.`,
    );
  }

  const canonicalLearnedAt =
    requireNonEmptyString(
      learnedAt,
      "learning timestamp",
    );

  const organizationId =
    requireNonEmptyString(
      review.organizationId,
      "organization ID",
    );

  const executiveReviewId =
    requireNonEmptyString(
      review.id,
      "Executive Review ID",
    );

  const executiveWorkId =
    requireNonEmptyString(
      review.executiveWorkId,
      "Executive Work ID",
    );

  const decisionRecordId =
    requireNonEmptyString(
      review.decisionRecordId,
      "Executive Decision Record ID",
    );

  const selectedOptionId =
    requireNonEmptyString(
      review.selectedOptionId,
      "selected option ID",
    );

  return {
    id:
      `executive-learning-${executiveReviewId}-${canonicalLearnedAt}`,

    organizationId,

    executiveReviewId,

    executiveWorkId,

    decisionRecordId,

    selectedOptionId,

    selectedScenarioId:
      review.selectedScenarioId,

    recommendedOptionId:
      review.recommendedOptionId,

    summary:
      buildSummary(
        review,
      ),

    confidenceAdjustment:
      buildConfidenceAdjustment(
        review,
      ),

    organizationalKnowledge:
      buildOrganizationalKnowledge(
        review,
      ),

    futureRecommendationChanges:
      buildFutureRecommendationChanges(
        review,
      ),

    learnedAt:
      canonicalLearnedAt,
  };
}