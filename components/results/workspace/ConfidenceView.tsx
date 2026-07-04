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
    <div className="workspace-content">
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
    </div>
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
    <div className="workspace-row">
      <div className="workspace-row-label">
        {label}
      </div>

      <div className="workspace-row-divider" />

      <div className="workspace-row-value">
        {value}
      </div>
    </div>
  );
}

function getConfidenceAssessment(confidence: number) {
  if (confidence >= 85) return "Very strong";
  if (confidence >= 70) return "Strong";
  if (confidence >= 55) return "Moderate";
  return "Early understanding";
}