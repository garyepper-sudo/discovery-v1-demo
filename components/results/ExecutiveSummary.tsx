type ExecutiveSummaryProps = {
  executiveUnderstanding?: any;
  evidenceCount?: number;
  onTrace?: () => void;
};

export default function ExecutiveSummary({
  executiveUnderstanding,
  evidenceCount = 0,
  onTrace,
}: ExecutiveSummaryProps) {
  const headline =
    executiveUnderstanding?.headline ??
    "Discovery has formed an initial understanding.";

  const explanation =
    executiveUnderstanding?.explanation ??
    "Discovery connected the available signals into a current working explanation.";

  const confidence = executiveUnderstanding?.confidence ?? 0.5;

  const confidenceLabel =
    confidence >= 0.78 ? "High" : confidence >= 0.58 ? "Moderate" : "Early";

  const nextQuestion =
    executiveUnderstanding?.openQuestions?.[0] ??
    "What evidence would most strengthen or weaken this understanding?";

  const nextMoves = executiveUnderstanding?.nextMoves ?? [];

  return (
    <section className="executive-summary-card">
      <p className="overview-label">What We Understand</p>

      <h1>{headline}</h1>

      <div className="executive-confidence-row">
        <span>Confidence: {confidenceLabel}</span>
        <span>{evidenceCount} sources analyzed</span>
      </div>

      <p className="executive-summary-body">{explanation}</p>

      <div className="executive-summary-grid">
        <div>
          <p className="overview-label">Suggested Next Question</p>
          <p>{nextQuestion}</p>
        </div>

        <div>
          <p className="overview-label">Recommended Next Move</p>
          <p>{nextMoves[0] ?? "Review the strongest evidence behind this understanding."}</p>
        </div>
      </div>

      <button className="trace-button" onClick={onTrace}>
        Trace understanding →
      </button>
    </section>
  );
}