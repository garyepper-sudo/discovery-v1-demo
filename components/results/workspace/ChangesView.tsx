type ChangesViewProps = {
  primaryBelief?: any;
  hypotheses?: any[];
};

export default function ChangesView({
  primaryBelief,
  hypotheses = [],
}: ChangesViewProps) {
  const nextQuestions = primaryBelief?.nextQuestions ?? [];
  const possibleChangers = [
    ...nextQuestions,
    ...hypotheses.map(
      (item: any) => item.title ?? item.headline ?? item.summary
    ),
  ].filter(Boolean);

  return (
    <div className="workspace-content">
      <div className="workspace-notebook">
        {possibleChangers.slice(0, 5).map((item: string, index: number) => (
          <NotebookRow
            key={index}
            label={`Condition ${index + 1}`}
            value={item}
          />
        ))}

        {possibleChangers.length === 0 && (
          <NotebookRow
            label="Condition"
            value="Discovery needs more evidence before it can identify what would change this understanding."
          />
        )}
      </div>
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