type CurrentUnderstandingProps = {
  understanding?: any;
  primaryBelief?: any;
};

export default function CurrentUnderstanding({
  understanding,
  primaryBelief,
}: CurrentUnderstandingProps) {
  const headline =
    primaryBelief?.headline ??
    understanding?.headline ??
    "Discovery is forming a working understanding.";

  const explanation =
    primaryBelief?.explanation ??
    understanding?.explanation ??
    "Discovery connected the available evidence into a coherent working understanding.";

  return (
    <section className="workspace-section">
      <p className="overview-label">Current Understanding</p>

      <h3>{headline}</h3>

      <p>{explanation}</p>

      <div className="workspace-notebook">
        <NotebookRow
          label="Current conclusion"
          value={headline}
        />

        <NotebookRow
          label="Confidence"
          value={
            primaryBelief?.confidence
              ? `${Math.round(primaryBelief.confidence * 100)}%`
              : "Moderate"
          }
        />

        <NotebookRow
          label="Status"
          value="Working understanding"
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