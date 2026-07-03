"use client";

type GraphEdgeProps = {
  vertical?: boolean;
};

export default function GraphEdge({ vertical = true }: GraphEdgeProps) {
  return (
    <div
      className={
        vertical
          ? "graph-edge graph-edge-vertical"
          : "graph-edge graph-edge-horizontal"
      }
    />
  );
}