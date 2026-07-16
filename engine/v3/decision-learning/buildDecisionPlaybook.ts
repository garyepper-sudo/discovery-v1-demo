import type {
  DecisionPlaybook,
  DecisionPlaybookEntry,
  DecisionPlaybookEntryStatus,
} from "../model/decision-learning/decisionPlaybook";

import type {
  ExecutiveDecisionLearning,
} from "../model/decision-learning/executiveDecisionLearning";

import type {
  ExecutiveDecisionMemory,
} from "../model/decision-learning/executiveDecisionMemory";

export type BuildDecisionPlaybookInput = {
  memory:
    ExecutiveDecisionMemory;

  updatedAt?: string;
};

type LearningGroup = {
  key: string;

  learnings:
    ExecutiveDecisionLearning[];
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

function sortStrings(
  values: string[],
): string[] {
  return unique(
    values,
  ).sort(
    (
      left,
      right,
    ) =>
      left.localeCompare(
        right,
      ),
  );
}

function learningGroupKey(
  learning:
    ExecutiveDecisionLearning,
): string {
  return [
    learning.type,

    sortStrings(
      learning
        .applicableInterventionTypes,
    ).join(","),

    sortStrings(
      learning
        .applicableConditionIds,
    ).join(","),

    sortStrings(
      learning
        .applicableConstraintTypes,
    ).join(","),
  ].join("|");
}

function groupLearnings(
  learnings:
    ExecutiveDecisionLearning[],
): LearningGroup[] {
  const groups =
    new Map<
      string,
      ExecutiveDecisionLearning[]
    >();

  for (
    const learning of
    learnings
  ) {
    if (
      learning.status ===
      "retired"
    ) {
      continue;
    }

    const key =
      learningGroupKey(
        learning,
      );

    const existing =
      groups.get(
        key,
      ) ??
      [];

    groups.set(
      key,
      [
        ...existing,
        learning,
      ],
    );
  }

  return Array.from(
    groups.entries(),
  ).map(
    (
      [
        key,
        groupedLearnings,
      ],
    ) => ({
      key,
      learnings:
        groupedLearnings,
    }),
  );
}

function totalSupportCount(
  learnings:
    ExecutiveDecisionLearning[],
): number {
  return learnings.reduce(
    (
      total,
      learning,
    ) =>
      total +
      Math.max(
        1,
        learning.supportCount,
      ),
    0,
  );
}

function netConfidenceAdjustment(
  learnings:
    ExecutiveDecisionLearning[],
): number {
  const totalWeight =
    learnings.reduce(
      (
        total,
        learning,
      ) =>
        total +
        Math.max(
          1,
          learning.supportCount,
        ),
      0,
    );

  if (
    totalWeight === 0
  ) {
    return 0;
  }

  return (
    learnings.reduce(
      (
        total,
        learning,
      ) =>
        total +
        learning
          .confidenceAdjustment *
          Math.max(
            1,
            learning.supportCount,
          ),
      0,
    ) /
    totalWeight
  );
}

function entryConfidence(
  learnings:
    ExecutiveDecisionLearning[],
  supportCount: number,
): number {
  const weightedConfidence =
    learnings.reduce(
      (
        total,
        learning,
      ) =>
        total +
        learning.confidence *
          Math.max(
            1,
            learning.supportCount,
          ),
      0,
    ) /
    Math.max(
      1,
      supportCount,
    );

  const maturityMultiplier =
    supportCount >= 4
      ? 1
      : supportCount >= 2
        ? 0.9
        : 0.75;

  return clamp01(
    weightedConfidence *
      maturityMultiplier,
  );
}

function determineStatus(params: {
  learnings:
    ExecutiveDecisionLearning[];

  supportCount: number;

  confidence: number;

  netAdjustment: number;
}): DecisionPlaybookEntryStatus {
  const {
    learnings,
    supportCount,
    confidence,
    netAdjustment,
  } = params;

  const allWeakened =
    learnings.every(
      (learning) =>
        learning.status ===
          "weakened" ||
        learning
          .confidenceAdjustment <
          0,
    );

  if (
    allWeakened &&
    supportCount >= 2
  ) {
    return "retired";
  }

  if (
    supportCount >= 4 &&
    confidence >= 0.8 &&
    netAdjustment > 0
  ) {
    return "canonical";
  }

  if (
    supportCount >= 2 &&
    confidence >= 0.65
  ) {
    return "supported";
  }

  return "provisional";
}

function strongestLearning(
  learnings:
    ExecutiveDecisionLearning[],
): ExecutiveDecisionLearning {
  return learnings
    .slice()
    .sort(
      (
        left,
        right,
      ) => {
        if (
          right.supportCount !==
          left.supportCount
        ) {
          return (
            right.supportCount -
            left.supportCount
          );
        }

        if (
          right.confidence !==
          left.confidence
        ) {
          return (
            right.confidence -
            left.confidence
          );
        }

        return left.id.localeCompare(
          right.id,
        );
      },
    )[0];
}

function buildTitle(
  strongest:
    ExecutiveDecisionLearning,
): string {
  const interventionLabel =
    strongest
      .applicableInterventionTypes
      .length > 0
      ? strongest
          .applicableInterventionTypes
          .map(
            (value) =>
              value
                .split("-")
                .map(
                  (word) =>
                    word
                      .charAt(0)
                      .toUpperCase() +
                    word.slice(1),
                )
                .join(" "),
          )
          .join(" / ")
      : "Executive Intervention";

  switch (
    strongest.type
  ) {
    case "intervention-effectiveness":
      return `${interventionLabel} Effectiveness`;

    case "constraint-validity":
      return `${interventionLabel} Constraint Pattern`;

    case "prediction-quality":
      return `${interventionLabel} Prediction Pattern`;

    case "assumption-quality":
      return `${interventionLabel} Assumption Pattern`;

    case "mechanism-validity":
      return `${interventionLabel} Mechanism Pattern`;

    case "theory-validity":
      return `${interventionLabel} Theory Pattern`;

    case "decision-pattern":
      return `${interventionLabel} Decision Pattern`;

    case "other":
      return `${interventionLabel} Executive Pattern`;
  }
}

function buildGuidance(params: {
  strongest:
    ExecutiveDecisionLearning;

  netAdjustment: number;

  supportCount: number;
}): string {
  const {
    strongest,
    netAdjustment,
    supportCount,
  } = params;

  if (
    netAdjustment > 0
  ) {
    return `${strongest.statement} Discovery has observed ${supportCount} supporting decision outcome(s), so this pattern should positively influence similar future decisions while its assumptions and constraints remain valid.`;
  }

  if (
    netAdjustment < 0
  ) {
    return `${strongest.statement} Discovery has observed ${supportCount} decision outcome(s) indicating that this pattern should be treated cautiously or avoided until the underlying reasoning is revised.`;
  }

  return `${strongest.statement} Discovery has observed ${supportCount} relevant decision outcome(s), but the accumulated evidence remains mixed and should not materially increase or decrease recommendation confidence yet.`;
}

function buildRationale(
  learnings:
    ExecutiveDecisionLearning[],
): string {
  return unique(
    learnings.map(
      (learning) =>
        learning.rationale,
    ),
  ).join(" ");
}

function buildFalsifyingEvidence(params: {
  netAdjustment: number;

  interventionTypes:
    string[];

  conditionIds:
    string[];
}): string[] {
  const interventionLabel =
    params
      .interventionTypes
      .join(", ") ||
    "the represented intervention";

  const conditionLabel =
    params
      .conditionIds
      .join(", ") ||
    "the applicable organizational conditions";

  if (
    params.netAdjustment > 0
  ) {
    return [
      `Repeated future outcomes in which ${interventionLabel} fails to improve ${conditionLabel}.`,
      `Evidence that the observed benefits were caused by unrelated organizational changes rather than the represented intervention.`,
      `Evidence that required assumptions or constraints do not hold in otherwise similar decisions.`,
    ];
  }

  if (
    params.netAdjustment < 0
  ) {
    return [
      `Repeated future outcomes in which ${interventionLabel} succeeds under comparable conditions.`,
      `Evidence that prior failures were caused primarily by implementation defects rather than the intervention pattern itself.`,
      `Evidence that revised assumptions or constraints reliably reverse the prior negative outcomes.`,
    ];
  }

  return [
    `Additional decision outcomes that consistently move confidence in either a positive or negative direction.`,
    `Evidence clarifying whether ${interventionLabel} materially affects ${conditionLabel}.`,
  ];
}

function supportingOutcomeIds(params: {
  memory:
    ExecutiveDecisionMemory;

  learnings:
    ExecutiveDecisionLearning[];
}): string[] {
  const decisionIds =
    new Set(
      params.learnings.map(
        (learning) =>
          learning
            .executiveDecisionId,
      ),
    );

  return unique(
    params.memory.outcomes
      .filter(
        (outcome) =>
          decisionIds.has(
            outcome
              .executiveDecisionId,
          ),
      )
      .map(
        (outcome) =>
          outcome.id,
      ),
  );
}

function buildEntryId(params: {
  organizationId: string;

  groupKey: string;
}): string {
  const normalizedKey =
    params.groupKey
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      );

  return [
    "decision-playbook-entry",
    params.organizationId,
    normalizedKey ||
      "general",
  ].join("-");
}

function buildEntry(params: {
  memory:
    ExecutiveDecisionMemory;

  group:
    LearningGroup;

  updatedAt: string;
}): DecisionPlaybookEntry {
  const strongest =
    strongestLearning(
      params.group.learnings,
    );

  const supportCount =
    totalSupportCount(
      params.group.learnings,
    );

  const netAdjustment =
    netConfidenceAdjustment(
      params.group.learnings,
    );

  const confidence =
  entryConfidence(
    params.group.learnings,
    supportCount,
  );

  const status =
    determineStatus({
      learnings:
        params.group.learnings,
      supportCount,
      confidence,
      netAdjustment,
    });

  const interventionTypes =
    unique(
      params.group.learnings
        .flatMap(
          (learning) =>
            learning
              .applicableInterventionTypes,
        ),
    );

  const conditionIds =
    unique(
      params.group.learnings
        .flatMap(
          (learning) =>
            learning
              .applicableConditionIds,
        ),
    );

  const constraintTypes =
    unique(
      params.group.learnings
        .flatMap(
          (learning) =>
            learning
              .applicableConstraintTypes,
        ),
    );

  return {
    id:
      buildEntryId({
        organizationId:
          params.memory
            .organizationId,
        groupKey:
          params.group.key,
      }),

    organizationId:
      params.memory
        .organizationId,

    title:
      buildTitle(
        strongest,
      ),

    applicableDecisionTypes:
      [],

    applicableConditionIds:
      conditionIds,

    recommendedInterventionTypes:
      netAdjustment > 0
        ? interventionTypes
        : [],

    discouragedInterventionTypes:
      netAdjustment < 0
        ? interventionTypes
        : [],

    guidance:
      buildGuidance({
        strongest,
        netAdjustment,
        supportCount,
      }),

    rationale:
      buildRationale(
        params.group.learnings,
      ),

    commonConstraintTypes:
      constraintTypes,

    requiredAssumptions:
      [],

    falsifyingEvidence:
      buildFalsifyingEvidence({
        netAdjustment,
        interventionTypes,
        conditionIds,
      }),

    supportingLearningIds:
      unique(
        params.group.learnings
          .map(
            (learning) =>
              learning.id,
          ),
      ),

    supportingOutcomeIds:
      supportingOutcomeIds({
        memory:
          params.memory,
        learnings:
          params.group
            .learnings,
      }),

    supportCount,

    confidence,

    status,

    createdAt:
      params.group.learnings
        .map(
          (learning) =>
            learning.createdAt,
        )
        .sort()[0] ??
      params.updatedAt,

    updatedAt:
      params.updatedAt,
  };
}

function buildPlaybookSummary(
  entries:
    DecisionPlaybookEntry[],
): string {
  const canonicalCount =
    entries.filter(
      (entry) =>
        entry.status ===
        "canonical",
    ).length;

  const supportedCount =
    entries.filter(
      (entry) =>
        entry.status ===
        "supported",
    ).length;

  const provisionalCount =
    entries.filter(
      (entry) =>
        entry.status ===
        "provisional",
    ).length;

  const retiredCount =
    entries.filter(
      (entry) =>
        entry.status ===
        "retired",
    ).length;

  return [
    `Discovery's decision playbook contains ${entries.length} reusable executive pattern(s).`,
    `${canonicalCount} are canonical, ${supportedCount} are supported, ${provisionalCount} remain provisional, and ${retiredCount} are retired.`,
  ].join(" ");
}

function playbookConfidence(
  entries:
    DecisionPlaybookEntry[],
  memoryConfidence: number,
): number {
  if (
    entries.length === 0
  ) {
    return clamp01(
      memoryConfidence,
    );
  }

  return clamp01(
    average([
      average(
        entries.map(
          (entry) =>
            entry.confidence,
        ),
      ),
      memoryConfidence,
    ]),
  );
}

/**
 * Builds reusable executive guidance from accumulated Decision Memory.
 *
 * This producer performs no simulation, outcome evaluation, reflection,
 * or new organizational reasoning.
 *
 * It groups compatible learning objects, aggregates their support,
 * matures confidence and status, and returns an immutable Decision Playbook.
 */
export function buildDecisionPlaybook({
  memory,
  updatedAt =
    new Date().toISOString(),
}: BuildDecisionPlaybookInput): DecisionPlaybook {
  const groups =
    groupLearnings(
      memory.learnings,
    );

  const entries =
    groups
      .map(
        (group) =>
          buildEntry({
            memory,
            group,
            updatedAt,
          }),
      )
      .sort(
        (
          left,
          right,
        ) => {
          if (
            right.supportCount !==
            left.supportCount
          ) {
            return (
              right.supportCount -
              left.supportCount
            );
          }

          if (
            right.confidence !==
            left.confidence
          ) {
            return (
              right.confidence -
              left.confidence
            );
          }

          return left.id.localeCompare(
            right.id,
          );
        },
      );

  return {
    organizationId:
      memory.organizationId,

    entries,

    summary:
      buildPlaybookSummary(
        entries,
      ),

    confidence:
      playbookConfidence(
        entries,
        memory.confidence,
      ),

    updatedAt,
  };
}
