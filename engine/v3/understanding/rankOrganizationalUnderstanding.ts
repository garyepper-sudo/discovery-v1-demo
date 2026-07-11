import type {
  OrganizationalUnderstandingItem,
} from "../runtime/organizationalUnderstandingState";

function clamp01(value: number | undefined): number {
  if (
    value === undefined ||
    !Number.isFinite(value)
  ) {
    return 0;
  }

  return Math.max(0, Math.min(1, value));
}

function normalizedSupportCount(
  supportCount: number | undefined,
): number {
  return clamp01((supportCount ?? 0) / 10);
}

function evidenceDiversityScore(
  understanding: OrganizationalUnderstandingItem,
): number {
  const representedLayers = [
    understanding.evidenceIds.length > 0,
    understanding.observationIds.length > 0,
    understanding.themeIds.length > 0,
    understanding.beliefIds.length > 0,
    understanding.mechanismIds.length > 0,
  ].filter(Boolean).length;

  return representedLayers / 5;
}

function contradictionPenalty(
  understanding: OrganizationalUnderstandingItem,
): number {
  return Math.min(
    understanding.contradictionIds.length * 0.05,
    0.2,
  );
}

function sourceScore(
  source: OrganizationalUnderstandingItem["source"],
): number {
  if (source === "executive-assessment") {
    return 1;
  }

  if (source === "investigation-understanding") {
    return 0.45;
  }

  if (source === "legacy") {
    return 0.25;
  }

  return 0.1;
}

/**
 * Canonical ranking for organizational understandings.
 *
 * This function determines which understanding currently provides
 * the strongest combination of explanatory value, confidence,
 * organizational coverage, stability, cognitive support, and
 * synthesis provenance.
 */
export function rankOrganizationalUnderstanding(
  understanding: OrganizationalUnderstandingItem,
): number {
  const explanatoryPower = clamp01(
    understanding.explanatoryPower,
  );

  const confidence = clamp01(
    understanding.confidence,
  );

  const coverage = clamp01(
    understanding.coverage,
  );

  const stability = clamp01(
    understanding.stability,
  );

  const support = normalizedSupportCount(
    understanding.supportCount,
  );

  const evidenceDiversity =
    evidenceDiversityScore(understanding);

  const novelty = clamp01(
    understanding.novelty,
  );

  const provenance = sourceScore(
    understanding.source,
  );

  return clamp01(
    explanatoryPower * 0.25 +
      confidence * 0.17 +
      coverage * 0.13 +
      stability * 0.13 +
      support * 0.08 +
      evidenceDiversity * 0.07 +
      novelty * 0.02 +
      provenance * 0.15 -
      contradictionPenalty(understanding),
  );
}

/**
 * Returns understandings ordered from strongest to weakest.
 *
 * Stable tie-breakers prevent array insertion order from determining
 * the executive result.
 */
export function rankOrganizationalUnderstandings<
  T extends OrganizationalUnderstandingItem,
>(
  understandings: readonly T[],
): T[] {
  return [...understandings].sort(
    (left, right) => {
      const scoreDifference =
        rankOrganizationalUnderstanding(right) -
        rankOrganizationalUnderstanding(left);

      if (Math.abs(scoreDifference) > 0.000001) {
        return scoreDifference;
      }

      const sourceDifference =
        sourceScore(right.source) -
        sourceScore(left.source);

      if (Math.abs(sourceDifference) > 0.000001) {
        return sourceDifference;
      }

      const confidenceDifference =
        right.confidence - left.confidence;

      if (Math.abs(confidenceDifference) > 0.000001) {
        return confidenceDifference;
      }

      const supportDifference =
        right.supportCount - left.supportCount;

      if (supportDifference !== 0) {
        return supportDifference;
      }

      return left.id.localeCompare(right.id);
    },
  );
}

/**
 * Selects Discovery's strongest current organizational understanding.
 */
export function choosePrimaryOrganizationalUnderstanding<
  T extends OrganizationalUnderstandingItem,
>(
  understandings: readonly T[] | undefined,
): T | undefined {
  if (!understandings || understandings.length === 0) {
    return undefined;
  }

  return rankOrganizationalUnderstandings(
    understandings,
  )[0];
}
