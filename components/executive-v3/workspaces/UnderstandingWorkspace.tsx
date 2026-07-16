"use client";

import styles from "../ExecutiveWorkspace.module.css";

import type {
  ExecutiveCommunication,
} from "../../../engine/v3/communication/executiveCommunication";

type UnderstandingWorkspaceProps = {
  communication: ExecutiveCommunication;
};

function toPercentage(value: number): number {
  const percentage =
    value <= 1
      ? value * 100
      : value;

  return Math.round(
    Math.max(
      0,
      Math.min(100, percentage),
    ),
  );
}

export default function UnderstandingWorkspace({
  communication,
}: UnderstandingWorkspaceProps) {
  const confidence = toPercentage(
    communication.confidence.value,
  );

  const forecastConfidence =
    toPercentage(
      communication.forecast.confidence,
    );

  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section className={styles.main}>
          <header className={styles.workspaceHeader}>
            <p className={styles.eyebrow}>
              Current Understanding
            </p>

            <h1>{communication.headline}</h1>

            <p className={styles.workspaceLead}>
              {communication.executiveSummary}
            </p>
          </header>

          <section className={styles.card}>
            <h2>Understanding confidence</h2>

            <div className={styles.confidenceRow}>
              <p className={styles.confidenceValue}>
                {confidence}%
              </p>

              <span className={styles.confidenceLabel}>
                {communication.confidence.label}
              </span>
            </div>

            {communication.confidence.limiters.length > 0 ? (
              <ul className={styles.list}>
                {communication.confidence.limiters.map(
                  (limiter) => (
                    <li
                      key={limiter}
                      className={styles.listItem}
                    >
                      {limiter}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p>
                Discovery has not identified a material confidence limiter.
              </p>
            )}
          </section>

          <section>
            <p className={styles.eyebrow}>
              Supporting Signals
            </p>

            <div className={styles.signalGrid}>
              {communication.supportingSignals.map(
                (signal) => (
                  <article
                    key={signal.id}
                    className={styles.signalCard}
                  >
                    <h3>{signal.statement}</h3>

                    {signal.implication ? (
                      <p>{signal.implication}</p>
                    ) : null}
                  </article>
                ),
              )}
            </div>
          </section>

          <section className={styles.featureCard}>
            <h2>What Discovery expects next</h2>

            <h3>
              {communication.forecast.headline}
            </h3>

            <p>
              {communication.forecast.explanation}
            </p>

            <div className={styles.metaRow}>
              <span className={styles.metaPill}>
                Confidence {forecastConfidence}%
              </span>

              <span className={styles.metaPill}>
                {communication.forecast.timeHorizon}
              </span>

              <span className={styles.metaPill}>
                {
                  communication.forecast
                    .affectedConditionIds.length
                }{" "}
                condition
                {
                  communication.forecast
                    .affectedConditionIds.length === 1
                    ? ""
                    : "s"
                }{" "}
                affected
              </span>
            </div>
          </section>

          {communication.uncertainty ? (
            <section className={styles.card}>
              <h2>What remains uncertain</h2>

              <h3>
                {communication.uncertainty.question}
              </h3>

              <p>
                {communication.uncertainty.implication}
              </p>

              {communication.uncertainty
                .recommendedInvestigation ? (
                <ul className={styles.list}>
                  <li className={styles.listItem}>
                    {
                      communication.uncertainty
                        .recommendedInvestigation
                    }
                  </li>
                </ul>
              ) : null}

              {communication.uncertainty
                .expectedConfidenceGain !== undefined ? (
                <div className={styles.metaRow}>
                  <span className={styles.metaPill}>
                    Potential confidence gain{" "}
                    {toPercentage(
                      communication.uncertainty
                        .expectedConfidenceGain,
                    )}
                    %
                  </span>
                </div>
              ) : null}
            </section>
          ) : null}
        </section>

        <aside className={styles.rail}>
          <section className={styles.card}>
            <h2>Meaningful changes</h2>

            {communication.meaningfulChanges.length > 0 ? (
              <div className={styles.changeList}>
                {communication.meaningfulChanges.map(
                  (change) => (
                    <article
                      key={change.entityId}
                      className={styles.changeCard}
                    >
                      <h3>{change.label}</h3>

                      <p>{change.statement}</p>

                      <span className={styles.direction}>
                        {change.direction}
                      </span>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p>
                No meaningful organizational changes are currently recorded.
              </p>
            )}
          </section>
        </aside>

        <div className={styles.fullWidth}>
          <section className={styles.card}>
            <h2>Evidence and reasoning</h2>

            {communication.evidenceSections.length > 0 ? (
              <div className={styles.evidenceGrid}>
                {communication.evidenceSections.map(
                  (section) => (
                    <article
                      key={section.id}
                      className={styles.evidenceCard}
                    >
                      <h3>{section.title}</h3>

                      <p
                        className={
                          styles.evidenceSummary
                        }
                      >
                        {section.summary}
                      </p>

                      <p
                        className={
                          styles.evidenceContent
                        }
                      >
                        {section.content}
                      </p>

                      {section.metrics &&
                      section.metrics.length > 0 ? (
                        <div className={styles.metaRow}>
                          {section.metrics.map(
                            (metric) => (
                              <span
                                key={`${section.id}-${metric.label}`}
                                className={
                                  styles.metaPill
                                }
                              >
                                {metric.label}:{" "}
                                {metric.value}
                              </span>
                            ),
                          )}
                        </div>
                      ) : null}
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p>
                No evidence sections are currently available.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}