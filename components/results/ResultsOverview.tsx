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
  executiveDashboard?: any;
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
  executiveDashboard,
}: ResultsOverviewProps) {
  const [showOrganismExplorer, setShowOrganismExplorer] = useState(false);
  const [showReasoningTrace, setShowReasoningTrace] = useState(false);

  const primaryBelief = beliefs[0];
  const runtimeOrganism = organizationRuntime?.organism;

  const keyInsights =
    executiveDashboard?.keyInsights?.length > 0
      ? executiveDashboard.keyInsights
      : beliefs.slice(0, 5).map((belief, index) => ({
          id: belief.id ?? index,
          title:
            belief.headline ??
            belief.statement ??
            "A meaningful pattern may be emerging.",
          summary:
            belief.summary ??
            belief.explanation ??
            "A meaningful signal appears to be shaping the organization.",
          importance: "medium",
          confidence: belief.confidence,
        }));

  const currentOrganizationalState =
    executiveDashboard?.currentOrganizationalState?.length > 0
      ? executiveDashboard.currentOrganizationalState
      : [
          ...themes.slice(0, 4).map((theme, index) => ({
            id: theme.id ?? `theme-${index}`,
            title: theme.title ?? theme.name ?? "Emerging pattern",
            summary:
              theme.summary ??
              theme.description ??
              "This pattern appears across the investigation.",
            category: "pattern",
            priority: "medium",
          })),
          ...contradictions.slice(0, 2).map((contradiction, index) => ({
            id: contradiction.id ?? `contradiction-${index}`,
            title:
              contradiction.title ??
              contradiction.statement ??
              "An unresolved tension remains.",
            summary:
              contradiction.summary ??
              contradiction.description ??
              "This could change the interpretation if more evidence appears.",
            category: "risk",
            priority: "high",
          })),
        ];

  const operatingMechanisms =
    executiveDashboard?.operatingMechanisms?.length > 0
      ? executiveDashboard.operatingMechanisms
      : (organismState?.mechanisms ?? causalChains ?? [])
          .slice(0, 5)
          .map((item: any, index: number) => ({
            id: item.id ?? index,
            title:
              item.title ??
              item.statement ??
              item.summary ??
              "Discovery found a possible operating pattern.",
            summary:
              item.summary ??
              item.description ??
              item.explanation ??
              "This behavior may explain why the pattern keeps appearing.",
            role: "system",
            confidence: item.confidence,
          }));

  const rememberedEvidence =
    executiveDashboard?.rememberedEvidence?.length > 0
      ? executiveDashboard.rememberedEvidence
      : evidence.slice(0, 5).map((item: any, index: number) => ({
          id: item.id ?? index,
          title: item.title ?? item.source ?? "Remembered signal",
          summary:
            item.summary ??
            item.text ??
            item.observation ??
            "Evidence retained in organizational memory.",
          source: item.source,
          confidence: item.confidence,
        }));

  const headline =
    executiveDashboard?.hero?.headline ??
    understanding?.headline ??
    primaryBelief?.headline ??
    "Discovery formed a current understanding.";

  return (
    <section className="results-overview-executive">
      <MemoryUpdateOverview
        executiveDashboard={executiveDashboard}
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
          badge={`${Math.min(keyInsights.length || 0, 5)} found`}
          icon="◎"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {keyInsights.slice(0, 5).map((insight: any, index: number) => (
              <article
                className="executive-insight-row"
                key={insight.id ?? insight.title ?? index}
              >
                <span className="executive-row-icon">◎</span>

                <div>
                  <h4>
                    {insight.title ?? "A meaningful pattern may be emerging."}
                  </h4>
                  <p>
                    {oneSentence(
                      insight.summary,
                      "A meaningful signal appears to be shaping the organization.",
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
          badge={`${Math.min(currentOrganizationalState.length || 0, 5)} found`}
          icon="⌁"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {currentOrganizationalState
              .slice(0, 5)
              .map((item: any, index: number) => (
                <article
                  className="executive-insight-row"
                  key={item.id ?? item.title ?? index}
                >
                  <span className="executive-row-icon">
                    {item.category === "risk" ? "?" : "⌁"}
                  </span>

                  <div>
                    <h4>{item.title ?? "Emerging organizational state"}</h4>
                    <p>
                      {oneSentence(
                        item.summary,
                        "Discovery identified an important organizational pattern.",
                      )}
                    </p>
                  </div>

                  <span className="executive-row-status">
                    {item.category === "risk" ? "Open" : "Pattern"}
                  </span>
                </article>
              ))}
          </div>
        </ExecutiveAccordion>

        <ExecutiveAccordion
          title="How We Work"
          subtitle="Our strengths, systems, and ways of operating."
          badge={`${Math.min(operatingMechanisms.length || 0, 5)} found`}
          icon="▣"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {operatingMechanisms
              .slice(0, 5)
              .map((item: any, index: number) => (
                <article
                  className="executive-insight-row"
                  key={item.id ?? item.title ?? index}
                >
                  <span className="executive-row-icon">▣</span>

                  <div>
                    <h4>
                      {item.title ??
                        "Discovery found a possible operating pattern."}
                    </h4>
                    <p>
                      {oneSentence(
                        item.summary,
                        "This behavior may explain why the pattern keeps appearing.",
                      )}
                    </p>
                  </div>

                  <span className="executive-row-status">
                    {item.role === "strength" ? "Strength" : "System"}
                  </span>
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
              "Evidence retained in organizational memory.",
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