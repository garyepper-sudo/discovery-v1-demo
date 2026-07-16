"use client";

import styles from "../ExecutiveWorkspace.module.css";

import type {
  ExecutiveCommunication,
} from "../../../engine/v3/communication/executiveCommunication";

type TimelineWorkspaceProps = {
  communication: ExecutiveCommunication;
};

function formatGeneratedAt(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString();
}

export default function TimelineWorkspace({
  communication,
}: TimelineWorkspaceProps) {
  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section className={styles.main}>
          <header>
            <p className={styles.placeholderEyebrow}>
              Organizational Timeline
            </p>

            <h1>
              Track how understanding, decisions, and organizational conditions evolve over time.
            </h1>

            <p>
              Discovery will use this workspace to preserve decision history, compare outcomes, and improve future executive judgment.
            </p>
          </header>

          <section>
            <h2>Latest executive understanding</h2>

            <article>
              <p>
                {formatGeneratedAt(
                  communication.generatedAt,
                )}
              </p>

              <h3>{communication.headline}</h3>

              <p>
                {communication.executiveSummary}
              </p>
            </article>
          </section>

          <section>
            <h2>Meaningful organizational changes</h2>

            {communication.meaningfulChanges.length > 0 ? (
              communication.meaningfulChanges.map(
                (change) => (
                  <article key={change.entityId}>
                    <h3>{change.label}</h3>

                    <p>{change.statement}</p>

                    <p>
                      Direction: {change.direction}
                    </p>
                  </article>
                ),
              )
            ) : (
              <p>
                No meaningful changes are currently recorded.
              </p>
            )}
          </section>

          <section>
            <h2>Current recommendation</h2>

            <article>
              <h3>
                {
                  communication.recommendation
                    .headline
                }
              </h3>

              <p>
                {
                  communication.recommendation
                    .rationale
                }
              </p>
            </article>
          </section>

          <section>
            <h2>Expected future state</h2>

            <article>
              <h3>
                {communication.forecast.headline}
              </h3>

              <p>
                {
                  communication.forecast
                    .explanation
                }
              </p>

              <p>
                Time horizon:{" "}
                {
                  communication.forecast
                    .timeHorizon
                }
              </p>
            </article>
          </section>

          <section>
            <h2>Future decision history</h2>

            <p>
              Completed executive decisions, selected scenarios, implementation milestones, reviews, and measured outcomes will appear here once the canonical decision record is connected.
            </p>
          </section>
        </section>

        <aside className={styles.rail}>
          <section>
            <h2>Current communication</h2>

            <p>
              Communication ID:
            </p>

            <p>{communication.id}</p>

            <p>
              Generated:
            </p>

            <p>
              {formatGeneratedAt(
                communication.generatedAt,
              )}
            </p>
          </section>

          <section>
            <h2>Learning questions</h2>

            {communication.uncertainty ? (
              <>
                <h3>
                  {
                    communication.uncertainty
                      .question
                  }
                </h3>

                <p>
                  {
                    communication.uncertainty
                      .implication
                  }
                </p>
              </>
            ) : (
              <p>
                No priority uncertainty is currently recorded.
              </p>
            )}
          </section>

          <section>
            <h2>What this workspace will learn</h2>

            <ul>
              <li>
                Which recommendations executives accepted or rejected.
              </li>

              <li>
                Which simulated outcomes matched reality.
              </li>

              <li>
                Which assumptions proved correct.
              </li>

              <li>
                How decision confidence changed over time.
              </li>

              <li>
                Which interventions improved organizational conditions.
              </li>
            </ul>
          </section>
        </aside>
      </div>
    </main>
  );
}