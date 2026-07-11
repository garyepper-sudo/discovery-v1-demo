type ScoredBelief = {
  confidence?: number;

  priority?: {
    total?: number;
  };

  supportingEvidenceIds?: string[];
  supportingMechanismIds?: string[];
  supportingPatternIds?: string[];
  supportingConceptIds?: string[];
};

type ScoredUnderstanding = {
  confidence?: number;
  explanatoryPower?: number;
  coverage?: number;
  stability?: number;
  supportCount?: number;
};

type ScoredInvestigationOpportunity = {
  expectedConfidenceGain?: number;
  executiveLeverage?: "low" | "medium" | "high" | string;
};

function normalizeScore(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) {
    return 0;
  }

  return value > 1 ? value / 100 : value;
}

function count(items: unknown[] | undefined): number {
  return items?.length ?? 0;
}

function scoreBelief(belief: ScoredBelief): number {
  const confidence = normalizeScore(belief.confidence);
  const priority = normalizeScore(belief.priority?.total);

  const evidenceSupport = Math.min(
    count(belief.supportingEvidenceIds) / 10,
    1,
  );

  const mechanismSupport = Math.min(
    count(belief.supportingMechanismIds) / 5,
    1,
  );

  const patternSupport = Math.min(
    count(belief.supportingPatternIds) / 10,
    1,
  );

  const conceptSupport = Math.min(
    count(belief.supportingConceptIds) / 5,
    1,
  );

  return (
    confidence * 0.45 +
    priority * 0.15 +
    evidenceSupport * 0.1 +
    mechanismSupport * 0.1 +
    patternSupport * 0.1 +
    conceptSupport * 0.1
  );
}

function scoreUnderstanding(
  understanding: ScoredUnderstanding,
): number {
  const confidence = normalizeScore(
    understanding.confidence,
  );

  const explanatoryPower = normalizeScore(
    understanding.explanatoryPower,
  );

  const coverage = normalizeScore(
    understanding.coverage,
  );

  const stability = normalizeScore(
    understanding.stability,
  );

  const support = Math.min(
    (understanding.supportCount ?? 0) / 10,
    1,
  );

  return (
    confidence * 0.3 +
    explanatoryPower * 0.3 +
    coverage * 0.15 +
    stability * 0.15 +
    support * 0.1
  );
}

function scoreInvestigationOpportunity(
  opportunity: ScoredInvestigationOpportunity,
): number {
  const confidenceGain = normalizeScore(
    opportunity.expectedConfidenceGain,
  );

  const leverageScore =
    opportunity.executiveLeverage === "high"
      ? 1
      : opportunity.executiveLeverage === "medium"
        ? 0.65
        : opportunity.executiveLeverage === "low"
          ? 0.35
          : 0;

  return confidenceGain * 0.7 + leverageScore * 0.3;
}

/**
 * Selects the organizational belief with the strongest
 * combined confidence, priority, and supporting cognition.
 *
 * Array position is never treated as executive importance.
 */
export function choosePrimaryBelief<T extends ScoredBelief>(
  beliefs: readonly T[] | undefined,
): T | undefined {
  if (!beliefs || beliefs.length === 0) {
    return undefined;
  }

  return [...beliefs].sort(
    (left, right) =>
      scoreBelief(right) - scoreBelief(left),
  )[0];
}

/**
 * Selects the understanding with the strongest combined
 * explanatory power, confidence, coverage, stability,
 * and support.
 */
export function choosePrimaryUnderstanding<
  T extends ScoredUnderstanding,
>(
  understandings: readonly T[] | undefined,
): T | undefined {
  if (!understandings || understandings.length === 0) {
    return undefined;
  }

  return [...understandings].sort(
    (left, right) =>
      scoreUnderstanding(right) -
      scoreUnderstanding(left),
  )[0];
}

/**
 * Selects the investigation expected to create the greatest
 * executive value through confidence gain and leverage.
 */
export function choosePrimaryInvestigationOpportunity<
  T extends ScoredInvestigationOpportunity,
>(
  opportunities: readonly T[] | undefined,
): T | undefined {
  if (!opportunities || opportunities.length === 0) {
    return undefined;
  }

  return [...opportunities].sort(
    (left, right) =>
      scoreInvestigationOpportunity(right) -
      scoreInvestigationOpportunity(left),
  )[0];
}