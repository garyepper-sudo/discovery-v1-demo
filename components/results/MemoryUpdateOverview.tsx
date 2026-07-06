"use client";

import { useMemo, useState } from "react";

type MemoryUpdateOverviewProps = {
  organizationRuntime?: any;
  beliefs?: any[];
  themes?: any[];
  evidence?: any[];
  delta?: any;
};

function countByStatus(observations: any[], status: string) {
  return observations.filter((obs) => obs?.status === status).length;
}

function cleanSentence(value: unknown, fallback: string, maxLength = 92) {
  const raw = String(value || fallback)
    .replace(/^Discovery treats this as a strong belief:\s*/i, "")
    .replace(/^Discovery sees\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();

  const firstSentence = raw.split(/(?<=[.!?])\s+/)[0];

  return firstSentence.length > maxLength
    ? `${firstSentence.slice(0, maxLength - 3)}...`
    : firstSentence;
}

function getChangeTitle(item: any) {
  const raw =
    item?.headline ??
    item?.statement ??
    item?.label ??
    item?.summary ??
    item?.text ??
    "A meaningful signal changed in memory.";

  return cleanSentence(raw, "A meaningful signal changed in memory.", 78);
}

function getChangeSummary(item: any) {
  const raw =
    item?.executiveSummary ??
    item?.shortSummary ??
    item?.description ??
    item?.executiveMeaning ??
    item?.summary ??
    item?.explanation ??
    "Discovery updated how this signal contributes to organizational understanding.";

  return cleanSentence(
    raw,
    "Discovery updated how this signal contributes to organizational understanding.",
    104
  );
}

function getExpandedDetail(item: any) {
  const raw =
    item?.explanation ??
    item?.description ??
    item?.executiveMeaning ??
    item?.summary ??
    item?.text ??
    "This signal is part of the organization’s evolving memory.";

  return String(raw)
    .replace(/^Discovery treats this as a strong belief:\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getStatusLabel(status: string) {
  if (status === "Insight") return "New";
  if (status === "Pattern") return "Stable";
  return status;
}

function getChangeIcon(index: number) {
  if (index === 0) return "◷";
  if (index === 1) return "♙";
  if (index === 2) return "□";
  if (index === 3) return "♙";
  return "↗";
}

export default function MemoryUpdateOverview({
  organizationRuntime,
  beliefs = [],
  themes = [],
  evidence = [],
  delta,
}: MemoryUpdateOverviewProps) {
  const [showAllChanges, setShowAllChanges] = useState(false);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const observations = organizationRuntime?.memory?.observations ?? [];

  const created = delta?.observationChanges?.created ?? [];
  const reinforced = delta?.observationChanges?.reinforced ?? [];

  const newCount =
    created.length || countByStatus(observations, "new") || beliefs.length;

  const reinforcedCount =
    reinforced.length || countByStatus(observations, "reinforced");

  const stableCount = countByStatus(observations, "stable");

  const totalSignals = observations.length || evidence.length;

  const investigationCount =
    organizationRuntime?.metadata?.investigationCount ?? 1;

  const allChanges = useMemo(
    () => [
      ...reinforced.map((item: any) => ({
        ...item,
        statusLabel: "Reinforced",
      })),
      ...created.map((item: any) => ({ ...item, statusLabel: "New" })),
      ...beliefs.map((item: any) => ({ ...item, statusLabel: "Insight" })),
      ...themes.map((item: any) => ({ ...item, statusLabel: "Pattern" })),
    ],
    [reinforced, created, beliefs, themes]
  );

  const visibleChanges = showAllChanges ? allChanges.slice(0, 12) : allChanges.slice(0, 5);

  function toggleRow(rowId: string) {
    setExpandedRows((current) => ({
      ...current,
      [rowId]: !current[rowId],
    }));
  }

  return (
    <section className="memory-update-overview">
      <div className="memory-update-header">
        <p className="memory-update-eyebrow">Memory Update</p>
        <h1>What changed</h1>
        <p>
          Discovery updated the organization’s memory based on this
          investigation.
        </p>
      </div>

      <div className="memory-metric-grid">
        <article className="memory-metric-card memory-metric-new">
          <span className="memory-metric-icon">+</span>
          <strong>{newCount}</strong>
          <p>New Insights</p>
          <em>Added to memory</em>
        </article>

        <article className="memory-metric-card memory-metric-reinforced">
          <span className="memory-metric-icon">↗</span>
          <strong>{reinforcedCount}</strong>
          <p>Stronger Insights</p>
          <em>Reinforced</em>
        </article>

        <article className="memory-metric-card memory-metric-stable">
          <span className="memory-metric-icon">=</span>
          <strong>{stableCount}</strong>
          <p>Unchanged</p>
          <em>Consistent so far</em>
        </article>

        <article className="memory-metric-card memory-metric-total">
          <span className="memory-metric-icon">✦</span>
          <strong>{totalSignals}</strong>
          <p>Total Signals</p>
          <em>Remembered</em>
        </article>
      </div>

      <div className="memory-update-meta">
        <span>{investigationCount} investigations</span>
        <span>{beliefs.length} beliefs</span>
        <span>{themes.length} patterns</span>
        <span>{totalSignals} remembered signals</span>
      </div>

      <section className="top-memory-changes">
        <div className="top-memory-changes-header">
          <div>
            <h2>Top changes in memory</h2>
            <p>Key insights that are new or newly reinforced.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAllChanges((current) => !current)}
          >
            {showAllChanges ? "Show fewer" : "View all changes →"}
          </button>
        </div>

        <div className="top-memory-change-list">
          {visibleChanges.length === 0 ? (
            <article className="top-memory-change-row">
              <span className="top-memory-change-icon">+</span>

              <div>
                <h3>Discovery formed an initial memory.</h3>
                <p>
                  Add more evidence to see which patterns become stronger or
                  weaker over time.
                </p>
              </div>

              <div className="top-memory-change-actions">
                <span>New</span>
                <b>⌄</b>
              </div>
            </article>
          ) : (
            visibleChanges.map((item: any, index: number) => {
              const rowId = item.id ?? `${item.statusLabel}-${index}`;
              const expanded = Boolean(expandedRows[rowId]);

              return (
                <article
                  className={`top-memory-change-row ${
                    expanded ? "is-expanded" : ""
                  }`}
                  key={rowId}
                >
                  <span className="top-memory-change-icon">
                    {getChangeIcon(index)}
                  </span>

                  <button
                    type="button"
                    className="top-memory-change-main"
                    onClick={() => toggleRow(rowId)}
                    aria-expanded={expanded}
                  >
                    <h3>{getChangeTitle(item)}</h3>
                    <p>{getChangeSummary(item)}</p>

                    {expanded && (
                      <div className="top-memory-change-detail">
                        {getExpandedDetail(item)}
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    className="top-memory-change-actions"
                    onClick={() => toggleRow(rowId)}
                    aria-label={expanded ? "Collapse change" : "Expand change"}
                  >
                    <span>{getStatusLabel(item.statusLabel)}</span>
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
            {showAllChanges ? "⌃ Show fewer changes" : "⌄ More changes available"}
          </button>
        )}
      </section>
    </section>
  );
}