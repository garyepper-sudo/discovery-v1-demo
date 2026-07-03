type WhyViewProps = {
  primaryBelief?: any;
  evidence?: any[];
  themes?: any[];
};

export default function WhyView({
  primaryBelief,
  evidence = [],
  themes = [],
}: WhyViewProps) {
  const reasons = primaryBelief?.supportingReasons ?? [];

  return (
    <section className="workspace-section">
      <p className="overview-label">Why</p>

      <h3>Why Discovery believes this.</h3>

      <div className="workspace-notebook">
        <NotebookRow
          label="Strongest reason"
          value={
            reasons[0] ??
            themes[0]?.title ??
            themes[0]?.headline ??
            "Discovery found repeated support across the source material."
          }
        />

        <NotebookRow
          label="Reinforcing signal"
          value={
            reasons[1] ??
            evidence[0]?.summary ??
            evidence[0]?.claim ??
            evidence[0]?.text ??
            "Multiple signals appear to point in the same direction."
          }
        />

        <NotebookRow
          label="Pattern"
          value={
            themes[0]?.summary ??
            themes[0]?.description ??
            themes[0]?.title ??
            "The same strategic pattern appears across more than one source."
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