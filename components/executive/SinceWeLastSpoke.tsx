import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";

type SinceWeLastSpokeProps = {
  executiveDashboard: ExecutiveDashboard;
};

function formatConfidence(value?: number): string {
  if (value === undefined || value <= 0) return "—";

  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
}

export default function SinceWeLastSpoke({
  executiveDashboard,
}: SinceWeLastSpokeProps) {
  const hero = executiveDashboard.hero;
  const interpretation = executiveDashboard.interpretation;
  const timeline = executiveDashboard.sections.timeline ?? [];

  const headline = "Discovery refined its current explanation.";

  const summary =
    interpretation.currentExplanation ??
    hero.summary ??
    "Discovery continued refining its understanding using newly available organizational evidence.";

  const confidence = formatConfidence(hero.organizationConfidence);

  const learningUpdates = Math.max(timeline.length, 1);
  const rememberedSignals = executiveDashboard.rememberedEvidence?.length ?? 0;

  return (
    <section className="briefing-section since-last-spoke">
      <p className="briefing-eyebrow">Since We Last Spoke</p>

      <div className="since-last-spoke-grid">
        <div>
          <h1>{headline}</h1>

          <p>{summary}</p>

          <div
            style={{
              marginTop: "1rem",
              display: "flex",
              flexDirection: "column",
              gap: ".75rem",
            }}
          >
            <div>
              <strong>How the explanation evolved</strong>
              <p>{interpretation.explanationEvolution}</p>
            </div>

            <div>
              <strong>Current confidence</strong>
              <p>{interpretation.confidenceNarrative}</p>
            </div>

            <div>
              <strong>What remains uncertain</strong>
              <p>{interpretation.remainingUncertainty}</p>
            </div>

            <div>
              <strong>Evidence that could change the explanation</strong>
              <p>{interpretation.evidenceThatCouldChangeTheExplanation}</p>
            </div>
          </div>
        </div>

        <div className="briefing-pulse-card">
          <span>Current Confidence</span>

          <strong>{confidence}</strong>

          <p>
            Confidence reflects the strength of Discovery&apos;s current
            explanation, not the certainty of the final answer.
          </p>
        </div>
      </div>

      <div className="briefing-evolution-row">
        <span>{learningUpdates} learning updates</span>
        <span>{rememberedSignals} remembered signals</span>
        <span>1 active organizational theory</span>
      </div>
    </section>
  );
}