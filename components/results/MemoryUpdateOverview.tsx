"use client";

import { useState } from "react";

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

function cleanSentence(value: unknown, fallback: string, maxLength = 104) {
  const raw = String(value || fallback).replace(/\s+/g, " ").trim();
  const firstSentence = raw.split(/(?<=[.!?])\s+/)[0];

  return firstSentence.length > maxLength
    ? `${firstSentence.slice(0, maxLength - 3)}...`
    : firstSentence;
}

function getMetricValue(
  dashboard: ExecutiveDashboard | undefined,
  name: string,
  fallback: number | string,
): number | string {
  const metric = dashboard?.metrics.find(
    (item: ExecutiveDashboard["metrics"][number]) =>
      item.label.toLowerCase().includes(name.toLowerCase()),
  );

  return formatMetricValue(metric?.current ?? fallback);
}

function getRowIcon(index: number) {
  if (index === 0) return "◷";
  if (index === 1) return "♙";
  if (index === 2) return "□";
  if (index === 3) return "◎";
  return "↗";
}

function getStatusLabel(priority?: string) {
  if (priority === "highest") return "Priority";
  if (priority === "high") return "Watch";
  if (priority === "medium") return "Review";
  return "Stable";
}

export default function MemoryUpdateOverview({
  executiveDashboard,
  organizationRuntime,
  delta,
}: MemoryUpdateOverviewProps) {
  const [showAllChanges, setShowAllChanges] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const hero = executiveDashboard?.hero;

  const attentionItems = executiveDashboard?.sections.attention ?? [];
  const rememberedEvidence = executiveDashboard?.rememberedEvidence ?? [];
  const keyInsights = executiveDashboard?.keyInsights ?? [];
  const organizationalState =
    executiveDashboard?.currentOrganizationalState ?? [];

  const created = delta?.observationChanges?.created?.length ?? 0;
  const reinforced = delta?.observationChanges?.reinforced?.length ?? 0;

  const confidence = formatMetricValue(hero?.organizationConfidence ?? 0);

  const understanding = getMetricValue(
    executiveDashboard,
    "understanding",
    confidence,
  );

  const memory = getMetricValue(
    executiveDashboard,
    "memory",
    rememberedEvidence.length,
  );

  const learning = getMetricValue(
    executiveDashboard,
    "learning",
    created + reinforced || attentionItems.length + rememberedEvidence.length,
  );

  const totalSignals = rememberedEvidence.length;

  const allChanges =
    attentionItems.length > 0
      ? attentionItems
      : organizationalState.map(
          (
            item: ExecutiveDashboard["currentOrganizationalState"][number],
          ) => ({
            title: item.title,
            reason: item.summary,
            confidence: item.confidence,
            priority: item.priority,
          }),
        );

  const visibleChanges = showAllChanges
    ? allChanges.slice(0, 12)
    : allChanges.slice(0, 5);

  function toggleRow(rowId: string) {
    setExpandedRows((current) => ({
      ...current,
      [rowId]: !current[rowId],
    }));
  }

  return (
    <section className="memory-update-overview">
      <div className="memory-update-header">
        <p className="memory-update-eyebrow">Executive Intelligence</p>
        <h1>{hero?.headline ?? "Current Organizational State"}</h1>
        <p>
          {hero?.summary ??
            "Discovery is translating organizational learning into executive intelligence."}
        </p>
      </div>

      <div className="memory-metric-grid">
        <article className="memory-metric-card memory-metric-new">
          <span className="memory-metric-icon">✦</span>
          <strong>{confidence}</strong>
          <p>Confidence</p>
          <em>{hero?.status ?? "Active"}</em>
        </article>

        <article className="memory-metric-card memory-metric-reinforced">
          <span className="memory-metric-icon">↗</span>
          <strong>{understanding}</strong>
          <p>Understanding</p>
          <em>Current score</em>
        </article>

        <article className="memory-metric-card memory-metric-stable">
          <span className="memory-metric-icon">◎</span>
          <strong>{memory}</strong>
          <p>Memory</p>
          <em>Organizational continuity</em>
        </article>

        <article className="memory-metric-card memory-metric-total">
          <span className="memory-metric-icon">+</span>
          <strong>{learning}</strong>
          <p>Learning</p>
          <em>{totalSignals} remembered signals</em>
        </article>
      </div>

      <div className="memory-update-meta">
        <span>
          {organizationRuntime?.metadata?.investigationCount ?? 1} investigations
        </span>
        <span>{keyInsights.length} insights</span>
        <span>{organizationalState.length} state changes</span>
        <span>{rememberedEvidence.length} remembered signals</span>
      </div>

      <section className="top-memory-changes">
        <div className="top-memory-changes-header">
          <div>
            <h2>Leadership attention</h2>
            <p>The most important signals for leadership to understand now.</p>
          </div>

          {allChanges.length > 5 && (
            <button
              type="button"
              onClick={() => setShowAllChanges((current) => !current)}
            >
              {showAllChanges ? "Show fewer" : "View all signals →"}
            </button>
          )}
        </div>

        <div className="top-memory-change-list">
          {visibleChanges.length === 0 ? (
            <article className="top-memory-change-row">
              <span className="top-memory-change-icon">+</span>

              <div>
                <h3>No urgent leadership attention items were detected.</h3>
                <p>
                  Continue adding evidence to strengthen Discovery’s executive
                  understanding.
                </p>
              </div>

              <div className="top-memory-change-actions">
                <span>Stable</span>
                <b>⌄</b>
              </div>
            </article>
          ) : (
            visibleChanges.map((item: any, index: number) => {
              const rowId = item.id ?? `${item.title}-${index}`;
              const expanded = Boolean(expandedRows[rowId]);

              return (
                <article
                  className={`top-memory-change-row ${
                    expanded ? "is-expanded" : ""
                  }`}
                  key={rowId}
                >
                  <span className="top-memory-change-icon">
                    {getRowIcon(index)}
                  </span>

                  <button
                    type="button"
                    className="top-memory-change-main"
                    onClick={() => toggleRow(rowId)}
                    aria-expanded={expanded}
                  >
                    <h3>
                      {cleanSentence(
                        item.title,
                        "A meaningful signal deserves leadership attention.",
                        78,
                      )}
                    </h3>
                    <p>
                      {cleanSentence(
                        item.reason,
                        "Discovery identified this as important to the current organizational state.",
                      )}
                    </p>

                    {expanded && (
                      <div className="top-memory-change-detail">
                        {item.reason ??
                          "This signal is part of the organization’s evolving executive intelligence."}
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    className="top-memory-change-actions"
                    onClick={() => toggleRow(rowId)}
                    aria-label={expanded ? "Collapse signal" : "Expand signal"}
                  >
                    <span>{getStatusLabel(item.priority)}</span>
                    <b>{expanded ? "⌃" : "⌄"}</b>
                  </button>
                </article>
              );
            })
          )}
        </div>

        {allChanges.length > 5 && (
          <button
            className="more-memory-changes-button"
            type="button"
            onClick={() => setShowAllChanges((current) => !current)}
          >
            {showAllChanges ? "⌃ Show fewer signals" : "⌄ More signals available"}
          </button>
        )}
      </section>
    </section>
  );
}