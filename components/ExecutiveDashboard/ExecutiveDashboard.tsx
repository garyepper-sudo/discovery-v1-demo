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

  return String(metric.current);
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

  const nextAction =
    dashboard.nextAction?.title ??
    "Investigate the highest-priority unresolved organizational change.";

  return (
    <section className="executive-results">
      <div className="results-left">
        <p className="overview-label">Executive Intelligence</p>

        <h1>Current Organizational State</h1>

        <div className="briefing-meta">
          <span>Status: {hero.status}</span>
          <span>Confidence: {confidence}%</span>
          <span>Updated: {formatDate(hero.generatedAt)}</span>
        </div>

        <div className="insight-card-list">
          <article className="insight-card">
            <div className="insight-number">01</div>

            <div>
              <p className="insight-eyebrow">Executive Summary</p>
              <h2>{hero.headline}</h2>
              <p>{hero.summary}</p>
            </div>
          </article>

          <article className="insight-card">
            <div className="insight-number">02</div>

            <div>
              <p className="insight-eyebrow">Leadership Attention</p>
              <h2>What deserves attention now</h2>

              {attention.length > 0 ? (
                <div className="top-memory-change-list">
                  {attention.slice(0, 3).map((item, index) => (
                    <div
                      className="top-memory-change-row"
                      key={`${item.title}-${index}`}
                    >
                      <div className="top-memory-change-icon">!</div>

                      <div>
                        <h3>{item.title}</h3>
                        <p>{item.reason}</p>
                      </div>

                      <span>
                        {item.priority === "highest" ? "Priority" : "Review"}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No urgent leadership attention items were detected.</p>
              )}
            </div>
          </article>

          <article className="insight-card">
            <div className="insight-number">03</div>

            <div>
              <p className="insight-eyebrow">Recommended Next Investigation</p>
              <h2>{nextAction}</h2>

              {dashboard.nextAction?.reason && (
                <p>{dashboard.nextAction.reason}</p>
              )}

              <div className="overview-actions">
                <button type="button">Start Investigation →</button>
              </div>
            </div>
          </article>

          <article className="insight-card">
            <div className="insight-number">04</div>

            <div>
              <p className="insight-eyebrow">Recent Learning</p>
              <h2>What changed recently</h2>

              {timeline.length > 0 ? (
                <div className="timeline-list">
                  {timeline.slice(0, 4).map((item, index) => (
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
                <p>
                  The learning timeline will appear after additional
                  investigations.
                </p>
              )}
            </div>
          </article>
        </div>

        <details className="expanded-results">
          <summary className="reasoning-toggle">
            Explore Organizational Understanding
          </summary>

          <div className="reasoning-drawer">
            <div className="reasoning-block">
              <h3>Workspace</h3>
              <p className="empty-reasoning">
                Deeper executive context is available through the dashboard,
                reasoning trace, and organism explorer.
              </p>
            </div>
          </div>
        </details>
      </div>

      <aside className="organism-panel">
        <div className="organism-header">
          <div>
            <h2>Organizational Health</h2>
            <p>
              <span />
              {hero.status}
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
      </aside>
    </section>
  );
}