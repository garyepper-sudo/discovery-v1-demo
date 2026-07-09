import {
  buildSinceLastSpoke,
  buildCurrentStory,
  buildLeadershipConversation,
  buildActionPlan,
  buildExploreUnderstanding,
} from "./expression/executiveConversation";

import type {
  ExecutiveAttentionItem,
  ExecutiveChangeItem,
  ExecutiveMetricCard,
  ExecutiveNarrative,
  ExecutiveRecommendedAction,
  ExecutiveState,
  ExecutiveTimelineEntry,
  ExecutiveUnderstandingItem,
} from "./executiveState";

import {
  translateExecutiveTitle,
  translateExecutiveSummary,
  translateExecutiveContinuity,
} from "./expression/executiveLanguage";

export type ExecutiveDashboardStatus =
  | "improving"
  | "stable"
  | "watch"
  | "critical";

export type ExecutiveInsightImportance = "high" | "medium" | "low";

export type ExecutiveOrganizationalStateCategory =
  | "pattern"
  | "risk"
  | "opportunity";

export type ExecutiveOrganizationalStatePriority =
  | "high"
  | "medium"
  | "low";

export type ExecutiveDashboardHero = {
  headline: string;
  summary: string;
  status: ExecutiveDashboardStatus;
  organizationConfidence?: number;
  generatedAt: string;
  lastInvestigation?: string;
};

export type ExecutiveKeyInsight = {
  title: string;
  summary: string;
  importance: ExecutiveInsightImportance;
  confidence?: number;
  evidenceCount?: number;
};

export type ExecutiveOrganizationalStateItem = {
  title: string;
  summary: string;
  category: ExecutiveOrganizationalStateCategory;
  priority: ExecutiveOrganizationalStatePriority;
  confidence?: number;
};

export type ExecutiveOperatingMechanism = {
  title: string;
  summary: string;
  role: "strength" | "constraint" | "system" | "unknown";
  confidence?: number;
};

export type ExecutiveRememberedEvidence = {
  title: string;
  summary: string;
  source?: string;
  confidence?: number;
};

export type ExecutiveConversationSection = {
  eyebrow: string;
  headline: string;
  summary: string;
  items: string[];
};

export type ExecutiveConversation = {
  sinceLastSpoke: ExecutiveConversationSection;
  currentOrganizationalStory: ExecutiveConversationSection;
  leadershipConversation: ExecutiveConversationSection;
  actionPlan: ExecutiveConversationSection;
  exploreUnderstanding: ExecutiveConversationSection;
};

export type ExecutiveDashboardNarrative = ExecutiveNarrative;

export type ExecutiveDashboardSections = {
  conversation: ExecutiveConversation;
  narratives: ExecutiveDashboardNarrative[];
  attention: ExecutiveAttentionItem[];
  timeline: ExecutiveTimelineEntry[];
};

export type ExecutiveDashboard = {
  hero: ExecutiveDashboardHero;
  conversation: ExecutiveConversation;
  metrics: ExecutiveMetricCard[];
  narratives: ExecutiveDashboardNarrative[];
  keyInsights: ExecutiveKeyInsight[];
  currentOrganizationalState: ExecutiveOrganizationalStateItem[];
  operatingMechanisms: ExecutiveOperatingMechanism[];
  rememberedEvidence: ExecutiveRememberedEvidence[];
  sections: ExecutiveDashboardSections;
  nextAction?: ExecutiveRecommendedAction;
};

function resolveStatus(state: ExecutiveState): ExecutiveDashboardStatus {
  if (state.status) return state.status;

  const criticalAttention = state.leadershipAttention.some(
    (item) => item.priority === "highest",
  );

  const decliningMetrics = state.metrics.filter(
    (metric) => metric.trend === "down",
  ).length;

  const improvingMetrics = state.metrics.filter(
    (metric) => metric.trend === "up",
  ).length;

  const decliningNarratives = state.executiveNarratives.filter(
    (narrative) => narrative.momentum === "declining",
  ).length;

  if (decliningMetrics >= 2) return "watch";
  if (decliningNarratives >= 2) return "watch";
  if (criticalAttention) return "watch";
  if (improvingMetrics > decliningMetrics) return "improving";

  return "stable";
}

function limitSection<T>(items: T[], limit: number): T[] {
  return items.slice(0, limit);
}

function resolveInsightImportance(
  item: ExecutiveUnderstandingItem,
): ExecutiveInsightImportance {
  if (item.confidence !== undefined && item.confidence >= 0.75) return "high";
  if (item.confidence !== undefined && item.confidence < 0.45) return "low";
  return "medium";
}

function resolveStatePriority(
  item: ExecutiveChangeItem,
): ExecutiveOrganizationalStatePriority {
  if (item.confidence !== undefined && item.confidence >= 0.75) return "high";
  if (item.confidence !== undefined && item.confidence < 0.45) return "low";
  return "medium";
}

function buildNarratives(state: ExecutiveState): ExecutiveDashboardNarrative[] {
  return limitSection(state.executiveNarratives, 5).map((narrative) => ({
    ...narrative,
    headline: translateExecutiveTitle(narrative.headline),
    observation: translateExecutiveSummary(narrative.observation),
    businessImpact: translateExecutiveSummary(narrative.businessImpact),
    executiveConversation: translateExecutiveSummary(
      narrative.executiveConversation,
    ),
    supportingReasoning: narrative.supportingReasoning
      ? translateExecutiveSummary(narrative.supportingReasoning)
      : undefined,
    continuity: translateExecutiveContinuity(narrative.continuity),
  }));
}

function buildKeyInsights(state: ExecutiveState): ExecutiveKeyInsight[] {
  return limitSection(state.currentUnderstanding, 4).map((item) => ({
    title: translateExecutiveTitle(item.title),
    summary: translateExecutiveSummary(item.summary),
    importance: resolveInsightImportance(item),
    confidence: item.confidence,
  }));
}

function buildCurrentOrganizationalState(
  state: ExecutiveState,
): ExecutiveOrganizationalStateItem[] {
  return limitSection(state.whatChanged, 5).map((item) => ({
    title: translateExecutiveTitle(item.title),
    summary: translateExecutiveSummary(item.summary),
    category: "pattern",
    priority: resolveStatePriority(item),
    confidence: item.confidence,
  }));
}

function buildOperatingMechanisms(
  state: ExecutiveState,
): ExecutiveOperatingMechanism[] {
  return limitSection(state.expandable.mechanisms, 5).map(
    (item: any): ExecutiveOperatingMechanism => ({
      title: translateExecutiveTitle(
        item.title ??
          item.statement ??
          item.summary ??
          "A possible operating pattern is emerging.",
      ),
      summary: translateExecutiveSummary(
        item.summary ??
          item.description ??
          item.explanation ??
          "This behavior may explain why the pattern keeps appearing.",
      ),
      role: "system",
      confidence: item.confidence,
    }),
  );
}

function buildRememberedEvidence(
  state: ExecutiveState,
): ExecutiveRememberedEvidence[] {
  return limitSection(state.expandable.evidence, 5).map(
    (item: any): ExecutiveRememberedEvidence => ({
      title: item.title ?? item.source ?? "Remembered signal",
      summary: translateExecutiveSummary(
        item.summary ??
          item.text ??
          item.observation ??
          "Evidence retained in organizational memory.",
      ),
      source: item.source,
      confidence: item.confidence,
    }),
  );
}

function buildAttentionItems(state: ExecutiveState): ExecutiveAttentionItem[] {
  return limitSection(state.leadershipAttention, 3).map((item) => ({
    ...item,
    title: translateExecutiveTitle(item.title),
    reason: translateExecutiveSummary(item.reason),
  }));
}

function buildTimeline(state: ExecutiveState): ExecutiveTimelineEntry[] {
  return limitSection(state.learningTimeline, 5).map((item) => ({
    ...item,
    summary:
      "summary" in item && typeof item.summary === "string"
        ? translateExecutiveSummary(item.summary)
        : item.summary,
  }));
}

function buildExecutiveConversation(
  state: ExecutiveState,
  narratives: ExecutiveDashboardNarrative[],
): ExecutiveConversation {
  return {
    sinceLastSpoke: buildSinceLastSpoke(state),
    currentOrganizationalStory: buildCurrentStory(state, narratives),
    leadershipConversation: buildLeadershipConversation(narratives),
    actionPlan: buildActionPlan(state),
    exploreUnderstanding: buildExploreUnderstanding(state),
  };
}

export function buildExecutiveDashboard(
  state: ExecutiveState,
): ExecutiveDashboard {
  const narratives = buildNarratives(state);
  const conversation = buildExecutiveConversation(state, narratives);

  return {
    hero: {
      headline: conversation.sinceLastSpoke.headline,
      summary: conversation.sinceLastSpoke.summary,
      status: resolveStatus(state),
      organizationConfidence: state.organizationConfidence,
      generatedAt: state.generatedAt,
      lastInvestigation: state.lastInvestigation,
    },

    conversation,

    metrics: limitSection(state.metrics, 4),

    narratives,

    keyInsights: buildKeyInsights(state),

    currentOrganizationalState: buildCurrentOrganizationalState(state),

    operatingMechanisms: buildOperatingMechanisms(state),

    rememberedEvidence: buildRememberedEvidence(state),

    sections: {
      conversation,
      narratives,
      attention: buildAttentionItems(state),
      timeline: buildTimeline(state),
    },

    nextAction: state.nextRecommendedAction,
  };
}