import type {
  ExecutiveLearning,
} from "./executiveLearning";

import type {
  OperatingModelBeliefUpdate,
  OperatingModelImprovement,
  OperatingModelKnowledgeUpdate,
  OperatingModelRecommendationUpdate,
} from "./operatingModelImprovement";

export type CreateOperatingModelImprovementInput = {
  /**
   * Canonical Executive Learning that should be translated into
   * proposed Operating Model changes.
   */
  learning: ExecutiveLearning;

  /**
   * Deterministic creation timestamp supplied by the caller.
   */
  createdAt: string;
};

function requireNonEmptyString(
  value: string | null | undefined,
  fieldName: string,
): string {
  const normalized =
    value?.trim();

  if (!normalized) {
    throw new Error(
      `Cannot create Operating Model Improvement: ${fieldName} is required.`,
    );
  }

  return normalized;
}

function requireValidConfidenceAdjustment(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    throw new Error(
      "Cannot create Operating Model Improvement: confidence adjustment must be a finite number.",
    );
  }

  if (
    value < -1 ||
    value > 1
  ) {
    throw new Error(
      "Cannot create Operating Model Improvement: confidence adjustment must be between -1 and 1.",
    );
  }

  return value;
}

function determineKnowledgeEffect(
  confidenceAdjustment: number,
): OperatingModelKnowledgeUpdate["effect"] {
  if (
    confidenceAdjustment >
    0
  ) {
    return "strengthen";
  }

  if (
    confidenceAdjustment <
    0
  ) {
    return "weaken";
  }

  return "extend";
}

function buildKnowledgeUpdates(
  learning: ExecutiveLearning,
): OperatingModelKnowledgeUpdate[] {
  const effect =
    determineKnowledgeEffect(
      learning.confidenceAdjustment,
    );

  return learning
    .organizationalKnowledge
    .map(
      (knowledge) => ({
        knowledge:
          requireNonEmptyString(
            knowledge,
            "organizational knowledge",
          ),

        effect,

        rationale:
          effect ===
          "strengthen"
            ? "Observed outcomes increased confidence in this organizational knowledge."
            : effect ===
                "weaken"
              ? "Observed outcomes reduced confidence in the assumptions associated with this organizational knowledge."
              : "Observed outcomes created additional organizational knowledge without materially changing confidence.",
      }),
    );
}

function buildBeliefUpdates(
  learning: ExecutiveLearning,
): OperatingModelBeliefUpdate[] {
  const confidenceAdjustment =
    requireValidConfidenceAdjustment(
      learning.confidenceAdjustment,
    );

  const selectedOptionId =
    requireNonEmptyString(
      learning.selectedOptionId,
      "selected option ID",
    );

  return learning
    .organizationalKnowledge
    .map(
      (
        knowledge,
        index,
      ) => {
        const statement =
          requireNonEmptyString(
            knowledge,
            "organizational knowledge",
          );

        return {
          beliefId:
            `operating-model-belief-${learning.id}-${index + 1}`,

          operation:
            "create" as const,

          statement,

          rationale:
            `Executive Learning ${learning.id} produced this belief from observed executive outcomes for selected strategy ${selectedOptionId}.`,

          confidenceAdjustment,

          executiveLearningId:
            learning.id,

          executiveReviewId:
            learning.executiveReviewId,

          executiveWorkId:
            learning.executiveWorkId,

          decisionRecordId:
            learning.decisionRecordId,

          selectedOptionId,

          selectedScenarioId:
            learning.selectedScenarioId,

          recommendedOptionId:
            learning.recommendedOptionId,
        };
      },
    );
}

function buildRecommendationUpdates(
  learning: ExecutiveLearning,
): OperatingModelRecommendationUpdate[] {
  return learning
    .futureRecommendationChanges
    .map(
      (change) => ({
        change:
          requireNonEmptyString(
            change,
            "future recommendation change",
          ),

        rationale:
          `Executive Learning ${learning.id} identified this change as relevant to future executive recommendations for selected strategy ${learning.selectedOptionId}.`,
      }),
    );
}

function buildSummary(
  learning: ExecutiveLearning,
  knowledgeUpdateCount: number,
  beliefUpdateCount: number,
  recommendationUpdateCount: number,
): string {
  return [
    `Discovery proposes an Operating Model improvement from Executive Learning ${learning.id}.`,
    `${knowledgeUpdateCount} knowledge update(s), ${beliefUpdateCount} typed belief update(s), and ${recommendationUpdateCount} recommendation update(s) should be applied to future organizational cognition.`,
  ].join(
    " ",
  );
}

/**
 * Translates canonical Executive Learning into a proposed
 * Operating Model Improvement.
 *
 * This producer:
 *
 * - preserves complete lifecycle ancestry,
 * - preserves selected-strategy ancestry,
 * - produces deterministic proposed updates,
 * - creates typed belief updates,
 * - performs no Runtime mutation,
 * - does not directly alter Organizational Memory,
 * - does not mark the improvement as applied.
 */
export function createOperatingModelImprovement({
  learning,
  createdAt,
}: CreateOperatingModelImprovementInput): OperatingModelImprovement {
  const organizationId =
    requireNonEmptyString(
      learning.organizationId,
      "organization ID",
    );

  const executiveLearningId =
    requireNonEmptyString(
      learning.id,
      "Executive Learning ID",
    );

  const executiveReviewId =
    requireNonEmptyString(
      learning.executiveReviewId,
      "Executive Review ID",
    );

  const executiveWorkId =
    requireNonEmptyString(
      learning.executiveWorkId,
      "Executive Work ID",
    );

  const decisionRecordId =
    requireNonEmptyString(
      learning.decisionRecordId,
      "Executive Decision Record ID",
    );

  requireNonEmptyString(
    learning.selectedOptionId,
    "selected option ID",
  );

  const canonicalCreatedAt =
    requireNonEmptyString(
      createdAt,
      "creation timestamp",
    );

  requireNonEmptyString(
    learning.summary,
    "Executive Learning summary",
  );

  requireValidConfidenceAdjustment(
    learning.confidenceAdjustment,
  );

  if (
    learning
      .organizationalKnowledge
      .length ===
      0 &&
    learning
      .futureRecommendationChanges
      .length ===
      0
  ) {
    throw new Error(
      `Cannot create Operating Model Improvement: Executive Learning ${learning.id} contains no applicable knowledge or recommendation changes.`,
    );
  }

  const knowledgeUpdates =
    buildKnowledgeUpdates(
      learning,
    );

  const beliefUpdates =
    buildBeliefUpdates(
      learning,
    );

  const recommendationUpdates =
    buildRecommendationUpdates(
      learning,
    );

  return {
    id:
      `operating-model-improvement-${executiveLearningId}-${canonicalCreatedAt}`,

    organizationId,

    executiveLearningId,

    executiveReviewId,

    executiveWorkId,

    decisionRecordId,

    summary:
      buildSummary(
        learning,
        knowledgeUpdates.length,
        beliefUpdates.length,
        recommendationUpdates.length,
      ),

    knowledgeUpdates,

    beliefUpdates,

    recommendationUpdates,

    status:
      "proposed",

    createdAt:
      canonicalCreatedAt,
  };
}