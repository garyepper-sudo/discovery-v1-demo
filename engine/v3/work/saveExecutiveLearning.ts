import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

import type {
  ExecutiveLearning,
} from "./executiveLearning";

export type SaveExecutiveLearningInput = {
  runtime: OrganizationRuntime;

  learning: ExecutiveLearning;
};

/**
 * Persists one canonical Executive Learning object into Runtime.
 *
 * This function performs no independent reasoning and does not mutate
 * the original Runtime.
 */
export function saveExecutiveLearning({
  runtime,
  learning,
}: SaveExecutiveLearningInput): OrganizationRuntime {
  if (
    runtime.metadata.organizationId !==
    learning.organizationId
  ) {
    throw new Error(
      `Cannot save Executive Learning ${learning.id}: organization ${learning.organizationId} does not match Runtime organization ${runtime.metadata.organizationId}.`,
    );
  }

  const review =
    runtime.memory.executiveReviews.find(
      (candidate) =>
        candidate.id ===
        learning.executiveReviewId,
    );

  if (!review) {
    throw new Error(
      `Cannot save Executive Learning ${learning.id}: Executive Review ${learning.executiveReviewId} was not found.`,
    );
  }

  if (
    review.executiveWorkId !==
      learning.executiveWorkId ||
    review.decisionRecordId !==
      learning.decisionRecordId
  ) {
    throw new Error(
      `Cannot save Executive Learning ${learning.id}: lifecycle ancestry does not match Executive Review ${review.id}.`,
    );
  }

  const work =
    runtime.memory.executiveWork.find(
      (candidate) =>
        candidate.id ===
        learning.executiveWorkId,
    );

  if (!work) {
    throw new Error(
      `Cannot save Executive Learning ${learning.id}: Executive Work ${learning.executiveWorkId} was not found.`,
    );
  }

  const decisionRecord =
    runtime.memory.executiveDecisionRecords.find(
      (candidate) =>
        candidate.id ===
        learning.decisionRecordId,
    );

  if (!decisionRecord) {
    throw new Error(
      `Cannot save Executive Learning ${learning.id}: Executive Decision Record ${learning.decisionRecordId} was not found.`,
    );
  }

  const existingLearning =
    runtime.memory.executiveLearning.find(
      (candidate) =>
        candidate.id ===
        learning.id,
    );

  if (existingLearning) {
    throw new Error(
      `Cannot save Executive Learning ${learning.id}: a learning object with this ID already exists.`,
    );
  }

  return {
    ...runtime,

    metadata: {
      ...runtime.metadata,

      updatedAt:
        learning.learnedAt,
    },

    memory: {
      ...runtime.memory,

      executiveLearning: [
        ...runtime.memory
          .executiveLearning,

        learning,
      ],
    },
  };
}