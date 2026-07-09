"use client";

import { useState } from "react";
import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";
import OrganismPreview from "../organism/OrganismPreview";
import TraceUnderstandingPage from "../trace/TraceUnderstandingPage";
import ExecutiveAccordion from "../ui/ExecutiveAccordion";
import MemoryUpdateOverview from "./MemoryUpdateOverview";

type ResultsOverviewProps = {
  executiveDashboard?: ExecutiveDashboard;
  organizationRuntime?: any;
  reasoningGraph?: any;
  understanding?: any;
  organismState?: any;
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

function ConversationBlock({
  eyebrow,
  headline,
  summary,
  items,
  index,
}: {
  eyebrow: string;
  headline: string;
  summary: string;
  items: string[];
  index: number;
}) {
  return (
    <article className="executive-conversation-block">
      <div className="executive-conversation-step">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="executive-conversation-copy">
        <p className="executive-conversation-eyebrow">{eyebrow}</p>
        <h3>{headline}</h3>
        <p>{summary}</p>

        {items.length > 0 && (
          <ul>
            {items.slice(0, 4).map((item, itemIndex) => (
              <li key={`${eyebrow}-${itemIndex}`}>
                {oneSentence(item, "A meaningful organizational signal changed.")}
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

export default function ResultsOverview({
  executiveDashboard,
  organizationRuntime,
  reasoningGraph,
  understanding,
  organismState,
  delta,
}: ResultsOverviewProps) {
  const [showOrganismExplorer, setShowOrganismExplorer] = useState(false);
  const [showReasoningTrace, setShowReasoningTrace] = useState(false);

  const runtimeOrganism = organizationRuntime?.organism;

  const hero = executiveDashboard?.hero;
  const conversation = executiveDashboard?.conversation;
  const keyInsights = executiveDashboard?.keyInsights ?? [];
  const currentOrganizationalState =
    executiveDashboard?.currentOrganizationalState ?? [];
  const operatingMechanisms = executiveDashboard?.operatingMechanisms ?? [];
  const rememberedEvidence = executiveDashboard?.rememberedEvidence ?? [];

  const conversationSections = conversation
    ? [
        conversation.sinceLastSpoke,
        conversation.currentOrganizationalStory,
        conversation.leadershipConversation,
        conversation.actionPlan,
      ]
    : [];

  return (
    <section className="results-overview-executive">
      {executiveDashboard && (
        <MemoryUpdateOverview
          executiveDashboard={executiveDashboard}
          organizationRuntime={organizationRuntime}
          delta={delta}
        />
      )}

      {conversation && (
        <section className="executive-conversation-panel">
          <div className="executive-conversation-header">
            <div>
              <p className="executive-section-kicker">Executive Conversation</p>
              <h2>Since we last spoke</h2>
              <p>
                Discovery is translating accumulated organizational memory into
                the conversations leadership should have next.
              </p>
            </div>

            <div className="executive-conversation-actions">
              <button
                type="button"
                onClick={() => setShowOrganismExplorer(true)}
              >
                Explore organism
              </button>

              <button
                type="button"
                onClick={() => setShowReasoningTrace(true)}
              >
                Show reasoning
              </button>
            </div>
          </div>

          <div className="executive-conversation-list">
            {conversationSections.map((section, index) => (
              <ConversationBlock
                key={section.eyebrow}
                eyebrow={section.eyebrow}
                headline={section.headline}
                summary={section.summary}
                items={section.items}
                index={index}
              />
            ))}
          </div>

          <ExecutiveAccordion
            title={conversation.exploreUnderstanding.eyebrow}
            subtitle={conversation.exploreUnderstanding.summary}
            badge="Explore"
            icon="◎"
            defaultOpen={false}
          >
            <div className="executive-row-list">
              {conversation.exploreUnderstanding.items.map((item, index) => (
                <article className="executive-insight-row" key={index}>
                  <span className="executive-row-icon">◎</span>
                  <div>
                    <h4>{index === 0 ? "Available depth" : "Supporting layer"}</h4>
                    <p>{item}</p>
                  </div>
                  <span className="executive-row-status">Depth</span>
                </article>
              ))}
            </div>
          </ExecutiveAccordion>
        </section>
      )}

      <section className="executive-compressed-sections">
        <ExecutiveAccordion
          title="Key Insights"
          subtitle="The big ideas that explain what's happening."
          badge={`${Math.min(keyInsights.length, 5)} found`}
          icon="◎"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {keyInsights.slice(0, 5).map((insight, index) => (
              <article
                className="executive-insight-row"
                key={insight.title ?? index}
              >
                <span className="executive-row-icon">◎</span>

                <div>
                  <h4>{insight.title}</h4>
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
          badge={`${Math.min(currentOrganizationalState.length, 5)} found`}
          icon="⌁"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {currentOrganizationalState.slice(0, 5).map((item, index) => (
              <article
                className="executive-insight-row"
                key={item.title ?? index}
              >
                <span className="executive-row-icon">
                  {item.category === "risk" ? "?" : "⌁"}
                </span>

                <div>
                  <h4>{item.title}</h4>
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
          badge={`${Math.min(operatingMechanisms.length, 5)} found`}
          icon="▣"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {operatingMechanisms.slice(0, 5).map((item, index) => (
              <article
                className="executive-insight-row"
                key={item.title ?? index}
              >
                <span className="executive-row-icon">▣</span>

                <div>
                  <h4>{item.title}</h4>
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
          badge={`${rememberedEvidence.length} total`}
          icon="◉"
          defaultOpen={false}
        >
          <div className="executive-row-list">
            {rememberedEvidence.slice(0, 5).map((item, index) => (
              <article
                className="executive-insight-row"
                key={item.title ?? index}
              >
                <span className="executive-row-icon">◉</span>

                <div>
                  <h4>{item.title}</h4>
                  <p>
                    {oneSentence(
                      item.summary,
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
        headline={hero?.headline ?? "Discovery reasoning trace"}
        confidence={hero?.organizationConfidence ?? 0}
        executiveUnderstanding={understanding}
        beliefs={[]}
        themes={[]}
        contradictions={[]}
        evidence={rememberedEvidence}
        reasoningGraph={reasoningGraph}
      />
    </section>
  );
}