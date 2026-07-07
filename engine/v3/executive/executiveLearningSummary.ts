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
  };

  const snapshots = memory.understandingSnapshots ?? [];
  const learningEvents = memory.learningEvents ?? [];

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

  const narrative =
    snapshots.length < 2
      ? "Discovery has not yet accumulated enough learning history to describe how organizational understanding has evolved."
      : `Since the previous investigation, Discovery strengthened ${strengthenedBeliefs} organizational beliefs, identified ${newBeliefs} new beliefs, stabilized ${stabilizedTheories} organizational theories, and changed overall understanding by ${
          currentUnderstanding - previousUnderstanding
        } points.`;

  const recommendedAttention: ExecutiveAttentionItem[] = [
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
  };
}