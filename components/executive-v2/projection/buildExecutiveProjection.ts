import type { DiscoveryV3Result } from "../../../engine/v3/types";
import type { OrganizationRuntime } from "../../../engine/v3/runtime/organizationRuntime";
import type {
  ExecutiveSimulation as RuntimeExecutiveSimulation,
} from "../../../engine/v3/simulation/executiveSimulation";

import {
  choosePrimaryBelief,
  choosePrimaryUnderstanding,
  choosePrimaryInvestigationOpportunity,
} from "../../../engine/v3/projection/ExecutiveProjectionCompiler";

import type {
  ExecutiveAssessment,
  ExecutiveAttentionSeverity,
  ExecutiveEvolutionMilestone,
  ExecutiveInvestigationOpportunity,
  ExecutiveInvestigationStrategy,
  ExecutiveOrganizationalBelief,
  ExecutiveOrganizationalConcept,
  ExecutiveOrganizationalCondition,
  ExecutiveOrganizationalLearningProfile,
  ExecutiveOrganizationalState,
  ExecutivePredictionEvaluation,
  ExecutiveProjection,
  ExecutiveSimulationSummary,
  ExecutiveTheoryValidation,
} from "./ExecutiveProjection";

type BuildExecutiveProjectionInput = {
  result: DiscoveryV3Result;
  runtime?: OrganizationRuntime;
};

type RuntimeUnderstanding = {
  id?: string;
  statement?: string;
  summary?: string;
  confidence?: number;
  explanatoryPower?: number;
  coverage?: number;
  stability?: number;
  supportCount?: number;
  openQuestions?: string[];
  recommendations?: string[];
};

type RuntimeOrganizationalCondition = {
  id?: string;
  name?: string;
  status?: string;
  confidence?: number;
  summary?: string;
  whyItMatters?: string;
  recommendedExecutiveAction?: string;
  supportingConceptIds?: string[];
};

type RuntimeOrganizationalBelief = {
  id?: string;
  statement?: string;
  confidence?: number;
  trend?: string;
  supportingMechanismIds?: string[];
  supportingConceptIds?: string[];
};

type RuntimeOrganizationalConcept = {
  id?: string;
  label?: string;
  statement?: string;
  explanation?: string;
  confidence?: number;
  strength?: number;
  emergenceScore?: number;
  status?: "candidate" | "emerging" | "stable";
  evidenceCount?: number;
};

type RuntimeInvestigationOpportunity = {
  id?: string;
  topic?: string;
  reason?: string;
  suggestedExecutiveQuestion?: string;
  expectedConfidenceGain?: number;
};

type RuntimeInvestigationStrategy = {
  mode?:
    | "explore"
    | "challenge"
    | "preserve"
    | "exploit";

  rationale?: string[];

  prioritizeContradictoryEvidence?: boolean;
  prioritizeEvidenceDiversity?: boolean;

  repeatedTopicPenaltyMultiplier?: number;
  knowledgePreservationBoost?: number;
  learningLoopBoost?: number;
  persistenceBoost?: number;
};

type RuntimeOrganizationalLearningProfile = {
  understandingGrowth?: number;
  memoryGrowth?: number;
  learningVelocity?: string;
  learningVelocityScore?: number;
  beliefStability?: number;
  theoryStability?: number;
  knowledgeRetention?: number;
  summary?: string;
};

type RuntimePredictionEvaluation = {
  predictionId?: string;
  evaluatedAt?: string;

  outcomeStatus?:
    | "confirmed"
    | "partially-confirmed"
    | "not-confirmed"
    | "inconclusive";

  accuracyScore?: number;
  calibrationDelta?: number;
  confidenceAdjustment?: number;
  recommendedConfidence?: number;

  outcomeSummary?: string;
  evaluationExplanation?: string;
  learningSignal?: string;

  supportingEvidenceIds?: string[];
};
type RuntimeSimulation = {
  simulatedAt?: string;

  timeHorizon?:
    | "immediate"
    | "near-term"
    | "medium-term"
    | "long-term";

  confidence?: number;

  explanation?: string;

  projectedConditions?: {
    name?: string;
  }[];

  projectedBeliefs?: {
    statement?: string;
  }[];

  projectedPredictions?: {
    prediction?: string;
    statement?: string;
    headline?: string;
  }[];
};

type RuntimeExecutiveExplanation = {
  executiveSummary?: string;

  assessmentNarrative?: string;

  confidenceNarrative?: string;

  uncertaintyNarrative?: string;

  investigationNarrative?: string;

  uncertaintyStatus?: string;

  overallUncertainty?: number;

  confidenceLimiters?: string[];

  recommendedEvidenceAreas?: string[];
};

type RuntimeExecutiveMemory = {
  organizationalUnderstandingState?: {
    executiveSummary?: string;
    currentUnderstandings?: RuntimeUnderstanding[];

    score?: {
      overall?: number;
      confidence?: number;
      continuity?: number;
      memoryMaturity?: number;
    };

    health?: {
      maturity?: number;
      coherence?: number;
      uncertainty?: number;
      adaptation?: number;
    };
  };

  executiveAssessment?: {
    summary?: string;
    executiveNarrative?: string;
    recommendedFocus?: string[];
    confidence?: number;
    theoryValidation?: ExecutiveTheoryValidation;
  };

    executiveExplanation?:
    RuntimeExecutiveExplanation;

  organizationalState?: {
    status?: string;
    summary?: string;
    executiveImplication?: string;
    recommendedFocus?: string[];
    confidence?: number;
  };

  organizationalConditions?: RuntimeOrganizationalCondition[];

  organizationalBeliefs?: RuntimeOrganizationalBelief[];

  organizationalConcepts?: RuntimeOrganizationalConcept[];

  investigationStrategy?: RuntimeInvestigationStrategy;

  investigationOpportunities?: RuntimeInvestigationOpportunity[];

  organizationalLearningProfile?: RuntimeOrganizationalLearningProfile;

  predictionEvaluations?: RuntimePredictionEvaluation[];

  /**
   * Canonical executive-facing synthesis produced by CAP-SIM-003.
   *
   * Projection consumes this object directly and does not recreate
   * comparison, ranking, optimization, or recommendation reasoning.
   */
  executiveSimulation?: RuntimeExecutiveSimulation;

  /**
   * Legacy organizational simulation collection retained as a fallback
   * for runtimes created before Executive Simulation Synthesis existed.
   */
  simulatedOrganizationStates?: RuntimeSimulation[];
};

function toPercentage(value: number | undefined): number {
  if (value === undefined || Number.isNaN(value)) {
    return 0;
  }

  const percentage = value <= 1 ? value * 100 : value;

  return Math.round(
    Math.max(0, Math.min(100, percentage)),
  );
}

function getRuntimeExecutiveMemory(
  runtime: OrganizationRuntime | undefined,
): RuntimeExecutiveMemory | undefined {
  return runtime?.memory as RuntimeExecutiveMemory | undefined;
}

function getStrongestRuntimeUnderstanding(
  memory: RuntimeExecutiveMemory | undefined,
): RuntimeUnderstanding | undefined {
  const understandings =
    memory?.organizationalUnderstandingState?.currentUnderstandings ?? [];

  return [...understandings]
    .filter(
      (understanding) =>
        typeof understanding.statement === "string" &&
        understanding.statement.trim().length > 0,
    )
    .sort((left, right) => {
      const leftScore =
        left.explanatoryPower ??
        left.confidence ??
        0;

      const rightScore =
        right.explanatoryPower ??
        right.confidence ??
        0;

      return rightScore - leftScore;
    })[0];
}

function deriveMindStatus(
  result: DiscoveryV3Result,
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): string {
  const maturity = toPercentage(
    runtimeMemory?.organizationalUnderstandingState?.health?.maturity ??
      result.organismState?.maturity,
  );

  if (maturity >= 80) {
    return "Established";
  }

  if (maturity >= 55) {
    return "Developing";
  }

  return "Learning";
}

function buildExecutiveAttention(
  result: DiscoveryV3Result,
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveProjection["executiveAttention"] {
  const primaryContradiction = [...result.contradictions].sort(
    (left, right) => {
      const leftPriority = left.priority?.total ?? 0;
      const rightPriority = right.priority?.total ?? 0;

      if (leftPriority !== rightPriority) {
        return rightPriority - leftPriority;
      }

      return right.confidence - left.confidence;
    },
  )[0];

  if (primaryContradiction) {
    const severity: ExecutiveAttentionSeverity =
      primaryContradiction.severity === "strong"
        ? "high"
        : primaryContradiction.severity === "moderate"
          ? "medium"
          : "low";

    return {
      title: primaryContradiction.title,
      summary: primaryContradiction.explanation,
      severity,
    };
  }

  const organizationalState =
    runtimeMemory?.organizationalState;

  if (
    organizationalState?.status === "critical" ||
    organizationalState?.status === "strained"
  ) {
    return {
      title:
        organizationalState.status === "critical"
          ? "The organization requires executive attention"
          : "The organization is showing meaningful strain",

      summary:
        organizationalState.executiveImplication ||
        organizationalState.summary ||
        "Discovery has identified a significant organizational condition that deserves executive attention.",

      severity:
        organizationalState.status === "critical"
          ? "high"
          : "medium",
    };
  }

  const uncertainty = toPercentage(
    runtimeMemory?.organizationalUnderstandingState?.health?.uncertainty ??
      result.organismState?.uncertainty,
  );

  if (uncertainty >= 70) {
    return {
      title: "Understanding remains highly uncertain",
      summary:
        "Discovery has formed a leading view, but substantial uncertainty remains and additional evidence could materially change it.",
      severity: "high",
    };
  }

  if (uncertainty >= 40) {
    return {
      title: "Important uncertainty remains",
      summary:
        "Discovery has formed a current understanding, but unresolved questions still deserve executive attention.",
      severity: "medium",
    };
  }

  return {
    title: "No urgent contradiction detected",
    summary:
      "Discovery has not identified a major unresolved tension requiring immediate executive attention.",
    severity: "low",
  };
}

function buildEvolutionMilestones(
  result: DiscoveryV3Result,
  confidence: number,
  mindStatus: string,
): ExecutiveEvolutionMilestone[] {
  const milestones: ExecutiveEvolutionMilestone[] = [];

  const firstSignal = result.signals[0];
  const firstTheme = result.themes[0];
  const firstEmergenceEvent = result.emergenceEvents[0];

  if (firstSignal) {
    milestones.push({
      id: `signal-${firstSignal.id}`,
      label: "Signal",
      description: firstSignal.title,
      isCurrent: false,
    });
  }

  if (firstTheme) {
    milestones.push({
      id: `theme-${firstTheme.id}`,
      label: "Pattern",
      description: firstTheme.title,
      isCurrent: false,
    });
  }

  if (firstEmergenceEvent) {
    milestones.push({
      id: `emergence-${firstEmergenceEvent.id}`,
      label: "Emergence",
      description: firstEmergenceEvent.title,
      isCurrent: false,
    });
  }

  milestones.push({
    id: "current-understanding",
    label: "Today",
    description: `${confidence}% confidence · ${mindStatus}`,
    isCurrent: true,
  });

  return milestones;
}

function buildExecutiveAssessmentProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveAssessment | undefined {
  const executiveAssessment =
    runtimeMemory?.executiveAssessment;

  if (!executiveAssessment) {
    return undefined;
  }

  return {
    summary:
      executiveAssessment.summary ||
      "Discovery has not yet formed a complete executive assessment.",

    executiveNarrative:
      executiveAssessment.executiveNarrative ||
      executiveAssessment.summary ||
      "Discovery has not yet formed a complete executive narrative.",

    confidence: toPercentage(
      executiveAssessment.confidence,
    ),

    recommendedFocus:
      executiveAssessment.recommendedFocus ?? [],

    theoryValidation:
      executiveAssessment.theoryValidation,
  };
}

function buildTheoryValidationProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveTheoryValidation | undefined {
  return runtimeMemory?.executiveAssessment?.theoryValidation;
}

function buildOrganizationalStateProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveOrganizationalState | undefined {
  const organizationalState = runtimeMemory?.organizationalState;

  if (!organizationalState) {
    return undefined;
  }

  return {
    status: organizationalState.status || "unknown",

    summary:
      organizationalState.summary ||
      "Discovery has not yet formed a complete organizational state.",

    confidence: toPercentage(
      organizationalState.confidence,
    ),

    executiveImplication:
      organizationalState.executiveImplication ||
      organizationalState.summary ||
      "Discovery has not yet identified a clear executive implication.",

    recommendedFocus:
      organizationalState.recommendedFocus ?? [],
  };
}

function buildOrganizationalConditionsProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveOrganizationalCondition[] | undefined {
  const conditions =
    runtimeMemory?.organizationalConditions;

  if (!conditions || conditions.length === 0) {
    return undefined;
  }

  return conditions
    .filter(
      (condition) =>
        typeof condition.name === "string" &&
        condition.name.trim().length > 0,
    )
    .map((condition) => ({
      name: condition.name as string,

      status:
        condition.status ||
        "unknown",

      confidence: toPercentage(
        condition.confidence,
      ),

      summary:
        condition.summary ||
        "Discovery has identified this organizational condition.",

      whyItMatters:
        condition.whyItMatters ||
        "This condition may materially affect organizational performance.",

      recommendedExecutiveAction:
        condition.recommendedExecutiveAction ||
        "Continue gathering evidence and monitor this condition.",
    }));
}

function buildOrganizationalBeliefsProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveOrganizationalBelief[] | undefined {
  const beliefs =
    runtimeMemory?.organizationalBeliefs;

  if (!beliefs || beliefs.length === 0) {
    return undefined;
  }

  return beliefs
    .filter(
      (belief) =>
        typeof belief.statement === "string" &&
        belief.statement.trim().length > 0,
    )
    .map((belief) => ({
      statement: belief.statement as string,

      confidence: toPercentage(
        belief.confidence,
      ),

      trend:
        belief.trend ||
        "unknown",

      supportingMechanisms:
        belief.supportingMechanismIds ?? [],

      supportingConcepts:
        belief.supportingConceptIds ?? [],
    }));
}

function buildOrganizationalConceptsProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveOrganizationalConcept[] | undefined {
  const concepts =
    runtimeMemory?.organizationalConcepts;

  if (!concepts || concepts.length === 0) {
    return undefined;
  }

  const conditions =
    runtimeMemory?.organizationalConditions ?? [];

  return concepts
    .filter(
      (concept) =>
        typeof concept.id === "string" &&
        concept.id.trim().length > 0 &&
        typeof concept.label === "string" &&
        concept.label.trim().length > 0 &&
        typeof concept.statement === "string" &&
        concept.statement.trim().length > 0,
    )
    .map((concept) => {
      const conceptId = concept.id as string;

      const supportingConditions = conditions
        .filter((condition) =>
          condition.supportingConceptIds?.includes(conceptId),
        )
        .map((condition) => condition.name)
        .filter(
          (name): name is string =>
            typeof name === "string" &&
            name.trim().length > 0,
        );

      return {
        id: conceptId,

        label: concept.label as string,

        statement: concept.statement as string,

        explanation:
          concept.explanation ||
          "Discovery formed this concept from recurring organizational meaning signals.",

        confidence: toPercentage(
          concept.confidence,
        ),

        strength: toPercentage(
          concept.strength,
        ),

        emergenceScore: toPercentage(
          concept.emergenceScore,
        ),

        status:
          concept.status ??
          "candidate",

        evidenceCount:
          concept.evidenceCount ?? 0,

        supportingConditions: Array.from(
          new Set(supportingConditions),
        ),
      };
    })
    .sort((left, right) => {
      if (left.emergenceScore !== right.emergenceScore) {
        return right.emergenceScore - left.emergenceScore;
      }

      return right.confidence - left.confidence;
    });
}

function buildInvestigationOpportunitiesProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveInvestigationOpportunity[] | undefined {
  const opportunities =
    runtimeMemory?.investigationOpportunities;

  if (!opportunities || opportunities.length === 0) {
    return undefined;
  }

  return opportunities
    .filter(
      (opportunity) =>
        typeof opportunity.topic === "string" &&
        opportunity.topic.trim().length > 0,
    )
    .map((opportunity) => ({
      topic: opportunity.topic as string,

      reason:
        opportunity.reason ||
        "This investigation could reduce uncertainty in Discovery's current understanding.",

      suggestedExecutiveQuestion:
        opportunity.suggestedExecutiveQuestion ||
        "What additional evidence would most improve Discovery's confidence?",

      expectedConfidenceGain: toPercentage(
        opportunity.expectedConfidenceGain,
      ),
    }));
}

function buildInvestigationStrategyProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveInvestigationStrategy | undefined {
  const strategy =
    runtimeMemory?.investigationStrategy;

  if (!strategy) {
    return undefined;
  }

  return {
    mode: strategy.mode ?? "explore",

    rationale: strategy.rationale ?? [],

    prioritizeContradictoryEvidence:
      strategy.prioritizeContradictoryEvidence ??
      false,

    prioritizeEvidenceDiversity:
      strategy.prioritizeEvidenceDiversity ??
      false,

    repeatedTopicPenaltyMultiplier:
      strategy.repeatedTopicPenaltyMultiplier ??
      1,

    knowledgePreservationBoost:
      strategy.knowledgePreservationBoost ??
      0,

    learningLoopBoost:
      strategy.learningLoopBoost ??
      0,

    persistenceBoost:
      strategy.persistenceBoost ??
      0,
  };
}

function buildOrganizationalLearningProfileProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveOrganizationalLearningProfile | undefined {
  const learningProfile =
    runtimeMemory?.organizationalLearningProfile;

  if (!learningProfile) {
    return undefined;
  }

  return {
    understandingGrowth:
      learningProfile.understandingGrowth ?? 0,

    memoryGrowth:
      learningProfile.memoryGrowth ?? 0,

    learningVelocity:
      learningProfile.learningVelocity ||
      "unknown",

    learningVelocityScore: toPercentage(
      learningProfile.learningVelocityScore,
    ),

    beliefStability: toPercentage(
      learningProfile.beliefStability,
    ),

    theoryStability: toPercentage(
      learningProfile.theoryStability,
    ),

    knowledgeRetention: toPercentage(
      learningProfile.knowledgeRetention,
    ),

    summary:
      learningProfile.summary ||
      "Discovery has not yet accumulated enough longitudinal evidence to summarize organizational learning.",
  };
}

function buildPredictionEvaluationProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutivePredictionEvaluation[] | undefined {
  const evaluations =
    runtimeMemory?.predictionEvaluations;

  if (!evaluations || evaluations.length === 0) {
    return undefined;
  }

  return evaluations
    .filter(
      (evaluation) =>
        typeof evaluation.predictionId === "string" &&
        evaluation.predictionId.trim().length > 0,
    )
    .map((evaluation) => ({
      predictionId: evaluation.predictionId as string,

      evaluatedAt:
        evaluation.evaluatedAt ?? "",

      outcomeStatus:
        evaluation.outcomeStatus ?? "inconclusive",

      accuracyScore: toPercentage(
        evaluation.accuracyScore,
      ),

      calibrationDelta: toPercentage(
        evaluation.calibrationDelta,
      ),

      confidenceAdjustment: toPercentage(
        evaluation.confidenceAdjustment,
      ),

      recommendedConfidence: toPercentage(
        evaluation.recommendedConfidence,
      ),

      outcomeSummary:
        evaluation.outcomeSummary ??
        "Outcome has not yet been evaluated.",

      evaluationExplanation:
        evaluation.evaluationExplanation ??
        "Prediction evaluation is pending future organizational evidence.",

      learningSignal:
        evaluation.learningSignal ??
        "No longitudinal learning signal is yet available.",

      supportingEvidenceIds:
        evaluation.supportingEvidenceIds ?? [],
    }));
}
function buildSimulationProjection(
  runtimeMemory: RuntimeExecutiveMemory | undefined,
): ExecutiveSimulationSummary | undefined {
  const executiveSimulation =
    runtimeMemory?.executiveSimulation;

  /**
   * Canonical projection path.
   *
   * Executive Projection exposes the completed ExecutiveSimulation
   * produced by CAP-SIM-003. It does not recompute recommendation,
   * ranking, comparison, confidence, or organizational simulation.
   */
  if (executiveSimulation) {
    const recommendedSimulation =
      executiveSimulation
        .recommendedScenario
        .scenario
        .simulatedOrganizationState;

    return {
      simulatedAt:
        recommendedSimulation.simulatedAt,

      timeHorizon:
        recommendedSimulation.timeHorizon,

      confidence: toPercentage(
        executiveSimulation
          .executiveConfidence,
      ),

      explanation:
        executiveSimulation
          .executiveSummary ||
        recommendedSimulation
          .explanation ||
        "Discovery synthesized the strongest simulated executive strategy.",

      projectedConditions:
        recommendedSimulation
          .projectedConditions
          .map(
            (condition) =>
              condition.name,
          )
          .filter(
            (name): name is string =>
              typeof name === "string" &&
              name.trim().length > 0,
          ),

      projectedBeliefs:
        recommendedSimulation
          .projectedBeliefs
          .map(
            (belief) =>
              belief.statement,
          )
          .filter(
            (
              statement,
            ): statement is string =>
              typeof statement ===
                "string" &&
              statement.trim().length > 0,
          ),

      projectedPredictions:
  recommendedSimulation
    .projectedPredictions
    .map(
      (prediction) =>
        prediction.statement,
    )
    .filter(
      (
        statement,
      ): statement is string =>
        typeof statement ===
          "string" &&
        statement.trim().length > 0,
    ),
    };
  }

  /**
   * Backward-compatible projection path for runtimes that contain only
   * raw Organizational Simulation output.
   */
  const simulations =
    runtimeMemory
      ?.simulatedOrganizationStates;

  if (
    !simulations ||
    simulations.length === 0
  ) {
    return undefined;
  }

  const latestSimulation =
    simulations[
      simulations.length - 1
    ];

  return {
    simulatedAt:
      latestSimulation.simulatedAt ??
      "",

    timeHorizon:
      latestSimulation.timeHorizon ??
      "near-term",

    confidence: toPercentage(
      latestSimulation.confidence,
    ),

    explanation:
      latestSimulation.explanation ??
      "Discovery has projected the organization's current state into a plausible future.",

    projectedConditions:
      latestSimulation
        .projectedConditions
        ?.map(
          (condition) =>
            condition.name,
        )
        .filter(
          (name): name is string =>
            typeof name === "string" &&
            name.trim().length > 0,
        ) ?? [],

    projectedBeliefs:
      latestSimulation
        .projectedBeliefs
        ?.map(
          (belief) =>
            belief.statement,
        )
        .filter(
          (
            statement,
          ): statement is string =>
            typeof statement ===
              "string" &&
            statement.trim().length >
              0,
        ) ?? [],

    projectedPredictions:
      latestSimulation
        .projectedPredictions
        ?.map(
          (prediction) =>
            prediction.prediction ??
            prediction.statement ??
            prediction.headline,
        )
        .filter(
          (
            statement,
          ): statement is string =>
            typeof statement ===
              "string" &&
            statement.trim().length >
              0,
        ) ?? [],
  };
}

export function buildExecutiveProjection({
  result,
  runtime,
}: BuildExecutiveProjectionInput): ExecutiveProjection {
  const runtimeMemory =
    getRuntimeExecutiveMemory(runtime);

  const primaryBelief = choosePrimaryBelief(
    result.beliefs,
  );

  const primaryUnderstanding =
    choosePrimaryUnderstanding(
      result.understanding,
    );

  const earlyExecutiveUnderstanding =
    result.executiveUnderstanding;

  const synthesizedUnderstanding =
    getStrongestRuntimeUnderstanding(runtimeMemory);

  const runtimeExecutiveAssessment =
    runtimeMemory?.executiveAssessment;

  const executiveAssessment =
    buildExecutiveAssessmentProjection(runtimeMemory);

  const theoryValidation =
    buildTheoryValidationProjection(runtimeMemory);

  const organizationalState =
    buildOrganizationalStateProjection(runtimeMemory);

  const organizationalConditions =
    buildOrganizationalConditionsProjection(runtimeMemory);

  const organizationalBeliefs =
    buildOrganizationalBeliefsProjection(runtimeMemory);

  const organizationalConcepts =
    buildOrganizationalConceptsProjection(runtimeMemory);

  const investigationStrategy =
    buildInvestigationStrategyProjection(
      runtimeMemory,
    );

  const investigationOpportunities =
    buildInvestigationOpportunitiesProjection(runtimeMemory);

  const organizationalLearningProfile =
    buildOrganizationalLearningProfileProjection(runtimeMemory);

  const predictionEvaluations =
    buildPredictionEvaluationProjection(runtimeMemory);

  const simulation =
    buildSimulationProjection(runtimeMemory);

  const investigationOpportunity =
    choosePrimaryInvestigationOpportunity(
      runtimeMemory?.investigationOpportunities,
    );

  const confidence = toPercentage(
    synthesizedUnderstanding?.confidence ??
      runtimeExecutiveAssessment?.confidence ??
      earlyExecutiveUnderstanding.confidence ??
      primaryBelief?.confidence ??
      primaryUnderstanding?.confidence,
  );

  const mindStatus = deriveMindStatus(
    result,
    runtimeMemory,
  );

  const organizationalCoherence = toPercentage(
    runtimeMemory?.organizationalUnderstandingState?.health
      ?.coherence ??
      result.organismState?.coherence,
  );

  return {
    workspace: {
      title: "Current Understanding",
      status: "Active",
      updatedLabel: null,
    },

    currentUnderstanding: {
      belief:
        synthesizedUnderstanding?.statement ||
        theoryValidation?.dominantTheory ||
        earlyExecutiveUnderstanding.headline ||
        primaryBelief?.headline ||
        primaryUnderstanding?.title ||
        "Discovery is still forming its current understanding.",

      mindStatus,

      confidence,

      organizationalCoherence,
    },

    explanation: {
      why:
        synthesizedUnderstanding?.summary ||
        theoryValidation?.whyDiscoveryBelievesIt ||
        runtimeExecutiveAssessment?.summary ||
        earlyExecutiveUnderstanding.explanation ||
        primaryBelief?.explanation ||
        primaryUnderstanding?.summary ||
        "Discovery has not yet formed a complete explanation.",

      whatCouldChangeThis:
        synthesizedUnderstanding?.openQuestions?.[0] ||
        theoryValidation?.evidenceThatWouldFalsifyTheory?.[0] ||
        theoryValidation?.calibratedConfidenceExplanation ||
        earlyExecutiveUnderstanding.openQuestions?.[0] ||
        primaryBelief?.nextQuestions?.[0] ||
        primaryBelief?.concerns?.[0] ||
        primaryUnderstanding?.unknowns?.[0] ||
        "Additional evidence could change this understanding.",

      nextMove:
        investigationOpportunity?.suggestedExecutiveQuestion ||
        investigationOpportunity?.reason ||
        theoryValidation?.executiveRecommendation ||
        synthesizedUnderstanding?.recommendations?.[0] ||
        earlyExecutiveUnderstanding.nextMoves?.[0] ||
        primaryUnderstanding?.recommendations?.[0] ||
        "Continue gathering evidence around the leading explanation.",
    },

    executiveAttention: buildExecutiveAttention(
      result,
      runtimeMemory,
    ),

    executiveAssessment,

    executiveExplanation:
    runtimeMemory
      ?.executiveExplanation
        ? {
            executiveSummary:
              runtimeMemory
                .executiveExplanation
                .executiveSummary ??
              "", 

            assessmentNarrative:
              runtimeMemory
                .executiveExplanation
                .assessmentNarrative ??
              "",

            confidenceNarrative:
              runtimeMemory
                .executiveExplanation
                .confidenceNarrative ??
              "",

            uncertaintyNarrative:
              runtimeMemory
                .executiveExplanation
                .uncertaintyNarrative ??
              "",

            investigationNarrative:
              runtimeMemory
                .executiveExplanation
                .investigationNarrative ??
              "",

            uncertaintyStatus:
              runtimeMemory
                .executiveExplanation
                .uncertaintyStatus ??
              "unknown",

            overallUncertainty:
              runtimeMemory
                .executiveExplanation
                .overallUncertainty ??
              0,

          confidenceLimiters: [
            ...(
              runtimeMemory
                .executiveExplanation
                .confidenceLimiters ??
              []
            ),
          ],

          recommendedEvidenceAreas: [
            ...(
              runtimeMemory
                .executiveExplanation
                .recommendedEvidenceAreas ??
              []
            ),
          ],
        }
      : undefined,

    organizationalState,

    organizationalConditions,

    organizationalBeliefs,

    organizationalConcepts,

    investigationStrategy,

    investigationOpportunities,

    organizationalLearningProfile,

    predictionEvaluations,

    simulation,

    executiveSimulation:
      runtimeMemory?.executiveSimulation,

    theoryValidation,

    evolution: {
      milestones: buildEvolutionMilestones(
        result,
        confidence,
        mindStatus,
      ),
    },
  };
}
