"use client";

import { useMemo, useState } from "react";

type ReasoningNodeType =
  | "evidence"
  | "signal"
  | "theme"
  | "contradiction"
  | "causal"
  | "explanation"
  | "understanding"
  | "belief"
  | "executive";

type ReasoningEdgeType =
  | "supports"
  | "explains"
  | "complicates"
  | "contradicts"
  | "causes"
  | "summarizes"
  | "forms";

type ReasoningNode = {
  id: string;
  type: ReasoningNodeType;
  label: string;
  description?: string;
  confidence?: number;
  sourceId: string;
};

type ReasoningEdge = {
  id: string;
  from: string;
  to: string;
  type: ReasoningEdgeType;
  weight: number;
  primary?: boolean;
  explanation?: string;
};

type ReasoningGraphData = {
  nodes: ReasoningNode[];
  edges: ReasoningEdge[];
  executiveNodeId?: string;
};

type PositionedNode = ReasoningNode & {
  x: number;
  y: number;
};

type ReasoningGraphProps = {
  graph?: ReasoningGraphData;
};

const layerOrder: ReasoningNodeType[] = [
  "evidence",
  "signal",
  "theme",
  "contradiction",
  "causal",
  "explanation",
  "understanding",
  "belief",
  "executive",
];

const layerY: Record<ReasoningNodeType, number> = {
  executive: 9,
  belief: 22,
  understanding: 35,
  explanation: 48,
  causal: 58,
  contradiction: 67,
  theme: 61,
  signal: 76,
  evidence: 89,
};

function nodeSize(type: ReasoningNodeType) {
  if (type === "executive") return 76;
  if (type === "belief") return 54;
  if (type === "understanding") return 48;
  if (type === "explanation") return 42;
  if (type === "theme") return 38;
  if (type === "contradiction") return 38;
  if (type === "causal") return 34;
  if (type === "signal") return 28;
  return 22;
}

function nodeDelay(type: ReasoningNodeType, index: number) {
  const order = layerOrder.indexOf(type);
  return order * 180 + index * 50;
}

export default function ReasoningGraph({ graph }: ReasoningGraphProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    graph?.executiveNodeId ?? graph?.nodes?.[0]?.id ?? null
  );

  const nodes = useMemo<PositionedNode[]>(() => {
    if (!graph?.nodes?.length) return [];

    return graph.nodes.map((node) => {
      const siblings = graph.nodes.filter((item) => item.type === node.type);
      const index = siblings.findIndex((item) => item.id === node.id);
      const count = siblings.length;

      const spread = Math.min(78, Math.max(18, count * 9));
      const x =
        count === 1 ? 50 : 50 - spread / 2 + (spread / (count - 1)) * index;

      const organicOffset =
        index % 3 === 0 ? -3 : index % 3 === 1 ? 3 : 0;

      return {
        ...node,
        x,
        y: layerY[node.type] + organicOffset,
      };
    });
  }, [graph]);

  const nodeMap = useMemo(() => {
    return new Map(nodes.map((node) => [node.id, node]));
  }, [nodes]);

  const visibleEdges = useMemo(() => {
    return (graph?.edges ?? [])
      .filter((edge) => nodeMap.has(edge.from) && nodeMap.has(edge.to))
      .sort((a, b) => Number(b.primary) - Number(a.primary) || b.weight - a.weight)
      .slice(0, 42);
  }, [graph, nodeMap]);

  const selectedNode = nodes.find((node) => node.id === selectedId) ?? nodes[0];

  if (!graph?.nodes?.length) {
    return (
      <div className="reasoning-empty">
        Discovery has not formed a reasoning graph yet.
      </div>
    );
  }

  return (
    <div className="reasoning-shell">
      <div className="reasoning-canvas">
        <svg className="reasoning-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="reasoningGlow">
              <feGaussianBlur stdDeviation="1.7" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {visibleEdges.map((edge, index) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);
            if (!from || !to) return null;

            const midY = (from.y + to.y) / 2;
            const path = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;

            return (
              <path
                key={edge.id}
                d={path}
                className={`reasoning-edge reasoning-edge-${edge.type} ${
                  edge.primary ? "is-primary" : ""
                }`}
                style={{
                  opacity: 0.18 + edge.weight * 0.42,
                  animationDelay: `${index * 55}ms`,
                }}
              />
            );
          })}
        </svg>

        {nodes.map((node, index) => {
          const size = nodeSize(node.type);

          return (
            <button
              key={node.id}
              className={`reasoning-node reasoning-node-${node.type} ${
                selectedNode?.id === node.id ? "is-selected" : ""
              }`}
              style={{
                left: `${node.x}%`,
                top: `${node.y}%`,
                animationDelay: `${nodeDelay(node.type, index)}ms`,
              }}
              onClick={() => setSelectedId(node.id)}
            >
              <span
                className="reasoning-node-core"
                style={{
                  width: size,
                  height: size,
                }}
              />
              <span className="reasoning-node-label">{node.label}</span>
            </button>
          );
        })}
      </div>

      <aside className="reasoning-inspector">
        <div className="reasoning-kicker">{selectedNode?.type}</div>
        <h3>{selectedNode?.label}</h3>

        <div className="reasoning-confidence">
          <span>Confidence</span>
          <strong>
            {typeof selectedNode?.confidence === "number"
              ? `${Math.round(selectedNode.confidence * 100)}%`
              : "Developing"}
          </strong>
        </div>

        <p>{selectedNode?.description || "This node is part of the reasoning graph."}</p>

        <div className="reasoning-meta">
          <span>Incoming</span>
          <strong>
            {visibleEdges.filter((edge) => edge.to === selectedNode?.id).length}
          </strong>
        </div>

        <div className="reasoning-meta">
          <span>Outgoing</span>
          <strong>
            {visibleEdges.filter((edge) => edge.from === selectedNode?.id).length}
          </strong>
        </div>
      </aside>

      <style jsx>{`
        .reasoning-shell {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 28px;
          width: 100%;
          min-height: 680px;
          padding: 28px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          background:
            radial-gradient(circle at 50% 20%, rgba(212, 176, 92, 0.12), transparent 34%),
            radial-gradient(circle at 20% 80%, rgba(106, 122, 255, 0.1), transparent 30%),
            linear-gradient(180deg, #101116, #07080b);
          box-shadow: 0 30px 90px rgba(0, 0, 0, 0.42);
        }

        .reasoning-canvas {
          position: relative;
          min-height: 620px;
          overflow: hidden;
          border-radius: 28px;
          background:
            radial-gradient(circle at center, rgba(255, 255, 255, 0.045), transparent 36%),
            rgba(255, 255, 255, 0.025);
        }

        .reasoning-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .reasoning-edge {
          fill: none;
          stroke-width: 0.22;
          filter: url(#reasoningGlow);
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawReasoning 1.2s ease forwards;
        }

        .reasoning-edge-supports,
        .reasoning-edge-forms,
        .reasoning-edge-summarizes,
        .reasoning-edge-explains {
          stroke: rgba(214, 184, 112, 0.52);
        }

        .reasoning-edge-complicates,
        .reasoning-edge-contradicts {
          stroke: rgba(255, 142, 104, 0.42);
        }

        .reasoning-edge-causes {
          stroke: rgba(166, 188, 255, 0.42);
        }

        .reasoning-edge.is-primary {
          stroke-width: 0.34;
        }

        .reasoning-node {
          position: absolute;
          transform: translate(-50%, -50%) scale(0.8);
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.86);
          cursor: pointer;
          opacity: 0;
          animation: nodeArrive 850ms ease forwards;
        }

        .reasoning-node-core {
          display: block;
          margin: 0 auto 8px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), transparent 10%),
            radial-gradient(circle, rgba(224, 190, 111, 0.96), rgba(121, 91, 37, 0.42) 58%, rgba(255, 255, 255, 0.04));
          box-shadow:
            0 0 22px rgba(224, 190, 111, 0.34),
            inset 0 0 18px rgba(255, 255, 255, 0.16);
          animation: breathe 3.8s ease-in-out infinite;
        }

        .reasoning-node-contradiction .reasoning-node-core {
          background:
            radial-gradient(circle, rgba(255, 210, 140, 0.85), rgba(142, 74, 47, 0.52) 58%, rgba(255, 255, 255, 0.04));
        }

        .reasoning-node-causal .reasoning-node-core {
          background:
            radial-gradient(circle, rgba(202, 215, 255, 0.9), rgba(91, 105, 169, 0.42) 58%, rgba(255, 255, 255, 0.04));
        }

        .reasoning-node-label {
          display: block;
          max-width: 128px;
          font-size: 10.5px;
          line-height: 1.2;
          text-align: center;
          color: rgba(255, 255, 255, 0.56);
        }

        .reasoning-node.is-selected .reasoning-node-core {
          box-shadow:
            0 0 0 1px rgba(255, 225, 166, 0.82),
            0 0 34px rgba(224, 190, 111, 0.58),
            inset 0 0 20px rgba(255, 255, 255, 0.2);
        }

        .reasoning-inspector {
          padding: 26px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
        }

        .reasoning-kicker {
          margin-bottom: 12px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: rgba(224, 190, 111, 0.86);
        }

        .reasoning-inspector h3 {
          margin: 0 0 22px;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 500;
        }

        .reasoning-inspector p {
          margin: 22px 0;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.62);
        }

        .reasoning-confidence,
        .reasoning-meta {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 14px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 13px;
        }

        .reasoning-confidence span,
        .reasoning-meta span {
          color: rgba(255, 255, 255, 0.48);
        }

        .reasoning-confidence strong,
        .reasoning-meta strong {
          color: rgba(255, 255, 255, 0.88);
          font-weight: 500;
          text-transform: capitalize;
        }

        .reasoning-empty {
          padding: 32px;
          border-radius: 28px;
          color: rgba(255, 255, 255, 0.68);
          background: rgba(255, 255, 255, 0.04);
        }

        @keyframes drawReasoning {
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes nodeArrive {
          to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }

        @keyframes breathe {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
        }

        @media (max-width: 900px) {
          .reasoning-shell {
            grid-template-columns: 1fr;
          }

          .reasoning-inspector {
            min-height: 260px;
          }
        }
      `}</style>
    </div>
  );
}