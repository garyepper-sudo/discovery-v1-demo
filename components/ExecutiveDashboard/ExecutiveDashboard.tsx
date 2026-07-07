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

function formatGain(value?: "high" | "medium" | "low"): string {
  if (value === "high") return "High";
  if (value === "low") return "Low";
  return "Medium";
}

function formatStatus(value: string): string {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function ExecutiveDashboardView({
  executiveDashboard,
}: ExecutiveDashboardViewProps) {
  const dashboard = executiveDashboard;

  const hero = dashboard.hero;
  const metrics = dashboard.metrics;
  const attention = dashboard.sections.attention;
  const timeline = dashboard.sections.timeline;
  const confidence = hero.organizationConfidence ?? 0;

  const primaryConditions =
    attention.length > 0
      ? attention.slice(0, 3)
      : dashboard.currentOrganizationalState.slice(0, 3);

  const nextAction = dashboard.nextAction;

  const nextActionTitle =
    nextAction?.title ?? "Identify the next highest-value investigation";

  const nextActionReason =
    nextAction?.reason ??
    "Discovery needs one focused conversation to improve organizational understanding.";

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

        <section className="executive-decision-card">
          <div>
            <p className="insight-eyebrow">Highest Value Next Investigation</p>
            <h2>{nextActionTitle}</h2>
            <p>{nextActionReason}</p>
          </div>

          <div className="decision-card-side">
            <span>Expected Understanding Gain</span>
            <strong>{formatGain(nextAction?.expectedUnderstandingGain)}</strong>
            <button type="button">Begin Investigation →</button>
          </div>
        </section>

        <section className="executive-section">
          <div className="executive-section-heading">
            <p className="insight-eyebrow">Conditions Requiring Attention</p>
            <h2>What deserves attention</h2>
          </div>

          {primaryConditions.length > 0 ? (
            <div className="condition-grid">
              {primaryConditions.map((item, index) => (
                <article className="condition-card" key={`${item.title}-${index}`}>
                  <div className="condition-card-top">
                    <span>{index + 1}</span>
                    <strong>
                      {"priority" in item
                        ? formatStatus(String(item.priority))
                        : "Review"}
                    </strong>
                  </div>

                  <h3>{item.title}</h3>
                  <p>{"reason" in item ? item.reason : item.summary}</p>

                  {"confidence" in item && item.confidence !== undefined && (
                    <small>{Math.round(item.confidence * 100)}% confidence</small>
                  )}
                </article>
              ))}
            </div>
          ) : (
            <article className="condition-card">
              <h3>No urgent conditions detected</h3>
              <p>
                Discovery did not identify a current condition requiring immediate
                executive attention.
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
          <summary className="reasoning-toggle">
            Why Discovery believes this
          </summary>

          <div className="reasoning-drawer">
            <div className="reasoning-block">
              <h3>Current Understanding</h3>

              {dashboard.keyInsights.length > 0 ? (
                dashboard.keyInsights.map((item, index) => (
                  <div className="top-memory-change-row" key={`${item.title}-${index}`}>
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
                  <div className="top-memory-change-row" key={`${item.title}-${index}`}>
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
          <span>Executive Question</span>
          <p>What conversation would most improve organizational understanding?</p>
        </div>
      </aside>
    </section>
  );
}