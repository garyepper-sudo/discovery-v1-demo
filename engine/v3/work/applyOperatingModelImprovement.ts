import type {
  OrganizationRuntime,
} from "../runtime/organizationRuntime";

import type {
  PersistentBelief,
} from "../understanding/types";

import type {
  OperatingModelBeliefUpdate,
  OperatingModelImprovement,
} from "./operatingModelImprovement";

export type ApplyOperatingModelImprovementInput = {
  runtime: OrganizationRuntime;

  improvementId: string;

  appliedAt: string;
};

function requireNonEmptyString(
  value: string | null | undefined,
  fieldName: string,
): string {
  const normalized =
    value?.trim();

  if (!normalized) {
    throw new Error(
      `Cannot apply Operating Model Improvement: ${fieldName} is required.`,
    );
  }

  return normalized;
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
): number {
  return Math.max(
    minimum,
    Math.min(
      maximum,
      value,
    ),
  );
}

/**
 * Converts the signed Executive Learning confidence adjustment into
 * the initial confidence assigned to a newly created belief.
 *
 * -1 maps to 0
 *  0 maps to 0.5
 *  1 maps to 1
 */
function deriveBeliefConfidence(
  confidenceAdjustment: number,
): number {
  if (
    !Number.isFinite(
      confidenceAdjustment,
    )
  ) {
    throw new Error(
      "Cannot apply Operating Model Improvement: belief confidence adjustment must be a finite number.",
    );
  }

  if (
    confidenceAdjustment < -1 ||
    confidenceAdjustment > 1
  ) {
    throw new Error(
      "Cannot apply Operating Model Improvement: belief confidence adjustment must be between -1 and 1.",
    );
  }

  return clamp(
    (confidenceAdjustment + 1) /
      2,
    0,
    1,
  );
}

function validateBeliefUpdateAncestry(
  update: OperatingModelBeliefUpdate,
  improvement: OperatingModelImprovement,
): void {
  if (
    update.executiveLearningId !==
      improvement.executiveLearningId ||
    update.executiveReviewId !==
      improvement.executiveReviewId ||
    update.executiveWorkId !==
      improvement.executiveWorkId ||
    update.decisionRecordId !==
      improvement.decisionRecordId
  ) {
    throw new Error(
      `Cannot apply Operating Model Improvement ${improvement.id}: belief update ${update.beliefId} does not preserve lifecycle ancestry.`,
    );
  }
}

function createPersistentBelief(
  update: OperatingModelBeliefUpdate,
  appliedAt: string,
): PersistentBelief {
  if (
    update.operation !==
    "create"
  ) {
    throw new Error(
      `Cannot apply belief update ${update.beliefId}: V2 currently supports only create operations.`,
    );
  }

  const beliefId =
    requireNonEmptyString(
      update.beliefId,
      "belief ID",
    );

  const statement =
    requireNonEmptyString(
      update.statement,
      "belief statement",
    );

  const rationale =
    requireNonEmptyString(
      update.rationale,
      "belief rationale",
    );

  const selectedOptionId =
    requireNonEmptyString(
      update.selectedOptionId,
      "selected option ID",
    );

  const executiveLearningId =
    requireNonEmptyString(
      update.executiveLearningId,
      "Executive Learning ID",
    );

  const executiveReviewId =
    requireNonEmptyString(
      update.executiveReviewId,
      "Executive Review ID",
    );

  const executiveWorkId =
    requireNonEmptyString(
      update.executiveWorkId,
      "Executive Work ID",
    );

  const decisionRecordId =
    requireNonEmptyString(
      update.decisionRecordId,
      "Executive Decision Record ID",
    );

  return {
    id:
      beliefId,

    cognitiveLayer:
      "belief",

    ontologyVersion:
      "1.0",

    statement,

    rationale,

    confidence:
      deriveBeliefConfidence(
        update.confidenceAdjustment,
      ),

    stability:
      "emerging",

    firstSeenAt:
      appliedAt,

    lastSeenAt:
      appliedAt,

    evidenceIds: [],

    observationIds: [],

    themeIds: [],

    occurrenceCount:
      1,

    selectedOptionId,

    selectedScenarioId:
      update.selectedScenarioId,

    recommendedOptionId:
      update.recommendedOptionId,

    executiveLearningId,

    executiveReviewId,

    executiveWorkId,

    decisionRecordId,

    executiveOutcomeConfidenceAdjustment:
      update.confidenceAdjustment,
  };
}

/**
 * Applies one persisted Operating Model Improvement to canonical
 * Organizational Memory.
 *
 * Version 2 improves the Operating Model by:
 *
 * - creating typed PersistentBelief objects,
 * - updating canonical Organizational Memory,
 * - updating the temporary legacy belief mirror,
 * - marking the improvement as applied,
 * - preserving lifecycle ancestry,
 * - preserving selected-strategy ancestry,
 * - returning a new Runtime without mutating the input.
 *
 * Existing beliefs, theories, and conditions are not modified unless
 * a future improvement object identifies explicit target ancestry.
 */
export function applyOperatingModelImprovement({
  runtime,
  improvementId,
  appliedAt,
}: ApplyOperatingModelImprovementInput): OrganizationRuntime {
  const canonicalImprovementId =
    requireNonEmptyString(
      improvementId,
      "improvement ID",
    );

  const canonicalAppliedAt =
    requireNonEmptyString(
      appliedAt,
      "application timestamp",
    );

  const improvement =
    runtime.memory
      .operatingModelImprovements
      .find(
        (candidate) =>
          candidate.id ===
          canonicalImprovementId,
      );

  if (!improvement) {
    throw new Error(
      `Cannot apply Operating Model Improvement ${canonicalImprovementId}: improvement was not found.`,
    );
  }

  if (
    improvement.organizationId !==
    runtime.metadata.organizationId
  ) {
    throw new Error(
      `Cannot apply Operating Model Improvement ${improvement.id}: organization ${improvement.organizationId} does not match Runtime organization ${runtime.metadata.organizationId}.`,
    );
  }

  if (
    improvement.status ===
    "applied"
  ) {
    throw new Error(
      `Cannot apply Operating Model Improvement ${improvement.id}: improvement has already been applied.`,
    );
  }

  if (
    improvement.knowledgeUpdates.length ===
      0 &&
    improvement.recommendationUpdates.length ===
      0 &&
    improvement.beliefUpdates.length ===
      0
  ) {
    throw new Error(
      `Cannot apply Operating Model Improvement ${improvement.id}: improvement contains no applicable updates.`,
    );
  }

  const organizationalMemory =
    runtime.memory
      .organizationalMemory;

  if (!organizationalMemory) {
    throw new Error(
      `Cannot apply Operating Model Improvement ${improvement.id}: canonical Organizational Memory has not been initialized.`,
    );
  }

  const existingCanonicalBeliefIds =
    new Set(
      organizationalMemory
        .beliefs
        .map(
          (belief) =>
            belief.id,
        ),
    );

  const existingLegacyBeliefIds =
    new Set(
      runtime.memory
        .beliefs
        .map(
          (belief) =>
            belief.id,
        ),
    );

  const createdBeliefs =
    improvement.beliefUpdates.map(
      (update) => {
        validateBeliefUpdateAncestry(
          update,
          improvement,
        );

        if (
          existingCanonicalBeliefIds.has(
            update.beliefId,
          ) ||
          existingLegacyBeliefIds.has(
            update.beliefId,
          )
        ) {
          throw new Error(
            `Cannot apply Operating Model Improvement ${improvement.id}: belief ${update.beliefId} already exists.`,
          );
        }

        return createPersistentBelief(
          update,
          canonicalAppliedAt,
        );
      },
    );

  const appliedImprovement:
    OperatingModelImprovement = {
      ...improvement,

      status:
        "applied",

      appliedAt:
        canonicalAppliedAt,
  };

  return {
    ...runtime,

    metadata: {
      ...runtime.metadata,

      updatedAt:
        canonicalAppliedAt,
    },

    memory: {
      ...runtime.memory,

      /**
       * Canonical long-term organizational memory.
       */
      organizationalMemory: {
        ...organizationalMemory,

        beliefs: [
          ...organizationalMemory
            .beliefs,

          ...createdBeliefs,
        ],

        lastUpdatedAt:
          canonicalAppliedAt,
      },

      /**
       * Temporary legacy mirror retained until OrganizationalMemory
       * becomes the sole source of truth.
       */
      beliefs: [
        ...runtime.memory
          .beliefs,

        ...createdBeliefs,
      ],

      operatingModelImprovements:
        runtime.memory
          .operatingModelImprovements
          .map(
            (candidate) =>
              candidate.id ===
              appliedImprovement.id
                ? appliedImprovement
                : candidate,
          ),
    },
  };
}