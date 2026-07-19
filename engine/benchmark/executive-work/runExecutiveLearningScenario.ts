import type {
  OrganizationRuntime,
} from "../../v3/runtime/organizationRuntime";

import type {
  ExecutiveWork,
} from "../../v3/work/executiveWork";

import type {
  ExecutiveReview,
  ExecutiveObservedOutcome,
} from "../../v3/work/executiveReview";

import {
  createExecutiveReview,
} from "../../v3/work/createExecutiveReview";

import {
  saveExecutiveReview,
} from "../../v3/work/saveExecutiveReview";

import type {
  ExecutiveLearning,
} from "../../v3/work/executiveLearning";

import {
  createExecutiveLearning,
} from "../../v3/work/createExecutiveLearning";

import {
  saveExecutiveLearning,
} from "../../v3/work/saveExecutiveLearning";

import type {
  OperatingModelImprovement,
} from "../../v3/work/operatingModelImprovement";

import {
  createOperatingModelImprovement,
} from "../../v3/work/createOperatingModelImprovement";

import {
  saveOperatingModelImprovement,
} from "../../v3/work/saveOperatingModelImprovement";

import {
  applyOperatingModelImprovement,
} from "../../v3/work/applyOperatingModelImprovement";

export type ExecutiveLearningScenarioName =
  | "successful"
  | "unsuccessful"
  | "partially-successful"
  | "inconclusive";

export type ExecutiveLearningScenarioInput = {
  /**
   * Human-readable calibration scenario name.
   */
  name: ExecutiveLearningScenarioName;

  /**
   * Runtime containing the committed Executive Decision Record,
   * Executive Work item, and initialized Organizational Memory.
   */
  runtime: OrganizationRuntime;

  /**
   * Executive Work item whose outcomes will be reviewed.
   *
   * The helper converts this work item into a completed state without
   * mutating the supplied object.
   */
  work: ExecutiveWork;

  /**
   * Outcome resolution pattern corresponding one-to-one with the
   * work item's expected outcomes.
   *
   * true  = achieved
   * false = not achieved
   * null  = inconclusive
   */
  achievedPattern: Array<
    boolean | null
  >;

  /**
   * Deterministic timestamp used for Review, Learning, improvement
   * creation, and improvement application.
   */
  reviewedAt: string;
};

export type ExecutiveLearningScenarioResult = {
  name: ExecutiveLearningScenarioName;

  completedWork: ExecutiveWork;

  observedOutcomes:
    ExecutiveObservedOutcome[];

  review: ExecutiveReview;

  reviewRuntime:
    OrganizationRuntime;

  learning: ExecutiveLearning;

  learningRuntime:
    OrganizationRuntime;

  improvement:
    OperatingModelImprovement;

  improvementRuntime:
    OrganizationRuntime;

  /**
   * Runtime after applying typed belief updates.
   *
   * Inconclusive learning produces no belief updates, so the proposed
   * improvement is preserved but not applied. In that case this field
   * equals improvementRuntime.
   */
  finalRuntime:
    OrganizationRuntime;

  improvementApplied: boolean;

  canonicalBeliefCountBefore:
    number;

  canonicalBeliefCountAfter:
    number;
};

function requireNonEmptyString(
  value: string | null | undefined,
  fieldName: string,
): string {
  const normalized =
    value?.trim();

  if (!normalized) {
    throw new Error(
      `Cannot run Executive Learning scenario: ${fieldName} is required.`,
    );
  }

  return normalized;
}

function validateRuntimeFoundation(
  runtime: OrganizationRuntime,
  work: ExecutiveWork,
): void {
  if (
    runtime.metadata.organizationId !==
    work.organizationId
  ) {
    throw new Error(
      `Cannot run Executive Learning scenario: Executive Work organization ${work.organizationId} does not match Runtime organization ${runtime.metadata.organizationId}.`,
    );
  }

  if (
    !runtime.memory
      .organizationalMemory
  ) {
    throw new Error(
      "Cannot run Executive Learning scenario: canonical Organizational Memory has not been initialized.",
    );
  }

  const persistedWork =
    runtime.memory.executiveWork.find(
      (candidate) =>
        candidate.id ===
        work.id,
    );

  if (!persistedWork) {
    throw new Error(
      `Cannot run Executive Learning scenario: Executive Work ${work.id} was not found in Runtime.`,
    );
  }

  const decisionRecord =
    runtime.memory
      .executiveDecisionRecords
      .find(
        (candidate) =>
          candidate.id ===
          work.decisionRecordId,
      );

  if (!decisionRecord) {
    throw new Error(
      `Cannot run Executive Learning scenario: Executive Decision Record ${work.decisionRecordId} was not found in Runtime.`,
    );
  }
}

function validateAchievedPattern(
  work: ExecutiveWork,
  achievedPattern:
    Array<boolean | null>,
): void {
  if (
    achievedPattern.length !==
    work.expectedOutcomes.length
  ) {
    throw new Error(
      `Cannot run Executive Learning scenario: achieved pattern contains ${achievedPattern.length} value(s), but Executive Work ${work.id} contains ${work.expectedOutcomes.length} expected outcome(s).`,
    );
  }
}

function createCompletedWork(
  work: ExecutiveWork,
  reviewedAt: string,
): ExecutiveWork {
  return {
    ...work,

    status:
      "completed",

    health:
      "on-track",

    progress:
      1,

    updatedAt:
      reviewedAt,
  };
}

function buildObservedOutcomes(
  name: ExecutiveLearningScenarioName,
  completedWork: ExecutiveWork,
  achievedPattern:
    Array<boolean | null>,
): ExecutiveObservedOutcome[] {
  return completedWork
    .expectedOutcomes
    .map(
      (expectedOutcome, index) => {
        const achieved =
          achievedPattern[index];

        const resolution =
          achieved === true
            ? "was achieved"
            : achieved === false
              ? "was not achieved"
              : "remains inconclusive";

        return {
          expectedOutcomeId:
            expectedOutcome.id,

          observation:
            `${name} calibration scenario: ${expectedOutcome.description} ${resolution}.`,

          achieved,

          confidence:
            achieved === null
              ? 0.5
              : 0.9,
        };
      },
    );
}

function createRuntimeWithCompletedWork(
  runtime: OrganizationRuntime,
  completedWork: ExecutiveWork,
): OrganizationRuntime {
  return {
    ...runtime,

    memory: {
      ...runtime.memory,

      executiveWork:
        runtime.memory
          .executiveWork
          .map(
            (candidate) =>
              candidate.id ===
              completedWork.id
                ? completedWork
                : candidate,
          ),
    },
  };
}

/**
 * Runs the Review → Learn → Operating Model Improvement portion of
 * the Executive Operating System for one calibration scenario.
 *
 * The helper:
 *
 * - completes an existing Executive Work item,
 * - creates and persists an Executive Review,
 * - creates and persists Executive Learning,
 * - creates and persists an Operating Model Improvement,
 * - applies the improvement only when typed belief updates exist,
 * - preserves inconclusive improvements as proposed,
 * - performs all transformations immutably.
 */
export function runExecutiveLearningScenario({
  name,
  runtime,
  work,
  achievedPattern,
  reviewedAt,
}: ExecutiveLearningScenarioInput): ExecutiveLearningScenarioResult {
  const canonicalReviewedAt =
    requireNonEmptyString(
      reviewedAt,
      "review timestamp",
    );

  validateRuntimeFoundation(
    runtime,
    work,
  );

  validateAchievedPattern(
    work,
    achievedPattern,
  );

  const completedWork =
    createCompletedWork(
      work,
      canonicalReviewedAt,
    );

  const observedOutcomes =
    buildObservedOutcomes(
      name,
      completedWork,
      achievedPattern,
    );

  const runtimeWithCompletedWork =
    createRuntimeWithCompletedWork(
      runtime,
      completedWork,
    );

  const review =
    createExecutiveReview({
      work:
        completedWork,

      observedOutcomes,

      reviewedAt:
        canonicalReviewedAt,
    });

  if (
    review.status !==
    name
  ) {
    throw new Error(
      `Executive Learning scenario ${name} resolved to unexpected review status ${review.status}.`,
    );
  }

  const reviewRuntime =
    saveExecutiveReview({
      runtime:
        runtimeWithCompletedWork,

      review,
    });

  const learning =
    createExecutiveLearning({
      review,

      learnedAt:
        canonicalReviewedAt,
    });

  const learningRuntime =
    saveExecutiveLearning({
      runtime:
        reviewRuntime,

      learning,
    });

  const improvement =
    createOperatingModelImprovement({
      learning,

      createdAt:
        canonicalReviewedAt,
    });

  const improvementRuntime =
    saveOperatingModelImprovement({
      runtime:
        learningRuntime,

      improvement,
    });

  const canonicalBeliefCountBefore =
    improvementRuntime.memory
      .organizationalMemory
      ?.beliefs.length ??
    0;

  const improvementApplied =
    improvement.beliefUpdates.length >
    0;

  const finalRuntime =
    improvementApplied
      ? applyOperatingModelImprovement({
          runtime:
            improvementRuntime,

          improvementId:
            improvement.id,

          appliedAt:
            canonicalReviewedAt,
        })
      : improvementRuntime;

  const canonicalBeliefCountAfter =
    finalRuntime.memory
      .organizationalMemory
      ?.beliefs.length ??
    0;

  return {
    name,

    completedWork,

    observedOutcomes,

    review,

    reviewRuntime,

    learning,

    learningRuntime,

    improvement,

    improvementRuntime,

    finalRuntime,

    improvementApplied,

    canonicalBeliefCountBefore,

    canonicalBeliefCountAfter,
  };
}