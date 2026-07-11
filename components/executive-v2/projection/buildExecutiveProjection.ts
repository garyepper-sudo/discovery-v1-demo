import type { DiscoveryV3Result } from "../../../engine/v3/types";
import type { OrganizationRuntime } from "../../../engine/v3/runtime/organizationRuntime";

import {
  choosePrimaryBelief,
  choosePrimaryUnderstanding,
  choosePrimaryInvestigationOpportunity,
} from "../../../engine/v3/projection/ExecutiveProjectionCompiler";

import type {
  ExecutiveAttentionSeverity,
  ExecutiveEvolutionMilestone,
  ExecutiveInvestigationOpportunity,
  ExecutiveOrganizationalBelief,
  ExecutiveOrganizationalCondition,
  ExecutiveOrganizationalLearningProfile,
  ExecutiveOrganizationalState,
  ExecutiveProjection,
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
};

type RuntimeOrganizationalBelief = {
  id?: string;
  statement?: string;
  confidence?: number;
  trend?: string;
  supportingMechanismIds?: string[];
  supportingConceptIds?: string[];
};

type RuntimeInvestigationOpportunity = {
  id?: string;
  topic?: string;
  reason?: string;
  suggestedExecutiveQuestion?: string;
  expectedConfidenceGain?: number;
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

  organizationalState?: {
    status?: string;
    summary?: string;
    executiveImplication?: string;
    recommendedFocus?: string[];
    confidence?: number;
  };

  organizationalConditions?: RuntimeOrganizationalCondition[];

  organizationalBeliefs?: RuntimeOrganizationalBelief[];

  investigationOpportunities?: RuntimeInvestigationOpportunity[];

  organizationalLearningProfile?: RuntimeOrganizationalLearningProfile;
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

  const executiveAssessment =
    runtimeMemory?.executiveAssessment;

  const theoryValidation =
    buildTheoryValidationProjection(runtimeMemory);

  const organizationalState =
    buildOrganizationalStateProjection(runtimeMemory);

  const organizationalConditions =
    buildOrganizationalConditionsProjection(runtimeMemory);

  const organizationalBeliefs =
    buildOrganizationalBeliefsProjection(runtimeMemory);

  const investigationOpportunities =
    buildInvestigationOpportunitiesProjection(runtimeMemory);

  const organizationalLearningProfile =
    buildOrganizationalLearningProfileProjection(runtimeMemory);

  const investigationOpportunity =
    choosePrimaryInvestigationOpportunity(
      runtimeMemory?.investigationOpportunities,
    );

  const confidence = toPercentage(
    synthesizedUnderstanding?.confidence ??
      executiveAssessment?.confidence ??
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
        executiveAssessment?.summary ||
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

    organizationalState,

    organizationalConditions,

    organizationalBeliefs,

    investigationOpportunities,

    organizationalLearningProfile,

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