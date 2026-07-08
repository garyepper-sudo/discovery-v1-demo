import type { ExecutiveDashboard } from "../../engine/v3/executive/buildExecutiveDashboard";

type ExecutiveDashboardViewProps = {
  executiveDashboard: ExecutiveDashboard;
};

function formatDate(value?: string): string {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function getMetricValue(
  metrics: ExecutiveDashboard["metrics"],
  name: string,
): string {
  const metric = metrics.find((item) =>
    item.label.toLowerCase().includes(name.toLowerCase()),
  );

  if (metric?.current === undefined) return "—";

  return `${metric.current}${metric.unit === "%" ? "%" : ""}`;
}

function formatStatus(value?: string): string {
  if (!value) return "Unknown";

  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizePercent(value?: number): number | undefined {
  if (value === undefined) return undefined;
  return value <= 1 ? Math.round(value * 100) : Math.round(value);
}

function formatConfidence(value?: number): string {
  const percent = normalizePercent(value);
  if (percent === undefined) return "";
  return `${percent}% confidence`;
}

function formatConfidenceDelta(value?: number): string {
  if (value === undefined) return "No prior comparison";
  if (value > 0) return `Confidence increased +${value} pts`;
  if (value < 0) return `Confidence decreased ${value} pts`;
  return "Confidence stayed stable";
}

function evidenceCount(value?: unknown[]): number {
  return Array.isArray(value) ? value.length : 0;
}

function momentumSymbol(value?: string): string {
  if (value === "improving") return "↑";
  if (value === "declining") return "↓";
  return "→";
}

export function ExecutiveDashboardView({
  executiveDashboard,
}: ExecutiveDashboardViewProps) {
  const dashboard = executiveDashboard;

  const hero = dashboard.hero;
  const metrics = dashboard.metrics;
  const narratives = dashboard.narratives ?? dashboard.sections.narratives ?? [];
  const timeline = dashboard.sections.timeline;
  const confidence = normalizePercent(hero.organizationConfidence) ?? 0;

  const primaryNarratives = narratives.slice(0, 4);

  return (
    <section className="executive-results sprint-44-briefing">
      <div className="results-left">
        <p className="overview-label">Monday Morning Briefing</p>

        <section className="executive-hero-card">
          <div>
            <p className="insight-eyebrow">Current Organizational State</p>
            <h1>{hero.headline}</h1>
            <p>{hero.summary}</p>
          </div>

          <div className="executive-health-score">
            <span>{confidence}%</span>
            <p>Confidence</p>
          </div>
        </section>

        <section className="executive-quick-read">
          <article>
            <span>Status</span>
            <strong>{formatStatus(hero.status)}</strong>
          </article>

          <article>
            <span>Understanding</span>
            <strong>{getMetricValue(metrics, "understanding")}</strong>
          </article>

          <article>
            <span>Memory</span>
            <strong>{getMetricValue(metrics, "memory")}</strong>
          </article>

          <article>
            <span>Learning</span>
            <strong>{getMetricValue(metrics, "learning")}</strong>
          </article>
        </section>

        <section className="executive-section">
          <div className="executive-section-heading">
            <p className="insight-eyebrow">Executive Narratives</p>
            <h2>What changed since we last talked</h2>
          </div>

          {primaryNarratives.length > 0 ? (
            <div className="condition-grid">
              {primaryNarratives.map((narrative, index) => {
                const continuity = narrative.continuity;

                return (
                  <article
                    className="condition-card executive-narrative-card"
                    key={narrative.id ?? `${narrative.headline}-${index}`}
                  >
                    <div className="condition-card-top">
                      <span>{momentumSymbol(narrative.momentum)}</span>
                      <strong>
                        {continuity
                          ? `${formatStatus(continuity.lifecycle)} · ${formatStatus(
                              continuity.status,
                            )}`
                          : narrative.priority
                            ? formatStatus(narrative.priority)
                            : "Review"}
                      </strong>
                    </div>

                    <h3>{narrative.headline}</h3>

                    {continuity && (
                      <div className="narrative-continuity-strip">
                        <span>Momentum: {formatStatus(narrative.momentum)}</span>
                        <span>
                          {formatConfidenceDelta(continuity.confidenceDelta)}
                        </span>
                      </div>
                    )}

                    {continuity?.whatChanged?.length ? (
                      <details open={index === 0}>
                        <summary>Since last investigation</summary>
                        <ul>
                          {continuity.whatChanged.map((item, changeIndex) => (
                            <li key={`${narrative.id}-changed-${changeIndex}`}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}

                    {continuity?.whyChanged?.length ? (
                      <details>
                        <summary>Why it changed</summary>
                        <ul>
                          {continuity.whyChanged.map((item, whyIndex) => (
                            <li key={`${narrative.id}-why-${whyIndex}`}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </details>
                    ) : null}

                    <details open={!continuity && index === 0}>
                      <summary>What we’re observing</summary>
                      <p>{narrative.observation}</p>
                    </details>

                    <details>
                      <summary>Business impact</summary>
                      <p>{narrative.businessImpact}</p>
                    </details>

                    <details>
                      <summary>Leadership discussion</summary>
                      <p>{narrative.executiveConversation}</p>
                    </details>

                    {narrative.supportingReasoning && (
                      <details>
                        <summary>Supporting reasoning</summary>
                        <p>{narrative.supportingReasoning}</p>
                      </details>
                    )}

                    {continuity?.history?.length ? (
                      <details>
                        <summary>
                          Narrative history ({continuity.history.length})
                        </summary>
                        <div className="timeline-list executive-learning-list">
                          {continuity.history.map((item, historyIndex) => (
                            <div
                              className="timeline-step is-active"
                              key={`${item.timestamp}-${historyIndex}`}
                            >
                              <i />
                              <div>
                                <span>{formatDate(item.timestamp)}</span>
                                <p>{item.summary}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </details>
                    ) : null}

                    {evidenceCount(narrative.evidence) > 0 && (
                      <details>
                        <summary>
                          Supporting evidence ({evidenceCount(narrative.evidence)})
                        </summary>
                        <p>
                          Evidence is available in the expanded reasoning drawer
                          below.
                        </p>
                      </details>
                    )}

                    {narrative.confidence !== undefined && (
                      <small>{formatConfidence(narrative.confidence)}</small>
                    )}
                  </article>
                );
              })}
            </div>
          ) : (
            <article className="condition-card">
              <h3>No executive narratives available yet</h3>
              <p>
                Discovery will show complete executive narratives once current
                understanding has been assembled.
              </p>
            </article>
          )}
        </section>

        <section className="executive-section">
          <div className="executive-section-heading">
            <p className="insight-eyebrow">Recent Organizational Learning</p>
            <h2>What changed recently</h2>
          </div>

          {timeline.length > 0 ? (
            <div className="timeline-list executive-learning-list">
              {timeline.slice(0, 3).map((item, index) => (
                <div
                  className="timeline-step is-active"
                  key={`${item.timestamp}-${index}`}
                >
                  <i />
                  <div>
                    <span>{formatDate(item.timestamp)}</span>
                    <p>{item.summary}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <article className="condition-card">
              <h3>Learning timeline pending</h3>
              <p>
                Discovery will show organizational learning after more
                investigations are completed.
              </p>
            </article>
          )}
        </section>

        <details className="expanded-results">
          <summary className="reasoning-toggle">Explore the reasoning</summary>

          <div className="reasoning-drawer">
            <div className="reasoning-block">
              <h3>Current Understanding</h3>

              {dashboard.keyInsights.length > 0 ? (
                dashboard.keyInsights.map((item, index) => (
                  <div
                    className="top-memory-change-row"
                    key={`${item.title}-${index}`}
                  >
                    <div className="top-memory-change-icon">✓</div>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-reasoning">
                  Discovery has not exposed deeper supporting understanding yet.
                </p>
              )}
            </div>

            <div className="reasoning-block">
              <h3>Remembered Evidence</h3>

              {dashboard.rememberedEvidence.length > 0 ? (
                dashboard.rememberedEvidence.map((item, index) => (
                  <div
                    className="top-memory-change-row"
                    key={`${item.title}-${index}`}
                  >
                    <div className="top-memory-change-icon">•</div>
                    <div>
                      <h3>{item.title}</h3>
                      <p>{item.summary}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="empty-reasoning">
                  Supporting evidence will appear as organizational memory grows.
                </p>
              )}
            </div>
          </div>
        </details>
      </div>

      <aside className="organism-panel executive-briefing-panel">
        <div className="organism-header">
          <div>
            <h2>Organizational Health</h2>
            <p>
              <span />
              {formatStatus(hero.status)}
            </p>
          </div>
        </div>

        <div className="amoeba">
          <span className="node node-a" />
          <span className="node node-b" />
          <span className="node node-c" />
          <span className="node node-d" />
        </div>

        <div className="organism-timeline">
          <p>
            <span className="gold-dot" />
            Confidence <b>{confidence}%</b>
          </p>

          <p>
            <span className="green-dot" />
            Understanding <b>{getMetricValue(metrics, "understanding")}</b>
          </p>

          <p>
            <span className="blue-dot" />
            Memory <b>{getMetricValue(metrics, "memory")}</b>
          </p>

          <p>
            <span className="gray-dot" />
            Learning <b>{getMetricValue(metrics, "learning")}</b>
          </p>
        </div>

        <div className="executive-question-card">
          <span>Leadership Discussion</span>
          <p>
            What conversation would most improve organizational understanding?
          </p>
        </div>
      </aside>
    </section>
  );
}