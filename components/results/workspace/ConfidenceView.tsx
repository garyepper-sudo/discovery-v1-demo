type ConfidenceViewProps = {
  primaryBelief?: any;
  evidence?: any[];
  contradictions?: any[];
  organismState?: any;
};

export default function ConfidenceView({
  primaryBelief,
  evidence = [],
  contradictions = [],
  organismState,
}: ConfidenceViewProps) {
  const confidence = Math.round(
    ((primaryBelief?.confidence ?? 0.75) as number) * 100
  );

  const mechanisms = organismState?.mechanisms?.length ?? 0;

  return (
    <section className="workspace-section">
      <p className="overview-label">Confidence</p>

      <h3>Why Discovery is {confidence}% confident.</h3>

      <div className="workspace-notebook">
        <NotebookRow
          label="Evidence"
          value={`${evidence.length} supporting signals`}
        />

        <NotebookRow
          label="Mechanisms"
          value={`${mechanisms} explanatory mechanisms`}
        />

        <NotebookRow
          label="Contradictions"
          value={`${contradictions.length} active tensions`}
        />

        <NotebookRow
          label="Assessment"
          value={getConfidenceAssessment(confidence)}
        />
      </div>
    </section>
  );
}

function NotebookRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="notebook-row">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function getConfidenceAssessment(confidence: number) {
  if (confidence >= 85) return "Very strong";
  if (confidence >= 70) return "Strong";
  if (confidence >= 55) return "Moderate";
  return "Early understanding";
}