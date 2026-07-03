type EvidenceViewProps = {
  evidence?: any[];
};

export default function EvidenceView({
  evidence = [],
}: EvidenceViewProps) {
  return (
    <section className="workspace-section">
      <p className="overview-label">Evidence</p>

      <h3>The strongest supporting evidence.</h3>

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