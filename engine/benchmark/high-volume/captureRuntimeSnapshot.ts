import type {
  OrganizationRuntime,
} from "../../v3/runtime/organizationRuntime";

export type RuntimeSnapshot = {
  organizationId: string;
  capturedAt: string;
  investigationCount: number;

  counts: {
    observations: number;
    beliefs: number;
    theories: number;
    concepts: number;
    conditions: number;
    mechanisms: number;
    contradictions: number;
    predictions: number;
    interventions: number;
    simulations: number;
    decisionRecords: number;
    learningEvents: number;
    understandingClusters: number;
  };

  executive: {
    assessmentSummary: string | null;
    executiveNarrative: string | null;
    recommendation: string | null;
    confidence: number | null;
    dominantTheory: string | null;
    organizationalState: string | null;
    topConditions: string[];
    topMechanisms: string[];
  };

  maturity: {
    score: number | null;
    learningVelocityScore: number | null;
    investigationsObserved: number | null;
  };
};

type ExtendedOrganizationalMemory =
  NonNullable<
    OrganizationRuntime["memory"]["organizationalMemory"]
  > & {
    organizationalLearningProfile?: {
      learningVelocityScore?: number;
      investigationsObserved?: number;
    } | null;

    organizationalConditions?: Array<{
      name?: string;
      summary?: string;
      priority?: string;
      status?: string;
    }>;

    organizationalState?: {
      summary?: string;
      status?: string;
    };
  };

type ExtendedRuntimeMemory =
  Omit<
    OrganizationRuntime["memory"],
    "organizationalMemory"
  > & {
    organizationalMemory?:
      | ExtendedOrganizationalMemory
      | null;

    organizationalBeliefs?: unknown[];
    organizationalConditions?: Array<{
      name?: string;
      summary?: string;
      priority?: string;
      status?: string;
    }>;

    organizationalState?: {
      summary?: string;
      status?: string;
    };

    mechanismNetwork?: {
      mechanisms?: Array<{
        title?: string;
        executiveName?: string;
        label?: string;
      }>;
    };

    contradictions?: unknown[];

    organizationalPredictions?: unknown[];

    understandingClusters?: unknown[];

    learningEvents?: unknown[];

    executiveAssessment?: {
      summary?: string;
      executiveNarrative?: string;
      executiveRecommendation?: string;
      recommendation?: string;
      confidence?: number;
      dominantTheory?: string;

      organizationalUnderstanding?: {
        confidence?: number;
        dominantTheory?: string;
        executiveRecommendation?: string;
        summary?: string;

        dominantCondition?: {
          name?: string;
          summary?: string;
        };

        organizationalState?: {
          summary?: string;
          status?: string;
        };
      };

      theoryValidation?: {
        dominantTheory?: string | null;
        calibratedConfidence?: number;
        executiveRecommendation?: string;
      };
    };

    executiveRecommendation?: {
      headline?: string;
      executiveRecommendation?: string;
      rationale?: string;
      confidence?: number;
    };

    memoryMaturity?: {
      score?: number;
    } | null;

    organizationalLearningProfile?: {
      learningVelocityScore?: number;
      investigationsObserved?: number;
    } | null;
  };

function arrayLength(
  value: unknown,
): number {
  return Array.isArray(
    value,
  )
    ? value.length
    : 0;
}

function firstFiniteNumber(
  ...values: unknown[]
): number | null {
  for (
    const value of values
  ) {
    if (
      typeof value ===
        "number" &&
      Number.isFinite(
        value,
      )
    ) {
      return value;
    }
  }

  return null;
}

function firstText(
  ...values: unknown[]
): string | null {
  for (
    const value of values
  ) {
    if (
      typeof value ===
        "string" &&
      value.trim().length >
        0
    ) {
      return value.trim();
    }
  }

  return null;
}

function getTopConditionNames(
  memory:
    ExtendedRuntimeMemory,
): string[] {
  return (
    memory.organizationalConditions ??
    []
  )
    .slice()
    .sort(
      (
        left,
        right,
      ) => {
        const priorityWeight:
          Record<
            string,
            number
          > = {
          critical:
            4,

          high:
            3,

          medium:
            2,

          low:
            1,
        };

        return (
          priorityWeight[
            right.priority ??
            ""
          ] ??
          0
        ) -
          (
            priorityWeight[
              left.priority ??
              ""
            ] ??
            0
          );
      },
    )
    .map(
      (condition) =>
        firstText(
          condition.name,
          condition.summary,
        ),
    )
    .filter(
      (
        value,
      ): value is string =>
        value !==
        null,
    )
    .slice(
      0,
      5,
    );
}

function getTopMechanismNames(
  memory:
    ExtendedRuntimeMemory,
): string[] {
  return (
    memory.mechanismNetwork
      ?.mechanisms ??
    []
  )
    .map(
      (mechanism) =>
        firstText(
          mechanism.executiveName,
          mechanism.title,
          mechanism.label,
        ),
    )
    .filter(
      (
        value,
      ): value is string =>
        value !==
        null,
    )
    .slice(
      0,
      5,
    );
}

/**
 * Captures a stable, benchmark-friendly summary of an organizational runtime.
 *
 * The helper intentionally reads cognition without mutating runtime state.
 * Optional and legacy runtime fields are normalized so longitudinal benchmarks
 * can compare snapshots across architecture migrations.
 */
export function captureRuntimeSnapshot(
  runtime:
    OrganizationRuntime,

  capturedAt =
    new Date()
      .toISOString(),
): RuntimeSnapshot {
  const memory =
    runtime.memory as
      ExtendedRuntimeMemory;

  const organizationalUnderstanding =
    memory.executiveAssessment
      ?.organizationalUnderstanding;

  const theoryValidation =
    memory.executiveAssessment
      ?.theoryValidation;

  const maturity =
    memory.organizationalMemory
      ?.maturity ??
    memory.memoryMaturity ??
    null;

  const learningProfile =
    memory.organizationalMemory
      ?.organizationalLearningProfile ??
    memory.organizationalLearningProfile ??
    null;

  return {
    organizationId:
      runtime.metadata
        .organizationId,

    capturedAt,

    investigationCount:
      runtime.metadata
        .investigationCount,

    counts: {
      observations:
        arrayLength(
          memory.observations,
        ),

      beliefs:
        Math.max(
          arrayLength(
            memory.beliefs,
          ),
          arrayLength(
            memory.organizationalBeliefs,
          ),
        ),

      theories:
        arrayLength(
          memory.theories,
        ),

      concepts:
        Math.max(
          arrayLength(
            memory.organizationalConcepts,
          ),
          arrayLength(
            memory.semanticConcepts,
          ),
        ),

      conditions:
        arrayLength(
          memory.organizationalConditions ??
          memory.organizationalMemory
            ?.organizationalConditions,
        ),

      mechanisms:
        arrayLength(
          memory.mechanismNetwork
            ?.mechanisms,
        ),

      contradictions:
        arrayLength(
          memory.contradictions,
        ),

      predictions:
        arrayLength(
          memory.organizationalPredictions,
        ),

      interventions:
        arrayLength(
          memory.organizationalInterventions,
        ),

      simulations:
        arrayLength(
          memory.simulatedOrganizationStates,
        ),

      decisionRecords:
        arrayLength(
          memory.executiveDecisionRecords,
        ),

      learningEvents:
        arrayLength(
          memory.learningEvents,
        ),

      understandingClusters:
        arrayLength(
          memory.understandingClusters,
        ),
    },

    executive: {
      assessmentSummary:
        firstText(
          memory.executiveAssessment
            ?.summary,
          organizationalUnderstanding
            ?.summary,
        ),

      executiveNarrative:
        firstText(
          memory.executiveAssessment
            ?.executiveNarrative,
        ),

      recommendation:
        firstText(
          memory.executiveRecommendation
            ?.executiveRecommendation,
          memory.executiveRecommendation
            ?.headline,
          organizationalUnderstanding
            ?.executiveRecommendation,
          theoryValidation
            ?.executiveRecommendation,
          memory.executiveAssessment
            ?.executiveRecommendation,
          memory.executiveAssessment
            ?.recommendation,
        ),

      confidence:
        firstFiniteNumber(
          organizationalUnderstanding
            ?.confidence,
          memory.executiveAssessment
            ?.confidence,
          theoryValidation
            ?.calibratedConfidence,
        ),

      dominantTheory:
        firstText(
          organizationalUnderstanding
            ?.dominantTheory,
          theoryValidation
            ?.dominantTheory,
          memory.executiveAssessment
            ?.dominantTheory,
        ),

      organizationalState:
        firstText(
          organizationalUnderstanding
            ?.organizationalState
            ?.summary,
          organizationalUnderstanding
            ?.organizationalState
            ?.status,
          memory.organizationalState
            ?.summary,
          memory.organizationalState
            ?.status,
          memory.organizationalMemory
            ?.organizationalState
            ?.summary,
          memory.organizationalMemory
            ?.organizationalState
            ?.status,
        ),

      topConditions:
        getTopConditionNames(
          memory,
        ),

      topMechanisms:
        getTopMechanismNames(
          memory,
        ),
    },

    maturity: {
      score:
        firstFiniteNumber(
          maturity?.score,
        ),

      learningVelocityScore:
        firstFiniteNumber(
          learningProfile
            ?.learningVelocityScore,
        ),

      investigationsObserved:
        firstFiniteNumber(
          learningProfile
            ?.investigationsObserved,
        ),
    },
  };
}
