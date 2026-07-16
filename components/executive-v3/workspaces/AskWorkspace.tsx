"use client";

import styles from "../ExecutiveWorkspace.module.css";

import type {
  ExecutiveCommunication,
} from "../../../engine/v3/communication/executiveCommunication";

type AskWorkspaceProps = {
  communication: ExecutiveCommunication;
};

export default function AskWorkspace({
  communication,
}: AskWorkspaceProps) {
  const suggestedQuestions = [
    `Why does Discovery believe "${communication.headline}"?`,
    `What evidence most strongly supports this conclusion?`,
    `What could change the recommendation to "${communication.recommendation.headline}"?`,
    `What assumptions should leadership challenge first?`,
    `What happens if leadership does not intervene?`,
    `Which investigation would improve confidence most?`,
  ];

  return (
    <main className={styles.workspace}>
      <div className={styles.shell}>
        <section className={styles.main}>
          <header>
            <p className={styles.placeholderEyebrow}>
              Ask Discovery
            </p>

            <h1>
              Explore the current organizational understanding.
            </h1>

            <p>
              Ask questions about Discovery&apos;s reasoning, evidence, forecast, recommendation, assumptions, and uncertainty.
            </p>
          </header>

          <section>
            <h2>Current context</h2>

            <h3>{communication.headline}</h3>

            <p>
              {communication.executiveSummary}
            </p>
          </section>

          <section>
            <h2>Ask a question</h2>

            <form>
              <label htmlFor="discovery-question">
                Question
              </label>

              <textarea
                id="discovery-question"
                name="question"
                rows={6}
                placeholder="Ask Discovery about the current organizational situation..."
              />

              <button type="submit">
                Ask Discovery
              </button>
            </form>
          </section>

          <section>
            <h2>Suggested questions</h2>

            <ul>
              {suggestedQuestions.map(
                (question) => (
                  <li key={question}>
                    <button type="button">
                      {question}
                    </button>
                  </li>
                ),
              )}
            </ul>
          </section>

          <section>
            <h2>What Discovery can explain</h2>

            <ul>
              <li>
                Why the current executive conclusion was formed.
              </li>

              <li>
                Which signals, conditions, beliefs, mechanisms, and theories support it.
              </li>

              <li>
                What Discovery expects to happen next.
              </li>

              <li>
                Why a particular executive action is recommended.
              </li>

              <li>
                Which assumptions or uncertainties could change the conclusion.
              </li>

              <li>
                Which scenario should be simulated next.
              </li>
            </ul>
          </section>
        </section>

        <aside className={styles.rail}>
          <section>
            <h2>Current recommendation</h2>

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
          </section>

          <section>
            <h2>Current forecast</h2>

            <h3>
              {communication.forecast.headline}
            </h3>

            <p>
              {
                communication.forecast
                  .explanation
              }
            </p>
          </section>

          {communication.uncertainty ? (
            <section>
              <h2>Priority uncertainty</h2>

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
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}