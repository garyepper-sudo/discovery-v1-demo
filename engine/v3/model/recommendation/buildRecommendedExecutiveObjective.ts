import type {
  ExecutiveAssessmentWithPrimaryJudgment,
} from "../judgment/buildExecutiveAssessment";

import type {
  OrganizationalCondition,
  OrganizationalState,
} from "../state/inferOrganizationalConditions";

import type {
  RecommendedExecutiveObjective,
  RecommendedExecutiveObjectiveType,
} from "./recommendedExecutiveObjectiveTypes";

type BuildRecommendedExecutiveObjectiveInput = {
  executiveAssessment:
    ExecutiveAssessmentWithPrimaryJudgment;

  organizationalState:
    OrganizationalState;

  organizationalConditions:
    OrganizationalCondition[];

  now?:
    string;
};

function clamp01(
  value:
    number,
): number {
  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function normalizeConfidence(
  value:
    unknown,
): number {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return 0.5;
  }

  return clamp01(
    value >
      1
      ? value /
        100
      : value,
  );
}

function titleCaseCondition(
  value:
    string,
): string {
  return value
    .replace(
      /([a-z0-9])([A-Z])/g,
      "$1 $2",
    )
    .replace(
      /[_-]+/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    )
    .trim();
}

function inferObjectiveType(
  conditionName:
    string,
): RecommendedExecutiveObjectiveType {
  const normalized =
    conditionName
      .toLowerCase();

  if (
    normalized.includes(
      "alignment",
    )
  ) {
    return "align";
  }

  if (
    normalized.includes(
      "decision",
    ) ||
    normalized.includes(
      "authority",
    ) ||
    normalized.includes(
      "operating model",
    )
  ) {
    return "clarify";
  }

  if (
    normalized.includes(
      "knowledge",
    ) ||
    normalized.includes(
      "continuity",
    )
  ) {
    return "preserve";
  }

  if (
    normalized.includes(
      "risk",
    ) ||
    normalized.includes(
      "volatility",
    )
  ) {
    return "reduce";
  }

  if (
    normalized.includes(
      "capacity",
    ) ||
    normalized.includes(
      "learning",
    ) ||
    normalized.includes(
      "coordination",
    )
  ) {
    return "increase";
  }

  return "stabilize";
}

function buildHeadline(
  objectiveType:
    RecommendedExecutiveObjectiveType,

  conditionName:
    string,
): string {
  const verbByType:
    Record<
      RecommendedExecutiveObjectiveType,
      string
    > = {
    increase:
      "Increase",

    reduce:
      "Reduce",

    stabilize:
      "Stabilize",

    clarify:
      "Clarify",

    align:
      "Align",

    protect:
      "Protect",

    preserve:
      "Preserve",
  };

  return `${verbByType[objectiveType]} ${conditionName}.`;
}

function buildExecutiveObjective(
  objectiveType:
    RecommendedExecutiveObjectiveType,

  conditionName:
    string,
): string {
  switch (
    objectiveType
  ) {
    case "increase":
      return `Leadership should improve ${conditionName} so the organization can convert strategic intent into reliable execution.`;

    case "reduce":
      return `Leadership should reduce the organizational constraint represented by ${conditionName}.`;

    case "clarify":
      return `Leadership should make ${conditionName} clear enough to support consistent operating judgment.`;

    case "align":
      return `Leadership should align ${conditionName} around a shared interpretation of priorities and tradeoffs.`;

    case "protect":
      return `Leadership should protect ${conditionName} from avoidable organizational pressure.`;

    case "preserve":
      return `Leadership should preserve and strengthen ${conditionName} so organizational knowledge remains reusable.`;

    case "stabilize":
      return `Leadership should stabilize ${conditionName} before pursuing lower-leverage improvements.`;
  }
}

function unique(
  values:
    Array<
      string | null | undefined
    >,
): string[] {
  return Array.from(
    new Set(
      values.filter(
        (
          value,
        ): value is string =>
          typeof value ===
            "string" &&
          value.trim().length >
            0,
      ),
    ),
  );
}

function findPrimaryCondition(
  input:
    BuildRecommendedExecutiveObjectiveInput,
): OrganizationalCondition | null {
  const assessmentPrimaryConditionId =
    (
      input.executiveAssessment
        .primaryJudgment as
        (
          typeof input.executiveAssessment.primaryJudgment & {
            primaryConditionId?:
              string;
          }
        )
    )
      ?.primaryConditionId;

  const statePrimaryConditionId =
    (
      input.organizationalState as
        OrganizationalState & {
          primaryConditionId?:
            string;
        }
    )
      .primaryConditionId;

  const targetId =
    assessmentPrimaryConditionId ??
    statePrimaryConditionId;

  if (
    targetId
  ) {
    const exact =
      input.organizationalConditions
        .find(
          (condition) =>
            condition.id ===
            targetId,
        );

    if (
      exact
    ) {
      return exact;
    }
  }

  const headline =
    input.executiveAssessment
      .primaryJudgment
      ?.headline ??
    input.executiveAssessment
      .summary ??
    "";

  const matchedByName =
    input.organizationalConditions
      .find(
        (condition) =>
          headline
            .toLowerCase()
            .includes(
              condition.name
                .toLowerCase(),
            ),
      );

  return (
    matchedByName ??
    input.organizationalConditions[
      0
    ] ??
    null
  );
}

export function buildRecommendedExecutiveObjective(
  input:
    BuildRecommendedExecutiveObjectiveInput,
): RecommendedExecutiveObjective {
  const primaryCondition =
    findPrimaryCondition(
      input,
    );

  if (
    !primaryCondition
  ) {
    throw new Error(
      "Recommended Executive Objective requires at least one organizational condition.",
    );
  }

  const conditionName =
    titleCaseCondition(
      primaryCondition.name,
    );

  const objectiveType =
    inferObjectiveType(
      conditionName,
    );

  const primaryJudgment =
    input.executiveAssessment
      .primaryJudgment;

  const supportingConditionIds =
    unique(
      [
        primaryCondition.id,

        ...(
          primaryJudgment
            ?.supportingConditionIds ??
          []
        ),
      ],
    );

  const confidence =
    clamp01(
      (
        normalizeConfidence(
          input.executiveAssessment
            .confidence,
        ) +
        normalizeConfidence(
          primaryJudgment
            ?.confidence,
        ) +
        normalizeConfidence(
          primaryCondition
            .confidence,
        )
      ) /
        3,
    );

  const assessmentId =
    (
      input.executiveAssessment as
        ExecutiveAssessmentWithPrimaryJudgment & {
          id?:
            string;
        }
    )
      .id ??
    "executiveAssessment-1";

  const primaryJudgmentId =
    (
      primaryJudgment as
        typeof primaryJudgment & {
          id?:
            string;
        }
    )
      ?.id ??
    null;

  const rationaleParts =
    unique(
      [
        `${conditionName} is the primary organizational constraint identified by Executive Assessment.`,

        primaryJudgment
          ?.rationale,

        primaryCondition
          .whyItMatters,

        supportingConditionIds.length >
          1
          ? `The objective is reinforced by ${supportingConditionIds.length - 1} related organizational condition${supportingConditionIds.length - 1 === 1 ? "" : "s"}.`
          : null,
      ],
    );

  const uncertaintySummary =
    primaryJudgment
      ?.uncertaintySummary ??
    primaryCondition
      .uncertaintySummary ??
    "Additional longitudinal evidence would increase confidence that this remains the highest-leverage executive objective.";

  return {
    id:
      `recommended-objective-${primaryCondition.id}`,

    headline:
      buildHeadline(
        objectiveType,
        conditionName,
      ),

    executiveObjective:
      buildExecutiveObjective(
        objectiveType,
        conditionName,
      ),

    objectiveType,

    targetConditionId:
      primaryCondition.id,

    targetConditionName:
      conditionName,

    rationale:
      rationaleParts.join(
        " ",
      ),

    supportingAssessmentId:
      assessmentId,

    supportingPrimaryJudgmentId:
      primaryJudgmentId,

    supportingConditionIds,

    confidence,

    uncertaintySummary,

    boundaries: {
      doesNotRecommendStrategy:
        true,

      doesNotRecommendIntervention:
        true,

      doesNotOptimize:
        true,

      doesNotSimulate:
        true,
    },

    createdAt:
      input.now ??
      new Date()
        .toISOString(),
  };
}

export type {
  BuildRecommendedExecutiveObjectiveInput,
};
