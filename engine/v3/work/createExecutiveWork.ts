import type {
  ExecutiveDecisionRecord,
} from "../decisions/executiveDecisionRecord";

import type {
  ExecutiveWork,
} from "./executiveWork";

export type CreateExecutiveWorkInput = {
  decisionRecord: ExecutiveDecisionRecord;

  /**
   * Canonical creation timestamp.
   *
   * Defaults to the decision timestamp so repeated transformations of the
   * same decision record remain deterministic.
   */
  createdAt?: string;
};

function requireNonEmptyString(
  value: string | null | undefined,
  fieldName: string,
): string {
  const normalized =
    value?.trim();

  if (!normalized) {
    throw new Error(
      `Cannot create Executive Work: ${fieldName} is required.`,
    );
  }

  return normalized;
}

function clampProgress(
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

/**
 * Creates the initial living execution state for a committed executive
 * decision.
 *
 * This producer performs no independent reasoning and does not mutate the
 * Executive Decision Record. It deterministically transforms a durable
 * decision record into one canonical Executive Work item.
 */
export function createExecutiveWork({
  decisionRecord,
  createdAt =
    decisionRecord.decidedAt,
}: CreateExecutiveWorkInput): ExecutiveWork {
  if (
    decisionRecord.status !==
    "decided"
  ) {
    throw new Error(
      `Cannot create Executive Work: decision record ${decisionRecord.id} is not decided.`,
    );
  }

  const owner =
    requireNonEmptyString(
      decisionRecord.owner,
      "decision owner",
    );

  const reviewAt =
    requireNonEmptyString(
      decisionRecord.reviewAt,
      "review date",
    );

  const canonicalCreatedAt =
    requireNonEmptyString(
      createdAt,
      "creation timestamp",
    );

  return {
    id:
      `executive-work-${decisionRecord.id}`,

    organizationId:
      decisionRecord.organizationId,

    decisionRecordId:
      decisionRecord.id,

    title:
      requireNonEmptyString(
        decisionRecord.decision,
        "decision",
      ),

    owner,

    status:
      "not-started",

    health:
      "unknown",

    progress:
      clampProgress(0),

    expectedOutcomes: [
      ...decisionRecord
        .expectedOutcomes,
    ],

    successCriteria: [
      ...decisionRecord
        .successCriteria,
    ],

    reviewAt,

    createdAt:
      canonicalCreatedAt,

    updatedAt:
      canonicalCreatedAt,
  };
}
