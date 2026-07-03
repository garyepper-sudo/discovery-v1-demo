"use client";

type GraphNodeProps = {
  title: string;
  subtitle?: string;
  active?: boolean;
  onClick?: () => void;
};

export default function GraphNode({
  title,
  subtitle,
  active = false,
  onClick,
}: GraphNodeProps) {
  return (
    <button
      className={`graph-node ${active ? "active" : ""}`}
      onClick={onClick}
    >
      {subtitle && (
        <div className="graph-node-subtitle">
          {subtitle}
        </div>
      )}

      <div className="graph-node-title">
        {title}
      </div>
    </button>
  );
}