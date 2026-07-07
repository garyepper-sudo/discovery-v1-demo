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
  attention: ExecutiveAttentionItem[];
  timeline: ExecutiveTimelineEntry[];
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
};

const executiveLanguageMap: Record<string, string> = {
  "Leadership Dependency": "Critical decisions depend on too few people.",
  "Organizational Continuity Failure":
    "Knowledge transfer is becoming a business continuity risk.",
  "Cross Functional Execution Friction":
    "Teams are struggling to coordinate effectively.",
};

function translateTitle(title: string): string {
  return executiveLanguageMap[title] ?? title;
}

function translateSummary(summary: string): string {
  return summary
    .replaceAll("Discovery identified", "The organization shows")
    .replaceAll("Discovery believes", "The organization appears to show")
    .replaceAll("Discovery strengthened", "The evidence strengthened")
    .replaceAll("Discovery detected", "The organization shows")
    .replaceAll("organizational theories", "stable organizational patterns")
    .replaceAll("organizational beliefs", "operating assumptions");
}

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

function buildKeyInsights(state: ExecutiveState): ExecutiveKeyInsight[] {
  return limitSection(state.currentUnderstanding, 4).map((item) => ({
    title: translateTitle(item.title),
    summary: translateSummary(item.summary),
    importance: resolveInsightImportance(item),
    confidence: item.confidence,
  }));
}

function buildCurrentOrganizationalState(
  state: ExecutiveState,
): ExecutiveOrganizationalStateItem[] {
  return limitSection(state.whatChanged, 5).map((item) => ({
    title: translateTitle(item.title),
    summary: translateSummary(item.summary),
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
      title: translateTitle(
        item.title ??
          item.statement ??
          item.summary ??
          "A possible operating pattern is emerging.",
      ),
      summary: translateSummary(
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
      summary: translateSummary(
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

function buildAttentionItems(
  state: ExecutiveState,
): ExecutiveAttentionItem[] {
  return limitSection(state.leadershipAttention, 3).map((item) => ({
    ...item,
    title: translateTitle(item.title),
    reason: translateSummary(item.reason),
  }));
}

function buildTimeline(state: ExecutiveState): ExecutiveTimelineEntry[] {
  return limitSection(state.learningTimeline, 5).map((item) => ({
    ...item,
    summary:
      "summary" in item && typeof item.summary === "string"
        ? translateSummary(item.summary)
        : item.summary,
  }));
}

export function buildExecutiveDashboard(
  state: ExecutiveState,
): ExecutiveDashboard {
  return {
    hero: {
      headline: translateTitle(state.headline),
      summary: translateSummary(state.summary),
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
      attention: buildAttentionItems(state),
      timeline: buildTimeline(state),
    },

    nextAction: state.nextRecommendedAction,
  };
}