"use client";

import { useMemo, useState } from "react";

import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";

import CurrentWorkingTheory from "./currentTheory/CurrentWorkingTheory";
import LivingUnderstandings from "./LivingUnderstandings";
import ContinueBuildingUnderstanding from "./ContinueBuildingUnderstanding";

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

function normalizeConfidence(value?: number) {
  if (typeof value === "number" && value > 0) {
    return Math.round(value <= 1 ? value * 100 : value);
  }

  return 70;
}

function buildFocusedUnderstandings(
  executiveDashboard: ExecutiveDashboard,
): FocusedUnderstanding[] {
  const interpretation = executiveDashboard.interpretation;
  const confidence = normalizeConfidence(
    executiveDashboard.hero.organizationConfidence,
  );

  return [
    {
      id: "current-explanation",
      title: "Current Explanation",
      summary: interpretation.currentExplanation,
      confidence,
      state: "Strengthening",
      trajectory: "up",
      tracked: true,
    },
    {
      id: "confidence",
      title: "Confidence",
      summary: interpretation.confidenceNarrative,
      confidence,
      state: "Learning",
      trajectory: "stable",
      tracked: true,
    },
    {
      id: "remaining-uncertainty",
      title: "Remaining Uncertainty",
      summary: interpretation.remainingUncertainty,
      confidence,
      state: "Watch",
      trajectory: "stable",
      tracked: true,
    },
    {
      id: "next-evidence",
      title: "Next Evidence",
      summary: interpretation.evidenceThatCouldChangeTheExplanation,
      confidence,
      state: "Useful",
      trajectory: "up",
      tracked: true,
    },
  ].filter((item) => item.summary && item.summary.trim().length > 0);
}

export default function ExecutiveBriefing({
  executiveDashboard,
}: ExecutiveBriefingProps) {
  const livingUnderstandings = useMemo(
    () => buildFocusedUnderstandings(executiveDashboard),
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
      <CurrentWorkingTheory
        interpretation={executiveDashboard.interpretation}
        organizationConfidence={executiveDashboard.hero.organizationConfidence}
      />

      <LivingUnderstandings
        executiveDashboard={executiveDashboard}
        livingUnderstandings={livingUnderstandings}
        focusedUnderstanding={focusedUnderstanding}
        onFocusUnderstanding={setFocusedUnderstandingId}
      />

      <ContinueBuildingUnderstanding
        executiveDashboard={executiveDashboard}
        focusedUnderstanding={focusedUnderstanding}
      />
    </main>
  );
}