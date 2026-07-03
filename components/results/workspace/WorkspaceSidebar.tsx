type WorkspaceSidebarProps = {
  organismState?: any;
  primaryBelief?: any;
  activeLabel: string;
};

export default function WorkspaceSidebar({
  organismState,
  primaryBelief,
  activeLabel,
}: WorkspaceSidebarProps) {
  const particleCount = organismState?.particles?.length ?? 0;
  const tensionCount = organismState?.contradictions?.length ?? 0;
  const questionCount = organismState?.hypotheses?.length ?? 0;

  return (
    <aside className="workspace-organism-compass">
      <p className="overview-label">Current State</p>

      <h3>{getStateLabel(organismState)}</h3>

      <div className="workspace-organism-orb">
        <div className="briefing-organism-core" />
      </div>

      <div className="workspace-state-list">
        <StateRow label="Inspecting" value={activeLabel} />
        <StateRow label="Particles" value={String(particleCount)} />
        <StateRow label="Tensions" value={String(tensionCount)} />
        <StateRow label="Questions" value={String(questionCount)} />
      </div>

      <p>
        {primaryBelief?.headline ??
          organismState?.emergingPatterns?.[0]?.title ??
          "Understanding is still evolving."}
      </p>
    </aside>
  );
}

function StateRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="workspace-state-row">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function getStateLabel(organismState?: any) {
  const maturity = organismState?.maturity ?? 0;
  const tension = organismState?.tension ?? 0;

  if (maturity > 0.75 && tension < 0.25) return "Stable Pattern";
  if (tension > 0.45) return "Active Tension";
  if (maturity > 0.45) return "Forming Pattern";

  return "Early Signal";
}