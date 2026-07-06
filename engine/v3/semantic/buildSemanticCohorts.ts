import type {
  SemanticCohort,
  SemanticObservation,
  SemanticObservationSourceType,
  SemanticStrength,
} from "./types";

export type BuildSemanticCohortsParams = {
  observations: SemanticObservation[];
  minimumSharedKeywords?: number;
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferStrength(score: number): SemanticStrength {
  if (score >= 0.75) return "strong";
  if (score >= 0.45) return "moderate";
  return "weak";
}

function normalizedObservationKeywords(
  observation: SemanticObservation,
): string[] {
  return unique(observation.keywords.map(normalizeToken)).filter(Boolean);
}

function sharedKeywords(
  a: SemanticObservation,
  b: SemanticObservation,
): string[] {
  const bKeywords = new Set(normalizedObservationKeywords(b));

  return normalizedObservationKeywords(a).filter((keyword) =>
    bKeywords.has(keyword),
  );
}

function cohortKeywordCenter(cohort: SemanticObservation[]): string[] {
  return unique(
    cohort.flatMap((observation) => normalizedObservationKeywords(observation)),
  ).filter(Boolean);
}

function semanticOverlapRatio(a: string[], b: string[]): number {
  const aSet = new Set(a.map(normalizeToken).filter(Boolean));
  const bSet = new Set(b.map(normalizeToken).filter(Boolean));

  if (aSet.size === 0 || bSet.size === 0) return 0;

  let overlap = 0;

  for (const value of aSet) {
    if (bSet.has(value)) overlap += 1;
  }

  return clamp01(overlap / Math.min(aSet.size, bSet.size));
}

function shouldJoinCohort(params: {
  observation: SemanticObservation;
  cohort: SemanticObservation[];
  minimumSharedKeywords: number;
}): boolean {
  const observationKeywords = normalizedObservationKeywords(params.observation);
  const centerKeywords = cohortKeywordCenter(params.cohort);

  const strongestPairwiseMatch = Math.max(
    ...params.cohort.map((existing) =>
      sharedKeywords(params.observation, existing).length,
    ),
  );

  const centerOverlap = semanticOverlapRatio(observationKeywords, centerKeywords);

  const cohortIsBroad = centerKeywords.length >= 32 || params.cohort.length >= 8;

  if (strongestPairwiseMatch < params.minimumSharedKeywords) {
    return false;
  }

  if (cohortIsBroad) {
    return centerOverlap >= 0.32;
  }

  return centerOverlap >= 0.2;
}

function collectIds(
  observations: SemanticObservation[],
  key: keyof Pick<
    SemanticObservation,
    | "supportingUnderstandingIds"
    | "supportingClusterIds"
    | "supportingDynamicIds"
    | "supportingMeaningSignalIds"
    | "supportingConceptIds"
    | "supportingPhenomenonIds"
    | "supportingMechanismIds"
    | "supportingNetworkIds"
    | "supportingPatternIds"
  >,
): string[] {
  return unique(observations.flatMap((observation) => observation[key]));
}

function representativeObservation(
  observations: SemanticObservation[],
): SemanticObservation {
  return [...observations].sort((a, b) => b.confidence - a.confidence)[0];
}

function buildSemanticSignature(observations: SemanticObservation[]): string {
  return unique(
    observations.flatMap((observation) =>
      observation.semanticSignature.split(" ").map(normalizeToken),
    ),
  )
    .filter(Boolean)
    .sort()
    .join(" ");
}

function buildPersistentCohortId(signature: string, index: number): string {
  const normalizedSignature = signature
    .split(" ")
    .map(normalizeToken)
    .filter(Boolean)
    .slice(0, 8)
    .join("-");

  return normalizedSignature.length > 0
    ? `semantic-cohort-${normalizedSignature}`
    : `semantic-cohort-${index + 1}`;
}

function buildCanonicalMeaning(params: {
  representative: SemanticObservation;
  confidence: number;
  semanticStability: number;
  organizationalPersistence: number;
  supportingConceptIds: string[];
}): SemanticCohort["canonicalMeaning"] {
  return {
    statement: params.representative.statement,
    summary: params.representative.summary,
    conceptIds: params.supportingConceptIds,
    confidence: clamp01(
      average([
        params.confidence,
        params.semanticStability,
        params.organizationalPersistence,
      ]),
    ),
  };
}

function buildCohort(
  observations: SemanticObservation[],
  index: number,
): SemanticCohort {
  const representative = representativeObservation(observations);
  const semanticSignature = buildSemanticSignature(observations);

  const confidence = clamp01(
    average(observations.map((observation) => observation.confidence)),
  );

  const explanatoryBreadth = clamp01(
    unique(observations.flatMap((observation) => observation.sourceType)).length /
      8,
  );

  const explanatoryDepth = clamp01(observations.length / 6);

  const semanticStability = clamp01(
    average(observations.map((observation) => observation.explanatoryStrength)),
  );

  const organizationalPersistence = clamp01(
    average(
      observations.map((observation) => observation.organizationalPersistence),
    ),
  );

  const compositeStrength = average([
    confidence,
    explanatoryBreadth,
    explanatoryDepth,
    semanticStability,
    organizationalPersistence,
  ]);

  const sourceTypes = unique(
    observations.map((observation) => observation.sourceType),
  ) as SemanticObservationSourceType[];

  const supportingConceptIds = collectIds(observations, "supportingConceptIds");

  const canonicalMeaning = buildCanonicalMeaning({
    representative,
    confidence,
    semanticStability,
    organizationalPersistence,
    supportingConceptIds,
  });

  return {
    id: buildPersistentCohortId(semanticSignature, index),

    statement: representative.statement,
    summary: representative.summary,

    observations,
    observationIds: observations.map((observation) => observation.id),

    sourceTypes,
    sourceIds: unique(observations.flatMap((observation) => observation.sourceIds)),

    supportingUnderstandingIds: collectIds(
      observations,
      "supportingUnderstandingIds",
    ),
    supportingClusterIds: collectIds(observations, "supportingClusterIds"),
    supportingDynamicIds: collectIds(observations, "supportingDynamicIds"),
    supportingMeaningSignalIds: collectIds(
      observations,
      "supportingMeaningSignalIds",
    ),
    supportingConceptIds,
    supportingPhenomenonIds: collectIds(observations, "supportingPhenomenonIds"),
    supportingMechanismIds: collectIds(observations, "supportingMechanismIds"),
    supportingNetworkIds: collectIds(observations, "supportingNetworkIds"),
    supportingPatternIds: collectIds(observations, "supportingPatternIds"),

    keywords: unique(
      observations
        .flatMap((observation) => observation.keywords)
        .map(normalizeToken),
    ).filter(Boolean),

    semanticSignature,
    canonicalMeaning,

    confidence,
    strength: inferStrength(compositeStrength),

    explanatoryBreadth,
    explanatoryDepth,
    semanticStability,
    organizationalPersistence,

    cohortState:
      sourceTypes.length > 1 || observations.length > 1
        ? "strengthening"
        : "emerging",
    occurrenceCount: observations.length,

    derivedBeliefIds: [],
    derivedConceptCandidateIds: [],
    derivedTheoryIds: [],

    explanation: `Persistent semantic cohort formed from ${observations.length} related observations across ${sourceTypes.length} cognitive source type(s).`,
  };
}

export function buildSemanticCohorts(
  params: BuildSemanticCohortsParams,
): SemanticCohort[] {
  const minimumSharedKeywords = params.minimumSharedKeywords ?? 2;
  const cohorts: SemanticObservation[][] = [];

  for (const observation of params.observations) {
    const matchingCohort = cohorts.find((cohort) =>
      shouldJoinCohort({
        observation,
        cohort,
        minimumSharedKeywords,
      }),
    );

    if (matchingCohort) {
      matchingCohort.push(observation);
    } else {
      cohorts.push([observation]);
    }
  }

  return cohorts
    .map((cohort, index) => buildCohort(cohort, index))
    .sort((a, b) => b.confidence - a.confidence);
}