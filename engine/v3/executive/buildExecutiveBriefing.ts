import type {
  ExecutiveLearningSummary,
  ExecutiveLearningTimelineEntry,
  ExecutiveAttentionItem,
} from "./executiveLearningSummary";

import {
  buildExecutiveHeadline,
  buildExecutiveSummary,
  translateExecutiveAttentionItem,
  translateExecutiveTimelineEntry,
} from "../expression/executive/executiveTranslator";

export type ExecutiveMetricCard = {
  title: string;
  current: number;
  previous: number;
  delta: number;
  trend: "up" | "down" | "flat";
};

export type ExecutiveBriefing = {
  generatedAt: string;

  headline: string;

  summary: string;

  metrics: ExecutiveMetricCard[];

  timeline: ExecutiveLearningTimelineEntry[];

  recommendedAttention: ExecutiveAttentionItem[];
};

function determineTrend(delta: number): "up" | "down" | "flat" {
  if (delta > 0) return "up";
  if (delta < 0) return "down";
  return "flat";
}

export function buildExecutiveBriefing(
  summary: ExecutiveLearningSummary,
): ExecutiveBriefing {
  return {
    generatedAt: summary.generatedAt,

    headline: buildExecutiveHeadline(summary),

    summary: buildExecutiveSummary(summary),

    metrics: [
      {
        title: "Understanding",
        current: summary.understanding.current,
        previous: summary.understanding.previous,
        delta: summary.understanding.delta,
        trend: determineTrend(summary.understanding.delta),
      },
      {
        title: "Memory Maturity",
        current: summary.memoryMaturity.current,
        previous: summary.memoryMaturity.previous,
        delta: summary.memoryMaturity.delta,
        trend: determineTrend(summary.memoryMaturity.delta),
      },
      {
        title: "Learning",
        current: summary.learning.current,
        previous: summary.learning.previous,
        delta: summary.learning.delta,
        trend: determineTrend(summary.learning.delta),
      },
      {
        title: "Confidence",
        current: summary.confidence.current,
        previous: summary.confidence.previous,
        delta: summary.confidence.delta,
        trend: determineTrend(summary.confidence.delta),
      },
    ],

    timeline: summary.timeline.map(translateExecutiveTimelineEntry),

    recommendedAttention: summary.recommendedAttention.map(
      translateExecutiveAttentionItem,
    ),
  };
}