import type {
  BuildExecutiveRisksInput,
  ExecutiveRiskConditionLike,
  ExecutiveRiskHorizon,
  ExecutiveRiskItem,
  ExecutiveRiskSeverity,
  ExecutiveRisks,
} from "./executiveRiskTypes";

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

function conditionRiskScore(
  condition: ExecutiveRiskConditionLike,
  isPrimary: boolean,
): number {
  const strength =
    condition.strength ?? 0.5;

  const confidence =
    condition.confidence ?? 0.5;

  const statusWeight =
    condition.status === "critical"
      ? 1
      : condition.status === "constrained"
        ? 0.8
        : condition.status === "strained"
          ? 0.7
          : 0.5;

  const trendWeight =
    condition.trend === "deteriorating"
      ? 1
      : condition.trend === "worsening"
        ? 0.95
        : condition.trend === "improving"
          ? 0.25
          : 0.55;

  const primaryWeight =
    isPrimary ? 1 : 0.72;

  return clamp01(
    strength * 0.32 +
    confidence * 0.28 +
    statusWeight * 0.18 +
    trendWeight * 0.12 +
    primaryWeight * 0.1,
  );
}

function severityForScore(
  score: number,
): ExecutiveRiskSeverity {
  if (score >= 0.82) {
    return "critical";
  }

  if (score >= 0.68) {
    return "high";
  }

  if (score >= 0.52) {
    return "moderate";
  }

  return "watch";
}

function horizonForCondition(
  condition: ExecutiveRiskConditionLike,
  isPrimary: boolean,
): ExecutiveRiskHorizon {
  if (
    isPrimary ||
    condition.trend === "deteriorating" ||
    condition.trend === "worsening"
  ) {
    return "immediate";
  }

  if (
    condition.priority === "high" ||
    condition.priority === "critical"
  ) {
    return "near_term";
  }

  return "longer_term";
}

function fallbackRiskStatement(
  condition: ExecutiveRiskConditionLike,
  isPrimary: boolean,
): string {
  if (isPrimary) {
    return `${condition.name} will continue to constrain organizational performance if leadership does not address it.`;
  }

  return `${condition.name} is likely to worsen as the primary constraint continues to propagate through the organization.`;
}

function buildRiskStatement(
  condition: ExecutiveRiskConditionLike,
  isPrimary: boolean,
): string {
  return (
    condition.riskIfIgnored?.trim() ||
    fallbackRiskStatement(
      condition,
      isPrimary,
    )
  );
}

function buildRiskRationale(
  condition: ExecutiveRiskConditionLike,
  primary: ExecutiveRiskConditionLike,
  isPrimary: boolean,
): string {
  if (isPrimary) {
    return (
      condition.whyItMatters?.trim() ||
      condition.summary?.trim() ||
      `${condition.name} is the strongest currently supported organizational constraint.`
    );
  }

  return (
    condition.whyItMatters?.trim() ||
    condition.summary?.trim() ||
    `${condition.name} is connected to ${primary.name} and may deteriorate if the primary constraint persists.`
  );
}

function resolveRiskConditions(
  input: BuildExecutiveRisksInput,
): ExecutiveRiskConditionLike[] {
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
      `Cannot build Executive Risks: condition ${input.primaryConditionId} was not found.`,
    );
  }

  const propagatedIds = unique([
    ...(primary.downstreamConditionIds ?? []),
    ...(input.dominantCausalChain
      ?.supportingConditionIds ?? []),
  ]);

  const related = propagatedIds
    .filter(
      (id) => id !== primary.id,
    )
    .map((id) => byId.get(id))
    .filter(
      (
        condition,
      ): condition is ExecutiveRiskConditionLike =>
        Boolean(condition),
    )
    .sort(
      (left, right) =>
        conditionRiskScore(
          right,
          false,
        ) -
        conditionRiskScore(
          left,
          false,
        ),
    )
    .slice(0, 3);

  return [
    primary,
    ...related,
  ];
}

export function buildExecutiveRisks(
  input: BuildExecutiveRisksInput,
): ExecutiveRisks {
  const conditions =
    resolveRiskConditions(input);

  const primary = conditions[0];

  const risks: ExecutiveRiskItem[] =
    conditions.map(
      (condition, index) => {
        const isPrimary =
          index === 0;

        const score =
          conditionRiskScore(
            condition,
            isPrimary,
          );

        return {
          id:
            `executive-risk-${condition.id}`,

          conditionId:
            condition.id,

          label:
            condition.name,

          severity:
            severityForScore(
              score,
            ),

          horizon:
            horizonForCondition(
              condition,
              isPrimary,
            ),

          statement:
            buildRiskStatement(
              condition,
              isPrimary,
            ),

          rationale:
            buildRiskRationale(
              condition,
              primary,
              isPrimary,
            ),

          supportingConditionIds:
            isPrimary
              ? unique([
                  ...(condition.upstreamConditionIds ?? []),
                  ...(condition.downstreamConditionIds ?? []),
                ])
              : [primary.id],

          supportingMechanismIds:
            unique(
              condition.supportingMechanismIds ?? [],
            ),

          confidence:
            clamp01(
              condition.confidence ??
              input.dominantCausalChain
                ?.confidence ??
              0.5,
            ),
        };
      },
    );

  const confidenceInputs = [
    primary.confidence ?? 0.5,
    input.dominantCausalChain
      ?.confidence ?? 0.5,
    ...risks.map(
      (risk) => risk.confidence,
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

  const propagatedRiskNames =
    risks
      .slice(1)
      .map((risk) => risk.label);

  const executiveRiskSummary =
    propagatedRiskNames.length > 0
      ? `If ${primary.name} remains unaddressed, the most credible organizational risks are continued pressure on ${propagatedRiskNames.join(
          ", ",
        )}.`
      : `If ${primary.name} remains unaddressed, organizational performance is likely to remain constrained.`;

  return {
    id:
      `executive-risks-${primary.id}`,

    generatedAt:
      input.now ??
      new Date().toISOString(),

    primaryConditionId:
      primary.id,

    risks,

    headline:
      `Ignoring ${primary.name} creates material organizational risk.`,

    executiveRiskSummary,

    boundaries: [
      "Executive Risks identifies plausible consequences of an unresolved condition; it does not simulate a future organizational state.",
      "Executive Risks does not select an intervention or recommend a course of action.",
      "Risk severity reflects current evidence and causal structure, not certainty that an outcome will occur.",
    ],

    confidence,

    uncertaintySummary:
      primary.uncertaintySummary ??
      input.dominantCausalChain
        ?.uncertaintySummary ??
      "Executive risks reflect the strongest currently supported consequences of leaving the primary condition unresolved.",
  };
}
