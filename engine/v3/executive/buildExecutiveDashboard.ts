import type {
  ExecutiveAttentionItem,
  ExecutiveChangeItem,
  ExecutiveMetricCard,
  ExecutiveRecommendedAction,
  ExecutiveState,
  ExecutiveTimelineEntry,
  ExecutiveUnderstandingItem,
} from "./executiveState";

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

export type ExecutiveDashboardSections = {
  understanding: ExecutiveUnderstandingItem[];
  changes: ExecutiveChangeItem[];
  attention: ExecutiveAttentionItem[];
  timeline: ExecutiveTimelineEntry[];
};

export type ExecutiveDashboardExpandable = {
  theories: unknown[];
  beliefs: unknown[];
  mechanisms: unknown[];
  workspace: unknown[];
  evidence: unknown[];
};

export type ExecutiveDashboard = {
  hero: ExecutiveDashboardHero;
  metrics: ExecutiveMetricCard[];
  keyInsights: ExecutiveKeyInsight[];
  currentOrganizationalState: ExecutiveOrganizationalStateItem[];
  operatingMechanisms: ExecutiveOperatingMechanism[];
  rememberedEvidence: ExecutiveRememberedEvidence[];
  sections: ExecutiveDashboardSections;
  nextAction?: ExecutiveRecommendedAction;
  expandable: ExecutiveDashboardExpandable;
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

  if (decliningMetrics >= 2) return "watch";
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
  if (item.confidence !== undefined && item.confidence >= 0.75) {
    return "high";
  }

  if (item.confidence !== undefined && item.confidence < 0.45) {
    return "low";
  }

  return "medium";
}

function resolveStatePriority(
  item: ExecutiveChangeItem,
): ExecutiveOrganizationalStatePriority {
  if (item.confidence !== undefined && item.confidence >= 0.75) {
    return "high";
  }

  if (item.confidence !== undefined && item.confidence < 0.45) {
    return "low";
  }

  return "medium";
}

function buildKeyInsights(state: ExecutiveState): ExecutiveKeyInsight[] {
  return limitSection(state.currentUnderstanding, 4).map((item) => ({
    title: item.title,
    summary: item.summary,
    importance: resolveInsightImportance(item),
    confidence: item.confidence,
  }));
}

function buildCurrentOrganizationalState(
  state: ExecutiveState,
): ExecutiveOrganizationalStateItem[] {
  return limitSection(state.whatChanged, 5).map((item) => ({
    title: item.title,
    summary: item.summary,
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
      title:
        item.title ??
        item.statement ??
        item.summary ??
        "Discovery found a possible operating pattern.",
      summary:
        item.summary ??
        item.description ??
        item.explanation ??
        "This behavior may explain why the pattern keeps appearing.",
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
      summary:
        item.summary ??
        item.text ??
        item.observation ??
        "Evidence retained in organizational memory.",
      source: item.source,
      confidence: item.confidence,
    }),
  );
}

export function buildExecutiveDashboard(
  state: ExecutiveState,
): ExecutiveDashboard {
  return {
    hero: {
      headline: state.headline,
      summary: state.summary,
      status: resolveStatus(state),
      organizationConfidence: state.organizationConfidence,
      generatedAt: state.generatedAt,
      lastInvestigation: state.lastInvestigation,
    },

    metrics: limitSection(state.metrics, 4),

    keyInsights: buildKeyInsights(state),

    currentOrganizationalState: buildCurrentOrganizationalState(state),

    operatingMechanisms: buildOperatingMechanisms(state),

    rememberedEvidence: buildRememberedEvidence(state),

    sections: {
      understanding: limitSection(state.currentUnderstanding, 3),
      changes: limitSection(state.whatChanged, 3),
      attention: limitSection(state.leadershipAttention, 3),
      timeline: limitSection(state.learningTimeline, 5),
    },

    nextAction: state.nextRecommendedAction,

    expandable: state.expandable,
  };
}