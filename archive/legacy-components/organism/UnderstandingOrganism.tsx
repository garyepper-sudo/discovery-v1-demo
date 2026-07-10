"use client";

import { useMemo, useState } from "react";

type NodeType = "belief" | "theme" | "evidence" | "causal" | "contradiction";

type Node = {
  id: string;
  label: string;
  type: NodeType;
  confidence: number;
  x: number;
  y: number;
};

type Edge = {
  id: string;
  from: string;
  to: string;
  type: "supports" | "causes" | "contradicts";
  strength: number;
};

export function UnderstandingOrganism({
  beliefs = [],
  themes = [],
  causalChains = [],
  contradictions = [],
  evidence = [],
}: {
  beliefs?: any[];
  themes?: any[];
  causalChains?: any[];
  contradictions?: any[];
  evidence?: any[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const primaryBelief = beliefs[0];
  const confidence = Math.round((primaryBelief?.confidence ?? 0) * 100);

  const nodes = useMemo(
    () => buildNodes(primaryBelief, themes, causalChains, contradictions, evidence),
    [primaryBelief, themes, causalChains, contradictions, evidence]
  );

  const edges = useMemo(() => buildEdges(nodes), [nodes]);

  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const selectedNode = selectedId ? nodeMap.get(selectedId) : null;

  return (
    <section className="understanding-organism-card organism-v3">
      <div className="panel-header">
        <p className="eyebrow">Understanding organism</p>
        <span>{confidence}% stable</span>
      </div>

      <div className="organism-stage-v3">
        <svg viewBox="0 0 620 460" className="organism-svg-v3">
          {edges.map((edge, index) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);
            if (!from || !to) return null;

            const muted =
              selectedId && edge.from !== selectedId && edge.to !== selectedId;

            return (
              <line
                key={edge.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                className={`org-edge ${edge.type} ${muted ? "muted" : ""}`}
                strokeWidth={1.5 + edge.strength * 4}
                style={{ animationDelay: `${index * 90}ms` }}
              />
            );
          })}

          {nodes.map((node, index) => {
            const selected = selectedId === node.id;
            const muted = selectedId && !selected;

            return (
              <g
                key={node.id}
                className={`org-node-group ${node.type} ${
                  selected ? "selected" : ""
                } ${muted ? "muted" : ""}`}
                style={{ animationDelay: `${index * 110}ms` }}
                onClick={() => setSelectedId(selected ? null : node.id)}
              >
                {node.type === "belief" && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={86}
                    className="org-belief-field"
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radiusFor(node)}
                  className={`org-node ${node.type}`}
                />

                <text
                  x={node.x}
                  y={node.y + radiusFor(node) + 24}
                  textAnchor="middle"
                  className="org-label"
                >
                  {short(node.label)}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="organism-core-copy">
          <strong>{confidence}%</strong>
          <span>belief stability</span>
        </div>
      </div>

      <div className="organism-metrics">
        <Metric label="Evidence" value={evidence.length} />
        <Metric label="Patterns" value={themes.length} />
        <Metric label="Relationships" value={causalChains.length} />
        <Metric label="Tensions" value={contradictions.length} />
      </div>

      {selectedNode && (
  <div className="organism-inspector">
    <button
      className="organism-inspector-close"
      type="button"
      onClick={() => setSelectedId(null)}
    >
      ×
    </button>

    <span>{selectedNode.type}</span>
    <h3>{selectedNode.label}</h3>
    <p>{Math.round(selectedNode.confidence * 100)}% confidence</p>
  </div>
)}
    </section>
  );
}

function buildNodes(
  belief: any,
  themes: any[],
  causalChains: any[],
  contradictions: any[],
  evidence: any[]
): Node[] {
  const nodes: Node[] = [
    {
      id: "belief",
      label: belief?.headline ?? "Current belief",
      type: "belief",
      confidence: belief?.confidence ?? 0.5,
      x: 310,
      y: 230,
    },
  ];

  themes.slice(0, 4).forEach((theme, index) => {
    const positions = [
      { x: 160, y: 130 },
      { x: 460, y: 130 },
      { x: 160, y: 330 },
      { x: 460, y: 330 },
    ];

    nodes.push({
      id: `theme-${index}`,
      label: theme.title ?? "Pattern",
      type: "theme",
      confidence: theme.confidence ?? 0.7,
      ...positions[index],
    });
  });

  causalChains.slice(0, 4).forEach((chain, index) => {
    const positions = [
      { x: 310, y: 80 },
      { x: 540, y: 230 },
      { x: 310, y: 390 },
      { x: 80, y: 230 },
    ];

    nodes.push({
      id: `causal-${index}`,
      label: chain.cause ?? "Relationship",
      type: "causal",
      confidence: chain.confidence ?? 0.6,
      ...positions[index],
    });
  });

  evidence.slice(0, 6).forEach((item, index) => {
    const positions = [
      { x: 95, y: 80 },
      { x: 525, y: 80 },
      { x: 555, y: 355 },
      { x: 65, y: 355 },
      { x: 220, y: 420 },
      { x: 400, y: 420 },
    ];

    nodes.push({
      id: `evidence-${index}`,
      label: item.text ?? "Evidence",
      type: "evidence",
      confidence: item.confidence ?? 0.5,
      ...positions[index],
    });
  });

  if (contradictions.length > 0) {
    nodes.push({
      id: "contradiction",
      label: contradictions[0]?.title ?? "Contradiction",
      type: "contradiction",
      confidence: contradictions[0]?.confidence ?? 0.75,
      x: 310,
      y: 28,
    });
  }

  return nodes;
}

function buildEdges(nodes: Node[]): Edge[] {
  return nodes
    .filter((node) => node.id !== "belief")
    .map((node, index) => ({
      id: `edge-${index}`,
      from: "belief",
      to: node.id,
      type:
        node.type === "contradiction"
          ? "contradicts"
          : node.type === "causal"
            ? "causes"
            : "supports",
      strength: node.confidence,
    }));
}

function radiusFor(node: Node): number {
  if (node.type === "belief") return 62;
  if (node.type === "theme") return 24;
  if (node.type === "causal") return 18;
  if (node.type === "contradiction") return 22;
  return 13;
}

function short(label: string): string {
  if (!label) return "";
  return label.length > 26 ? `${label.slice(0, 24)}…` : label;
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}