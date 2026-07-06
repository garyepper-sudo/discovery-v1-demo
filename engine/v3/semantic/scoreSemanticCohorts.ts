import type {
  SemanticCohort,
  SemanticCohortState,
  SemanticStrength,
} from "./types";

export type ScoreSemanticCohortsParams = {
  cohorts: SemanticCohort[];
};

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function inferStrength(score: number): SemanticStrength {
  if (score >= 0.75) return "strong";
  if (score >= 0.45) return "moderate";
  return "weak";
}

function inferCohortState(params: {
  confidence: number;
  semanticStability: number;
  organizationalPersistence: number;
  observationCount: number;
  sourceTypeCount: number;
}): SemanticCohortState {
  const composite = average([
    params.confidence,
    params.semanticStability,
    params.organizationalPersistence,
  ]);

  if (params.observationCount <= 1 && params.sourceTypeCount <= 1) {
    return "emerging";
  }

  if (composite >= 0.78 && params.sourceTypeCount >= 3) {
    return "stable";
  }

  if (composite >= 0.6 && params.observationCount >= 3) {
    return "strengthening";
  }

  if (composite < 0.35) {
    return "weakening";
  }

  return "emerging";
}

function scoreCohort(cohort: SemanticCohort): SemanticCohort {
  const crossLayerSupport = clamp01(cohort.sourceTypes.length / 6);
  const evidenceSupport = clamp01(cohort.observationIds.length / 8);

  const supportDensity = clamp01(
    average([
      clamp01(cohort.supportingUnderstandingIds.length / 5),
      clamp01(cohort.supportingClusterIds.length / 3),
      clamp01(cohort.supportingDynamicIds.length / 3),
      clamp01(cohort.supportingMechanismIds.length / 5),
      clamp01(cohort.supportingPatternIds.length / 3),
    ]),
  );

  const explanatoryBreadth = clamp01(
    average([cohort.explanatoryBreadth, crossLayerSupport, supportDensity]),
  );

  const explanatoryDepth = clamp01(
    average([cohort.explanatoryDepth, evidenceSupport, supportDensity]),
  );

  const semanticStability = clamp01(
    average([
      cohort.semanticStability,
      explanatoryBreadth,
      explanatoryDepth,
      cohort.organizationalPersistence,
    ]),
  );

  const confidence = clamp01(
    average([
      cohort.confidence,
      explanatoryBreadth,
      explanatoryDepth,
      semanticStability,
      cohort.organizationalPersistence,
    ]),
  );

  return {
    ...cohort,
    confidence,
    strength: inferStrength(confidence),
    explanatoryBreadth,
    explanatoryDepth,
    semanticStability,
    cohortState: inferCohortState({
      confidence,
      semanticStability,
      organizationalPersistence: cohort.organizationalPersistence,
      observationCount: cohort.observationIds.length,
      sourceTypeCount: cohort.sourceTypes.length,
    }),
    occurrenceCount: Math.max(cohort.occurrenceCount, cohort.observationIds.length),
    explanation: `${cohort.explanation} Scored for cross-layer support, evidence density, explanatory breadth, explanatory depth, and semantic stability.`,
  };
}

export function scoreSemanticCohorts(
  params: ScoreSemanticCohortsParams,
): SemanticCohort[] {
  return params.cohorts
    .map(scoreCohort)
    .sort((a, b) => {
      if (b.confidence !== a.confidence) return b.confidence - a.confidence;
      return b.observationIds.length - a.observationIds.length;
    });
}