import type {
  ExecutiveReview,
  ExecutiveReviewStatus,
  ExecutiveObservedOutcome,
} from "./executiveReview";

import type {
  ExecutiveWork,
} from "./executiveWork";

export type CreateExecutiveReviewInput = {
  work: ExecutiveWork;

  observedOutcomes:
    ExecutiveObservedOutcome[];

  /**
   * Optional executive summary of what happened.
   *
   * When omitted, the producer creates a deterministic summary from the
   * resolved review status and observed-outcome counts.
   */
  summary?: string;

  /**
   * Canonical review timestamp.
   */
  reviewedAt: string;
};

function clamp01(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function requireNonEmptyString(
  value: string | null | undefined,
  fieldName: string,
): string {
  const normalized =
    value?.trim();

  if (!normalized) {
    throw new Error(
      `Cannot create Executive Review: ${fieldName} is required.`,
    );
  }

  return normalized;
}

function validateObservedOutcomes(
  observedOutcomes:
    ExecutiveObservedOutcome[],
): ExecutiveObservedOutcome[] {
  if (
    observedOutcomes.length ===
    0
  ) {
    throw new Error(
      "Cannot create Executive Review: at least one observed outcome is required.",
    );
  }

  const seenExpectedOutcomeIds =
    new Set<string>();

  return observedOutcomes.map(
    (outcome) => {
      const expectedOutcomeId =
        requireNonEmptyString(
          outcome.expectedOutcomeId,
          "expected outcome ID",
        );

      if (
        seenExpectedOutcomeIds.has(
          expectedOutcomeId,
        )
      ) {
        throw new Error(
          `Cannot create Executive Review: expected outcome ${expectedOutcomeId} was reviewed more than once.`,
        );
      }

      seenExpectedOutcomeIds.add(
        expectedOutcomeId,
      );

      return {
        ...outcome,

        expectedOutcomeId,

        observation:
          requireNonEmptyString(
            outcome.observation,
            `observation for ${expectedOutcomeId}`,
          ),

        confidence:
          clamp01(
            outcome.confidence,
          ),
      };
    },
  );
}

function resolveReviewStatus(
  observedOutcomes:
    ExecutiveObservedOutcome[],
): ExecutiveReviewStatus {
  const achieved =
    observedOutcomes.filter(
      (outcome) =>
        outcome.achieved ===
        true,
    ).length;

  const notAchieved =
    observedOutcomes.filter(
      (outcome) =>
        outcome.achieved ===
        false,
    ).length;

  const inconclusive =
    observedOutcomes.filter(
      (outcome) =>
        outcome.achieved ===
        null,
    ).length;

  if (
    inconclusive ===
    observedOutcomes.length
  ) {
    return "inconclusive";
  }

  if (
    achieved ===
    observedOutcomes.length
  ) {
    return "successful";
  }

  if (
    notAchieved ===
    observedOutcomes.length
  ) {
    return "unsuccessful";
  }

  return "partially-successful";
}

function buildSummary(
  status: ExecutiveReviewStatus,
  observedOutcomes:
    ExecutiveObservedOutcome[],
): string {
  const achieved =
    observedOutcomes.filter(
      (outcome) =>
        outcome.achieved ===
        true,
    ).length;

  const notAchieved =
    observedOutcomes.filter(
      (outcome) =>
        outcome.achieved ===
        false,
    ).length;

  const inconclusive =
    observedOutcomes.length -
    achieved -
    notAchieved;

  return `Executive Review concluded that the work was ${status}. ${achieved} outcome(s) were achieved, ${notAchieved} were not achieved, and ${inconclusive} remain inconclusive.`;
}

/**
 * Creates the canonical review of one Executive Work item.
 *
 * This producer:
 *
 * - records observed outcomes against the existing execution contract,
 * - preserves selected-strategy ancestry,
 * - deterministically resolves review status,
 * - performs no learning,
 * - performs no Runtime mutation.
 */
export function createExecutiveReview({
  work,
  observedOutcomes,
  summary,
  reviewedAt,
}: CreateExecutiveReviewInput): ExecutiveReview {
  if (
    work.status !==
    "completed"
  ) {
    throw new Error(
      `Cannot create Executive Review: Executive Work ${work.id} is not completed.`,
    );
  }

  const selectedOptionId =
    requireNonEmptyString(
      work.selectedOptionId,
      "selected option ID",
    );

  const canonicalReviewedAt =
    requireNonEmptyString(
      reviewedAt,
      "review timestamp",
    );

  const canonicalObservedOutcomes =
    validateObservedOutcomes(
      observedOutcomes,
    );

  const status =
    resolveReviewStatus(
      canonicalObservedOutcomes,
    );

  return {
    id:
      `executive-review-${work.id}-${canonicalReviewedAt}`,

    organizationId:
      work.organizationId,

    executiveWorkId:
      work.id,

    decisionRecordId:
      work.decisionRecordId,

    selectedOptionId,

    selectedScenarioId:
      work.selectedScenarioId,

    recommendedOptionId:
      work.recommendedOptionId,

    status,

    observedOutcomes:
      canonicalObservedOutcomes,

    summary:
      summary?.trim() ||
      buildSummary(
        status,
        canonicalObservedOutcomes,
      ),

    reviewedAt:
      canonicalReviewedAt,
  };
}