"use client";

import { useMemo } from "react";

function cx(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function Organism({
  step,
  score,
  tension,
  mature = false,
}: {
  step: number;
  score: number;
  tension: boolean;
  mature?: boolean;
}) {
  const nodes = useMemo(() => {
    const base = [
      { x: 50, y: 50 },
      { x: 62, y: 40 },
      { x: 39, y: 36 },
      { x: 66, y: 61 },
      { x: 34, y: 63 },
      { x: 52, y: 25 },
      { x: 75, y: 48 },
      { x: 25, y: 48 },
    ];

    return base.slice(0, Math.max(1, Math.min(base.length, step + 1)));
  }, [step]);

  const stability = Math.max(
    30,
    Math.min(100, score - (tension ? 10 : 0) + step * 4)
  );

  const coreRadius = 3.3 + stability / 38;
  const haloRadius = 10 + stability / 12;
  const lineOpacity = 0.22 + stability / 150;

  return (
    <div
      className={cx("model-wrap", mature && "is-mature")}
      aria-label="Current understanding model"
    >
      <svg viewBox="0 0 100 100" className="model-svg">
        <defs>
          <radialGradient id="nodeGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f0d39a" stopOpacity="1" />
            <stop offset="100%" stopColor="#f0d39a" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="tensionGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#c89174" stopOpacity="1" />
            <stop offset="100%" stopColor="#c89174" stopOpacity="0" />
          </radialGradient>
        </defs>

        {nodes.slice(1).map((node, index) => {
          const prev = nodes[Math.max(0, index)];

          return (
            <line
              key={`line-${index}`}
              x1={prev.x}
              y1={prev.y}
              x2={node.x}
              y2={node.y}
              className={cx("model-line", step > 3 && "strong")}
              style={{ opacity: lineOpacity }}
            />
          );
        })}

        {nodes.map((node, index) => {
          const isCore = index === 0;
          const isNewest = index === nodes.length - 1;
          const isTension = tension && isNewest;

          return (
            <g
              key={`node-${index}`}
              className={cx(
                "model-node",
                isNewest && "new-node",
                isTension && "tension-node"
              )}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={isCore ? coreRadius : 2.25}
                className="node-core"
              />

              <circle
                cx={node.x}
                cy={node.y}
                r={isCore ? haloRadius : 7}
                fill={isTension ? "url(#tensionGlow)" : "url(#nodeGlow)"}
                className="node-halo"
              />
            </g>
          );
        })}
      </svg>

      {step > 0 && (
        <div className="score-chip">
          {Math.round(stability)}% stable
        </div>
      )}
    </div>
  );
}