import type { CSSProperties } from "react";

type UnderstandingOrganismProps = {
  organizationalCoherence?: number;
};

function normalizeCoherence(value: number): number {
  const normalizedValue = value <= 1 ? value * 100 : value;

  return Math.min(100, Math.max(0, normalizedValue));
}

export default function UnderstandingOrganism({
  organizationalCoherence = 42,
}: UnderstandingOrganismProps) {
  const coherence = normalizeCoherence(organizationalCoherence);
  const coherenceRatio = coherence / 100;
  const diffusionRatio = 1 - coherenceRatio;

  const organismStyle = {
    "--organism-coherence": coherenceRatio,
    "--organism-diffusion": diffusionRatio,
  } as CSSProperties;

  return (
    <div
      className="executive-v2-organism executive-v2-organism-network"
      style={organismStyle}
      data-coherence={Math.round(coherence)}
      aria-hidden="true"
    >
      {/* Breadth of Discovery's organizational understanding */}
      <div className="executive-v2-understanding-field">
        <span className="executive-v2-field executive-v2-field-a" />
        <span className="executive-v2-field executive-v2-field-b" />
      </div>

      {/* Overall coherence of the organizational model */}
      <div className="executive-v2-understanding-membrane" />

      {/* Relationships between organizational understanding regions */}
      <div className="executive-v2-understanding-topology">
        <span className="executive-v2-network-path executive-v2-network-path-a" />
        <span className="executive-v2-network-path executive-v2-network-path-b" />
        <span className="executive-v2-network-path executive-v2-network-path-c" />
        <span className="executive-v2-network-path executive-v2-network-path-d" />
        <span className="executive-v2-network-path executive-v2-network-path-e" />
        <span className="executive-v2-network-path executive-v2-network-path-f" />
      </div>

      {/* Stable concentrations of accumulated understanding */}
      <div className="executive-v2-understanding-structure">
        <span className="executive-v2-network-node executive-v2-network-node-a" />
        <span className="executive-v2-network-node executive-v2-network-node-b" />
        <span className="executive-v2-network-node executive-v2-network-node-c" />
        <span className="executive-v2-network-node executive-v2-network-node-d" />
        <span className="executive-v2-network-node executive-v2-network-node-e" />
        <span className="executive-v2-network-node executive-v2-network-node-f" />
      </div>

      {/* Center of Discovery's current organizational model */}
      <div className="executive-v2-understanding-core">
        <span className="executive-v2-network-node executive-v2-network-node-core" />
      </div>
    </div>
  );
}