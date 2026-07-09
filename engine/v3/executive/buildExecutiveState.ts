import type {
  ExecutiveAttentionItem,
  ExecutiveAttentionPriority,
  ExecutiveChangeItem,
  ExecutiveMentalModelEvolution,
  ExecutiveMetricCard,
  ExecutiveMetricTrend,
  ExecutiveNarrative,
  ExecutiveRecommendedAction,
  ExecutiveState,
  ExecutiveTimelineEntry,
  ExecutiveUnderstandingItem,
} from "./executiveState";

import { resolveNarrativeId } from "./narrativeIdentity";
import {
  buildNarrativeContinuity,
  clampConfidence,
  getPreviousNarratives,
} from "./narrativeContinuity";
import type { OrganizationRuntime } from "../runtime/organizationRuntime";
import type { ExecutiveBriefing } from "./buildExecutiveBriefing";
import type { ExecutiveLearningSummary } from "./executiveLearningSummary";
import type { ExecutiveChangeSummary } from "./buildExecutiveChangeSummary";

export type BuildExecutiveStateInput = {
  runtime: OrganizationRuntime;
  briefing?: ExecutiveBriefing;
  learning?: ExecutiveLearningSummary;
  changes?: ExecutiveChangeSummary;
};

type NumericDelta = {
  current?: number;
  previous?: number;
  delta?: number;
};

function trendFromDelta(delta?: number): ExecutiveMetricTrend {
  if (typeof delta !== "number") return "unknown";
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "stable";
}

function formatDelta(delta?: number): string {
  if (typeof delta !== "number") return "No prior comparison";
  if (delta > 0) return `▲ +${delta}`;
  if (delta < 0) return `▼ ${delta}`;
  return "Stable";
}

function buildMetricCard(
  label: string,
  metric?: NumericDelta,
  unit: ExecutiveMetricCard["unit"] = "score",
): ExecutiveMetricCard {
  const current = metric?.current ?? 0;
  const previous = metric?.previous;
  const delta = metric?.delta;

  return {
    label,
    current,
    previous,
    delta,
    unit,
    trend: trendFromDelta(delta),
    summary: formatDelta(delta),
  };
}

function asPriority(index: number): ExecutiveAttentionPriority {
  if (index === 0) return "highest";
  if (index === 1) return "high";
  if (index === 2) return "medium";
  return "watch";
}

function describeConfidenceChange(
  confidence?: number,
  previousConfidence?: number,
): string {
  if (confidence === undefined) {
    return "Discovery is still gathering enough evidence to express confidence in this explanation.";
  }

  if (previousConfidence === undefined) {
    if (confidence >= 0.75) {
      return "Discovery can now express this explanation with meaningful confidence because the available signals point in the same direction.";
    }

    if (confidence >= 0.5) {
      return "Discovery has enough evidence to treat this as a plausible explanation, but not enough to treat it as settled.";
    }

    return "Discovery is treating this explanation cautiously because the current evidence is still thin.";
  }

  const delta = confidence - previousConfidence;

  if (delta > 0.08) {
    return "Discovery's confidence increased because newer signals reinforced the same explanation rather than fragmenting into unrelated observations.";
  }

  if (delta < -0.08) {
    return "Discovery's confidence weakened because newer signals made the prior explanation less complete.";
  }

  return "Discovery's confidence remained mostly stable because the newer evidence did not meaningfully overturn the prior explanation.";
}

function describeExplanationChange(
  item: ExecutiveUnderstandingItem,
  previous?: ExecutiveNarrative,
): string {
  if (!previous) {
    return `Discovery now treats ${item.title.toLowerCase()} as part of the organization's operating model, not merely as an isolated observation.`;
  }

  if (previous.observation !== item.summary && item.summary) {
    return `Discovery now explains ${item.title.toLowerCase()} more specifically than before, using newer evidence to refine the prior interpretation.`;
  }

  return `Discovery's explanation of ${item.title.toLowerCase()} is becoming more stable as new evidence continues to fit the same interpretation.`;
}

function buildMentalModelEvolution(params: {
  item: ExecutiveUnderstandingItem;
  relatedAttention?: ExecutiveAttentionItem;
  previous?: ExecutiveNarrative;
  confidence?: number;
}): ExecutiveMentalModelEvolution {
  const { item, relatedAttention, previous, confidence } = params;

  return {
    currentExplanation:
      item.summary ||
      `Discovery currently explains ${item.title.toLowerCase()} as a meaningful part of how the organization operates.`,

    explanationChanged: describeExplanationChange(item, previous),

    confidenceChanged: describeConfidenceChange(
      confidence,
      previous?.confidence,
    ),

    weakenedExplanations: previous
      ? [
          "The pattern is becoming less likely to be explained as an isolated event.",
          "The pattern is becoming less likely to be explained only by local execution noise.",
        ]
      : [
          "Discovery does not yet have enough prior history to eliminate competing explanations.",
        ],

    remainingUncertainty:
      relatedAttention?.reason ||
      "Discovery still needs more evidence before it can fully explain the cause, durability, and leadership implications of this pattern.",

    whatCouldChangeDiscoverysMind:
      "Discovery would revise this explanation if future investigations show the pattern does not repeat across teams, decisions, or operating contexts.",
  };
}

function buildCurrentUnderstanding(
  briefing?: ExecutiveBriefing,
): ExecutiveUnderstandingItem[] {
  const source =
    (briefing as any)?.currentUnderstanding ??
    (briefing as any)?.understanding ??
    [];

  if (!Array.isArray(source)) return [];

  return source.map((item: any) => ({
    title: item.title ?? item.label ?? "Current understanding",
    summary: item.summary ?? item.description ?? item.reason ?? "",
    confidence: item.confidence,
  }));
}

function buildWhatChanged(
  changes?: ExecutiveChangeSummary,
  learning?: ExecutiveLearningSummary,
): ExecutiveChangeItem[] {
  const source =
    (changes as any)?.changes ??
    (changes as any)?.highlights ??
    (changes as any)?.timeline ??
    learning?.timeline ??
    [];

  if (!Array.isArray(source)) return [];

  return source.slice(0, 5).map((item: any) => ({
    title: item.title ?? item.summary ?? "Organizational change",
    summary: item.summary ?? item.description ?? "",
    reason:
      item.reason ??
      item.why ??
      item.explanation ??
      "Derived from recent learning activity.",
    confidence: item.confidence ?? item.confidenceDelta,
  }));
}

function buildLeadershipAttention(
  briefing?: ExecutiveBriefing,
  learning?: ExecutiveLearningSummary,
): ExecutiveAttentionItem[] {
  const source =
    (briefing as any)?.leadershipAttention ??
    (briefing as any)?.attention ??
    (briefing as any)?.recommendations ??
    learning?.recommendedAttention ??
    [];

  if (!Array.isArray(source)) return [];

  return source.slice(0, 5).map((item: any, index: number) => ({
    title: item.title ?? item.label ?? "Leadership attention item",
    priority: item.priority ?? asPriority(index),
    reason: item.reason ?? item.summary ?? item.description ?? "",
    source: item.source ?? "learning-event",
    confidence: item.confidence,
  }));
}

function buildLearningTimeline(
  learning?: ExecutiveLearningSummary,
): ExecutiveTimelineEntry[] {
  const source = learning?.timeline ?? [];

  if (!Array.isArray(source)) return [];

  return source.map((entry: any) => ({
    timestamp: entry.timestamp ?? entry.generatedAt ?? new Date().toISOString(),
    title: entry.title ?? "Learning event",
    summary: entry.summary ?? "",
    understanding: entry.understanding,
    confidence: entry.confidence ?? entry.confidenceDelta,
  }));
}

function buildNextRecommendedAction(
  briefing?: ExecutiveBriefing,
): ExecutiveRecommendedAction | undefined {
  const action =
    (briefing as any)?.nextRecommendedAction ??
    (briefing as any)?.recommendedAction ??
    (briefing as any)?.recommendations?.[0];

  if (!action) return undefined;

  return {
    title: action.title ?? "Run the next highest-value investigation",
    reason:
      action.reason ??
      action.summary ??
      "This should improve organizational understanding.",
    expectedUnderstandingGain: action.expectedUnderstandingGain ?? "medium",
  };
}

function buildExecutiveNarratives(
  understanding: ExecutiveUnderstandingItem[],
  attention: ExecutiveAttentionItem[],
  evidence: unknown[],
  previousNarratives: ExecutiveNarrative[],
  timestamp: string,
  investigationId?: string,
): ExecutiveNarrative[] {
  return understanding.slice(0, 5).map((item, index) => {
    const relatedAttention = attention[index];
    const id = resolveNarrativeId(item);
    const previous = previousNarratives.find((narrative) => narrative.id === id);
    const confidence = clampConfidence(
      item.confidence ?? relatedAttention?.confidence,
    );

    const baseNarrative: ExecutiveNarrative = {
      id,
      headline: item.title,
      observation:
        item.summary ||
        "Discovery is beginning to explain this as a meaningful operating pattern rather than an isolated observation.",
      businessImpact:
        relatedAttention?.reason ||
        "If this explanation continues to strengthen, it may affect execution quality, organizational resilience, decision speed, or leadership focus.",
      executiveConversation:
        relatedAttention?.title ??
        "What evidence would most improve or challenge Discovery's current explanation?",
      supportingReasoning:
        item.summary ||
        relatedAttention?.reason ||
        "This narrative is organized from existing executive understanding and leadership attention signals.",
      evidence,
      priority: relatedAttention?.priority ?? asPriority(index),
      confidence,
      momentum: "stable",
    };

    const continuity = buildNarrativeContinuity({
      narrative: baseNarrative,
      previous,
      timestamp,
      investigationId,
    });

    const mentalModelEvolution = buildMentalModelEvolution({
      item,
      relatedAttention,
      previous,
      confidence,
    });

    return {
      ...baseNarrative,
      momentum:
        continuity.lifecycle === "weakening"
          ? "declining"
          : continuity.lifecycle === "strengthening"
            ? "improving"
            : "stable",
      continuity,
      mentalModelEvolution,
    };
  });
}

export function buildExecutiveState(
  input: BuildExecutiveStateInput,
): ExecutiveState {
  const { runtime, briefing, learning, changes } = input;
  const generatedAt = new Date().toISOString();

  const metrics: ExecutiveMetricCard[] = [
    buildMetricCard("Understanding", learning?.understanding, "%"),
    buildMetricCard("Memory", learning?.memoryMaturity, "score"),
    buildMetricCard("Learning", learning?.learning, "score"),
    buildMetricCard("Confidence", learning?.confidence, "%"),
  ];

  const currentUnderstanding = buildCurrentUnderstanding(briefing);
  const leadershipAttention = buildLeadershipAttention(briefing, learning);

  const evidence =
    (runtime as any)?.observations ?? (runtime as any)?.evidence ?? [];

  const previousNarratives = getPreviousNarratives(runtime);

  const investigationId =
    (runtime as any)?.investigationId ??
    (runtime as any)?.currentInvestigationId ??
    (runtime as any)?.lastInvestigation;

  const executiveNarratives = buildExecutiveNarratives(
    currentUnderstanding,
    leadershipAttention,
    Array.isArray(evidence) ? evidence : [],
    previousNarratives,
    generatedAt,
    investigationId,
  );

  return {
    generatedAt,

    headline:
      (briefing as any)?.headline ?? "Current Organizational Understanding",

    summary:
      previousNarratives.length > 0
        ? "Discovery has refined its explanation by comparing this investigation against prior executive narratives, preserving continuity in the organizational conversation."
        : (briefing as any)?.summary ??
          (changes as any)?.summary ??
          "Discovery has assembled the current executive view from organizational understanding, memory, learning, and recent change signals.",

    metrics,

    executiveNarratives,

    currentUnderstanding,

    whatChanged: buildWhatChanged(changes, learning),

    leadershipAttention,

    learningTimeline: buildLearningTimeline(learning),

    nextRecommendedAction: buildNextRecommendedAction(briefing),

    lastInvestigation: investigationId,

    expandable: {
      theories:
        (runtime as any)?.organizationalTheories ??
        (runtime as any)?.theories ??
        (runtime as any)?.stableTheories ??
        [],
      beliefs:
        (runtime as any)?.organizationalBeliefs ??
        (runtime as any)?.beliefs ??
        (runtime as any)?.memory?.beliefs ??
        [],
      mechanisms:
        (runtime as any)?.mechanismNetwork?.mechanisms ??
        (runtime as any)?.mechanisms ??
        [],
      workspace:
        (runtime as any)?.workspace ?? (runtime as any)?.workingMemory ?? [],
      evidence,
    },
  };
}