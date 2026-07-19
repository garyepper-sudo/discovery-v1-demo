import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

import type {
  OperatingModelImprovement,
} from "./operatingModelImprovement";

export type SaveOperatingModelImprovementInput = {
  runtime: OrganizationRuntime;

  improvement: OperatingModelImprovement;
};

/**
 * Persists one proposed Operating Model Improvement into Runtime.
 *
 * This function:
 *
 * - validates lifecycle ancestry,
 * - prevents duplicate improvement IDs,
 * - returns a new Runtime,
 * - does not mutate Organizational Memory,
 * - does not mark the improvement as applied.
 */
export function saveOperatingModelImprovement({
  runtime,
  improvement,
}: SaveOperatingModelImprovementInput): OrganizationRuntime {
  if (
    runtime.metadata.organizationId !==
    improvement.organizationId
  ) {
    throw new Error(
      `Cannot save Operating Model Improvement ${improvement.id}: organization ${improvement.organizationId} does not match Runtime organization ${runtime.metadata.organizationId}.`,
    );
  }

  if (
    improvement.status !==
    "proposed"
  ) {
    throw new Error(
      `Cannot save Operating Model Improvement ${improvement.id}: only proposed improvements may be persisted by this function.`,
    );
  }

  const learning =
    runtime.memory.executiveLearning.find(
      (candidate) =>
        candidate.id ===
        improvement.executiveLearningId,
    );

  if (!learning) {
    throw new Error(
      `Cannot save Operating Model Improvement ${improvement.id}: Executive Learning ${improvement.executiveLearningId} was not found.`,
    );
  }

  if (
    learning.executiveReviewId !==
      improvement.executiveReviewId ||
    learning.executiveWorkId !==
      improvement.executiveWorkId ||
    learning.decisionRecordId !==
      improvement.decisionRecordId
  ) {
    throw new Error(
      `Cannot save Operating Model Improvement ${improvement.id}: lifecycle ancestry does not match Executive Learning ${learning.id}.`,
    );
  }

  const review =
    runtime.memory.executiveReviews.find(
      (candidate) =>
        candidate.id ===
        improvement.executiveReviewId,
    );

  if (!review) {
    throw new Error(
      `Cannot save Operating Model Improvement ${improvement.id}: Executive Review ${improvement.executiveReviewId} was not found.`,
    );
  }

  const work =
    runtime.memory.executiveWork.find(
      (candidate) =>
        candidate.id ===
        improvement.executiveWorkId,
    );

  if (!work) {
    throw new Error(
      `Cannot save Operating Model Improvement ${improvement.id}: Executive Work ${improvement.executiveWorkId} was not found.`,
    );
  }

  const decisionRecord =
    runtime.memory.executiveDecisionRecords.find(
      (candidate) =>
        candidate.id ===
        improvement.decisionRecordId,
    );

  if (!decisionRecord) {
    throw new Error(
      `Cannot save Operating Model Improvement ${improvement.id}: Executive Decision Record ${improvement.decisionRecordId} was not found.`,
    );
  }

  const duplicate =
    runtime.memory
      .operatingModelImprovements
      .find(
        (candidate) =>
          candidate.id ===
          improvement.id,
      );

  if (duplicate) {
    throw new Error(
      `Cannot save Operating Model Improvement ${improvement.id}: an improvement with this ID already exists.`,
    );
  }

  return {
    ...runtime,

    metadata: {
      ...runtime.metadata,

      updatedAt:
        improvement.createdAt,
    },

    memory: {
      ...runtime.memory,

      operatingModelImprovements: [
        ...runtime.memory
          .operatingModelImprovements,

        improvement,
      ],
    },
  };
}