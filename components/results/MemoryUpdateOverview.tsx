"use client";

import { useMemo, useState } from "react";

type ExecutiveMetric = {
  title?: string;
  label?: string;
  current?: number;
  value?: number | string;
  delta?: number;
};

type ExecutiveAttentionItem = {
  id?: string;
  title?: string;
  reason?: string;
  confidence?: number;
};

type ExecutiveDashboard = {
  headline?: string;
  summary?: string;
  status?: string;
  generatedAt?: string;
  confidence?: {
    current?: number;
    delta?: number;
  };
  metrics?: ExecutiveMetric[];
  leadershipAttention?: ExecutiveAttentionItem[];
  recommendedAttention?: ExecutiveAttentionItem[];
  recommendedAction?: string;
  nextRecommendedAction?: string;
};

type MemoryUpdateOverviewProps = {
  executiveDashboard?: ExecutiveDashboard;
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

function getMetricValue(
  metrics: ExecutiveMetric[],
  name: string,
  fallback: number | string,
): number | string {
  const metric = metrics.find((item) =>
    (item.label ?? item.title ?? "").toLowerCase().includes(name.toLowerCase()),
  );

  return metric?.value ?? metric?.current ?? fallback;
}

function getChangeTitle(item: any) {
  const raw =
    item?.title ??
    item?.headline ??
    item?.statement ??
    item?.label ??
    item?.summary ??
    item?.text ??
    "A meaningful signal deserves leadership attention.";

  return cleanSentence(raw, "A meaningful signal deserves leadership attention.", 78);
}

function getChangeSummary(item: any) {
  const raw =
    item?.reason ??
    item?.executiveSummary ??
    item?.shortSummary ??
    item?.description ??
    item?.executiveMeaning ??
    item?.summary ??
    item?.explanation ??
    "Discovery identified this as important to the current organizational state.";

  return cleanSentence(
    raw,
    "Discovery identified this as important to the current organizational state.",
    104,
  );
}

function getExpandedDetail(item: any) {
  const raw =
    item?.reason ??
    item?.explanation ??
    item?.description ??
    item?.executiveMeaning ??
    item?.summary ??
    item?.text ??
    "This signal is part of the organization’s evolving executive intelligence.";

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
  executiveDashboard,
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

  const metrics = executiveDashboard?.metrics ?? [];

  const confidence = executiveDashboard?.confidence?.current ?? 0;

  const understanding = getMetricValue(
    metrics,
    "understanding",
    organizationRuntime?.memory?.understandingState
      ?.organizationalUnderstandingScore ?? 0,
  );

  const memory = getMetricValue(
    metrics,
    "memory",
    organizationRuntime?.memory?.understandingState?.memoryMaturityScore ??
      observations.length,
  );

  const learning = getMetricValue(
    metrics,
    "learning",
    created.length + reinforced.length || observations.length,
  );

  const totalSignals = observations.length || evidence.length;

  const attentionItems =
    executiveDashboard?.leadershipAttention ??
    executiveDashboard?.recommendedAttention ??
    [];

  const fallbackChanges = useMemo(
    () => [
      ...reinforced.map((item: any) => ({
        ...item,
        statusLabel: "Reinforced",
      })),
      ...created.map((item: any) => ({ ...item, statusLabel: "New" })),
      ...beliefs.map((item: any) => ({ ...item, statusLabel: "Insight" })),
      ...themes.map((item: any) => ({ ...item, statusLabel: "Pattern" })),
    ],
    [reinforced, created, beliefs, themes],
  );

  const allChanges =
    attentionItems.length > 0
      ? attentionItems.map((item) => ({
          ...item,
          statusLabel: "Review",
        }))
      : fallbackChanges;

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
        <h1>Current Organizational State</h1>
        <p>
          {executiveDashboard?.summary ??
            "Discovery is translating organizational learning into executive intelligence."}
        </p>
      </div>

      <div className="memory-metric-grid">
        <article className="memory-metric-card memory-metric-new">
          <span className="memory-metric-icon">✦</span>
          <strong>{confidence}</strong>
          <p>Confidence</p>
          <em>{executiveDashboard?.status ?? "Active"}</em>
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
          <em>{totalSignals} signals tracked</em>
        </article>
      </div>

      <div className="memory-update-meta">
        <span>{organizationRuntime?.metadata?.investigationCount ?? 1} investigations</span>
        <span>{beliefs.length} beliefs</span>
        <span>{themes.length} patterns</span>
        <span>{totalSignals} remembered signals</span>
      </div>

      <section className="top-memory-changes">
        <div className="top-memory-changes-header">
          <div>
            <h2>Leadership attention</h2>
            <p>The most important signals for leadership to understand now.</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAllChanges((current) => !current)}
          >
            {showAllChanges ? "Show fewer" : "View all signals →"}
          </button>
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
                    aria-label={expanded ? "Collapse signal" : "Expand signal"}
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
            {showAllChanges ? "⌃ Show fewer signals" : "⌄ More signals available"}
          </button>
        )}
      </section>
    </section>
  );
}