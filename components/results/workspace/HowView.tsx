type HowViewProps = {
  causalChains?: any[];
  organismState?: any;
};

export default function HowView({
  causalChains = [],
  organismState,
}: HowViewProps) {
  const mechanisms = organismState?.mechanisms ?? causalChains;
  const primaryMechanism = mechanisms[0];

  return (
    <section className="workspace-section">
      <p className="overview-label">How</p>

      <h3>How the pattern appears to work.</h3>

      <div className="causal-flow">
        <FlowStep
          label="Cause"
          value={primaryMechanism?.cause ?? "A source signal appears."}
        />

        <FlowArrow />

        <FlowStep
          label="Mechanism"
          value={
            primaryMechanism?.mechanism ??
            primaryMechanism?.summary ??
            "Discovery connects the signal to a broader pattern."
          }
        />

        <FlowArrow />

        <FlowStep
          label="Effect"
          value={primaryMechanism?.effect ?? "A working belief forms."}
        />
      </div>

      {mechanisms.length > 1 && (
        <div className="workspace-notebook">
          {mechanisms.slice(1, 4).map((mechanism: any, index: number) => (
            <NotebookRow
              key={mechanism.id ?? index}
              label={`Mechanism ${index + 2}`}
              value={getReadableMechanism(mechanism)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function FlowStep({ label, value }: { label: string; value: string }) {
  return (
    <div className="flow-step">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function FlowArrow() {
  return <div className="flow-arrow">↓</div>;
}

function NotebookRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="notebook-row">
      <span>{label}</span>
      <p>{value}</p>
    </div>
  );
}

function getReadableMechanism(item: any): string {
  if (!item) return "No detail available.";
  if (item.cause && item.effect) return `${item.cause} → ${item.effect}`;

  return (
    item.mechanism ??
    item.summary ??
    item.title ??
    item.explanation ??
    item.claim ??
    "Discovery identified an explanatory mechanism."
  );
}