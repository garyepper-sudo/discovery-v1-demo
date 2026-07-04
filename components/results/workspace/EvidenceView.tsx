type EvidenceViewProps = {
  evidence?: any[];
};

export default function EvidenceView({
  evidence = [],
}: EvidenceViewProps) {
  return (
    <div className="workspace-content">
      <div className="workspace-notebook">
        {evidence.length === 0 ? (
          <NotebookRow
            label="Status"
            value="No evidence has been attached yet."
          />
        ) : (
          evidence.slice(0, 8).map((item: any, index: number) => (
            <NotebookRow
              key={item.id ?? index}
              label={`Evidence ${index + 1}`}
              value={getReadableEvidence(item)}
            />
          ))
        )}
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
      <div className="workspace-row-label">{label}</div>
      <div className="workspace-row-divider" />
      <div className="workspace-row-value">{value}</div>
    </div>
  );
}

function getReadableEvidence(item: any): string {
  if (!item) return "No evidence available.";

  return (
    item.summary ??
    item.claim ??
    item.statement ??
    item.text ??
    item.title ??
    item.headline ??
    "Evidence signal"
  );
}