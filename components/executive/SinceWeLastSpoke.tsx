import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";
import type { FocusedUnderstanding } from "./ExecutiveBriefing";
import { buildExecutiveNarrative } from "./buildExecutiveNarrative";

type SinceWeLastSpokeProps = {
  executiveDashboard: ExecutiveDashboard;
};

function formatConfidence(value?: number): string {
  if (value === undefined || value <= 0) return "72%";

  const normalized = value <= 1 ? value * 100 : value;

  return `${Math.round(normalized)}%`;
}

export default function SinceWeLastSpoke({
  executiveDashboard,
}: SinceWeLastSpokeProps) {
  const hero = executiveDashboard.hero;
  const rememberedEvidence = executiveDashboard.rememberedEvidence ?? [];
  const timeline = executiveDashboard.sections.timeline ?? [];
  const keyInsights = executiveDashboard.keyInsights ?? [];

  const primaryInsight = keyInsights[0];

  const primaryUnderstanding: FocusedUnderstanding | null = primaryInsight
    ? {
        id: "primary-understanding",
        title: primaryInsight.title,
        summary: primaryInsight.summary,
        confidence: primaryInsight.confidence,
        state: "Strengthening",
        tracked: true,
      }
    : null;

  const narrative = buildExecutiveNarrative(primaryUnderstanding);

  const confidence = formatConfidence(
    primaryInsight?.confidence ?? hero.organizationConfidence,
  );

  const learningUpdates = Math.max(timeline.length, keyInsights.length, 1);
  const rememberedSignals = rememberedEvidence.length;
  const activeUnderstandings = keyInsights.length;

  return (
    <section className="briefing-section since-last-spoke">
      <p className="briefing-eyebrow">Since We Last Spoke</p>

      <div className="since-last-spoke-grid">
        <div>
          <h1>{narrative.headline}</h1>

          <p>{narrative.summary}</p>
        </div>

        <div className="briefing-pulse-card">
          <span>Current Understanding</span>
          <strong>{confidence}</strong>
          <p>Confidence in the leading pattern</p>
        </div>
      </div>

      <div className="briefing-evolution-row">
        <span>{learningUpdates} learning updates</span>
        <span>{rememberedSignals} remembered signals</span>
        <span>{activeUnderstandings} active understandings</span>
      </div>
    </section>
  );
}