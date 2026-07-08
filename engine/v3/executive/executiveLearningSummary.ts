import type { OrganizationRuntime } from "../runtime/organizationRuntime";
import { buildExecutiveChangeSummary } from "./buildExecutiveChangeSummary";

export type ExecutiveDelta = {
  current: number;
  previous: number;
  delta: number;
};

export type ExecutiveLearningTimelineEntry = {
  timestamp: string;
  summary: string;
  understanding: number;
  memoryMaturity?: number;
  newBeliefs: number;
  strengthenedBeliefs: number;
  weakenedBeliefs: number;
  newTheories: number;
  stabilizedTheories: number;
  confidenceDelta?: number;
};

export type ExecutiveAttentionItem = {
  id?: string;
  title: string;
  reason: string;
  confidence?: number;
};

export type ExecutiveConditionEvolution = {
  id?: string;
  name: string;
  status?: string;
  priority?: string;
  trend?: string;
  confidence?: number;
  strength?: number;
  summary: string;
  whyItMatters?: string;
};

export type ExecutiveLearningSummary = {
  generatedAt: string;

  understanding: ExecutiveDelta;
  memoryMaturity: ExecutiveDelta;
  learning: ExecutiveDelta;
  confidence: ExecutiveDelta;

  newBeliefs: number;
  strengthenedBeliefs: number;
  weakenedBeliefs: number;

  newTheories: number;
  stabilizedTheories: number;

  timeline: ExecutiveLearningTimelineEntry[];

  narrative: string;

  recommendedAttention: ExecutiveAttentionItem[];

  /**
   * Sprint 47B
   *
   * Longitudinal condition evolution translated for executive expression.
   * This does not add reasoning. It exposes the organizational state
   * evolution already computed by the runtime.
   */
  conditionEvolution: ExecutiveConditionEvolution[];
};

type UnderstandingSnapshot = {
  timestamp: string;
  organizationalUnderstandingScore: number;
  memoryMaturityScore: number;
  beliefCount?: number;
  theoryCount?: number;
  stableTheoryCount?: number;
  executiveAssessmentConfidence?: number;
};

type LearningEvent = {
  objectType?: string;
  objectId?: string;
  changeType?: string;
  reason?: string;
  confidenceDelta?: number;
};

type OrganizationalBelief = {
  id?: string;
  statement?: string;
  confidence?: number;
  trend?: string;
};

type OrganizationalTheory = {
  id?: string;
  statement?: string;
  status?: string;
  confidence?: number;
};

type OrganizationalCondition = {
  id?: string;
  name?: string;
  status?: string;
  priority?: string;
  trend?: string;
  confidence?: number;
  strength?: number;
  summary?: string;
  whyItMatters?: string;
};

function normalizePercent(value?: number): number | undefined {
  if (typeof value !== "number") return undefined;
  return value <= 1 ? Math.round(value * 100) : Math.round(value);
}

function buildTimeline(
  snapshots: UnderstandingSnapshot[],
): ExecutiveLearningTimelineEntry[] {
  return snapshots.slice(-6).map((snapshot, index, recentSnapshots) => {
    const previous = index > 0 ? recentSnapshots[index - 1] : undefined;

    const understandingDelta =
      previous === undefined
        ? 0
        : snapshot.organizationalUnderstandingScore -
          previous.organizationalUnderstandingScore;

    return {
      timestamp: snapshot.timestamp,
      summary:
        previous === undefined
          ? "Discovery recorded an organizational understanding snapshot."
          : `Understanding changed by ${understandingDelta} points since the previous snapshot.`,
      understanding: snapshot.organizationalUnderstandingScore,
      memoryMaturity: snapshot.memoryMaturityScore,
      newBeliefs: 0,
      strengthenedBeliefs: 0,
      weakenedBeliefs: 0,
      newTheories: 0,
      stabilizedTheories: snapshot.stableTheoryCount ?? 0,
      confidenceDelta:
        previous === undefined
          ? 0
          : (snapshot.executiveAssessmentConfidence ?? 0) -
            (previous.executiveAssessmentConfidence ?? 0),
    };
  });
}

function buildConditionEvolution(
  conditions: OrganizationalCondition[],
): ExecutiveConditionEvolution[] {
  return conditions
    .slice()
    .sort((a, b) => {
      const priorityRank: Record<string, number> = {
        high: 3,
        medium: 2,
        low: 1,
      };

      const trendRank: Record<string, number> = {
        strengthening: 3,
        deteriorating: 3,
        weakening: 3,
        stable: 2,
        new: 1,
      };

      const aScore =
        (priorityRank[a.priority ?? ""] ?? 0) +
        (trendRank[a.trend ?? ""] ?? 0) +
        (a.strength ?? 0);

      const bScore =
        (priorityRank[b.priority ?? ""] ?? 0) +
        (trendRank[b.trend ?? ""] ?? 0) +
        (b.strength ?? 0);

      return bScore - aScore;
    })
    .slice(0, 6)
    .map((condition) => ({
      id: condition.id,
      name: condition.name ?? "Organizational condition",
      status: condition.status,
      priority: condition.priority,
      trend: condition.trend,
      confidence: normalizePercent(condition.confidence),
      strength: normalizePercent(condition.strength),
      summary:
        condition.summary ??
        "Discovery is tracking this condition across investigations.",
      whyItMatters: condition.whyItMatters,
    }));
}

function buildConditionNarrative(
  conditionEvolution: ExecutiveConditionEvolution[],
): string {
  const strengthening = conditionEvolution.filter(
    (condition) => condition.trend === "strengthening",
  );

  const stable = conditionEvolution.filter(
    (condition) => condition.trend === "stable",
  );

  const deteriorating = conditionEvolution.filter(
    (condition) =>
      condition.status === "deteriorating" ||
      condition.trend === "deteriorating" ||
      condition.trend === "weakening",
  );

  const parts: string[] = [];

  if (strengthening.length > 0) {
    parts.push(
      `${strengthening
        .slice(0, 2)
        .map((condition) => condition.name)
        .join(" and ")} strengthened as persistent organizational narratives.`,
    );
  }

  if (stable.length > 0) {
    parts.push(
      `${stable
        .slice(0, 2)
        .map((condition) => condition.name)
        .join(" and ")} remained stable across investigations.`,
    );
  }

  if (deteriorating.length > 0) {
    parts.push(
      `${deteriorating
        .slice(0, 2)
        .map((condition) => condition.name)
        .join(" and ")} are still moving in the wrong direction.`,
    );
  }

  return parts.join(" ");
}

export function buildExecutiveLearningSummary(
  runtime: OrganizationRuntime,
): ExecutiveLearningSummary {
  const memory = runtime.memory as typeof runtime.memory & {
    understandingSnapshots?: UnderstandingSnapshot[];
    learningEvents?: LearningEvent[];

    organizationalLearningProfile?: {
      learningVelocityScore?: number;
    };

    organizationalUnderstandingState?: {
      organizationalBeliefs?: OrganizationalBelief[];
    };

    theories?: OrganizationalTheory[];

    organizationalConditions?: OrganizationalCondition[];
  };

  const snapshots = memory.understandingSnapshots ?? [];
  const learningEvents = memory.learningEvents ?? [];
  const conditionEvolution = buildConditionEvolution(
    memory.organizationalConditions ?? [],
  );

  const current = snapshots.at(-1);
  const previous = snapshots.at(-2);

  const currentUnderstanding = current?.organizationalUnderstandingScore ?? 0;
  const previousUnderstanding =
    previous?.organizationalUnderstandingScore ?? currentUnderstanding;

  const currentMemory = current?.memoryMaturityScore ?? 0;
  const previousMemory = previous?.memoryMaturityScore ?? currentMemory;

  const currentConfidence = current?.executiveAssessmentConfidence ?? 0;
  const previousConfidence =
    previous?.executiveAssessmentConfidence ?? currentConfidence;

  const learningScore =
    memory.organizationalLearningProfile?.learningVelocityScore ?? 0;

  const changeSummary = buildExecutiveChangeSummary({
    currentSnapshot: current,
    previousSnapshot: previous,
    learningEvents,
    beliefs: memory.organizationalUnderstandingState?.organizationalBeliefs,
    theories: memory.theories,
  });

  const newBeliefs = changeSummary.newBeliefs.length;
  const strengthenedBeliefs = changeSummary.strengthenedBeliefs.length;
  const weakenedBeliefs = changeSummary.weakenedBeliefs.length;
  const newTheories = changeSummary.newTheories.length;

  const stabilizedTheories =
    changeSummary.stabilizedTheories.length ||
    (memory.theories ?? []).filter(
      (theory) =>
        theory.status === "stable" || theory.status === "strengthening",
    ).length;

  const conditionNarrative = buildConditionNarrative(conditionEvolution);

  const narrative =
    snapshots.length < 2
      ? "Discovery has not yet accumulated enough learning history to describe how organizational understanding has evolved."
      : `Since the previous investigation, Discovery strengthened ${strengthenedBeliefs} organizational beliefs, identified ${newBeliefs} new beliefs, stabilized ${stabilizedTheories} organizational theories, and changed overall understanding by ${
          currentUnderstanding - previousUnderstanding
        } points. ${conditionNarrative}`.trim();

  const recommendedAttention: ExecutiveAttentionItem[] = [
    ...conditionEvolution.slice(0, 3).map((condition) => ({
      id: condition.id,
      title: condition.name,
      reason:
        condition.summary ||
        "Discovery is tracking this as a persistent organizational condition.",
      confidence: condition.confidence,
    })),
    ...changeSummary.stabilizedTheories.slice(0, 2).map((item) => ({
      id: item.id,
      title: item.title,
      reason: item.reason,
      confidence: item.confidenceDelta,
    })),
    ...changeSummary.strengthenedTheories.slice(0, 2).map((item) => ({
      id: item.id,
      title: item.title,
      reason: item.reason,
      confidence: item.confidenceDelta,
    })),
    ...changeSummary.strengthenedBeliefs.slice(0, 2).map((item) => ({
      id: item.id,
      title: item.title,
      reason: item.reason,
      confidence: item.confidenceDelta,
    })),
    ...changeSummary.newBeliefs.slice(0, 2).map((item) => ({
      id: item.id,
      title: item.title,
      reason: item.reason,
      confidence: item.confidenceDelta,
    })),
  ].slice(0, 5);

  return {
    generatedAt: new Date().toISOString(),

    understanding: {
      current: currentUnderstanding,
      previous: previousUnderstanding,
      delta: currentUnderstanding - previousUnderstanding,
    },

    memoryMaturity: {
      current: currentMemory,
      previous: previousMemory,
      delta: currentMemory - previousMemory,
    },

    learning: {
      current: learningScore,
      previous: learningScore,
      delta: 0,
    },

    confidence: {
      current: currentConfidence,
      previous: previousConfidence,
      delta: currentConfidence - previousConfidence,
    },

    newBeliefs,
    strengthenedBeliefs,
    weakenedBeliefs,

    newTheories,
    stabilizedTheories,

    timeline: buildTimeline(snapshots),

    narrative,

    recommendedAttention,

    conditionEvolution,
  };
}