import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

import type {
  ExecutiveReview,
} from "./executiveReview";

export type SaveExecutiveReviewInput = {
  runtime: OrganizationRuntime;

  review: ExecutiveReview;
};

/**
 * Persists one canonical Executive Review into Organization Runtime.
 *
 * This function performs no independent reasoning and does not mutate the
 * original Runtime. It returns a new Runtime with the review appended.
 */
export function saveExecutiveReview({
  runtime,
  review,
}: SaveExecutiveReviewInput): OrganizationRuntime {
  if (
    runtime.metadata.organizationId !==
    review.organizationId
  ) {
    throw new Error(
      `Cannot save Executive Review ${review.id}: organization ${review.organizationId} does not match Runtime organization ${runtime.metadata.organizationId}.`,
    );
  }

  const existingWork =
    runtime.memory.executiveWork.find(
      (candidate) =>
        candidate.id ===
        review.executiveWorkId,
    );

  if (!existingWork) {
    throw new Error(
      `Cannot save Executive Review ${review.id}: Executive Work ${review.executiveWorkId} was not found.`,
    );
  }

  if (
    existingWork.decisionRecordId !==
    review.decisionRecordId
  ) {
    throw new Error(
      `Cannot save Executive Review ${review.id}: decision ancestry does not match Executive Work ${existingWork.id}.`,
    );
  }

  const existingDecisionRecord =
    runtime.memory
      .executiveDecisionRecords
      .find(
        (candidate) =>
          candidate.id ===
          review.decisionRecordId,
      );

  if (!existingDecisionRecord) {
    throw new Error(
      `Cannot save Executive Review ${review.id}: Executive Decision Record ${review.decisionRecordId} was not found.`,
    );
  }

  const existingReview =
    runtime.memory.executiveReviews.find(
      (candidate) =>
        candidate.id === review.id,
    );

  if (existingReview) {
    throw new Error(
      `Cannot save Executive Review ${review.id}: a review with this ID already exists.`,
    );
  }

  return {
    ...runtime,

    metadata: {
      ...runtime.metadata,

      updatedAt:
        review.reviewedAt,
    },

    memory: {
      ...runtime.memory,

      executiveReviews: [
        ...runtime.memory
          .executiveReviews,

        review,
      ],
    },
  };
}
