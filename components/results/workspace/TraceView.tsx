type TraceViewProps = {
  onTrace: () => void;
};

export default function TraceView({
  onTrace,
}: TraceViewProps) {
  return (
    <section className="workspace-section">
      <p className="overview-label">Trace</p>

      <h3>Inspect how Discovery formed this understanding.</h3>

      <p>
        Trace the complete reasoning path from evidence to themes,
        mechanisms, beliefs, and the executive understanding.
      </p>

      <div className="workspace-notebook">
        <NotebookRow
          label="Step 1"
          value="Evidence collected"
        />

        <NotebookRow
          label="Step 2"
          value="Themes identified"
        />

        <NotebookRow
          label="Step 3"
          value="Mechanisms inferred"
        />

        <NotebookRow
          label="Step 4"
          value="Beliefs formed"
        />

        <NotebookRow
          label="Step 5"
          value="Executive understanding produced"
        />
      </div>

      <button
        className="briefing-primary-button"
        onClick={onTrace}
      >
        Open Full Reasoning Trace →
      </button>
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