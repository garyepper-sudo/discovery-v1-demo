"use client";

import { useMemo, useState } from "react";
import ReasoningTimeline from "./ReasoningTimeline";

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
  type: string;
  weight: number;
  primary?: boolean;
  explanation?: string;
};

type ReasoningGraphData = {
  nodes: ReasoningNode[];
  edges: ReasoningEdge[];
  executiveNodeId?: string;
};

type TraceReasoningProps = {
  graph?: ReasoningGraphData;
};

export default function TraceReasoning({ graph }: TraceReasoningProps) {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null);

  const nodeMap = useMemo(() => {
    return new Map((graph?.nodes ?? []).map((node) => [node.id, node]));
  }, [graph]);

  const executiveNode = useMemo(() => {
    if (!graph?.nodes?.length) return null;

    return (
      nodeMap.get(graph.executiveNodeId ?? "") ??
      graph.nodes.find((node) => node.type === "executive") ??
      graph.nodes[0]
    );
  }, [graph, nodeMap]);

  const supportingEdges = useMemo(() => {
    if (!executiveNode) return [];

    return (graph?.edges ?? [])
      .filter((edge) => edge.to === executiveNode.id)
      .sort(
        (a, b) =>
          Number(b.primary) - Number(a.primary) || b.weight - a.weight
      )
      .slice(0, 3);
  }, [graph, executiveNode]);

  const supportingNodes = supportingEdges
    .map((edge) => nodeMap.get(edge.from))
    .filter(Boolean) as ReasoningNode[];

  const activeNode =
    (activeNodeId ? nodeMap.get(activeNodeId) : null) ??
    supportingNodes[0] ??
    executiveNode;

  const childEdges = useMemo(() => {
    if (!activeNode) return [];

    return (graph?.edges ?? [])
      .filter((edge) => edge.to === activeNode.id)
      .sort(
        (a, b) =>
          Number(b.primary) - Number(a.primary) || b.weight - a.weight
      )
      .slice(0, 5);
  }, [graph, activeNode]);

  const childNodes = childEdges
    .map((edge) => nodeMap.get(edge.from))
    .filter(Boolean) as ReasoningNode[];

  if (!graph?.nodes?.length || !executiveNode) {
    return (
      <div className="trace-reasoning-empty">
        Discovery has not formed a reasoning trace yet.
      </div>
    );
  }

  return (
    <div className="trace-reasoning-shell">
      <main className="trace-reasoning-main">
        <section className="trace-executive-card">
          <div className="trace-kicker">Executive Understanding</div>
          <h2>{executiveNode.label}</h2>
          <p>{executiveNode.description}</p>

          <div className="trace-confidence">
            <span>Confidence</span>
            <strong>
              {typeof executiveNode.confidence === "number"
                ? `${Math.round(executiveNode.confidence * 100)}%`
                : "Developing"}
            </strong>
          </div>
        </section>

       <section className="trace-why-section">
  <ReasoningTimeline
    executive={executiveNode}
    beliefs={supportingNodes}
    activeId={activeNode?.id}
    onSelect={setActiveNodeId}
  />
</section>

        <section className="trace-detail-path">
          <div className="trace-section-title">
            {activeNode?.label ?? "Selected reasoning path"}
          </div>

          {childNodes.length === 0 ? (
            <p className="trace-muted">
              This node does not have deeper support attached yet.
            </p>
          ) : (
            <div className="trace-child-list">
              {childNodes.map((node, index) => (
                <div
                  key={node.id}
                  className="trace-child-card"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <span className="trace-child-connector" />
                  <span className={`trace-small-orb trace-orb-${node.type}`} />
                  <div>
                    <div className="trace-node-type">{node.type}</div>
                    <strong>{node.label}</strong>
                    {node.description && <p>{node.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      <aside className="trace-inspector-panel">
        <div className="trace-kicker">Inspector</div>
        <h3>{activeNode?.label}</h3>
        <p>{activeNode?.description ?? "Select a node to inspect its reasoning."}</p>

        <div className="trace-meta-row">
          <span>Layer</span>
          <strong>{activeNode?.type}</strong>
        </div>

        <div className="trace-meta-row">
          <span>Confidence</span>
          <strong>
            {typeof activeNode?.confidence === "number"
              ? `${Math.round(activeNode.confidence * 100)}%`
              : "Developing"}
          </strong>
        </div>

        <div className="trace-meta-row">
          <span>Supporting nodes</span>
          <strong>{childNodes.length}</strong>
        </div>
      </aside>

      <style jsx>{`
        .trace-reasoning-shell {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 28px;
          width: 100%;
          padding: 30px;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background:
            radial-gradient(circle at 50% 0%, rgba(214, 184, 112, 0.13), transparent 34%),
            linear-gradient(180deg, #101116, #07080b);
          color: white;
        }

        .trace-reasoning-main {
          display: grid;
          gap: 24px;
        }

        .trace-executive-card,
        .trace-why-section,
        .trace-detail-path,
        .trace-inspector-panel {
          border-radius: 28px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.045);
          padding: 26px;
        }

        .trace-executive-card h2 {
          max-width: 760px;
          margin: 8px 0 14px;
          font-size: clamp(30px, 4vw, 52px);
          line-height: 1.02;
          font-weight: 500;
          letter-spacing: -0.04em;
        }

        .trace-executive-card p,
        .trace-inspector-panel p,
        .trace-child-card p,
        .trace-muted {
          color: rgba(255, 255, 255, 0.62);
          line-height: 1.65;
          font-size: 14px;
        }

        .trace-kicker,
        .trace-section-title,
        .trace-node-type {
          text-transform: uppercase;
          letter-spacing: 0.14em;
          font-size: 11px;
          color: rgba(224, 190, 111, 0.84);
        }

        .trace-confidence,
        .trace-meta-row {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          padding-top: 16px;
          margin-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          color: rgba(255, 255, 255, 0.68);
          font-size: 13px;
        }

        .trace-confidence strong,
        .trace-meta-row strong {
          color: rgba(255, 255, 255, 0.9);
          font-weight: 500;
          text-transform: capitalize;
        }

        .trace-branch-list {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-top: 18px;
        }

        .trace-branch-card {
          display: flex;
          align-items: center;
          gap: 14px;
          min-height: 118px;
          padding: 18px;
          border-radius: 22px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.035);
          color: white;
          text-align: left;
          cursor: pointer;
          opacity: 0;
          transform: translateY(10px);
          animation: traceArrive 700ms ease forwards;
        }

        .trace-branch-card:hover,
        .trace-branch-card.is-active {
          border-color: rgba(224, 190, 111, 0.42);
          background: rgba(224, 190, 111, 0.08);
        }

        .trace-orb,
        .trace-small-orb {
          flex: 0 0 auto;
          display: block;
          border-radius: 999px;
          background:
            radial-gradient(circle at 35% 30%, rgba(255, 255, 255, 0.95), transparent 12%),
            radial-gradient(circle, rgba(224, 190, 111, 0.95), rgba(121, 91, 37, 0.42) 60%, rgba(255, 255, 255, 0.04));
          box-shadow: 0 0 22px rgba(224, 190, 111, 0.34);
        }

        .trace-orb {
          width: 46px;
          height: 46px;
        }

        .trace-small-orb {
          width: 22px;
          height: 22px;
        }

        .trace-orb-contradiction {
          background:
            radial-gradient(circle, rgba(255, 210, 140, 0.85), rgba(142, 74, 47, 0.52) 60%, rgba(255, 255, 255, 0.04));
        }

        .trace-orb-causal {
          background:
            radial-gradient(circle, rgba(202, 215, 255, 0.9), rgba(91, 105, 169, 0.42) 60%, rgba(255, 255, 255, 0.04));
        }

        .trace-child-list {
          display: grid;
          gap: 14px;
          margin-top: 18px;
        }

        .trace-child-card {
          position: relative;
          display: grid;
          grid-template-columns: 22px minmax(0, 1fr);
          gap: 14px;
          padding: 18px;
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.035);
          border: 1px solid rgba(255, 255, 255, 0.07);
          opacity: 0;
          transform: translateY(10px);
          animation: traceArrive 700ms ease forwards;
        }

        .trace-child-connector {
          position: absolute;
          left: 29px;
          top: -14px;
          width: 1px;
          height: 14px;
          background: rgba(224, 190, 111, 0.42);
        }

        .trace-inspector-panel h3 {
          margin: 10px 0 16px;
          font-size: 24px;
          line-height: 1.14;
          font-weight: 500;
        }

        .trace-reasoning-empty {
          padding: 32px;
          border-radius: 28px;
          color: rgba(255, 255, 255, 0.68);
          background: rgba(255, 255, 255, 0.04);
        }

        @keyframes traceArrive {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 960px) {
          .trace-reasoning-shell,
          .trace-branch-list {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}