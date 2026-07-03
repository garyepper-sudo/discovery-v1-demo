"use client";

import { useState } from "react";

type UnderstandingCardProps = {
  index: number;
  label: string;
  title: string;
  detail: string;
  onTrace?: () => void;
};

export default function UnderstandingCard({
  index,
  label,
  title,
  detail,
  onTrace,
}: UnderstandingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [feedback, setFeedback] = useState<"helpful" | "not-helpful" | null>(
    null
  );

  return (
    <article className={`understanding-card ${expanded ? "expanded" : ""}`}>
      <button
        className="understanding-card-main"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="understanding-number">
          {String(index + 1).padStart(2, "0")}
        </div>

        <div className="understanding-content">
          <p className="understanding-label">{label}</p>
          <h2>{title}</h2>

        </div>

        <span className="understanding-expand">
          {expanded ? "Close ↑" : "Open ↓"}
        </span>
      </button>

      {expanded && (
        <div className="understanding-detail">
          <p>{detail}</p>

          <div className="understanding-actions">
            <div className="feedback-row">
              <span>Helpful?</span>

              <button
                className={feedback === "helpful" ? "selected" : ""}
                onClick={() => setFeedback("helpful")}
              >
                Yes
              </button>

              <button
                className={feedback === "not-helpful" ? "selected negative" : ""}
                onClick={() => setFeedback("not-helpful")}
              >
                No
              </button>
            </div>

            <button className="trace-button" onClick={onTrace}>
              Trace understanding →
            </button>
          </div>

          {feedback && (
            <p className="feedback-note">
              Thanks. Discovery will learn from this signal.
            </p>
          )}
        </div>
      )}
    </article>
  );
}