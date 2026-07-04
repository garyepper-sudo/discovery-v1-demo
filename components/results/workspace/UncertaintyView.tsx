type UncertaintyViewProps = {
  primaryBelief?: any;
  contradictions?: any[];
};

export default function UncertaintyView({
  primaryBelief,
  contradictions = [],
}: UncertaintyViewProps) {
  const primaryConcern =
    primaryBelief?.concerns?.[0] ??
    contradictions?.[0]?.title ??
    contradictions?.[0]?.summary ??
    "Discovery has not detected a major unresolved uncertainty yet.";

  return (
    <div className="workspace-content">
      <div className="workspace-notebook">
        <NotebookRow label="Current unknown" value={primaryConcern} />

        <NotebookRow
          label="Why it matters"
          value="This uncertainty could change the interpretation of the current understanding."
        />

        <NotebookRow
          label="Status"
          value={
            contradictions.length > 0
              ? `${contradictions.length} active tension${
                  contradictions.length === 1 ? "" : "s"
                }`
              : "No major tension detected"
          }
        />
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