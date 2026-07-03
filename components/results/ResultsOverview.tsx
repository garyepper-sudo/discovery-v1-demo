"use client";

import { useState } from "react";
import ExecutiveSummary from "./ExecutiveSummary";
import SupportingUnderstandings from "./SupportingUnderstandings";
import HypothesesPanel from "../understanding/HypothesesPanel";
import OrganismPreview from "../organism/OrganismPreview";
import TraceUnderstandingPage from "../trace/TraceUnderstandingPage";

type ResultsOverviewProps = {
  understanding?: any;
  beliefs?: any[];
  hypotheses?: any[];
  themes?: any[];
  contradictions?: any[];
  causalChains?: any[];
  evidence?: any[];
  reasoningGraph?: any;
};

export default function ResultsOverview({
  understanding,
  beliefs = [],
  hypotheses = [],
  themes = [],
  contradictions = [],
  causalChains = [],
  evidence = [],
  reasoningGraph,
}: ResultsOverviewProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const [showPastInsights, setShowPastInsights] = useState(false);
  const [showOrganismView, setShowOrganismView] = useState(false);

  return (
    <section className="executive-results">
      <div className="results-left">
        <p className="overview-label">Investigation complete</p>

        <ExecutiveSummary
          executiveUnderstanding={understanding}
          evidenceCount={evidence.length}
          onTrace={() => setShowOrganismView(true)}
        />

        <HypothesesPanel hypotheses={hypotheses} />

        <SupportingUnderstandings
          beliefs={beliefs}
          onTrace={() => setShowOrganismView(true)}
        />

        <div className="overview-actions">
          <button onClick={() => setShowReasoning(!showReasoning)}>
            {showReasoning ? "Hide reasoning ↑" : "Explore the reasoning →"}
          </button>

          <button onClick={() => setShowPastInsights(!showPastInsights)}>
            {showPastInsights ? "Hide past insights ↑" : "Past insights →"}
          </button>
        </div>
      </div>

      <OrganismPreview
        open={false}
        onOpen={() => setShowOrganismView(true)}
        onClose={() => setShowOrganismView(false)}
        evidence={evidence}
        themes={themes}
        contradictions={contradictions}
        causalChains={causalChains}
      />

      {(showReasoning || showPastInsights) && (
        <div className="expanded-results">
          {showReasoning && (
            <>
              <ReasoningBlock title="What led us here" items={evidence} />
              <ReasoningBlock title="Patterns we noticed" items={themes} />
              <ReasoningBlock
                title="Questions we're still exploring"
                items={contradictions}
              />
              <ReasoningBlock title="Causal reasoning" items={causalChains} />
            </>
          )}

          {showPastInsights && (
            <ReasoningBlock
              title="Past insights"
              items={beliefs.map((belief: any) => ({
                title: getReadableReasoning(belief),
                summary:
                  belief?.explanation ??
                  belief?.summary ??
                  "Discovery found this supporting pattern.",
              }))}
            />
          )}
        </div>
      )}

      <footer className="results-footer">
        <span>Investigation: Strategic Review</span>
        <span>{evidence.length} sources analyzed</span>
        <span>Completed just now</span>
      </footer>

      <TraceUnderstandingPage
        open={showOrganismView}
        onClose={() => setShowOrganismView(false)}
        headline={
          understanding?.headline ??
          beliefs[0]?.headline ??
          "Current Understanding"
        }
        confidence={
          beliefs[0]?.priority?.confidence ??
          beliefs[0]?.confidence ??
          understanding?.confidence ??
          0.75
        }
        executiveUnderstanding={understanding}
        beliefs={beliefs}
        themes={themes}
        contradictions={contradictions}
        evidence={evidence}
        reasoningGraph={reasoningGraph}
      />
    </section>
  );
}

function getReadableReasoning(item: any): string {
  if (!item) return "No detail available.";

  return (
    item.headline ??
    item.statement ??
    item.title ??
    item.summary ??
    item.explanation ??
    item.claim ??
    item.text ??
    item.cause ??
    item.effect ??
    JSON.stringify(item)
  );
}

function ReasoningBlock({ title, items }: { title: string; items: any[] }) {
  return (
    <section className="reasoning-block">
      <h3>{title}</h3>

      {items.length === 0 ? (
        <p className="empty-reasoning">Nothing surfaced yet.</p>
      ) : (
        <div className="reasoning-list">
          {items.slice(0, 8).map((item, index) => (
            <div key={item.id ?? index} className="reasoning-item">
              {getReadableReasoning(item)}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}