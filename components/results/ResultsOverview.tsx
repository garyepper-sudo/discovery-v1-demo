"use client";

import { useState } from "react";
import OrganismPreview from "../organism/OrganismPreview";
import TraceUnderstandingPage from "../trace/TraceUnderstandingPage";
import ExecutiveAccordion from "../ui/ExecutiveAccordion";
import MemoryUpdateOverview from "./MemoryUpdateOverview";

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
  organizationRuntime?: any;
  delta?: any;
};

function oneSentence(value: string | undefined, fallback: string) {
  if (!value) return fallback;

  const cleaned = value.replace(/\s+/g, " ").trim();
  const firstSentence = cleaned.split(/(?<=[.!?])\s+/)[0];

  return firstSentence.length > 160
    ? `${firstSentence.slice(0, 157)}...`
    : firstSentence;
}

export default function ResultsOverview({
  understanding,
  beliefs = [],
  themes = [],
  contradictions = [],
  causalChains = [],
  evidence = [],
  reasoningGraph,
  organismState,
  organizationRuntime,
  delta,
}: ResultsOverviewProps) {
  const [showOrganismExplorer, setShowOrganismExplorer] = useState(false);
  const [showReasoningTrace, setShowReasoningTrace] = useState(false);

  const primaryBelief = beliefs[0];
  const runtimeOrganism = organizationRuntime?.organism;

  const headline =
    understanding?.headline ??
    primaryBelief?.headline ??
    "Discovery formed a current understanding.";

  return (
    <section className="results-overview-executive">
      <MemoryUpdateOverview
        organizationRuntime={organizationRuntime}
        beliefs={beliefs}
        themes={themes}
        evidence={evidence}
        delta={delta}
      />

      <section className="executive-compressed-sections">
        <ExecutiveAccordion
          title="Key Insights"
          subtitle="The big ideas that explain what's happening."
          badge={`${Math.min(beliefs.length || 0, 5)} found`}
          icon="◎"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {beliefs.slice(0, 5).map((belief, index) => (
              <article className="executive-insight-row" key={belief.id ?? index}>
                <span className="executive-row-icon">◎</span>

                <div>
                  <h4>
                    {belief.headline ??
                      belief.statement ??
                      "A meaningful pattern may be emerging."}
                  </h4>
                  <p>
                    {oneSentence(
                      belief.summary ?? belief.explanation,
                      "A meaningful signal appears to be shaping the organization."
                    )}
                  </p>
                </div>

                <span className="executive-row-status">Insight</span>
              </article>
            ))}
          </div>
        </ExecutiveAccordion>

        <ExecutiveAccordion
          title="What's Happening"
          subtitle="Important patterns and situations we're seeing."
          badge={`${(themes.length || 0) + (contradictions.length || 0)} found`}
          icon="⌁"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {themes.slice(0, 4).map((theme, index) => (
              <article className="executive-insight-row" key={theme.id ?? index}>
                <span className="executive-row-icon">⌁</span>

                <div>
                  <h4>{theme.title ?? theme.name ?? "Emerging pattern"}</h4>
                  <p>
                    {oneSentence(
                      theme.summary ?? theme.description,
                      "This pattern appears across the investigation."
                    )}
                  </p>
                </div>

                <span className="executive-row-status">Pattern</span>
              </article>
            ))}

            {contradictions.slice(0, 2).map((contradiction, index) => (
              <article
                className="executive-insight-row"
                key={contradiction.id ?? index}
              >
                <span className="executive-row-icon">?</span>

                <div>
                  <h4>
                    {contradiction.title ??
                      contradiction.statement ??
                      "An unresolved tension remains."}
                  </h4>
                  <p>
                    {oneSentence(
                      contradiction.summary ?? contradiction.description,
                      "This could change the interpretation if more evidence appears."
                    )}
                  </p>
                </div>

                <span className="executive-row-status">Open</span>
              </article>
            ))}
          </div>
        </ExecutiveAccordion>

        <ExecutiveAccordion
          title="How We Work"
          subtitle="Our strengths, systems, and ways of operating."
          badge={`${organismState?.mechanisms?.length ?? causalChains.length ?? 0} found`}
          icon="▣"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {(organismState?.mechanisms ?? causalChains ?? [])
              .slice(0, 5)
              .map((item: any, index: number) => (
                <article className="executive-insight-row" key={item.id ?? index}>
                  <span className="executive-row-icon">▣</span>

                  <div>
                    <h4>
                      {item.title ??
                        item.statement ??
                        item.summary ??
                        "Discovery found a possible operating pattern."}
                    </h4>
                    <p>
                      {oneSentence(
                        item.summary ?? item.description ?? item.explanation,
                        "This behavior may explain why the pattern keeps appearing."
                      )}
                    </p>
                  </div>

                  <span className="executive-row-status">System</span>
                </article>
              ))}
          </div>
        </ExecutiveAccordion>

        <ExecutiveAccordion
          title="Remembered Evidence"
          subtitle="All signals and observations we're tracking."
          badge={`${evidence.length} total`}
          icon="◉"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {evidence.slice(0, 5).map((item, index) => (
              <article className="executive-insight-row" key={item.id ?? index}>
                <span className="executive-row-icon">◉</span>

                <div>
                  <h4>{item.title ?? item.source ?? "Remembered signal"}</h4>
                  <p>
                    {oneSentence(
                      item.summary ?? item.text ?? item.observation,
                      "Evidence retained in organizational memory."
                    )}
                  </p>
                </div>

                <span className="executive-row-status">Evidence</span>
              </article>
            ))}
          </div>
        </ExecutiveAccordion>
      </section>

      {showOrganismExplorer && (
        <OrganismPreview
          open={showOrganismExplorer}
          onOpen={() => setShowOrganismExplorer(true)}
          onClose={() => setShowOrganismExplorer(false)}
          organismState={runtimeOrganism?.organismState ?? organismState}
        />
      )}

      <TraceUnderstandingPage
        open={showReasoningTrace}
        onClose={() => setShowReasoningTrace(false)}
        headline={headline}
        confidence={
          (primaryBelief?.confidence ?? understanding?.confidence) || 0.75
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