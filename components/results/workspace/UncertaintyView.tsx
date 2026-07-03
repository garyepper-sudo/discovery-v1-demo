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
    <section className="workspace-section">
      <p className="overview-label">Uncertainty</p>

      <h3>What Discovery does not know yet.</h3>

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
    </section>
  );
}

function NotebookRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="notebook-row">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}