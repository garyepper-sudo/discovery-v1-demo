"use client";

import LivingOrganismCanvas from "./LivingOrganismCanvas";

type OrganismViewerProps = {
  open: boolean;
  onClose: () => void;
  evidence?: any[];
  themes?: any[];
  contradictions?: any[];
  causalChains?: any[];
};

export default function OrganismViewer({
  open,
  onClose,
  evidence = [],
  themes = [],
  contradictions = [],
  causalChains = [],
}: OrganismViewerProps) {
  if (!open) return null;

  return (
    <div className="organism-viewer">
      <button className="organism-viewer-close" onClick={onClose}>
        Close
      </button>

      <div className="organism-viewer-shell">
        <div className="organism-viewer-main">
          <p className="overview-label">Trace Understanding</p>
          <h1>Tracing this understanding</h1>
          <p>
            Discovery is exposing the evidence, patterns, tensions, and causal
            paths that shaped this understanding.
          </p>

          <div className="canvas-organism-wrap">
            <LivingOrganismCanvas
              evidenceCount={evidence.length}
              themeCount={themes.length}
              contradictionCount={contradictions.length}
              causalPathCount={causalChains.length}
            />
          </div>
        </div>

        <aside className="organism-reasoning-panel">
          <p className="overview-label">What it is made from</p>

          <ReasoningMetric
            kind="evidence"
            label="Evidence Objects"
            value={evidence.length}
            description="Signals Discovery used to form the current understanding."
          />

          <ReasoningMetric
            kind="theme"
            label="Patterns"
            value={themes.length}
            description="Repeated signals that appear across the evidence."
          />

          <ReasoningMetric
            kind="tension"
            label="Open Tensions"
            value={contradictions.length}
            description="Places where the evidence does not fully agree."
          />

          <ReasoningMetric
            kind="causal"
            label="Causal Paths"
            value={causalChains.length}
            description="Likely cause-and-effect relationships behind the insight."
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