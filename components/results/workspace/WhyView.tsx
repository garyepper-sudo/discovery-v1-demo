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
    <div className="workspace-content">
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