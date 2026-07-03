"use client";

type ConfidenceBadgeProps = {
  confidence?: number;
  size?: "sm" | "md" | "lg";
  showPercent?: boolean;
};

export default function ConfidenceBadge({
  confidence = 0,
  size = "md",
  showPercent = true,
}: ConfidenceBadgeProps) {
  const percent = Math.round(confidence * 100);

  const level =
    percent >= 80
      ? "High"
      : percent >= 60
      ? "Moderate"
      : "Developing";

  const color =
    percent >= 80
      ? "#63d38b"
      : percent >= 60
      ? "#d6b870"
      : "#72a7ff";

  return (
    <>
      <div className={`confidence ${size}`}>
        <span
          className="confidence-dot"
          style={{ background: color }}
        />

        <span className="confidence-label">
          {level}
        </span>

        {showPercent && (
          <span className="confidence-percent">
            {percent}%
          </span>
        )}
      </div>

      <style jsx>{`
        .confidence{
          display:inline-flex;
          align-items:center;
          gap:10px;

          border-radius:999px;

          border:1px solid rgba(255,255,255,.08);

          background:rgba(255,255,255,.04);

          color:white;

          backdrop-filter:blur(10px);
        }

        .sm{
          padding:4px 10px;
          font-size:11px;
        }

        .md{
          padding:6px 14px;
          font-size:12px;
        }

        .lg{
          padding:10px 18px;
          font-size:14px;
        }

        .confidence-dot{
          width:8px;
          height:8px;
          border-radius:999px;

          box-shadow:
            0 0 12px currentColor;
        }

        .confidence-label{
          font-weight:600;
        }

        .confidence-percent{
          opacity:.55;
          font-variant-numeric:tabular-nums;
        }
      `}</style>
    </>
  );
}