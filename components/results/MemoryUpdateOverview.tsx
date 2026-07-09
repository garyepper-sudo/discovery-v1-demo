"use client";

import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";

type MemoryUpdateOverviewProps = {
  executiveDashboard?: ExecutiveDashboard;
  organizationRuntime?: any;
  delta?: any;
};

function formatMetricValue(value: unknown): string | number {
  if (typeof value === "number") return Math.round(value);
  if (typeof value === "string") return value;
  return 0;
}

function cleanSentence(value: unknown, fallback: string, maxLength = 112) {
  const raw = String(value || fallback).replace(/\s+/g, " ").trim();
  const firstSentence = raw.split(/(?<=[.!?])\s+/)[0];

  return firstSentence.length > maxLength
    ? `${firstSentence.slice(0, maxLength - 3)}...`
    : firstSentence;
}

function getTrajectory(index: number) {
  if (index === 0) return "Strengthening";
  if (index === 1) return "Evolving";
  if (index === 2) return "Stable";
  return "Tracked";
}

function getSparkline(index: number) {
  if (index === 0) return "▁▂▃▄▆▇";
  if (index === 1) return "▂▃▃▄▅▆";
  if (index === 2) return "▅▅▅▆▅▆";
  return "▂▃▄▅▆▇";
}

export default function MemoryUpdateOverview({
  executiveDashboard,
  organizationRuntime,
  delta,
}: MemoryUpdateOverviewProps) {
  const hero = executiveDashboard?.hero;
  const conversation = executiveDashboard?.conversation;

  const keyInsights = executiveDashboard?.keyInsights ?? [];
  const organizationalState =
    executiveDashboard?.currentOrganizationalState ?? [];
  const narratives = executiveDashboard?.narratives ?? [];
  const rememberedEvidence = executiveDashboard?.rememberedEvidence ?? [];

  const created = delta?.observationChanges?.created?.length ?? 0;
  const reinforced = delta?.observationChanges?.reinforced?.length ?? 0;

  const confidence = formatMetricValue(hero?.organizationConfidence ?? 0);

  const livingUnderstandings =
    keyInsights.length > 0
      ? keyInsights.slice(0, 3)
      : organizationalState.slice(0, 3).map((item) => ({
          title: item.title,
          summary: item.summary,
          confidence: item.confidence,
          importance: item.priority,
        }));

  return (
    <section className="memory-update-overview living-briefing">
      <div className="living-briefing-hero">
        <p className="memory-update-eyebrow">Since We Last Spoke</p>

        <h1>
          {conversation?.sinceLastSpoke.headline ??
            hero?.headline ??
            "Discovery updated its understanding of the organization."}
        </h1>

        <p>
          {conversation?.sinceLastSpoke.summary ??
            hero?.summary ??
            "Discovery compared this investigation against accumulated organizational memory."}
        </p>

        <div className="living-briefing-pulse-row">
          <span>{organizationRuntime?.metadata?.investigationCount ?? 1} investigations</span>
          <span>{created + reinforced} learning updates</span>
          <span>{rememberedEvidence.length} remembered signals</span>
          <span>{confidence}% confidence</span>
        </div>
      </div>

      <section className="living-understandings-panel">
        <div className="living-understandings-header">
          <div>
            <p className="memory-update-eyebrow">Living Understandings</p>
            <h2>Top understandings Discovery is tracking</h2>
          </div>

          <span>{livingUnderstandings.length} active</span>
        </div>

        <div className="living-understandings-list">
          {livingUnderstandings.length === 0 ? (
            <article className="living-understanding-row">
              <div>
                <h3>No tracked understandings yet.</h3>
                <p>
                  Add more evidence and Discovery will begin surfacing the
                  organizational understandings worth tracking over time.
                </p>
              </div>
              <span>Emerging</span>
            </article>
          ) : (
            livingUnderstandings.map((item: any, index: number) => (
              <article className="living-understanding-row" key={item.title ?? index}>
                <div className="living-understanding-main">
                  <div className="living-understanding-orb" />
                  <div>
                    <h3>{cleanSentence(item.title, "Organizational understanding")}</h3>
                    <p>
                      {cleanSentence(
                        item.summary,
                        "Discovery is tracking this understanding as the organization evolves.",
                      )}
                    </p>
                  </div>
                </div>

                <div className="living-understanding-trajectory">
                  <strong>{getSparkline(index)}</strong>
                  <span>{getTrajectory(index)}</span>
                </div>

                <div className="living-understanding-confidence">
                  <strong>
                    {item.confidence !== undefined
                      ? `${Math.round(item.confidence * 100)}%`
                      : "—"}
                  </strong>
                  <span>Confidence</span>
                </div>
              </article>
            ))
          )}
        </div>
      </section>

      <section className="living-todays-story">
        <p className="memory-update-eyebrow">Today’s Story</p>
        <h2>
          {conversation?.currentOrganizationalStory.headline ??
            narratives[0]?.headline ??
            "Discovery is developing the organization’s current story."}
        </h2>
        <p>
          {conversation?.currentOrganizationalStory.summary ??
            narratives[0]?.observation ??
            "As more evidence accumulates, Discovery will explain what changed, why it changed, and what leadership should discuss next."}
        </p>
      </section>
    </section>
  );
}