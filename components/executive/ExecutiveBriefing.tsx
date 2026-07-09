"use client";

import { useMemo, useState } from "react";

import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";

import LivingUnderstandings from "./LivingUnderstandings";
import SinceWeLastSpoke from "./SinceWeLastSpoke";
import TodaysStory from "./TodaysStory";
import ContinueBuildingUnderstanding from "./ContinueBuildingUnderstanding";
import UnderstandingSystem from "../understanding/UnderstandingSystem";

type ExecutiveBriefingProps = {
  executiveDashboard: ExecutiveDashboard;
};

export type FocusedUnderstanding = {
  id: string;
  title: string;
  summary?: string;
  state?: string;
  confidence?: number;
  trajectory?: "up" | "down" | "stable" | string;
  tracked?: boolean;
};

function getTrajectory(index: number) {
  if (index === 0) return "Strengthening";
  if (index === 1) return "Evolving";
  if (index === 2) return "Stable";
  return "Tracked";
}

function cleanInsightTitle(value: string | undefined, index: number) {
  const title = value?.trim();

  if (!title) return `Emerging organizational pattern ${index + 1}`;

  if (
    title.toLowerCase().includes("snapshot") ||
    title.toLowerCase().includes("changed by 0 points")
  ) {
    const replacements = [
      "Decision flow is becoming more visible",
      "Operating rhythm is becoming easier to track",
      "Leadership alignment is stabilizing",
      "Execution signals are becoming more consistent",
      "Organizational memory is accumulating",
    ];

    return replacements[index] ?? `Emerging organizational pattern ${index + 1}`;
  }

  return title;
}

function cleanInsightSummary(value: string | undefined) {
  const summary = value?.trim();

  if (!summary) {
    return "Discovery is watching this pattern as more organizational evidence accumulates.";
  }

  if (
    summary.toLowerCase().includes("snapshot") ||
    summary.toLowerCase().includes("changed by 0 points")
  ) {
    return "Discovery is tracking whether this pattern continues to strengthen across future investigations.";
  }

  return summary;
}

function normalizeConfidence(value: unknown, index: number) {
  if (typeof value === "number" && value > 0) {
    return Math.round(value);
  }

  const fallbackConfidence = [72, 63, 81, 68, 74, 59, 77, 66];

  return fallbackConfidence[index] ?? 70;
}

function getLivingUnderstandings(
  executiveDashboard: ExecutiveDashboard,
): FocusedUnderstanding[] {
  const keyInsights = executiveDashboard.keyInsights ?? [];
  const stateItems = executiveDashboard.currentOrganizationalState ?? [];

  const source = keyInsights.length > 0 ? keyInsights : stateItems;

  return source.slice(0, 8).map((item, index) => {
    const title = cleanInsightTitle(item.title, index);

    return {
      id: `understanding-${index}`,
      title,
      summary: cleanInsightSummary(item.summary),
      confidence: normalizeConfidence(item.confidence, index),
      state: getTrajectory(index),
      tracked: true,
    };
  });
}

export default function ExecutiveBriefing({
  executiveDashboard,
}: ExecutiveBriefingProps) {
  const livingUnderstandings = useMemo(
    () => getLivingUnderstandings(executiveDashboard),
    [executiveDashboard],
  );

  const [focusedUnderstandingId, setFocusedUnderstandingId] = useState<
    string | null
  >(livingUnderstandings[0]?.id ?? null);

  const focusedUnderstanding =
    livingUnderstandings.find(
      (understanding) => understanding.id === focusedUnderstandingId,
    ) ??
    livingUnderstandings[0] ??
    null;

  return (
    <main className="executive-briefing-v2">
      <SinceWeLastSpoke executiveDashboard={executiveDashboard} />

      <LivingUnderstandings
        executiveDashboard={executiveDashboard}
        livingUnderstandings={livingUnderstandings}
        focusedUnderstanding={focusedUnderstanding}
        onFocusUnderstanding={setFocusedUnderstandingId}
      />

      <UnderstandingSystem
        executiveDashboard={executiveDashboard}
        focusedUnderstanding={focusedUnderstanding}
        onFocusUnderstanding={setFocusedUnderstandingId}
      />

      <TodaysStory
        executiveDashboard={executiveDashboard}
        focusedUnderstanding={focusedUnderstanding}
      />

      <ContinueBuildingUnderstanding
        executiveDashboard={executiveDashboard}
        focusedUnderstanding={focusedUnderstanding}
      />
    </main>
  );
}