"use client";

import TraceReasoning from "./TraceReasoning";

type TraceUnderstandingPageProps = {
  open: boolean;
  onClose: () => void;
  headline?: string;
  confidence?: number;
  executiveUnderstanding?: any;
  beliefs?: any[];
  themes?: any[];
  contradictions?: any[];
  evidence?: any[];
  reasoningGraph?: any;
};

export default function TraceUnderstandingPage({
  open,
  onClose,
  headline = "Tracing this understanding",
  confidence = 0.72,
  reasoningGraph,
}: TraceUnderstandingPageProps) {
  if (!open) return null;

  const confidenceLabel =
    confidence >= 0.78 ? "High" : confidence >= 0.58 ? "Moderate" : "Early";

  return (
    <section
      className="trace-page"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        overflowY: "auto",
        background: "#05070d",
        padding: "48px",
      }}
    >
      <header
        className="trace-header"
        style={{
          display: "flex",
          gap: "24px",
          alignItems: "flex-start",
          marginBottom: "36px",
        }}
      >
        <button
          className="trace-back-button"
          onClick={onClose}
          style={{
            padding: "10px 16px",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>

        <div>
          <p className="overview-label">Trace Understanding</p>

          <h1
            style={{
              marginTop: "8px",
              marginBottom: "12px",
            }}
          >
            {headline}
          </h1>

          <div
            className="trace-meta-row"
            style={{
              display: "flex",
              gap: "18px",
              opacity: 0.8,
            }}
          >
            <span>Confidence: {confidenceLabel}</span>
            <span>Living reasoning path</span>
          </div>
        </div>
      </header>

      <TraceReasoning graph={reasoningGraph} />
    </section>
  );
}