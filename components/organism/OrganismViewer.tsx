"use client";

import { useMemo, useState } from "react";
import LivingOrganismCanvas from "./LivingOrganismCanvas";

type OrganismViewerProps = {
  open: boolean;
  onClose: () => void;
  organismState?: any;
};

const KIND_LABELS: Record<string, string> = {
  evidence: "Evidence",
  theme: "Theme",
  causal: "Mechanism",
  belief: "Belief",
  contradiction: "Contradiction",
  understanding: "Understanding",
};

export default function OrganismViewer({
  open,
  onClose,
  organismState,
}: OrganismViewerProps) {
  const [selectedParticleId, setSelectedParticleId] = useState<string | null>(
    null
  );

  const particles = organismState?.particles ?? [];

  const selectedParticle = useMemo(() => {
    if (!selectedParticleId) return null;
    return particles.find((particle: any) => particle.id === selectedParticleId);
  }, [particles, selectedParticleId]);

  if (!open) return null;

  const evidenceCount = particles.filter(
    (particle: any) => particle.kind === "evidence"
  ).length;

  const themeCount = particles.filter(
    (particle: any) => particle.kind === "theme"
  ).length;

  const beliefCount = particles.filter(
    (particle: any) => particle.kind === "belief"
  ).length;

  const contradictionCount = particles.filter(
    (particle: any) => particle.kind === "contradiction"
  ).length;

  const mechanismCount = particles.filter(
    (particle: any) => particle.kind === "causal"
  ).length;

  const topPattern = organismState?.emergingPatterns?.[0];

  return (
    <div className="organism-viewer">
      <button className="organism-viewer-close" onClick={onClose}>
        Close
      </button>

      <div className="organism-viewer-shell">
        <div className="organism-viewer-main">
          <p className="overview-label">Living Understanding</p>
          <h1>{topPattern?.title ?? "Explore the organism"}</h1>
          <p>
            Click any particle to inspect what it represents and how it connects
            to the current understanding.
          </p>

          <div className="canvas-organism-wrap">
            <LivingOrganismCanvas
              organismState={organismState}
              selectedParticleId={selectedParticleId}
              onParticleSelected={(particle: any) =>
                setSelectedParticleId(particle?.id ?? null)
              }
            />

            <OrganismLegend />
          </div>

          <div className="organism-status-strip">
            <HealthMetric
              label="Coherence"
              value={Math.round((organismState?.coherence ?? 0) * 100)}
              description="How consistent the evidence is"
            />
            <HealthMetric
              label="Tension"
              value={Math.round((organismState?.tension ?? 0) * 100)}
              description="How much is still conflicting"
            />
            <HealthMetric
              label="Uncertainty"
              value={Math.round((organismState?.uncertainty ?? 0) * 100)}
              description="How much we do not yet know"
            />
            <HealthMetric
              label="Maturity"
              value={Math.round((organismState?.maturity ?? 0) * 100)}
              description="How developed this understanding is"
            />
          </div>
        </div>

        <aside className="organism-reasoning-panel">
          {selectedParticle ? (
            <ParticleInspector particle={selectedParticle} particles={particles} />
          ) : (
            <DefaultInspector
              evidenceCount={evidenceCount}
              themeCount={themeCount}
              mechanismCount={mechanismCount}
              beliefCount={beliefCount}
              contradictionCount={contradictionCount}
              organismState={organismState}
            />
          )}
        </aside>
      </div>
    </div>
  );
}

function DefaultInspector({
  evidenceCount,
  themeCount,
  mechanismCount,
  beliefCount,
  contradictionCount,
  organismState,
}: {
  evidenceCount: number;
  themeCount: number;
  mechanismCount: number;
  beliefCount: number;
  contradictionCount: number;
  organismState?: any;
}) {
  const topBelief = organismState?.particles?.find(
    (particle: any) => particle.kind === "belief"
  );

  const topTheme = organismState?.particles?.find(
    (particle: any) => particle.kind === "theme"
  );

  const topContradiction = organismState?.particles?.find(
    (particle: any) => particle.kind === "contradiction"
  );

  return (
    <>
      <p className="overview-label">Organism State</p>
      <h2>{organismState?.headline ?? "Current understanding anatomy"}</h2>

      <div className="particle-inspector-grid">
        <div>
          <span>Coherence</span>
          <strong>{Math.round((organismState?.coherence ?? 0) * 100)}%</strong>
        </div>

        <div>
          <span>Tension</span>
          <strong>{Math.round((organismState?.tension ?? 0) * 100)}%</strong>
        </div>

        <div>
          <span>Uncertainty</span>
          <strong>{Math.round((organismState?.uncertainty ?? 0) * 100)}%</strong>
        </div>
      </div>

      <ExecutiveInsight
        label="Strongest belief"
        value={topBelief?.label ?? `${beliefCount} beliefs detected`}
      />

      <ExecutiveInsight
        label="Primary theme"
        value={topTheme?.label ?? `${themeCount} themes detected`}
      />

      <ExecutiveInsight
        label="Largest tension"
        value={
          topContradiction?.label ??
          (contradictionCount > 0
            ? `${contradictionCount} open tensions`
            : "No major contradiction detected")
        }
      />

      <ReasoningMetric
        kind="evidence"
        label="Evidence base"
        value={evidenceCount}
        description="Signals Discovery used to form the current understanding."
      />

      <ReasoningMetric
        kind="causal"
        label="Mechanisms"
        value={mechanismCount}
        description="Connective tissue explaining how themes become beliefs."
      />
    </>
  );
}

function ExecutiveInsight({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <section className="particle-connection-list">
      <p className="overview-label">{label}</p>
      <span>{value}</span>
    </section>
  );
}

function ParticleInspector({
  particle,
  particles,
}: {
  particle: any;
  particles: any[];
}) {
  const confidence = Math.round((particle.confidence ?? 0) * 100);
  const strength = Math.round((particle.strength ?? 0) * 100);
  const connections = particle.connections ?? [];

  const connectedParticles = connections
    .map((connectionId: string) =>
      particles.find((candidate: any) => candidate.id === connectionId)
    )
    .filter(Boolean);

  const supportedBy = connectedParticles.filter(
    (candidate: any) => candidate.kind === "evidence"
  );
  const challenges = connectedParticles.filter(
    (candidate: any) => candidate.kind === "contradiction"
  );
  const themes = connectedParticles.filter(
    (candidate: any) => candidate.kind === "theme"
  );
  const mechanisms = connectedParticles.filter(
    (candidate: any) => candidate.kind === "causal"
  );

  return (
    <div className="particle-inspector">
      <p className="overview-label">
        {KIND_LABELS[particle.kind] ?? particle.kind}
      </p>
      <h2>{particle.label ?? "Selected particle"}</h2>

      <div className="particle-inspector-grid">
        <div>
          <span>Confidence</span>
          <strong>{confidence}%</strong>
        </div>

        <div>
          <span>Strength</span>
          <strong>{strength}%</strong>
        </div>

        <div>
          <span>Connections</span>
          <strong>{connections.length}</strong>
        </div>
      </div>

      <InspectorSection
        title="Supported by"
        items={supportedBy}
        fallback="No supporting evidence connected yet."
      />

      <InspectorSection
        title="Challenges"
        items={challenges}
        fallback="No direct contradictions connected yet."
      />

      <InspectorSection
        title="Connected theme"
        items={themes}
        fallback="No theme connection detected yet."
      />

      <InspectorSection
        title="Mechanism"
        items={mechanisms}
        fallback="No mechanism connection detected yet."
      />

      {connectedParticles.length === 0 && (
        <section className="particle-connection-list">
          <p className="overview-label">Connected to</p>
          <small>No direct connections detected yet.</small>
        </section>
      )}
    </div>
  );
}

function InspectorSection({
  title,
  items,
  fallback,
}: {
  title: string;
  items: any[];
  fallback: string;
}) {
  return (
    <section className="particle-connection-list">
      <p className="overview-label">{title}</p>

      {items.length > 0 ? (
        items.slice(0, 5).map((item: any) => (
          <span key={item.id}>{item.label ?? item.id}</span>
        ))
      ) : (
        <small>{fallback}</small>
      )}
    </section>
  );
}

function OrganismLegend() {
  return (
    <div className="organism-legend">
      <LegendItem kind="evidence" label="Evidence" />
      <LegendItem kind="theme" label="Theme" />
      <LegendItem kind="causal" label="Mechanism" />
      <LegendItem kind="belief" label="Belief" />
      <LegendItem kind="tension" label="Contradiction" />
      <LegendItem kind="understanding" label="Understanding" />
    </div>
  );
}

function LegendItem({ kind, label }: { kind: string; label: string }) {
  return (
    <span className="organism-legend-item">
      <span className={`metric-dot metric-dot-${kind}`} />
      {label}
    </span>
  );
}

function HealthMetric({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  return (
    <div className="organism-status-metric">
      <strong>{value}%</strong>
      <span>{label}</span>
      <small>{description}</small>
    </div>
  );
}

function ReasoningMetric({
  kind,
  label,
  value,
  description,
}: {
  kind: "evidence" | "theme" | "tension" | "causal" | "belief";
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