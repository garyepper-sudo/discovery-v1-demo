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

  const confidence = primaryBelief?.confidence
    ? `${Math.round(primaryBelief.confidence * 100)}%`
    : "Moderate";

  return (
    <div className="workspace-content">
      <h2 className="workspace-headline">{headline}</h2>

      <p className="workspace-summary">
  Discovery currently treats this as a working understanding. The sections below
  explain why, how confident Discovery is, and what could change the conclusion.
</p>

      <div className="workspace-notebook">
    
        <NotebookRow
          label="Confidence"
          value={confidence}
        />

        <NotebookRow
          label="Status"
          value="Working understanding"
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