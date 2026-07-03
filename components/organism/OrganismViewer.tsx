"use client";

import LivingOrganismCanvas from "./LivingOrganismCanvas";

type OrganismViewerProps = {
  open: boolean;
  onClose: () => void;
  organismState?: any;
};

export default function OrganismViewer({
  open,
  onClose,
  organismState,
}: OrganismViewerProps) {
  if (!open) return null;

  const evidenceCount = organismState?.particles?.filter(
    (particle: any) => particle.kind === "evidence"
  ).length ?? 0;

  const themeCount = organismState?.particles?.filter(
    (particle: any) => particle.kind === "theme"
  ).length ?? 0;

  const contradictionCount = organismState?.contradictions?.length ?? 0;
  const mechanismCount = organismState?.mechanisms?.length ?? 0;
  const hypothesisCount = organismState?.hypotheses?.length ?? 0;
  const topPattern = organismState?.emergingPatterns?.[0];

  return (
    <div className="organism-viewer">
      <button className="organism-viewer-close" onClick={onClose}>
        Close
      </button>

      <div className="organism-viewer-shell">
        <div className="organism-viewer-main">
          <p className="overview-label">Trace Understanding</p>
          <h1>{topPattern?.title ?? "Tracing this understanding"}</h1>
          <p>
            Discovery is rendering the organism from its internal reasoning
            state: evidence, mechanisms, hypotheses, beliefs, contradictions,
            uncertainty, and emerging patterns.
          </p>

          <div className="canvas-organism-wrap">
            <LivingOrganismCanvas
              evidenceCount={evidenceCount}
              themeCount={themeCount}
              contradictionCount={contradictionCount}
              causalPathCount={mechanismCount}
            />
          </div>
        </div>

        <aside className="organism-reasoning-panel">
          <p className="overview-label">What it is made from</p>

          <ReasoningMetric
            kind="evidence"
            label="Evidence Particles"
            value={evidenceCount}
            description="Signals Discovery used to form the current understanding."
          />

          <ReasoningMetric
            kind="theme"
            label="Evidence Clusters"
            value={organismState?.evidenceClusters?.length ?? 0}
            description="Grouped evidence regions forming stable areas of meaning."
          />

          <ReasoningMetric
            kind="causal"
            label="Mechanisms"
            value={mechanismCount}
            description="Connective tissue explaining why pieces of evidence belong together."
          />

          <ReasoningMetric
            kind="theme"
            label="Hypotheses"
            value={hypothesisCount}
            description="Possible explanations Discovery is comparing."
          />

          <ReasoningMetric
            kind="tension"
            label="Open Tensions"
            value={contradictionCount}
            description="Places where the evidence does not fully agree."
          />
        </aside>
      </div>
    </div>
  );
}

function ReasoningMetric({
  kind,
  label,
  value,
  description,
}: {
  kind: "evidence" | "theme" | "tension" | "causal";
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="reasoning-metric">
      <div className="reasoning-metric-header">
        <span className={`metric-dot metric-dot-${kind}`} />
        <strong>{value}</strong>
        <span>{label}</span>
      </div>

      <p>{description}</p>
    </div>
  );
}