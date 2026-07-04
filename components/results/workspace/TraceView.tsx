type TraceViewProps = {
  onTrace: () => void;
};

export default function TraceView({ onTrace }: TraceViewProps) {
  return (
    <div className="workspace-content">
      <p className="workspace-summary">
        Trace the full reasoning path from source evidence to themes,
        mechanisms, beliefs, and the final executive understanding.
      </p>

      <div className="workspace-notebook">
        <NotebookRow label="Step 1" value="Evidence collected" />
        <NotebookRow label="Step 2" value="Themes identified" />
        <NotebookRow label="Step 3" value="Mechanisms inferred" />
        <NotebookRow label="Step 4" value="Beliefs formed" />
        <NotebookRow label="Step 5" value="Executive understanding produced" />
      </div>

      <button className="briefing-primary-button" onClick={onTrace}>
        Open Full Reasoning Trace →
      </button>
    </div>
  );
}

function NotebookRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="workspace-row">
      <div className="workspace-row-label">{label}</div>
      <div className="workspace-row-divider" />
      <div className="workspace-row-value">{value}</div>
    </div>
  );
}