import type {
  BuildExecutiveFocusInput,
  ExecutiveFocus,
  ExecutiveFocusArea,
  ExecutiveFocusConditionLike,
  ExecutiveFocusPriority,
} from "./executiveFocusTypes";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function unique(values: string[]): string[] {
  return Array.from(
    new Set(
      values.filter(
        (value) => value.length > 0,
      ),
    ),
  );
}

function focusPriority(
  condition: ExecutiveFocusConditionLike,
  isPrimary: boolean,
): ExecutiveFocusPriority {
  if (isPrimary) {
    return "immediate";
  }

  if (
    condition.status === "deteriorating" ||
    condition.priority === "high" ||
    condition.priority === "critical"
  ) {
    return "near_term";
  }

  return "monitor";
}

function focusRationale(
  condition: ExecutiveFocusConditionLike,
  isPrimary: boolean,
): string {
  if (isPrimary) {
    return (
      condition.recommendedExecutiveAction?.trim() ||
      condition.whyItMatters?.trim() ||
      condition.summary?.trim() ||
      `${condition.name} is the highest-leverage organizational condition.`
    );
  }

  return (
    condition.whyItMatters?.trim() ||
    condition.summary?.trim() ||
    `${condition.name} reinforces the primary organizational constraint.`
  );
}

function resolveFocusConditions(
  input: BuildExecutiveFocusInput,
): ExecutiveFocusConditionLike[] {
  const byId = new Map(
    input.conditions.map(
      (condition) => [condition.id, condition],
    ),
  );

  const primary = byId.get(
    input.primaryConditionId,
  );

  if (!primary) {
    throw new Error(
      `Cannot build Executive Focus: condition ${input.primaryConditionId} was not found.`,
    );
  }

  const supportingIds =
    input.dominantCausalChain
      ?.supportingConditionIds ?? [
        ...(primary.upstreamConditionIds ?? []),
        ...(primary.downstreamConditionIds ?? []),
      ];

  const supporting = unique(
    supportingIds,
  )
    .map((id) => byId.get(id))
    .filter(
      (
        condition,
      ): condition is ExecutiveFocusConditionLike =>
        Boolean(condition),
    )
    .sort(
      (left, right) =>
        (right.strength ?? 0) -
        (left.strength ?? 0),
    )
    .slice(0, 3);

  return [
    primary,
    ...supporting,
  ];
}

function buildDirection(
  primary: ExecutiveFocusConditionLike,
): string {
  const action =
    primary.recommendedExecutiveAction?.trim();

  if (action) {
    return action;
  }

  return `Leadership should concentrate attention on improving ${primary.name} before treating downstream symptoms or expanding capacity elsewhere.`;
}

function buildBoundaries(
  primary: ExecutiveFocusConditionLike,
): string[] {
  return [
    `Do not treat downstream symptoms as substitutes for improving ${primary.name}.`,
    "Do not convert executive focus into a specific intervention until Recommendation evaluates alternatives.",
    "Do not overstate certainty where causal evidence remains incomplete.",
  ];
}

export function buildExecutiveFocus(
  input: BuildExecutiveFocusInput,
): ExecutiveFocus {
  const focusConditions =
    resolveFocusConditions(input);

  const primary =
    focusConditions[0];

  const focusAreas:
    ExecutiveFocusArea[] =
    focusConditions.map(
      (condition, index) => ({
        id:
          `executive-focus-area-${condition.id}`,

        conditionId:
          condition.id,

        label:
          condition.name,

        priority:
          focusPriority(
            condition,
            index === 0,
          ),

        rationale:
          focusRationale(
            condition,
            index === 0,
          ),

        supportingMechanismIds:
          unique(
            condition.supportingMechanismIds ??
            [],
          ),
      }),
    );

  const confidenceInputs = [
    primary.confidence ?? 0.5,
    input.dominantCausalChain
      ?.confidence ?? 0.5,
    ...focusConditions
      .slice(1)
      .map(
        (condition) =>
          condition.confidence ?? 0.5,
      ),
  ];

  const confidence =
    clamp01(
      confidenceInputs.reduce(
        (sum, value) => sum + value,
        0,
      ) /
      confidenceInputs.length,
    );

  return {
    id:
      `executive-focus-${primary.id}`,

    generatedAt:
      input.now ??
      new Date().toISOString(),

    primaryConditionId:
      primary.id,

    focusAreas,

    headline:
      `Executive attention should center on ${primary.name}.`,

    executiveDirection:
      buildDirection(primary),

    boundaries:
      buildBoundaries(primary),

    confidence,

    uncertaintySummary:
      primary.uncertaintySummary ??
      input.dominantCausalChain
        ?.uncertaintySummary ??
      "Executive focus reflects the strongest currently supported organizational constraint.",
  };
}
