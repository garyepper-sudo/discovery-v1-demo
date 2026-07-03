"use client";

import { useMemo, useState } from "react";

type UnderstandingGraphProps = {
  executiveUnderstanding?: any;
  beliefs?: any[];
  themes?: any[];
  contradictions?: any[];
  evidence?: any[];
};

type TraceNodeType =
  | "executive"
  | "belief"
  | "theme"
  | "contradiction"
  | "evidence";

type TraceNode = {
  id: string;
  label: string;
  type: TraceNodeType;
  x: number;
  y: number;
  confidence?: number;
  raw?: any;
};

type TraceEdge = {
  from: string;
  to: string;
  type: "supports" | "complicates";
};

function getNodeDelay(type: TraceNodeType, index: number) {
  const baseDelayByType: Record<TraceNodeType, number> = {
    evidence: 100,
    contradiction: 700,
    theme: 1200,
    belief: 1700,
    executive: 2300,
  };

  return baseDelayByType[type] + index * 70;
}

function getLabel(item: any, fallback: string) {
  return (
    item?.headline ||
    item?.title ||
    item?.name ||
    item?.claim ||
    item?.summary ||
    item?.text ||
    fallback
  );
}

export default function UnderstandingGraph({
  executiveUnderstanding,
  beliefs = [],
  themes = [],
  contradictions = [],
  evidence = [],
}: UnderstandingGraphProps) {
  const { nodes, edges } = useMemo(() => {
    const centerX = 50;

    const executiveNode: TraceNode = {
      id: "executive",
      label:
        executiveUnderstanding?.headline ||
        executiveUnderstanding?.title ||
        executiveUnderstanding?.summary ||
        "Executive Understanding",
      type: "executive",
      x: centerX,
      y: 9,
      confidence: executiveUnderstanding?.confidence,
      raw: executiveUnderstanding,
    };

    const makeRow = (
      items: any[],
      type: TraceNodeType,
      y: number,
      fallback: string,
      spreadMultiplier = 13
    ): TraceNode[] => {
      const count = Math.max(items.length, 1);
      const spread = Math.min(76, count * spreadMultiplier);

      return (items.length ? items : []).map((item, index) => {
        const x =
          count === 1
            ? centerX
            : centerX - spread / 2 + (spread / (count - 1)) * index;

        const organicOffset =
          type === "theme"
            ? index % 2 === 0
              ? -4
              : 4
            : type === "evidence"
              ? index % 3 === 0
                ? -3
                : index % 3 === 1
                  ? 4
                  : 0
              : 0;

        return {
          id: item?.id || `${type}-${index}`,
          label: getLabel(item, fallback),
          type,
          x,
          y: y + organicOffset,
          confidence: item?.confidence,
          raw: item,
        };
      });
    };

    const beliefNodes = makeRow(beliefs, "belief", 29, "Belief", 15);
    const themeNodes = makeRow(themes, "theme", 52, "Theme", 12);
    const contradictionNodes = makeRow(
      contradictions,
      "contradiction",
      69,
      "Contradiction",
      18
    );
    const evidenceNodes = makeRow(evidence, "evidence", 88, "Evidence", 8);

    const allNodes = [
      executiveNode,
      ...beliefNodes,
      ...themeNodes,
      ...contradictionNodes,
      ...evidenceNodes,
    ];

    const nodeIds = new Set(allNodes.map((node) => node.id));
    const traceEdges: TraceEdge[] = [];

    themes.forEach((theme) => {
      (theme.evidenceIds ?? []).forEach((evidenceId: string) => {
        if (nodeIds.has(evidenceId) && nodeIds.has(theme.id)) {
          traceEdges.push({
            from: evidenceId,
            to: theme.id,
            type: "supports",
          });
        }
      });
    });

    beliefs.forEach((belief) => {
      (belief.themeIds ?? []).forEach((themeId: string) => {
        if (nodeIds.has(themeId) && nodeIds.has(belief.id)) {
          traceEdges.push({
            from: themeId,
            to: belief.id,
            type: "supports",
          });
        }
      });

      if (!(belief.themeIds ?? []).length) {
        (belief.supportingEvidenceIds ?? []).slice(0, 2).forEach((evidenceId: string) => {
          if (nodeIds.has(evidenceId) && nodeIds.has(belief.id)) {
            traceEdges.push({
              from: evidenceId,
              to: belief.id,
              type: "supports",
            });
          }
        });
      }

      traceEdges.push({
        from: belief.id,
        to: "executive",
        type: "supports",
      });
    });

    contradictions.forEach((contradiction) => {
      const contradictionId = contradiction?.id;
      const relatedEvidence =
        contradiction?.evidenceIds ||
        contradiction?.evidenceIdsInTension ||
        contradiction?.supportingEvidenceIds ||
        [];

      relatedEvidence.slice(0, 3).forEach((evidenceId: string) => {
        if (nodeIds.has(evidenceId) && nodeIds.has(contradictionId)) {
          traceEdges.push({
            from: evidenceId,
            to: contradictionId,
            type: "complicates",
          });
        }
      });
    });

    return {
      nodes: allNodes,
      edges: traceEdges,
    };
  }, [executiveUnderstanding, beliefs, themes, contradictions, evidence]);

  const [selectedNode, setSelectedNode] = useState<TraceNode | null>(
    nodes[0] ?? null
  );

  const nodeMap = useMemo(() => {
    return new Map(nodes.map((node) => [node.id, node]));
  }, [nodes]);

  return (
    <div className="trace-v2-shell">
      <div className="trace-v2-canvas">
        <svg className="trace-v2-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <filter id="traceGlow">
              <feGaussianBlur stdDeviation="1.8" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {edges.map((edge, index) => {
            const from = nodeMap.get(edge.from);
            const to = nodeMap.get(edge.to);

            if (!from || !to) return null;

            const midY = (from.y + to.y) / 2;
            const path = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;

            return (
              <path
                key={`${edge.from}-${edge.to}-${index}`}
                d={path}
                className={`trace-v2-link trace-v2-link-${edge.type}`}
                style={{
                  animationDelay: `${getNodeDelay(from.type, index) + 250}ms`,
                }}
              />
            );
          })}
        </svg>

        {nodes.map((node, index) => (
          <button
            key={node.id}
            className={`trace-v2-node trace-v2-node-${node.type} ${
              selectedNode?.id === node.id ? "is-selected" : ""
            }`}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              animationDelay: `${getNodeDelay(node.type, index)}ms`,
            }}
            onClick={() => setSelectedNode(node)}
          >
            <span className="trace-v2-node-core" />
            <span className="trace-v2-node-label">{node.label}</span>
          </button>
        ))}
      </div>

      <aside className="trace-v2-inspector">
        <div className="trace-v2-kicker">{selectedNode?.type}</div>
        <h3>{selectedNode?.label}</h3>

        <div className="trace-v2-confidence">
          <span>Confidence</span>
          <strong>
            {typeof selectedNode?.confidence === "number"
              ? `${Math.round(selectedNode.confidence * 100)}%`
              : "Developing"}
          </strong>
        </div>

        <p>
          This node is part of Discovery’s reasoning structure. The trace now
          shows selective relationships instead of connecting every idea to
          every other idea.
        </p>

        <div className="trace-v2-meta">
          <span>Layer</span>
          <strong>{selectedNode?.type}</strong>
        </div>

        <div className="trace-v2-meta">
          <span>Status</span>
          <strong>{selectedNode?.type === "executive" ? "Formed" : "Active"}</strong>
        </div>
      </aside>

      <style jsx>{`
        .trace-v2-shell {
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

        .trace-v2-canvas {
          position: relative;
          min-height: 620px;
          overflow: hidden;
          border-radius: 28px;
          background:
            radial-gradient(circle at center, rgba(255, 255, 255, 0.045), transparent 36%),
            rgba(255, 255, 255, 0.025);
        }

        .trace-v2-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .trace-v2-link {
          fill: none;
          stroke-width: 0.22;
          filter: url(#traceGlow);
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawTrace 1.4s ease forwards;
        }

        .trace-v2-link-supports {
          stroke: rgba(214, 184, 112, 0.46);
        }

        .trace-v2-link-complicates {
          stroke: rgba(255, 142, 104, 0.38);
        }

        .trace-v2-node {
          position: absolute;
          transform: translate(-50%, -50%) scale(0.8);
          border: 0;
          background: transparent;
          color: rgba(255, 255, 255, 0.86);
          cursor: pointer;
          opacity: 0;
          animation: nodeArrive 900ms ease forwards;
        }

        .trace-v2-node-core {
          display: block;
          margin: 0 auto 10px;
          border-radius: 999px;
          background:
            radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), transparent 10%),
            radial-gradient(circle, rgba(224, 190, 111, 0.96), rgba(121, 91, 37, 0.42) 58%, rgba(255, 255, 255, 0.04));
          box-shadow:
            0 0 22px rgba(224, 190, 111, 0.34),
            inset 0 0 18px rgba(255, 255, 255, 0.16);
          animation: breathe 3.8s ease-in-out infinite;
        }

        .trace-v2-node-label {
          display: block;
          max-width: 135px;
          font-size: 10.5px;
          line-height: 1.2;
          text-align: center;
          color: rgba(255, 255, 255, 0.58);
        }

        .trace-v2-node-executive .trace-v2-node-core {
          width: 76px;
          height: 76px;
        }

        .trace-v2-node-belief .trace-v2-node-core {
          width: 54px;
          height: 54px;
        }

        .trace-v2-node-theme .trace-v2-node-core {
          width: 40px;
          height: 40px;
        }

        .trace-v2-node-contradiction .trace-v2-node-core {
          width: 38px;
          height: 38px;
          background:
            radial-gradient(circle, rgba(255, 210, 140, 0.85), rgba(142, 74, 47, 0.5) 58%, rgba(255, 255, 255, 0.04));
        }

        .trace-v2-node-evidence .trace-v2-node-core {
          width: 24px;
          height: 24px;
          opacity: 0.82;
        }

        .trace-v2-node.is-selected .trace-v2-node-core {
          box-shadow:
            0 0 0 1px rgba(255, 225, 166, 0.8),
            0 0 34px rgba(224, 190, 111, 0.58),
            inset 0 0 20px rgba(255, 255, 255, 0.2);
        }

        .trace-v2-inspector {
          padding: 26px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.045);
          border: 1px solid rgba(255, 255, 255, 0.08);
          color: white;
        }

        .trace-v2-kicker {
          margin-bottom: 12px;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.16em;
          color: rgba(224, 190, 111, 0.86);
        }

        .trace-v2-inspector h3 {
          margin: 0 0 22px;
          font-size: 24px;
          line-height: 1.15;
          font-weight: 500;
        }

        .trace-v2-inspector p {
          margin: 22px 0;
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255, 255, 255, 0.62);
        }

        .trace-v2-confidence,
        .trace-v2-meta {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding: 14px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          font-size: 13px;
        }

        .trace-v2-confidence span,
        .trace-v2-meta span {
          color: rgba(255, 255, 255, 0.48);
        }

        .trace-v2-confidence strong,
        .trace-v2-meta strong {
          color: rgba(255, 255, 255, 0.88);
          font-weight: 500;
          text-transform: capitalize;
        }

        @keyframes drawTrace {
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
          .trace-v2-shell {
            grid-template-columns: 1fr;
          }

          .trace-v2-inspector {
            min-height: 260px;
          }
        }
      `}</style>
    </div>
  );
}