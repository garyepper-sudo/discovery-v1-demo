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
  organismState?: any;
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
  organismState,
}: ResultsOverviewProps) {
  const [showReasoning, setShowReasoning] = useState(false);
  const [showPastInsights, setShowPastInsights] = useState(false);
  const [showOrganismExplorer, setShowOrganismExplorer] = useState(false);
  const [showReasoningTrace, setShowReasoningTrace] = useState(false);

  return (
    <section className="executive-results">
      <div className="results-left">
        <p className="overview-label">Investigation complete</p>

        <ExecutiveSummary
          executiveUnderstanding={understanding}
          evidenceCount={evidence.length}
          onTrace={() => setShowReasoningTrace(true)}
        />

        <OrganismSignals organismState={organismState} />

        <HypothesesPanel hypotheses={hypotheses} />

        <SupportingUnderstandings
          beliefs={beliefs}
          onTrace={() => setShowReasoningTrace(true)}
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
        open={showOrganismExplorer}
        onOpen={() => setShowOrganismExplorer(true)}
        onClose={() => setShowOrganismExplorer(false)}
        organismState={organismState}
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
        open={showReasoningTrace}
        onClose={() => setShowReasoningTrace(false)}
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

function OrganismSignals({ organismState }: { organismState?: any }) {
  if (!organismState) return null;

  const topPattern = organismState.emergingPatterns?.[0];

  return (
    <section className="organism-signals-card">
      <div>
        <p className="overview-label">Organism state</p>
        <h3>{topPattern?.title ?? "Understanding is stabilizing"}</h3>
        <p>
          Discovery is tracking coherence, tension, uncertainty, and emerging
          patterns as part of the living understanding.
        </p>
      </div>

      <div className="organism-signal-grid">
        <SignalMetric label="Coherence" value={organismState.coherence} />
        <SignalMetric label="Tension" value={organismState.tension} />
        <SignalMetric label="Uncertainty" value={organismState.uncertainty} />
        <SignalMetric label="Maturity" value={organismState.maturity} />
      </div>

      <div className="organism-signal-counts">
        <span>{organismState.evidenceClusters?.length ?? 0} clusters</span>
        <span>{organismState.mechanisms?.length ?? 0} mechanisms</span>
        <span>{organismState.hypotheses?.length ?? 0} hypotheses</span>
        <span>{organismState.contradictions?.length ?? 0} tensions</span>
      </div>
    </section>
  );
}

function SignalMetric({ label, value }: { label: string; value?: number }) {
  const percent = Math.round((value ?? 0) * 100);

  return (
    <div className="organism-signal-metric">
      <span>{label}</span>
      <strong>{percent}%</strong>
    </div>
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