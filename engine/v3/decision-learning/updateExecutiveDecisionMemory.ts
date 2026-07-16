import type {
  ExecutiveDecisionLearning,
} from "../model/decision-learning/executiveDecisionLearning";

import type {
  ExecutiveDecisionMemory,
} from "../model/decision-learning/executiveDecisionMemory";

import type {
  ExecutiveDecisionOutcome,
} from "../model/decision-learning/executiveDecisionOutcome";

import type {
  ExecutiveDecisionReflection,
} from "../model/decision-learning/executiveDecisionReflection";

export type UpdateExecutiveDecisionMemoryInput = {
  organizationId: string;

  existingMemory?:
    ExecutiveDecisionMemory;

  outcome:
    ExecutiveDecisionOutcome;

  reflection:
    ExecutiveDecisionReflection;

  learning:
    ExecutiveDecisionLearning;

  updatedAt?: string;
};

function clamp01(
  value: number,
): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(1, value),
  );
}

function unique(
  values: string[],
): string[] {
  return Array.from(
    new Set(
      values
        .map(
          (value) =>
            value.trim(),
        )
        .filter(Boolean),
    ),
  );
}

function upsertById<
  T extends {
    id: string;
  },
>(
  values: T[],
  value: T,
): T[] {
  const existingIndex =
    values.findIndex(
      (existing) =>
        existing.id ===
        value.id,
    );

  if (
    existingIndex === -1
  ) {
    return [
      ...values,
      value,
    ];
  }

  return values.map(
    (
      existing,
      index,
    ) =>
      index ===
        existingIndex
        ? value
        : existing,
  );
}

function average(
  values: number[],
): number {
  const finiteValues =
    values.filter(
      Number.isFinite,
    );

  if (
    finiteValues.length === 0
  ) {
    return 0;
  }

  return (
    finiteValues.reduce(
      (
        total,
        value,
      ) =>
        total + value,
      0,
    ) /
    finiteValues.length
  );
}

function completedDecisionCount(
  outcomes:
    ExecutiveDecisionOutcome[],
): number {
  return outcomes.filter(
    (outcome) =>
      outcome.executionStatus ===
      "completed",
  ).length;
}

function unresolvedDecisionCount(
  outcomes:
    ExecutiveDecisionOutcome[],
): number {
  return outcomes.filter(
    (outcome) =>
      outcome.executionStatus ===
        "planned" ||
      outcome.executionStatus ===
        "partial" ||
      outcome.outcome ===
        "unknown",
  ).length;
}

function memoryConfidence(params: {
  outcomes:
    ExecutiveDecisionOutcome[];

  reflections:
    ExecutiveDecisionReflection[];

  learnings:
    ExecutiveDecisionLearning[];

  previousConfidence?: number;
}): number {
  const outcomeConfidence =
    average(
      params.outcomes.map(
        (outcome) =>
          outcome.confidence,
      ),
    );

  const reflectionConfidence =
    average(
      params.reflections.map(
        (reflection) =>
          reflection.confidence,
      ),
    );

  const learningConfidence =
    average(
      params.learnings.map(
        (learning) =>
          learning.confidence,
      ),
    );

  const availableScores = [
    params.outcomes.length > 0
      ? outcomeConfidence
      : undefined,

    params.reflections.length > 0
      ? reflectionConfidence
      : undefined,

    params.learnings.length > 0
      ? learningConfidence
      : undefined,
  ].filter(
    (
      value,
    ): value is number =>
      typeof value ===
        "number",
  );

  if (
    availableScores.length === 0
  ) {
    return clamp01(
      params.previousConfidence ??
      0,
    );
  }

  return clamp01(
    average(
      availableScores,
    ),
  );
}

function buildSummary(params: {
  outcomes:
    ExecutiveDecisionOutcome[];

  reflections:
    ExecutiveDecisionReflection[];

  learnings:
    ExecutiveDecisionLearning[];

  completedCount: number;

  unresolvedCount: number;
}): string {
  const successfulCount =
    params.outcomes.filter(
      (outcome) =>
        outcome.outcome ===
        "successful",
    ).length;

  const partiallySuccessfulCount =
    params.outcomes.filter(
      (outcome) =>
        outcome.outcome ===
        "partially-successful",
    ).length;

  const unsuccessfulCount =
    params.outcomes.filter(
      (outcome) =>
        outcome.outcome ===
        "unsuccessful",
    ).length;

  const supportedLearningCount =
    params.learnings.filter(
      (learning) =>
        learning.status ===
          "supported" ||
        learning.status ===
          "canonical",
    ).length;

  const provisionalLearningCount =
    params.learnings.filter(
      (learning) =>
        learning.status ===
        "provisional",
    ).length;

  return [
    `Discovery retains ${params.outcomes.length} executive decision outcome(s), ${params.reflections.length} reflection(s), and ${params.learnings.length} reusable learning object(s).`,
    `${params.completedCount} decision(s) are completed and ${params.unresolvedCount} remain unresolved.`,
    `${successfulCount} outcome(s) were successful, ${partiallySuccessfulCount} were partially successful, and ${unsuccessfulCount} were unsuccessful.`,
    `${supportedLearningCount} learning object(s) are supported or canonical and ${provisionalLearningCount} remain provisional.`,
  ].join(" ");
}

function validateOrganization(params: {
  organizationId: string;

  existingMemory?:
    ExecutiveDecisionMemory;

  outcome:
    ExecutiveDecisionOutcome;

  learning:
    ExecutiveDecisionLearning;
}): void {
  if (
    params.existingMemory &&
    params.existingMemory
      .organizationId !==
      params.organizationId
  ) {
    throw new Error(
      "Existing Executive Decision Memory belongs to a different organization.",
    );
  }

  if (
    params.outcome.organizationId !==
    params.organizationId
  ) {
    throw new Error(
      "Executive Decision Outcome belongs to a different organization.",
    );
  }

  if (
    params.learning.organizationId !==
    params.organizationId
  ) {
    throw new Error(
      "Executive Decision Learning belongs to a different organization.",
    );
  }
}

function validateLineage(params: {
  outcome:
    ExecutiveDecisionOutcome;

  reflection:
    ExecutiveDecisionReflection;

  learning:
    ExecutiveDecisionLearning;
}): void {
  if (
    params.reflection
      .executiveDecisionOutcomeId !==
    params.outcome.id
  ) {
    throw new Error(
      "Executive Decision Reflection must reference the supplied outcome.",
    );
  }

  if (
    params.learning
      .executiveDecisionReflectionId !==
    params.reflection.id
  ) {
    throw new Error(
      "Executive Decision Learning must reference the supplied reflection.",
    );
  }

  if (
    params.learning
      .executiveDecisionId !==
    params.outcome
      .executiveDecisionId
  ) {
    throw new Error(
      "Executive Decision Learning and Outcome must reference the same Executive Decision.",
    );
  }
}

/**
 * Updates canonical Executive Decision Memory with one completed
 * outcome-reflection-learning chain.
 *
 * This producer performs no new outcome evaluation, reflection,
 * learning synthesis, or runtime mutation.
 *
 * It validates lineage, deduplicates by stable identity, recalculates
 * memory statistics, and returns a new immutable memory object.
 */
export function updateExecutiveDecisionMemory({
  organizationId,
  existingMemory,
  outcome,
  reflection,
  learning,
  updatedAt =
    new Date().toISOString(),
}: UpdateExecutiveDecisionMemoryInput): ExecutiveDecisionMemory {
  validateOrganization({
    organizationId,
    existingMemory,
    outcome,
    learning,
  });

  validateLineage({
    outcome,
    reflection,
    learning,
  });

  const previousOutcomes =
    existingMemory?.outcomes ??
    [];

  const previousReflections =
    existingMemory?.reflections ??
    [];

  const previousLearnings =
    existingMemory?.learnings ??
    [];

  const outcomes =
    upsertById(
      previousOutcomes,
      outcome,
    );

  const reflections =
    upsertById(
      previousReflections,
      reflection,
    );

  const learnings =
    upsertById(
      previousLearnings,
      learning,
    );

  const rememberedDecisionIds =
    unique([
      ...(
        existingMemory
          ?.rememberedDecisionIds ??
        []
      ),

      outcome
        .executiveDecisionId,

      learning
        .executiveDecisionId,
    ]);

  const completedCount =
    completedDecisionCount(
      outcomes,
    );

  const unresolvedCount =
    unresolvedDecisionCount(
      outcomes,
    );

  const confidence =
    memoryConfidence({
      outcomes,
      reflections,
      learnings,

      previousConfidence:
        existingMemory
          ?.confidence,
    });

  return {
    organizationId,

    outcomes,

    reflections,

    learnings,

    rememberedDecisionIds,

    completedDecisionCount:
      completedCount,

    unresolvedDecisionCount:
      unresolvedCount,

    confidence,

    summary:
      buildSummary({
        outcomes,
        reflections,
        learnings,
        completedCount,
        unresolvedCount,
      }),

    updatedAt,
  };
}
