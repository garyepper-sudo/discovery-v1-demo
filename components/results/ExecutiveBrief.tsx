"use client";

type ExecutiveBriefProps = {
  headline: string;
  explanation: string;
  whyItMatters: string;
  recommendedNextStep: string;
  confidence: number;
  evidenceCount: number;
  mechanismCount: number;
  narrative: {
    headline: string;
    summary: string;
  };
  onExplore: () => void;
};

export default function ExecutiveBrief({
  headline,
  explanation,
  whyItMatters,
  recommendedNextStep,
  confidence,
  evidenceCount,
  mechanismCount,
  narrative,
  onExplore,
}: ExecutiveBriefProps) {
  return (
    <div className="briefing-main">
      <p className="overview-label">Investigation complete</p>

      <section className="briefing-hero">
        <p className="overview-label">What Discovery understands</p>

        <h1>{headline}</h1>

        <div className="briefing-meta">
          <span>{confidence}% confidence</span>
          <span>{evidenceCount} sources analyzed</span>
          <span>{mechanismCount} mechanisms</span>
        </div>

        <p>{shortenExecutiveText(explanation)}</p>
      </section>

      <section className="briefing-panel">
        <p className="overview-label">Why it matters</p>
        <h2>{whyItMatters}</h2>
      </section>

      <section className="briefing-panel">
        <p className="overview-label">Recommended next step</p>
        <h2>{recommendedNextStep}</h2>
      </section>

      <div className="overview-actions">
        <button onClick={onExplore}>Explore Understanding →</button>
      </div>

      <section className="briefing-panel">
        <p className="overview-label">Understanding evolution</p>
        <h2>{narrative.headline}</h2>
        <p className="briefing-muted">{narrative.summary}</p>
      </section>
    </div>
  );
}

function shortenExecutiveText(text: string) {
  if (!text) return "";

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  return sentences.slice(0, 3).join(" ");
}