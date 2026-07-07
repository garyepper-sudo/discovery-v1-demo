type DashboardMetric = {
  title?: string;
  label?: string;
  current?: number;
  value?: number | string;
  delta?: number;
};

type DashboardAttentionItem = {
  title?: string;
  reason?: string;
};

type DashboardTimelineItem = {
  timestamp?: string;
  summary?: string;
};

type DashboardRecommendedAction = {
  title?: string;
  summary?: string;
  prompt?: string;
};

type ExecutiveDashboard = {
  hero?: {
    headline?: string;
    summary?: string;
    generatedAt?: string;
    status?: string;
    organizationConfidence?: number;
  };
  metrics?: DashboardMetric[];
  keyInsights?: {
    title?: string;
    summary?: string;
    importance?: string;
    confidence?: number;
  }[];
  sections?: {
    attention?: DashboardAttentionItem[];
    timeline?: DashboardTimelineItem[];
  };
  nextAction?: DashboardRecommendedAction;
};

type ExecutiveDashboardViewProps = {
  dashboard: ExecutiveDashboard;
};

function formatDate(value?: string): string {
  if (!value) return "Just now";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString();
}

function getMetricValue(metrics: DashboardMetric[], name: string): string {
  const metric = metrics.find((item) =>
    (item.label ?? item.title ?? "").toLowerCase().includes(name.toLowerCase()),
  );

  const value = metric?.value ?? metric?.current;

  if (value === undefined) return "—";

  return String(value);
}

export function ExecutiveDashboardView({
  dashboard,
}: ExecutiveDashboardViewProps) {
  const metrics = dashboard.metrics ?? [];
  const attention = dashboard.sections?.attention ?? [];
  const timeline = dashboard.sections?.timeline ?? [];
  const confidence = dashboard.hero?.organizationConfidence ?? 0;

  const nextAction =
    dashboard.nextAction?.title ??
    dashboard.nextAction?.summary ??
    dashboard.nextAction?.prompt ??
    "Investigate the highest-priority unresolved organizational change.";

  return (
    <section className="executive-results">
      <div className="results-left">
        <p className="overview-label">Executive Intelligence</p>

        <h1>Current Organizational State</h1>

        <div className="briefing-meta">
          <span>Status: {dashboard.hero?.status ?? "Active"}</span>
          <span>Confidence: {confidence}%</span>
          <span>Updated: {formatDate(dashboard.hero?.generatedAt)}</span>
        </div>

        <div className="insight-card-list">
          <article className="insight-card">
            <div className="insight-number">01</div>

            <div>
              <p className="insight-eyebrow">Executive Summary</p>
              <h2>
                {dashboard.hero?.headline ??
                  "Discovery is building organizational understanding."}
              </h2>
              <p>
                {dashboard.hero?.summary ??
                  "Discovery is translating organizational learning into executive intelligence."}
              </p>
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
                      key={`${item.title ?? "attention"}-${index}`}
                    >
                      <div className="top-memory-change-icon">!</div>

                      <div>
                        <h3>{item.title ?? "Leadership signal"}</h3>
                        <p>
                          {item.reason ??
                            "Discovery identified this as important."}
                        </p>
                      </div>

                      <span>Review</span>
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
                      key={`${item.timestamp ?? "timeline"}-${index}`}
                    >
                      <i />
                      <div>
                        <span>{formatDate(item.timestamp)}</span>
                        <p>
                          {item.summary ??
                            "Discovery updated organizational understanding."}
                        </p>
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
                Detailed theories, beliefs, mechanisms, evidence, and reasoning
                remain available below through progressive disclosure.
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
              {dashboard.hero?.status ?? "Improving"}
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